# Verb Practice App — Product Summary For Another AI

## What This App Is

This is a family of language-learning web apps centered on **high-volume verb practice**.

The core idea is not just:
- “learn a list of verbs”

It is:
- automate conjugation
- improve pronunciation
- improve recognition of spoken inflected forms
- make verb practice less sterile by grounding verbs in usage, topics, and sentence patterns

The apps are language-specific, but they share one product philosophy and a lot of common UX.

## Primary Goals

The app is optimized for four big learning outcomes:

1. **Conjugation automaticity**
- the learner should stop having to consciously compute common forms
- conjugated forms should come faster and feel more automatic

2. **Pronunciation**
- the learner should say forms out loud often
- this matters both for accuracy and fluency

3. **Passive spoken recognition**
- if a learner repeatedly hears full conjugated forms, they get better at recognizing them in real speech

4. **Verb knowledge in context**
- not just “dictionary meaning”
- but how verbs behave in phrases, constructions, and recurring usage patterns

Vocabulary expansion matters too, but it is secondary to the morphology + pronunciation + recognition loop.

## Product Character

This is not meant to feel like:
- a school worksheet
- a grammar table viewer
- a dead quiz app

It is meant to feel:
- fast
- repetitive in a good way
- voice-friendly
- slightly game-like
- rich enough to avoid boredom

That is why topics, usage examples, fill-in-the-blank cards, TTS, mic support, and saved drills all matter.

## Core Card Types

## 1. Conjugation Cards

This is the main exercise.

Typical prompt structure:
- infinitive
- translation
- tense
- pronoun

The learner must produce the correct conjugated form.

Why this exists:
- it is the highest-yield way to automate morphology
- it scales well to many verbs and many tenses
- it works well with TTS and speaking
- it is easy to repeat at high volume

This is the spine of the app.

## 2. Fill-in-the-Blank / Usage Cards

This is the contextual exercise.

The learner sees a sentence with one or more missing pieces and must recover the appropriate form or phrase.

These cards are meant to test things like:
- usage patterns
- constructions
- required prepositions / particles
- separable prefixes
- verb behavior inside a real sentence

Why this exists:
- conjugation alone can become sterile
- some verbs are really learned through their constructions
- this gives learners “change of tempo”
- it reinforces context, not just isolated form recall

Important product principle:
- a good fill-blanks card should test a **construction**
- not just hide an obvious finite form while already revealing the rest of the answer

Weak example:
- a modal card where the infinitive at the top already gives away the exact answer and nothing interesting is being tested

Strong example:
- a card that makes the learner recover the right structure, particle, or phrase pattern

## 3. Mixed Mode

Where supported, the app can mix:
- mostly conjugation cards
- occasional fill-blanks cards

The intended ratio is roughly:
- 5 conjugation
- 2 fill-blanks

Why this exists:
- learners keep the conjugation core
- but the rhythm changes
- usage stays alive
- the app feels less monotonous

The product idea is:
- conjugation remains the backbone
- fill-blanks add context and freshness

## Topics

Topics are important to the product identity.

They are not just filters.

They are meant to:
- make practice less generic
- give each language more personality
- bring in slang, modern life, bureaucracy, travel, nightlife, music, tech, and other real domains
- make it easier for learners to practice by “world” rather than only by raw frequency

Examples of shared topic shells:
- Super Everyday
- Sports & Fitness
- Cooking & Food
- Outdoors & Nature
- Woodworking
- Art & Design
- Nightlife & Partying
- Music
- History & Culture
- Politics & Current Events
- Cinema & Series
- Relationship Drama
- Office & Admin
- Bureaucracy & Delivery
- Tech & Digital Work
- Travel & Tourism
- Driving & Road Code
- Crafts & Making
- Education & Learning

The product philosophy is:
- topics should be thematic and fun
- not dumb clones of drill presets
- not tiny degenerate pools
- not just grammar buckets pretending to be categories

## Verb Source Philosophy

The app now treats verb source more explicitly:

- `By Topic`
- `By Frequency`

### By Topic

Used when the learner wants:
- a thematic pool
- more personality
- a mix like `Super Everyday + Music`

### By Frequency

Used when the learner wants:
- Top N style practice
- more classic “core verbs first” drilling
- control over common vs rare weighting

Important product reasoning:
- topic mode and frequency mode are different mental models
- they should not be muddled together

## Drills

A drill is a preset practice configuration.

It can define things like:
- tense selection
- verb source
- card behavior

Examples:
- Most Crucial
- Master Present
- Passé composé / equivalent tense drills in other languages

Important concept:
- once a preset is edited, it becomes **Custom**

This matters because the learner can:
- start from a drill
- customize it
- save it
- share it

## Why Saved Drills Matter

Saved drills let the learner keep recurring setups like:
- “present tense top 100”
- “subjunctive only”
- “music + nightlife”
- “irregulars in future tense”

This helps the app feel like a real tool, not just a fixed deck.

## Usage Examples

Many verbs carry usage examples.

These matter because they:
- add semantic clarity
- support topic identity
- make the app feel less like bare morphology
- help when a verb is rare, technical, slangy, or domain-specific

The current quality rule being pushed is:
- if a verb appears in a built-in topic, it should have at least one usage

That is now being enforced across the stronger topic languages.

## Audio / TTS / Voice

Audio is a major part of the product, not decoration.

There are several layers:

### 1. Native browser/system TTS

If a good native voice exists, the app can use it.

### 2. Packaged/offline TTS

For some languages, packaged audio is available or being refreshed so the app can:
- behave more reliably
- work better offline
- avoid depending only on system voices

### 3. Hear

The learner can hear the answer or phrase.

### 4. Say / Answer by voice

The learner can answer with the mic instead of only mentally or by typing.

This is important because the app is deliberately trying to train:
- production
- not just passive recognition

## Mic / Dictation Product Logic

Voice mode is meant to feel helpful, not punishing.

Key ideas:
- use the mic before reveal
- diagnose likely failure cases when useful
- avoid accepting nonsense
- avoid overfuzzy “AI magic” matching

For conjugation cards:
- the important thing is the correct conjugated form
- in some languages, the pronoun matters too

For fill-blanks cards:
- the important thing is the relevant phrase answer span or solved phrase

There is active product work around:
- infinitive-vs-conjugation mic mistakes
- compact answer spans for fill-blanks
- more graceful voice acceptance in phrase cards

## UX Of The Main Screen

The flashcard screen is designed to be dense but readable.

Typical visible elements:

### Top area
- progress indicator
- frequency badge, and sometimes topic badge

### Main prompt area
- infinitive or card prompt
- translation
- tense badge
- pronoun / phrase prompt

### Bottom actions
- Usage
- Say
- Hear
- Next

### Bottom nav
- Back
- Search / Explorer
- Skip
- Settings

The intended feeling is:
- one-handed
- quick
- consistent
- repeatable

## Settings UX

The newer settings flow is trying to make the app easier to understand without removing power.

Main principles:

### 1. Separate exercise setup from app/system stuff

That means:
- Conjugation settings
- Fill Blanks settings where supported
- Text To Speech
- App

### 2. Keep important behavior controls near the top

Especially:
- Answer by voice
- practice balance options
- tutorial visibility

### 3. Make topic mode and frequency mode explicit

Instead of burying topics as one more obscure filter.

### 4. Hide irrelevant complexity

For example:
- no fake Fill Blanks UI in languages that do not have the data
- no frequency-only advanced controls when topic mode is active

### 5. Keep saved drill actions compact

Save / share / reset are useful, but should not interrupt the main setup flow.

## Explorer / Search

There is a verb explorer / search flow for:
- finding specific verbs
- browsing
- looking at conjugations and usages

This matters because the app is not only a random-card engine.
It is also a reference/practice hybrid.

## Capability Differences By Language

Not every language is at exactly the same state.

The important product model is:

- every language should at least support strong conjugation practice
- topics can exist even if fill-blanks do not
- fill-blanks should only be shown where real data exists

Current rough state:

### French
- strongest canonical product baseline
- conjugation
- topics
- fill-blanks
- mixed mode

### German
- conjugation
- topics
- fill-blanks
- mixed mode
- still needs ongoing fill-blanks data curation quality work

### Spanish
- strong conjugation + topics
- no real fill-blanks capability currently

### Portuguese
- intended to be strong conjugation + topics
- no real fill-blanks capability currently

### Italian
- conjugation + topics
- no real fill-blanks capability currently

Other languages vary, but the product direction is the same:
- capability-driven UI
- not fake parity

## What Makes A Good New Feature Here

A feature fits this app well if it improves one or more of:

- conjugation automaticity
- pronunciation
- spoken recognition
- contextual verb behavior
- personalization without chaos
- learner motivation through variety

Good examples:
- better contextual fill-blanks
- stronger topic curation
- better mic diagnostics
- reliable TTS/offline audio
- subtle progress memory

Less good features are ones that:
- add complexity without improving practice quality
- make settings harder to understand
- overfit to novelty instead of repetition

## Current Product Risks / Rough Edges

The biggest real risks right now are:

1. parity drift across languages
- same feature name, different real behavior

2. weak fill-blanks data quality in some decks
- especially cards that do not meaningfully test a construction

3. stale service worker / installed-app state
- sometimes updates appear broken because old shell state lingers

4. TTS asset lag
- verb/topic/frame growth can outrun packaged audio generation

5. topic quality drift
- if topics become too tiny, too weird, or underexplained, they stop being fun

## The Product’s Best Version Of Itself

The best version of this app is:

- fast enough for daily repetition
- serious enough to improve morphology
- voice-forward enough to improve pronunciation
- contextual enough to feel alive
- themed enough to feel memorable
- configurable without becoming confusing

That is the product standard new features should be judged against.
