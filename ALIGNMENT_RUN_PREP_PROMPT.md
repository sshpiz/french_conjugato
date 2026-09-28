Please execute an alignment-prep audit for the sibling verb apps.

## Goal
Prepare a safe, sequential alignment run to bring selected French-era product features to the other language apps.

This is **not** a “change everything at once” task.
Work carefully, feature-by-feature, and prefer exact source verification over assumptions.

## Important working style
- Do **not** use sub-agents.
- Do **not** ask trivial rubber-stamp questions.
- Make reasonable assumptions when low-risk and state them clearly in your final report.
- Work **one feature at a time** mentally, even during the audit.
- Be conservative about code changes. This thread is primarily for **mapping + rollout prep**, not a broad implementation blast.

## Canonical source of truth
Treat the French app in:
- `/Users/simeon/Desktop/proj1`

as the canonical UX/CSS reference unless there is a clear, intentional product reason not to.

## Repos to audit
- French / site: `/Users/simeon/Desktop/proj1`
- Spanish: `/Users/simeon/Desktop/spanish-verbs`
- Portuguese: `/Users/simeon/Desktop/portuguese-verbs`
- Italian: `/Users/simeon/Desktop/italian-verbs`
- German: `/Users/simeon/Desktop/german-verbs`
- Greek: `/Users/simeon/Desktop/greek-verbs`
- Catalan: `/Users/simeon/Desktop/catalan-verbs`
- Russian: `/Users/simeon/Desktop/russian-verbs`
- Ukrainian: `/Users/simeon/Desktop/ukrainian-verbs`
- Latvian: `/Users/simeon/Desktop/latvian-verbs`

## Features in scope for the alignment run
Map these carefully and prepare a rollout order:

1. **Newer category system**
   - not just “has categories”
   - specifically the newer French-style behavior:
     - multi-category / exact-pool behavior
     - saved verb-set library / “Save this verb set”
     - category-aware exact-pool drill behavior

2. **Celebration**
   - daily goal celebration
   - Solitaire-style / debug-trigger family

3. **Filtered / All verb explorer scope**
   - ability in Search verbs / explorer to show the current filtered pool vs all verbs

4. **Category-first unseen weighting**
   - when drilling a selected exact pool/category set, unseen verbs in that pool get strong first-pass priority

5. **New inline tutorial skip**
   - newer tutorial flow parity

6. **CSS / styling parity**
   - French is the visual baseline
   - if another app has older button colors, old drill-card surfaces, stale theme tokens, etc., that should be treated as drift unless there is a clear reason
   - any CSS difference that is not aligned should have an explicit rationale

## Explicitly out of scope for this alignment run
- **Frames**
  - paused for now
  - do not include in rollout planning beyond noting current status

- **Custom drill emoji save/share**
  - this is intentionally staying French-only for now
  - do not include it in the rollout plan yet

- **Core patterns / deep pattern data generation**
  - note current status as TODO
  - do not make it part of the run

- **Large data regeneration passes**
  - unless absolutely necessary, avoid anything that regenerates large verb inventories or AI-generated datasets

## Important corrections / assumptions
- Do **not** report Russian/Ukrainian as missing “answer by voice” just because the exact English label differs.
- Russian and Ukrainian already have mic/dictation-style answer flow; treat that as present unless you find a real functional gap.

## What to produce
Produce a compact but trustworthy audit with:

1. A per-language matrix showing, for each feature in scope:
   - present in the newer French-style sense
   - partially present / older version
   - absent

2. A short note on each feature explaining what counts as parity.

3. A recommended rollout order from safest to riskiest.

4. A short list of repos that are most ready for low-risk alignment.

5. A CSS drift note:
   - which apps visibly diverge from French in theme/button/drill-card styling
   - whether the difference appears intentional or just stale

## Build / verification instructions
For UI-only audit work, prefer the normal documented build flow and do **not** invent new pipelines.

### Normal build expectation
Run each app’s own build from that repo root:
- `python3 build.py`

If you change a sibling app and want to verify it through the shared site, then rebuild:
- `/Users/simeon/Desktop/proj1/build.py`

And if needed, sync local served output:
- `dist` -> `dist-gh`

### Important Python note
Use this Python interpreter unless a repo very explicitly documents otherwise:
- `/Users/simeon/Desktop/proj1/venv/bin/python3`

Do not casually fall back to system `python3`.

Run commands from the target repo root, not some random working directory.

Do **not** casually regenerate large datasets unless you have a concrete reason.

## Verification expectations
- Verify from real source files, not memory.
- Prefer `rg` and direct code inspection.
- Distinguish:
  - broad legacy presence
  - newer French-style parity
- Be especially careful with false positives around:
  - categories
  - drill emoji
  - usages vs core patterns
  - localized mic labels

## Do not do yet
- Do not push or deploy anything.
- Do not rewrite settings.
- Do not implement the whole alignment run in one go.

## Desired final tone
Give a practical engineer/product report:
- what exists
- what is newer vs older
- what is worth aligning first
- what should wait
