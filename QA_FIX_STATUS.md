## VF-QA-0001

Status: Fixed
Owner: Dev Agent
Started: 2026-05-04
Updated: 2026-05-04
Commit(s): proj1 c14ed1b7b, greek-verbs 0d3a01bf0, portuguese-verbs ccb495e18, russian-verbs 63e74e094, spanish-verbs 4f1414bd7, catalan-verbs 298b72f5e, ukrainian-verbs 86482b895, latvian-verbs 8fe357e1c, german-verbs 03b3b94d5, italian-verbs 3f77e37ec

### Summary

Fixed the first controlled mobile-launch service-worker gap by making each language app pre-cache its app-shell `index.html` during install and by returning an app-owned fallback shell for navigation failures instead of the generic 503 text response.

### Files Changed

- /Users/simeon/Code/VerbsFirst/proj1/sw.js
- /Users/simeon/Code/VerbsFirst/greek-verbs/sw.js
- /Users/simeon/Code/VerbsFirst/portuguese-verbs/sw.js
- /Users/simeon/Code/VerbsFirst/russian-verbs/sw.js
- /Users/simeon/Code/VerbsFirst/russian-verbs/dist/sw.js
- /Users/simeon/Code/VerbsFirst/spanish-verbs/sw.js
- /Users/simeon/Code/VerbsFirst/catalan-verbs/sw.js
- /Users/simeon/Code/VerbsFirst/catalan-verbs/dist/sw.js
- /Users/simeon/Code/VerbsFirst/ukrainian-verbs/sw.js
- /Users/simeon/Code/VerbsFirst/ukrainian-verbs/dist/sw.js
- /Users/simeon/Code/VerbsFirst/latvian-verbs/sw.js
- /Users/simeon/Code/VerbsFirst/latvian-verbs/dist/sw.js
- /Users/simeon/Code/VerbsFirst/german-verbs/sw.js
- /Users/simeon/Code/VerbsFirst/italian-verbs/sw.js

### Root Cause Confirmed

Confirmed. The app service workers cached only small essentials during install and warmed `index.html` later after `navigator.serviceWorker.ready`. A controlled navigation with no warmed shell could therefore fall through to a generic 503 response if network fetch failed. QA's hypothesis was correct for controlled first-launch/retry/update paths, though a browser-level failure before the first HTML document reaches the device cannot be fixed by a service worker.

### Fix Details

Bumped each language service-worker cache version, added `INDEX_PATH` to install-time pre-cache via a no-store fetch, kept the existing warm-index message path, and added a small VerbsFirst HTML fallback for navigation requests when neither network nor cached shell is available.

### Verification Run

- `node --check sw.js`
- `node --check` for all sibling `sw.js` files
- `python3 /Users/simeon/Code/VerbsFirst/greek-verbs/build.py`
- `python3 /Users/simeon/Code/VerbsFirst/portuguese-verbs/build.py`
- `python3 /Users/simeon/Code/VerbsFirst/russian-verbs/build.py`
- `python3 /Users/simeon/Code/VerbsFirst/spanish-verbs/build.py`
- `python3 /Users/simeon/Code/VerbsFirst/catalan-verbs/build.py`
- `python3 /Users/simeon/Code/VerbsFirst/ukrainian-verbs/build.py`
- `python3 /Users/simeon/Code/VerbsFirst/latvian-verbs/build.py`
- `python3 /Users/simeon/Code/VerbsFirst/german-verbs/build.py`
- `python3 /Users/simeon/Code/VerbsFirst/italian-verbs/build.py`
- `python3 /Users/simeon/Code/VerbsFirst/proj1/build.py`
- Served `/Users/simeon/Code/VerbsFirst/proj1/dist` at `http://127.0.0.1:8876/`.
- Browser-use attempted but unavailable: no Codex IAB backend was discovered.
- Headless Chrome fallback verified fresh local loads for `http://127.0.0.1:8876/french/`, `/spanish/`, `/russian/`, and `/greek/`; each `__sw-log` showed `pre-cached /<app>/index.html` during install.
- Headless Chrome fallback verified offline controlled navigation after first load for French and Spanish returned HTTP 200 app UI rather than a browser/network error.
- `curl` confirmed built local service workers for French, Spanish, and Russian contain the new cache versions, `PRECACHE_URLS`, and `FALLBACK-SHELL` path.

### Remaining Risk

This cannot prevent a true network/browser failure before the very first HTML document is received, because no service worker exists yet for that origin. Live Chrome Android and Cloudflare cache-header behavior still need post-deploy validation. Local build scripts produced existing Pillow-missing warnings; no deploy was performed.
