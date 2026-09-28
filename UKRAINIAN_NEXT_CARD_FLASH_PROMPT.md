# Prompt: Fix Ukrainian next-card answer flash

Please fix **only** the Ukrainian flashcard bug where the next card's answer briefly appears when advancing from a revealed card.

## Scope

- Ukrainian app only
- Source files only
- Do not touch:
  - `dist/`
  - `dist-gh/`
  - generated files
- Do not push or deploy unless explicitly asked
- Respond in English

## Symptom

In the Ukrainian app, if the current card's answer is already revealed and the user advances, the next card can briefly show its answer before hiding it.

## Diagnosis already established

Relevant file:
- `/Users/simeon/Desktop/ukrainian-verbs/js/script.js`

Important source locations:
- `handleAdvanceFromCard`
- `nextBtn` click wiring
- `showCard`
- answer visibility logic

The likely root cause is:
- advancing from a revealed card goes straight into `nextCard()`
- the current answer is not explicitly hidden first
- so the next card can render while answer visibility is still effectively on

This is the key place to inspect:
- `/Users/simeon/Desktop/ukrainian-verbs/js/script.js`

## What to do

Implement the safest Ukrainian-only fix:

- when advancing from a revealed card:
  - hide the current answer first
  - let the hide transition/state settle
  - then call `nextCard()`

Keep the rest of the app behavior intact:
- tutorial flow
- dictation flow
- back/next history
- answer reveal behavior

Do not broaden this into a cross-repo parity pass.

## Helpful note

Bug diagnosis note:
- `/Users/simeon/Desktop/proj1/BUG_DIAGNOSES_2026-04-19.md`

## Deliverables

1. Fix the Ukrainian bug in source
2. Briefly explain what changed
3. Do not build, push, or deploy unless explicitly asked
