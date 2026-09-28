#!/usr/bin/env python3
from __future__ import annotations

import json
from pathlib import Path
from typing import Iterable

from build_french_a_de_preview_frames import (
    ROOT,
    OUT_JS,
    OUT_JSON,
    OUT_MD,
    build_row,
    load_tenses,
)


HARVEST_DIR = ROOT / "overnight_phrase_harvest_compare" / "20260424_114315_rescored_v3" / "gpt_5_4"
OUT_JSON = ROOT / "verb_frames.usage_test_preview.generated.json"
OUT_JS = ROOT / "verb_frames.usage_test_preview.js"
OUT_MD = ROOT / "verb_frames.usage_test_preview.md"

BONUS_TO_FAMILY = {
    "a_selected": "a",
    "de_selected": "de",
}


def stem_to_category_id(stem: str) -> str:
    return f"builtin-{stem.replace('_', '-')}"


def stem_to_category_name(stem: str) -> str:
    return stem.replace("_", " ").title().replace(" & ", " & ")


def iter_selected_rows() -> Iterable[dict]:
    for path in sorted(HARVEST_DIR.glob("phrase_harvest.*.json")):
        stem = path.stem.replace("phrase_harvest.", "")
        category_id = stem_to_category_id(stem)
        category_name = stem_to_category_name(stem)
        rows = json.loads(path.read_text(encoding="utf-8"))
        for row in rows:
            bonus_label = str(row.get("bonus_label") or "").strip()
            if row.get("tense") != "present":
                continue
            if bonus_label not in BONUS_TO_FAMILY:
                continue
            yield {
                "category_id": category_id,
                "category_name": category_name,
                "verb": row["verb"],
                "family": BONUS_TO_FAMILY[bonus_label],
                "sentence_fr": row["sentence_fr"],
                "translation_en": row.get("translation_en") or "",
                "tense": "present",
                "subject": row.get("subject") or "",
                "target_reason": f"usage_test:{bonus_label}",
                "source": "usage_harvest_test",
                "note": row.get("note") or "",
            }


def main() -> None:
    tenses = load_tenses()
    family_counter: dict[tuple[str, str], int] = {}
    seen_sentences: set[str] = set()
    frame_rows: list[dict] = []
    skipped_duplicates = 0
    skipped_errors: list[tuple[str, str, str]] = []

    for row in iter_selected_rows():
        sentence_key = str(row["sentence_fr"]).strip()
        if sentence_key in seen_sentences:
            skipped_duplicates += 1
            continue
        seen_sentences.add(sentence_key)
        try:
            frame = build_row(row, tenses, family_counter)
        except Exception as exc:  # preview/test builder: skip rough cases instead of aborting
            skipped_errors.append((row["verb"], row["sentence_fr"], str(exc)))
            continue
        frame["question"] = f"{frame['question']} *"
        frame["full_answer"] = f"{frame['full_answer']} *"
        frame_rows.append(frame)

    OUT_JSON.write_text(json.dumps(frame_rows, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    OUT_JS.write_text("window.verbFrames = " + json.dumps(frame_rows, ensure_ascii=False, indent=2) + ";\n", encoding="utf-8")

    lines = [
        "# French Usage Test Preview Frames",
        "",
        f"- Generated frame cards: {len(frame_rows)}",
        f"- Skipped duplicates: {skipped_duplicates}",
        f"- Skipped conversion errors: {len(skipped_errors)}",
        "",
        "## Sample",
        "",
    ]
    for row in frame_rows[:12]:
        lines.append(f"- {row['verb']} · {row['frame_type']} · {row['question']} -> {row['answer']}")
    if skipped_errors:
        lines.extend(["", "## Skipped examples", ""])
        for verb, sentence, reason in skipped_errors[:20]:
            lines.append(f"- {verb} · {sentence} · {reason}")
    OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")

    print(f"Wrote {len(frame_rows)} usage-test frame cards to {OUT_JSON}")
    print(f"Skipped {skipped_duplicates} duplicates and {len(skipped_errors)} conversion errors")


if __name__ == "__main__":
    main()
