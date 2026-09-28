from __future__ import annotations

import json
from collections import defaultdict
from pathlib import Path
import unicodedata

from frame_cards_lib import split_subject_and_answer


ROOT = Path(__file__).parent
INPUT_JSON = ROOT / "verb_frames.generated.json"
OUTPUT_MD = ROOT / "verb_frames_sorted_review.md"


def lexical_key(value: str) -> str:
    normalized = unicodedata.normalize("NFD", value.casefold())
    stripped = "".join(char for char in normalized if unicodedata.category(char) != "Mn")
    return stripped


def highlight_missing_chunk(full_answer: str, answer: str) -> str:
    subject, remainder = split_subject_and_answer(full_answer)
    if remainder.startswith(answer):
        tail = remainder[len(answer) :]
        if subject.endswith("'"):
            return f"{subject}**{answer}**{tail}"
        return f"{subject} **{answer}**{tail}"
    if answer in full_answer:
        return full_answer.replace(answer, f"**{answer}**", 1)
    return full_answer


def main() -> None:
    with INPUT_JSON.open(encoding="utf-8") as handle:
        cards = json.load(handle)

    by_verb: dict[str, list[dict]] = defaultdict(list)
    for card in cards:
        by_verb[str(card["verb"])].append(card)

    lines: list[str] = []

    for verb in sorted(by_verb, key=lexical_key):
        verb_cards = sorted(
            by_verb[verb],
            key=lambda card: (
                lexical_key(str(card.get("full_answer", ""))),
                lexical_key(str(card.get("frame_type", ""))),
                str(card.get("frame_id", "")),
            ),
        )
        for card in verb_cards:
            rendered = highlight_missing_chunk(str(card["full_answer"]), str(card["answer"]))
            lines.append(rendered)

    OUTPUT_MD.write_text("\n".join(lines).rstrip() + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
