from __future__ import annotations

import json
from collections import Counter, defaultdict, deque
from pathlib import Path
from typing import Iterable

from .models import AncestorHit, DescendantHit, Edge, Node
from .normalize import normalize_word

EDGE_TYPE_PENALTY = {
    "inherited_from": 0,
    "descended_from": 0,
    "borrowed_from": 1,
    "learned_borrowing_from": 1,
    "semi_learned_borrowing_from": 2,
    "adapted_borrowing_from": 2,
    "unadapted_borrowing_from": 2,
    "derived_from": 2,
    "unknown_etymology_relation": 4,
    "cognate_with": 5,
    "composed_of": 6,
}


class EtymologyGraph:
    def __init__(self, nodes: Iterable[Node], edges: Iterable[Edge]) -> None:
        self.nodes_by_id: dict[str, Node] = {node.id: node for node in nodes}
        self.edges: list[Edge] = list(edges)
        self.parents_by_child: dict[str, list[Edge]] = defaultdict(list)
        self.children_by_parent: dict[str, list[Edge]] = defaultdict(list)
        self.node_ids_by_lang_word: dict[tuple[str, str], list[str]] = defaultdict(list)
        self.node_ids_by_lang_pos: dict[tuple[str, str], list[str]] = defaultdict(list)
        for edge in self.edges:
            self.parents_by_child[edge.from_id].append(edge)
            self.children_by_parent[edge.to_id].append(edge)
        for node in self.nodes_by_id.values():
            self.node_ids_by_lang_word[(node.lang_code, node.normalized_word)].append(node.id)
            self.node_ids_by_lang_pos[(node.lang_code, node.pos or "unknown")].append(node.id)
        for mapping in (self.parents_by_child, self.children_by_parent):
            for edge_list in mapping.values():
                edge_list.sort(key=lambda edge: (edge.type, edge.to_id, edge.from_id))
        for key in list(self.node_ids_by_lang_word):
            self.node_ids_by_lang_word[key].sort()
        for key in list(self.node_ids_by_lang_pos):
            self.node_ids_by_lang_pos[key].sort()

    @classmethod
    def from_build_dir(cls, build_dir: Path) -> "EtymologyGraph":
        nodes = [Node.from_dict(row) for row in read_jsonl(build_dir / "nodes.jsonl")]
        edges = [Edge.from_dict(row) for row in read_jsonl(build_dir / "edges.jsonl")]
        return cls(nodes, edges)

    def resolve_nodes(self, lang_code: str, word: str, pos: str | None = None) -> list[str]:
        ids = list(self.node_ids_by_lang_word.get((lang_code, normalize_word(word)), []))
        if pos:
            pos_norm = pos.lower()
            ids = [node_id for node_id in ids if (self.nodes_by_id[node_id].pos or "unknown") == pos_norm]
        return ids

    def get_ancestors(
        self,
        start_node_id: str,
        max_depth: int = 5,
        allowed_edge_types: set[str] | None = None,
    ) -> dict[str, AncestorHit]:
        hits: dict[str, AncestorHit] = {}
        queue = deque([(start_node_id, 0, [], 1.0, {start_node_id})])
        while queue:
            current_id, distance, path, confidence, visited = queue.popleft()
            if distance >= max_depth:
                continue
            for edge in self.parents_by_child.get(current_id, []):
                if allowed_edge_types is not None and edge.type not in allowed_edge_types:
                    continue
                parent_id = edge.to_id
                if parent_id in visited:
                    continue
                next_path = path + [edge]
                next_distance = distance + 1
                next_confidence = confidence * edge.confidence
                hit = AncestorHit(
                    node_id=parent_id,
                    distance=next_distance,
                    path_edges=next_path,
                    confidence_product=next_confidence,
                    relation_types=relation_types(next_path),
                )
                if should_replace(hits.get(parent_id), hit):
                    hits[parent_id] = hit
                    queue.append((parent_id, next_distance, next_path, next_confidence, visited | {parent_id}))
        return hits

    def get_descendants(
        self,
        start_node_id: str,
        max_depth: int = 5,
        lang_code: str | None = None,
        allowed_edge_types: set[str] | None = None,
    ) -> dict[str, DescendantHit]:
        hits: dict[str, DescendantHit] = {}
        queue = deque([(start_node_id, 0, [], 1.0, {start_node_id})])
        while queue:
            current_id, distance, path, confidence, visited = queue.popleft()
            if distance >= max_depth:
                continue
            for edge in self.children_by_parent.get(current_id, []):
                if allowed_edge_types is not None and edge.type not in allowed_edge_types:
                    continue
                child_id = edge.from_id
                if child_id in visited:
                    continue
                next_path = path + [edge]
                next_distance = distance + 1
                next_confidence = confidence * edge.confidence
                node = self.nodes_by_id.get(child_id)
                if lang_code is None or (node and node.lang_code == lang_code):
                    hit = DescendantHit(
                        node_id=child_id,
                        distance=next_distance,
                        path_edges=next_path,
                        confidence_product=next_confidence,
                        relation_types=relation_types(next_path),
                    )
                    if should_replace(hits.get(child_id), hit):
                        hits[child_id] = hit
                queue.append((child_id, next_distance, next_path, next_confidence, visited | {child_id}))
        return hits

    def stats(self) -> dict[str, object]:
        nodes_by_lang = Counter(node.lang_code for node in self.nodes_by_id.values())
        edges_by_type = Counter(edge.type for edge in self.edges)
        missing_source_node_count = sum(1 for edge in self.edges if edge.to_id not in self.nodes_by_id)
        dangling_edge_count = sum(
            1 for edge in self.edges if edge.from_id not in self.nodes_by_id or edge.to_id not in self.nodes_by_id
        )
        skipped_templates = {}
        stats_path = None
        return {
            "nodes": len(self.nodes_by_id),
            "edges": len(self.edges),
            "nodes_by_lang": dict(sorted(nodes_by_lang.items())),
            "edges_by_type": dict(sorted(edges_by_type.items())),
            "missing_source_node_count": missing_source_node_count,
            "dangling_edge_count": dangling_edge_count,
            "top_templates_skipped": skipped_templates,
            "stats_path": stats_path,
        }


def read_jsonl(path: Path) -> Iterable[dict[str, object]]:
    with path.open("r", encoding="utf-8") as handle:
        for line in handle:
            if line.strip():
                yield json.loads(line)


def relation_types(path_edges: list[Edge]) -> list[str]:
    out: list[str] = []
    seen: set[str] = set()
    for edge in path_edges:
        if edge.type not in seen:
            seen.add(edge.type)
            out.append(edge.type)
    return out


def should_replace(current: AncestorHit | DescendantHit | None, candidate: AncestorHit | DescendantHit) -> bool:
    if current is None:
        return True
    current_key = path_rank(current.distance, current.confidence_product, current.relation_types)
    candidate_key = path_rank(candidate.distance, candidate.confidence_product, candidate.relation_types)
    return candidate_key < current_key


def path_rank(distance: int, confidence: float, types: list[str]) -> tuple[int, float, int]:
    penalty = sum(EDGE_TYPE_PENALTY.get(edge_type, 4) for edge_type in types)
    return (distance, -confidence, penalty)
