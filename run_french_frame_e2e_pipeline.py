#!/usr/bin/env python3
"""
Run an incremental end-to-end French frame pipeline per verb.

Pipeline per verb:
1. Generate candidate rows with a strong prompt.
2. Apply deterministic validation.
3. Run Stanza structural checks.
4. Run a local Ollama judge on the harder `a_object` / `de_object` rows.
5. Accept/reject rows and immediately refresh the source-side app deck.

This script is designed for long runs where we want to inspect real accepted
rows as they land, starting with challenging verbs first.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
import time
from collections import Counter
from datetime import datetime
from pathlib import Path
from typing import Literal
from urllib import error, request

from pydantic import BaseModel, Field

from audit_ai_frame_cards_stanza import (
    DEFAULT_STANZA_DIR,
    build_nlp,
    children_of,
    find_main_finite_verb,
    flag_card,
    parse_sentence,
)
from frame_cards_lib import (
    LEMMA_ALIAS,
    OUTPUT_JS,
    OUTPUT_JSON,
    REVIEW_MD,
    VERBS_JS,
    forms_for_validation,
    load_core_pattern_index,
    load_js_array,
    load_present_tenses,
    load_rollout_verbs,
    load_usage_index,
    normalize_pattern_text,
    split_subject_and_answer,
    slugify,
    write_js,
    write_json,
)
from integrate_ai_frame_run import normalize_ai_candidate

try:
    from openai import OpenAI
except ImportError:
    OpenAI = None


ROOT = Path(__file__).parent
OUT_ROOT = ROOT / "_ai_frame_runs"
RUN_PREFIX = "frame_e2e"
ROLLOUT_TIERS = {"top20", "top50", "top100", "top500"}
TARGET_FAMILIES = ("direct_object", "a_object", "de_object")
PREP_SURFACES_A = {"à", "au", "aux", "à la", "à l'"}
PREP_SURFACES_DE = {"de", "du", "des", "de la", "de l'", "d'"}
SUBJECT_PREFIX_RE = re.compile(r"^(?:j'|je |tu |il |elle |on |nous |vous |ils |elles )", re.IGNORECASE)
CLITIC_PREFIX_RE = re.compile(r"^(?:(?:m|t|s|l)'|me |te |se |nous |vous |le |la |les |lui |leur |y |en )+", re.IGNORECASE)
DIRECT_OBJECT_CLITIC_RE = re.compile(r"^(?:l'|le |la |les )", re.IGNORECASE)
AI_SOURCE_PREFIX = "ai:e2e:"
CHALLENGING_VERBS = (
    "penser",
    "répondre",
    "servir",
    "parler",
    "dépendre",
    "rêver",
    "renoncer",
    "ressembler",
    "tenir",
    "apprendre",
    "arrêter",
    "continuer",
    "commencer",
    "permettre",
    "empêcher",
    "demander",
    "proposer",
    "refuser",
    "aider",
    "oublier",
    "souvenir",
)
QUARANTINED_VERBS = {"approprier", "carter", "coter", "crémer", "douer", "enculer", "souvenir"}
FRAME_PRIORITY = {"a_object": 3, "de_object": 3, "direct_object": 1}
A_SURFACE_RE = re.compile(r"\b(?:à|au|aux)\b|à la\b|à l'", re.IGNORECASE)
INITIAL_JE_VOWEL_RE = re.compile(r"^Je ([AEIOUÀÂÄÆÉÈÊËÎÏÔŒÖÙÛÜaeiouàâäæéèêëîïôœöùûü])")
INITIAL_JE_MUTE_H_RE = re.compile(r"^Je (habill\w*)", re.IGNORECASE)
SOURCE_PRIORITY = {"manual:": 5, "usage:": 4, "ai:": 3, "fallback:": 2}


class PairGenerationRow(BaseModel):
    family: Literal["direct_object", "a_object", "de_object"]
    legal: bool
    sentence_np_fr: str = ""
    sentence_pronoun_fr: str = ""
    meaning_en: str = ""
    hidden_chunk_np: str = ""
    hidden_chunk_pronoun: str = ""
    conjugated_form: str = ""
    attached_preposition: str = ""
    note: str = ""


class VerbPairGenerationResponse(BaseModel):
    verb: str
    rows: list[PairGenerationRow] = Field(default_factory=list)


class JudgeResponse(BaseModel):
    label: Literal[
        "selected_complement",
        "location_adjunct",
        "time_adjunct",
        "manner_adjunct",
        "fixed_expression",
        "uncertain",
    ]
    reason: str = ""


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Run the French frame E2E pipeline per verb.")
    parser.add_argument("--generator-model", default="gpt-5.4-mini", help="OpenAI generator model.")
    parser.add_argument("--judge-provider", choices=["openai", "ollama"], default="openai", help="Judge backend to use.")
    parser.add_argument("--judge-model", default="gemma3:4b", help="Local Ollama judge model.")
    parser.add_argument("--judge-openai-model", default="gpt-5.4-mini", help="OpenAI model to use as the fallback judge.")
    parser.add_argument("--ollama-url", default="http://127.0.0.1:11434/api/chat", help="Local Ollama chat endpoint.")
    parser.add_argument("--reasoning-effort", choices=["low", "medium", "high", "xhigh"])
    parser.add_argument("--tier", action="append", dest="tiers", help="Optional frequency tier filter.")
    parser.add_argument("--verb", action="append", dest="verbs", help="Explicit verb to run. Repeat to pass several.")
    parser.add_argument("--max-verbs", type=int, help="Optional cap for testing.")
    parser.add_argument("--resume", action="store_true", help="Resume from an existing output dir.")
    parser.add_argument("--output-dir", help="Optional existing or new output dir.")
    parser.add_argument("--sleep-seconds", type=float, default=0.35)
    parser.add_argument("--stanza-dir", default=str(DEFAULT_STANZA_DIR), help="Path to local Stanza resources dir.")
    parser.add_argument("--no-integrate", action="store_true", help="Do not refresh verb_frames.* during the run.")
    return parser


def ensure_openai() -> None:
    if not os.environ.get("OPENAI_API_KEY"):
        sys.exit("OPENAI_API_KEY is not set in the environment.")
    if OpenAI is None:
        sys.exit("openai package is not installed.")


def normalize_text(value: str) -> str:
    text = str(value or "").strip()
    text = text.replace("\u2019", "'").replace("\u2018", "'").replace("\u02bc", "'")
    text = re.sub(r"\s+", " ", text)
    text = re.sub(r"\s+([,;:!?])", r"\1", text)
    return text.strip()


def normalize_sentence(value: str) -> str:
    text = normalize_text(value)
    return re.sub(r"[.?!]+$", "", text).strip()


def fix_initial_elision(sentence: str) -> str:
    text = normalize_sentence(sentence)
    text = INITIAL_JE_VOWEL_RE.sub(r"J'\1", text)
    return INITIAL_JE_MUTE_H_RE.sub(r"J'\1", text)


def source_priority(source: str) -> int:
    for prefix, priority in SOURCE_PRIORITY.items():
        if source.startswith(prefix):
            return priority
    return 1


def read_json(path: Path, fallback):
    if not path.exists():
        return fallback
    return json.loads(path.read_text(encoding="utf-8"))


def load_all_verbs() -> list[dict]:
    verbs = load_js_array(VERBS_JS, "const verbs =")
    return [verb for verb in verbs if verb.get("infinitive")]


def reorder_challenging_first(verbs: list[dict]) -> list[dict]:
    priority = {verb: index for index, verb in enumerate(CHALLENGING_VERBS)}

    def key(entry: dict) -> tuple[int, int, str]:
        infinitive = str(entry.get("infinitive", ""))
        return (0 if infinitive in priority else 1, priority.get(infinitive, 9999), infinitive)

    return sorted(verbs, key=key)


def select_target_verbs(args: argparse.Namespace) -> list[dict]:
    all_verbs = load_all_verbs()
    by_infinitive = {verb["infinitive"]: verb for verb in all_verbs}

    if args.verbs:
        requested = [verb.strip() for verb in args.verbs if verb and verb.strip()]
        missing = [verb for verb in requested if verb not in by_infinitive]
        if missing:
            sys.exit(f"Verb not found: {', '.join(missing)}")
        target = [by_infinitive[verb] for verb in requested]
    else:
        tiers = set(args.tiers or list(ROLLOUT_TIERS))
        target = [verb for verb in load_rollout_verbs() if verb.get("frequency") in tiers]
        target = reorder_challenging_first(target)

    if args.max_verbs:
        target = target[: args.max_verbs]
    return target


def default_output_dir() -> Path:
    stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    return OUT_ROOT / f"{RUN_PREFIX}_{stamp}"


def load_or_init_output_dir(args: argparse.Namespace) -> Path:
    output_dir = Path(args.output_dir).expanduser().resolve() if args.output_dir else default_output_dir()
    config_path = output_dir / "run_config.json"

    if args.resume:
        if not output_dir.exists() or not config_path.exists():
            sys.exit("--resume requires an existing --output-dir with run_config.json")
        return output_dir

    output_dir.mkdir(parents=True, exist_ok=True)
    config = {
        "created_at": datetime.now().isoformat(),
        "generator_model": args.generator_model,
        "judge_model": args.judge_model,
        "reasoning_effort": args.reasoning_effort or "",
        "tiers": args.tiers or [],
        "verbs": args.verbs or [],
        "max_verbs": args.max_verbs or 0,
        "sleep_seconds": args.sleep_seconds,
        "stanza_dir": args.stanza_dir,
        "integrate": not args.no_integrate,
    }
    write_json(config_path, config)
    return output_dir


def response_path(output_dir: Path, verb: str) -> Path:
    return output_dir / "per_verb" / f"{slugify(verb)}.json"


def write_local_json(path: Path, data) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def summarize_core_patterns(core_patterns: list[dict]) -> list[str]:
    lines = []
    for item in core_patterns[:8]:
        pattern = normalize_pattern_text(item.get("pattern", ""))
        if not pattern:
            continue
        meaning = normalize_text(item.get("meaning_en", ""))
        lines.append(f"- {pattern} = {meaning}")
    return lines


def summarize_usage_examples(usage_examples: list[dict]) -> list[str]:
    lines = []
    for item in usage_examples[:8]:
        pattern = normalize_pattern_text(item.get("pattern", ""))
        example = normalize_sentence(item.get("example_fr", ""))
        meaning = normalize_text(item.get("meaning_en", ""))
        if not example:
            continue
        lines.append(f"- {pattern} | {example} | {meaning}")
    return lines


def system_prompt() -> str:
    return """You are generating high-trust learner-facing French verb-complement sentences for a serious language app.

We care about one thing:
- whether the verb's meaning/pattern genuinely depends on `à` or `de`

We do NOT want:
- location add-ons
- time add-ons
- manner add-ons
- contextual add-ons
- frozen expressions / idioms
- dictionary-ish or weird French

Bad examples for this task:
- `Je travaille à Paris.`
- `Je mange à midi.`
- `Je vois un film au cinéma.`
- `Je garde cela à l'esprit.`

Good examples for this task:
- `Je pense à ce projet.` -> `J'y pense.`
- `Je réponds à Marie.` -> `Je lui réponds.`
- `Je me souviens de ce film.` -> `Je m'en souviens.`
- `Ce couteau sert à couper le pain.` is useful only as an infinitive complement, not as an `a_object` row.

Return exactly one row for each requested family:
- `direct_object`
- `a_object`
- `de_object`

For `a_object` and `de_object`, return TWO matched sentences when legal:
1. a noun-phrase version
2. a natural pronominalized version of the same construction

Rules for `a_object`:
- Only if `à` is a core complement selected by the verb.
- Use a noun-phrase complement for this pass, not an infinitive complement.
- The noun-phrase version should use a noun phrase or proper noun, not `lui/leur/y`.
- Prefer thing/idea complements when that gives a clean natural `y` pronoun version.
- Use person complements only when that is the real core pattern of the verb.
- The pronoun version should use the most natural French form: often `y`, sometimes `lui/leur`, and sometimes `à lui / à elle / à eux / à elles`.
- Do not use destination, place, workplace, city, time, or manner readings unless they are truly the verb's core complementation pattern.

Rules for `de_object`:
- Only if `de` is a core complement selected by the verb.
- Use a noun-phrase complement for this pass, not an infinitive complement.
- The noun-phrase version should use a noun phrase, not `en`.
- The pronoun version should naturally use `en` or `de lui / d'elle / d'eux / d'elles` as appropriate.
- Do not use fixed formulas that happen to contain `de`.

Rules for `direct_object`:
- Only if a short natural direct-object sentence is clearly legal and useful.
- Do not use preverbal direct-object clitics like `le`, `la`, `l'`, `les`.
- Use an overt object noun phrase in the sentence.
- No pronoun pair is needed.

Blanking rules:
- `direct_object`: hidden chunk is usually just the conjugated verb.
- `a_object`: hidden NP chunk should usually be `verb + à-surface`, like `pense à`, `répond à`, `parle à`.
- `de_object`: hidden NP chunk should usually be `verb + de-surface`, like `parle de`, `sort du`, `rêve d'`, `se souvient de`.
- The hidden chunk must be contiguous and must exclude the subject pronoun.

Quality rules:
- Present tense only.
- Use a subject pronoun.
- Keep the sentences short, ordinary, and learner-friendly.
- Prefer different subject pronouns across rows when natural.
- If a family is not genuinely useful for this task, mark `legal=false`.
- If you are unsure whether the `à/de` phrase is a core complement or just an adjunct, mark `legal=false`.

Return JSON only.
"""


def user_prompt(verb_entry: dict, core_patterns: list[dict], usage_examples: list[dict]) -> str:
    infinitive = str(verb_entry["infinitive"]).strip()
    translation = normalize_text(verb_entry.get("translation", ""))
    hint = normalize_text(verb_entry.get("hint", ""))
    frequency = normalize_text(verb_entry.get("frequency", ""))
    pattern_lines = summarize_core_patterns(core_patterns)
    usage_lines = summarize_usage_examples(usage_examples)
    evidence_patterns = "\n".join(pattern_lines) if pattern_lines else "- none"
    evidence_usages = "\n".join(usage_lines) if usage_lines else "- none"

    return f"""Verb: {infinitive}
Translation: {translation or "(none)"}
Hint: {hint or "(none)"}
Frequency tier: {frequency or "(unknown)"}

Existing core-pattern evidence:
{evidence_patterns}

Existing usage evidence:
{evidence_usages}

Return JSON with:
- verb
- rows: array of 3 objects, one per family

Each row must contain:
- family
- legal
- sentence_np_fr
- sentence_pronoun_fr
- meaning_en
- hidden_chunk_np
- hidden_chunk_pronoun
- conjugated_form
- attached_preposition
- note

Important:
- `sentence_np_fr` must be a full natural sentence.
- For `a_object` and `de_object`, `sentence_pronoun_fr` must be the natural pronoun version of the same construction.
- Prefer complements whose pronoun version is clean and idiomatic.
- `hidden_chunk_np` must occur exactly once as a contiguous substring of `sentence_np_fr`.
- `hidden_chunk_np` must exclude the subject pronoun.
- `hidden_chunk_pronoun` should be filled only for `a_object` / `de_object`.
- `conjugated_form` must be the finite present-tense verb core inside the hidden chunk, without subject pronoun.
  Example: `Je m'intéresse à la musique` -> `hidden_chunk_np = "m'intéresse à"` and `conjugated_form = "intéresse"`.
- `attached_preposition` is:
  - empty for `direct_object`
  - the exact hidden surface for `a_object` / `de_object`
    Examples: `à`, `au`, `aux`, `à la`, `à l'`, `de`, `du`, `des`, `de la`, `de l'`, `d'`
- For `direct_object`, do not use preverbal object clitics.
- For `a_object`, do not return destination/place/time/manner uses.
- For `a_object` and `de_object`, do not return infinitive complements in this pass.
- For `de_object`, do not return formulas or idioms that are not teaching the verb's core `de` complementation.
"""


def call_generator(
    client: OpenAI,
    model: str,
    verb_entry: dict,
    core_patterns: list[dict],
    usage_examples: list[dict],
    reasoning_effort: str | None,
) -> dict:
    kwargs = {
        "model": model,
        "response_format": VerbPairGenerationResponse,
        "messages": [
            {"role": "system", "content": system_prompt()},
            {"role": "user", "content": user_prompt(verb_entry, core_patterns, usage_examples)},
        ],
    }
    if reasoning_effort:
        kwargs["reasoning_effort"] = reasoning_effort
    completion = client.chat.completions.parse(**kwargs)
    message = completion.choices[0].message
    if not message.parsed:
        raise RuntimeError("Structured output parsing failed.")
    return message.parsed.model_dump()


def validate_pronoun_sentence(family: str, sentence: str) -> list[str]:
    issues: list[str] = []
    lowered = sentence.lower()
    if family == "a_object":
        if not re.search(r"\b(lui|leur|y)\b|à (lui|elle|eux|elles)\b|à l['’]elle\b", lowered):
            issues.append("missing_a_pronoun_variant")
    elif family == "de_object":
        if not re.search(r"\b(en)\b|d['’](elle|elles|eux)|de (lui|elle|eux|elles)", lowered):
            issues.append("missing_de_pronoun_variant")
    return issues


def validate_row(
    verb: str,
    row: dict,
    present_tenses: dict[str, dict[str, str]],
) -> tuple[bool, list[str], dict]:
    family = row.get("family", "")
    normalized = {
        "family": family,
        "legal": bool(row.get("legal")),
        "sentence_np_fr": normalize_sentence(row.get("sentence_np_fr", "")),
        "sentence_pronoun_fr": normalize_sentence(row.get("sentence_pronoun_fr", "")),
        "meaning_en": normalize_text(row.get("meaning_en", "")),
        "hidden_chunk_np": normalize_text(row.get("hidden_chunk_np", "")),
        "hidden_chunk_pronoun": normalize_text(row.get("hidden_chunk_pronoun", "")),
        "conjugated_form": normalize_text(row.get("conjugated_form", "")),
        "attached_preposition": normalize_text(row.get("attached_preposition", "")),
        "note": normalize_text(row.get("note", "")),
    }

    if not normalized["legal"]:
        normalized.update(
            {
                "sentence_np_fr": "",
                "sentence_pronoun_fr": "",
                "meaning_en": "",
                "hidden_chunk_np": "",
                "hidden_chunk_pronoun": "",
                "conjugated_form": "",
                "attached_preposition": "",
            }
        )
        return True, [], normalized

    issues: list[str] = []
    for field in ("sentence_np_fr", "meaning_en", "hidden_chunk_np", "conjugated_form"):
        if not normalized[field]:
            issues.append(f"missing_{field}")

    if family in {"a_object", "de_object"}:
        for field in ("sentence_pronoun_fr", "hidden_chunk_pronoun", "attached_preposition"):
            if not normalized[field]:
                issues.append(f"missing_{field}")

    sentence = normalized["sentence_np_fr"]
    hidden_chunk = normalized["hidden_chunk_np"]
    conjugated_form = normalized["conjugated_form"]
    prep = normalized["attached_preposition"]

    if sentence and hidden_chunk and sentence.count(hidden_chunk) != 1:
        issues.append("hidden_chunk_not_unique")
    if hidden_chunk and conjugated_form and conjugated_form not in hidden_chunk:
        issues.append("conjugated_form_not_in_hidden_chunk")
    if sentence and hidden_chunk and hidden_chunk not in sentence:
        issues.append("hidden_chunk_not_in_sentence")
    if hidden_chunk and re.search(r"\b(?:pas|jamais|plus|souvent|toujours|encore|vite|trop)\b", hidden_chunk, flags=re.IGNORECASE):
        issues.append("noisy_hidden_chunk")
    if hidden_chunk and SUBJECT_PREFIX_RE.match(hidden_chunk):
        issues.append("hidden_chunk_includes_subject")

    valid_forms = forms_for_validation(verb, present_tenses)
    valid_answer_forms = set()
    for full_form in valid_forms:
        try:
            _, answer_form = split_subject_and_answer(full_form)
        except ValueError:
            answer_form = full_form
        valid_answer_forms.add(answer_form)
    valid_verb_cores = set(valid_answer_forms)
    for answer_form in list(valid_answer_forms):
        stripped = CLITIC_PREFIX_RE.sub("", answer_form).strip()
        if stripped:
            valid_verb_cores.add(stripped)
    if conjugated_form and conjugated_form not in valid_verb_cores:
        issues.append("conjugated_form_not_in_present_table")

    if family == "direct_object":
        if prep:
            issues.append("direct_object_should_not_hide_prep")
        if normalized["sentence_pronoun_fr"] or normalized["hidden_chunk_pronoun"]:
            issues.append("direct_object_should_not_have_pronoun_pair")
        if DIRECT_OBJECT_CLITIC_RE.match(hidden_chunk):
            issues.append("direct_object_starts_with_object_clitic")
        if conjugated_form and hidden_chunk != conjugated_form:
            issues.append("direct_object_should_hide_only_conjugated_form")
    elif family == "a_object":
        if prep not in PREP_SURFACES_A:
            issues.append("bad_a_surface")
    elif family == "de_object":
        if prep not in PREP_SURFACES_DE:
            issues.append("bad_de_surface")

    if family in {"a_object", "de_object"}:
        if prep and prep not in hidden_chunk:
            issues.append("prep_not_in_hidden_chunk")
        issues.extend(validate_pronoun_sentence(family, normalized["sentence_pronoun_fr"]))

    return not issues, sorted(set(issues)), normalized


def normalize_response_payload(
    verb: str,
    raw_response: dict,
    present_tenses: dict[str, dict[str, str]],
) -> dict:
    rows_by_family = {}
    for row in raw_response.get("rows", []):
        family = row.get("family", "")
        if family in TARGET_FAMILIES and family not in rows_by_family:
            valid, issues, normalized = validate_row(verb, row, present_tenses)
            normalized["valid"] = valid
            normalized["issues"] = issues
            rows_by_family[family] = normalized

    rows = []
    for family in TARGET_FAMILIES:
        if family in rows_by_family:
            rows.append(rows_by_family[family])
        else:
            rows.append(
                {
                    "family": family,
                    "legal": False,
                    "sentence_np_fr": "",
                    "sentence_pronoun_fr": "",
                    "meaning_en": "",
                    "hidden_chunk_np": "",
                    "hidden_chunk_pronoun": "",
                    "conjugated_form": "",
                    "attached_preposition": "",
                    "note": "missing_from_model_output",
                    "valid": True,
                    "issues": [],
                }
            )
    return {"verb": verb, "rows": rows}


def build_np_candidate(verb_entry: dict, row: dict, generator_model: str, judge_model: str) -> dict:
    learner_verb = LEMMA_ALIAS.get(verb_entry["infinitive"], verb_entry["infinitive"])
    return {
        "frame_id": f"{slugify(learner_verb)}_e2e_{row['family']}",
        "verb": learner_verb,
        "type": "frame",
        "tense": "present",
        "answer": row["hidden_chunk_np"],
        "full_answer": fix_initial_elision(row["sentence_np_fr"]),
        "frame_type": row["family"],
        "source": f"{AI_SOURCE_PREFIX}{generator_model}:{judge_model}:{row['family']}",
        "meaning_en": row["meaning_en"],
        "conjugated_form": row["conjugated_form"],
        "attached_preposition": row["attached_preposition"],
        "note": row.get("note", ""),
        "pronoun_sentence_fr": fix_initial_elision(row.get("sentence_pronoun_fr", "")),
        "hidden_chunk_pronoun": row.get("hidden_chunk_pronoun", ""),
    }


def call_ollama_judge(ollama_url: str, model: str, candidate: dict, stanza_reasons: list[str]) -> dict:
    prompt = (
        "You are a strict French verb-complement judge.\n"
        "Decide whether the prepositional complement in the NP sentence is a learner-relevant core complement selected by the verb.\n"
        "We want to keep true `verb + à/de` complementation and reject place/time/manner adjuncts, fixed expressions, and infinitive complements for this pass.\n"
        "Also reject the row if the pronoun sentence is not a natural pronominalized counterpart of the NP sentence.\n\n"
        "Return JSON only with keys:\n"
        "- label: selected_complement | location_adjunct | time_adjunct | manner_adjunct | fixed_expression | uncertain\n"
        "- reason: short string\n\n"
        f"Verb: {candidate['verb']}\n"
        f"Family: {candidate['frame_type']}\n"
        f"NP sentence: {candidate['full_answer']}\n"
        f"Pronoun sentence: {candidate.get('pronoun_sentence_fr', '')}\n"
        f"Hidden chunk: {candidate['answer']}\n"
        f"Attached preposition: {candidate.get('attached_preposition', '')}\n"
        f"Stanza warnings: {', '.join(stanza_reasons) if stanza_reasons else 'none'}\n"
    )
    payload = {
        "model": model,
        "stream": False,
        "format": "json",
        "messages": [
            {
                "role": "system",
                "content": "Be conservative. If the sentence is not clearly teaching a core verb-selected complement, do not accept it.",
            },
            {
                "role": "user",
                "content": prompt,
            },
        ],
    }
    data = json.dumps(payload).encode("utf-8")
    req = request.Request(ollama_url, data=data, headers={"Content-Type": "application/json"})
    with request.urlopen(req, timeout=120) as response:
        body = json.loads(response.read().decode("utf-8"))
    content = body.get("message", {}).get("content", "{}")
    parsed = json.loads(content)
    label = normalize_text(parsed.get("label", "uncertain")).lower()
    reason = normalize_text(parsed.get("reason", ""))
    return {"label": label, "reason": reason}


def call_openai_judge(
    client: OpenAI,
    model: str,
    candidate: dict,
    stanza_reasons: list[str],
) -> dict:
    prompt = (
        "Decide whether the prepositional complement in the NP sentence is a learner-relevant core complement selected by the verb.\n"
        "Keep only true verb-governed complementation with `à` or `de`.\n"
        "Reject location, time, manner, fixed expressions, infinitive complements for this pass, and unclear cases.\n"
        "Also reject the row if the pronoun sentence is not a natural pronominalized counterpart of the NP sentence.\n\n"
        f"Verb: {candidate['verb']}\n"
        f"Family: {candidate['frame_type']}\n"
        f"NP sentence: {candidate['full_answer']}\n"
        f"Pronoun sentence: {candidate.get('pronoun_sentence_fr', '')}\n"
        f"Hidden chunk: {candidate['answer']}\n"
        f"Attached preposition: {candidate.get('attached_preposition', '')}\n"
        f"Stanza warnings: {', '.join(stanza_reasons) if stanza_reasons else 'none'}\n"
    )
    completion = client.chat.completions.parse(
        model=model,
        response_format=JudgeResponse,
        messages=[
            {
                "role": "system",
                "content": "Be conservative. If the sentence is not clearly teaching a core verb-selected complement, do not accept it.",
            },
            {
                "role": "user",
                "content": prompt,
            },
        ],
    )
    message = completion.choices[0].message
    if not message.parsed:
        raise RuntimeError("OpenAI judge structured output parsing failed.")
    return {
        "label": normalize_text(message.parsed.label).lower(),
        "reason": normalize_text(message.parsed.reason),
    }


def evaluate_row(
    verb_entry: dict,
    row: dict,
    present_tenses: dict[str, dict[str, str]],
    nlp,
    generator_model: str,
    judge_provider: str,
    judge_model: str,
    judge_openai_model: str,
    ollama_url: str,
    openai_client: OpenAI,
) -> dict:
    evaluation = {
        "family": row["family"],
        "legal": row["legal"],
        "valid": row["valid"],
        "issues": list(row.get("issues", [])),
        "status": "not_legal",
        "candidate": None,
        "stanza_reasons": [],
        "judge_label": "",
        "judge_reason": "",
        "accepted": False,
    }
    if not row["legal"]:
        return evaluation
    if not row["valid"]:
        evaluation["status"] = "rejected_deterministic"
        return evaluation

    candidate = build_np_candidate(verb_entry, row, generator_model, judge_model)
    normalized_candidate, normalize_reject_reason = normalize_ai_candidate(candidate, present_tenses)
    if not normalized_candidate:
        evaluation["status"] = "rejected_integration_normalizer"
        evaluation["issues"].append(normalize_reject_reason)
        return evaluation

    evaluation["candidate"] = normalized_candidate
    if candidate["frame_type"] in {"a_object", "de_object"}:
        stanza_reasons = flag_card(candidate, nlp)
        evaluation["stanza_reasons"] = stanza_reasons
        if stanza_reasons:
            evaluation["status"] = "rejected_stanza"
            return evaluation

        try:
            if judge_provider == "openai":
                judge = call_openai_judge(openai_client, judge_openai_model, candidate, stanza_reasons)
            else:
                judge = call_ollama_judge(ollama_url, judge_model, candidate, stanza_reasons)
        except (error.URLError, TimeoutError, json.JSONDecodeError, RuntimeError) as exc:
            evaluation["status"] = "rejected_judge_unavailable"
            evaluation["judge_reason"] = normalize_text(str(exc))
            return evaluation

        evaluation["judge_label"] = judge["label"]
        evaluation["judge_reason"] = judge["reason"]
        if judge["label"] != "selected_complement":
            evaluation["status"] = "rejected_judge"
            return evaluation

    evaluation["status"] = "accepted"
    evaluation["accepted"] = True
    return evaluation


def build_summary(
    verb_results: list[dict],
    integrated_total: int,
    accepted_cards: list[dict] | None = None,
    cleanup_rejected: Counter[str] | None = None,
) -> str:
    status_counts = Counter()
    family_counts = Counter()
    judge_counts = Counter()
    accepted_list: list[dict] = list(accepted_cards or [])

    for item in verb_results:
        for row in item.get("evaluations", []):
            status_counts[row.get("status", "")] += 1
            if row.get("judge_label"):
                judge_counts[row["judge_label"]] += 1

    if accepted_list:
        family_counts.update(card["frame_type"] for card in accepted_list)
    else:
        for item in verb_results:
            for row in item.get("evaluations", []):
                if row.get("accepted") and row.get("candidate"):
                    family_counts[row["candidate"]["frame_type"]] += 1
                    accepted_list.append(row["candidate"])

    lines = [
        "# French Frame E2E Run",
        "",
        f"- Verbs attempted: `{len(verb_results)}`",
        f"- Accepted cards: `{len(accepted_list)}`",
        f"- App deck total after integration: `{integrated_total}`",
        "",
        "## Status Counts",
        "",
    ]
    if status_counts:
        for status, total in sorted(status_counts.items()):
            lines.append(f"- `{status}`: `{total}`")
    else:
        lines.append("- None")

    if cleanup_rejected:
        lines.extend(["", "## Cleanup Rejections", ""])
        for reason, total in sorted(cleanup_rejected.items()):
            lines.append(f"- `{reason}`: `{total}`")

    lines.extend(["", "## Accepted by Frame Type", ""])
    if family_counts:
        for frame_type, total in sorted(family_counts.items()):
            lines.append(f"- `{frame_type}`: `{total}`")
    else:
        lines.append("- None")

    lines.extend(["", "## Judge Labels", ""])
    if judge_counts:
        for label, total in sorted(judge_counts.items()):
            lines.append(f"- `{label}`: `{total}`")
    else:
        lines.append("- None")

    lines.extend(["", "## Sample Accepted", ""])
    if accepted_list:
        for card in accepted_list[:30]:
            lines.append(f"- `{card['verb']}` `{card['frame_type']}`: `{card['question']}` -> `{card['answer']}`")
    else:
        lines.append("- None")

    return "\n".join(lines).rstrip() + "\n"


def cleanup_accepted_candidates(verb_results: list[dict], present_tenses: dict[str, dict[str, str]]) -> tuple[list[dict], Counter[str]]:
    kept_rows: list[dict] = []
    cleanup_rejected: Counter[str] = Counter()

    for item in verb_results:
        rows_by_family = {row.get("family", ""): row for row in item.get("rows", [])}
        evaluations = item.get("evaluations", [])
        accepted_families = {row.get("family", "") for row in evaluations if row.get("accepted")}

        for evaluation in evaluations:
            if not (evaluation.get("accepted") and evaluation.get("candidate")):
                continue

            family = evaluation.get("family", "")
            source_row = rows_by_family.get(family, {})
            candidate = dict(evaluation["candidate"])
            canonical_verb = LEMMA_ALIAS.get(candidate.get("verb", ""), candidate.get("verb", ""))
            candidate["verb"] = canonical_verb
            candidate["frame_id"] = f"{slugify(canonical_verb)}_e2e_{family}"
            candidate["full_answer"] = fix_initial_elision(candidate.get("full_answer", ""))
            if canonical_verb in QUARANTINED_VERBS:
                cleanup_rejected["quarantined_verb"] += 1
                continue

            if family == "direct_object":
                hidden_chunk = normalize_text(source_row.get("hidden_chunk_np", ""))
                conjugated_form = normalize_text(source_row.get("conjugated_form", ""))
                if conjugated_form and hidden_chunk != conjugated_form:
                    cleanup_rejected["direct_object_multiword_hidden_chunk"] += 1
                    continue
                if "a_object" in accepted_families and A_SURFACE_RE.search(candidate["full_answer"]):
                    cleanup_rejected["direct_object_with_a_phrase_when_a_object_exists"] += 1
                    continue

            renormalized, reason = normalize_ai_candidate(candidate, present_tenses)
            if not renormalized:
                cleanup_rejected[f"cleanup_normalizer:{reason}"] += 1
                continue
            kept_rows.append(renormalized)

    best_by_key: dict[tuple[str, str], dict] = {}
    duplicate_family_rejected: Counter[str] = Counter()
    for candidate in kept_rows:
        key = (candidate["verb"], normalize_sentence(candidate["full_answer"]))
        existing = best_by_key.get(key)
        if not existing:
            best_by_key[key] = candidate
            continue
        if FRAME_PRIORITY.get(candidate["frame_type"], 0) > FRAME_PRIORITY.get(existing["frame_type"], 0):
            duplicate_family_rejected[f"prefer_{candidate['frame_type']}_over_{existing['frame_type']}"] += 1
            best_by_key[key] = candidate
        else:
            duplicate_family_rejected[f"prefer_{existing['frame_type']}_over_{candidate['frame_type']}"] += 1

    deduped_rows: list[dict] = []
    seen_frame_keys: set[tuple[str, str, str]] = set()
    for candidate in sorted(best_by_key.values(), key=lambda card: (card["verb"], card["frame_type"], card["frame_id"])):
        key = (candidate["verb"], candidate["frame_type"], normalize_sentence(candidate["full_answer"]))
        if key in seen_frame_keys:
            cleanup_rejected["duplicate_same_family_sentence"] += 1
            continue
        seen_frame_keys.add(key)
        deduped_rows.append(candidate)

    cleanup_rejected.update(duplicate_family_rejected)
    return deduped_rows, cleanup_rejected


def direct_object_structure_reasons(card: dict, nlp) -> list[str]:
    reasons: list[str] = []
    words = parse_sentence(nlp, card.get("full_answer", ""))
    main_verb = find_main_finite_verb(words)
    if not words or not main_verb:
        return ["direct_object_no_main_finite_verb"]

    for child in children_of(words, main_verb.idx):
        if child.deprel == "iobj":
            reasons.append("direct_object_indirect_object")
        elif child.deprel in {"advmod", "advcl", "ccomp"}:
            reasons.append("direct_object_adverbial_or_clause_extension")
        elif child.deprel == "xcomp" and child.upos == "VERB":
            reasons.append("direct_object_infinitive_or_verb_extension")
        elif child.deprel in {"obl", "obl:arg"}:
            has_case = any(grand.head == child.idx and grand.deprel in {"case", "mark"} for grand in words)
            if has_case:
                reasons.append("direct_object_prepositional_extension")

    return sorted(set(reasons))


def cleanup_merged_cards(cards: list[dict], nlp) -> tuple[list[dict], Counter[str]]:
    cleanup_rejected: Counter[str] = Counter()
    best_by_sentence: dict[tuple[str, str], dict] = {}

    for card in cards:
        if str(card.get("verb", "")) in QUARANTINED_VERBS:
            cleanup_rejected["quarantined_verb_in_merged_deck"] += 1
            continue

        candidate = dict(card)
        candidate["full_answer"] = fix_initial_elision(candidate.get("full_answer", ""))
        key = (candidate.get("verb", ""), normalize_sentence(candidate.get("full_answer", "")))
        existing = best_by_sentence.get(key)
        if not existing:
            best_by_sentence[key] = candidate
            continue

        existing_rank = (FRAME_PRIORITY.get(existing.get("frame_type", ""), 0), source_priority(str(existing.get("source", ""))))
        candidate_rank = (FRAME_PRIORITY.get(candidate.get("frame_type", ""), 0), source_priority(str(candidate.get("source", ""))))
        if candidate_rank > existing_rank:
            cleanup_rejected[f"prefer_{candidate['frame_type']}_or_better_source"] += 1
            best_by_sentence[key] = candidate
        else:
            cleanup_rejected[f"drop_duplicate_{candidate['frame_type']}"] += 1

    cleaned: list[dict] = []
    for card in sorted(best_by_sentence.values(), key=lambda item: (item.get("verb", ""), item.get("frame_id", ""))):
        if card.get("frame_type") == "direct_object":
            reasons = direct_object_structure_reasons(card, nlp)
            if reasons:
                cleanup_rejected[reasons[0]] += 1
                continue
        cleaned.append(card)

    return cleaned, cleanup_rejected


def load_verb_results(output_dir: Path) -> list[dict]:
    per_verb_dir = output_dir / "per_verb"
    if not per_verb_dir.exists():
        return []
    return [read_json(path, {}) for path in sorted(per_verb_dir.glob("*.json"))]


def rebuild_outputs(output_dir: Path, integrate: bool, nlp) -> tuple[int, int]:
    verb_results = load_verb_results(output_dir)
    accepted_candidates, cleanup_rejected = cleanup_accepted_candidates(verb_results, load_present_tenses())
    rejected_rows: list[dict] = []
    for item in verb_results:
        for row in item.get("evaluations", []):
            if not (row.get("accepted") and row.get("candidate")):
                rejected_rows.append(
                    {
                        "verb": item.get("verb", ""),
                        "family": row.get("family", ""),
                        "status": row.get("status", ""),
                        "issues": row.get("issues", []),
                        "stanza_reasons": row.get("stanza_reasons", []),
                        "judge_label": row.get("judge_label", ""),
                        "judge_reason": row.get("judge_reason", ""),
                    }
                )
    for reason, total in sorted(cleanup_rejected.items()):
        rejected_rows.append(
            {
                "verb": "",
                "family": "",
                "status": "rejected_cleanup",
                "issues": [reason, f"count={total}"],
                "stanza_reasons": [],
                "judge_label": "",
                "judge_reason": "",
            }
        )

    write_json(output_dir / "accepted_cards.json", accepted_candidates)
    write_json(output_dir / "rejected_rows.json", rejected_rows)

    integrated_total = len(read_json(OUTPUT_JSON, [])) if OUTPUT_JSON.exists() else 0
    if integrate:
        base_cards = read_json(OUTPUT_JSON, [])
        preserved_cards = [
            card
            for card in base_cards
            if not str(card.get("source", "")).startswith("ai:") and str(card.get("verb", "")) not in QUARANTINED_VERBS
        ]
        merged_cards = sorted(
            preserved_cards + accepted_candidates,
            key=lambda card: (card.get("verb", ""), card.get("frame_id", "")),
        )
        merged_cards, merged_cleanup_rejected = cleanup_merged_cards(merged_cards, nlp)
        cleanup_rejected.update(merged_cleanup_rejected)
        write_json(OUTPUT_JSON, merged_cards)
        write_js(OUTPUT_JS, merged_cards)
        REVIEW_MD.write_text(
            build_summary(
                verb_results,
                len(merged_cards),
                accepted_cards=accepted_candidates,
                cleanup_rejected=cleanup_rejected,
            ),
            encoding="utf-8",
        )
        integrated_total = len(merged_cards)

    (output_dir / "summary.md").write_text(
        build_summary(verb_results, integrated_total, accepted_cards=accepted_candidates, cleanup_rejected=cleanup_rejected),
        encoding="utf-8",
    )
    return len(accepted_candidates), integrated_total


def main() -> None:
    args = build_parser().parse_args()
    ensure_openai()

    target_verbs = select_target_verbs(args)
    output_dir = load_or_init_output_dir(args)
    client = OpenAI()
    present_tenses = load_present_tenses()
    usage_index = load_usage_index()
    core_index = load_core_pattern_index()
    nlp = build_nlp(args.stanza_dir)
    integrate = not args.no_integrate

    for index, verb_entry in enumerate(target_verbs, start=1):
        verb = verb_entry["infinitive"]
        out_path = response_path(output_dir, verb)
        if args.resume and out_path.exists():
            print(f"{index}/{len(target_verbs)} {verb}: skipped (already present)")
            continue

        raw_response = call_generator(
            client,
            args.generator_model,
            verb_entry,
            core_index.get(verb, []),
            usage_index.get(verb, []),
            args.reasoning_effort,
        )
        normalized = normalize_response_payload(verb, raw_response, present_tenses)
        evaluations = [
            evaluate_row(
                verb_entry,
                row,
                present_tenses,
                nlp,
                args.generator_model,
                args.judge_provider,
                args.judge_model,
                args.judge_openai_model,
                args.ollama_url,
                client,
            )
            for row in normalized["rows"]
        ]
        payload = {
            "verb": verb,
            "raw_response": raw_response,
            "rows": normalized["rows"],
            "evaluations": evaluations,
        }
        write_local_json(out_path, payload)
        accepted_count, integrated_total = rebuild_outputs(output_dir, integrate=integrate, nlp=nlp)
        accepted_for_verb = sum(1 for row in evaluations if row.get("accepted"))
        print(
            f"{index}/{len(target_verbs)} {verb}: accepted {accepted_for_verb} row(s); "
            f"run total {accepted_count}; deck total {integrated_total}"
        )
        time.sleep(args.sleep_seconds)

    accepted_count, integrated_total = rebuild_outputs(output_dir, integrate=integrate, nlp=nlp)
    print(f"\nRun complete: {output_dir}")
    print(f"Accepted cards: {accepted_count}")
    print(f"App deck total: {integrated_total}")


if __name__ == "__main__":
    main()
