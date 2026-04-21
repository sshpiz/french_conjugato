#!/usr/bin/env python3
"""
Generate French frame-card source artifacts for the top 500 verbs.
"""

from __future__ import annotations

import argparse

from frame_cards_lib import (
    OUTPUT_JSON,
    OUTPUT_JS,
    REVIEW_MD,
    build_cards_for_verb,
    load_core_pattern_index,
    load_present_tenses,
    load_rollout_verbs,
    load_usage_index,
    render_review,
    validate_cards,
    write_js,
    write_json,
)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Generate French frame-card data.")
    parser.add_argument("--check-only", action="store_true", help="Validate and print stats without writing files.")
    return parser


def main() -> None:
    parser = build_parser()
    args = parser.parse_args()

    rollout_verbs = load_rollout_verbs()
    present_tenses = load_present_tenses()
    usage_index = load_usage_index()
    core_index = load_core_pattern_index()

    cards = []
    for verb_entry in rollout_verbs:
        cards.extend(build_cards_for_verb(verb_entry, present_tenses, core_index, usage_index))

    cards.sort(key=lambda card: (card["verb"], card["frame_id"]))
    issues = validate_cards(cards, rollout_verbs, present_tenses)
    review_text = render_review(cards, issues, rollout_verbs)

    if not args.check_only:
        write_json(OUTPUT_JSON, cards)
        write_js(OUTPUT_JS, cards)
        REVIEW_MD.write_text(review_text, encoding="utf-8")

    covered = len({card["verb"] for card in cards})
    needs_review = sum(1 for card in cards if card.get("needs_review"))

    print(f"Generated {len(cards)} frame cards across {covered} verbs.")
    print(f"Needs review: {needs_review}")
    print(f"Validation issues: {len(issues)}")
    if not args.check_only:
        print(f"Wrote {OUTPUT_JSON.name}")
        print(f"Wrote {OUTPUT_JS.name}")
        print(f"Wrote {REVIEW_MD.name}")


if __name__ == "__main__":
    main()
