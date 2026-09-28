Please implement **custom verb sets for drills** with a paste-first workflow and **share-by-value** drill links.

Important:
- source files only
- do not touch `dist/`, `dist-gh/`, or generated files unless explicitly asked
- do not push or deploy unless explicitly asked
- respond in English

Context:
- Main app family root: `/Users/simeon/Desktop/proj1`
- This feature should be implemented in a way that fits the existing drill/settings architecture cleanly
- Keep the scope narrow and product-safe

## Product goal

Let users create a named **verb set** by pasting a CSV-ish list of infinitives, save it locally, use it as the exact verb pool for drills, and share drills with the verb set embedded **by value**.

This is **not** a custom exercise builder.
This is **not** sentence authoring.
This is **not** prompt authoring.

It is only:
- a named list of infinitives
- saved locally
- usable as a drill verb pool
- optionally embedded in a shared drill link

## Core product decisions already made

These are locked:

1. **Paste-first creation**
- users paste a CSV-ish list of infinitives
- one line, many lines, commas, semicolons, or mixed separators are all fine

2. **A selected verb set is the exact verb pool**
- when a verb set is active, it overrides the normal verb-pool selection logic
- that means:
  - top-N / frequency range should not drive verb selection
  - the set itself is the verb pool

3. **Tenses still apply**
- tense selection remains active
- the user is still drilling the chosen tenses, but only across verbs in the selected set

4. **Set means set**
- when a verb set is active, it should not be unexpectedly narrowed by unrelated filters
- unless there is a strong existing reason otherwise, prefer the clean model:
  - selected verb set overrides other verb-pool filters

5. **Sharing is by value, not by id**
- a drill share link that uses a verb set must include the set contents in the shared payload
- local ids are not meaningful across devices/users

6. **Recipient should not be forced to save**
- opening a shared drill should work immediately
- then the recipient can optionally choose:
  - `Save this verb set`

## Scope

Implement:
- create/edit/delete local verb sets
- select a verb set in the drill/settings UI
- verb set overrides normal verb pool selection
- tense choices still apply
- share a drill by value including the verb set payload
- on receiving a shared drill with an embedded verb set:
  - use it immediately
  - show an option to `Save this verb set`

Do not implement:
- custom sentence exercises
- blank-building / exercise-authoring systems
- a general content editor
- cloud sync

## UX requirements

### A. Verb set selection in settings
Add a `Verb set` section in the drill/settings area.

The user should be able to choose:
- `All verbs`
- one of the locally saved verb sets
- `New set`

Saved sets should show:
- name
- verb count

Example:
- `Sports · 24`
- `Music verbs · 31`

### B. Create / edit set flow
Use a lightweight modal or panel.

Fields:
- `Set name`
- large textarea for verbs

Helper text:
- `Paste infinitives, comma-, semicolon-, or newline-separated.`
- example:
  - `jouer, courir, gagner`

Accepted separators:
- commas
- newlines
- semicolons
- mixed combinations

Normalization:
- trim whitespace
- lowercase
- dedupe
- remove empty items

Validation:
- match against known verbs in the current language dataset
- show:
  - recognized count
  - not found count
- show compact lists of:
  - valid verbs
  - not found items

Saving rules:
- block save if zero valid verbs
- allow save if some are valid and some invalid
- store only the valid verbs

Editing:
- allow reopening and editing a saved set
- prefill the textarea from stored verbs

Deleting:
- allow deleting a saved set
- if the deleted set is currently selected, fall back to `All verbs`

### C. Drill behavior
When a verb set is selected:
- verb generation should only draw from that set
- tense filtering still applies

The clean mental model should be:
- `verb set = exact pool`
- `tenses = how to practice that pool`

If the selected set plus tense settings yields no possible cards:
- show the usual “no verbs match current filters” state
- ideally mention the selected set if easy

### D. Sharing behavior
Share payload must include the verb set **by value**.

That means the shared link should include enough information for another user/device to reconstruct:
- drill settings
- embedded set name
- embedded verb list

When a shared drill is opened:
- it should work immediately without requiring local saved data
- the embedded set should be used as the current verb pool
- the user should see an option to:
  - `Save this verb set`

Do not silently save the set on open.

## Data model proposal

Use a simple local structure for saved sets.

Suggested shape:

```json
{
  "version": 1,
  "sets": [
    {
      "id": "set_abc123",
      "name": "Sports",
      "verbs": ["jouer", "courir", "gagner"],
      "createdAt": 1710000000000,
      "updatedAt": 1710000000000
    }
  ]
}
```

Current drill/settings state should store:
- selected set id
or
- null / all-verbs mode

For shared drills, the payload should contain an embedded value object like:

```json
{
  "name": "Sports",
  "verbs": ["jouer", "courir", "gagner"]
}
```

## Implementation guidance

### 1. Keep the product boundary tight
Do not let this turn into:
- custom exercises
- custom prompts
- blank authoring
- a mini CMS

This feature is only about **verb pools**.

### 2. Isolate parsing/validation helpers
Please keep the paste parsing logic in small helpers:
- parse raw pasted text into candidate verbs
- normalize
- validate against known infinitives
- summarize recognized / not found

### 3. Integrate at the verb-pool layer
Do not hack this as a late-stage random filter if it creates weird interactions.
Where possible, make the selected set cleanly define the candidate verb universe.

### 4. Backward compatibility
Old saved drills/settings without verb-set support must continue to behave normally.

### 5. Share links
Do not use local set ids in shared links as the source of truth.
Ids may still exist locally, but share payloads must be self-contained.

## Open engineering judgment

If the current share-link mechanism would become too large or awkward, pick the cleanest existing route format available in the app family and embed the verb set there.

The link may be long.
That is acceptable.
The payload itself is the feature.

## Deliverables

1. Implement custom verb sets with paste-based creation
2. Make a selected set override normal verb-pool selection
3. Keep tense selection active
4. Implement share-by-value drill links with embedded verb sets
5. Add `Save this verb set` on shared-drill open
6. Briefly explain:
   - where the data is stored
   - how verb-set selection overrides the normal pool
   - how shared verb-set payloads are handled

