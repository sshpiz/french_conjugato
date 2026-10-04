> Superseded for coverage by [CONSTRUCTION_COVERAGE.md](CONSTRUCTION_COVERAGE.md). This file records the original 20-verb pilot.

# Reusable pattern preview (private, 2026-09-29)

The card now reads its construction from an existing usage/core-pattern record's
`drill_pattern` metadata. There is no separate runtime list of example suffixes.

- One generic construction beneath the unchanged lemma and translation.
- Full placeholders; connecting words are highlighted lightly.
- Distinct constructions rotate on new cards; redisplaying/history preserves the
  selected record. There is no deliberately blank card in the rotation.
- Conjugated answers, grading, dictation and existing audio IDs are unchanged.
- Usages starts collapsed for these cards, is disabled before answer reveal,
  and marks the selected shared record after expansion. Other cards retain their
  prior preference. The Patterns switch controls the new line.
- Tutorial, phrase and frame cards are excluded. Other tenses can show the
  infinitive reference because it is never appended to the conjugated answer.
  French venir de + infinitif is limited to present/imparfait in this preview;
  compound-tense cards stay bare rather than imply an invalid recent-past form.

French: 32 display selections across the actual top 20; stored in
`verb_core_patterns.json` / its generated JS counterpart. Twenty usage examples
are linked to core records with `core_pattern_id`; those display the core wording.
Spanish and Catalan: 27 selections each across their actual top 20, stored directly
in their existing usages JSON / JS. Catalan gained source-linked topic and
cessation entries; French gained the missing parler-de example.

This is a visual/content-selection preview, not a completed linguistic audit.
Existing broader usages are retained; questionable entries excluded from card
selection are listed in the parent construction-lab/pattern-preview audit.
Some French selected core patterns still have no linked example. No public
production deployment was performed.

Tests: run `node test_construction_cards.cjs` with modern Node. Checks actual top-20
coverage, unchanged answers/audio, stable selection, supported modes and JSON/JS
parity. Builds run on blackswan through the shared tooling/build_pilot.py helper.
Node is not installed in the current WSL login environment; JS tests run on Mac.
