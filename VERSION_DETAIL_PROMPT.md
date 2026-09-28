# Prompt: Fix useless App Version detail text across all language apps

Please fix the `Settings > App > Version` detail text across all language apps.

## Scope

- Source files only
- Do not touch:
  - `dist/`
  - `dist-gh/`
  - generated files
- Do not push or deploy unless explicitly asked
- Respond in English

## Problem

In `Settings > App > Version`, the detail line can show:

- `Unbuilt workspace source`

That text is not useful to end users.

The user wants the version area to show something useful, ideally:
- the build timestamp when available
- otherwise a short neutral fallback that is still useful

## Diagnosis already established

All the language apps use the same pattern in source:

- `normalizeAppVersion(...)`
- `parseAppVersionParts(...)`
- `buildAppVersionDate(...)`
- `formatAppVersionLabel(...)`
- `formatAppVersionDetail(...)`
- `const APP_VERSION = normalizeAppVersion(window.APP_BUILD_VERSION);`

The problem is in the fallback branch of `formatAppVersionDetail(...)`.

Examples:
- `/Users/simeon/Desktop/proj1/js/script.js`
- `/Users/simeon/Desktop/greek-verbs/js/script.js`
- `/Users/simeon/Desktop/portuguese-verbs/js/script.js`
- `/Users/simeon/Desktop/russian-verbs/js/script.js`
- `/Users/simeon/Desktop/catalan-verbs/js/script.js`
- `/Users/simeon/Desktop/ukrainian-verbs/js/script.js`
- `/Users/simeon/Desktop/latvian-verbs/js/script.js`
- `/Users/simeon/Desktop/spanish-verbs/js/script.js`

Current bad fallback:
- `version === 'dev' ? 'Unbuilt workspace source' : 'Build version'`

## What to do

Update the source-side version detail behavior in all language apps so that:

1. If the app version parses as a real timestamp:
   - keep showing a human-readable built timestamp

2. If the app version does **not** parse as a timestamp:
   - do **not** show `Unbuilt workspace source`
   - instead show a short neutral fallback such as:
     - `Build time unavailable`
     - or `Version time unavailable`

Pick one consistent fallback phrase and use it in all apps.

The goal is:
- no embarrassing/internal-sounding source text
- no false drama
- still useful

## Preferred behavior

Keep the current label/detail split:
- label can still be the short formatted build label when available
- detail should remain the more explanatory line

But when timestamp parsing fails:
- label can stay as current generic fallback behavior
- detail must become neutral and user-facing

## Important constraints

- Do not redesign the whole version UI
- Do not change the versioning system itself
- Do not change `APP_BUILD_VERSION` generation in this task
- This is just a source-side wording cleanup in the shared version helpers

## Deliverables

1. Update the fallback version-detail wording in all language repos
2. Keep the real timestamp path unchanged
3. Briefly report which fallback phrase you chose
