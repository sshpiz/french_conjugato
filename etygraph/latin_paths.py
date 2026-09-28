from __future__ import annotations

import json
import unicodedata
from pathlib import Path
from typing import Any

from .graph import EtymologyGraph
from .models import DescendantHit, Edge, Node
from .normalize import normalize_word

DEFAULT_LATIN_PATH_EDGE_TYPES = {
    "inherited_from",
    "descended_from",
    "borrowed_from",
    "learned_borrowing_from",
    "semi_learned_borrowing_from",
    "adapted_borrowing_from",
    "unadapted_borrowing_from",
    "derived_from",
}


def export_latin_path_shards(
    graph: EtymologyGraph,
    related_export_path: Path,
    out_dir: Path,
    max_latin_depth: int = 3,
    max_english_depth: int = 4,
    max_english_descendants: int = 160,
    allowed_edge_types: set[str] | None = None,
) -> dict[str, Any]:
    allowed = allowed_edge_types or DEFAULT_LATIN_PATH_EDGE_TYPES
    related_export = json.loads(related_export_path.read_text(encoding="utf-8"))
    descendant_cache: dict[str, dict[str, DescendantHit]] = {}
    shards: dict[str, dict[str, Any]] = {}
    matched = 0
    with_latin_path = 0

    for verb, row in sorted(related_export.get("verbs", {}).items(), key=lambda item: normalize_word(item[0])):
        node_id = str(row.get("fr_node_id") or "")
        if node_id not in graph.nodes_by_id:
            continue
        matched += 1
        data = latin_path_for_node(
            graph,
            node_id,
            max_latin_depth=max_latin_depth,
            max_english_depth=max_english_depth,
            max_english_descendants=max_english_descendants,
            allowed_edge_types=allowed,
            descendant_cache=descendant_cache,
        )
        if data.get("latin_ancestor"):
            with_latin_path += 1
        shards.setdefault(shard_key(verb), {})[verb] = data

    out_dir.mkdir(parents=True, exist_ok=True)
    index = {
        "metadata": {
            "source": "etygraph closest Latin ancestor paths",
            "related_export": str(related_export_path),
            "verbs_indexed": matched,
            "verbs_with_latin_path": with_latin_path,
            "max_latin_depth": max_latin_depth,
            "max_english_depth": max_english_depth,
            "max_english_descendants": max_english_descendants,
            "allowed_edge_types": sorted(allowed),
        },
        "shards": {},
    }
    for key, rows in sorted(shards.items()):
        path = out_dir / f"{key}.json"
        payload = {
            "metadata": {
                "shard": key,
                "verbs": len(rows),
            },
            "verbs": dict(sorted(rows.items(), key=lambda item: normalize_word(item[0]))),
        }
        path.write_text(json.dumps(payload, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")
        index["shards"][key] = {"file": path.name, "verbs": len(rows)}
    (out_dir / "index.json").write_text(json.dumps(index, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    return index


def latin_path_for_node(
    graph: EtymologyGraph,
    fr_node_id: str,
    max_latin_depth: int,
    max_english_depth: int,
    max_english_descendants: int,
    allowed_edge_types: set[str],
    descendant_cache: dict[str, dict[str, DescendantHit]],
) -> dict[str, Any]:
    fr_node = graph.nodes_by_id[fr_node_id]
    ancestors = graph.get_ancestors(fr_node_id, max_depth=max_latin_depth, allowed_edge_types=allowed_edge_types)
    latin_hits = [
        (ancestor_id, hit)
        for ancestor_id, hit in ancestors.items()
        if graph.nodes_by_id.get(ancestor_id) and graph.nodes_by_id[ancestor_id].lang_code == "la"
    ]
    latin_hits.sort(key=lambda item: (item[1].distance, -item[1].confidence_product, edge_penalty(item[1].relation_types), item[0]))

    for ancestor_id, hit in latin_hits:
        descendants = descendant_cache.get(ancestor_id)
        if descendants is None:
            descendants = graph.get_descendants(
                ancestor_id,
                max_depth=max_english_depth,
                lang_code="en",
                allowed_edge_types=allowed_edge_types,
            )
            descendant_cache[ancestor_id] = descendants
        english = [
            (node_id, descendant_hit)
            for node_id, descendant_hit in descendants.items()
            if graph.nodes_by_id.get(node_id) and graph.nodes_by_id[node_id].lang_code == "en"
        ]
        if not english:
            continue
        english.sort(key=lambda item: english_sort_key(graph.nodes_by_id[item[0]], item[1]))
        english = unique_english_words(graph, english)
        capped = english[:max_english_descendants]
        return {
            "fr_node": compact_node(fr_node),
            "latin_ancestor": compact_node(graph.nodes_by_id[ancestor_id]),
            "french_distance": hit.distance,
            "french_confidence": round(hit.confidence_product, 3),
            "french_path": path_payload(graph, hit.path_edges),
            "english_descendants_total": len(english),
            "english_descendants_truncated": len(english) > len(capped),
            "english_descendants": [
                {
                    "node": compact_node(graph.nodes_by_id[node_id]),
                    "distance": descendant_hit.distance,
                    "confidence": round(descendant_hit.confidence_product, 3),
                    "relation_types": descendant_hit.relation_types,
                    "path": path_payload(graph, descendant_hit.path_edges),
                }
                for node_id, descendant_hit in capped
            ],
        }

    return {
        "fr_node": compact_node(fr_node),
        "latin_ancestor": None,
        "french_distance": None,
        "french_confidence": 0,
        "french_path": [],
        "english_descendants_total": 0,
        "english_descendants_truncated": False,
        "english_descendants": [],
    }


def path_payload(graph: EtymologyGraph, edges: list[Edge]) -> list[dict[str, Any]]:
    return [
        {
            "edge": compact_edge(edge),
            "from_node": compact_node(graph.nodes_by_id[edge.from_id]) if edge.from_id in graph.nodes_by_id else fallback_node(edge.from_id),
            "to_node": compact_node(graph.nodes_by_id[edge.to_id]) if edge.to_id in graph.nodes_by_id else fallback_node(edge.to_id),
        }
        for edge in edges
    ]


def compact_node(node: Node) -> dict[str, Any]:
    return {
        "id": node.id,
        "lang": node.lang,
        "lang_code": node.lang_code,
        "word": node.word,
        "pos": node.pos,
        "glosses": node.glosses[:2],
    }


def fallback_node(node_id: str) -> dict[str, Any]:
    parts = node_id.split(":")
    return {
        "id": node_id,
        "lang": None,
        "lang_code": parts[0] if parts else "",
        "word": parts[1].replace("_", " ") if len(parts) > 1 else node_id,
        "pos": parts[2] if len(parts) > 2 else None,
        "glosses": [],
    }


def compact_edge(edge: Edge) -> dict[str, Any]:
    return {
        "id": edge.id,
        "from_id": edge.from_id,
        "to_id": edge.to_id,
        "type": edge.type,
        "confidence": round(edge.confidence, 3),
        "source_template": edge.source_template,
    }


def english_sort_key(node: Node, hit: DescendantHit) -> tuple[int, int, float, str]:
    pos_rank = {"verb": 0, "noun": 1, "adj": 2, "adjective": 2}.get(node.pos or "", 4)
    return (hit.distance, pos_rank, -hit.confidence_product, normalize_word(node.word))


def unique_english_words(
    graph: EtymologyGraph,
    english: list[tuple[str, DescendantHit]],
) -> list[tuple[str, DescendantHit]]:
    seen: set[str] = set()
    out: list[tuple[str, DescendantHit]] = []
    for node_id, hit in english:
        key = normalize_word(graph.nodes_by_id[node_id].word)
        if key not in seen:
            seen.add(key)
            out.append((node_id, hit))
    return out


def edge_penalty(types: list[str]) -> int:
    penalties = {
        "inherited_from": 0,
        "descended_from": 0,
        "borrowed_from": 1,
        "learned_borrowing_from": 1,
        "semi_learned_borrowing_from": 2,
        "adapted_borrowing_from": 2,
        "unadapted_borrowing_from": 2,
        "derived_from": 3,
    }
    return sum(penalties.get(edge_type, 8) for edge_type in types)


def shard_key(verb: str) -> str:
    text = strip_marks(normalize_word(verb))
    first = text[:1]
    if first and first.isalpha() and "a" <= first <= "z":
        return first
    return "_"


def strip_marks(value: str) -> str:
    return "".join(
        char
        for char in unicodedata.normalize("NFD", value)
        if unicodedata.category(char) != "Mn"
    )
