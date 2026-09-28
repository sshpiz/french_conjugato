# French Impersonal Verb JS Fix Prompt

Please implement a **French-only app-layer fix** for impersonal verbs that are currently rendered/generated incorrectly.

Important:
- source files only
- do not touch `dist/`, `dist-gh/`, or generated data files directly
- do not push or deploy unless explicitly asked
- respond in English

Context:
- App repo: `/Users/simeon/Desktop/proj1`
- Primary file:
  - `/Users/simeon/Desktop/proj1/js/script.js`

## Goal

Fix the user-facing behavior for these French verbs:
- `falloir`
- `pleuvoir`

In the current generated data, these verbs are malformed:
- `falloir` stores its only real impersonal form under the wrong key
- `pleuvoir` also has impersonal/plural forms stored under wrong keys

We are **not** fixing the generator in this pass.
We are fixing the app behavior in JS so that:
- flashcards only generate the valid impersonal card
- verb details only show the valid impersonal row

## Product policy

For this pass, treat these verbs as **`il`-only verbs in the app**:
- `falloir`
- `pleuvoir`

That means:
- no `je`
- no `tu`
- no `nous`
- no `vous`
- no `ils/elles`

Only the impersonal third-person singular card/row should exist in the app experience.

## Flashcard behavior

Prevent invalid cards from being generated for:
- `falloir`
- `pleuvoir`

The only valid flashcard pronoun for these verbs should be:
- `il/elle/on`

If there is any existing card-normalization or deep-link restoration path that could surface these verbs with an invalid pronoun, normalize it to:
- `il/elle/on`

Do not let these verbs produce fake `je` cards or any other invalid row.

## Verb details behavior

In verb details for these verbs:
- show only the impersonal `il` row
- do not render the full six-row grid

Because the generated source data currently misplaces the only meaningful form under the wrong key, the details view must remap it safely at render time.

For example:
- if `falloir` has `je: "il faut"` and `il/elle/on: ""`
- then verb details should show a single row:
  - pronoun: `il`
  - conjugation: `il faut`

Same idea for `pleuvoir`:
- use the meaningful impersonal singular form
- do not surface the bogus plural row

## Scope

French only.

Do not generalize this to all “often impersonal” verbs.
Do not infer broad impersonal behavior from hints.

Use a narrow explicit allowlist:
- `falloir`
- `pleuvoir`

## Suggested implementation shape

Please keep this small and readable.

A good structure would be:

1. helper like:
   - `isFrenchIlOnlyVerb(verbInfinitive)`
2. helper to resolve the correct impersonal display form from malformed source data
3. hook that constrains flashcard pronoun eligibility for those verbs
4. hook that constrains verb-details rows for those verbs

If there is existing card restoration / URL / state normalization logic, make sure it also respects this rule.

## Things to avoid

- do not edit generated conjugation files in this pass
- do not add broad “impersonal verb” inference
- do not change behavior for other French verbs such as `suffire` or `urger`
- do not touch other languages

## Test cases

Please verify:

1. `falloir`
- flashcards never generate `je`, `tu`, `nous`, etc.
- only the impersonal `il` card appears
- verb details show only one row
- that row shows the correct form like `il faut`

2. `pleuvoir`
- flashcards never generate invalid non-impersonal cards
- verb details show only one row
- that row uses the impersonal singular form

3. Non-target verbs
- `suffire` still behaves normally
- `urger` still behaves normally

## Deliverables

1. Implement the French JS fix in source
2. Briefly explain:
   - where flashcard eligibility was constrained
   - where verb-details rendering was constrained
   - how malformed generated keys were remapped safely
3. Do not build, push, or deploy unless explicitly asked
