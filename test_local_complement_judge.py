#!/usr/bin/env python3
"""
Quick local bakeoff for binary French complement judgments via Ollama.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from urllib import request


ROOT = Path(__file__).parent
DEFAULT_URL = "http://127.0.0.1:11434/api/chat"

GOLD_CASES = [
    {
        "id": "penser_a_projet",
        "sentence": "Je pense à ce projet.",
        "phrase": "à ce projet",
        "expected": "yes",
    },
    {
        "id": "travailler_a_paris",
        "sentence": "Je travaille à Paris.",
        "phrase": "à Paris",
        "expected": "no",
    },
    {
        "id": "manger_a_midi",
        "sentence": "Je mange à midi.",
        "phrase": "à midi",
        "expected": "no",
    },
    {
        "id": "parler_a_paul",
        "sentence": "Je parle à Paul.",
        "phrase": "à Paul",
        "expected": "yes",
    },
    {
        "id": "voir_au_cinema",
        "sentence": "Je vois un film au cinéma.",
        "phrase": "au cinéma",
        "expected": "no",
    },
    {
        "id": "parler_de_film",
        "sentence": "Nous parlons de ce film.",
        "phrase": "de ce film",
        "expected": "yes",
    },
    {
        "id": "dependre_de_decision",
        "sentence": "Cela dépend de cette décision.",
        "phrase": "de cette décision",
        "expected": "yes",
    },
    {
        "id": "penser_de_maniere",
        "sentence": "Elle pense de manière réfléchie.",
        "phrase": "de manière réfléchie",
        "expected": "no",
    },
    {
        "id": "penser_de_film",
        "sentence": "Elle pense de ce film.",
        "phrase": "de ce film",
        "expected": "no",
    },
    {
        "id": "tenir_a_amie",
        "sentence": "Elle tient à son amie.",
        "phrase": "à son amie",
        "expected": "yes",
    },
    {
        "id": "tenir_de_mere",
        "sentence": "Paul tient de sa mère.",
        "phrase": "de sa mère",
        "expected": "yes",
    },
    {
        "id": "garder_a_lesprit",
        "sentence": "Je garde cela à l'esprit.",
        "phrase": "à l'esprit",
        "expected": "no",
    },
]


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Test a local Ollama model on French complement judgments.")
    parser.add_argument("--model", default="mistral-small:latest")
    parser.add_argument("--url", default=DEFAULT_URL)
    parser.add_argument("--output", default=str(ROOT / "_ai_frame_runs" / "local_judge_test_results.json"))
    parser.add_argument("--system-prompt", default="", help="Optional system prompt to prepend.")
    return parser


def ask_model(url: str, model: str, sentence: str, phrase: str, system_prompt: str) -> tuple[str, str]:
    prompt = (
        "For the sentence below, answer only:\n"
        "yes\n"
        "no\n\n"
        "Question:\n"
        f'Is the phrase "{phrase}" part of the verb\'s core meaning, rather than a place, time, manner, or other loose modifier?\n\n'
        "Sentence:\n"
        f"{sentence}"
    )
    payload = {
        "model": model,
        "stream": False,
        "messages": [],
    }
    if system_prompt.strip():
        payload["messages"].append({"role": "system", "content": system_prompt.strip()})
    payload["messages"].append({"role": "user", "content": prompt})
    req = request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
    )
    with request.urlopen(req, timeout=180) as response:
        body = json.loads(response.read().decode("utf-8"))
    raw = str(body.get("message", {}).get("content", "")).strip()
    first = raw.splitlines()[0].strip().lower() if raw else ""
    answer = "yes" if first.startswith("yes") else "no" if first.startswith("no") else ""
    return answer, raw


def main() -> None:
    args = build_parser().parse_args()
    results = []
    correct = 0

    for index, case in enumerate(GOLD_CASES, start=1):
        answer, raw = ask_model(args.url, args.model, case["sentence"], case["phrase"], args.system_prompt)
        ok = answer == case["expected"]
        if ok:
            correct += 1
        results.append(
            {
                **case,
                "predicted": answer,
                "raw": raw,
                "correct": ok,
            }
        )
        print(f"{index}/{len(GOLD_CASES)} {case['id']}: predicted={answer or '??'} expected={case['expected']} correct={ok}")

    summary = {
        "model": args.model,
        "system_prompt": args.system_prompt,
        "score": correct,
        "total": len(GOLD_CASES),
        "accuracy": correct / len(GOLD_CASES),
        "results": results,
    }
    output_path = Path(args.output).expanduser().resolve()
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(summary, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"\nScore: {correct}/{len(GOLD_CASES)}")
    print(f"Saved: {output_path}")


if __name__ == "__main__":
    main()
