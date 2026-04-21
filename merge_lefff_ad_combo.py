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
    load_usage_index,
    normalize_entries,
    write_core_patterns_js,
    write_json,
    write_review,
)

DEFAULT_INPUT = Path("/Users/simeon/Desktop/proj1/_experiments/lefff_ad_combo_top100.json")

GLOSS_OVERRIDES = {
    "accorder qqch à qqn": "grant something to someone",
    "adresser qqch à qqn": "address; direct something to someone",
    "apparaître à qqn": "appear to; become apparent to someone",
    "associer qqn / qqch à qqn / qqch": "associate; connect with",
    "attendre de qqn / qqch": "expect from",
    "changer de qqn / qqch": "change; switch from",
    "commander qqch à qqn": "order something from someone",
    "confier qqch à qqn": "entrust something to someone",
    "convenir de qqn / qqch": "agree on; settle",
    "correspondre à qqn / qqch": "correspond to; match",
    "décider de qqn / qqch": "decide about; decide on",
    "découvrir qqch à qqn": "reveal something to someone",
    "dire de qqn / qqch": "say about; think of",
    "discuter de qqn / qqch": "discuss; talk about",
    "dépendre de qqn / qqch": "depend on",
    "disposer de qqn / qqch": "have at one's disposal; have",
    "douter de qqn / qqch": "doubt",
    "exiger de qqn": "demand from someone; require of someone",
    "enseigner qqch à qqn": "teach something to someone",
    "envoyer qqch à qqn": "send something to someone",
    "garder de qqn / qqch": "protect from; keep from",
    "inspirer qqch à qqn": "inspire something in someone",
    "laisser qqch à qqn": "leave something with someone",
    "lancer qqch à qqn": "throw something to someone",
    "livrer qqch à qqn": "deliver something to someone",
    "manquer à qqn / qqch": "be missed by; fail",
    "montrer qqch à qqn": "show something to someone",
    "offrir qqch à qqn": "offer something to someone",
    "opposer qqn / qqch à qqn / qqch": "oppose; set against",
    "pardonner qqch à qqn": "forgive someone for something",
    "payer qqch à qqn": "pay something to or for someone",
    "payer de qqn / qqch": "pay with; pay by losing",
    "préférer qqn / qqch à qqn / qqch": "prefer X to Y",
    "préciser qqch à qqn": "specify something to someone",
    "profiter à qqn / qqch": "benefit; be good for",
    "proposer qqch à qqn": "offer; suggest something to someone",
    "rapporter qqch à qqn": "bring back; report something to someone",
    "raconter qqch à qqn": "tell something to someone",
    "rappeler qqch à qqn": "remind someone of something",
    "reconnaître qqch à qqn": "acknowledge something in someone",
    "reparler de qqn / qqch": "talk again about",
    "recommander qqch à qqn": "recommend something to someone",
    "rembourser qqch à qqn": "pay back; refund something to someone",
    "renoncer à qqn / qqch": "give up; renounce",
    "revenir à qqn / qqch": "amount to; be up to",
    "répondre de qqn / qqch": "answer for; be responsible for",
    "réserver qqch à qqn": "reserve; keep something for someone",
    "refuser qqch à qqn": "refuse; deny something to someone",
    "retourner qqch à qqn": "return something to someone",
    "réfléchir à qqn / qqch": "think about; reflect on",
    "réussir à qqn / qqch": "suit; work well for",
    "rêver à qqn / qqch": "dream about; think of",
    "rêver de qqn / qqch": "dream of",
    "rire de qqn / qqch": "laugh at",
    "répéter qqch à qqn": "repeat something to someone",
    "s'intéresser à qqn / qqch": "be interested in; take an interest in",
    "s'occuper de qqn / qqch": "take care of; deal with",
    "sauver de qqn / qqch": "save from",
    "se passer de qqn / qqch": "do without",
    "se plaindre de qqn / qqch": "complain about",
    "se souvenir de qqn / qqch": "remember someone / something",
    "souffler qqch à qqn": "suggest; whisper something to someone",
    "suffire à qqn / qqch": "be enough for",
    "servir à qqn / qqch": "be useful for; serve to",
    "signifier qqch à qqn": "notify; mean something to someone",
    "sortir de qqn / qqch": "come out of; get out of",
    "tenir à qqn / qqch": "depend on; care about",
    "tenir de qqn / qqch": "come from; take after",
    "tendre qqch à qqn": "hand something to someone",
    "vivre de qqn / qqch": "live on; live off",
    "verser qqch à qqn": "pay; pour something for someone",
    "vendre qqch à qqn": "sell something to someone",
    "voler qqch à qqn": "steal something from someone",
    "prévenir de qqn / qqch": "warn; inform about",
    "priver de qqn / qqch": "deprive of",
    "échapper à qqn / qqch": "escape; elude",
    "confirmer qqch à qqn": "confirm something to someone",
    "défendre qqch à qqn": "forbid something to someone",
}

REASON_TO_PATTERN_TYPE = {
    "combo-a": "combo-a",
    "combo-de": "combo-de",
    "a-object": "a-object",
    "de-object": "de-object",
}

# Survivors from the LEFFF+usage-family gate that still skew too far from the
# learner-facing complement distinction we want to show in-app.
BLOCKED_PATTERNS = {
    "accuser de qqn / qqch",
    "fournir à qqn / qqch",
    "servir de qqn / qqch",
    "traiter de qqn / qqch",
}

# Explicitly promoted LEFFF rows that are common and structurally useful even
# when our current nugget layer does not yet corroborate the same family.
SAFE_LEFFF_BYPASS = {
    "accorder qqch à qqn": {},
    "adresser qqch à qqn": {},
    "apparaître à qqn / qqch": {"pattern": "apparaître à qqn"},
    "associer qqch à qqn": {"pattern": "associer qqn / qqch à qqn / qqch"},
    "attendre de qqn / qqch": {},
    "changer de qqn / qqch": {},
    "commander qqch à qqn": {},
    "confier qqch à qqn": {},
    "convenir de qqn / qqch": {},
    "correspondre à qqn / qqch": {},
    "dire de qqn / qqch": {},
    "discuter de qqn / qqch": {},
    "dépendre de qqn / qqch": {},
    "disposer de qqn / qqch": {},
    "douter de qqn / qqch": {},
    "exiger de qqn / qqch": {"pattern": "exiger de qqn"},
    "enseigner qqch à qqn": {},
    "confirmer qqch à qqn": {},
    "découvrir qqch à qqn": {},
    "défendre qqch à qqn": {},
    "inspirer qqch à qqn": {},
    "laisser qqch à qqn": {},
    "lancer qqch à qqn": {},
    "livrer qqch à qqn": {},
    "manquer à qqn / qqch": {},
    "offrir qqch à qqn": {},
    "opposer qqch à qqn": {"pattern": "opposer qqn / qqch à qqn / qqch"},
    "pardonner qqch à qqn": {},
    "préférer qqch à qqn": {"pattern": "préférer qqn / qqch à qqn / qqch"},
    "préciser qqch à qqn": {},
    "profiter à qqn / qqch": {},
    "proposer qqch à qqn": {},
    "rapporter qqch à qqn": {},
    "raconter qqch à qqn": {},
    "rappeler qqch à qqn": {},
    "reconnaître qqch à qqn": {},
    "reparler de qqn / qqch": {},
    "recommander qqch à qqn": {},
    "rembourser qqch à qqn": {},
    "renoncer à qqn / qqch": {},
    "revenir à qqn / qqch": {},
    "refuser qqch à qqn": {},
    "retourner qqch à qqn": {},
    "réfléchir à qqn / qqch": {},
    "répondre de qqn / qqch": {},
    "répéter qqch à qqn": {},
    "réserver qqch à qqn": {},
    "réussir à qqn / qqch": {},
    "rêver à qqn / qqch": {},
    "rêver de qqn / qqch": {},
    "rire de qqn / qqch": {},
    "souffler qqch à qqn": {},
    "souhaiter qqch à qqn": {},
    "servir à qqn / qqch": {},
    "signifier qqch à qqn": {},
    "sortir de qqn / qqch": {},
    "suffire à qqn / qqch": {},
    "tenir à qqn / qqch": {},
    "tenir de qqn / qqch": {},
    "tendre qqch à qqn": {},
    "vivre de qqn / qqch": {},
    "verser qqch à qqn": {},
    "vendre qqch à qqn": {},
    "voler qqch à qqn": {},
    "prévenir de qqn / qqch": {},
    "priver de qqn / qqch": {},
    "échapper à qqn / qqch": {},
}


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Merge LEFFF a/de/combo rows into verb_core_patterns.json")
    parser.add_argument("--input", default=str(DEFAULT_INPUT), help="Path to LEFFF ad-combo JSON preview")
    parser.add_argument(
        "--no-require-usage-family",
        action="store_true",
        help="Do not require an existing usage nugget with the same a/de/combo family.",
    )
    parser.add_argument("--dry-run", action="store_true", help="Show what would be merged without writing files")
    return parser


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def infer_usage_family(pattern_text: str) -> str:
    pattern = str(pattern_text or "").strip().lower()
    if not pattern:
        return ""
    if "+ object + à +" in pattern:
        return "combo-a"
    if "+ object + de +" in pattern:
        return "combo-de"
    if "+ à +" in pattern and "infinitive" not in pattern:
        return "a-object"
    if "+ de +" in pattern and "infinitive" not in pattern:
        return "de-object"
    return ""


def infer_usage_families(usage_entries: list[dict]) -> set[str]:
    return {family for family in (infer_usage_family(entry.get("pattern", "")) for entry in usage_entries) if family}


def find_usage_gloss(usage_entries: list[dict], family: str) -> str:
    for entry in usage_entries:
        if infer_usage_family(entry.get("pattern", "")) != family:
            continue
        meaning = str(entry.get("meaning_en", "")).strip()
        if meaning:
            return meaning
    return ""


def build_pattern_entry(candidate: dict, usage_gloss: str = "") -> dict:
    pattern = candidate["pattern"]
    override = SAFE_LEFFF_BYPASS.get(pattern, {})
    final_pattern = override.get("pattern", pattern)
    pattern_type = REASON_TO_PATTERN_TYPE.get(candidate.get("reason", ""), "")
    entry = {
        "pattern": final_pattern,
        "meaning_en": GLOSS_OVERRIDES.get(final_pattern, GLOSS_OVERRIDES.get(pattern, usage_gloss or "structural a/de/combo pattern")),
        "pattern_type": pattern_type,
        "source": "lefff:ad-combo",
        "status": "candidate",
        "confidence": 0.93,
    }
    example = (candidate.get("example_fr") or "").strip()
    if example:
        entry["notes"] = f"LEFFF example: {example}"
    return entry


def merge_entries(existing_entries: list[dict], lefff_preview: list[dict], require_usage_family: bool = True) -> tuple[list[dict], list[str], list[str]]:
    by_verb = {entry["verb"]: entry for entry in existing_entries}
    merged_labels: list[str] = []
    skipped_labels: list[str] = []
    usage_index = load_usage_index() if require_usage_family else {}

    for preview_entry in lefff_preview:
        verb = preview_entry.get("verb", "").strip()
        candidates = preview_entry.get("candidates", []) or []
        if not verb or not candidates:
            continue

        current = by_verb.setdefault(verb, {"verb": verb, "core_patterns": []})
        existing_patterns = {item.get("pattern", "").strip().lower() for item in current.get("core_patterns", [])}
        existing_types = {item.get("pattern_type", "").strip() for item in current.get("core_patterns", [])}
        usage_entries = usage_index.get(verb, []) if require_usage_family else []
        usage_families = infer_usage_families(usage_entries) if require_usage_family else set()

        for candidate in candidates:
            pattern = candidate.get("pattern", "").strip()
            pattern_type = REASON_TO_PATTERN_TYPE.get(candidate.get("reason", ""), "")
            override = SAFE_LEFFF_BYPASS.get(pattern, {})
            final_pattern = override.get("pattern", pattern)
            if not pattern or final_pattern.lower() in existing_patterns:
                continue
            if pattern in BLOCKED_PATTERNS:
                skipped_labels.append(f"{verb}: {pattern}")
                continue
            if pattern_type and pattern_type in existing_types:
                continue
            allow_without_usage_family = pattern in SAFE_LEFFF_BYPASS
            if require_usage_family and pattern_type and pattern_type not in usage_families and not allow_without_usage_family:
                skipped_labels.append(f"{verb}: {pattern}")
                continue
            usage_gloss = find_usage_gloss(usage_entries, pattern_type) if pattern_type else ""
            current["core_patterns"].append(build_pattern_entry(candidate, usage_gloss=usage_gloss))
            existing_patterns.add(final_pattern.lower())
            if pattern_type:
                existing_types.add(pattern_type)
            merged_labels.append(f"{verb}: {final_pattern}")

    merged_entries = sorted(by_verb.values(), key=lambda item: item["verb"])
    return normalize_entries(merged_entries), merged_labels, skipped_labels


def main() -> None:
    args = build_parser().parse_args()
    input_path = Path(args.input).expanduser().resolve()
    existing_entries = load_json(INPUT_FILE)
    lefff_preview = load_json(input_path)

    merged_entries, merged_labels, skipped_labels = merge_entries(
        existing_entries,
        lefff_preview,
        require_usage_family=not args.no_require_usage_family,
    )

    if not merged_labels:
        print("No new LEFFF a/de/combo rows to merge.")
        if skipped_labels:
            print(f"Skipped {len(skipped_labels)} rows due to missing usage-family support.")
        return

    print(f"Prepared {len(merged_labels)} merged rows:")
    for label in merged_labels:
        print(f"  - {label}")
    if skipped_labels:
        print(f"Skipped {len(skipped_labels)} rows due to missing usage-family support.")

    if args.dry_run:
        return

    write_json(INPUT_FILE, merged_entries)
    write_core_patterns_js(merged_entries)
    write_review(merged_entries)
    print(f"Wrote {INPUT_FILE}")


if __name__ == "__main__":
    main()
