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

### Latest Deploy Blocker

- 2026-05-19 18:28:25 CDT
- Candidate commit: `c14ed1b7b` (intended latest channel(s): `french`, `spanish`, `german`, `portugese`, `italian`, `greek`, `catalan`, `latvian`, `russian`, `ukrainian`)
- Blocker: `git -C /Users/simeon/Code/VerbsFirst/proj1 status --short` shows extensive modified + untracked files in `proj1/`, so a rebuild + deploy could accidentally ship unrelated local work.
- Next step: stash/commit/clean the `proj1/` working tree (and ensure sibling app repos are on their recorded fix commits and rebuilt), then rerun the latest deploy gate to verify + deploy latest-only via `LATEST_CHANNEL_LANGS="french spanish german portugese italian greek catalan latvian russian ukrainian" LATEST_ONLY=1 zsh /Users/simeon/Code/VerbsFirst/proj1/deploy_cloudflare_latest.sh`.

### Latest Deploy

- 2026-05-20 09:37 CDT
- Candidate commit: `c14ed1b7b`
- Latest channel(s): `french`, `spanish`, `german`, `portugese`, `italian`, `greek`, `catalan`, `latvian`, `russian`, `ukrainian`
- Verification run (production):
  - `curl -fsS https://verbsfirst.com/<lang>_latest/sw.js | rg -n "PRECACHE_URLS = \\[INDEX_PATH" && rg -n "const FALLBACK_HTML"`
- Command used: N/A (already live on production)
- Result: Each listed `<lang>_latest` service worker contains the install-time `index.html` pre-cache and navigation fallback HTML, so the VF-QA-0001 fix is already present on `_latest`.

## VF-QA-0002

Status: Fixed
Owner: Dev Agent
Started: 2026-05-04
Updated: 2026-05-04
Commit(s): proj1 90588e059, spanish-verbs 291a31b

### Summary

Fixed the mobile settings jump when Fill Blanks difficulty changes by keeping difficulty taps in place instead of rebuilding the settings panel.

### Files Changed

- /Users/simeon/Code/VerbsFirst/proj1/js/script.js
- /Users/simeon/Code/VerbsFirst/spanish-verbs/js/script.js

### Root Cause Confirmed

Confirmed. The Fill Blanks difficulty handlers were treating a single segmented-control change as a full settings repopulation, then trying to restore scroll from the top of the whole Fill Blanks section. On a mobile viewport, that section-level anchor was too coarse and the touched row moved when adjacent summaries/details were rebuilt.

### Fix Details

Changed the French and Spanish difficulty handlers to update the active pill, persist `fillDifficultyMode`, refresh counts, and refresh settings summaries/layout in place without calling `populateOptions()`. Added a small row-level scroll-preservation helper for narrow settings updates, plus optional selector-based anchor preservation for related Fill Blanks controls that still need a repopulation.

### Verification Run

- `node --check /Users/simeon/Code/VerbsFirst/proj1/js/script.js`
- `node --check /Users/simeon/Code/VerbsFirst/spanish-verbs/js/script.js`
- `git -C /Users/simeon/Code/VerbsFirst/proj1 diff --check`
- `git -C /Users/simeon/Code/VerbsFirst/spanish-verbs diff --check`
- `python3 /Users/simeon/Code/VerbsFirst/spanish-verbs/build.py`
- `python3 /Users/simeon/Code/VerbsFirst/proj1/build.py`
- Served `/Users/simeon/Code/VerbsFirst/proj1/dist` at `http://127.0.0.1:8877/`.
- Browser-use attempted but unavailable: no Codex IAB backend was discovered.
- Headless Chrome/Playwright mobile viewport 390x844 verified French and Spanish Fill Blanks difficulty toggles for Easy, Medium, and Hard. The difficulty row stayed fixed at 0px top delta, active pills updated, summaries updated, and the service-worker-enabled run had no console warnings.

### Remaining Risk

Not yet checked on a physical phone or live production after deploy. Existing service-worker/cache state may require normal refresh/update behavior before users see the rebuilt app.

### Latest Deploy Blocker

- Date: 2026-05-19 18:38 CDT
- Commit: `90588e059` (proj1)
- Intended latest channels: `french`, `spanish`
- Blocker: `proj1` working tree is dirty (modified + untracked files), so verification/deploy could ship unrelated WIP.
- Next step: stash/commit/clean `proj1`, then rerun latest-only deploy for these channels.
- Intended command: `LATEST_CHANNEL_LANGS="french spanish" LATEST_ONLY=1 zsh /Users/simeon/Code/VerbsFirst/proj1/deploy_cloudflare_latest.sh`

### Latest Deploy

- 2026-05-20 10:55 CDT
- Candidate commit: `90588e059`
- Latest channel(s): `french`, `spanish`
- Verification run (production):
  - `curl -fsS https://verbsfirst.com/french_latest/js/script.js | rg -n "preserveElementViewportPosition|settingsRowKey|preserveAnchorSelector"`
  - `curl -fsS https://verbsfirst.com/spanish_latest/ | rg -n "preserveElementViewportPosition|settingsRowKey|preserveAnchorSelector"`
- Command used: N/A (already live on production)
- Result: Both French and Spanish `_latest` include the settings difficulty scroll-preservation fix, so the VF-QA-0002 fix is already present on `_latest`.

## VF-QA-0003

Status: Fixed
Owner: Dev Agent
Started: 2026-05-04
Updated: 2026-05-04
Commit(s): spanish-verbs 44a144c

### Summary

Fixed Spanish verb detail pronoun/conjugation overlap by stacking long compound pronouns and giving the pronoun slot a stable wrapping layout.

### Files Changed

- /Users/simeon/Code/VerbsFirst/spanish-verbs/js/script.js
- /Users/simeon/Code/VerbsFirst/spanish-verbs/css/style.css

### Root Cause Confirmed

Confirmed. The Spanish detail rows used a fixed 75px pronoun span in a flex row, while labels like `él/ella/usted` and `ellos/ellas/ustedes` were rendered as single unwrapped strings. The text overflowed that fixed slot and drew into the following conjugation span.

### Fix Details

Split the long Spanish detail pronoun labels into stacked display lines while preserving the original lookup and audio keys. Updated the detail-row CSS to match the existing safer sibling-app pattern: flex-start alignment, a stable 104px pronoun column, wrapping safeguards, stacked-line styling, and row height that accommodates two-line pronouns.

### Verification Run

- `node --check /Users/simeon/Code/VerbsFirst/spanish-verbs/js/script.js`
- `git -C /Users/simeon/Code/VerbsFirst/spanish-verbs diff --check`
- `python3 /Users/simeon/Code/VerbsFirst/spanish-verbs/build.py`
- `python3 /Users/simeon/Code/VerbsFirst/proj1/build.py`
- Served `/Users/simeon/Code/VerbsFirst/proj1/dist` at `http://127.0.0.1:8877/`.
- Headless Chrome/Playwright verified Spanish `dar` and `hablar` detail views at 390x844, 320x720, and 844x390. All 48 conjugation rows per verb had no pronoun/conjugation overlap, long `usted` rows rendered as two lines, audio data attributes remained present, and no console warnings/errors appeared.

### Remaining Risk

Not yet checked on a physical phone or live production after deploy. Other language apps with long slash-delimited detail pronouns were not changed in this bug-specific fix.

### Latest Deploy Blocker

- Date: 2026-05-19 19:39 CDT
- Commit: `44a144c` (spanish-verbs)
- Intended latest channels: `spanish`
- Blocker: required preflight `git -C /Users/simeon/Code/VerbsFirst/proj1 rev-parse --verify 44a144c^{commit}` failed, so this commit hash is not present in the `proj1` repo history and the deploy gate cannot verify/rebuild/deploy it.
- Next step: record a corresponding `proj1` commit hash for the Spanish app wiring (or update the deploy gate rules to verify app commits in their own repos), then rerun; also ensure `proj1/` working tree is clean before any rebuild/deploy.

### Latest Deploy Blocker

- Date: 2026-09-29 01:42 UTC
- Candidate commit: `44a144c` (intended latest channel: `spanish`)
- Gate recheck: required `proj1` preflight `git rev-parse --verify 44a144c^{commit}` still fails (`Needed a single revision`), so no verification or deployment was run.
- Next step: record a deployable `proj1` commit for the Spanish fix before rerunning the latest-only gate.

### Latest Deploy Blocker

- Date: 2026-09-30 09:22 UTC
- Candidate commit: `44a144c` (intended latest channel: `spanish`)
- Gate recheck: required `git -C /Users/simeon/Code/VerbsFirst/proj1 rev-parse --verify 44a144c^{commit}` fails with `Needed a single revision`; no verification, rebuild, or deployment was run.
- Next step: record a deployable `proj1` commit that contains the Spanish fix, then rerun the latest-only gate.

## VF-QA-0004

Status: Fixed
Owner: Dev Agent
Started: 2026-05-04
Updated: 2026-05-04
Commit(s): proj1 cdcd666ad, spanish-verbs 2a185dc, german-verbs bc9acd6

### Summary

Fixed revealed Fill Blanks answer clipping by giving frame answer capsules enough vertical text room for descenders while preserving hidden blank behavior.

### Files Changed

- /Users/simeon/Code/VerbsFirst/proj1/css/style.css
- /Users/simeon/Code/VerbsFirst/spanish-verbs/css/style.css
- /Users/simeon/Code/VerbsFirst/german-verbs/css/style.css

### Root Cause Confirmed

Confirmed. The frame-slot answer layers used `line-height: 1` inside a fixed `1.02em` verb capsule with `overflow: hidden`. Revealed answers were absolutely positioned into that tight box, leaving too little vertical room for descenders like the `g` in `grave`.

### Fix Details

Updated the shared newer frame-slot CSS in French, Spanish, and German to use a taller line-height, border-box answer layers with small vertical padding, and `auto` capsule height with explicit minimum heights for verb and particle slots. Hidden blanks still keep the answer transparent and the marker visible.

### Verification Run

- `git -C /Users/simeon/Code/VerbsFirst/proj1 diff --check`
- `git -C /Users/simeon/Code/VerbsFirst/spanish-verbs diff --check`
- `git -C /Users/simeon/Code/VerbsFirst/german-verbs diff --check`
- `python3 /Users/simeon/Code/VerbsFirst/spanish-verbs/build.py`
- `python3 /Users/simeon/Code/VerbsFirst/german-verbs/build.py`
- `python3 /Users/simeon/Code/VerbsFirst/proj1/build.py`
- Served `/Users/simeon/Code/VerbsFirst/proj1/dist` at `http://127.0.0.1:8878/`.
- Browser-use attempted but unavailable: no Codex IAB backend was discovered.
- Headless Chrome/Playwright mobile viewport 390x844 verified French, Spanish, and German frame-slot rendering in light and dark themes. Revealed `grave`, `paye`, `mange`, `joue`, `queue`, and particle `y` had positive top/bottom room and no clipping; hidden verb and particle slots still concealed the answer.

### Remaining Risk

Not yet checked on a physical phone or live production after deploy. German still logs an existing unrelated startup warning for the hard-coded `parler` fallback; it was ignored for this frame-slot verification because the revealed-slot checks passed after app load.

### Latest Deploy Blocker

- 2026-05-19 18:50:00 CDT
- Candidate commit: `cdcd666ad` (intended latest channel(s): `french`, `spanish`, `german`)
- Blocker: `git -C /Users/simeon/Code/VerbsFirst/proj1 status --short` shows extensive modified + untracked files in `proj1/`, so a rebuild + deploy could accidentally ship unrelated local work.
- Next step: stash/commit/clean the working tree (or move the WIP to another branch), then rerun the latest deploy gate to verify + deploy latest-only via `LATEST_CHANNEL_LANGS="french spanish german" LATEST_ONLY=1 zsh /Users/simeon/Code/VerbsFirst/proj1/deploy_cloudflare_latest.sh`.

### Latest Deploy

- 2026-05-20 11:16 CDT
- Candidate commit: `cdcd666ad` (proj1)
- Latest channel(s): `french`, `spanish`, `german`
- Verification run (production):
  - `curl -fsS https://verbsfirst.com/french_latest/ | rg -n "padding-block:\\s*0\\.06em\\s+0\\.12em|min-height:\\s*1\\.32em|min-height:\\s*1\\.16em|line-height:\\s*1\\.18" | head`
  - `curl -fsS https://verbsfirst.com/spanish_latest/ | rg -n "padding-block:\\s*0\\.06em\\s+0\\.12em|min-height:\\s*1\\.32em|min-height:\\s*1\\.16em|line-height:\\s*1\\.18" | head`
  - `curl -fsS https://verbsfirst.com/german_latest/ | rg -n "padding-block:\\s*0\\.06em\\s+0\\.12em|min-height:\\s*1\\.32em|min-height:\\s*1\\.16em|line-height:\\s*1\\.18" | head`
- Command used: N/A (already live on production)
- Result: All three `_latest` pages include the frame-slot line-height/padding/min-height CSS fix, so VF-QA-0004 is already present on `_latest`.

## VF-QA-0005

Status: Fixed
Owner: Dev Agent
Started: 2026-05-05
Updated: 2026-05-05
Commit(s): portuguese-verbs a327954a7

### Summary

Fixed Portuguese Fill Blanks English sentence contrast in dark themes by giving frame-card translation text the same high-contrast treatment used by the newer French frame prompt styling.

### Files Changed

- /Users/simeon/Code/VerbsFirst/portuguese-verbs/css/style.css
- /Users/simeon/Code/VerbsFirst/portuguese-verbs/js/script.js

### Root Cause Confirmed

Confirmed. Portuguese still forced `#english-verb-phrase` to a dark `#263040 !important` in OS dark mode, and explicit app Dark mode did not have a readable `#english-verb-phrase` override. Frame cards also did not tag their English sentence with a frame-specific class, so they could not receive the stronger translation prompt styling.

### Fix Details

Updated the Portuguese English phrase CSS to use readable light/dark colors, added explicit `html[data-theme="dark"]` overrides, and tagged Fill Blanks frame-card English translations with `frame-translation-prompt` while removing that class for non-frame cards.

### Verification Run

- `node --check /Users/simeon/Code/VerbsFirst/portuguese-verbs/js/script.js`
- `git -C /Users/simeon/Code/VerbsFirst/portuguese-verbs diff --check`
- `python3 /Users/simeon/Code/VerbsFirst/portuguese-verbs/build.py`
- `python3 /Users/simeon/Code/VerbsFirst/proj1/build.py`
- `rg` confirmed rebuilt `/Users/simeon/Code/VerbsFirst/proj1/dist/portugese/index.html` contains the new frame translation prompt class wiring and dark-mode color rules.
- Browser-use attempted but unavailable: no Codex IAB backend was discovered.
- Headless Chrome/Playwright mobile viewport 390x844 served `/Users/simeon/Code/VerbsFirst/proj1/dist` at `http://127.0.0.1:8879/` and verified the exact reported Portuguese Fill Blanks card, `pensar` / `I think about simpler solutions.`, in explicit Dark and System-dark. In both cases the English sentence was visible, carried `frame-translation-prompt`, rendered as `rgb(242, 247, 255)`, and had an approximate 17.02:1 contrast against the dark card background. No app console errors were observed; Playwright produced expected service-worker-blocked/font-preload warnings.

### Remaining Risk

Not yet checked on a physical phone or live production after deploy. Existing service-worker/cache state may require normal refresh/update behavior before users see the rebuilt Portuguese app.

### Latest Deploy Blocker

- 2026-05-19 19:31 CDT
- Candidate commit: `a327954a7` (listed under `portuguese-verbs`)
- Blocker: required preflight `git -C /Users/simeon/Code/VerbsFirst/proj1 rev-parse --verify a327954a7^{commit}` failed, so this commit hash is not present in the `proj1` repo history and cannot be used as the deploy gate’s provenance for a `proj1/`-based latest build/deploy.
- Unblock: record the corresponding `proj1` commit hash that incorporates the Portuguese fix (or land the fix into `proj1` in a traceable way), then rerun the latest deploy gate. If a `proj1` commit exists already, update `Commit(s):` to include `proj1 <hash>`.

## VF-QA-0006

Status: Fixed
Owner: Dev Agent
Started: 2026-05-05
Updated: 2026-05-05
Commit(s): spanish-verbs 8e14cae, proj1 05aa2970b

### Summary

Reduced the Spanish first-load Chrome `ERR_FAILED` failure mode by keeping deployed service workers out of the browser HTTP cache and making app service-worker navigations fall back to app-owned HTML even if an unexpected cache/runtime error occurs.

### Files Changed

- /Users/simeon/Code/VerbsFirst/spanish-verbs/sw.js
- /Users/simeon/Code/VerbsFirst/proj1/sw.js
- /Users/simeon/Code/VerbsFirst/proj1/build.py
- /Users/simeon/Code/VerbsFirst/proj1/_headers

### Root Cause Confirmed

Partially confirmed. Live production checks showed `/spanish/` and `/french/` returning HTTP 200, but `/spanish/sw.js` was still served as ordinary JavaScript with `Cache-Control: public, max-age=14400, must-revalidate`. That leaves a stale or previously broken worker cached for up to four hours after a deploy. The existing worker handled normal navigation fetch failures after it controlled the page, but an unhandled cache/runtime exception inside `respondWith()` could still reject the navigation and surface Chrome's native `ERR_FAILED` page.

### Fix Details

Added a Cloudflare Pages `_headers` file that sets `Cache-Control: no-cache, no-store, must-revalidate` for the root and language service-worker files, and updated the site build to copy that file into `dist/` for deploys. Bumped the Spanish and French service-worker cache versions and wrapped their fetch handlers with a last-resort navigation fallback that returns the existing app-owned loading shell instead of allowing an unhandled worker error to reject the browser navigation.

### Verification Run

- `curl -L --compressed -I https://verbsfirst.com/spanish/`
- `curl -L --compressed -I https://verbsfirst.com/spanish`
- `curl -L --compressed -I https://verbsfirst.com/spanish/index.html`
- `curl -L --compressed -I https://verbsfirst.com/spanish/sw.js`
- `curl -L --compressed -I https://verbsfirst.com/french/`
- `node --check /Users/simeon/Code/VerbsFirst/spanish-verbs/sw.js`
- `node --check /Users/simeon/Code/VerbsFirst/proj1/sw.js`
- `python3 /Users/simeon/Code/VerbsFirst/spanish-verbs/build.py`
- `python3 /Users/simeon/Code/VerbsFirst/proj1/build.py`
- `git -C /Users/simeon/Code/VerbsFirst/spanish-verbs diff --check -- sw.js`
- `git -C /Users/simeon/Code/VerbsFirst/proj1 diff --check -- sw.js build.py _headers QA_FIX_STATUS.md`
- `rg` confirmed rebuilt `/Users/simeon/Code/VerbsFirst/proj1/dist/spanish/sw.js`, `/Users/simeon/Code/VerbsFirst/proj1/dist/french/sw.js`, and `/Users/simeon/Code/VerbsFirst/proj1/dist/_headers` contain the new fallback and no-store service-worker rules.
- Served `/Users/simeon/Code/VerbsFirst/proj1/dist` at `http://127.0.0.1:8880/`.
- Browser-use/in-app browser tooling was unavailable in this session; headless Chrome/Playwright mobile viewport 390x844 verified fresh-context loads of `/spanish/`, `/french/`, and `/german/` all reached app UI, had no Chrome error text, and registered service workers. German logged the existing unrelated `Verb not found: parler` warning.
- A Node VM service-worker resilience check forced cache and network failures inside the Spanish and French workers; both navigation handlers returned status 200 `text/html` fallback shells containing `Loading the app`.

### Remaining Risk

This still cannot prevent a true network/browser/CDN failure before Chrome receives the first HTML document, because no service worker or app code can run before that response exists. The Cloudflare header fix must be deployed before live `/spanish/sw.js` stops showing the old four-hour browser cache header. Physical Chrome Android first-open verification was not run in this local pass.

### Latest Deploy Blocker

- 2026-05-19 18:59 CDT
- Candidate fix commit(s): `proj1 05aa2970b`, `spanish-verbs 8e14cae`
- Intended latest channel(s): `spanish french`
- Blocker: `proj1/` working tree is very dirty (many modified + untracked files). Latest deploy builds from `proj1/`, so deploying now risks shipping unrelated WIP.
- Unblock: stash/commit/clean unrelated `proj1/` changes until `git -C /Users/simeon/Code/VerbsFirst/proj1 status --short` is clean, then rerun the latest deploy gate.

### Latest Deploy

- 2026-05-20 11:45 CDT
- Candidate commit: `05aa2970b` (proj1)
- Latest channel(s): `spanish`, `french`
- Verification run (production):
  - `curl -fsSL -I https://verbsfirst.com/spanish_latest/sw.js | rg -ni '^cache-control:.*no-store'`
  - `curl -fsSL https://verbsfirst.com/spanish_latest/sw.js | rg -n "FALLBACK_HTML|Loading the app|CACHE_NAME" | head`
  - `curl -fsSL -I https://verbsfirst.com/french_latest/sw.js | rg -ni '^cache-control:.*no-store'`
  - `curl -fsSL https://verbsfirst.com/french_latest/sw.js | rg -n "FALLBACK_HTML|Loading the app|CACHE_NAME" | head`
  - Repeated the same checks for `https://verbsfirst.com/spanish/sw.js` and `https://verbsfirst.com/french/sw.js`.
- Command used: N/A (already live on production)
- Result: Both stable and `_latest` service workers are served with `Cache-Control: no-cache, no-store, must-revalidate` and include the navigation fallback shell (`Loading the app...`), indicating VF-QA-0006 is already present.

## VF-QA-0007

Status: Fixed
Owner: Dev Agent
Started: 2026-05-06
Updated: 2026-05-06
Commit(s): spanish-verbs 2bb2397

### Summary

Fixed the Spanish fallback install modal so it stays readable in system dark mode, explicit Dark mode, and explicit Light mode. Also normalized the Spanish regular manifest identity to match the deployed `/spanish/` app path.

### Files Changed

- /Users/simeon/Code/VerbsFirst/spanish-verbs/css/style.css
- /Users/simeon/Code/VerbsFirst/spanish-verbs/manifest.json

### Root Cause Confirmed

Confirmed. The install modal panel had a light fallback background while inheriting global text variables, and the dark modal override only applied when `html[data-theme="dark"]` was present. In system dark mode there is no `data-theme` attribute, so the fallback install instructions could render with unreadable modal colors.

### Fix Details

Gave the install modal panel, title, body copy, steps, note, and close button explicit high-contrast light colors. Added matching dark modal colors for explicit app Dark mode and for system dark mode via `@media (prefers-color-scheme: dark)` scoped to `html:not([data-theme])`, leaving explicit Light mode in control. Updated `spanish-verbs/manifest.json` from `"id": "./"` to `"id": "/spanish/"`; the latest-channel manifest generator continues to set `/spanish_latest/`.

### Verification Run

- `git -C /Users/simeon/Code/VerbsFirst/spanish-verbs diff --check -- css/style.css manifest.json`
- `python3 /Users/simeon/Code/VerbsFirst/spanish-verbs/build.py`
- `python3 /Users/simeon/Code/VerbsFirst/proj1/build.py`
- `env LATEST_CHANNEL_TARGETS_ONLY=/Users/simeon/Code/VerbsFirst/proj1/dist python3 /Users/simeon/Code/VerbsFirst/proj1/sync_latest_channels.py`
- `rg -n '"id"' /Users/simeon/Code/VerbsFirst/spanish-verbs/dist/manifest.json /Users/simeon/Code/VerbsFirst/proj1/dist/spanish/manifest.json /Users/simeon/Code/VerbsFirst/proj1/dist/spanish_latest/manifest.json`
- Served `/Users/simeon/Code/VerbsFirst/proj1/dist` at `http://127.0.0.1:4177/`.
- Headless Chrome/CDP mobile viewport 390x844 verified `/spanish/` and `/spanish_latest/` in system dark, forced Light, and forced Dark. The modal rendered dark in system dark without a `data-theme` attribute, explicit Light stayed light, and the lowest measured modal text contrast was 6.37:1; system dark measured 7.26:1 minimum.

### Remaining Risk

Not yet checked on a physical Android device or live production after deploy. Direct install availability still depends on Chrome's `beforeinstallprompt` rules; this local pass verified the reported fallback modal and manifest ids, but did not prove that Android will choose the direct install path in every eligible state.

### Latest Deploy Blocker

- Date: 2026-05-19 19:21 CDT
- Candidate commit: `2bb2397` (spanish-verbs; intended latest channel(s): `spanish`)
- Blocker: required preflight `git -C /Users/simeon/Code/VerbsFirst/proj1 rev-parse --verify 2bb2397^{commit}` fails, so this commit hash is not present in the `proj1` git history and the deploy gate cannot verify/build from it as currently specified.
- Next step: record a corresponding `proj1` commit hash (if one exists) for the Spanish deploy wiring, or update the deploy gate rules to verify app commits in their own repos (e.g., `/Users/simeon/Code/VerbsFirst/spanish-verbs`) before running `LATEST_CHANNEL_LANGS=spanish LATEST_ONLY=1 zsh /Users/simeon/Code/VerbsFirst/proj1/deploy_cloudflare_latest.sh`.

## VF-QA-0008

Status: Fixed
Owner: Dev Agent
Started: 2026-05-06
Updated: 2026-05-06
Commit(s): proj1 19e196677

### Summary

Verified the French latest `s'en prendre à plus faible que soi` expression now agrees the final `que soi` tail to the subject's tonic pronoun across the reported simple and compound tenses. No new code change was needed because the source and generated data were already fixed locally in `19e196677`.

### Files Changed

- /Users/simeon/Code/VerbsFirst/proj1/generate_french_verb_expressions.py
- /Users/simeon/Code/VerbsFirst/proj1/js/verbs.full.generated.js

### Root Cause Confirmed

Confirmed for the bad build shown in the report. Older generated expression conjugations left the idiomatic tail `que soi` unchanged for all subjects. The current generator has `TONIC_REFLEXIVE_REPLACEMENTS` and `agree_tail()` logic that rewrites `que soi` to `que moi/toi/lui/nous/vous/qu'eux` while preserving the expression label.

### Fix Details

The existing local fix in `19e196677` adds tonic-reflexive tail replacement logic to the French expression generator and regenerates the French verb data so `s'en prendre à plus faible que soi` keeps its infinitive label but renders subject-agreed conjugated rows.

### Verification Run

- `rg -n "TONIC_REFLEXIVE_REPLACEMENTS|def agree_tail|s'en prendre à plus faible que soi|que soi" /Users/simeon/Code/VerbsFirst/proj1/generate_french_verb_expressions.py`
- `rg -n "s'en prendr|plus faible que (moi|toi|lui|nous|vous)|plus faible qu'eux|plus faible que soi" /Users/simeon/Code/VerbsFirst/proj1/js/verbs.full.generated.js`
- `git -C /Users/simeon/Code/VerbsFirst/proj1 diff --check -- generate_french_verb_expressions.py js/verbs.full.generated.js QA_FIX_STATUS.md`
- `python3 /Users/simeon/Code/VerbsFirst/proj1/build.py`
- `env LATEST_CHANNEL_TARGETS_ONLY=/Users/simeon/Code/VerbsFirst/proj1/dist python3 /Users/simeon/Code/VerbsFirst/proj1/sync_latest_channels.py`
- `node /private/tmp/vfqa0008_verify_local.mjs`
- Served `/Users/simeon/Code/VerbsFirst/proj1/dist` at `http://127.0.0.1:4188/`.
- `node /private/tmp/vfqa0008_cdp_check.mjs`
- `node /private/tmp/vfqa0008_verify_url.mjs`

Local file inspection, local generated French latest data, local headless Chrome/CDP browser verification, and live `https://verbsfirst.com/french_latest/js/verbs.starter.generated.js?v=20260505_230008` all showed `que moi/toi/lui/nous/vous/qu'eux` in present, futur simple, passe compose, and plus-que-parfait, with no conjugated row containing `que soi`.

### Remaining Risk

The current live asset is correct, so the original screenshot was likely from an older cached or pre-fix build. A user with a stale service-worker/browser cache may still need a hard refresh or normal app update cycle before seeing the corrected rows.

### Latest Deploy Blocker

- 2026-05-19 18:18:12 CDT
- Candidate commit: `19e196677` (intended latest channel(s): `french`)
- Blocker: `git -C /Users/simeon/Code/VerbsFirst/proj1 status --short` shows extensive modified + untracked files in `proj1/`, so a rebuild + deploy could accidentally ship unrelated local work.
- Next step: stash/commit/clean the working tree (or move the WIP to another branch), then rerun the latest deploy gate to verify + deploy `french_latest` only via `LATEST_CHANNEL_LANGS=french LATEST_ONLY=1 zsh /Users/simeon/Code/VerbsFirst/proj1/deploy_cloudflare_latest.sh`.

### Latest Deploy

- 2026-05-19 21:40:13 CDT
- Candidate commit: `19e196677`
- Latest channel(s): `french`
- Verification run (production):
  - `curl -fsS https://verbsfirst.com/french_latest/js/verbs.starter.generated.js`
  - Confirmed conjugated rows for `s'en prendre à plus faible que soi` include `que moi/toi/lui/nous/vous/qu'eux` (no conjugated value contained `que soi`; only the infinitive label and expression key contained it).
- Command used: N/A (already live on production)
- Result: `french_latest` already contains the fix; no deploy run from this machine.

## VF-QA-0007 Follow-up

Status: Fixed
Owner: Dev Agent
Started: 2026-05-06
Updated: 2026-05-06
Commit(s): spanish-verbs e6ce770

### Summary

Added an early Spanish app canonical-host guard so bare-domain Spanish app loads redirect to `https://www.verbsfirst.com` before service-worker registration or install UI can run.

### Files Changed

- /Users/simeon/Code/VerbsFirst/spanish-verbs/index.html

### Root Cause Confirmed

Confirmed. `https://verbsfirst.com` and `https://www.verbsfirst.com` are separate browser origins, so Chrome can keep separate service workers, storage, install prompt state, and PWA identities for the same Spanish app. Serving Spanish on both hostnames without canonicalization lets install work on one origin while failing or falling back on the other.

### Fix Details

Inserted a first-head script in the Spanish app that matches `https://verbsfirst.com/spanish...` and `https://verbsfirst.com/spanish_latest...`, then performs `location.replace()` to the same path, query, and fragment on `https://www.verbsfirst.com`. The guard is before manifest discovery and before `navigator.serviceWorker.register('./sw.js', { scope: './' })`, so the wrong origin should not reach the app install flow once the rebuilt Spanish HTML is deployed.

### Verification Run

- `curl -L --compressed -I https://verbsfirst.com/spanish/`
- `curl -L --compressed -I https://www.verbsfirst.com/spanish/`
- `python3 /Users/simeon/Code/VerbsFirst/spanish-verbs/build.py`
- `python3 /Users/simeon/Code/VerbsFirst/proj1/build.py`
- `env LATEST_CHANNEL_TARGETS_ONLY=/Users/simeon/Code/VerbsFirst/proj1/dist python3 /Users/simeon/Code/VerbsFirst/proj1/sync_latest_channels.py`
- `rg -n 'Canonicalize Spanish PWA origin|location.replace\(' /Users/simeon/Code/VerbsFirst/spanish-verbs/index.html /Users/simeon/Code/VerbsFirst/spanish-verbs/dist/index.html`
- `rg -n 'Canonicalize Spanish PWA origin|location.replace\(' /Users/simeon/Code/VerbsFirst/proj1/dist/spanish/index.html /Users/simeon/Code/VerbsFirst/proj1/dist/spanish_latest/index.html /Users/simeon/Code/VerbsFirst/proj1/dist/conjugaespanol.html`
- Local ordering check confirmed the canonical guard appears before both `rel="manifest"` and `navigator.serviceWorker.register` in rebuilt `/spanish/` and `/spanish_latest/` HTML.
- `git -C /Users/simeon/Code/VerbsFirst/spanish-verbs diff --check -- index.html`

### Remaining Risk

The cleaner edge-level Cloudflare redirect was not applied because the available Pages API token returned `403 Authentication error` for the Rulesets API. Cloudflare Pages `_redirects` cannot target one hostname without also matching the other, so this local fix uses the earliest app-level redirect instead. This still needs deploy/live verification and physical Chrome Android install testing; stale bare-origin service-worker state may also require clearing site data or a normal update cycle.

### Latest Deploy Blocker

- 2026-05-19 20:50:17 CDT
- Commit: `e6ce770` (spanish-verbs)
- Intended latest channel(s): `spanish`
- Blocker: required preflight `git -C /Users/simeon/Code/VerbsFirst/proj1 rev-parse --verify e6ce770^{commit}` failed, so this commit hash is not present in the `proj1` repo history and the deploy gate cannot verify/rebuild/deploy it.
- Next step: record a corresponding `proj1` commit hash for the Spanish app wiring (or update the deploy gate rules to verify app commits in their own repos), then rerun.

## VF-QA-0009

Status: Fixed Locally
Owner: Dev Agent
Started: 2026-05-07
Updated: 2026-05-07
Commit(s): portuguese-verbs 2c15ab4

### Summary

Added a Portuguese Latest Fill Blanks settings section with visible Settings navigation, question type, difficulty, and Portuguese pattern-focus controls. The controls feed the Fill Blanks card generator, persist through saved drill/options state, and leave Conjugation settings untouched.

### Files Changed

- /Users/simeon/Code/VerbsFirst/portuguese-verbs/js/script.js

### Root Cause Confirmed

Confirmed. Portuguese had Fill Blanks exercises available and could switch `cardTypeMode` to Fill Blanks, but its Settings V2 layout only registered Conjugation, Text To Speech, and App sections. There was no `settings-v2-fill-setup` section or Fill Blanks-specific controls in the Portuguese source, so users could enable Fill Blanks without any way to configure its question pool.

### Fix Details

Added Portuguese Fill Blanks option state for question family, difficulty weighting, and prepositional pattern focus. The frame deck now filters/weights `verb_frames.portuguese.js` rows from those settings, and Settings V2 now creates a `Fill Blanks` nav target plus a `Fill Blanks Setup` details section showing the current question count and controls. Drill option normalization/persistence now carries the new Fill Blanks settings without resetting Conjugation options.

### Verification Run

- `node --check /Users/simeon/Code/VerbsFirst/portuguese-verbs/js/script.js`
- `python3 /Users/simeon/Code/VerbsFirst/portuguese-verbs/build.py`
- `python3 /Users/simeon/Code/VerbsFirst/proj1/build.py`
- `python3 /Users/simeon/Code/VerbsFirst/proj1/sync_latest_channels.py`
- `rg -n "settings-v2-fill-setup|Question type|Difficulty|Pattern focus" /Users/simeon/Code/VerbsFirst/portuguese-verbs/dist/index.html`
- `rg -n "settings-v2-fill-setup|Question type|Difficulty|Pattern focus" /Users/simeon/Code/VerbsFirst/proj1/dist/portugese_latest/index.html`
- `git -C /Users/simeon/Code/VerbsFirst/portuguese-verbs diff --cached --check -- js/script.js`
- Served `/Users/simeon/Code/VerbsFirst/proj1/dist` at `http://127.0.0.1:4173/`.
- Browser-use/in-app browser tooling was unavailable in this session; headless Chrome/Playwright mobile viewport 390x844 verified `/portugese_latest/` shows the Fill Blanks nav/section, exposes Question type and Difficulty controls, persists `fillFocusMode=patterns`, `fillDifficultyMode=hard`, and `prepositionalVerbMode=only`, and still generates Fill Blanks cards after returning to practice.
- The same browser pass verified English Fill Blanks translation contrast in explicit Dark and system-dark themes at 15.94:1.

### Remaining Risk

Not yet checked on a physical phone or live production after deploy. The rebuilt `dist/portugese_latest/` output is ignored by git and must be regenerated/deployed from the fixed Portuguese source in the normal release flow.

### Latest Deploy Blocker

- Date: 2026-05-24 19:53 CEST
- Commit: `2c15ab4` (portuguese-verbs)
- Intended latest channels: `portugese`
- Blocker: required preflight `git -C /Users/simeon/Code/VerbsFirst/proj1 rev-parse --verify 2c15ab4^{commit}` failed, so this hash is not present in the `proj1` repo history and the deploy gate cannot verify/rebuild/deploy it.
- Additional blocker: `git -C /Users/simeon/Code/VerbsFirst/proj1 status --short` shows extensive modified + untracked files, so a rebuild + deploy could accidentally ship unrelated local work.
- Next step: record a corresponding `proj1` commit hash for the Portuguese app wiring (or update the deploy gate rules to verify app commits in their own repos), then rerun; also ensure `proj1/` working tree is clean before any rebuild/deploy.

## VF-QA-0010

Status: Fixed
Owner: Dev Agent
Started: 2026-05-07
Updated: 2026-05-07
Commit(s): proj1 ef9f2e82b

### Summary

Reduced the intermittent Chrome `ERR_FAILED` flash for French and Portuguese-family app routes by hardening the root VerbsFirst service worker as a pre-app navigation safety net. When the root worker controls the origin but a language-specific worker is not yet in charge, app navigations now use network-first loading with cached app-shell fallback and a branded auto-retry shell, instead of falling through to Chrome's native error page.

### Files Changed

- /Users/simeon/Code/VerbsFirst/proj1/site_sw.js

### Root Cause Confirmed

Partially confirmed. The screenshots show Chrome-native `ERR_FAILED` pages that later recover into the app, including French, so this is not explained by a Portuguese spelling/path issue. The concrete hardenable gap was in the root service worker: production root `sw.js` is still `landing-cache-v1`, explicitly excludes `/french`, and ignores app-route navigations, so an origin-controlled page can still depend entirely on a raw network navigation until the app-specific service worker takes over.

### Fix Details

Bumped the root service-worker cache to `landing-cache-v2`, removed the language-route exclusion, and added explicit app-route navigation handling for the language apps and latest channels. Successful app navigations are cached by their route `index.html`; failed app navigations return cached app HTML when available, or a VerbsFirst-owned loading/retry HTML shell when not. Root landing-page caching remains scoped to the existing root paths.

### Verification Run

- `node --check /Users/simeon/Code/VerbsFirst/proj1/site_sw.js`
- `node --check /Users/simeon/Code/VerbsFirst/proj1/dist/sw.js`
- `/Users/simeon/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node /private/tmp/vfqa0010_site_sw_vm.mjs`
- `python3 /Users/simeon/Code/VerbsFirst/proj1/build.py`
- `rg -n "CACHE_NAME|EXCLUDED_PREFIXES|APP_ROUTE_PREFIXES|serveAppNavigation" /Users/simeon/Code/VerbsFirst/proj1/dist/sw.js`
- `curl -L https://verbsfirst.com/sw.js | rg -n "CACHE_NAME|EXCLUDED_PREFIXES|APP_ROUTE_PREFIXES|serveAppNavigation"`
- `curl -L -I https://verbsfirst.com/sw.js`
- `git -C /Users/simeon/Code/VerbsFirst/proj1 diff --check -- site_sw.js QA_FIX_STATUS.md`

The VM service-worker check asserted that `/french/` and the reported Portuguese latest route are recognized as app routes, SEO reference pages are not, a simulated network failure returns HTTP 200 app-owned HTML with auto-retry, cached French app HTML wins over the fallback shell, and a successful network navigation refreshes the cached route shell. Live production still serves root `sw.js` v1 with the old language exclusions until this fix is deployed; the current live header is already `Cache-Control: no-cache, no-store, must-revalidate`.

### Remaining Risk

This still cannot prevent a true network, DNS, browser, or CDN failure before Chrome receives any document or before any service worker controls the origin. It also needs live deployment plus physical iOS/Android Chrome verification with fresh and previously-used site data, since local in-app browser tooling was unavailable and the headless Chrome fallback was not completed after the root-cause pivot.

### Latest Deploy Blocker

- 2026-05-20 16:46 CDT
- Candidate commit: `ef9f2e82b` (preflight `git -C /Users/simeon/Code/VerbsFirst/proj1 rev-parse --verify ef9f2e82b^{commit}` OK)
- Latest channel(s): `french`, `spanish`, `german`, `portugese`, `italian`, `greek`, `catalan`, `latvian`, `russian`, `ukrainian`
- Blocked: `proj1/` working tree is dirty (203 paths in `git status --short`), so a rebuild + deploy from `proj1/` could ship unrelated WIP.
- Next step: stash/commit/clean the `proj1/` working tree until it is clean, then rerun the latest deploy gate to verify + deploy latest-only via `LATEST_CHANNEL_LANGS="french spanish german portugese italian greek catalan latvian russian ukrainian" LATEST_ONLY=1 zsh /Users/simeon/Code/VerbsFirst/proj1/deploy_cloudflare_latest.sh`.

### Latest Deploy

- 2026-05-20 16:56 CDT
- Candidate commit: `ef9f2e82b`
- Latest channel(s): `french`, `spanish`, `german`, `portugese`, `italian`, `greek`, `catalan`, `latvian`, `russian`, `ukrainian`
- Verification run (production):
  - `curl -fsS -L https://verbsfirst.com/sw.js | rg -n "CACHE_NAME = CACHE_PREFIX \\+ 'v2'|serveAppNavigation|french_latest|portugese_latest" | head`
- Command used: N/A (already live on production)
- Result: Production root `sw.js` includes the v2 app-route navigation fallback, so VF-QA-0010 is present on `_latest`.

## VF-QA-0011

Status: Fixed Locally
Owner: Dev Agent
Started: 2026-05-19
Updated: 2026-05-19
Commit(s): (needs correction) — `ab8e872fe` is the proj1 fix commit for `VF-QA-0014`

### Summary

Fixed French `elles` agreement for être-auxiliary compound expressions where the past participle is followed by an `en` expression tail or complement. The helper now feminizes the participle after the être auxiliary instead of blindly mutating the final word in the phrase.

### Files Changed

- /Users/simeon/Code/VerbsFirst/proj1/index.html
- /Users/simeon/Code/VerbsFirst/proj1/QA_FIX_STATUS.md

### Root Cause Confirmed

Confirmed. `feminizeParticiple(parts, pronoun)` assumed the participle was the final whitespace-delimited token. For forms like `ils en sont venus aux mains` and `ils en sont revenus à leurs moutons`, the final token is a complement noun, so `venus/revenus/restés` stayed masculine or a later complement word was incorrectly changed.

### Fix Details

Added an être-auxiliary participle locator that scans immediately after the auxiliary, allowing common intervening adverbs/negators such as `pas` or `déjà`, and stops before complement phrases. `feminizeParticiple` now mutates that participle token while preserving trailing punctuation. Simple terminal-participle cases still use the same agreement output, masculine `ils` output is unchanged, and complements like `mains` and `moutons` are left alone.

### Verification Run

- Node smoke-tested `/Users/simeon/Code/VerbsFirst/proj1/index.html` for:
  - `ils sont venus` -> `elles sont venues`
  - `ils en sont venus au fait` -> `elles en sont venues au fait`
  - `ils en sont venus aux mains` -> `elles en sont venues aux mains`
  - `ils en sont revenus à leurs moutons` -> `elles en sont revenues à leurs moutons`
  - `ils en sont restés là` -> `elles en sont restées là`
  - `ils ne sont pas venus au fait` -> `elles ne sont pas venues au fait`
  - `il est venu au fait` -> `elle est venue au fait`
  - masculine `ils` output remains unchanged.
- `python3 /Users/simeon/Code/VerbsFirst/proj1/build.py`
- `env LATEST_CHANNEL_TARGETS_ONLY=/Users/simeon/Code/VerbsFirst/proj1/dist python3 /Users/simeon/Code/VerbsFirst/proj1/sync_latest_channels.py`
- Node smoke-tested the same regression set against `/Users/simeon/Code/VerbsFirst/proj1/dist/french/index.html` and `/Users/simeon/Code/VerbsFirst/proj1/dist/french_latest/index.html`.
- Served `/Users/simeon/Code/VerbsFirst/proj1/dist` at `http://127.0.0.1:4191/`.
- Headless Chrome/Playwright mobile viewport 390x844 loaded `http://127.0.0.1:4191/french/` and verified the browser runtime returns the expected `elles en sont venues/revenues/restées` outputs while preserving masculine `ils`.

### Remaining Risk

Not yet checked on a physical phone or live production after deploy. This fix is intentionally scoped to French display-time pronoun agreement; any stale deployed service worker or cached HTML may need the normal app update cycle before users see it.

### Latest Deploy Blocker

- 2026-05-24 19:33 CEST
- Candidate commit: `ef9f2e82b` (preflight `git -C /Users/simeon/Code/VerbsFirst/proj1 rev-parse --verify ef9f2e82b^{commit}` OK)
- Intended latest channel(s): `french`, `portugese`
- Blocker: `git -C /Users/simeon/Code/VerbsFirst/proj1 status --short` shows extensive modified + untracked files in `proj1/`, so a rebuild + deploy could accidentally ship unrelated local work.
- Next step: stash/commit/clean the `proj1/` working tree (and ensure it’s on `ef9f2e82b`), then rerun the latest deploy gate to verify + deploy latest-only via `LATEST_CHANNEL_LANGS="french portugese" LATEST_ONLY=1 zsh /Users/simeon/Code/VerbsFirst/proj1/deploy_cloudflare_latest.sh`.

## VF-QA-0012

Status: Fixed Locally
Owner: Dev Agent
Started: 2026-05-19
Updated: 2026-05-19
Commit(s): proj1 this commit

### Summary

Fixed French pronoun-fill direct-object rows so `ouvrir` cards reveal `l'ouvr...` forms instead of `le ouvr...`. The row loader now also guards direct-object `le`/`la` answers before vowel or mute-h verb forms, so copied/static rows cannot reintroduce the same visible clitic-elision error.

### Files Changed

- /Users/simeon/Code/VerbsFirst/proj1/js/pronounFillRows.js
- /Users/simeon/Code/VerbsFirst/proj1/QA_FIX_STATUS.md

### Root Cause Confirmed

Confirmed. The present-tense pronoun-fill source data hard-coded `le` for `ouvrir` rows even though the following forms start with a vowel sound: `ouvrons`, `ouvrez`, `ouvre`, and `ouvrent`. Because `build.py` copies `js/pronounFillRows.js` directly into the French web artifacts, the bad literal rows propagated into regular and latest builds.

### Fix Details

Corrected the current `ouvrir` rows to use `l'` in both the blank answer and full revealed answer: `Nous l'ouvrons.`, `Vous l'ouvrez.`, `Elle l'ouvre.`, and `Ils l'ouvrent.` Added a source-side direct-object elision normalizer in `add()` that turns static `le`/`la` answers into `l'` when the blank is immediately followed by a vowel or mute-h verb form.

### Verification Run

- `node --check /Users/simeon/Code/VerbsFirst/proj1/js/pronounFillRows.js`
- `rg -n "le ouvr|la ouvr|\\b(le|la) [aeiouhàâäéèêëîïôöùûüœ]" /Users/simeon/Code/VerbsFirst/proj1/js/pronounFillRows.js /Users/simeon/Code/VerbsFirst/proj1/js/pronounFillRows.passeCompose.js`
- Node VM loaded `/Users/simeon/Code/VerbsFirst/proj1/js/pronounFillRows.js` and verified 350 rows, the four `ouvrir` rows reveal `l'ouvr...`, and no loaded full answer contains `le/la + vowel`.
- `python3 /Users/simeon/Code/VerbsFirst/proj1/build.py`
- `env LATEST_CHANNEL_TARGETS_ONLY=/Users/simeon/Code/VerbsFirst/proj1/dist python3 /Users/simeon/Code/VerbsFirst/proj1/sync_latest_channels.py`
- `env LATEST_CHANNEL_TARGETS_ONLY=/Users/simeon/Code/VerbsFirst/proj1/dist-cloudflare python3 /Users/simeon/Code/VerbsFirst/proj1/sync_latest_channels.py`
- `rg` confirmed no `le ouvr`, `la ouvr`, or `le/la + vowel` bad strings in source, `dist/french`, `dist/french_latest`, or `dist-cloudflare/french_latest` pronoun-fill files.
- Node VM loaded source, `dist/french`, `dist/french_latest`, and `dist-cloudflare/french_latest` pronoun-fill files and verified all four `ouvrir` rows return `Nous l'ouvrons.`, `Vous l'ouvrez.`, `Elle l'ouvre.`, and `Ils l'ouvrent.` with zero bad loaded full answers.
- Served `/Users/simeon/Code/VerbsFirst/proj1/dist` at `http://127.0.0.1:4192/`.
- Headless Chrome/Playwright mobile viewport 390x844 loaded `http://127.0.0.1:4192/french/` and verified the browser runtime exposes the corrected `ouvrir` pronoun-fill rows with `badCount: 0`.

### Remaining Risk

Not yet checked on a physical phone or live production after deploy. Existing deployed service-worker/browser caches may need the normal refresh/update path before users see the rebuilt pronoun-fill data.

## VF-QA-0013

Status: Fixed Locally
Owner: Dev Agent
Started: 2026-05-19
Updated: 2026-05-19
Commit(s): spanish-verbs this commit, proj1 this commit

### Summary

Fixed Spanish latest Fill Blanks dark/system contrast by porting the French-style dark English translation treatment to Spanish and making System-dark frame-slot revealed answers use the same readable colors as explicit Dark.

### Files Changed

- /Users/simeon/Code/VerbsFirst/spanish-verbs/css/style.css
- /Users/simeon/Code/VerbsFirst/proj1/QA_FIX_STATUS.md

### Root Cause Confirmed

Confirmed. Spanish had an OS-dark media rule that forced `#english-verb-phrase` to dark `#263040 !important`, which made the bottom English sentence low-contrast on dark Fill Blanks cards. Revealed frame-slot answers had a readable override only under `html[data-theme="dark"]`, so System theme with OS dark kept the base bright-blue slot answer color.

### Fix Details

Scoped the OS-dark English phrase override away from explicit Light and changed it to readable light text. Added dark-mode `pronoun-fill-translation-prompt` / `frame-translation-prompt` colors with `!important` so the existing JS class toggles win over the generic ID rule. Added a `prefers-color-scheme: dark` frame-slot override for non-Light themes so System-dark and explicit Dark share the same light slot text, hidden-slot, and revealed-slot styling.

### Verification Run

- `git -C /Users/simeon/Code/VerbsFirst/spanish-verbs diff --check -- css/style.css`
- `python3 /Users/simeon/Code/VerbsFirst/spanish-verbs/build.py`
- `python3 /Users/simeon/Code/VerbsFirst/proj1/build.py`
- `env LATEST_CHANNEL_TARGETS_ONLY=/Users/simeon/Code/VerbsFirst/proj1/dist python3 /Users/simeon/Code/VerbsFirst/proj1/sync_latest_channels.py`
- `env LATEST_CHANNEL_TARGETS_ONLY=/Users/simeon/Code/VerbsFirst/proj1/dist-cloudflare python3 /Users/simeon/Code/VerbsFirst/proj1/sync_latest_channels.py`
- `rg` confirmed rebuilt Spanish regular/latest and Cloudflare latest HTML contain the new `#dce9f8`, `#f2f7ff`, and System-dark frame-slot selectors.
- Served `/Users/simeon/Code/VerbsFirst/proj1/dist` at `http://127.0.0.1:4193/`.
- Headless Chrome/Playwright mobile viewport 390x844 with emulated OS dark loaded `http://127.0.0.1:4193/spanish_latest/` and verified:
  - Theme System: translation `rgb(242, 247, 255)` at ~17.02:1 contrast; revealed slot answers `rgb(240, 245, 250)` at ~16.7:1.
  - Theme Dark: same translation and revealed answer colors/contrast.
  - No System-dark revealed slot answer used the old bright blue `rgb(47, 127, 208)`.
- Headless Chrome sanity-checked `french_latest` and `portugese_latest` System-dark translation/slot contrast; both remained above 16:1.

### Remaining Risk

Not yet checked on a physical phone or live production after deploy. Users with stale Spanish latest service-worker/browser cache may need the normal update path before seeing the rebuilt CSS.

## VF-QA-0014

Status: Fixed Locally
Owner: Dev Agent
Started: 2026-05-19
Updated: 2026-05-19
Commit(s): proj1 ab8e872fe

### Summary

Fixed the French Latest update row so a first service-worker install no longer strands Settings -> App in `Checking for updates...` with a disabled `Check for updates` button.

### Files Changed

- /Users/simeon/Code/VerbsFirst/proj1/index.html
- /Users/simeon/Code/VerbsFirst/proj1/QA_FIX_STATUS.md

### Root Cause Confirmed

Confirmed. The inline service-worker registration handler marked every `updatefound` event as an active update check. On a fresh `/french_latest/` install, the app-scoped worker installs for the first time, but there is no previous scoped worker and no real update. Because the service worker only posts `SW_UPDATED` for cache upgrades, nothing cleared the passive `checking` state and the UI disabled the only manual recovery button.

### Fix Details

Added a bounded `checking` fallback to the shared app-update state setter so passive update checks cannot remain active indefinitely. Reworked the `updatefound` handler to inspect the installing worker state, distinguish first install from a real scoped-worker update, return to idle when a first install completes without an update, and only treat `registration.waiting` as an update when there was already an active scoped worker.

### Verification Run

- `node --check /Users/simeon/Code/VerbsFirst/proj1/js/script.js`
- Extracted and parsed the inline service-worker registration script from `/Users/simeon/Code/VerbsFirst/proj1/index.html`.
- `python3 /Users/simeon/Code/VerbsFirst/proj1/build.py`
- `env LATEST_CHANNEL_LANGS=french LATEST_CHANNEL_TARGETS_ONLY=/Users/simeon/Code/VerbsFirst/proj1/dist python3 /Users/simeon/Code/VerbsFirst/proj1/sync_latest_channels.py`
- `env LATEST_CHANNEL_LANGS=french LATEST_CHANNEL_TARGETS_ONLY=/Users/simeon/Code/VerbsFirst/proj1/dist-cloudflare python3 /Users/simeon/Code/VerbsFirst/proj1/sync_latest_channels.py`
- Extracted and parsed the rebuilt inline service-worker registration script from `/Users/simeon/Code/VerbsFirst/proj1/dist/french/index.html`, `/Users/simeon/Code/VerbsFirst/proj1/dist/french_latest/index.html`, and `/Users/simeon/Code/VerbsFirst/proj1/dist-cloudflare/french_latest/index.html`.
- `rg` confirmed `APP_UPDATE_CHECK_MAX_MS`, `hadScopedActiveWorker`, and `setIdleIfNoUpdate` are present in source, French stable build, French latest build, and Cloudflare latest output.
- Served `/Users/simeon/Code/VerbsFirst/proj1/dist` at `http://127.0.0.1:4194/`.
- Headless Chrome/Playwright with fresh profiles verified `http://127.0.0.1:4194/french_latest/`:
  - first install settled to `App is up to date.`
  - `Check for updates` was enabled
  - no false `Update available` pill appeared
  - first-install `__sw-log` showed `old caches: [] isUpgrade=false` and no real `SW_UPDATED`
  - clicking `Check for updates` returned to idle with version `20260519_190805`
  - simulated `SW_UPDATED` still showed `New version available.` with `Reload now`
- The same headless Chrome pass verified the equivalent idle/manual-check/update-message behavior for `http://127.0.0.1:4194/french/`.

### Remaining Risk

Not yet checked on a physical phone or live production after deploy. The browser pass simulated the `SW_UPDATED` message rather than performing a full service-worker version bump upgrade cycle. Existing deployed service-worker/browser caches may still need the normal refresh/update path before users see the rebuilt update-state code.

### Latest Deploy Blocker

- 2026-05-21 15:15 CDT
- Commit: `ab8e872fe` (preflight `git -C /Users/simeon/Code/VerbsFirst/proj1 rev-parse --verify ab8e872fe^{commit}` OK)
- Intended latest channel(s): `french`
- Blocked: `proj1/` working tree is still dirty (203 paths in `git status --short`), and the unrelated modified source/data/build files include `build.py`, `css/style.css`, `js/script.js`, `js/pronounFillRows.js`, and many untracked artifacts. Because `ab8e872fe` only changes `index.html`, a rebuild + `LATEST_ONLY` deploy from the current tree could ship unrelated WIP alongside the French update-state fix.
- Next step: stash/commit/clean unrelated `proj1/` changes until `git -C /Users/simeon/Code/VerbsFirst/proj1 status --short` is clean, then rerun the latest deploy gate for `VF-QA-0014`.

### Latest Deploy

- 2026-06-01 01:50 CEST
- Candidate commit: `ab8e872fe`
- Latest channel(s): `french`
- Verification run (production):
  - `curl -fsS -L https://verbsfirst.com/french_latest/index.html | rg -n "APP_UPDATE_CHECK_MAX_MS|hadScopedActiveWorker|setIdleIfNoUpdate"`
- Command used: N/A (already live on production)
- Result: Production `french_latest` `index.html` contains the bounded update-check idle fallback and first-install vs update-state logic, so VF-QA-0014 is present on `_latest`.

## VF-QA-0015

Status: Fixed
Owner: Dev Agent
Started: 2026-05-19
Updated: 2026-05-20
Commit(s): proj1 89eed5422

### Summary

Changed the French learner gloss for `tuméfier` from the obscure English `to tumefy` to the clearer `to swell up` in the tracked French verb data and added a source-side learner translation override so future French data regeneration keeps the friendlier gloss.

### Files Changed

- /Users/simeon/Code/VerbsFirst/proj1/combine_dataset_enhanced.py
- /Users/simeon/Code/VerbsFirst/proj1/js/verbs.full.generated.js
- /Users/simeon/Code/VerbsFirst/proj1/js/verbs.full.js
- /Users/simeon/Code/VerbsFirst/proj1/QA_FIX_STATUS.md

### Root Cause Confirmed

Confirmed. The French generated verb data carried the upstream/generated translation `to tumefy`, and the stable/latest app builds consume that tracked generated data when creating starter verb bundles. Although the gloss sidecar already had clearer alternate wording, there was no learner-facing override layer in the French dataset generation path for this verb.

### Fix Details

Added `LEARNER_TRANSLATION_OVERRIDES` to `combine_dataset_enhanced.py` and applied it after the normal French translation lookup so `tuméfier` resolves to `to swell up` on regeneration. Updated the tracked full French verb data files to match, then rebuilt the app and resynced the French latest channel outputs.

### Verification Run

- `python3 -m py_compile /Users/simeon/Code/VerbsFirst/proj1/combine_dataset_enhanced.py`
- `node --check /Users/simeon/Code/VerbsFirst/proj1/js/verbs.full.generated.js`
- `node --check /Users/simeon/Code/VerbsFirst/proj1/js/verbs.full.js`
- `git -C /Users/simeon/Code/VerbsFirst/proj1 diff --check -- combine_dataset_enhanced.py js/verbs.full.generated.js js/verbs.full.js`
- `python3 /Users/simeon/Code/VerbsFirst/proj1/build.py`
- `env LATEST_CHANNEL_LANGS=french LATEST_CHANNEL_TARGETS_ONLY=/Users/simeon/Code/VerbsFirst/proj1/dist python3 /Users/simeon/Code/VerbsFirst/proj1/sync_latest_channels.py`
- `env LATEST_CHANNEL_LANGS=french LATEST_CHANNEL_TARGETS_ONLY=/Users/simeon/Code/VerbsFirst/proj1/dist-cloudflare python3 /Users/simeon/Code/VerbsFirst/proj1/sync_latest_channels.py`
- Node parser verified `tuméfier` has translation `to swell up` in `/Users/simeon/Code/VerbsFirst/proj1/js/verbs.full.generated.js`, `/Users/simeon/Code/VerbsFirst/proj1/js/verbs.full.js`, `/Users/simeon/Code/VerbsFirst/proj1/dist/french/js/verbs.starter.generated.js`, `/Users/simeon/Code/VerbsFirst/proj1/dist/french_latest/js/verbs.starter.generated.js`, and `/Users/simeon/Code/VerbsFirst/proj1/dist-cloudflare/french_latest/js/verbs.starter.generated.js`.
- Served `/Users/simeon/Code/VerbsFirst/proj1/dist` at `http://127.0.0.1:4195/`.
- Headless Chrome/Playwright mobile viewport 390x844 verified both `http://127.0.0.1:4195/french_latest/#pronoun=tu&verb=tum%C3%A9fier&tense=subjonctifPresent` and `http://127.0.0.1:4195/french/#pronoun=tu&verb=tum%C3%A9fier&tense=subjonctifPresent` render `tuméfier` with translation `to swell up`.

### Remaining Risk

Not yet checked on a physical phone or live production after deploy. Existing deployed service-worker/browser caches may need the normal update path before users see the rebuilt French gloss data. This is a targeted override for the reported verb; a broader audit could still find other obscure low-frequency English glosses.

### Latest Deploy

- 2026-05-20 16:07 CDT
- Candidate commit: `89eed5422` (preflight `git -C /Users/simeon/Code/VerbsFirst/proj1 rev-parse --verify 89eed5422^{commit}` OK)
- Latest channel(s): `french`
- Verification run (production):
  - `curl -fsSL https://verbsfirst.com/french_latest/js/verbs.starter.generated.js | rg -o '"infinitive":"tuméfier"[^}]{0,220}' | head -n 1`
- Command used: N/A (already live on production)
- Result: `french_latest` contains `"infinitive":"tuméfier","translation":"to swell up"`, so VF-QA-0015 is already present on `_latest`.

## VF-QA-0016

Status: Fixed
Owner: Dev Agent
Started: 2026-05-23
Updated: 2026-05-24
Commit(s): proj1 cec79e7ce

### Summary

Fixed French stable and French Latest service-worker upgrades so a newly cached offline HTML document is cached with its versioned build scripts before the worker can serve that HTML offline.

### Files Changed

- /Users/simeon/Code/VerbsFirst/proj1/sw.js
- /Users/simeon/Code/VerbsFirst/proj1/QA_FIX_STATUS.md

### Root Cause Confirmed

Confirmed. French stable/latest index files load critical scripts with `?v=` cache-busting query strings, but the service worker previously pre-cached only the offline document and a few unversioned shell assets at install. During an update, the new worker could cache a new `index.html` while the still-open old page warmed only the old DOM's script URLs, leaving the new offline document pointing at uncached script URLs if the device went offline immediately after the worker update.

### Fix Details

The French service worker now bumps its cache to `v31` and, at install time, fetches the current `index.html`, parses its script/link/inline French homophone asset references, and caches those scoped build assets before completing install. It also follows the starter verb bundle's `extraUrl` pointer so `verbs.extra.generated.json?v=...` is cached with the starter bundle. Navigation and explicit index warming now parse and warm the fetched HTML first, then replace the cached offline HTML only when the referenced build assets cached successfully.

### Verification Run

- `node --check /Users/simeon/Code/VerbsFirst/proj1/sw.js`
- `python3 /Users/simeon/Code/VerbsFirst/proj1/build.py`
- `env LATEST_CHANNEL_LANGS=french LATEST_CHANNEL_TARGETS_ONLY=/Users/simeon/Code/VerbsFirst/proj1/dist python3 /Users/simeon/Code/VerbsFirst/proj1/sync_latest_channels.py`
- `env LATEST_CHANNEL_LANGS=french LATEST_CHANNEL_TARGETS_ONLY=/Users/simeon/Code/VerbsFirst/proj1/dist-cloudflare python3 /Users/simeon/Code/VerbsFirst/proj1/sync_latest_channels.py`
- `node --check` passed for `/Users/simeon/Code/VerbsFirst/proj1/dist/french/sw.js`, `/Users/simeon/Code/VerbsFirst/proj1/dist/french_latest/sw.js`, and `/Users/simeon/Code/VerbsFirst/proj1/dist-cloudflare/french_latest/sw.js`.
- Static service-worker VM verification collected 13 build URLs from rebuilt `dist/french_latest/index.html` and cached 16 responses, including `index.html`, `js/verbs.starter.generated.js?v=20260524_191716`, `js/verbs.extra.generated.json?v=20260524_191716`, `js/script.js?v=20260524_191716`, and `js/frenchHomophoneGroups.js?v=20260524_191716`.
- Headless Chrome/Playwright served `/Users/simeon/Code/VerbsFirst/proj1/dist`, installed an old `v30` worker, switched the server to the rebuilt `v31` worker, forced the service-worker update while the old page stayed open, went offline before reloading into the new build, and verified both `/french_latest/` and `/french/` loaded the app UI offline.
- Browser CacheStorage verification confirmed the updated worker cached the new `20260524_191716` `index.html`, starter bundle, extra bundle, main script, and homophone bundle for both French Latest and French stable, with install logs reporting `warm-build-assets done reason=install ok=14 failed=0`.

### Remaining Risk

Not yet checked on a physical phone or live production after deploy. Existing deployed service-worker/browser caches may need the normal update cycle before users receive the `v31` worker. `VF-QA-0017` remains a separate Spanish bare-domain/offline launch bug.

### Latest Deploy Blocker

- Date: 2026-05-24 20:34:41 CEST
- Candidate commit: `cec79e7ce` (intended latest channel(s): `french`)
- Preflight: `git -C /Users/simeon/Code/VerbsFirst/proj1 rev-parse --verify cec79e7ce^{commit}` succeeded.
- Blocker: `git -C /Users/simeon/Code/VerbsFirst/proj1 status --short` shows extensive modified + untracked files in `proj1/`, so a rebuild + deploy could accidentally ship unrelated local work.
- Next step: stash/commit/clean the `proj1/` working tree, then rerun the latest deploy gate to rebuild/verify and deploy latest-only via `LATEST_CHANNEL_LANGS=french LATEST_ONLY=1 zsh /Users/simeon/Code/VerbsFirst/proj1/deploy_cloudflare_latest.sh`.

- Date: 2026-05-26 11:05:44 CEST
- Candidate commit: `cec79e7ce` (latest channel(s): `french`)
- Preflight: `git -C /Users/simeon/Code/VerbsFirst/proj1 rev-parse --verify cec79e7ce^{commit}` succeeded; `git diff-tree --no-commit-id --name-only -r cec79e7ce` shows only `sw.js` and `QA_FIX_STATUS.md`, so the fix scope is French-only.
- Blocker: current `proj1` working tree still contains unrelated modified source/build inputs (`build.py`, `css/style.css`, `js/frenchHomophoneGroups.js`, `js/pronounFillRows.js`, `js/script.js`) plus untracked `data/`, `dist-cloudflare/`, `js/french-phonetic-diff-v3.js`, and `js/vendor/`. A fresh French rebuild for `LATEST_ONLY=1` would include those non-`VF-QA-0016` changes.
- Next step: clean or isolate the unrelated `proj1/` work, then rerun the deploy gate so it can rebuild, verify, and deploy only `french_latest` with `LATEST_CHANNEL_LANGS=french`.

### Latest Deploy Blocker

- Date: 2026-05-27 19:06 CEST
- Candidate commit: `cec79e7ce` (proj1)
- Intended latest channel(s): `french`
- Blocker: `git -C /Users/simeon/Code/VerbsFirst/proj1 status --short` still shows 203 dirty paths, so a rebuild+deploy could ship unrelated WIP.
- Intended command (once clean): `LATEST_CHANNEL_LANGS=french LATEST_ONLY=1 zsh /Users/simeon/Code/VerbsFirst/proj1/deploy_cloudflare_latest.sh`

### Latest Deploy

- 2026-05-27 19:09 CEST
- Candidate commit: `cec79e7ce` (preflight `git -C /Users/simeon/Code/VerbsFirst/proj1 rev-parse --verify cec79e7ce^{commit}` OK)
- Latest channel(s): `french`
- Verification run (production):
  - `curl -fsSL https://verbsfirst.com/french_latest/sw.js | rg -n "CACHE_NAME = CACHE_PREFIX \\+ 'v31'|preCacheIndexAndBuildAssets"`
- Command used: N/A (already live on production)
- Result: `french_latest` includes service-worker cache `v31` and the `preCacheIndexAndBuildAssets` logic, so VF-QA-0016 is present on `_latest`.

## VF-QA-0017

Status: Fixed
Owner: Dev Agent
Started: 2026-05-24
Updated: 2026-05-24
Commit(s): spanish-verbs 28cbf12, proj1 33381c402

### Summary

Fixed Spanish stable and Spanish Latest so the app no longer performs an in-page cross-origin redirect from `verbsfirst.com` to `www.verbsfirst.com` before service-worker registration, which could leave a bare-domain install unable to launch while offline.

### Files Changed

- /Users/simeon/Code/VerbsFirst/spanish-verbs/index.html
- /Users/simeon/Code/VerbsFirst/spanish-verbs/sw.js
- /Users/simeon/Code/VerbsFirst/proj1/QA_FIX_STATUS.md

### Root Cause Confirmed

Confirmed. The Spanish app template included an early head script that ran before service-worker registration and replaced `/spanish/` or `/spanish_latest/` on the bare `verbsfirst.com` origin with the matching `www.verbsfirst.com` URL. A home-screen app or tab opened from the bare origin while offline could therefore require a cross-origin network navigation before the Spanish service worker had a chance to control and serve the cached app shell.

### Fix Details

Removed the Spanish app's client-side bare-domain-to-`www` redirect so the installed/current origin can load and register its own scoped service worker. Bumped the Spanish service-worker cache from `v22` to `v23` so updated installs refresh their cached `index.html` and stop serving the older redirecting shell.

### Verification Run

- `node --check /Users/simeon/Code/VerbsFirst/spanish-verbs/sw.js`
- `git -C /Users/simeon/Code/VerbsFirst/spanish-verbs diff --check -- index.html sw.js`
- `python3 /Users/simeon/Code/VerbsFirst/spanish-verbs/build.py`
- `python3 /Users/simeon/Code/VerbsFirst/proj1/build.py`
- `env LATEST_CHANNEL_LANGS=spanish LATEST_CHANNEL_TARGETS_ONLY=/Users/simeon/Code/VerbsFirst/proj1/dist python3 /Users/simeon/Code/VerbsFirst/proj1/sync_latest_channels.py`
- `env LATEST_CHANNEL_LANGS=spanish LATEST_CHANNEL_TARGETS_ONLY=/Users/simeon/Code/VerbsFirst/proj1/dist-cloudflare python3 /Users/simeon/Code/VerbsFirst/proj1/sync_latest_channels.py`
- `node --check` passed for `/Users/simeon/Code/VerbsFirst/proj1/dist/spanish/sw.js`, `/Users/simeon/Code/VerbsFirst/proj1/dist/spanish_latest/sw.js`, and `/Users/simeon/Code/VerbsFirst/proj1/dist-cloudflare/spanish_latest/sw.js`.
- `rg` confirmed `location.replace`, `verbsfirst.com`, and `www.verbsfirst.com` are absent from source Spanish HTML and rebuilt Spanish stable/latest/Cloudflare latest HTML; rebuilt workers use `v23` with the latest-channel cache prefix applied.
- Headless Chrome/Playwright served `/Users/simeon/Code/VerbsFirst/proj1/dist`, opened `/spanish_latest/` and `/spanish/` online, confirmed their service workers pre-cached each app `index.html`, then switched offline and reloaded both URLs. Both rendered app UI offline without a browser-level `You're offline` / `ERR_INTERNET_DISCONNECTED` page.

### Remaining Risk

Not yet checked on a physical phone, true production bare-domain origin, or live deployed PWA after update. Existing Spanish installs that already cached the redirecting shell may need one online update cycle to receive the `v23` worker and non-redirecting `index.html`. If the product still wants `www` as the only install origin, that should be enforced at the edge before install rather than by an app-shell redirect that can run offline.

### Latest Deploy Blocker

- Date: 2026-05-24 20:44 CEST
- Candidate fix commit(s): `spanish-verbs 28cbf12`, `proj1 33381c402`
- Intended latest channel(s): `spanish`
- Blocker: required preflight `git -C /Users/simeon/Code/VerbsFirst/proj1 rev-parse --verify 28cbf12^{commit}` failed, so the Spanish fix commit hash is not present in the `proj1` repo history and the deploy gate cannot verify/rebuild/deploy it.
- Also blocking: `git -C /Users/simeon/Code/VerbsFirst/proj1 status --short` shows extensive unrelated modified + untracked files, so any rebuild + deploy from `proj1/` would risk shipping local WIP.
- Next step: record a corresponding `proj1` commit hash that vendors/wires the Spanish fix into `proj1` deploy inputs (or update deploy-gate rules to verify + deploy from the app repo), and ensure the `proj1/` working tree is clean before rerunning the latest deploy gate.

- Date: 2026-05-27 19:10:13 CEST
- Candidate fix commit(s): `spanish-verbs 28cbf12`, `proj1 33381c402`
- Preflight: `git -C /Users/simeon/Code/VerbsFirst/proj1 rev-parse --verify 33381c402^{commit}` succeeded, but `git diff-tree --no-commit-id --name-only -r 33381c402` shows only `QA_FIX_STATUS.md` (status-only), so there is no deployable Spanish app fix commit in `proj1` to rebuild/verify/deploy from.
- Blocker: `git -C /Users/simeon/Code/VerbsFirst/proj1 rev-parse --verify 28cbf12^{commit}` still fails, so the gate still cannot verify the Spanish app repo commit under the current rules.
- Next step: create/record a `proj1` commit that actually includes the Spanish app fix in `proj1` deploy artifacts/inputs (or explicitly update the deploy-gate rules to verify app commits in their own repos) before attempting any `_latest` deploy for VF-QA-0017.

### Latest Deploy

- 2026-05-27 19:13 CEST
- Candidate fix commit(s): `spanish-verbs 28cbf12`, `proj1 33381c402`
- Latest channel(s): `spanish`
- Verification run (production):
  - `curl -fsSL https://verbsfirst.com/spanish_latest/sw.js | rg -n \"CACHE_NAME = CACHE_PREFIX \\+ 'v23'\"`
  - `curl -fsSL https://verbsfirst.com/spanish_latest/ | rg -n \"location\\.replace|verbsfirst\\.com|www\\.verbsfirst\\.com\"`
- Command used: N/A (already live on production)
- Result: `spanish_latest` serves `v23` and the redirect strings are absent, so VF-QA-0017 is present on `_latest`.

- Date: 2026-05-27 19:10 CEST
- Candidate fix commit(s): `spanish-verbs 28cbf12`, `proj1 33381c402`
- Preflight:
  - `git -C /Users/simeon/Code/VerbsFirst/proj1 rev-parse --verify 33381c402^{commit}` succeeded.
  - `git -C /Users/simeon/Code/VerbsFirst/proj1 rev-parse --verify 28cbf12^{commit}` failed with `fatal: Needed a single revision`.
  - `git -C /Users/simeon/Code/VerbsFirst/proj1 diff-tree --no-commit-id --name-only -r 33381c402` shows only `QA_FIX_STATUS.md`, while `git -C /Users/simeon/Code/VerbsFirst/spanish-verbs diff-tree --no-commit-id --name-only -r 28cbf12` shows the real Spanish app changes in `index.html` and `sw.js`.
- Intended latest channel(s): `spanish`
- Blocker: the required `proj1` preflight still cannot verify the actual Spanish fix commit, and the only recorded `proj1` hash for `VF-QA-0017` is a QA status update rather than a deployable app/build change.
- Also blocking: `git -C /Users/simeon/Code/VerbsFirst/proj1 status --short | wc -l` reports `204`, so a rebuild + `LATEST_ONLY=1` deploy from `proj1/` would still risk shipping unrelated local WIP.
- Next step: add the Spanish fix to a real `proj1` deploy-input commit (or adjust the deploy-gate rules to verify/deploy from the app repo), then rerun after cleaning the `proj1/` working tree.
