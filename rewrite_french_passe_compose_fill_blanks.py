#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import os
import re
import sys
import time
from pathlib import Path
from typing import Any

from openai_env import load_openai_api_key

try:
    from openai import OpenAI
except ImportError:  # pragma: no cover
    OpenAI = None


SYSTEM_PROMPT = """You write native French fill-in-the-blank practice cards.

Goal:
- Create a NEW natural French passé composé sentence for each row.
- The new sentence should be similar in grammatical pattern, but not a mechanical tense rewrite and not a near-copy.
- Think like a native French speaker writing useful, vivid practice examples.

Hard rules:
- Keep the exact answer string exactly once in full_answer, as a contiguous substring.
- The answer is the hidden span. Do not alter spelling, apostrophes, agreement, or spacing inside the answer.
- The sentence must be passé composé, not present/future.
- Keep the construction natural for the verb and answer.
- Do not use underscores/blanks in full_answer.
- Avoid bizarre, uncanny, or textbook-stilted sentences.
- Avoid future markers like demain, ce soir when they make the passé composé sentence illogical.
- Return strict JSON only.

Return shape:
{"rows":[{"id":"...","full_answer":"...","meaning_en":"..."}]}
"""

PARTICLE_TAILS = {"à", "de", "d'", "d’", "au", "aux", "du", "des"}
ARTICLE_TAILS = {"la", "l'", "l’"}


def ensure_openai() -> None:
    load_openai_api_key()
    if OpenAI is None:
        sys.exit("openai package is not installed in the current Python environment.")
    if not os.environ.get("OPENAI_API_KEY"):
        sys.exit("OPENAI_API_KEY is not set.")


def load_rows(path: Path) -> list[dict[str, Any]]:
    rows = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(rows, list):
        raise ValueError(f"{path} must contain a top-level JSON list")
    return rows


def write_rows(path: Path, rows: list[dict[str, Any]]) -> None:
    path.write_text(json.dumps(rows, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def write_frame_js(path: Path, rows: list[dict[str, Any]]) -> None:
    path.write_text(
        "window.verbFrames = [\n"
        "  ...((Array.isArray(window.verbFrames) && window.verbFrames) || []),\n"
        f"  ...{json.dumps(rows, ensure_ascii=False, indent=2)}\n"
        "];\n",
        encoding="utf-8",
    )


def write_pronoun_js(path: Path, rows: list[dict[str, Any]]) -> None:
    path.write_text(
        "(function initPronounFillRowsPasseCompose() {\n"
        f"  const rows = {json.dumps(rows, ensure_ascii=False, indent=2)};\n"
        "  window.pronounFillRows = [\n"
        "    ...((Array.isArray(window.pronounFillRows) && window.pronounFillRows) || []),\n"
        "    ...rows,\n"
        "  ];\n"
        "})();\n",
        encoding="utf-8",
    )


def row_id(row: dict[str, Any]) -> str:
    return str(row.get("frame_id") or row.get("id") or "").strip()


def normalize_words(value: str) -> list[str]:
    return re.findall(r"[\wÀ-ÿ']+", value.lower().replace("’", "'"))


def too_similar(previous: str, proposed: str) -> bool:
    if " ".join(normalize_words(previous)) == " ".join(normalize_words(proposed)):
        return True
    old = set(normalize_words(previous))
    new = set(normalize_words(proposed))
    if not old or not new:
        return False
    overlap = len(old & new) / max(1, min(len(old), len(new)))
    return overlap >= 0.78


def answer_count(full_answer: str, answer: str) -> int:
    if not answer:
        return 0
    return full_answer.count(answer)


def has_particle_tail(answer: str) -> bool:
    tokens = answer.strip().split()
    if len(tokens) < 2:
        return False
    tail = tokens[-1].lower().replace("’", "'")
    penultimate = tokens[-2].lower().replace("’", "'") if len(tokens) >= 2 else ""
    return tail in PARTICLE_TAILS or (tail in ARTICLE_TAILS and penultimate in {"à", "de"})


def make_question(full_answer: str, answer: str, is_pronoun: bool) -> str:
    blank = "____" if is_pronoun or not has_particle_tail(answer) else "____ ____"
    replacement = f"{blank} " if is_pronoun and answer.endswith(("'", "’")) else blank
    question = full_answer.replace(answer, replacement, 1)
    return re.sub(r"____(?=(?:ai|as|a|avons|avez|ont|suis|es|est|sommes|êtes|sont)\b)", "____ ", question)


def validate_candidate(row: dict[str, Any], full_answer: str, meaning: str, *, allow_similar: bool, is_pronoun: bool) -> str | None:
    full_answer = " ".join(str(full_answer or "").strip().split())
    meaning = " ".join(str(meaning or "").strip().split())
    answer = str(row.get("answer") or "").strip()
    if not full_answer or not meaning:
        return None
    if "____" in full_answer:
        return None
    if answer_count(full_answer, answer) != 1:
        return None
    if is_pronoun and len(normalize_words(full_answer)) < 5:
        return None
    if not allow_similar and too_similar(str(row.get("full_answer") or ""), full_answer):
        return None
    if re.search(r"\b(?:demain|après-demain|la semaine prochaine|ce soir)\b", full_answer, re.I):
        return None
    return full_answer


def build_prompt(rows: list[dict[str, Any]], *, is_pronoun: bool) -> str:
    payload = []
    for row in rows:
        payload.append({
            "id": row_id(row),
            "verb": row.get("verb", ""),
            "answer": row.get("answer", ""),
            "current_full_answer": row.get("full_answer", ""),
            "current_english": row.get("meaning_en", ""),
            "category": row.get("category_name", ""),
            "frame_type": row.get("frame_type", row.get("family", "")),
            "note": row.get("note", row.get("reason", "")),
            "kind": "pronoun replacement" if is_pronoun else "verb pattern",
        })
    return (
        "Create one new French passé composé sibling card for each row.\n"
        "Use the exact `answer` string once in `full_answer`.\n"
        "Do not copy the current sentence with only small noun changes; make a fresh example.\n"
        "Keep it short enough for a mobile card.\n"
        "Translate the new full French sentence into natural English.\n\n"
        f"{json.dumps(payload, ensure_ascii=False, indent=2)}"
    )


def call_model(client: OpenAI, model: str, batch: list[dict[str, Any]], *, is_pronoun: bool) -> dict[str, dict[str, str]]:
    completion = client.chat.completions.create(
        model=model,
        temperature=0.8,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": build_prompt(batch, is_pronoun=is_pronoun)},
        ],
        response_format={"type": "json_object"},
    )
    content = completion.choices[0].message.content or "{}"
    payload = json.loads(content)
    result: dict[str, dict[str, str]] = {}
    for item in payload.get("rows") or []:
        rid = str(item.get("id") or "").strip()
        if not rid:
            continue
        result[rid] = {
            "full_answer": str(item.get("full_answer") or "").strip(),
            "meaning_en": str(item.get("meaning_en") or "").strip(),
        }
    return result


def rewrite_rows(
    client: OpenAI,
    rows: list[dict[str, Any]],
    *,
    model: str,
    batch_size: int,
    sleep_seconds: float,
    max_batches: int,
    is_pronoun: bool,
) -> tuple[list[dict[str, Any]], dict[str, int]]:
    stats = {
        "attempted": 0,
        "updated": 0,
        "missing": 0,
        "invalid": 0,
        "too_similar_allowed": 0,
    }
    output = [dict(row) for row in rows]
    id_to_index = {row_id(row): index for index, row in enumerate(output)}
    batches_run = 0
    for start in range(0, len(output), batch_size):
        if max_batches and batches_run >= max_batches:
            break
        batch = output[start:start + batch_size]
        stats["attempted"] += len(batch)
        proposals = call_model(client, model, batch, is_pronoun=is_pronoun)
        for row in batch:
            rid = row_id(row)
            proposal = proposals.get(rid)
            if not proposal:
                stats["missing"] += 1
                continue
            full_answer = validate_candidate(row, proposal["full_answer"], proposal["meaning_en"], allow_similar=False, is_pronoun=is_pronoun)
            if not full_answer:
                full_answer = validate_candidate(row, proposal["full_answer"], proposal["meaning_en"], allow_similar=True, is_pronoun=is_pronoun)
                if full_answer:
                    stats["too_similar_allowed"] += 1
            if not full_answer:
                stats["invalid"] += 1
                continue
            updated = dict(row)
            updated["full_answer"] = full_answer
            updated["question"] = make_question(full_answer, str(row.get("answer") or "").strip(), is_pronoun)
            updated["meaning_en"] = " ".join(proposal["meaning_en"].split())
            source = str(updated.get("source") or "generated")
            if "passe_compose_content" not in source:
                updated["source"] = f"{source}:passe_compose_content"
            note_key = "reason" if is_pronoun else "note"
            note = str(updated.get(note_key) or "")
            if "fresh passé composé sibling" not in note:
                updated[note_key] = f"{note}; fresh passé composé sibling".lstrip("; ")
            output[id_to_index[rid]] = updated
            stats["updated"] += 1
        batches_run += 1
        print(json.dumps({"kind": "pronoun" if is_pronoun else "frame", "batches_run": batches_run, **stats}, ensure_ascii=False), flush=True)
        time.sleep(sleep_seconds)
    return output, stats


def main() -> None:
    parser = argparse.ArgumentParser(description="Rewrite generated French passé composé fill-blank cards as fresh sibling phrases.")
    parser.add_argument("--frame-json", type=Path, default=Path("verb_frames.french_passe_compose.generated.json"))
    parser.add_argument("--frame-js", type=Path, default=Path("verb_frames.french_passe_compose.js"))
    parser.add_argument("--pronoun-json", type=Path, default=Path("js/pronounFillRows.passeCompose.generated.json"))
    parser.add_argument("--pronoun-js", type=Path, default=Path("js/pronounFillRows.passeCompose.js"))
    parser.add_argument("--model", default="gpt-5.4")
    parser.add_argument("--batch-size", type=int, default=20)
    parser.add_argument("--sleep-seconds", type=float, default=0.2)
    parser.add_argument("--max-batches", type=int, default=0)
    parser.add_argument("--skip-pronouns", action="store_true")
    args = parser.parse_args()

    ensure_openai()
    client = OpenAI()

    frame_rows = load_rows(args.frame_json)
    frame_rows, frame_stats = rewrite_rows(
        client,
        frame_rows,
        model=args.model,
        batch_size=args.batch_size,
        sleep_seconds=args.sleep_seconds,
        max_batches=args.max_batches,
        is_pronoun=False,
    )
    write_rows(args.frame_json, frame_rows)
    write_frame_js(args.frame_js, frame_rows)

    pronoun_stats = {}
    if not args.skip_pronouns:
        pronoun_rows = load_rows(args.pronoun_json)
        pronoun_rows, pronoun_stats = rewrite_rows(
            client,
            pronoun_rows,
            model=args.model,
            batch_size=args.batch_size,
            sleep_seconds=args.sleep_seconds,
            max_batches=args.max_batches,
            is_pronoun=True,
        )
        write_rows(args.pronoun_json, pronoun_rows)
        write_pronoun_js(args.pronoun_js, pronoun_rows)

    print(json.dumps({
        "frame_rows": len(frame_rows),
        "frame_stats": frame_stats,
        "pronoun_stats": pronoun_stats,
    }, ensure_ascii=False, indent=2), flush=True)


if __name__ == "__main__":
    main()
