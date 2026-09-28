# French Frame Cards Generation Prompt

Please implement a **French-only frame-card data generation pipeline** for Les Verbes.

Important:
- source files only
- do not touch `dist/`, `dist-gh/`, or generated build outputs unless explicitly asked
- do not push or deploy unless explicitly asked
- respond in English

Context:
- repo: `/Users/simeon/Desktop/proj1`
- this is for a **new card type** called **frame cards**
- treat frame cards like another card family/filter, not a separate app mode

## Product concept

Frame cards practice **verb behavior** while keeping the surrounding vocabulary visible.

Examples:
- question: `je ____ ____ Paul`
- answer chunk: `parle à`
- full answer: `je parle à Paul`

Another:
- question: `il ____ Paul`
- answer chunk: `connaît`
- full answer: `il connaît Paul`

This is for drilling:
- whether the verb needs a preposition
- whether it needs nothing
- later, in other languages, similar behavior like particles or reflexive markers

## Scope for this task

This task is about **data generation only**, not full UI integration.

French only.

Generate frame-card data for:
- top 500 verbs
- present tense only
- 1 to 3 frame cards per verb

Important product decision:
- **every top 500 verb should have at least one frame card**
- even when the important fact is that **no preposition is needed**

## Output artifact

Create a separate generated data artifact, for example:
- `verb_frames.generated.json`

You may also add a small source-side generation script, for example:
- `generate_french_frame_cards.py`

If you need a review artifact, also generate something like:
- `verb_frames_review.md`

Do **not** merge the data into the main app behavior yet unless needed for local validation.

## Desired data shape

Prefer a simple question/answer structure.

Example record:

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

Another:

```json
{
  "verb": "connaître",
  "type": "frame",
  "tense": "present",
  "question": "il ____ Paul",
  "answer": "connaît",
  "full_answer": "il connaît Paul"
}
```

Notes:
- the UI may later render the gap visually without literal underscores, but storing underscores is acceptable
- `full_answer` is useful for validation/debugging and should be included
- if you think one or two extra fields help validation, that is fine, but keep the format compact

## Card-generation principles

The generation logic must follow these rules:

1. Keep surrounding vocabulary visible
- we are testing the verb behavior, not random noun vocabulary recall

2. Use very simple, common surrounding words
- names like `Paul`, `Marie`
- common pronouns like `je`, `il`, `elle`, `nous`
- simple nouns only

3. Avoid weird or literary contexts
- contexts should feel ordinary and learner-friendly

4. Prefer the most central, modern frame first
- if a verb has many constructions, lead with the most common/useful one

5. If no linker/preposition is needed, still generate a frame card
- this is important
- users should also learn when the answer is just the conjugated verb

6. Do not explode pronoun coverage in v1
- do not generate all pronouns for every verb
- choose 1 to 3 natural contexts per verb

7. Present tense only
- keep tense out of scope for now

## Recommended generation approach

Please use a **hybrid pipeline**, not purely manual and not purely blind procedural generation.

Recommended shape:

1. Start from the French top 500 verbs already present in source data
2. Gather available context for each verb:
- translation
- hint
- usages
- core patterns
- reflexive status if relevant
3. Generate candidate frame cards with LLM help or other smart generation
4. Validate the generated cards mechanically
5. Write the final artifact
6. Produce a review report for suspicious entries

## Mechanical validation requirements

Please add validation logic for at least these checks:

1. Every top 500 verb has at least one frame card
2. Each card has:
- `verb`
- `question`
- `answer`
- `full_answer`
3. The `answer` fits into the gap structure of `question`
4. `full_answer` is consistent with `question + answer`
5. The verb in `full_answer` belongs to the intended lemma
6. No absurdly long or literary contexts
7. No duplicate useless cards for the same verb
8. No empty or malformed answer chunks

If needed, add a `needs_review` flag or equivalent for suspect entries.

## Preferred prompting behavior if using LLM generation

If you use OpenAI or other LLM help, constrain it tightly:
- short learner-facing contexts
- common modern usage
- no essay output
- no obscure nouns
- no unnecessary variation
- if the verb normally takes no preposition, that is acceptable and should still become a card

Please keep the output deterministic enough that the dataset feels coherent, not wildly stylistically varied.

## Examples of good card ideas

These are examples of the kind of thing we want:

- `je ____ ____ Paul` -> `parle à`
- `il ____ Paul` -> `connaît`
- `nous ____ ____ Marie` -> `pensons à`
- `elle ____ ____ ses enfants` -> `s'occupe de`

These are examples only; do not assume these are the final set.

## Out of scope

Do not build yet:
- full UI integration
- non-French languages
- all tenses
- all pronouns
- cross-language abstraction
- sharing behavior

## Deliverables

1. A source-side generation pipeline for French frame cards
2. A generated artifact containing frame-card records for the top 500 verbs
3. Validation/reporting for suspect entries
4. A short explanation of:
- what files were added/changed
- how the generation works
- how many verbs/cards were produced
- what review risks remain

## Strong product constraints to preserve

- This is **another card type**, not a separate mode
- Treat it like a filterable family similar to reflexive selection for now
- Every top 500 verb should participate
- We are drilling verb behavior, not noun recall
- Keeping surrounding words visible is intentional
