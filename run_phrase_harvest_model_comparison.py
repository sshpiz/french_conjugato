#!/usr/bin/env python3
"""
Run category phrase-harvest comparisons across multiple models.

This is meant for long-running checkpointed overnight work:
- picks the first N built-in categories from js/script.js
- computes phrase targets as verbs_in_category * target_per_verb
- runs generate_category_phrase_harvest.py for each (model, category)
- writes logs and a manifest so work can be monitored/resumed
"""

from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
import sys
from datetime import UTC, datetime
from pathlib import Path

from openai_env import load_openai_api_key


ROOT = Path(__file__).parent
SCRIPT_JS = ROOT / "js" / "script.js"
PYTHON = ROOT / "venv" / "bin" / "python3"
HARVEST_SCRIPT = ROOT / "generate_category_phrase_harvest.py"

DEFAULT_MODELS = ("gpt-5.4-mini", "gpt-5.4")
DEFAULT_FIRST_N = 10
DEFAULT_TARGET_PER_VERB = 10
DEFAULT_JUDGE_MODEL = "gpt-5.4-mini"
DEFAULT_CATEGORY_IDS: tuple[str, ...] = ()


def slugify(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "_", value.lower()).strip("_")


def load_categories() -> list[dict]:
    text = SCRIPT_JS.read_text(encoding="utf-8")
    pattern = re.compile(
        r"\{\s*id: '([^']+)',\s*name: '([^']+)',\s*scope: '([^']+)',\s*verbs: \[(.*?)\],",
        re.S,
    )
    rows: list[dict] = []
    for match in pattern.finditer(text):
        verbs = [part.strip().strip("'") for part in match.group(4).split(",") if part.strip()]
        rows.append(
            {
                "category_id": match.group(1),
                "category_name": match.group(2),
                "scope": match.group(3),
                "verbs": verbs,
            }
        )
    return rows


def now_iso() -> str:
    return datetime.now(UTC).replace(microsecond=0).isoformat()


def write_manifest(path: Path, manifest: dict) -> None:
    path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--first-n", type=int, default=DEFAULT_FIRST_N)
    parser.add_argument("--category-ids", nargs="+", default=list(DEFAULT_CATEGORY_IDS))
    parser.add_argument("--target-per-verb", type=int, default=DEFAULT_TARGET_PER_VERB)
    parser.add_argument("--models", nargs="+", default=list(DEFAULT_MODELS))
    parser.add_argument("--judge-model", default=DEFAULT_JUDGE_MODEL)
    parser.add_argument("--out-dir", default="")
    parser.add_argument("--stop-on-error", action="store_true")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    load_openai_api_key()
    if not PYTHON.exists():
        sys.exit(f"Missing Python interpreter: {PYTHON}")
    if not HARVEST_SCRIPT.exists():
        sys.exit(f"Missing harvest script: {HARVEST_SCRIPT}")
    if not os.environ.get("OPENAI_API_KEY"):
        sys.exit("OPENAI_API_KEY is not set.")

    all_categories = load_categories()
    if args.category_ids:
        wanted = set(args.category_ids)
        categories = [category for category in all_categories if category["category_id"] in wanted]
        missing = wanted.difference(category["category_id"] for category in categories)
        if missing:
            sys.exit(f"Unknown category ids: {', '.join(sorted(missing))}")
    else:
        categories = all_categories[: args.first_n]
    if not categories:
        sys.exit("No categories found.")

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    out_dir = Path(args.out_dir) if args.out_dir else ROOT / "overnight_phrase_harvest_compare" / timestamp
    out_dir.mkdir(parents=True, exist_ok=True)
    manifest_path = out_dir / "manifest.json"

    manifest = {
        "started_at": now_iso(),
        "finished_at": None,
        "first_n": args.first_n,
        "category_ids": [category["category_id"] for category in categories],
        "target_per_verb": args.target_per_verb,
        "judge_model": args.judge_model,
        "models": list(args.models),
        "out_dir": str(out_dir),
        "runs": [],
    }
    write_manifest(manifest_path, manifest)

    for model in args.models:
        model_slug = slugify(model)
        model_dir = out_dir / model_slug
        model_dir.mkdir(parents=True, exist_ok=True)

        for category in categories:
            category_slug = category["category_id"].replace("builtin-", "").replace("-", "_")
            phrase_target = len(category["verbs"]) * args.target_per_verb
            out_prefix = model_dir / f"phrase_harvest.{category_slug}"
            log_path = model_dir / f"phrase_harvest.{category_slug}.log"

            run_entry = {
                "model": model,
                "judge_model": args.judge_model,
                "category_id": category["category_id"],
                "category_name": category["category_name"],
                "verb_count": len(category["verbs"]),
                "phrase_target": phrase_target,
                "out_prefix": str(out_prefix),
                "log_path": str(log_path),
                "status": "running",
                "started_at": now_iso(),
                "finished_at": None,
                "return_code": None,
                "command": [
                    str(PYTHON),
                    str(HARVEST_SCRIPT),
                    "--category-id",
                    category["category_id"],
                    "--model",
                    model,
                    "--judge-model",
                    args.judge_model,
                    "--count",
                    str(phrase_target),
                    "--out-prefix",
                    str(out_prefix),
                ],
            }
            manifest["runs"].append(run_entry)
            write_manifest(manifest_path, manifest)

            with log_path.open("w", encoding="utf-8") as log_handle:
                log_handle.write(
                    f"[{now_iso()}] START model={model} category={category['category_id']} "
                    f"phrases={phrase_target}\n"
                )
                log_handle.flush()
                completed = subprocess.run(
                    run_entry["command"],
                    cwd=str(ROOT),
                    env=os.environ.copy(),
                    stdout=log_handle,
                    stderr=subprocess.STDOUT,
                    text=True,
                )

            run_entry["return_code"] = completed.returncode
            run_entry["finished_at"] = now_iso()
            run_entry["status"] = "done" if completed.returncode == 0 else "failed"
            write_manifest(manifest_path, manifest)

            if completed.returncode != 0 and args.stop_on_error:
                manifest["finished_at"] = now_iso()
                write_manifest(manifest_path, manifest)
                sys.exit(completed.returncode)

    manifest["finished_at"] = now_iso()
    write_manifest(manifest_path, manifest)
    print(f"Finished comparison runs in {out_dir}")


if __name__ == "__main__":
    main()
