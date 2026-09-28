# SEO Reference Pages

This project now generates static SEO reference pages for verbs across all active language apps.

## What It Generates

- Path pattern: `/reference/{language}/{verb-slug}/index.html`
- One page per verb (from each language's source-of-truth verb dataset)
- Includes SEO head tags (`title`, `description`, `canonical`, `robots`)
- Includes JSON-LD (`DefinedTerm`, `BreadcrumbList`)
- Includes app CTA deep link with stable hash params: `/{language}/#pronoun=...&verb=...&tense=...`
- Includes verb-detail layout matching app detail container (`#verb-detail-container`)
- Includes tappable text via `.tappable-audio` + `data-speak`/`data-audio-id`
- Includes crawlable related verb links between static reference pages
- Includes language hub page per language (`/reference/{language}/`)
- Includes optional usages/examples section (when usage file exists)

## Build Integration

Reference generation runs from the main build:

- [build.py](/Users/simeon/Code/VerbsFirst/proj1/build.py)
- [reference_pages.py](/Users/simeon/Code/VerbsFirst/proj1/reference_pages.py)

Run:

```bash
python3 /Users/simeon/Code/VerbsFirst/proj1/build.py
```

## Source-of-Truth Inputs

Configured in `LANGUAGE_CONFIGS` inside:

- [reference_pages.py](/Users/simeon/Code/VerbsFirst/proj1/reference_pages.py)

Current language inputs:

1. French: verbs `/Users/simeon/Code/VerbsFirst/proj1/js/verbs.full.js`, usages `/Users/simeon/Code/VerbsFirst/proj1/verb_usages.js`
2. Greek: verbs `/Users/simeon/Code/VerbsFirst/greek-verbs/greek_v1.verbs.full.js`, usages `/Users/simeon/Code/VerbsFirst/greek-verbs/greek_v1_usages.js` (fallback: `verb_usages.js`)
3. Portuguese: verbs `/Users/simeon/Code/VerbsFirst/portuguese-verbs/js/verbs.full.js`, usages `/Users/simeon/Code/VerbsFirst/portuguese-verbs/verb_usages.js`
4. Russian: verbs `/Users/simeon/Code/VerbsFirst/russian-verbs/js/verbs.full.js`, usages `/Users/simeon/Code/VerbsFirst/russian-verbs/verb_usages.js`
5. Catalan: verbs `/Users/simeon/Code/VerbsFirst/catalan-verbs/js/verbs.full.js`, usages `/Users/simeon/Code/VerbsFirst/catalan-verbs/verb_usages.js`

Tense labels and pronoun mappings are read from each app's `index.html` (`window.<lang>TenseKeyToLabel`, `window.<lang>PronounMapping`).

## Output + Sitemap

- Pages are emitted into `/Users/simeon/Code/VerbsFirst/proj1/dist/reference/...`
- Sitemap is regenerated at `/Users/simeon/Code/VerbsFirst/proj1/dist/sitemap.xml`
- Reference generation stores a manifest at `/Users/simeon/Code/VerbsFirst/proj1/dist/reference/.seo_reference_manifest.json` to preserve page-level `lastmod` for unchanged URLs

The sitemap includes app roots and every generated reference page.

## Fast Iteration Mode

To generate only the first `N` verbs per language during testing:

```bash
SEO_REFERENCE_LIMIT=25 python3 /Users/simeon/Code/VerbsFirst/proj1/build.py
```

Do not use this limit for production builds.

## How To Add Another Language

1. Add the language entry in `LANGUAGE_CONFIGS` in `reference_pages.py`.
2. Provide `source_js`, `index_html`, `usage_js_candidates` (optional), `reference_slug`, `app_path`, `speech_lang`, `tense_order`.
3. Ensure the app is synced in `SIBLING_APPS` in `build.py` if it should be published from this repo.
4. Run build and validate one generated page, CTA deep link behavior (`pronoun+verb+tense`), and sitemap entry.

## Notes

- Slugs are Unicode-safe and uniqueness-protected per language (`foo`, `foo-2`, ...).
- Tappable audio on reference pages currently uses browser speech synthesis (language-specific voice when available).
- Existing app packaged TTS is not required for reference pages to function.
- Root `robots.txt` and `llms.txt` are copied by `build.py` into `/dist` for publish-time discovery.
