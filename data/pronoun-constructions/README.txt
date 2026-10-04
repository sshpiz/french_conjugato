French pronoun expansion — local preview, 2026-10-01

Run from proj1: python3 scripts/audit_french_pronoun_inventory.py
Validate: node test_reference_expansion.cjs

coverage.json accounts for every 7,264 headword. An audit status is NOT a
claim of individual human review or of linguistic impossibility. Existing
editorial coverage is additive and lives in js/referenceCards.js.

Activation requires BOTH:
- an exact construction in verb_core_patterns.json with recorded independent
  reviews (whose scope is construction and gloss, not full conjugations);
- explicit matching pronouns in a DICOVALENCE personal-subject frame, with no
  additional mandatory complement; and complete, compatible app paradigms.

382 enabled constructions / 350 source-intersection verbs. Combined with the
existing editorial inventory: 408 unique playable verbs (previously 191).
Candidates: 3,876 constructions / 2,777 verbs. Candidates are NOT shipped as
practice content. The remaining records require sense/semantic review.

Deferred auxiliary mismatches: descendre, rentrer, sortir, passer, retourner.
Their intransitive être paradigms must not be reused for transitive avoir
constructions. No automatic auxiliary conversion is performed.

Data provenance:
DICOVALENCE 2.0 (2010), Karel van den Eynde and Piet Mertens, KU Leuven.
Local source: _experiments/dicovalence_100625_utf8.txt
License: LGPL-LR, as declared in the source header.
Original license URL: http://bach.arts.kuleuven.be/dicovalence/LGPLLR.html
Manual: https://repository.ortolang.fr/api/content/dicovalence/1/documentation/DicovalenceManuel_v20_100625.pdf
The original sourceId, valency, frame, source example and review provenance
are retained in enabled.json. The generated runtime uses reviewed examples
and glosses. Preserve this provenance and resolve distribution/license
packaging before publishing this experiment.

Runtime changes are additive: original nuanced records remain selectable.
Finite tenses only. Same-person ambiguous reflexive readings are excluded.
No implicit support inferred from verb spelling or frequency rank.
Structural matrix checks do not prove idiomaticity of every combination.

2026-10-01 en/y expansion release:
402 editorial en/y constructions over 313 verbs, each with a worked example.
Combined playable inventory: 545 verbs. Overlapping legacy source-intersection
y/en records are replaced, not counted twice, in the expanded engine.
Generate with python3 scripts/build_french_en_y.py.
Validate with node test_en_y_expansion.cjs and test_reference_negation.cjs.
coverage-expanded.json records the combined playable status for every headword.
NOTICE.txt, LGPLLR.txt, original source and generator inputs accompany the web
release under data/pronoun-constructions. The earlier packaging TODO above is
resolved for this release.
