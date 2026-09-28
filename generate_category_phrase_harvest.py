#!/usr/bin/env python3
"""
Generate a large category-grounded French phrase harvest with simple coverage scoring.

This script is intentionally phrase-first:
- it uses the built-in category verb lists from js/script.js
- it optionally feeds DICOVALENCE family hints into the generator
- it asks OpenAI for many natural phrases in category context
- it scores coverage with streak penalties
- it runs a second-pass judge to flag likely non-location a/de complements
"""

from __future__ import annotations

import argparse
import csv
import json
import os
import re
import sys
import time
from collections import Counter, defaultdict
from pathlib import Path
from typing import Literal

from pydantic import BaseModel, Field

try:
    from openai import OpenAI
except ImportError:
    OpenAI = None

try:
    import stanza
    from stanza.pipeline.core import DownloadMethod
except ImportError:
    stanza = None
    DownloadMethod = None

from openai_env import load_openai_api_key


ROOT = Path(__file__).parent
SCRIPT_JS = ROOT / "js" / "script.js"
DICOVALENCE_MATRIX_JSON = ROOT / "category_dicovalence_family_matrix.json"

DEFAULT_CATEGORY_ID = "builtin-bureaucracy-delivery"
DEFAULT_MODEL = "gpt-5.4"
DEFAULT_JUDGE_MODEL = "gpt-5.4-mini"
DEFAULT_COUNT = 300
DEFAULT_BATCH_SIZE = 50

A_SURFACES = ("à", "au", "aux", "à la", "à l'")
DE_SURFACES = ("de", "du", "des", "de la", "de l'", "d'")
PREP_LEMMAS = {"à", "de"}
MOTION_LIKE_VERBS = {
    "aller", "venir", "arriver", "partir", "rentrer", "sortir", "retourner",
    "passer", "monter", "descendre", "entrer", "revenir", "ramener", "emmener",
    "déposer", "livrer", "porter", "laisser", "récupérer", "amener", "apporter",
}
SOURCE_LIKE_VERBS = {
    "partir", "sortir", "venir", "rentrer", "retourner", "revenir", "ramener",
    "recevoir", "tirer", "extraire", "provenir",
}
PLACE_LIKE_NOUNS = {
    "accueil", "appartement", "bar", "boutique", "bureau", "café", "campagne",
    "centre", "centre-ville", "chambre", "chez", "cinéma", "classe", "clinique",
    "conciergerie", "cuisine", "domicile", "école", "entrée", "fac", "gare",
    "guichet", "hôpital", "immeuble", "loge", "mairie", "maison", "marché",
    "magasin", "parc", "pharmacie", "plateau", "point", "point-relais",
    "point relais", "porte", "quartier", "réception", "rue", "salle", "salon",
    "sortie", "stade", "station", "supermarché", "table", "terrasse",
    "théâtre", "travail", "ville", "village",
}
STANZA_CACHE_CANDIDATES = (
    ROOT / ".stanza_cache" / "1.11.0" / "resources",
    Path.home() / "Library" / "Caches" / "stanza" / "1.11.0" / "resources",
    Path.home() / "stanza_resources",
)
STANZA_PIPELINE = None
STANZA_UNAVAILABLE = False


class PhraseRow(BaseModel):
    verb: str
    sentence_fr: str
    translation_en: str
    tense: str = ""
    subject: str = ""
    note: str = ""


class PhraseBatchResponse(BaseModel):
    rows: list[PhraseRow] = Field(default_factory=list)


class BonusJudgmentRow(BaseModel):
    index: int
    label: Literal[
        "a_selected",
        "de_selected",
        "a_movement_or_location",
        "de_source_or_location",
        "none",
        "uncertain",
    ]
    reason: str = ""


class BonusBatchResponse(BaseModel):
    rows: list[BonusJudgmentRow] = Field(default_factory=list)


def ensure_openai() -> None:
    load_openai_api_key()
    if OpenAI is None:
        sys.exit("openai package is not installed.")
    if not os.environ.get("OPENAI_API_KEY"):
        sys.exit("OPENAI_API_KEY is not set.")


def normalize_text(value: str) -> str:
    text = str(value or "").strip()
    text = text.replace("\u2019", "'").replace("\u2018", "'").replace("\u02bc", "'")
    text = re.sub(r"\s+", " ", text)
    text = re.sub(r"\s+([,;:!?])", r"\1", text)
    return text.strip()


def normalize_sentence(value: str) -> str:
    text = normalize_text(value)
    text = re.sub(r"\s+([.?!])", r"\1", text)
    return text


def load_category_spec(category_id: str) -> dict:
    text = SCRIPT_JS.read_text(encoding="utf-8")
    anchor = f"id: '{category_id}'"
    start = text.find(anchor)
    if start < 0:
        raise ValueError(f"Could not find category {category_id}")
    block = text[start:start + 3500]
    name_match = re.search(r"name:\s*'([^']+)'", block)
    scope_match = re.search(r"scope:\s*'([^']+)'", block)
    verbs_match = re.search(r"verbs:\s*\[(.*?)\]", block, re.S)
    if not (name_match and scope_match and verbs_match):
        raise ValueError(f"Could not parse category block for {category_id}")
    verbs = [part.strip().strip("'") for part in verbs_match.group(1).split(",") if part.strip()]
    return {
        "id": category_id,
        "name": name_match.group(1),
        "scope": scope_match.group(1),
        "verbs": verbs,
    }


def load_dicovalence_hints(category_id: str) -> dict[str, dict[str, str]]:
    if not DICOVALENCE_MATRIX_JSON.exists():
        return {}
    rows = json.loads(DICOVALENCE_MATRIX_JSON.read_text(encoding="utf-8"))
    hints: dict[str, dict[str, str]] = {}
    for row in rows:
        if row.get("category_id") != category_id:
            continue
        hints[row["verb"]] = {
            "direct_ok": row.get("direct_ok", "no"),
            "a_ok": row.get("a_ok", "no"),
            "de_ok": row.get("de_ok", "no"),
            "direct_a_ok": row.get("direct_a_ok", "no"),
        }
    return hints


def get_stanza_resources_dir() -> Path | None:
    for candidate in STANZA_CACHE_CANDIDATES:
        if (candidate / "resources.json").exists():
            return candidate
    return None


def get_stanza_pipeline():
    global STANZA_PIPELINE, STANZA_UNAVAILABLE
    if STANZA_PIPELINE is not None:
        return STANZA_PIPELINE
    if STANZA_UNAVAILABLE or stanza is None or DownloadMethod is None:
        return None

    resources_dir = get_stanza_resources_dir()
    if resources_dir is None:
        STANZA_UNAVAILABLE = True
        return None

    try:
        STANZA_PIPELINE = stanza.Pipeline(
            "fr",
            processors="tokenize,mwt,pos,lemma,depparse",
            tokenize_no_ssplit=True,
            verbose=False,
            dir=str(resources_dir),
            download_method=DownloadMethod.REUSE_RESOURCES,
        )
    except Exception as error:
        print(f"[phrase-harvest] Stanza unavailable: {error}", file=sys.stderr)
        STANZA_UNAVAILABLE = True
        return None
    return STANZA_PIPELINE


def choose_target_verb(words, verb_lemma: str):
    matches = [word for word in words if str(word.lemma or "").lower() == verb_lemma and word.upos in {"VERB", "AUX"}]
    if not matches:
        return None

    def score(word):
        score_value = 0
        if word.upos == "VERB":
            score_value += 3
        if str(word.deprel or "") == "root":
            score_value += 3
        if str(word.deprel or "").startswith("xcomp"):
            score_value += 2
        if "VerbForm=Fin" in str(word.feats or ""):
            score_value += 1
        return score_value

    return max(matches, key=score)


def summarize_parser_candidates(candidates: list[dict]) -> str:
    if not candidates:
        return "no_a_de_candidate"
    parts = []
    for candidate in candidates[:4]:
        parts.append(
            f"{candidate['surface']}->{candidate['attached_to']}:{candidate['relation']}:{candidate['kind']}"
        )
    return "; ".join(parts)


def is_place_like_nominal(nominal) -> bool:
    lemma = str(nominal.lemma or "").lower().strip()
    text = str(nominal.text or "").lower().strip()
    return lemma in PLACE_LIKE_NOUNS or text in PLACE_LIKE_NOUNS


def mechanical_judgment_for_row(row: dict, hints: dict[str, dict[str, str]] | None = None) -> dict:
    sentence = normalize_sentence(row.get("sentence_fr", ""))
    verb_lemma = normalize_text(row.get("verb", "")).lower()
    verb_hints = (hints or {}).get(verb_lemma, {})
    a_allowed = verb_hints.get("a_ok") == "yes" or verb_hints.get("direct_a_ok") == "yes"
    de_allowed = verb_hints.get("de_ok") == "yes"
    if not sentence or not verb_lemma:
        return {"label": "uncertain", "reason": "missing_sentence_or_verb", "source": "mechanical"}

    if not re.search(r"\b(?:à|au|aux|de|du|des|d')\b", sentence.lower()):
        return {"label": "none", "reason": "no_a_de_surface", "source": "mechanical"}

    nlp = get_stanza_pipeline()
    if nlp is None:
        return {"label": None, "reason": "stanza_unavailable", "source": "mechanical"}

    try:
        doc = nlp(sentence)
    except Exception as error:
        return {"label": None, "reason": f"stanza_parse_failed:{type(error).__name__}", "source": "mechanical"}

    if not doc.sentences:
        return {"label": "uncertain", "reason": "stanza_empty_parse", "source": "mechanical"}

    words = list(doc.sentences[0].words)
    target = choose_target_verb(words, verb_lemma)
    if target is None:
        return {"label": None, "reason": "no_target_verb_match", "source": "mechanical"}

    by_id = {word.id: word for word in words}
    children: dict[int, list] = defaultdict(list)
    for word in words:
        children[int(word.head or 0)].append(word)

    candidates: list[dict] = []

    for word in words:
        lemma = str(word.lemma or "").lower()
        if lemma not in PREP_LEMMAS:
            continue

        head = by_id.get(int(word.head or 0))
        if head is None:
            continue

        if word.deprel == "mark" and head.upos in {"VERB", "AUX"}:
            if head.id == target.id:
                candidates.append(
                    {
                        "surface": word.text,
                        "kind": "intro_mark",
                        "attached_to": "target_verb",
                        "relation": str(head.deprel or ""),
                    }
                )
                continue
            if int(head.head or 0) == target.id and str(head.deprel or "") in {"xcomp", "ccomp", "advcl"}:
                if lemma == "à" and not a_allowed:
                    candidates.append(
                        {
                            "surface": word.text,
                            "kind": "uncertain",
                            "attached_to": "verb_child",
                            "relation": str(head.deprel or ""),
                        }
                    )
                    continue
                candidates.append(
                    {
                        "surface": word.text,
                        "kind": f"{lemma}_selected",
                        "attached_to": "verb_child",
                        "relation": str(head.deprel or ""),
                    }
                )
                continue
            candidates.append(
                {
                    "surface": word.text,
                    "kind": "mark_other",
                    "attached_to": "non_target_verb",
                    "relation": str(head.deprel or ""),
                }
            )
            continue

        if word.deprel == "case":
            nominal = head
            parent = by_id.get(int(nominal.head or 0))
            if int(nominal.head or 0) == target.id:
                dep = str(nominal.deprel or "")
                place_like = is_place_like_nominal(nominal)
                if lemma == "à" and verb_lemma in MOTION_LIKE_VERBS and dep.startswith("obl"):
                    label = "a_movement_or_location"
                elif lemma == "de" and verb_lemma in SOURCE_LIKE_VERBS and dep.startswith("obl"):
                    label = "de_source_or_location"
                elif lemma == "à" and place_like and dep.startswith("obl"):
                    label = "a_movement_or_location" if verb_lemma in MOTION_LIKE_VERBS else "none"
                elif lemma == "de" and place_like and dep.startswith("obl"):
                    label = "de_source_or_location" if verb_lemma in SOURCE_LIKE_VERBS else "none"
                elif lemma == "à" and dep == "iobj":
                    label = "a_selected"
                elif lemma == "à" and dep == "obl:arg" and a_allowed:
                    label = "a_selected"
                elif lemma == "de" and dep == "obl:arg" and de_allowed:
                    label = "de_selected"
                elif lemma == "de" and dep == "iobj" and de_allowed:
                    label = "de_selected"
                elif dep.startswith("obl"):
                    label = "a_movement_or_location" if lemma == "à" and verb_lemma in MOTION_LIKE_VERBS else (
                        "de_source_or_location" if lemma == "de" and verb_lemma in SOURCE_LIKE_VERBS else "none"
                    )
                else:
                    label = "uncertain"
                candidates.append(
                    {
                        "surface": word.text,
                        "kind": label,
                        "attached_to": "target_verb",
                        "relation": dep,
                    }
                )
                continue

            if nominal.id == target.id:
                candidates.append(
                    {
                        "surface": word.text,
                        "kind": "prep_on_target",
                        "attached_to": "target_verb",
                        "relation": str(word.deprel or ""),
                    }
                )
                continue

            attached_to = "noun_phrase"
            if parent is not None and int(parent.id or 0) == target.id:
                attached_to = "verb_sibling_nominal"

            candidates.append(
                {
                    "surface": word.text,
                    "kind": "noun_internal" if attached_to == "noun_phrase" else "adjunct_nominal",
                    "attached_to": attached_to,
                    "relation": str(nominal.deprel or ""),
                }
            )
            continue

        if lemma == "de" and word.deprel in {"det", "fixed"}:
            candidates.append(
                {
                    "surface": word.text,
                    "kind": "partitive_or_determiner",
                    "attached_to": "noun_phrase",
                    "relation": str(word.deprel or ""),
                }
            )

    summary = summarize_parser_candidates(candidates)
    selected = [item for item in candidates if item["kind"] in {"a_selected", "de_selected"}]
    movement = [item for item in candidates if item["kind"] == "a_movement_or_location"]
    source = [item for item in candidates if item["kind"] == "de_source_or_location"]
    noun_internal = [item for item in candidates if item["kind"] in {"noun_internal", "partitive_or_determiner", "intro_mark"}]
    uncertain = [item for item in candidates if item["kind"] == "uncertain"]

    if selected:
        labels = {item["kind"] for item in selected}
        if len(labels) == 1:
            label = next(iter(labels))
            return {"label": label, "reason": f"stanza:{summary}", "source": "mechanical", "parser_hint": summary}
        return {"label": None, "reason": f"multiple_selected:{summary}", "source": "mechanical", "parser_hint": summary}

    if movement:
        return {"label": "a_movement_or_location", "reason": f"stanza:{summary}", "source": "mechanical", "parser_hint": summary}

    if source:
        return {"label": "de_source_or_location", "reason": f"stanza:{summary}", "source": "mechanical", "parser_hint": summary}

    if uncertain:
        return {"label": None, "reason": f"uncertain_parser:{summary}", "source": "mechanical", "parser_hint": summary}

    if noun_internal or candidates:
        return {"label": "none", "reason": f"stanza:{summary}", "source": "mechanical", "parser_hint": summary}

    return {"label": None, "reason": f"no_parser_decision:{summary}", "source": "mechanical", "parser_hint": summary}


def call_parse(client: OpenAI, model: str, response_format, system_prompt: str, user_prompt: str):
    last_error = None
    for attempt in range(1, 6):
        try:
            completion = client.chat.completions.parse(
                model=model,
                response_format=response_format,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
            )
            message = completion.choices[0].message
            if not message.parsed:
                raise RuntimeError("Structured output parsing failed.")
            return message.parsed
        except Exception as error:
            last_error = error
            if attempt >= 5:
                break
            time.sleep(min(8, 1.5 * attempt))
    raise last_error


def generation_system_prompt() -> str:
    return (
        "You write natural, modern French sentences for one semantic category. "
        "Every row must use one allowed target verb as the main conjugated verb of the sentence. "
        "Keep the sentence category-faithful, plausible, learner-friendly, and concrete. "
        "Prefer normal spoken/written modern French over literary or archaic phrasing. "
        "Vary tense and subject naturally. "
        "When a verb naturally supports a learner-relevant non-location a/de complement, that is valuable, "
        "but do not force awkward frames. "
        "Avoid lists, fragments, quoted dialogue, and duplicate sentences. "
        "Return strict JSON only."
    )


def build_hint_table(category: dict, hints: dict[str, dict[str, str]]) -> str:
    lines = ["verb | direct | a | de | direct+a"]
    for verb in category["verbs"]:
        row = hints.get(verb, {})
        lines.append(
            f"{verb} | {row.get('direct_ok', 'no')} | {row.get('a_ok', 'no')} | "
            f"{row.get('de_ok', 'no')} | {row.get('direct_a_ok', 'no')}"
        )
    return "\n".join(lines)


def build_generation_prompt(
    category: dict,
    hints: dict[str, dict[str, str]],
    need_count: int,
    current_counts: Counter[str],
    recent_verbs: list[str],
) -> str:
    underused = sorted(category["verbs"], key=lambda verb: (current_counts.get(verb, 0), category["verbs"].index(verb)))
    count_lines = [f"{verb}: {current_counts.get(verb, 0)}" for verb in category["verbs"]]
    recent_display = ", ".join(recent_verbs[-6:]) if recent_verbs else "(none yet)"
    return f"""
Category: {category['name']}
Scope: {category['scope']}

Allowed target verbs:
{", ".join(category['verbs'])}

DICOVALENCE family hints (mechanical only; use as hints, not as an excuse for weird French):
{build_hint_table(category, hints)}

Current generation state:
- Need exactly {need_count} new rows.
- Recent target verbs to avoid repeating: {recent_display}
- Underused verbs to favor first: {", ".join(underused[:12])}
- Current counts by verb:
{chr(10).join(count_lines)}

Scoring objective:
- Each row earns 1 point for using one category verb in a good category sentence.
- Consecutive repeats of the same verb are penalized: second in a streak = 0.5, third = 0.25, fourth = 0.125.
- Non-location, learner-relevant a/de complements are a bonus, but only when they sound natural.

Requirements:
1. Use only allowed target verbs.
2. Put the chosen target verb in the `verb` field using its lemma exactly as listed.
3. The sentence must be French, natural, and clearly situated in the category context.
4. Keep most sentences short to medium length.
5. Avoid duplicate sentences and avoid long streaks of the same verb.
6. Avoid making every sentence a tricky a/de sentence; be natural.
7. Translation should be concise, natural English.
8. `tense` should be a simple label like `present`, `imparfait`, `passé composé`, `futur proche`, `future`.
9. `subject` should be the visible subject/pronoun or short NP, e.g. `je`, `nous`, `le livreur`.

Return exactly {need_count} rows.
""".strip()


def judge_system_prompt() -> str:
    return (
        "You classify French sentences for an A/De phrase-mining workflow. "
        "For each sentence, decide whether it contains a learner-interesting a/de complement linked directly to the target verb. "
        "Movement uses of movement verbs are allowed and should keep the movement/location label instead of being treated as mistakes. "
        "Ignore de/à that only appear inside noun phrases, fixed nominal expressions, partitives, addresses, dates, labels, or other material not governed by the target verb. "
        "A preposition inside the direct object noun phrase does NOT count. "
        "Examples: "
        "`signer le bon de réception` -> none; "
        "`recevoir un avis de passage` -> none; "
        "`joindre une copie de votre pièce d'identité` -> none; "
        "`répondre à l'interphone` -> a_selected; "
        "`envoyer le dossier au service compétent` -> a_selected; "
        "`venir au guichet` -> a_movement_or_location. "
        "Use these labels only: "
        "a_selected, de_selected, a_movement_or_location, de_source_or_location, none, uncertain. "
        "Movement or destination a-phrases should keep the movement/location label, not be upgraded to a_selected. "
        "Source/origin/location de-phrases should keep the de_source_or_location label, not be upgraded to de_selected. "
        "When parser hints say the a/de material is noun-internal, trust that strongly unless the sentence clearly contradicts it. "
        "Be conservative and attachment-aware. Return strict JSON only."
    )


def build_judge_prompt(batch: list[dict]) -> str:
    lines = []
    for row in batch:
        lines.append(f"Index: {row['index']}")
        lines.append(f"Verb: {row['verb']}")
        lines.append(f"Sentence: {row['sentence_fr']}")
        if row.get("parser_hint"):
            lines.append(f"Parser hint: {row['parser_hint']}")
        if row.get("mechanical_reason"):
            lines.append(f"Mechanical note: {row['mechanical_reason']}")
        lines.append("")
    lines.append(
        "Classify each row by whether the sentence has a learner-interesting a/de complement selected by the target verb itself, "
        "or whether the detected a/de is merely movement/location, source/origin, or noun-internal."
    )
    return "\n".join(lines).strip()


def normalize_phrase_row(row: PhraseRow, allowed_verbs: set[str]) -> PhraseRow | None:
    verb = normalize_text(row.verb).lower()
    if verb not in allowed_verbs:
        return None
    sentence = normalize_sentence(row.sentence_fr)
    translation = normalize_text(row.translation_en)
    if not sentence or not translation:
        return None
    return PhraseRow(
        verb=verb,
        sentence_fr=sentence,
        translation_en=translation,
        tense=normalize_text(row.tense),
        subject=normalize_text(row.subject),
        note=normalize_text(row.note),
    )


def score_sequence(rows: list[dict]) -> tuple[float, list[float], int]:
    previous_verb = None
    streak = 0
    total = 0.0
    base_scores: list[float] = []
    max_streak = 0
    for row in rows:
        verb = row["verb"]
        if verb == previous_verb:
            streak += 1
        else:
            streak = 1
            previous_verb = verb
        max_streak = max(max_streak, streak)
        base = 1.0 / (2 ** (streak - 1))
        base_scores.append(base)
        total += base
    return total, base_scores, max_streak


def label_bonus_points(label: str) -> float:
    return 1.0 if label in {"a_selected", "de_selected"} else 0.0


def generate_rows(
    client: OpenAI,
    category: dict,
    hints: dict[str, dict[str, str]],
    model: str,
    count: int,
    batch_size: int,
) -> list[dict]:
    allowed_verbs = set(category["verbs"])
    rows: list[dict] = []
    seen_sentences: set[str] = set()
    current_counts: Counter[str] = Counter()
    recent_verbs: list[str] = []
    attempts = 0

    while len(rows) < count:
        attempts += 1
        if attempts > 20:
            raise RuntimeError("Too many generation attempts; stopping early.")
        need_count = min(batch_size, count - len(rows))
        response = call_parse(
            client=client,
            model=model,
            response_format=PhraseBatchResponse,
            system_prompt=generation_system_prompt(),
            user_prompt=build_generation_prompt(category, hints, need_count, current_counts, recent_verbs),
        )

        accepted = 0
        for item in response.rows:
            normalized = normalize_phrase_row(item, allowed_verbs)
            if normalized is None:
                continue
            dedupe_key = normalized.sentence_fr.lower()
            if dedupe_key in seen_sentences:
                continue
            row = normalized.model_dump()
            rows.append(row)
            seen_sentences.add(dedupe_key)
            current_counts[row["verb"]] += 1
            recent_verbs.append(row["verb"])
            accepted += 1
            if len(rows) >= count:
                break

        if accepted == 0:
            raise RuntimeError("Generator returned no acceptable rows in a batch.")

    return rows[:count]


def judge_rows(
    client: OpenAI,
    judge_model: str,
    rows: list[dict],
    batch_size: int,
    hints: dict[str, dict[str, str]] | None = None,
) -> list[dict]:
    judged_by_index: dict[int, dict] = {}
    llm_needed: list[dict] = []

    for index, row in enumerate(rows, start=1):
        mechanical = mechanical_judgment_for_row(row, hints=hints)
        if mechanical.get("label") is not None:
            judged_by_index[index] = {
                "index": index,
                "label": mechanical["label"],
                "reason": normalize_text(mechanical.get("reason", "")),
                "judge_source": mechanical.get("source", "mechanical"),
            }
            continue

        llm_needed.append(
            {
                "index": index,
                "verb": row["verb"],
                "sentence_fr": row["sentence_fr"],
                "parser_hint": mechanical.get("parser_hint", ""),
                "mechanical_reason": mechanical.get("reason", ""),
            }
        )

    for start in range(0, len(llm_needed), batch_size):
        batch = llm_needed[start:start + batch_size]
        try:
            response = call_parse(
                client=client,
                model=judge_model,
                response_format=BonusBatchResponse,
                system_prompt=judge_system_prompt(),
                user_prompt=build_judge_prompt(batch),
            )
            by_index = {item.index: item for item in response.rows}
            for source in batch:
                item = by_index.get(source["index"])
                if item is None:
                    judged_by_index[source["index"]] = {
                        "index": source["index"],
                        "label": "none",
                        "reason": "missing_judge_row_fallback_none",
                        "judge_source": "llm_missing_fallback",
                    }
                else:
                    judged_by_index[item.index] = {
                        "index": item.index,
                        "label": item.label,
                        "reason": normalize_text(item.reason),
                        "judge_source": "llm",
                    }
        except Exception as error:
            for source in batch:
                judged_by_index[source["index"]] = {
                    "index": source["index"],
                    "label": "none",
                    "reason": normalize_text(f"llm_error_fallback_none:{type(error).__name__}"),
                    "judge_source": "llm_error_fallback",
                }

    judged = [judged_by_index[index] for index in range(1, len(rows) + 1)]
    return judged


def attach_scores(rows: list[dict], judged: list[dict]) -> list[dict]:
    base_total, base_scores, max_streak = score_sequence(rows)
    judged_by_index = {row["index"]: row for row in judged}
    enriched: list[dict] = []
    for index, row in enumerate(rows, start=1):
        verdict = judged_by_index.get(index, {"label": "uncertain", "reason": "missing"})
        bonus_points = label_bonus_points(verdict["label"])
        enriched.append(
            {
                "index": index,
                **row,
                "base_score": base_scores[index - 1],
                "bonus_label": verdict["label"],
                "bonus_reason": verdict["reason"],
                "judge_source": verdict.get("judge_source", ""),
                "bonus_points": bonus_points,
                "total_score": base_scores[index - 1] + bonus_points,
            }
        )
    for row in enriched:
        row["sequence_base_total"] = base_total
        row["sequence_max_streak"] = max_streak
    return enriched


def write_outputs(
    category: dict,
    model: str,
    judge_model: str,
    rows: list[dict],
    out_prefix: Path,
) -> None:
    out_prefix.parent.mkdir(parents=True, exist_ok=True)
    json_path = Path(f"{out_prefix}.json")
    tsv_path = Path(f"{out_prefix}.tsv")
    md_path = Path(f"{out_prefix}.md")

    json_path.write_text(json.dumps(rows, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    with tsv_path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.writer(handle, delimiter="\t")
        writer.writerow(
            [
                "index",
                "verb",
                "sentence_fr",
                "translation_en",
                "tense",
                "subject",
                "base_score",
                "bonus_label",
                "judge_source",
                "bonus_reason",
                "bonus_points",
                "total_score",
            ]
        )
        for row in rows:
            writer.writerow(
                [
                    row["index"],
                    row["verb"],
                    row["sentence_fr"],
                    row["translation_en"],
                    row["tense"],
                    row["subject"],
                    row["base_score"],
                    row["bonus_label"],
                    row.get("judge_source", ""),
                    row.get("bonus_reason", ""),
                    row["bonus_points"],
                    row["total_score"],
                ]
            )

    verb_counts = Counter(row["verb"] for row in rows)
    bonus_counts = Counter(row["bonus_label"] for row in rows)
    judge_source_counts = Counter(row.get("judge_source", "(blank)") or "(blank)" for row in rows)
    tense_counts = Counter(row["tense"] or "(blank)" for row in rows)
    base_total = sum(float(row["base_score"]) for row in rows)
    bonus_total = sum(float(row["bonus_points"]) for row in rows)
    max_streak = max((int(row["sequence_max_streak"]) for row in rows), default=0)

    lines = [
        f"# Category Phrase Harvest: {category['name']}",
        "",
        f"- Category ID: `{category['id']}`",
        f"- Scope: {category['scope']}",
        f"- Generator model: `{model}`",
        f"- Judge model: `{judge_model}`",
        f"- Phrase count: `{len(rows)}`",
        f"- Base score total: `{base_total:.2f}`",
        f"- Bonus score total: `{bonus_total:.2f}`",
        f"- Combined score total: `{base_total + bonus_total:.2f}`",
        f"- Max consecutive streak: `{max_streak}`",
        "",
        "## Verb Counts",
        "",
        "| Verb | Count |",
        "| --- | ---: |",
    ]
    for verb in category["verbs"]:
        lines.append(f"| {verb} | {verb_counts.get(verb, 0)} |")

    lines.extend(
        [
            "",
            "## Bonus Labels",
            "",
            "| Label | Count |",
            "| --- | ---: |",
        ]
    )
    for label, count in sorted(bonus_counts.items()):
        lines.append(f"| {label} | {count} |")

    lines.extend(
        [
            "",
            "## Judge Sources",
            "",
            "| Source | Count |",
            "| --- | ---: |",
        ]
    )
    for source, count in sorted(judge_source_counts.items()):
        lines.append(f"| {source} | {count} |")

    lines.extend(
        [
            "",
            "## Tense Labels",
            "",
            "| Tense | Count |",
            "| --- | ---: |",
        ]
    )
    for tense, count in sorted(tense_counts.items()):
        lines.append(f"| {tense} | {count} |")

    lines.extend(
        [
            "",
            "## Sample Rows",
            "",
            "| # | Verb | French | Bonus |",
            "| ---: | --- | --- | --- |",
        ]
    )
    for row in rows[:40]:
        lines.append(
            f"| {row['index']} | {row['verb']} | {row['sentence_fr'].replace('|', '/')} | {row['bonus_label']} |"
        )

    md_path.write_text("\n".join(lines).rstrip() + "\n", encoding="utf-8")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--category-id", default=DEFAULT_CATEGORY_ID)
    parser.add_argument("--model", default=DEFAULT_MODEL)
    parser.add_argument("--judge-model", default=DEFAULT_JUDGE_MODEL)
    parser.add_argument("--count", type=int, default=DEFAULT_COUNT)
    parser.add_argument("--batch-size", type=int, default=DEFAULT_BATCH_SIZE)
    parser.add_argument("--judge-batch-size", type=int, default=40)
    parser.add_argument("--out-prefix", default="")
    parser.add_argument("--input-json", default="")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    ensure_openai()
    category = load_category_spec(args.category_id)
    hints = load_dicovalence_hints(args.category_id)
    client = OpenAI()

    if args.input_json:
        source_rows = json.loads(Path(args.input_json).read_text(encoding="utf-8"))
        phrase_rows = [
            {
                "verb": normalize_text(row.get("verb", "")).lower(),
                "sentence_fr": normalize_sentence(row.get("sentence_fr", "")),
                "translation_en": normalize_text(row.get("translation_en", "")),
                "tense": normalize_text(row.get("tense", "")),
                "subject": normalize_text(row.get("subject", "")),
                "note": normalize_text(row.get("note", "")),
            }
            for row in source_rows
        ]
        phrase_rows = [row for row in phrase_rows if row["verb"] and row["sentence_fr"] and row["translation_en"]]
    else:
        phrase_rows = generate_rows(
            client=client,
            category=category,
            hints=hints,
            model=args.model,
            count=args.count,
            batch_size=args.batch_size,
        )
    judged_rows = judge_rows(
        client=client,
        judge_model=args.judge_model,
        rows=phrase_rows,
        batch_size=args.judge_batch_size,
        hints=hints,
    )
    enriched_rows = attach_scores(phrase_rows, judged_rows)

    if args.out_prefix:
        out_prefix = Path(args.out_prefix)
    else:
        slug = category["id"].replace("builtin-", "").replace("-", "_")
        out_prefix = ROOT / f"phrase_harvest.{slug}"

    write_outputs(category=category, model=args.model, judge_model=args.judge_model, rows=enriched_rows, out_prefix=out_prefix)
    print(f"Wrote {len(enriched_rows)} phrases to {Path(f'{out_prefix}.json')}")


if __name__ == "__main__":
    main()
