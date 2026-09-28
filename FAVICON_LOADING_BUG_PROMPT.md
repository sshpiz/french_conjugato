Please diagnose and fix the app-loading favicon mismatch across the language repos.

Canonical expectation:
- Each repo should use its own correct app icon for:
  - `<link rel="apple-touch-icon" ...>`
  - `<link rel="icon" ...>`
  - `manifest.json`
  - service-worker cached favicon path
  - the built app’s loading/install icon behavior

Repos to inspect:
- /Users/simeon/Desktop/proj1
- /Users/simeon/Desktop/greek-verbs
- /Users/simeon/Desktop/portuguese-verbs
- /Users/simeon/Desktop/russian-verbs
- /Users/simeon/Desktop/catalan-verbs
- /Users/simeon/Desktop/ukrainian-verbs
- /Users/simeon/Desktop/latvian-verbs
- /Users/simeon/Desktop/spanish-verbs

Important scope rules:
- Source files only
- Do not edit `dist/`, `dist-gh/`, generated files, or data files
- Do not push or deploy
- Build only if needed to verify the source fix

What is already localized:
- Ukrainian is definitely wrong:
  - `/Users/simeon/Desktop/ukrainian-verbs/favicon_big.png`
  - is byte-for-byte identical to
  - `/Users/simeon/Desktop/portuguese-verbs/favicon_big.png`
- That is why the Ukrainian app is showing the Portuguese loading icon

Known repo behavior:
- Most repos use `favicon_big.png` directly in:
  - `index.html`
  - `build.py`
  - `sw.js`
- Russian is intentionally different:
  - it uses a versioned published icon path instead of plain `favicon_big.png`
  - do not “normalize” Russian back to the generic pattern unless something is actually broken

Your task:
1. Verify whether any repo besides Ukrainian has the wrong icon asset or wrong icon wiring
2. Fix the source of truth for any affected repo
3. Make sure the repo’s source wiring is internally consistent:
   - `index.html`
   - `manifest.json`
   - `build.py`
   - `sw.js`
   - icon filename conventions
4. If the issue is only Ukrainian, keep the change minimal and clean

Useful checks:
- Compare hashes of `favicon_big.png` files across repos
- Inspect:
  - `index.html`
  - `build.py`
  - `sw.js`
  - `manifest.json`
- Confirm whether any repo is intentionally using a non-generic published icon name

What “fixed” means:
- Ukrainian no longer uses the Portuguese icon asset
- The built Ukrainian app should show the correct Ukrainian icon during load/install
- No accidental icon regressions in the other repos

Deliverables:
- Update only the needed source files/assets
- Report:
  - which repos were checked
  - which repos were actually affected
  - what the root cause was
  - whether a rebuild is needed after the source fix

Do not push or deploy unless explicitly asked.
