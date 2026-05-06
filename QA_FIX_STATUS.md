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

## VF-QA-0007 Follow-up

Status: Fixed Locally
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
