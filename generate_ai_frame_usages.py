#!/usr/bin/env python3
"""
Generate AI-grounded French frame-usage candidates for the top 500 verb rollout.

This runner asks for a small, fixed matrix per verb:
- direct object usage, if legal
- `a` / `à` usage, if legal
- `de` usage, if legal
- `qqch à qqn` combo usage, if legal and naturally blankable

The model must provide a contiguous hidden chunk so we can reliably blank the
conjugated form together with the attached preposition surface when needed.

Outputs are written to an isolated run folder so we can inspect or resume:
- run_config.json
- responses/<verb>.json
- merged_responses.json
- valid_candidates.json
- summary.md
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

from pydantic import BaseModel, Field

from frame_cards_lib import (
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
)

try:
    from openai import OpenAI
except ImportError:
    OpenAI = None


ROOT = Path(__file__).parent
OUT_ROOT = ROOT / "_ai_frame_runs"
ROLLOUT_TIERS = {"top20", "top50", "top100", "top500"}
TARGET_FAMILIES = ("direct_object", "a_object", "de_object", "combo_a")
PREP_SURFACES_A = {"à", "au", "aux", "à la", "à l'"}
PREP_SURFACES_DE = {"de", "du", "des", "de la", "de l'", "d'"}
SUBJECT_PREFIX_RE = re.compile(r"^(?:j'|je |tu |il |elle |on |nous |vous |ils |elles )", re.IGNORECASE)
CLITIC_PREFIX_RE = re.compile(r"^(?:(?:m|t|s|l)'|me |te |se |nous |vous |le |la |les |lui |leur |y |en )+", re.IGNORECASE)


class FrameGenerationRow(BaseModel):
    family: Literal["direct_object", "a_object", "de_object", "combo_a"]
    legal: bool
    sentence_fr: str = ""
    meaning_en: str = ""
    hidden_chunk: str = ""
    conjugated_form: str = ""
    attached_preposition: str = ""
    note: str = ""


class VerbFrameGenerationResponse(BaseModel):
    verb: str
    rows: list[FrameGenerationRow] = Field(default_factory=list)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Generate AI frame-usage candidates for French verbs.")
    parser.add_argument("--model", default="gpt-5.4-mini", help="OpenAI model to use.")
    parser.add_argument("--reasoning-effort", choices=["low", "medium", "high", "xhigh"])
    parser.add_argument("--tier", action="append", dest="tiers", help="Optional frequency tier filter, e.g. top100.")
    parser.add_argument("--verb", action="append", dest="verbs", help="Explicit verb to generate. Repeat to pass several.")
    parser.add_argument("--max-verbs", type=int, help="Optional cap for testing.")
    parser.add_argument("--resume", action="store_true", help="Resume from an existing output dir.")
    parser.add_argument("--output-dir", help="Optional existing or new output dir.")
    parser.add_argument("--sleep-seconds", type=float, default=0.35)
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


def write_json(path: Path, data) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def read_json(path: Path, fallback):
    if not path.exists():
        return fallback
    return json.loads(path.read_text(encoding="utf-8"))


def load_all_verbs() -> list[dict]:
    verbs = load_js_array(VERBS_JS, "const verbs =")
    return [verb for verb in verbs if verb.get("infinitive")]


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

    if args.max_verbs:
        target = target[: args.max_verbs]
    return target


def default_output_dir() -> Path:
    stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    return OUT_ROOT / f"frame_usages_{stamp}"


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
        "model": args.model,
        "reasoning_effort": args.reasoning_effort or "",
        "tiers": args.tiers or [],
        "verbs": args.verbs or [],
        "max_verbs": args.max_verbs or 0,
        "sleep_seconds": args.sleep_seconds,
    }
    write_json(config_path, config)
    return output_dir


def response_path(output_dir: Path, verb: str) -> Path:
    return output_dir / "responses" / f"{slugify(verb)}.json"


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
    return """You are generating high-trust learner-facing French frame-usage sentences for a serious language app.

Return a small matrix per verb. For each requested family, either:
- mark it illegal / not useful, or
- provide one short natural present-tense sentence

Critical product constraint:
- We must be able to hide one contiguous chunk in the sentence.
- That chunk must let the learner recover the conjugated verb.
- For `a_object` and `de_object`, it should also let the learner recover the attached preposition surface.
- For `combo_a`, only return a row if you can make the hidden chunk contiguous and natural.

Blanking rules:
- `direct_object`: hidden chunk should usually be just the conjugated verb.
- `a_object`: hidden chunk should usually be `verb + à-surface`, such as `répond à`, `répond au`, `pense à l'`.
- `de_object`: hidden chunk should usually be `verb + de-surface`, such as `parle de`, `sert de`, `sort du`, `sort de la`, `rêve d'`.
- `combo_a`: only if natural. Prefer a sentence where the direct object is cliticized before the verb so the missing chunk can stay contiguous, e.g. `Je le donne à Marie` -> hidden chunk `donne à`.

Quality rules:
- Present tense only.
- Use a subject pronoun, not a lexical subject.
- Short, normal, everyday French.
- Prefer positive clauses. Avoid `ne ... pas`, heavy adverbs, and other material between the verb and the attached preposition.
- Avoid weird placeholders, names unless genuinely helpful, and dictionary-ish language.
- Avoid vulgar, sexual, or embarrassing content.
- If the frame is not a common useful learner-facing row, mark legal=false.
- If you cannot produce a sentence that is both natural and blankable, mark legal=false.

Output rules:
- Return exactly one row for each requested family.
- If legal=false, leave the content fields empty except an optional short note.
- Keep notes short.
"""


def user_prompt(verb_entry: dict, core_patterns: list[dict], usage_examples: list[dict]) -> str:
    infinitive = verb_entry["infinitive"]
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

Requested families:
- direct_object
- a_object
- de_object
- combo_a

Existing core-pattern evidence:
{evidence_patterns}

Existing usage evidence:
{evidence_usages}

Return JSON with:
- verb
- rows: array of 4 objects, one per family

Each row must contain:
- family
- legal
- sentence_fr
- meaning_en
- hidden_chunk
- conjugated_form
- attached_preposition
- note

Important:
- Use present tense only.
- Use different pronouns across rows when convenient, but naturalness matters more.
- `sentence_fr` must be a full natural sentence.
- `hidden_chunk` must occur exactly once as a contiguous substring of `sentence_fr`.
- `hidden_chunk` should exclude the subject pronoun.
- `conjugated_form` must be the finite present-tense verb core inside `hidden_chunk`, without subject pronoun.
  If the hidden chunk includes clitics, keep them in `hidden_chunk` but not in `conjugated_form`.
  Example: `Je m'intéresse à la musique` -> `hidden_chunk = "m'intéresse à"` and `conjugated_form = "intéresse"`.
- `attached_preposition` is:
  - empty for `direct_object`
  - the exact surface hidden with the verb for `a_object` / `de_object` / `combo_a`
    Examples: `à`, `au`, `aux`, `à l'`, `de`, `du`, `des`, `de la`, `de l'`, `d'`
- Only return `combo_a` when the sentence is natural and the hidden chunk stays contiguous.
- For `de_object`, do not leave `de`, `du`, `de la`, `de l'`, or `d'` visible outside the gap.
  Example: `Ce livre me sert de référence.` must hide `sert de`, not just `sert`.
"""


def call_model(
    client: OpenAI,
    model: str,
    verb_entry: dict,
    core_patterns: list[dict],
    usage_examples: list[dict],
    reasoning_effort: str | None,
) -> dict:
    kwargs = {
        "model": model,
        "response_format": VerbFrameGenerationResponse,
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


def question_with_gaps(sentence_fr: str, hidden_chunk: str) -> str:
    tokens = hidden_chunk.split()
    gap = " ".join(["____"] * len(tokens))
    return normalize_text(sentence_fr.replace(hidden_chunk, gap, 1))


def validate_row(
    verb: str,
    row: dict,
    present_tenses: dict[str, dict[str, str]],
) -> tuple[bool, list[str], dict]:
    family = row.get("family", "")
    normalized = {
        "family": family,
        "legal": bool(row.get("legal")),
        "sentence_fr": normalize_sentence(row.get("sentence_fr", "")),
        "meaning_en": normalize_text(row.get("meaning_en", "")),
        "hidden_chunk": normalize_text(row.get("hidden_chunk", "")),
        "conjugated_form": normalize_text(row.get("conjugated_form", "")),
        "attached_preposition": normalize_text(row.get("attached_preposition", "")),
        "note": normalize_text(row.get("note", "")),
    }

    if not normalized["legal"]:
        normalized.update({
            "sentence_fr": "",
            "meaning_en": "",
            "hidden_chunk": "",
            "conjugated_form": "",
            "attached_preposition": "",
        })
        return True, [], normalized

    issues: list[str] = []
    for field in ("sentence_fr", "meaning_en", "hidden_chunk", "conjugated_form"):
        if not normalized[field]:
            issues.append(f"missing_{field}")

    sentence = normalized["sentence_fr"]
    hidden_chunk = normalized["hidden_chunk"]
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
    elif family == "a_object":
        if prep not in PREP_SURFACES_A:
            issues.append("bad_a_surface")
    elif family == "de_object":
        if prep not in PREP_SURFACES_DE:
            issues.append("bad_de_surface")
    elif family == "combo_a":
        if prep not in PREP_SURFACES_A:
            issues.append("bad_combo_a_surface")

    if family in {"a_object", "de_object", "combo_a"} and prep:
        if prep not in hidden_chunk:
            issues.append("prep_not_in_hidden_chunk")

    return not issues, issues, normalized


def build_candidate_record(verb_entry: dict, row: dict, model: str) -> dict:
    question = question_with_gaps(row["sentence_fr"], row["hidden_chunk"])
    return {
        "frame_id": f"{slugify(verb_entry['infinitive'])}_ai_{row['family']}",
        "verb": verb_entry["infinitive"],
        "type": "frame",
        "tense": "present",
        "question": question,
        "answer": row["hidden_chunk"],
        "full_answer": row["sentence_fr"],
        "frame_type": row["family"],
        "source": f"ai:{model}:{row['family']}",
        "meaning_en": row["meaning_en"],
        "conjugated_form": row["conjugated_form"],
        "attached_preposition": row["attached_preposition"],
        "note": row.get("note", ""),
    }


def merge_outputs(output_dir: Path, verb_entries: list[dict], model: str) -> None:
    verb_lookup = {entry["infinitive"]: entry for entry in verb_entries}
    response_files = sorted((output_dir / "responses").glob("*.json"))
    merged = [read_json(path, {}) for path in response_files]

    valid_candidates: list[dict] = []
    rejected_counter: Counter[str] = Counter()
    legal_counter: Counter[str] = Counter()

    for item in merged:
        verb = item.get("verb", "")
        verb_entry = verb_lookup.get(verb)
        if not verb_entry:
            continue
        for row in item.get("rows", []):
            family = row.get("family", "")
            if row.get("legal") and row.get("valid"):
                valid_candidates.append(build_candidate_record(verb_entry, row, model))
                legal_counter[family] += 1
            elif row.get("legal") and not row.get("valid"):
                for issue in row.get("issues", []):
                    rejected_counter[issue] += 1

    write_json(output_dir / "merged_responses.json", merged)
    write_json(output_dir / "valid_candidates.json", valid_candidates)

    covered_verbs = len({item.get("verb", "") for item in merged if any(row.get("legal") and row.get("valid") for row in item.get("rows", []))})
    lines = [
        "# AI Frame Usage Run",
        "",
        f"- Verbs attempted: `{len(merged)}`",
        f"- Verbs with at least one valid candidate: `{covered_verbs}`",
        f"- Valid candidates: `{len(valid_candidates)}`",
        "",
        "## Valid Families",
        "",
    ]
    if legal_counter:
        for family, total in sorted(legal_counter.items()):
            lines.append(f"- `{family}`: `{total}`")
    else:
        lines.append("- None")

    lines.extend(["", "## Rejected Validation Issues", ""])
    if rejected_counter:
        for issue, total in sorted(rejected_counter.items()):
            lines.append(f"- `{issue}`: `{total}`")
    else:
        lines.append("- None")

    lines.extend(["", "## Sample Candidates", ""])
    if not valid_candidates:
        lines.append("- None")
    else:
        for card in valid_candidates[:24]:
            lines.append(f"- `{card['verb']}` `{card['frame_type']}`: `{card['full_answer']}` -> `{card['answer']}`")

    (output_dir / "summary.md").write_text("\n".join(lines).rstrip() + "\n", encoding="utf-8")


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
                    "sentence_fr": "",
                    "meaning_en": "",
                    "hidden_chunk": "",
                    "conjugated_form": "",
                    "attached_preposition": "",
                    "note": "missing_from_model_output",
                    "valid": True,
                    "issues": [],
                }
            )

    return {"verb": verb, "rows": rows}


def main() -> None:
    args = build_parser().parse_args()
    ensure_openai()

    target_verbs = select_target_verbs(args)
    output_dir = load_or_init_output_dir(args)
    client = OpenAI()
    present_tenses = load_present_tenses()
    usage_index = load_usage_index()
    core_index = load_core_pattern_index()

    for index, verb_entry in enumerate(target_verbs, start=1):
        verb = verb_entry["infinitive"]
        out_path = response_path(output_dir, verb)
        if args.resume and out_path.exists():
            print(f"{index}/{len(target_verbs)} {verb}: skipped (already present)")
            continue

        response = call_model(
            client,
            args.model,
            verb_entry,
            core_index.get(verb, []),
            usage_index.get(verb, []),
            args.reasoning_effort,
        )
        normalized = normalize_response_payload(verb, response, present_tenses)
        write_json(out_path, normalized)
        merge_outputs(output_dir, target_verbs, args.model)

        valid_count = sum(1 for row in normalized["rows"] if row.get("legal") and row.get("valid"))
        print(f"{index}/{len(target_verbs)} {verb}: saved {valid_count} valid rows")
        time.sleep(args.sleep_seconds)

    merge_outputs(output_dir, target_verbs, args.model)
    print(f"\nRun complete: {output_dir}")


if __name__ == "__main__":
    main()
