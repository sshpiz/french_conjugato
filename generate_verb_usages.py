#!/usr/bin/env python3
"""
generate_verb_usages.py
=======================
Generates structured verb usage / sense data for Les Verbes app.

For each French verb it produces entries like:
  {
    "verb": "prendre",
    "sense_id": "prendre_01",
    "meaning_en": "to take (an object)",
    "comment": "common, literal",
    "example_fr": "Je prends le bus tous les matins.",
    "example_en": "I take the bus every morning.",
    "register": "neutral",
    "idiomatic": false,
    "reflexive": false,
    "tags": ["movement", "everyday"]
  }

Usage:
    export OPENAI_API_KEY=sk-...
    python3 generate_verb_usages.py                    # default: top20+top50+top100
    python3 generate_verb_usages.py --tier top20       # only top20 verbs
    python3 generate_verb_usages.py --resume           # skip already-done verbs
    python3 generate_verb_usages.py --verb faire       # single verb (debug)
    python3 generate_verb_usages.py --batch-size 3     # smaller batches
"""

import json
import re
import os
import sys
import time
import argparse
import difflib
from pathlib import Path

# Support both openai v0.x and v1.x
try:
    from openai import OpenAI as _OpenAI
    _OPENAI_V1 = True
except ImportError:
    import openai as _openai_legacy
    _OPENAI_V1 = False

# ── Paths ────────────────────────────────────────────────────────────────────
ROOT            = Path(__file__).parent
VERBS_JS        = ROOT / "js" / "verbs.full.js"
PROGRESS_FILE   = ROOT / "verb_usages_progress.json"   # incremental saves
OUTPUT_FILE     = ROOT / "verb_usages.json"             # final merged output
REVIEW_FILE     = ROOT / "verb_usages_review.md"        # human-readable

# ── Schema constants ──────────────────────────────────────────────────────────
VALID_REGISTERS = {"neutral", "formal", "informal", "literary", "colloquial", "vulgar"}

REQUIRED_FIELDS = {"verb", "sense_id", "meaning_en", "comment",
                   "example_fr", "example_en"}

# Highly polysemous verbs get a higher sense cap
RICH_VERBS  = {"faire", "mettre", "prendre", "passer", "tenir", "donner",
               "aller", "voir", "venir", "avoir", "être", "dire", "rendre",
               "porter", "jouer", "laisser", "tomber", "trouver"}
RICH_CAP    = 8    # max senses for rich verbs
DEFAULT_CAP = 5    # max senses for regular verbs


# ── Prompt ────────────────────────────────────────────────────────────────────
def user_prompt(verb: dict) -> str:
    inf  = verb["infinitive"]
    cap  = RICH_CAP if inf in RICH_VERBS else DEFAULT_CAP
    low  = max(3, cap - 2)
    hint = f'\nNote: {verb["hint"]}' if verb.get("hint") else ""

    return f"""\
For the French verb "{inf}", generate {low} to {cap} concise learner-friendly usages.{hint}

Format (one blank line between each usage):
pattern — short meaning
example sentence in French
English translation

Pattern types to consider (use only what genuinely applies):
- {inf} + object
- {inf} + à + person
- {inf} + à + infinitive
- {inf} + de + infinitive
- {inf} + que + clause
- se {inf} (if reflexive changes meaning)
- il/ça {inf} + ... (impersonal, weather, expressions like "il fait chaud", "ça fait longtemps")

Rules:
- The example sentence MUST directly use "{inf}" itself in the stated pattern — never a different verb
- Each pattern must produce a clearly different meaning from the others
- Meanings: 2–5 words max
- Examples: natural French, ≤12 words, something a real speaker would say
- Translations: natural English, not word-for-word
- Skip patterns that don't apply to this verb
- No rare, literary, or overly formal usages
- No redundancy

No explanations, no headers, no numbering. Only the formatted list.\
"""


# ── Verb list extraction ───────────────────────────────────────────────────────
def load_verbs(tiers: set[str]) -> list[dict]:
    content = VERBS_JS.read_text(encoding="utf-8")
    m = re.search(r'const verbs\s*=\s*(\[.*?\]);', content, re.DOTALL)
    if not m:
        sys.exit("Could not parse verbs[] from verbs.full.js")
    verbs = json.loads(m.group(1))
    return [v for v in verbs if v.get("frequency") in tiers]


# ── Validation / normalisation ────────────────────────────────────────────────
def validate(entry: dict, verb_inf: str) -> dict | None:
    """Return cleaned entry or None if it should be dropped."""
    for f in REQUIRED_FIELDS:
        if not entry.get(f):
            return None

    # Force correct verb field
    entry["verb"] = verb_inf

    # Normalise register
    reg = entry.get("register", "neutral").lower().strip()
    entry["register"] = reg if reg in VALID_REGISTERS else "neutral"

    # Ensure booleans
    entry["idiomatic"] = bool(entry.get("idiomatic", False))
    entry["reflexive"]  = bool(entry.get("reflexive", False))

    # Normalise tags to list of strings
    tags = entry.get("tags", [])
    entry["tags"] = [str(t).lower().strip() for t in tags if t] if isinstance(tags, list) else []

    # sense_id must match verb slug
    slug = verb_inf.replace("'", "_").replace(" ", "_").replace("-", "_")
    if not entry["sense_id"].startswith(slug):
        # Auto-fix if it looks like a valid sense_id for a different slug
        entry["sense_id"] = f"{slug}_{entry['sense_id'].split('_')[-1].zfill(2)}"

    # Strip "to " from meaning_en if the model forgot it
    meaning = entry["meaning_en"]
    if meaning and not meaning.startswith("to ") and not meaning.startswith("("):
        entry["meaning_en"] = "to " + meaning

    return entry


def deduplicate(entries: list[dict]) -> list[dict]:
    """Remove near-duplicate senses within the same verb."""
    kept = []
    by_verb: dict[str, list[dict]] = {}
    for e in entries:
        by_verb.setdefault(e["verb"], []).append(e)

    for verb, senses in by_verb.items():
        unique = []
        for s in senses:
            meaning = s["meaning_en"].lower().replace("to ", "")
            is_dup = False
            for u in unique:
                existing = u["meaning_en"].lower().replace("to ", "")
                ratio = difflib.SequenceMatcher(None, meaning, existing).ratio()
                if ratio > 0.72:
                    is_dup = True
                    break
                if s["example_fr"].strip() == u["example_fr"].strip():
                    is_dup = True
                    break
            if not is_dup:
                unique.append(s)
        kept.extend(unique)

    return kept


def renumber_sense_ids(entries: list[dict]) -> list[dict]:
    """Renumber sense_ids sequentially per verb after dedup."""
    by_verb: dict[str, list[dict]] = {}
    for e in entries:
        by_verb.setdefault(e["verb"], []).append(e)
    out = []
    for verb, senses in by_verb.items():
        slug = verb.replace("'", "_").replace(" ", "_").replace("-", "_")
        for i, s in enumerate(senses, 1):
            s["sense_id"] = f"{slug}_{i:02d}"
        out.extend(senses)
    return out


# ── Response parser ───────────────────────────────────────────────────────────
def parse_response(raw: str, verb_inf: str) -> list[dict]:
    """
    Parse plain-text response into structured dicts.

    Expected format (repeated per usage):
        pattern — short meaning
        example sentence
        translation
    """
    entries = []
    slug = verb_inf.replace("'", "_").replace(" ", "_").replace("-", "_")

    # Split into blocks separated by blank lines
    blocks = re.split(r'\n{2,}', raw.strip())

    for block in blocks:
        lines = [l.strip() for l in block.strip().splitlines() if l.strip()]
        if len(lines) < 2:
            continue

        # First line must contain " — " (pattern — meaning)
        if " — " not in lines[0] and " - " not in lines[0]:
            continue

        sep = " — " if " — " in lines[0] else " - "
        parts = lines[0].split(sep, 1)
        if len(parts) != 2:
            continue

        pattern    = parts[0].strip()
        meaning_en = parts[1].strip()
        example_fr = lines[1] if len(lines) > 1 else ""
        example_en = lines[2] if len(lines) > 2 else ""

        if not pattern or not meaning_en or not example_fr:
            continue

        n = len(entries) + 1
        entries.append({
            "verb":       verb_inf,
            "sense_id":   f"{slug}_{n:02d}",
            "pattern":    pattern,
            "meaning_en": meaning_en,
            "example_fr": example_fr,
            "example_en": example_en,
        })

    return entries


# ── API call ──────────────────────────────────────────────────────────────────
def call_api(client, verb: dict, model: str = "gpt-4o", retries: int = 3) -> list[dict]:
    prompt = user_prompt(verb)

    # Always print the prompt so you can see exactly what was sent
    print(f"\n{'─'*60}")
    print(f"PROMPT → {verb['infinitive']}")
    print('─'*60)
    print(prompt)
    print('─'*60)

    messages = [{"role": "user", "content": prompt}]

    for attempt in range(retries):
        try:
            # o-series models: no temperature, need generous token budget for reasoning
            is_o_model = model.startswith("o")
            if is_o_model:
                kwargs = dict(model=model, messages=messages, max_completion_tokens=4000)
            else:
                kwargs = dict(model=model, messages=messages, temperature=0.4, max_tokens=1024)

            if _OPENAI_V1:
                response = client.chat.completions.create(**kwargs)
                raw = (response.choices[0].message.content or "").strip()
            else:
                response = _openai_legacy.ChatCompletion.create(**kwargs)
                raw = (response["choices"][0]["message"]["content"] or "").strip()

            if not raw:
                # Print full response object so we can see what came back
                print(f"\n  ⚠️  Empty content from model. Full response:\n{response}\n")
                if attempt < retries - 1:
                    time.sleep(2)
                continue

            print(f"\nRESPONSE:\n{raw}\n{'─'*60}\n")

            entries = parse_response(raw, verb["infinitive"])
            if not entries:
                print(f"  ⚠️  Could not parse any usages from response above")
            return entries

        except Exception as e:
            msg = str(e)
            if "429" in msg or "rate" in msg.lower():
                wait = 20 * (attempt + 1)
                print(f"  ⏳ Rate limited, waiting {wait}s…")
                time.sleep(wait)
            else:
                print(f"  ❌ API error (attempt {attempt+1}): {e}")
                if attempt < retries - 1:
                    time.sleep(3)

    print("  ❌ All retries exhausted.")
    return []


# ── Progress helpers ──────────────────────────────────────────────────────────
def load_progress() -> dict:
    if PROGRESS_FILE.exists():
        return json.loads(PROGRESS_FILE.read_text(encoding="utf-8"))
    return {"done_verbs": [], "entries": []}


def save_progress(progress: dict):
    PROGRESS_FILE.write_text(json.dumps(progress, ensure_ascii=False, indent=2), encoding="utf-8")


# ── Review output ─────────────────────────────────────────────────────────────
def write_review(entries: list[dict]):
    by_verb: dict[str, list[dict]] = {}
    for e in entries:
        by_verb.setdefault(e["verb"], []).append(e)

    lines = ["# Verb Usages — Review\n",
             f"*{len(entries)} entries across {len(by_verb)} verbs*\n"]

    for verb in sorted(by_verb):
        senses = by_verb[verb]
        lines.append(f"\n## {verb}  ({len(senses)} usages)\n")
        for s in senses:
            lines.append(
                f"**{s['sense_id']}** `{s['pattern']}` — {s['meaning_en']}  \n"
                f"> {s['example_fr']}  \n"
                f"> *{s['example_en']}*\n"
            )

    REVIEW_FILE.write_text("\n".join(lines), encoding="utf-8")
    print(f"📝 Review written to {REVIEW_FILE}")


# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(description="Generate verb usages for Les Verbes app")
    parser.add_argument("--tier", default="top20,top50,top100",
                        help="Comma-separated tiers to process (default: top20,top50,top100)")
    parser.add_argument("--model", default="gpt-4o",
                        help="OpenAI model (default: gpt-4o; use o3 for top quality)")
    parser.add_argument("--resume", action="store_true",
                        help="Skip verbs already in progress file")
    parser.add_argument("--verb", default=None,
                        help="Process a single verb by infinitive (for debugging)")
    parser.add_argument("--finalize-only", action="store_true",
                        help="Skip generation, just dedup+write final output from progress file")
    args = parser.parse_args()

    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key and not args.finalize_only:
        sys.exit("Set OPENAI_API_KEY environment variable first.")

    if api_key:
        if _OPENAI_V1:
            client = _OpenAI(api_key=api_key)
        else:
            _openai_legacy.api_key = api_key
            client = None   # v0.x uses module-level API key
            print("⚠️  Using openai v0.x — consider: pip3 install --upgrade openai")
    else:
        client = None

    # ── Load verb list ────────────────────────────────────────────────────────
    tiers = set(args.tier.split(","))
    all_verbs = load_verbs(tiers)
    print(f"📚 Loaded {len(all_verbs)} verbs from tiers: {', '.join(sorted(tiers))}")
    print(f"🤖 Model: {args.model}")

    if args.verb:
        all_verbs = [v for v in all_verbs if v["infinitive"] == args.verb]
        if not all_verbs:
            # Also try without tier restriction
            all_tiers = {"top20","top50","top100","top500","top1000","rare"}
            all_verbs = [v for v in load_verbs(all_tiers) if v["infinitive"] == args.verb]
        if not all_verbs:
            sys.exit(f"Verb '{args.verb}' not found in verb list.")
        print(f"🔍 Single verb mode: {all_verbs[0]['infinitive']}")

    # ── Load progress ─────────────────────────────────────────────────────────
    progress = load_progress()
    done_set = set(progress["done_verbs"])
    accumulated = list(progress["entries"])

    if args.resume:
        pending = [v for v in all_verbs if v["infinitive"] not in done_set]
        print(f"⏭️  Resuming: {len(done_set)} done, {len(pending)} remaining")
    else:
        pending = all_verbs

    if args.finalize_only:
        pending = []

    # ── One verb per request ──────────────────────────────────────────────────
    total = len(pending)
    print(f"🚀 {total} verbs — one request each\n")

    for idx, verb in enumerate(pending, 1):
        inf = verb["infinitive"]
        cap = RICH_CAP if inf in RICH_VERBS else DEFAULT_CAP
        print(f"[{idx}/{total}] {inf}  (cap {cap})", end="", flush=True)

        cleaned = call_api(client, verb, model=args.model)

        print(f"  → {len(cleaned)} usages saved")
        accumulated.extend(cleaned)

        done_set.add(inf)
        progress["done_verbs"] = list(done_set)
        progress["entries"] = accumulated
        save_progress(progress)

        # Keep verb_usages.js in sync so the app reflects new data while running
        (ROOT / "verb_usages.js").write_text(
            f"window.verbUsages = {json.dumps(accumulated, ensure_ascii=False, indent=2)};\n",
            encoding="utf-8"
        )

        if idx < total:
            time.sleep(0.5)   # stay well within rate limits

    # ── Finalize ──────────────────────────────────────────────────────────────
    print(f"\n🔧 Finalizing: {len(accumulated)} raw entries…")

    final = deduplicate(accumulated)
    final = renumber_sense_ids(final)

    print(f"✅ {len(final)} entries after dedup (removed {len(accumulated)-len(final)})")

    # Sort: by frequency tier then verb name
    tier_order = {"top20":0, "top50":1, "top100":2, "top500":3, "top1000":4, "rare":5}
    verb_tier  = {v["infinitive"]: v["frequency"] for v in load_verbs(
        {"top20","top50","top100","top500","top1000","rare"}
    )}
    final.sort(key=lambda e: (tier_order.get(verb_tier.get(e["verb"],"rare"), 9), e["verb"]))

    OUTPUT_FILE.write_text(json.dumps(final, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"💾 Saved → {OUTPUT_FILE}  ({OUTPUT_FILE.stat().st_size // 1024} KB)")

    # Write verb_usages.js so the app can load it directly
    js_file = ROOT / "verb_usages.js"
    js_file.write_text(
        f"window.verbUsages = {json.dumps(final, ensure_ascii=False, indent=2)};\n",
        encoding="utf-8"
    )
    print(f"📦 Also wrote → {js_file.name}")

    write_review(final)
    print("\n🎉 Done!")
    by_verb: dict[str, list] = {}
    for e in final:
        by_verb.setdefault(e["verb"], []).append(e)
    print(f"   {len(by_verb)} verbs, avg {len(final)/max(len(by_verb),1):.1f} senses/verb")


if __name__ == "__main__":
    main()
