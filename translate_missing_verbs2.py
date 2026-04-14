"""
Second pass: re-translate the 209 verbs that Google Translate couldn't handle,
using MyMemory API + a contextual sentence trick ("to ____ something").
"""

import json
import re
import time
from pathlib import Path
from deep_translator import MyMemoryTranslator, GoogleTranslator

VERBS_JS   = Path("js/verbs.full.js")
CACHE_FILE = Path("translation_cache.json")

def load_verbs():
    content = VERBS_JS.read_text(encoding="utf-8")
    m = re.search(r'const verbs\s*=\s*(\[.*?\]);', content, re.DOTALL)
    return json.loads(m.group(1)), content

def save_verbs(verbs, original_content):
    new_json = json.dumps(verbs, ensure_ascii=False, indent=2)
    updated = re.sub(
        r'(const verbs\s*=\s*)\[.*?\](;)',
        lambda _: f'const verbs = {new_json};',
        original_content,
        flags=re.DOTALL
    )
    VERBS_JS.write_text(updated, encoding="utf-8")

def load_cache():
    return json.loads(CACHE_FILE.read_text(encoding="utf-8")) if CACHE_FILE.exists() else {}

def save_cache(cache):
    CACHE_FILE.write_text(json.dumps(cache, ensure_ascii=False, indent=2), encoding="utf-8")

def needs_translation(v):
    inf   = v.get("infinitive", "").lower().strip()
    trans = v.get("translation", "").strip().lower()
    if not trans:
        return True
    if not trans.startswith("to "):
        trans = "to " + trans
    return trans == "to " + inf

def try_translate(word):
    """Try multiple strategies to get a real English translation."""
    strategies = [
        # 1. MyMemory direct
        lambda: MyMemoryTranslator(source="fr", target="en").translate(word),
        # 2. Google with sentence context
        lambda: GoogleTranslator(source="fr", target="en").translate(f"il faut {word} cela"),
        # 3. MyMemory with sentence context
        lambda: MyMemoryTranslator(source="fr", target="en").translate(f"il faut {word} quelque chose"),
    ]

    for strategy in strategies:
        try:
            result = strategy()
            if not result:
                continue
            result = result.strip()
            # For sentence strategies, try to extract the verb from result
            # "you need to ____ that" → extract the verb
            for prefix in ["you need to ", "we need to ", "it is necessary to ", "must "]:
                if result.lower().startswith(prefix):
                    result = "to " + result[len(prefix):].split()[0]
                    break
            # Normalise
            t = result.lower()
            if not t.startswith("to "):
                t = "to " + t
            # Check it's not just echoing back the French
            if t == "to " + word.lower():
                continue
            # Check it has actual English content (not just French characters)
            english_word = t[3:].split()[0] if len(t) > 3 else ""
            if english_word and english_word.isascii():
                return t
        except Exception as e:
            pass
    return None

def main():
    verbs, original_content = load_verbs()
    cache = load_cache()

    still_bad = [(i, v) for i, v in enumerate(verbs) if needs_translation(v)]
    print(f"Verbs still needing translation: {len(still_bad)}")

    improved = 0
    for idx, (i, v) in enumerate(still_bad):
        inf = v["infinitive"]
        print(f"  [{idx+1}/{len(still_bad)}] {inf!r} … ", end="", flush=True)

        result = try_translate(inf)
        if result:
            print(f"→ {result!r}")
            cache[inf] = result
            verbs[i]["translation"] = result
            improved += 1
        else:
            print("✗ (gave up)")

        # Save progress every 10 verbs
        if (idx + 1) % 10 == 0:
            save_cache(cache)
            save_verbs(verbs, original_content)
            print(f"  💾 progress saved ({improved} improved so far)")

        time.sleep(0.3)

    save_cache(cache)
    save_verbs(verbs, original_content)

    still_remaining = [(i, v) for i, v in enumerate(verbs) if needs_translation(v)]
    print(f"\n✅ Improved {improved} more verbs.")
    print(f"   Still untranslated: {len(still_remaining)}")
    if still_remaining:
        for _, v in still_remaining[:30]:
            print(f"   {v['infinitive']!r}")

if __name__ == "__main__":
    main()
