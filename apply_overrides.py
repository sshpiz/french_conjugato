"""
Apply verb_overrides.json on top of js/verbs.full.js.
Run this after any data regeneration step.

Usage:
  python3 apply_overrides.py
"""

import json, re
from pathlib import Path

VERBS_JS   = Path("js/verbs.full.js")
OVERRIDES  = Path("verb_overrides.json")
SKIP_KEYS  = {"_comment", "_reason"}

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

def main():
    overrides = json.loads(OVERRIDES.read_text(encoding="utf-8"))
    verbs, original_content = load_verbs()
    index = {v["infinitive"]: i for i, v in enumerate(verbs)}

    applied = 0
    for infinitive, fields in overrides.items():
        if infinitive.startswith("_"):
            continue
        if infinitive not in index:
            print(f"  ⚠️  '{infinitive}' not found in verbs data — skipping")
            continue
        verb = verbs[index[infinitive]]
        for key, value in fields.items():
            if key in SKIP_KEYS:
                continue
            old = verb.get(key, "<missing>")
            verb[key] = value
            print(f"  ✅ {infinitive}: {key} = {old!r} → {value!r}")
        applied += 1

    save_verbs(verbs, original_content)
    print(f"\nDone. {applied} verbs patched.")
    print("Next: python3 compress_large_js_objects.py && mv verbs.full.loader.js js/verbs.full.generated.js")

if __name__ == "__main__":
    main()
