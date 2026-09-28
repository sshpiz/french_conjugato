Please implement a new French-only feature in the French app:

Goal:
Add a small structured "core patterns" layer above the existing verb usage/nugget section.

Context:
- Work only in the French app first:
  - `/Users/simeon/Desktop/proj1`
- Do not port to other languages in this task
- Do not push or deploy unless explicitly asked

Why:
- The current usage nuggets are rich and interesting, but they are not structured enough for core French argument-pattern learning
- For French, distinctions like:
  - direct object
  - `à`
  - `de`
  - nothing / bare infinitive / direct complements
matter a lot because they affect pronoun behavior and core fluency:
  - `y`
  - `en`
  - direct object pronouns
  - indirect object pronouns

Product direction:
- Keep the current usage nuggets/examples
- Add a compact structured section above them
- This new section should teach the “core ways this verb is used”

Recommended section title:
- `Core patterns`
or
- `How this verb is used`

Preferred UI direction:
- compact, dictionary-like, lightweight
- not a big table
- not overexplained
- each row should primarily show the pattern itself
- then a short English gloss

Good examples of the intended style:
- `parler à qqn` = speak to someone
- `parler de qqch` = talk about something
- `aimer qqn / qqch` = like, love
- `demander qqch à qqn` = ask someone for something
- `demander à qqn de + infinitif` = ask someone to do something

Important product rule:
- Do NOT force an always-visible matrix of:
  - verb + qqn/qqch
  - verb + à + qqn/qqch
  - verb + de + qqn/qqch
- Instead:
  - use that as an internal conceptual schema if helpful
  - but only show attested / meaningful patterns in the UI
- Split patterns only when grammar, meaning, or pronoun consequences differ in a useful way

Meaningful split examples:
- `penser à qqn`
- `penser à faire qqch`
- `penser de qqn/qqch`

Avoid unnecessary clutter:
- if `qqn` vs `qqch` is basically the same pattern, allow one merged row like:
  - `aimer qqn / qqch`

Implementation recommendation:
1. Add a new structured data field separate from the current usage nuggets
   - e.g. `core_patterns`
2. Keep nuggets/usages as they are
3. Render `core_patterns` first in the usage panel / usage area
4. Then render the existing richer usages below

Suggested data shape:
- Per verb:
  - `core_patterns: []`
- Each pattern entry could include:
  - `pattern`
  - `meaning_en`
  - optional `notes`
  - optional `example_fr`
  - optional `example_en`

But keep v1 lightweight:
- `pattern`
- `meaning_en`
is probably enough to start

Suggested rollout for v1:
- do not try to solve all French verbs at once
- support the UI and data plumbing cleanly
- seed the structured patterns for a meaningful initial subset, ideally:
  - top 50 verbs
or another clearly scoped initial set if more practical

Technical expectations:
- Use current French app structure and styling conventions
- Keep the new section visually integrated with the existing usage area
- Avoid making the panel much noisier or taller than needed
- Preserve mobile readability

Suggested files to inspect:
- `/Users/simeon/Desktop/proj1/index.html`
- `/Users/simeon/Desktop/proj1/css/style.css`
- `/Users/simeon/Desktop/proj1/js/script.js`
- current French usage data files in `/Users/simeon/Desktop/proj1`

Task phases:
1. Inspect how current verb usages/nuggets are stored and rendered
2. Add a clean `core_patterns` data path
3. Render a compact structured section above the existing usages
4. Seed initial French data for a useful subset
5. Build and verify locally

Deliverables:
- Implement the feature in French source
- Build the French/shared site locally
- Summarize:
  - data structure chosen
  - files changed
  - how many verbs got seeded with structured patterns in v1
  - any open questions for broader rollout

Do not port to other languages yet.
Do not push or deploy unless explicitly asked.
