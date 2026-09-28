# French Impersonal Verb Generator Fix Prompt

This is a **future source-of-truth cleanup task**, not the immediate fix.

Please use this prompt later when we want to repair the French generation pipeline itself.

Important:
- source files only
- do not touch `dist/`, `dist-gh/`, or generated output manually
- do not push or deploy unless explicitly asked
- respond in English

Context:
- Repo: `/Users/simeon/Desktop/proj1`
- Relevant generated output currently shows malformed data for:
  - `falloir`
  - `pleuvoir`
- The current bad output places impersonal forms under wrong pronoun keys, for example:
  - `falloir` present:
    - `je: "il faut"`
    - real `il/elle/on` slot empty

## Goal

Fix the **generation pipeline / source of truth** so that the generated French conjugation data is structurally correct for confirmed defective impersonal verbs.

This should be a **narrow** cleanup, not a broad redesign.

## Confirmed verbs for this pass

Use an explicit allowlist:
- `falloir`
- `pleuvoir`

Do not generalize to all verbs marked “often impersonal”.

## Desired output behavior

Generated French conjugation objects for these verbs should:
- store the impersonal form under the correct third-person singular key
- not place impersonal forms under `je`
- not place bogus plural forms under `tu`

For app compatibility, the clean target is:
- use the normal French third-person singular key:
  - `il/elle/on`
- leave invalid slots empty

So for example, instead of:
- `je: "il faut"`

the generated data should look like:
- `il/elle/on: "il faut"`

And similarly for `pleuvoir`:
- singular impersonal form under `il/elle/on`
- invalid other slots empty

## Scope

Please find the real generation step that creates these malformed pronoun-key assignments.

Likely places to inspect:
- French conjugation generation scripts
- normalization / combine steps
- any overrides or special-case handling for defective verbs

Do not just patch the generated JS artifact by hand.

## Risk management

This task should remain low-risk by using a **strict explicit allowlist**:
- `falloir`
- `pleuvoir`

Do not introduce broad impersonal heuristics across the full French dataset unless clearly necessary.

## Testing

Please verify after regeneration:

1. `falloir`
- forms land under `il/elle/on`
- no bogus `je` row

2. `pleuvoir`
- singular impersonal form lands under `il/elle/on`
- no bogus plural form under the wrong key

3. Nearby non-target verbs remain unchanged
- `suffire`
- `urger`

## Deliverables

1. Identify the actual generation step causing the malformed keys
2. Fix it narrowly for the two confirmed defective verbs
3. Regenerate the French conjugation output
4. Briefly explain:
   - what source file(s) changed
   - why the malformed mapping happened
   - how the allowlisted fix avoids harming other verbs
5. Do not push or deploy unless explicitly asked
