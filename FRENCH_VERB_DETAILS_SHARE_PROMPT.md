# French Verb Details Share Prompt

Please implement a **French-only** share feature for verb details.

Important:
- source files only
- do not touch `dist/`, `dist-gh/`, or generated files directly
- do not push or deploy unless explicitly asked
- respond in English

Context:
- App repo: `/Users/simeon/Desktop/proj1`
- Likely files:
  - `/Users/simeon/Desktop/proj1/js/script.js`
  - `/Users/simeon/Desktop/proj1/index.html`
  - `/Users/simeon/Desktop/proj1/css/style.css`

## Goal

Add a share action to the **French verb details view**.

This is a **verb-details-first** share flow:
- recipient opens directly into verb details
- if a tense is included, that tense is highlighted
- if the user taps Back from details, they should land on the **exact originating card**

This feature is **French only for now**.

## Product requirements

### What gets shared

When the user shares from verb details, the generated link must include:
- `verb`
- `tense`
- `pronoun`

These should describe the exact current card underneath the details view.

If details were opened from a card, use that exact card identity.

If details were somehow opened without a valid current card, still share:
- `verb`
- and `tense` if available

But the main intended path is:
- card -> verb details -> share

### Recipient behavior

When a recipient opens the shared link:

1. Open directly into verb details
2. Highlight the shared tense if present
3. Prepare the exact shared card underneath
4. If the user taps Back from details, return to that exact card

This should feel like:
- verb details on top
- original card preserved underneath

### Tutorial behavior

Do not let the tutorial interrupt the initial shared verb-details entry.

The shared details view should appear immediately and cleanly.

After the user exits that entry state and resumes normal drilling, normal tutorial logic can continue as appropriate.

## URL design

Use a query-string based deep link.

The shared link should include:
- `verb=<verb>`
- `tense=<tense>`
- `pronoun=<pronoun>`

Example shape:
- `...?verb=parler&tense=present&pronoun=je`

The app should interpret that as:
- open verb details for `parler`
- highlight `present`
- preserve card identity for `je + present + parler`

Do **not** invent a second unrelated routing system for this feature.
Fit it into the current French deep-link behavior cleanly.

## Share button placement

Add a share button in the **top-right inside the verb-details card area**.

Design expectations:
- subtle
- elegant in dark mode and light mode
- visually consistent with the details card
- should not look like a generic system-blue floating blob

This is a utility action, not a primary CTA.

## Share behavior

### Preferred behavior

Use native OS sharing when available:
- `navigator.share(...)`

Include:
- title: app name / short useful title
- text: a short helpful share message
- url: the deep link

### Fallback

If native sharing is unavailable or fails in a non-fatal way:
- copy the link to clipboard
- show a small success toast / transient confirmation

Suggested fallback confirmation:
- `Link copied`

Do not make the user do manual text selection.

## Suggested implementation shape

Please keep this clean and readable.

A good structure would be:

1. helper to build a shareable French verb-details URL from current app state
2. helper to detect and hydrate shared verb-details entry state from query params
3. helper to invoke native share with clipboard fallback
4. small UI hook for the verb-details share button

Keep the card-underneath reconstruction explicit and easy to reason about.

## State behavior

Please preserve these invariants:

- shared verb-details entry should not open a random card underneath
- Back from details should return to the shared card, not a newly generated one
- the shared card should use the proper pronoun pill and current tense
- the current French deep-link support for verb details should continue to work

If there is already French logic for:
- `?verb=...`
- `?verb=...&tense=...`

extend that logic rather than replacing it.

## UI details

The share control should:
- be visible only in verb details
- be placed in the top-right area of the details card
- work in both dark and light themes

Please add only the minimum necessary CSS.

## Things to avoid

- do not add a permanent share button to the main bottom action row
- do not add card-sharing UI outside verb details in this pass
- do not port to other languages yet
- do not touch generated/build output directly
- do not break existing Back behavior for non-shared verb details

## Testing

Please verify at least:

1. Open a normal French card, open verb details, tap share
2. Confirm the generated link includes:
   - `verb`
   - `tense`
   - `pronoun`
3. Open that link fresh
4. Confirm verb details opens immediately
5. Confirm the tense is highlighted
6. Tap Back
7. Confirm the exact shared card appears underneath
8. Confirm tutorial does not interrupt the shared entry experience
9. Confirm native share is used when available, with clipboard fallback otherwise

## Deliverables

1. Implement the French-only feature in source
2. Briefly explain:
   - what files changed
   - how the shared URL is structured
   - how Back returns to the exact shared card
   - how native share vs clipboard fallback works
3. Do not build, push, or deploy unless explicitly asked
