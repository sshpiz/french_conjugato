# Portuguese Parity Review — 2026-04-27

## Scope

Goal:
- review Portuguese against the current French settings/product baseline
- use the **no-fill-blanks** subset as the practical comparison baseline

Why:
- French is the canonical product baseline
- Portuguese currently has:
  - `hasFillBlankExerciseCapability() === false`
  - `normalizeCardTypeModeForCapabilities() === 'conjugation'`
- so the correct parity target is:
  - French/Spanish/German **settings quality**
  - but with **no fake Fill Blanks / Mixed UI**

## Baseline Shape

Expected Portuguese settings shape:

1. Top nav
- Back
- Conjugation
- Text To Speech
- App

2. Current exercise
- current exercise summary
- `Answer by voice`
- `Practice all pronouns evenly`
- `Hide tutorial button in main screen`

3. Conjugation Setup
- `Verb source` first
- `By Topic / By Frequency`
- `Topics` shown in topic mode
- `Tenses` after topics
- `By frequency` controls only in frequency mode
- `Advanced` only relevant in frequency mode
- compact `Save / Share / Reset` footer

4. Text To Speech
- same shell style as French/Spanish/German
- no extra tiny summary line in header

5. App
- same shell style as French/Spanish/German
- no extra tiny summary line in header
- install first
- theme + text size high in the section
- tutorial action present
- `Press to dictate` demoted low in App

## Review Result

Portuguese is locally in the correct **no-fill-blanks** product shape:

- no fake `Fill Blanks` exercise path
- no fake `Mixed` exercise path
- `Topics` remain available for conjugation
- `Verb source` / topic flow is present
- topic wording is used in visible UI
- tutorial-hide toggle exists
- drill save flow does not ask for an emoji

## Intentional Differences

These are intentional and correct for Portuguese right now:

- no `Fill Blanks`
- no `Mixed`
- no fill-blanks setup section

Those should only appear once Portuguese has real fill-blanks data and the related exercise flow is ready.

## Build Verification

Verified locally:

- `node --check /Users/simeon/Desktop/portuguese-verbs/js/script.js`
- `python3 /Users/simeon/Desktop/portuguese-verbs/build.py`
- `python3 /Users/simeon/Desktop/proj1/build.py`

All passed.

## Topic Coverage

Portuguese topic data is locally in the good state requested earlier:

- shared topic shell includes the newer topics
- built-in topics are present
- uncovered topic-verb usages were reduced to `0`

Meaning:
- every verb that appears in a built-in Portuguese topic currently has at least one usage path

## Remaining Caution

Portuguese working tree is still locally dirty outside the narrow settings/topic review scope.

So:
- the parity review itself is solid
- but any future ship pass should still commit only scoped files carefully

## Practical Conclusion

Portuguese is ready to be treated as:

- a **new-settings** app
- with **topic-driven conjugation**
- but **without** fill-blanks capability for now

That is the correct parity target today.
