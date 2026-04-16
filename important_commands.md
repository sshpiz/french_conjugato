# Important Commands

## Build the app

```bash
python3 build.py
```

Produces `dist/index.html` (standalone, all assets inlined) + `dist/sw.js`, `dist/manifest.json`, `dist/favicon_big.png`, `dist/CNAME`.
It also refreshes:
- `dist/french/`
- `dist/greek/`
- `dist/portugese/`
- `dist/russian/`
- root standalones like `franconjugue.html`, `greekonjugation.html`, `portoconjugue.html`, `glagoly.html`

## Deploy to lesverb.es (GitHub Pages)

`dist/` is NOT committed to master. The `gh-pages` branch lives in the `dist-gh/` worktree.

```bash
# 1. Build
python3 build.py

# 2. Sync sibling apps + refresh the local gh-pages mirror
./sync_shared_apps.sh

# 3. Copy the rest of the hub files into gh-pages worktree
cp dist/index.html dist-gh/index.html
cp dist/franconjugue.html dist-gh/franconjugue.html
cp dist/sw.js dist-gh/sw.js
cp dist/manifest.json dist-gh/manifest.json

# 4. Commit & push
cd dist-gh
git add -A
git commit -m "deploy"
git push origin gh-pages
cd ..
```

---

## Data pipeline — full regeneration

The pipeline runs in order. Each step patches `js/verbs.full.js` in place.

```bash
# Step 1: Generate raw verb+conjugation data from verbecc + pickle chunks
#         (only needed if starting from scratch — the output is already tracked)
python3 combine_dataset_enhanced.py

# Step 2: Fix frequency tiers to exclusive buckets
python3 fix_frequency_tiers.py

# Step 3: Merge reflexive verb conjugations
python3 append_reflexive.py

# Step 4: Generate contextual hints (requires OPENAI_API_KEY)
export OPENAI_API_KEY=sk-...
python3 generate_verb_hints.py

# Step 5: Apply hand-curated corrections
python3 apply_overrides.py

# Step 6: Compress into gzip+base64 loader
python3 compress_large_js_objects.py js/verbs.full.js
mv js/verbs.full.loader.js js/verbs.full.generated.js

# Step 7: Build
python3 build.py
```

Re-run from step 2 whenever `verbs.full.js` changes.

## Regenerate verb usage nuggets

Requires OpenAI API key. Generates usage/sense data shown on flashcards.

```bash
export OPENAI_API_KEY=sk-...

# All tiers (top20 + top50 + top100 + top500):
python3 generate_verb_usages.py --resume

# Single tier:
python3 generate_verb_usages.py --tier top500 --resume

# Single verb (debug):
python3 generate_verb_usages.py --verb faire
```

Output: `verb_usages.js` (loaded directly by the app).
Progress state: `verb_usages_progress.json` (allows `--resume`).

## Fix individual verb data

Edit `verb_overrides.json`, then:

```bash
python3 apply_overrides.py
python3 compress_large_js_objects.py js/verbs.full.js
mv js/verbs.full.loader.js js/verbs.full.generated.js
python3 build.py
```

---

## Verbs with no English translation (209 total)

Obscure/archaic/regional verbs that couldn't be auto-translated. They are excluded from flashcards but appear in Explorer search.

To fix: edit `js/verbs.full.js` directly (set a `"translation"` value), then:
```bash
python3 compress_large_js_objects.py js/verbs.full.js
mv js/verbs.full.loader.js js/verbs.full.generated.js
python3 build.py
```
