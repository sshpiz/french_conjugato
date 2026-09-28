# French Top-1000 Usage Cleanup Report

Date: 2026-05-04

## Scope

- Derived the top 1000 French verb lemmas from `js/verbs.full.generated.js` in existing frequency order.
- Audited those 1000 lemmas against `verb_core_patterns.json` and `verb_usages.json`.
- Core-pattern coverage in scope: 151 top-1000 verbs, 285 core-pattern entries.
- Usage coverage in scope: 1542 usage entries across all 1000 top-1000 verbs.

## Summary Counts

- Top-1000 verbs audited: 1000
- Core-pattern entries changed: 52
- Core-pattern entries removed: 1
- Core-pattern entries added/split: 1
- Usage entries changed: 21
- Items left for native review: 2

## High-Risk Fixes

- Removed `sortir de qqn / qqch`, which was backed only by the odd LEFFF sentence `le dicovalence est sorti de nos recherches syntaxiques`. The learner-facing `sortir`, `sortir qqch`, and `sortir de + lieu` patterns remain.
- Narrowed person-only dative patterns such as `dire à qqn`, `demander à qqn`, `acheter à qqn`, `mentir à qqn`, `plaire à qqn`, `téléphoner à qqn`, and similar rows that previously said `à qqn / qqch`.
- Reworded broad LEFFF-backed de/a-object rows into concrete complement labels, including `vivre de + ressources/revenus`, `souffrir de + maladie/problème`, `participer à + activité/événement`, `procéder à + action/opération`, `déborder de + contenu/émotion`, and `payer de + prix/perte`.
- Fixed pattern/example mismatches such as `commander qqch à qqn` with an example meaning "order someone to do something", now `commander à qqn de + infinitif`.
- Cleaned usage-layer placeholder/gloss issues such as `thing fumer`, `He took down the phone`, and the mixed-language English gloss `This message shows his चिंता`.

## Native Review

These rows were narrowed conservatively but should still get native-speaker review before being treated as fully settled:

- convenir (251 (top-500)): pattern=convenir de + arrangement/décision | meaning=agree on; settle | type=combo-de | notes=LEFFF example was broad/odd for learners (je conviens de ces abus); narrowed pending native review
- reparler (780 (top-1000)): pattern=reparler de qqn / qqch | meaning=talk again about | type=de-object | notes=Pattern is semantically valid, but original LEFFF note was pronominal/intransitive (ils se reparlent depuis peu); native review recommended

## Notes

- Many remaining `qqn / qqch` patterns were intentionally left unchanged when both people and things are natural learner-facing complements, e.g. `parler de qqn / qqch`, `penser à qqn / qqch`, `dépendre de qqn / qqch`, and `rêver de qqn / qqch`.
- The TSV audit trail contains one row per changed, removed, or added in-scope entry, with old/new values and rationale.
