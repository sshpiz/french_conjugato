# Russian Category Highlight Fix

Fix the category-selection highlight bug, starting with Russian, and then check whether the same CSS drift exists in any sibling apps.

## Confirmed bug

In Russian, when categories are selected:

- the summary text above updates as if categories are selected
- but the category cards themselves do not visibly stay highlighted
- this makes it look like nothing is selected

French is the canonical reference and does not have this bug.

## Important finding

This is **not** primarily a data bug.

The likely root cause is CSS drift:

- Russian has an earlier `verb-set-card.active` style that should highlight selected categories
- but it also has a later duplicate `verb-set-card` block in `css/style.css`
- that later block overrides the base card appearance
- and in dark/system-dark it does **not** carry the matching active-state styling through consistently

So the selected state exists logically, but the visual highlight is lost.

## Scope

1. Reproduce/confirm the bug in Russian.
2. Compare Russian against French category-card rendering and CSS.
3. Fix Russian so selected categories are clearly highlighted exactly like French in spirit.
4. Check whether the same CSS drift exists in other repos and fix it only where it is the same bug.

## Canonical reference

- French source:
  - `/Users/simeon/Desktop/proj1/js/script.js`
  - `/Users/simeon/Desktop/proj1/css/style.css`

- Russian source:
  - `/Users/simeon/Desktop/russian-verbs/js/script.js`
  - `/Users/simeon/Desktop/russian-verbs/css/style.css`

## Likely relevant Russian code

- category card rendering:
  - around `populateOptions()` and the `verbSetContainer` block in:
    - `/Users/simeon/Desktop/russian-verbs/js/script.js`

- category selection state:
  - `getResolvedVerbSetSelection(...)`
  - `toggleVerbSetSelection(...)`
  - `clearVerbSetSelection(...)`

- CSS:
  - `verb-set-card`
  - `verb-set-card.active`
  - dark/system-dark overrides in:
    - `/Users/simeon/Desktop/russian-verbs/css/style.css`

## Suspicion to verify

Russian appears to have a later duplicate category-card CSS block that overrides the earlier one.
If so, fix the duplication or align the later block so active state still renders correctly.

Do not guess. Confirm it in source.

## Acceptance criteria

The fix is correct if:

1. In Russian, selecting a category visibly highlights the selected card.
2. Multi-select still shows multiple selected cards clearly.
3. `All verbs` loses its active state when exact-pool categories are selected.
4. Dark mode and system-dark mode both preserve the selected highlight.
5. The summary text and the visible selected cards agree.
6. No unrelated category behavior changes.

## Build / verify

Use:

- `/Users/simeon/Desktop/proj1/venv/bin/python3 /Users/simeon/Desktop/russian-verbs/build.py`
- `node --check /Users/simeon/Desktop/russian-verbs/js/script.js`

If you patch the same bug in other repos, build them too.

## Constraints

- source files only
- no pushes or deploys
- keep the fix tight
- do not redesign categories
- do not change category data here unless absolutely required for the visual bug

## Final response

Report:

1. whether the bug was confirmed
2. root cause
3. which repos were affected
4. files changed
5. local verification performed
