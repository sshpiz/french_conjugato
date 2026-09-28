# Etygraph TODO

- Review the discovered default French verb list before using a production export. The current heuristic is expected to choose `js/verbs.full.js`.
- Add optional frequency bonuses for English candidates once a clean English frequency source is selected.
- Add a false-friend layer later: looks similar, is not the normal translation, and has meaning drift.
- Expand template support as real Kaikki/Wiktextract samples reveal more shapes.
- Add better handling for free-text etymology only entries, without inventing unsupported edges.
- Consider a SQLite or compact binary graph format if JSONL graph load time becomes too high.
- Add explicit attribution metadata once the exact Kaikki dump URLs and dates are fixed.
- Build QA reports for noisy proto-root matches and low-confidence cognate-only candidates.
