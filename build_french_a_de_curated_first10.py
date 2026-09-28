#!/usr/bin/env python3
"""
Build a deterministic curated French A/De dataset for the first 10 categories.

This script does not depend on fresh model calls. It:
- starts from the cleaned gpt-5.4 phrase-harvest run
- defines a vetted target inventory of learner-relevant a/de families
- picks the best existing covered row for each target when available
- injects a small set of hand-written rows for the remaining gaps
- verifies manual rows mechanically with the local Stanza-backed classifier
- writes a compact final dataset with 100% coverage on the curated target list
"""

from __future__ import annotations

import json
from collections import defaultdict
from pathlib import Path

from generate_category_phrase_harvest import load_category_spec, load_dicovalence_hints, mechanical_judgment_for_row


ROOT = Path(__file__).parent
SOURCE_MANIFEST = ROOT / "overnight_phrase_harvest_compare" / "20260424_114315_rescored_v3" / "manifest.json"
OUT_TARGETS = ROOT / "french_a_de_curated_targets.first10.json"
OUT_DATASET = ROOT / "french_a_de_curated_dataset.first10.json"
OUT_REPORT = ROOT / "french_a_de_curated_dataset.first10.md"


CURATED_TARGETS = [
    {"category_id": "builtin-cooking-food", "verb": "goûter", "family": "a", "accepted_labels": ["a_selected"], "reason": "sample/taste X"},
    {"category_id": "builtin-cooking-food", "verb": "servir", "family": "a", "accepted_labels": ["a_selected"], "reason": "serve something to someone"},
    {"category_id": "builtin-cooking-food", "verb": "servir", "family": "de", "accepted_labels": ["de_selected"], "reason": "use as / serve as"},
    {"category_id": "builtin-cooking-food", "verb": "verser", "family": "a", "accepted_labels": ["a_selected"], "reason": "pour/pay into/to"},
    {"category_id": "builtin-history-culture", "verb": "raconter", "family": "a", "accepted_labels": ["a_selected"], "reason": "tell something to someone"},
    {"category_id": "builtin-music", "verb": "accorder", "family": "a", "accepted_labels": ["a_selected"], "reason": "grant/tune to"},
    {"category_id": "builtin-music", "verb": "répéter", "family": "a", "accepted_labels": ["a_selected"], "reason": "repeat to someone"},
    {"category_id": "builtin-nightlife-partying", "verb": "sortir", "family": "de", "accepted_labels": ["de_selected", "de_source_or_location"], "reason": "movement/source allowed"},
    {"category_id": "builtin-nightlife-partying", "verb": "trinquer", "family": "a", "accepted_labels": ["a_selected"], "reason": "toast to"},
    {"category_id": "builtin-politics-current-events", "verb": "accuser", "family": "de", "accepted_labels": ["de_selected"], "reason": "accuse of"},
    {"category_id": "builtin-politics-current-events", "verb": "discuter", "family": "de", "accepted_labels": ["de_selected"], "reason": "discuss"},
    {"category_id": "builtin-politics-current-events", "verb": "dénoncer", "family": "a", "accepted_labels": ["a_selected"], "reason": "report to"},
    {"category_id": "builtin-politics-current-events", "verb": "traiter", "family": "de", "accepted_labels": ["de_selected"], "reason": "deal with / treat of"},
    {"category_id": "builtin-sports-fitness", "verb": "changer", "family": "de", "accepted_labels": ["de_selected"], "reason": "change from/of"},
    {"category_id": "builtin-sports-fitness", "verb": "défendre", "family": "a", "accepted_labels": ["a_selected"], "reason": "forbid to"},
    {"category_id": "builtin-sports-fitness", "verb": "lancer", "family": "a", "accepted_labels": ["a_selected"], "reason": "throw/pass to"},
    {"category_id": "builtin-sports-fitness", "verb": "marquer", "family": "de", "accepted_labels": ["de_selected"], "reason": "mark with"},
    {"category_id": "builtin-sports-fitness", "verb": "passer", "family": "a", "accepted_labels": ["a_selected", "a_movement_or_location"], "reason": "pass to / movement allowed"},
    {"category_id": "builtin-super-everyday", "verb": "arriver", "family": "a", "accepted_labels": ["a_selected", "a_movement_or_location"], "reason": "movement allowed"},
    {"category_id": "builtin-super-everyday", "verb": "attendre", "family": "de", "accepted_labels": ["de_selected"], "reason": "expect from"},
    {"category_id": "builtin-super-everyday", "verb": "demander", "family": "a", "accepted_labels": ["a_selected"], "reason": "ask someone"},
    {"category_id": "builtin-super-everyday", "verb": "donner", "family": "a", "accepted_labels": ["a_selected"], "reason": "give to"},
    {"category_id": "builtin-super-everyday", "verb": "envoyer", "family": "a", "accepted_labels": ["a_selected"], "reason": "send to"},
    {"category_id": "builtin-super-everyday", "verb": "laisser", "family": "a", "accepted_labels": ["a_selected", "a_movement_or_location"], "reason": "leave to"},
    {"category_id": "builtin-super-everyday", "verb": "montrer", "family": "a", "accepted_labels": ["a_selected"], "reason": "show to"},
    {"category_id": "builtin-super-everyday", "verb": "parler", "family": "a", "accepted_labels": ["a_selected"], "reason": "speak to"},
    {"category_id": "builtin-super-everyday", "verb": "parler", "family": "de", "accepted_labels": ["de_selected"], "reason": "talk about"},
    {"category_id": "builtin-super-everyday", "verb": "passer", "family": "a", "accepted_labels": ["a_selected", "a_movement_or_location"], "reason": "pass to / movement allowed"},
    {"category_id": "builtin-super-everyday", "verb": "payer", "family": "a", "accepted_labels": ["a_selected"], "reason": "pay someone / treat someone"},
    {"category_id": "builtin-super-everyday", "verb": "sortir", "family": "de", "accepted_labels": ["de_selected", "de_source_or_location"], "reason": "movement/source allowed"},
    {"category_id": "builtin-super-everyday", "verb": "travailler", "family": "a", "accepted_labels": ["a_selected"], "reason": "work on"},
    {"category_id": "builtin-super-everyday", "verb": "trouver", "family": "a", "accepted_labels": ["a_selected"], "reason": "find interest/charm in"},
    {"category_id": "builtin-super-everyday", "verb": "venir", "family": "a", "accepted_labels": ["a_selected", "a_movement_or_location"], "reason": "movement allowed"},
]


MANUAL_ROWS = {
    ("builtin-cooking-food", "servir", "de"): {
        "sentence_fr": "Cette grande assiette sert de plat de service ce soir.",
        "translation_en": "This large plate is serving as the serving dish tonight.",
        "tense": "present",
        "subject": "cette grande assiette",
        "note": "manual_curated_backfill",
    },
    ("builtin-music", "répéter", "a"): {
        "sentence_fr": "Je répète la consigne aux choristes avant l'entrée.",
        "translation_en": "I repeat the instruction to the choir before the entrance.",
        "tense": "present",
        "subject": "je",
        "note": "manual_curated_backfill",
    },
    ("builtin-politics-current-events", "traiter", "de"): {
        "sentence_fr": "Le débat traite de la réforme du scrutin ce soir.",
        "translation_en": "The debate is about electoral reform tonight.",
        "tense": "present",
        "subject": "le débat",
        "note": "manual_curated_backfill",
    },
    ("builtin-sports-fitness", "défendre", "a"): {
        "sentence_fr": "Le coach défend aux jeunes l'usage du téléphone dans le vestiaire.",
        "translation_en": "The coach forbids the younger players from using phones in the locker room.",
        "tense": "present",
        "subject": "le coach",
        "note": "manual_curated_backfill",
    },
    ("builtin-super-everyday", "attendre", "de"): {
        "sentence_fr": "J'attends de Paul un message avant midi.",
        "translation_en": "I'm expecting a message from Paul before noon.",
        "tense": "present",
        "subject": "je",
        "note": "manual_curated_backfill",
    },
    ("builtin-super-everyday", "arriver", "a"): {
        "sentence_fr": "Le train arrive à la gare avant huit heures.",
        "translation_en": "The train arrives at the station before eight o'clock.",
        "tense": "present",
        "subject": "le train",
        "note": "manual_curated_backfill",
    },
    ("builtin-super-everyday", "montrer", "a"): {
        "sentence_fr": "Je montre la photo à ma sœur dans le métro.",
        "translation_en": "I show the photo to my sister on the subway.",
        "tense": "present",
        "subject": "je",
        "note": "manual_curated_backfill",
    },
    ("builtin-super-everyday", "payer", "a"): {
        "sentence_fr": "Je paie un café au collègue avant le train.",
        "translation_en": "I buy my coworker a coffee before the train.",
        "tense": "present",
        "subject": "je",
        "note": "manual_curated_backfill",
    },
    ("builtin-super-everyday", "sortir", "de"): {
        "sentence_fr": "Je sors de la boulangerie avec le pain chaud.",
        "translation_en": "I come out of the bakery with warm bread.",
        "tense": "present",
        "subject": "je",
        "note": "manual_curated_backfill",
    },
    ("builtin-super-everyday", "trouver", "a"): {
        "sentence_fr": "Je trouve un intérêt à ce podcast pendant mes trajets.",
        "translation_en": "I find this podcast genuinely interesting during my commute.",
        "tense": "present",
        "subject": "je",
        "note": "manual_curated_backfill",
    },
    ("builtin-super-everyday", "travailler", "a"): {
        "sentence_fr": "Je travaille à mon dossier pendant le trajet.",
        "translation_en": "I'm working on my file during the commute.",
        "tense": "present",
        "subject": "je",
        "note": "manual_curated_backfill",
    },
}


FORCE_MANUAL_KEYS = {
    ("builtin-cooking-food", "servir", "de"),
    ("builtin-music", "répéter", "a"),
    ("builtin-politics-current-events", "traiter", "de"),
    ("builtin-sports-fitness", "défendre", "a"),
    ("builtin-super-everyday", "arriver", "a"),
    ("builtin-super-everyday", "attendre", "de"),
    ("builtin-super-everyday", "montrer", "a"),
    ("builtin-super-everyday", "payer", "a"),
    ("builtin-super-everyday", "sortir", "de"),
    ("builtin-super-everyday", "travailler", "a"),
    ("builtin-super-everyday", "trouver", "a"),
}


def load_runs() -> list[dict]:
    manifest = json.loads(SOURCE_MANIFEST.read_text(encoding="utf-8"))
    return [run for run in manifest.get("runs", []) if run["model"] == "gpt-5.4"]


def load_rows_by_category_and_verb(runs: list[dict]) -> dict[tuple[str, str], list[dict]]:
    rows_by_key: dict[tuple[str, str], list[dict]] = defaultdict(list)
    for run in runs:
        data = json.loads(Path(f"{run['out_prefix']}.json").read_text(encoding="utf-8"))
        for row in data:
            normalized = dict(row)
            normalized["category_id"] = run["category_id"]
            normalized["category_name"] = run["category_name"]
            rows_by_key[(run["category_id"], row["verb"])].append(normalized)
    return rows_by_key


def label_rank(label: str) -> int:
    order = {
        "a_selected": 0,
        "de_selected": 0,
        "a_movement_or_location": 1,
        "de_source_or_location": 1,
        "none": 5,
        "uncertain": 6,
    }
    return order.get(label, 9)


def judge_source_rank(source: str) -> int:
    order = {
        "mechanical": 0,
        "llm": 1,
        "llm_missing_fallback": 4,
        "llm_error_fallback": 5,
        "manual_mechanical": 0,
    }
    return order.get(source or "", 3)


def tense_rank(tense: str) -> int:
    order = {
        "present": 0,
        "futur proche": 1,
        "future": 2,
        "passé composé": 3,
        "imparfait": 4,
    }
    return order.get(tense or "", 9)


def pick_best_existing_row(rows: list[dict], accepted_labels: set[str]) -> dict | None:
    candidates = [row for row in rows if row.get("bonus_label") in accepted_labels]
    if not candidates:
        return None
    candidates.sort(
        key=lambda row: (
            label_rank(row.get("bonus_label", "")),
            judge_source_rank(row.get("judge_source", "")),
            tense_rank(row.get("tense", "")),
            len(row.get("sentence_fr", "")),
        )
    )
    return candidates[0]


def build_manual_row(target: dict) -> dict:
    key = (target["category_id"], target["verb"], target["family"])
    if key not in MANUAL_ROWS:
        raise KeyError(f"Missing manual row for {key}")
    base = MANUAL_ROWS[key]
    row = {
        "category_id": target["category_id"],
        "category_name": load_category_spec(target["category_id"])["name"],
        "verb": target["verb"],
        "sentence_fr": base["sentence_fr"],
        "translation_en": base["translation_en"],
        "tense": base["tense"],
        "subject": base["subject"],
        "note": base["note"],
    }
    hints = load_dicovalence_hints(target["category_id"])
    verdict = mechanical_judgment_for_row(row, hints=hints)
    if verdict.get("label") not in set(target["accepted_labels"]):
        raise ValueError(f"Manual row for {key} did not validate: {verdict}")
    row["bonus_label"] = verdict["label"]
    row["bonus_reason"] = verdict.get("reason", "")
    row["judge_source"] = "manual_mechanical"
    return row


def build_dataset() -> list[dict]:
    runs = load_runs()
    rows_by_key = load_rows_by_category_and_verb(runs)
    dataset = []
    for target in CURATED_TARGETS:
        category = load_category_spec(target["category_id"])
        accepted = set(target["accepted_labels"])
        key = (target["category_id"], target["verb"], target["family"])
        existing = None if key in FORCE_MANUAL_KEYS else pick_best_existing_row(rows_by_key.get((target["category_id"], target["verb"]), []), accepted)
        if existing is None:
            chosen = build_manual_row(target)
            source = "manual_backfill"
        else:
            chosen = dict(existing)
            source = "existing_gpt_5_4_cleaned"

        dataset.append(
            {
                "category_id": target["category_id"],
                "category_name": category["name"],
                "scope": category["scope"],
                "verb": target["verb"],
                "family": target["family"],
                "accepted_labels": target["accepted_labels"],
                "target_reason": target["reason"],
                "source": source,
                "sentence_fr": chosen["sentence_fr"],
                "translation_en": chosen["translation_en"],
                "tense": chosen.get("tense", ""),
                "subject": chosen.get("subject", ""),
                "note": chosen.get("note", ""),
                "bonus_label": chosen["bonus_label"],
                "bonus_reason": chosen.get("bonus_reason", ""),
                "judge_source": chosen.get("judge_source", ""),
            }
        )
    return dataset


def write_outputs(dataset: list[dict]) -> None:
    OUT_TARGETS.write_text(json.dumps(CURATED_TARGETS, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    OUT_DATASET.write_text(json.dumps(dataset, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    by_category: dict[str, list[dict]] = defaultdict(list)
    manual_count = 0
    for row in dataset:
        by_category[row["category_id"]].append(row)
        if row["source"] == "manual_backfill":
            manual_count += 1

    lines = [
        "# French A/De Curated Dataset (First 10 Categories)",
        "",
        f"- Target count: `{len(dataset)}`",
        f"- Coverage: `{len(dataset)}/{len(CURATED_TARGETS)}`",
        f"- Existing kept rows: `{len(dataset) - manual_count}`",
        f"- Manual backfills: `{manual_count}`",
        "",
        "## By Category",
        "",
        "| Category | Targets | Manual |",
        "| --- | ---: | ---: |",
    ]

    for category_id, rows in sorted(by_category.items()):
        category_name = rows[0]["category_name"]
        category_manual = sum(1 for row in rows if row["source"] == "manual_backfill")
        lines.append(f"| {category_name} | {len(rows)} | {category_manual} |")

    lines.extend(
        [
            "",
            "## Rows",
            "",
            "| Category | Verb | Family | Label | Source | French |",
            "| --- | --- | --- | --- | --- | --- |",
        ]
    )
    for row in dataset:
        lines.append(
            f"| {row['category_name']} | {row['verb']} | {row['family']} | {row['bonus_label']} | {row['source']} | {row['sentence_fr'].replace('|', '/')} |"
        )

    OUT_REPORT.write_text("\n".join(lines).rstrip() + "\n", encoding="utf-8")


def main() -> None:
    dataset = build_dataset()
    if len(dataset) != len(CURATED_TARGETS):
        raise RuntimeError("Coverage is incomplete.")
    write_outputs(dataset)
    print(f"Wrote curated dataset with {len(dataset)}/{len(CURATED_TARGETS)} coverage to {OUT_DATASET}")


if __name__ == "__main__":
    main()
