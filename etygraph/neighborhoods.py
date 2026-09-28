from __future__ import annotations

import json
import unicodedata
from collections import defaultdict, deque
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from .normalize import normalize_word


@dataclass(frozen=True)
class AdjacentEdge:
    edge_id: str
    neighbor_id: str
    from_id: str
    to_id: str
    type: str
    confidence: float


def build_neighborhood_shards(
    build_dir: Path,
    related_export_path: Path,
    out_dir: Path,
    max_depth: int = 3,
    max_nodes: int = 100,
    max_edges: int = 220,
) -> dict[str, Any]:
    related_export = json.loads(related_export_path.read_text(encoding="utf-8"))
    verb_nodes = {
        verb: str(row.get("fr_node_id"))
        for verb, row in related_export.get("verbs", {}).items()
        if row.get("fr_node_id")
    }
    starts = set(verb_nodes.values())
    adjacency = load_adjacency(build_dir)
    neighborhoods: dict[str, dict[str, Any]] = {}
    needed_node_ids: set[str] = set()

    for verb, node_id in sorted(verb_nodes.items(), key=lambda item: normalize_word(item[0])):
        data = build_neighborhood(node_id, adjacency, max_depth=max_depth, max_nodes=max_nodes, max_edges=max_edges)
        neighborhoods[verb] = data
        needed_node_ids.update(data["distances"].keys())
        for edge in data["edges"]:
            needed_node_ids.add(edge["from_id"])
            needed_node_ids.add(edge["to_id"])

    # Keep metadata for start nodes even when they have no edges.
    needed_node_ids.update(starts)
    node_meta = load_node_metadata(build_dir, needed_node_ids)
    shards: dict[str, dict[str, Any]] = defaultdict(dict)
    for verb, data in neighborhoods.items():
        distances = data["distances"]
        data["nodes"] = [
            {**node_meta.get(node_id, fallback_node(node_id)), "distance": distance}
            for node_id, distance in sorted(distances.items(), key=lambda item: (item[1], item[0]))
        ]
        del data["distances"]
        shards[shard_key(verb)][verb] = data

    out_dir.mkdir(parents=True, exist_ok=True)
    index = {
        "metadata": {
            "source": "etygraph verb neighborhoods",
            "build_dir": str(build_dir),
            "related_export": str(related_export_path),
            "verbs": len(verb_nodes),
            "max_depth": max_depth,
            "max_nodes": max_nodes,
            "max_edges": max_edges,
        },
        "shards": {},
    }
    for key, rows in sorted(shards.items()):
        path = out_dir / f"{key}.json"
        payload = {
            "metadata": {
                "shard": key,
                "verbs": len(rows),
                "max_depth": max_depth,
                "max_nodes": max_nodes,
            },
            "neighborhoods": dict(sorted(rows.items(), key=lambda item: normalize_word(item[0]))),
        }
        path.write_text(json.dumps(payload, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")
        index["shards"][key] = {"file": path.name, "verbs": len(rows)}
    (out_dir / "index.json").write_text(json.dumps(index, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    return index


def load_adjacency(build_dir: Path) -> dict[str, list[AdjacentEdge]]:
    adjacency: dict[str, list[AdjacentEdge]] = defaultdict(list)
    with (build_dir / "edges.jsonl").open(encoding="utf-8") as handle:
        for line in handle:
            if not line.strip():
                continue
            row = json.loads(line)
            edge_id = str(row["id"])
            from_id = str(row["from_id"])
            to_id = str(row["to_id"])
            edge_type = str(row.get("type") or "unknown_etymology_relation")
            confidence = float(row.get("confidence") or 0.0)
            adjacency[from_id].append(AdjacentEdge(edge_id, to_id, from_id, to_id, edge_type, confidence))
            adjacency[to_id].append(AdjacentEdge(edge_id, from_id, from_id, to_id, edge_type, confidence))
    for edges in adjacency.values():
        edges.sort(key=lambda edge: (edge_type_priority(edge.type), edge.neighbor_id, edge.edge_id))
    return adjacency


def build_neighborhood(
    start_node_id: str,
    adjacency: dict[str, list[AdjacentEdge]],
    max_depth: int,
    max_nodes: int,
    max_edges: int,
) -> dict[str, Any]:
    distances = {start_node_id: 0}
    queue = deque([start_node_id])
    truncated = False
    while queue:
        current = queue.popleft()
        distance = distances[current]
        if distance >= max_depth:
            continue
        for edge in adjacency.get(current, []):
            if edge.neighbor_id in distances:
                continue
            if len(distances) >= max_nodes:
                truncated = True
                break
            distances[edge.neighbor_id] = distance + 1
            queue.append(edge.neighbor_id)
        if truncated:
            break

    node_ids = set(distances)
    edge_rows = []
    seen_edges: set[str] = set()
    for node_id in sorted(node_ids):
        for edge in adjacency.get(node_id, []):
            if edge.edge_id in seen_edges:
                continue
            if edge.from_id in node_ids and edge.to_id in node_ids:
                seen_edges.add(edge.edge_id)
                edge_rows.append(
                    {
                        "id": edge.edge_id,
                        "from_id": edge.from_id,
                        "to_id": edge.to_id,
                        "type": edge.type,
                        "confidence": round(edge.confidence, 3),
                    }
                )
                if len(edge_rows) >= max_edges:
                    truncated = True
                    break
        if len(edge_rows) >= max_edges:
            break
    edge_rows.sort(key=lambda row: (row["type"], row["from_id"], row["to_id"], row["id"]))
    return {
        "start_node_id": start_node_id,
        "max_depth": max_depth,
        "max_nodes": max_nodes,
        "truncated": truncated,
        "distances": distances,
        "edges": edge_rows,
    }


def load_node_metadata(build_dir: Path, needed_node_ids: set[str]) -> dict[str, dict[str, Any]]:
    rows: dict[str, dict[str, Any]] = {}
    with (build_dir / "nodes.jsonl").open(encoding="utf-8") as handle:
        for line in handle:
            if not line.strip():
                continue
            row = json.loads(line)
            node_id = str(row["id"])
            if node_id in needed_node_ids:
                rows[node_id] = {
                    "id": node_id,
                    "lang": row.get("lang"),
                    "lang_code": row.get("lang_code"),
                    "word": row.get("word"),
                    "pos": row.get("pos"),
                    "glosses": (row.get("glosses") or [])[:2],
                }
    for node_id in needed_node_ids:
        rows.setdefault(node_id, fallback_node(node_id))
    return rows


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


def edge_type_priority(edge_type: str) -> int:
    priorities = {
        "inherited_from": 0,
        "descended_from": 0,
        "borrowed_from": 1,
        "learned_borrowing_from": 1,
        "semi_learned_borrowing_from": 2,
        "adapted_borrowing_from": 2,
        "unadapted_borrowing_from": 2,
        "derived_from": 3,
        "cognate_with": 4,
        "composed_of": 5,
        "unknown_etymology_relation": 6,
    }
    return priorities.get(edge_type, 9)
