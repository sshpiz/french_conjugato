# Verb App Reference

This document describes the current app family as a product, not as code. It is meant to be useful for:

- consulting AI models about ideas or changes
- onboarding collaborators
- keeping a stable reference for what the app is trying to do

The shared model applies to the French, Greek, and Portuguese apps. The languages differ in data, tense sets, drill labels, and some language-specific behavior, but the core interaction model is intentionally the same.

## What the app is

This is a verb-focused language practice app for adults. It is designed around the idea that verbs are one of the fastest ways to make a language feel usable. The app is not trying to be a broad vocabulary game or a full grammar course. It is a focused practice tool for drilling conjugation, hearing forms, speaking them aloud, and seeing the most useful usage patterns in context.

The intended audience is:

- adult learners
- expats
- heritage learners maintaining a language
- people who care about fluency and retention more than gamified streaks

The app is optimized for repeated practice in short sessions. It works like a specialized training instrument, not like a lesson platform.

## Core product idea

The central claim of the app is:

- practice verbs early
- practice them repeatedly
- practice them in actual sentence context
- practice them with both recognition and production

The app tries to reduce one of the main points of friction in speaking: getting stuck on conjugation, pronoun agreement, tense choice, or simply not being able to hear a form cleanly as a word.

The app does this by combining:

- a fast flashcard loop
- spoken audio
- optional speech input
- usage examples
- searchable verb detail views
- configurable drills

## Main flashcard experience

The primary screen is a single-card practice view.

Each card typically shows:

- the verb infinitive
- a translation or gloss
- a pronoun/person marker
- a tense marker
- after reveal, the full conjugated answer
- optionally, a usage area with short example lines or usage nuggets

The core loop is intentionally simple:

1. You see a verb, a pronoun, and a tense.
2. You try to produce the correct form mentally or aloud.
3. You reveal the answer.
4. You move to the next card.

The app is designed so that almost the entire screen supports this flow. It is meant to feel fast and low-friction.

### Before reveal

Before the answer is shown, the user is expected to do one of three things:

- mentally conjugate the form
- say it aloud
- tap to hear the infinitive or prompt again

Depending on settings and tutorial phase, the mic may be either:

- unavailable
- set to pronunciation practice after reveal
- set to answer-by-voice before reveal

### After reveal

After reveal, the card shows the answer clearly. At that stage the user can:

- compare their answer to the correct form
- hear the answer spoken
- use the mic to practice pronouncing the answer
- view usage examples if enabled
- move to the next card

The after-reveal state is meant to teach by immediate comparison, not by explanation-heavy feedback.

## Bottom-row controls on the flashcard

The flashcard has a compact control dock plus a bottom navigation row.

The important controls are:

- `Show / Next`: a single button that reveals the answer before reveal and advances to the next card after reveal
- `Hear`: plays the current target, usually the infinitive before reveal and the answer after reveal
- `Say`: microphone-based interaction, either answer-by-voice or pronunciation practice depending on mode
- `Usage`: toggles whether the usage area is shown

The lower navigation row includes:

- `Back`
- `Search`
- `Skip`
- `Settings`
- `Help`

The help button now restarts the tutorial flow rather than opening a long static help page.

## Tutorial / onboarding

The app has a lightweight tutorial that teaches the interaction model by using actual cards, not by showing a separate manual.

Characteristics of the tutorial:

- it is contextual
- it sits on the card rather than taking over the whole interface
- it teaches reveal, next, hear, mic, settings, and verb details gradually
- it can be restarted later from the help button

During the early tutorial phase:

- hear is available
- mic is intentionally limited at first
- usage is intentionally limited at first

The goal is to make the first few cards understandable without turning the experience into a modal onboarding flow.

## Usage nuggets

One of the app’s more distinctive features is the usage area that appears with a card.

This area is not just a translation. It is meant to show how the verb behaves in real language. Depending on the language data, it may contain:

- short usage labels
- example sentences
- translations or glosses
- multiple usage patterns for the same verb

The usage area is useful because it gives the learner more than isolated conjugation. It shows how the verb actually lives in phrases and sentences.

The app also allows the user to hide or show usage while drilling. This matters because some users want context and some users want a more stripped-down repetition loop.

## Audio capabilities

The app supports both output audio and, where available, speech input.

### Text to speech / audio playback

The app can use:

- native device/browser TTS when a good language-specific voice exists
- packaged pre-generated audio when native TTS is unavailable, weak, or inconsistent

The user can:

- use native audio
- prefer packaged audio
- download packaged audio in chunks
- remove downloaded audio
- change TTS speed

In some builds, the app also tries to prefetch likely-needed packaged audio so the experience stays smooth.

### Microphone / speech input

The app has two mic modes:

- answer-by-voice before reveal
- pronunciation practice after reveal

This distinction is important. The app is not treating the mic as a generic gimmick. It has two different learning roles:

- test recall
- practice pronunciation

Not all devices support speech input reliably in the browser, especially mobile Safari / iPhone web contexts. The app tries to handle this gracefully and guide users toward audio fallbacks when needed.

## Search and verb details

The app includes a searchable verb explorer and a verb detail view.

The explorer lets the user:

- search for verbs directly
- open a specific verb quickly

The detail view is meant to be a compact reference card for a verb. It usually includes:

- the infinitive
- a translation
- conjugation tables across tenses
- usage examples
- playable text/audio hooks

The detail view is not the main learning loop, but it is important because it lets users confirm patterns, inspect verbs more deeply, and connect flashcard practice with a fuller mental model.

## Settings model

The app has moved from an older preset/weight model toward a more structured drill-based settings system.

The current top-level settings are roughly:

- `Mic to Answer`
- `Tenses`
- `Top N`
- `Drills`
- `Advanced`
- `Audio`
- `App`

### Mic to Answer

This setting controls whether the mic is used:

- before reveal as an answer mechanism
- or after reveal as pronunciation practice

### Tenses

This section lets the user choose which tenses are in play.

The actual tense list depends on the language, but the idea is always the same:

- the learner can narrow or expand the tense set
- tense selection strongly shapes difficulty

### Top N

This is a simpler verb-pool control.

Instead of only exposing raw frequency weights, the app gives an easier high-level choice such as:

- Top 20
- Top 50
- Top 100
- Top 500
- Top 1000

This is a major pedagogical lever. It lets learners keep the deck tight and useful instead of drowning in low-value verbs too early.

### Drills

Drills are named practice configurations. A drill is basically:

- a settings bundle
- a title
- a description
- optionally a seed or shared identity

Built-in drills are meant to cover common needs such as:

- most crucial verbs
- present-tense mastery
- irregulars
- a specific tense family
- broader exploration

The user can also:

- save the current drill
- share the current drill
- import a drill from a link

The system is designed so that drills are useful but not rigid. The user can start with a drill and then edit it freely.

### Custom drill behavior

One of the important UX rules is:

- if the user changes a drill’s settings manually, the app should promote that state to `Custom`

This matters because it preserves a sense of control and truthfulness. The UI should not pretend the user is still on a stock drill if they have already changed it.

### Advanced

Advanced is where the more technical or fine-grained practice controls live.

Depending on language, this may include:

- favor common verbs
- include rare verbs
- detailed frequency weights
- pronoun balancing
- reflexive filtering
- regular vs irregular filtering
- ending / conjugation group filtering
- drill actions like save/share

The goal of Advanced is not to overwhelm most users, but to give serious learners or power users real control when they want it.

### Audio

The Audio section includes:

- TTS voice selection where relevant
- TTS speed
- packaged audio preference
- packaged audio download controls
- audio status messaging

This is especially important because browser/device audio quality varies a lot by language and platform.

### App

The App section contains:

- update check
- version information
- theme choice
- text size
- debug / about items where still present

The update system is meant to help users refresh the PWA without having to delete and reinstall it every time.

## Technical/product capabilities that matter to users

The most important user-facing capabilities are:

- fast conjugation drills
- hide/show usage
- hear the prompt or answer
- answer by voice or practice pronunciation
- searchable verbs
- full verb detail view
- configurable verb pools by frequency
- configurable tense sets
- named drills
- saved/shared drills
- packaged audio for weak-native-TTS situations
- offline-friendly PWA behavior

## Design intent

The app is trying to balance two competing values:

- speed and simplicity
- depth and control

The flashcard view should feel almost frictionless.
The settings should allow serious customization without turning the whole product into a parameter jungle.

The app is intentionally not pretending to be a universal beginner course. It is closer to:

- a training cockpit for verb fluency
- a serious drill tool
- a compact reference + practice hybrid

## What makes the app distinctive

Compared with generic language apps, the more distinctive choices are:

- verbs-first pedagogy
- configurable drills rather than one fixed progression
- strong emphasis on audio and speaking
- usage nuggets instead of only bare translations
- a searchable full-verb detail layer behind the practice layer
- support for adults who want to optimize practice rather than just be entertained

## Three critiques

### Hat 1: Designer

What works:

- The core loop is unusually direct. The app gets to the point fast.
- The flashcard interface has a clear center of gravity: verb, pronoun, tense, answer.
- The control dock is compact and now has a more coherent logic than before.
- The shift from raw weights to drills plus `Top N` is a major usability improvement.
- The product has a recognizable identity. It does not feel like a generic Duolingo clone.

What feels weak or risky:

- The settings are still dense. Even after improvement, there is a lot happening for a mobile interface.
- The app has strong internal logic, but some of that logic is not always visually obvious.
- The product has pockets of polish and pockets of “engineering-first UI.” The experience is good, but not always visually unified.
- Some concepts are conceptually elegant for builders but still slightly abstract for users, especially `Drills`, `Top N`, `Advanced`, and audio fallback behavior.
- There is still some tension between “serious tool” and “compact phone UI.” The product is ambitious for a single-screen mobile web app.

Design advice:

- Keep reducing visible complexity at first glance without removing power.
- Continue moving from raw configuration vocabulary toward user-goal vocabulary.
- Use stronger spatial grouping and clearer section hierarchy in settings.
- Treat audio state as a first-class design surface, not just a technical one.
- Tighten visual consistency across flashcard, settings, explorer, and detail views so the app feels more like one system.

### Hat 2: Language Learner

What works:

- The app is excellent for repetition with purpose.
- Seeing pronoun + tense + verb and having to produce the form is genuinely useful.
- The audio layer makes the practice more alive than plain flashcards.
- Usage nuggets help bridge the gap between isolated forms and real language.
- The ability to narrow the pool to common verbs is one of the strongest features.
- The drill model is good because it lets a learner focus on exactly the pain point they want.

What feels weak or risky:

- A learner can still accidentally make the deck too hard.
- Some users may not understand which settings produce a sensible progression.
- The app is strong for practice, but weaker as an explanatory tool. That is fine, but it means users can still be confused without realizing why.
- When audio or mic behavior is inconsistent across devices, it can feel like the app is unstable even when the learning model is good.
- If usage data is imperfect, learners may trust it too much.

Learner advice:

- Keep the beginner path extremely opinionated.
- Provide stronger “recommended starting setups” for each language.
- Make it easy to recover from over-customization.
- Consider a few very explicit drill labels aimed at learners’ goals, not just grammar categories.
- Keep audio reliability high because learners interpret audio quality as language authority.

### Hat 3: Language Teacher

What works:

- The app focuses on one of the most leverage-heavy parts of language acquisition: verbs in use.
- It supports active recall, not just recognition.
- It encourages frequent exposure to core forms.
- The usage nuggets are pedagogically valuable because they help learners attach meaning and pattern, not just endings.
- Configurable drills allow differentiated practice for learners at different stages.
- Search and detail views let the app function as both trainer and quick reference.

What feels weak or risky:

- The app can drill form successfully without guaranteeing understanding of register, nuance, or syntactic constraints.
- Learners may overestimate mastery if they do well on isolated cards but cannot yet use the forms flexibly in open production.
- Some learners need more guidance about which tenses are worth learning first and why.
- If drill selection is too open, weaker learners may choose interesting-looking but pedagogically bad setups.
- The app is strong at micro-practice but weaker at sequencing a full curriculum.

Teaching advice:

- Keep the app honest about what it is: a high-quality drill tool, not a full course.
- Lean harder into recommended sequences for beginners, intermediates, and maintenance learners.
- Make the drill names pedagogically meaningful and not only technically descriptive.
- Keep improving usage quality, because bad examples teach wrong intuitions quickly.
- Consider future “teacher share” workflows where a teacher can send a drill link with a specific target skill.

## Bottom line

This app is strongest when it acts like a serious, configurable verb-practice instrument for adults.

Its competitive advantage is not broad curriculum coverage. It is:

- speed
- depth where it matters
- audio-supported form practice
- configurable drills
- a strong verbs-first philosophy

The biggest opportunity is to keep making that power easier to understand without sanding away what makes the app good.
