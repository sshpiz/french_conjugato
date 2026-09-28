from __future__ import annotations

import re
from difflib import SequenceMatcher

from .models import AncestorHit, DescendantHit, Node
from .normalize import normalize_word

REMOTE_LANG_PENALTIES = {"ine-pro": 20, "gem-pro": 15}
PREFERRED_ANCESTOR_BONUSES = {"la": 20, "fro": 18, "frm": 18, "fr": 12, "grc": 12}
PREFERRED_POS = {"noun", "verb", "adj", "adjective"}
PUNCT_RE = re.compile(r"[^\w\s'\-\u00C0-\u024F]", re.UNICODE)


def score_candidate(
    french_node: Node,
    english_node: Node,
    ancestor_node: Node,
    french_hit: AncestorHit,
    english_hit: DescendantHit,
) -> tuple[float, float, list[str]]:
    relation_types = set(french_hit.relation_types) | set(english_hit.relation_types)
    score = 100.0
    score -= 12 * french_hit.distance
    score -= 12 * english_hit.distance
    score -= REMOTE_LANG_PENALTIES.get(ancestor_node.lang_code, 0)
    if "cognate_with" in relation_types:
        score -= 10
    if "composed_of" in relation_types:
        score -= 15
    warnings: list[str] = []
    if not english_node.glosses:
        score -= 10
        warnings.append("English entry has no glosses in source data.")
    if " " in english_node.normalized_word or "_" in english_node.normalized_word:
        score -= 10
        warnings.append("Multiword candidate.")
    if PUNCT_RE.search(english_node.word):
        score -= 5
        warnings.append("Candidate spelling contains punctuation or unusual characters.")
    score += PREFERRED_ANCESTOR_BONUSES.get(ancestor_node.lang_code, 0)
    if relation_types & {"borrowed_from", "learned_borrowing_from"}:
        score += 10
    if is_morphologically_similar(english_node.word, ancestor_node.word) or is_morphologically_similar(
        english_node.word, french_node.word
    ):
        score += 10
    if (english_node.pos or "").lower() in PREFERRED_POS:
        score += 5
    confidence = french_hit.confidence_product * english_hit.confidence_product
    if ancestor_node.lang_code in {"ine-pro", "gem-pro", "itc-pro", "cel-pro"}:
        confidence *= 0.75
    if relation_types == {"cognate_with"}:
        confidence *= 0.8
    if english_node.id not in {edge.from_id for edge in english_hit.path_edges} and not english_node.glosses:
        confidence *= 0.9
    return max(0.0, min(score, 125.0)), max(0.0, min(confidence, 1.0)), warnings


def is_morphologically_similar(left: str, right: str) -> bool:
    a = normalize_word(left).replace("_", " ")
    b = normalize_word(right).replace("_", " ")
    if len(a) < 4 or len(b) < 4:
        return False
    if a[:4] == b[:4] or a[-4:] == b[-4:]:
        return True
    return SequenceMatcher(None, a, b).ratio() >= 0.56


def relation_label(ancestor_node: Node, relation_types: list[str], english_path_langs: list[str]) -> str:
    types = set(relation_types)
    if any(lang in {"fr", "fro", "frm"} for lang in english_path_langs) and types & {
        "borrowed_from",
        "learned_borrowing_from",
        "descended_from",
    }:
        return "borrowed through French"
    if types and types <= {"composed_of"}:
        return "shares a word part"
    if ancestor_node.lang_code == "la":
        return "same Latin family"
    if ancestor_node.lang_code in {"fro", "frm"}:
        return "same Old French family"
    if ancestor_node.lang_code == "grc":
        return "same Ancient Greek family"
    if ancestor_node.lang_code == "ine-pro":
        return "distant Indo-European cousin"
    if ancestor_node.lang_code == "gem-pro":
        return "distant Germanic cousin"
    if "cognate_with" in types:
        return "cognate family"
    return "same etymology family"
