Please fix the settings drill-highlight CSS drift in the non-French language repos.

Canonical reference:
- /Users/simeon/Desktop/proj1/css/style.css

Repos to audit:
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
- Do not push or deploy
- If a repo already matches French visually, leave it alone

What the bug is:
- In French, the selected drill and current-drill card in Settings have the newer dark-mode styling:
  - dark blue/slate current-drill card
  - dark selected drill card
  - no bright white slab in dark mode
- In several sibling repos, the active drill/current-drill styles still render with a light background in dark mode or system-dark mode.

What caused it:
- Those repos still contain two layered CSS blocks:
  1. an older `/* Settings drill port */` block
  2. a later `/* Settings drill parity with French */` block
- The later parity block includes light-mode overrides such as:
  - `#options-container .current-drill-card`
  - `#options-container .preset-btn`
  - `#options-container .preset-btn.active`
- But it only adds dark overrides for:
  - `html:not([data-theme]) ...`
  - `html[data-theme="system"] ...`
- It does not add matching explicit dark-theme overrides for:
  - `html[data-theme="dark"] #options-container .current-drill-card`
  - `html[data-theme="dark"] #options-container .preset-btn`
  - `html[data-theme="dark"] #options-container .preset-btn.active`
- Because of specificity/order, the later light-mode `#options-container ...` rules can override the earlier dark rules and produce the ugly white highlight.

French reference selectors:
- `/Users/simeon/Desktop/proj1/css/style.css`
- Look at:
  - `.current-drill-card`
  - `.preset-btn`
  - `.preset-btn.active`
  - `html[data-theme="dark"] .current-drill-card`
  - `html[data-theme="dark"] .preset-btn`
  - `html[data-theme="dark"] .preset-btn.active`

Likely affected repos:
- greek-verbs
- portuguese-verbs
- russian-verbs
- catalan-verbs
- ukrainian-verbs
- latvian-verbs

Likely already fine, but still verify:
- spanish-verbs

Your task:
1. Inspect each repo’s `css/style.css`
2. Determine whether the selected drill/current-drill styling already matches French in:
   - explicit dark mode
   - system dark mode
3. For repos that drift:
   - fix the CSS so the settings drill highlight matches French
   - avoid introducing more layered overrides if you can simplify safely
   - prefer the narrowest safe change
4. Do not touch unrelated CSS or behavior

What “fixed” means:
- In dark mode and system-dark mode:
  - `.current-drill-card` should be dark/slate, not white
  - `.preset-btn.active` should be dark blue/slate, not pale blue/white
  - unselected drill cards should remain dark and subtle
- Light mode should remain correct

Deliverables:
- Update only the affected `css/style.css` files
- At the end, report:
  - which repos needed changes
  - which repos were already fine
  - a short explanation of the root cause you found

Do not build, deploy, or push unless explicitly asked.
