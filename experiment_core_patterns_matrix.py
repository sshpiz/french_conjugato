#!/usr/bin/env python3
"""
Run a lightweight matrix-style core-pattern prompt experiment on a small verb set.
"""

from __future__ import annotations

import argparse
import json
import os
import sys
from datetime import datetime
from pathlib import Path

from pydantic import BaseModel, Field

try:
    from openai import OpenAI
except ImportError:
    OpenAI = None


DEFAULT_VERBS = [
    "parler",
    "demander",
    "mettre",
    "conduire",
    "servir",
    "accepter",
    "disposer",
    "douter",
    "envisager",
]

ROOT = Path(__file__).parent
OUT_DIR = ROOT / "_experiments"


class MatrixRow(BaseModel):
    frame: str
    exists: bool
    meaning_en: str = ""
    example_fr: str = ""
    example_en: str = ""
    note: str = ""


class MatrixResponse(BaseModel):
    verb: str
    rows: list[MatrixRow] = Field(default_factory=list)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Run matrix prompt experiment for French core patterns.")
    parser.add_argument("--model", default="gpt-5")
    parser.add_argument("--reasoning-effort", choices=["low", "medium", "high", "xhigh"])
    parser.add_argument("--verb", action="append", dest="verbs", help="Explicit verb to test. Repeat to pass several.")
    parser.add_argument("--output", help="Optional explicit output JSON path.")
    return parser


def ensure_openai() -> None:
    if not os.environ.get("OPENAI_API_KEY"):
        sys.exit("OPENAI_API_KEY is not set in the environment.")
    if OpenAI is None:
        sys.exit("openai package is not installed.")


def system_prompt() -> str:
    return """You are checking which core French complementation frames really exist for a verb.

Be strict and practical:
- Keep only frames that are valid, normal French.
- Prefer common everyday French over narrow literary or legal uses.
- A frame can be grammatically valid but still too marginal; mark it false if it is not a useful core row.
- Use canonical learner-facing labels.
- Give one natural short example for each true row.
- If a frame is false, leave meaning/example fields empty.

Important:
- Distinguish direct object, bare infinitive, `à`, `de`, `que`, `si`, and combo frames like `qqch à qqn`.
- Do not invent a row just because the abstract schema could exist in theory.
- Avoid metalanguage in the gloss if a natural English gloss is possible.
"""


def user_prompt(verb: str) -> str:
    return f"""For the French verb `{verb}`, check which of these frames exist as useful core patterns.

Keep only the valid ones with one example for each true row.

Candidate frames:
- {verb}
- {verb} qqn / qqch
- {verb} à qqn / qqch / lieu
- {verb} de qqn / qqch / lieu
- {verb} qqch à qqn
- {verb} qqch de qqn
- {verb} + infinitif
- {verb} à + infinitif
- {verb} de + infinitif
- {verb} que + proposition
- {verb} si + proposition

Return JSON with:
- verb
- rows: array of objects with
  - frame
  - exists
  - meaning_en
  - example_fr
  - example_en
  - note

Rules:
- Keep the frame labels canonical and compact.
- If a candidate frame is not a good core row, return it with exists=false.
- If a more precise canonical row is better than the candidate label, rewrite the frame to the better label.
- Use only one row per distinct useful pattern.
"""


def call_model(client: OpenAI, model: str, verb: str, reasoning_effort: str | None) -> dict:
    kwargs = {
        "model": model,
        "response_format": MatrixResponse,
        "messages": [
            {"role": "system", "content": system_prompt()},
            {"role": "user", "content": user_prompt(verb)},
        ],
    }
    if reasoning_effort:
        kwargs["reasoning_effort"] = reasoning_effort
    completion = client.chat.completions.parse(**kwargs)
    message = completion.choices[0].message
    if not message.parsed:
        raise RuntimeError("Structured output parsing failed.")
    return message.parsed.model_dump()


def main() -> None:
    args = build_parser().parse_args()
    ensure_openai()
    client = OpenAI()
    verbs = args.verbs or DEFAULT_VERBS

    results = []
    for index, verb in enumerate(verbs, start=1):
        parsed = call_model(client, args.model, verb, args.reasoning_effort)
        results.append(parsed)
        print(f"{index}/{len(verbs)} {verb}: {len(parsed.get('rows', []))} rows")

    out_path = Path(args.output).expanduser().resolve() if args.output else (
        OUT_DIR / f"core_patterns_matrix_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    )
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(results, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"\nSaved experiment output to {out_path}")


if __name__ == "__main__":
    main()
