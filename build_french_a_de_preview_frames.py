#!/usr/bin/env python3
from __future__ import annotations

import json
import re
from pathlib import Path


ROOT = Path(__file__).parent
CURATED_DATASET = ROOT / "french_a_de_curated_dataset.all18.json"
VERBS_JS = ROOT / "js" / "verbs.full.generated.js"
OUT_JSON = ROOT / "verb_frames.curated_a_de_preview.generated.json"
OUT_JS = ROOT / "verb_frames.curated_a_de_preview.js"
OUT_MD = ROOT / "verb_frames.curated_a_de_preview.md"

TENSE_KEY_MAP = {
    "present": "present",
    "passé composé": "passeCompose",
}


def load_tenses() -> dict:
    text = VERBS_JS.read_text(encoding="utf-8")
    match = re.search(r"const tenses = (\{[\s\S]*?\});\n\nconst pronouns =", text)
    if not match:
        raise ValueError("Could not parse tenses from verbs.full.generated.js")
    return json.loads(match.group(1))


def normalize_sentence(text: str) -> str:
    sentence = str(text or "").strip()
    sentence = re.sub(r"\s+", " ", sentence)
    sentence = sentence.replace(" ’", "’").replace(" '", "'")
    sentence = re.sub(r"[.?!]+$", "", sentence)
    return sentence.strip()


def split_subject_and_answer(full_form: str) -> tuple[str, str]:
    if full_form.startswith("j'"):
        return "j'", full_form[2:]
    if " " not in full_form:
        raise ValueError(f"Could not split subject from form: {full_form}")
    subject, answer = full_form.split(" ", 1)
    return subject, answer


def present_answer_candidates(verb: str, tenses: dict) -> list[str]:
    rows = (tenses.get("present", {}) or {}).get(verb, {}) or {}
    answers = set()
    for full_form in rows.values():
        full_form = str(full_form or "").strip()
        if not full_form:
            continue
        try:
            _, answer = split_subject_and_answer(full_form)
        except ValueError:
            answer = full_form
        answers.add(answer.strip())
    return sorted(answers, key=len, reverse=True)


def find_subject_prefix(sentence: str, subject: str) -> tuple[int, int]:
    normalized_subject = str(subject or "").strip()
    patterns = [rf"^{re.escape(normalized_subject)}\s+"]
    if normalized_subject.lower() == "je":
        patterns.insert(0, r"^j'")
    match = None
    for pattern in patterns:
        match = re.match(pattern, sentence, flags=re.IGNORECASE)
        if match:
            break
    if not match:
        raise ValueError(f"Could not match subject prefix {subject!r} in {sentence!r}")
    return match.start(), match.end()


def find_conjugated_surface(sentence: str, subject: str, verb: str, tenses: dict) -> tuple[str, int, int]:
    _, subject_end = find_subject_prefix(sentence, subject)
    remainder = sentence[subject_end:]
    for candidate in present_answer_candidates(verb, tenses):
        match = re.search(
            rf"(?<![A-Za-zÀ-ÖØ-öø-ÿ]){re.escape(candidate)}(?![A-Za-zÀ-ÖØ-öø-ÿ])",
            remainder,
            flags=re.IGNORECASE,
        )
        if match:
            start = subject_end + match.start()
            end = subject_end + match.end()
            return sentence[start:end], start, end
    fallback = re.search(
        rf"(?<![A-Za-zÀ-ÖØ-öø-ÿ]){re.escape(verb)}(?![A-Za-zÀ-ÖØ-öø-ÿ])",
        remainder,
        flags=re.IGNORECASE,
    )
    if fallback:
        start = subject_end + fallback.start()
        end = subject_end + fallback.end()
        return sentence[start:end], start, end
    raise ValueError(f"Could not find present conjugated surface for {verb} in {sentence!r}")


def find_surface_after(sentence: str, search_start: int, family: str) -> tuple[str, int, int]:
    haystack = sentence[search_start:]
    candidates: list[tuple[int, int, str]] = []

    if family == "a":
        patterns = [
            r"\baux\b",
            r"\bau\b",
            r"à(?=\s|l')",
        ]
    elif family == "de":
        patterns = [
            r"\bdes\b",
            r"\bdu\b",
            r"d'",
            r"de(?=\s|l'|la\b)",
        ]
    else:
        raise ValueError(f"Unsupported family: {family}")

    for pattern in patterns:
        match = re.search(pattern, haystack, flags=re.IGNORECASE)
        if match:
            candidates.append((match.start(), match.end(), haystack[match.start():match.end()]))

    if not candidates:
        raise ValueError(f"Could not find {family} surface in {sentence!r}")

    start_rel, end_rel, surface = sorted(candidates, key=lambda item: (item[0], -(item[1] - item[0])))[0]
    return surface, search_start + start_rel, search_start + end_rel


def replace_span(text: str, start: int, end: int, replacement: str) -> str:
    return f"{text[:start]}{replacement}{text[end:]}"


def frame_type_for_family(family: str) -> str:
    if family == "a":
        return "a_object"
    if family == "de":
        return "de_object"
    raise ValueError(f"Unsupported family: {family}")


def build_row(row: dict, tenses: dict, family_counter: dict[tuple[str, str], int]) -> dict:
    sentence = normalize_sentence(row["sentence_fr"])
    subject = str(row.get("subject") or "").strip()
    family = str(row["family"]).strip()
    if row.get("tense") != "present":
        raise ValueError("preview builder currently supports present tense only")

    conjugated, verb_start, verb_end = find_conjugated_surface(sentence, subject, row["verb"], tenses)
    prep_surface, prep_start, prep_end = find_surface_after(sentence, verb_end, family)

    question = sentence
    question = replace_span(question, prep_start, prep_end, "____")
    verb_end_adjusted = verb_end
    if prep_start < verb_end:
        verb_end_adjusted += 4 - (prep_end - prep_start)
    question = replace_span(question, verb_start, verb_end_adjusted, "____")
    question = re.sub(r"\s+", " ", question).strip()
    answer = f"{conjugated} {prep_surface}".strip()

    frame_key = (row["verb"], family)
    family_counter[frame_key] = family_counter.get(frame_key, 0) + 1
    ordinal = family_counter[frame_key]

    return {
        "frame_id": f"{row['verb']}_{frame_type_for_family(family)}_{ordinal:02d}",
        "verb": row["verb"],
        "type": "frame",
        "tense": "present",
        "question": question,
        "answer": answer,
        "full_answer": sentence,
        "frame_type": frame_type_for_family(family),
        "source": row.get("source") or "curated_a_de_preview",
        "meaning_en": row.get("translation_en") or "",
        "category_id": row.get("category_id") or "",
        "category_name": row.get("category_name") or "",
        "note": row.get("target_reason") or row.get("note") or "",
    }


def main() -> None:
    rows = json.loads(CURATED_DATASET.read_text(encoding="utf-8"))
    tenses = load_tenses()

    frame_rows = []
    skipped_non_present = []
    family_counter: dict[tuple[str, str], int] = {}

    for row in rows:
        tense = str(row.get("tense") or "").strip()
        if tense != "present":
            skipped_non_present.append(row)
            continue
        frame_rows.append(build_row(row, tenses, family_counter))

    OUT_JSON.write_text(json.dumps(frame_rows, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    OUT_JS.write_text("window.verbFrames = " + json.dumps(frame_rows, ensure_ascii=False, indent=2) + ";\n", encoding="utf-8")

    category_counts: dict[str, int] = {}
    for row in frame_rows:
        category_counts[row["category_name"]] = category_counts.get(row["category_name"], 0) + 1

    lines = [
        "# French A/De Preview Frames",
        "",
        f"- Generated frame cards: {len(frame_rows)}",
        f"- Skipped non-present curated rows: {len(skipped_non_present)}",
        "",
        "## Counts by category",
        "",
    ]
    for category_name, count in sorted(category_counts.items()):
        lines.append(f"- {category_name}: {count}")
    if skipped_non_present:
        lines.extend([
            "",
            "## Skipped for preview",
            "",
        ])
        for row in skipped_non_present:
            lines.append(f"- {row['verb']} · {row['tense']} · {row['sentence_fr']}")
    OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")

    print(f"Wrote {len(frame_rows)} frame cards to {OUT_JSON}")
    print(f"Skipped {len(skipped_non_present)} non-present rows")


if __name__ == "__main__":
    main()
