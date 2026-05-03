#!/usr/bin/env python3
"""Build sidecar fill-blank expansion datasets from existing usage examples.

This is deliberately conservative: it only creates cloze cards when an existing
native example contains a conjugated form that appears in the app's conjugation
table. The output is sidecar-only under each language repo's expansion/ folder.
"""

from __future__ import annotations

import json
import re
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any


ROOT = Path("/Users/simeon/Code/VerbsFirst")
SOURCE = "usage_cloze_expansion_from_existing_examples_2026_05_03"
MIN_ROWS = 320
MIN_VERBS = 80
DISALLOWED_TENSES = {"imperative"}


CONFIGS = {
    "it": {
        "repo": ROOT / "italian-verbs",
        "usage_file": "verb_usages.json",
        "frames_file": "verb_frames.generated.json",
        "app_js": "js/verbs.full.js",
        "language_name": "Italian",
    },
    "pt": {
        "repo": ROOT / "portuguese-verbs",
        "usage_file": "verb_usages.json",
        "frames_file": "verb_frames.portuguese.generated.json",
        "app_js": "js/verbs.full.js",
        "language_name": "Portuguese",
    },
    "ca": {
        "repo": ROOT / "catalan-verbs",
        "usage_file": "catalan_usages.json",
        "frames_file": "verb_frames.catalan.generated.json",
        "app_js": "js/verbs.full.js",
        "language_name": "Catalan",
    },
}


def extract_js_assignment(text: str, name: str) -> Any:
    start_match = re.search(rf"\bconst\s+{re.escape(name)}\s*=", text)
    if not start_match:
        raise RuntimeError(f"Could not find const {name}")
    start = text.find("=", start_match.end() - 1) + 1
    while start < len(text) and text[start].isspace():
        start += 1
    opener = text[start]
    closer = {"[": "]", "{": "}"}[opener]
    depth = 0
    in_str = False
    esc = False
    for i in range(start, len(text)):
        ch = text[i]
        if in_str:
            if esc:
                esc = False
            elif ch == "\\":
                esc = True
            elif ch == '"':
                in_str = False
            continue
        if ch == '"':
            in_str = True
        elif ch == opener:
            depth += 1
        elif ch == closer:
            depth -= 1
            if depth == 0:
                return json.loads(text[start : i + 1])
    raise RuntimeError(f"Could not parse const {name}")


def load_app_data(repo: Path, app_js: str) -> tuple[list[dict[str, Any]], dict[str, Any]]:
    text = (repo / app_js).read_text(encoding="utf-8")
    return extract_js_assignment(text, "verbs"), extract_js_assignment(text, "tenses")


def strip_subject_phrase(form: str, pronoun: str) -> str:
    form = form.strip()
    pronoun = pronoun.strip()
    if form.lower().startswith(pronoun.lower() + " "):
        return form[len(pronoun) :].strip()
    return form


def forms_for_verb(tenses: dict[str, Any], verb: str) -> list[tuple[str, str, str, str]]:
    forms: list[tuple[str, str, str, str]] = []
    seen: set[tuple[str, str]] = set()
    for tense, by_verb in tenses.items():
        rows = by_verb.get(verb)
        if not isinstance(rows, dict):
            continue
        for pronoun, raw in rows.items():
            if not raw:
                continue
            for option in str(raw).split("/"):
                answer = strip_subject_phrase(option, str(pronoun)).strip()
                if len(answer) < 2:
                    continue
                key = (tense, answer.lower())
                if key in seen:
                    continue
                seen.add(key)
                forms.append((answer, tense, str(pronoun), str(raw)))
    forms.sort(key=lambda row: len(row[0]), reverse=True)
    return forms


def find_answer(example: str, forms: list[tuple[str, str, str, str]]) -> tuple[str, str, str] | None:
    for answer, tense, pronoun, _raw in forms:
        if tense in DISALLOWED_TENSES:
            continue
        pattern = re.compile(rf"(?<![\wÀ-ÿ]){re.escape(answer)}(?![\wÀ-ÿ])", re.IGNORECASE)
        match = pattern.search(example)
        if match:
            return example[match.start() : match.end()], tense, pronoun
    return None


def normalize_question(example: str, answer: str) -> str:
    pattern = re.compile(rf"(?<![\wÀ-ÿ]){re.escape(answer)}(?![\wÀ-ÿ])", re.IGNORECASE)
    return pattern.sub("____", example, count=1)


def get_usage_example(row: dict[str, Any]) -> str:
    return str(row.get("example_fr") or row.get("example") or row.get("sentence") or "").strip()


def get_translation(row: dict[str, Any]) -> str:
    return str(row.get("example_en") or row.get("translation") or row.get("meaning_en") or "").strip()


def frequency_rank(value: str) -> int:
    match = re.search(r"(\d+)", value or "")
    return int(match.group(1)) if match else 999999


def select_rows(rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Prefer breadth first, then fill up to the target count."""
    buckets: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for row in rows:
        buckets[row["verb"]].append(row)
    selected: list[dict[str, Any]] = []
    for verb in sorted(buckets):
        selected.append(buckets[verb][0])
    second_pass = []
    for verb in sorted(buckets):
        second_pass.extend(buckets[verb][1:3])
    selected.extend(second_pass)
    if len(selected) < MIN_ROWS:
        already = {row["frame_id"] for row in selected}
        selected.extend(row for row in rows if row["frame_id"] not in already)
    return selected[: max(MIN_ROWS, len({row["verb"] for row in selected}) if selected else 0)]


def build_language(code: str, cfg: dict[str, Any]) -> None:
    repo = cfg["repo"]
    verbs, tenses = load_app_data(repo, cfg["app_js"])
    inventory = {str(v.get("infinitive")): v for v in verbs if v.get("infinitive")}
    usage_rows = json.loads((repo / cfg["usage_file"]).read_text(encoding="utf-8"))
    existing_frames = json.loads((repo / cfg["frames_file"]).read_text(encoding="utf-8"))
    existing_keys = {(f.get("verb"), f.get("question"), f.get("answer")) for f in existing_frames}

    candidates: list[dict[str, Any]] = []
    per_verb_count: Counter[str] = Counter()
    skipped = Counter()
    for usage in usage_rows:
        verb = str(usage.get("verb") or "").strip()
        if verb not in inventory:
            skipped["verb_not_in_inventory"] += 1
            continue
        example = get_usage_example(usage)
        translation = get_translation(usage)
        if not example or not translation:
            skipped["missing_example_or_translation"] += 1
            continue
        found = find_answer(example, forms_for_verb(tenses, verb))
        if not found:
            skipped["no_conjugated_form_match"] += 1
            continue
        answer, tense, pronoun = found
        if answer.strip().lower() == verb.lower():
            skipped["answer_is_infinitive"] += 1
            continue
        question = normalize_question(example, answer)
        if question == example or question.count("____") != 1:
            skipped["bad_blank"] += 1
            continue
        key = (verb, question, answer)
        if key in existing_keys:
            skipped["duplicate_existing_frame"] += 1
            continue
        per_verb_count[verb] += 1
        verb_meta = inventory.get(verb, {})
        candidates.append(
            {
                "frame_id": f"{code}_usage_cloze_{verb}_{per_verb_count[verb]:03d}",
                "language": code,
                "verb": verb,
                "type": "frame",
                "tense": tense,
                "subject": pronoun,
                "question": question,
                "answer": answer,
                "full_answer": example,
                "meaning_en": translation,
                "translation": translation,
                "frame_type": "usage_sentence_cloze",
                "source_pattern": str(usage.get("pattern") or ""),
                "category_name": "All verbs",
                "source": SOURCE,
                "needs_review": False,
                "usage_sense_id": str(usage.get("sense_id") or ""),
                "verb_frequency": str(verb_meta.get("frequency") or ""),
                "verb_translation": str(verb_meta.get("translation") or ""),
                "tags": usage.get("tags") or [],
            }
        )

    candidates.sort(
        key=lambda row: (
            frequency_rank(row.get("verb_frequency", "")),
            row["verb"],
            row["frame_id"],
        )
    )
    selected = select_rows(candidates)

    out_dir = repo / "expansion"
    out_dir.mkdir(exist_ok=True)
    out_json = out_dir / "fill_blanks_usage_cloze_expansion_20260503.json"
    out_audit = out_dir / "fill_blanks_usage_cloze_expansion_20260503.audit.md"
    out_validator = out_dir / "validate_fill_blanks_usage_cloze_expansion.py"

    out_json.write_text(json.dumps(selected, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    verbs_count = len({row["verb"] for row in selected})
    families = Counter(row["frame_type"] for row in selected)
    tenses_count = Counter(row["tense"] for row in selected)

    sample_lines = "\n".join(
        f"- `{row['question']}` -> `{row['answer']}` ({row['meaning_en']})"
        for row in selected[:12]
    )
    audit = f"""# {cfg['language_name']} usage-cloze fill blanks expansion

Generated: 2026-05-03

Source strategy: existing native usage examples + app conjugation table. No runtime files changed.

## Counts

- Questions: {len(selected)}
- Distinct verbs: {verbs_count}
- Launch gate target: {MIN_ROWS}+ questions and {MIN_VERBS}+ verbs
- Launch gate: {'PASS' if len(selected) >= MIN_ROWS and verbs_count >= MIN_VERBS else 'REVIEW'}

## Families

{json.dumps(dict(families), ensure_ascii=False, indent=2)}

## Tenses

{json.dumps(dict(tenses_count), ensure_ascii=False, indent=2)}

## Skipped source rows

{json.dumps(dict(skipped), ensure_ascii=False, indent=2)}

## Samples

{sample_lines}
"""
    out_audit.write_text(audit, encoding="utf-8")

    validator = f'''#!/usr/bin/env python3
import json
from pathlib import Path

path = Path(__file__).with_name("{out_json.name}")
rows = json.loads(path.read_text(encoding="utf-8"))
ids = [row.get("frame_id") for row in rows]
assert len(ids) == len(set(ids)), "duplicate frame_id"
assert all(row.get("question", "").count("____") == 1 for row in rows), "bad blank count"
assert all(row.get("answer") and row.get("translation") for row in rows), "missing answer/translation"
assert all(row.get("answer") not in row.get("question", "") for row in rows), "answer leaked in question"
verbs = {{row.get("verb") for row in rows}}
print(f"PASS rows={{len(rows)}} verbs={{len(verbs)}}")
'''
    out_validator.write_text(validator, encoding="utf-8")
    print(f"{code}: rows={len(selected)} verbs={verbs_count} -> {out_json}")


def main() -> None:
    for code, cfg in CONFIGS.items():
        build_language(code, cfg)


if __name__ == "__main__":
    main()
