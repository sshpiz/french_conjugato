"""
Translates French verbs that lack a real English translation using Google Translate
(via deep_translator). Caches results in translation_cache.json so runs can be
interrupted and resumed safely.

Usage:
    python3 translate_missing_verbs.py
"""

import json
import re
import time
import sys
from pathlib import Path
from deep_translator import GoogleTranslator

VERBS_JS      = Path("js/verbs.full.js")
CACHE_FILE    = Path("translation_cache.json")
BATCH_SIZE    = 40   # translate N verbs per request
SLEEP_BETWEEN = 0.5  # seconds between batches

# ── helpers ──────────────────────────────────────────────────────────────────

def load_verbs():
    content = VERBS_JS.read_text(encoding="utf-8")
    m = re.search(r'const verbs\s*=\s*(\[.*?\]);', content, re.DOTALL)
    if not m:
        raise RuntimeError("Could not find 'const verbs = [...]' in verbs.full.js")
    return json.loads(m.group(1)), content

def save_verbs(verbs, original_content):
    new_json = json.dumps(verbs, ensure_ascii=False, indent=2)
    # Replace only the verbs array, keep preamble + anything after
    updated = re.sub(
        r'(const verbs\s*=\s*)\[.*?\](;)',
        lambda _: f'const verbs = {new_json};',
        original_content,
        flags=re.DOTALL
    )
    VERBS_JS.write_text(updated, encoding="utf-8")

def load_cache():
    if CACHE_FILE.exists():
        return json.loads(CACHE_FILE.read_text(encoding="utf-8"))
    return {}

def save_cache(cache):
    CACHE_FILE.write_text(json.dumps(cache, ensure_ascii=False, indent=2), encoding="utf-8")

def needs_translation(v):
    inf   = v.get("infinitive", "").lower().strip()
    trans = v.get("translation", "").strip()
    if not trans:
        return True
    t = trans.lower()
    if not t.startswith("to "):
        t = "to " + t
    return t == "to " + inf

def translate_batch(words):
    """Translate a list of French infinitives → English, returned as a list."""
    translator = GoogleTranslator(source="fr", target="en")
    results = []
    for word in words:
        try:
            result = translator.translate(word)
            results.append(result)
        except Exception as e:
            print(f"  ⚠ failed '{word}': {e}")
            results.append(None)
    return results

# ── main ─────────────────────────────────────────────────────────────────────

def main():
    verbs, original_content = load_verbs()
    cache = load_cache()

    # Collect verbs that still need a real translation
    todo = [(i, v) for i, v in enumerate(verbs) if needs_translation(v)]
    print(f"Total verbs       : {len(verbs)}")
    print(f"Needing translation: {len(todo)}")

    # Filter out ones already in cache
    to_fetch = [(i, v) for i, v in todo if v["infinitive"] not in cache]
    already_cached = len(todo) - len(to_fetch)
    print(f"Already cached    : {already_cached}")
    print(f"To fetch now      : {len(to_fetch)}")
    print()

    if not to_fetch:
        print("Nothing to fetch — applying cache to verbs.full.js …")
    else:
        total_batches = (len(to_fetch) + BATCH_SIZE - 1) // BATCH_SIZE
        fetched = 0

        for batch_num in range(total_batches):
            batch = to_fetch[batch_num * BATCH_SIZE : (batch_num + 1) * BATCH_SIZE]
            infinitives = [v["infinitive"] for _, v in batch]

            print(f"Batch {batch_num+1}/{total_batches}  ({len(infinitives)} verbs) … ", end="", flush=True)
            translations = translate_batch(infinitives)

            for (i, v), trans in zip(batch, translations):
                if trans:
                    # Normalise to "to <english>"
                    t = trans.strip().lower()
                    if not t.startswith("to "):
                        t = "to " + t
                    cache[v["infinitive"]] = t
                    fetched += 1

            save_cache(cache)
            print(f"done  (cache size: {len(cache)})")
            time.sleep(SLEEP_BETWEEN)

        print(f"\n✅ Fetched {fetched} new translations.")

    # Apply cache to verbs list
    applied = 0
    for i, v in todo:
        inf = v["infinitive"]
        if inf in cache:
            verbs[i]["translation"] = cache[inf]
            applied += 1

    save_verbs(verbs, original_content)
    print(f"✅ Applied {applied} translations → verbs.full.js updated.")

    # Report any remaining blanks
    still_bad = [(i, v) for i, v in enumerate(verbs) if needs_translation(v)]
    if still_bad:
        print(f"\n⚠  {len(still_bad)} verbs still have no real translation:")
        for _, v in still_bad[:20]:
            print(f"   {v['infinitive']!r} → {v['translation']!r}")
    else:
        print("🎉 All verbs now have real English translations!")

if __name__ == "__main__":
    main()
