# Verb Expansion And Gloss Upgrade Worker

This task is about safely expanding verb inventory and improving gloss coverage across all language apps without destabilizing the live runtime files while the work is in progress.

## Goal

Build an expansion workflow that can get every language to at least:

- `2,000` verbs minimum
- better gloss coverage
- stronger category coverage
- slang included where it is genuinely useful and natural

But do this in a way that is:

- reviewable
- mergeable later
- safe to run in parallel with normal development

## Very important workflow constraint

Do **not** overwrite the main runtime files as your first move.

Instead:

- write to expansion files
- write merge helpers
- keep the existing live data intact until review

The user wants to be able to keep building/committing normally while this runs and is reviewed.

## Interpreter

Use this Python unless a repo explicitly documents something else:

- `/Users/simeon/Desktop/proj1/venv/bin/python3`

Do not drift to random system Python.

## Model / quality expectation

It is acceptable to use OpenAI’s best model for:

- candidate verb expansion
- gloss improvement
- difficult conjugation recovery when a repo lacks reliable local conjugations

But:

- do not mix unrelated verbs across conjugation calls
- keep each verb’s conjugation request isolated and explicit when you need model help
- prefer existing deterministic/local conjugation flows when they are reliable

## Languages in scope

All app languages:

- French
- Spanish
- Portuguese
- Italian
- German
- Greek
- Catalan
- Russian
- Ukrainian
- Latvian

## Deliverables

For each language, create expansion-layer artifacts rather than immediately mutating the main runtime data.

Examples of acceptable output patterns:

- `<language>_verb_expansion_candidates.json`
- `<language>_verb_gloss_expansion.json`
- `<language>_expansion_review.md`
- `merge_<language>_verb_expansion.py`

Adjust naming to fit each repo, but keep it systematic.

## What the expansion files should support

1. New verbs beyond the current committed set
2. Improved glosses for existing weak/blank entries
3. Register information where relevant:
   - slang
   - vulgar
   - colloquial
4. Category usefulness:
   - enough natural verbs to make thematic categories interesting

## Non-goals

- do not directly rewrite the app runtime JS as the primary output
- do not push or deploy
- do not pretend every language needs the exact same generation source
- do not create uncanny or dictionary-weird verbs just to hit a count

## Required first step

Map the current expansion/data-generation situation per repo:

1. source of seed verbs
2. current max coverage
3. current gloss source
4. current conjugation source
5. whether local deterministic conjugation exists
6. what merge point would be safest

## Required architecture decision

For each language, classify it into one of these:

1. `deterministic-safe`
   - local conjugation/generation is reliable
2. `deterministic-plus-review`
   - local generation exists but needs review
3. `model-assisted`
   - model help is required for some missing conjugations/glosses

Explain why for each language.

## Category requirement

Expansion is not just about raw counts.

The resulting verb pool should make the standard thematic categories richer and more interesting.
If slang is useful in a category, it can be included, but only if it feels natural to a native speaker.

## Acceptance criteria

This task is successful if it produces:

1. a clear per-language expansion plan
2. expansion-layer files, not destructive runtime rewrites
3. a merge path for later review/application
4. at least one demonstrated language end-to-end as proof of concept
5. no pushes/deploys

## Suggested proof-of-concept languages

Start with:

- Spanish
- German
- Russian

These are high-value and will expose different pipeline realities.

## Final response

Report:

1. per-language pipeline classification
2. files created
3. recommended merge workflow
4. which language(s) were demonstrated end-to-end
5. any blockers or repos that need special handling
