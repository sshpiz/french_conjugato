Please implement a smarter hidden card-selection layer for the French app.

Target repo:
- /Users/simeon/Desktop/proj1

Scope:
- French app only for now
- Do not port to sibling apps in this task
- Do not push or deploy unless explicitly asked

Important:
- This is **not** a classic spaced repetition system
- No rating buttons
- No “again / hard / easy”
- No calendar scheduling
- No visible SR UI
- Keep it local, lightweight, and understandable

Goal:
- Reduce annoying repetition of easy/familiar cards
- Increase exposure to cards that are likely harder or less familiar
- Preserve flow and variety through weighted randomness

Core product idea:
- Use a small local prioritization model
- Keep it invisible to the user
- Let existing drill/settings behavior remain primary
- Layer selection intelligence on top of the current weighted generation

Requirements

1. One central config object

Create one central tuning object, e.g.:

- `reviewModelConfig`

It should control:
- relative weights
- recent-repeat blocking / recency recovery
- familiarity boosts
- regularity difficulty boost
- details-opened hint strength
- optional dwell-time behavior
- candidate pool behavior / randomness

Everything tunable should live there, not be scattered.

2. Lightweight local state only

Persist only small metadata in localStorage.

Per card, track things like:
- `seenCount`
- `lastSeenTurn`
- optional weak dwell hint count

Per verb, track at least:
- `openedDetailsCount`
- `lastDetailsOpenedTurn`

Global/session:
- turn counter
- optional rolling dwell baseline

No backend, no sync, no analytics.

3. Weighted randomness, not deterministic sorting

Do not simply sort and always take the top item.

Instead:
- build the eligible weighted deck
- apply a score modifier layer
- pick by weighted randomness

We want variety and flow, not rigid scheduling.

4. Difficulty must include regularity

At minimum, static difficulty should treat irregular forms/verbs as harder than regular ones.

Use French’s existing regular/irregular knowledge where available.

Recommended principle:
- regular cards: neutral baseline
- irregular cards: meaningful boost

If helpful, also include other lightweight static signals, but **regularity must be part of difficulty**.

5. Scoring model

Build a simple score function that combines:
- base drill/settings weight
- static difficulty
  - at minimum: regular vs irregular
- low-seen-count boost
- recency suppression/recovery
- modest verb-details-opened hint
- optional weak dwell-time hint

Priority order:
- strongest: base drill/settings weight + static difficulty
- strong secondary: low seen count / familiarity
- moderate: details-opened hint
- weak and optional: dwell-time hint

6. Dwell-time handling must stay weak

Dwell time is noisy.

If implemented:
- compare against a rolling baseline
- only count meaningfully slow reveals
- cap the effect hard
- make it easy to disable from config

Dwell should be off by default unless the existing code already has a safe pattern.

7. Integration expectations

Integrate into the French app’s existing card selection path rather than inventing a second scheduler.

Use the existing weighted deck generation and layer the review model into it.

Also:
- record “seen” when a card is shown
- record “opened details” when verb details are opened
- if there is already a hidden review-model implementation, inspect it first and improve/complete it rather than duplicating it

8. Keep it simple

This is a v1.

Do not over-engineer.

The result should be:
- understandable
- well-commented
- easy to tune
- isolated in a few helpers

Suggested deliverables

Please implement:
- a central config object
- localStorage-backed review metadata
- helper to record card exposure
- helper to record opened verb details
- optional dwell hint helper
- scoring function
- weighted-random selection using the adjusted score
- regularity-aware static difficulty

Also provide a short summary of:
- how regularity affects difficulty
- which knobs are safest to tune first
- where the feature lives in source

Files likely involved

- /Users/simeon/Desktop/proj1/js/script.js

Possibly inspect:
- /Users/simeon/Desktop/proj1/index.html
- /Users/simeon/Desktop/proj1/css/style.css

But do not add UI unless absolutely necessary.

Verification

At the end:
- run the French build
- confirm the app still loads
- summarize the implementation clearly

Do not port to other languages yet.
Do not push or deploy unless explicitly asked.
