#!/usr/bin/env python3
"""
audit_verb_usages_with_openai.py
================================
Non-destructive AI audit runner for French / Portuguese / Ukrainian verb usage nuggets.

This script reviews usage nuggets verb-by-verb, writes structured decisions into
an isolated audit folder, and produces three downstream views:

- trusted_keep.json
- candidate_label_fixes.json
- quarantine.json

It does NOT modify the live verb_usages.json unless a separate apply step is
added later. This keeps the audit from colliding with existing repo work.

Examples:
    /Users/simeon/Code/VerbsFirst/proj1/venv/bin/python3 audit_verb_usages_with_openai.py \
      --language portuguese \
      --input-file /Users/simeon/Code/VerbsFirst/portuguese-verbs/verb_usages.json

    /Users/simeon/Code/VerbsFirst/proj1/venv/bin/python3 audit_verb_usages_with_openai.py \
      --language french \
      --input-file /Users/simeon/Code/VerbsFirst/proj1/verb_usages.json \
      --model gpt-5

    /Users/simeon/Code/VerbsFirst/proj1/venv/bin/python3 audit_verb_usages_with_openai.py \
      --language portuguese \
      --input-file /Users/simeon/Code/VerbsFirst/portuguese-verbs/verb_usages.json \
      --output-dir /Users/simeon/Code/VerbsFirst/portuguese-verbs/_ai_audits/pt-pass-01 \
      --resume
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
import time
from datetime import datetime
from pathlib import Path
from typing import Literal

from openai import OpenAI
from pydantic import BaseModel, Field

ROOT = Path(__file__).resolve().parent
REPOS_ROOT = ROOT.parent


class AuditDecision(BaseModel):
    sense_id: str
    verdict: Literal["keep", "label_fix_only", "sentence_bad", "drop", "uncertain"]
    confidence: float = Field(ge=0.0, le=1.0)
    pattern_ok: bool
    sentence_ok: bool
    meaning_ok: bool
    safe_to_ship: bool
    better_pattern: str = ""
    better_meaning_en: str = ""
    reason: str


class BatchAuditResponse(BaseModel):
    items: list[AuditDecision]


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Non-destructive AI audit for verb usage nuggets.")
    parser.add_argument("--language", required=True, choices=["french", "portuguese", "ukrainian"])
    parser.add_argument("--input-file", required=True, help="Path to verb_usages.json")
    parser.add_argument("--model", default="gpt-4o", help="OpenAI model to use. Recommended: gpt-5 if available.")
    parser.add_argument("--model-top100", help="Optional stronger model for verbs in frequency tiers top20/top50/top100.")
    parser.add_argument("--model-rest", help="Optional model for all other verbs. Defaults to --model.")
    parser.add_argument("--verbs-file", help="Optional path to verbs.full.js for frequency-tier routing. Defaults by language.")
    parser.add_argument("--max-items", type=int, help="Optional cap for testing")
    parser.add_argument("--output-dir", help="Optional existing or new audit folder")
    parser.add_argument("--resume", action="store_true", help="Resume from an existing output folder")
    parser.add_argument("--finalize-only", action="store_true", help="Rebuild merged_decisions/views/summary from existing decision files only.")
    parser.add_argument("--reasoning-effort", choices=["low", "medium", "high", "xhigh"], help="Optional reasoning effort for supported models.")
    parser.add_argument("--sleep-seconds", type=float, default=0.5)
    parser.add_argument("--trust-threshold", type=float, default=0.90)
    parser.add_argument("--label-fix-threshold", type=float, default=0.97)
    return parser


def load_entries(input_file: Path) -> list[dict]:
    if not input_file.exists():
        sys.exit(f"Input file not found: {input_file}")
    data = json.loads(input_file.read_text(encoding="utf-8"))
    if not isinstance(data, list):
        sys.exit("Expected a JSON array of usage entries.")
    return data


def default_verbs_file(language: str) -> Path:
    if language == "french":
        return ROOT / "js" / "verbs.full.js"
    if language == "portuguese":
        return REPOS_ROOT / "portuguese-verbs" / "js" / "verbs.full.js"
    return REPOS_ROOT / "ukrainian-verbs" / "js" / "verbs.full.js"


def load_verb_tiers(verbs_file: Path) -> dict[str, str]:
    if not verbs_file.exists():
        sys.exit(f"Verbs file not found for frequency routing: {verbs_file}")
    text = verbs_file.read_text(encoding="utf-8")
    match = re.search(r"const\s+verbs\s*=\s*(\[[\s\S]*?\]);", text)
    if not match:
        sys.exit(f"Could not parse verbs array from: {verbs_file}")
    verbs = json.loads(match.group(1))
    return {
        str(item.get("infinitive", "")).strip(): str(item.get("frequency", "")).strip()
        for item in verbs
        if item.get("infinitive")
    }


def default_output_dir(input_file: Path, language: str) -> Path:
    stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    repo_root = input_file.parent
    return repo_root / "_ai_audits" / f"{input_file.stem}_{language}_{stamp}"


def language_notes(language: str) -> str:
    if language == "portuguese":
        return """Portuguese notes:
- Be strict about article vs preposition.
- If a pattern says `+ a + pessoa`, the example must genuinely show dative/prepositional `a` to a person, often as `a`, `ao`, `aos`, `à`, or `às`.
- Do not confuse the article `a` ("the") with the preposition `a`.
- `de + infinitivo` can appear as `de não + infinitivo`; that still counts as valid.
- If the example mainly shows `para + pessoa`, `com + pessoa`, or `de + pessoa`, prefer that over a fake `a + pessoa` label.
- If the sentence itself is bad Portuguese, mark it `sentence_bad` rather than trying to rescue it with relabeling.
"""
    if language == "ukrainian":
        return """Ukrainian notes:
- Be strict about aspect. If the verb is perfective, examples should fit bounded/completed one-time events; if imperfective, examples should fit ongoing, habitual, repeated, or process readings.
- Reject examples that are grammatically malformed, even if the general meaning is understandable.
- Prefer everyday modern Ukrainian and learner-honest constructions over literal or dictionary-ish labels.
- If a pattern label is too vague but the sentence is otherwise good Ukrainian, use `label_fix_only`.
- If the sentence is awkward, unidiomatic, or mismatches the pattern/meaning, use `sentence_bad`.
"""
    return """French notes:
- Be strict about whether the example really instantiates the labeled pattern.
- Distinguish between direct objects and real prepositional patterns like `à + person`, `de + infinitive`, `chez + person`, etc.
- If the sentence is acceptable French but the pattern label is too vague or misleading, use `label_fix_only`.
- If the sentence itself is unnatural or wrong for the stated sense, use `sentence_bad`.
"""


def system_prompt(language: str) -> str:
    return f"""You are auditing learner-facing {language} verb-usage nuggets for a serious language-learning app.

The product rule is conservative:
- It is better to DROP a usable nugget than to KEEP a wrong one.
- If you are uncertain, choose `uncertain`.
- Only mark `safe_to_ship=true` when the nugget is genuinely reliable for learners.

For each item, judge:
1. Does the pattern honestly describe the grammar in the example sentence?
2. Does the English meaning match the example sentence?
3. Is the sentence itself natural and valid for this usage?
4. Is the label useful for a learner, rather than vague or misleading?

Verdict meanings:
- keep: the nugget is good as-is
- label_fix_only: sentence is fine, but the pattern and/or short meaning needs a local fix
- sentence_bad: the sentence is wrong, unnatural, or does not instantiate the usage honestly
- drop: the whole nugget is not worth keeping
- uncertain: not confident enough to ship

Return exactly one decision per input item. Keep reasons short and concrete.

{language_notes(language)}"""


def user_prompt(language: str, items: list[dict]) -> str:
    payload = []
    for item in items:
        payload.append(
            {
                "sense_id": item.get("sense_id", ""),
                "verb": item.get("verb", ""),
                "pattern": item.get("pattern", ""),
                "meaning_en": item.get("meaning_en", ""),
                "example_source": item.get("example_fr", ""),
                "example_translation": item.get("example_en", ""),
            }
        )

    return (
        f"Review these {language} verb-usage nuggets.\n\n"
        "Return exactly one structured decision for each item.\n\n"
        f"Items:\n{json.dumps(payload, ensure_ascii=False, indent=2)}"
    )


def ensure_openai_key() -> None:
    if not os.environ.get("OPENAI_API_KEY"):
        sys.exit("OPENAI_API_KEY is not set in the environment.")


def write_json(path: Path, data) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def read_json(path: Path, fallback):
    if not path.exists():
        return fallback
    return json.loads(path.read_text(encoding="utf-8"))


def make_run_config(args: argparse.Namespace, input_file: Path, output_dir: Path, total_items: int) -> dict:
    return {
        "language": args.language,
        "input_file": str(input_file),
        "model": args.model,
        "model_top100": args.model_top100 or "",
        "model_rest": args.model_rest or args.model,
        "reasoning_effort": args.reasoning_effort or "",
        "verbs_file": args.verbs_file or "",
        "trust_threshold": args.trust_threshold,
        "label_fix_threshold": args.label_fix_threshold,
        "created_at": datetime.now().isoformat(),
        "output_dir": str(output_dir),
        "total_items": total_items,
    }


def load_or_init_output_dir(args: argparse.Namespace, input_file: Path, total_items: int) -> tuple[Path, dict]:
    output_dir = Path(args.output_dir).expanduser().resolve() if args.output_dir else default_output_dir(input_file, args.language)
    config_path = output_dir / "run_config.json"

    if args.resume:
        if not output_dir.exists() or not config_path.exists():
            sys.exit("--resume requires an existing --output-dir with run_config.json")
        config = read_json(config_path, {})
        return output_dir, config

    output_dir.mkdir(parents=True, exist_ok=True)
    config = make_run_config(args, input_file, output_dir, total_items)
    write_json(config_path, config)
    return output_dir, config


def group_by_verb(entries: list[dict]) -> list[tuple[str, list[dict]]]:
    grouped: dict[str, list[dict]] = {}
    for entry in entries:
        grouped.setdefault(entry.get("verb", ""), []).append(entry)
    return sorted(grouped.items(), key=lambda pair: pair[0])


TOP100_TIERS = {"top20", "top50", "top100"}


def choose_model_for_verb(verb: str, verb_tiers: dict[str, str], model_top100: str | None, model_rest: str) -> tuple[str, str]:
    tier = verb_tiers.get(verb, "")
    if model_top100 and tier in TOP100_TIERS:
        return model_top100, tier or "unknown"
    return model_rest, tier or "unknown"


def call_batch(client: OpenAI, model: str, language: str, batch: list[dict], reasoning_effort: str | None = None) -> BatchAuditResponse:
    kwargs = {
        "model": model,
        "response_format": BatchAuditResponse,
        "messages": [
            {"role": "system", "content": system_prompt(language)},
            {"role": "user", "content": user_prompt(language, batch)},
        ],
    }
    if reasoning_effort:
        kwargs["reasoning_effort"] = reasoning_effort

    completion = client.chat.completions.parse(**kwargs)

    message = completion.choices[0].message
    if not message.parsed:
        raise RuntimeError("Structured output parsing failed.")
    return message.parsed


def merge_decisions(output_dir: Path) -> list[dict]:
    merged: list[dict] = []
    decision_files = sorted(output_dir.glob("**/*.decisions.json"))
    for path in decision_files:
        merged.extend(read_json(path, []))
    return merged


def build_views(entries: list[dict], decisions: list[dict], trust_threshold: float, label_fix_threshold: float) -> tuple[list[dict], list[dict], list[dict]]:
    entry_by_id = {entry["sense_id"]: entry for entry in entries}
    trusted_keep: list[dict] = []
    candidate_label_fixes: list[dict] = []
    quarantine: list[dict] = []

    for decision in decisions:
        sense_id = decision["sense_id"]
        entry = entry_by_id.get(sense_id)
        if not entry:
            continue

        combined = {
            "decision": decision,
            "entry": entry,
        }

        verdict = decision["verdict"]
        confidence = float(decision["confidence"])

        if verdict == "keep" and decision["safe_to_ship"] and confidence >= trust_threshold:
            trusted_keep.append(combined)
        elif verdict == "label_fix_only" and confidence >= label_fix_threshold:
            candidate_label_fixes.append(combined)
        else:
            quarantine.append(combined)

    return trusted_keep, candidate_label_fixes, quarantine


def write_summary(output_dir: Path, config: dict, entries: list[dict], decisions: list[dict], trusted_keep: list[dict], candidate_label_fixes: list[dict], quarantine: list[dict]) -> None:
    decision_counts = {}
    for item in decisions:
        decision_counts[item["verdict"]] = decision_counts.get(item["verdict"], 0) + 1

    lines = [
        "# Verb Usage Audit Summary",
        "",
        f"- Language: `{config['language']}`",
        f"- Model: `{config['model']}`",
        f"- Top 100 model: `{config.get('model_top100') or '(none)'}`",
        f"- Rest model: `{config.get('model_rest') or config['model']}`",
        f"- Reasoning effort: `{config.get('reasoning_effort') or '(default)'}`",
        f"- Verbs file: `{config.get('verbs_file') or '(none)'}`",
        f"- Input file: `{config['input_file']}`",
        f"- Total source entries: `{len(entries)}`",
        f"- Reviewed decisions: `{len(decisions)}`",
        f"- Trusted keep: `{len(trusted_keep)}`",
        f"- Candidate label fixes: `{len(candidate_label_fixes)}`",
        f"- Quarantine: `{len(quarantine)}`",
        "",
        "## Verdict Counts",
        "",
    ]
    for verdict in sorted(decision_counts):
        lines.append(f"- `{verdict}`: `{decision_counts[verdict]}`")

    lines.extend(
        [
            "",
            "## Files",
            "",
            f"- `run_config.json`",
            f"- `merged_decisions.json`",
            f"- `trusted_keep.json`",
            f"- `candidate_label_fixes.json`",
            f"- `quarantine.json`",
        ]
    )

    (output_dir / "SUMMARY.md").write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> None:
    args = build_parser().parse_args()

    input_file = Path(args.input_file).expanduser().resolve()
    entries = load_entries(input_file)
    if args.max_items:
        entries = entries[: args.max_items]

    verbs_file = Path(args.verbs_file).expanduser().resolve() if args.verbs_file else default_verbs_file(args.language)
    verb_tiers = load_verb_tiers(verbs_file)
    args.verbs_file = str(verbs_file)
    args.model_rest = args.model_rest or args.model

    output_dir, config = load_or_init_output_dir(args, input_file, len(entries))
    verb_groups = group_by_verb(entries)
    if args.max_items:
        max_verbs = max(1, args.max_items)
        verb_groups = verb_groups[:max_verbs]
        allowed = {verb for verb, _ in verb_groups}
        entries = [entry for entry in entries if entry.get("verb", "") in allowed]

    config["total_items"] = len(entries)
    config["total_verbs"] = len(verb_groups)
    write_json(output_dir / "run_config.json", config)

    batch_dir = output_dir / "verbs"
    batch_dir.mkdir(parents=True, exist_ok=True)

    if not args.finalize_only:
        ensure_openai_key()
        client = OpenAI()
        for idx, (verb, batch) in enumerate(verb_groups, start=1):
            slug = "".join(ch if ch.isalnum() or ch in {"_", "-"} else "_" for ch in verb).strip("_") or f"verb_{idx}"
            decisions_path = batch_dir / f"{idx:04d}_{slug}.decisions.json"
            input_path = batch_dir / f"{idx:04d}_{slug}.input.json"
            error_path = batch_dir / f"{idx:04d}_{slug}.error.txt"

            if args.resume and decisions_path.exists():
                continue

            write_json(input_path, batch)
            try:
                model_for_verb, tier = choose_model_for_verb(verb, verb_tiers, args.model_top100, args.model_rest)
                parsed = call_batch(client, model_for_verb, args.language, batch, args.reasoning_effort)
                items = [item.model_dump() for item in parsed.items]
                if len(items) != len(batch):
                    raise RuntimeError(f"Expected {len(batch)} decisions, got {len(items)}")
                for item in items:
                    item["model_used"] = model_for_verb
                    item["verb_frequency_tier"] = tier
                write_json(decisions_path, items)
                if error_path.exists():
                    error_path.unlink()
                print(f"verb {idx}/{len(verb_groups)} {verb}: ok ({len(items)} items, tier={tier or 'unknown'}, model={model_for_verb})")
            except Exception as exc:
                error_path.write_text(str(exc) + "\n", encoding="utf-8")
                print(f"verb {idx}/{len(verb_groups)} {verb}: failed ({exc})")
            time.sleep(args.sleep_seconds)

    decisions = merge_decisions(output_dir)
    write_json(output_dir / "merged_decisions.json", decisions)

    trusted_keep, candidate_label_fixes, quarantine = build_views(
        entries,
        decisions,
        trust_threshold=args.trust_threshold,
        label_fix_threshold=args.label_fix_threshold,
    )
    write_json(output_dir / "trusted_keep.json", trusted_keep)
    write_json(output_dir / "candidate_label_fixes.json", candidate_label_fixes)
    write_json(output_dir / "quarantine.json", quarantine)
    write_summary(output_dir, config, entries, decisions, trusted_keep, candidate_label_fixes, quarantine)

    print(f"\nAudit complete.")
    print(f"  output_dir            : {output_dir}")
    print(f"  reviewed decisions    : {len(decisions)}")
    print(f"  trusted keep          : {len(trusted_keep)}")
    print(f"  candidate label fixes : {len(candidate_label_fixes)}")
    print(f"  quarantine            : {len(quarantine)}")


if __name__ == "__main__":
    main()
