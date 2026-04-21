#!/usr/bin/env python3
"""
Shared helpers for French frame-card generation.
"""

from __future__ import annotations

import json
import re
import unicodedata
from collections import Counter, defaultdict
from dataclasses import dataclass
from pathlib import Path

ROOT = Path(__file__).parent
VERBS_JS = ROOT / "js" / "verbs.full.js"
USAGES_JS = ROOT / "verb_usages.js"
CORE_PATTERNS_JSON = ROOT / "verb_core_patterns.json"
OUTPUT_JSON = ROOT / "verb_frames.generated.json"
OUTPUT_JS = ROOT / "verb_frames.js"
REVIEW_MD = ROOT / "verb_frames_review.md"

ROLLOUT_TIERS = {"top20", "top50", "top100", "top500"}

SUBJECT_KEYS = {
    "je": ("je",),
    "tu": ("tu",),
    "il": ("il/elle/on", "il"),
    "nous": ("nous",),
    "vous": ("vous",),
    "ils": ("ils/elles", "ils"),
}

PATTERN_PRIORITY = {
    "combo_a": 100,
    "combo_de": 98,
    "a_object": 96,
    "de_object": 94,
    "locative_a": 93,
    "chez_person": 92,
    "a_infinitive": 91,
    "de_infinitive": 90,
    "bare_infinitive": 89,
    "direct_object": 88,
    "que_clause": 84,
    "si_clause": 83,
    "avec_object": 82,
    "predicate": 80,
    "reflexive": 78,
    "il_y_a": 77,
    "intransitive": 70,
    "fallback": 10,
}

PERSON_FILLERS = ["Paul", "Marie", "Léa"]
OBJECT_FILLERS = ["le livre", "le café", "le message", "la réponse", "la porte", "la musique", "le train"]
ABSTRACT_FILLERS = ["le problème", "l'idée", "la situation", "le projet"]
PLACE_FILLERS = ["Paris", "la gare", "la maison"]
LANGUAGE_FILLERS = ["français", "anglais"]
INSTRUMENT_FILLERS = ["la guitare", "le piano"]
GAME_FILLERS = ["cache-cache", "tennis"]
INFINITIVE_FILLERS = ["venir", "partir", "répondre", "travailler", "dormir"]
CLAUSE_FILLERS = ["Paul arrive", "Marie est là", "tout va bien"]
SI_FILLERS = ["Paul vient", "on a le temps", "Marie peut aider"]
ADVERB_FILLERS = ["ici", "demain", "encore", "vite", "bien"]
ADJECTIVE_FILLERS = ["prêt", "calme", "heureux"]
NOUN_PREDICATE_FILLERS = ["professeur", "ami", "prêt"]

MOVEMENT_VERBS = {
    "aller", "arriver", "courir", "entrer", "partir", "reculer", "revenir", "rouler",
    "sortir", "tomber", "venir", "voyager",
}
WORK_VERBS = {"travailler", "bosser"}
INTRANSITIVE_FALLBACK_VERBS = {
    "accélérer", "déjeuner", "dîner", "durer", "marcher", "naître", "pleurer",
    "pourrir", "reculer", "rouler", "voyager", "éclater",
}
DE_OBJECT_FALLBACK_VERBS = {"dépendre", "témoigner", "souvenir"}
A_OBJECT_FALLBACK_VERBS = {"correspondre", "échapper"}
DIRECT_OBJECT_FALLBACK_VERBS = {
    "capturer", "coter", "crémer", "interroger", "intéresser", "mener", "prouver",
    "reconnaître", "rejeter", "subir", "transformer", "écouter", "adapter", "autopsier",
}

LEMMA_ALIAS = {
    "souvenir": "se souvenir",
}

MANUAL_CARDS = {
    "avoir": [
        {
            "question": "j'____ besoin de dormir",
            "answer": "ai",
            "full_answer": "j'ai besoin de dormir",
            "frame_type": "de_infinitive",
            "source": "manual:avoir_besoin",
        },
        {
            "question": "il ____ ____ ____ pain sur la table",
            "answer": "y a du",
            "full_answer": "il y a du pain sur la table",
            "frame_type": "il_y_a",
            "source": "manual:il_y_a",
        },
    ],
    "être": [
        {
            "question": "je ____ prêt",
            "answer": "suis",
            "full_answer": "je suis prêt",
            "frame_type": "predicate",
            "source": "manual:etre_predicate",
        },
        {
            "question": "la voiture ____ ____ Paul",
            "answer": "est à",
            "full_answer": "la voiture est à Paul",
            "frame_type": "a_object",
            "source": "manual:etre_belong",
        },
    ],
    "falloir": [
        {
            "question": "il ____ partir",
            "answer": "faut",
            "full_answer": "il faut partir",
            "frame_type": "bare_infinitive",
            "source": "manual:falloir_inf",
        },
        {
            "question": "il ____ que Paul arrive",
            "answer": "faut",
            "full_answer": "il faut que Paul arrive",
            "frame_type": "que_clause",
            "source": "manual:falloir_que",
        },
    ],
    "souvenir": [
        {
            "question": "je ____ ____ ____ Paul",
            "answer": "me souviens de",
            "full_answer": "je me souviens de Paul",
            "frame_type": "de_object",
            "source": "manual:se_souvenir",
            "needs_review": True,
            "review_reason": "Source lemma is `souvenir`, but the learner-facing frame must use `se souvenir`.",
        },
    ],
    "correspondre": [
        {
            "question": "ça ____ ____ notre idée",
            "answer": "correspond à",
            "full_answer": "ça correspond à notre idée",
            "frame_type": "a_object",
            "source": "manual:correspondre_a",
        },
    ],
    "manquer": [
        {
            "question": "je ____ le train",
            "answer": "manque",
            "full_answer": "je manque le train",
            "frame_type": "direct_object",
            "source": "manual:manquer_direct",
        },
        {
            "question": "tu ____ ____ Paul",
            "answer": "manques à",
            "full_answer": "tu manques à Paul",
            "frame_type": "a_object",
            "source": "manual:manquer_a",
        },
    ],
    "naître": [
        {
            "question": "il ____ en mai",
            "answer": "naît",
            "full_answer": "il naît en mai",
            "frame_type": "intransitive",
            "source": "manual:naitre",
        },
    ],
    "prouver": [
        {
            "question": "ça ____ que Paul ment",
            "answer": "prouve",
            "full_answer": "ça prouve que Paul ment",
            "frame_type": "que_clause",
            "source": "manual:prouver_que",
        },
    ],
    "témoigner": [
        {
            "question": "ça ____ ____ son effort",
            "answer": "témoigne de",
            "full_answer": "ça témoigne de son effort",
            "frame_type": "de_object",
            "source": "manual:temoigner_de",
        },
    ],
    "échapper": [
        {
            "question": "ça ____ ____ Paul",
            "answer": "échappe à",
            "full_answer": "ça échappe à Paul",
            "frame_type": "a_object",
            "source": "manual:echapper_a",
        },
    ],
    "obliger": [
        {
            "question": "j'____ Paul à venir",
            "answer": "oblige",
            "full_answer": "j'oblige Paul à venir",
            "frame_type": "a_infinitive",
            "source": "manual:obliger_a_inf",
        },
    ],
    "empêcher": [
        {
            "question": "ça ____ Paul de dormir",
            "answer": "empêche",
            "full_answer": "ça empêche Paul de dormir",
            "frame_type": "de_infinitive",
            "source": "manual:empecher_de_inf",
        },
    ],
    "approprier": [
        {
            "question": "je ____ le projet",
            "answer": "m'approprie",
            "full_answer": "je m'approprie le projet",
            "frame_type": "direct_object",
            "source": "manual:s_approprier",
            "needs_review": True,
            "review_reason": "Source lemma is `approprier`, but the natural learner-facing pattern is reflexive.",
        },
    ],
    "venir": [
        {
            "question": "je ____ ici",
            "answer": "viens",
            "full_answer": "je viens ici",
            "frame_type": "intransitive",
            "source": "manual:venir_intransitive",
        },
        {
            "question": "il ____ ____ venir",
            "answer": "vient de",
            "full_answer": "il vient de venir",
            "frame_type": "de_infinitive",
            "source": "manual:venir_de_inf",
        },
    ],
    "voir": [
        {
            "question": "je ____ Paul",
            "answer": "vois",
            "full_answer": "je vois Paul",
            "frame_type": "direct_object",
            "source": "manual:voir_direct",
        },
        {
            "question": "il ____ que Marie arrive",
            "answer": "voit",
            "full_answer": "il voit que Marie arrive",
            "frame_type": "que_clause",
            "source": "manual:voir_que",
        },
    ],
    "savoir": [
        {
            "question": "je ____ nager",
            "answer": "sais",
            "full_answer": "je sais nager",
            "frame_type": "bare_infinitive",
            "source": "manual:savoir_inf",
        },
        {
            "question": "il ____ la réponse",
            "answer": "sait",
            "full_answer": "il sait la réponse",
            "frame_type": "direct_object",
            "source": "manual:savoir_direct",
        },
        {
            "question": "il ____ que Marie est là",
            "answer": "sait",
            "full_answer": "il sait que Marie est là",
            "frame_type": "que_clause",
            "source": "manual:savoir_que",
        },
    ],
    "appeler": [
        {
            "question": "j'____ Marie",
            "answer": "appelle",
            "full_answer": "j'appelle Marie",
            "frame_type": "direct_object",
            "source": "manual:appeler_direct",
        },
    ],
    "arriver": [
        {
            "question": "j'____ ici",
            "answer": "arrive",
            "full_answer": "j'arrive ici",
            "frame_type": "intransitive",
            "source": "manual:arriver_intransitive",
        },
        {
            "question": "nous ____ ____ répondre",
            "answer": "arrivons à",
            "full_answer": "nous arrivons à répondre",
            "frame_type": "a_infinitive",
            "source": "manual:arriver_a_inf",
        },
    ],
    "dire": [
        {
            "question": "je ____ la vérité à Marie",
            "answer": "dis",
            "full_answer": "je dis la vérité à Marie",
            "frame_type": "combo_a",
            "source": "manual:dire_combo",
        },
        {
            "question": "il ____ que Paul arrive",
            "answer": "dit",
            "full_answer": "il dit que Paul arrive",
            "frame_type": "que_clause",
            "source": "manual:dire_que",
        },
    ],
    "faire": [
        {
            "question": "je ____ un gâteau",
            "answer": "fais",
            "full_answer": "je fais un gâteau",
            "frame_type": "direct_object",
            "source": "manual:faire_direct",
        },
        {
            "question": "il ____ réparer la voiture",
            "answer": "fait",
            "full_answer": "il fait réparer la voiture",
            "frame_type": "bare_infinitive",
            "source": "manual:faire_inf",
        },
    ],
    "mettre": [
        {
            "question": "je ____ la clé ici",
            "answer": "mets",
            "full_answer": "je mets la clé ici",
            "frame_type": "direct_object",
            "source": "manual:mettre_direct",
        },
    ],
    "passer": [
        {
            "question": "il ____ ____ Marie",
            "answer": "passe chez",
            "full_answer": "il passe chez Marie",
            "frame_type": "chez_person",
            "source": "manual:passer_chez",
        },
        {
            "question": "nous ____ ici",
            "answer": "passons",
            "full_answer": "nous passons ici",
            "frame_type": "intransitive",
            "source": "manual:passer_intransitive",
        },
    ],
    "prendre": [
        {
            "question": "je ____ le train",
            "answer": "prends",
            "full_answer": "je prends le train",
            "frame_type": "direct_object",
            "source": "manual:prendre_direct",
        },
    ],
    "exprimer": [
        {
            "question": "j'____ mon avis",
            "answer": "exprime",
            "full_answer": "j'exprime mon avis",
            "frame_type": "direct_object",
            "source": "manual:exprimer_direct",
        },
        {
            "question": "il ____ sa gratitude",
            "answer": "exprime",
            "full_answer": "il exprime sa gratitude",
            "frame_type": "direct_object",
            "source": "manual:exprimer_direct_2",
        },
    ],
    "habituer": [
        {
            "question": "j'____ Paul à ce bruit",
            "answer": "habitue",
            "full_answer": "j'habitue Paul à ce bruit",
            "frame_type": "a_object",
            "source": "manual:habituer_a",
        },
    ],
}


@dataclass(frozen=True)
class PatternCandidate:
    verb: str
    frame_type: str
    pattern_text: str
    source: str
    priority: int


@dataclass(frozen=True)
class UsageSurfaceMatch:
    prefix: str
    answer_base: str
    suffix: str
    matched_full_form: bool
    subject_hint: str
    answer_present: str


def slugify(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", str(value or ""))
    ascii_value = normalized.encode("ascii", "ignore").decode("ascii")
    return re.sub(r"[^a-z0-9]+", "_", ascii_value.lower()).strip("_")


def load_js_array(path: Path, prefix: str) -> list[dict]:
    text = path.read_text(encoding="utf-8")
    match = re.search(re.escape(prefix) + r"\s*(\[[\s\S]*?\]);", text)
    if not match:
        raise ValueError(f"Could not parse array from {path.name}")
    return json.loads(match.group(1))


def load_js_object(path: Path, prefix: str, suffix: str) -> dict:
    text = path.read_text(encoding="utf-8")
    pattern = re.escape(prefix) + r"\s*(\{[\s\S]*?\})" + re.escape(suffix)
    match = re.search(pattern, text)
    if not match:
        raise ValueError(f"Could not parse object from {path.name}")
    return json.loads(match.group(1))


def load_rollout_verbs() -> list[dict]:
    verbs = load_js_array(VERBS_JS, "const verbs =")
    return [verb for verb in verbs if verb.get("frequency") in ROLLOUT_TIERS]


def load_present_tenses() -> dict[str, dict[str, str]]:
    tenses = load_js_object(VERBS_JS, "const tenses =", ";\n\nconst pronouns =")
    return tenses["present"]


def load_usage_index() -> dict[str, list[dict]]:
    entries = load_js_array(USAGES_JS, "window.verbUsages =")
    index: dict[str, list[dict]] = defaultdict(list)
    for entry in entries:
        verb = str(entry.get("verb", "")).strip()
        if verb:
            index[verb].append(entry)
    return index


def load_core_pattern_index() -> dict[str, list[dict]]:
    if not CORE_PATTERNS_JSON.exists():
        return {}
    entries = json.loads(CORE_PATTERNS_JSON.read_text(encoding="utf-8"))
    index: dict[str, list[dict]] = {}
    for entry in entries:
        verb = str(entry.get("verb", "")).strip()
        if verb:
            index[verb] = list(entry.get("core_patterns", []) or [])
    return index


def normalize_pattern_text(value: str) -> str:
    text = str(value or "").strip().lower()
    replacements = {
        "quelqu’un": "qqn",
        "quelqu'un": "qqn",
        "quelque chose": "qqch",
        "person": "qqn",
        "object": "qqch",
        "objet": "qqch",
        "place": "lieu",
        "destination": "lieu",
        "quelqu’un / quelque chose": "qqn / qqch",
    }
    for old, new in replacements.items():
        text = text.replace(old, new)
    text = text.replace("[", "").replace("]", "")
    text = re.sub(r"\s+", " ", text)
    return text


def map_pattern_type(raw_type: str, text: str) -> str:
    normalized_type = (raw_type or "").strip()
    if "il y a" in text:
        return "il_y_a"
    if " qqch à qqn" in text or " qqn à qqn" in text:
        return "combo_a"
    if " qqch de qqn" in text or " qqn de qqn" in text:
        return "combo_de"
    if " chez " in text:
        return "chez_person"
    if " à + lieu" in text or " à lieu" in text:
        return "locative_a"
    if " à + infinit" in text or " à + infinitif" in text:
        return "a_infinitive"
    if " de + infinit" in text or " de + infinitif" in text:
        return "de_infinitive"
    if "+ infinit" in text or " + infinitif" in text or text.endswith(" infinitif"):
        return "bare_infinitive"
    if " que + " in text or " que " in text and "proposition" in text:
        return "que_clause"
    if " si + " in text:
        return "si_clause"
    if " avec " in text:
        return "avec_object"
    if text.startswith("se ") or text.startswith("s'"):
        if " de " in text:
            return "de_object"
        if " à " in text:
            return "a_object"
        return "reflexive"
    if " à qqn" in text or " à qqch" in text or " à " in text and "lieu" not in text:
        return "a_object"
    if " de qqn" in text or " de qqch" in text:
        return "de_object"
    if " qqn" in text or " qqch" in text:
        return "direct_object"
    if "nom / adjectif" in text:
        return "predicate"

    if normalized_type == "combo-a":
        return "combo_a"
    if normalized_type == "combo-de":
        return "combo_de"
    if normalized_type == "a-object" or normalized_type == "reflexive-a":
        return "a_object"
    if normalized_type == "de-object" or normalized_type == "reflexive-de":
        return "de_object"
    if normalized_type == "a-infinitive":
        return "a_infinitive"
    if normalized_type == "de-infinitive":
        return "de_infinitive"
    if normalized_type == "bare-infinitive":
        return "bare_infinitive"
    if normalized_type == "que-clause" or normalized_type == "reflexive-que":
        return "que_clause"
    if normalized_type == "si-clause" or normalized_type == "reflexive-si":
        return "si_clause"
    if normalized_type == "locative":
        return "locative_a"
    if normalized_type == "avec" or normalized_type == "reflexive-avec":
        return "avec_object"
    if normalized_type == "object-predicate":
        return "predicate"
    if normalized_type == "direct-object":
        return "direct_object"
    if normalized_type == "impersonal":
        return "intransitive"
    if normalized_type == "reflexive":
        return "reflexive"
    if normalized_type == "intransitive":
        return "intransitive"
    return "intransitive"


def should_skip_pattern(verb: str, text: str) -> bool:
    if any(fragment in text for fragment in ("météo", "adjectif", "rôle")) and verb != "être":
        return True
    if "qqn" in text and "infinit" in text:
        return True
    if verb == "aller" and text.startswith("aller à") and "lieu" not in text:
        return True
    if verb == "venir" and text.startswith("venir à"):
        return True
    if verb == "jouer" and "à + infinit" in text:
        return True
    return False


def is_canonical_pattern_shape(verb: str, text: str) -> bool:
    if text.startswith("il y a") or text.startswith("il faut"):
        return True

    lemma_prefixes = [verb]
    if verb.startswith("se "):
        lemma_prefixes.append("s'" + verb[3:])

    matched_prefix = None
    for prefix in lemma_prefixes:
        if text.startswith(prefix):
            matched_prefix = prefix
            break
    if matched_prefix is None:
        return False

    remainder = text[len(matched_prefix):]
    allowed_remainders = (
        "",
        " qqn",
        " qqch",
        " qqn / qqch",
        " à qqn",
        " à qqch",
        " à qqn / qqch",
        " de qqn",
        " de qqch",
        " de qqn / qqch",
        " chez qqn",
        " chez + qqn",
        " à + lieu",
        " + infinitif",
        " à + infinitif",
        " de + infinitif",
        " que + proposition",
        " que + subj.",
        " si + proposition",
        " qqch à qqn",
        " qqch de qqn",
        " qqn + adjectif",
        " + nom / adjectif",
        " + langue",
        " à + jeu / sport",
        " de + instrument",
        " avec qqn",
        " avec qqn / qqch",
        " (reflexive)",
        " (reciprocal)",
    )
    if any(remainder.startswith(prefix) for prefix in allowed_remainders):
        return True

    if remainder.startswith(" + qqn") or remainder.startswith(" + qqch") or remainder.startswith(" + à +") or remainder.startswith(" + de +"):
        return True

    return False


def build_pattern_candidates(verb: str, core_patterns: list[dict], usages: list[dict]) -> list[PatternCandidate]:
    candidates: list[PatternCandidate] = []
    seen: set[tuple[str, str]] = set()

    for entry in core_patterns:
        pattern_text = normalize_pattern_text(entry.get("pattern", ""))
        if not pattern_text or should_skip_pattern(verb, pattern_text) or not is_canonical_pattern_shape(verb, pattern_text):
            continue
        frame_type = map_pattern_type(entry.get("pattern_type", ""), pattern_text)
        key = (frame_type, pattern_text)
        if key in seen:
            continue
        seen.add(key)
        candidates.append(
            PatternCandidate(
                verb=verb,
                frame_type=frame_type,
                pattern_text=pattern_text,
                source=f"core:{entry.get('pattern_id') or pattern_text}",
                priority=PATTERN_PRIORITY.get(frame_type, 50) + 4,
            )
        )

    for index, entry in enumerate(usages, start=1):
        pattern_text = normalize_pattern_text(entry.get("pattern", ""))
        if not pattern_text or should_skip_pattern(verb, pattern_text) or not is_canonical_pattern_shape(verb, pattern_text):
            continue
        frame_type = map_pattern_type("", pattern_text)
        key = (frame_type, pattern_text)
        if key in seen:
            continue
        seen.add(key)
        candidates.append(
            PatternCandidate(
                verb=verb,
                frame_type=frame_type,
                pattern_text=pattern_text,
                source=f"usage:{entry.get('sense_id') or index}",
                priority=PATTERN_PRIORITY.get(frame_type, 50),
            )
        )

    candidates.sort(key=lambda item: (-item.priority, item.pattern_text))
    return candidates


def split_subject_and_answer(full_form: str) -> tuple[str, str]:
    if full_form.startswith("j'"):
        return "j'", full_form[2:]
    if " " not in full_form:
        raise ValueError(f"Could not split subject from form: {full_form}")
    subject, answer = full_form.split(" ", 1)
    return subject, answer


def join_subject_and_answer(subject: str, answer: str) -> str:
    if subject.endswith("'"):
        return f"{subject}{answer}"
    return f"{subject} {answer}"


def question_with_gaps(subject: str, answer: str, tail: str) -> str:
    gap_tokens = ["____"] * len(answer.split())
    if subject.endswith("'"):
        start = f"{subject}{' '.join(gap_tokens)}"
    else:
        start = f"{subject} {' '.join(gap_tokens)}"
    if tail:
        return f"{start} {tail}".strip()
    return start.strip()


def extract_form_for_subject(forms: dict[str, str], subject_key: str) -> str | None:
    for raw_key in SUBJECT_KEYS[subject_key]:
        value = forms.get(raw_key)
        if value:
            return value
    return None


def reindex_cards(verb: str, cards: list[dict]) -> list[dict]:
    reindexed: list[dict] = []
    for index, card in enumerate(cards, start=1):
        clone = dict(card)
        clone["frame_id"] = f"{slugify(verb)}_frame_{index:02d}"
        reindexed.append(clone)
    return reindexed


def card_record(
    verb: str,
    card_index: int,
    question: str,
    answer: str,
    full_answer: str,
    frame_type: str,
    source: str,
    needs_review: bool = False,
    review_reason: str = "",
) -> dict:
    record = {
        "frame_id": f"{slugify(verb)}_frame_{card_index:02d}",
        "verb": verb,
        "type": "frame",
        "tense": "present",
        "question": question,
        "answer": answer,
        "full_answer": full_answer,
        "frame_type": frame_type,
        "source": source,
    }
    if needs_review:
        record["needs_review"] = True
    if review_reason:
        record["review_reason"] = review_reason
    return record


def extract_tail_kind(pattern_text: str) -> str:
    if "langue" in pattern_text:
        return "language"
    if "instrument" in pattern_text:
        return "instrument"
    if "jeu" in pattern_text or "sport" in pattern_text:
        return "game"
    if "qqn" in pattern_text:
        return "person"
    if "lieu" in pattern_text or "paris" in pattern_text:
        return "place"
    return "thing"


def pick_from(items: list[str], index_hint: int) -> str:
    return items[index_hint % len(items)]


def normalize_example_sentence(text: str) -> str:
    sentence = str(text or "").strip()
    sentence = sentence.replace("\u2019", "'").replace("\u2018", "'").replace("\u02bc", "'")
    sentence = re.sub(r"\s+", " ", sentence)
    sentence = re.sub(r"\s+([,;:!?])", r"\1", sentence)
    sentence = re.sub(r"[.?!]+$", "", sentence)
    return sentence.strip()


def find_phrase_span(text: str, phrase: str) -> re.Match[str] | None:
    if not text or not phrase:
        return None
    pattern = re.compile(rf"(?<!\w){re.escape(phrase)}(?!\w)", re.IGNORECASE)
    return pattern.search(text)


def build_present_answer_candidates(verb: str, present_tenses: dict[str, dict[str, str]]) -> list[tuple[str, str]]:
    candidates: list[tuple[str, str]] = []
    seen: set[tuple[str, str]] = set()
    lemmas = [verb]
    alias = LEMMA_ALIAS.get(verb)
    if alias and alias not in lemmas:
        lemmas.append(alias)

    for lemma in lemmas:
        forms = present_tenses.get(lemma) or {}
        for subject_key in SUBJECT_KEYS:
            full_form = extract_form_for_subject(forms, subject_key)
            if not full_form:
                continue
            subject, answer = split_subject_and_answer(full_form)
            key = (subject.lower(), answer.lower())
            if key in seen:
                continue
            seen.add(key)
            candidates.append((subject, answer))

    candidates.sort(key=lambda item: (-len(item[1]), -len(item[0]), item[1]))
    return candidates


def match_usage_surface(verb: str, example_fr: str, present_tenses: dict[str, dict[str, str]]) -> UsageSurfaceMatch | None:
    sentence = normalize_example_sentence(example_fr)
    if not sentence:
        return None

    candidates = build_present_answer_candidates(verb, present_tenses)
    for subject, answer in candidates:
        full_form = join_subject_and_answer(subject, answer)
        full_match = find_phrase_span(sentence, full_form)
        if full_match:
            answer_start = full_match.start() + len(subject)
            if not subject.endswith("'"):
                answer_start += 1
            return UsageSurfaceMatch(
                prefix=sentence[:answer_start].rstrip(),
                answer_base=sentence[answer_start:full_match.end()].strip(),
                suffix=sentence[full_match.end():].strip(),
                matched_full_form=True,
                subject_hint=subject,
                answer_present=answer,
            )

    for subject, answer in candidates:
        answer_match = find_phrase_span(sentence, answer)
        if answer_match:
            return UsageSurfaceMatch(
                prefix=sentence[:answer_match.start()].rstrip(),
                answer_base=sentence[answer_match.start():answer_match.end()].strip(),
                suffix=sentence[answer_match.end():].strip(),
                matched_full_form=False,
                subject_hint=subject,
                answer_present=answer,
            )

    return None


def consume_leading_fragment(text: str, fragments: list[str]) -> tuple[str, str]:
    suffix = text.lstrip()
    lowered = suffix.lower()
    for fragment in sorted(fragments, key=len, reverse=True):
        if lowered.startswith(fragment):
            consumed = suffix[:len(fragment)].strip()
            rest = suffix[len(fragment):].strip()
            return consumed, rest
    return "", text.strip()


def extend_usage_answer(frame_type: str, answer_base: str, suffix: str) -> tuple[str, str]:
    suffix = suffix.strip()
    answer = answer_base.strip()
    if not suffix:
        return answer, ""

    a_fragments = ["à l'", "aux", "au", "à"]
    de_fragments = ["de l'", "de la", "des", "du", "d'", "de"]
    article_fragments = ["de l'", "de la", "des", "du", "un", "une", "le", "la", "les", "l'"]

    fragments: list[str] = []
    if frame_type in {"a_infinitive", "a_object", "locative_a"}:
        fragments = a_fragments
    elif frame_type in {"de_infinitive", "de_object"}:
        fragments = de_fragments
    elif frame_type == "avec_object":
        fragments = ["avec"]
    elif frame_type == "chez_person":
        fragments = ["chez"]
    elif frame_type == "que_clause":
        fragments = ["qu'", "que"]
    elif frame_type == "si_clause":
        fragments = ["si"]
    elif frame_type == "il_y_a":
        fragments = article_fragments

    if not fragments:
        return answer, suffix

    connector, tail = consume_leading_fragment(suffix, fragments)
    if not connector:
        return answer, suffix
    return f"{answer} {connector}".strip(), tail


def build_usage_question(prefix: str, answer: str, suffix: str) -> str:
    gap_tokens = " ".join(["____"] * len(answer.split()))
    prefix = prefix.rstrip()
    suffix = suffix.lstrip()

    parts: list[str] = []
    if prefix:
        if prefix.endswith("'"):
            parts.append(f"{prefix}{gap_tokens}")
        else:
            parts.append(f"{prefix} {gap_tokens}")
    else:
        parts.append(gap_tokens)
    if suffix:
        parts.append(suffix)
    return normalize_sentence(" ".join(parts).strip())


def render_usage_card(verb: str, usage_entry: dict, present_tenses: dict[str, dict[str, str]], card_index: int) -> dict | None:
    pattern_text = normalize_pattern_text(usage_entry.get("pattern", ""))
    if not pattern_text or should_skip_pattern(verb, pattern_text) or not is_canonical_pattern_shape(verb, pattern_text):
        return None

    frame_type = map_pattern_type("", pattern_text)
    surface = match_usage_surface(verb, str(usage_entry.get("example_fr", "")), present_tenses)
    if not surface:
        return None

    prefix = surface.prefix
    answer_base = surface.answer_present.strip() or surface.answer_base.strip()
    if not surface.matched_full_form and not prefix:
        prefix = surface.subject_hint

    answer, tail = extend_usage_answer(frame_type, answer_base, surface.suffix)
    if not answer or not tail and frame_type not in {"predicate", "intransitive", "reflexive"}:
        return None

    question = build_usage_question(prefix, answer, tail)
    full_answer = normalize_sentence(f"{prefix} {answer} {tail}".strip())
    needs_review = verb in {"enculer", "autopsier", "coter", "carter", "crémer", "douer"}
    review_reason = "Generated from a lower-trust or edge-case pattern; quick human review recommended." if needs_review else ""

    return card_record(
        verb=verb,
        card_index=card_index,
        question=question,
        answer=answer,
        full_answer=full_answer,
        frame_type=frame_type,
        source=f"usage:{usage_entry.get('sense_id') or frame_type}",
        needs_review=needs_review,
        review_reason=review_reason,
    )


def choose_tail(frame_type: str, pattern_text: str, verb: str, index_hint: int) -> str:
    tail_kind = extract_tail_kind(pattern_text)
    if frame_type == "direct_object":
        if verb == "jouer":
            return "un rôle"
        if verb == "devoir":
            return "cinquante euros"
        if verb == "parler":
            return pick_from(LANGUAGE_FILLERS, index_hint)
        if verb == "continuer":
            return "le travail"
        if tail_kind == "person":
            return pick_from(PERSON_FILLERS, index_hint)
        if tail_kind == "language":
            return pick_from(LANGUAGE_FILLERS, index_hint)
        abstract_verbs = {"contrôler", "exprimer", "lier", "prouver", "rejeter", "reprendre", "subir", "transformer", "établir", "éloigner"}
        return pick_from(OBJECT_FILLERS if verb not in abstract_verbs else ABSTRACT_FILLERS, index_hint)
    if frame_type in {"a_object", "de_object", "avec_object"}:
        if tail_kind == "game":
            return pick_from(GAME_FILLERS, index_hint)
        if tail_kind == "instrument":
            return pick_from(INSTRUMENT_FILLERS, index_hint)
        if tail_kind == "language":
            return pick_from(LANGUAGE_FILLERS, index_hint)
        if tail_kind == "place":
            return pick_from(PLACE_FILLERS, index_hint)
        if tail_kind == "person":
            return pick_from(PERSON_FILLERS, index_hint)
        return pick_from(ABSTRACT_FILLERS, index_hint)
    if frame_type == "combo_a":
        if verb == "devoir":
            return f"un service à {pick_from(PERSON_FILLERS, index_hint + 1)}"
        return f"{pick_from(OBJECT_FILLERS, index_hint)} à {pick_from(PERSON_FILLERS, index_hint + 1)}"
    if frame_type == "combo_de":
        return f"{pick_from(OBJECT_FILLERS, index_hint)} de {pick_from(PERSON_FILLERS, index_hint + 1)}"
    if frame_type == "locative_a":
        return pick_from(PLACE_FILLERS, index_hint)
    if frame_type == "chez_person":
        return pick_from(PERSON_FILLERS, index_hint)
    if frame_type in {"a_infinitive", "de_infinitive", "bare_infinitive"}:
        if verb in {"aller", "venir", "pouvoir", "vouloir"}:
            return "venir"
        if verb in {"continuer", "reprendre"}:
            return "travailler"
        if verb in {"faire"}:
            return "réparer la voiture"
        return pick_from(INFINITIVE_FILLERS, index_hint)
    if frame_type == "que_clause":
        return pick_from(CLAUSE_FILLERS, index_hint)
    if frame_type == "si_clause":
        return pick_from(SI_FILLERS, index_hint)
    if frame_type == "predicate":
        if verb == "être":
            return pick_from(ADJECTIVE_FILLERS, index_hint)
        return pick_from(NOUN_PREDICATE_FILLERS, index_hint)
    if verb in MOVEMENT_VERBS:
        return "ici"
    if verb in WORK_VERBS:
        return "ici"
    return pick_from(ADVERB_FILLERS, index_hint)


def choose_subject_key(verb: str, frame_type: str, index_hint: int) -> str:
    if frame_type == "reflexive":
        subjects = ["je", "il", "nous"]
    elif frame_type in {"combo_a", "combo_de"}:
        subjects = ["je", "elle", "nous"]
    elif frame_type in {"que_clause", "si_clause", "a_infinitive", "de_infinitive", "bare_infinitive"}:
        subjects = ["je", "il", "nous"]
    elif frame_type == "intransitive" and verb in MOVEMENT_VERBS:
        subjects = ["je", "nous", "il"]
    else:
        subjects = ["je", "il", "nous"]

    mapped = []
    for subject in subjects:
        mapped.append("il" if subject == "elle" else subject)
    return mapped[index_hint % len(mapped)]


def render_candidate_card(verb: str, forms: dict[str, str], candidate: PatternCandidate, card_index: int) -> dict | None:
    frame_type = candidate.frame_type
    if frame_type in {"combo_a", "combo_de"}:
        return None
    subject_key = choose_subject_key(verb, frame_type, card_index - 1)
    full_form = extract_form_for_subject(forms, subject_key)
    if not full_form:
        return None

    subject, answer_base = split_subject_and_answer(full_form)

    if frame_type == "il_y_a":
        subject = "il"
        answer = "y a"
        tail = "du pain sur la table"
    elif frame_type == "direct_object":
        answer = answer_base
        tail = choose_tail(frame_type, candidate.pattern_text, verb, card_index - 1)
    elif frame_type == "a_object":
        answer = f"{answer_base} à"
        tail = choose_tail(frame_type, candidate.pattern_text, verb, card_index - 1)
    elif frame_type == "de_object":
        answer = f"{answer_base} de"
        tail = choose_tail(frame_type, candidate.pattern_text, verb, card_index - 1)
    elif frame_type == "avec_object":
        answer = f"{answer_base} avec"
        tail = choose_tail(frame_type, candidate.pattern_text, verb, card_index - 1)
    elif frame_type == "combo_a":
        answer = answer_base
        tail = choose_tail(frame_type, candidate.pattern_text, verb, card_index - 1)
    elif frame_type == "combo_de":
        answer = answer_base
        tail = choose_tail(frame_type, candidate.pattern_text, verb, card_index - 1)
    elif frame_type == "locative_a":
        answer = f"{answer_base} à"
        tail = choose_tail(frame_type, candidate.pattern_text, verb, card_index - 1)
    elif frame_type == "chez_person":
        answer = f"{answer_base} chez"
        tail = choose_tail(frame_type, candidate.pattern_text, verb, card_index - 1)
    elif frame_type == "a_infinitive":
        answer = f"{answer_base} à"
        tail = choose_tail(frame_type, candidate.pattern_text, verb, card_index - 1)
    elif frame_type == "de_infinitive":
        answer = f"{answer_base} de"
        tail = choose_tail(frame_type, candidate.pattern_text, verb, card_index - 1)
    elif frame_type == "bare_infinitive":
        answer = answer_base
        tail = choose_tail(frame_type, candidate.pattern_text, verb, card_index - 1)
    elif frame_type == "que_clause":
        answer = f"{answer_base} que"
        tail = choose_tail(frame_type, candidate.pattern_text, verb, card_index - 1)
    elif frame_type == "si_clause":
        answer = f"{answer_base} si"
        tail = choose_tail(frame_type, candidate.pattern_text, verb, card_index - 1)
    elif frame_type == "predicate":
        answer = answer_base
        tail = choose_tail(frame_type, candidate.pattern_text, verb, card_index - 1)
    elif frame_type in {"reflexive", "intransitive"}:
        answer = answer_base
        tail = choose_tail(frame_type, candidate.pattern_text, verb, card_index - 1)
    else:
        return None

    question = question_with_gaps(subject, answer, tail)
    full_answer = f"{join_subject_and_answer(subject, answer)} {tail}".strip()
    needs_review = candidate.source.startswith("usage:") and frame_type in {"combo_de", "combo_a"}

    if verb in {"enculer", "autopsier", "coter", "carter", "crémer", "douer"}:
        needs_review = True
    review_reason = ""
    if needs_review:
        review_reason = "Generated from a lower-trust or edge-case pattern; quick human review recommended."

    return card_record(
        verb=verb,
        card_index=card_index,
        question=question,
        answer=answer,
        full_answer=full_answer,
        frame_type=frame_type,
        source=candidate.source,
        needs_review=needs_review,
        review_reason=review_reason,
    )


def build_fallback_card(verb_entry: dict, forms: dict[str, str], card_index: int) -> dict | None:
    verb = verb_entry["infinitive"]
    hint_text = " ".join(filter(None, [verb_entry.get("translation", ""), verb_entry.get("hint", "")])).lower()

    if verb in MANUAL_CARDS:
        return None

    if verb_entry.get("reflexive") or verb.startswith("se ") or verb.startswith("s'"):
        subject_key = "je" if verb not in {"s'aimer", "se connaître"} else "ils"
        full_form = extract_form_for_subject(forms, subject_key)
        if not full_form:
            return None
        subject, answer = split_subject_and_answer(full_form)
        tail = "encore" if verb in {"s'aimer", "se connaître"} else "tôt"
        return card_record(
            verb=verb,
            card_index=card_index,
            question=question_with_gaps(subject, answer, tail),
            answer=answer,
            full_answer=f"{join_subject_and_answer(subject, answer)} {tail}".strip(),
            frame_type="reflexive",
            source="fallback:reflexive",
        )

    if verb in {"pouvoir", "devoir", "vouloir"}:
        subject_key = "je"
        full_form = extract_form_for_subject(forms, subject_key)
        if not full_form:
            return None
        subject, answer = split_subject_and_answer(full_form)
        tail = "venir" if verb != "devoir" else "partir"
        return card_record(
            verb=verb,
            card_index=card_index,
            question=question_with_gaps(subject, answer, tail),
            answer=answer,
            full_answer=f"{join_subject_and_answer(subject, answer)} {tail}".strip(),
            frame_type="bare_infinitive",
            source="fallback:modal_infinitive",
        )

    if verb in DE_OBJECT_FALLBACK_VERBS or "depend" in hint_text:
        subject_key = "je" if verb != "témoigner" else "il"
        full_form = extract_form_for_subject(forms, subject_key)
        if not full_form:
            return None
        subject, answer = split_subject_and_answer(full_form)
        tail = "Paul" if verb == "souvenir" else "la situation"
        return card_record(
            verb=verb,
            card_index=card_index,
            question=question_with_gaps(subject, f"{answer} de", tail),
            answer=f"{answer} de",
            full_answer=f"{join_subject_and_answer(subject, answer)} de {tail}".strip(),
            frame_type="de_object",
            source="fallback:de_object",
            needs_review=verb == "souvenir",
            review_reason="Fallback uses the defective non-reflexive lemma from source data." if verb == "souvenir" else "",
        )

    if verb in A_OBJECT_FALLBACK_VERBS:
        full_form = extract_form_for_subject(forms, "il")
        if not full_form:
            return None
        subject, answer = split_subject_and_answer(full_form)
        tail = "Paul"
        return card_record(
            verb=verb,
            card_index=card_index,
            question=question_with_gaps(subject, f"{answer} à", tail),
            answer=f"{answer} à",
            full_answer=f"{join_subject_and_answer(subject, answer)} à {tail}".strip(),
            frame_type="a_object",
            source="fallback:a_object",
        )

    if verb in INTRANSITIVE_FALLBACK_VERBS or "to work" in hint_text or "to walk" in hint_text or "travel" in hint_text:
        subject_key = "nous" if verb in {"déjeuner", "dîner", "voyager"} else "je"
        full_form = extract_form_for_subject(forms, subject_key)
        if not full_form:
            return None
        subject, answer = split_subject_and_answer(full_form)
        tail = "ici" if verb in MOVEMENT_VERBS | WORK_VERBS | {"marcher", "rouler", "voyager"} else "encore"
        if verb == "naître":
            subject, answer, tail = "il", "naît", "en mai"
        return card_record(
            verb=verb,
            card_index=card_index,
            question=question_with_gaps(subject, answer, tail),
            answer=answer,
            full_answer=f"{join_subject_and_answer(subject, answer)} {tail}".strip(),
            frame_type="intransitive",
            source="fallback:intransitive",
        )

    if verb in DIRECT_OBJECT_FALLBACK_VERBS or "listen to" in hint_text or "interest" in hint_text:
        full_form = extract_form_for_subject(forms, "je")
        if not full_form:
            return None
        subject, answer = split_subject_and_answer(full_form)
        tail = "Paul" if verb in {"interroger", "intéresser", "capturer", "écouter", "reconnaître"} else "le projet"
        return card_record(
            verb=verb,
            card_index=card_index,
            question=question_with_gaps(subject, answer, tail),
            answer=answer,
            full_answer=f"{join_subject_and_answer(subject, answer)} {tail}".strip(),
            frame_type="direct_object",
            source="fallback:direct_object",
            needs_review=verb in {"carter", "crémer", "coter", "douer", "enculer"},
            review_reason="Fallback direct-object frame is low-confidence for this lemma." if verb in {"carter", "crémer", "coter", "douer", "enculer"} else "",
        )

    full_form = extract_form_for_subject(forms, "je")
    if not full_form:
        return None
    subject, answer = split_subject_and_answer(full_form)
    return card_record(
        verb=verb,
        card_index=card_index,
        question=question_with_gaps(subject, answer, "le projet"),
        answer=answer,
        full_answer=f"{join_subject_and_answer(subject, answer)} le projet",
        frame_type="fallback",
        source="fallback:generic_direct_object",
        needs_review=verb in {"carter", "douer", "enculer"},
        review_reason="Generic fallback used because this lemma lacks trustworthy source-side pattern evidence." if verb in {"carter", "douer", "enculer"} else "",
    )


def dedupe_cards(cards: list[dict]) -> list[dict]:
    deduped: list[dict] = []
    seen_questions: set[tuple[str, str]] = set()
    seen_types: set[str] = set()

    for card in cards:
        key = (card["question"], card["answer"])
        if key in seen_questions:
            continue
        frame_type = card.get("frame_type", "")
        if frame_type in seen_types and len(deduped) >= 1:
            continue
        seen_questions.add(key)
        seen_types.add(frame_type)
        deduped.append(card)
        if len(deduped) == 3:
            break
    return deduped


def build_cards_for_verb(verb_entry: dict, present_tenses: dict[str, dict[str, str]], core_index: dict[str, list[dict]], usage_index: dict[str, list[dict]]) -> list[dict]:
    verb = verb_entry["infinitive"]
    forms = present_tenses.get(verb)
    if not forms:
        return []

    if verb in MANUAL_CARDS:
        cards = []
        for index, item in enumerate(MANUAL_CARDS[verb], start=1):
            cards.append(
                card_record(
                    verb=verb,
                    card_index=index,
                    question=item["question"],
                    answer=item["answer"],
                    full_answer=item["full_answer"],
                    frame_type=item["frame_type"],
                    source=item["source"],
                    needs_review=bool(item.get("needs_review")),
                    review_reason=item.get("review_reason", ""),
                )
            )
        return reindex_cards(verb, dedupe_cards(cards))

    usage_cards: list[dict] = []
    for usage_entry in usage_index.get(verb, []):
        card = render_usage_card(verb, usage_entry, present_tenses, len(usage_cards) + 1)
        if card:
            usage_cards.append(card)
        if len(usage_cards) >= 5:
            break

    usage_cards = dedupe_cards(usage_cards)
    if usage_cards:
        return reindex_cards(verb, usage_cards)

    return []


def fill_question(question: str, answer: str) -> str:
    answer_tokens = iter(answer.split())

    def replace(_: re.Match) -> str:
        try:
            return next(answer_tokens)
        except StopIteration as exc:  # pragma: no cover - validation guard
            raise ValueError("Question has more blanks than answer tokens") from exc

    filled = re.sub(r"____", replace, question)
    try:
        next(answer_tokens)
        raise ValueError("Answer has more tokens than blanks")
    except StopIteration:
        return filled


def normalize_sentence(text: str) -> str:
    normalized = re.sub(r"\s+", " ", text.strip())
    normalized = normalized.replace(" ’", "’").replace(" '", "'")
    normalized = re.sub(r"([A-Za-zÀ-ÖØ-öø-ÿ]')\s+([A-Za-zÀ-ÖØ-öø-ÿ])", r"\1\2", normalized)
    normalized = normalized.replace(" ,", ",").replace(" .", ".").replace(" ?", "?")
    return normalized.strip()


def forms_for_validation(verb: str, present_tenses: dict[str, dict[str, str]]) -> set[str]:
    lemma = LEMMA_ALIAS.get(verb, verb)
    forms = set((present_tenses.get(verb) or {}).values())
    if lemma != verb:
        alias_forms = present_tenses.get(lemma) or {}
        forms.update(alias_forms.values())
    return {form for form in forms if form}


def validate_cards(cards: list[dict], rollout_verbs: list[dict], present_tenses: dict[str, dict[str, str]]) -> list[str]:
    issues: list[str] = []
    cards_by_verb: dict[str, list[dict]] = defaultdict(list)

    for card in cards:
        cards_by_verb[card["verb"]].append(card)
        for field in ("verb", "question", "answer", "full_answer"):
            if not card.get(field):
                issues.append(f"MISSING-FIELD  {card.get('frame_id', card.get('verb', '?'))}: {field}")

        blanks = card["question"].count("____")
        answer_tokens = len(card["answer"].split())
        if blanks != answer_tokens:
            issues.append(f"GAP-MISMATCH  {card['frame_id']}: {blanks} blanks vs {answer_tokens} answer tokens")

        try:
            rebuilt = normalize_sentence(fill_question(card["question"], card["answer"]))
        except ValueError as exc:
            issues.append(f"FILL-ERROR  {card['frame_id']}: {exc}")
            rebuilt = ""

        if rebuilt and rebuilt != normalize_sentence(card["full_answer"]):
            issues.append(f"FULL-ANSWER-MISMATCH  {card['frame_id']}: {rebuilt} != {card['full_answer']}")

        valid_forms = forms_for_validation(card["verb"], present_tenses)
        answer_stems = {split_subject_and_answer(form)[1] for form in valid_forms if form}
        full_answer = normalize_sentence(card["full_answer"])
        if (
            not card["source"].startswith("manual:")
            and valid_forms
            and not any(full_answer.startswith(form) for form in valid_forms)
            and not any(stem and re.search(rf"\b{re.escape(stem)}\b", full_answer) for stem in answer_stems)
        ):
            issues.append(f"LEMMA-MISMATCH  {card['frame_id']}: {card['full_answer']}")

        if len(card["full_answer"].split()) > 12:
            issues.append(f"LONG-CONTEXT  {card['frame_id']}: {card['full_answer']}")

        if len(card["answer"].strip()) < 2:
            issues.append(f"SHORT-ANSWER  {card['frame_id']}: {card['answer']}")

    for verb, verb_cards in cards_by_verb.items():
        seen = set()
        for card in verb_cards:
            key = (card["question"], card["answer"])
            if key in seen:
                issues.append(f"DUP-CARD  {card['frame_id']}: {verb}")
            seen.add(key)

    return issues


def render_review(cards: list[dict], issues: list[str], rollout_verbs: list[dict]) -> str:
    cards_by_verb: dict[str, list[dict]] = defaultdict(list)
    for card in cards:
        cards_by_verb[card["verb"]].append(card)

    source_counts = Counter(card["source"].split(":", 1)[0] for card in cards)
    frame_counts = Counter(card["frame_type"] for card in cards)
    review_cards = [card for card in cards if card.get("needs_review")]
    missing_verbs = [verb["infinitive"] for verb in rollout_verbs if verb["infinitive"] not in cards_by_verb]

    lines = [
        "# French Frame Cards Review",
        "",
        f"- Verbs covered: `{len(cards_by_verb)}` / `{len(rollout_verbs)}`",
        f"- Total frame cards: `{len(cards)}`",
        f"- Needs-review cards: `{len(review_cards)}`",
        f"- Validation issues: `{len(issues)}`",
        "",
        "## Source mix",
        "",
    ]

    for source, total in sorted(source_counts.items()):
        lines.append(f"- `{source}`: `{total}`")

    lines.extend(["", "## Frame types", ""])
    for frame_type, total in sorted(frame_counts.items()):
        lines.append(f"- `{frame_type}`: `{total}`")

    lines.extend(["", "## Needs Review", ""])
    if not review_cards:
        lines.append("- None")
    else:
        for card in review_cards[:80]:
            reason = card.get("review_reason", "Manual review requested.")
            lines.append(f"- `{card['frame_id']}` `{card['verb']}`: {reason}")

    lines.extend(["", "## Validation Issues", ""])
    if not issues:
        lines.append("- None")
    else:
        for issue in issues[:200]:
            lines.append(f"- {issue}")

    lines.extend(["", "## Missing Verbs", ""])
    if not missing_verbs:
        lines.append("- None")
    else:
        for verb in missing_verbs:
            lines.append(f"- `{verb}`")

    lines.extend(["", "## Sample Cards", ""])
    for verb in [item["infinitive"] for item in rollout_verbs[:20]]:
        if verb not in cards_by_verb:
            continue
        lines.append(f"### {verb}")
        for card in cards_by_verb[verb]:
            lines.append(f"- `{card['question']}` -> `{card['answer']}` -> `{card['full_answer']}`")
        lines.append("")

    return "\n".join(lines).rstrip() + "\n"


def write_json(path: Path, data) -> None:
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def write_js(path: Path, data) -> None:
    payload = "window.verbFrames = " + json.dumps(data, ensure_ascii=False, indent=2) + ";\n"
    path.write_text(payload, encoding="utf-8")
