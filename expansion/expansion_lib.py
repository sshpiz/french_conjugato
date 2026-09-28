#!/usr/bin/env python3
"""
Shared helpers for the *expansion-layer* workflow.

Design goals:
- repo-native runtime/output stays untouched unless explicitly requested
- expansion artifacts use a normalized, reviewable JSON shape
- merge helpers can convert normalized candidates back into repo-native seeds
"""

from __future__ import annotations

import json
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Literal

from pydantic import BaseModel, Field


SCHEMA_VERSION_VERB_CANDIDATES = 1


def utc_stamp() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def load_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


_VERBS_ARRAY_RE = re.compile(r"(const verbs\s*=\s*)(\[[\s\S]*?\])\s*;", re.M)


def load_verbs_js(path: Path) -> tuple[list[dict], str]:
    text = path.read_text(encoding="utf-8")
    match = _VERBS_ARRAY_RE.search(text)
    if not match:
        raise RuntimeError(f"Could not parse `const verbs = [...]` from {path}")
    verbs = json.loads(match.group(2))
    if not isinstance(verbs, list):
        raise RuntimeError(f"Unexpected verbs shape in {path}: {type(verbs)!r}")
    return verbs, text


def unique_lemmas_from_verbs(verbs: list[dict]) -> list[str]:
    seen: set[str] = set()
    ordered: list[str] = []
    for item in verbs:
        lemma = str(item.get("infinitive", "")).strip()
        if not lemma or lemma in seen:
            continue
        ordered.append(lemma)
        seen.add(lemma)
    return ordered


def normalize_style_tags(tags: list[str] | None) -> list[str]:
    if not tags:
        return []
    out: list[str] = []
    seen = set()
    for raw in tags:
        value = str(raw or "").strip().lower().replace(" ", "_")
        if not value or value in seen:
            continue
        out.append(value)
        seen.add(value)
    return out


class CandidateSource(BaseModel):
    type: Literal["openai", "manual", "deterministic", "import"] = "openai"
    details: str | None = None
    url: str | None = None


class VerbExpansionCandidate(BaseModel):
    infinitive: str = Field(description="Verb lemma/infinitive (repo-native spelling).")
    translation: str = Field(default="", description="Short learner-facing English gloss.")
    priority: Literal["core", "stretch"] = Field(
        default="core",
        description="core = high-value learner verb; stretch = nice-to-have / lower priority.",
    )
    frequency: str | None = Field(
        default=None,
        description="Repo-native frequency bucket, e.g. top20/top50/top100/top500/top1000/top2000/rare.",
    )
    usage_register: str | None = Field(
        default=None,
        description="Learner-facing usage ladder (everyday/common/uncommon/niche/rare_usable/archaic/obsolete).",
    )
    style_tags: list[str] = Field(default_factory=list, description="e.g. colloquial, slang, vulgar, formal, regional.")
    categories: list[str] = Field(default_factory=list, description="Optional thematic categories for later curation.")
    notes: str | None = None
    source: CandidateSource | None = None
    confidence: float | None = Field(default=None, ge=0.0, le=1.0)
    language_meta: dict[str, Any] = Field(default_factory=dict, description="Language-specific fields (optional).")

    def normalized(self) -> "VerbExpansionCandidate":
        updated = self.model_copy(deep=True)
        updated.infinitive = str(updated.infinitive or "").strip()
        updated.translation = str(updated.translation or "").strip()
        updated.style_tags = normalize_style_tags(updated.style_tags)
        updated.categories = [str(x).strip() for x in (updated.categories or []) if str(x).strip()]
        return updated


class VerbExpansionCandidatesFile(BaseModel):
    schema_version: int = SCHEMA_VERSION_VERB_CANDIDATES
    language: str
    generated_at: str = Field(default_factory=utc_stamp)
    target_min_lemmas: int = 2000
    existing_lemmas: int = 0
    notes: str = ""
    candidates: list[VerbExpansionCandidate] = Field(default_factory=list)

    def normalized(self) -> "VerbExpansionCandidatesFile":
        updated = self.model_copy(deep=True)
        updated.candidates = [c.normalized() for c in updated.candidates]
        # Drop empty infinitives early.
        updated.candidates = [c for c in updated.candidates if c.infinitive]
        return updated


def load_candidates_file(path: Path, *, language: str | None = None) -> VerbExpansionCandidatesFile:
    payload = load_json(path)
    model = VerbExpansionCandidatesFile.model_validate(payload).normalized()
    if language and model.language != language:
        raise ValueError(f"Language mismatch in {path}: {model.language!r} != {language!r}")
    return model


def write_candidates_file(path: Path, model: VerbExpansionCandidatesFile) -> None:
    write_json(path, model.normalized().model_dump(mode="json"))

