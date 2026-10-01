French word-family dataset — first pass

Scope
The 500 verbs tagged top20/top50/top100/top500 in the current Blackswan French
inventory, plus chier (the motivating example, also present in the app).
No app UI, build inputs or deployment have been changed.

Consumer file: word_families.fr.json
Each record has lemma, verbs, nouns, adjectives, adverbs. Each category is an
array of words, with no meanings or examples. Empty arrays are intentional.
Only source verbs must be in the app; family members may be other lexical words.

This is a dictionary-linked draft, not a finished linguistic gold standard.
The French Wiktionnaire supplies derived and same-family links. Target entries
confirm French lexical part of speech. Ordinary conjugated forms are excluded;
lexicalized adjectives (such as chiant) are allowed. A small explicit set of
verb-to-noun conversions permits the same spelling under nouns. Phrases are
excluded; hyphenated lexical words are allowed. Family coverage is incomplete
where the dictionary has no links or uses templates not handled by the parser.
An empty record means no retained candidates, not proof that no family exists.

GPU use
Blackswan's RTX 3080 Ti Laptop GPU (16 GB) runs gemma3:12b locally to select up
to 12 useful candidates per verb from fixed dictionary lists. A constrained
schema and membership check prevent new words from entering the selection.
Selection does not establish etymology, word sense or actual usage frequency.
Initial qwen3:14b output failed the candidate-membership checks and was rejected.
Raw runs and manifests retain this failure and the successful selection inputs.
Editorial overrides improve selected common verbs and handle known homonyms.
Rare/obsolete-only dictionary parts of speech are filtered. More editorial
review is still needed for obscure words, homonyms and broad family links.
The 12-word limit applies to model selections; sourced editorial corrections
and lexicalized noun conversions may add entries.

Files
inventory.json: exact source inventory, hash and tier scope.
candidates.fr.json: unfiltered dictionary family links before selection.
selection.fr.json and curation/: local-model selections and raw provenance.
editorial_overrides.fr.json: explicit assistant corrections, not human sign-off.
evidence.fr.json: one proof per verb/category/word, revision IDs and source URLs.
unresolved.fr.json: candidates not retained because a suitable POS was absent
or filtered. These are never silently promoted to words in the consumer file.
sources/: original revision snapshots, including dictionary text for auditing.
report.json: counts and empty records. validation.json: completed checks.

Source attribution
Wiktionnaire contributors, French Wiktionnaire (https://fr.wiktionary.org/).
Source revisions are recorded per membership; view a revision using
https://fr.wiktionary.org/w/index.php?oldid=REVISION_ID.
Retain this attribution and evidence when reusing the dataset. Dictionary
material is available under Creative Commons Attribution-ShareAlike 4.0:
https://creativecommons.org/licenses/by-sa/4.0/ . Cached source pages may contain
third-party quotations; caches are research provenance, not app display data.

Reproduce on Blackswan
cd /home/codemonkey/projects/verbsfirst/construction-lab/word-families
python3 -m unittest -v
python3 curate.py
python3 build.py --selected
python3 validate.py

curate.py requires inventory.json and source verb pages (already cached).
build.py without --selected harvests the whole unselected dictionary candidate
set; this is a different output mode. Harvest requests are cached and throttled,
with retry backoff. API failure aborts instead of silently marking words absent.
