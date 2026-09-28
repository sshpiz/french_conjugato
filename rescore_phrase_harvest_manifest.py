#!/usr/bin/env python3
"""
Re-score an existing phrase-harvest manifest with the current classifier.
"""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).parent
HARVEST_SCRIPT = ROOT / "generate_category_phrase_harvest.py"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--manifest", required=True)
    parser.add_argument("--python", default=str(Path(sys.executable)))
    parser.add_argument("--out-dir", default="")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    manifest_path = Path(args.manifest)
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))

    if args.out_dir:
        out_dir = Path(args.out_dir)
    else:
        out_dir = manifest_path.parent.parent / f"{manifest_path.parent.name}_rescored"

    out_dir.mkdir(parents=True, exist_ok=True)

    rescored_runs = []
    for run in manifest.get("runs", []):
        source_prefix = Path(run["out_prefix"])
        relative_prefix = source_prefix.relative_to(manifest_path.parent)
        target_prefix = out_dir / relative_prefix
        target_prefix.parent.mkdir(parents=True, exist_ok=True)

        cmd = [
            args.python,
            str(HARVEST_SCRIPT),
            "--category-id",
            run["category_id"],
            "--model",
            run["model"],
            "--judge-model",
            run["judge_model"],
            "--input-json",
            f"{source_prefix}.json",
            "--out-prefix",
            str(target_prefix),
        ]
        print("RUN", " ".join(cmd), flush=True)
        subprocess.run(cmd, check=True)
        rescored_runs.append(
            {
                "category_id": run["category_id"],
                "category_name": run["category_name"],
                "model": run["model"],
                "judge_model": run["judge_model"],
                "source_prefix": str(source_prefix),
                "out_prefix": str(target_prefix),
            }
        )

    out_manifest = {
        "source_manifest": str(manifest_path),
        "out_dir": str(out_dir),
        "runs": rescored_runs,
    }
    (out_dir / "manifest.json").write_text(json.dumps(out_manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Wrote rescored manifest to {out_dir / 'manifest.json'}")


if __name__ == "__main__":
    main()
