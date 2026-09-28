Please implement this mic behavior change across all language apps.

Target repos:
- /Users/simeon/Desktop/proj1
- /Users/simeon/Desktop/greek-verbs
- /Users/simeon/Desktop/portuguese-verbs
- /Users/simeon/Desktop/russian-verbs
- /Users/simeon/Desktop/catalan-verbs
- /Users/simeon/Desktop/ukrainian-verbs
- /Users/simeon/Desktop/latvian-verbs
- /Users/simeon/Desktop/spanish-verbs

Important scope rules:
- Source files only
- Do not edit `dist/`, `dist-gh/`, generated files, or data files
- Do not push or deploy unless explicitly asked

Feature request:
- When the "answer with mic before reveal" toggle is ON, but the user manually taps to reveal the answer, the mic should still be usable for pronunciation practice.
- In that already-revealed state:
  - if the user says the answer correctly
  - show the usual success feedback / `Bravo`
  - but do NOT advance to the next card
- This should behave like normal after-reveal practice for that revealed card.

Behavior we want:
1. Mic-answer mode ON, answer still hidden
- Correct dictation keeps current behavior:
  - reveal answer if needed
  - advance to next card after the existing success delay

2. Mic-answer mode ON, but answer was manually revealed first
- Mic should stay available for practice
- Correct dictation should:
  - show normal success feedback
  - NOT advance to next card
  - leave the user on the current revealed card

3. Mic-answer mode OFF
- Keep current behavior

Why this matters:
- Some users want to reveal to verify spelling or sanity-check the form
- After that reveal, the mic should become a practice tool, not an auto-advance trigger

What is already localized:
- Most repos share the same general pattern:
  - `getEffectiveMicMode()` or `getMicMode()`
  - `getMicAvailability()`
  - `handleMicSuccess()`
  - reveal helper like `showAnswer()` or `revealAnswer()`
- Current common behavior is roughly:
  - if mic mode is `answerByVoice` AND `!isAnswerVisible`
    - reveal if needed
    - auto-advance after delay
  - otherwise
    - stop recognition after a short success delay

Observed files/functions:
- French:
  - `/Users/simeon/Desktop/proj1/js/script.js`
  - `handleMicSuccess()`
- Greek:
  - `/Users/simeon/Desktop/greek-verbs/js/script.js`
  - `handleMicSuccess()`
- Portuguese:
  - `/Users/simeon/Desktop/portuguese-verbs/js/script.js`
  - `handleMicSuccess()`
- Russian:
  - `/Users/simeon/Desktop/russian-verbs/js/script.js`
  - `handleMicSuccess()`
- Catalan:
  - `/Users/simeon/Desktop/catalan-verbs/js/script.js`
  - `handleMicSuccess()`
- Latvian:
  - `/Users/simeon/Desktop/latvian-verbs/js/script.js`
  - `handleMicSuccess()`
- Spanish:
  - `/Users/simeon/Desktop/spanish-verbs/js/script.js`
  - `handleMicSuccess()`
- Ukrainian:
  - `/Users/simeon/Desktop/ukrainian-verbs/js/script.js`
  - `handleMicSuccess()`
  - uses `getMicMode()` and `revealAnswer(...)` instead of the exact French names

Implementation guidance:
1. Keep the existing hidden-card success path
- If mic mode is `answerByVoice` and the answer is still hidden, keep current auto-advance behavior

2. Change the revealed-card success path
- If mic mode is `answerByVoice` but `isAnswerVisible` is already true
- treat success as pronunciation practice only
- do not call `handleNext()` / `nextCard()`

3. Preserve success feedback
- Keep the same success overlay / positive message
- only suppress the auto-advance in the already-revealed case

4. Do not redesign mic modes
- This is NOT the bigger 3-mode mic refactor
- Just adjust the current boolean/two-mode behavior

5. Be careful not to break:
- tutorial mic flow
- after-reveal practice mode when the toggle is OFF
- hidden-card answer-by-voice auto-advance
- Ukrainian’s slightly different reveal helper names

Suggested mental model:
- Hidden card + answer-by-voice = answering
- Revealed card + answer-by-voice = practice

Deliverables:
- Patch the source files in the affected repos
- Summarize:
  - which repos used the shared `handleMicSuccess()` pattern directly
  - whether Ukrainian needed any special handling
  - what exact condition now prevents auto-advance after manual reveal

Do not build, push, or deploy unless explicitly asked.

