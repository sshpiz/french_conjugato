# French Frame Card UI Correction Prompt

Please fix the **French frame-card UI presentation**.

Important:
- French only
- source files only
- do not touch `dist/`, `dist-gh/`, or generated build files unless explicitly asked
- do not push or deploy unless explicitly asked
- respond in English

Context:
- repo: `/Users/simeon/Desktop/proj1`
- frame cards already exist conceptually
- this task is about **UI correction**, not rethinking the data model

## Main problem

The current frame-card UI is too literal and too worksheet-like.

Current issues:
- visible underscore strings like `____ ____`
- too much structural information given away
- the frame-card label is too loud on the card face
- the phrase prompt feels detached from the app’s normal reveal flow

We want the card to feel like a normal Les Verbes flashcard, not like a school worksheet.

## Product direction

Keep the current data model if it is already working.

The problem is **display**, not storage.

When displayed:
- do **not** show literal underscore characters
- instead show a **visual gap / missing zone**
- the gap should feel like missing content, not printed blanks

## Desired reveal behavior

When the answer is revealed:
- do **not** show a separate full phrase underneath as a second answer line
- instead fill the missing material **in place**
- strongly accent the inserted words

Example idea:
- before: `il        Marie`
- after: `il va chez Marie`

Where the inserted chunk:
- `va chez`

is visually accented inline.

## Placement

Preferred direction:
- use the same main phrase/answer zone where the app normally shows the answer
- the frame prompt should live in that same visual region
- after reveal, tapping should read the **full solved phrase**

Alternative fallback if needed:
- keep the phrase where it is now, but make it much bigger and more visually central

But the preferred solution is:
- prompt in the main answer zone
- reveal by inline insertion

## Important taste constraints

1. No visible underscore text
- data can still store underscores internally if useful
- they should not be rendered literally to the user

2. Do not over-reveal the structure
- avoid making the card look like “two explicit blanks”
- the learner should still have to think

3. Keep the overall card visually close to the normal app
- same flashcard feel
- not a separate mini product

4. Frame-card labeling should be much quieter
- if a frame-card label exists on the card face, make it subtle
- or remove it from the face and surface it elsewhere

## Concrete correction goals

Please adjust the French frame-card UI so that:

1. The prompt is shown as a clean phrase with a visual missing area
2. Literal underscores are not displayed
3. Reveal fills the answer inline
4. Inserted words are accented
5. The full solved phrase is what gets read on tap after reveal
6. The card feels like a real Les Verbes card, not a worksheet

## What not to do

- do not redesign the whole app
- do not redesign frame-card data generation
- do not invent a separate mode
- do not add lots of explanatory text onto the card

## Deliverables

1. French source UI fix for frame-card display
2. Brief explanation of:
- which files changed
- how the gap is now rendered
- how reveal behaves now
- how tap-to-hear behaves after reveal

