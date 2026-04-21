#!/usr/bin/env python3
"""
Merge conservative usage-backed a/de/combo rows into verb_core_patterns.json.

This script uses the existing learner-facing usage nugget patterns as evidence,
so it can fill holes that LEFFF misses while staying anchored in already-shipped
French usage labels.
"""

from __future__ import annotations

import argparse
from pathlib import Path

from core_patterns_lib import (
    INPUT_FILE,
    load_core_patterns_from_json,
    load_usage_index,
    load_verbs,
    normalize_entries,
    write_core_patterns_js,
    write_json,
    write_review,
)

ROLLOUT_TIERS = {"top20", "top50", "top100", "top500", "top1000"}
LOCATION_MARKERS = ("location", "place", "lieu", "table", "côté", "sport/jeu", "authority/person")
ALLOWED_USAGE_PATTERNS = {
    "accuser|combo-de|accuser qqch de qqn",
    "affirmer|a-object|affirmer à qqn / qqch",
    "accorder|a-object|accorder à qqn / qqch",
    "accéder|a-object|accéder à qqn / qqch",
    "acheter|a-object|acheter à qqn / qqch",
    "adresser|a-object|adresser à qqn / qqch",
    "arracher|a-object|arracher à qqn / qqch",
    "assister|a-object|assister à qqn / qqch",
    "cacher|a-object|cacher à qqn / qqch",
    "commander|a-object|commander à qqn / qqch",
    "communiquer|a-object|communiquer à qqn / qqch",
    "comparer|a-object|comparer à qqn / qqch",
    "convenir|a-object|convenir à qqn / qqch",
    "demander|a-object|demander à qqn / qqch",
    "décrire|combo-a|décrire qqch à qqn",
    "dire|a-object|dire à qqn / qqch",
    "enlever|a-object|enlever à qqn / qqch",
    "être|a-object|être à qqn / qqch",
    "fournir|a-object|fournir à qqn / qqch",
    "informer|combo-de|informer qqch de qqn",
    "importer|a-object|importer à qqn / qqch",
    "imposer|a-object|imposer à qqn / qqch",
    "indiquer|a-object|indiquer à qqn / qqch",
    "mentir|a-object|mentir à qqn / qqch",
    "plaire|a-object|plaire à qqn / qqch",
    "présenter|a-object|présenter à qqn / qqch",
    "prendre|a-object|prendre à qqn / qqch",
    "préciser|a-object|préciser à qqn / qqch",
    "qualifier|combo-de|qualifier qqch de qqn",
    "reparler|a-object|reparler à qqn / qqch",
    "remettre|a-object|remettre à qqn / qqch",
    "réagir|a-object|réagir à qqn / qqch",
    "répondre|a-object|répondre à qqn / qqch",
    "réserver|a-object|réserver à qqn / qqch",
    "se plaindre|a-object|se plaindre à qqn / qqch",
    "se tromper|de-object|se tromper de qqn / qqch",
    "sembler|a-object|sembler à qqn / qqch",
    "servir|de-object|servir de qqn / qqch",
    "signifier|a-object|signifier à qqn / qqch",
    "souffler|a-object|souffler à qqn / qqch",
    "sourire|a-object|sourire à qqn / qqch",
    "téléphoner|a-object|téléphoner à qqn / qqch",
    "verser|a-object|verser à qqn / qqch",
}
GLOSS_OVERRIDES = {
    "accuser qqn de qqch": "accuse someone of something",
    "affirmer à qqn": "state to someone",
    "arracher à qqn": "take away from someone",
    "décrire qqch à qqn": "describe something to someone",
    "être à qqn": "belong to someone",
    "imposer à qqn": "impose on someone",
    "indiquer à qqn": "tell; indicate to someone",
    "informer qqn de qqch": "inform someone about something",
    "prendre à qqn": "take from someone",
    "préciser à qqn": "specify to someone",
    "qualifier qqn / qqch de + nom": "describe; label as",
    "se tromper de qqn / qqch": "be mistaken about; get wrong",
    "souffler à qqn": "suggest to someone",
    "verser à qqn": "pay to someone",
}
PATTERN_OVERRIDES = {
    "accuser|combo-de|accuser qqch de qqn": "accuser qqn de qqch",
    "affirmer|a-object|affirmer à qqn / qqch": "affirmer à qqn",
    "arracher|a-object|arracher à qqn / qqch": "arracher à qqn",
    "décrire|combo-a|décrire qqch à qqn": "décrire qqch à qqn",
    "être|a-object|être à qqn / qqch": "être à qqn",
    "imposer|a-object|imposer à qqn / qqch": "imposer à qqn",
    "indiquer|a-object|indiquer à qqn / qqch": "indiquer à qqn",
    "informer|combo-de|informer qqch de qqn": "informer qqn de qqch",
    "prendre|a-object|prendre à qqn / qqch": "prendre à qqn",
    "préciser|a-object|préciser à qqn / qqch": "préciser à qqn",
    "qualifier|combo-de|qualifier qqch de qqn": "qualifier qqn / qqch de + nom",
    "souffler|a-object|souffler à qqn / qqch": "souffler à qqn",
    "verser|a-object|verser à qqn / qqch": "verser à qqn",
}


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Merge usage-backed a/de/combo rows into verb_core_patterns.json")
    parser.add_argument("--dry-run", action="store_true", help="Show what would be merged without writing files")
    return parser


def infer_candidate_from_usage(verb: str, usage_pattern: str) -> tuple[str, str] | None:
    pattern = str(usage_pattern or "").strip().lower()
    if not pattern:
        return None
    if "infinitive" in pattern or "infinitif" in pattern:
        return None

    if "+ object + à + person" in pattern or "+ cod + à + nom" in pattern:
        return (f"{verb} qqch à qqn", "combo-a")
    if "+ object + à + person/thing" in pattern:
        return (f"{verb} qqch à qqn", "combo-a")

    if "+ quelqu’un + de +" in pattern or "[quelqu’un] de [quelque chose]" in pattern:
        return (f"{verb} qqch de qqn", "combo-de")
    if "+ object + de +" in pattern or "+ cod + de +" in pattern:
        return (f"{verb} qqch de qqn", "combo-de")
    if "+ de + object" in pattern or "+ de + noun" in pattern:
        return (f"{verb} de qqn / qqch", "de-object")

    if "+ à + person" in pattern or "+ à + object" in pattern or "+ à + noun" in pattern:
        if any(marker in pattern for marker in LOCATION_MARKERS):
            return None
        return (f"{verb} à qqn / qqch", "a-object")

    return None


def build_pattern_entry(candidate_pattern: str, pattern_type: str, usage_entry: dict) -> dict:
    override_key = f"{usage_entry.get('verb', '')}|{pattern_type}|{candidate_pattern}"
    final_pattern = PATTERN_OVERRIDES.get(override_key, candidate_pattern)
    return {
        "pattern": final_pattern,
        "meaning_en": GLOSS_OVERRIDES.get(
            final_pattern,
            str(usage_entry.get("meaning_en", "")).strip() or "usage-backed structural pattern",
        ),
        "pattern_type": pattern_type,
        "notes": f"Usage-backed: {usage_entry.get('pattern', '').strip()}",
        "source": "usage:ad-combo",
        "status": "candidate",
        "confidence": 0.94,
    }


def merge_entries(existing_entries: list[dict]) -> tuple[list[dict], list[str]]:
    by_verb = {entry["verb"]: entry for entry in existing_entries}
    usage_index = load_usage_index()
    rollout_verbs = {verb["infinitive"] for verb in load_verbs(ROLLOUT_TIERS)}
    merged_labels: list[str] = []

    for verb in sorted(rollout_verbs):
        usage_entries = usage_index.get(verb, [])
        if not usage_entries:
            continue

        current = by_verb.setdefault(verb, {"verb": verb, "core_patterns": []})
        existing_patterns = {item.get("pattern", "").strip().lower() for item in current.get("core_patterns", [])}
        existing_types = {item.get("pattern_type", "").strip() for item in current.get("core_patterns", [])}

        chosen_by_type: dict[str, dict] = {}
        for usage_entry in usage_entries:
            inferred = infer_candidate_from_usage(verb, usage_entry.get("pattern", ""))
            if not inferred:
                continue
            candidate_pattern, pattern_type = inferred
            allow_key = f"{verb}|{pattern_type}|{candidate_pattern}"
            if allow_key not in ALLOWED_USAGE_PATTERNS:
                continue
            if pattern_type in existing_types or candidate_pattern.lower() in existing_patterns:
                continue
            usage_entry = dict(usage_entry)
            usage_entry["verb"] = verb
            pattern_entry = build_pattern_entry(candidate_pattern, pattern_type, usage_entry)
            if pattern_entry["pattern"].lower() in existing_patterns:
                continue
            chosen_by_type.setdefault(pattern_type, pattern_entry)

        for pattern_type, pattern_entry in chosen_by_type.items():
            current["core_patterns"].append(pattern_entry)
            existing_types.add(pattern_type)
            existing_patterns.add(pattern_entry["pattern"].lower())
            merged_labels.append(f"{verb}: {pattern_entry['pattern']}")

    merged_entries = sorted(by_verb.values(), key=lambda item: item["verb"])
    return normalize_entries(merged_entries), merged_labels


def main() -> None:
    args = build_parser().parse_args()
    existing_entries = load_core_patterns_from_json()
    merged_entries, merged_labels = merge_entries(existing_entries)

    if not merged_labels:
        print("No new usage-backed a/de/combo rows to merge.")
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
