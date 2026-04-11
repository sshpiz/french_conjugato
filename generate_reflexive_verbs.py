"""
Generate reflexive verb data using OpenAI API.

Generates:
  - Verb metadata (translation, frequency tier, hint)
  - Full conjugation tables for 7 tenses × 6 pronoun keys
  - 2 example sentences per tense (with gap_sentence for practice)

Output: reflexive_verbs_data.json

Usage:
  pip install openai
  export OPENAI_API_KEY=sk-...
  python3 generate_reflexive_verbs.py
"""

import json, re, time, os
from pathlib import Path
from openai import OpenAI

OUTPUT_FILE = Path("reflexive_verbs_data.json")
BATCH_SIZE = 2

TENSES = ["présent", "passé composé", "imparfait", "futur simple",
          "plus-que-parfait", "conditionnel présent", "subjonctif présent"]

TENSE_KEY_MAP = {
    "présent": "present",
    "passé composé": "passeCompose",
    "imparfait": "imparfait",
    "futur simple": "futurSimple",
    "plus-que-parfait": "plusQueParfait",
    "conditionnel présent": "conditionnelPresent",
    "subjonctif présent": "subjonctifPresent",
}

PRONOUN_KEYS = ["je", "tu", "il/elle/on", "nous", "vous", "ils/elles"]

# Curated list of common/useful reflexive verbs
REFLEXIVE_VERBS = [
    "se lever",
    "se coucher",
    "se réveiller",
    "s'habiller",
    "se laver",
    "se souvenir",
    "s'appeler",
    "s'asseoir",
    "se dépêcher",
    "se tromper",
    "se sentir",
    "se passer",
    "se retrouver",
    "se rendre",
    "se mettre",
    "se trouver",
    "se faire",
    "s'occuper",
    "se demander",
    "s'intéresser",
    "se rappeler",
    "se moquer",
    "se plaindre",
    "se taire",
    "se battre",
    "se marier",
    "se reposer",
    "s'amuser",
    "se voir",
    "s'aimer",
    "se parler",
    "se connaître",
    "se fâcher",
    "s'ennuyer",
    "se promener",
]

SYSTEM_PROMPT = """You are a French language expert generating structured data for a verb conjugation app.
For each reflexive verb provided, return a JSON array where each element has:

{
  "infinitive": "se lever",
  "translation": "to get up",
  "frequency": "top100",  // one of: top20, top50, top100, top500, top1000, rare
  "hint": "get up; also: se lever contre = rise against",  // null if not useful; max 10 words
  "conjugations": {
    "présent":              { "je": "je me lève", "tu": "tu te lèves", "il/elle/on": "il se lève", "nous": "nous nous levons", "vous": "vous vous levez", "ils/elles": "ils se lèvent" },
    "passé composé":        { "je": "je me suis levé", "tu": "tu t'es levé", "il/elle/on": "il s'est levé", "nous": "nous nous sommes levés", "vous": "vous vous êtes levés", "ils/elles": "ils se sont levés" },
    "imparfait":            { "je": "je me levais", ... },
    "futur simple":         { "je": "je me lèverai", ... },
    "plus-que-parfait":     { "je": "je m'étais levé", ... },
    "conditionnel présent": { "je": "je me lèverais", ... },
    "subjonctif présent":   { "je": "que je me lève", ... }
  },
  "sentences": [
    {
      "tense": "présent",
      "pronoun": "je",
      "sentence": "Je me lève à sept heures du matin.",
      "translation": "I get up at seven in the morning.",
      "gap_sentence": "Je me [VERB] à sept heures du matin."
    },
    ...
  ]
}

Rules:
- Conjugations: "il/elle/on" key uses "il" form only; "ils/elles" key uses "ils" form only
- passé composé and plus-que-parfait: ALL reflexive verbs take être (je me suis levé, NOT j'ai levé)
- subjonctif présent: prefix with "que" (e.g. "que je me lève")
- sentences: provide exactly 2 sentences per tense (14 total per verb), varying pronouns naturally
- gap_sentence: mark ONLY the conjugated verb form (not the reflexive pronoun) with [VERB]
  Example: "Je me [VERB] tôt." (not "[VERB] tôt" or "Je [VERB] tôt")
- frequency: estimate based on how common the verb is in everyday spoken French
- hint: only if the verb has important nuance, polysemy, or is easily confused; null otherwise
- Return valid JSON only — no markdown, no code fences
"""


def generate_batch(client, verbs):
    user_msg = f"Generate data for these reflexive verbs: {json.dumps(verbs, ensure_ascii=False)}"
    resp = client.chat.completions.create(
        model="gpt-4o",
        max_tokens=16000,
        temperature=0.2,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_msg},
        ]
    )
    text = resp.choices[0].message.content.strip()
    # Strip markdown code fences if present
    text = re.sub(r'^```(?:json)?\s*', '', text)
    text = re.sub(r'\s*```$', '', text)
    return json.loads(text)


def load_existing():
    if OUTPUT_FILE.exists():
        return json.loads(OUTPUT_FILE.read_text(encoding="utf-8"))
    return {"verbs": [], "processed": []}


def save(data):
    OUTPUT_FILE.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


def main():
    client = OpenAI()
    data = load_existing()
    processed = set(data["processed"])

    to_process = [v for v in REFLEXIVE_VERBS if v not in processed]
    print(f"Verbs to process: {len(to_process)} (already done: {len(processed)})")

    for i in range(0, len(to_process), BATCH_SIZE):
        batch = to_process[i:i + BATCH_SIZE]
        print(f"\nBatch {i // BATCH_SIZE + 1}: {batch}")
        success = False
        for attempt in range(3):
            try:
                results = generate_batch(client, batch)
                for verb_data in results:
                    entry = {
                        "infinitive": verb_data["infinitive"],
                        "translation": verb_data.get("translation", ""),
                        "frequency": verb_data.get("frequency", "top500"),
                        "hint": verb_data.get("hint"),
                        "reflexive": True,
                        "conjugations": verb_data.get("conjugations", {}),
                        "sentences": verb_data.get("sentences", []),
                    }
                    data["verbs"].append(entry)
                    data["processed"].append(verb_data["infinitive"])
                    print(f"  ✓ {verb_data['infinitive']} — {verb_data.get('translation', '')} "
                          f"({len(verb_data.get('sentences', []))} sentences)")
                save(data)
                processed = set(data["processed"])
                success = True
                break
            except Exception as e:
                print(f"  ✗ Attempt {attempt+1} error: {e}")
                if attempt < 2:
                    print(f"  Retrying in 3s...")
                    time.sleep(3)
        if not success:
            print(f"  ⚠ Skipping batch after 3 failures: {batch}")

        time.sleep(0.5)

    print(f"\n✅ Done. {len(data['verbs'])} reflexive verbs saved to {OUTPUT_FILE}")
    print("Next: python3 append_reflexive.py")


if __name__ == "__main__":
    main()
