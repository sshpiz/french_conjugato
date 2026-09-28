Please fix the dictation-stop behavior across all language apps.

Affected repos to inspect:
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

Problem:
- When dictation is incorrect, recognition can keep listening until the user changes cards
- We want dictation to stop cleanly in these cases:
  1. after getting input and then a short silence
  2. another tap on the microphone button
  3. long silence / timeout
  4. a tap on the area where the dictated text is shown

What is already localized:

Shared pattern in most repos:
- There is a dictation state machine in `js/script.js`
- It creates `dictationResultEl`
- It creates a `SpeechRecognition` / `webkitSpeechRecognition` instance
- Most repos already have a `stopActiveDictation(...)` helper
- It uses:
  - `recognition.continuous = true`
  - `recognition.interimResults = true`
- It only stops reliably on:
  - explicit success path
  - card changes / some external cleanup
  - a single long timeout started near recognition start

Likely root causes:
1. Incorrect dictation does not actively end the session
   - `recognition.onresult` updates the transcript UI
   - but if the transcript is wrong, the session usually keeps running
2. Silence handling is too weak / too coarse
   - there is a timeout, but it is not being used as a proper “post-result inactivity” timer
   - it should be reset after speech/result activity and stop after short inactivity
3. The transcript overlay cannot be tapped
   - in multiple repos, `dictationResultEl.style.pointerEvents = 'none'`
   - this makes requirement #4 impossible right now
4. Some repos already have a stop helper, but the click path still does direct `recognition.stop()`
   - unify stop behavior through the helper
   - avoid scattered stop logic that updates state differently depending on the path

Observed repo patterns:
- French/main, Greek, Portuguese, Latvian, Spanish, and likely Catalan share the same older dictation block shape
- Ukrainian has a slightly refactored version, but the same behavioral issue is present
- Russian likely shares the same stop-behavior issue as the common pattern

What to implement:

1. Add a shared stop helper in each affected repo’s dictation logic
- e.g. a function that cleanly:
  - clears dictation timers
  - stops or aborts recognition
  - updates `isDictating`
  - preserves/hides overlay as appropriate
- In repos that already have `stopActiveDictation(...)`, prefer extending/reusing it instead of creating a second helper

2. Second tap on mic must stop dictation
- This may already be partly present, but verify it really works in all modes
- Make it explicit and robust
- Route it through the same stop helper, not a raw `recognition.stop()` branch

3. Short post-input silence should stop dictation
- After receiving speech/result activity, start or reset a shorter inactivity timer
- If no new speech/result arrives within that short window, stop recognition
- This should cover:
  - “user said something, it was wrong, now they stopped talking”
- This timer should reset on new `onresult` activity, not just at session start

4. Long silence should still stop dictation
- Keep a longer fallback timeout too
- But make sure it is coordinated with the short inactivity timer

5. Tapping the transcript/result overlay should stop dictation
- Remove the `pointer-events: none` limitation or replace it with a tappable inner surface
- Add a click/tap handler to stop recognition when the overlay is tapped

6. Keep success behavior sane
- If the answer is correct and current mode should advance/reveal, existing success logic can still run
- But if the answer is wrong, the app should not keep listening indefinitely

Implementation guidance:

In the common repos, inspect:
- dictation setup where `dictationResultEl` is created
- look for:
  - `dictationResultEl.style.pointerEvents = 'none'`
  - `recognition.continuous = true`
  - `recognition.onresult = ...`
  - `recognition.onend = ...`
  - `dictationTimeout = setTimeout(...)`
  - `stopActiveDictation(...)`

Likely files:
- `/Users/simeon/Desktop/proj1/js/script.js`
- `/Users/simeon/Desktop/greek-verbs/js/script.js`
- `/Users/simeon/Desktop/portuguese-verbs/js/script.js`
- `/Users/simeon/Desktop/russian-verbs/js/script.js`
- `/Users/simeon/Desktop/catalan-verbs/js/script.js`
- `/Users/simeon/Desktop/ukrainian-verbs/js/script.js`
- `/Users/simeon/Desktop/latvian-verbs/js/script.js`
- `/Users/simeon/Desktop/spanish-verbs/js/script.js`

Suggested approach:
- Introduce two timers:
  - short inactivity-after-result timer
  - long absolute silence fallback timer
- Reset the short timer whenever new result/speech activity comes in
- Stop recognition when the short timer fires
- Make the overlay tappable and stop recognition on tap
- Use the shared stop helper for:
  - mic second-tap stop
  - overlay tap stop
  - short inactivity timeout
  - long fallback timeout
- Keep `recognition.onend` as the place that finalizes the overlay state after recognition actually ends

Concrete repo note:
- Ukrainian already has a visible `stopActiveDictation(...)` function in its current dictation block
- French, Greek, Portuguese, Russian, Catalan, Latvian, and Spanish also already have one
- So the task is mostly to make all stop paths consistently go through that helper and add the missing inactivity/tappable-overlay behavior

Deliverables:
- Patch the source files in the affected repos
- Summarize:
  - which repos needed the common fix
  - whether any repo needed a different treatment
  - what exact stop conditions are now implemented

Do not build, push, or deploy unless explicitly asked.
