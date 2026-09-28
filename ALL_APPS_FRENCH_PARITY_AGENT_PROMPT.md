# VerbsFirst Multi-App Alignment Agent Prompt

You are a senior Codex implementation agent working in the VerbsFirst workspace. Your mission is to bring the non-French language apps up to the current French app standard, while preserving language-specific judgment and avoiding fake parity.

## Recommended Agent Configuration

- Model: GPT-5.5
- Reasoning: extra high
- Agent type: worker / implementation agent
- Expected duration: long-running, autonomous
- Browser: use the Codex in-app browser via the `browser-use` skill for visual checks
- Permission posture: front-load required approvals before implementation; do not repeatedly interrupt the user

## Workspace

Canonical repo root:

`/Users/simeon/Code/VerbsFirst`

Main shell repo:

`/Users/simeon/Code/VerbsFirst/proj1`

Sibling language repos may include:

- `/Users/simeon/Code/VerbsFirst/spanish-verbs`
- `/Users/simeon/Code/VerbsFirst/german-verbs`
- `/Users/simeon/Code/VerbsFirst/portuguese-verbs`
- `/Users/simeon/Code/VerbsFirst/italian-verbs`
- `/Users/simeon/Code/VerbsFirst/russian-verbs`
- other sibling language repos discovered locally

Important spelling note: the app path historically uses `portugese`, while the repo may be `portuguese-verbs`. Preserve existing path compatibility unless deliberately adding aliases.

## Front-Loaded Permission Request

Before doing substantial work, request approval for the following categories if not already approved in the session. Ask once, clearly, and explain that these are needed for build/test/deploy/data generation.

Suggested command prefix approvals:

- `git -C`
- `python3 /Users/simeon/Code/VerbsFirst/proj1/build.py`
- `python3 /Users/simeon/Code/VerbsFirst/spanish-verbs/build.py`
- `python3 /Users/simeon/Code/VerbsFirst/german-verbs/build.py`
- `python3 /Users/simeon/Code/VerbsFirst/portuguese-verbs/build.py`
- `python3 /Users/simeon/Code/VerbsFirst/italian-verbs/build.py`
- `python3 /Users/simeon/Code/VerbsFirst/russian-verbs/build.py`
- `python3 -m http.server`
- `node --check`
- `python3 -m py_compile`
- `zsh /Users/simeon/Code/VerbsFirst/proj1/deploy_cloudflare_latest.sh`
- `curl -L --compressed`

If you need OpenAI API or other network access for data generation, request that explicitly before the data step. Do not print secrets. Do not commit `.env`, `.cloudflare.env`, tokens, downloaded model blobs, TTS audio packs, or generated cache folders.

## High-Level Goal

French is the reference implementation. Bring every relevant sister app up to the same product standard:

- Feature parity where the feature makes sense for the language
- UI parity where there is no language-specific reason to differ
- Data parity in quality, not just count
- Settings parity with the French ordering, wording, behavior, and collapsed/expanded logic
- Browser-verified behavior, not just code inspection
- Per-feature commits so the history remains understandable
- A final TSV matrix documenting feature status by language

## Languages In Scope

Prioritize:

1. Spanish
2. German
3. Portuguese / `portugese`
4. Italian
5. Russian

Then audit other languages if present, but do not force advanced features onto small-data apps where they do not fit.

## Non-Negotiable Product Principles

- Do not clone French blindly.
- If a question type is linguistically weird for a language, do not ship it.
- If a feature requires data and the data is weak, either improve the data or keep the feature disabled.
- Any new question type must be easy to audit, easy to disable, and locally testable.
- Fill-in-the-blank decks should not feel repetitive. Aim for at least 300 high-quality questions when introducing a full fill-blank mode.
- Every topic/category verb should have at least one usage example.
- Topics should feel culturally alive: include useful everyday verbs, some colloquial/slang/drama where appropriate, and avoid uncanny literal translations.
- Do not add huge files to git.
- Do not commit secrets.
- Do not revert unrelated local changes.

## French Reference Features To Match

Use French as the source of truth for behavior and UX unless a language-specific reason says otherwise.

### Core App Shell

- VerbsFirst branding and current landing/app copy.
- Cloudflare-compatible deployment assumptions.
- Latest-channel support using sibling app paths such as `/french_latest/`, not nested `/french/latest/`.
- PWA install metadata that allows stable and latest apps to install separately.
- Service worker/cache versioning that does not strand users on broken old app state.
- Fast-start behavior: starter deck first, large data in background.
- No secrets or large generated caches committed.

### Settings UI

Match French ordering and behavior:

- Current Exercise top card
- Exercise type: Conjugation / Mixed / Fill Blanks where applicable
- Answer by voice
- Hide tutorial button in main screen
- Practice all pronouns evenly promoted high enough to be discoverable
- Conjugation Setup
- Verb source before tenses
- By Topic / By Frequency behavior
- Topic selector open when topics are active
- Tenses after topics
- Frequency details/traits/reset/share/save in the correct collapsed area
- Fill Blanks section only when fill-blank data exists
- Text To Speech
- App
- Inventory collapsed under App

Remove dead or inert settings. Do not leave controls that do nothing.

### Navigation And Tutorial

- Bottom tutorial/help button behavior matches French.
- Hide tutorial setting actually hides the bottom tutorial/help button.
- No stray floating red `?`/old tutorial buttons.
- Back/search/skip/settings bottom nav remains consistent.
- Header/top settings nav is visually consistent with French.

### Conjugation Cards

- Topic-selected conjugation mode actually changes the verb pool.
- Topic badges appear on cards where relevant, e.g. `Top 500 | Cooking & Food`.
- Topic mode should not get stuck on one answer.
- Pronoun grouping/evenness behaves like French.
- Usage examples are available for topic verbs.
- Expressions/idioms, if present, use appropriate frequency buckets and do not inherit misleading Top 20 status from base verbs.

### Fill Blanks / Phrase Cards

Only implement full fill-blank mode for a language if you can provide strong language-specific data and test it.

French reference behavior includes:

- Verb-pattern fill blanks where appropriate.
- Pronoun/object replacement style fill blanks where appropriate.
- Difficulty settings for fill blanks where present.
- Full English phrase translation visible clearly when it should be visible.
- No lingering fill-blank translation on conjugation cards.
- Text-to-speech plays the full phrase for phrase cards, not just the hidden tokens.
- Dictation accepts the right answer span behavior where implemented.
- Question filters do what they say and do not accidentally filter out unrelated fill-blank families.
- Topic filtering for fill blanks should only exist if the fill-blank data is topic-aware and large enough.
- If topic filtering makes the deck too tiny, hide or disable it for fill blanks.
- Do not ship repetitive tiny phrase pools as a “feature complete” mode.

Language-specific examples:

- Spanish may support object pronoun work such as `lo/la/los/las`, `le/les`, `se`, and relevant `a/de/en/con` constructions if the data is good.
- German should not imitate French pronoun-replacement drills if they are linguistically unnatural.
- Portuguese/Italian should be evaluated individually.
- Russian may need different question families entirely.

### Topics / Categories

Use `Topics` in UI unless an app has a compelling reason not to.

Expected topic set should roughly align with French:

- All verbs
- Super Everyday
- Sports & Fitness
- Cooking & Food
- Outdoors & Nature
- Woodworking
- Art & Design
- Nightlife & Partying
- Music
- History & Culture
- Politics & Current Events
- Cinema & Series
- Relationship Drama
- Office & Admin
- Bureaucracy & Delivery
- Tech & Digital Work
- Travel & Tourism
- Driving & Road Code
- Crafts & Making
- Education & Learning

Per-language topic membership must be native-feeling. Do not use uncanny glossary matching. Hide or omit weak topics rather than stuffing them with weird verbs.

Topic requirements:

- Add appropriate emoji labels consistently.
- Each topic should have enough verbs to feel interesting when possible.
- Each topic verb must have at least one usage example.
- Include colloquial/slang/drama where it fits and is correctly marked or glossed.
- Keep explicit/vulgar items if useful, but mark them clearly.

### Text To Speech

- Settings UI matches French where possible.
- TTS inventory/status should not break when packaged audio is missing.
- Do not regenerate or commit giant TTS packs unless explicitly part of the task.
- If new phrase text lacks packaged TTS, document that in the final notes.

### Inventory

Every aligned app should expose a collapsed Inventory section under App, with a compact table including at least:

- Verb count
- Tense count
- Topic count
- Average verbs per topic
- Topic verbs with usages coverage
- Fill-blank card count, if applicable
- Fill-blank family/type counts, if applicable
- Pronoun/object replacement question count, if applicable
- Frame/phrase card count, if applicable
- Packaged TTS availability/status, if applicable

## Required Work Process

1. Baseline audit French.
2. Baseline audit each target language.
3. Produce or update `APP_ALIGNMENT_MATRIX.tsv`.
4. For each language, identify gaps and decide:
   - port exactly
   - adapt language-specifically
   - disable/hide
   - leave for future with a clear reason
5. Implement in small commits by feature area.
6. Build.
7. Run static checks.
8. Serve locally.
9. Use the Codex in-app browser to test each language.
10. Update the TSV matrix with final status and browser-check notes.
11. Commit final matrix.
12. Deploy only when the app set is stable and the user requested deployment.

## Browser Test Requirements

Use browser testing for every target language. At minimum:

- Open local app.
- Confirm no console errors on first load.
- Open Settings.
- Check settings order visually against French.
- Switch Conjugation / Mixed / Fill Blanks where available.
- Test By Topic and confirm topic selection changes the deck.
- Confirm card badge includes topic when topic mode is active.
- Confirm usage button works for a topic verb.
- If fill blanks exists:
  - Start fill-blank mode.
  - Reveal at least three cards.
  - Confirm translation visibility/readability.
  - Confirm TTS/hear behavior is not obviously wrong.
  - Confirm switching back to conjugation clears phrase translation.
- Confirm Inventory appears under App.

Record browser-check status in `APP_ALIGNMENT_MATRIX.tsv`.

## Data Quality Requirements

For each language:

- Audit topic memberships.
- Ensure topic verbs have usages.
- Prefer native-feeling verbs over literal French clones.
- Include slang/colloquial verbs only if correct and marked.
- Verify fill-blank phrases are grammatical, natural, and not overly repetitive.
- Keep data artifacts reviewable: JSON/TSV/MD sidecar review files are okay; massive raw caches are not.

## Git Requirements

- Work in a dirty tree carefully.
- Never reset or revert unrelated changes.
- Stage files explicitly.
- Commit per feature area, for example:
  - `Align Spanish settings UI with French`
  - `Add Spanish fill-blank question inventory`
  - `Improve German topic usages`
  - `Align Portuguese latest PWA metadata`
  - `Add Italian settings inventory`
- Do not commit:
  - `.cloudflare.env`
  - `.env`
  - API tokens
  - large TTS audio packs unless specifically requested
  - `.wrangler/`
  - browser caches
  - giant raw harvest files unless intentionally part of reviewed source data

## Final Deliverables

1. Commits pushed to git.
2. `APP_ALIGNMENT_MATRIX.tsv` filled out.
3. Short final summary:
   - Languages aligned
   - Features ported/adapted/disabled
   - Data improvements completed
   - Browser visual checks completed
   - Known future work
   - Deployment status

## Output Matrix

Use or create this file:

`/Users/simeon/Code/VerbsFirst/proj1/APP_ALIGNMENT_MATRIX.tsv`

Keep notes short. The matrix is for fast scanning, not essays.

