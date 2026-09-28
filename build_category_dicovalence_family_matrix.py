#!/usr/bin/env python3
"""
Build a DICOVALENCE-backed category-by-verb family matrix.

Rows are (verb, category) pairs from the built-in category lists in js/script.js.

Columns:
- verb
- category_id
- category_name
- direct_ok
- a_ok
- de_ok
- direct_a_ok
"""

from __future__ import annotations

import csv
import json
import re
from pathlib import Path


ROOT = Path(__file__).parent
SCRIPT_JS = ROOT / "js" / "script.js"
DICOVALENCE_TXT = ROOT / "_experiments" / "dicovalence_100625_utf8.txt"
OUT_JSON = ROOT / "category_dicovalence_family_matrix.json"
OUT_TSV = ROOT / "category_dicovalence_family_matrix.tsv"
OUT_MD = ROOT / "category_dicovalence_family_matrix.md"

VERB_RE = re.compile(r"^VERB\$\t[^/]+/(.+)$", re.M)
FRAME_RE = re.compile(r"^FRAME\$\t(.*)$", re.M)


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


def normalize_lemma(value: str) -> str:
    return str(value or "").strip().lower()


def parse_dicovalence_index() -> dict[str, dict[str, bool]]:
    text = DICOVALENCE_TXT.read_text(encoding="utf-8")
    blocks = [block for block in text.split("\n\n") if "VERB$" in block]

    index: dict[str, dict[str, bool]] = {}
    for block in blocks:
        verb_match = VERB_RE.search(block)
        frame_match = FRAME_RE.search(block)
        if not verb_match or not frame_match:
            continue

        verb = normalize_lemma(verb_match.group(1))
        frame = frame_match.group(1).strip()
        if not verb or not frame:
            continue

        families = index.setdefault(
            verb,
            {
                "direct_ok": False,
                "a_ok": False,
                "de_ok": False,
                "direct_a_ok": False,
            },
        )

        has_obj = "obj:" in frame
        has_obja = "objà:" in frame or "objp<à>:" in frame
        has_objde = "objde:" in frame or "objp<de>:" in frame

        if has_obj:
            families["direct_ok"] = True
        if has_obja:
            families["a_ok"] = True
        if has_objde:
            families["de_ok"] = True
        if has_obj and "objà:" in frame:
            families["direct_a_ok"] = True

    return index


def status_text(value: bool) -> str:
    return "yes" if value else "no"


def build_rows() -> list[dict]:
    categories = load_category_rows()
    family_index = parse_dicovalence_index()

    rows: list[dict] = []
    for category in categories:
        for verb in category["verbs"]:
            families = family_index.get(normalize_lemma(verb), {})
            rows.append(
                {
                    "verb": verb,
                    "category_id": category["category_id"],
                    "category_name": category["category_name"],
                    "direct_ok": status_text(bool(families.get("direct_ok", False))),
                    "a_ok": status_text(bool(families.get("a_ok", False))),
                    "de_ok": status_text(bool(families.get("de_ok", False))),
                    "direct_a_ok": status_text(bool(families.get("direct_a_ok", False))),
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
        "# Category DICOVALENCE Family Matrix",
        "",
        "Legend:",
        "- `yes`: DICOVALENCE-backed evidence present",
        "- `no`: DICOVALENCE-backed evidence absent",
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
