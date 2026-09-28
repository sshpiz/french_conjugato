# Bug Diagnoses: Answer Flash + Grouped Pronouns

Date: 2026-04-19

This note summarizes two source-level bug diagnoses for a follow-up fixing agent.

Scope:
- Diagnose only
- No generated files
- No `dist/` / `dist-gh/`
- Source files only

---

## 1. Brief flash of the next card's answer

### User-visible symptom

When moving from a revealed answer to the next card, the next card's answer is visible very briefly, then disappears. The user reported seeing this in Ukrainian, and it may also exist in other apps.

### Main diagnosis

The bug is **confirmed in Ukrainian source** and is **not confirmed in French**.

Ukrainian uses a materially different next-card flow:

- its advance handler does **not** hide the answer first
- it goes straight from a revealed card into `nextCard()`
- that means the next card can render while the previous card's answer is still visible

Relevant source:
- `/Users/simeon/Desktop/ukrainian-verbs/js/script.js:3358`
- `/Users/simeon/Desktop/ukrainian-verbs/js/script.js:3411`

Specifically:

- `handleAdvanceFromCard()`:
  - completes tutorial state if needed
  - then immediately calls `nextCard()`
- `nextBtn` is wired directly to `handleAdvanceFromCard()`

That matches the reported symptom much better than the French-family hypothesis.

### French-family note

French and the French-family apps use a safer visible flow:

- hide current answer
- wait `300ms`
- then advance

French example:
- `/Users/simeon/Desktop/proj1/js/script.js:3821`

So the bug should **not** be assumed present there just because of a shared rendering smell.

There is still a theoretical sequencing risk in the French-family apps because `displayCard(...)` writes new answer text before it fully reasserts hidden state for verb cards, but that is a **code smell**, not a confirmed bug report.

I would not hand that to an agent as “same bug everywhere.”

Relevant examples:
- French:
  - `/Users/simeon/Desktop/proj1/js/script.js:3569`
  - `/Users/simeon/Desktop/proj1/js/script.js:3718`
  - `/Users/simeon/Desktop/proj1/js/script.js:3776`
  - `/Users/simeon/Desktop/proj1/js/script.js:3792`
- Spanish:
  - `/Users/simeon/Desktop/spanish-verbs/js/script.js:3203`
  - `/Users/simeon/Desktop/spanish-verbs/js/script.js:3333`
  - `/Users/simeon/Desktop/spanish-verbs/js/script.js:3413`
  - `/Users/simeon/Desktop/spanish-verbs/js/script.js:3425`
- Greek:
  - `/Users/simeon/Desktop/greek-verbs/js/script.js:3509`
  - `/Users/simeon/Desktop/greek-verbs/js/script.js:3573`
  - `/Users/simeon/Desktop/greek-verbs/js/script.js:3638`
  - `/Users/simeon/Desktop/greek-verbs/js/script.js:3654`

The CSS explains why the Ukrainian bug is visually noticeable:

- answer visibility is controlled by `visibility` + `opacity`
- those properties are transitioned over `0.3s`

Examples:
- French:
  - `/Users/simeon/Desktop/proj1/css/style.css:653`
  - `/Users/simeon/Desktop/proj1/css/style.css:672`
- Spanish:
  - `/Users/simeon/Desktop/spanish-verbs/css/style.css:653`
  - `/Users/simeon/Desktop/spanish-verbs/css/style.css:672`
- Greek:
  - `/Users/simeon/Desktop/greek-verbs/css/style.css:625`
  - `/Users/simeon/Desktop/greek-verbs/css/style.css:644`

### Ukrainian-specific diagnosis

Ukrainian's `showCard(card)` is actually structurally fine at the top:

- it sets `isAnswerVisible = false`
- removes `.is-visible`
- explicitly sets:
  - `answerContainer.style.visibility = 'hidden'`
  - `answerContainer.style.opacity = '0'`

Source:
- `/Users/simeon/Desktop/ukrainian-verbs/js/script.js:2313`
- `/Users/simeon/Desktop/ukrainian-verbs/js/script.js:2321`
- `/Users/simeon/Desktop/ukrainian-verbs/js/script.js:2324`

And `nextCard()` calls `showCard(card)` directly:
- `/Users/simeon/Desktop/ukrainian-verbs/js/script.js:2387`

So the likely actual Ukrainian problem is:

1. user is on a revealed card
2. `handleAdvanceFromCard()` advances immediately without a hide phase
3. `showCard(newCard)` eventually hides the answer container
4. but the previous visible state can leak long enough for the next answer to flash

This is a much cleaner diagnosis than the earlier broad French-family one.

### Recommended mitigation

For Ukrainian, the safest fix direction is:

1. Make advance from a revealed card follow the French-style flow:
   - hide current answer first
   - wait for the hide transition
   - then call `nextCard()`

Safe pattern:

- set `isAnswerVisible = false`
- remove `.is-visible`
- if needed, also explicitly force:
  - `visibility = hidden`
  - `opacity = 0`
- after the transition window, call `nextCard()`

This can be done by introducing a Ukrainian `handleNext` equivalent rather than wiring the button directly to `nextCard()`.

### Current confirmed impact

Confirmed from source + report:
- `/Users/simeon/Desktop/ukrainian-verbs`

Not confirmed and should not be claimed as affected from this diagnosis alone:
- `/Users/simeon/Desktop/proj1`
- `/Users/simeon/Desktop/greek-verbs`
- `/Users/simeon/Desktop/portuguese-verbs`
- `/Users/simeon/Desktop/russian-verbs`
- `/Users/simeon/Desktop/catalan-verbs`
- `/Users/simeon/Desktop/latvian-verbs`
- `/Users/simeon/Desktop/spanish-verbs`

---

## 2. Grouped pronouns leaking onto flashcards

### User-visible symptom

In Spanish, a card can show a grouped pronoun like:

- `él / ella / usted`
- `ellos / ellas / ustedes`

instead of one concrete subject. This also breaks:

- pronoun pill emoji
- answer line
- TTS / prompt text

The user remembers a similar issue in Latvian.

### Core design rule

There are two different concepts which should stay separate:

1. **lookup key / conjugation slot**
   - grouped key is acceptable here
   - examples:
     - `él/ella/usted`
     - `viņš/viņa`
     - `он/она/оно`

2. **flashcard surface pronoun**
   - must be **one concrete pronoun**
   - examples:
     - `él`
     - `usted`
     - `viņa`
     - `она`

The bug happens when grouped lookup keys leak into the second layer.

### Spanish diagnosis

Spanish already has some correct fix machinery:

- grouped canonicalization:
  - `/Users/simeon/Desktop/spanish-verbs/js/script.js:88`
- variant expansion:
  - `/Users/simeon/Desktop/spanish-verbs/js/script.js:127`
- concrete-pronoun helper:
  - `/Users/simeon/Desktop/spanish-verbs/js/script.js:139`
- emoji fallback helper:
  - `/Users/simeon/Desktop/spanish-verbs/js/script.js:151`
- display normalization:
  - `/Users/simeon/Desktop/spanish-verbs/js/script.js:158`
- display-time correction:
  - `/Users/simeon/Desktop/spanish-verbs/js/script.js:3204`

That means normal deck generation is mostly on the right track now.

However, the underlying class of bug still exists in grouped-pronoun apps because card reconstruction from URL/hash is a common re-entry point.

In Spanish, `generateCardFromParams(...)` now uses:
- `getConcretePronounDisplay(...)`
- and returns through `ensureConcreteCardPronoun(...)`

Source:
- `/Users/simeon/Desktop/spanish-verbs/js/script.js:4997`
- `/Users/simeon/Desktop/spanish-verbs/js/script.js:5036`

So if grouped pronouns still appear in Spanish, the likely remaining cases are:

- an older cached build
- older persisted hash/history state
- another code path creating card objects without passing through the concrete-pronoun helper

### Other repos with the same structural risk

These grouped-pronoun apps still preserve the original display pronoun in `generateCardFromParams(...)`, which means grouped labels can leak back in through:

- direct links
- reloads
- old hashes
- startup restoration

Affected source examples:

- Portuguese:
  - `/Users/simeon/Desktop/portuguese-verbs/js/script.js:4995`
- Catalan:
  - `/Users/simeon/Desktop/catalan-verbs/js/script.js:4974`
- Russian:
  - `/Users/simeon/Desktop/russian-verbs/js/script.js:5247`
- Latvian:
  - `/Users/simeon/Desktop/latvian-verbs/js/script.js:4983`
- Ukrainian:
  - `/Users/simeon/Desktop/ukrainian-verbs/js/script.js:3288`

Pattern in those repos:

- `displayPronoun = normalizePronounDisplay(pronoun)` or raw trimmed pronoun
- `actualPronounKey = toCanonicalPronounKey(displayPronoun)`
- card is returned with:
  - `pronoun: displayPronoun`
  - `pronounKey: actualPronounKey`

That means:

- grouped key is used for lookup, which is fine
- but grouped display label is preserved too, which is **not** fine for flashcards

### Why this breaks emoji and TTS

Once `card.pronoun` is grouped, several downstream paths become wrong:

- pronoun pill text becomes grouped
- emoji lookup may fail or become generic
- prompt text says the grouped label
- answer text may embed the grouped label
- conjugation audio ids / TTS may use the wrong surface subject

Spanish examples:
- hash writing:
  - `/Users/simeon/Desktop/spanish-verbs/js/script.js:3191`
- pronoun pill display:
  - `/Users/simeon/Desktop/spanish-verbs/js/script.js:3311`
- answer line:
  - `/Users/simeon/Desktop/spanish-verbs/js/script.js:3346`

Latvian has the same architecture class:
- grouped canonical slots
- grouped direct param reconstruction
- no equivalent display-time concrete-pronoun hardening found in the inspected path

### Recommended mitigation

For grouped-pronoun languages, apply this rule consistently:

#### Card object rule

Every flashcard object should contain:

- `pronounKey`
  - the canonical grouped lookup key if needed
- `pronoun`
  - exactly one concrete display pronoun

Never allow grouped display labels to survive in card objects used by the flashcard UI.

#### Safe fix pattern

1. In `generateCardFromParams(...)`
   - if the incoming pronoun belongs to a grouped key, convert it to:
     - canonical grouped `pronounKey`
     - one concrete `pronoun` display value

2. Add a card-normalization helper like Spanish's `ensureConcreteCardPronoun(card)`
   - and run it at the top of `displayCard(...)`
   - this lets the app self-heal older hashes or stale card objects

3. Emoji lookup should support:
   - direct concrete pronoun lookup first
   - fallback to grouped canonical key second

4. Hash / URL writing should prefer concrete `card.pronoun`
   - not grouped labels

5. TTS / prompt / answer display should use:
   - concrete `card.pronoun`
   - canonical `card.pronounKey` only for lookup, audio ids, or conjugation-table access

### Repos likely needing the same grouped-pronoun hardening

High-confidence grouped-pronoun risk:
- `/Users/simeon/Desktop/portuguese-verbs`
- `/Users/simeon/Desktop/catalan-verbs`
- `/Users/simeon/Desktop/russian-verbs`
- `/Users/simeon/Desktop/latvian-verbs`
- `/Users/simeon/Desktop/ukrainian-verbs`

Spanish:
- should be reviewed carefully rather than assumed fixed everywhere
- some fix machinery is already present in source
- bug may still survive through non-normalized card creation paths or stale runtime state

---

## Suggested execution order for the fixing agent

1. Fix the French-family answer-flash bug first
   - hide answer container at the top of `displayCard(...)`
   - confirm no flash in French
   - then port to the other French-family repos

2. Verify Ukrainian separately for answer flash
   - do not assume identical root cause

3. For grouped-pronoun apps
   - use Spanish's concrete-pronoun helper approach as the model
   - port the same card-normalization pattern to the other grouped-pronoun repos
   - especially harden `generateCardFromParams(...)` and `displayCard(...)`

4. Re-test:
   - normal random card generation
   - reload with hash params
   - old-style grouped hash if available
   - TTS / prompt / emoji / answer line
