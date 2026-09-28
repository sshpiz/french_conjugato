#!/usr/bin/env python3
"""
Targeted backfill for missing selected-complement French category phrases.

Goal:
- start from an existing cleaned phrase-harvest manifest
- find every missing (category, verb, family) target for a_selected / de_selected
- generate targeted candidates with retries
- accept only candidates that pass the mechanical parser/judge
- merge accepted rows back into a fresh rescored dataset
"""

from __future__ import annotations

import argparse
import json
import urllib.error
import urllib.request
from collections import defaultdict
from dataclasses import dataclass
from pathlib import Path
from typing import Literal

from pydantic import BaseModel, Field

from generate_category_phrase_harvest import (
    DEFAULT_JUDGE_MODEL,
    OpenAI,
    PhraseRow,
    attach_scores,
    call_parse,
    ensure_openai,
    judge_rows,
    load_category_spec,
    load_dicovalence_hints,
    mechanical_judgment_for_row,
    write_outputs,
)


TARGET_MODEL = "gpt-5.4"
OLLAMA_URL = "http://127.0.0.1:11434/api/chat"


class TargetedCandidateResponse(BaseModel):
    possible: bool = True
    reason: str = ""
    rows: list[PhraseRow] = Field(default_factory=list)


@dataclass
class MissingTarget:
    category_id: str
    category_name: str
    scope: str
    slug: str
    verb: str
    family: Literal["a", "de"]
    existing_labels: list[str]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--manifest", required=True, help="Rescored manifest to backfill from")
    parser.add_argument("--model", default=TARGET_MODEL)
    parser.add_argument("--judge-model", default=DEFAULT_JUDGE_MODEL)
    parser.add_argument("--out-dir", default="")
    parser.add_argument("--max-attempts", type=int, default=4)
    parser.add_argument("--candidates-per-attempt", type=int, default=8)
    return parser.parse_args()


def load_manifest_runs(manifest_path: Path) -> list[dict]:
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    return manifest.get("runs", [])


def load_basic_rows(json_path: Path) -> list[dict]:
    rows = json.loads(json_path.read_text(encoding="utf-8"))
    basic = []
    for row in rows:
        basic.append(
            {
                "verb": row["verb"],
                "sentence_fr": row["sentence_fr"],
                "translation_en": row["translation_en"],
                "tense": row.get("tense", ""),
                "subject": row.get("subject", ""),
                "note": row.get("note", ""),
            }
        )
    return basic


def collect_missing_targets(runs: list[dict]) -> tuple[dict[str, list[dict]], list[MissingTarget]]:
    rows_by_category: dict[str, list[dict]] = {}
    missing: list[MissingTarget] = []
    for run in runs:
        category_id = run["category_id"]
        category = load_category_spec(category_id)
        hints = load_dicovalence_hints(category_id)
        json_path = Path(f"{run['out_prefix']}.json")
        rows = json.loads(json_path.read_text(encoding="utf-8"))
        rows_by_category[category_id] = load_basic_rows(json_path)

        observed = defaultdict(set)
        for row in rows:
            observed[row["verb"]].add(row["bonus_label"])

        slug = Path(run["out_prefix"]).name.replace("phrase_harvest.", "")
        for verb in category["verbs"]:
            verb_hints = hints.get(verb, {})
            labels = sorted(observed.get(verb, set()))
            if verb_hints.get("a_ok") == "yes" or verb_hints.get("direct_a_ok") == "yes":
                if "a_selected" not in observed.get(verb, set()):
                    missing.append(
                        MissingTarget(
                            category_id=category_id,
                            category_name=category["name"],
                            scope=category["scope"],
                            slug=slug,
                            verb=verb,
                            family="a",
                            existing_labels=labels,
                        )
                    )
            if verb_hints.get("de_ok") == "yes":
                if "de_selected" not in observed.get(verb, set()):
                    missing.append(
                        MissingTarget(
                            category_id=category_id,
                            category_name=category["name"],
                            scope=category["scope"],
                            slug=slug,
                            verb=verb,
                            family="de",
                            existing_labels=labels,
                        )
                    )
    return rows_by_category, missing


def targeted_system_prompt() -> str:
    return (
        "You create natural modern French sentences for a verb-learning dataset. "
        "You are given one target verb, one semantic category, and one required selected-complement family. "
        "Your job is to write only sentences where that target family is genuinely expressed by the target verb. "
        "If the requested family is not natural, central, and learner-relevant for that verb in that category, set possible=false instead of forcing a weird sentence. "
        "Avoid literary, archaic, bureaucratically frozen, or misleading uses. "
        "Avoid movement/location uses for à unless the request explicitly allows movement. "
        "Avoid source/origin uses for de. "
        "Avoid noun-internal de, partitives, and nominal expressions that only look like de-complements. "
        "Return strict JSON only."
    )


def call_ollama_parse(model: str, system_prompt: str, user_prompt: str) -> TargetedCandidateResponse:
    payload = {
        "model": model.replace("ollama:", "", 1),
        "stream": False,
        "format": "json",
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
    }
    request = urllib.request.Request(
        OLLAMA_URL,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(request, timeout=180) as response:
        raw = json.loads(response.read().decode("utf-8"))
    content = raw.get("message", {}).get("content", "")
    return TargetedCandidateResponse.model_validate(json.loads(content))


def call_targeted_generation(model: str, client: OpenAI, target: MissingTarget, existing_rows: list[dict], attempt: int, previous_failures: list[str]) -> TargetedCandidateResponse:
    prompt = build_targeted_prompt(target, existing_rows, attempt, previous_failures)
    if model.startswith("ollama:"):
        return call_ollama_parse(model, targeted_system_prompt(), prompt)
    return call_parse(
        client=client,
        model=model,
        response_format=TargetedCandidateResponse,
        system_prompt=targeted_system_prompt(),
        user_prompt=prompt,
    )


def build_targeted_prompt(target: MissingTarget, existing_rows: list[dict], attempt: int, previous_failures: list[str]) -> str:
    current_examples = [row["sentence_fr"] for row in existing_rows if row["verb"] == target.verb][:3]
    family_label = "a_selected" if target.family == "a" else "de_selected"
    family_instructions = (
        "Need a true selected à-complement attached to the target verb. "
        "Good shapes include verb + à noun/pronoun or verb + à infinitive, as long as the à is part of the verb meaning. "
        "Do not use pure destination/location à."
        if target.family == "a"
        else
        "Need a true selected de-complement attached to the target verb. "
        "Good shapes include verb + de noun or verb + de infinitive, as long as the de is part of the verb meaning. "
        "Do not use partitives, source/origin de, or de inside a noun phrase."
    )
    failure_text = "\n".join(f"- {item}" for item in previous_failures[-6:]) if previous_failures else "(none yet)"
    example_text = "\n".join(f"- {item}" for item in current_examples) if current_examples else "(none in current rows yet)"
    return f"""
Category: {target.category_name}
Scope: {target.scope}
Target verb lemma: {target.verb}
Required family: {family_label}
Attempt: {attempt}

Current observed labels for this verb in this category: {", ".join(target.existing_labels) if target.existing_labels else "(none)"}
Existing phrase examples for this verb in this category:
{example_text}

What is required:
{family_instructions}

Quality requirements:
1. The sentence must be natural, modern, and category-faithful.
2. The target verb must clearly be the verb expressing the required family.
3. Keep the sentence concrete and learner-friendly.
4. Avoid location-only or source-only interpretations unless that is the requested family, which it is not.
5. Avoid noun-internal de traps like \"avis de passage\" or \"copie de votre pièce d'identité\".
6. If you cannot do this naturally, return possible=false with a short reason.

Recent rejected directions to avoid:
{failure_text}

Return up to 8 candidate rows.
""".strip()


def normalize_candidate(row: PhraseRow, verb: str) -> dict | None:
    if row.verb.strip().lower() != verb:
        return None
    sentence = row.sentence_fr.strip()
    translation = row.translation_en.strip()
    if not sentence or not translation:
        return None
    return {
        "verb": verb,
        "sentence_fr": sentence,
        "translation_en": translation,
        "tense": row.tense.strip(),
        "subject": row.subject.strip(),
        "note": row.note.strip(),
    }


def try_backfill_target(
    client: OpenAI,
    target: MissingTarget,
    hints: dict[str, dict[str, str]],
    existing_rows: list[dict],
    model: str,
    max_attempts: int,
    candidates_per_attempt: int,
) -> tuple[dict | None, dict]:
    previous_failures: list[str] = []
    target_label = "a_selected" if target.family == "a" else "de_selected"
    seen_sentences = {row["sentence_fr"].strip().lower() for row in existing_rows}

    for attempt in range(1, max_attempts + 1):
        try:
            response = call_targeted_generation(
                model=model,
                client=client,
                target=target,
                existing_rows=existing_rows,
                attempt=attempt,
                previous_failures=previous_failures,
            )
        except Exception as error:
            previous_failures.append(f"api_error:{type(error).__name__}")
            continue

        if not response.possible and not response.rows:
            previous_failures.append(f"model_impossible:{response.reason.strip() or 'no_reason'}")
            continue

        accepted_count = 0
        for item in response.rows[:candidates_per_attempt]:
            candidate = normalize_candidate(item, target.verb)
            if not candidate:
                previous_failures.append("bad_row_shape_or_wrong_verb")
                continue
            if candidate["sentence_fr"].lower() in seen_sentences:
                previous_failures.append(f"duplicate:{candidate['sentence_fr']}")
                continue

            verdict = mechanical_judgment_for_row(candidate, hints=hints)
            accepted_count += 1
            if verdict.get("label") == target_label:
                candidate["note"] = (candidate.get("note") or "").strip()
                return candidate, {
                    "status": "accepted",
                    "reason": verdict.get("reason", ""),
                    "attempt": attempt,
                    "target_label": target_label,
                }
            previous_failures.append(f"{candidate['sentence_fr']} -> {verdict.get('label')} ({verdict.get('reason','')})")

        if accepted_count == 0:
            previous_failures.append("no_usable_candidates_in_attempt")

    return None, {
        "status": "unresolved",
        "reason": previous_failures[-1] if previous_failures else "no_attempts",
        "attempt": max_attempts,
        "target_label": target_label,
        "failures": previous_failures[-12:],
    }


def merge_and_write(
    client: OpenAI,
    runs: list[dict],
    rows_by_category: dict[str, list[dict]],
    accepted_backfills: list[dict],
    out_dir: Path,
    judge_model: str,
) -> None:
    accepted_by_category: dict[str, list[dict]] = defaultdict(list)
    for item in accepted_backfills:
        accepted_by_category[item["category_id"]].append(item["row"])

    merged_runs = []
    for run in runs:
        category_id = run["category_id"]
        category = load_category_spec(category_id)
        hints = load_dicovalence_hints(category_id)
        merged_rows = list(rows_by_category[category_id]) + accepted_by_category.get(category_id, [])
        judged = judge_rows(
            client=client,
            judge_model=judge_model,
            rows=merged_rows,
            batch_size=40,
            hints=hints,
        )
        enriched = attach_scores(merged_rows, judged)
        relative_prefix = Path(run["out_prefix"]).relative_to(Path(run["out_prefix"]).parents[1])
        target_prefix = out_dir / relative_prefix
        write_outputs(category, run["model"], judge_model, enriched, target_prefix)
        merged_runs.append(
            {
                "category_id": category_id,
                "category_name": category["name"],
                "model": run["model"],
                "judge_model": judge_model,
                "out_prefix": str(target_prefix),
                "accepted_backfills": len(accepted_by_category.get(category_id, [])),
            }
        )

    manifest = {
        "source_runs": [run["out_prefix"] for run in runs],
        "out_dir": str(out_dir),
        "runs": merged_runs,
    }
    (out_dir / "manifest.json").write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def compute_coverage_summary(runs: list[dict], out_dir: Path) -> dict:
    summary = {"raw_targets": 0, "expressed": 0}
    for run in runs:
        rows = json.loads(Path(f"{out_dir / Path(run['out_prefix']).relative_to(Path(run['out_prefix']).parents[1])}.json").read_text())
        labels_by_verb = defaultdict(set)
        for row in rows:
            labels_by_verb[row["verb"]].add(row["bonus_label"])
        hints = load_dicovalence_hints(run["category_id"])
        category = load_category_spec(run["category_id"])
        for verb in category["verbs"]:
            verb_hints = hints.get(verb, {})
            if verb_hints.get("a_ok") == "yes" or verb_hints.get("direct_a_ok") == "yes":
                summary["raw_targets"] += 1
                if "a_selected" in labels_by_verb.get(verb, set()):
                    summary["expressed"] += 1
            if verb_hints.get("de_ok") == "yes":
                summary["raw_targets"] += 1
                if "de_selected" in labels_by_verb.get(verb, set()):
                    summary["expressed"] += 1
    return summary


def main() -> None:
    args = parse_args()
    ensure_openai()
    client = OpenAI()

    manifest_path = Path(args.manifest)
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    runs = [run for run in manifest.get("runs", []) if run["model"] == "gpt-5.4"]

    rows_by_category, missing_targets = collect_missing_targets(runs)
    print(f"Missing targets to backfill: {len(missing_targets)}")

    accepted_backfills = []
    decisions = []
    for target in missing_targets:
        hints = load_dicovalence_hints(target.category_id)
        row, decision = try_backfill_target(
            client=client,
            target=target,
            hints=hints,
            existing_rows=rows_by_category[target.category_id] + [item["row"] for item in accepted_backfills if item["category_id"] == target.category_id],
            model=args.model,
            max_attempts=args.max_attempts,
            candidates_per_attempt=args.candidates_per_attempt,
        )
        record = {
            "category_id": target.category_id,
            "category_name": target.category_name,
            "verb": target.verb,
            "family": target.family,
            "existing_labels": target.existing_labels,
            **decision,
        }
        if row is not None:
            accepted_backfills.append({"category_id": target.category_id, "row": row, "family": target.family})
            record["row"] = row
            print(f"ACCEPTED {target.category_id} {target.verb} {target.family}: {row['sentence_fr']}")
        else:
            print(f"UNRESOLVED {target.category_id} {target.verb} {target.family}: {decision['reason']}")
        decisions.append(record)

    if args.out_dir:
        out_dir = Path(args.out_dir)
    else:
        out_dir = manifest_path.parent.parent / f"{manifest_path.parent.name}_targeted_backfill"
    out_dir.mkdir(parents=True, exist_ok=True)

    merge_and_write(client, runs, rows_by_category, accepted_backfills, out_dir, args.judge_model)

    report = {
        "source_manifest": str(manifest_path),
        "generator_model": args.model,
        "judge_model": args.judge_model,
        "accepted_count": len(accepted_backfills),
        "missing_target_count": len(missing_targets),
        "decisions": decisions,
    }
    (out_dir / "backfill_report.json").write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    coverage = compute_coverage_summary(runs, out_dir)
    (out_dir / "coverage_summary.json").write_text(json.dumps(coverage, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Coverage after merge: {coverage['expressed']}/{coverage['raw_targets']}")


if __name__ == "__main__":
    main()
