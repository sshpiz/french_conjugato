#!/usr/bin/env python3
"""
Generate learner-facing verb glosses across all language repos via OpenAI.

The run is resumable:
- each language writes its own `verb_glosses.generated.json`
- results are flushed after every verb
- rerunning with --resume skips finished verbs

Optional:
- merge the generated glosses back into each repo's `js/verbs.full.js`
- recompress `js/verbs.full.generated.js` if a compressor script exists
"""

from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
import sys
import time
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Literal

from pydantic import BaseModel, Field

try:
    from openai import OpenAI
except ImportError:
    OpenAI = None


SCHEMA_VERSION = 2

REGISTER_LADDER = (
    "everyday",
    "common",
    "uncommon",
    "niche",
    "rare_usable",
    "archaic",
    "obsolete_or_unintelligible",
)

FREQUENCY_REGISTER_MAP = {
    "top20": "everyday",
    "top50": "common",
    "top100": "common",
    "top500": "uncommon",
    "top1000": "uncommon",
    "top2000": "uncommon",
    "top3000": "niche",
    "top4000": "niche",
    "top5000": "rare_usable",
}


@dataclass(frozen=True)
class LanguageConfig:
    key: str
    label: str
    repo_root: Path
    verbs_js: Path
    usages_js: Path | None = None
    core_patterns_json: Path | None = None
    output_json: Path | None = None
    review_md: Path | None = None
    compressor_script: Path | None = None


ROOT = Path(__file__).resolve().parent


def repo(path: str) -> Path:
    return Path("/Users/simeon/Desktop") / path


LANGUAGE_CONFIGS: dict[str, LanguageConfig] = {}


def register_language(
    key: str,
    label: str,
    repo_dir: str,
    *,
    usages: bool = True,
    core_patterns: bool = False,
    compressor: bool = True,
) -> None:
    repo_root = repo(repo_dir)
    LANGUAGE_CONFIGS[key] = LanguageConfig(
        key=key,
        label=label,
        repo_root=repo_root,
        verbs_js=repo_root / "js" / "verbs.full.js",
        usages_js=(repo_root / "verb_usages.js") if usages else None,
        core_patterns_json=(repo_root / "verb_core_patterns.json") if core_patterns else None,
        output_json=repo_root / "verb_glosses.generated.json",
        review_md=repo_root / "verb_glosses_review.md",
        compressor_script=(repo_root / "compress_large_js_objects.py") if compressor else None,
    )


register_language("french", "French", "proj1", usages=True, core_patterns=True, compressor=True)
register_language("spanish", "Spanish", "spanish-verbs", usages=True, compressor=True)
register_language("portuguese", "Portuguese", "portuguese-verbs", usages=True, compressor=True)
register_language("catalan", "Catalan", "catalan-verbs", usages=True, compressor=True)
register_language("russian", "Russian", "russian-verbs", usages=False, compressor=True)
register_language("greek", "Greek", "greek-verbs", usages=True, compressor=True)
register_language("ukrainian", "Ukrainian", "ukrainian-verbs", usages=False, compressor=True)
register_language("latvian", "Latvian", "latvian-verbs", usages=False, compressor=True)
register_language("german", "German", "german-verbs", usages=True, compressor=True)


class GlossResponse(BaseModel):
    translation: str = Field(description="Short learner-facing English gloss, usually an infinitive phrase.")
    alternate_glosses: list[str] = Field(default_factory=list, description="Up to three short alternative glosses.")
    base_usage: str = Field(description="One short learner-facing usage note for the most common sense.")
    usage_register: Literal[
        "everyday",
        "common",
        "uncommon",
        "niche",
        "rare_usable",
        "archaic",
        "obsolete_or_unintelligible",
    ] = Field(
        alias="register",
        description="Use the full scale carefully; reserve archaic/obsolete for truly non-current verbs."
    )
    confidence: float = Field(ge=0.0, le=1.0)
    needs_review: bool = False


def utc_stamp() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def ensure_openai_available() -> None:
    if OpenAI is None:
        sys.exit("The 'openai' package is not installed in this Python environment.")
    if not os.environ.get("OPENAI_API_KEY"):
        sys.exit("OPENAI_API_KEY is not set.")


def extract_js_literal(path: Path, prefix: str):
    text = path.read_text(encoding="utf-8")
    pattern = re.compile(re.escape(prefix) + r"\s*(\[[\s\S]*?\]);", re.MULTILINE)
    match = pattern.search(text)
    if not match:
        raise RuntimeError(f"Could not parse JS literal from {path}")
    return json.loads(match.group(1))


def load_verbs(path: Path) -> tuple[list[dict], str]:
    text = path.read_text(encoding="utf-8")
    match = re.search(r"(const verbs\s*=\s*)(\[[\s\S]*?\])\s*;", text)
    if not match:
        raise RuntimeError(f"Could not parse const verbs = [...] from {path}")
    return json.loads(match.group(2)), text


def save_verbs(path: Path, original_text: str, verbs: list[dict]) -> None:
    verbs_json = json.dumps(verbs, ensure_ascii=False, indent=2)
    updated = re.sub(
        r"(const verbs\s*=\s*)\[[\s\S]*?\]\s*;",
        lambda m: f"{m.group(1)}{verbs_json};",
        original_text,
        count=1,
    )
    path.write_text(updated, encoding="utf-8")


def load_usage_index(path: Path | None) -> dict[str, list[dict]]:
    if not path or not path.exists():
        return {}
    entries = extract_js_literal(path, "window.verbUsages =")
    index: dict[str, list[dict]] = {}
    for entry in entries:
        verb = str(entry.get("verb", "")).strip()
        if verb:
            index.setdefault(verb, []).append(entry)
    return index


def load_core_pattern_index(path: Path | None) -> dict[str, list[dict]]:
    if not path or not path.exists():
        return {}
    entries = json.loads(path.read_text(encoding="utf-8"))
    index: dict[str, list[dict]] = {}
    for entry in entries:
        verb = str(entry.get("verb", "")).strip()
        if verb:
            index[verb] = list(entry.get("core_patterns", []) or [])
    return index


def load_state(path: Path, language: str) -> dict:
    if path.exists():
        data = json.loads(path.read_text(encoding="utf-8"))
        if isinstance(data, dict) and isinstance(data.get("entries"), dict):
            return data
    return {
        "schema_version": SCHEMA_VERSION,
        "language": language,
        "updated_at": utc_stamp(),
        "entries": {},
    }


def save_state(path: Path, state: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    state["schema_version"] = SCHEMA_VERSION
    state["updated_at"] = utc_stamp()
    tmp_path = path.with_suffix(path.suffix + ".tmp")
    tmp_path.write_text(json.dumps(state, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    tmp_path.replace(path)


def normalize_text(text: str) -> str:
    text = re.sub(r"\s+", " ", str(text or "").strip())
    return text.strip(" .;")


def normalize_response(parsed: GlossResponse) -> dict:
    translation = normalize_text(parsed.translation)
    if translation and not translation.lower().startswith("to "):
        lower = translation.lower()
        if lower not in {"be", "have", "do", "go", "come"}:
            translation = f"to {translation}"
        elif lower in {"be", "have", "do"}:
            translation = f"to {translation}"
    alternates: list[str] = []
    seen = {translation.lower()}
    for item in parsed.alternate_glosses[:3]:
        clean = normalize_text(item)
        if not clean:
            continue
        if clean.lower() in seen:
            continue
        seen.add(clean.lower())
        alternates.append(clean)
    base_usage = normalize_text(parsed.base_usage)
    return {
        "translation": translation,
        "alternate_glosses": alternates,
        "base_usage": base_usage,
        "register": parsed.usage_register,
        "confidence": round(float(parsed.confidence), 3),
        "needs_review": bool(parsed.needs_review),
    }


def normalize_frequency_bucket(value) -> str:
    return str(value or "").strip().lower()


def deterministic_register_from_frequency(bucket: str) -> str | None:
    return FREQUENCY_REGISTER_MAP.get(bucket)


def resolve_register(model_register: str, frequency_bucket: str) -> str:
    forced = deterministic_register_from_frequency(frequency_bucket)
    if forced:
        return forced
    model_register = str(model_register or "").strip()
    if model_register not in REGISTER_LADDER:
        return "rare_usable"
    if frequency_bucket == "rare" and model_register == "everyday":
        return "common"
    return model_register


def entry_is_current(state: dict, entry: dict | None) -> bool:
    if not entry or entry.get("status") != "done":
        return False
    if int(state.get("schema_version", 0) or 0) < SCHEMA_VERSION:
        return False
    return str(entry.get("register") or "") in REGISTER_LADDER


def short_usage_examples(items: list[dict], limit: int = 3) -> list[dict]:
    trimmed = []
    for item in items[:limit]:
        trimmed.append(
            {
                "pattern": item.get("pattern", ""),
                "meaning_en": item.get("meaning_en", ""),
                "example_local": item.get("example_fr", "") or item.get("example_local", ""),
                "example_en": item.get("example_en", ""),
                "comment": item.get("comment", ""),
            }
        )
    return trimmed


def short_core_patterns(items: list[dict], limit: int = 3) -> list[dict]:
    trimmed = []
    for item in items[:limit]:
        trimmed.append(
            {
                "pattern": item.get("pattern", ""),
                "meaning_en": item.get("meaning_en", ""),
                "notes": item.get("notes", ""),
                "confidence": item.get("confidence", ""),
            }
        )
    return trimmed


def system_prompt() -> str:
    return """You generate very compact, learner-facing English glosses for verb lemmas in language-learning apps.

Goals:
- produce one reliable base translation
- produce one short base-usage note
- place each verb on a learner-facing modern-usage ladder carefully

Rules:
- `translation` should be short, natural, and learner-facing.
- Prefer English infinitive phrases like `to remain`, `to discover`, `to get up`.
- `base_usage` should be one short note about the most central modern use, not an essay.
- Allowed register labels are:
  - `everyday`: very common daily-life verb
  - `common`: broadly common and normal
  - `uncommon`: normal but noticeably less frequent
  - `niche`: specialized, literary, or limited-domain but still current
  - `rare_usable`: rare, but still current/usable and broadly understandable
  - `archaic`: old-fashioned or archaic in modern standard usage
  - `obsolete_or_unintelligible`: so obsolete/unusual that using it would sound bizarre or may not be understood
- Use `archaic` only when the verb is genuinely dated/non-current in modern standard usage.
- Use `obsolete_or_unintelligible` only for truly dead, obsolete, or essentially unusable modern entries.
- If the verb is reflexive, separable, impersonal, or otherwise special, reflect that in the gloss/usage note.
- If uncertain or the verb is polysemous in a way that could mislead learners, set `needs_review` to true.
- Keep output practical and restrained. No dictionary paragraphs.
"""


def user_prompt(config: LanguageConfig, verb: dict, usages: list[dict], core_patterns: list[dict]) -> str:
    frequency_bucket = normalize_frequency_bucket(verb.get("frequency", ""))
    payload = {
        "language": config.label,
        "lemma": verb.get("infinitive", ""),
        "existing_translation": verb.get("translation", ""),
        "existing_hint": verb.get("hint", ""),
        "frequency": verb.get("frequency", ""),
        "frequency_bucket": frequency_bucket,
        "suggested_register_from_frequency": deterministic_register_from_frequency(frequency_bucket),
        "usage_count": verb.get("usage_count", 0),
        "category": verb.get("category", ""),
        "reflexive": verb.get("reflexive", None),
        "perfect_auxiliary": verb.get("perfect_auxiliary", ""),
        "usage_examples": short_usage_examples(usages, limit=3),
        "core_patterns": short_core_patterns(core_patterns, limit=3),
    }
    return (
        "Generate a structured gloss entry for this verb.\n"
        "Use the full register ladder thoughtfully.\n"
        "Treat the frequency bucket as a strong hint, especially for high-frequency verbs.\n"
        "Do not mark high-frequency verbs as archaic, obsolete, niche, or rare.\n"
        "Reserve `archaic` and `obsolete_or_unintelligible` for genuinely non-current modern usage.\n\n"
        f"{json.dumps(payload, ensure_ascii=False, indent=2)}"
    )


def call_model(
    client: OpenAI,
    *,
    model: str,
    reasoning_effort: str | None,
    config: LanguageConfig,
    verb: dict,
    usages: list[dict],
    core_patterns: list[dict],
) -> dict:
    kwargs = {
        "model": model,
        "response_format": GlossResponse,
        "messages": [
            {"role": "system", "content": system_prompt()},
            {"role": "user", "content": user_prompt(config, verb, usages, core_patterns)},
        ],
    }
    if reasoning_effort:
        kwargs["reasoning_effort"] = reasoning_effort
    completion = client.chat.completions.parse(**kwargs)
    message = completion.choices[0].message
    if not message.parsed:
        raise RuntimeError("Structured output parsing failed.")
    return normalize_response(message.parsed)


def selected_languages(args: argparse.Namespace) -> list[LanguageConfig]:
    if not args.languages:
        return [LANGUAGE_CONFIGS[key] for key in LANGUAGE_CONFIGS]
    configs = []
    for key in args.languages:
        if key not in LANGUAGE_CONFIGS:
            raise SystemExit(f"Unknown language: {key}")
        configs.append(LANGUAGE_CONFIGS[key])
    return configs


def select_targets(args: argparse.Namespace, verbs: list[dict]) -> list[dict]:
    selected = verbs
    if args.verbs:
        wanted = {value.strip() for value in args.verbs}
        selected = [verb for verb in selected if verb.get("infinitive") in wanted]
    if args.max_verbs:
        selected = selected[: args.max_verbs]
    return selected


def write_review(config: LanguageConfig, state: dict) -> None:
    if not config.review_md:
        return
    entries = state.get("entries", {})
    done = [entry for entry in entries.values() if entry.get("status") == "done"]
    errors = [entry for entry in entries.values() if entry.get("status") == "error"]
    review = [f"# {config.label} Verb Gloss Review", ""]
    review.append(f"- done: {len(done)}")
    review.append(f"- errors: {len(errors)}")
    for label in REGISTER_LADDER:
        count = len([entry for entry in done if entry.get("register") == label])
        review.append(f"- {label}: {count}")
    review.append("")

    flagged = sorted(
        [entry for entry in done if entry.get("needs_review") or entry.get("confidence", 1.0) < 0.8],
        key=lambda entry: (entry.get("confidence", 1.0), entry.get("verb", "")),
    )
    if flagged:
        review.append("## Needs Review")
        review.append("")
        for entry in flagged[:400]:
            review.append(
                f"- `{entry['verb']}` → `{entry.get('translation','')}` | "
                f"{entry.get('base_usage','')} | register={entry.get('register','')} | "
                f"confidence={entry.get('confidence','')}"
            )
        review.append("")

    tail_labels = ("niche", "rare_usable", "archaic", "obsolete_or_unintelligible")
    tail_entries = [entry for entry in done if entry.get("register") in tail_labels]
    if tail_entries:
        review.append("## Tail / Removal Candidates")
        review.append("")
        for entry in sorted(tail_entries, key=lambda e: (e.get("register", ""), e["verb"]))[:1200]:
            review.append(
                f"- `{entry['verb']}` → `{entry.get('translation','')}` | "
                f"{entry.get('base_usage','')} | register={entry.get('register','')}"
            )
        review.append("")

    if errors:
        review.append("## Errors")
        review.append("")
        for entry in sorted(errors, key=lambda e: e["verb"])[:400]:
            review.append(
                f"- `{entry['verb']}` failed after {entry.get('attempts', 0)} attempts: "
                f"{entry.get('last_error', '')}"
            )
        review.append("")

    config.review_md.write_text("\n".join(review).rstrip() + "\n", encoding="utf-8")


def merge_state_into_verbs(config: LanguageConfig, state: dict, skip_compress: bool) -> None:
    verbs, original_text = load_verbs(config.verbs_js)
    entries = state.get("entries", {})
    updated = 0
    for verb in verbs:
        lemma = verb.get("infinitive")
        entry = entries.get(lemma)
        if not entry or entry.get("status") != "done":
            continue
        verb["translation"] = entry["translation"]
        verb["hint"] = entry["base_usage"]
        verb["register"] = entry["register"]
        verb["alternate_glosses"] = list(entry.get("alternate_glosses", []) or [])
        verb["gloss_confidence"] = entry.get("confidence")
        verb["gloss_needs_review"] = bool(entry.get("needs_review"))
        updated += 1

    save_verbs(config.verbs_js, original_text, verbs)
    print(f"[{config.key}] merged {updated} gloss entries into {config.verbs_js.name}")

    if skip_compress:
        return
    if config.compressor_script and config.compressor_script.exists():
        subprocess.run(
            [sys.executable, str(config.compressor_script), str(config.verbs_js)],
            cwd=str(config.repo_root),
            check=True,
        )
        print(f"[{config.key}] recompressed {config.verbs_js.name}")


def run_language(args: argparse.Namespace, client: OpenAI | None, config: LanguageConfig) -> None:
    verbs, _ = load_verbs(config.verbs_js)
    usages_by_verb = load_usage_index(config.usages_js)
    patterns_by_verb = load_core_pattern_index(config.core_patterns_json)
    state = load_state(config.output_json, config.key) if config.output_json else {"entries": {}}
    entries = state["entries"]

    targets = select_targets(args, verbs)
    if args.dry_run:
        print(
            f"[{config.key}] dry run: {len(targets)} target verbs | "
            f"usages={len(usages_by_verb)} verbs | core_patterns={len(patterns_by_verb)} verbs"
        )
        return

    if args.merge_only:
        merge_state_into_verbs(config, state, skip_compress=args.skip_compress)
        return

    assert client is not None
    print(f"[{config.key}] {len(targets)} target verbs")
    completed = 0

    for index, verb in enumerate(targets, start=1):
        lemma = str(verb.get("infinitive", "")).strip()
        if not lemma:
            continue
        existing = entries.get(lemma)
        if (
            args.resume
            and existing
            and entry_is_current(state, existing)
            and not args.overwrite
        ):
            continue

        attempts = int(existing.get("attempts", 0)) if existing else 0
        usages = usages_by_verb.get(lemma, [])
        core_patterns = patterns_by_verb.get(lemma, [])

        for attempt in range(1, args.max_attempts + 1):
            try:
                result = call_model(
                    client,
                    model=args.model,
                    reasoning_effort=args.reasoning_effort,
                    config=config,
                    verb=verb,
                    usages=usages,
                    core_patterns=core_patterns,
                )
                entries[lemma] = {
                    "verb": lemma,
                    "status": "done",
                    "translation": result["translation"],
                    "alternate_glosses": result["alternate_glosses"],
                    "base_usage": result["base_usage"],
                    "register": resolve_register(
                        result["register"],
                        normalize_frequency_bucket(verb.get("frequency", "")),
                    ),
                    "model_register": result["register"],
                    "confidence": result["confidence"],
                    "needs_review": result["needs_review"],
                    "attempts": attempts + attempt,
                    "model": args.model,
                    "updated_at": utc_stamp(),
                }
                save_state(config.output_json, state)
                completed += 1
                print(
                    f"[{config.key}] {index}/{len(targets)} {lemma}: "
                    f"{result['translation']} | {result['register']}"
                )
                break
            except Exception as exc:
                entries[lemma] = {
                    "verb": lemma,
                    "status": "error",
                    "attempts": attempts + attempt,
                    "last_error": str(exc),
                    "updated_at": utc_stamp(),
                }
                save_state(config.output_json, state)
                if attempt >= args.max_attempts:
                    print(f"[{config.key}] {index}/{len(targets)} {lemma}: ERROR {exc}")
                else:
                    sleep_for = args.sleep_seconds * attempt
                    print(
                        f"[{config.key}] {index}/{len(targets)} {lemma}: retry {attempt}/{args.max_attempts} "
                        f"after error: {exc}"
                    )
                    time.sleep(sleep_for)
        time.sleep(args.sleep_seconds)

    write_review(config, state)
    print(f"[{config.key}] completed {completed} new glosses")

    if args.merge:
        merge_state_into_verbs(config, state, skip_compress=args.skip_compress)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Generate resumable verb glosses across all language repos.")
    parser.add_argument("--language", action="append", dest="languages", choices=sorted(LANGUAGE_CONFIGS.keys()))
    parser.add_argument("--verb", action="append", dest="verbs", help="Only process one explicit infinitive. Repeatable.")
    parser.add_argument("--model", default="gpt-5.4", help="OpenAI model to use.")
    parser.add_argument("--reasoning-effort", choices=["low", "medium", "high", "xhigh"], default="medium")
    parser.add_argument("--resume", action="store_true", default=True, help="Skip already completed verbs.")
    parser.add_argument("--overwrite", action="store_true", help="Re-generate even completed entries.")
    parser.add_argument("--max-verbs", type=int, help="Optional cap for testing.")
    parser.add_argument("--sleep-seconds", type=float, default=0.2)
    parser.add_argument("--max-attempts", type=int, default=3)
    parser.add_argument("--merge", action="store_true", help="Merge completed glosses back into each repo's verbs.full.js")
    parser.add_argument("--merge-only", action="store_true", help="Skip API calls; only merge existing gloss artifacts.")
    parser.add_argument("--skip-compress", action="store_true", help="Do not regenerate verbs.full.generated.js after merge.")
    parser.add_argument("--dry-run", action="store_true", help="Show counts and exit without calling the API.")
    return parser


def main() -> None:
    parser = build_parser()
    args = parser.parse_args()
    if args.merge_only and args.dry_run:
        parser.error("--merge-only and --dry-run cannot be used together.")

    configs = selected_languages(args)
    client = None
    if not args.dry_run and not args.merge_only:
        ensure_openai_available()
        client = OpenAI()

    for config in configs:
        run_language(args, client, config)


if __name__ == "__main__":
    main()
