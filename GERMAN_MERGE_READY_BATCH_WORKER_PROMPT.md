# German Merge-Ready Batch Worker

Your job is to turn the current German sidecar expansion pipeline into a **merge-ready reviewed batch workflow** without touching live runtime files yet.

## Goal

Produce the **first merge-ready reviewed batch** of German expansion verbs from the current draft candidate pool.

The big idea:

- keep working in sidecar files
- do not merge the whole `top4000` draft
- review in smaller batches
- focus on candidate quality and English gloss quality
- treat conjugations as mostly trusted unless a red flag appears

## Very important constraints

- do **not** rewrite live runtime files as your main output
- do **not** push or deploy
- do **not** try to process the whole 4000-candidate draft in one giant model/context pass
- do **not** choke on tokens by loading massive draft files whole if you can avoid it

## Interpreter

Use:

- `/Users/simeon/Desktop/proj1/venv/bin/python3`

unless a repo-local documented workflow explicitly requires something else.

## Repo

Primary repo:

- `/Users/simeon/Desktop/german-verbs`

## Current known state

Already available:

- `/Users/simeon/Desktop/german-verbs/harvest_german_wiktionary_candidates.py`
- `/Users/simeon/Desktop/german-verbs/build_german_wiktionary_draft_candidates.py`
- `/Users/simeon/Desktop/german-verbs/merge_german_verb_expansion.py`
- `/Users/simeon/Desktop/german-verbs/run_german_expansion_pipeline.py`
- `/Users/simeon/Desktop/german-verbs/expansion/verb_expansion_candidates.top4000.draft.json`
- `/Users/simeon/Desktop/german-verbs/expansion/verb_expansion_candidates.top4000.draft.review.md`
- `/Users/simeon/Desktop/german-verbs/expansion/wiktionary_selector_overrides.json`

Live runtime files that must stay untouched for now:

- `/Users/simeon/Desktop/german-verbs/german_seed_verbs.json`
- `/Users/simeon/Desktop/german-verbs/german_v1_conjugations.json`
- `/Users/simeon/Desktop/german-verbs/js/verbs.full.js`

## What “merge-ready” means here

A verb is merge-ready if:

- lemma is genuinely useful for learners
- conjugation source appears trustworthy enough
- English gloss is natural and concise
- niche/technical/taboo junk is filtered out
- duplicates and low-value near-duplicates are handled

## Scope

Build the first **reviewed batch workflow**, targeting roughly:

- `250` verbs

You may choose a slightly smaller or larger first batch if justified, but stay in the same scale.

## Required outputs

Create sidecar/review artifacts only.

Expected kinds of outputs:

- a reviewed batch JSON
- a review markdown file
- optional helper scripts for slicing/filtering/reviewing
- optional merge helper adjustments if needed

Reasonable example names:

- `expansion/verb_expansion_candidates.batch001.reviewed.json`
- `expansion/verb_expansion_candidates.batch001.review.md`
- `expansion/build_german_review_batch.py`

Use naming that fits the repo, but keep it systematic.

## Review rubric

For each candidate, classify into something like:

- keep
- reject
- needs_better_gloss
- maybe_later

And preserve reasons where useful:

- too niche
- too technical
- taboo/vulgar
- duplicate of more common lemma
- bad or awkward gloss
- learner-useful

## Conjugation policy

Do **not** spend most of your time re-verifying every conjugation.

Treat conjugations as provisionally trusted **unless**:

- paradigm looks malformed
- separable-prefix behavior looks wrong
- auxiliary/irregular behavior looks suspect
- a known irregular verb looks broken

So:

- spot-check conjugations
- focus review energy on candidate usefulness and gloss quality

## Batching and access constraints

This is important.

There are two separate risks:

1. avoid giant one-shot review passes over the whole draft
2. do not assume network/API access is available unless it actually works

So:

1. inspect file structure first
2. slice the candidate pool
3. work batch-by-batch
4. produce small review artifacts

If you use any model-assisted review, keep calls bounded and incremental.

If OpenAI or external web access is needed:

- first check whether it is actually available in the current environment
- if not available, do not stall or fake it
- continue with the best local/offline workflow and report the blocker clearly

## Suggested workflow

1. Inspect the current draft candidate schema.
2. Define a first review batch of about 250 candidates.
3. Create or reuse helper tooling to slice that batch cleanly.
4. Review candidate quality.
5. Repair/improve glosses for the kept verbs.
6. Spot-check conjugations only where suspicious.
7. Produce a merge-ready sidecar batch output.
8. Document the repeatable workflow for batch 2, batch 3, etc.

## Non-goals

- no mass merge into runtime files
- no full 4000-candidate approval
- no live deploy
- no pretending the whole German draft is ready

## Final response

Report:

1. files changed
2. exact reviewed batch size
3. how many kept / rejected / needs-better-gloss / maybe-later
4. whether a first merge-ready batch now exists
5. what the next batch workflow would be

Also explicitly mention any blocker that still prevents recommending an actual merge.
