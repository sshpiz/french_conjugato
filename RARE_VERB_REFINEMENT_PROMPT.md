Please design and implement a careful refinement of the **frequency tier / rare verb system** for the language apps that have large enough verb pools to justify it.

Important:
- source files only
- do not touch `dist/`, `dist-gh/`, or generated files unless explicitly asked
- do not push or deploy unless explicitly asked
- respond in English

Context:
- Main repo: `/Users/simeon/Desktop/proj1`
- Sibling repos:
  - `/Users/simeon/Desktop/spanish-verbs`
  - `/Users/simeon/Desktop/portuguese-verbs`
  - `/Users/simeon/Desktop/russian-verbs`
  - `/Users/simeon/Desktop/greek-verbs`
  - `/Users/simeon/Desktop/catalan-verbs`
  - `/Users/simeon/Desktop/ukrainian-verbs`
  - `/Users/simeon/Desktop/latvian-verbs`
- Current system in several apps is roughly:
  - `top20`
  - `top50`
  - `top100`
  - `top500`
  - `top1000`
  - `rare`

## Goal

Improve the handling of verbs beyond `top1000` in the languages where the dataset is large enough.

Desired refinement:
- `top2000`
- `top3000`
- `top4000`
- `top5000`
- `rare`

The product intent is:
- separate **rare/quirky but still relevant** verbs
- from **extremely obscure / effectively never-used** verbs

This does **not** need to be academically perfect.
It just needs to be a thoughtful, consistent refinement that improves the user experience.

## Product constraints

This is **not** about pretending frequency is exact.

We want something practical:
- users should be able to include more unusual verbs without immediately falling into the strangest corners of the dataset
- the new tiers should feel sensible
- the UI should not become cluttered or confusing

## What to do

### 1. Localize scope
Identify which language apps actually have:
- large enough verb pools
- and current data/frequency structure that can support this refinement

Do not force the new tiers into tiny datasets where it would be nonsense.

Please explicitly state:
- which repos/apps you changed
- which repos/apps you left alone
- and why

### 2. Design the tier model
For the applicable languages, introduce a refined frequency model that can represent:
- `top20`
- `top50`
- `top100`
- `top500`
- `top1000`
- `top2000`
- `top3000`
- `top4000`
- `top5000`
- `rare`

But do this thoughtfully:
- if a language only has enough confidence/data to justify up to `top3000`, say so
- do not add meaningless empty buckets

### 3. Think about what “rare” should mean after this change
Very important:
- after introducing `top2000`–`top5000`, `rare` should mean “beyond the refined main pool”
- not just “anything above top1000”

The agent should decide the most sensible cutoff based on the actual dataset and app structure.

### 4. Update app behavior
Where relevant, update:
- frequency ordering
- saved option handling
- drill summaries / human-readable labels
- any helper logic that assumes `rare` starts immediately after `top1000`
- any UI that currently only knows about the old tier set

### 5. Update text/UI only as needed
Keep the product simple.

We do **not** want a giant wall of frequency controls.
Please preserve the feel of the existing drill builder.

If the current UI model would become too cluttered by exposing every tier individually, propose and implement the most sensible minimal UI approach.

Possible acceptable approaches:
- keep the existing weighted/tier system but extend it cleanly
- or add a compact “extended range” mechanism

Do not overdesign this.

### 6. Be careful with generated/source-of-truth logic
If the tier assignment comes from generator/source scripts, prefer fixing the source-of-truth rather than only patching the frontend.

But do not broaden the change recklessly.

### 7. Preserve backward sanity
Existing saved settings/drills should not crash or become nonsense.

If older saved options only know about:
- `top20/top50/top100/top500/top1000/rare`

then:
- they should still behave sensibly
- and the app should migrate/fallback gracefully

## Important product judgment

Please think carefully about whether the new tiers should be:
- cumulative selection ranges
- explicit exact buckets
- or still represented as weighted buckets internally

The best answer may differ from the literal current implementation.

The goal is:
- a user can distinguish:
  - common/core verbs
  - less common but still plausible verbs
  - truly rare/outlier verbs

without needing perfect lexicographic truth.

## Deliverables

1. Implement the refined frequency system in the applicable repos
2. Keep the UI/product behavior sane and simple
3. Briefly explain:
   - which apps were changed
   - how `rare` now works
   - how saved settings were kept sane
   - any apps intentionally left unchanged

## Things to avoid

- do not force the new tiers into languages that do not support them
- do not create empty or misleading buckets just because the names exist
- do not break old saved settings
- do not turn the settings UI into an unreadable matrix

