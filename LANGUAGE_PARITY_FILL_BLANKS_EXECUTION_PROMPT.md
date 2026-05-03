# VerbsFirst Full Language Parity + Fill-Blanks Execution Prompt

You are a long-running implementation + language-data agent for VerbsFirst. Your job is to bring all language apps up to the French reference standard where appropriate, and the biggest part of the task is to create the missing fill-in-the-blank data. This is not a UI-only parity pass. Data creation, linguistic design, validation, browser testing, and final accountability are the core work.

Use a strong coding/reasoning model. Recommended: GPT-5.5 with high or xhigh reasoning. Use browser-use / the Codex in-app browser for visual checks. Work autonomously after getting any needed approvals at the start.

## Core Principle

Do not expose a feature just because the UI exists, but also do not stop at hiding unfinished features.

For each language, ship the shared settings/topic/card UX baseline. Then actively build the missing Fill Blanks dataset until it is good enough to expose, wherever the language can support this kind of exercise naturally. Keeping Fill Blanks hidden is only an interim or last-resort outcome, not the default goal.

## Repos

- French reference: `/Users/simeon/Code/VerbsFirst/proj1`
- Spanish: `/Users/simeon/Code/VerbsFirst/spanish-verbs`
- German: `/Users/simeon/Code/VerbsFirst/german-verbs`
- Portuguese: `/Users/simeon/Code/VerbsFirst/portuguese-verbs`
- Italian: `/Users/simeon/Code/VerbsFirst/italian-verbs`
- Russian: `/Users/simeon/Code/VerbsFirst/russian-verbs`
- Greek: `/Users/simeon/Code/VerbsFirst/greek-verbs`
- Catalan: `/Users/simeon/Code/VerbsFirst/catalan-verbs`
- Latvian: `/Users/simeon/Code/VerbsFirst/latvian-verbs`
- Ukrainian: `/Users/simeon/Code/VerbsFirst/ukrainian-verbs`

## Known Starting Point

- French is the reference for UX and has the richest Fill Blanks work.
- Spanish and German have Fill Blanks, but need quality, volume, topic, repetition, and usage coverage audits.
- Portuguese, Italian, and Russian have newer settings/topic work but Fill Blanks may be hidden or incomplete.
- Greek, Catalan, Latvian, and Ukrainian were not fully covered by the previous matrix. Treat them as needing full assessment.

## Work Plan

### 1. Build the Current-State Matrix First

Create or update a TSV matrix covering all 10 languages. Include these columns:

- language
- repo
- settings parity
- current exercise summary
- topics present
- topic emoji labels
- topic verb count
- topic usage coverage
- topic badge on card
- inventory section
- fill blanks UI status
- fill blanks exposed yes/no
- fill blanks question count
- fill blanks distinct verbs
- fill blanks question families
- fill blanks translations
- fill blanks TTS gap
- browser settings check
- browser card-flow check
- browser fill-blanks check
- build status
- node check status
- commit hash
- short note

Do not claim Done without evidence.

### 2. Baseline UI Parity For Every Language

Every language should have the shared modern shell where applicable:

- Settings order and structure match French unless a language-specific reason is documented.
- Current Exercise summary works.
- Conjugation Setup works.
- Topics are called Topics, not Categories.
- Topic labels include emoji.
- Topic selection affects conjugation cards correctly.
- Topic badge appears on cards when a topic is active.
- Usage button works for verbs in topics.
- Inventory section exists and is collapsed by default.
- Tutorial/help behavior matches French.
- Text To Speech and App sections match French structure where applicable.
- Advanced settings do not collapse/jump when toggles are changed.
- Fill Blanks section is hidden when no playable fill-blank data exists.

### 3. Build The Fill-Blanks Data

For each language, first decide which fill-blank question families are natural for that language. Then create the data. Do not merely report that data is missing unless the language truly needs a separate grammar-design discussion.

Target outcome:

- French, Spanish, German: improve and expand existing data.
- Portuguese, Italian, Catalan: create full initial datasets if they do not already exist.
- Russian, Greek, Latvian, Ukrainian: create a small audited prototype first, then expand if the pattern is clearly good; otherwise document why the language needs a different question design.

Before exposing Fill Blanks in a language, the language must pass all of these gates:

- At least 300 playable questions, unless there is a clearly documented exception.
- Natural target-language sentences, not calques from French.
- Correct answer spans.
- Readable English translation for every question.
- Enough distinct verbs that the deck does not feel repetitive.
- If topic filtering is supported, topic-filtered decks must still have meaningful variety.
- Every topic verb should have at least one usage example.
- The `Hear` behavior must read the appropriate prompt/full phrase.
- Switching Fill Blanks back to Conjugation must not leave stale phrase translation on conjugation cards.
- Browser check has no console errors.

If these gates are not met, keep Fill Blanks hidden only temporarily, and continue building/fixing the data unless there is a real language-design blocker.

### 3A. Minimum Data-Building Expectations

For every candidate language, produce actual dataset artifacts, not just notes:

- At least one generator or curated data file.
- At least one validator/audit script or deterministic validation step.
- A review artifact with counts and samples.
- A clear merge path into the runtime app.

Minimum targets:

- Full launchable dataset: 300+ playable fill-blank questions.
- Prototype dataset: 50-100 highly reviewed questions, used only when the language needs proof-of-concept before expansion.
- Topic coverage: where topics exist, aim for useful coverage across the major topics rather than one giant generic pool.
- Verb coverage: use enough distinct verbs that the mode does not feel like the same few verbs repeating.
- Register: include ordinary, culturally alive sentences; avoid sterile textbook-only examples.

### 4. Language-Specific Fill-Blanks Strategy

Do not blindly copy French.

French:
- Preserve current behavior.
- Continue improving volume, translations, and repetition issues if found.

Spanish:
- Good candidate for exposed Fill Blanks.
- Relevant families may include `a`, `de`, `en`, `con`, direct object pronouns `lo/la/los/las`, indirect object pronouns `le/les`, and `se` where natural.
- Audit phrases for native feel. Avoid textbook stiffness.

German:
- Good candidate if question design is careful.
- Relevant families may include separable verbs, prepositions/case, modal constructions, and common verb patterns.
- Avoid questions where the answer is effectively revealed by the sentence.

Portuguese:
- Good candidate, but needs native Portuguese data.
- Consider preposition patterns and clitic/object pronouns only where natural.
- Build a real dataset; do not leave this as UI-only work.
- Do not expose Fill Blanks until the dataset passes the gate.

Italian:
- Good candidate.
- Consider prepositions and clitic pronouns where natural.
- Build a real dataset; do not leave this as UI-only work.
- Build enough data before exposing.

Catalan:
- Likely a good candidate, but needs native data and validation.
- Build a prototype, validate it, then expand to a launchable dataset if the patterns work.

Russian:
- Do not force Romance-style pronoun/preposition exercises.
- Potential families may involve cases, aspect, government, motion verbs, or prepositions if they can be made clear and natural.
- Build a carefully reviewed prototype. If it is strong, expand it. If not, keep Fill Blanks hidden and explain the blocker.

Greek:
- Same: design Greek-native families only. Build a reviewed prototype before deciding whether to expose it.

Latvian:
- Same: language-native case/preposition/verb-government patterns only if auditable. Build a reviewed prototype before deciding whether to expose it.

Ukrainian:
- Same: language-native patterns only. Build a reviewed prototype before deciding whether to expose it. Avoid hacks.

### 5. Data Artifacts Required

For each language with Fill Blanks exposed, create an audit artifact such as:

`FILL_BLANKS_DATA_AUDIT.md` or `fill_blanks_audit.tsv`

It must include:

- total questions
- distinct verbs
- question families and counts
- topic coverage
- sample questions
- known exclusions
- validator result
- TTS gap count

Add or update validators as needed. Prefer deterministic validators for:

- missing translations
- missing answer spans
- duplicate sentences
- tiny topic decks
- verbs in topics with zero usages
- cards where answer appears leaked in the prompt

### 6. Testing Required

For every language:

- Run `node --check js/script.js`.
- Run the language `build.py`.
- Run any validators you add.
- Start a local server and browser-check:
  - first card load
  - settings screen
  - topic selection
  - topic badge on card
  - usage reveal
  - Fill Blanks, if exposed
  - switch Fill Blanks back to Conjugation
  - Advanced toggle behavior
  - console errors

Use actual browser inspection, not just static checks.

### 7. Git Rules

- Commit per app or per coherent feature.
- Do not commit secrets.
- Do not commit `.cloudflare.env`.
- Do not commit huge TTS/generated audio unless explicitly requested.
- Do not commit cache folders.
- Preserve unrelated dirty work.
- Do not deploy unless explicitly requested.

### 8. Final Deliverables

At the end, provide:

- Updated all-language TSV matrix.
- Data audit files for languages with Fill Blanks.
- Data prototype/audit files for languages where Fill Blanks is still hidden.
- List of languages where Fill Blanks is exposed.
- List of languages where Fill Blanks is intentionally hidden and why.
- List of datasets created or expanded, with question counts and distinct verb counts.
- Build/test/browser verification summary.
- Commit hashes.
- Remaining risks.

## Definition Of Done

This task is done only when:

- All 10 languages are represented in the matrix.
- Every language has the stable shared UX baseline.
- Missing Fill Blanks data has been actively created or prototyped, not merely deferred.
- Fill Blanks is exposed where data is actually ready.
- Every exposed Fill Blanks deck has enough validated content.
- Every hidden Fill Blanks language has a concrete prototype or a documented language-design blocker.
- Topic verbs have usage coverage.
- Browser checks were performed.
- No known console-breaking errors remain.

Be ambitious on data and strict on shipping. The desired outcome is more launchable Fill Blanks languages, not more hidden placeholders. But it is still better to hide an unfinished advanced feature than to ship weird or repetitive language content.
