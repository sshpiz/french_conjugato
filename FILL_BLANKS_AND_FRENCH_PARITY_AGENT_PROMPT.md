# VerbsFirst Language Parity + Fill-Blanks Data Brief

You are a long-running implementation/data-quality agent for VerbsFirst. Work autonomously and thoroughly. The goal is to bring every language app up to the current French standard where it makes linguistic sense, with special attention to fill-in-the-blank question data. Do not treat this as only a UI port. Data creation, validation, and auditability are core parts of the work.

## Repos

- French reference app: `/Users/simeon/Code/VerbsFirst/proj1`
- Spanish: `/Users/simeon/Code/VerbsFirst/spanish-verbs`
- German: `/Users/simeon/Code/VerbsFirst/german-verbs`
- Portuguese: `/Users/simeon/Code/VerbsFirst/portuguese-verbs`
- Italian: `/Users/simeon/Code/VerbsFirst/italian-verbs`
- Russian: `/Users/simeon/Code/VerbsFirst/russian-verbs`
- Greek: `/Users/simeon/Code/VerbsFirst/greek-verbs`
- Catalan: `/Users/simeon/Code/VerbsFirst/catalan-verbs`
- Latvian: `/Users/simeon/Code/VerbsFirst/latvian-verbs`
- Ukrainian: `/Users/simeon/Code/VerbsFirst/ukrainian-verbs`

## Current Known State

- French is the reference for current settings UX, fill-blank UX, topic badges, inventory, tutorial/help behavior, and card flow.
- Spanish and German have fill-blank implementations, but still need a hard data-quality pass and volume/repetition audit.
- Portuguese, Italian, and Russian have much of the newer settings/topics work, but fill-blanks are hidden or not fully data-backed.
- Greek, Catalan, Latvian, and Ukrainian were not included in the last alignment matrix. Treat them as needing a full assessment from scratch.
- If a language cannot support a fill-blank family cleanly yet, do not expose dead UI. Hide it and document what data is missing.

## Required Outcome

Create a reliable, auditable parity state across all 10 apps. For each language, decide which French features are relevant, implement those features, and build the required data. Do not copy French grammar concepts blindly into languages where they are unnatural.

## Fill-Blanks Data Standard

For any language where fill-blanks are exposed:

- Minimum target: 300 playable questions before exposing the mode, unless explicitly justified.
- Every question must be natural to a native speaker.
- Every question must have a clear answer span, a full target-language sentence, and a readable English translation.
- Avoid repetitive templates. Vary topics, pronouns/persons, tense where supported, register, and sentence shape.
- If a topic/category is used to filter questions, topic-filtered decks must still have enough variety to feel usable.
- If a verb is in a topic/category, it should have at least one usage example.
- New generated data must be easy to audit: include JSON/JS data files plus a concise review/audit markdown or TSV with counts and sample rows.
- Include notes for missing TTS strings, but do not commit huge generated TTS unless explicitly requested.

## Language-Specific Guidance

- French: preserve current behavior. Use it as the reference, but continue improving fill-blank data and translations when gaps are found.
- Spanish: do not simply clone French. Good fill-blank families may include `a/de/en/con`, direct/indirect object pronouns, `lo/la/los/las`, `le/les`, and `se` only where natural.
- German: only keep sentence frames that test something real. Avoid revealing the answer inside the prompt. Check separable verbs, modals, prepositions, and case-sensitive patterns carefully.
- Portuguese/Italian/Catalan: likely good candidates for fill-blanks, but build language-native patterns and enough data before exposing UI.
- Russian/Greek/Latvian/Ukrainian: only introduce fill-blank families that are linguistically appropriate. If uncertain, produce a proposal and data audit first, not shipped UI.

## UI/Feature Parity Checklist

For every language, verify or implement where relevant:

- Settings order matches French unless there is a language-specific reason.
- Current Exercise summary is correct.
- Conjugation Setup works.
- Fill Blanks section is shown only when playable data exists.
- Topics are called Topics, have emoji labels, and topic selection affects conjugation cards correctly.
- Topic badge appears on cards when a topic is active.
- Usage button works for topic verbs.
- No lingering fill-blank translation appears after returning to conjugation cards.
- Advanced settings do not collapse or jump when toggles are changed.
- Inventory section exists and is collapsed by default.
- Tutorial/help button behavior matches French.
- Text To Speech and App sections match French structure where applicable.

## Required Testing

For each language:

- Run `node --check js/script.js`.
- Run the language `build.py`.
- Run any data validators/generators you add.
- Start a local static server and use the in-app browser/browser-use to visually check:
  - first card load
  - settings screen
  - topic selection
  - topic badge on card
  - usage reveal
  - fill-blank mode if exposed
  - switching fill-blanks back to conjugation
  - no console errors
- Add a short visual-check note in the final TSV.

## Required Deliverables

- Update or create a TSV matrix covering all 10 languages with columns for:
  - settings parity
  - topics
  - topic usage coverage
  - topic badge
  - fill-blanks UI
  - fill-blanks data count
  - fill-blanks families
  - fill-blanks translations
  - TTS gap note
  - inventory
  - visual browser check
  - build/check status
  - commit hash
  - short note
- For each language with fill-blanks, add an audit artifact with:
  - total questions
  - distinct verbs
  - question families
  - topic coverage
  - sample questions
  - known exclusions
- Commit per feature/app where practical.
- Do not commit secrets such as `.cloudflare.env`.
- Do not commit giant generated audio or cache folders unless explicitly requested.
- Do not deploy unless explicitly requested.

## Permissions / Autonomy

At the start of the session, ask for any needed approvals in one batch: builds, local browser/server checks, network/API/model-assisted data generation, and writes within these repos. After that, proceed without stopping for routine decisions.

Use model/API assistance only in small auditable batches. Do not send giant whole-draft dumps. Do not mix languages in one generation call. Validate every generated batch before merging.

## Final Report Format

Keep the final report concise:

- What changed.
- Which languages are fully aligned.
- Which languages intentionally hide fill-blanks and why.
- Data counts per language.
- Browser/build verification summary.
- Remaining risks or next recommended data pass.
