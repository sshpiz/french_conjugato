# Codex Damage Report - 2026-04-19

This file reports only what I changed in my most recent turn.

## Files I directly edited

- `/Users/simeon/Desktop/proj1/merge_lefff_ad_combo.py`
- `/Users/simeon/Desktop/proj1/verb_core_patterns.json`
- `/Users/simeon/Desktop/proj1/verb_core_patterns.js`
- `/Users/simeon/Desktop/proj1/verb_core_patterns_review.md`
- `/Users/simeon/Desktop/proj1/ad_combo_audit_rollout.json`
- `/Users/simeon/Desktop/proj1/ad_combo_audit_rollout.md`

## Files I did not edit

- `/Users/simeon/Desktop/proj1/js/script.js`
- `/Users/simeon/Desktop/proj1/css/style.css`
- `/Users/simeon/Desktop/proj1/index.html`
- `/Users/simeon/Desktop/proj1/labs/whisper-fr/app.js`
- `/Users/simeon/Desktop/proj1/labs/whisper-fr/index.html`

## Data rows added this turn

- `apparaître à qqn`
- `associer qqn / qqch à qqn / qqch`
- `commander qqch à qqn`
- `confirmer qqch à qqn`
- `découvrir qqch à qqn`
- `défendre qqch à qqn`
- `exiger de qqn`
- `opposer qqn / qqch à qqn / qqch`
- `rapporter qqch à qqn`
- `reconnaître qqch à qqn`
- `répéter qqch à qqn`
- `souhaiter qqch à qqn`
- `vendre qqch à qqn`
- `voler qqch à qqn`

## Logic change made

- Expanded the LEFFF safe allowlist in `/Users/simeon/Desktop/proj1/merge_lefff_ad_combo.py` for the rows above.
- Added gloss overrides for the new learner-facing patterns in that same file.

## Regenerated outputs

- `/Users/simeon/Desktop/proj1/verb_core_patterns.json`
- `/Users/simeon/Desktop/proj1/verb_core_patterns.js`
- `/Users/simeon/Desktop/proj1/verb_core_patterns_review.md`
- `/Users/simeon/Desktop/proj1/ad_combo_audit_rollout.json`
- `/Users/simeon/Desktop/proj1/ad_combo_audit_rollout.md`

## Unexpected action I took

- I ran `python3 /Users/simeon/Desktop/proj1/build.py`.
- That rewrote build artifacts under `/Users/simeon/Desktop/proj1/dist/...`, including the French app and SEO reference pages.
- I should not have done that without checking first.

## Build outputs affected on disk

- `/Users/simeon/Desktop/proj1/dist/french/index.html`
- other generated files under `/Users/simeon/Desktop/proj1/dist/`
- generated reference pages under `/Users/simeon/Desktop/proj1/dist/reference/`

These build outputs were rewritten on disk but are not currently showing in `git status`.

## Audit movement from this turn

- `covered`: `103 -> 116`
- `candidate_add`: `93 -> 80`
- `manual_review`: stayed `7`
- `likely_none`: stayed `544`

## Current dirty tracked files in git status

My turn left these tracked files modified:

- `/Users/simeon/Desktop/proj1/merge_lefff_ad_combo.py`
- `/Users/simeon/Desktop/proj1/verb_core_patterns.json`
- `/Users/simeon/Desktop/proj1/verb_core_patterns.js`
- `/Users/simeon/Desktop/proj1/verb_core_patterns_review.md`
- `/Users/simeon/Desktop/proj1/ad_combo_audit_rollout.json`
- `/Users/simeon/Desktop/proj1/ad_combo_audit_rollout.md`

There are also pre-existing unrelated dirty tracked files:

- `/Users/simeon/Desktop/proj1/labs/whisper-fr/app.js`
- `/Users/simeon/Desktop/proj1/labs/whisper-fr/index.html`
- `/Users/simeon/Desktop/proj1/merge_usage_backed_ad_combo.py`

## Bottom line

- I did not touch French UI source files.
- I only changed the core-pattern pipeline/data/audit files listed above.
- I did run a full build unexpectedly, which rewrote `dist` outputs on disk.
