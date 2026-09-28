Please update the Ukrainian app to use a versioned published icon filename so favicon / splash / install icon changes reliably break cache.

Target repo:
- /Users/simeon/Desktop/ukrainian-verbs

Important scope rules:
- Source files only
- Do not edit `dist/`, `dist-gh/`, generated files, or data files directly
- Do not push or deploy unless explicitly asked
- Build at the end to verify the new published icon path is present in `dist`

Why this is needed:
- The Ukrainian app currently publishes `favicon_big.png`
- Even after replacing the image, phones can keep showing the old icon because browser / manifest / Home Screen caches are very sticky
- We want the same cache-busting strategy Russian already uses: a versioned published icon filename

Reference implementation:
- /Users/simeon/Desktop/russian-verbs

What to do:
1. Keep the source-of-truth artwork as:
   - `/Users/simeon/Desktop/ukrainian-verbs/favicon_big.png`
2. Introduce a versioned published icon filename, for example:
   - `favicon_ukrainian_20260418.png`
   - or another clean date/versioned name
3. Update Ukrainian source wiring so the published app points to that versioned filename consistently in:
   - `index.html`
     - `<link rel="apple-touch-icon" ...>`
     - `<link rel="icon" ...>`
   - `manifest.json`
   - `sw.js`
   - `build.py`
4. Make sure `build.py` copies the versioned published filename into `dist`
5. If needed, remove/avoid stale generic `favicon_big.png` from `dist` so it doesn’t keep being used accidentally

What “fixed” means:
- The built Ukrainian app in `dist/` should reference the versioned icon filename everywhere relevant
- `sw.js` should precache/serve the versioned icon path, not the old generic one
- `manifest.json` should point at the versioned icon path
- `index.html` should point at the versioned icon path
- The new version should be ready for deploy so phones are much more likely to pick up the changed icon

Files likely involved:
- /Users/simeon/Desktop/ukrainian-verbs/index.html
- /Users/simeon/Desktop/ukrainian-verbs/manifest.json
- /Users/simeon/Desktop/ukrainian-verbs/sw.js
- /Users/simeon/Desktop/ukrainian-verbs/build.py

Deliverables:
- Make the source changes
- Run the Ukrainian build
- Report:
  - chosen published icon filename
  - which files were updated
  - whether the old generic icon path is still referenced anywhere in the built output

Do not push or deploy unless explicitly asked.
