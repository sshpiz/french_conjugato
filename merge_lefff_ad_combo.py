#!/usr/bin/env python3
"""
Merge narrow LEFFF-derived a/de/combo rows into verb_core_patterns.json.

This is intentionally conservative:
- only merges rows already extracted into the ad-combo preview JSON
- skips any pattern already present for the verb
- prefers small structural notes sourced from the LEFFF example
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

from core_patterns_lib import (
    INPUT_FILE,
    normalize_entries,
    write_core_patterns_js,
    write_json,
    write_review,
)

DEFAULT_INPUT = Path("/Users/simeon/Desktop/proj1/_experiments/lefff_ad_combo_top100.json")

GLOSS_OVERRIDES = {
    "décider de qqn / qqch": "decide about; decide on",
    "envoyer qqch à qqn": "send something to someone",
    "garder de qqn / qqch": "protect from; keep from",
    "montrer qqch à qqn": "show something to someone",
    "payer qqch à qqn": "pay something to or for someone",
    "payer de qqn / qqch": "pay with; pay by losing",
    "s'intéresser à qqn / qqch": "be interested in; take an interest in",
    "s'occuper de qqn / qqch": "take care of; deal with",
    "sauver de qqn / qqch": "save from",
    "se passer de qqn / qqch": "do without",
    "se plaindre de qqn / qqch": "complain about",
    "se souvenir de qqn / qqch": "remember someone / something",
}

REASON_TO_PATTERN_TYPE = {
    "combo-a": "combo-a",
    "combo-de": "combo-de",
    "a-object": "a-object",
    "de-object": "de-object",
}


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Merge LEFFF a/de/combo rows into verb_core_patterns.json")
    parser.add_argument("--input", default=str(DEFAULT_INPUT), help="Path to LEFFF ad-combo JSON preview")
    parser.add_argument("--dry-run", action="store_true", help="Show what would be merged without writing files")
    return parser


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def build_pattern_entry(candidate: dict) -> dict:
    pattern = candidate["pattern"]
    pattern_type = REASON_TO_PATTERN_TYPE.get(candidate.get("reason", ""), "")
    entry = {
        "pattern": pattern,
        "meaning_en": GLOSS_OVERRIDES.get(pattern, "structural a/de/combo pattern"),
        "pattern_type": pattern_type,
        "source": "lefff:ad-combo",
        "status": "candidate",
        "confidence": 0.93,
    }
    example = (candidate.get("example_fr") or "").strip()
    if example:
        entry["notes"] = f"LEFFF example: {example}"
    return entry


def merge_entries(existing_entries: list[dict], lefff_preview: list[dict]) -> tuple[list[dict], list[str]]:
    by_verb = {entry["verb"]: entry for entry in existing_entries}
    merged_labels: list[str] = []

    for preview_entry in lefff_preview:
        verb = preview_entry.get("verb", "").strip()
        candidates = preview_entry.get("candidates", []) or []
        if not verb or not candidates:
            continue

        current = by_verb.setdefault(verb, {"verb": verb, "core_patterns": []})
        existing_patterns = {item.get("pattern", "").strip().lower() for item in current.get("core_patterns", [])}
        existing_types = {item.get("pattern_type", "").strip() for item in current.get("core_patterns", [])}

        for candidate in candidates:
            pattern = candidate.get("pattern", "").strip()
            pattern_type = REASON_TO_PATTERN_TYPE.get(candidate.get("reason", ""), "")
            if not pattern or pattern.lower() in existing_patterns:
                continue
            if pattern_type and pattern_type in existing_types:
                continue
            current["core_patterns"].append(build_pattern_entry(candidate))
            existing_patterns.add(pattern.lower())
            if pattern_type:
                existing_types.add(pattern_type)
            merged_labels.append(f"{verb}: {pattern}")

    merged_entries = sorted(by_verb.values(), key=lambda item: item["verb"])
    return normalize_entries(merged_entries), merged_labels


def main() -> None:
    args = build_parser().parse_args()
    input_path = Path(args.input).expanduser().resolve()
    existing_entries = load_json(INPUT_FILE)
    lefff_preview = load_json(input_path)

    merged_entries, merged_labels = merge_entries(existing_entries, lefff_preview)

    if not merged_labels:
        print("No new LEFFF a/de/combo rows to merge.")
        return

    print(f"Prepared {len(merged_labels)} merged rows:")
    for label in merged_labels:
        print(f"  - {label}")

    if args.dry_run:
        return

    write_json(INPUT_FILE, merged_entries)
    write_core_patterns_js(merged_entries)
    write_review(merged_entries)
    print(f"Wrote {INPUT_FILE}")


if __name__ == "__main__":
    main()
