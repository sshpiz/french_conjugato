from __future__ import annotations

import hashlib
import json
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any

from .normalize import normalize_word


class UnionFind:
    def __init__(self) -> None:
        self.parent: list[int] = []
        self.size: list[int] = []
        self.id_to_index: dict[str, int] = {}
        self.ids: list[str] = []

    def add(self, node_id: str) -> int:
        index = self.id_to_index.get(node_id)
        if index is not None:
            return index
        index = len(self.parent)
        self.id_to_index[node_id] = index
        self.ids.append(node_id)
        self.parent.append(index)
        self.size.append(1)
        return index

    def find(self, index: int) -> int:
        while self.parent[index] != index:
            self.parent[index] = self.parent[self.parent[index]]
            index = self.parent[index]
        return index

    def union(self, left: int, right: int) -> None:
        left_root = self.find(left)
        right_root = self.find(right)
        if left_root == right_root:
            return
        if self.size[left_root] < self.size[right_root]:
            left_root, right_root = right_root, left_root
        self.parent[right_root] = left_root
        self.size[left_root] += self.size[right_root]


def build_component_exports(
    build_dir: Path,
    related_export_path: Path,
    out_path: Path,
    small_components_out_path: Path | None = None,
    max_small_component_size: int = 160,
) -> tuple[dict[str, Any], dict[str, Any]]:
    uf = build_union_find(build_dir)
    root_sizes = Counter(uf.find(index) for index in range(len(uf.parent)))
    root_min_ids = min_ids_by_root(uf)
    ranked_roots = sorted(root_sizes, key=lambda root: (-root_sizes[root], root_min_ids[root]))
    component_ids = {root: component_id(root_min_ids[root]) for root in root_sizes}
    component_ranks = {root: rank + 1 for rank, root in enumerate(ranked_roots)}

    related_export = json.loads(related_export_path.read_text(encoding="utf-8"))
    exported_verbs = related_export.get("verbs", {})
    verb_rows: dict[str, dict[str, Any]] = {}
    verbs_by_component: dict[str, list[str]] = defaultdict(list)
    selected_roots: set[int] = set()

    for verb, row in sorted(exported_verbs.items(), key=lambda item: normalize_word(item[0])):
        node_id = str(row.get("fr_node_id") or "")
        index = uf.id_to_index.get(node_id)
        if index is None:
            continue
        root = uf.find(index)
        cc_id = component_ids[root]
        selected_roots.add(root)
        verbs_by_component[cc_id].append(verb)
        size = root_sizes[root]
        verb_rows[verb] = {
            "fr_node_id": node_id,
            "component_id": cc_id,
            "component_size": size,
            "component_rank": component_ranks[root],
            "component_is_explorable": size <= max_small_component_size,
        }

    component_summaries = {
        component_ids[root]: {
            "component_id": component_ids[root],
            "component_size": root_sizes[root],
            "component_rank": component_ranks[root],
            "representative_node_id": root_min_ids[root],
            "exported_french_verb_count": len(verbs_by_component.get(component_ids[root], [])),
            "sample_verbs": verbs_by_component.get(component_ids[root], [])[:12],
            "component_is_explorable": root_sizes[root] <= max_small_component_size,
        }
        for root in selected_roots
    }

    data = {
        "metadata": {
            "source": "etygraph weakly connected components",
            "build_dir": str(build_dir),
            "related_export": str(related_export_path),
            "nodes_including_edge_only_ids": len(uf.parent),
            "components_total": len(root_sizes),
            "isolated_components": sum(1 for value in root_sizes.values() if value == 1),
            "largest_component_size": root_sizes[ranked_roots[0]] if ranked_roots else 0,
            "exported_verbs_indexed": len(verb_rows),
            "max_small_component_size": max_small_component_size,
        },
        "verbs": verb_rows,
        "components": dict(sorted(component_summaries.items(), key=lambda item: (-item[1]["component_size"], item[0]))),
    }
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(data, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")

    small_data: dict[str, Any] = {"metadata": {}, "components": {}}
    if small_components_out_path is not None:
        small_roots = {root for root in selected_roots if root_sizes[root] <= max_small_component_size}
        small_data = build_small_component_subgraphs(build_dir, uf, small_roots, component_ids, root_sizes)
        small_components_out_path.parent.mkdir(parents=True, exist_ok=True)
        small_components_out_path.write_text(
            json.dumps(small_data, ensure_ascii=False, indent=2, sort_keys=True) + "\n",
            encoding="utf-8",
        )
    return data, small_data


def build_union_find(build_dir: Path) -> UnionFind:
    uf = UnionFind()
    with (build_dir / "nodes.jsonl").open(encoding="utf-8") as handle:
        for line in handle:
            if line.strip():
                uf.add(str(json.loads(line)["id"]))
    with (build_dir / "edges.jsonl").open(encoding="utf-8") as handle:
        for line in handle:
            if not line.strip():
                continue
            row = json.loads(line)
            uf.union(uf.add(str(row["from_id"])), uf.add(str(row["to_id"])))
    return uf


def min_ids_by_root(uf: UnionFind) -> dict[int, str]:
    result: dict[int, str] = {}
    for index, node_id in enumerate(uf.ids):
        root = uf.find(index)
        current = result.get(root)
        if current is None or node_id < current:
            result[root] = node_id
    return result


def component_id(representative_node_id: str) -> str:
    digest = hashlib.sha1(representative_node_id.encode("utf-8")).hexdigest()[:12]
    return f"cc_{digest}"


def build_small_component_subgraphs(
    build_dir: Path,
    uf: UnionFind,
    small_roots: set[int],
    component_ids: dict[int, str],
    root_sizes: Counter[int],
) -> dict[str, Any]:
    nodes_by_component: dict[str, list[dict[str, Any]]] = defaultdict(list)
    edges_by_component: dict[str, list[dict[str, Any]]] = defaultdict(list)

    with (build_dir / "nodes.jsonl").open(encoding="utf-8") as handle:
        for line in handle:
            if not line.strip():
                continue
            row = json.loads(line)
            index = uf.id_to_index.get(str(row["id"]))
            if index is None:
                continue
            root = uf.find(index)
            if root in small_roots:
                nodes_by_component[component_ids[root]].append(compact_node(row))

    with (build_dir / "edges.jsonl").open(encoding="utf-8") as handle:
        for line in handle:
            if not line.strip():
                continue
            row = json.loads(line)
            from_index = uf.id_to_index.get(str(row["from_id"]))
            to_index = uf.id_to_index.get(str(row["to_id"]))
            if from_index is None or to_index is None:
                continue
            root = uf.find(from_index)
            if root in small_roots and uf.find(to_index) == root:
                edges_by_component[component_ids[root]].append(compact_edge(row))

    components = {}
    for root in small_roots:
        cc_id = component_ids[root]
        components[cc_id] = {
            "component_id": cc_id,
            "component_size": root_sizes[root],
            "nodes": sorted(nodes_by_component.get(cc_id, []), key=lambda row: row["id"]),
            "edges": sorted(edges_by_component.get(cc_id, []), key=lambda row: row["id"]),
        }
    return {
        "metadata": {
            "source": "etygraph small weakly connected component subgraphs",
            "components": len(components),
        },
        "components": dict(sorted(components.items())),
    }


def compact_node(row: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": row.get("id"),
        "lang_code": row.get("lang_code"),
        "lang": row.get("lang"),
        "word": row.get("word"),
        "pos": row.get("pos"),
        "glosses": (row.get("glosses") or [])[:2],
    }


def compact_edge(row: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": row.get("id"),
        "from_id": row.get("from_id"),
        "to_id": row.get("to_id"),
        "type": row.get("type"),
        "confidence": row.get("confidence"),
        "source_template": row.get("source_template"),
    }
