#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import os
import sys
import time
from pathlib import Path

from openai_env import load_openai_api_key

try:
    from openai import OpenAI
except ImportError:
    OpenAI = None


SYSTEM_PROMPT = """You translate French or German fill-in-the-blanks source sentences into natural English.

Rules:
- Translate the full sentence, not the question with blanks.
- Keep the tense and subject meaning accurate.
- Use natural, concise English.
- Do not explain anything.
- Return strict JSON only.
"""


def ensure_openai() -> None:
    load_openai_api_key()
    if OpenAI is None:
        sys.exit("openai package is not installed in the current Python environment.")
    if not os.environ.get("OPENAI_API_KEY"):
        sys.exit("OPENAI_API_KEY is not set.")


def load_rows(path: Path) -> list[dict]:
    data = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(data, list):
        raise ValueError(f"{path} does not contain a top-level list")
    return data


def write_rows(path: Path, rows: list[dict]) -> None:
    path.write_text(json.dumps(rows, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def write_js_for_json(path: Path, rows: list[dict]) -> None:
    if path.name.endswith(".generated.json"):
        js_path = path.with_name(path.name.replace(".generated.json", ".js"))
    elif path.suffix == ".json":
        js_path = path.with_suffix(".js")
    else:
        return
    js_path.write_text("window.verbFrames = " + json.dumps(rows, ensure_ascii=False, indent=2) + ";\n", encoding="utf-8")


def build_batch_prompt(batch: list[dict]) -> str:
    payload = []
    for item in batch:
        payload.append(
            {
                "frame_id": item["frame_id"],
                "verb": item.get("verb", ""),
                "full_answer": item.get("full_answer", ""),
                "existing_meaning_en": item.get("meaning_en", ""),
            }
        )
    return (
        "Translate each `full_answer` into natural English.\n"
        "Return JSON with this shape: "
        "{\"rows\":[{\"frame_id\":\"...\",\"meaning_en\":\"...\"}]}\n\n"
        f"{json.dumps(payload, ensure_ascii=False, indent=2)}"
    )


def call_model(client: OpenAI, model: str, batch: list[dict]) -> dict[str, str]:
    completion = client.chat.completions.create(
        model=model,
        temperature=0,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": build_batch_prompt(batch)},
        ],
        response_format={"type": "json_object"},
    )
    text = completion.choices[0].message.content or ""
    payload = json.loads(text)
    rows = payload.get("rows") or []
    result: dict[str, str] = {}
    for item in rows:
        frame_id = str(item.get("frame_id", "")).strip()
        meaning = " ".join(str(item.get("meaning_en", "")).strip().split())
        if frame_id and meaning:
            result[frame_id] = meaning
    return result


def main() -> None:
    parser = argparse.ArgumentParser(description="Backfill meaning_en for frame-deck rows.")
    parser.add_argument("--input", type=Path, required=True)
    parser.add_argument("--output", type=Path)
    parser.add_argument("--model", default="gpt-5.4-mini")
    parser.add_argument("--batch-size", type=int, default=40)
    parser.add_argument("--max-batches", type=int, default=0, help="0 means no limit")
    parser.add_argument("--sleep-seconds", type=float, default=0.3)
    parser.add_argument("--overwrite", action="store_true")
    parser.add_argument("--write-js", action="store_true")
    args = parser.parse_args()

    ensure_openai()
    client = OpenAI()

    input_path = args.input
    output_path = args.output or input_path

    rows = load_rows(input_path)
    if output_path.exists() and output_path != input_path:
        try:
            existing = load_rows(output_path)
            if len(existing) == len(rows):
                rows = existing
        except Exception:
            pass

    pending = []
    for row in rows:
        if not args.overwrite and str(row.get("meaning_en", "")).strip():
            continue
        pending.append(row)

    print(f"input={input_path}")
    print(f"output={output_path}")
    print(f"pending={len(pending)}")

    batches_run = 0
    updated = 0
    for start in range(0, len(pending), args.batch_size):
        if args.max_batches and batches_run >= args.max_batches:
            break
        batch = pending[start:start + args.batch_size]
        translations = call_model(client, args.model, batch)
        for row in batch:
            meaning = translations.get(row["frame_id"])
            if meaning:
                row["meaning_en"] = meaning
                updated += 1
        write_rows(output_path, rows)
        if args.write_js:
            write_js_for_json(output_path, rows)
        batches_run += 1
        print(f"batches_run={batches_run} updated={updated}")
        time.sleep(args.sleep_seconds)

    final_with_meaning = sum(1 for row in rows if str(row.get("meaning_en", "")).strip())
    print(f"final_with_meaning={final_with_meaning}")
    print(f"total_rows={len(rows)}")


if __name__ == "__main__":
    main()
