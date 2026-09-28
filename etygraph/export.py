from __future__ import annotations

import json
from pathlib import Path
from typing import Iterable

from .graph import EtymologyGraph
from .normalize import normalize_word, stable_unique
from .relate import related_english_for_french_node
from .repo_data import discover_verb_lists, load_verb_list


def export_french_verbs(
    graph: EtymologyGraph,
    out_path: Path,
    verbs: Iterable[str] | None = None,
    verb_list_source: str | None = None,
    top_n: int = 8,
    max_depth: int = 5,
    repo_root: Path | None = None,
) -> dict[str, object]:
    chosen_source = verb_list_source
    if verbs is None:
        if repo_root is not None:
            candidates = discover_verb_lists(repo_root)
            chosen = candidates[0] if candidates else None
            if chosen is not None:
                verbs = load_verb_list(chosen.path, chosen.verb_column)
                chosen_source = str(chosen.path)
        if verbs is None:
            verbs = all_french_verb_words(graph)
            chosen_source = "graph:french-verb-nodes"
    requested_verbs = stable_unique(list(verbs))
    unmatched: list[str] = []
    output_verbs: dict[str, object] = {}
    descendant_cache = {}
    matched = 0
    with_related = 0
    for verb in requested_verbs:
        node_ids = graph.resolve_nodes("fr", verb, "verb")
        if not node_ids:
            unmatched.append(verb)
            continue
        matched += 1
        best = None
        for node_id in node_ids:
            result = related_english_for_french_node(
                graph,
                node_id,
                top_n=top_n,
                max_depth=max_depth,
                descendant_cache=descendant_cache,
            )
            if best is None or len(result.english_related) > len(best.english_related):
                best = result
        if best is None:
            unmatched.append(verb)
            continue
        if best.english_related:
            with_related += 1
        output_verbs[best.fr_word] = best.to_dict()
    data = {
        "metadata": {
            "source": "kaikki/wiktextract-derived",
            "verb_list_source": chosen_source,
            "requested_verbs": len(requested_verbs),
            "matched_verbs": matched,
            "verbs_with_related_english": with_related,
            "unmatched_verbs": unmatched,
        },
        "verbs": dict(sorted(output_verbs.items(), key=lambda item: normalize_word(item[0]))),
    }
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(data, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    return data


def all_french_verb_words(graph: EtymologyGraph) -> list[str]:
    words = [
        node.word
        for node in graph.nodes_by_id.values()
        if node.lang_code == "fr" and (node.pos or "unknown") == "verb"
    ]
    return stable_unique(sorted(words, key=normalize_word))
