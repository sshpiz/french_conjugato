#!/usr/bin/env python3
"""
Audit AI-generated French frame cards for structurally suspicious rows.

This pass is intentionally conservative. If a real parser is available later
(`stanza`), this script can be extended, but it already catches a set of clear
semantic mislabels in the current AI deck.
"""

from __future__ import annotations

import argparse
import json
import re
from collections import Counter
from pathlib import Path

from frame_cards_lib import OUTPUT_JS, OUTPUT_JSON, REVIEW_MD, write_js, write_json


ROOT = Path(__file__).parent
AUDIT_MD = ROOT / "verb_frames_ai_audit.md"

TIME_A_RE = re.compile(r"à (?:huit|neuf|dix|onze|midi|minuit|\d+h|demain|ce soir|ce matin|cet après-midi)", re.IGNORECASE)
PLACE_OR_THING_A_RE = re.compile(
    r"à (?:la gare|la boutique|l'école|la maison|la réunion|la soirée|ce rythme|autre chose|cette idée|mon projet)",
    re.IGNORECASE,
)
PERSON_RECIPIENT_RE = re.compile(
    r"\b(?:mon|ma|ton|ta|son|sa|notre|votre|leur)\s+"
    r"(?:frère|sœur|mere|mère|pere|père|ami|amie|fils|fille|mari|femme|copain|copine|voisin|voisine|professeur|cousine|propriétaire)"
    r"|\b(?:Marie|Paul|Lucie|maman|papa)\b"
    r"|\b(?:lui|leur)\b",
    re.IGNORECASE,
)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Audit AI-generated frame cards.")
    parser.add_argument("--apply", action="store_true", help="Remove flagged cards from verb_frames outputs.")
    return parser


def load_cards() -> list[dict]:
    return json.loads(OUTPUT_JSON.read_text(encoding="utf-8"))


def flag_card(card: dict) -> list[str]:
    reasons: list[str] = []
    if not str(card.get("source", "")).startswith("ai:"):
        return reasons

    verb = str(card.get("verb", "")).strip()
    frame_type = str(card.get("frame_type", "")).strip()
    full_answer = str(card.get("full_answer", "")).strip()

    if verb == "approprier":
        reasons.append("quarantined_lemma")

    if frame_type == "combo_a":
        if TIME_A_RE.search(full_answer):
            reasons.append("combo_a_time_adjunct")
        if PLACE_OR_THING_A_RE.search(full_answer):
            reasons.append("combo_a_place_or_thing_adjunct")
        if not PERSON_RECIPIENT_RE.search(full_answer):
            reasons.append("combo_a_no_clear_recipient")

    if frame_type == "a_object":
        if re.search(r"à ce rythme|à autre chose", full_answer, flags=re.IGNORECASE):
            reasons.append("weak_a_object")

    if frame_type == "de_object":
        if re.search(r"fait de doute", full_answer, flags=re.IGNORECASE):
            reasons.append("bad_de_object_formula")

    if verb == "autopsier":
        reasons.append("edge_learner_lemma")

    return reasons


def render_report(total_cards: int, flagged: list[tuple[dict, list[str]]], removed_count: int) -> str:
    reason_counts = Counter(reason for _, reasons in flagged for reason in reasons)
    lines = [
        "# AI Frame Audit",
        "",
        f"- Total cards inspected: `{total_cards}`",
        f"- Flagged AI cards: `{len(flagged)}`",
        f"- Removed from deck on this pass: `{removed_count}`",
        "",
        "## Reason Counts",
        "",
    ]
    if reason_counts:
        for reason, count in sorted(reason_counts.items()):
            lines.append(f"- `{reason}`: `{count}`")
    else:
        lines.append("- None")

    lines.extend(["", "## Flagged Cards", ""])
    if not flagged:
        lines.append("- None")
    else:
        for card, reasons in flagged:
            lines.append(
                f"- `{card['verb']}` `{card['frame_type']}` `{card['full_answer']}`"
                f" -> `{card['answer']}` [{', '.join(sorted(set(reasons)))}]"
            )
    return "\n".join(lines).rstrip() + "\n"


def main() -> None:
    args = build_parser().parse_args()
    cards = load_cards()

    flagged: list[tuple[dict, list[str]]] = []
    kept: list[dict] = []
    for card in cards:
        reasons = flag_card(card)
        if reasons:
            flagged.append((card, reasons))
        else:
            kept.append(card)

    AUDIT_MD.write_text(render_report(len(cards), flagged, len(cards) - len(kept) if args.apply else 0), encoding="utf-8")

    if args.apply:
        write_json(OUTPUT_JSON, kept)
        write_js(OUTPUT_JS, kept)
        # Keep the main review file stable but append a short marker at the end.
        existing_review = REVIEW_MD.read_text(encoding="utf-8") if REVIEW_MD.exists() else ""
        note = (
            "\n\n---\n\n"
            f"AI audit pass removed `{len(cards) - len(kept)}` flagged AI cards. "
            f"See `{AUDIT_MD.name}` for details.\n"
        )
        REVIEW_MD.write_text(existing_review.rstrip() + note, encoding="utf-8")
        print(f"Removed {len(cards) - len(kept)} flagged AI cards")
        print(f"New total: {len(kept)}")
    else:
        print(f"Flagged {len(flagged)} AI cards")


if __name__ == "__main__":
    main()
