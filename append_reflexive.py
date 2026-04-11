"""
Merge reflexive_verbs_data.json into verbs.full.js and create reflexive_sentences.js.

Steps:
  1. Reads reflexive_verbs_data.json
  2. Appends verb metadata to verbs[] in verbs.full.js
  3. Merges conjugation tables into tenses{} in verbs.full.js
  4. Writes reflexive_sentences.js (plain JS, loaded separately in index.html)

Run after generate_reflexive_verbs.py:
  python3 append_reflexive.py
  python3 compress_large_js_objects.py js/verbs.full.js
  mv js/verbs.full.loader.js js/verbs.full.generated.js
"""

import json, re
from pathlib import Path

VERBS_JS         = Path("js/verbs.full.js")
INPUT_FILE       = Path("reflexive_verbs_data.json")
SENTENCES_OUT    = Path("reflexive_sentences.js")

TENSE_KEY_MAP = {
    "présent":              "present",
    "passé composé":        "passeCompose",
    "imparfait":            "imparfait",
    "futur simple":         "futurSimple",
    "plus-que-parfait":     "plusQueParfait",
    "conditionnel présent": "conditionnelPresent",
    "subjonctif présent":   "subjonctifPresent",
}


def load_verbs_js():
    content = VERBS_JS.read_text(encoding="utf-8")
    mv = re.search(r'const verbs\s*=\s*(\[.*?\]);', content, re.DOTALL)
    mt = re.search(r'const tenses\s*=\s*(\{.*?\});', content, re.DOTALL)
    verbs  = json.loads(mv.group(1))
    tenses = json.loads(mt.group(1))
    return verbs, tenses, content


def save_verbs_js(verbs, tenses, original_content):
    new_verbs  = json.dumps(verbs,  ensure_ascii=False, indent=2)
    new_tenses = json.dumps(tenses, ensure_ascii=False, indent=2)
    updated = re.sub(
        r'(const verbs\s*=\s*)\[.*?\](;)',
        lambda _: f'const verbs = {new_verbs};',
        original_content, flags=re.DOTALL
    )
    updated = re.sub(
        r'(const tenses\s*=\s*)\{.*?\}(;)',
        lambda _: f'const tenses = {new_tenses};',
        updated, flags=re.DOTALL
    )
    VERBS_JS.write_text(updated, encoding="utf-8")


def main():
    if not INPUT_FILE.exists():
        raise SystemExit(f"❌ {INPUT_FILE} not found. Run generate_reflexive_verbs.py first.")

    reflexive_data = json.loads(INPUT_FILE.read_text(encoding="utf-8"))
    verb_entries   = reflexive_data["verbs"]
    print(f"Loaded {len(verb_entries)} reflexive verbs from {INPUT_FILE}")

    verbs, tenses, original_content = load_verbs_js()
    existing_infinitives = {v["infinitive"] for v in verbs}

    added_verbs    = 0
    updated_verbs  = 0
    all_sentences  = []

    for entry in verb_entries:
        inf = entry["infinitive"]

        # ---- 1. Verb metadata ----
        verb_meta = {
            "infinitive":   inf,
            "translation":  entry.get("translation", ""),
            "frequency":    entry.get("frequency", "top500"),
            "reflexive":    True,
        }
        if entry.get("hint"):
            verb_meta["hint"] = entry["hint"]

        if inf in existing_infinitives:
            # Update existing entry
            idx = next(i for i, v in enumerate(verbs) if v["infinitive"] == inf)
            for k, v in verb_meta.items():
                verbs[idx][k] = v
            updated_verbs += 1
            print(f"  ↺ updated {inf}")
        else:
            verbs.append(verb_meta)
            existing_infinitives.add(inf)
            added_verbs += 1
            print(f"  + added   {inf}")

        # ---- 2. Conjugation tables ----
        conjugations = entry.get("conjugations", {})
        for tense_display, pronoun_map in conjugations.items():
            tense_key = TENSE_KEY_MAP.get(tense_display)
            if not tense_key:
                print(f"  ⚠ Unknown tense '{tense_display}' — skipping")
                continue
            if tense_key not in tenses:
                tenses[tense_key] = {}
            tenses[tense_key][inf] = pronoun_map

        # ---- 3. Collect sentences ----
        for s in entry.get("sentences", []):
            all_sentences.append({
                "verb":        inf,
                "tense":       s.get("tense", ""),
                "pronoun":     s.get("pronoun", ""),
                "sentence":    s.get("sentence", ""),
                "translation": s.get("translation", ""),
                "gap_sentence": s.get("gap_sentence", ""),
                "source":      "generated",
            })

    save_verbs_js(verbs, tenses, original_content)
    print(f"\n✅ verbs.full.js updated: +{added_verbs} new, {updated_verbs} updated")

    # ---- 4. Write reflexive_sentences.js ----
    sentences_json = json.dumps(all_sentences, ensure_ascii=False, indent=2)
    SENTENCES_OUT.write_text(
        f"// Auto-generated reflexive verb sentences — do not edit by hand\n"
        f"// Run append_reflexive.py to regenerate\n"
        f"window.reflexiveSentences = {sentences_json};\n",
        encoding="utf-8"
    )
    print(f"✅ {SENTENCES_OUT} written ({len(all_sentences)} sentences)")
    print("\nNext steps:")
    print("  1. python3 compress_large_js_objects.py js/verbs.full.js")
    print("  2. mv js/verbs.full.loader.js js/verbs.full.generated.js")
    print("  3. python3 build.py")


if __name__ == "__main__":
    main()
