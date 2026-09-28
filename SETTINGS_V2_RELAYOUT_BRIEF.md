# Settings V2 Re-layout Brief

## Goal
Revamp the settings screen by changing:
- structure
- grouping
- section hierarchy
- collapsed/expanded behavior
- summaries

Do **not** change:
- the underlying settings/state model
- persistence keys
- the existing pills/toggles/cards vocabulary
- option semantics

This is a **UI/IA pass**, not a settings-system rewrite.

## Main Constraint
Use the **same underlying options model, same controls, and mostly the same pills/components**.

That means:
- reuse existing chips, toggles, drill cards, category chips, and action buttons
- preserve current settings behavior unless explicitly called out below
- prefer rearranging existing blocks over inventing new widgets

## Safe Rollout
Implement behind an in-app feature flag first.

Suggested approach:
- keep current settings as default
- add `Settings V2` behind a flag such as `?settingsV2=1`
- optional localStorage/dev toggle is fine too
- no settings migration
- old settings UI remains intact until V2 is approved

## Core Product Direction

### 1. Separate Exercises
Treat:
- `Conjugation`
- `Frames`

as separate exercise types.

Do **not** support `Both` for now.

### 2. Keep Existing Atoms
Do not redesign each small control right now.

Examples:
- keep existing tense pills
- keep existing Top N pills
- keep existing drill cards
- keep existing category chips
- keep existing toggle styling

Change:
- where they live
- when they are shown
- how sections collapse
- how current state is summarized

### 3. Mic Must Be Prominent
`Answer by voice` should be highly visible in Conjugation.

It should not feel buried in a generic lower section.

### 4. Frames Are Their Own Exercise
Frames should not inherit the whole Conjugation setup.

For now, Frames are about:
- verb usage
- prepositions / constructions

and not about tense/person conjugation.

### 5. Categories Override Frequency
For Conjugation setup:
- if `Category` is the active source, it overrides frequency and verb-type filtering
- tenses still apply

## Top-level Settings Structure
Use one long settings page with a sticky tab-like section nav.

This is **not** hard tabs.

Use a sticky section-jump header, something like:
- `Exercise`
- `Setup`
- `Audio`
- `App`

Tapping a label should scroll to that section.
The active section should highlight while scrolling.

## Section 1: Exercise
This should appear first.

Contents:
- exercise switcher:
  - `Conjugation`
  - `Frames`

### Conjugation
Show:
- short summary of current conjugation setup
- `Answer by voice` prominently near the top

### Frames
Show:
- short summary of current frame setup

Frames-specific controls can live here or at the top of Setup, as long as they are clearly separate from Conjugation controls.

## Section 2: Setup
This section changes depending on the selected exercise.

### Conjugation Setup
Use the current underlying controls, reordered into a clearer flow.

Suggested order:

#### 1. Conjugation drill summary
Human-readable current state, for example:
- `Most Crucial · présent · top 20`
- `Custom · présent + imparfait · irregular only`

#### 2. Tenses
Keep current tense pills.
Keep this prominent.

#### 3. Drill setup
Keep:
- current drill card
- preset drill cards
- custom drill option

Also move here:
- `Save current drill`
- `Share current drill`

Add:
- `Reset defaults`

Remove:
- help button from settings UI

#### 4. Custom / drill details
When relevant, expose the current existing setup controls in a clearer order.

Suggested grouping:

##### Verb source
Choose one source conceptually:
- frequency
- category
- later maybe verb set

This can be expressed using existing controls, not necessarily a new widget.

##### By frequency
Keep current:
- Top N pills

##### Verb types
Keep current:
- Reflexive verbs
- Regular vs Irregular
- Verb ending

Important behavior:
- do **not** silently auto-change frequency
- if `Reflexive only` becomes too sparse, use a smart nudge such as:
  - `Reflexive-only is sparse here. Expand to Top 1000?`

##### Category
Keep existing category UI, but make the precedence clearer:
- category selection overrides frequency and verb-type filters
- category still respects tenses

##### Practice filters
Keep existing:
- `Practice all pronouns evenly`

This is Conjugation-only.

##### Detailed frequency
Current recommendation:
- keep the same underlying detailed-frequency controls
- hide/collapse them unless they are relevant
- ideally show them only when `Custom` is active
- collapse by default
- auto-expand if the user has edited weights

### Frames Setup
Frames should show only the controls relevant to Frames.

For now:
- keep current frame-related options
- keep `Prepositional verbs: All / Only`

Open product option for later:
- a mode to hide the infinitive and show only the translation

Do **not** implement that behavior change in this V2 layout pass unless explicitly requested.
It can be listed as a follow-up option.

Frames should not surface unrelated Conjugation controls like:
- tense setup
- conjugation drill presets
- pronoun balancing

unless some of those are already hard-wired and impossible to separate cleanly in V2.

## Section 3: Audio
Keep this as a separate section.

This is mainly about:
- playback
- TTS readiness
- offline/downloaded audio
- troubleshooting

Keep the same underlying controls:
- native TTS status
- voice dropdown
- TTS speed
- packaged audio preference
- packaged downloads

Possible tidy-up:
- make packaged-downloads area visually smaller and less dominant
- group troubleshooting guidance here if it already exists or is added later

## Section 4: App
This should be clearly separated from practice setup.

Use a collapsed section by default.

The heading itself should include an install affordance if possible.

Keep existing app-level controls:
- Install app
- Update app
- Version
- Support email
- Idle nudge
- Show tips
- Theme
- Text size
- Debug log

## Collapsed Section Behavior
Current problem:
- collapsed areas feel too small and too easy to miss

V2 should make collapsed sections feel substantial.

Requirements:
- larger collapsed row/card
- clearer title
- one-line state summary
- stronger chevron/expand affordance
- enough vertical space that the section still feels important

Examples of collapsed summaries:
- `Conjugation · présent · top 20`
- `Frames · prepositional only`
- `Audio · native voice ready`
- `App · System theme`

## Visual Rules
- Keep existing design language
- Do not redesign the basic pills
- Do not introduce a brand-new component system
- Focus on spacing, grouping, summaries, and hierarchy
- Preserve established visual patterns across sister apps

## Explicit Additions
- `Reset defaults`

## Explicit Removals
- remove help button from the settings UI in V2

## Non-goals
- no settings storage migration
- no new settings architecture
- no combined `Conjugation + Frames` mode
- no deep redesign of every control
- no new semantic filtering model

## Open Questions
- exact placement of Frames-specific controls: inside Exercise vs inside Setup
- whether Frames should later support `translation only` prompts
- how much of the current advanced/frequency block should remain visible before `Custom`
- whether App section heading should contain only Install or also Update

## Success Criteria
A user should quickly understand:
- which exercise is active
- what setup is currently in play
- where to change tenses or drills
- where audio settings live
- where app preferences live

And V2 should be testable safely:
- behind a feature flag
- with the old settings UI still available
- using the same settings model underneath
