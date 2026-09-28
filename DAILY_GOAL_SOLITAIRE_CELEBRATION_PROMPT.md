# Daily Goal Solitaire Celebration Prompt

Please implement a **celebration animation** for the French app that is clearly inspired by the old Windows Solitaire win effect, but adapted to this product and screen shape.

This is a real feature prototype, not just a visual toy.

## Goal

When the user reaches a meaningful milestone such as the daily target, trigger a celebratory animation:

- celebratory
- playful
- clearly alluding to old Solitaire card-bounce energy
- skippable immediately
- using our own app/card visual language
- running **inside the card area**, not taking over the full screen

For testing, I want a hidden trigger:

- if the user taps the **daily counter** 5 times in a row, activate the celebration scene immediately

## Important design intent

This should **not** feel like generic confetti.

It should feel like:

- “look at the cards you just worked through”
- a little excessive
- nostalgic
- satisfying

It should overlay the current card and happen **within the card region**, which is closer to square and better suited to this effect on portrait phones.

## Motion reference

Think of the old Solitaire win:

- cards start stacked near the top-left
- then launch one by one
- bounce/fall across the play area
- leave a visual trail / motion memory

But do **not** literally clone it.

Adapt it to this app:

- mini cards should look like tiny Les Verbes cards / card fragments
- motion should feel rich and a bit indulgent
- sequence can run for quite a while if not interrupted
- user must be able to skip instantly with a tap

## Functional requirements

Build a celebration system with these behaviors:

1. Trigger
- expose a function that can trigger the celebration manually
- add a hidden debug trigger:
  - tapping the daily progress counter 5 times in a row triggers it

2. Containment
- animation happens inside the main card area / current card bounds
- it should overlay the current content instead of navigating away

3. Card stream
- start from a stack in the top-left of the card area
- cards launch one by one at a cadence reminiscent of Solitaire
- they bounce nicely against the bottom/sides of the play area
- they can rotate slightly
- they should feel physical, not just CSS drifting

4. Card content
- use recent practiced material if practical
- ideally the mini cards echo recent cards the user actually did
- if recent real data is difficult, use a good fallback based on current/recent verbs
- do not make every tiny card fully readable; legibility can be partial

5. Visual style
- celebratory
- lightweight enough for phone
- subtle motion trails / afterimage welcome
- should feel premium, not tacky

6. Interruptibility
- tapping anywhere on the celebration overlay skips it immediately
- cleanup should be complete and reliable

## Engineering preference

Use the implementation approach that gives the best motion quality.

My expectation is that **canvas** is probably the right tool, but use judgment.

If using canvas:

- keep object count reasonable
- tune motion carefully
- prioritize “feels good” over physical realism

## Testing hook

For now, I specifically want:

- tapping the daily counter 5 times in a row triggers the effect

Make this easy to remove or gate later, but implement it now for testing.

## Scope

French app only for now.

Work in source files only.

Do not touch unrelated language apps.

Do not push or deploy unless explicitly asked.

## What I care about most

1. Motion feel
2. Skippability
3. Visual delight
4. Staying inside the card area
5. Not feeling like generic confetti

## What I do not want

- a full-screen takeover
- emoji/confetti particles as the main effect
- a short boring toast-level celebration
- literal copied Windows graphics
- something that blocks the app awkwardly

## Deliverable

Please implement the feature cleanly in the French app and leave it locally testable.

In your response:

- explain the implementation briefly
- list the files changed
- explain how to trigger it for testing
- mention any tuning knobs that would be easy to adjust later
