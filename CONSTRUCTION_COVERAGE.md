# Reviewed construction coverage — private preview

French: **583 headwords, 596 constructions**.

This is **breadth coverage: at least one selected canonical construction per
headword**, plus retained pilot variants. It is **not** a complete inventory of
all common constructions for each verb. Direct-object frames count as patterns;
verbs without a useful complement can have a bare infinitive reference.

Each displayed construction and English gloss was checked against identified
reference senses and independently reviewed by **gpt-6-sol** and **gpt-6-astra**.
Disagreements were reconciled, and both approvals bind to the exact final record.
Source URLs/hashes and reviewer provenance are in each record's verification
metadata. The full local audit and repeatable integrity checks are in the shared
workspace's `construction-lab/top500/` directory, also copied to blackswan.
Model agreement is not a guarantee of infallibility or a native-speaker audit.

Patterns share the existing Usages/core-pattern records. They remain infinitive
references and do not alter the drill's conjugation answer. The settings toggle,
mobile layout, and light/dark/system appearance are preserved. Constructions
with a restricted meaning in particular tenses are only shown in those tenses.

Known malformed headwords and selected broken conjugations discovered during
review were separately corrected and checked. This does **not** establish a
complete audit of all historical conjugations or all other usage examples.
Recorded conjugation/example audio is now checked against its current text;
stale recordings fall back to browser speech instead of saying the old form.

Validation: `node test_construction_cards.cjs`; shared audit tests in
`construction-lab/top500/`. Private preview only; no production deployment.
