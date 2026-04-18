#!/usr/bin/env python3
"""
Shared helpers for French core-pattern data.
"""

from __future__ import annotations

import json
import re
import sys
import unicodedata
from pathlib import Path

ROOT = Path(__file__).parent
VERBS_JS = ROOT / "js" / "verbs.full.js"
USAGES_JS = ROOT / "verb_usages.js"
INPUT_FILE = ROOT / "verb_core_patterns.json"
JS_FILE = ROOT / "verb_core_patterns.js"
REVIEW_FILE = ROOT / "verb_core_patterns_review.md"

VAGUE_MEANING_PATTERNS = (
    re.compile(r"\bsomeone / something adjective\b", re.IGNORECASE),
    re.compile(r"\bthing\b", re.IGNORECASE),
    re.compile(r"\ba cause / for someone\b", re.IGNORECASE),
)

ENGLISH_PLACEHOLDER_PATTERN = re.compile(r"\b(person|object|thing|somebody|something)\b", re.IGNORECASE)
MEANING_WORD_RE = re.compile(r"[A-Za-z]+(?:'[A-Za-z]+)?")
PATTERN_PLACEHOLDER_RE = re.compile(r"^(V\b|se V\b|il V\b)")
KNOWN_PATTERN_TYPES = {
    "combo-a",
    "combo-de",
    "si-clause",
    "que-clause",
    "bare-infinitive",
    "a-infinitive",
    "de-infinitive",
    "a-object",
    "de-object",
    "impersonal",
    "reflexive-avec",
    "reflexive-a",
    "reflexive-de",
    "reflexive-si",
    "reflexive-que",
    "reflexive",
    "object-predicate",
    "direct-object",
    "locative",
    "avec",
    "intransitive",
}


def slugify(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", str(value or ""))
    ascii_value = normalized.encode("ascii", "ignore").decode("ascii")
    return re.sub(r"[^a-z0-9]+", "_", ascii_value.lower()).strip("_")


def extract_js_literal(path: Path, prefix: str):
    if not path.exists():
        sys.exit(f"Missing file: {path}")
    text = path.read_text(encoding="utf-8")
    pattern = re.compile(re.escape(prefix) + r"\s*(\[[\s\S]*?\]);", re.MULTILINE)
    match = pattern.search(text)
    if not match:
        sys.exit(f"Could not parse JS literal from {path}")
    return json.loads(match.group(1))


def load_verbs(tiers: set[str] | None = None) -> list[dict]:
    verbs = extract_js_literal(VERBS_JS, "const verbs =")
    if not tiers:
        return verbs
    return [verb for verb in verbs if verb.get("frequency") in tiers]


def load_usage_index() -> dict[str, list[dict]]:
    entries = extract_js_literal(USAGES_JS, "window.verbUsages =")
    index: dict[str, list[dict]] = {}
    for entry in entries:
        verb = str(entry.get("verb", "")).strip()
        if not verb:
            continue
        index.setdefault(verb, []).append(entry)
    return index


def load_core_patterns_from_json() -> list[dict]:
    if not INPUT_FILE.exists():
        sys.exit(f"No {INPUT_FILE.name} found.")
    data = json.loads(INPUT_FILE.read_text(encoding="utf-8"))
    if not isinstance(data, list):
        sys.exit(f"Expected a JSON array in {INPUT_FILE.name}.")
    return data


def load_core_patterns_from_js() -> list[dict]:
    return extract_js_literal(JS_FILE, "window.verbCorePatterns =")


def load_core_patterns_prefer_json() -> list[dict]:
    if INPUT_FILE.exists():
        return load_core_patterns_from_json()
    if JS_FILE.exists():
        return load_core_patterns_from_js()
    sys.exit(f"No {INPUT_FILE.name} or {JS_FILE.name} found.")


def normalize_pattern_text(value: str) -> str:
    text = str(value or "").strip()
    replacements = {
        "quelqu’un": "qqn",
        "quelqu'un": "qqn",
        "quelque chose": "qqch",
        "[quelqu’un]": "qqn",
        "[quelqu'un]": "qqn",
        "[quelque chose]": "qqch",
        "subjonctif": "subj.",
        "infinitive": "infinitif",
    }
    for old, new in replacements.items():
        text = text.replace(old, new)
    text = re.sub(r"\s*/\s*", " / ", text)
    text = re.sub(r"\s*\+\s*", " + ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip(" -")


def normalize_meaning_text(value: str) -> str:
    text = str(value or "").strip()
    text = re.sub(r"\s+", " ", text)
    return text.strip(" .;")


def infer_pattern_type(pattern: str) -> str:
    text = normalize_pattern_text(pattern).lower()
    if not text:
        return ""
    if " qqch à qqn" in text:
        return "combo-a"
    if " qqch de qqn" in text:
        return "combo-de"
    if " si + proposition" in text:
        return "si-clause"
    if " que + proposition" in text or " que + subj." in text:
        return "que-clause"
    if " + infinitif" in text:
        return "bare-infinitive"
    if " à + infinitif" in text:
        return "a-infinitive"
    if " de + infinitif" in text:
        return "de-infinitive"
    if " à qqn / qqch" in text or " à qqch" in text or " à qqn" in text:
        return "a-object"
    if " de qqn / qqch" in text or " de qqch" in text or " de qqn" in text:
        return "de-object"
    if text.startswith("il "):
        return "impersonal"
    if text.startswith("se ") or text.startswith("s'"):
        if " avec " in text:
            return "reflexive-avec"
        if " à qqn / qqch" in text or " à qqch" in text or " à qqn" in text:
            return "reflexive-a"
        if " de qqn / qqch" in text or " de qqch" in text or " de qqn" in text:
            return "reflexive-de"
        if " si + proposition" in text:
            return "reflexive-si"
        if " que + " in text:
            return "reflexive-que"
        return "reflexive"
    if " qqn / qqch + adjectif" in text:
        return "object-predicate"
    if " qqn / qqch" in text:
        return "direct-object"
    if " qqch" in text:
        return "direct-object"
    if " qqn" in text:
        return "direct-object"
    if " à + lieu" in text or " chez + qqn" in text:
        return "locative"
    if " avec " in text:
        return "avec"
    return "intransitive"


def pattern_priority(pattern: str) -> int:
    pattern_type = infer_pattern_type(pattern)
    priorities = {
        "combo-a": 100,
        "combo-de": 96,
        "a-object": 94,
        "de-object": 92,
        "a-infinitive": 91,
        "de-infinitive": 90,
        "si-clause": 89,
        "que-clause": 88,
        "bare-infinitive": 87,
        "direct-object": 86,
        "object-predicate": 80,
        "reflexive-a": 78,
        "reflexive-de": 77,
        "reflexive-si": 76,
        "reflexive-que": 76,
        "reflexive": 74,
        "impersonal": 72,
        "intransitive": 68,
        "locative": 62,
        "avec": 60,
        "reflexive-avec": 58,
    }
    return priorities.get(pattern_type, 50)


def normalize_entries(entries: list[dict]) -> list[dict]:
    normalized: list[dict] = []
    seen_verbs: set[str] = set()

    for entry in entries:
        verb = str(entry.get("verb", "")).strip()
        if not verb:
            continue
        if verb in seen_verbs:
            continue
        seen_verbs.add(verb)

        patterns = []
        seen_pairs: set[tuple[str, str]] = set()
        for pattern_entry in entry.get("core_patterns", []) or []:
            pattern = normalize_pattern_text(pattern_entry.get("pattern", ""))
            meaning_en = normalize_meaning_text(pattern_entry.get("meaning_en", ""))
            if not pattern or not meaning_en:
                continue

            pair = (pattern.lower(), meaning_en.lower())
            if pair in seen_pairs:
                continue
            seen_pairs.add(pair)

            clean = {
                "pattern": pattern,
                "meaning_en": meaning_en,
            }
            for key in ("pattern_id", "pattern_type", "notes", "confidence", "source", "status"):
                value = pattern_entry.get(key)
                if value not in ("", None, []):
                    clean[key] = value
            if clean.get("pattern_type") not in KNOWN_PATTERN_TYPES:
                clean["pattern_type"] = infer_pattern_type(pattern)
            patterns.append(clean)

        if not patterns:
            continue

        normalized.append(
            {
                "verb": verb,
                "core_patterns": patterns,
            }
        )

    return assign_pattern_ids(normalized)


def assign_pattern_ids(entries: list[dict]) -> list[dict]:
    for entry in entries:
        verb_slug = slugify(entry.get("verb", "verb"))
        for index, pattern_entry in enumerate(entry.get("core_patterns", []) or [], start=1):
            pattern_entry["pattern_id"] = f"{verb_slug}_cp{index:02d}"
    return entries


def write_json(path: Path, data) -> None:
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def dump_core_patterns_js(entries: list[dict]) -> str:
    return "window.verbCorePatterns = " + json.dumps(entries, ensure_ascii=False, indent=2) + ";\n"


def write_core_patterns_js(entries: list[dict]) -> None:
    JS_FILE.write_text(dump_core_patterns_js(entries), encoding="utf-8")


def flatten_pattern_items(entries: list[dict]) -> list[dict]:
    items: list[dict] = []
    for entry in entries:
        verb = entry.get("verb", "")
        for pattern_entry in entry.get("core_patterns", []) or []:
            items.append(
                {
                    "verb": verb,
                    "pattern_id": pattern_entry.get("pattern_id", ""),
                    "pattern": pattern_entry.get("pattern", ""),
                    "meaning_en": pattern_entry.get("meaning_en", ""),
                    "pattern_type": pattern_entry.get("pattern_type", ""),
                    "notes": pattern_entry.get("notes", ""),
                    "confidence": pattern_entry.get("confidence", ""),
                    "source": pattern_entry.get("source", ""),
                    "status": pattern_entry.get("status", ""),
                }
            )
    return items


def render_review_markdown(entries: list[dict]) -> str:
    lines = [
        "# Core Patterns Review",
        "",
        f"*{sum(len(entry.get('core_patterns', [])) for entry in entries)} patterns across {len(entries)} verbs*",
        "",
        "---",
        "",
    ]

    for entry in entries:
        verb = entry["verb"]
        patterns = entry.get("core_patterns", [])
        lines.append(f"## {verb} ({len(patterns)} patterns)")
        lines.append("")
        for pattern_entry in patterns:
            meta_parts = [pattern_entry.get("pattern_id", "")]
            if pattern_entry.get("pattern_type"):
                meta_parts.append(pattern_entry["pattern_type"])
            if pattern_entry.get("status"):
                meta_parts.append(pattern_entry["status"])
            if pattern_entry.get("source"):
                meta_parts.append(pattern_entry["source"])
            meta = " | ".join(part for part in meta_parts if part)
            lines.append(f"### {meta}")
            lines.append(f"- `{pattern_entry.get('pattern', '')}`")
            lines.append(f"- {pattern_entry.get('meaning_en', '')}")
            if pattern_entry.get("notes"):
                lines.append(f"- note: {pattern_entry['notes']}")
            lines.append("")
    return "\n".join(lines).strip() + "\n"


def write_review(entries: list[dict]) -> None:
    REVIEW_FILE.write_text(render_review_markdown(entries), encoding="utf-8")


def is_pattern_shape_suspicious(verb: str, pattern: str) -> bool:
    pattern_lower = pattern.lower()
    verb_lower = verb.lower()
    if verb_lower == "avoir" and pattern_lower.startswith("il y a"):
        return False
    if verb_lower == "faire" and pattern_lower.startswith("il fait"):
        return False
    if verb_lower == "agir" and pattern_lower.startswith("il s'agit"):
        return False
    if verb_lower == "falloir":
        return not pattern_lower.startswith("il faut")
    if pattern_lower.startswith(verb_lower):
        return False
    if pattern_lower.startswith(f"se {verb_lower}") or pattern_lower.startswith(f"s'{verb_lower}"):
        return False
    return True


def collect_quality_issues(entries: list[dict]) -> list[str]:
    issues: list[str] = []
    seen_pattern_ids: dict[str, str] = {}

    for entry in entries:
        verb = entry.get("verb", "")
        patterns = entry.get("core_patterns", []) or []
        if len(patterns) > 6:
            issues.append(f"TOO-MANY  {verb}: {len(patterns)} core patterns")

        seen_patterns: set[str] = set()
        for pattern_entry in patterns:
            pattern_id = pattern_entry.get("pattern_id", "")
            pattern = pattern_entry.get("pattern", "")
            meaning_en = pattern_entry.get("meaning_en", "")
            pattern_key = pattern.lower()

            if pattern_key in seen_patterns:
                issues.append(f"DUP-PATTERN  {verb}: {pattern}")
            seen_patterns.add(pattern_key)

            if pattern_id in seen_pattern_ids:
                issues.append(f"DUP-ID  {pattern_id}: {verb} and {seen_pattern_ids[pattern_id]}")
            elif pattern_id:
                seen_pattern_ids[pattern_id] = verb

            if is_pattern_shape_suspicious(verb, pattern):
                issues.append(f"SUSPICIOUS-PATTERN  {pattern_id or verb}: {pattern}")

            if ENGLISH_PLACEHOLDER_PATTERN.search(pattern):
                issues.append(f"ENGLISH-PLACEHOLDER  {pattern_id or verb}: {pattern}")

            if PATTERN_PLACEHOLDER_RE.search(pattern):
                issues.append(f"PATTERN-PLACEHOLDER  {pattern_id or verb}: {pattern}")

            for regex in VAGUE_MEANING_PATTERNS:
                if regex.search(meaning_en):
                    issues.append(f"VAGUE-GLOSS  {pattern_id or verb}: {meaning_en}")
                    break

            meaning_words = MEANING_WORD_RE.findall(meaning_en)
            if len(meaning_words) > 8:
                issues.append(f"LONG-GLOSS  {pattern_id or verb}: {meaning_en}")

    return issues
