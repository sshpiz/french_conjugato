
import openai
import json
import os
from tqdm import tqdm
import time
import random
import re

openai.api_key = os.environ.get("OPENAI_API_KEY")
if not openai.api_key:
    raise RuntimeError("Set OPENAI_API_KEY in the environment before running this script.")

# === CONFIGURATION ===
use_external_verbs = True  # Set to False to use hardcoded verbs
external_verbs_file = "js/verbs.full.js"

# Fallback hardcoded verbs
fallback_verbs = ["aimer", "aller", "faire", "voir", "prendre"]

# Tenses and pronouns
tenses = ["présent", "passé composé", "imparfait", "futur simple", "plus-que-parfait", "conditionnel présent", "subjonctif présent"]
pronouns = ["je", "tu", "il", "elle", "nous", "vous", "ils", "elles"]

# Output file
output_file = "sentences.jsonl"  # JSON Lines format


# --- Load existing (verb, tense, pronoun) combos to avoid duplicates ---
existing_combos = set()
try:
    with open(output_file, "r", encoding="utf-8") as f:
        for line in f:
            try:
                entry = json.loads(line)
                key = (entry["verb"], entry["tense"], entry["pronoun"])
                existing_combos.add(key)
            except Exception:
                continue
except FileNotFoundError:
    pass


# === Load verb list ===
def load_verbs_from_js(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        js_content = f.read()
    matches = re.findall(r'"infinitive"\s*:\s*"([^"]+)"', js_content)
    return list(set(matches))  # Deduplicate

# Final verbs list
if use_external_verbs:
    verbs = load_verbs_from_js(external_verbs_file)
else:
    verbs = list(set(fallback_verbs))

# Prompt builder
def build_prompt(verb, tense, pronoun):
    return (
        f"Write a natural-sounding sentence in French using the verb '{verb}' "
        f"conjugated in the tense '{tense}', with the pronoun '{pronoun}'. "
        f"Keep the sentence simple and natural, like everyday conversation."
    )

# Generation function (new API for openai >= 1.0.0)
def generate_sentence(prompt, retries=3):
    for _ in range(retries):
        try:
            response = openai.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=50
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            print(f"Error: {e}")
            time.sleep(5)
    return None

print(len(existing_combos), "existing combinations found.")
# print(list(existing_combos)[:3])
# Run loop
todo = []
skipped = 0
for verb in (verbs):
    for tense in tenses:
            for pronoun in pronouns:
                key = (verb, tense, pronoun)
                if key not in existing_combos:
                    todo.append(key)
                else:
                    skipped += 1

print(len(todo),skipped, "new combinations to generate.")
with open(output_file, "a", encoding="utf-8") as f:
    for verb, tense, pronoun in tqdm(todo):
        key = (verb, tense, pronoun)
        prompt = build_prompt(verb, tense, pronoun)
        sentence = generate_sentence(prompt)
        if sentence:
            entry = {
                "verb": verb,
                "tense": tense,
                "pronoun": pronoun,
                "sentence": sentence
            }
            f.write(json.dumps(entry, ensure_ascii=False) + "\n")
            existing_combos.add(key)
