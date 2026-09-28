from __future__ import annotations

import csv
import json
from pathlib import Path


ROOT = Path(__file__).parent
INPUT_JSON = ROOT / "top500_usage_review_dataset.json"
OUT_JSON = ROOT / "top500_usage_final_dataset.json"
OUT_TSV = ROOT / "top500_usage_final_dataset.tsv"
OUT_MD = ROOT / "top500_usage_final_dataset.md"
OUT_SUMMARY = ROOT / "top500_usage_final_summary.md"

FINAL_BLOCKS = {
    ("à", "Je rends visite à mes parents demain"),
    ("à", "Elle se met à ce travail"),
    ("à", "Elle en veut à Paul"),
    ("de", "Le train part de Lyon"),
    ("de", "Elle repart de zéro"),
    ("de", "Elle se rend compte de son erreur"),
}


def load_rows() -> list[dict]:
    return json.loads(INPUT_JSON.read_text(encoding="utf-8"))


def prune_rows(rows: list[dict]) -> list[dict]:
    pruned: list[dict] = []
    for row in rows:
        clone = {
            "verb": row["verb"],
            "COD": row["COD"],
            "à": row["à"],
            "de": row["de"],
            "COD+à": row["COD+à"],
        }
        for family, sentence in FINAL_BLOCKS:
            if clone[family] == sentence:
                clone[family] = ""
        pruned.append(clone)
    return pruned


def write_outputs(rows: list[dict]) -> None:
    OUT_JSON.write_text(json.dumps(rows, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    with OUT_TSV.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.writer(handle, delimiter="\t")
        writer.writerow(["verbe", "COD", "à", "de", "COD+à"])
        for row in rows:
            writer.writerow([row["verb"], row["COD"], row["à"], row["de"], row["COD+à"]])

    lines: list[str] = []
    for row in rows:
        lines.append(f"## {row['verb']}")
        lines.append("")
        if row["COD"]:
            lines.append(f"- COD: {row['COD']}")
        if row["à"]:
            lines.append(f"- à: {row['à']}")
        if row["de"]:
            lines.append(f"- de: {row['de']}")
        if row["COD+à"]:
            lines.append(f"- COD+à: {row['COD+à']}")
        lines.append("")
    OUT_MD.write_text("\n".join(lines).rstrip() + "\n", encoding="utf-8")

    counts = {
        "COD": sum(1 for row in rows if row["COD"]),
        "à": sum(1 for row in rows if row["à"]),
        "de": sum(1 for row in rows if row["de"]),
        "COD+à": sum(1 for row in rows if row["COD+à"]),
    }
    summary = [
        "# Top500 Usage Final Dataset",
        "",
        f"- Total verbs: `{len(rows)}`",
        f"- COD: `{counts['COD']}`",
        f"- à: `{counts['à']}`",
        f"- de: `{counts['de']}`",
        f"- COD+à: `{counts['COD+à']}`",
        "",
        "## Manual Final Prunes",
        "",
    ]
    for family, sentence in sorted(FINAL_BLOCKS):
        summary.append(f"- `{family}`: `{sentence}`")
    OUT_SUMMARY.write_text("\n".join(summary) + "\n", encoding="utf-8")


def main() -> None:
    rows = prune_rows(load_rows())
    write_outputs(rows)


if __name__ == "__main__":
    main()
