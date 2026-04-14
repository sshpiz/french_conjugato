#!/usr/bin/env python3
"""
review_verb_usages.py
=====================
Post-generation tools for verb_usages.json.

Commands:
    python3 review_verb_usages.py stats          # summary stats
    python3 review_verb_usages.py review         # regenerate verb_usages_review.md
    python3 review_verb_usages.py check          # flag potential quality issues
    python3 review_verb_usages.py verb faire     # show one verb's entries
    python3 review_verb_usages.py clean          # run dedup + rewrite in-place
"""

import json
import sys
import difflib
from pathlib import Path
from collections import Counter

ROOT         = Path(__file__).parent
INPUT_FILE   = ROOT / "verb_usages.json"
REVIEW_FILE  = ROOT / "verb_usages_review.md"

VALID_REGISTERS = {"neutral", "formal", "informal", "literary", "colloquial", "vulgar"}


def load() -> list[dict]:
    if not INPUT_FILE.exists():
        sys.exit(f"No {INPUT_FILE.name} found — run generate_verb_usages.py first.")
    return json.loads(INPUT_FILE.read_text(encoding="utf-8"))


# ── Stats ─────────────────────────────────────────────────────────────────────
def cmd_stats(entries: list[dict]):
    by_verb: dict[str, list] = {}
    for e in entries:
        by_verb.setdefault(e["verb"], []).append(e)

    sense_counts = Counter(len(v) for v in by_verb.values())
    registers    = Counter(e.get("register","?") for e in entries)
    idiomatic    = sum(1 for e in entries if e.get("idiomatic"))
    reflexive    = sum(1 for e in entries if e.get("reflexive"))

    print(f"── Verb Usages Stats ───────────────────────────")
    print(f"  Total entries : {len(entries)}")
    print(f"  Unique verbs  : {len(by_verb)}")
    print(f"  Avg senses    : {len(entries)/max(len(by_verb),1):.1f}")
    print(f"  Idiomatic     : {idiomatic} ({100*idiomatic//max(len(entries),1)}%)")
    print(f"  Reflexive     : {reflexive} ({100*reflexive//max(len(entries),1)}%)")
    print(f"\n  Senses/verb distribution:")
    for k in sorted(sense_counts):
        bar = "█" * sense_counts[k]
        print(f"    {k:2d} senses: {bar}  ({sense_counts[k]} verbs)")
    print(f"\n  Registers:")
    for reg, cnt in registers.most_common():
        print(f"    {reg:<12}: {cnt}")


# ── Review markdown ───────────────────────────────────────────────────────────
def cmd_review(entries: list[dict]):
    by_verb: dict[str, list] = {}
    for e in entries:
        by_verb.setdefault(e["verb"], []).append(e)

    lines = ["# Verb Usages — Review\n",
             f"*{len(entries)} entries across {len(by_verb)} verbs*\n",
             "---\n"]

    for verb in sorted(by_verb):
        senses = by_verb[verb]
        lines.append(f"\n## {verb}  ({len(senses)} senses)\n")
        for s in senses:
            flag = " 🔁" if s.get("idiomatic") else ""
            ref  = " 🪞" if s.get("reflexive") else ""
            reg  = f" [{s['register']}]" if s.get("register","neutral") != "neutral" else ""
            tags = ", ".join(s.get("tags", [])) or "—"
            lines.append(
                f"### {s['sense_id']}{flag}{ref}{reg}\n"
                f"**{s['meaning_en']}** — *{s['comment']}*\n\n"
                f"> {s['example_fr']}\n>\n"
                f"> *{s['example_en']}*\n\n"
                f"tags: `{tags}`\n"
            )

    REVIEW_FILE.write_text("\n".join(lines), encoding="utf-8")
    print(f"📝 Review written → {REVIEW_FILE}  ({len(by_verb)} verbs)")


# ── Quality check ─────────────────────────────────────────────────────────────
def cmd_check(entries: list[dict]):
    issues: list[str] = []

    by_verb: dict[str, list] = {}
    for e in entries:
        by_verb.setdefault(e["verb"], []).append(e)

    for verb, senses in by_verb.items():
        # 1. Near-duplicate meanings within same verb
        meanings = [(s["sense_id"], s["meaning_en"].lower().replace("to ","")) for s in senses]
        for i, (sid1, m1) in enumerate(meanings):
            for sid2, m2 in meanings[i+1:]:
                ratio = difflib.SequenceMatcher(None, m1, m2).ratio()
                if ratio > 0.72:
                    issues.append(f"NEAR-DUP  {verb}: '{sid1}' ≈ '{sid2}'  (ratio {ratio:.2f})")

        # 2. Duplicate example sentences
        examples = [(s["sense_id"], s["example_fr"].strip()) for s in senses]
        seen_ex  = {}
        for sid, ex in examples:
            if ex in seen_ex:
                issues.append(f"DUP-EXAMPLE  {verb}: '{sid}' == '{seen_ex[ex]}'")
            seen_ex[ex] = sid

        # 3. Missing tags
        for s in senses:
            if not s.get("tags"):
                issues.append(f"NO-TAGS   {s['sense_id']}")

        # 4. Bad register
        for s in senses:
            if s.get("register") not in VALID_REGISTERS:
                issues.append(f"BAD-REG   {s['sense_id']}: '{s.get('register')}'")

        # 5. Example too long
        for s in senses:
            words = s.get("example_fr","").split()
            if len(words) > 15:
                issues.append(f"LONG-EX   {s['sense_id']}: {len(words)} words — \"{s['example_fr']}\"")

    if issues:
        print(f"⚠️  {len(issues)} potential issues:\n")
        for i in issues:
            print(" ", i)
    else:
        print("✅ No issues found.")


# ── Single verb ───────────────────────────────────────────────────────────────
def cmd_verb(entries: list[dict], verb: str):
    senses = [e for e in entries if e["verb"] == verb]
    if not senses:
        # fuzzy match
        verbs = list({e["verb"] for e in entries})
        close = difflib.get_close_matches(verb, verbs, n=3, cutoff=0.6)
        print(f"Verb '{verb}' not found.")
        if close:
            print(f"Did you mean: {', '.join(close)}?")
        return

    print(f"\n{verb}  —  {len(senses)} senses\n{'─'*50}")
    for s in senses:
        flag = " [idiomatic]" if s.get("idiomatic") else ""
        ref  = " [reflexive]" if s.get("reflexive") else ""
        reg  = f" [{s['register']}]" if s.get("register","neutral") != "neutral" else ""
        print(f"\n  {s['sense_id']}{flag}{ref}{reg}")
        print(f"  meaning  : {s['meaning_en']}")
        print(f"  comment  : {s['comment']}")
        print(f"  FR       : {s['example_fr']}")
        print(f"  EN       : {s['example_en']}")
        print(f"  tags     : {', '.join(s.get('tags',[]) or ['—'])}")


# ── Clean / dedup in-place ────────────────────────────────────────────────────
def cmd_clean(entries: list[dict]) -> list[dict]:
    from generate_verb_usages import deduplicate, renumber_sense_ids
    before = len(entries)
    entries = deduplicate(entries)
    entries = renumber_sense_ids(entries)
    after  = len(entries)
    INPUT_FILE.write_text(json.dumps(entries, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"🧹 Cleaned: {before} → {after} entries (removed {before-after} duplicates)")
    return entries


# ── Entry point ───────────────────────────────────────────────────────────────
def main():
    cmd = sys.argv[1] if len(sys.argv) > 1 else "stats"
    entries = load()

    if cmd == "stats":
        cmd_stats(entries)
    elif cmd == "review":
        cmd_review(entries)
    elif cmd == "check":
        cmd_check(entries)
    elif cmd == "verb" and len(sys.argv) > 2:
        verb_arg = " ".join(sys.argv[2:])
        cmd_verb(entries, verb_arg)
    elif cmd == "clean":
        entries = cmd_clean(entries)
        cmd_stats(entries)
    else:
        print(__doc__)


if __name__ == "__main__":
    main()
