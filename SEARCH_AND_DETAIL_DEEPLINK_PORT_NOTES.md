# Search Focus + Verb Detail Deep-Link Notes

These notes describe the French implementation that should be mirrored into sibling apps when they are ready.

## Scope

Two UX improvements were added in French:

1. Opening Search from the flashcard button now:
   - switches to the explorer/search list
   - clears the previous query
   - focuses the search input
   - tries twice to focus so the mobile keyboard opens more reliably

2. Verb details can now be opened directly from the URL:
   - `?verb=<infinitive>`
   - optional `&tense=<tenseKey>`
   - if `tense` is valid, the detail block gets the same highlight/focus treatment as when opened from a flashcard

## Key functions in French

File:
- `/Users/simeon/Desktop/proj1/js/script.js`

Relevant helpers:
- `openSearchFromFlashcard()`
- `focusSearchBarForEntry()`
- `getVerbDetailRouteParams()`
- `buildUrlForView()`
- `buildVerbDetailUrl()`
- `openVerbDetailFromRoute()`

## Search behavior

Important design choice:
- only the flashcard Search button clears and focuses the field
- generic `showExplorerList()` still preserves the current query

Why:
- it matches the user request exactly
- it avoids wiping the current query during other internal list transitions

## Verb detail route behavior

Important design choice:
- verb details use query params, not hash params

Why:
- hash is already used in this app family for card state and drill-sharing flows
- query params make verb details a cleaner shareable entry point

Current French route shape:
- `/french/?verb=parler`
- `/french/?verb=parler&tense=present`

## Initialization order

The direct-detail route is checked early during app init, before normal first-card logic.

That means:
- a valid detail URL wins over tutorial/card startup
- invalid detail params fall back to the normal app flow

## Popstate / history

Important:
- detail-view history state must carry:
  - `view: 'explorer-detail-view'`
  - `verbInfinitive`
  - `tenseToFocus`

Otherwise browser back/forward will restore the view shell but not the actual verb details content.

## Porting cautions

When porting to another language:

1. Do not copy French-specific variable names blindly.
   Replace:
   - verb lookup source
   - tense validation source
   - language-specific path names

2. Keep the route params generic if possible:
   - `verb`
   - `tense`

3. Reuse the sibling app’s existing focused-tense detail behavior.
   Do not invent a second highlight system.

4. Keep search clearing scoped to the flashcard search entry action.
   Do not make every list-open path wipe the user’s query unless that is explicitly desired.

5. Do not mix this with generated/data/build changes.
   This is source/UI/runtime behavior only.

