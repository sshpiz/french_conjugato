# Prompt: Fix Ukrainian Next-Card Answer Flash + Review/Implement Voice Correctness Policy

Please work from source only.

## Scope

1. **Fix bug 1**
   - Ukrainian app briefly shows the next card's answer when advancing from a revealed card.

2. **Review and implement issue 3**
   - Define and implement the correct per-language policy for deciding whether a spoken answer is correct.

## Important constraints

- Source files only
- Do **not** touch:
  - `dist/`
  - `dist-gh/`
  - generated audio/data artifacts
- Do not push or deploy unless explicitly asked
- Respond in English

---

## Part 1: Fix Ukrainian bug 1

### Symptom

In the Ukrainian app, when the current card is already revealed and the user advances to the next card, the next card's answer can flash briefly before hiding.

### Diagnosis already established

The Ukrainian app advances from a revealed card straight into `nextCard()` without first hiding the current answer.

Relevant source:
- `/Users/simeon/Desktop/ukrainian-verbs/js/script.js`

Important locations:
- `handleAdvanceFromCard`
- `nextBtn` click wiring
- `showCard`
- answer visibility helpers

Specifically, the likely root cause is:
- the revealed state is still visually active
- advance goes directly to `nextCard()`
- new card renders while answer visibility is still effectively on

### What to do

- Implement the safest fix for Ukrainian only
- Make advancing from a revealed card hide the current answer first, then advance after the hide transition
- Keep the normal flow consistent with the rest of the app
- Do not introduce regressions in tutorial flow, dictation flow, or back/next history behavior

### Also do this

- Check whether any other apps actually share this exact user-facing bug
- If they do not, say so clearly
- Do not mass-port a speculative fix just because code smells are similar

---

## Part 2: Review and implement voice correctness policy by language

### Product question

What should count as a correct spoken answer in each language app?

This should be treated as a language-specific product decision, not one global rule.

### Known starting points

- **French**
  - likely should require the pronoun plus the conjugated verb
  - because the spoken subject is a real part of the expected answer format in this app

- **Spanish**
  - likely should accept the conjugated verb alone
  - because in normal Spanish usage the subject pronoun is often omitted
  - it may also accept pronoun + verb, but should not require the pronoun

### What to review for every language

Please review:
- French
- Greek
- Portuguese
- Russian
- Catalan
- Ukrainian
- Latvian
- Spanish

For each language, decide which spoken forms should count as correct:
- conjugated verb only
- pronoun + conjugated verb
- either
- any other language-specific nuance

### Bonus problem: French homophones

Please also think about a practical approach for French homophone ambiguity, especially cases like:
- `elle` vs `elles`
- `il` vs `ils`

The problem:
- the user may say the correct plural form
- speech recognition may still transcribe the singular homophone

Please review and give an opinion on the best approach.

Possible directions to evaluate:
- heuristic acceptance rules
- alternate accepted spoken patterns
- nudging the user to say something disambiguating for plural, e.g. a fuller phrase
- keeping the system simple and accepting ambiguity in some cases

Do **not** over-engineer this. Prefer a practical, learner-friendly solution.

### Implementation goal

Implement the per-language dictation correctness policy in source.

This likely means updating the language-specific logic that determines whether a transcript matches the expected answer.

Please:
- identify where `isDictationMatch(...)` or equivalent logic lives in each app
- implement the new matching policy appropriately per language
- keep it understandable and easy to maintain

### Important product constraints

- Do not make all languages behave the same by default
- Do not silently loosen correctness everywhere
- Keep the app’s teaching intent in mind:
  - some apps may want explicit pronoun practice
  - others should accept natural null-subject speech

---

## Deliverables

1. Fix the Ukrainian next-card answer flash
2. Implement per-language voice correctness rules
3. At the end, provide a concise report with:
   - what was changed
   - which languages now require pronoun + verb
   - which languages accept verb only
   - which languages accept either
   - your recommendation for French homophone handling

## Files likely involved

- `/Users/simeon/Desktop/ukrainian-verbs/js/script.js`
- `/Users/simeon/Desktop/proj1/js/script.js`
- `/Users/simeon/Desktop/greek-verbs/js/script.js`
- `/Users/simeon/Desktop/portuguese-verbs/js/script.js`
- `/Users/simeon/Desktop/russian-verbs/js/script.js`
- `/Users/simeon/Desktop/catalan-verbs/js/script.js`
- `/Users/simeon/Desktop/ukrainian-verbs/js/script.js`
- `/Users/simeon/Desktop/latvian-verbs/js/script.js`
- `/Users/simeon/Desktop/spanish-verbs/js/script.js`

## Helpful existing note

Bug diagnosis note:
- `/Users/simeon/Desktop/proj1/BUG_DIAGNOSES_2026-04-19.md`
