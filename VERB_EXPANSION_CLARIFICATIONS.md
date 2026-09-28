# Verb Expansion Clarifications

These answers clarify the execution brief in:

- `/Users/simeon/Desktop/proj1/VERB_EXPANSION_AND_GLOSS_UPGRADE_PROMPT.md`

## 1. Canonical repo roots

Use these as the canonical app roots:

- French: `/Users/simeon/Desktop/proj1`
- Spanish: `/Users/simeon/Desktop/spanish-verbs`
- Portuguese: `/Users/simeon/Desktop/portuguese-verbs`
- Italian: `/Users/simeon/Desktop/italian-verbs`
- German: `/Users/simeon/Desktop/german-verbs`
- Greek: `/Users/simeon/Desktop/greek-verbs`
- Catalan: `/Users/simeon/Desktop/catalan-verbs`
- Russian: `/Users/simeon/Desktop/russian-verbs`
- Ukrainian: `/Users/simeon/Desktop/ukrainian-verbs`
- Latvian: `/Users/simeon/Desktop/latvian-verbs`

If you discover a repo-specific documented sub-workflow inside one of these roots, follow it, but treat the list above as the canonical set.

## 2. Meaning of the 2,000 target

The target means:

- `2,000 unique verb lemmas after eventual merge`

It is acceptable for the expansion layer to overshoot a bit if that helps review and later trimming, but the work should stay disciplined:

- do not pad with weak or uncanny verbs just to inflate counts
- keep the output reviewable
- track which candidates are core vs stretch

So:

- final merge target: at least 2,000 good lemmas
- expansion-layer output: modest overshoot is acceptable

## 3. Artifact shape

Preserve each repo’s existing runtime/data conventions.

However, for the **expansion-layer artifacts**, prefer a shared normalized shape where possible, as long as:

- merge helpers convert cleanly back into repo-native schemas
- the runtime files are not rewritten prematurely

So the rule is:

- runtime/output shape: repo-native
- expansion-layer working shape: shared where practical

## 4. OpenAI API usage

OpenAI API use is approved where materially useful.

But do not jump there blindly.

Preferred order:

1. existing deterministic/local generation if it is reliable
2. deterministic plus review if it is mostly reliable
3. OpenAI model assistance where local methods are insufficient or missing

When using model assistance:

- document why deterministic/local methods were insufficient
- keep conjugation calls isolated by verb when needed
- do not mix unrelated verbs across conjugation calls

## 5. Proof of concept expectation

One fully end-to-end proof-of-concept language is enough for this pass **if** the architecture is solid and reusable.

But:

- Spanish, German, and Russian should all be analyzed and classified
- at least one of them should be demonstrated end-to-end
- if momentum allows, demonstrating more than one is welcome, but not required

So the minimum acceptable outcome is:

- all three mapped
- one fully demonstrated

## 6. Quality bar

Across all languages:

- category usefulness matters, not just raw counts
- glosses should feel natural to a native speaker
- slang is allowed when genuinely useful and natural
- avoid uncanny dictionary-ish filler

## 7. Safety rule

Do not overwrite main runtime data as the primary work product.

Use:

- expansion-layer files
- merge helpers
- review artifacts

so the user can continue normal development and decide later when to merge/commit.
