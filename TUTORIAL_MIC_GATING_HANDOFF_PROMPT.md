# Tutorial-First Mic Gating Handoff

Get up to speed on the current mic/dictation code and the desired product change so the user can iterate with you directly.

This can become an implementation task afterward, but first you need to understand the current code path and the desired behavior precisely.

## Desired behavior

When the user taps the mic button and the mic is not currently usable:

- if tutorial is not finished:
  - tell them they need to finish the tutorial first
  - also tell them that they can activate the mic flow in settings
  - make settings glow / draw attention to settings

This should feel like helpful onboarding, not a dead error.

## Canonical codebase

Start with French/proj1:

- `/Users/simeon/Desktop/proj1/js/script.js`
- `/Users/simeon/Desktop/proj1/css/style.css`
- `/Users/simeon/Desktop/proj1/index.html`

## Already relevant code paths

Inspect at least these areas:

- dictation button refresh / state:
  - `refreshDictationButton`
- mic availability:
  - `getMicAvailability`
  - `getMicUnavailableOverlayMessage`
- dictation click handler:
  - the `dictateBtn` click path inside `setupDictation`
- tutorial state / tutorial completion
- settings UI hooks
- any existing helper that can visually nudge or glow settings

## Important existing behavior

Today there is already tutorial-aware mic availability logic and messaging.
Do not re-invent that from scratch.

What is missing is the better onboarding response:

- clearer explanation
- explicit “finish tutorial + enable in settings”
- visual settings nudge/glow

## What to do

1. Inspect the relevant code path in French/proj1.
2. Summarize current behavior for each unavailable state:
   - tutorial locked
   - phase disabled
   - unsupported
   - safe mode blocked
3. Propose the smallest clean implementation for the desired tutorial-first behavior.
4. Identify the exact files/functions to touch when implementing it later.

## Non-goals

- do not roll this out to every repo yet
- do not push or deploy
- do not redesign the whole tutorial system

## Final response

Return:

1. current behavior map
2. recommended implementation plan
3. exact files/functions to change
4. any ambiguity or product question that still needs a decision
