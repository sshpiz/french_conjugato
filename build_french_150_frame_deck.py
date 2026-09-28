#!/usr/bin/env python3
from __future__ import annotations

import json
import re
from collections import Counter, defaultdict
from pathlib import Path


ROOT = Path(__file__).parent
CURATED_FRAMES = ROOT / "verb_frames.curated_a_de_preview.generated.json"
USAGE_FRAMES = ROOT / "verb_frames.usage_test_preview.generated.json"
OUT_JSON = ROOT / "verb_frames.french_150.generated.json"
OUT_JS = ROOT / "verb_frames.french_150.js"
OUT_MD = ROOT / "verb_frames.french_150.md"


# Selected from the usage-test preview after manual review.
# Indexing is 1-based over the "extra" rows not already present in the curated deck.
KEEP_USAGE_EXTRA_INDICES = {
    3, 4, 6, 9, 10, 11, 12, 13, 14, 15,
    17, 20, 21, 22, 23, 24, 25, 26, 28, 29,
    30, 31, 32, 33, 34, 35, 36, 37, 38, 39,
    40, 42, 44, 45, 46, 48, 49, 52, 54, 58,
    59, 60, 61, 62, 65, 68, 69, 70, 72, 73,
    75, 77, 78, 80,
}


def strip_test_marker(text: str) -> str:
    value = str(text or "").strip()
    value = re.sub(r"\s+\*$", "", value)
    value = re.sub(r"\s+", " ", value)
    return value.strip()


def load_rows(path: Path) -> list[dict]:
    return json.loads(path.read_text(encoding="utf-8"))


def select_usage_extras(curated: list[dict], usage: list[dict]) -> list[dict]:
    curated_full_answers = {strip_test_marker(row["full_answer"]) for row in curated}
    extras = [row for row in usage if strip_test_marker(row["full_answer"]) not in curated_full_answers]
    selected = []
    for index, row in enumerate(extras, start=1):
        if index not in KEEP_USAGE_EXTRA_INDICES:
            continue
        selected.append(dict(row))
    return selected


def normalize_rows(curated: list[dict], usage_selected: list[dict]) -> list[dict]:
    category_name_map = {row.get("category_id"): row.get("category_name") for row in curated if row.get("category_id")}

    merged = []
    for row in curated:
        merged.append(dict(row))

    for row in usage_selected:
        normalized = dict(row)
        normalized["question"] = strip_test_marker(normalized["question"])
        normalized["full_answer"] = strip_test_marker(normalized["full_answer"])
        normalized["source"] = "usage_harvest_keep"
        normalized["note"] = "usage_keep"
        category_id = normalized.get("category_id")
        if category_id in category_name_map:
            normalized["category_name"] = category_name_map[category_id]
        merged.append(normalized)

    family_counter: dict[tuple[str, str], int] = defaultdict(int)
    for row in merged:
        key = (row["verb"], row["frame_type"])
        family_counter[key] += 1
        row["frame_id"] = f"{row['verb']}_{row['frame_type']}_{family_counter[key]:02d}"
    return merged


def write_outputs(rows: list[dict], kept_usage_count: int) -> None:
    OUT_JSON.write_text(json.dumps(rows, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    OUT_JS.write_text("window.verbFrames = " + json.dumps(rows, ensure_ascii=False, indent=2) + ";\n", encoding="utf-8")

    by_category = Counter(row.get("category_name") or "" for row in rows)
    by_source = Counter(row.get("source") or "" for row in rows)

    lines = [
        "# French 150 Deck",
        "",
        f"- Total frame cards: {len(rows)}",
        f"- Curated base cards: {len(rows) - kept_usage_count}",
        f"- Kept usage-harvest cards: {kept_usage_count}",
        "",
        "## By Source",
        "",
    ]
    for source, count in sorted(by_source.items()):
        lines.append(f"- {source}: {count}")
    lines.extend([
        "",
        "## By Category",
        "",
    ])
    for category_name, count in sorted(by_category.items()):
        lines.append(f"- {category_name}: {count}")
    OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> None:
    curated = load_rows(CURATED_FRAMES)
    usage = load_rows(USAGE_FRAMES)
    usage_selected = select_usage_extras(curated, usage)
    merged = normalize_rows(curated, usage_selected)
    write_outputs(merged, len(usage_selected))
    print(f"Wrote {len(merged)} frame cards to {OUT_JSON}")
    print(f"Kept {len(usage_selected)} usage-harvest extras")


if __name__ == "__main__":
    main()
