# Portuguese Categories Parity Prompt

Implement the **categories feature** in the Portuguese app with parity to the current French/main app behavior.

Repo to change:
- `/Users/simeon/Desktop/portuguese-verbs`

Reference implementation to study first:
- `/Users/simeon/Desktop/proj1/index.html`
- `/Users/simeon/Desktop/proj1/js/script.js`
- `/Users/simeon/Desktop/proj1/css/style.css`

Portuguese files to update:
- `/Users/simeon/Desktop/portuguese-verbs/index.html`
- `/Users/simeon/Desktop/portuguese-verbs/js/script.js`
- `/Users/simeon/Desktop/portuguese-verbs/css/style.css`

## Important context

Portuguese already has **partial / legacy category plumbing**:
- it has a Portuguese classifier:
  - `classifyPortugueseVerb(...)`
- it aliases that to:
  - `classifyFrenchVerb = classifyPortugueseVerb`
- it still uses an older single-string `categoryFilter`
- it does **not** yet have the newer exact-pool / multi-category behavior from French

Please do **not** layer a second conflicting system on top.
Upgrade Portuguese cleanly to the newer categories model.

## Product requirements

Add the categories feature to Portuguese so it behaves like current French parity:

1. Categories are a **real selectable verb pool** in settings.
2. Multiple categories can be selected at once.
3. Selected categories merge into **one exact verb pool**.
4. When that exact pool is active:
   - frequency / Top N filters are ignored for verb selection
   - verb-type filters are ignored for verb selection
     - regular / irregular
     - verb ending
     - reflexive
   - tenses still apply
5. The app should clearly explain this in the settings summary/helper text.
6. Sharing the current drill should preserve the active categories **by value**, not only by local ids.
7. The recipient should be able to use the shared category drill immediately.
8. If there is shared embedded category data, allow saving it locally, like the French flow.

## UX requirements

Follow the current French structure/patterns as closely as practical.

Portuguese should have:
- a `Categories` section in settings
- built-in category cards/chips based on Portuguese categorization
- support for custom categories created by pasting infinitives
- a `New category` affordance
- summary text explaining when an exact category pool is active

The exact wording can be adapted to Portuguese app tone, but behavior should match French.

## Search verbs / explorer parity

If Portuguese does not already have it, add the current parity behavior from French:
- in verb search / explorer, allow showing:
  - all verbs
  - filtered verbs

This matters because once categories are active, users need a way to inspect the selected pool.

## Selection / weighting behavior

When a category exact pool is active:
- card generation should strongly prefer **unseen verbs** in that exact pool
- this preference is **per verb**, not every card variant
- once the category verbs have all been surfaced at least once, normal selection can relax

This should mirror the current French behavior as closely as practical.

## Data / implementation guidance

The French app currently uses a more general “verb set” / exact-pool model for categories.
You do not have to copy every line literally, but Portuguese should end up with the same concept:

- multi-select ids for local categories
- optional embedded shared category payload for shared drills
- exact-pool resolution helper(s)
- filtered universe helper(s) that respect exact-pool semantics

It is okay if the internal names remain “verb set” for reuse, but the Portuguese UI should present this as **Categories**.

## Cleanup requirements

Clean up the old Portuguese legacy path if it becomes obsolete:
- single-string `categoryFilter`
- old helper copy that only supports one category
- any stale comments saying “TODO multiple categories”

Avoid leaving two competing category systems in the code.

## Verification

Please verify locally after implementation:

1. Portuguese settings can select one category.
2. Portuguese settings can select multiple categories.
3. The summary text shows that an exact category pool is active.
4. Top N no longer controls verb selection when categories are active.
5. Tenses still control which conjugation cards appear.
6. Search verbs can show the filtered pool.
7. Shared drill payload preserves category selection by value.
8. A shared category drill can be imported/used on a clean local state.

## Build / output expectations

After code changes:
- run the normal Portuguese build
- report which files changed
- explain any intentional divergences from French parity

## Constraints

- source files only
- do not touch `dist` / `dist-gh` / generated deploy outputs except for local verification builds
- do not push or deploy unless explicitly asked
- respond in English
