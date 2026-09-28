from __future__ import annotations

import csv
import json
import os
import re
import sys
import time
import unicodedata
from collections import Counter, defaultdict
from pathlib import Path

from pydantic import BaseModel

from audit_ai_frame_cards_stanza import (
    build_nlp,
    children_of,
    find_case_or_mark_child,
    find_main_finite_verb,
    parse_sentence,
    subtree_has_personish_target,
    subtree_has_place_or_thing_target,
    subtree_has_timeish_target,
)
from frame_cards_lib import (
    forms_for_validation,
    load_core_pattern_index,
    load_present_tenses,
    load_rollout_verbs,
    load_usage_index,
)

try:
    from openai import OpenAI
except ImportError:
    OpenAI = None


ROOT = Path(__file__).parent
INPUT_FRAMES = ROOT / "verb_frames.generated.json"
OUT_JSON = ROOT / "top500_usage_review_dataset.json"
OUT_TSV = ROOT / "top500_usage_review_dataset.tsv"
OUT_MD = ROOT / "top500_usage_review_dataset.md"
OUT_SUMMARY = ROOT / "top500_usage_review_summary.md"
COMBO_CACHE = ROOT / "_ai_frame_runs" / "top500_review_combo_cache.json"
DEFAULT_STANZA_DIR = ROOT / ".stanza_resources" / "1.11.0" / "resources"

TIME_WORD_RE = re.compile(
    r"\b(?:demain|aujourd'hui|hier|toujours|souvent|chaque|matin|soir|midi|minuit|heure|heures|minute|minutes)\b",
    re.IGNORECASE,
)
CLAUSE_RE = re.compile(r"\bque\b|qu'|\bsi\b", re.IGNORECASE)
PREP_A_RE = re.compile(r"\b(à|au|aux)\b|à la\b|à l'", re.IGNORECASE)
PREP_DE_RE = re.compile(r"\b(de|du|des)\b|de la\b|de l'|d'", re.IGNORECASE)
INITIAL_JE_VOWEL_RE = re.compile(r"^Je ([AEIOUÀÂÄÆÉÈÊËÎÏÔŒÖÙÛÜaeiouàâäæéèêëîïôœöùûü])")
INITIAL_JE_MUTE_H_RE = re.compile(r"^Je (habill\w*)", re.IGNORECASE)
REFLEXIVE_SURFACE_RE = re.compile(r"^(?:J'|Je |Tu |Il |Elle |On |Nous |Vous |Ils |Elles )(?:me |m'|te |t'|se |s'|nous |vous )", re.IGNORECASE)
DIRECT_EXTRA_PREP_RE = re.compile(r"\b(?:avec|pour|sur|sous|dans|contre|chez|par|après|avant)\b", re.IGNORECASE)
ANY_REFLEXIVE_CLITIC_RE = re.compile(r"(?:^|\s)(?:m'|t'|s'|me |te |se |nous |vous )", re.IGNORECASE)

REVIEW_BAD_SENTENCES = {
    "je défends l'alcool à mon fils",
    "je refuse cette demande à mon collègue",
    "je signifie mon refus à paul",
}

QUARANTINED_VERBS = {"approprier", "baiser", "carter", "coter", "crémer", "douer", "enculer", "souvenir"}

FRAME_SOURCE_PRIORITY = {
    "manual:": 5,
    "usage:": 4,
    "ai:": 3,
    "fallback:": 2,
}


class ComboGenerationResponse(BaseModel):
    legal: bool
    sentence_fr: str = ""
    meaning_en: str = ""
    direct_object_np: str = ""
    a_complement_np: str = ""
    conjugated_form: str = ""
    note: str = ""


class ComboJudgeResponse(BaseModel):
    accept: bool
    reason: str = ""


def lexical_key(value: str) -> str:
    normalized = unicodedata.normalize("NFD", str(value).casefold())
    return "".join(char for char in normalized if unicodedata.category(char) != "Mn")


def normalize_text(value: str) -> str:
    text = str(value or "").strip()
    text = text.replace("\u2019", "'").replace("\u2018", "'").replace("\u02bc", "'")
    text = re.sub(r"\s+", " ", text)
    text = re.sub(r"\s+([,;:!?])", r"\1", text)
    return text.strip()


def normalize_sentence(value: str) -> str:
    return re.sub(r"[.?!]+$", "", normalize_text(value)).strip()


def fix_initial_elision(sentence: str) -> str:
    text = normalize_sentence(sentence)
    text = INITIAL_JE_VOWEL_RE.sub(r"J'\1", text)
    return INITIAL_JE_MUTE_H_RE.sub(r"J'\1", text)


def capitalize_initial(sentence: str) -> str:
    text = normalize_sentence(sentence)
    if not text:
        return ""
    return text[0].upper() + text[1:]


def source_priority(source: str) -> int:
    for prefix, rank in FRAME_SOURCE_PRIORITY.items():
        if source.startswith(prefix):
            return rank
    return 1


def load_frames() -> list[dict]:
    return json.loads(INPUT_FRAMES.read_text(encoding="utf-8"))


def usage_family(pattern: str) -> str:
    text = normalize_text(pattern).lower()
    if "+ object + à +" in text:
        return "combo_a"
    if "+ à +" in text and "+ infinitive" not in text and "+ object + à +" not in text:
        return "a_object"
    if "+ de +" in text and "+ infinitive" not in text and "+ object + de +" not in text:
        return "de_object"
    if "+ object" in text and "+ à +" not in text and "+ de +" not in text and "+ que +" not in text and "+ infinitive" not in text:
        return "direct_object"
    return ""


def best_frame_candidate(cards: list[dict], family: str) -> dict | None:
    candidates = [card for card in cards if card.get("frame_type") == family]
    if not candidates:
        return None
    return min(
        candidates,
        key=lambda card: (
            len(normalize_sentence(card.get("full_answer", "")).split()),
            -source_priority(str(card.get("source", ""))),
            lexical_key(card.get("full_answer", "")),
        ),
    )


def frame_candidates(cards: list[dict], family: str) -> list[dict]:
    candidates = [card for card in cards if card.get("frame_type") == family]
    return sorted(
        candidates,
        key=lambda card: (
            len(normalize_sentence(card.get("full_answer", "")).split()),
            -source_priority(str(card.get("source", ""))),
            lexical_key(card.get("full_answer", "")),
        ),
    )


def sentence_is_clean_usage(sentence: str, family: str) -> bool:
    text = normalize_sentence(sentence)
    if not text:
        return False
    if family in {"a_object", "de_object", "combo_a"} and CLAUSE_RE.search(text):
        return False
    if family in {"a_object", "combo_a"} and TIME_WORD_RE.search(text):
        return False
    return True


def best_usage_candidate(rows: list[dict], family: str) -> dict | None:
    candidates = []
    for row in rows:
        if usage_family(str(row.get("pattern", ""))) != family:
            continue
        sentence = normalize_sentence(row.get("example_fr", ""))
        if not sentence_is_clean_usage(sentence, family):
            continue
        candidates.append(
            {
                "sentence": sentence,
                "source": f"usage:{row.get('sense_id') or ''}".rstrip(":"),
                "pattern": normalize_text(row.get("pattern", "")),
                "meaning_en": normalize_text(row.get("meaning_en", "")),
            }
        )
    if not candidates:
        return None
    return min(candidates, key=lambda row: (len(row["sentence"].split()), lexical_key(row["sentence"])))


def usage_candidates(rows: list[dict], family: str) -> list[dict]:
    candidates = []
    for row in rows:
        if usage_family(str(row.get("pattern", ""))) != family:
            continue
        sentence = normalize_sentence(row.get("example_fr", ""))
        if not sentence_is_clean_usage(sentence, family):
            continue
        candidates.append(
            {
                "sentence": sentence,
                "source": f"usage:{row.get('sense_id') or ''}".rstrip(":"),
                "pattern": normalize_text(row.get("pattern", "")),
                "meaning_en": normalize_text(row.get("meaning_en", "")),
            }
        )
    return sorted(candidates, key=lambda row: (len(row["sentence"].split()), lexical_key(row["sentence"])))


def legal_combo_pattern(core_patterns: list[dict]) -> dict | None:
    blocked = {
        "associer qqn / qqch à qqn / qqch",
        "préférer qqn / qqch à qqn / qqch",
    }
    combos = [row for row in core_patterns if row.get("pattern_type") == "combo-a"]
    for row in combos:
        pattern = normalize_text(row.get("pattern", ""))
        if pattern in blocked:
            continue
        return row
    return None


def valid_verb_cores(verb: str, present_tenses: dict[str, dict[str, str]]) -> set[str]:
    forms = forms_for_validation(verb, present_tenses)
    cores: set[str] = set()
    for full_form in forms:
        text = normalize_sentence(full_form)
        if " " in text:
            _, answer = text.split(" ", 1)
            cores.add(answer)
            stripped = re.sub(r"^(?:(?:m|t|s|l)'|me |te |se |nous |vous |le |la |les |lui |leur |y |en )+", "", answer).strip()
            if stripped:
                cores.add(stripped)
        elif text:
            cores.add(text)
    return {core for core in cores if core}


def base_verb(verb: str) -> str:
    text = normalize_text(verb).lower()
    if text.startswith("se "):
        return text[3:]
    if text.startswith("s'"):
        return text[2:]
    return text


def main_verb_matches(verb: str, main_verb) -> bool:
    return lexical_key(base_verb(verb)) == lexical_key(str(main_verb.lemma or "").lower())


def sentence_uses_reflexive_surface(sentence: str) -> bool:
    return bool(ANY_REFLEXIVE_CLITIC_RE.search(normalize_sentence(sentence)))


def parse_main_verb(sentence: str, nlp):
    words = parse_sentence(nlp, normalize_sentence(sentence))
    return words, find_main_finite_verb(words)


def validate_direct_sentence(verb: str, sentence: str, nlp) -> list[str]:
    reasons: list[str] = []
    text = normalize_sentence(sentence)
    if not text:
        return ["missing_sentence"]
    if CLAUSE_RE.search(text):
        reasons.append("contains_clause")
    if TIME_WORD_RE.search(text):
        reasons.append("contains_time_marker")
    if len(text.split()) > 6:
        reasons.append("too_long")
    if DIRECT_EXTRA_PREP_RE.search(text):
        reasons.append("contains_extra_prep")
    if not normalize_text(verb).lower().startswith(("se ", "s'")) and sentence_uses_reflexive_surface(text):
        reasons.append("unexpected_reflexive")

    words, main_verb = parse_main_verb(text, nlp)
    if not main_verb:
        return ["no_main_finite_verb"]
    if not main_verb_matches(verb, main_verb):
        reasons.append("wrong_main_verb")
    if not any(word.head == main_verb.idx and word.deprel == "obj" for word in words):
        reasons.append("missing_direct_object")

    for child in children_of(words, main_verb.idx):
        if child.deprel in {"advmod", "advcl", "ccomp", "xcomp", "obl", "obl:arg", "iobj"}:
            reasons.append("extra_dependents")
            break

    return sorted(set(reasons))


def find_prep_arg(words: list, main_verb, family: str):
    surface = "à" if family in {"a_object", "combo_a"} else "de"
    for child in children_of(words, main_verb.idx):
        if child.deprel not in {"obl:arg", "obl", "iobj"}:
            continue
        case = find_case_or_mark_child(words, child.idx, surface)
        if case:
            return child
    return None


def validate_a_sentence(verb: str, sentence: str, nlp) -> list[str]:
    reasons: list[str] = []
    text = normalize_sentence(sentence)
    if not text:
        return ["missing_sentence"]
    if CLAUSE_RE.search(text):
        reasons.append("contains_clause")
    if not normalize_text(verb).lower().startswith(("se ", "s'")) and sentence_uses_reflexive_surface(text):
        reasons.append("unexpected_reflexive")
    words, main_verb = parse_main_verb(text, nlp)
    if not main_verb:
        return ["no_main_finite_verb"]
    if not main_verb_matches(verb, main_verb):
        reasons.append("wrong_main_verb")
    arg = find_prep_arg(words, main_verb, "a_object")
    if not arg:
        reasons.append("missing_a_complement")
        return sorted(set(reasons))
    if any(word.head == main_verb.idx and word.deprel == "obj" for word in words):
        reasons.append("looks_like_combo_a")
    if arg.upos == "VERB":
        reasons.append("a_infinitive")
    if subtree_has_timeish_target(words, arg.idx):
        reasons.append("a_timeish")
    if subtree_has_place_or_thing_target(words, arg.idx) and not subtree_has_personish_target(words, arg.idx):
        reasons.append("a_placeish")
    return sorted(set(reasons))


def validate_de_sentence(verb: str, sentence: str, nlp) -> list[str]:
    reasons: list[str] = []
    text = normalize_sentence(sentence)
    if not text:
        return ["missing_sentence"]
    if CLAUSE_RE.search(text):
        reasons.append("contains_clause")
    if not normalize_text(verb).lower().startswith(("se ", "s'")) and sentence_uses_reflexive_surface(text):
        reasons.append("unexpected_reflexive")
    words, main_verb = parse_main_verb(text, nlp)
    if not main_verb:
        return ["no_main_finite_verb"]
    if not main_verb_matches(verb, main_verb):
        reasons.append("wrong_main_verb")
    arg = find_prep_arg(words, main_verb, "de_object")
    if not arg:
        reasons.append("missing_de_complement")
        return sorted(set(reasons))
    if any(word.head == main_verb.idx and word.deprel == "obj" for word in words):
        reasons.append("looks_like_combo_de")
    if arg.upos == "VERB":
        reasons.append("de_infinitive")
    if "fait de doute" in text.lower():
        reasons.append("bad_formula")
    return sorted(set(reasons))


def find_combo_a_arg(words: list, main_verb) -> tuple[object, object] | None:
    for child in children_of(words, main_verb.idx):
        if child.deprel not in {"obl:arg", "obl", "iobj"}:
            continue
        case = find_case_or_mark_child(words, child.idx, "à")
        if case:
            return child, case
    return None


def validate_combo_sentence(verb: str, sentence: str, conjugated_form: str, present_tenses: dict[str, dict[str, str]], nlp) -> list[str]:
    reasons: list[str] = []
    text = normalize_sentence(sentence)
    if not text:
        return ["missing_sentence"]
    if CLAUSE_RE.search(text):
        reasons.append("contains_clause_marker")
    if TIME_WORD_RE.search(text):
        reasons.append("contains_time_marker")
    if len(text.split()) > 10:
        reasons.append("too_long")
    if not normalize_text(verb).lower().startswith(("se ", "s'")) and sentence_uses_reflexive_surface(text):
        reasons.append("unexpected_reflexive")
    if conjugated_form and conjugated_form not in valid_verb_cores(verb, present_tenses):
        reasons.append("bad_conjugated_form")

    words = parse_sentence(nlp, text)
    main_verb = find_main_finite_verb(words)
    if not main_verb:
        reasons.append("no_main_finite_verb")
        return sorted(set(reasons))
    if not main_verb_matches(verb, main_verb):
        reasons.append("wrong_main_verb")

    if not any(word.head == main_verb.idx and word.deprel == "obj" for word in words):
        reasons.append("missing_direct_object")

    matched_arg = find_combo_a_arg(words, main_verb)
    if not matched_arg:
        reasons.append("missing_a_complement")
        return sorted(set(reasons))

    arg, _ = matched_arg
    if arg.upos == "VERB":
        reasons.append("a_complement_is_verb")
    if subtree_has_timeish_target(words, arg.idx):
        reasons.append("a_complement_timeish")
    if subtree_has_place_or_thing_target(words, arg.idx) and not subtree_has_personish_target(words, arg.idx):
        reasons.append("a_complement_placeish")

    return sorted(set(reasons))


def combo_system_prompt() -> str:
    return """You generate high-trust French review sentences for a language-learning dataset.

We want only the family:
- direct object + à-complement selected by the verb

Rules:
- present tense only
- explicit subject pronoun
- one explicit direct-object noun phrase
- one explicit `à` complement noun phrase
- short, ordinary, modern French
- no place/time/manner adjuncts
- no `que` clause
- no infinitive complement
- no clitic direct object
- if the pattern is not genuinely natural for the verb, return legal=false

Return JSON only.
"""


def combo_user_prompt(verb_entry: dict, combo_pattern: dict, usage_rows: list[dict]) -> str:
    usages = []
    for row in usage_rows[:5]:
        pattern = normalize_text(row.get("pattern", ""))
        example = normalize_sentence(row.get("example_fr", ""))
        if example:
            usages.append(f"- {pattern} | {example}")
    usage_block = "\n".join(usages) if usages else "- none"
    return f"""Verb: {verb_entry['infinitive']}
Translation: {normalize_text(verb_entry.get('translation', '')) or '(none)'}
Hint: {normalize_text(verb_entry.get('hint', '')) or '(none)'}
Target pattern: {normalize_text(combo_pattern.get('pattern', ''))}
Pattern meaning: {normalize_text(combo_pattern.get('meaning_en', '')) or '(none)'}

Existing usage evidence:
{usage_block}

Return JSON with:
- legal
- sentence_fr
- meaning_en
- direct_object_np
- a_complement_np
- conjugated_form
- note
"""


def combo_judge_system_prompt() -> str:
    return """Be conservative.

Accept only if the sentence is a natural modern French example of a core
`verb + direct object + à + complement` pattern.

Reject if the `à` phrase is place, time, manner, or other loose context.
Reject if the sentence feels dictionary-ish, awkward, or doubtful.
Return JSON only with:
- accept
- reason
"""


def combo_judge_user_prompt(verb: str, pattern: str, sentence: str) -> str:
    return f"""Verb: {verb}
Pattern: {pattern}
Sentence: {sentence}
"""


def load_combo_cache() -> dict[str, dict]:
    if not COMBO_CACHE.exists():
        return {}
    return json.loads(COMBO_CACHE.read_text(encoding="utf-8"))


def write_combo_cache(cache: dict[str, dict]) -> None:
    COMBO_CACHE.parent.mkdir(parents=True, exist_ok=True)
    COMBO_CACHE.write_text(json.dumps(cache, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def generate_combo_candidate(
    client: OpenAI,
    verb_entry: dict,
    combo_pattern: dict,
    usage_rows: list[dict],
    present_tenses: dict[str, dict[str, str]],
    nlp,
) -> dict:
    completion = client.chat.completions.parse(
        model="gpt-5.4",
        response_format=ComboGenerationResponse,
        messages=[
            {"role": "system", "content": combo_system_prompt()},
            {"role": "user", "content": combo_user_prompt(verb_entry, combo_pattern, usage_rows)},
        ],
    )
    message = completion.choices[0].message
    if not message.parsed:
        return {"status": "parse_failed"}

    parsed = message.parsed.model_dump()
    if not parsed.get("legal"):
        return {"status": "not_legal", "candidate": None}

    sentence = fix_initial_elision(parsed.get("sentence_fr", ""))
    conjugated_form = normalize_text(parsed.get("conjugated_form", ""))
    reasons = validate_combo_sentence(verb_entry["infinitive"], sentence, conjugated_form, present_tenses, nlp)
    if reasons:
        return {"status": "rejected_validation", "issues": reasons, "candidate": parsed}

    judge_completion = client.chat.completions.parse(
        model="gpt-5.4-mini",
        response_format=ComboJudgeResponse,
        messages=[
            {"role": "system", "content": combo_judge_system_prompt()},
            {"role": "user", "content": combo_judge_user_prompt(verb_entry["infinitive"], combo_pattern.get("pattern", ""), sentence)},
        ],
    )
    judge_message = judge_completion.choices[0].message
    if not judge_message.parsed:
        return {"status": "judge_parse_failed", "candidate": parsed}

    judged = judge_message.parsed.model_dump()
    if not judged.get("accept"):
        return {
            "status": "rejected_judge",
            "candidate": parsed,
            "judge_reason": normalize_text(judged.get("reason", "")),
        }

    return {
        "status": "accepted",
        "candidate": {
            "sentence": sentence,
            "source": f"ai:combo:{combo_pattern.get('source', 'core')}",
            "pattern": normalize_text(combo_pattern.get("pattern", "")),
            "meaning_en": normalize_text(parsed.get("meaning_en", "")),
            "direct_object_np": normalize_text(parsed.get("direct_object_np", "")),
            "a_complement_np": normalize_text(parsed.get("a_complement_np", "")),
            "conjugated_form": conjugated_form,
            "note": normalize_text(parsed.get("note", "")),
        },
    }


def build_review_rows() -> tuple[list[dict], Counter[str]]:
    present_tenses = load_present_tenses()
    usage_index = load_usage_index()
    core_pattern_index = load_core_pattern_index()
    frame_cards = load_frames()
    nlp = build_nlp(str(DEFAULT_STANZA_DIR))

    by_frame: dict[str, list[dict]] = defaultdict(list)
    for card in frame_cards:
        by_frame[str(card.get("verb", ""))].append(card)

    verbs = sorted(load_rollout_verbs(), key=lambda item: lexical_key(item["infinitive"]))
    summary = Counter()
    rows: list[dict] = []

    combo_cache = load_combo_cache()
    allow_generation = os.environ.get("TOP500_REVIEW_NO_GENERATE") != "1"
    client = OpenAI() if (allow_generation and OpenAI is not None and os.environ.get("OPENAI_API_KEY")) else None

    for index, verb_entry in enumerate(verbs, start=1):
        verb = verb_entry["infinitive"]
        if index == 1 or index % 50 == 0:
            print(f"{index}/{len(verbs)} {verb}", flush=True)
        if verb in QUARANTINED_VERBS:
            rows.append({"verb": verb, "COD": "", "à": "", "de": "", "COD+à": "", "sources": {"COD": "", "à": "", "de": "", "COD+à": ""}})
            continue
        frame_rows = by_frame.get(verb, [])
        usage_rows = usage_index.get(verb, [])
        core_patterns = core_pattern_index.get(verb, [])

        direct = None
        for candidate in frame_candidates(frame_rows, "direct_object") + usage_candidates(usage_rows, "direct_object"):
            sentence = normalize_sentence(candidate.get("full_answer") or candidate.get("sentence") or "")
            if not validate_direct_sentence(verb, sentence, nlp):
                direct = candidate
                break

        a_object = None
        for candidate in frame_candidates(frame_rows, "a_object") + usage_candidates(usage_rows, "a_object"):
            sentence = normalize_sentence(candidate.get("full_answer") or candidate.get("sentence") or "")
            if not validate_a_sentence(verb, sentence, nlp):
                a_object = candidate
                break

        de_object = None
        for candidate in frame_candidates(frame_rows, "de_object") + usage_candidates(usage_rows, "de_object"):
            sentence = normalize_sentence(candidate.get("full_answer") or candidate.get("sentence") or "")
            if not validate_de_sentence(verb, sentence, nlp):
                de_object = candidate
                break

        combo = None
        for candidate in usage_candidates(usage_rows, "combo_a"):
            sentence = normalize_sentence(candidate.get("full_answer") or candidate.get("sentence") or "")
            pattern = str(candidate.get("pattern", ""))
            if "lieu/événement" in pattern.lower():
                continue
            if not validate_combo_sentence(verb, sentence, "", present_tenses, nlp):
                combo = candidate
                break
        combo_pattern = legal_combo_pattern(core_patterns)
        if not combo and combo_pattern:
            cached = combo_cache.get(verb)
            if cached:
                if cached.get("status") == "accepted":
                    candidate = cached.get("candidate")
                    sentence = normalize_sentence((candidate or {}).get("sentence", ""))
                    if candidate and not validate_combo_sentence(verb, sentence, str(candidate.get("conjugated_form", "")), present_tenses, nlp):
                        combo = candidate
            elif client is not None:
                result = generate_combo_candidate(client, verb_entry, combo_pattern, usage_rows, present_tenses, nlp)
                combo_cache[verb] = result
                write_combo_cache(combo_cache)
                if result.get("status") == "accepted":
                    candidate = result.get("candidate")
                    sentence = normalize_sentence((candidate or {}).get("sentence", ""))
                    if candidate and not validate_combo_sentence(verb, sentence, str(candidate.get("conjugated_form", "")), present_tenses, nlp):
                        combo = candidate
                time.sleep(0.2)

        row = {
            "verb": verb,
            "COD": capitalize_initial(fix_initial_elision((direct or {}).get("full_answer") or (direct or {}).get("sentence") or "")),
            "à": capitalize_initial(fix_initial_elision((a_object or {}).get("full_answer") or (a_object or {}).get("sentence") or "")),
            "de": capitalize_initial(fix_initial_elision((de_object or {}).get("full_answer") or (de_object or {}).get("sentence") or "")),
            "COD+à": capitalize_initial(fix_initial_elision((combo or {}).get("full_answer") or (combo or {}).get("sentence") or "")),
            "sources": {
                "COD": str((direct or {}).get("source", "")),
                "à": str((a_object or {}).get("source", "")),
                "de": str((de_object or {}).get("source", "")),
                "COD+à": str((combo or {}).get("source", "")),
            },
        }
        for family in ("COD", "à", "de", "COD+à"):
            if normalize_sentence(row[family]).lower() in REVIEW_BAD_SENTENCES:
                row[family] = ""
                row["sources"][family] = ""
        rows.append(row)

        for family in ("COD", "à", "de", "COD+à"):
            if row[family]:
                summary[family] += 1

    return rows, summary


def write_outputs(rows: list[dict], summary: Counter[str]) -> None:
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

    summary_lines = [
        "# Top500 Usage Review Dataset",
        "",
        f"- Total verbs: `{len(rows)}`",
        f"- COD: `{summary['COD']}`",
        f"- à: `{summary['à']}`",
        f"- de: `{summary['de']}`",
        f"- COD+à: `{summary['COD+à']}`",
        "",
    ]
    OUT_SUMMARY.write_text("\n".join(summary_lines), encoding="utf-8")


def main() -> None:
    rows, summary = build_review_rows()
    write_outputs(rows, summary)
    print(f"Wrote {OUT_TSV}")
    print(f"Wrote {OUT_MD}")
    print(f"Wrote {OUT_JSON}")
    print(f"Coverage: COD={summary['COD']} à={summary['à']} de={summary['de']} COD+à={summary['COD+à']}")


if __name__ == "__main__":
    main()
