Please implement a source-only parity remediation pass across the language app repos.

Canonical shared-behavior reference:
- /Users/simeon/Desktop/proj1

Repos to fix in this pass:
- /Users/simeon/Desktop/greek-verbs
- /Users/simeon/Desktop/portuguese-verbs
- /Users/simeon/Desktop/russian-verbs
- /Users/simeon/Desktop/catalan-verbs
- /Users/simeon/Desktop/latvian-verbs

Do NOT work on in this pass:
- /Users/simeon/Desktop/ukrainian-verbs

Audit reference:
- /Users/simeon/Desktop/language-app-parity-audit-2026-04-18.md

Scope rules
- Edit source files only.
- Do not intentionally edit:
  - `dist/`
  - `dist-gh/`
  - generated TTS/audio files
  - generated data/conjugation artifacts
  - build output manifests
- Focus on:
  - `index.html`
  - `js/script.js`
  - `css/style.css`
- Treat French (`/Users/simeon/Desktop/proj1`) as canonical shared behavior.
- Preserve language-specific content and logic where clearly intentional.
- Do not propose or introduce a shared runtime codebase.
- Do not push unless explicitly asked.

Goal
- Remove accidental drift from the five target repos while preserving legitimate language-specific differences.
- The principle is:
  - if a difference is due to a real language/product decision, keep it
  - if a difference is stale shared infrastructure or copyover residue, fix it

Work order

1. Port the cleaned-up French mic stack into:
- Greek
- Portuguese
- Russian
- Catalan
- Latvian

This means aligning the shared mic infrastructure around the French pattern:
- normalized transcript matching helpers
- centralized mic success handling
- current mic availability logic
- current dictation prompt / mic-state behavior

Important:
- Preserve Russian-specific accepted-answer / audio-answer behavior.
- Do not flatten Russian into French if Russian intentionally supports richer accepted answers.

2. Port the French app-theme event model for dictation overlay theming into:
- Greek
- Portuguese
- Russian
- Catalan
- Latvian

Goal:
- forced Light / Dark / System should theme the mic/dictation overlay consistently
- remove stale direct `prefers-color-scheme` only behavior where French now uses app-theme coordination

3. Port the French review-model / reopen card-selection layer into:
- Greek
- Portuguese
- Russian
- Catalan
- Latvian

Goal:
- newer repetition pacing
- reopen/return-message support where applicable
- review-model weighting parity

Important:
- Preserve Russian-specific answer/detail behavior.
- If a repo has clear branch-specific card semantics, port the shared selection infrastructure without deleting the local branch logic.

4. Fix the obvious repo-specific drift called out in the audit:

Greek
- remove the clearly wrong French mnemonic content and replace or neutralize it appropriately

Catalan
- remove Portuguese voice-filter residue in `speak`

Latvian
- remove Portuguese mnemonic/content residue
- remove Portuguese voice-filter residue in `speak`

Russian
- add the newer TTS-speed control if it is indeed missing from source parity

5. Git hygiene requirements
- Stage intentionally; do not use `git add .`
- Before each commit, inspect `git status --short`
- Commit per repo, not one giant mixed commit
- Use clean, narrow commit messages
- Do not commit unrelated dirty files if they already exist in a repo
- If a repo has unrelated generated/data churn, ignore it and stage only the intended source files

6. Build / verification requirements
- After source edits, run the app builds for the repos you changed
- Verify at minimum:
  - `node --check` on edited `js/script.js`
  - app build succeeds
- Do not touch Ukrainian source in this pass

7. Output requirements
At the end, report:
- what changed in each repo
- any repo you intentionally skipped or partially skipped
- any audit item that turned out to be intentional after inspection
- any remaining risks

Implementation notes
- Use the audit as a guide, but verify in source before editing.
- Prefer French source anchors over broad hand-wavy copying.
- Good anchors to compare:
  - theme init
  - `setupDictation`
  - mic success handling helpers
  - `refreshDictationButton`
  - `generateNewCard`
  - review-model config/state helpers
  - Audio settings block
  - relevant theme/event listeners

Non-goals
- No shared runtime refactor
- No Ukrainian catch-up
- No deploy in this pass unless explicitly requested later
