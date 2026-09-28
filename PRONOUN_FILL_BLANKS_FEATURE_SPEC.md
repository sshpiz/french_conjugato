# Pronoun Fill-Blanks Feature Spec

## Summary

Add a new French fill-blank subtype for practicing object-pronoun and adverbial-pronoun usage:

- `le` / `la` / `les` / `l'`
- `en`
- `y`
- `lui` / `leur`

This should live under the existing **Fill Blanks** concept, alongside the current verb-frame fill-blanks. It should not be introduced as a separate grammar mini-app.

Current fill-blanks mainly test whether the learner can recover a verb construction such as `repond a`, `parle de`, `sert de`, etc. Pronoun fill-blanks should test the next step: once a complement exists, what French pronoun replaces it, where does it go, and how does it interact with the verb?

## Product Goals

1. Practice high-frequency French pronoun usage in real verb contexts.
2. Reinforce verb argument structure without turning the app into a grammar worksheet.
3. Make `a` / `de` / direct-object distinctions more automatic.
4. Add contextual variety to mixed practice while keeping conjugation as the app's backbone.
5. Support both easier recognition-style cards and harder production-style cards.

## Non-Goals For MVP

- Do not include `dont` or `ou` in the first version.
- Do not attempt a complete French pronoun grammar course.
- Do not generate arbitrary grammar explanations.
- Do not prioritize rare or literary constructions.

`dont` and `ou` are useful later, but they are relative-pronoun / clause-building skills, not the same skill as clitic replacement.

Multi-clitic order is in scope for MVP, because contrasts like `Je te les donne` vs `Je les lui donne` are exactly the kind of compact, high-yield weirdness this feature should train. It must be constrained to conservative two-clitic rows with explicit targets and deterministic order validation.

## Feature Taxonomy

Existing terminology should be kept clear:

```text
Fill Blanks
- Verb Frames
  - Current feature.
  - Learner fills a sentence with a conjugated verb plus required construction surface.
  - Example: repond a, parle de, sert de.

- Pronoun Fill-Blanks
  - New feature.
  - Learner fills the French pronoun / pronoun+verb phrase that replaces a target complement.
  - Example: en parle, y pense, lui repond, la voit, te les donne, les lui donne.
```

Product-facing label recommendation:

```text
Pronouns
```

or:

```text
Object Pronouns
```

Internal label recommendation:

```text
pronoun_fill
```

or:

```text
pronoun_frame
```

## Core Card Idea

The learner sees:

- an English meaning
- a French prompt with a blank
- a French target complement, shown separately
- sometimes the infinitive
- sometimes the finite verb

The learner supplies the correct pronoun or pronoun+verb span.

Example:

```text
I am talking about it.

Je ___ parle.
ce probleme

Answer: en
Full answer: J'en parle.
Reason after reveal: parler de + thing -> en
```

The target complement should be shown as a compact secondary cue, not necessarily in parentheses. It is the thing/person/place being replaced.

## Prompt Styles

Support three prompt styles conceptually. MVP may implement only one or two.

### 1. Easy / Teaching Form

Show the original source phrase and the transformed blank.

```text
Je parle de ce probleme.
-> J'___ parle.

Answer: en
Full answer: J'en parle.
```

Purpose:

- best for first exposure
- makes the mapping explicit
- lower ambiguity

Risk:

- easier, because `de` / `a` / direct object may be visible in the source sentence

### 2. Standard Form

Show English meaning, French prompt, and target complement.

```text
I am talking about it.

Je ___ parle.
ce probleme

Answer: en
Full answer: J'en parle.
```

Purpose:

- best default for mixed practice
- hides the underlying `de` / `a` / direct-object surface
- tests whether the learner knows how the verb behaves

### 3. Hard / Production Form

Show infinitive, English meaning, and target complement. Hide the finite verb too.

```text
parler
I am talking about it.
ce probleme

Je ___.

Answer: en parle
Full answer: J'en parle.
```

or:

```text
parler
I am talking about it.
ce probleme

___

Answer: J'en parle.
```

Purpose:

- combines conjugation, pronoun choice, placement, and elision
- best for a dedicated drill

Risk:

- harder to grade
- may feel less like a quick fill-blank card if overused in general mixed mode

## Recommended MVP Behavior

Implement the **Standard Form** first.

MVP card display:

```text
[English meaning]

[French sentence with blank]
[target complement]
```

Reveal display:

```text
Correct: [answer span]
Full: [full solved sentence]
Pattern: [short reason]
```

Example:

```text
I am thinking about it.

J'___ pense.
ce projet

Correct: y
Full: J'y pense.
Pattern: penser a + thing -> y
```

The prompt may use elided subject forms like `J'___` when the expected answer is `en` or `y`. If that is difficult to generate consistently, prefer non-eliding subjects such as `il`, `elle`, `on`, `nous`, or `vous` in MVP rows.

## Pronoun Families

### Direct Object -> `le` / `la` / `les` / `l'`

Examples:

```text
I see it.

Je ___ vois.
la facture

Answer: la
Full: Je la vois.
Pattern: direct object, feminine singular -> la
```

```text
I see them.

Je ___ vois.
les messages

Answer: les
Full: Je les vois.
Pattern: direct object, plural -> les
```

Need target metadata:

- gender
- number
- elision requirement if using `l'`

### `de` + Thing / Idea -> `en`

Examples:

```text
I am talking about it.

J'___ parle.
ce probleme

Answer: en
Full: J'en parle.
Pattern: parler de + thing -> en
```

```text
I need it.

J'___ ai besoin.
ce dossier

Answer: en
Full: J'en ai besoin.
Pattern: avoir besoin de + thing -> en
```

Important exclusion:

- `de + person` usually should not become `en`.
- Example: `Je parle de Marie` -> `Je parle d'elle`, not `J'en parle` in ordinary learner-facing usage.

### `a` + Thing / Idea or Location -> `y`

Examples:

```text
I am thinking about it.

J'___ pense.
ce projet

Answer: y
Full: J'y pense.
Pattern: penser a + thing -> y
```

```text
I am going there.

J'___ vais.
au bureau

Answer: y
Full: J'y vais.
Pattern: location -> y
```

Important exclusion:

- `a + person` often should not become `y`.
- Example: `Je pense a Marie` -> `Je pense a elle`, not `J'y pense`.

### Indirect Object To Person -> `lui` / `leur`

Examples:

```text
I am talking to her.

Je ___ parle.
Marie

Answer: lui
Full: Je lui parle.
Pattern: parler a + person -> lui
```

```text
I am answering them.

Je ___ reponds.
les agents

Answer: leur
Full: Je leur reponds.
Pattern: repondre a + people -> leur
```

Important exclusion:

- Not every `a + person` can become `lui` / `leur`.
- Example: `penser a Marie` -> `penser a elle`, not `lui penser`.
- The generator/validator must distinguish true indirect-object clitic verbs from other `a + person` constructions.

### Multi-Clitic Order

Multi-clitic rows are part of MVP, but only in a narrow, conservative subset.

The main learner value is to practice the order contrast:

```text
me / te / nous / vous + le / la / les
```

versus:

```text
le / la / les + lui / leur
```

Examples:

```text
He is giving them to you.

Il ___ donne.
les documents -> toi

Answer: te les
Full: Il te les donne.
Pattern: to you + them -> te les
```

```text
I am giving it to her.

Je ___ donne.
le dossier -> Marie

Answer: le lui
Full: Je le lui donne.
Pattern: it + to her -> le lui
```

```text
I am sending them to him.

Je ___ envoie.
les photos -> Paul

Answer: les lui
Full: Je les lui envoie.
Pattern: them + to him -> les lui
```

Optional MVP family if validation is strong:

```text
lui / leur + en
```

Example:

```text
I am telling her about it.

Je ___ parle.
Marie -> ce probleme

Answer: lui en
Full: Je lui en parle.
Pattern: to her + about it -> lui en
```

MVP constraints:

- only two clitics per row
- only positive declarative main clauses
- present tense only
- no imperative
- no negation
- no reflexive multi-clitic rows
- no passe compose / agreement rows
- no three-clitic rows
- no doubtful `y` + `en` rows except fixed expressions if separately curated
- prefer common transfer/communication verbs with clear direct-object and indirect-object roles, such as `donner`, `envoyer`, `montrer`, `preter`, `apporter`, `rendre`, `dire`, `demander`
- every multi-clitic row must have two explicit source targets, each mapped to one clitic

Allowed MVP order signatures:

```text
me_le, me_la, me_les
te_le, te_la, te_les
nous_le, nous_la, nous_les
vous_le, vous_la, vous_les
le_lui, la_lui, les_lui
le_leur, la_leur, les_leur
lui_en
leur_en
```

The implementation should not infer arbitrary clitic clusters from a generic grammar table. It should generate or load only rows whose signature is explicitly allowed.

## Data Model

Suggested normalized row shape:

```js
{
  id: "pronoun_fill_parler_en_001",
  type: "pronoun_fill",
  language: "fr",
  verb: "parler",
  tense: "present",
  subject: "je",
  family: "de_thing_to_en",
  prompt_style: "standard",

  meaning_en: "I am talking about it.",
  prompt_fr: "J'___ parle.",
  target_fr: "ce probleme",

  answer: "en",
  full_answer: "J'en parle.",

  source_fr: "Je parle de ce probleme.",
  source_pattern: "parler de + thing",
  reason: "parler de + thing -> en",

  target_kind: "thing",
  target_gender: "masculine",
  target_number: "singular",
  pronoun: "en",
  clitics: ["en"],
  clitic_order_signature: "en",

  conjugated_form: "parle",
  answer_span_kind: "pronoun_only",

  category_id: "builtin-super-everyday",
  category_name: "Super Everyday",
  source: "generated_reviewed",
  needs_review: false
}
```

For hard cards, allow:

```js
answer: "en parle"
full_answer: "J'en parle."
answer_span_kind: "pronoun_plus_verb"
```

or:

```js
answer: "J'en parle."
answer_span_kind: "full_sentence"
```

For multi-clitic rows, include explicit target mappings:

```js
{
  id: "pronoun_fill_donner_le_lui_001",
  type: "pronoun_fill",
  language: "fr",
  verb: "donner",
  tense: "present",
  subject: "je",
  family: "direct_object_plus_indirect_person",
  prompt_style: "standard",

  meaning_en: "I am giving it to her.",
  prompt_fr: "Je ___ donne.",
  target_fr: "le dossier -> Marie",

  answer: "le lui",
  full_answer: "Je le lui donne.",

  source_fr: "Je donne le dossier a Marie.",
  source_pattern: "donner qqch a qqn",
  reason: "it + to her -> le lui",

  clitics: ["le", "lui"],
  clitic_order_signature: "le_lui",
  targets: [
    {
      role: "direct_object",
      fr: "le dossier",
      kind: "thing",
      gender: "masculine",
      number: "singular",
      pronoun: "le"
    },
    {
      role: "indirect_object_person",
      fr: "Marie",
      kind: "person",
      number: "singular",
      pronoun: "lui"
    }
  ],

  conjugated_form: "donne",
  answer_span_kind: "pronoun_cluster",

  category_id: "builtin-super-everyday",
  category_name: "Super Everyday",
  source: "generated_reviewed",
  needs_review: false
}
```

## Integration With Existing App

The app currently has:

- conjugation cards
- fill-blank / frame cards
- mixed mode

The new cards should be integrated as fill-blank cards.

Recommended exercise model:

```text
Exercise type:
- Conjugation
- Mixed
- Fill Blanks
```

Recommended fill-blank focus:

```text
Fill focus:
- All
- Verb Frames
- Pronouns
```

If the current UI has a "Fill Blanks filter" for prepositional verbs, extend or replace it with a clearer fill focus control.

## Mixing Rules

Do not add pronoun fill-blanks as a third equally weighted top-level family by default.

Recommended default mixed ratio:

```text
5 conjugation cards
2 verb-frame fill-blanks
1 pronoun fill-blank
```

For a dedicated pronoun drill:

```text
2 conjugation cards
4 pronoun fill-blanks
1 verb-frame fill-blank
```

Rationale:

- conjugation remains the backbone
- existing verb-frame fill-blanks remain important
- pronoun cards appear often enough to train the skill but not so often that they dominate ordinary practice

## Data Generation Strategy

Generate pronoun-fill rows from trusted frame and usage evidence, not from unconstrained freeform prompting.

Preferred sources:

- existing French verb-frame data
- reviewed `a` / `de` / direct-object datasets
- core pattern data
- curated usage examples

Generation steps:

1. Select a verb and a trusted source pattern.
2. Generate or derive a natural source sentence with an explicit complement.
3. Generate the pronominalized sentence.
4. Identify the answer span.
5. Store both source and transformed forms.
6. Run deterministic validators.
7. Optionally run an AI judge for semantic/naturalness checks.
8. Mark uncertain rows as `needs_review: true` and exclude them from play.

## Validation Rules

Minimum validators:

- `prompt_fr` contains exactly one blank marker.
- `answer` is non-empty.
- `full_answer` is natural French and contains the expected pronoun.
- `conjugated_form` matches the target verb and tense.
- `target_kind` agrees with the pronoun family.
- `de + person` is not mapped to `en`.
- `a + person` is not mapped to `y`.
- `penser a + person` and similar non-clitic patterns are excluded from `lui` / `leur`.
- `le` / `la` / `les` rows have explicit number/gender metadata.
- elision rows produce a grammatical full answer.
- source and full answer preserve the same core meaning.
- answer span occurs in or corresponds cleanly to `full_answer`.
- multi-clitic rows contain exactly two clitics in MVP.
- multi-clitic rows use an explicitly allowed `clitic_order_signature`.
- multi-clitic rows include two target mappings, and each target maps to exactly one clitic.
- direct-object + first/second-person indirect rows use `me/te/nous/vous + le/la/les`, e.g. `te les`.
- direct-object + third-person indirect rows use `le/la/les + lui/leur`, e.g. `les lui`.
- `lui/leur + en` rows are allowed only when the source meaning clearly supports both `a + person` and `de + thing`.
- reject any row where the source targets are ambiguous, duplicated, or only recoverable from English.

Conservative rejection is better than letting dubious cards through.

## Voice / TTS Behavior

For "Hear":

- play the full solved sentence, not only the pronoun.

For voice answer:

- accept the answer span where reasonable, e.g. `en`, `y`, `lui`
- accept multi-clitic answer spans where reasonable, e.g. `te les`, `les lui`, `lui en`
- also accept the full solved phrase/sentence, e.g. `j'en parle`

For hard production cards:

- prefer accepting the full answer, because the answer span may include elision and verb placement.

## UX Notes

The target complement should be visually secondary but clear.

Preferred display:

```text
I am talking about it.

J'___ parle.

[ce probleme]
```

Avoid making the target look like literal text inserted into the French sentence if that creates ungrammatical visuals.

After reveal, show:

```text
Correct: en
J'en parle.
parler de + thing -> en
```

Keep the explanation short. This app should feel like practice, not a lesson page.

## MVP Scope

Recommended MVP:

- French only
- present tense only
- standard prompt style
- answer span mostly pronoun-only, with conservative two-pronoun clusters included
- families:
  - direct object -> `le` / `la` / `les` / `l'`
  - `de + thing` -> `en`
  - `a + thing/place` -> `y`
  - indirect object person -> `lui` / `leur`
  - direct object + indirect object clusters:
    - `me/te/nous/vous + le/la/les`
    - `le/la/les + lui/leur`
  - optional if validated strongly:
    - `lui/leur + en`
- no `dont`
- no `ou`
- reviewed/generated rows only

Suggested initial size:

- 150-300 high-quality single-pronoun cards
- 50-120 high-quality multi-clitic cards
- prioritize common verbs and existing trusted frame verbs
- prioritize contrast pairs that make the ordering feel concrete, especially `te les` vs `les lui`

## Later Enhancements

Phase 2:

- hard prompt style with infinitive-only production
- partitive / quantity `en`
- expanded multi-clitic coverage beyond the MVP whitelist
- `y` inside multi-clitic rows, only after separate curation
- negative forms:
  - `Je n'en parle pas`
- passe compose placement:
  - `Je l'ai vu`

Phase 3:

- `dont` relative-pronoun cards
- `ou` relative/location cards
- relative clause transformation drills

## Acceptance Criteria

Feature is ready when:

1. Pronoun fill-blank rows can be loaded without breaking existing frame cards.
2. Settings can include/exclude pronoun fill-blanks separately from verb-frame fill-blanks.
3. Mixed mode can include pronoun fill-blanks at a controlled ratio.
4. Each card shows English meaning, French prompt, and target complement.
5. Reveal shows answer, full solved sentence, and a short pattern reason.
6. Elision cases display a grammatical full answer.
7. `en`, `y`, `lui`, and `leur` rows pass conservative person/thing/location validation.
8. Multi-clitic rows are included, but only with allowed two-clitic order signatures and explicit two-target mappings.
9. Bad or uncertain generated rows are excluded via `needs_review`.
10. Voice/TTS uses the full solved sentence.
11. Existing conjugation and verb-frame fill-blank behavior remains unchanged.
