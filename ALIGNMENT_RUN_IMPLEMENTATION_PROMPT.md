Please execute a **careful alignment run** across the sibling verb apps.

Use **GPT-5.4 with Extra High reasoning** for this work.

## Goal
Roll out the following French-era features across the language apps, methodically and safely:

1. **Newer category system**
2. **Celebration**
3. **Filtered / All verb explorer scope**
4. **Category-first unseen weighting**
5. **New inline tutorial skip**
6. **CSS parity with French**

This is real implementation work, not just an audit.

## Important working style
- Do **not** use sub-agents.
- Work **methodically** and **one logical slice at a time**.
- Prefer small, verified steps over broad speculative edits.
- Do **not** ask trivial permission questions.
- Be autonomous, but conservative.
- If something is unclear, inspect source first and decide from evidence.

## Critical anti-sloppiness rule
When porting a feature, do **not** just copy the obvious surface code.

Bring over the full dependency chain:
- helper functions
- shared utilities
- supporting constants
- event wiring
- CSS variables / theme hooks
- storage keys
- hash / sharing logic
- render helpers
- small guard functions used by the feature

Avoid rookie mistakes like:
- copying a call site but forgetting the helper it depends on
- copying UI but not the state shape
- copying state but not the migration/normalization layer
- copying theme styles but leaving old overrides that win later in CSS

If a feature depends on helper functions, move the **whole functional unit**, not fragments.

## Canonical baseline
Treat the French app in:
- `/Users/simeon/Desktop/proj1`

as the product and styling baseline unless there is a very clear language-specific reason not to.

If another app differs visually and there is no explicit reason, treat it as drift.

## Specific CSS parity rule
French is the correct visual baseline.

Example breadcrumb:
- Russian has had cases where the `Use mic before reveal` control looked yellow / older in dark mode
- French has the cleaner, newer version

That kind of mismatch should be treated as stale CSS drift, not as intentional design.

More generally:
- settings buttons
- drill cards
- current drill surface
- toggles
- theme tokens
- dark/light overrides

should be aligned to French unless there is a strong reason not to.

## Repos
- French / reference / shared site: `/Users/simeon/Desktop/proj1`
- Spanish: `/Users/simeon/Desktop/spanish-verbs`
- Portuguese: `/Users/simeon/Desktop/portuguese-verbs`
- Italian: `/Users/simeon/Desktop/italian-verbs`
- German: `/Users/simeon/Desktop/german-verbs`
- Greek: `/Users/simeon/Desktop/greek-verbs`
- Catalan: `/Users/simeon/Desktop/catalan-verbs`
- Russian: `/Users/simeon/Desktop/russian-verbs`
- Ukrainian: `/Users/simeon/Desktop/ukrainian-verbs`
- Latvian: `/Users/simeon/Desktop/latvian-verbs`

## Current understanding of feature spread
Use this as a starting assumption, but verify before editing:

### 1. Newer category system
Clearly newer in:
- French
- Portuguese
- Italian

Older / partial / missing elsewhere.

### 2. Celebration
Present in:
- French
- Portuguese
- Italian

Missing elsewhere.

### 3. Filtered / All explorer scope
Clearly present in:
- French
- Portuguese

Missing elsewhere.

### 4. Category-first unseen weighting
Clearly present in:
- French
- Portuguese

Not clearly present elsewhere.

### 5. New inline tutorial skip
Present in:
- French
- Spanish
- Italian
- German

Missing elsewhere.

### 6. CSS parity
Uneven and needs cleanup repo-by-repo.

## Explicitly out of scope
Do **not** include these in this run:

- Frames rollout
- Custom drill emoji save/share rollout
- Core-pattern rollout / data generation
- Large AI/data-generation passes
- Settings V2 relayout

You may note interactions with these systems, but do not expand scope into them.

## Important correction
Do **not** treat Russian/Ukrainian as missing answer-by-voice just because labels differ.
They do have mic/dictation-style answer flow.

## Implementation strategy
Work **feature by feature**, not by random repo hopping.

Recommended order:

1. `Filtered / All` explorer scope
2. `New inline tutorial skip`
3. `Celebration`
4. `Newer category system`
5. `Category-first unseen weighting`
6. `CSS parity cleanup` in all touched repos

But use judgment if a repo already has part of a later feature and bundling a tiny parity fix is safer.

## Safety rules
- Keep changes source-based and localized.
- Do not rewrite unrelated systems.
- Do not “improve” adjacent architecture unless truly necessary for parity.
- If a repo already has a feature in a slightly different but correct way, prefer minimal adaptation over replacement.
- Verify feature presence before porting.
- Do **not** duplicate work in repos that already have partial alignment.
- Portuguese in particular already received alignment work recently, especially around categories and related pool behavior. Treat it as a repo that may already have parts of this run and should be inspected carefully before any port.

## Build / verification rules
Use this Python unless a repo explicitly documents otherwise:
- `/Users/simeon/Desktop/proj1/venv/bin/python3`

Do not casually fall back to system `python3`.

Run commands from the target repo root.

Normal build flow:
- sibling app repo: `build.py`
- if needed after sibling changes: `/Users/simeon/Desktop/proj1/build.py`

If a repo uses a documented extra step like compression before build, follow the repo’s documented flow exactly.
Do not invent a new build pipeline.

## What to verify as you go
For each repo you touch, verify:
- feature renders correctly
- no missing helper/runtime errors
- no broken share/import behavior from partial ports
- no stale theme overrides winning in dark mode
- no obvious regression in settings
- local build succeeds

## Output expectations
Implement the alignment run carefully and report:

1. What was changed, grouped by feature.
2. Which repos were updated for each feature.
3. Which repos were intentionally skipped and why.
4. What remains TODO after this run.
5. What you built and how you verified it.

## Push / deploy policy
Do **not** push or deploy unless explicitly asked in this thread.

If you create commits, keep them clean and scoped.
