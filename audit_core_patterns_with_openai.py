#!/usr/bin/env python3
"""
audit_core_patterns_with_openai.py
==================================
Non-destructive AI audit runner for French core-pattern data.
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

from core_patterns_lib import flatten_pattern_items, load_core_patterns_prefer_json, load_usage_index, load_verbs


class AuditDecision(BaseModel):
    pattern_id: str
    verdict: Literal["keep", "rewrite", "drop", "uncertain"]
    confidence: float = Field(ge=0.0, le=1.0)
    pattern_ok: bool
    meaning_ok: bool
    learner_useful: bool
    safe_to_ship: bool
    better_pattern: str = ""
    better_meaning_en: str = ""
    reason: str


class BatchAuditResponse(BaseModel):
    items: list[AuditDecision]


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Non-destructive AI audit for French core patterns.")
    parser.add_argument("--model", default="gpt-5")
    parser.add_argument("--model-top100", help="Optional stronger model for top20/top50/top100 verbs.")
    parser.add_argument("--model-rest", help="Optional model for all other verbs. Defaults to --model.")
    parser.add_argument("--verb", action="append", dest="verbs", help="Audit one explicit verb. Repeat to pass several.")
    parser.add_argument("--output-dir", help="Optional existing or new audit folder")
    parser.add_argument("--resume", action="store_true")
    parser.add_argument("--finalize-only", action="store_true")
    parser.add_argument("--max-verbs", type=int)
    parser.add_argument("--reasoning-effort", choices=["low", "medium", "high", "xhigh"])
    parser.add_argument("--sleep-seconds", type=float, default=0.5)
    parser.add_argument("--trust-threshold", type=float, default=0.90)
    parser.add_argument("--rewrite-threshold", type=float, default=0.96)
    return parser


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


def load_verb_tiers() -> dict[str, str]:
    return {
        item["infinitive"]: item.get("frequency", "")
        for item in load_verbs(None)
    }


def default_output_dir() -> Path:
    stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    return Path("/Users/simeon/Desktop/proj1/_ai_audits") / f"verb_core_patterns_french_{stamp}"


def system_prompt() -> str:
    return """You are auditing learner-facing French core verb patterns for a serious language-learning app.

Be conservative:
- It is better to DROP a usable row than to KEEP a misleading one.
- If uncertain, choose `uncertain`.
- Only mark `safe_to_ship=true` when the row is genuinely strong for learners.

Priority for this dataset:
- direct object vs `à` vs `de`
- `que` / `si` clauses when core
- combo frames like `qqch à qqn`
- reflexive complement patterns when they change learner-relevant grammar

For each row, judge:
1. Is the French pattern grammatically honest and canonical?
2. Is the English gloss natural, compact, and accurate?
3. Is the split genuinely useful for learners, especially for French complementation and pronoun behavior?
4. Is the row strong enough to ship directly?

Verdicts:
- keep: good as-is
- rewrite: useful row, but the pattern and/or gloss should be rewritten locally
- drop: not worth keeping
- uncertain: not confident enough to ship

Keep reasons short and concrete.
"""


def user_prompt(verb: str, items: list[dict], usage_examples: list[dict]) -> str:
    payload = [
        {
            "pattern_id": item.get("pattern_id", ""),
            "pattern": item.get("pattern", ""),
            "meaning_en": item.get("meaning_en", ""),
            "notes": item.get("notes", ""),
        }
        for item in items
    ]
    evidence = [
        {
            "pattern": item.get("pattern", ""),
            "meaning_en": item.get("meaning_en", ""),
            "example_fr": item.get("example_fr", ""),
        }
        for item in usage_examples[:8]
    ]
    return (
        f"Audit these French core-pattern rows for the verb `{verb}`.\n\n"
        f"Candidate rows:\n{json.dumps(payload, ensure_ascii=False, indent=2)}\n\n"
        f"Usage evidence:\n{json.dumps(evidence, ensure_ascii=False, indent=2)}"
    )


def choose_model_for_verb(verb: str, verb_tiers: dict[str, str], model_top100: str | None, model_rest: str) -> tuple[str, str]:
    tier = verb_tiers.get(verb, "")
    if model_top100 and tier in {"top20", "top50", "top100"}:
        return model_top100, tier or "unknown"
    return model_rest, tier or "unknown"


def call_batch(client: OpenAI, model: str, verb: str, batch: list[dict], usage_examples: list[dict], reasoning_effort: str | None) -> BatchAuditResponse:
    kwargs = {
        "model": model,
        "response_format": BatchAuditResponse,
        "messages": [
            {"role": "system", "content": system_prompt()},
            {"role": "user", "content": user_prompt(verb, batch, usage_examples)},
        ],
    }
    if reasoning_effort:
        kwargs["reasoning_effort"] = reasoning_effort
    completion = client.chat.completions.parse(**kwargs)
    message = completion.choices[0].message
    if not message.parsed:
        raise RuntimeError("Structured output parsing failed.")
    return message.parsed


def group_by_verb(items: list[dict]) -> list[tuple[str, list[dict]]]:
    grouped: dict[str, list[dict]] = {}
    for item in items:
        grouped.setdefault(item.get("verb", ""), []).append(item)
    return sorted(grouped.items(), key=lambda pair: pair[0])


def merge_decisions(output_dir: Path) -> list[dict]:
    merged: list[dict] = []
    for path in sorted(output_dir.glob("verbs/*.decisions.json")):
        merged.extend(read_json(path, []))
    return merged


def build_views(items: list[dict], decisions: list[dict], trust_threshold: float, rewrite_threshold: float) -> tuple[list[dict], list[dict], list[dict]]:
    item_by_id = {item["pattern_id"]: item for item in items}
    trusted_keep: list[dict] = []
    candidate_rewrites: list[dict] = []
    quarantine: list[dict] = []

    for decision in decisions:
        item = item_by_id.get(decision.get("pattern_id", ""))
        if not item:
            continue
        combined = {"decision": decision, "entry": item}
        confidence = float(decision["confidence"])
        if decision["verdict"] == "keep" and decision["safe_to_ship"] and confidence >= trust_threshold:
            trusted_keep.append(combined)
        elif decision["verdict"] == "rewrite" and confidence >= rewrite_threshold:
            candidate_rewrites.append(combined)
        else:
            quarantine.append(combined)
    return trusted_keep, candidate_rewrites, quarantine


def write_summary(output_dir: Path, config: dict, items: list[dict], decisions: list[dict], trusted_keep: list[dict], candidate_rewrites: list[dict], quarantine: list[dict]) -> None:
    lines = [
        "# Core Pattern Audit Summary",
        "",
        f"- Model: `{config['model']}`",
        f"- Top 100 model: `{config.get('model_top100') or '(none)'}`",
        f"- Rest model: `{config.get('model_rest') or config['model']}`",
        f"- Reasoning effort: `{config.get('reasoning_effort') or '(default)'}`",
        f"- Total source rows: `{len(items)}`",
        f"- Reviewed decisions: `{len(decisions)}`",
        f"- Trusted keep: `{len(trusted_keep)}`",
        f"- Candidate rewrites: `{len(candidate_rewrites)}`",
        f"- Quarantine: `{len(quarantine)}`",
        "",
        "## Files",
        "",
        "- `run_config.json`",
        "- `merged_decisions.json`",
        "- `trusted_keep.json`",
        "- `candidate_rewrites.json`",
        "- `quarantine.json`",
        "",
    ]
    (output_dir / "SUMMARY.md").write_text("\n".join(lines), encoding="utf-8")


def main() -> None:
    args = build_parser().parse_args()
    items = flatten_pattern_items(load_core_patterns_prefer_json())
    usage_index = load_usage_index()
    verb_groups = group_by_verb(items)
    if args.verbs:
        requested_verbs = [verb.strip() for verb in args.verbs if verb and verb.strip()]
        allowed = set(requested_verbs)
        verb_groups = [group for group in verb_groups if group[0] in allowed]
        found_verbs = {verb for verb, _ in verb_groups}
        missing = [verb for verb in requested_verbs if verb not in found_verbs]
        if missing:
            sys.exit(f"Verb not found in core patterns: {', '.join(missing)}")
        verb_groups.sort(key=lambda pair: requested_verbs.index(pair[0]))
        items = [item for item in items if item.get("verb") in allowed]
    if args.max_verbs:
        verb_groups = verb_groups[: args.max_verbs]
        allowed = {verb for verb, _ in verb_groups}
        items = [item for item in items if item.get("verb") in allowed]

    output_dir = Path(args.output_dir).expanduser().resolve() if args.output_dir else default_output_dir()
    output_dir.mkdir(parents=True, exist_ok=True)
    batch_dir = output_dir / "verbs"
    batch_dir.mkdir(parents=True, exist_ok=True)

    args.model_rest = args.model_rest or args.model
    config = {
        "model": args.model,
        "model_top100": args.model_top100 or "",
        "model_rest": args.model_rest,
        "reasoning_effort": args.reasoning_effort or "",
        "created_at": datetime.now().isoformat(),
        "total_items": len(items),
        "total_verbs": len(verb_groups),
    }
    write_json(output_dir / "run_config.json", config)

    verb_tiers = load_verb_tiers()

    if not args.finalize_only:
        ensure_openai_key()
        client = OpenAI()
        for index, (verb, batch) in enumerate(verb_groups, start=1):
            slug = re.sub(r"[^a-z0-9_]+", "_", verb.lower()).strip("_") or f"verb_{index}"
            decisions_path = batch_dir / f"{index:04d}_{slug}.decisions.json"
            input_path = batch_dir / f"{index:04d}_{slug}.input.json"
            if args.resume and decisions_path.exists():
                continue

            write_json(input_path, batch)
            try:
                model_for_verb, tier = choose_model_for_verb(verb, verb_tiers, args.model_top100, args.model_rest)
                parsed = call_batch(client, model_for_verb, verb, batch, usage_index.get(verb, []), args.reasoning_effort)
                decisions = [item.model_dump() for item in parsed.items]
                for item in decisions:
                    item["model_used"] = model_for_verb
                    item["verb_frequency_tier"] = tier
                write_json(decisions_path, decisions)
                print(f"verb {index}/{len(verb_groups)} {verb}: ok ({len(decisions)} rows)")
            except Exception as exc:
                (batch_dir / f"{index:04d}_{slug}.error.txt").write_text(str(exc) + "\n", encoding="utf-8")
                print(f"verb {index}/{len(verb_groups)} {verb}: failed ({exc})")
            time.sleep(args.sleep_seconds)

    decisions = merge_decisions(output_dir)
    write_json(output_dir / "merged_decisions.json", decisions)
    trusted_keep, candidate_rewrites, quarantine = build_views(
        items,
        decisions,
        trust_threshold=args.trust_threshold,
        rewrite_threshold=args.rewrite_threshold,
    )
    write_json(output_dir / "trusted_keep.json", trusted_keep)
    write_json(output_dir / "candidate_rewrites.json", candidate_rewrites)
    write_json(output_dir / "quarantine.json", quarantine)
    write_summary(output_dir, config, items, decisions, trusted_keep, candidate_rewrites, quarantine)

    print("\nAudit complete.")
    print(f"  output_dir          : {output_dir}")
    print(f"  reviewed decisions  : {len(decisions)}")
    print(f"  trusted keep        : {len(trusted_keep)}")
    print(f"  candidate rewrites  : {len(candidate_rewrites)}")
    print(f"  quarantine          : {len(quarantine)}")


if __name__ == "__main__":
    main()
