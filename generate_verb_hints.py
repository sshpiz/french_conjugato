"""
Generate short contextual hints for French verbs using Claude API.
Patches hints into js/verbs.full.js as an optional `hint` field.

Usage:
  pip install openai
  export OPENAI_API_KEY=sk-...
  python3 generate_verb_hints.py

The script processes verbs by frequency tier (top20 → top1000 → rare),
skips verbs that don't need a hint (simple, unambiguous translations),
and saves progress every 20 verbs.
"""

import json, re, time
from pathlib import Path
from openai import OpenAI

VERBS_JS   = Path("js/verbs.full.js")
HINTS_FILE = Path("verb_hints_cache.json")
BATCH_SIZE = 30   # verbs per API call
FREQ_ORDER = ["top20", "top50", "top100", "top500", "top1000", "rare"]


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


def load_hints():
    return json.loads(HINTS_FILE.read_text()) if HINTS_FILE.exists() else {}


def save_hints(hints):
    HINTS_FILE.write_text(json.dumps(hints, ensure_ascii=False, indent=2))


SYSTEM_PROMPT = """You are a French language expert writing ultra-brief usage hints for a flashcard app.
For each verb given, decide if a short hint adds genuine value beyond the bare translation.
Return a JSON object mapping infinitive → hint string (or null if no hint needed).

Rules for hints:
- Max 6-8 words. Fragments ok. No full sentences.
- Only add a hint when it genuinely helps:
  * Polysemous verbs with importantly different meanings (faire, partir, passer...)
  * Verbs with tricky structure (falloir: always impersonal "il faut"; se souvenir: reflexive only)
  * Pairs easily confused (savoir vs connaître; partir vs quitter vs sortir)
  * Verbs whose English gloss misleads (avoir: also forms passé composé; être: also passive voice)
  * Rare verbs where even the category helps ("archaic", "literary", "regional")
- Return null for simple unambiguous verbs (finir, manger, lire, écouter, etc.)
- Keep tone neutral, not pedagogical. No "Note:" or "Also:" prefixes.

Examples of good hints:
  faire → "do, make; causative: faire + inf"
  falloir → "impersonal only: il faut"
  savoir → "know (facts/how to); cf. connaître"
  partir → "leave (depart); cf. quitter, sortir"
  avoir → "have; aux for passé composé"
  être → "be; aux for reflexives & passive"
  se souvenir → "reflexive: se souvenir de"
  manquer → "miss; also: manquer à (be missed by)"
  tenir → "hold; tenir à = care about"
  rendre → "return (sth); rendre + adj = make"
"""


def get_hints_for_batch(client, batch):
    """batch = list of {infinitive, translation}"""
    user_msg = "Generate hints for these verbs:\n" + json.dumps(batch, ensure_ascii=False)
    resp = client.chat.completions.create(
        model="gpt-4o-mini",
        max_tokens=1024,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_msg}
        ]
    )
    text = resp.choices[0].message.content.strip()
    # Extract JSON from response
    m = re.search(r'\{.*\}', text, re.DOTALL)
    if not m:
        return {}
    return json.loads(m.group(0))


def main():
    client = OpenAI()  # reads OPENAI_API_KEY from env
    verbs, original_content = load_verbs()
    hints = load_hints()

    # Sort by frequency tier
    freq_rank = {f: i for i, f in enumerate(FREQ_ORDER)}
    sorted_verbs = sorted(
        [(i, v) for i, v in enumerate(verbs)],
        key=lambda x: freq_rank.get(x[1].get("frequency", "rare"), 99)
    )

    # Filter to verbs not yet processed
    to_process = [
        (i, v) for i, v in sorted_verbs
        if v.get("infinitive") not in hints
        and v.get("frequency", "rare") != "rare"  # skip rare on first pass
    ]
    # Add rare verbs at the end
    rare = [(i, v) for i, v in sorted_verbs if v.get("frequency", "rare") == "rare" and v.get("infinitive") not in hints]
    to_process += rare

    print(f"Verbs to process: {len(to_process)}")
    added = 0

    for batch_start in range(0, len(to_process), BATCH_SIZE):
        batch_items = to_process[batch_start:batch_start + BATCH_SIZE]
        batch_input = [
            {"infinitive": v["infinitive"], "translation": v.get("translation", "")}
            for _, v in batch_items
        ]

        print(f"  Batch {batch_start // BATCH_SIZE + 1}: {[b['infinitive'] for b in batch_input[:5]]}...")

        try:
            result = get_hints_for_batch(client, batch_input)
        except Exception as e:
            print(f"  API error: {e}")
            time.sleep(2)
            continue

        for inf, hint in result.items():
            hints[inf] = hint  # None means "no hint needed", still cached

        added += sum(1 for h in result.values() if h)
        save_hints(hints)

        # Patch verbs array
        inf_to_idx = {v["infinitive"]: i for i, v in enumerate(verbs)}
        for inf, hint in result.items():
            if inf in inf_to_idx and hint:
                verbs[inf_to_idx[inf]]["hint"] = hint

        if (batch_start // BATCH_SIZE + 1) % 5 == 0:
            save_verbs(verbs, original_content)
            print(f"  💾 saved progress ({added} hints so far)")

        time.sleep(0.3)

    # Final patch
    for inf, hint in hints.items():
        inf_to_idx = {v["infinitive"]: i for i, v in enumerate(verbs)}
        if inf in inf_to_idx and hint:
            verbs[inf_to_idx[inf]]["hint"] = hint

    save_verbs(verbs, original_content)
    print(f"\n✅ Done. {added} hints added.")
    print("Run compress_large_js_objects.py and rename output to verbs.full.generated.js")


if __name__ == "__main__":
    main()
