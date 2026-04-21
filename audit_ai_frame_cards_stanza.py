#!/usr/bin/env python3
"""
Stanza-based audit for AI-generated French frame cards.

This pass focuses on structurally suspicious rows in AI-generated `a_object`,
`de_object`, and `combo_a` cards. It is intentionally conservative:

- flag rows where the hidden preposition chunk does not correspond to a clear
  dependency relation off the main finite verb
- flag `combo_a` rows that structurally look more like time/place adjuncts,
  infinitival complements, or other non-recipient `à` phrases

This parser pass is stronger than the earlier heuristic audit, but it still
does not fully solve deep lexical-semantic oddness by itself.
"""

from __future__ import annotations

import argparse
import json
import re
from collections import Counter
from dataclasses import dataclass
from pathlib import Path

from frame_cards_lib import OUTPUT_JSON


ROOT = Path(__file__).parent
AUDIT_MD = ROOT / "verb_frames_ai_stanza_audit.md"
DEFAULT_STANZA_DIR = ROOT / ".stanza_resources" / "1.11.0" / "resources"

TIME_NOUNS = {
    "heure", "heures", "jour", "jours", "matin", "soir", "minute", "minutes",
    "midi", "minuit", "an", "ans", "année", "années",
}
PLACE_NOUNS = {
    "gare", "boutique", "école", "ecole", "maison", "cinéma", "cinema",
    "bureau", "parc", "place", "ville",
}
PERSON_NOUNS = {
    "frère", "frere", "sœur", "soeur", "mère", "mere", "père", "pere",
    "ami", "amie", "copain", "copine", "voisin", "voisine", "professeur",
    "cousine", "maman", "papa", "propriétaire", "proprietaire",
}
PRONOUN_RECIPIENTS = {"lui", "leur"}


@dataclass
class ParsedWord:
    idx: int
    text: str
    lemma: str
    upos: str
    head: int
    deprel: str
    feats: str | None


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Audit AI frame cards with Stanza.")
    parser.add_argument("--apply", action="store_true", help="Remove flagged cards from the source deck.")
    parser.add_argument("--stanza-dir", default=str(DEFAULT_STANZA_DIR), help="Path to local Stanza resources dir.")
    return parser


def normalize_text(value: str) -> str:
    text = str(value or "").strip()
    text = text.replace("\u2019", "'").replace("\u2018", "'").replace("\u02bc", "'")
    return re.sub(r"\s+", " ", text).strip()


def load_cards() -> list[dict]:
    return json.loads(OUTPUT_JSON.read_text(encoding="utf-8"))


def build_nlp(stanza_dir: str):
    import stanza

    return stanza.Pipeline(
        "fr",
        processors="tokenize,mwt,pos,lemma,depparse",
        tokenize_no_ssplit=True,
        verbose=False,
        dir=stanza_dir,
        download_method=None,
    )


def parse_sentence(nlp, sentence: str) -> list[ParsedWord]:
    doc = nlp(sentence)
    words: list[ParsedWord] = []
    for sent in doc.sentences:
        for word in sent.words:
            words.append(
                ParsedWord(
                    idx=int(word.id),
                    text=word.text,
                    lemma=str(word.lemma or ""),
                    upos=str(word.upos or ""),
                    head=int(word.head or 0),
                    deprel=str(word.deprel or ""),
                    feats=str(word.feats) if word.feats else None,
                )
            )
    return words


def find_main_finite_verb(words: list[ParsedWord]) -> ParsedWord | None:
    finite = [
        word for word in words
        if word.upos in {"VERB", "AUX"} and word.feats and "VerbForm=Fin" in word.feats
    ]
    root_finite = [word for word in finite if word.head == 0]
    if root_finite:
        return root_finite[0]
    return finite[0] if finite else None


def children_of(words: list[ParsedWord], head_idx: int) -> list[ParsedWord]:
    return [word for word in words if word.head == head_idx]


def is_personish_word(word: ParsedWord) -> bool:
    lemma = word.lemma.lower()
    text = word.text.lower()
    if word.upos == "PROPN":
        return True
    if word.upos == "PRON" and lemma in PRONOUN_RECIPIENTS:
        return True
    if word.upos == "NOUN" and (lemma in PERSON_NOUNS or text in PERSON_NOUNS):
        return True
    return False


def subtree_has_personish_target(words: list[ParsedWord], head_idx: int) -> bool:
    for word in words:
        if word.idx == head_idx or word.head == head_idx:
            if is_personish_word(word):
                return True
    return False


def subtree_has_timeish_target(words: list[ParsedWord], head_idx: int) -> bool:
    for word in words:
        if word.idx == head_idx or word.head == head_idx:
            lemma = word.lemma.lower()
            text = word.text.lower()
            if word.upos == "NUM":
                return True
            if word.upos == "NOUN" and (lemma in TIME_NOUNS or text in TIME_NOUNS):
                return True
    return False


def subtree_has_place_or_thing_target(words: list[ParsedWord], head_idx: int) -> bool:
    for word in words:
        if word.idx == head_idx or word.head == head_idx:
            lemma = word.lemma.lower()
            text = word.text.lower()
            if word.upos == "NOUN" and (lemma in PLACE_NOUNS or text in PLACE_NOUNS):
                return True
    return False


def base_prep_surface(surface: str) -> str:
    lowered = surface.lower().strip()
    if lowered in {"au", "aux", "à", "à la", "à l'"}:
        return "à"
    if lowered in {"du", "des", "de", "de la", "de l'", "d'"}:
        return "de"
    return lowered


def case_matches_surface(case_word: ParsedWord, surface: str) -> bool:
    base = base_prep_surface(surface)
    if case_word.text.lower() == surface.lower():
        return True
    if case_word.text.lower() == base:
        return True
    return False


def find_case_or_mark_child(words: list[ParsedWord], phrase_head_idx: int, surface: str) -> ParsedWord | None:
    for child in children_of(words, phrase_head_idx):
        if child.deprel not in {"case", "mark"}:
            continue
        if case_matches_surface(child, surface):
            return child
    return False


def has_direct_object(words: list[ParsedWord], verb_idx: int) -> bool:
    return any(
        word.head == verb_idx and word.deprel in {"obj", "iobj"} for word in words
    )


def flag_card(card: dict, nlp) -> list[str]:
    reasons: list[str] = []
    if not str(card.get("source", "")).startswith("ai:"):
        return reasons

    frame_type = str(card.get("frame_type", "")).strip()
    if frame_type not in {"a_object", "de_object", "combo_a"}:
        return reasons

    sentence = normalize_text(card.get("full_answer", ""))
    answer = normalize_text(card.get("answer", ""))
    words = parse_sentence(nlp, sentence)
    main_verb = find_main_finite_verb(words)
    if not words or not main_verb:
        return ["no_main_finite_verb"]

    prep_surface = ""
    if frame_type in {"a_object", "combo_a"}:
        match = re.search(r"\b(à|au|aux)\b|à l'|à la", answer, flags=re.IGNORECASE)
        prep_surface = match.group(0).lower() if match else ""
    elif frame_type == "de_object":
        match = re.search(r"\b(de|du|des)\b|de l'|de la|d'", answer, flags=re.IGNORECASE)
        prep_surface = match.group(0).lower() if match else ""

    arg_heads = [
        word for word in words
        if word.head == main_verb.idx and word.deprel in {"obl:arg", "obl", "csubj", "xcomp"}
    ]

    matched_arg = None
    for arg in arg_heads:
        case = find_case_or_mark_child(words, arg.idx, prep_surface) if prep_surface else None
        if case:
            matched_arg = (arg, case)
            break
        if frame_type == "de_object" and arg.deprel in {"csubj", "xcomp"}:
            case = find_case_or_mark_child(words, arg.idx, "de")
            if case:
                matched_arg = (arg, case)
                break

    if prep_surface and not matched_arg:
        reasons.append("missing_expected_prep_dependency")
        return reasons

    if frame_type == "combo_a":
        if not has_direct_object(words, main_verb.idx):
            reasons.append("combo_a_missing_direct_object")
        if matched_arg:
            arg, _ = matched_arg
            if arg.upos == "VERB":
                reasons.append("combo_a_infinitive_complement")
            if subtree_has_timeish_target(words, arg.idx):
                reasons.append("combo_a_time_adjunct")
            if subtree_has_place_or_thing_target(words, arg.idx) and not subtree_has_personish_target(words, arg.idx):
                reasons.append("combo_a_place_or_thing_adjunct")
            if not subtree_has_personish_target(words, arg.idx):
                reasons.append("combo_a_no_person_like_recipient")

    if frame_type == "a_object" and matched_arg:
        arg, _ = matched_arg
        if arg.upos == "VERB":
            reasons.append("a_object_infinitive_complement")
        if subtree_has_timeish_target(words, arg.idx):
            reasons.append("a_object_time_adjunct")
        if subtree_has_place_or_thing_target(words, arg.idx) and not subtree_has_personish_target(words, arg.idx):
            reasons.append("a_object_place_or_thing_adjunct")

    if frame_type == "de_object":
        if matched_arg:
            arg, _ = matched_arg
            if arg.upos == "VERB":
                reasons.append("de_object_infinitive_complement")
        if "fait de doute" in sentence.lower():
            reasons.append("bad_de_object_formula")

    return sorted(set(reasons))


def render_report(total_cards: int, flagged: list[tuple[dict, list[str]]], removed_count: int) -> str:
    reason_counts = Counter(reason for _, reasons in flagged for reason in reasons)
    lines = [
        "# AI Frame Stanza Audit",
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
                f" -> `{card['answer']}` [{', '.join(reasons)}]"
            )
    return "\n".join(lines).rstrip() + "\n"


def main() -> None:
    args = build_parser().parse_args()
    cards = load_cards()
    nlp = build_nlp(args.stanza_dir)

    flagged: list[tuple[dict, list[str]]] = []
    kept: list[dict] = []
    for card in cards:
        reasons = flag_card(card, nlp)
        if reasons:
            flagged.append((card, reasons))
        else:
            kept.append(card)

    AUDIT_MD.write_text(render_report(len(cards), flagged, len(cards) - len(kept) if args.apply else 0), encoding="utf-8")

    if args.apply:
        OUTPUT_JSON.write_text(json.dumps(kept, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(f"Removed {len(cards) - len(kept)} flagged AI cards")
        print(f"New total: {len(kept)}")
    else:
        print(f"Flagged {len(flagged)} AI cards")


if __name__ == "__main__":
    main()
