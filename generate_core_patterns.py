#!/usr/bin/env python3
"""
generate_core_patterns.py
=========================
Generate learner-facing French core verb patterns with structured output.

The source of truth is verb_core_patterns.json.
This script also keeps verb_core_patterns.js and verb_core_patterns_review.md in sync.
"""

from __future__ import annotations

import argparse
import os
import sys
import time

from pydantic import BaseModel, Field

from core_patterns_lib import (
    INPUT_FILE,
    JS_FILE,
    assign_pattern_ids,
    infer_pattern_type,
    load_core_patterns_prefer_json,
    load_usage_index,
    load_verbs,
    normalize_entries,
    normalize_meaning_text,
    normalize_pattern_text,
    pattern_priority,
    write_core_patterns_js,
    write_json,
    write_review,
)

try:
    from openai import OpenAI
except ImportError:
    OpenAI = None


RICH_VERBS = {
    "aller", "avoir", "dire", "faire", "mettre", "parler", "passer", "penser",
    "prendre", "venir", "voir", "vouloir", "être", "falloir", "trouver", "jouer",
}

ALLOWED_PATTERN_SHAPES = [
    "V",
    "V qqn",
    "V qqch",
    "V qqn / qqch",
    "V à + lieu",
    "V chez + qqn",
    "V à qqn",
    "V à qqn / qqch",
    "V de qqn / qqch",
    "V + infinitif",
    "V à + infinitif",
    "V de + infinitif",
    "V si + proposition",
    "V que + proposition",
    "V qqch à qqn",
    "V qqch de qqn",
    "V qqn + infinitif",
    "V qqn / qqch + adjectif",
    "se V",
    "se V à qqn",
    "se V à qqn / qqch",
    "se V de qqn / qqch",
    "se V + infinitif",
    "se V à + infinitif",
    "se V avec qqn",
    "se V si + proposition",
    "se V que + proposition",
    "il V + nom",
    "il V + infinitif",
    "il V que + subj.",
]

STYLE_EXAMPLES = [
    ("parler à qqn", "speak to someone"),
    ("parler de qqch", "talk about something"),
    ("aimer qqn / qqch", "like; love someone / something"),
    ("demander qqch à qqn", "ask someone for something"),
    ("demander à qqn de + infinitif", "ask someone to do something"),
    ("jouer à + jeu / sport", "play a game / sport"),
    ("jouer de + instrument", "play an instrument"),
]


class PatternCandidate(BaseModel):
    pattern: str
    meaning_en: str
    pattern_type: str = ""
    notes: str = ""
    confidence: float = Field(default=0.0, ge=0.0, le=1.0)


class VerbPatternResponse(BaseModel):
    verb: str
    core_patterns: list[PatternCandidate]


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Generate French core patterns.")
    parser.add_argument("--model", default="gpt-5", help="OpenAI model to use.")
    parser.add_argument("--tier", action="append", dest="tiers", help="Frequency tier(s) to include, e.g. top20.")
    parser.add_argument("--verb", action="append", dest="verbs", help="Generate for one explicit verb. Repeat to pass several.")
    parser.add_argument("--resume", action="store_true", help="Skip verbs already present in verb_core_patterns.json.")
    parser.add_argument("--overwrite", action="store_true", help="Replace existing entries for target verbs.")
    parser.add_argument("--max-verbs", type=int, help="Optional cap for test runs.")
    parser.add_argument("--reasoning-effort", choices=["low", "medium", "high", "xhigh"])
    parser.add_argument("--sleep-seconds", type=float, default=0.5)
    parser.add_argument("--sync-only", action="store_true", help="Normalize and rewrite JSON/JS/review files without calling the API.")
    return parser


def max_patterns_for_verb(verb: str) -> int:
    return 5 if verb in RICH_VERBS else 4


def system_prompt() -> str:
    style_examples = "\n".join(f'- `{pattern}` = {meaning}' for pattern, meaning in STYLE_EXAMPLES)
    allowed = "\n".join(f"- {shape}" for shape in ALLOWED_PATTERN_SHAPES)
    return f"""You are writing a very high-trust French "core patterns" layer for a serious language-learning app.

The product goal is not to list every possible usage.
The goal is to show only the most important, learner-relevant core constructions for a verb.

Priorities:
- French complementation accuracy
- usefulness for pronouns and argument structure
- compact dictionary-like style
- fewer rows is better than speculative rows
- if uncertain, omit the pattern

Allowed pattern-shape inventory:
{allowed}

Style examples:
{style_examples}

Rules:
- Output only patterns that are common, everyday, and genuinely useful for learners.
- First prioritize: direct object, bare infinitive, `à`, `de`, `que`, `si`, and combo frames like `V qqch à qqn`.
- For reflexive verbs, still prefer the same complement logic: `se V`, `se V à ...`, `se V de ...`, `se V si ...`, `se V que ...`.
- Split patterns only when grammar, meaning, or pronoun consequences differ in a useful way.
- Merge `qqn` / `qqch` when the same row is genuinely fine for both.
- Keep pattern labels canonical and compact.
- Keep English glosses natural and short.
- Avoid vague glosses like "thing", "someone / something adjective", or clunky metalanguage.
- If a verb has an important direct-vs-`à`-vs-`de` contrast, that contrast matters more than broader semantic variety.
- Do not force a weak `+ adjectif` row or a fixed idiom unless it is clearly more central than the main complement frames.
- Do not invent evidence. Use the supplied usage nuggets as grounding, but you may omit noisy or overly rich ones.
- If a verb only has 1-2 high-value core patterns, return only those.
"""


def user_prompt(verb: dict, usage_examples: list[dict]) -> str:
    infinitive = verb["infinitive"]
    translation = verb.get("translation", "")
    hint = verb.get("hint", "")
    frequency = verb.get("frequency", "")
    max_patterns = max_patterns_for_verb(infinitive)

    evidence_lines = []
    for item in usage_examples[:8]:
        evidence_lines.append(
            f'- pattern: {item.get("pattern", "")} | meaning: {item.get("meaning_en", "")} | '
            f'FR: {item.get("example_fr", "")}'
        )
    evidence_text = "\n".join(evidence_lines) if evidence_lines else "- (no usage nuggets available)"

    return f"""Verb: {infinitive}
Translation: {translation}
Hint: {hint or "(none)"}
Frequency tier: {frequency or "(unknown)"}
Target: return at most {max_patterns} core patterns.

Usage evidence:
{evidence_text}

Return structured JSON for this verb.
Each core pattern should include:
- pattern
- meaning_en
- optional pattern_type
- optional notes
- confidence

Remember:
- optimize for what a learner most needs to know first
- explicitly prefer direct vs bare-infinitive vs `à` vs `de` vs `que` vs `si` contrasts when they are core
- preserve combo frames like `qqch à qqn` when they are central
- prefer omission over shaky rows
- keep the label clean enough to ship directly
"""


def ensure_openai_key() -> None:
    if not os.environ.get("OPENAI_API_KEY"):
        sys.exit("OPENAI_API_KEY is not set in the environment.")
    if OpenAI is None:
        sys.exit("openai package is not installed.")


def call_model(client: OpenAI, model: str, verb: dict, usage_examples: list[dict], reasoning_effort: str | None) -> dict:
    kwargs = {
        "model": model,
        "response_format": VerbPatternResponse,
        "messages": [
            {"role": "system", "content": system_prompt()},
            {"role": "user", "content": user_prompt(verb, usage_examples)},
        ],
    }
    if reasoning_effort:
        kwargs["reasoning_effort"] = reasoning_effort

    completion = client.chat.completions.parse(**kwargs)
    message = completion.choices[0].message
    if not message.parsed:
        raise RuntimeError("Structured output parsing failed.")
    return message.parsed.model_dump()


def merge_entry(existing_entries: list[dict], new_entry: dict, overwrite: bool) -> list[dict]:
    by_verb = {entry["verb"]: entry for entry in existing_entries}
    if overwrite or new_entry["verb"] not in by_verb:
        by_verb[new_entry["verb"]] = new_entry

    ordered_verbs = []
    seen = set()
    for entry in existing_entries:
        verb = entry["verb"]
        if verb not in seen:
            ordered_verbs.append(verb)
            seen.add(verb)
    if new_entry["verb"] not in seen:
        ordered_verbs.append(new_entry["verb"])

    return [by_verb[verb] for verb in ordered_verbs if verb in by_verb]


def concretize_pattern(pattern: str, infinitive: str) -> str:
    if pattern == "V":
        return infinitive
    if pattern.startswith("V "):
        return infinitive + pattern[1:]
    if pattern == "se V":
        return infinitive
    if pattern.startswith("se V "):
        return infinitive + pattern[4:]
    return pattern


def clean_generated_patterns(infinitive: str, candidates: list[dict], limit: int) -> list[dict]:
    cleaned: list[dict] = []
    seen_patterns: set[str] = set()

    scored = []
    for candidate in candidates:
        pattern = normalize_pattern_text(concretize_pattern(candidate.get("pattern", ""), infinitive))
        meaning_en = normalize_meaning_text(candidate.get("meaning_en", ""))
        if not pattern or not meaning_en:
            continue
        pattern_key = pattern.lower()
        if pattern_key in seen_patterns:
            continue
        seen_patterns.add(pattern_key)
        pattern_type = infer_pattern_type(pattern)
        confidence = float(candidate.get("confidence", 0.0) or 0.0)
        scored.append(
            (
                -pattern_priority(pattern),
                -confidence,
                pattern,
                {
                    "pattern": pattern,
                    "meaning_en": meaning_en,
                    "pattern_type": pattern_type,
                    "notes": normalize_meaning_text(candidate.get("notes", "")),
                    "confidence": confidence,
                },
            )
        )

    for _, _, _, item in sorted(scored):
        cleaned.append(item)
        if len(cleaned) >= limit:
            break
    return cleaned


def sync_outputs(entries: list[dict]) -> list[dict]:
    entries = assign_pattern_ids(normalize_entries(entries))
    write_json(INPUT_FILE, entries)
    write_core_patterns_js(entries)
    write_review(entries)
    return entries


def main() -> None:
    args = build_parser().parse_args()
    entries = load_core_patterns_prefer_json() if (INPUT_FILE.exists() or JS_FILE.exists()) else []

    if args.sync_only:
        sync_outputs(entries)
        print(f"Synced {INPUT_FILE.name}, verb_core_patterns.js, and verb_core_patterns_review.md")
        return

    ensure_openai_key()
    client = OpenAI()
    usage_index = load_usage_index()

    tiers = set(args.tiers or ["top20", "top50"])
    target_verbs = load_verbs(tiers)
    if args.verbs:
        requested_verbs = [verb.strip() for verb in args.verbs if verb and verb.strip()]
        target_verbs = [verb for verb in load_verbs(None) if verb.get("infinitive") in requested_verbs]
        found_verbs = {verb.get("infinitive", "") for verb in target_verbs}
        missing = [verb for verb in requested_verbs if verb not in found_verbs]
        if missing:
            sys.exit(f"Verb not found: {', '.join(missing)}")
        target_verbs.sort(key=lambda item: requested_verbs.index(item.get("infinitive", "")))
    if args.max_verbs:
        target_verbs = target_verbs[: args.max_verbs]

    existing_verbs = {entry["verb"] for entry in entries}

    for index, verb in enumerate(target_verbs, start=1):
        infinitive = verb["infinitive"]
        if args.resume and infinitive in existing_verbs and not args.overwrite:
            print(f"{index}/{len(target_verbs)} {infinitive}: skipped (already present)")
            continue

        generated = call_model(
            client,
            args.model,
            verb,
            usage_index.get(infinitive, []),
            args.reasoning_effort,
        )

        clean_entry = {
            "verb": infinitive,
            "core_patterns": [],
        }
        for candidate in clean_generated_patterns(
            infinitive,
            generated.get("core_patterns", []),
            limit=max_patterns_for_verb(infinitive),
        ):
            clean_entry["core_patterns"].append(
                {
                    "pattern": candidate.get("pattern", ""),
                    "meaning_en": candidate.get("meaning_en", ""),
                    "pattern_type": candidate.get("pattern_type", ""),
                    "notes": candidate.get("notes", ""),
                    "confidence": candidate.get("confidence", 0.0),
                    "source": f"ai:{args.model}",
                    "status": "candidate",
                }
            )

        entries = merge_entry(entries, clean_entry, overwrite=args.overwrite)
        entries = sync_outputs(entries)
        print(f"{index}/{len(target_verbs)} {infinitive}: saved {len(clean_entry['core_patterns'])} core patterns")
        time.sleep(args.sleep_seconds)


if __name__ == "__main__":
    main()
