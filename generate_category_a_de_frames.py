#!/usr/bin/env python3
"""
Generate a clean one-category French frame-card deck for the new A/De flow.

This script intentionally ignores `verb_usages` as a content source.
It uses:
- the built-in category verb list from `js/script.js`
- the app verb metadata and present-tense tables from `js/verbs.full.generated.js`
- the family inventory hints from `top500_usage_final_dataset.json`
- the structural hints from `verb_core_patterns.json`
- OpenAI for family planning, sentence generation, and judging
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
from pathlib import Path
from typing import Literal

from pydantic import BaseModel, Field

try:
    from openai import OpenAI
except ImportError:
    OpenAI = None

from openai_env import load_openai_api_key


ROOT = Path(__file__).parent
SCRIPT_JS = ROOT / "js" / "script.js"
VERBS_JS = ROOT / "js" / "verbs.full.generated.js"
TOP500_FAMILIES_JSON = ROOT / "top500_usage_final_dataset.json"
CORE_PATTERNS_JSON = ROOT / "verb_core_patterns.json"

DEFAULT_CATEGORY_ID = "builtin-education-learning"
DEFAULT_MODEL = "gpt-5.4-mini"
DEFAULT_JUDGE_MODEL = "gpt-5.4-mini"

SUPPORTED_FAMILIES = ("direct_object", "a_object", "de_object", "combo_a")
FAMILY_PRIORITY = {"combo_a": 0, "a_object": 1, "de_object": 2, "direct_object": 3}
FAMILY_LABELS = {
    "direct_object": "direct",
    "a_object": "à",
    "de_object": "de",
    "combo_a": "direct + à",
}
PREP_SURFACES_A = {"à", "au", "aux", "à l'", "à la"}
PREP_SURFACES_DE = {"de", "du", "des", "d'", "de l'", "de la"}
SUBJECT_KEYS = {
    "je": ("je",),
    "tu": ("tu",),
    "il": ("il/elle/on", "il"),
    "nous": ("nous",),
    "vous": ("vous",),
    "ils": ("ils/elles", "ils"),
}
LEMMA_ALIAS = {
    "souvenir": "se souvenir",
}
NOISY_WORD_RE = re.compile(
    r"\b(?:jamais|toujours|encore|souvent|trop|vraiment|franchement|clairement|simplement)\b",
    re.IGNORECASE,
)
QUESTION_GAP_RE = re.compile(r"____")


class PlannedVerb(BaseModel):
    verb: str
    families: list[Literal["direct_object", "a_object", "de_object", "combo_a"]] = Field(default_factory=list)
    reason: str = ""


class FamilyPlanResponse(BaseModel):
    rows: list[PlannedVerb] = Field(default_factory=list)


class GeneratedCardRow(BaseModel):
    family: Literal["direct_object", "a_object", "de_object", "combo_a"]
    question: str
    answer: str
    full_answer: str
    meaning_en: str
    note: str = ""


class GeneratedVerbResponse(BaseModel):
    verb: str
    rows: list[GeneratedCardRow] = Field(default_factory=list)


class JudgeResponse(BaseModel):
    accept: bool
    reason: str = ""


def ensure_openai() -> None:
    load_openai_api_key()
    if OpenAI is None:
        sys.exit("openai package is not installed.")
    if not os.environ.get("OPENAI_API_KEY"):
        sys.exit("OPENAI_API_KEY is not set.")


def extract_js_literal(path: Path, prefix: str, suffix: str = ";"):
    text = path.read_text(encoding="utf-8")
    pattern = re.compile(re.escape(prefix) + r"\s*(\[[\s\S]*?\]|\{[\s\S]*?\})" + re.escape(suffix), re.MULTILINE)
    match = pattern.search(text)
    if not match:
        raise ValueError(f"Could not parse JS literal from {path} with prefix {prefix!r}")
    return json.loads(match.group(1))


def load_verbs() -> list[dict]:
    return extract_js_literal(VERBS_JS, "const verbs =")


def load_tenses() -> dict:
    text = VERBS_JS.read_text(encoding="utf-8")
    match = re.search(r"const tenses = (\{[\s\S]*?\});\n\nconst pronouns =", text)
    if not match:
        raise ValueError("Could not parse tenses from verbs.full.generated.js")
    return json.loads(match.group(1))


def slugify(value: str) -> str:
    import unicodedata

    normalized = unicodedata.normalize("NFKD", str(value or ""))
    ascii_value = normalized.encode("ascii", "ignore").decode("ascii")
    return re.sub(r"[^a-z0-9]+", "_", ascii_value.lower()).strip("_")


def normalize_text(value: str) -> str:
    text = str(value or "").strip()
    text = text.replace("\u2019", "'").replace("\u2018", "'").replace("\u02bc", "'")
    text = re.sub(r"\s+", " ", text)
    text = re.sub(r"\s+([,;:!?])", r"\1", text)
    return text.strip()


def normalize_sentence(text: str) -> str:
    normalized = re.sub(r"\s+", " ", str(text or "").strip())
    normalized = normalized.replace(" ’", "’").replace(" '", "'")
    normalized = re.sub(r"([A-Za-zÀ-ÖØ-öø-ÿ]')\s+([A-Za-zÀ-ÖØ-öø-ÿ])", r"\1\2", normalized)
    normalized = normalized.replace(" ,", ",").replace(" .", ".").replace(" ?", "?")
    normalized = re.sub(r"[.?!]+$", "", normalized)
    return normalized.strip()


def fill_question(question: str, answer: str) -> str:
    answer_tokens = iter(answer.split())

    def replace(_: re.Match[str]) -> str:
        try:
            return next(answer_tokens)
        except StopIteration as exc:
            raise ValueError("Question has more blanks than answer tokens") from exc

    filled = QUESTION_GAP_RE.sub(replace, question)
    try:
        next(answer_tokens)
        raise ValueError("Answer has more tokens than blanks")
    except StopIteration:
        return filled


def split_subject_and_answer(full_form: str) -> tuple[str, str]:
    if full_form.startswith("j'"):
        return "j'", full_form[2:]
    if " " not in full_form:
        raise ValueError(f"Could not split subject from form: {full_form}")
    subject, answer = full_form.split(" ", 1)
    return subject, answer


def forms_for_validation(verb: str, present_tenses: dict[str, dict[str, dict[str, str]]]) -> set[str]:
    lemma = LEMMA_ALIAS.get(verb, verb)
    forms = set((present_tenses.get("present", {}).get(verb) or {}).values())
    if lemma != verb:
        forms.update((present_tenses.get("present", {}).get(lemma) or {}).values())
    return {str(form).strip() for form in forms if str(form).strip()}


def answer_stems_for_validation(verb: str, present_tenses: dict[str, dict[str, dict[str, str]]]) -> set[str]:
    stems: set[str] = set()
    for full_form in forms_for_validation(verb, present_tenses):
        try:
            _, answer = split_subject_and_answer(full_form)
        except ValueError:
            answer = full_form
        stems.add(answer)
        stripped = re.sub(r"^(?:m'|t'|s'|me |te |se |nous |vous |le |la |les |l'|lui |leur |y |en )+", "", answer).strip()
        if stripped:
            stems.add(stripped)
    return stems


def load_category_spec(category_id: str) -> dict:
    text = SCRIPT_JS.read_text(encoding="utf-8")
    anchor = f"id: '{category_id}'"
    start = text.find(anchor)
    if start < 0:
        raise ValueError(f"Could not find category {category_id}")
    block = text[start:start + 3000]
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


def category_output_stem(category_id: str) -> str:
    raw = str(category_id or "").strip()
    raw = raw.replace("builtin-", "")
    return slugify(raw) or "category"


def load_family_rows() -> dict[str, dict]:
    if not TOP500_FAMILIES_JSON.exists():
        return {}
    rows = json.loads(TOP500_FAMILIES_JSON.read_text(encoding="utf-8"))
    return {str(row.get("verb", "")).strip(): row for row in rows if row.get("verb")}


def load_core_pattern_rows() -> dict[str, list[dict]]:
    if not CORE_PATTERNS_JSON.exists():
        return {}
    rows = json.loads(CORE_PATTERNS_JSON.read_text(encoding="utf-8"))
    return {str(row.get("verb", "")).strip(): list(row.get("core_patterns", []) or []) for row in rows if row.get("verb")}


def pattern_type_to_family(pattern_type: str) -> str:
    mapping = {
        "direct-object": "direct_object",
        "a-object": "a_object",
        "de-object": "de_object",
        "combo-a": "combo_a",
    }
    return mapping.get(str(pattern_type or "").strip(), "")


def family_evidence_for_verb(verb: str, family_rows: dict[str, dict], core_rows: dict[str, list[dict]]) -> dict:
    row = family_rows.get(verb) or {}
    evidence: dict[str, list[str]] = {family: [] for family in SUPPORTED_FAMILIES}

    if row.get("COD"):
        evidence["direct_object"].append("top500-final:COD")
    if row.get("à"):
        evidence["a_object"].append("top500-final:à")
    if row.get("de"):
        evidence["de_object"].append("top500-final:de")
    if row.get("COD+à"):
        evidence["combo_a"].append("top500-final:COD+à")

    for pattern in core_rows.get(verb, []):
        family = pattern_type_to_family(pattern.get("pattern_type", ""))
        if family:
            descriptor = str(pattern.get("pattern") or pattern.get("pattern_id") or family).strip()
            evidence[family].append(f"core:{descriptor}")

    return {
        "families": [family for family in SUPPORTED_FAMILIES if evidence[family]],
        "evidence": evidence,
    }


def verb_metadata_map() -> dict[str, dict]:
    return {str(row.get("infinitive", "")).strip(): row for row in load_verbs() if row.get("infinitive")}


def build_family_plan_input(category: dict, verb_map: dict[str, dict], family_rows: dict[str, dict], core_rows: dict[str, list[dict]]) -> list[dict]:
    payload = []
    for verb in category["verbs"]:
        meta = verb_map.get(verb) or {}
        evidence = family_evidence_for_verb(verb, family_rows, core_rows)
        payload.append(
            {
                "verb": verb,
                "translation": str(meta.get("translation", "")).strip(),
                "hint": str(meta.get("hint", "")).strip(),
                "frequency": str(meta.get("frequency", "")).strip(),
                "evidence_families": evidence["families"],
                "evidence_notes": {family: evidence["evidence"][family] for family in SUPPORTED_FAMILIES if evidence["evidence"][family]},
            }
        )
    return payload


def family_plan_system_prompt() -> str:
    return """You are planning French learner-facing verb-behavior cards.

Choose 1 or 2 core families per verb from exactly:
- direct_object
- a_object
- de_object
- combo_a

Rules:
- We are building a category-specific deck, not a dictionary.
- Use standard modern French, learner-facing, non-literary usage.
- Prefer safer core families over clever or marginal ones.
- If the evidence already supports a family, keep it unless it is clearly not suitable for this category.
- You may add one obvious missing family if it is clearly natural and central in this category.
- Never choose more than 2 families.
- Always return at least 1 family per verb.
- Do not use infinitive-only or clause families here.
- For polysemous verbs, prefer the sense that fits the category.
"""


def family_plan_user_prompt(category: dict, verbs_payload: list[dict]) -> str:
    return (
        f"Category: {category['name']}\n"
        f"Scope: {category['scope']}\n\n"
        "Return JSON with `rows`, one per verb, in the same order.\n"
        "Each row must contain: `verb`, `families`, `reason`.\n\n"
        f"Verb payload:\n{json.dumps(verbs_payload, ensure_ascii=False, indent=2)}"
    )


def generate_rows_system_prompt() -> str:
    return """You write French learner-facing frame cards.

Return one row per requested family.

Hard rules:
- Present tense only.
- The sentence must be natural, modern, correct French.
- The context must clearly fit the requested category.
- Keep surrounding vocabulary visible and simple.
- Prefer category-natural school/study nouns such as `le français`, `la grammaire`, `un chapitre`, `un texte`, `un exercice`, `une règle`, `une méthode`, `un calcul`, `une rédaction`, `la classe`, `les élèves`.
- Avoid generic-but-awkward pairings like `apprendre une leçon à la classe` or `enseigner une leçon`.
- No literary phrasing, no idioms, no trick examples.
- `question` must contain `____` gaps.
- The number of `____` gaps must equal the number of tokens in `answer`.
- Filling the gaps in order with the answer tokens must reconstruct `full_answer`.
- `meaning_en` must translate the full French sentence, not the bare dictionary gloss.
- Keep the visible context short enough for a drill card.
- Use only the requested family.

Family-specific rules:
- direct_object: hide only the conjugated verb, not the object.
- a_object: hide the conjugated verb and the `à` surface, not the complement noun phrase.
- de_object: hide the conjugated verb and the `de` surface, not the complement noun phrase.
- combo_a: keep the direct object visible between the gaps, and hide only the conjugated verb plus the `à` surface.

Examples:
- direct_object: `Le professeur ____ la règle` -> `explique`
- a_object: `J'____ ____ mon prof` -> `écris à`
- de_object: `L'élève ____ ____ ses notes` -> `dépend de`
- combo_a: `Le professeur ____ une règle ____ la classe` -> `explique à`
"""


def generate_rows_user_prompt(category: dict, verb_entry: dict, families: list[str]) -> str:
    return (
        f"Category: {category['name']}\n"
        f"Scope: {category['scope']}\n"
        f"Verb: {verb_entry['verb']}\n"
        f"English gloss: {verb_entry.get('translation', '')}\n"
        f"Hint: {verb_entry.get('hint', '')}\n"
        f"Requested families: {families}\n\n"
        "Return JSON with:\n"
        "- verb\n"
        "- rows: array with one row per requested family\n\n"
        "Each row must contain:\n"
        "- family\n"
        "- question\n"
        "- answer\n"
        "- full_answer\n"
        "- meaning_en (full sentence translation)\n"
        "- note\n"
    )


def repair_rows_user_prompt(category: dict, verb_entry: dict, failed_rows: list[dict]) -> str:
    return (
        f"Category: {category['name']}\n"
        f"Scope: {category['scope']}\n"
        f"Verb: {verb_entry['verb']}\n"
        f"English gloss: {verb_entry.get('translation', '')}\n"
        f"Hint: {verb_entry.get('hint', '')}\n\n"
        "Repair only the failed families below. Keep any family not listed out of the response.\n"
        "Return JSON with:\n"
        "- verb\n"
        "- rows: repaired array\n\n"
        f"Failed families and reasons:\n{json.dumps(failed_rows, ensure_ascii=False, indent=2)}"
    )


def judge_system_prompt() -> str:
    return """You are judging French learner-facing frame cards.

Accept only if all of these are true:
- full_answer is grammatical and natural modern French
- the requested family matches the sentence
- the category fit is plausible
- the noun choices sound like something a teacher/student would naturally say in this category
- the visible context is simple and learner-facing
- the card tests verb behavior cleanly rather than hiding random vocabulary
- the example is not tricky, idiomatic, or misleading
- the English meaning translates the full sentence, not just the lemma

Be strict.
"""


def judge_user_prompt(category: dict, verb: str, row: dict) -> str:
    return (
        f"Category: {category['name']}\n"
        f"Scope: {category['scope']}\n"
        f"Verb: {verb}\n"
        f"Family: {row['family']}\n"
        f"Question: {row['question']}\n"
        f"Answer: {row['answer']}\n"
        f"Full answer: {row['full_answer']}\n"
        f"English meaning: {row['meaning_en']}\n\n"
        "Return JSON with:\n"
        "- accept: boolean\n"
        "- reason: short string"
    )


def call_parse(client: OpenAI, model: str, response_format, system_prompt: str, user_prompt: str):
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


def normalize_question(value: str) -> str:
    question = normalize_text(value)
    question = re.sub(r"_+", "____", question)
    return question


def row_validation_issues(
    verb: str,
    family: str,
    question: str,
    answer: str,
    full_answer: str,
    present_tenses: dict[str, dict[str, dict[str, str]]],
) -> list[str]:
    issues: list[str] = []
    normalized_question = normalize_question(question)
    normalized_answer = normalize_text(answer)
    normalized_full_answer = normalize_sentence(full_answer)

    gap_count = normalized_question.count("____")
    answer_tokens = normalized_answer.split()
    if gap_count != len(answer_tokens):
        issues.append("gap_mismatch")

    try:
        rebuilt = normalize_sentence(fill_question(normalized_question, normalized_answer))
    except ValueError:
        rebuilt = ""
        issues.append("fill_error")
    else:
        if rebuilt != normalized_full_answer:
            issues.append("full_answer_mismatch")

    if len(normalized_full_answer.split()) > 10:
        issues.append("long_context")
    if NOISY_WORD_RE.search(normalized_full_answer):
        issues.append("noisy_context")
    if not normalized_full_answer:
        issues.append("missing_full_answer")
    if not normalized_answer:
        issues.append("missing_answer")
    if not normalized_question:
        issues.append("missing_question")
    if normalize_text(answer).lower().startswith("to "):
        issues.append("answer_should_not_be_english")
    if normalize_text(full_answer).lower().startswith("to "):
        issues.append("full_answer_should_not_be_english")
    if normalize_text(question).lower().startswith("to "):
        issues.append("question_should_not_be_english")

    valid_answer_forms = answer_stems_for_validation(verb, present_tenses)
    if answer_tokens:
        if answer_tokens[0] not in valid_answer_forms:
            issues.append("verb_form_not_in_present_table")
    else:
        issues.append("empty_answer_tokens")

    prep_tokens = [token for token in answer_tokens[1:] if token in PREP_SURFACES_A | PREP_SURFACES_DE]
    if family == "direct_object":
        if gap_count != 1:
            issues.append("direct_should_have_one_gap")
        if prep_tokens:
            issues.append("direct_should_not_hide_prep")
    elif family == "a_object":
        if not any(token in PREP_SURFACES_A for token in answer_tokens[1:]):
            issues.append("missing_a_surface")
    elif family == "de_object":
        if not any(token in PREP_SURFACES_DE for token in answer_tokens[1:]):
            issues.append("missing_de_surface")
    elif family == "combo_a":
        if gap_count < 2:
            issues.append("combo_a_needs_two_gaps")
        if not any(token in PREP_SURFACES_A for token in answer_tokens[1:]):
            issues.append("combo_a_missing_a_surface")
        question_parts = normalized_question.split("____")
        middle_visible = "".join(question_parts[1:-1]).strip()
        if not middle_visible:
            issues.append("combo_a_should_keep_object_visible")

    return issues


def build_card_record(category: dict, verb: str, row: GeneratedCardRow, index: int, model: str) -> dict:
    return {
        "frame_id": f"{slugify(verb)}_{row.family}_{index:02d}",
        "verb": verb,
        "type": "frame",
        "tense": "present",
        "question": normalize_question(row.question),
        "answer": normalize_text(row.answer),
        "full_answer": normalize_sentence(row.full_answer),
        "frame_type": row.family,
        "source": f"a_de:e2e:{model}",
        "meaning_en": normalize_text(row.meaning_en),
        "category_id": category["id"],
        "category_name": category["name"],
        "note": normalize_text(row.note),
    }


def meaning_validation_issues(meaning_en: str, full_answer: str) -> list[str]:
    issues: list[str] = []
    meaning = normalize_text(meaning_en)
    if not meaning:
        issues.append("missing_meaning_en")
    elif meaning.lower().startswith("to ") and len(normalize_sentence(full_answer).split()) > 2:
        issues.append("meaning_en_not_sentence")
    return issues


def write_json(path: Path, data) -> None:
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def write_js(path: Path, data) -> None:
    payload = "window.verbFrames = " + json.dumps(data, ensure_ascii=False, indent=2) + ";\n"
    path.write_text(payload, encoding="utf-8")


def plan_families(
    client: OpenAI,
    model: str,
    category: dict,
    payload: list[dict],
) -> list[dict]:
    parsed: FamilyPlanResponse = call_parse(
        client,
        model,
        FamilyPlanResponse,
        family_plan_system_prompt(),
        family_plan_user_prompt(category, payload),
    )
    planned = []
    by_verb = {row.verb: row for row in parsed.rows}
    for item in payload:
        row = by_verb.get(item["verb"])
        families = [family for family in (row.families if row else []) if family in SUPPORTED_FAMILIES]
        if not families:
            if item["evidence_families"]:
                families = list(item["evidence_families"])[:2]
            else:
                families = ["direct_object"]
        families = sorted(dict.fromkeys(families), key=lambda family: FAMILY_PRIORITY[family])
        planned.append(
            {
                **item,
                "planned_families": families[:2],
                "planner_reason": normalize_text(row.reason if row else ""),
            }
        )
    return planned


def generate_cards_for_verb(
    client: OpenAI,
    model: str,
    judge_model: str,
    category: dict,
    verb_entry: dict,
    present_tenses: dict[str, dict[str, dict[str, str]]],
) -> tuple[list[dict], list[dict]]:
    def evaluate_rows(requested_families: list[str], rows_by_family: dict[str, GeneratedCardRow]) -> tuple[list[dict], list[dict]]:
        accepted_rows: list[dict] = []
        failed_rows: list[dict] = []
        for index, family in enumerate(requested_families, start=1):
            row = rows_by_family.get(family)
            if row is None:
                failed_rows.append({"family": family, "reason": "missing_family_from_model_output"})
                continue

            issues = row_validation_issues(
                verb_entry["verb"],
                family,
                row.question,
                row.answer,
                row.full_answer,
                present_tenses,
            )
            issues.extend(meaning_validation_issues(row.meaning_en, row.full_answer))
            if issues:
                failed_rows.append({"family": family, "reason": ", ".join(sorted(dict.fromkeys(issues)))})
                continue

            judge: JudgeResponse = call_parse(
                client,
                judge_model,
                JudgeResponse,
                judge_system_prompt(),
                judge_user_prompt(
                    category,
                    verb_entry["verb"],
                    {
                        "family": family,
                        "question": normalize_question(row.question),
                        "answer": normalize_text(row.answer),
                        "full_answer": normalize_sentence(row.full_answer),
                        "meaning_en": normalize_text(row.meaning_en),
                    },
                ),
            )
            if not judge.accept:
                failed_rows.append({"family": family, "reason": normalize_text(judge.reason)})
                continue

            accepted_rows.append(build_card_record(category, verb_entry["verb"], row, index, model))
        return accepted_rows, failed_rows

    parsed: GeneratedVerbResponse = call_parse(
        client,
        model,
        GeneratedVerbResponse,
        generate_rows_system_prompt(),
        generate_rows_user_prompt(category, verb_entry, verb_entry["planned_families"]),
    )
    accepted, failed = evaluate_rows(verb_entry["planned_families"], {row.family: row for row in parsed.rows})

    if failed:
        repair_requested = [row["family"] for row in failed]
        repaired: GeneratedVerbResponse = call_parse(
            client,
            model,
            GeneratedVerbResponse,
            generate_rows_system_prompt(),
            repair_rows_user_prompt(category, verb_entry, failed),
        )
        repaired_accepted, repaired_failed = evaluate_rows(repair_requested, {row.family: row for row in repaired.rows})
        kept_families = {row["frame_type"] for row in accepted}
        accepted.extend([row for row in repaired_accepted if row["frame_type"] not in kept_families])
        failed = repaired_failed

    rejected = [
        {"verb": verb_entry["verb"], "family": row["family"], "reason": row["reason"]}
        for row in failed
    ]
    return accepted, rejected


def write_report(
    category: dict,
    planned: list[dict],
    cards: list[dict],
    rejected: list[dict],
    output_path: Path,
) -> None:
    cards_by_verb: dict[str, list[dict]] = {}
    for card in cards:
        cards_by_verb.setdefault(card["verb"], []).append(card)

    lines = [
        f"# {category['name']} Frame Deck",
        "",
        f"- Category id: `{category['id']}`",
        f"- Scope: `{category['scope']}`",
        f"- Verbs planned: `{len(planned)}`",
        f"- Accepted cards: `{len(cards)}`",
        f"- Rejected rows: `{len(rejected)}`",
        "",
        "## Family Inventory",
        "",
    ]
    for item in planned:
        labels = ", ".join(FAMILY_LABELS[family] for family in item["planned_families"])
        lines.append(f"- `{item['verb']}`: {labels} — {item.get('planner_reason', '')}".rstrip())

    lines.extend(["", "## Accepted Cards", ""])
    for verb in category["verbs"]:
        rows = cards_by_verb.get(verb, [])
        if not rows:
            lines.append(f"- `{verb}`: none accepted")
            continue
        for row in rows:
            lines.append(
                f"- `{verb}` `{row['frame_type']}`: `{row['question']}` -> `{row['answer']}` :: `{row['full_answer']}`"
            )

    lines.extend(["", "## Rejected Rows", ""])
    if rejected:
        for row in rejected:
            lines.append(f"- `{row['verb']}` `{row['family']}`: {row['reason']}")
    else:
        lines.append("- None")

    output_path.write_text("\n".join(lines).rstrip() + "\n", encoding="utf-8")


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Generate one-category A/De frame cards.")
    parser.add_argument("--category-id", default=DEFAULT_CATEGORY_ID)
    parser.add_argument("--model", default=DEFAULT_MODEL)
    parser.add_argument("--judge-model", default=DEFAULT_JUDGE_MODEL)
    parser.add_argument("--max-verbs", type=int)
    parser.add_argument("--output-json")
    parser.add_argument("--output-js")
    parser.add_argument("--output-report")
    parser.add_argument("--output-family-json")
    return parser


def main() -> None:
    args = build_parser().parse_args()
    ensure_openai()

    category = load_category_spec(args.category_id)
    if args.max_verbs:
        category = {**category, "verbs": category["verbs"][: args.max_verbs]}
    stem = category_output_stem(category["id"])
    output_json = Path(args.output_json) if args.output_json else ROOT / f"verb_frames.{stem}.generated.json"
    output_js = Path(args.output_js) if args.output_js else ROOT / f"verb_frames.{stem}.js"
    output_report = Path(args.output_report) if args.output_report else ROOT / f"verb_frames.{stem}.report.md"
    output_family_json = Path(args.output_family_json) if args.output_family_json else ROOT / f"verb_frames.{stem}.family_inventory.json"

    verb_map = verb_metadata_map()
    family_rows = load_family_rows()
    core_rows = load_core_pattern_rows()
    family_plan_input = build_family_plan_input(category, verb_map, family_rows, core_rows)
    present_tenses = load_tenses()

    client = OpenAI()
    planned = plan_families(client, args.model, category, family_plan_input)

    cards: list[dict] = []
    rejected: list[dict] = []
    for verb_entry in planned:
        accepted_rows, rejected_rows = generate_cards_for_verb(
            client,
            args.model,
            args.judge_model,
            category,
            verb_entry,
            present_tenses,
        )
        cards.extend(accepted_rows)
        rejected.extend(rejected_rows)

    cards.sort(key=lambda row: (category["verbs"].index(row["verb"]), FAMILY_PRIORITY.get(row["frame_type"], 99), row["frame_id"]))

    write_json(output_family_json, planned)
    write_json(output_json, cards)
    write_js(output_js, cards)
    write_report(category, planned, cards, rejected, output_report)

    print(f"Generated {len(cards)} cards for {len(category['verbs'])} verbs in {category['name']}.")


if __name__ == "__main__":
    main()
