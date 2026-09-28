from __future__ import annotations

import hashlib
from dataclasses import dataclass, field
from typing import Any, Iterable

from .models import Edge, Node
from .normalize import display_word, make_node_id, normalize_lang_code, normalize_word


TEMPLATE_EDGE_TYPES: dict[str, str] = {
    "inh": "inherited_from",
    "inh+": "inherited_from",
    "inherited": "inherited_from",
    "bor": "borrowed_from",
    "borrowed": "borrowed_from",
    "bor+": "borrowed_from",
    "lbor": "learned_borrowing_from",
    "lbor+": "learned_borrowing_from",
    "slbor": "semi_learned_borrowing_from",
    "slbor+": "semi_learned_borrowing_from",
    "abor": "adapted_borrowing_from",
    "abor+": "adapted_borrowing_from",
    "ubor": "unadapted_borrowing_from",
    "ubor+": "unadapted_borrowing_from",
    "der": "derived_from",
    "der+": "derived_from",
    "derived": "derived_from",
    "uder": "derived_from",
    "uder+": "derived_from",
    "cog": "cognate_with",
    "cognate": "cognate_with",
    "af": "composed_of",
    "affix": "composed_of",
    "compound": "composed_of",
    "prefix": "composed_of",
    "suffix": "composed_of",
}

ETYMON_RELATIONS: dict[str, str] = {
    ":inh": "inherited_from",
    ":inherited": "inherited_from",
    ":bor": "borrowed_from",
    ":borrowed": "borrowed_from",
    ":lbor": "learned_borrowing_from",
    ":slbor": "semi_learned_borrowing_from",
    ":abor": "adapted_borrowing_from",
    ":ubor": "unadapted_borrowing_from",
    ":der": "derived_from",
    ":derived": "derived_from",
    ":cog": "cognate_with",
}

EDGE_CONFIDENCE: dict[str, float] = {
    "inherited_from": 0.95,
    "borrowed_from": 0.9,
    "learned_borrowing_from": 0.88,
    "semi_learned_borrowing_from": 0.85,
    "adapted_borrowing_from": 0.82,
    "unadapted_borrowing_from": 0.82,
    "derived_from": 0.85,
    "cognate_with": 0.65,
    "composed_of": 0.65,
    "descended_from": 0.9,
    "unknown_etymology_relation": 0.5,
}


@dataclass
class TemplateExtractionResult:
    edges: list[Edge] = field(default_factory=list)
    templates_seen: dict[str, int] = field(default_factory=dict)
    templates_skipped: dict[str, int] = field(default_factory=dict)


def make_edge_id(from_id: str, to_id: str, edge_type: str, source_template: str | None) -> str:
    key = f"{from_id}|{to_id}|{edge_type}|{source_template or ''}"
    digest = hashlib.sha1(key.encode("utf-8")).hexdigest()[:16]
    return f"edge:{digest}"


def edge_from_parts(
    from_id: str,
    to_id: str,
    edge_type: str,
    source_template: str | None,
    raw: dict[str, Any] | None = None,
    confidence: float | None = None,
) -> Edge:
    return Edge(
        id=make_edge_id(from_id, to_id, edge_type, source_template),
        from_id=from_id,
        to_id=to_id,
        type=edge_type,
        source_template=source_template,
        confidence=confidence if confidence is not None else EDGE_CONFIDENCE.get(edge_type, 0.5),
        raw=raw,
    )


def iter_templates(value: Any) -> Iterable[dict[str, Any]]:
    if isinstance(value, list):
        for item in value:
            if isinstance(item, dict):
                yield item
    elif isinstance(value, dict):
        if "name" in value or "template" in value:
            yield value
        else:
            for item in value.values():
                if isinstance(item, dict):
                    yield item
                elif isinstance(item, list):
                    yield from iter_templates(item)


def template_name(template: dict[str, Any]) -> str:
    return str(template.get("name") or template.get("template") or "").strip().lower()


def template_args(template: dict[str, Any]) -> dict[str, Any]:
    args = template.get("args")
    if isinstance(args, dict):
        return args
    if isinstance(args, list):
        return {str(index + 1): value for index, value in enumerate(args)}
    return {
        str(key): value
        for key, value in template.items()
        if str(key).isdigit() or str(key) in {"lang", "term", "alt", "tr"}
    }


def get_arg(args: dict[str, Any], *keys: str) -> str | None:
    for key in keys:
        value = args.get(key)
        if value not in (None, ""):
            return str(value)
    return None


def source_node_id(lang_code: str, word: str, pos: str | None = None) -> str:
    return make_node_id(normalize_lang_code(lang_code), word, pos or "unknown", 0)


def extract_template_edges(entry_node: Node, entry: dict[str, Any]) -> TemplateExtractionResult:
    result = TemplateExtractionResult()
    for template in iter_templates(entry.get("etymology_templates")):
        name = template_name(template)
        if not name:
            continue
        result.templates_seen[name] = result.templates_seen.get(name, 0) + 1
        if name == "etymon":
            edges = extract_etymon_edges(entry_node, template)
        elif name in {"af", "affix", "compound", "prefix", "suffix"}:
            edges = extract_component_edges(entry_node, template, name)
        elif name in TEMPLATE_EDGE_TYPES:
            edge = extract_source_edge(entry_node, template, TEMPLATE_EDGE_TYPES[name], name)
            edges = [edge] if edge else []
        else:
            result.templates_skipped[name] = result.templates_skipped.get(name, 0) + 1
            continue
        if edges:
            result.edges.extend(edges)
        else:
            result.templates_skipped[name] = result.templates_skipped.get(name, 0) + 1
    return result


def extract_source_edge(
    entry_node: Node,
    template: dict[str, Any],
    edge_type: str,
    name: str,
) -> Edge | None:
    args = template_args(template)
    source_lang = get_arg(args, "2", "source_lang", "from", "lang2")
    source_word = get_arg(args, "3", "term", "word", "source_word")
    if not source_lang or not source_word:
        return None
    target_id = source_node_id(source_lang, source_word)
    return edge_from_parts(entry_node.id, target_id, edge_type, name, raw=template)


def extract_component_edges(entry_node: Node, template: dict[str, Any], name: str) -> list[Edge]:
    args = template_args(template)
    component_lang = get_arg(args, "2") if name in {"prefix", "suffix"} else None
    current_lang = get_arg(args, "1") or entry_node.lang_code
    edges: list[Edge] = []
    for key, value in sorted(args.items(), key=lambda item: arg_sort_key(item[0])):
        if not str(key).isdigit():
            continue
        if key == "1":
            continue
        if name in {"prefix", "suffix"} and key == "2":
            continue
        word = display_word(value)
        if not word:
            continue
        target_lang = component_lang or current_lang
        target_id = source_node_id(target_lang, word)
        edges.append(edge_from_parts(entry_node.id, target_id, "composed_of", name, raw=template))
    return edges


def arg_sort_key(key: str) -> tuple[int, str]:
    return (int(key), key) if str(key).isdigit() else (10_000, str(key))


def extract_etymon_edges(entry_node: Node, template: dict[str, Any]) -> list[Edge]:
    args = template_args(template)
    relation = "unknown_etymology_relation"
    specs: list[str] = []
    for value in args.values():
        text = str(value).strip()
        if not text:
            continue
        lowered = text.lower()
        if lowered in ETYMON_RELATIONS:
            relation = ETYMON_RELATIONS[lowered]
        elif ":" in text and not text.startswith(":"):
            specs.append(text)
    edges: list[Edge] = []
    for spec in specs:
        parsed = parse_source_spec(spec)
        if parsed is None:
            continue
        source_lang, source_word = parsed
        target_id = source_node_id(source_lang, source_word)
        edges.append(edge_from_parts(entry_node.id, target_id, relation, "etymon", raw=template))
    return edges


def parse_source_spec(value: str) -> tuple[str, str] | None:
    left, _, right = value.partition(":")
    source_lang = left.strip()
    source_word = display_word(right)
    if not source_lang or not source_word:
        return None
    return normalize_lang_code(source_lang), source_word


def edge_type_is_source_relation(edge_type: str) -> bool:
    return edge_type not in {"cognate_with", "composed_of", "unknown_etymology_relation"}


def template_is_likely_supported(name: str) -> bool:
    normalized = normalize_word(name)
    return normalized in TEMPLATE_EDGE_TYPES or normalized == "etymon"
