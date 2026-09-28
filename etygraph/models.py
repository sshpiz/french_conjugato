from __future__ import annotations

from dataclasses import asdict, dataclass, field
from typing import Any


@dataclass(frozen=True)
class Node:
    id: str
    lang: str | None
    lang_code: str
    word: str
    normalized_word: str
    pos: str | None
    etymology_number: int | str | None
    glosses: list[str]
    source: str

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> "Node":
        return cls(
            id=str(data["id"]),
            lang=data.get("lang"),
            lang_code=str(data["lang_code"]),
            word=str(data["word"]),
            normalized_word=str(data.get("normalized_word") or data["word"]),
            pos=data.get("pos"),
            etymology_number=data.get("etymology_number"),
            glosses=list(data.get("glosses") or []),
            source=str(data.get("source") or ""),
        )


@dataclass(frozen=True)
class Edge:
    id: str
    from_id: str
    to_id: str
    type: str
    source_template: str | None
    confidence: float
    raw: dict[str, Any] | None = None

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> "Edge":
        return cls(
            id=str(data["id"]),
            from_id=str(data["from_id"]),
            to_id=str(data["to_id"]),
            type=str(data["type"]),
            source_template=data.get("source_template"),
            confidence=float(data.get("confidence", 0.5)),
            raw=data.get("raw"),
        )


@dataclass
class AncestorHit:
    node_id: str
    distance: int
    path_edges: list[Edge]
    confidence_product: float
    relation_types: list[str]


@dataclass
class DescendantHit:
    node_id: str
    distance: int
    path_edges: list[Edge]
    confidence_product: float
    relation_types: list[str]


@dataclass
class EnglishRelatedCandidate:
    word: str
    node_id: str
    pos: str | None
    glosses: list[str]
    relation_label: str
    via: str
    ancestor_node_id: str
    ancestor_word: str
    ancestor_lang_code: str
    ancestor_lang: str | None
    score: float
    confidence: float
    path_summary: str
    relation_types: list[str]
    warnings: list[str] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        data = asdict(self)
        data["score"] = round(float(self.score), 2)
        data["confidence"] = round(float(self.confidence), 3)
        return data


@dataclass
class FrenchRelatedOutput:
    fr_word: str
    fr_node_id: str
    pos: str | None
    glosses: list[str]
    english_related: list[EnglishRelatedCandidate]
    notes: list[str] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        return {
            "fr_word": self.fr_word,
            "fr_node_id": self.fr_node_id,
            "pos": self.pos,
            "glosses": self.glosses,
            "english_related": [candidate.to_dict() for candidate in self.english_related],
            "notes": self.notes,
        }


@dataclass(frozen=True)
class ParsedNodeId:
    lang_code: str
    normalized_word: str
    pos: str
    etymology_number: str


@dataclass
class IngestStats:
    input_path: str
    entries_total: int = 0
    entries_kept: int = 0
    nodes_written: int = 0
    edges_written: int = 0
    malformed_json_lines: int = 0
    skipped_language_entries: int = 0
    templates_seen: dict[str, int] = field(default_factory=dict)
    templates_skipped: dict[str, int] = field(default_factory=dict)
    descendant_records_seen: int = 0
    descendant_records_skipped: int = 0
    dangling_edges: int = 0
    placeholder_nodes_written: int = 0

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)
