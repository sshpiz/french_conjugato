Please produce a product-and-data architecture proposal for adding **German first** and **Dutch second** to the Les Verbes app family.

Important:
- research/proposal only
- no source edits unless explicitly needed for notes
- do not touch `dist/`, `dist-gh/`, or generated files
- do not push or deploy unless explicitly asked
- respond in English

Context:
- Main current app reference: `/Users/simeon/Desktop/proj1`
- Sibling language apps exist for French, Spanish, Portuguese, Greek, Russian, Ukrainian, Latvian, Catalan
- This request is **not** “just port the current French app blindly”
- The goal is to think through what a **correct** German app should look like, and secondarily Dutch, using the current app family as a base but not as a prison

## What you are being asked to do

Design the most correct direction for:
1. a German verb-drilling app in the style of this family
2. a Dutch verb-drilling app, to compare and contrast

The output should explain:
- how the app should be **ported**
- where German/Dutch should **diverge** from French-style assumptions
- what data shape is needed
- what should be drilled
- what the card UI should emphasize
- what verb details should emphasize

This should be a serious proposal, not a superficial “same app but with German verbs”.

## Core product question

What would a **really good app for drilling early-to-intermediate German verb grammar** look like?

And then:
- which parts transfer to Dutch?
- which parts should stay language-specific?

## Key themes to analyze

Please think carefully about these:

### 1. What is actually important to drill?
For each language, identify:
- the most important A1-B1 verb-related skills
- the most common learner mistakes
- which of those mistakes are well suited to flashcard drilling
- which are better handled by verb details/reference/context

For German especially, consider:
- present-tense conjugation patterns
- separable vs inseparable prefixes
- stem-vowel changes
- auxiliaries in perfect (`haben` / `sein`)
- participles
- case government
- preposition government
- modal verbs
- imperative
- subjunctive/conditional decisions only if relevant to early-to-mid learners

For Dutch especially, consider:
- present/past/perfect essentials
- strong vs weak verbs
- separable verbs
- auxiliary choice
- participle formation
- spelling/stem alternations

### 2. What should be on the flashcards?
Evaluate whether the current card shape is right:
- infinitive
- pronoun pill
- tense pill
- answer reveal

For each language, recommend:
- whether the card should still be “pronoun + finite verb”
- whether pronoun is always needed
- whether some cards should encode stronger structure
- whether some verb families need special visual handling
- whether separable prefixes or auxiliary-driven perfects change the best card design

Consider specifically:
- should German cards remain simple finite-form cards at first?
- should perfect forms be drilled as full multi-part answers?
- should Dutch/German cards ever include governed complements?
- what would break if we keep the current card model too literally?

### 3. What should the verb details page show?
This is a major focus.

Propose what verb details should include in German and Dutch.

For German, evaluate whether details should show:
- weak / strong / mixed
- separable / inseparable
- auxiliary (`haben` / `sein`)
- participle
- stem-vowel changes
- imperative forms
- core patterns like:
  - `warten auf + Akk`
  - `helfen + Dat`
  - `denken an + Akk`
- case government
- preposition government

For Dutch, evaluate similar needs:
- strong / weak / irregular
- separable verbs
- auxiliary
- participle
- stem/spelling changes
- useful governed/prepositional patterns

Be concrete about:
- which blocks should be visible at the top
- what belongs in a compact grammar/meta section
- what belongs in usage/core-patterns
- what belongs in the conjugation table

### 4. Data shape proposal
This is one of the key deliverables.

Propose the ideal data shape for:
- verb list entries
- conjugation data
- metadata for verb details
- governed patterns
- usage examples
- drill-relevant classification

Do not just say “add more metadata”.
Provide a concrete proposed schema shape or pseudo-schema.

At minimum, propose fields for:
- infinitive
- translation(s)
- regularity / verb class
- separability
- auxiliary
- participle
- stem-change metadata
- transitivity / governance metadata if appropriate
- preposition/case patterns if appropriate
- frequency / level

Say explicitly which fields are:
- necessary for cards
- necessary for verb details
- necessary for search/filter/drills

### 5. Drill focus proposal
Recommend what the most important drill axes should be.

For German and Dutch, evaluate which drill filters/modes are actually useful:
- tense
- top-N
- regular vs irregular
- separable verbs
- auxiliary choice
- stem-vowel change verbs
- modal verbs
- governed-preposition verbs
- perfect formation

Identify which drill types would be especially valuable in A1-B1.

### 6. Card-design consequences
Be explicit about UI consequences.

For each language, propose:
- what the pronoun pill should do
- whether any extra pill or badge is needed
- whether the answer line needs richer structure
- whether there are categories of cards that should look slightly different

Example areas to think about:
- German separable verbs
- perfect forms with auxiliaries + participles
- Dutch separable/perfect forms

This section should focus on design consequences, not just grammar theory.

### 7. Verb-details design consequences
Also be explicit here.

Propose:
- the top-level information architecture of the details page
- section ordering
- what should be above the fold
- what should be lightweight vs expandable

### 8. Porting strategy from the current app family
Recommend the safest path from current app architecture to German/Dutch support.

Address:
- which existing app assumptions can stay
- which assumptions need to be broken
- whether German and Dutch should share one new base shape or be handled separately
- whether Dutch is the easier first port and why
- what should be done in v1 vs later

## Important constraints

- This is not a request for code yet
- Do not produce a vague essay
- The outcome must help us make product and data-model decisions
- You may refer to current French-style behavior only to compare or critique it

## Deliverable format

Please provide:

1. **Executive recommendation**
- one concise recommendation for German
- one concise recommendation for Dutch

2. **Most important A1-B1 drill targets**
- by language

3. **Proposed data shape**
- concrete schema/pseudo-schema

4. **Drill focus proposal**
- what to drill and how

5. **Card design consequences**
- concrete UI consequences

6. **Verb details design consequences**
- concrete UI/content consequences

7. **Porting strategy**
- safest product/engineering path from the current app family

8. **Risks / open questions**
- things we need to decide before building

## Tone

Be opinionated and practical.
We want the best direction, not the easiest copy-paste port.
