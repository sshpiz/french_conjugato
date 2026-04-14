# French Flashcard Feature Report

This pass was implemented only in `/Users/simeon/Desktop/proj1`.

## Scope

The goal was to improve the French flashcard view without changing the Greek or Portuguese repos yet, while keeping the implementation easy to port later.

## Implemented Features

1. Help button in flashcard navigation
- Added a visible `Help` button next to `Settings`.
- It reuses the existing FTUE/help overlay instead of creating a second help system.

2. Smaller `Search` button in flashcard navigation
- Reduced the relative width of the `Search` button in the bottom nav.
- `Back`, `Skip`, `Settings`, and `Help` now fit more evenly.

3. Playable usage text no longer advances the flashcard
- Tapping playable text inside the answer area, especially the usage nugget French text, no longer counts as a card-advance tap.
- This was fixed in two layers:
  - the flashcard click handler now ignores interactive targets
  - the usage nugget intercepts its own playable-text interactions

4. Long-press copy on playable text
- Long-pressing a `.tappable-audio` element copies its text to the clipboard.
- This is feature-flagged.
- A short visual state and brief feedback overlay are shown on successful copy.

5. Usage nugget visibility toggle
- The earlier dimming experiment was replaced.
- There is now a dedicated usage toggle in the main control dock.
- It lets the user hide or show the usage nugget while drilling.
- The choice persists across cards because it is stored in the normal app options payload.

6. Larger usage nugget typography
- Slightly increased font sizes for:
  - usage pattern
  - French usage sentence
  - English gloss

7. Contextual speaker button next to the mic
- Added a speaker button beside the mic button.
- Behavior:
  - before answer reveal: plays the infinitive
  - after answer reveal: plays the shown answer
- The earlier glow/hint animation was removed after testing.
- This is app-level feature-flagged, not user-toggleable in settings.

8. `Back` and `Skip` labels on nav arrows
- Added labels to the left and right arrow buttons.
- They now read `Back` and `Skip`.

## Flags And Settings

Defined in `/Users/simeon/Desktop/proj1/js/script.js`:

```js
const FRENCH_FLASHCARD_FEATURES = {
    longPressCopyOnPlayableText: true,
    usageNuggetVisibilityToggle: true,
    contextualSpeakerButton: true,
};
```

Persisted card option added:

```js
showUsageNugget: true
```

This is stored in the normal French app options payload under `window.frenchLocalStorageKey`.

## Files Changed

- `/Users/simeon/Desktop/proj1/index.html`
- `/Users/simeon/Desktop/proj1/js/script.js`
- `/Users/simeon/Desktop/proj1/css/style.css`

## Main Technical Notes

### Flashcard tap protection

The important reusable helper is the interactive-target guard:

- `isInteractiveFlashcardTarget(target)`

This prevents the card-level tap handler from treating playable text, buttons, inputs, and nugget interactions as “next” taps.

### Usage nugget visibility state

Core helpers:

- `syncUsageNuggetVisibility()`

This is the part to mirror in the other language repos if we want the same persistent hide/show behavior.

### Long-press copy

Core helpers:

- `scheduleLongPressCopy(target)`
- `clearLongPressCopy()`
- `copyTextToClipboard(text)`
- `shouldSuppressTapAudio()`

The audio-suppression guard is important so a successful long-press copy does not immediately also trigger playback.

### Context speaker hint button

Core helpers:

- `refreshContextAudioButton()`
- `playContextAudioHint()`

This can be ported almost directly if the other apps keep the same `verbInfinitiveEl`, `conjugatedVerbEl`, and `.tappable-audio` conventions.

## Porting Advice For Greek And Portuguese

1. Port the JS interaction helpers first.
2. Port the new HTML controls second.
3. Port the CSS last, because the CSS depends on the final button IDs and classes.

Recommended portability order:

1. `script.js`
2. `index.html`
3. `style.css`

## Things To Watch When Porting

- Greek and Portuguese may not use the exact same help overlay wiring.
- If their playable text is missing `data-speak` or `data-audio-id`, the copy/audio behavior will be weaker.
- If their bottom nav has different button density, the `Search` width tuning may need to be adjusted per repo.
- If their bottom control dock is laid out differently, the usage-toggle placement may need a small adjustment.

## Local Verification Checklist

- Tap blank flashcard area before answer: answer reveals
- Tap blank flashcard area after answer: next card
- Tap usage nugget French text after answer: audio plays, card does not advance
- Long-press playable text: copied to clipboard
- Tap the usage button: usage nugget hides/shows and choice persists
- Press speaker button before answer: infinitive plays
- Press speaker button after answer: answer plays
- Bottom nav shows `Back`, smaller `Search`, `Skip`, `Settings`, `Help`
