# Italian Version Kickoff Prompt

Please kick off an **Italian version** of this verb-drilling app family.

This is an implementation/research kickoff, not just brainstorming.

## Goal

Create the best possible starting point for an Italian app in the style of the existing language apps, while being thoughtful about:

- what is actually worth drilling in Italian
- what can be reused from the existing architecture
- what data shape Italian needs
- where Italian is similar to French/Spanish/Portuguese and where it is different

## High-level objective

I do **not** want a lazy copy of French with labels swapped.

I want a serious kickoff that answers:

1. What should the Italian app drill first?
2. What data do we need?
3. What tenses/moods matter early?
4. What irregulars or patterns are especially important?
5. What should the first real Italian app scaffold look like in this codebase?

## Deliverables

Please produce:

1. A short implementation proposal in English
2. A concrete repo/file plan for an Italian app
3. A recommended initial Italian data shape
4. A proposed first-pass tense/drill scope
5. If practical, a source-level scaffold or starter implementation for the Italian app

## Things to think through carefully

### 1. Product fit

Assess how well the current app model fits Italian:

- how big a barrier is verb conjugation in Italian?
- how useful is this style of drilling?
- from what level to what level is it especially helpful?

### 2. Early learner scope

Recommend the best v1 scope for Italian:

- which tenses/moods should be in first?
- which should stay out initially?
- what are the high-value early drills?

Please think in practical learner terms, not “include every paradigm because it exists.”

### 3. Italian-specific challenges

Identify what matters most in Italian verb learning, for example:

- present tense irregulars
- passato prossimo / auxiliary choice
- imperfetto
- future / conditional
- subjunctive timing and value
- reflexives / pronominals
- modal constructions

Be concrete about what is high-priority for drilling versus what is lower priority.

### 4. Data shape

Propose the right data shape for Italian verbs in this app family.

I want a practical recommendation for fields like:

- infinitive
- translation
- frequency band
- conjugations
- irregularity metadata
- auxiliary
- reflexive/pronominal data
- notes/hints
- usage/core patterns if needed

Also say whether Italian likely needs:

- usage examples
- core patterns
- frame cards later

### 5. Architecture / reuse

Please inspect the existing codebase and say:

- what can be reused directly from French/Spanish/Portuguese
- what should be copied as a starting point
- what must be customized for Italian

### 6. Concrete kickoff recommendation

I want a practical recommendation for the best first milestone.

Examples:

- create a new sibling repo structure
- scaffold build files and app shell
- start with top 100 / top 500 verbs
- generate present + passato prossimo + imperfetto first

Please recommend the best order of work, not just the end state.

## Preferred output structure

Please respond with:

### A. Recommendation
- short direct summary of how to kick off Italian

### B. Italian drill scope
- what to include first
- what to defer

### C. Data shape
- proposed JSON / JS structure

### D. Codebase plan
- which files/repo patterns to copy or adapt

### E. First milestone
- the most sensible first implementation step

## Important constraints

- source files only
- do not touch `dist` / `dist-gh` / generated build outputs unless explicitly asked
- do not push or deploy unless explicitly asked
- respond in English

## If you decide to write code

Only do so if it clearly helps the kickoff.

If you create scaffolding, keep it clean and minimal:

- no fake polished app unless useful
- no giant generated datasets yet
- no push/deploy

## Quality bar

I want this to feel like the beginning of a serious Italian app, not “French app but with Italian words.”
