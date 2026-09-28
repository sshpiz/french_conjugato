from __future__ import annotations

from .graph import EtymologyGraph
from .models import DescendantHit, EnglishRelatedCandidate, FrenchRelatedOutput, Node
from .normalize import normalize_word
from .scoring import relation_label, score_candidate

DEFAULT_ANCESTOR_LANG_PRIORITY = {
    "la": 0,
    "fro": 1,
    "frm": 1,
    "fr": 2,
    "grc": 3,
    "itc-pro": 5,
    "gem-pro": 8,
    "ine-pro": 10,
}


def related_english_for_french_node(
    graph: EtymologyGraph,
    fr_node_id: str,
    top_n: int = 8,
    max_depth: int = 5,
    descendant_cache: dict[tuple[str, int, str], dict[str, DescendantHit]] | None = None,
) -> FrenchRelatedOutput:
    fr_node = graph.nodes_by_id[fr_node_id]
    ancestors = graph.get_ancestors(fr_node_id, max_depth=max_depth)
    candidates: dict[str, EnglishRelatedCandidate] = {}
    for ancestor_id, french_hit in sorted(
        ancestors.items(),
        key=lambda item: (
            DEFAULT_ANCESTOR_LANG_PRIORITY.get(graph.nodes_by_id.get(item[0], missing_node(item[0])).lang_code, 99),
            item[1].distance,
            item[0],
        ),
    ):
        ancestor_node = graph.nodes_by_id.get(ancestor_id)
        if ancestor_node is None or not ancestor_is_useful(ancestor_node):
            continue
        if "composed_of" in french_hit.relation_types and is_affix_like_ancestor(ancestor_node):
            continue
        cache_key = (ancestor_id, max_depth, "en")
        if descendant_cache is not None and cache_key in descendant_cache:
            descendants = descendant_cache[cache_key]
        else:
            descendants = graph.get_descendants(ancestor_id, max_depth=max_depth, lang_code="en")
            if descendant_cache is not None:
                descendant_cache[cache_key] = descendants
        for en_id, english_hit in descendants.items():
            if en_id == fr_node_id:
                continue
            english_node = graph.nodes_by_id.get(en_id)
            if english_node is None or english_node.lang_code != "en":
                continue
            if english_node.normalized_word == fr_node.normalized_word and not english_node.glosses:
                continue
            relation_types = stable_relation_types(french_hit.relation_types + english_hit.relation_types)
            path_langs = path_langs_for_descendant(graph, ancestor_id, english_hit.path_edges)
            score, confidence, warnings = score_candidate(fr_node, english_node, ancestor_node, french_hit, english_hit)
            candidate = EnglishRelatedCandidate(
                word=english_node.word,
                node_id=english_node.id,
                pos=english_node.pos,
                glosses=english_node.glosses,
                relation_label=relation_label(ancestor_node, relation_types, path_langs),
                via=via_label(ancestor_node),
                ancestor_node_id=ancestor_node.id,
                ancestor_word=ancestor_node.word,
                ancestor_lang_code=ancestor_node.lang_code,
                ancestor_lang=ancestor_node.lang,
                score=score,
                confidence=confidence,
                path_summary=path_summary(fr_node.id, ancestor_node.id, english_node.id),
                relation_types=relation_types,
                warnings=warnings,
            )
            candidate_key = english_node.normalized_word or normalize_word(english_node.word)
            previous = candidates.get(candidate_key)
            if previous is None or candidate_sort_key(candidate) < candidate_sort_key(previous):
                candidates[candidate_key] = candidate
    sorted_candidates = sorted(candidates.values(), key=candidate_sort_key)
    if any(candidate.score >= 60 for candidate in sorted_candidates):
        sorted_candidates = [candidate for candidate in sorted_candidates if candidate.score >= 50]
    non_multiword_candidates = [
        candidate for candidate in sorted_candidates if not is_multiword(candidate.word)
    ]
    if len(non_multiword_candidates) >= top_n:
        sorted_candidates = non_multiword_candidates
    if any(candidate.glosses for candidate in sorted_candidates) and len(sorted_candidates) > top_n:
        sorted_candidates = [
            candidate
            for candidate in sorted_candidates
            if candidate.glosses or candidate.score >= 60
        ]
    return FrenchRelatedOutput(
        fr_word=fr_node.word,
        fr_node_id=fr_node.id,
        pos=fr_node.pos,
        glosses=fr_node.glosses,
        english_related=sorted_candidates[:top_n],
        notes=["Related words may have drifted in meaning."] if sorted_candidates else [],
    )


def related_english_for_word(
    graph: EtymologyGraph,
    word: str,
    lang_code: str = "fr",
    pos: str | None = "verb",
    top_n: int = 8,
    max_depth: int = 5,
) -> FrenchRelatedOutput | None:
    node_ids = graph.resolve_nodes(lang_code, word, pos)
    if not node_ids:
        return None
    outputs = [related_english_for_french_node(graph, node_id, top_n=top_n, max_depth=max_depth) for node_id in node_ids]
    return max(outputs, key=lambda output: (len(output.english_related), max([c.score for c in output.english_related] or [0])))


def ancestor_is_useful(node: Node) -> bool:
    return node.lang_code in DEFAULT_ANCESTOR_LANG_PRIORITY


def is_affix_like_ancestor(node: Node) -> bool:
    normalized = node.normalized_word or normalize_word(node.word)
    pos = (node.pos or "").lower()
    return (
        normalized.startswith("-")
        or normalized.endswith("-")
        or pos in {"prefix", "suffix", "interfix", "circumfix"}
    )


def is_multiword(word: str) -> bool:
    return len(normalize_word(word).split()) > 1


def stable_relation_types(values: list[str]) -> list[str]:
    out: list[str] = []
    seen: set[str] = set()
    for value in values:
        if value not in seen:
            seen.add(value)
            out.append(value)
    return out


def path_langs_for_descendant(graph: EtymologyGraph, ancestor_id: str, edges: list[object]) -> list[str]:
    langs: list[str] = []
    ancestor = graph.nodes_by_id.get(ancestor_id)
    if ancestor:
        langs.append(ancestor.lang_code)
    for edge in edges:
        for node_id in (edge.from_id, edge.to_id):
            node = graph.nodes_by_id.get(node_id)
            if node and node.lang_code not in langs:
                langs.append(node.lang_code)
    return langs


def path_summary(fr_id: str, ancestor_id: str, en_id: str) -> str:
    return f"{fr_id} -> {ancestor_id} <- {en_id}"


def via_label(node: Node) -> str:
    if node.lang:
        return f"{node.lang} {node.word}"
    return f"{node.lang_code} {node.word}"


def candidate_sort_key(candidate: EnglishRelatedCandidate) -> tuple[float, float, str]:
    return (-candidate.score, -candidate.confidence, candidate.word.lower())


def missing_node(node_id: str) -> Node:
    return Node(
        id=node_id,
        lang=None,
        lang_code="",
        word=node_id,
        normalized_word=node_id,
        pos=None,
        etymology_number=None,
        glosses=[],
        source="",
    )
