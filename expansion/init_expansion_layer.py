#!/usr/bin/env python3
"""
Initialize per-repo expansion-layer folders + normalized skeleton artifacts.

This is intentionally non-destructive:
- it creates `expansion/` folders if missing
- it writes skeleton `expansion/verb_expansion_candidates.json` if missing
- it writes skeleton `expansion/expansion_review.md` if missing

Use --overwrite to replace existing skeletons (not usually needed).
"""

from __future__ import annotations

import argparse
from pathlib import Path

from expansion_lib import (
    VerbExpansionCandidatesFile,
    load_candidates_file,
    load_verbs_js,
    unique_lemmas_from_verbs,
    write_candidates_file,
)


def repo(path: str) -> Path:
    return Path(__file__).resolve().parents[2] / path


CANONICAL_REPOS: list[tuple[str, Path]] = [
    ("french", repo("proj1")),
    ("spanish", repo("spanish-verbs")),
    ("portuguese", repo("portuguese-verbs")),
    ("italian", repo("italian-verbs")),
    ("german", repo("german-verbs")),
    ("greek", repo("greek-verbs")),
    ("catalan", repo("catalan-verbs")),
    ("russian", repo("russian-verbs")),
    ("ukrainian", repo("ukrainian-verbs")),
    ("latvian", repo("latvian-verbs")),
]


def init_repo(language: str, root: Path, *, overwrite: bool) -> None:
    verbs_js = root / "js" / "verbs.full.js"
    if not verbs_js.exists():
        print(f"[{language}] ⚠️  missing {verbs_js}")
        return

    verbs, _ = load_verbs_js(verbs_js)
    existing = len(unique_lemmas_from_verbs(verbs))

    expansion_dir = root / "expansion"
    expansion_dir.mkdir(parents=True, exist_ok=True)

    candidates_path = expansion_dir / "verb_expansion_candidates.json"
    if candidates_path.exists() and not overwrite:
        try:
            model = load_candidates_file(candidates_path, language=language)
            # Keep existing candidates, but refresh metadata that tends to drift.
            model.existing_lemmas = existing
            model.target_min_lemmas = model.target_min_lemmas or 2000
        except Exception:
            model = VerbExpansionCandidatesFile(
                language=language,
                existing_lemmas=existing,
                notes="(reinitialized after parse failure)",
            )
    else:
        model = VerbExpansionCandidatesFile(
            language=language,
            existing_lemmas=existing,
            notes="(skeleton; fill via expansion workflow)",
        )

    write_candidates_file(candidates_path, model)
    print(f"[{language}] ✅ {candidates_path} (existing_lemmas={existing}, candidates={len(model.candidates)})")

    review_path = expansion_dir / "expansion_review.md"
    if review_path.exists() and not overwrite:
        return
    review = [
        f"# {language.title()} Expansion Review",
        "",
        f"- repo: `{root}`",
        f"- current lemmas (js/verbs.full.js): **{existing}**",
        f"- target (after eventual merge): **{model.target_min_lemmas}** unique lemmas",
        "",
        "## Status",
        "",
        "- expansion candidates: _not generated yet_",
        "- gloss expansion: use `verb_glosses.generated.json` via `proj1/generate_multilang_verb_glosses.py` (optional)",
        "",
        "## Notes / TODO",
        "",
        "- Fill `expansion/verb_expansion_candidates.json` with new lemmas (core vs stretch).",
        "- Add merge helper to convert normalized candidates back into repo-native seed/inventory inputs.",
        "",
    ]
    review_path.write_text("\n".join(review), encoding="utf-8")
    print(f"[{language}] ✅ {review_path}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Initialize expansion-layer skeleton files across canonical repos.")
    parser.add_argument("--overwrite", action="store_true", help="Overwrite existing expansion-layer skeleton files.")
    args = parser.parse_args()

    for language, root in CANONICAL_REPOS:
        init_repo(language, root, overwrite=args.overwrite)


if __name__ == "__main__":
    main()
