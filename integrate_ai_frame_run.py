#!/usr/bin/env python3
"""
Integrate an AI frame-generation run into the source-side frame-card deck.

This script:
- reads an AI run folder from generate_ai_frame_usages.py
- normalizes usable candidates into the existing frame-card schema
- appends them to the current source deck
- writes refreshed verb_frames.generated.json / verb_frames.js / review markdown

It does not touch dist/ or deploy artifacts.
"""

from __future__ import annotations

import argparse
import json
import re
from collections import Counter
from pathlib import Path

from frame_cards_lib import (
    OUTPUT_JS,
    OUTPUT_JSON,
    REVIEW_MD,
    forms_for_validation,
    load_present_tenses,
    normalize_sentence,
    split_subject_and_answer,
    write_js,
    write_json,
)


ROOT = Path(__file__).parent
RUNS_ROOT = ROOT / "_ai_frame_runs"
PREP_SURFACES = {"à", "au", "aux", "à la", "à l'", "de", "du", "des", "de la", "de l'", "d'"}
NOISY_GAP_TOKENS = {"pas", "jamais", "plus", "souvent", "toujours", "encore", "vite", "trop"}
SUBJECT_PREFIX_RE = re.compile(r"^(J'|Je |Tu |Il |Elle |On |Nous |Vous |Ils |Elles )", re.IGNORECASE)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Integrate an AI frame run into verb_frames.")
    parser.add_argument("--run-dir", help="Explicit AI run dir. Defaults to latest under _ai_frame_runs.")
    parser.add_argument("--write-review", action="store_true", help="Also write a small integration review summary.")
    return parser


def latest_run_dir() -> Path:
    candidates = sorted((path for path in RUNS_ROOT.glob("frame_usages_*") if path.is_dir()), reverse=True)
    if not candidates:
        raise SystemExit("No AI frame runs found under _ai_frame_runs.")
    return candidates[0]


def normalize_text(value: str) -> str:
    text = str(value or "").strip()
    text = text.replace("\u2019", "'").replace("\u2018", "'").replace("\u02bc", "'")
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def derive_question_and_answer(verb: str, sentence: str, hidden_chunk: str, present_tenses: dict[str, dict[str, str]]) -> tuple[str, str] | None:
    sentence = normalize_sentence(sentence)
    hidden_chunk = normalize_text(hidden_chunk)
    if not sentence or not hidden_chunk or hidden_chunk not in sentence:
        return None

    answer = hidden_chunk
    question = None
    if sentence.startswith(hidden_chunk):
        valid_forms = sorted(forms_for_validation(verb, present_tenses), key=len, reverse=True)
        matched_full_form = next((form for form in valid_forms if hidden_chunk.lower().startswith(form.lower())), None)
        if matched_full_form:
            subject, answer_base = split_subject_and_answer(matched_full_form)
            suffix = hidden_chunk[len(matched_full_form):].strip()
            answer = f"{answer_base} {suffix}".strip()
            gap = " ".join(["____"] * len(answer.split()))
            remainder = sentence[len(hidden_chunk):].strip()
            if subject.endswith("'"):
                prefix = f"{subject}{gap}"
            else:
                prefix = f"{subject} {gap}"
            question = normalize_sentence(f"{prefix} {remainder}".strip())

    if not question:
        gap = " ".join(["____"] * len(answer.split()))
        question = normalize_sentence(sentence.replace(hidden_chunk, gap, 1))

    return question, answer


def should_reject_candidate(candidate: dict) -> tuple[bool, str]:
    answer = normalize_text(candidate.get("answer", ""))
    frame_type = normalize_text(candidate.get("frame_type", ""))
    if not answer:
        return True, "missing_answer"
    answer_tokens = answer.lower().split()
    if any(token in NOISY_GAP_TOKENS for token in answer_tokens):
        return True, "noisy_gap"
    if frame_type in {"a_object", "de_object", "combo_a"}:
        attached_preposition = normalize_text(candidate.get("attached_preposition", ""))
        if attached_preposition and attached_preposition not in answer:
            return True, "missing_attached_prep"
    return False, ""


def normalize_ai_candidate(candidate: dict, present_tenses: dict[str, dict[str, str]]) -> tuple[dict | None, str]:
    verb = normalize_text(candidate.get("verb", ""))
    frame_type = normalize_text(candidate.get("frame_type", ""))
    sentence = normalize_sentence(candidate.get("full_answer", ""))
    hidden_chunk = normalize_text(candidate.get("answer", ""))
    if not verb or not frame_type or not sentence or not hidden_chunk:
        return None, "missing_core_fields"

    reject, reason = should_reject_candidate(candidate)
    if reject:
        return None, reason

    derived = derive_question_and_answer(verb, sentence, hidden_chunk, present_tenses)
    if not derived:
        return None, "question_derivation_failed"
    question, answer = derived

    if SUBJECT_PREFIX_RE.match(answer):
        return None, "subject_still_in_answer"

    normalized = {
        "frame_id": normalize_text(candidate.get("frame_id", "")) or f"{verb}:ai:{frame_type}",
        "verb": verb,
        "type": "frame",
        "tense": "present",
        "question": question,
        "answer": answer,
        "full_answer": sentence,
        "frame_type": frame_type,
        "source": normalize_text(candidate.get("source", "")) or f"ai:{frame_type}",
    }
    return normalized, ""


def build_review(base_count: int, added: list[dict], rejected: Counter[str], run_dir: Path) -> str:
    lines = [
        "# AI Frame Integration Review",
        "",
        f"- Source run: `{run_dir.name}`",
        f"- Base cards before integration: `{base_count}`",
        f"- AI cards integrated: `{len(added)}`",
        f"- New total cards: `{base_count + len(added)}`",
        "",
        "## Added by Frame Type",
        "",
    ]
    added_counts = Counter(card["frame_type"] for card in added)
    if added_counts:
        for frame_type, total in sorted(added_counts.items()):
            lines.append(f"- `{frame_type}`: `{total}`")
    else:
        lines.append("- None")

    lines.extend(["", "## Rejected AI Candidates", ""])
    if rejected:
        for reason, total in sorted(rejected.items()):
            lines.append(f"- `{reason}`: `{total}`")
    else:
        lines.append("- None")

    lines.extend(["", "## Sample Added Cards", ""])
    if added:
        for card in added[:30]:
            lines.append(f"- `{card['verb']}` `{card['frame_type']}`: `{card['question']}` -> `{card['answer']}`")
    else:
        lines.append("- None")

    return "\n".join(lines).rstrip() + "\n"


def main() -> None:
    args = build_parser().parse_args()
    run_dir = Path(args.run_dir).expanduser().resolve() if args.run_dir else latest_run_dir()
    valid_candidates_path = run_dir / "valid_candidates.json"
    if not valid_candidates_path.exists():
        raise SystemExit(f"Missing valid_candidates.json in {run_dir}")

    present_tenses = load_present_tenses()
    base_cards = load_json(OUTPUT_JSON) if OUTPUT_JSON.exists() else []
    ai_candidates = load_json(valid_candidates_path)

    added: list[dict] = []
    rejected: Counter[str] = Counter()
    existing_keys = {(card.get("verb"), card.get("frame_type"), normalize_sentence(card.get("full_answer", ""))) for card in base_cards}

    for candidate in ai_candidates:
        normalized, reject_reason = normalize_ai_candidate(candidate, present_tenses)
        if not normalized:
            rejected[reject_reason] += 1
            continue
        key = (normalized["verb"], normalized["frame_type"], normalize_sentence(normalized["full_answer"]))
        if key in existing_keys:
            rejected["duplicate_full_answer"] += 1
            continue
        existing_keys.add(key)
        added.append(normalized)

    merged_cards = sorted(base_cards + added, key=lambda card: (card["verb"], card["frame_id"]))
    write_json(OUTPUT_JSON, merged_cards)
    write_js(OUTPUT_JS, merged_cards)
    if args.write_review:
        REVIEW_MD.write_text(build_review(len(base_cards), added, rejected, run_dir), encoding="utf-8")

    print(f"Integrated {len(added)} AI cards from {run_dir.name}")
    print(f"Rejected {sum(rejected.values())} AI candidates")
    print(f"New total: {len(merged_cards)}")


if __name__ == "__main__":
    main()
