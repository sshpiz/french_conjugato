Please investigate **French phonetic / IPA generation for answer scoring**.

Important:
- research/prototype only
- source files only if you need to add a small prototype script
- do not touch `dist/`, `dist-gh/`, or generated files
- do not push or deploy unless explicitly asked
- respond in English

## Context

Repo:
- `/Users/simeon/Desktop/proj1`

Problem:
- We want a way to decide whether two French answer strings are likely to **sound the same** or nearly the same.
- This is for short conjugation answers, not free-form prose.
- Main motivating examples:
  - `elle reste` vs `elles restent`
  - `il parlait` vs `ils parlaient`
- But the system should not be hardcoded only to those exact pairs.

We are **not** looking for semantic similarity.
We are looking for **pronunciation / phonetic equivalence** that could later help score STT output against expected conjugation answers.

## Goal

Find the best practical way to generate phonetic/IPA-like representations for French short answers such as:
- `je parle`
- `elle reste`
- `elles restent`
- `ils vont`
- `elle va`

And determine how useful that is for deciding:
- “these sound the same”
- “these do not sound the same”

## What to investigate

Please compare practical options such as:
- `phonemizer`
- `gruut`
- `epitran`
- any other serious Python option you find locally reasonable

We care most about:
1. French support quality
2. ease of setup
3. whether it can work on **phrases**, not just lemmas
4. whether output is stable enough for short-answer comparisons
5. whether it can distinguish useful cases like:
   - `elles restent` vs `elle reste` -> probably same or very close
   - `elles vont` vs `elle va` -> different
   - `ils prennent` vs `il prend` -> likely different enough

## Deliverables

Please provide:

1. A short recommendation:
   - which package/tool looks best for this use case
   - why

2. A small prototype, preferably as a standalone script inside `proj1`, for example:
   - `/Users/simeon/Desktop/proj1/_experiments/french_phonetic_probe.py`

3. The prototype should:
   - take a small built-in list of French answer phrases
   - generate phonetic/IPA-like outputs
   - print them clearly
   - print a few pairwise comparisons

4. Include at least these test pairs:
   - `elle reste` / `elles restent`
   - `il parlait` / `ils parlaient`
   - `elle finit` / `elles finissent`
   - `elle va` / `elles vont`
   - `il prend` / `ils prennent`
   - `elle est` / `elles sont`

5. Explain:
   - whether the chosen tool seems good enough for later app-side scoring
   - whether we should compare exact phonetic strings, or use a softer distance metric

## Constraints

- Do not wire this into the app yet
- Do not build UI
- Do not deploy anything
- Keep it as a research/prototype pass

## Nice to have

If useful, propose a simple future scoring rule such as:
- exact phonetic match
- normalized phonetic edit distance
- candidate ranking by phonetic closeness

But keep the main focus on:
- **how to generate the phonetic data reliably**
