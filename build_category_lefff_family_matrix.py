#!/usr/bin/env python3
"""
Build a LEFFF-backed category-by-verb family matrix.

Rows are (verb, category) pairs from the built-in category lists in js/script.js.

Columns:
- verb
- category_id
- category_name
- direct_ok
- a_ok
- de_ok
- direct_a_ok

Notes:
- a/de/direct+a come from `_experiments/lefff_ad_combo_all.json`
- direct comes from `_experiments/lefff_core_patterns_top100.json`
  which is incomplete in this repo, so `direct_ok` may be `?`
"""

from __future__ import annotations

import csv
import json
import re
from pathlib import Path


ROOT = Path(__file__).parent
SCRIPT_JS = ROOT / "js" / "script.js"
LEFFF_AD_COMBO_ALL = ROOT / "_experiments" / "lefff_ad_combo_all.json"
LEFFF_DIRECT_TOP100 = ROOT / "_experiments" / "lefff_core_patterns_top100.json"
OUT_JSON = ROOT / "category_lefff_family_matrix.json"
OUT_TSV = ROOT / "category_lefff_family_matrix.tsv"
OUT_MD = ROOT / "category_lefff_family_matrix.md"


def load_category_rows() -> list[dict]:
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


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def load_lefff_ad_combo_index() -> dict[str, dict[str, bool]]:
    entries = load_json(LEFFF_AD_COMBO_ALL)
    index: dict[str, dict[str, bool]] = {}
    for entry in entries:
        verb = str(entry.get("verb", "")).strip()
        reasons = {str(candidate.get("reason", "")).strip() for candidate in entry.get("candidates", []) or []}
        index[verb] = {
            "a_ok": "a-object" in reasons,
            "de_ok": "de-object" in reasons,
            "direct_a_ok": "combo-a" in reasons,
        }
    return index


def load_lefff_direct_index() -> dict[str, bool]:
    entries = load_json(LEFFF_DIRECT_TOP100)
    index: dict[str, bool] = {}
    for entry in entries:
        verb = str(entry.get("verb", "")).strip()
        reasons = {str(candidate.get("reason", "")).strip() for candidate in entry.get("candidates", []) or []}
        index[verb] = "direct-object" in reasons
    return index


def status_text(value: bool | None) -> str:
    if value is None:
        return "?"
    return "yes" if value else "no"


def build_rows() -> list[dict]:
    categories = load_category_rows()
    ad_combo_index = load_lefff_ad_combo_index()
    direct_index = load_lefff_direct_index()

    rows: list[dict] = []
    for category in categories:
        for verb in category["verbs"]:
            ad_combo = ad_combo_index.get(verb, {})
            direct_value = direct_index.get(verb)
            rows.append(
                {
                    "verb": verb,
                    "category_id": category["category_id"],
                    "category_name": category["category_name"],
                    "direct_ok": status_text(direct_value),
                    "a_ok": status_text(ad_combo.get("a_ok", False)),
                    "de_ok": status_text(ad_combo.get("de_ok", False)),
                    "direct_a_ok": status_text(ad_combo.get("direct_a_ok", False)),
                }
            )
    rows.sort(key=lambda row: (row["category_name"], row["verb"]))
    return rows


def write_outputs(rows: list[dict]) -> None:
    OUT_JSON.write_text(json.dumps(rows, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    with OUT_TSV.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.writer(handle, delimiter="\t")
        writer.writerow(["verb", "category_id", "category_name", "direct_ok", "a_ok", "de_ok", "direct_a_ok"])
        for row in rows:
            writer.writerow(
                [
                    row["verb"],
                    row["category_id"],
                    row["category_name"],
                    row["direct_ok"],
                    row["a_ok"],
                    row["de_ok"],
                    row["direct_a_ok"],
                ]
            )

    by_category: dict[str, list[dict]] = {}
    for row in rows:
        by_category.setdefault(row["category_name"], []).append(row)

    lines = [
        "# Category LEFFF Family Matrix",
        "",
        "Legend:",
        "- `yes`: LEFFF-backed evidence present in the repo-side extraction",
        "- `no`: LEFFF-backed evidence absent in that extraction",
        "- `?`: no broad LEFFF direct-object extraction available for that verb in the repo-side direct artifact",
        "",
    ]
    for category_name, category_rows in by_category.items():
        lines.append(f"## {category_name}")
        lines.append("")
        lines.append("| Verb | Direct | à | de | Direct+à |")
        lines.append("| --- | --- | --- | --- | --- |")
        for row in category_rows:
            lines.append(
                f"| {row['verb']} | {row['direct_ok']} | {row['a_ok']} | {row['de_ok']} | {row['direct_a_ok']} |"
            )
        lines.append("")

    OUT_MD.write_text("\n".join(lines).rstrip() + "\n", encoding="utf-8")


def main() -> None:
    rows = build_rows()
    write_outputs(rows)
    print(f"Wrote {len(rows)} category/verb rows.")


if __name__ == "__main__":
    main()
