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


SYSTEM_PROMPT = """You are a strict native-French QA editor for language-learning fill-in-the-blank cards.

Audit each French passé composé sentence for naturalness and grammar.
Flag only cards that are actually awkward, ungrammatical, uncanny, misleading, or semantically odd.

If a card is bad, provide a corrected full_answer that:
- is natural French,
- stays in passé composé,
- includes the exact answer string exactly once as a contiguous substring,
- keeps the same broad construction and learning target,
- is short enough for a mobile card.

Also provide a natural English translation of the corrected full_answer.
Return strict JSON only.

Return shape:
{"issues":[{"id":"...","full_answer":"...","meaning_en":"...","reason":"short reason"}]}
"""


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


def has_particle_tail(answer: str) -> bool:
    tokens = answer.strip().split()
    if len(tokens) < 2:
        return False
    tail = tokens[-1].lower().replace("’", "'")
    prev = tokens[-2].lower().replace("’", "'")
    return tail in {"à", "de", "d'", "au", "aux", "du", "des"} or (prev in {"à", "de"} and tail in {"la", "l'"})


def make_question(full_answer: str, answer: str, is_pronoun: bool) -> str:
    blank = "____" if is_pronoun or not has_particle_tail(answer) else "____ ____"
    replacement = f"{blank} " if is_pronoun and answer.endswith(("'", "’")) else blank
    question = full_answer.replace(answer, replacement, 1)
    return re.sub(r"____(?=(?:ai|as|a|avons|avez|ont|suis|es|est|sommes|êtes|sont)\b)", "____ ", question)


def valid_fix(row: dict[str, Any], full_answer: str, meaning_en: str) -> bool:
    answer = str(row.get("answer") or "").strip()
    if not answer or not full_answer or not meaning_en:
        return False
    if "____" in full_answer:
        return False
    if full_answer.count(answer) != 1:
        return False
    if re.search(r"\b(?:demain|après-demain|la semaine prochaine)\b", full_answer, re.I):
        return False
    return True


def build_prompt(rows: list[dict[str, Any]], *, is_pronoun: bool) -> str:
    payload = []
    for row in rows:
        payload.append({
            "id": row_id(row),
            "answer": row.get("answer", ""),
            "full_answer": row.get("full_answer", ""),
            "meaning_en": row.get("meaning_en", ""),
            "verb": row.get("verb", ""),
            "category": row.get("category_name", ""),
            "note": row.get("note", row.get("reason", "")),
            "kind": "pronoun replacement" if is_pronoun else "verb pattern",
        })
    return (
        "Audit these cards. Return only real issues, not style preferences.\n"
        "If fixing, the exact `answer` must appear exactly once in `full_answer`.\n\n"
        f"{json.dumps(payload, ensure_ascii=False, indent=2)}"
    )


def call_model(client: OpenAI, model: str, rows: list[dict[str, Any]], *, is_pronoun: bool) -> list[dict[str, str]]:
    completion = client.chat.completions.create(
        model=model,
        temperature=0,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": build_prompt(rows, is_pronoun=is_pronoun)},
        ],
        response_format={"type": "json_object"},
    )
    payload = json.loads(completion.choices[0].message.content or "{}")
    issues = payload.get("issues") or []
    return [issue for issue in issues if isinstance(issue, dict)]


def audit_and_fix(
    client: OpenAI,
    rows: list[dict[str, Any]],
    *,
    model: str,
    batch_size: int,
    sleep_seconds: float,
    max_batches: int,
    is_pronoun: bool,
) -> tuple[list[dict[str, Any]], dict[str, int], list[dict[str, str]]]:
    output = [dict(row) for row in rows]
    by_id = {row_id(row): index for index, row in enumerate(output)}
    stats = {"audited": 0, "issues": 0, "fixed": 0, "invalid_fixes": 0}
    invalid: list[dict[str, str]] = []
    batches_run = 0
    for start in range(0, len(output), batch_size):
        if max_batches and batches_run >= max_batches:
            break
        batch = output[start:start + batch_size]
        stats["audited"] += len(batch)
        issues = call_model(client, model, batch, is_pronoun=is_pronoun)
        stats["issues"] += len(issues)
        for issue in issues:
            rid = str(issue.get("id") or "").strip()
            if rid not in by_id:
                continue
            row = output[by_id[rid]]
            full_answer = " ".join(str(issue.get("full_answer") or "").split())
            meaning_en = " ".join(str(issue.get("meaning_en") or "").split())
            if not valid_fix(row, full_answer, meaning_en):
                stats["invalid_fixes"] += 1
                invalid.append({"id": rid, "reason": str(issue.get("reason") or "invalid fix"), "full_answer": full_answer})
                continue
            row["full_answer"] = full_answer
            row["question"] = make_question(full_answer, str(row.get("answer") or ""), is_pronoun)
            row["meaning_en"] = meaning_en
            stats["fixed"] += 1
        batches_run += 1
        print(json.dumps({"kind": "pronoun" if is_pronoun else "frame", "batches_run": batches_run, **stats}, ensure_ascii=False), flush=True)
        time.sleep(sleep_seconds)
    return output, stats, invalid


def main() -> None:
    parser = argparse.ArgumentParser(description="Audit and fix French passé composé fill-blank sidecar rows.")
    parser.add_argument("--frame-json", type=Path, default=Path("verb_frames.french_passe_compose.generated.json"))
    parser.add_argument("--frame-js", type=Path, default=Path("verb_frames.french_passe_compose.js"))
    parser.add_argument("--pronoun-json", type=Path, default=Path("js/pronounFillRows.passeCompose.generated.json"))
    parser.add_argument("--pronoun-js", type=Path, default=Path("js/pronounFillRows.passeCompose.js"))
    parser.add_argument("--model", default="gpt-5.4")
    parser.add_argument("--batch-size", type=int, default=30)
    parser.add_argument("--sleep-seconds", type=float, default=0.2)
    parser.add_argument("--max-batches", type=int, default=0)
    args = parser.parse_args()

    ensure_openai()
    client = OpenAI()

    frame_rows = load_rows(args.frame_json)
    frame_rows, frame_stats, frame_invalid = audit_and_fix(
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

    pronoun_rows = load_rows(args.pronoun_json)
    pronoun_rows, pronoun_stats, pronoun_invalid = audit_and_fix(
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
        "frame_stats": frame_stats,
        "pronoun_stats": pronoun_stats,
        "invalid": frame_invalid + pronoun_invalid,
    }, ensure_ascii=False, indent=2), flush=True)


if __name__ == "__main__":
    main()
