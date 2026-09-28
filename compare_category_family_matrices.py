#!/usr/bin/env python3
"""
Compare LEFFF and DICOVALENCE category family matrices.
"""

from __future__ import annotations

import csv
import json
from pathlib import Path


ROOT = Path(__file__).parent
LEFFF_JSON = ROOT / "category_lefff_family_matrix.json"
DICOVALENCE_JSON = ROOT / "category_dicovalence_family_matrix.json"
OUT_JSON = ROOT / "category_family_matrix_comparison.json"
OUT_TSV = ROOT / "category_family_matrix_comparison.tsv"
OUT_MD = ROOT / "category_family_matrix_comparison.md"

FIELDS = ("direct_ok", "a_ok", "de_ok", "direct_a_ok")


def load_rows(path: Path) -> dict[tuple[str, str], dict]:
    rows = json.loads(path.read_text(encoding="utf-8"))
    return {(row["category_id"], row["verb"]): row for row in rows}


def compare_status(lefff: str, dico: str) -> str:
    if lefff == dico:
        return "agree"
    if lefff == "?":
        return "lefff_unknown"
    return "disagree"


def build_rows() -> list[dict]:
    lefff_rows = load_rows(LEFFF_JSON)
    dico_rows = load_rows(DICOVALENCE_JSON)
    keys = sorted(set(lefff_rows) | set(dico_rows))

    rows: list[dict] = []
    for key in keys:
        lefff = lefff_rows.get(key, {})
        dico = dico_rows.get(key, {})
        row = {
            "category_id": key[0],
            "verb": key[1],
            "category_name": lefff.get("category_name") or dico.get("category_name") or "",
        }
        for field in FIELDS:
            lefff_value = lefff.get(field, "")
            dico_value = dico.get(field, "")
            row[f"lefff_{field}"] = lefff_value
            row[f"dicovalence_{field}"] = dico_value
            row[f"{field}_comparison"] = compare_status(lefff_value, dico_value)
        rows.append(row)
    return rows


def write_outputs(rows: list[dict]) -> None:
    OUT_JSON.write_text(json.dumps(rows, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    header = [
        "category_id",
        "category_name",
        "verb",
        "lefff_direct_ok",
        "dicovalence_direct_ok",
        "direct_ok_comparison",
        "lefff_a_ok",
        "dicovalence_a_ok",
        "a_ok_comparison",
        "lefff_de_ok",
        "dicovalence_de_ok",
        "de_ok_comparison",
        "lefff_direct_a_ok",
        "dicovalence_direct_a_ok",
        "direct_a_ok_comparison",
    ]

    with OUT_TSV.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.writer(handle, delimiter="\t")
        writer.writerow(header)
        for row in rows:
            writer.writerow([row.get(column, "") for column in header])

    lines = [
        "# LEFFF vs DICOVALENCE Category Family Matrix Comparison",
        "",
        "Comparison values:",
        "- `agree`: same status in both matrices",
        "- `lefff_unknown`: LEFFF direct column was `?`",
        "- `disagree`: explicit mismatch",
        "",
    ]
    for row in rows:
        mismatches = [field for field in FIELDS if row[f"{field}_comparison"] == "disagree"]
        if not mismatches:
            continue
        lines.append(
            f"- `{row['category_name']}` / `{row['verb']}`: {', '.join(mismatches)}"
        )

    OUT_MD.write_text("\n".join(lines).rstrip() + "\n", encoding="utf-8")


def main() -> None:
    rows = build_rows()
    write_outputs(rows)
    print(f"Wrote {len(rows)} comparison rows.")


if __name__ == "__main__":
    main()
