Please implement a subtle idle-guidance feature across all language apps.

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

Feature goal:
- When the user is idle on a flashcard for a while, gently remind them what they are supposed to do.
- This should be elegant and low-pressure, not flashy or annoying.

Product direction:
1. Before reveal
- If the user is idle on a hidden-answer card for long enough, animate the instructional text area itself.
- The nudge should remind them of the task, not just pulse the UI controls.
- The relevant text is the same kind of prompt used in tutorial wording:
  - effectively “conjugate X for Y”
  - connect verb + pronoun + tense
- It should feel like the app is helping the learner understand the task.

2. After reveal
- Do NOT compete with usage text or the answer area.
- Instead, if the user is idle on a revealed card, nudge the `Next` button.
- This nudge should be subtler than a CTA banner; more like a slow, tasteful throb/breathing emphasis.

3. Design expectations
- same feature concept in all apps
- same interaction logic in all apps
- text remains language-appropriate because the apps already have their own instructional strings
- animation must be restrained:
  - slow pulse / breathing rhythm
  - low amplitude
  - not constant hyperactivity
  - should disappear as soon as the user interacts again

Strong design preference:
- before reveal, animate the task prompt / instruction area, not just the verb/pronoun/tense pills
- after reveal, animate `Next`, not the usage area

Implementation guidance:
1. Add an idle timer for flashcard interaction
- reset it on meaningful user actions, for example:
  - reveal / next / back / skip
  - mic use
  - hear use
  - search open
  - settings open
  - tapping the flashcard

2. Add two idle states
- hidden-answer idle state
- revealed-answer idle state

3. Hidden-answer idle behavior
- apply a class or state that gently animates the instructional text block
- if there is no instruction block visible for a given state, create/use the smallest appropriate existing prompt area

4. Revealed-answer idle behavior
- apply a class or state to the `Next` button only
- avoid pulsing the whole footer or whole flashcard

5. Clear the idle state immediately on interaction
- do not let animation keep running after the user re-engages

6. Keep tutorial and regular practice compatible
- tutorial text should still work naturally
- normal practice cards should gain the same kind of guidance

Files likely involved:
- each repo’s:
  - `index.html`
  - `css/style.css`
  - `js/script.js`

Deliverables:
- implement the feature in source across all 8 apps
- summarize:
  - what element is animated before reveal
  - what element is animated after reveal
  - what idle threshold(s) were chosen
  - any repo that needed special handling

Do not build, push, or deploy unless explicitly asked.

