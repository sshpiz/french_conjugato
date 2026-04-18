#!/usr/bin/env python3
"""
review_core_patterns.py
=======================
Post-generation tools for verb_core_patterns.json.

Commands:
    python3 review_core_patterns.py import-js
    python3 review_core_patterns.py sync
    python3 review_core_patterns.py stats
    python3 review_core_patterns.py coverage
    python3 review_core_patterns.py review
    python3 review_core_patterns.py check
    python3 review_core_patterns.py verb parler
"""

from __future__ import annotations

import sys
from collections import Counter

from core_patterns_lib import (
    INPUT_FILE,
    JS_FILE,
    REVIEW_FILE,
    assign_pattern_ids,
    collect_quality_issues,
    flatten_pattern_items,
    load_core_patterns_from_js,
    load_core_patterns_from_json,
    load_verbs,
    normalize_entries,
    render_review_markdown,
    write_core_patterns_js,
    write_json,
    write_review,
)


def load_json_entries() -> list[dict]:
    return assign_pattern_ids(normalize_entries(load_core_patterns_from_json()))


def sync(entries: list[dict]) -> list[dict]:
    entries = assign_pattern_ids(normalize_entries(entries))
    write_json(INPUT_FILE, entries)
    write_core_patterns_js(entries)
    write_review(entries)
    return entries


def cmd_import_js() -> None:
    entries = load_core_patterns_from_js()
    for entry in entries:
        for pattern_entry in entry.get("core_patterns", []) or []:
            pattern_entry.setdefault("source", "seed-v1")
            pattern_entry.setdefault("status", "seed")
    entries = sync(entries)
    print(f"Imported {len(entries)} verbs from {JS_FILE.name} into {INPUT_FILE.name}")


def cmd_sync() -> None:
    entries = sync(load_json_entries())
    print(f"Synced {len(entries)} verbs into JSON/JS/review outputs.")


def cmd_stats(entries: list[dict]) -> None:
    pattern_items = flatten_pattern_items(entries)
    counts = Counter(len(entry.get("core_patterns", []) or []) for entry in entries)
    sources = Counter(item.get("source", "") or "(none)" for item in pattern_items)
    statuses = Counter(item.get("status", "") or "(none)" for item in pattern_items)

    print("── Core Patterns Stats ─────────────────────────")
    print(f"  Total verbs    : {len(entries)}")
    print(f"  Total patterns : {len(pattern_items)}")
    print(f"  Avg patterns   : {len(pattern_items) / max(len(entries), 1):.2f}")
    print("\n  Patterns/verb distribution:")
    for count in sorted(counts):
        print(f"    {count:2d}: {counts[count]}")
    print("\n  Sources:")
    for source, total in sources.most_common():
        print(f"    {source:<18} {total}")
    print("\n  Status:")
    for status, total in statuses.most_common():
        print(f"    {status:<18} {total}")


def cmd_review(entries: list[dict]) -> None:
    REVIEW_FILE.write_text(render_review_markdown(entries), encoding="utf-8")
    print(f"Wrote {REVIEW_FILE.name}")


def cmd_coverage(entries: list[dict]) -> None:
    tiers = ["top20", "top50", "top100", "top500", "top1000"]
    covered = {entry.get("verb", "") for entry in entries}

    print("── Core Patterns Coverage ─────────────────────")
    for tier in tiers:
        tier_verbs = [verb.get("infinitive", "") for verb in load_verbs({tier})]
        tier_covered = [verb for verb in tier_verbs if verb in covered]
        print(f"  {tier:<7} : {len(tier_covered):>3} / {len(tier_verbs):<3}")

    rollout_tiers = {"top20", "top50", "top100", "top500", "top1000"}
    rollout_verbs = [verb.get("infinitive", "") for verb in load_verbs(rollout_tiers)]
    missing = [verb for verb in rollout_verbs if verb and verb not in covered]

    print(f"\n  rollout : {len(rollout_verbs) - len(missing):>3} / {len(rollout_verbs):<3}")
    if missing:
        print("\n  Next missing:")
        print("   ", ", ".join(missing[:25]))


def cmd_check(entries: list[dict]) -> None:
    issues = collect_quality_issues(entries)
    if not issues:
        print("✅ No issues found.")
        return
    print(f"⚠️  {len(issues)} potential issues:\n")
    for issue in issues:
        print(" ", issue)


def cmd_verb(entries: list[dict], target: str) -> None:
    for entry in entries:
        if entry.get("verb") != target:
            continue
        print(f"\n{target} — {len(entry.get('core_patterns', []))} core patterns\n{'─' * 50}")
        for pattern_entry in entry.get("core_patterns", []):
            meta = [pattern_entry.get("pattern_id", "")]
            if pattern_entry.get("pattern_type"):
                meta.append(pattern_entry["pattern_type"])
            if pattern_entry.get("status"):
                meta.append(pattern_entry["status"])
            print(f"\n  {' | '.join(part for part in meta if part)}")
            print(f"  pattern : {pattern_entry.get('pattern', '')}")
            print(f"  meaning : {pattern_entry.get('meaning_en', '')}")
            if pattern_entry.get("notes"):
                print(f"  notes   : {pattern_entry['notes']}")
            if pattern_entry.get("source"):
                print(f"  source  : {pattern_entry['source']}")
        return
    print(f"Verb '{target}' not found.")


def main() -> None:
    command = sys.argv[1] if len(sys.argv) > 1 else "stats"

    if command == "import-js":
        cmd_import_js()
        return

    if not INPUT_FILE.exists():
        print(f"No {INPUT_FILE.name} found. Run `python3 review_core_patterns.py import-js` first.")
        return

    entries = load_json_entries()

    if command == "sync":
        cmd_sync()
    elif command == "stats":
        cmd_stats(entries)
    elif command == "coverage":
        cmd_coverage(entries)
    elif command == "review":
        cmd_review(entries)
    elif command == "check":
        cmd_check(entries)
    elif command == "verb" and len(sys.argv) > 2:
        cmd_verb(entries, " ".join(sys.argv[2:]))
    else:
        print(__doc__)


if __name__ == "__main__":
    main()
