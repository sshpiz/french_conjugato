# Frames Handoff

Get up to speed on the current Frames implementation and product direction so the user can iterate with you directly afterward.

This is primarily a code-and-product understanding pass, not a broad rollout task.

## Current status

Frames exist in French and are paused strategically until UI/product direction is clearer.

Do not assume Frames are ready for broad rollout.

## What you need to understand

### Data shape

Current French frame data uses a simple shape like:

```json
{
  "verb": "parler",
  "type": "frame",
  "tense": "present",
  "question": "je ____ ____ Paul",
  "answer": "parle à",
  "full_answer": "je parle à Paul"
}
```

The current UI treats:

- first missing token as the main verb pill
- remaining missing tokens as smaller companion chips

### Current renderer

French/proj1 current frame implementation lives in:

- `/Users/simeon/Desktop/proj1/js/script.js`
- `/Users/simeon/Desktop/proj1/css/style.css`

Relevant areas include:

- tokenizing frame prompts
- splitting `answer` into slots
- rendering inline solved markup
- rendering inline prompt markup
- frame slot styling:
  - `verb-slot`
  - `particle-slot`

### Important UI direction already decided

- reveal should happen inline
- no second full answer underneath
- verb blank is a long pill
- small companion word is a visibly different smaller chip
- on reveal the shell stays as a faint ghost pill
- this is French only for now

### Product direction

Frames are conceptually separate from conjugation, but the likely user-facing model is:

- `Conjugation`
- `Mixed`
- `Frames`

Mixed is important because frames can be a good tempo change inside card drills.

Do not assume the final model is “Frames completely isolated forever”.

### Deferred / TODO ideas

These are product ideas, not instructions to implement right now:

- frame difficulty levels:
  - explicit structure
  - slot only
  - English only
  - minimal hint
- maybe later hide infinitive and show translation only

## What to do

1. Inspect the current French/proj1 Frames code path.
2. Summarize how it works today:
   - data
   - rendering
   - selection logic
   - settings/drill hooks
3. Summarize what seems solid vs what is still unsettled.
4. Identify the smallest safe next implementation opportunities.

## Non-goals

- do not roll Frames out to other languages
- do not refactor the whole feature
- do not push or deploy
- do not “finish” the product without user iteration

## Final response

Return:

1. code-path map
2. current product model
3. unresolved questions
4. recommended next steps in order
