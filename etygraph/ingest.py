from __future__ import annotations

import gzip
import json
import logging
from collections import Counter
from pathlib import Path
from typing import Any, Iterable, TextIO

from .models import Edge, IngestStats, Node
from .normalize import display_word, make_node_id, normalize_lang_code, normalize_word, parse_node_id
from .templates import EDGE_CONFIDENCE, edge_from_parts, extract_template_edges

DEFAULT_LANGS = {
    "fr",
    "en",
    "fro",
    "frm",
    "la",
    "VL.",
    "grc",
    "ang",
    "enm",
    "gem-pro",
    "ine-pro",
    "itc-pro",
    "cel-pro",
    "non",
}

logger = logging.getLogger(__name__)


def open_jsonl(path: Path) -> TextIO:
    if path.suffix == ".gz":
        return gzip.open(path, "rt", encoding="utf-8")
    return path.open("r", encoding="utf-8")


def iter_jsonl(path: Path, strict: bool = False, limit: int | None = None) -> Iterable[tuple[int, dict[str, Any] | None]]:
    with open_jsonl(path) as handle:
        for line_number, line in enumerate(handle, start=1):
            if limit is not None and line_number > limit:
                break
            text = line.strip()
            if not text:
                continue
            try:
                yield line_number, json.loads(text)
            except json.JSONDecodeError:
                if strict:
                    raise
                logger.warning("Skipping malformed JSON line %s in %s", line_number, path)
                yield line_number, None


def node_from_entry(entry: dict[str, Any], source: str) -> Node | None:
    word = display_word(entry.get("word"))
    lang_code = normalize_lang_code(entry.get("lang_code"))
    if not word or not lang_code:
        return None
    pos = entry.get("pos")
    etymology_number = entry.get("etymology_number")
    return Node(
        id=make_node_id(lang_code, word, pos, etymology_number),
        lang=entry.get("lang"),
        lang_code=lang_code,
        word=word,
        normalized_word=normalize_word(word),
        pos=str(pos).strip().lower() if pos else None,
        etymology_number=etymology_number,
        glosses=extract_glosses(entry),
        source=source,
    )


def extract_glosses(entry: dict[str, Any], max_glosses: int = 5) -> list[str]:
    glosses: list[str] = []
    if isinstance(entry.get("glosses"), list):
        glosses.extend(str(item) for item in entry["glosses"] if item)
    senses = entry.get("senses")
    if isinstance(senses, list):
        for sense in senses:
            if not isinstance(sense, dict):
                continue
            for key in ("glosses", "raw_glosses"):
                values = sense.get(key)
                if isinstance(values, list):
                    glosses.extend(str(item) for item in values if item)
    seen: set[str] = set()
    out: list[str] = []
    for gloss in glosses:
        text = " ".join(gloss.strip().split())
        key = text.lower()
        if text and key not in seen:
            seen.add(key)
            out.append(text)
        if len(out) >= max_glosses:
            break
    return out


def extract_descendant_edges(entry_node: Node, entry: dict[str, Any]) -> tuple[list[Edge], int, int]:
    edges: list[Edge] = []
    seen = 0
    skipped = 0
    for record in flatten_descendants(entry.get("descendants")):
        seen += 1
        lang_code = normalize_lang_code(record.get("lang_code") or record.get("lang"))
        word = display_word(record.get("word") or record.get("term") or record.get("roman"))
        if not lang_code or not word:
            skipped += 1
            continue
        child_id = make_node_id(lang_code, word, "unknown", 0)
        edges.append(
            edge_from_parts(
                child_id,
                entry_node.id,
                "descended_from",
                None,
                raw=record,
                confidence=EDGE_CONFIDENCE["descended_from"],
            )
        )
    return edges, seen, skipped


def flatten_descendants(value: Any) -> Iterable[dict[str, Any]]:
    if isinstance(value, list):
        for item in value:
            yield from flatten_descendants(item)
    elif isinstance(value, dict):
        if any(key in value for key in ("word", "term", "lang_code", "lang")):
            yield value
        for key in ("descendants", "children", "items"):
            if key in value:
                yield from flatten_descendants(value[key])


def canonicalize_edges(nodes: dict[str, Node], edges: Iterable[Edge]) -> list[Edge]:
    by_lang_word: dict[tuple[str, str], list[str]] = {}
    for node in nodes.values():
        by_lang_word.setdefault((node.lang_code, node.normalized_word), []).append(node.id)
    out: list[Edge] = []
    seen: set[tuple[str, str, str, str | None]] = set()
    for edge in edges:
        from_id = canonicalize_node_id(edge.from_id, by_lang_word)
        to_id = canonicalize_node_id(edge.to_id, by_lang_word)
        key = (from_id, to_id, edge.type, edge.source_template)
        if key in seen:
            continue
        seen.add(key)
        out.append(
            Edge(
                id=edge_from_parts(from_id, to_id, edge.type, edge.source_template).id,
                from_id=from_id,
                to_id=to_id,
                type=edge.type,
                source_template=edge.source_template,
                confidence=edge.confidence,
                raw=edge.raw,
            )
        )
    return sorted(out, key=lambda item: (item.from_id, item.to_id, item.type, item.source_template or ""))


def canonicalize_node_id(node_id: str, by_lang_word: dict[tuple[str, str], list[str]]) -> str:
    try:
        parsed = parse_node_id(node_id)
    except ValueError:
        return node_id
    if parsed.pos != "unknown":
        return node_id
    matches = sorted(by_lang_word.get((parsed.lang_code, parsed.normalized_word), []))
    if len(matches) == 1:
        return matches[0]
    if matches:
        for candidate in matches:
            try:
                if parse_node_id(candidate).pos == "verb":
                    return candidate
            except ValueError:
                continue
        return matches[0]
    return node_id


def ingest_jsonl(
    input_path: Path,
    out_dir: Path,
    langs: set[str] | None = None,
    strict: bool = False,
    limit: int | None = None,
) -> IngestStats:
    return ingest_jsonl_many([input_path], out_dir, langs=langs, strict=strict, limit=limit)


def ingest_jsonl_many(
    input_paths: list[Path],
    out_dir: Path,
    langs: set[str] | None = None,
    strict: bool = False,
    limit: int | None = None,
) -> IngestStats:
    allowed_langs = langs or set(DEFAULT_LANGS)
    stats = IngestStats(input_path=",".join(str(path) for path in input_paths))
    nodes: dict[str, Node] = {}
    raw_edges: list[Edge] = []
    template_seen = Counter()
    template_skipped = Counter()
    for input_path in input_paths:
        for _, entry in iter_jsonl(input_path, strict=strict, limit=limit):
            stats.entries_total += 1
            if entry is None:
                stats.malformed_json_lines += 1
                continue
            node = node_from_entry(entry, source=str(input_path))
            if node is None:
                continue
            if node.lang_code not in allowed_langs:
                stats.skipped_language_entries += 1
                continue
            stats.entries_kept += 1
            nodes.setdefault(node.id, node)
            template_result = extract_template_edges(node, entry)
            raw_edges.extend(template_result.edges)
            template_seen.update(template_result.templates_seen)
            template_skipped.update(template_result.templates_skipped)
            descendant_edges, seen, skipped = extract_descendant_edges(node, entry)
            raw_edges.extend(descendant_edges)
            stats.descendant_records_seen += seen
            stats.descendant_records_skipped += skipped
    edges = canonicalize_edges(nodes, raw_edges)
    node_ids_before_placeholders = set(nodes)
    stats.dangling_edges = sum(
        1 for edge in edges if edge.from_id not in node_ids_before_placeholders or edge.to_id not in node_ids_before_placeholders
    )
    stats.placeholder_nodes_written = add_placeholder_nodes_for_edges(nodes, edges)
    stats.nodes_written = len(nodes)
    stats.edges_written = len(edges)
    stats.templates_seen = dict(sorted(template_seen.items()))
    stats.templates_skipped = dict(sorted(template_skipped.items()))
    write_build(out_dir, nodes.values(), edges, stats)
    return stats


def add_placeholder_nodes_for_edges(nodes: dict[str, Node], edges: Iterable[Edge]) -> int:
    created = 0
    for edge in edges:
        for node_id in (edge.from_id, edge.to_id):
            if node_id in nodes:
                continue
            try:
                parsed = parse_node_id(node_id)
            except ValueError:
                continue
            word = parsed.normalized_word
            nodes[node_id] = Node(
                id=node_id,
                lang=None,
                lang_code=parsed.lang_code,
                word=word,
                normalized_word=normalize_word(word),
                pos=None if parsed.pos == "unknown" else parsed.pos,
                etymology_number=None if parsed.etymology_number == "0" else parsed.etymology_number,
                glosses=[],
                source="edge-placeholder",
            )
            created += 1
    return created


def write_build(out_dir: Path, nodes: Iterable[Node], edges: Iterable[Edge], stats: IngestStats) -> None:
    out_dir.mkdir(parents=True, exist_ok=True)
    write_jsonl(out_dir / "nodes.jsonl", [node.to_dict() for node in sorted(nodes, key=lambda item: item.id)])
    write_jsonl(out_dir / "edges.jsonl", [edge.to_dict() for edge in edges])
    (out_dir / "ingest_stats.json").write_text(
        json.dumps(stats.to_dict(), ensure_ascii=False, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )


def write_jsonl(path: Path, rows: Iterable[dict[str, Any]]) -> None:
    with path.open("w", encoding="utf-8") as handle:
        for row in rows:
            handle.write(json.dumps(row, ensure_ascii=False, sort_keys=True) + "\n")
