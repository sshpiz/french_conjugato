#!/usr/bin/env python3
"""
Generate normalized expansion-layer verb candidates for multiple language repos.

This intentionally writes ONLY to expansion-layer artifacts:
- <repo>/expansion/verb_expansion_candidates.json
- <repo>/expansion/expansion_review.md (append/update-friendly)

It does NOT mutate repo-native runtime files like js/verbs.full.js.
"""

from __future__ import annotations

import argparse
import os
import re
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Literal

from pydantic import BaseModel, Field

from expansion_lib import (
    CandidateSource,
    VerbExpansionCandidate,
    VerbExpansionCandidatesFile,
    load_candidates_file,
    load_verbs_js,
    unique_lemmas_from_verbs,
    utc_stamp,
    write_candidates_file,
)

try:
    from openai import OpenAI
except ImportError:
    OpenAI = None


@dataclass(frozen=True)
class LanguageConfig:
    key: str
    label: str
    repo_root: Path
    verbs_js: Path
    candidates_json: Path
    review_md: Path
    default_frequency: str | None = None
    generation: Literal["openai", "skip"] = "skip"


def repo(path: str) -> Path:
    return Path(__file__).resolve().parents[2] / path


LANGS: dict[str, LanguageConfig] = {
    "french": LanguageConfig(
        key="french",
        label="French",
        repo_root=repo("proj1"),
        verbs_js=repo("proj1/js/verbs.full.js"),
        candidates_json=repo("proj1/expansion/verb_expansion_candidates.json"),
        review_md=repo("proj1/expansion/expansion_review.md"),
        generation="skip",
    ),
    "spanish": LanguageConfig(
        key="spanish",
        label="Spanish",
        repo_root=repo("spanish-verbs"),
        verbs_js=repo("spanish-verbs/js/verbs.full.js"),
        candidates_json=repo("spanish-verbs/expansion/verb_expansion_candidates.json"),
        review_md=repo("spanish-verbs/expansion/expansion_review.md"),
        generation="skip",
    ),
    "portuguese": LanguageConfig(
        key="portuguese",
        label="Portuguese",
        repo_root=repo("portuguese-verbs"),
        verbs_js=repo("portuguese-verbs/js/verbs.full.js"),
        candidates_json=repo("portuguese-verbs/expansion/verb_expansion_candidates.json"),
        review_md=repo("portuguese-verbs/expansion/expansion_review.md"),
        generation="skip",
    ),
    "italian": LanguageConfig(
        key="italian",
        label="Italian",
        repo_root=repo("italian-verbs"),
        verbs_js=repo("italian-verbs/js/verbs.full.js"),
        candidates_json=repo("italian-verbs/expansion/verb_expansion_candidates.json"),
        review_md=repo("italian-verbs/expansion/expansion_review.md"),
        generation="skip",
    ),
    "german": LanguageConfig(
        key="german",
        label="German",
        repo_root=repo("german-verbs"),
        verbs_js=repo("german-verbs/js/verbs.full.js"),
        candidates_json=repo("german-verbs/expansion/verb_expansion_candidates.json"),
        review_md=repo("german-verbs/expansion/expansion_review.md"),
        default_frequency="rare",
        generation="openai",
    ),
    "greek": LanguageConfig(
        key="greek",
        label="Greek",
        repo_root=repo("greek-verbs"),
        verbs_js=repo("greek-verbs/js/verbs.full.js"),
        candidates_json=repo("greek-verbs/expansion/verb_expansion_candidates.json"),
        review_md=repo("greek-verbs/expansion/expansion_review.md"),
        generation="skip",
    ),
    "catalan": LanguageConfig(
        key="catalan",
        label="Catalan",
        repo_root=repo("catalan-verbs"),
        verbs_js=repo("catalan-verbs/js/verbs.full.js"),
        candidates_json=repo("catalan-verbs/expansion/verb_expansion_candidates.json"),
        review_md=repo("catalan-verbs/expansion/expansion_review.md"),
        generation="skip",
    ),
    "russian": LanguageConfig(
        key="russian",
        label="Russian",
        repo_root=repo("russian-verbs"),
        verbs_js=repo("russian-verbs/js/verbs.full.js"),
        candidates_json=repo("russian-verbs/expansion/verb_expansion_candidates.json"),
        review_md=repo("russian-verbs/expansion/expansion_review.md"),
        default_frequency="top1000",
        generation="openai",
    ),
    "ukrainian": LanguageConfig(
        key="ukrainian",
        label="Ukrainian",
        repo_root=repo("ukrainian-verbs"),
        verbs_js=repo("ukrainian-verbs/js/verbs.full.js"),
        candidates_json=repo("ukrainian-verbs/expansion/verb_expansion_candidates.json"),
        review_md=repo("ukrainian-verbs/expansion/expansion_review.md"),
        generation="skip",
    ),
    "latvian": LanguageConfig(
        key="latvian",
        label="Latvian",
        repo_root=repo("latvian-verbs"),
        verbs_js=repo("latvian-verbs/js/verbs.full.js"),
        candidates_json=repo("latvian-verbs/expansion/verb_expansion_candidates.json"),
        review_md=repo("latvian-verbs/expansion/expansion_review.md"),
        generation="skip",
    ),
}


class CandidateBatch(BaseModel):
    candidates: list[VerbExpansionCandidate] = Field(default_factory=list)


def ensure_openai_available() -> None:
    if OpenAI is None:
        raise SystemExit("The 'openai' package is not installed in this Python environment.")
    if not os.environ.get("OPENAI_API_KEY"):
        raise SystemExit("OPENAI_API_KEY is not set.")


_GERMAN_ALLOWED = re.compile(r"^[a-zäöüß]+$", re.I)
_RUSSIAN_ALLOWED = re.compile(r"^[А-Яа-яЁё]+$", re.I)


def candidate_is_plausible(language: str, infinitive: str) -> bool:
    value = infinitive.strip()
    if not value:
        return False
    if " " in value or "\t" in value or "\n" in value:
        return False
    if language == "german":
        return bool(_GERMAN_ALLOWED.match(value))
    if language == "russian":
        return bool(_RUSSIAN_ALLOWED.match(value))
    return True


def system_prompt(language_label: str) -> str:
    return f"""You are generating high-quality verb-lemma expansion candidates for a language-learning verb trainer.

Language: {language_label}

Output rules:
- Return strict JSON only (no markdown).
- Output must match the provided JSON schema exactly.
- Infinitives must be single-token lemmas (no spaces).
- Avoid archaic/unusable dictionary filler. Prefer modern, teachable, learner-useful verbs.
- Include slang/colloquial/vulgar only when genuinely useful and natural; tag it via style_tags.
- Do not output duplicates within the same response.
"""


def user_prompt(*, config: LanguageConfig, n: int) -> str:
    # Keep prompts short: we filter out existing/duplicate lemmas locally.
    language_specific = ""
    if config.key == "german":
        language_specific = (
            "German constraints:\n"
            "- Infinitives are lowercase, single words (e.g. 'anrufen', 'aufstehen').\n"
            "- Prefer verbs that a learner could plausibly want (work, life, travel, emotions, internet).\n"
        )
    elif config.key == "russian":
        language_specific = (
            "Russian constraints:\n"
            "- Output Cyrillic infinitives only.\n"
            "- Prefer modern standard Russian; avoid rare Church/archaic verbs.\n"
            "- Prefer imperfective lemmas when in doubt (teaching-friendly).\n"
        )

    schema = {
        "candidates": [
            {
                "infinitive": "…",
                "translation": "…",
                "priority": "core",
                "usage_register": "common",
                "style_tags": ["colloquial"],
                "categories": ["work"],
                "notes": "",
                "confidence": 0.8,
            }
        ]
    }

    return (
        f"Generate {n} new verb lemmas with short English glosses.\n\n"
        "Additional rules:\n"
        "- translation: short learner-facing English gloss (often an infinitive phrase).\n"
        "- priority: 'core' for broadly useful verbs; 'stretch' for niche but still teachable verbs.\n"
        "- usage_register: one of everyday/common/uncommon/niche/rare_usable/archaic/obsolete_or_unintelligible.\n"
        "- style_tags: include only when relevant (colloquial, slang, vulgar, formal, regional, internet).\n"
        "- categories: 0-2 simple thematic tags.\n"
        "- confidence: 0-1.\n\n"
        f"{language_specific}\n"
        "Return JSON in this shape:\n"
        f"{schema}\n"
    )


def call_model(
    client: OpenAI,
    *,
    model: str,
    reasoning_effort: str | None,
    config: LanguageConfig,
    n: int,
) -> CandidateBatch:
    kwargs = {
        "model": model,
        "response_format": CandidateBatch,
        "messages": [
            {"role": "system", "content": system_prompt(config.label)},
            {"role": "user", "content": user_prompt(config=config, n=n)},
        ],
    }
    if reasoning_effort:
        kwargs["reasoning_effort"] = reasoning_effort
    completion = client.chat.completions.parse(**kwargs)
    msg = completion.choices[0].message
    if not msg.parsed:
        raise RuntimeError("Structured output parsing failed.")
    return msg.parsed


def write_review(config: LanguageConfig, model: VerbExpansionCandidatesFile, *, existing_lemmas: int) -> None:
    by_priority = {"core": 0, "stretch": 0}
    for cand in model.candidates:
        by_priority[cand.priority] = by_priority.get(cand.priority, 0) + 1

    lines = [
        f"# {config.label} Expansion Review",
        "",
        f"- repo: `{config.repo_root}`",
        f"- current lemmas (js/verbs.full.js): **{existing_lemmas}**",
        f"- target min lemmas (after eventual merge): **{model.target_min_lemmas}**",
        f"- candidates in file: **{len(model.candidates)}**",
        f"- core: **{by_priority.get('core', 0)}**",
        f"- stretch: **{by_priority.get('stretch', 0)}**",
        "",
        "## Sample (first 60)",
        "",
    ]
    for cand in model.candidates[:60]:
        tags = ",".join(cand.style_tags) if cand.style_tags else ""
        extra = f" [{tags}]" if tags else ""
        lines.append(f"- `{cand.infinitive}` → {cand.translation} ({cand.priority}){extra}")

    lines.append("")
    config.review_md.parent.mkdir(parents=True, exist_ok=True)
    config.review_md.write_text("\n".join(lines), encoding="utf-8")


def run_language(args: argparse.Namespace, client: OpenAI | None, config: LanguageConfig) -> None:
    verbs, _ = load_verbs_js(config.verbs_js)
    existing_lemmas = unique_lemmas_from_verbs(verbs)
    existing_set = set(existing_lemmas)

    model = load_candidates_file(config.candidates_json, language=config.key)
    model.existing_lemmas = len(existing_lemmas)
    model.target_min_lemmas = args.target_min_lemmas

    seen = set(existing_set)
    kept: list[VerbExpansionCandidate] = []
    for cand in model.candidates:
        cand = cand.normalized()
        if not cand.infinitive:
            continue
        if cand.infinitive in seen:
            continue
        if not candidate_is_plausible(config.key, cand.infinitive):
            continue
        seen.add(cand.infinitive)
        kept.append(cand)
    model.candidates = kept

    deficit = max(0, args.target_min_lemmas - len(existing_set))
    desired_new = deficit + args.overshoot

    if args.dry_run:
        print(f"[{config.key}] existing={len(existing_set)} target={args.target_min_lemmas} deficit={deficit} candidates={len(model.candidates)} desired_new={desired_new}")
        return

    if config.generation != "openai":
        model.notes = model.notes or "(skeleton; generation not implemented for this language yet)"
        model.generated_at = utc_stamp()
        write_candidates_file(config.candidates_json, model)
        write_review(config, model, existing_lemmas=len(existing_set))
        print(f"[{config.key}] wrote skeleton (generation=skip)")
        return

    assert client is not None

    need = max(0, desired_new - len(model.candidates))
    if need == 0:
        print(f"[{config.key}] already has {len(model.candidates)} candidates; nothing to do")
        write_review(config, model, existing_lemmas=len(existing_set))
        return

    print(f"[{config.key}] generating candidates: need {need} (batch={args.batch_size}) model={args.model}")

    while need > 0:
        batch_n = min(args.batch_size, need)
        batch = call_model(
            client,
            model=args.model,
            reasoning_effort=args.reasoning_effort,
            config=config,
            n=batch_n,
        )
        added = 0
        for cand in batch.candidates:
            cand = cand.normalized()
            if not cand.infinitive:
                continue
            if not candidate_is_plausible(config.key, cand.infinitive):
                continue
            if cand.infinitive in seen:
                continue
            if config.default_frequency and not cand.frequency:
                cand.frequency = config.default_frequency
            cand.source = CandidateSource(type="openai", details=f"model={args.model}")
            seen.add(cand.infinitive)
            model.candidates.append(cand)
            added += 1

        model.generated_at = utc_stamp()
        model.notes = model.notes or "(generated via OpenAI; review before merge)"
        write_candidates_file(config.candidates_json, model)
        write_review(config, model, existing_lemmas=len(existing_set))

        need = max(0, desired_new - len(model.candidates))
        print(f"[{config.key}] batch requested={batch_n} added={added} total_candidates={len(model.candidates)} remaining_need={need}")
        time.sleep(args.sleep_seconds)


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate normalized verb expansion candidates for canonical language repos.")
    parser.add_argument("--language", action="append", dest="languages", choices=sorted(LANGS.keys()))
    parser.add_argument("--target-min-lemmas", type=int, default=2000)
    parser.add_argument("--overshoot", type=int, default=120, help="Generate a modest buffer for trimming during review.")
    parser.add_argument("--model", default="gpt-5.4-mini")
    parser.add_argument("--reasoning-effort", choices=["low", "medium", "high", "xhigh"], default="medium")
    parser.add_argument("--batch-size", type=int, default=80)
    parser.add_argument("--sleep-seconds", type=float, default=0.25)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    configs = [LANGS[key] for key in (args.languages or list(LANGS.keys()))]

    client = None
    if any(cfg.generation == "openai" for cfg in configs) and not args.dry_run:
        ensure_openai_available()
        client = OpenAI()

    for config in configs:
        run_language(args, client, config)


if __name__ == "__main__":
    main()
