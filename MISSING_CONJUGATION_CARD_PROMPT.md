Please fix the “missing conjugation can still become a flashcard” bug in the Slavic apps.

Primary target:
- /Users/simeon/Desktop/ukrainian-verbs

Secondary verify-only target:
- /Users/simeon/Desktop/russian-verbs

Important scope rules:
- Source files only
- Do not edit `dist/`, `dist-gh/`, generated files, or data files
- Do not push or deploy
- Build only if needed to verify the source fix

Problem summary:
- In Ukrainian, some verbs can appear as flashcards in a tense slot where there is no real conjugation.
- Example pattern:
  - perfective verbs can lack present-tense forms
  - the app still shows a present-tense card
  - the answer area is effectively blank / unusable
- The screenshot case strongly suggests the app is treating `—` as a valid form.

What is already localized:

Ukrainian candidate generation is too permissive:
- File:
  - `/Users/simeon/Desktop/ukrainian-verbs/js/script.js`
- Function:
  - `generateCard()`
- Relevant lines:
  - around `2023–2047`
- Current behavior:
  - it filters candidate pronouns with:
    - `String(forms[pronounKey] || '').trim()`
  - and then accepts:
    - `const conjugated = String(forms[pronounKey] || '').trim();`
    - `if (!conjugated) return;`
- This treats `—` as truthy, so a missing form can still enter the weighted deck.

Ukrainian direct card generation has the same issue:
- File:
  - `/Users/simeon/Desktop/ukrainian-verbs/js/script.js`
- Function:
  - `generateCardFromParams()`
- Relevant lines:
  - around `2968–2984`
- Current behavior:
  - same `String(...).trim()` check
  - so a deep-linked card can also accept `—` as if it were a valid answer

Russian already appears to have the right guard:
- File:
  - `/Users/simeon/Desktop/russian-verbs/js/script.js`
- Helper:
  - `const isConjugationUsable = (value) => { ... }`
- Relevant lines:
  - around `112`
- It rejects:
  - empty string
  - `—`
  - `-`
- Russian card generation already uses this helper in its deck builder and param-based card generation.

Recommended fix:
1. In Ukrainian, add a helper equivalent to Russian’s:
   - `isConjugationUsable(value)`
   - should return false for:
     - empty string
     - `—`
     - `-`
2. Update Ukrainian `generateCard()` to use that helper:
   - when building `candidatePronouns`
   - when validating `conjugated`
3. Update Ukrainian `generateCardFromParams()` to use that helper too
4. Verify that no other path can surface an unusable flashcard for a missing form
5. In Russian, verify behavior only:
   - if the helper is already being used correctly, leave Russian source unchanged

Nice-to-have check:
- If a tense is enabled but a given verb has zero usable forms in that tense, that verb should simply not contribute any cards for that tense.

Deliverables:
- Update only the needed source files
- Report:
  - whether Russian needed any actual change
  - what Ukrainian functions were patched
  - whether a rebuild is needed after the source fix

Do not push or deploy unless explicitly asked.
