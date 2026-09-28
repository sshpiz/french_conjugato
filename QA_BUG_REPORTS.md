## VF-QA-0001: First Mobile Launch Can Flash Browser Error Before App Loads

Status: Open
Reported: 2026-05-04
Reported by: User
Affected app(s): Cross-app
Severity: Medium
Confidence: Medium

### User Report

User reports that on a phone, when opening the app for the first time, they see what looks like a Chrome error or page-not-found screen. After a few seconds, the app loads. User suspects this may be related to preloading.

### Expected Behavior

On a first mobile open with no existing service worker, cache, or localStorage state, the requested language app should show either the app UI or a branded/loading app shell. Chrome should not visibly display a browser-level error, page-not-found screen, or offline-looking fallback before the app becomes usable.

### Actual Behavior

The reported phone behavior is a transient Chrome error/page-not-found-looking screen for several seconds, followed by the app loading successfully.

QA could not reproduce the visible error in the local desktop in-app browser on a fresh localhost origin. French and Spanish both loaded normally locally, but service-worker logs and source inspection show that first navigation is not protected by a cached app shell because `index.html` is only warmed after the app is already loaded and `navigator.serviceWorker.ready` has resolved.

### Reproduction Steps

1. Use Chrome on Android or a mobile emulator/device. The most relevant state is a true first open: no prior `verbsfirst.com` service worker, no Cache Storage entries, no localStorage/sessionStorage, and no installed PWA state for the tested app.
2. Clear site data for `https://verbsfirst.com`, unregister any service workers, and close existing app tabs.
3. Open `https://verbsfirst.com/french/` from the address bar or from the home-screen/PWA entry if testing install behavior.
4. Repeat with `https://verbsfirst.com/spanish/` and at least one other sibling app, ideally under Slow 3G or an unstable mobile connection.
5. Watch the first 5-10 seconds of navigation for a browser-level Chrome error/page-not-found/offline screen before the app UI appears.
6. After the app loads, inspect `https://verbsfirst.com/french/__sw-log` or the equivalent language path to see when the service worker installed and when `warm-index` ran.
7. Local QA check used `/Users/simeon/Code/VerbsFirst/proj1/dist` served with `python3 -m http.server 8765 --bind 127.0.0.1`, then opened fresh-origin URLs `http://127.0.0.1:8765/french/`, `http://127.0.0.1:8765/spanish/`, and `http://127.0.0.1:8765/`. This did not visually reproduce the Chrome error in the desktop in-app browser, but it did confirm the first-load service-worker timing described below.

### Investigation Notes

Inspected relevant files:
- `/Users/simeon/Code/VerbsFirst/proj1/index.html`
- `/Users/simeon/Code/VerbsFirst/proj1/sw.js`
- `/Users/simeon/Code/VerbsFirst/proj1/js/script.js`
- `/Users/simeon/Code/VerbsFirst/proj1/site_landing.html`
- `/Users/simeon/Code/VerbsFirst/proj1/site_sw.js`
- `/Users/simeon/Code/VerbsFirst/proj1/build.py`
- `/Users/simeon/Code/VerbsFirst/proj1/dist/french/*`
- `/Users/simeon/Code/VerbsFirst/proj1/dist/spanish/*`
- sibling app service workers under `/Users/simeon/Code/VerbsFirst/proj1/dist/*/sw.js`

French app service-worker registration happens early in `/Users/simeon/Code/VerbsFirst/proj1/index.html` at the `navigator.serviceWorker.register('./sw.js', { scope: './' })` path. The app later logs `navigator.serviceWorker.ready` in the same file, and `/Users/simeon/Code/VerbsFirst/proj1/js/script.js` calls `requestShellWarmup('ready')` only after `navigator.serviceWorker.ready`.

In `/Users/simeon/Code/VerbsFirst/proj1/sw.js`, `INDEX_PATH` is defined as `appPath('index.html')`, but the install handler explicitly keeps install light and caches only small essentials. The relevant source paths are:
- `INDEX_PATH` definition near line 15.
- Install comment and essential pre-cache behavior near line 62.
- `WARM_INDEX` message handling near line 111.
- `warmIndexCache()` fetching and caching `INDEX_PATH` near lines 122-127.
- Navigation fallback attempting `cache.match(INDEX_PATH)` near line 228.
- Final fallback response `Offline - open once with internet to cache the app` near line 256.

Local browser-use checks:
- `http://127.0.0.1:8765/french/` loaded normally and became `http://127.0.0.1:8765/french/#pronoun=je&verb=parler&tense=present`.
- `http://127.0.0.1:8765/spanish/` loaded normally and became `http://127.0.0.1:8765/spanish/#pronoun=yo&verb=hablar&tense=present`.
- Local console logs showed `[SW] Registered`, app-ready/startup logs, `sw-ready`, and `shell-warmup requested reason=ready`.
- Local `http://127.0.0.1:8765/french/__sw-log` showed install, pre-cache of `/french/manifest.json`, `/french/favicon_big.png`, `/french/version.json`, activate, clients claim, then `warm-index ok reason=ready status=200`.
- Local `http://127.0.0.1:8765/spanish/__sw-log` showed the same ordering: install, pre-cache of manifest/favicon/version, activate, clients claim, then `warm-index ok reason=ready status=200`.

Live HTTP checks:
- `https://verbsfirst.com/french/`, `https://verbsfirst.com/spanish/`, and `https://verbsfirst.com/` returned HTTP 200.
- `https://verbsfirst.com/french` and `https://verbsfirst.com/spanish` redirected with HTTP 308 to trailing-slash URLs before returning 200.
- French and Spanish live page requests emitted HTTP 103 Early Hints before the final 200. This is probably benign, but it is worth checking on Chrome Android when investigating a visible first-load browser screen.
- `https://verbsfirst.com/sw.js` returned 200 with `cache-control: public, max-age=14400, must-revalidate`, which may matter when validating deploy/update behavior.

Comparison with French and sibling apps:
- The French source service worker and built sibling language service workers share the same basic first-load pattern: the HTML app shell is warmed after first usable render rather than pre-cached during install.
- French additionally has `WARM_APP_ASSETS`; some sibling service workers only warm `index.html`. The specific first-navigation cache gap exists across apps because the first document request must still succeed from network before the service worker has an app-shell document to serve.

### Suspected Root Cause

The most likely cause is a first-launch race/gap in the service-worker and preloading strategy. The language app service workers intentionally do not cache `index.html` during `install`; they cache only small essentials, then wait for the loaded app to call `requestShellWarmup('ready')` after `navigator.serviceWorker.ready`. On a true first mobile launch, the initial navigation therefore depends entirely on the live network, any trailing-slash redirect, Cloudflare behavior, and Chrome's handling of a not-yet-controlled page.

If the initial document request stalls, temporarily fails, or is retried on mobile, Chrome can show its own browser error/page-not-found/offline UI before the app eventually loads. If a new service worker is active but `INDEX_PATH` has not yet been warmed and the network fetch fails, the current navigation fallback can only return the generic 503 response `Offline - open once with internet to cache the app`, which could also present as a Chrome error-like page.

### Suggested Fix Direction

Have the fixer review `/Users/simeon/Code/VerbsFirst/proj1/sw.js` and the sibling app service-worker sources/build outputs for parity. Practical directions to consider:
- Cache `INDEX_PATH` during service-worker install or activation, or provide a very small branded navigation fallback shell that can be served before the full app shell is warmed.
- Move the app-shell warmup earlier if full install-time caching is too expensive.
- Ensure in-scope navigation requests always receive an app-owned loading/fallback document once the service worker is active, not a browser-looking 404/offline/503 page.
- Bump cache names when changing service-worker caching semantics.
- Keep French and sibling language apps aligned; do not patch only generated `proj1/dist/*` outputs without updating the source/generator path that creates them.
- Preserve the existing update/reload logic in `/Users/simeon/Code/VerbsFirst/proj1/js/script.js`, especially `getReloadUrlForFreshApp()`, version checks, and `controllerchange` behavior.

Implementation risk: caching the full `index.html` at install time may increase service-worker install cost on slow mobile connections. If that risk is unacceptable, a tiny fallback shell plus later app-shell warmup may be safer than adding the full app document to the install pre-cache list.

### Cross-App / Regression Risk

This should be treated as cross-app. The same first-load timing pattern appears in French and built sibling language service workers, including Spanish, German, Portuguese, Italian, Russian, Catalan, Greek, Ukrainian, and Latvian distributions.

Regression risks to check:
- Stale app-shell HTML after deploy.
- Service-worker update loops or missed update prompts.
- PWA/home-screen `start_url` behavior.
- Offline-first behavior after first successful launch.
- Cloudflare caching of `sw.js` and app documents.
- Root landing service worker scope interaction with language app scopes.

### Acceptance Criteria

- On Chrome Android with all site data cleared, opening `https://verbsfirst.com/french/` never shows a browser-level Chrome error/page-not-found/offline screen before the app UI or app-owned loading shell appears.
- The same first-open behavior passes for Spanish and at least two other sibling apps.
- Under Slow 3G or an intentionally flaky first document request, the user sees only app-owned UI, not a Chrome error page.
- After first successful load, the app works offline or shows the intended app-owned offline fallback.
- `__sw-log` or DevTools confirms that the navigation fallback document is available before any controlled navigation depends on it.
- Existing update/version behavior still works after a deploy and does not leave users on stale app HTML.

### Suggested Verification

- Serve the built app locally from `/Users/simeon/Code/VerbsFirst/proj1/dist` with `python3 -m http.server 8765 --bind 127.0.0.1`.
- In Chrome/Android remote debugging or the Codex browser-use tool, clear service workers, Cache Storage, localStorage, and sessionStorage for the tested origin.
- Open `http://127.0.0.1:8765/french/`, `http://127.0.0.1:8765/spanish/`, and at least one other language app on a fresh origin.
- Repeat against live URLs `https://verbsfirst.com/french/` and `https://verbsfirst.com/spanish/` on a real phone.
- Check `/french/__sw-log` and `/spanish/__sw-log` before and after first load.
- Use Chrome DevTools network throttling and filmstrip capture to verify no browser error frame appears during initial navigation.
- Run `curl -L --compressed -I https://verbsfirst.com/french/` and `curl -L --compressed -I https://verbsfirst.com/spanish/` to confirm redirect/status/header behavior after any deployment changes.

### Notes For Fixer

- QA did not reproduce the visible Chrome error in the desktop in-app browser, so the report confidence is Medium rather than High.
- The service-worker evidence is still actionable: local logs confirm `index.html` is warmed only after `ready`, not during install.
- `QA_BUG_REPORTS.md` did not exist before this report; this is the first stable QA ID.
- Do not commit or deploy as part of the fix unless explicitly asked.
- Preserve unrelated dirty git work.
- Treat generated files carefully. If sibling `dist/*/sw.js` files are generated from language-specific source directories, update the source/generator path and rebuild rather than hand-editing only built artifacts.
- Re-check Cloudflare/Pages cache headers for `sw.js`; live `sw.js` currently advertises `max-age=14400`, which can complicate service-worker rollout validation.

## VF-QA-0002: Settings Panel Jumps When Fill Blanks Difficulty Changes

Status: Open
Reported: 2026-05-04
Reported by: User
Affected app(s): French / Spanish
Severity: Medium
Confidence: High

### User Report

User reports that the screen "dances" while settings are changed. The attached phone screen capture shows the Fill Blanks difficulty level being toggled; while tapping the difficulty segmented control, the settings page jumps between nearby sections. User suspects every touch may be redrawing the screen and causing collapsed sections to uncollapse or vice versa, and says this needs a complete fix.

### Expected Behavior

Changing the Fill Blanks difficulty should update the selected pill and persisted setting in place. The viewport should stay anchored on the control the user touched, the sticky settings nav should remain stable, and unrelated settings sections should not jump into view, collapse, or expand as a side effect.

### Actual Behavior

In the attached 5.97s portrait phone capture, tapping the Fill Blanks `Difficulty` control makes the page visibly jump between the Fill Blanks card and lower/adjacent settings sections such as Text to Speech and Conjugation Setup.

QA reproduced the core jump locally in the French app. On a mobile-width viewport, tapping `Medium` in the Fill Blanks difficulty row updated the setting but moved the viewport so that the collapsed `Conjugation Setup` card appeared above the Fill Blanks section. The user remains in settings, but the touched control no longer stays in a stable visual position.

### Reproduction Steps

1. Serve the built app locally from `/Users/simeon/Code/VerbsFirst/proj1/dist`:
   `python3 -m http.server 8766 --bind 127.0.0.1`
2. Open `http://127.0.0.1:8766/french/` in a mobile-sized browser viewport. QA used approximately 390x844 CSS pixels in the Codex in-app browser.
3. Use a fresh/default local state or clear app state first. The issue reproduced without requiring dark theme, service-worker state, or special storage data.
4. Tap `Settings`.
5. In `Current exercise`, choose `Fill Blanks` as the exercise type, or start from any saved drill where Fill Blanks is already enabled.
6. Tap the sticky settings nav item `Fill Blanks`.
7. Note the initial layout: the Fill Blanks section is near the top of the viewport and the difficulty row is visible.
8. Tap `Medium` or `Hard` in the `Difficulty` segmented control.
9. Observe that the selected difficulty changes, but the settings viewport jumps upward/downward and exposes unrelated adjacent sections.
10. Repeat the same test on a phone or mobile emulator against `https://verbsfirst.com/french/`. Also verify Spanish with `http://127.0.0.1:8766/spanish/` or `https://verbsfirst.com/spanish/`, because Spanish source has the same Fill Blanks difficulty re-render path.

Relevant state during QA reproduction:
- French local app URL after launch: `http://127.0.0.1:8766/french/#pronoun=je&verb=parler&tense=present`
- Settings v2 enabled via current app code.
- `cardGenerationOptions.cardTypeMode` changed to Fill Blanks/frame mode through the UI.
- Default Fill Blanks difficulty started as `easy`; tapping `medium` reproduced the viewport jump.
- Browser console warnings/errors after reproduction: none observed.

### Investigation Notes

Inspected the attached file `/Users/simeon/Downloads/WhatsApp Video 2026-05-04 at 13.18.37.mp4`:
- MP4/H.264, 576x1296, approximately 5.97 seconds.
- The video shows the settings page in dark theme with `Fill Blanks` open and `Difficulty` being toggled.
- The visible page region jumps between the Fill Blanks card and neighboring settings cards while the control is tapped.

Inspected relevant French files:
- `/Users/simeon/Code/VerbsFirst/proj1/js/script.js`
- `/Users/simeon/Code/VerbsFirst/proj1/css/style.css`
- `/Users/simeon/Code/VerbsFirst/proj1/index.html`
- `/Users/simeon/Code/VerbsFirst/proj1/dist/french/js/script.js`

Key French source paths:
- `populateOptions()` records a section-level `preserveAnchorId` and `preservedAnchorTop` in `/Users/simeon/Code/VerbsFirst/proj1/js/script.js` lines 9740-9744.
- `populateOptions()` also records all currently open `details` ids at lines 9744-9748.
- `createSegmentedPillRow()` wires segmented-control clicks at lines 9885-9910. The clicked row is later destroyed/recreated when `populateOptions()` runs.
- The Fill Blanks `Question type` and `Difficulty` handlers call `saveOptions()`, then `populateOptions({ preserveAnchorId: 'settings-v2-fill-setup' })`, then `updateSettingsV2LayoutState()` at lines 9971-10008.
- `populateOptions()` clears dynamic settings containers, including `settingsV2ExerciseControls`, `settingsV2DrillActionsContainer`, `settingsV2ConjugationAdvancedContainer`, `settingsV2FillAdvancedContainer`, and related containers at lines 10222-10228.
- `populateOptions()` reapplies preserved open `details` ids and then calls `updateSettingsV2LayoutState()` before performing a manual `window.scrollBy()` anchor correction at lines 10585-10600.
- `updateSettingsV2LayoutState()` changes summaries and opens/closes `settings-v2-conjugation-setup` and `settings-v2-fill-setup` based on exercise mode at lines 9602-9670.
- CSS makes `#settings-v2-nav` sticky and gives settings sections a `scroll-margin-top`, which makes any unintended scroll correction especially visible on mobile.

Local browser reproduction:
- Opened French settings, switched exercise type to Fill Blanks, scrolled/navigated to the Fill Blanks section, and clicked `Medium`.
- Before the click, the Fill Blanks card was anchored near the top and the difficulty control was visible.
- After the click, `Conjugation Setup` appeared above Fill Blanks and the Fill Blanks section was pushed lower in the viewport.
- The difficulty state changed correctly (`Verb patterns + pronoun replacements · 1601 cards · medium` appeared in the summary), but the viewport anchor moved.

Spanish parity inspection:
- `/Users/simeon/Code/VerbsFirst/spanish-verbs/js/script.js` contains the same `fillDifficultyMode` setting and the same `populateOptions({ preserveAnchorId: 'settings-v2-fill-setup' })` pattern for the Fill Blanks difficulty handler.
- Local Spanish settings exposed the same `Fill Blanks`, `Question type`, and `Difficulty` UI. The Spanish DOM structure differs slightly, so QA did not complete the exact same selector-driven click path, but source parity makes Spanish a high-risk affected app.

### Suspected Root Cause

The most likely root cause is that a simple Fill Blanks difficulty tap triggers a full settings UI repopulation instead of an in-place state update. The difficulty handler in `/Users/simeon/Code/VerbsFirst/proj1/js/script.js` changes `cardGenerationOptions.fillDifficultyMode`, calls `saveOptions()`, and then calls `populateOptions({ preserveAnchorId: 'settings-v2-fill-setup' })`.

That full repopulation clears and rebuilds multiple settings containers, including the Fill Blanks focus/difficulty controls and advanced sections. It then reapplies prior `details[open]` state, calls `updateSettingsV2LayoutState()`, and performs a manual `window.scrollBy()` using only the top of the whole `settings-v2-fill-setup` section as the preserved anchor. On mobile, this section-level scroll correction is not stable enough for a control inside the section, especially after summaries and adjacent `details` elements are opened/closed or re-rendered. The touched button is destroyed/recreated during the click path, so browser focus/scroll anchoring can also fight the manual scroll correction.

In short: the app treats a small segmented-control change as a full settings-panel rebuild, then tries to repair the scroll position afterward. The repair is too coarse and produces the visible "dancing" behavior.

### Suggested Fix Direction

Fix the settings interaction path rather than masking the symptom with only CSS.

Recommended direction:
- For Fill Blanks `Difficulty`, avoid calling full `populateOptions()` if the only needed changes are the active pill, saved option, current-drill snapshot, count/summary text, and current card-generation behavior.
- Update the active segmented pill in place and call only narrowly scoped summary/count refresh functions where possible.
- If a re-render is unavoidable, preserve the exact touched row or button position, not just the parent `settings-v2-fill-setup` section. Run scroll preservation after all open/close and summary updates have finished.
- Remove the redundant pattern where the click handler calls `updateSettingsV2LayoutState()` immediately after `populateOptions()` already calls it.
- Be careful with `saveOptions()`, because it calls `updateCustomPresetFromUI()`, which re-renders preset cards and can change layout above/below the active section.
- Check `Question type` and `Preposition patterns` too; they use similar populate-and-preserve patterns and may have the same jump.

Likely files to edit:
- `/Users/simeon/Code/VerbsFirst/proj1/js/script.js`
- Spanish equivalent: `/Users/simeon/Code/VerbsFirst/spanish-verbs/js/script.js`
- Any generator/build path that copies or inlines these scripts into `proj1/dist/*`
- CSS only if needed as a supporting measure, not as the primary fix

### Cross-App / Regression Risk

Confirmed local reproduction is in French. Spanish is likely affected because it has the same Fill Blanks difficulty model and re-render path. Other language apps should be checked for segmented settings controls that call `populateOptions()` with section-level anchor preservation, even if they do not currently expose the exact Fill Blanks difficulty control.

Regression risks:
- Exercise type changes still need to legitimately open/close Conjugation and Fill Blanks sections.
- Topic/frequency changes and drill preset edits may still need full repopulation.
- Custom drill persistence must still update when difficulty changes.
- Settings nav active-state updates should remain correct after a fix.
- Mobile scroll behavior should be checked in both light and dark themes.

### Acceptance Criteria

- On a phone-sized viewport, tapping `Easy`, `Medium`, or `Hard` in Fill Blanks difficulty does not visibly move the settings viewport.
- The touched difficulty control remains in the same approximate screen position after each tap.
- No unrelated `details` section opens, closes, or jumps into view when only difficulty changes.
- The selected difficulty pill updates immediately and persists after closing/reopening settings.
- The current exercise summary updates to include `medium` or `hard` when applicable.
- French and Spanish both pass the same mobile settings test.
- Browser console remains free of new warnings/errors during repeated toggles.

### Suggested Verification

- Run `python3 -m http.server 8766 --bind 127.0.0.1` from `/Users/simeon/Code/VerbsFirst/proj1/dist`.
- Use browser-use or Chrome DevTools mobile emulation with a 390x844-style viewport.
- Open `http://127.0.0.1:8766/french/`, go to Settings, choose Fill Blanks, open the Fill Blanks section, and toggle `Easy`, `Medium`, and `Hard` repeatedly.
- Repeat against `http://127.0.0.1:8766/spanish/`.
- Repeat on a real phone or Android emulator against live URLs after the fix is built/deployed.
- Capture a short before/after video or DevTools performance/filmstrip trace to confirm no visible scroll jump.
- Verify persisted settings by closing/reopening settings and by refreshing the page.
- Rebuild with the repo's normal build command if source files change: `python3 /Users/simeon/Code/VerbsFirst/proj1/build.py`.

### Notes For Fixer

- QA did not edit app code, commit, or deploy.
- The attached user evidence is `/Users/simeon/Downloads/WhatsApp Video 2026-05-04 at 13.18.37.mp4`.
- Generated `proj1/dist/*` files may be stale or regenerated by build scripts. Update source paths and rebuild rather than hand-editing only dist output.
- Preserve unrelated dirty git work.
- Do not assume the fix is complete after stabilizing only the French `Difficulty` row; check Spanish and sibling segmented settings controls that use the same populate/anchor pattern.

## VF-QA-0003: Spanish Verb Detail Pronouns Overlap Conjugations

Status: Open
Reported: 2026-05-04
Reported by: User
Affected app(s): Spanish
Severity: Medium
Confidence: High

### User Report

User reports that `ustedes` is written over other text. The attached screenshot shows the Spanish verb detail page for `dar`; in the `presente` conjugation table, long pronoun labels overlap the conjugated forms. The visible collisions include `él/ella/usted` overlapping `da` and `ellos/ellas/ustedes` overlapping `dan`.

### Expected Behavior

Spanish verb detail conjugation rows should keep pronoun labels and conjugated forms visually separate on all supported phone/tablet/desktop widths. Long pronoun groups such as `él/ella/usted` and `ellos/ellas/ustedes` should wrap, stack, or reserve enough space so they never draw on top of the conjugated verb.

### Actual Behavior

In the Spanish verb detail table, long pronoun labels overflow their fixed pronoun slot and render under/over the conjugated form. QA reproduced the issue locally on the `dar` detail page and also saw the same layout failure with `hablar`, confirming this is a reusable layout bug rather than a bad `dar` data row.

### Reproduction Steps

1. Serve the built app locally from `/Users/simeon/Code/VerbsFirst/proj1/dist`:
   `python3 -m http.server 8765 --bind 127.0.0.1`
2. Open `http://127.0.0.1:8765/spanish/` in the in-app browser or Chrome.
3. Use a phone-width or otherwise constrained viewport. The user screenshot is a narrow detail layout; QA reproduced in the Codex in-app browser with a narrow visible app width.
4. Tap `Search`.
5. In the Top 20 verb list, tap `dar`.
6. Observe the `dar` detail page, especially the `presente` block.
7. The left third-person row displays as `él/ella/ustedda`, with `da` drawn on top of/against the pronoun label.
8. The right plural third-person row displays as `ellos/ellas/ustedesdan`, with `dan` drawn over the end of `ustedes`.
9. Scroll through other tenses or open another Spanish verb such as `hablar`; the same long-label overlap appears throughout the detail table.

Relevant state during QA reproduction:
- Local app URL: `http://127.0.0.1:8765/spanish/`
- Detail verb: `dar`
- Detail tense visibly affected: `presente`; other tenses also showed the same structural overlap.
- Browser console warnings/errors after reproduction: none observed.
- The user's in-app browser happened to be on `http://127.0.0.1:8765/french/__sw-log` when the report arrived, but the screenshot and reproduced bug are Spanish detail-view behavior.

### Investigation Notes

Inspected relevant files:
- `/Users/simeon/Code/VerbsFirst/spanish-verbs/js/script.js`
- `/Users/simeon/Code/VerbsFirst/spanish-verbs/css/style.css`
- `/Users/simeon/Code/VerbsFirst/proj1/dist/spanish/index.html`

Relevant source findings:
- Spanish detail pronoun rows are defined in `/Users/simeon/Code/VerbsFirst/spanish-verbs/js/script.js` lines 77-83. The long single-line labels are `él/ella/usted` and `ellos/ellas/ustedes`.
- `buildDetailPronounContent()` in the same file only stacks pronouns when the label already contains newline-separated parts, lines 196-214. Spanish labels use slash-separated single-line text, so this stacking path is not used.
- `populateVerbDetail()` builds each row as a `.conjugation-item` with a `.pronoun` span followed by a `.conjugation` span, lines 5856-5913.
- Spanish CSS defines `.conjugation-grid` as two equal columns and `.conjugation-item` as flex, `/Users/simeon/Code/VerbsFirst/spanish-verbs/css/style.css` lines 861-873.
- The pronoun span uses a fixed `width: 75px` with `flex-shrink: 0`, lines 875-880. The long Spanish labels exceed that width.
- The generated Spanish dist output has the same fixed-width rule in `/Users/simeon/Code/VerbsFirst/proj1/dist/spanish/index.html` lines 893-912, so the built app is affected too.

Browser reproduction:
- QA opened local Spanish, opened Search, clicked `dar`, and captured the detail page.
- The reproduced visual state matched the user screenshot: `dar`, translation `give`, `presente`, `yo doy`, `tú das`, `él/ella/usted` overlapping `da`, `nosotros damos`, `vosotros dais`, and `ellos/ellas/ustedes` overlapping `dan`.
- Repeating on `hablar` showed the same overlap pattern, so the issue is not limited to irregular or short conjugated forms.

French comparison:
- French uses the same general detail-grid pattern, but its visible pronoun labels are shorter in this context and did not surface this specific `ustedes` collision. This should still be treated as a layout fragility in any language with long pronoun labels.

### Suspected Root Cause

The Spanish verb detail layout uses a fixed 75px pronoun column inside each flex row. Long Spanish labels such as `él/ella/usted` and `ellos/ellas/ustedes` are wider than 75px, but the following conjugated form is still placed immediately after the 75px slot. Because the pronoun text overflows its fixed box instead of wrapping, truncating, stacking, or causing the column to widen, it draws directly under/over the conjugated form.

The existing `pronoun-stacked` helper does not prevent this because Spanish labels are slash-delimited single-line strings, not newline-delimited labels.

### Suggested Fix Direction

Fix the detail-table layout so it can handle long pronoun labels generally.

Recommended direction:
- Replace the fixed-width flex row with a grid/table-like row where the pronoun column can fit the longest label or wrap safely.
- Consider using `grid-template-columns` for each `.conjugation-item`, with a real column gap and a min/max pronoun column that works on small screens.
- Alternatively, use the existing `pronoun-stacked` path for Spanish compound pronouns by rendering `él/ella` + `usted` and `ellos/ellas` + `ustedes` as separate lines, then make sure row height and alignment remain correct.
- Avoid merely increasing `width: 75px`; that may still fail on smaller phones, translated labels, larger text settings, or other languages.
- Verify tappable-audio behavior still works for both pronoun labels and conjugated forms after changing the markup/CSS.

Likely files to edit:
- `/Users/simeon/Code/VerbsFirst/spanish-verbs/css/style.css`
- `/Users/simeon/Code/VerbsFirst/spanish-verbs/js/script.js` if the fix stacks/splits Spanish pronoun labels
- Build/generator paths that produce `/Users/simeon/Code/VerbsFirst/proj1/dist/spanish/index.html`

### Cross-App / Regression Risk

Spanish is confirmed affected. Other language apps should be audited because many share the same detail-grid idea and some have long pronoun labels:
- Portuguese already uses newline-separated labels for at least `ele/ela\nvocê`, which suggests this class of issue was partially handled elsewhere.
- Catalan, Latvian, Ukrainian, and other apps have long slash-separated pronouns that may need layout checks.
- French currently has lower risk because its detail labels are shorter, but the shared fixed-width pattern is still fragile.

Regression risks:
- Changing detail-row layout can affect all tenses and all verbs.
- Audio click/tap targets on pronouns and conjugated forms must remain intact.
- The two-column detail grid should stay readable on desktop/tablet and phone portrait/landscape widths.
- Larger text/accessibility font settings may reveal more collisions if the fix is too narrow.

### Acceptance Criteria

- On Spanish `dar`, `presente`, `él/ella/usted` and `ellos/ellas/ustedes` do not overlap `da` or `dan`.
- The same no-overlap result holds for every Spanish tense in the `dar` detail view.
- The same no-overlap result holds for at least one regular verb such as `hablar`.
- The detail view remains readable at common phone widths and at the user's screenshot-like width.
- Pronoun and conjugation audio tap targets still work.
- Browser console remains free of new errors/warnings during detail navigation.
- Generated Spanish dist output contains the corrected layout after rebuild.

### Suggested Verification

- Run `python3 -m http.server 8765 --bind 127.0.0.1` from `/Users/simeon/Code/VerbsFirst/proj1/dist`.
- Open `http://127.0.0.1:8765/spanish/`.
- Tap `Search`, then `dar`, and inspect the `presente`, `pretérito`, and `imperfecto` blocks.
- Repeat with `hablar`.
- Test phone portrait, phone landscape, and a narrow desktop viewport.
- Test with browser text zoom or app text size increased if supported.
- Verify the live built artifact after rebuilding with the normal repo build flow.

### Notes For Fixer

- QA did not edit app code, commit, or deploy.
- The user supplied the screenshot inline in the bug report; no separate image file path was provided for this report.
- The local server on port `8765` was used only for reproduction and should not be assumed to be a persistent dev server.
- Do not patch only generated `proj1/dist/spanish/index.html`; update the Spanish source and rebuild/copy through the normal build pipeline.
- Preserve unrelated dirty git work.

## VF-QA-0004: Fill Blanks Revealed Answer Clips Descenders In Blank Capsule

Status: Open
Reported: 2026-05-04
Reported by: User
Affected app(s): French / Cross-app
Severity: Medium
Confidence: High

### User Report

User reports that the `g` in `grave` is cut off: "it somehow gets eaten by the blank." The attached phone screenshot shows a French Fill Blanks card for `graver`, translation `to engrave`, tense `présent`, and the revealed sentence `Elle grave un motif simple sur la boîte.` The word `grave` is displayed inside the rounded blank/answer capsule, and the `g` descender appears clipped by the capsule.

### Expected Behavior

When a Fill Blanks answer is revealed, the full answer text should be legible. Letters with descenders such as `g`, `j`, `p`, `q`, and `y` should not be clipped by the blank capsule, regardless of theme, device pixel ratio, viewport width, or app text size.

### Actual Behavior

In the screenshot, the revealed answer `grave` is inside the blank capsule and the `g` appears visually cut/eaten by the capsule. The rest of the card is readable, so this appears to be a rendering/layout problem with the revealed answer slot rather than bad frame-card data.

### Reproduction Steps

1. Open the French app on a phone or mobile-sized viewport.
2. Use Fill Blanks mode with a broad enough verb pool to include Top 3,000 verbs.
3. Reach the generated frame card:
   - Verb: `graver`
   - Meaning: `to engrave`
   - Tense: `présent`
   - Prompt: `Elle ____ un motif simple sur la boîte.`
   - Answer: `grave`
4. Tap `Show` or otherwise reveal the answer.
5. Observe the revealed answer capsule in the main prompt line: `Elle [grave] un motif simple sur la boîte.`
6. The `g` in `grave` is clipped by the blank/answer capsule.

QA note: the screenshot is from the French app even though the in-app browser URL at report time was `http://127.0.0.1:8765/spanish/#explorer-detail-view`. The visible language, data, and UI labels in the screenshot are French.

### Investigation Notes

Inspected relevant files and generated data:
- `/Users/simeon/Code/VerbsFirst/proj1/js/script.js`
- `/Users/simeon/Code/VerbsFirst/proj1/css/style.css`
- `/Users/simeon/Code/VerbsFirst/proj1/verb_frames.french_topic_expansion.generated.json`
- `/Users/simeon/Code/VerbsFirst/proj1/verb_frames.french_topic_expansion.js`
- `/Users/simeon/Code/VerbsFirst/proj1/dist/french/latest/index.html`
- `/Users/simeon/Code/VerbsFirst/proj1/dist/french/latest/verb_frames.french_topic_expansion.js`
- `/Users/simeon/Code/VerbsFirst/spanish-verbs/css/style.css`
- `/Users/simeon/Code/VerbsFirst/german-verbs/css/style.css`

The exact frame data exists in generated French frame files:
- `/Users/simeon/Code/VerbsFirst/proj1/verb_frames.french_topic_expansion.generated.json` lines 1938-1950:
  - `frame_id`: `topic_usage_builtin_woodworking_graver_015`
  - `verb`: `graver`
  - `tense`: `present`
  - `question`: `Elle ____ un motif simple sur la boîte.`
  - `answer`: `grave`
  - `full_answer`: `Elle grave un motif simple sur la boîte.`
  - `meaning_en`: `She's engraving a simple pattern on the box.`
- The same row appears in `/Users/simeon/Code/VerbsFirst/proj1/verb_frames.french_topic_expansion.js` and built output under `/Users/simeon/Code/VerbsFirst/proj1/dist/french/latest/verb_frames.french_topic_expansion.js`.

The frame renderer in `/Users/simeon/Code/VerbsFirst/proj1/js/script.js` builds the revealed answer slot with layered spans:
- `getFrameSlotWidthCh()` returns a slot width based on answer length, lines 377-383.
- `renderFrameSentenceMarkup()` emits `.frame-slot`, `.ghost`, `.marker`, and `.answer` spans, lines 482-510.
- `updateFrameCardInlineState()` injects the solved markup into `#conjugated-verb`, lines 4443-4459.

The CSS is the likely visual failure point:
- `.frame-slot` is `inline-flex`, `position: relative`, and `overflow: hidden` in `/Users/simeon/Code/VerbsFirst/proj1/css/style.css` lines 774-780.
- `.ghost`, `.marker`, and `.answer` all force `line-height: 1` and `white-space: nowrap`, lines 787-798.
- `.answer` is absolutely positioned with `inset: 0`, lines 814-817.
- `.verb-slot` uses `height: 1.02em` and horizontal-only padding, lines 836-839.
- Dark theme keeps the same slot geometry while changing colors, lines 4924-4965.
- The built French latest output contains the same rules in `/Users/simeon/Code/VerbsFirst/proj1/dist/french/latest/index.html` lines 806-870.

Browser-use/local reproduction:
- A local server was started from `/Users/simeon/Code/VerbsFirst/proj1/dist` on port `8765` during investigation.
- QA did not find a deterministic URL route that opens a specific frame card by `frame_id`; frame cards clear the hash rather than encoding their `frameId`.
- The user screenshot is therefore the direct visual reproduction evidence, backed by exact generated data and source/CSS inspection.
- Browser console observations for the exact card were not available because the exact frame card was not route-addressable during QA.

Cross-language inspection:
- Spanish has the same newer `.frame-slot`/`.verb-slot` rendering pattern in `/Users/simeon/Code/VerbsFirst/spanish-verbs/css/style.css`.
- German also has the same newer `.frame-slot`/`.verb-slot` rendering pattern in `/Users/simeon/Code/VerbsFirst/german-verbs/css/style.css`.
- Some other apps use older `.frame-card-gap` styling or separate detail layouts, so they need targeted checks rather than assuming identical behavior.

### Suspected Root Cause

The revealed Fill Blanks answer is clipped by overly tight capsule geometry. The `.verb-slot` is only `1.02em` tall, all slot child spans use `line-height: 1`, and the parent `.frame-slot` has `overflow: hidden`. The revealed `.answer` is absolutely positioned with `inset: 0`, so descenders have very little vertical room. Glyphs like the `g` in `grave` extend below the nominal line box and are clipped by the rounded blank capsule.

This is not a `graver` data problem. The data row correctly contains `answer: "grave"` and `full_answer: "Elle grave un motif simple sur la boîte."`

### Suggested Fix Direction

Fix the frame-slot layout so revealed answers can render full glyph bounds.

Recommended direction:
- Increase vertical breathing room for `.verb-slot` and `.particle-slot` revealed answers, either with a taller min-height/line-height or vertical padding.
- Avoid `overflow: hidden` on revealed answer text, or limit clipping to the hidden-marker layer rather than the actual answer glyphs.
- Consider layering `.ghost`, `.marker`, and `.answer` with CSS grid instead of absolute `inset: 0`, so the answer participates in layout and uses the same padding as the ghost.
- Keep the capsule visually tight, but test descenders and accents explicitly before accepting the fix.
- Avoid one-off fixes for `grave`; any answer containing `g`, `j`, `p`, `q`, `y`, `ç`, accents, or combined diacritics should remain fully visible.

Likely files to edit:
- `/Users/simeon/Code/VerbsFirst/proj1/css/style.css`
- `/Users/simeon/Code/VerbsFirst/proj1/js/script.js` only if the markup/layering strategy changes
- Sibling language CSS files that copied the same `.frame-slot` pattern, especially Spanish and German
- Generated dist output via the normal build pipeline, not by hand-editing only dist

### Cross-App / Regression Risk

Confirmed user-visible report is French. Cross-app risk is real because Spanish and German use the same frame-slot layout pattern. Any app using the newer layered `.frame-slot`/`.verb-slot` renderer may clip descenders or accents in revealed Fill Blanks answers.

Regression risks:
- Hidden blank markers must still hide answers before reveal.
- Revealed answer capsules must not grow so much that main prompt lines become unstable or wrap badly.
- Particle slots with `?` markers should still align with verb slots.
- Audio/tap behavior on the solved phrase should remain intact.
- Light and dark themes need separate visual checks because they override slot colors.

### Acceptance Criteria

- The French `graver` card reveals `grave` with the full `g` visible inside the answer capsule.
- Test words containing descenders, including at least `grave`, `paye`, `mange`, `joue`, and a `q`/`y` answer if available, render without clipping.
- The same checks pass in dark and light themes.
- The answer capsule remains visually aligned with surrounding sentence text on phone portrait widths.
- Hidden unrevealed blanks still conceal the answer.
- No new layout jump or text overlap appears in Fill Blanks prompts.
- Spanish and German frame-card revealed answers are checked if their shared CSS is changed.

### Suggested Verification

- Rebuild the French app with the normal build flow after source changes.
- Serve built output locally from `/Users/simeon/Code/VerbsFirst/proj1/dist` with `python3 -m http.server 8765 --bind 127.0.0.1`.
- Open French Fill Blanks on a phone-sized viewport and verify `topic_usage_builtin_woodworking_graver_015` or an equivalent `graver` frame.
- Use a screenshot/filmstrip before and after reveal to confirm descenders are not clipped.
- Repeat in dark theme and light theme.
- Repeat with several revealed answers containing descenders.
- If shared frame-slot CSS is updated in Spanish or German, repeat equivalent Fill Blanks reveal checks in those apps.

### Notes For Fixer

- QA did not edit app code, commit, or deploy.
- The user supplied the screenshot inline in the bug report; no separate image file path was provided.
- The exact frame card is data-backed, but QA did not find a stable URL route for directly opening a specific `frame_id`.
- The local server on port `8765` was used only for investigation and should not be assumed to be persistent.
- Preserve unrelated dirty git work.
- Do not patch only generated `proj1/dist/*` or `dist-cloudflare/*`; update source and rebuild through the normal pipeline.

## VF-QA-0005: Portuguese Dark Mode Makes Fill Blanks English Sentence Barely Visible

Status: Open
Reported: 2026-05-05
Reported by: User
Affected app(s): Portuguese
Severity: Medium
Confidence: High

### User Report

Email intake from `s.shpiz@gmail.com`, subject `shit`:

`Bug report: Portuguese latest. In system and dark mode, barely visible sentence. In French it's ok`

The attached screenshot (`1000166404.png`) shows mobile Chrome on `verbsfirst.com/portuguese_` with a Portuguese Fill Blanks card for `pensar`: `Eu penso em soluções mais simples`. The English sentence `I think about simpler solutions.` is rendered near the bottom of the flashcard in a very dark, low-contrast blue/gray and is hard to read.

### Expected Behavior

Portuguese Fill Blanks frame-card English sentence/translation text should be clearly readable in both explicit Dark theme and System theme when the OS prefers dark mode. It should match the French app's current contrast and visual treatment for the same class of Fill Blanks prompt.

### Actual Behavior

In Portuguese dark/system-dark mode, `#english-verb-phrase` can render as a dim dark bluish sentence against the dark flashcard background. On mobile this makes the English sentence appear almost hidden. French does not show the same issue because its current frame-card translation styles use brighter dark-mode colors and frame-specific classes.

### Reproduction Steps

1. Use mobile Chrome, or a phone-sized browser viewport.
2. Open the latest Portuguese app. Production screenshot used `https://verbsfirst.com/portuguese_`; local build path is `http://127.0.0.1:8765/portugese/` when serving `/Users/simeon/Code/VerbsFirst/proj1/dist`.
3. Ensure app theme is either:
   - Settings -> App -> Theme -> Dark, on a device whose OS is also in dark mode, or
   - Settings -> App -> Theme -> System, on a device whose OS prefers dark mode.
4. Use Fill Blanks mode. If reproducing from a fresh local profile, skip/finish the tutorial first.
5. Navigate to a Portuguese frame card with a bottom English sentence. The user's exact data card is `pt_pensar_em_object_01_eu`:
   - `verb`: `pensar`
   - `question`: `Eu ____ soluções mais simples`
   - `answer`: `penso em`
   - `translation`: `I think about simpler solutions.`
6. Observe the English sentence below the main Portuguese prompt.

Local reproduction note: QA served `/Users/simeon/Code/VerbsFirst/proj1/dist` on port `8765`, opened `/portugese/` with Browser Use, selected Dark theme, selected Fill Blanks, skipped tutorial, and advanced to a local frame card. The same English sentence area was visibly low-contrast in dark mode. No browser console warnings/errors were observed.

### Investigation Notes

- Gmail intake:
  - Message/thread id: `19df94b95c4091fe`
  - Sender shown by Gmail tool: `Simeon Shpiz s.shpiz@gmail.com`
  - To: `lesverbes.support@gmail.com`
  - Subject: `shit`
  - Labels: `UNREAD`, `INBOX`; search excluded Spam/Trash.
  - The Gmail tool did not expose raw `Authentication-Results`, SPF, DKIM, or DMARC headers, but the available Google-visible metadata had exact sender match and no exposed warning metadata.
- Read `/Users/simeon/Code/VerbsFirst/proj1/QA_BUG_REPORTS.md`; no prior report referenced this Gmail id, attachment, or Portuguese dark-mode sentence issue. Next ID is `VF-QA-0005`.
- Downloaded and inspected inline image `1000166404.png` to `/private/tmp/vfqa_0005_gmail_1000166404.png`.
- Inspected Portuguese source:
  - `/Users/simeon/Code/VerbsFirst/portuguese-verbs/css/style.css`
  - `/Users/simeon/Code/VerbsFirst/portuguese-verbs/js/script.js`
  - `/Users/simeon/Code/VerbsFirst/portuguese-verbs/verb_frames.portuguese.generated.json`
- Inspected generated Portuguese output:
  - `/Users/simeon/Code/VerbsFirst/proj1/dist/portugese/index.html`
- Compared French source:
  - `/Users/simeon/Code/VerbsFirst/proj1/css/style.css`
  - `/Users/simeon/Code/VerbsFirst/proj1/js/script.js`
- Relevant Portuguese CSS findings:
  - `css/style.css:44-65` has a dark media rule that sets `.verb-phrase` to `color: #263040 !important` with light text-shadow. This is a dark ink color intended for light surfaces, and it applies under system dark.
  - `css/style.css:1906-1914` styles `#english-verb-phrase` generically as italic/bolder `#7f8c8d`.
  - `css/style.css:1928-1953` sets `#english-verb-phrase` in `@media (prefers-color-scheme: dark)` to `color: #263040 !important`, which is the clearest source-level match for the user's nearly invisible mobile screenshot.
  - `css/style.css:3284-3285` later sets `html[data-theme="dark"] .verb-phrase` to `#8898b0 !important`, but because the earlier `#english-verb-phrase` dark-media selector has ID specificity and `!important`, it can still win when the OS also prefers dark.
  - The generated `/Users/simeon/Code/VerbsFirst/proj1/dist/portugese/index.html` contains the same generic `#english-verb-phrase` rules and the same dark `.verb-phrase` override.
- Relevant Portuguese JS findings:
  - `js/script.js:5033-5036` sets frame-card English text with `englishVerbPhraseEl.textContent = card.translation || ''` and `style.display = ...`, but does not add any frame-specific translation class.
  - The Portuguese app does not appear to have the French helpers/classes for `frame-translation-prompt` or `pronoun-fill-translation-prompt` in the frame-card display path.
- Relevant French parity findings:
  - `/Users/simeon/Code/VerbsFirst/proj1/css/style.css:2288-2312` gives `#english-verb-phrase` and frame/pronoun translation prompt variants stronger sizing/weight.
  - `/Users/simeon/Code/VerbsFirst/proj1/css/style.css:2326-2358` sets dark-mode `#english-verb-phrase` to `#dce9f8` and frame/pronoun variants to `#f2f7ff`.
  - `/Users/simeon/Code/VerbsFirst/proj1/js/script.js:8365-8369` sets `englishVerbPhraseEl.textContent = getFramePhraseTranslationText(card)` and toggles `pronoun-fill-translation-prompt` / `frame-translation-prompt`.
  - `/Users/simeon/Code/VerbsFirst/proj1/js/script.js:8568-8570` and `8603-8605` keep frame translation visibility synchronized during reveal/hide.
- Relevant data finding:
  - `/Users/simeon/Code/VerbsFirst/portuguese-verbs/verb_frames.portuguese.generated.json:867-877` contains the user's exact `pensar` frame card and translation.

### Suspected Root Cause

Portuguese is still using older/generic `#english-verb-phrase` handling for frame-card translations. The CSS gives that element dark-mode colors intended for light backgrounds (`#263040`), and the JS does not add the newer French frame-specific prompt classes that receive bright dark-mode colors.

The most likely root cause is a Portuguese port/parity gap across:

- `/Users/simeon/Code/VerbsFirst/portuguese-verbs/css/style.css`
- `/Users/simeon/Code/VerbsFirst/portuguese-verbs/js/script.js`

The generated dist confirms the same bad styling is currently shipped in `/Users/simeon/Code/VerbsFirst/proj1/dist/portugese/index.html`.

### Suggested Fix Direction

Port the French frame-card translation display pattern into Portuguese rather than making a one-off color tweak:

- In `/Users/simeon/Code/VerbsFirst/portuguese-verbs/css/style.css`, replace the dark `#english-verb-phrase` / `.verb-phrase` treatment with readable dark-mode values similar to French (`#dce9f8` for the generic English phrase and `#f2f7ff` for frame/pronoun translation prompts).
- Add Portuguese equivalents for:
  - `#english-verb-phrase.pronoun-fill-translation-prompt`
  - `#english-verb-phrase.frame-translation-prompt`
  - dark-mode variants under both `@media (prefers-color-scheme: dark)` and explicit `html[data-theme="dark"]` if needed.
- In `/Users/simeon/Code/VerbsFirst/portuguese-verbs/js/script.js`, update the frame-card branch to toggle the same classes French uses when assigning `englishVerbPhraseEl`.
- Check whether Portuguese should also port French's `getFramePhraseTranslationText(card)` / `shouldShowFramePhraseTranslation(card)` behavior or a language-specific equivalent.
- Keep phrase-mode translation styling separate from frame-card translation styling so normal phrase practice and Fill Blanks frame cards do not regress each other.
- Rebuild Portuguese through the normal source build pipeline; do not patch only `proj1/dist/portugese/index.html`.

### Cross-App / Regression Risk

Confirmed affected app is Portuguese. French is a known-good comparison point for this specific visual state.

Cross-app risk is medium because several language ports share ancestry with the French/Portuguese flashcard layout. Audit any app whose CSS still sets `#english-verb-phrase` or `.verb-phrase` to dark colors inside `@media (prefers-color-scheme: dark)`, especially if it lacks `frame-translation-prompt` / `pronoun-fill-translation-prompt` classes in its JS.

Regression risks:
- Normal conjugation cards still use `.verb-phrase`; avoid making every secondary sentence oversized.
- Phrase-mode translation prompts should stay readable but not inherit inappropriate Fill Blanks frame sizing.
- Explicit Dark and System-dark need separate checks because the cascade differs when both `html[data-theme="dark"]` and `prefers-color-scheme: dark` are active.
- Generated dist and service-worker-cached production assets may hide source fixes until rebuilt and refreshed.

### Acceptance Criteria

- On Portuguese Fill Blanks frame cards, the English sentence is plainly readable in explicit Dark theme.
- The same sentence is plainly readable in System theme when the OS/browser prefers dark mode.
- The user's `pensar` card renders `I think about simpler solutions.` with contrast comparable to French.
- A second Portuguese Fill Blanks card also passes, proving the fix is style/path-based and not data-specific.
- French remains unchanged visually for equivalent Fill Blanks frame cards.
- Normal Portuguese conjugation and phrase-mode cards do not get oversized or overlapping English text.
- Built output in `proj1/dist/portugese/index.html` reflects the source fix after rebuild.

### Suggested Verification

- Rebuild Portuguese with the normal app build command, for example `python3 /Users/simeon/Code/VerbsFirst/portuguese-verbs/build.py` if that remains the current Portuguese build entry point.
- Serve local output from `/Users/simeon/Code/VerbsFirst/proj1/dist` with `python3 -m http.server 8765 --bind 127.0.0.1`.
- Open `http://127.0.0.1:8765/portugese/` in a phone-sized viewport.
- Settings -> App -> Theme -> Dark; Settings -> Current exercise -> Fill Blanks; skip/finish tutorial if needed.
- Verify the exact `pensar` frame if reachable through seeded/custom drill flow, or otherwise verify multiple Fill Blanks frame cards until an English sentence appears.
- Repeat with Theme -> System on a browser/device configured for dark OS preference.
- Compare with French Fill Blanks dark mode and confirm Portuguese now matches the French contrast class of UI.
- Check browser console for errors/warnings.
- If deployed, force-refresh/update the Portuguese service worker before retesting production so cached CSS/HTML is not mistaken for a failed fix.

### Notes For Fixer

- QA did not edit app code, commit, deploy, label/archive/delete Gmail, or reply to the email.
- The local server used for investigation was stopped after testing; do not assume port `8765` is still serving.
- The Portuguese built folder is currently spelled `portugese` in local dist paths. Do not silently rename routing/build output while fixing this visual bug unless that is part of a separate migration.
- `/Users/simeon/Code/VerbsFirst/proj1` had substantial unrelated dirty/untracked work before this report was appended, and `QA_BUG_REPORTS.md` itself appears untracked in `git status`. Preserve unrelated work.
- Gmail raw auth headers were not exposed by the Gmail tool; QA verified only the available Gmail metadata: exact sender, exact subject, Inbox/Unread, not Spam/Trash in search, and no exposed warning metadata.
- Attachment retained temporarily at `/private/tmp/vfqa_0005_gmail_1000166404.png` for QA context.
- This is an investigation packet only. The next agent should update source, rebuild, and verify locally before any email reply is sent.

## VF-QA-0006: Spanish Can Flash Chrome “This Site Can’t Be Reached” (ERR_FAILED) Before Loading

Status: Open
Reported: 2026-05-05
Reported by: User
Affected app(s): Spanish (likely cross-app)
Severity: Medium
Confidence: Medium

### User Report

Email intake from `s.shpiz@gmail.com`, subject `shit`:

User reports that in Spanish (and possibly other apps), when they open the app they sometimes see a browser-level “no page exists / site can’t be reached” screen, and then the app loads after a refresh. The user notes it is hard to reproduce once caching is involved and believes French may not show the same behavior.

Attached screenshot (`image.png`) shows Chrome at `https://verbsfirst.com/spanish/` displaying:
- “This site can’t be reached”
- `ERR_FAILED`

### Expected Behavior

On first open (especially on mobile) the Spanish app should show either the app UI or an app-owned loading/fallback shell. The user should not see a browser-level Chrome “site can’t be reached / no page exists” error screen before the app becomes usable.

### Actual Behavior

Intermittently (and reportedly hardest to reproduce after caching/service-worker install), Chrome shows a browser-level error page at `https://verbsfirst.com/spanish/` with `ERR_FAILED`. A refresh later succeeds and the app loads.

### Reproduction Steps

1. Use Chrome on Android or a mobile emulator/device.
2. Ensure a true first-open state for `verbsfirst.com`:
   - Clear site data, unregister service workers, and clear Cache Storage for `https://verbsfirst.com`.
3. Open `https://verbsfirst.com/spanish/` from the address bar.
4. Observe whether Chrome shows a browser-level error page (e.g., “This site can’t be reached”, `ERR_FAILED`) before the app loads.
5. Refresh and see whether the app then loads successfully.
6. Repeat for one or two other language apps; compare with `https://verbsfirst.com/french/`.

### Investigation Notes

- Gmail intake:
  - Message id: `19df95ea1b49b696`
  - Thread id: `19df95ea1b49b696`
  - Sender shown by Gmail tool: `Simeon Shpiz s.shpiz@gmail.com`
  - To: `lesverbes.support@gmail.com`
  - Subject: `shit`
  - Labels: `UNREAD`, `INBOX`; search excluded Spam/Trash.
  - The Gmail tool did not expose raw `Authentication-Results`, SPF, DKIM, or DMARC headers; QA verified only the available metadata (exact sender match, exact subject match, Inbox/Unread labels, and no exposed warning metadata).
- This report is very likely the same underlying issue as `VF-QA-0001: First Mobile Launch Can Flash Browser Error Before App Loads`, but includes a concrete Spanish screenshot (`ERR_FAILED`) and user-confirmed intermittent behavior.
- Downloaded and inspected the screenshot attachment to `/private/tmp/vfqa_0006_gmail_image.png`.
- Current availability check from QA machine:
  - `curl -I https://verbsfirst.com/spanish/` returned `HTTP/2 200` at `2026-05-05T18:32:51Z`.
  - `curl -I https://verbsfirst.com/french/` returned `HTTP/2 200` at `2026-05-05T18:32:52Z`.
- Inspected Spanish built service worker:
  - `/Users/simeon/Code/VerbsFirst/proj1/dist/spanish/sw.js`
  - Notable: Spanish SW includes `PRECACHE_URLS = [index.html, manifest.json, favicon_big.png, version.json]` and provides a navigation fallback HTML shell with `status: 200` if network/cache miss occurs under SW control.
  - Inference: the screenshot’s Chrome-native `ERR_FAILED` is consistent with a failure *before* the Spanish SW is installed/controlling the page (true first open) or an intermittent network/CDN failure on the initial document request.
- Browser-use reproduction attempt was not feasible in this run: the browser-use backend `iab` was not discoverable (“No Codex IAB backends were discovered.”).

### Suspected Root Cause

Likely the same “true first open” gap described in `VF-QA-0001`: before a language app service worker is installed/active and before any app-owned cached shell exists, the initial navigation depends on the live network and any redirects/CDN behavior. If that first document request intermittently fails on mobile, Chrome can show a native error UI (`ERR_FAILED`). Once the app loads once (and SW + caches are established), the behavior becomes much harder to reproduce.

### Suggested Fix Direction

- Treat as cross-app and consolidate with `VF-QA-0001` if desired; this report primarily adds Spanish screenshot evidence.
- Focus on making the very first navigation to a language path resilient:
  - Ensure the first document request reliably returns quickly (server/CDN/redirect behavior).
  - Consider whether an app-owned minimal shell can be served even before SW control (or whether install-time caching + immediate control is sufficient across apps).
- When investigating, use a real phone and clear all site data to validate whether the error is a network/server response failure or a service-worker timing gap.

### Acceptance Criteria

- On Chrome Android with all site data cleared, opening `https://verbsfirst.com/spanish/` does not show a Chrome-native “This site can’t be reached / ERR_FAILED” (or similar) error page before any app UI appears.
- The same passes for French and at least one other language app.
- If the network is flaky, the user sees only app-owned UI (loading shell/offline shell), not a Chrome-native error page.

### Suggested Verification

- Run the same first-open tests described in `VF-QA-0001` on a real phone (clear site data, unregister SW, clear caches), and capture a screen recording on Spanish first navigation under Slow 3G / unstable network.
- Check `https://verbsfirst.com/spanish/__sw-log` after a successful load to confirm install/activate/warm-index timing, and correlate with any observed error frames.

### Notes For Fixer

- QA did not edit app code, commit, deploy, label/archive/delete Gmail, or reply to the email.
- The attachment is retained temporarily at `/private/tmp/vfqa_0006_gmail_image.png` for QA context.
- Preserve unrelated dirty/untracked work in `/Users/simeon/Code/VerbsFirst/proj1`.

## VF-QA-0007: Spanish Install Modal Is Unreadable In System Dark Mode And Falls Back From Direct Install

Status: Open
Reported: 2026-05-06
Reported by: User
Affected app(s): Spanish
Severity: Medium
Confidence: High

### User Report

Gmail intake message `19dfc8a9953e6617` from `s.shpiz@gmail.com`, subject `shit`, received 2026-05-06 09:06:58 UTC:

> Spanish (regular and _latest)
>
> Installing doesn't work/isn't set up correctly

The attached mobile Chrome screenshot shows `verbsfirst.com/spanish/#o...` with the App settings install dialog open. The modal title is "Install this app" and the body says the browser did not expose a direct install prompt. On the screenshot the panel is light/white while the title and numbered steps are nearly white, making the install instructions effectively unreadable.

### Expected Behavior

On supported Chrome Android / Chromium browsers, Spanish regular and Spanish latest should either open the native PWA install prompt or provide a clear, readable fallback with accurate platform-specific instructions. The install modal must remain readable in Light, Dark, and System theme modes, including when the device/browser prefers dark color scheme.

### Actual Behavior

On the reported phone, tapping the install action opens the fallback "Install this app" instructions instead of a direct install prompt. In the attached screenshot, the fallback modal is also visually broken: the panel is light, but the title and ordered-list steps render almost white, so the user cannot read the guidance. The body and note text are faint gray.

### Reproduction Steps

1. Use mobile Chrome or a Chromium browser on a dark-system device, preferably with a fresh profile/site data and the app not already installed.
2. Open `https://verbsfirst.com/spanish/`.
3. Repeat with `https://verbsfirst.com/spanish_latest/`.
4. Open Settings using the gear button.
5. Open the App settings section.
6. Ensure Theme is set to `System` and the device/browser `prefers-color-scheme` is dark. This is the default path because `themeMode` defaults to `system`.
7. Tap `Install app` / `Start install`.
8. Observe whether the browser native PWA prompt opens. If it does not, observe the fallback modal contrast.

Local browser-use reproduction on `http://127.0.0.1:8765/spanish/` confirmed the fallback path opens the same "This browser did not expose a direct install prompt just now..." modal when `beforeinstallprompt` is unavailable. With `html[data-theme="dark"]` forced, the modal is readable. The reported screenshot matches the `System` theme + dark media-query path, where `html[data-theme]` is absent.

### Investigation Notes

- Read the Gmail message and inline image attachment from message `19dfc8a9953e6617`. The message matched exact sender `s.shpiz@gmail.com`, exact subject `shit`, and was labeled `INBOX`; Gmail connector did not expose SPF/DKIM/DMARC headers, but for this trusted strict-match intake case that should no longer block processing.
- Downloaded the attached screenshot to `/private/tmp/vfqa_0007_gmail_1000166475.png` for local viewing. The screenshot shows Chrome mobile on `verbsfirst.com/spanish/` with a low-contrast install fallback modal.
- Inspected Spanish source:
  - `/Users/simeon/Code/VerbsFirst/spanish-verbs/index.html:30` links `manifest.json`.
  - `/Users/simeon/Code/VerbsFirst/spanish-verbs/index.html:1367` defines `#app-install-modal`.
  - `/Users/simeon/Code/VerbsFirst/spanish-verbs/js/script.js:319` initializes theme handling. `themeMode` defaults to `system`; `applyTheme('system')` removes `html[data-theme]`.
  - `/Users/simeon/Code/VerbsFirst/spanish-verbs/js/script.js:1571` treats direct install support as only `!!installState.deferredPrompt`.
  - `/Users/simeon/Code/VerbsFirst/spanish-verbs/js/script.js:1608` builds install instructions.
  - `/Users/simeon/Code/VerbsFirst/spanish-verbs/js/script.js:1689` opens the direct prompt only when `installState.deferredPrompt` exists; otherwise it opens fallback instructions.
  - `/Users/simeon/Code/VerbsFirst/spanish-verbs/js/script.js:1819` captures `beforeinstallprompt` and stores `installState.deferredPrompt`.
- Inspected Spanish install CSS:
  - `/Users/simeon/Code/VerbsFirst/spanish-verbs/css/style.css:124` sets dark-mode root variables under `@media (prefers-color-scheme: dark)`, including `--text-color: #f4f7f9` and `--meta-color: #b0b8c1`.
  - `/Users/simeon/Code/VerbsFirst/spanish-verbs/css/style.css:3180` sets `.install-modal-panel` to a light `rgba(255, 255, 255, 0.97)` background and `color: var(--text-color)`.
  - `/Users/simeon/Code/VerbsFirst/spanish-verbs/css/style.css:3203` `.install-modal-title` has no explicit color.
  - `/Users/simeon/Code/VerbsFirst/spanish-verbs/css/style.css:3217` `.install-modal-steps` has no explicit color.
  - `/Users/simeon/Code/VerbsFirst/spanish-verbs/css/style.css:3854` only darkens `.install-modal-panel` for `html[data-theme="dark"]`, not for system dark mode when no `data-theme` attribute exists.
  - `/Users/simeon/Code/VerbsFirst/spanish-verbs/css/style.css:3859` only sets dark override color for close/text/note, not title/steps.
- Inspected generated Spanish Cloudflare output and found the same install modal logic/style in `/Users/simeon/Code/VerbsFirst/proj1/dist-cloudflare/spanish/index.html` and `/Users/simeon/Code/VerbsFirst/proj1/dist-cloudflare/spanish_latest/index.html`.
- Compared manifests:
  - Live `https://verbsfirst.com/spanish/manifest.json` returns HTTP 200 and uses `id: "./"`, `start_url: "./"`, `scope: "./"`, name `Los Verbos`.
  - Live `https://verbsfirst.com/spanish_latest/manifest.json` returns HTTP 200 and uses `id: "/spanish_latest/"`.
  - French generated manifest uses `id: "/french/"`.
  - The manifest files exist and the 512px icon entry is present, so this is not a simple missing-manifest or missing-icon failure.
- Browser-use check served `/Users/simeon/Code/VerbsFirst/proj1/dist-cloudflare` locally on `127.0.0.1:8765`, opened `/spanish/`, navigated Settings -> App, and clicked the install action. The in-app browser does not expose `beforeinstallprompt`, so the fallback modal appeared. This verifies the fallback code path, although true native PWA prompt availability still needs a real Chrome Android / production HTTPS test.
- French source has the same install modal CSS pattern in `/Users/simeon/Code/VerbsFirst/proj1/css/style.css:4070` and `:4995`, so the visual contrast bug may not be Spanish-only even though this report is for Spanish.

### Suspected Root Cause

The low-contrast modal is caused by a CSS cascade gap in System dark mode. In System mode, `applyTheme('system')` removes `html[data-theme]`, while `@media (prefers-color-scheme: dark)` sets text variables to light colors. The base `.install-modal-panel` remains a light/white panel because the dark panel override is scoped only to `html[data-theme="dark"] .install-modal-panel`. As a result, `.install-modal-title` and `.install-modal-steps` inherit near-white text on a near-white panel.

The direct-install failure is less certain from static inspection because mobile browser installability depends on platform, current install state, engagement heuristics, manifest validity, and service-worker state. The Spanish regular manifest is a suspicious difference from French and Spanish latest because regular Spanish uses `id: "./"` while French and Spanish latest use absolute path IDs. If Chrome treats the manifest identity/scope differently between `/spanish/` and `/spanish_latest/`, it may reduce reliability or make installed-state/prompt behavior confusing.

### Suggested Fix Direction

Fix the modal contrast first because it is clearly reproducible and affects the fallback path:

- Add explicit theme-safe colors for `.install-modal-title`, `.install-modal-steps`, and list items.
- Add an install-modal dark styling path for System dark mode, e.g. an `@media (prefers-color-scheme: dark)` rule that mirrors the `html[data-theme="dark"]` panel/background/text treatment when `html[data-theme]` is absent.
- Keep `html[data-theme="light"]` overriding system dark so a user-forced Light theme remains readable.
- Prefer defining modal-specific CSS variables or explicit panel/text token pairs so panel background and inherited text color cannot diverge again.

Then audit the installability path:

- Test Spanish regular and Spanish latest on real Chrome Android over HTTPS with clean site data and the app not installed.
- Confirm whether `beforeinstallprompt` fires for both paths.
- Normalize the Spanish regular manifest identity if appropriate. French uses `id: "/french/"` and Spanish latest uses `id: "/spanish_latest/"`; regular Spanish should likely use a stable absolute `id` such as `/spanish/` unless there is a deliberate reason for `./`.
- Ensure generated deploy outputs keep `start_url`, `scope`, `id`, manifest link, and service-worker registration consistent per path.
- Consider logging install prompt state to the existing debug / `__sw-log` surface so future reports can distinguish "browser does not support prompt" from "PWA installability failed".

### Cross-App / Regression Risk

The CSS contrast bug is likely cross-app for apps that inherited the French install modal styles. French has the same pattern: a light base install modal, dark root variables under system dark, and dark panel overrides only under `html[data-theme="dark"]`. Spanish regular/latest are confirmed affected by the report and generated output; Portuguese, German, Italian, Russian, and French should be checked for the same `.install-modal-panel` / System theme cascade.

Manifest identity risk appears Spanish-specific from the inspected files: Spanish regular uses `id: "./"`, while French and Spanish latest use absolute path IDs. Still, all language apps should be checked for path-specific manifest identity, scope, start URL, and service-worker registration consistency.

### Acceptance Criteria

- In Spanish regular and Spanish latest, Settings -> App -> Start install never shows unreadable install text in Light, Dark, or System theme.
- On a dark-system phone with Theme set to System, the install modal panel and all text meet normal contrast expectations; title, numbered steps, body, note, and close button are readable.
- On Chrome Android with a fresh profile/site data and the app not already installed, tapping Start install opens the native install prompt when Chrome considers the PWA installable.
- If Chrome does not expose a native install prompt, the fallback modal remains readable and accurately explains the user's platform/browser options.
- Spanish regular and Spanish latest have stable, path-specific manifest identity/scope/start URL values and do not collide with each other or with other language apps.

### Suggested Verification

- Build Spanish and generated Cloudflare outputs after the fix:
  - `python3 /Users/simeon/Code/VerbsFirst/spanish-verbs/build.py`
  - `python3 /Users/simeon/Code/VerbsFirst/proj1/build.py`
- Serve the built output locally and use browser-use:
  - `cd /Users/simeon/Code/VerbsFirst/proj1/dist-cloudflare`
  - `python3 -m http.server 8765 --bind 127.0.0.1`
  - Open `http://127.0.0.1:8765/spanish/` and `http://127.0.0.1:8765/spanish_latest/`.
  - In Settings -> App, test Theme `Light`, `Dark`, and `System`, then click Start install and visually inspect the modal.
- On a real Android device:
  - Clear Chrome site data for `verbsfirst.com`.
  - Ensure the PWA is not already installed.
  - Visit `https://verbsfirst.com/spanish/`, then `https://verbsfirst.com/spanish_latest/`.
  - Open Settings -> App -> Start install.
  - Confirm whether `beforeinstallprompt` fires/native install prompt opens.
- Use Chrome DevTools / Lighthouse Application checks where possible:
  - Manifest loaded without warnings.
  - 512px icon loads.
  - Service worker controls the page.
  - Manifest `id`, `scope`, and `start_url` are path-specific and expected.

### Notes For Fixer

- Do not assume the fallback text means manifest is missing. Live Spanish manifests were reachable, and the local generated output had manifest links and install code present.
- The attached Gmail screenshot is the strongest evidence for the System dark contrast failure; the local in-app browser only reproduced the fallback path directly because it did not emulate the same dark-system mobile Chrome conditions.
- The source-of-truth files appear to be under `/Users/simeon/Code/VerbsFirst/spanish-verbs/`; generated files under `/Users/simeon/Code/VerbsFirst/proj1/dist-cloudflare/` should be regenerated, not hand-edited.
- There is unrelated dirty work in the repository. Preserve it.
- No app code was changed during this QA intake.

## VF-QA-0008: French Latest Verb Expression Shows “que soi” Instead Of Tonic Pronoun (Appears Fixed Locally)

Status: Open
Reported: 2026-05-05
Reported by: User
Affected app(s): French Latest
Severity: Low
Confidence: High

### User Report

Gmail intake message `19df98478f1e533f` from `s.shpiz@gmail.com`, subject `shit`, received `email_ts=2026-05-05T19:01:30`:

> This is wrong it think
>
> Soi should conjugate with je/tu/....
>
> If I'm not wrong about the french then the conjugation data needs to be updated

The attached screenshot shows `verbsfirst.com/french_latest` with the verb detail table for the verb expression `s'en prendre à plus faible que soi`. In the screenshot, multiple rows render “…à plus faible que soi” instead of agreeing the final “soi” with the subject (e.g., `… que moi / toi / lui / nous / vous / eux`).

### Expected Behavior

For the verb expression `s'en prendre à plus faible que soi`, conjugated rows should agree the tail “que soi” to the subject’s tonic pronoun:

- `je … que moi`
- `tu … que toi`
- `il/elle/on … que lui`
- `nous … que nous`
- `vous … que vous`
- `ils/elles … qu'eux`

This agreement should hold across simple and compound tenses (e.g., futur simple, passé composé, plus-que-parfait).

### Actual Behavior

In the attached screenshot, the tail remains “que soi” for multiple subjects and tenses (e.g., `il s'en prendra à plus faible que soi`, `ils s'en prendront à plus faible que soi`, and compound forms like `je m'en suis pris à plus faible que soi`).

In the current local generated output (built 2026-05-06), the conjugations for this expression appear correct across tenses (see Investigation Notes). This suggests the issue may already be fixed in source and just needs regeneration/deploy (or the report reflects a stale/cached prod build).

### Reproduction Steps

1. Open `https://verbsfirst.com/french_latest/`.
2. Navigate to the verb details view for `s'en prendre à plus faible que soi`.
3. Inspect rows in futur simple and passé composé.
4. Verify whether the tail uses “que soi” (bug) or tonic pronouns like “que lui / qu'eux” (expected).

### Investigation Notes

- Read the Gmail message and inline image attachment from message `19df98478f1e533f`. The message matched exact sender `s.shpiz@gmail.com`, exact subject `shit`, and was labeled `INBOX`. No Gmail spoofing/phishing warning metadata was exposed by the connector output.
- Downloaded the attached screenshot to `/private/tmp/vfqa_0008_gmail_1000166416.png` for local viewing.
- Located the source expression spec:
  - `/Users/simeon/Code/VerbsFirst/proj1/generate_french_verb_expressions.py:121` defines the expression and tail `à plus faible que soi`, but the example usage already implies agreement: `Il s'en prend à plus faible que lui.`
  - `/Users/simeon/Code/VerbsFirst/proj1/generate_french_verb_expressions.py:287-317` implements tail agreement via `TONIC_REFLEXIVE_REPLACEMENTS` and `agree_tail()`, including `que soi -> que moi/toi/lui/nous/vous/qu'eux`.
- Verified current local French latest output includes agreed conjugations (i.e., no “que soi” in conjugated rows) in:
  - `/Users/simeon/Code/VerbsFirst/proj1/dist/french_latest/js/verbs.starter.generated.js` (tenses table entries for `s'en prendre à plus faible que soi` contain `… que moi/toi/lui/nous/vous/qu'eux` across multiple tenses).

### Suspected Root Cause

The report and screenshot are consistent with a build where tail agreement for `que soi` was not applied during expression conjugation generation (or where a stale cached build still serves pre-fix generated data). The current generator includes `TONIC_REFLEXIVE_REPLACEMENTS`, so the most likely cause is “fixed in source, not in deployed artifacts”.

### Suggested Fix Direction

- Ensure French latest is built and deployed from a generator version that includes `TONIC_REFLEXIVE_REPLACEMENTS` / `agree_tail()` logic.
- Verify that production `french_latest` artifacts (especially `js/verbs.starter.generated.js` and any dynamically fetched conjugation payloads) match the regenerated output.
- If users can be stuck on stale caches, consider a version bump / cache-bust in `version.json` or equivalent to force updated conjugation payloads.

### Acceptance Criteria

- In production French latest, `s'en prendre à plus faible que soi` never displays “que soi” in conjugated rows; it displays `que moi/toi/lui/nous/vous/qu'eux` as appropriate across tenses.
- A hard refresh (and a fresh browser profile) shows the corrected conjugations.

### Notes For Fixer

- Message id: `19df98478f1e533f`
- Thread id: `19df98478f1e533f`
- Preserve unrelated dirty/untracked work in `/Users/simeon/Code/VerbsFirst/proj1`.
- No app code was changed during this QA intake.

## VF-QA-0007 Follow-up: Install Works On `www` But Not Bare Domain

Status: Open
Reported: 2026-05-06
Reported by: User
Related bug: VF-QA-0007
Affected app(s): Spanish / Cross-app
Severity: Medium
Confidence: High

### User Report

The user clarified the Spanish install issue: `VF-QA-0007` "works on www but not without www." They were unsure about the prior root-cause description and suggested this hostname difference may be a clue.

### Investigation Notes

- Checked production `https://verbsfirst.com/spanish/` and `https://www.verbsfirst.com/spanish/`.
- Both hostnames return `HTTP/2 200`; neither redirects to the other hostname.
- Both hostnames serve the same Spanish regular manifest content at `/spanish/manifest.json`:
  - `id: "./"`
  - `start_url: "./"`
  - `scope: "./"`
  - `display: "standalone"`
- Both hostnames serve the same Spanish latest manifest content at `/spanish_latest/manifest.json`, including `id: "/spanish_latest/"`.
- Both hostnames serve identical `/spanish/sw.js` content by SHA-256, and both service-worker responses use `cache-control: no-cache, no-store, must-revalidate`.
- The fetched `/spanish/` HTML bodies differ only in Cloudflare-generated email-protection/challenge snippets; the application payload is otherwise the same.
- `/Users/simeon/Code/VerbsFirst/proj1/connect_cloudflare_domain.sh:23` attaches both `verbsfirst.com` and `www.verbsfirst.com` as Cloudflare Pages custom domains by default.
- `/Users/simeon/Code/VerbsFirst/proj1/_headers` and `/Users/simeon/Code/VerbsFirst/proj1/dist-cloudflare/_headers` only set no-cache headers for service workers; they do not define a canonical host redirect.
- Spanish registers its service worker with `navigator.serviceWorker.register('./sw.js', { scope: './' })`, so the registration scope is per-origin and per-path. Install prompt capture is still via `beforeinstallprompt`.

### Updated Suspected Root Cause

The hostname clue strongly suggests an origin-canonicalization problem in addition to the modal contrast bug already documented in `VF-QA-0007`.

For browser/PWA behavior, `https://verbsfirst.com` and `https://www.verbsfirst.com` are separate origins. Chrome stores service workers, Cache Storage, localStorage, engagement/install heuristics, install prompt suppression state, and installed PWA identity per origin. Because production currently serves the app on both hostnames without redirecting one to the other, Chrome can treat them as two separate Spanish apps. An install prompt working on `www.verbsfirst.com` does not prove the bare-domain origin is installable or in the same install state.

The relative Spanish regular manifest `id: "./"` makes this more confusing because it resolves separately under each origin. Even the absolute-path latest ID still resolves against the current origin, so `https://www.verbsfirst.com/spanish_latest/` and `https://verbsfirst.com/spanish_latest/` remain different PWA identities unless the site canonicalizes the host.

### Suggested Fix Direction

- Choose a canonical production host for app use and PWA install, likely the host that currently works for install.
- Add a production-level redirect from the non-canonical host to the canonical host for all app paths before app code runs. This may need Cloudflare Pages/domain redirect configuration rather than JavaScript app code.
- If both hostnames must remain active, explicitly test and support PWA install independently on both origins, but this is riskier because users may get duplicate installs, separate caches, and separate app state.
- Keep the original `VF-QA-0007` modal contrast fix: even with canonicalization, the fallback modal must be readable in System dark mode.
- Normalize Spanish manifest IDs to explicit path IDs (`/spanish/`, `/spanish_latest/`) after deciding the canonical host, and verify all generated deployments follow the same pattern.

### Acceptance Criteria Additions

- Opening `https://verbsfirst.com/spanish/` and `https://www.verbsfirst.com/spanish/` leads to a single canonical origin before install UI is used, or both origins are deliberately supported and verified.
- The same canonical behavior applies to `spanish_latest`.
- Chrome Android with fresh site data shows the native install prompt from the canonical host when the PWA is installable.
- Installing from the canonical host does not create duplicate app identities for `www` and bare domain.
- Service-worker debug logs (`__sw-log`) show the expected canonical `registration.scope`.

### Suggested Verification Additions

- On a real Android Chrome device, clear site data separately for both `https://verbsfirst.com` and `https://www.verbsfirst.com`.
- Test direct navigation to:
  - `https://verbsfirst.com/spanish/`
  - `https://www.verbsfirst.com/spanish/`
  - `https://verbsfirst.com/spanish_latest/`
  - `https://www.verbsfirst.com/spanish_latest/`
- Confirm whether the address bar ends on the chosen canonical host before tapping Settings -> App -> Start install.
- Inspect Chrome DevTools Application panel for manifest ID, start URL, service-worker scope, and installed app identity on the canonical host.
- Run header checks after any deployment change to confirm redirect behavior:
  - `curl -I https://verbsfirst.com/spanish/`
  - `curl -I https://www.verbsfirst.com/spanish/`
  - `curl -I https://verbsfirst.com/spanish_latest/`
  - `curl -I https://www.verbsfirst.com/spanish_latest/`

### Notes For Fixer

- This follow-up does not invalidate the System dark modal contrast finding in `VF-QA-0007`; it adds a separate production-origin clue for why direct install may work on one hostname and fail on the other.
- Avoid testing only one hostname. PWA installability must be checked on the exact origin users open.
- QA did not edit app code, commit, deploy, or change Cloudflare config.

## VF-QA-0009: Portuguese Latest Fill Blanks Has No Settings Section

Status: Open
Reported: 2026-05-07
Reported by: User
Affected app(s): Portuguese (portugese_latest)
Severity: Medium
Confidence: High

### User Report

Email intake from `s.shpiz@gmail.com`, subject `shit`:

> Portuguese
> Latest
>
> I can enable fill blanks but they don't have settings
>
> Also
>
> In dark and sustem mode the color of the English translation on the card is illegible because of font and color

Two attached iOS screenshots show Portuguese Settings with Current exercise set to Fill Blanks (672 questions) and Theme toggled to Dark. The Settings top navigation pills show `Conjugation`, `Text To Speech`, and `App`, but no `Fill Blanks` section is visible.

The “English translation illegible in dark/system” symptom matches the earlier Portuguese contrast report in `VF-QA-0005`, but this email adds a separate complaint: Fill Blanks is enabled, yet the app provides no Fill Blanks settings surface.

### Expected Behavior

When Portuguese Fill Blanks is available and selectable, Settings should expose a Fill Blanks section (similar to Spanish/German) with Fill Blanks controls such as question-type focus and difficulty (or the equivalent Portuguese feature-set).

### Actual Behavior

On Portuguese latest (as shown in the screenshots), Fill Blanks can be enabled as the current exercise, but there is no visible Fill Blanks settings section in Settings navigation, and the user cannot find Fill Blanks-specific controls.

### Reproduction Steps

1. Open Portuguese latest.
2. Go to Settings.
3. Set Current exercise to Fill Blanks.
4. Look for a Fill Blanks section/tab in the Settings navigation, and for Fill Blanks-specific controls (question type / difficulty or equivalents).
5. Compare with a Fill Blanks-enabled app (e.g., Spanish) where those controls exist.

### Investigation Notes

- Gmail intake:
  - Message id: `19e01abba4a1ae29`
  - Thread id: `19e01abba4a1ae29`
  - Sender shown by Gmail tool: `Simeon Shpiz s.shpiz@gmail.com`
  - Labels at intake time: `UNREAD`, `INBOX` (not Spam/Trash). No Gmail spoofing/phishing warning metadata was exposed by the connector output.
- Downloaded the two PNG attachments for local viewing:
  - `/private/tmp/vf-gmail-bug-intake/1000166548.png`
  - `/private/tmp/vf-gmail-bug-intake/1000166549.png`
- Local dist inspection suggests Portuguese latest is missing the Fill Blanks settings-v2 section entirely:
  - `/Users/simeon/Code/VerbsFirst/proj1/dist/portugese_latest/index.html` does **not** contain the `settings-v2-fill-setup` section marker or the `Question type` Fill Blanks settings label used by Spanish.
  - `/Users/simeon/Code/VerbsFirst/proj1/dist/spanish/index.html` **does** contain `settings-v2-fill-setup` and Fill Blanks settings UI strings like `Question type`.
- The Portuguese app source appears to be maintained separately from the shared `proj1/js/script.js` path:
  - `/Users/simeon/Code/VerbsFirst/portuguese-verbs/js/script.js` does not contain `settings-v2-fill-setup`, suggesting Portuguese may be missing the newer Fill Blanks settings-v2 integration that exists in other languages.
- Browser-use reproduction was not feasible in this run because the in-app browser backend was unavailable (`iab` backend discovery returned no browsers). This report relies on user screenshots plus local artifact/source inspection.

### Suspected Root Cause

Portuguese latest appears to be built from a code path that does not include the newer Settings-v2 Fill Blanks setup section (question type / difficulty). Fill Blanks can still be selected as the current exercise, but the settings UI does not include the Fill Blanks-specific controls, likely because Portuguese’s app source has diverged from the shared script that added those controls for other languages.

### Suggested Fix Direction

- Port the Settings-v2 Fill Blanks section (or an appropriate Portuguese equivalent) into the Portuguese app source used to generate `portugese_latest`, so Fill Blanks selection has a discoverable settings surface.
- Ensure the Portuguese build pipeline uses the same up-to-date settings-v2 implementation as Spanish/German (or explicitly document intentional differences if Portuguese is meant to omit Fill Blanks controls).
- Re-check the “English translation illegible in dark/system” issue against `VF-QA-0005` and confirm Portuguese latest artifacts actually include the contrast fix (or bump/cache-bust if users can remain on stale HTML/CSS).

### Acceptance Criteria

- In Portuguese latest, Settings navigation includes a visible Fill Blanks section when Fill Blanks is available.
- The Fill Blanks section exposes the intended Fill Blanks controls (question type / difficulty, or the Portuguese-specific equivalent).
- Switching Fill Blanks settings updates the current exercise behavior without breaking Conjugation settings.
- The Portuguese Fill Blanks English translation text is readable in explicit Dark and System-dark themes (see `VF-QA-0005`).

### Suggested Verification

- Rebuild Portuguese latest through the normal build flow (do not patch only `dist`).
- Serve locally from `/Users/simeon/Code/VerbsFirst/proj1/dist` and test `http://127.0.0.1:<port>/portugese_latest/` on a phone-sized viewport.
- Confirm Settings shows a Fill Blanks section and its controls, and that they work.
- Compare with Spanish/German settings-v2 behavior for parity of layout and discoverability.
- On a real iOS device/PWA install, test both Theme -> Dark and Theme -> System (with OS dark preference) to confirm translation contrast.

### Notes For Fixer

- Message id: `19e01abba4a1ae29`
- Thread id: `19e01abba4a1ae29`
- QA did not edit app code, commit, deploy, or reply to the email.

## VF-QA-0010: Intermittent Chrome “This Site Can’t Be Reached” (ERR_FAILED) On French And `portuguese_latest`

Status: Open
Reported: 2026-05-07
Reported by: User
Related bugs: VF-QA-0001, VF-QA-0006
Affected app(s): French, Portuguese (`portuguese_latest`)
Severity: Medium
Confidence: High

### User Report

Email intake from `s.shpiz@gmail.com`, subject `shit`:

> I still briefly see this (not always). Examples from french and Portuguese

Two iOS screenshots show Chrome’s error page:

- `https://verbsfirst.com/french/` → `ERR_FAILED`
- `https://verbsfirst.com/portuguese_latest/` → `ERR_FAILED`

### Expected Behavior

Opening French and Portuguese latest should never show a browser-level “This site can’t be reached” error page, even briefly. If the network is flaky, the user should see app-owned UI (cached shell or a branded fallback) rather than a Chrome error screen.

### Actual Behavior

On iOS Chrome (intermittent), the user briefly sees a Chrome-level `ERR_FAILED` error page for both French and `portuguese_latest`, after which the app/page loads.

### Investigation Notes

- Read the Gmail message and two PNG attachments from message `19e026a420be1d9c`. The message matched exact sender `s.shpiz@gmail.com`, exact subject `shit`, and was labeled `INBOX`. No Gmail spoofing/phishing warning metadata was exposed by the connector output.
- Downloaded the attached screenshots for local viewing:
  - `/private/tmp/vf-bug-intake/19e026a420be1d9c-1000166599.png` (French `ERR_FAILED`)
  - `/private/tmp/vf-bug-intake/19e026a420be1d9c-1000166598.png` (Portuguese `ERR_FAILED`)
- Production checks show `https://verbsfirst.com/french/sw.js` is correctly served as JavaScript (`content-type: application/javascript`).
- Production checks for `https://verbsfirst.com/portuguese_latest/` look misconfigured as an app route:
  - `https://verbsfirst.com/portuguese_latest/sw.js` is served as `text/html` (HTML document, not service-worker JavaScript).
  - `https://verbsfirst.com/portuguese_latest/manifest.json` is also served as HTML, not JSON.
  - In contrast, `https://verbsfirst.com/portugese_latest/manifest.json` is valid JSON and `https://verbsfirst.com/portugese_latest/sw.js` is valid JavaScript.
- This suggests users opening `portuguese_latest` may have **no working service worker**, so every navigation remains network-dependent; transient network failures are more likely to present as Chrome’s `ERR_FAILED` screen.
- Browser-use reproduction was not feasible in this run (in-app browser tooling unavailable), so this report relies on user screenshots plus production HTTP checks and local artifact inspection.

### Suspected Root Cause

This appears to be a combination of:

- A cross-app “true first open / uncontrolled navigation” gap already documented in `VF-QA-0001` / `VF-QA-0006`, where a transient network failure during initial navigation can surface Chrome’s `ERR_FAILED` UI before the app loads.
- A `portuguese_latest` deployment/config issue where `sw.js` and `manifest.json` are served as HTML, preventing service-worker registration and PWA/offline behavior. Without a working service worker, intermittent network failures remain visible to the user on subsequent opens, not just on first open.

### Suggested Fix Direction

- Decide on a single canonical Portuguese latest path (`/portugese_latest/` vs `/portuguese_latest/`) and enforce it:
  - Either (a) make `/portuguese_latest/` serve the actual Portuguese latest app assets with correct content-types for `sw.js` and `manifest.json`, or
  - (b) redirect `/portuguese_latest/` (and its subpaths) to `/portugese_latest/` so users don’t land on a broken PWA route.
- Ensure the canonical Portuguese latest route has a working service worker and manifest, so the app can show app-owned UI under flaky network conditions.
- For French (and other apps with working SW), continue pursuing the “no Chrome error screen on first open” acceptance criteria from `VF-QA-0001`.

### Acceptance Criteria

- On production, `https://verbsfirst.com/portuguese_latest/sw.js` is JavaScript (`content-type: application/javascript`) and registers successfully, or the route permanently redirects to the canonical working Portuguese latest path.
- `https://verbsfirst.com/portuguese_latest/manifest.json` is valid JSON with appropriate `id`, `start_url`, and `scope` (or redirects to the canonical manifest).
- On iOS/Android Chrome with fresh site data and under throttled/flaky network, opening `https://verbsfirst.com/french/` and Portuguese latest never shows a Chrome `ERR_FAILED` error page before app-owned UI appears.

### Notes For Fixer

- Message id: `19e026a420be1d9c`
- Thread id: `19e026a420be1d9c`
- Preserve unrelated dirty/untracked work in `/Users/simeon/Code/VerbsFirst/proj1`.
- No app code was changed during this QA intake.

## VF-QA-0011: French `elles` Agreement Fails In `en` Compound Expressions

Status: Open
Reported: 2026-05-19
Reported by: User
Affected app(s): French
Severity: Medium
Confidence: High

### User Report

Email intake from `s.shpiz@gmail.com`, subject `shit`:

> Bug. The french here is wrong. Should be venues and not venus
>
> Other such mistakes jn these type of cards (with en)

### Expected Behavior

When a French card is shown with subject `elles` and an être-auxiliary compound tense/expression, the past participle should agree feminine plural even when the participle is followed by an `en` expression tail or complement. Examples:

- `elles en sont venues au fait`
- `elles en sont venues aux mains`
- `elles en sont revenues à leurs moutons`
- `elles en sont restées là`

### Actual Behavior

Some `elles` cards can display a masculine participle such as `venus`, or can feminize the wrong final word in the phrase. The local French helper currently produces examples like:

- `elles en sont venus au fait`
- `elles en sont venus aux maines`
- `elles en sont revenus à leurs moutones`
- `elles en sont restés là`

### Reproduction Steps

1. Open the French app, preferably from a fresh local build/dist: `http://127.0.0.1:<port>/french/`.
2. Use Conjugation mode with French top/frequency settings that include generated `en` expressions, or otherwise force a card whose stored `ils/elles` conjugation is one of:
   - `ils en sont venus au fait`
   - `ils en sont venus aux mains`
   - `ils en sont revenus à leurs moutons`
   - `ils en sont restés là`
3. Surface the card as `elles`.
4. Reveal the answer.
5. Observe that the displayed answer can keep `venus/revenus/restés` masculine, or incorrectly mutate a later noun/adjective instead of the participle.

Browser-use note: the in-app browser was available, but this exact random card was not feasible to force through UI-only controls during intake without editing app state. QA reproduced the failing transformation directly from the production helper logic and confirmed the affected generated data exists in source/dist assets.

### Investigation Notes

- Gmail intake:
  - Message id: `19e423ad0ecae939`
  - Thread id: `19e423ad0ecae939`
  - Sender shown by Gmail tool: `Simeon Shpiz s.shpiz@gmail.com`
  - Subject exactly `shit`; labels at intake time: `UNREAD`, `INBOX`; no Gmail spoof/phishing warning metadata was exposed.
- Relevant generated French conjugation data:
  - `/Users/simeon/Code/VerbsFirst/proj1/js/verbs.full.generated.js`
  - Lines around `270456-270493` contain `ils/elles` rows such as `ils en sont venus aux mains`, `ils en sont venus au fait`, and `ils en sont revenus à leurs moutons`.
  - `dist/french/js/verbs.starter.generated.js` and `dist-cloudflare/french_latest/js/verbs.starter.generated.js` also include these expressions in the built French app.
- Relevant French runtime logic:
  - `/Users/simeon/Code/VerbsFirst/proj1/index.html:1319` defines `feminizeParticiple(parts, pronoun)`.
  - `/Users/simeon/Code/VerbsFirst/proj1/index.html:1333` defines `window.handleLanguageSpecificLastChange`.
  - Built copies contain the same logic at `/Users/simeon/Code/VerbsFirst/proj1/dist/french/index.html:7163` and `/Users/simeon/Code/VerbsFirst/proj1/dist-cloudflare/french_latest/index.html:7163`.
- The helper handles simple cases correctly:
  - Input `ils sont venus` + pronoun `elles` -> `elles sont venues`.
- The helper fails on multi-token complements after the participle:
  - Input `ils en sont venus au fait` + pronoun `elles` -> `elles en sont venus au fait`.
  - Input `ils en sont venus aux mains` + pronoun `elles` -> `elles en sont venus aux maines`.
  - Input `ils en sont revenus à leurs moutons` + pronoun `elles` -> `elles en sont revenus à leurs moutones`.
- `build.py` keeps these assets external for the French web build:
  - `js/verbs.full.generated.js` is split into `js/verbs.starter.generated.js` / `js/verbs.extra.generated.json`.
  - `index.html` and `js/script.js` are copied/inlined into `dist/french`.

### Suspected Root Cause

`feminizeParticiple(parts, pronoun)` assumes the past participle is always the final whitespace-delimited token of the conjugated string. That is true for simple forms like `ils sont venus`, but false for expressions where the participle is followed by a complement, e.g. `ils en sont venus au fait`, `ils en sont revenus à leurs moutons`, or `ils en sont restés là`.

When `handleLanguageSpecificLastChange('elles', conjugated)` sees an `ils ... sont ...` string, it replaces the first token with `elles` and calls `feminizeParticiple` on the final token. The final token may be `fait`, `mains`, `moutons`, or `là`, so the actual participle remains masculine or a later noun is incorrectly mutated.

### Suggested Fix Direction

- Fix the French agreement helper in the source template/runtime, not only in generated dist:
  - Likely files: `/Users/simeon/Code/VerbsFirst/proj1/index.html` and any shared French helper path if one now exists.
  - Consider teaching `feminizeParticiple` to locate the first participle token after an être auxiliary, not blindly the final token.
  - Preserve correct behavior for simple terminal-participle forms (`elles sont venues`) and for non-agreeing avoir forms.
- Add regression coverage for representative `en` expressions:
  - `ils en sont venus au fait` -> `elles en sont venues au fait`
  - `ils en sont venus aux mains` -> `elles en sont venues aux mains`
  - `ils en sont revenus à leurs moutons` -> `elles en sont revenues à leurs moutons`
  - `ils en sont restés là` -> `elles en sont restées là`
- Rebuild the French app through `build.py` so `dist/french/index.html` and `dist-cloudflare/french_latest/index.html` receive the corrected helper.

### Cross-App / Regression Risk

This looks French-specific because the failing logic lives in the French language-specific helper and French generated conjugation data. Other apps may have analogous “combined pronoun surface + gendered participle” logic, but the exact `en`/être agreement issue is French-only.

Regression risk is moderate: the helper touches normal answer display for many French cards. A too-broad fix could incorrectly feminize avoir forms, fixed adjectives/nouns, or expressions where agreement is intentionally invariant.

### Acceptance Criteria

- `elles` answers for `en` expressions with être auxiliaries show feminine plural participles:
  - `elles en sont venues au fait`
  - `elles en sont venues aux mains`
  - `elles en sont revenues à leurs moutons`
  - `elles en sont restées là`
- No later complement word is mutated (`mains` must not become `maines`; `moutons` must not become `moutones`).
- Existing simple cases remain correct (`elles sont venues`, `elles étaient parties`, etc.).
- Masculine plural `ils` output remains unchanged.

### Suggested Verification

- Add/run a small JS unit or smoke check for `handleLanguageSpecificLastChange`.
- Run `python3 /Users/simeon/Code/VerbsFirst/proj1/build.py`.
- Serve `/Users/simeon/Code/VerbsFirst/proj1/dist` and inspect `http://127.0.0.1:<port>/french/`.
- Browser-check at least one forced or seeded `elles` card for an `en venir/en revenir/en rester` expression.
- Search built artifacts for obvious bad strings if a deterministic card seed is difficult:
  - `elles en sont venus`
  - `elles en sont revenus`
  - `maines`
  - `moutones`

### Notes For Fixer

- Do not patch only `dist`; rebuild from source.
- The worktree is very dirty/untracked. Preserve unrelated work.
- QA did not edit app code, commit, deploy, or reply to the email.

## VF-QA-0012: French Pronoun Fill Rows Use `le` Before Vowel Instead Of `l'`

Status: Open
Reported: 2026-05-17
Reported by: User
Affected app(s): French
Severity: Medium
Confidence: High

### User Report

Email intake from `s.shpiz@gmail.com`, subject `shit`:

> Bug: this phrase has " le ouvrent" instead of l'ouvrent
>
> Please find and fix. Also fix others with similar issues if found

The email included an inline PNG attachment named `1000168554.png`.

### Expected Behavior

French direct-object pronoun cards should elide `le`/`la` to `l'` before vowel or mute-h verb forms. For `ouvrir`, expected examples include:

- `Nous l'ouvrons.`
- `Vous l'ouvrez.`
- `Elle l'ouvre.`
- `Ils l'ouvrent.`

### Actual Behavior

The current French pronoun fill source data has hard-coded unelided strings for `ouvrir`:

- `Nous le ouvrons.`
- `Vous le ouvrez.`
- `Elle le ouvre.`
- `Ils le ouvrent.`

The user's reported visible phrase, `le ouvrent`, matches the `Ils` row.

### Reproduction Steps

1. Open the French app at `http://127.0.0.1:<port>/french/`.
2. Set Current exercise to Fill Blanks.
3. Set Fill Blanks focus to Pronouns if needed.
4. Continue until a Tech & Digital Work direct-object `ouvrir` pronoun-fill card appears:
   - Target: `le fichier`
   - Prompt examples include `Ils ____ ouvrent.`
5. Reveal the answer.
6. Observe `Ils le ouvrent.` / `le ouvrent` instead of `Ils l'ouvrent.` / `l'ouvrent`.

Browser-use note: QA did not rely on random UI surfacing because the exact faulty rows were found directly in the source and built data. The bug is deterministic once one of these rows is selected.

### Investigation Notes

- Gmail intake:
  - Message id: `19e35dd101b237c5`
  - Thread id: `19e35dd101b237c5`
  - Sender shown by Gmail tool: `Simeon Shpiz s.shpiz@gmail.com`
  - Subject exactly `shit`; labels at intake time: `UNREAD`, `INBOX`; no Gmail spoof/phishing warning metadata was exposed.
  - Inline image metadata exposed by Gmail: `1000168554.png`, MIME `image/png`.
- Source rows:
  - `/Users/simeon/Code/VerbsFirst/proj1/js/pronounFillRows.js:162`
  - `/Users/simeon/Code/VerbsFirst/proj1/js/pronounFillRows.js:163`
  - `/Users/simeon/Code/VerbsFirst/proj1/js/pronounFillRows.js:164`
- Built rows:
  - `/Users/simeon/Code/VerbsFirst/proj1/dist/french/js/pronounFillRows.js:162`
  - `/Users/simeon/Code/VerbsFirst/proj1/dist/french/js/pronounFillRows.js:163`
  - `/Users/simeon/Code/VerbsFirst/proj1/dist/french/js/pronounFillRows.js:164`
  - `/Users/simeon/Code/VerbsFirst/proj1/dist-cloudflare/french_latest/js/pronounFillRows.js:162`
  - `/Users/simeon/Code/VerbsFirst/proj1/dist-cloudflare/french_latest/js/pronounFillRows.js:163`
  - `/Users/simeon/Code/VerbsFirst/proj1/dist-cloudflare/french_latest/js/pronounFillRows.js:164`
- The rows were added as plain data calls, for example:
  - `add('pfx_direct_object_069_nous', ..., 'ouvrir', ..., 'le', 'Nous le ouvrons.', ...)`
  - `add('pfx_direct_object_072_ils', ..., 'ouvrir', ..., 'le', 'Ils le ouvrent.', ...)`
- `build.py` copies `js/pronounFillRows.js` into the French web dist (`FRENCH_WEB_EXTERNAL_SCRIPT_ASSETS` includes `js/pronounFillRows.js`), so the data bug propagates directly into built artifacts.
- A separate generation helper, `generate_french_passe_compose_fill_blanks.mjs`, has an `elideFinalDirectObjectPronoun(answer, aux)` helper for passé composé pronoun rows, but present-tense `js/pronounFillRows.js` rows are static and do not receive equivalent elision cleanup.

### Suspected Root Cause

The present-tense French pronoun-fill source data hard-codes `le` before vowel-initial `ouvrir` forms. There is no source-time or runtime normalization step that elides direct-object `le/la` to `l'` before vowel or mute-h verbs for these present-tense rows.

### Suggested Fix Direction

- Correct the source rows in `/Users/simeon/Code/VerbsFirst/proj1/js/pronounFillRows.js` for `ouvrir`:
  - `Nous l'ouvrons.`
  - `Vous l'ouvrez.`
  - `Elle l'ouvre.`
  - `Ils l'ouvrent.`
- Search all French pronoun-fill rows for the same class of errors:
  - `\b(le|la)\s+[aeiouhàâäéèêëîïôöùûüœ]`
  - Include generated/built rows, but fix the source generator/source data first.
- Consider adding a small validator/audit for French pronoun-fill data so `le/la + vowelish verb` cannot re-enter.
- Rebuild the French app through `build.py` so `dist/french/js/pronounFillRows.js` and Cloudflare dist copies update.

### Cross-App / Regression Risk

This specific bug is French-only because it concerns French direct-object clitic elision. Other language apps are unlikely to share the same exact rule, but any French-derived/generated pronoun-fill datasets should be checked.

Regression risk is low to medium. The fix is data-local if only these rows are corrected, but a runtime normalizer could affect many pronoun-fill rows and must avoid changing valid `les` forms or cases where `le/la` is intentionally not a clitic.

### Acceptance Criteria

- No visible French pronoun-fill answer contains `le ouvre`, `le ouvrons`, `le ouvrez`, or `le ouvrent`.
- The `ouvrir` direct-object cards render `l'ouvre/l'ouvrons/l'ouvrez/l'ouvrent`.
- A source-data audit finds no `le/la + vowelish verb form` direct-object clitic rows that should elide.
- Built French dist and Cloudflare latest dist contain the corrected rows after rebuild.

### Suggested Verification

- Search source and dist:
  - `rg -n "le ouvr|la ouvr|\\b(le|la) [aeiouhàâäéèêëîïôöùûüœ]" /Users/simeon/Code/VerbsFirst/proj1/js/pronounFillRows.js`
- Run `python3 /Users/simeon/Code/VerbsFirst/proj1/build.py`.
- Serve `/Users/simeon/Code/VerbsFirst/proj1/dist` and test `http://127.0.0.1:<port>/french/`.
- In Fill Blanks -> Pronouns, verify the `ouvrir` direct-object cards reveal `l'...` forms.

### Notes For Fixer

- Do not patch only `dist`; rebuild from source.
- The worktree is very dirty/untracked. Preserve unrelated work.
- QA did not edit app code, commit, deploy, or reply to the email.

## VF-QA-0013: Spanish Latest Fill Blanks English Sentence Is Low-Contrast In Dark/System; System Theme Reveals Blue Answers

Status: Open
Reported: 2026-05-19
Reported by: User
Affected app(s): Spanish (Spanish Latest)
Severity: Medium
Confidence: High

### User Report

Email intake from `s.shpiz@gmail.com`, subject `shit`:

> Spanish
>
> On mobile i see weird colors in foll blanks
>
> Im browaser incognito it's different (see other screenshot)
>
> Blue text on system when ayatem is dark and it's ok on dark explicitly.
>
> But the translation text is shit on mo ile dark.or system(and system =dark)
>
> https://www.verbsfirst.com/spanish_latest/#

The email included one PNG attachment (`Screenshot_20260519-181909.png`) plus two inline images (`1000169009.png`, `gmail_images20260519_182011.png`).

### Expected Behavior

- Spanish Fill Blanks should render the bottom English translation sentence (`#english-verb-phrase`) with readable contrast in:
  - Settings -> App -> Theme -> Dark, and
  - Settings -> App -> Theme -> System when the OS prefers dark mode.
- In System-dark mode, revealed frame-slot answers should use the same readable “dark theme” colors as explicit Dark (no unexpected bright-blue answer text on a dark flashcard background).
- Spanish should match the French app’s current dark-mode contrast for the same Fill Blanks UI elements.

### Actual Behavior

- On a dark flashcard background, the bottom English translation sentence can render as a dark ink color (nearly invisible) in dark/system-dark contexts.
- In System theme with OS dark, revealed inline frame-slot answers can render bright blue (e.g. `se`, `los` in the user screenshot) instead of the expected light/neutral dark-theme answer color.

### Reproduction Steps

1. Use mobile Chrome (or a phone-sized browser viewport).
2. Open the Spanish latest app at `https://www.verbsfirst.com/spanish_latest/#`.
3. Set Current exercise to Fill Blanks.
4. With the OS in dark mode, try:
   - Settings -> App -> Theme -> Dark
   - Settings -> App -> Theme -> System
5. Navigate to any frame card that displays the bottom English sentence/translation (examples visible in the user screenshots include:
   - `enviar` with `She sends them to him today.`
   - `hablar` with `I want to talk with you after class.`)
6. Observe:
   - The bottom English sentence is low-contrast against the dark flashcard background.
   - In System theme, revealed answers in inline slots can appear bright blue.

### Investigation Notes

- Gmail intake:
  - Message id: `19e428c1537d16df`
  - Thread id: `19e428c1537d16df`
  - Sender shown by Gmail tool: `Simeon Shpiz s.shpiz@gmail.com`
  - Subject exactly `shit`; labels at intake time: `UNREAD`, `INBOX`; no Gmail spoof/phishing warning metadata was exposed.
  - Attachment metadata exposed by Gmail:
    - `Screenshot_20260519-181909.png` (MIME `image/png`)
    - `1000169009.png` (MIME `image/png`)
    - `gmail_images20260519_182011.png` (MIME reported `image/png`; file identifies as JPEG)
- Downloaded and inspected the user images to:
  - `/private/tmp/vf-bug-intake/19e428c1537d16df/Screenshot_20260519-181909.png`
  - `/private/tmp/vf-bug-intake/19e428c1537d16df/1000169009.png`
  - `/private/tmp/vf-bug-intake/19e428c1537d16df/gmail_images20260519_182011.png`
- Inspected Spanish source:
  - `/Users/simeon/Code/VerbsFirst/spanish-verbs/css/style.css`
  - `/Users/simeon/Code/VerbsFirst/spanish-verbs/js/script.js`
- Inspected generated Spanish latest output:
  - `/Users/simeon/Code/VerbsFirst/proj1/dist/spanish_latest/index.html`
- Compared French parity CSS:
  - `/Users/simeon/Code/VerbsFirst/proj1/css/style.css`
- Relevant Spanish CSS findings:
  - `/Users/simeon/Code/VerbsFirst/spanish-verbs/css/style.css:1537-1561` sets `#english-verb-phrase` in `@media (prefers-color-scheme: dark)` to `color: #263040 !important`, which is a dark ink color on a dark background and matches the “barely visible” symptom.
  - `/Users/simeon/Code/VerbsFirst/spanish-verbs/css/style.css:5178-5191` sets revealed slot answer color to `#2f7fd0` (bright blue).
  - `/Users/simeon/Code/VerbsFirst/spanish-verbs/css/style.css:5236-5243` overrides revealed slot answer color to `#f0f5fa`, but only for `html[data-theme="dark"] ...` (explicit Dark theme), not for System theme in OS dark.
- Relevant Spanish JS findings:
  - `/Users/simeon/Code/VerbsFirst/spanish-verbs/js/script.js:5624-5627` toggles the `pronoun-fill-translation-prompt` / `frame-translation-prompt` classes on `#english-verb-phrase`, but the unconditional `#english-verb-phrase { ... !important }` dark media rule overrides these non-`!important` class variants.
- Relevant French parity findings:
  - `/Users/simeon/Code/VerbsFirst/proj1/css/style.css:2436-2461` sets dark-mode `#english-verb-phrase` to a light readable color (`#dce9f8 !important`) and also sets `#english-verb-phrase.pronoun-fill-translation-prompt` / `.frame-translation-prompt` to `#f2f7ff !important` under `@media (prefers-color-scheme: dark)`.

### Suspected Root Cause

Spanish has a contrast regression/parity gap in dark/system-dark styling:

- `#english-verb-phrase` uses a dark-mode media override that sets a dark ink color (`#263040 !important`) even when the flashcard background is dark, making the English sentence low-contrast.
- The dark-theme slot answer color override is keyed only on `html[data-theme="dark"]`, so System theme (where the app typically leaves `data-theme` unset and relies on `prefers-color-scheme`) continues using the bright-blue revealed answer color.

### Suggested Fix Direction

- Port the French `#english-verb-phrase` dark-mode styling into Spanish:
  - Replace `#english-verb-phrase` dark media color (`#263040 !important`) with a light readable value similar to French (`#dce9f8 !important`).
  - Add/port dark media styles for `#english-verb-phrase.pronoun-fill-translation-prompt` and `.frame-translation-prompt` similar to French (`#f2f7ff !important`) so the existing JS class toggles work as intended.
- Ensure System theme in OS dark gets the same slot answer colors as explicit Dark:
  - Add a `prefers-color-scheme: dark` override targeting `html:not([data-theme])` / `html[data-theme="system"]` (or equivalent theme selector used by Spanish) to set revealed inline slot answer text to `#f0f5fa` (or the same value used under `html[data-theme="dark"]`).
- Rebuild Spanish latest so the shipped `/Users/simeon/Code/VerbsFirst/proj1/dist/spanish_latest/index.html` reflects the updated styling.

### Cross-App / Regression Risk

Medium. These styles are likely shared patterns across language apps; changing dark-mode translation and slot styling could affect:

- Other modes that display `#english-verb-phrase` (including non-frame contexts).
- Any cards that use `#conjugated-verb.frame-card-inline-text` slot styling.

Spanish should be checked alongside French and Portuguese since the same class of low-contrast bug has been reported previously in Portuguese (`VF-QA-0005`) and referenced again in later reports.

### Acceptance Criteria

- With OS in dark mode, Spanish Fill Blanks English translation sentence is clearly readable in both:
  - Theme = Dark, and
  - Theme = System.
- With Theme = System and OS dark, revealed inline slot answers do not render bright blue on a dark card; they match explicit Dark’s revealed-answer contrast.
- Spanish’s dark-mode Fill Blanks translation contrast matches the French app’s current behavior.

### Suggested Verification

- After rebuilding Spanish latest, verify on a phone-sized viewport:
  - Toggle Theme Dark vs System (with OS dark) and confirm `#english-verb-phrase` contrast.
  - Confirm revealed slot answer text color in System-dark matches explicit Dark.
- Sanity-check French and Portuguese dark/system Fill Blanks translation contrast did not regress.

### Notes For Fixer

- Gmail message id: `19e428c1537d16df`; thread id: `19e428c1537d16df`.
- Do not patch only `dist`; rebuild from source.
- Preserve unrelated dirty git work.
- QA did not edit app code, commit, deploy, or reply to the email.

## VF-QA-0014: French Latest Update Check Gets Stuck In “Checking For Updates”

Status: Open
Reported: 2026-05-19
Reported by: User
Affected app(s): French (French Latest)
Severity: Medium
Confidence: High

### User Report

User clarified that in `french_latest`, “check updates” is broken.

### Expected Behavior

On `french_latest`, Settings -> App -> Update app should:

- show an idle “App is up to date.” state with an enabled “Check for updates” button after normal first install/service-worker registration;
- briefly show “Checking for updates...” only while a user-initiated or real background update check is active;
- return to idle if no update is available; and
- switch to “New version available.” / “Reload now” only when a waiting worker or newer version actually exists.

### Actual Behavior

On local `french_latest`, the App settings section opens with:

- status text: `Checking for updates...`
- button: `Check for updates`
- button state: disabled

The state remained unchanged after a 5-second wait. The user cannot manually trigger the check because the button is already disabled.

### Reproduction Steps

1. Serve the built output from `/Users/simeon/Code/VerbsFirst/proj1/dist`:
   - `python3 -m http.server 8765 --bind 127.0.0.1`
2. Use a browser profile/state where the `/french_latest/` scoped service worker has no existing `french-latest-app-cache-*` cache, or reproduce immediately after a first install/new cache generation.
3. Open `http://127.0.0.1:8765/french_latest/`.
4. If a stale root-level service-worker cache serves an old shell first, reload/navigate again until the visible title is `Verbs 1st - FR Latest`.
5. Tap Settings.
6. Tap the App settings section.
7. Observe the Update app row.
8. Wait at least 5 seconds.
9. Observe that it still says `Checking for updates...` and the `Check for updates` button remains disabled.

Browser/device assumptions:

- Reproduced in the Codex in-app browser against local `http://127.0.0.1:8765/french_latest/`.
- Initial app state had tutorial in progress, but the update row behavior is independent of exercise mode.
- Service-worker state observed at `/french_latest/__sw-log` showed first install for the latest scope:
  - `install french-latest-app-cache-v30`
  - `old caches: [] isUpgrade=false`
  - no `SW_UPDATED` message because the worker treated this as a first install, not an upgrade.

### Investigation Notes

Inspected source:

- `/Users/simeon/Code/VerbsFirst/proj1/index.html:40-86`
  - Registers `./sw.js` and sets `window.__appUpdateState.status = 'checking'` on every `registration.updatefound`.
  - Does not listen for the installing worker’s `statechange`.
  - Does not reset the status to idle if `updatefound` was only the first install/no-op path.
- `/Users/simeon/Code/VerbsFirst/proj1/index.html:983-989`
  - Defines the `Update app` row and `#app-update-action-btn`.
- `/Users/simeon/Code/VerbsFirst/proj1/js/script.js:3859-3881`
  - `syncAppUpdateUi()` disables `#app-update-action-btn` whenever `status === 'checking'`.
- `/Users/simeon/Code/VerbsFirst/proj1/js/script.js:3910-3956`
  - `checkForAppUpdates()` has a delayed fallback that returns from `checking` to `idle`, but only when this function is invoked.
  - The first-install `updatefound` path does not use that timeout/fallback.
- `/Users/simeon/Code/VerbsFirst/proj1/js/script.js:11785-11794`
  - The click handler calls `checkForAppUpdates()`, but the button is disabled in the stuck state, so the user cannot recover manually.
- `/Users/simeon/Code/VerbsFirst/proj1/sw.js:91-106`
  - The service worker posts `SW_UPDATED` only when `isUpgrade` is true.
  - On first install, `old caches: [] isUpgrade=false`, so no message transitions the UI out of `checking`.

Inspected generated/built output:

- `/Users/simeon/Code/VerbsFirst/proj1/dist/french_latest/index.html`
- `/Users/simeon/Code/VerbsFirst/proj1/dist/french_latest/js/script.js`
- `/Users/simeon/Code/VerbsFirst/proj1/dist/french_latest/sw.js`
- `/Users/simeon/Code/VerbsFirst/proj1/dist-cloudflare/french_latest/index.html`
- `/Users/simeon/Code/VerbsFirst/proj1/dist-cloudflare/french_latest/js/script.js`
- `/Users/simeon/Code/VerbsFirst/proj1/dist-cloudflare/french_latest/sw.js`

Observed browser output:

- `http://127.0.0.1:8765/french_latest/` eventually loaded with title `Verbs 1st - FR Latest`.
- Settings -> App showed `Checking for updates...`.
- `Update app` button was disabled while still labeled `Check for updates`.
- After 5 seconds the same DOM state remained:
  - `generic: Update app`
  - `paragraph: Checking for updates...`
  - `button "Update app" [disabled]: Check for updates`
- Console/log observations included:
  - `[SW] Registered`
  - `[APP] sw-ready scope=http://127.0.0.1:8765/french_latest/`
  - no visible update-check failure warning.
- `/french_latest/__sw-log` showed successful first-install precache and warmup:
  - `pre-cached /french_latest/index.html`
  - `pre-cached /french_latest/manifest.json`
  - `pre-cached /french_latest/favicon_big.png`
  - `pre-cached /french_latest/version.json`
  - `old caches: [] isUpgrade=false`
  - `warm-assets done reason=ready ok=15 failed=0`

Related cache observation:

- On the first local navigation to `/french_latest/`, the browser briefly received an old `Etymology Explorer` shell even though `curl http://127.0.0.1:8765/french_latest/index.html` returned the correct `Verbs 1st - FR Latest` file.
- Server logs showed the browser fetched `/french_latest/` and then requested `data/french_verbs_related_en.json`, consistent with a stale shell being returned from a pre-existing root-level service-worker cache before the latest app cache refreshed.
- This appears related to service-worker/app-route caching, but the update-button bug above reproduced after the correct French Latest app loaded.

### Suspected Root Cause

The inline service-worker registration code treats every `updatefound` event as an active update check by setting app update status to `checking`. On a first install of the `/french_latest/` service worker, `updatefound` is expected, but there is no app update available and no waiting worker.

Because the service worker only posts `SW_UPDATED` when `isUpgrade=true`, first install (`old caches: [] isUpgrade=false`) never sends a message to clear the state. The manual check fallback timer in `checkForAppUpdates()` is not involved because the user did not click the button. The UI then disables the only recovery action because `syncAppUpdateUi()` disables the button for `status === 'checking'`.

### Suggested Fix Direction

- In `/Users/simeon/Code/VerbsFirst/proj1/index.html`, replace the bare `registration.addEventListener('updatefound', () => set checking)` behavior with state-aware handling:
  - capture `registration.installing`;
  - listen for `installing.statechange`;
  - if an installed worker becomes `waiting`, set `status: 'ready', updateAvailable: true`;
  - if the worker activates/installs without a waiting update and this is first install/no active previous worker, return to `idle`;
  - avoid leaving `checking` active indefinitely.
- In `/Users/simeon/Code/VerbsFirst/proj1/js/script.js`, add a defensive maximum duration for `checking` regardless of whether the state came from manual check or background registration events.
- Consider not disabling the “Check for updates” button for passive/background `checking`, or only disabling it while a user-triggered check promise is in flight.
- Verify the same update-state code path in latest-channel generated output after rebuilding/syncing latest.
- Review the root landing service worker app-route cache separately if stale wrong-app shells continue to appear before `/french_latest/` refreshes.

### Cross-App / Regression Risk

Medium to high. The exact reproduction is on French Latest, but the faulty pattern is in shared French source/template code and generated latest output. Similar update UI/service-worker registration snippets may exist in other language apps or their latest channels.

Fixes should be checked against:

- French stable `/french/`
- French latest `/french_latest/`
- any language app that copied the same App settings/update button code
- root landing service-worker route caching, because it can intercept app-route navigations before the app-scoped worker takes over

### Acceptance Criteria

- Fresh `/french_latest/` service-worker install does not leave the Update app row stuck in `Checking for updates...`.
- Within a bounded time after first load, Settings -> App shows `App is up to date.` and the `Check for updates` button is enabled when no update exists.
- Clicking `Check for updates` transitions to `Checking for updates...` briefly and then returns to idle when `version.json` matches `APP_VERSION`.
- When a real waiting worker/newer version exists, the row shows `New version available.` and the button changes to `Reload now`.
- No false `Update available` pill appears solely because of first install.
- The behavior works in built `/dist/french_latest/` and deployed/latest-channel output after rebuild/sync.

### Suggested Verification

- Static/syntax checks:
  - `node --check /Users/simeon/Code/VerbsFirst/proj1/js/script.js`
  - `python3 /Users/simeon/Code/VerbsFirst/proj1/build.py`
  - `LATEST_CHANNEL_LANGS=french LATEST_CHANNEL_TARGETS_ONLY=/Users/simeon/Code/VerbsFirst/proj1/dist python3 /Users/simeon/Code/VerbsFirst/proj1/sync_latest_channels.py`
- Browser checks:
  - Serve `/Users/simeon/Code/VerbsFirst/proj1/dist` at `http://127.0.0.1:8765/`.
  - In a fresh/incognito browser profile, open `http://127.0.0.1:8765/french_latest/`.
  - Open Settings -> App and confirm the update row settles to idle/enabled.
  - Click `Check for updates`; confirm it returns to idle if no update is available.
  - Inspect `http://127.0.0.1:8765/french_latest/__sw-log` and confirm first install does not require `SW_UPDATED` to clear the UI.
  - Repeat for `http://127.0.0.1:8765/french/`.
- Upgrade simulation:
  - Bump service-worker cache/version or built `version.json` in a controlled local build.
  - Confirm a real update still surfaces `Reload now`.

### Notes For Fixer

- Do not patch only `dist`; rebuild from source and regenerate `french_latest`.
- Preserve unrelated dirty git work.
- The repo has an unrelated local commit `f23017eb7` for latest-channel deploy selection from a prior user request; do not conflate it with this bug.
- QA did not edit app code, commit, deploy, or email anyone for this report.

## VF-QA-0015: French Verb Gloss Uses Obscure English (“to tumefy”) For `tuméfier`

Status: Open
Reported: 2026-05-19
Reported by: User
Affected app(s): French (French Latest; also French stable)
Severity: Low
Confidence: High

### User Report

User reported a “Bad verb translation/gloss” for French Latest and provided a deep link:

- `https://www.verbsfirst.com/french_latest/#pronoun=tu&verb=tum%C3%A9fier&tense=subjonctifPresent`

### Expected Behavior

The verb header’s English gloss/translation should be learner-friendly and reflect the common meaning of the French infinitive.

For `tuméfier`, a more typical gloss would be along the lines of:

- `to swell (up)` / `to make swell` / `to cause to swell`

### Actual Behavior

For `tuméfier`, the verb header displays:

- `to tumefy`

This is a technically-related English verb, but it is uncommon/archaic enough that it reads as a poor “translation” for most learners.

### Reproduction Steps

1. Open French Latest with the provided deep link:
   - `https://www.verbsfirst.com/french_latest/#pronoun=tu&verb=tum%C3%A9fier&tense=subjonctifPresent`
2. Observe the English gloss under the infinitive `tuméfier`.

Local reproduction:

1. Serve `/Users/simeon/Code/VerbsFirst/proj1/dist` at `http://127.0.0.1:8765/`.
2. Open `http://127.0.0.1:8765/french_latest/#pronoun=tu&verb=tum%C3%A9fier&tense=subjonctifPresent`.
3. Observe the same gloss.

### Investigation Notes

Inspected generated/built output:

- `/Users/simeon/Code/VerbsFirst/proj1/dist-cloudflare/french_latest/js/verbs.starter.generated.js`
  - Contains `{"infinitive":"tuméfier","translation":"to tumefy","frequency":"top-3000",...}`.
- `/Users/simeon/Code/VerbsFirst/proj1/dist/french/js/verbs.starter.generated.js`
  - Same `tuméfier -> to tumefy` mapping, indicating this is not specific to latest-channel packaging.

Inspected source data / generation:

- `/Users/simeon/Code/VerbsFirst/proj1/combine_dataset_enhanced.py`
  - Populates `verb_translations[infinitive]` from `conj['verb']['translation_en']` (verbecc), then prefixes `to `.
- `/Users/simeon/Code/VerbsFirst/proj1/data/french_verbs_related_en.json`
  - For `tuméfier`, stores `glosses: ["to tumefy"]` and also includes more descriptive glosses for the related English lemma `tumefy` such as `To cause to swell.`.

### Suspected Root Cause

The French verb “translation” field is largely sourced from an automated `translation_en` field (verbecc) and/or related-lemma gloss selection, with no learner-oriented normalization layer. For some verbs (especially lower-frequency items), this produces an English gloss that is technically related but not a good pedagogical “translation”.

### Suggested Fix Direction

- Add a small learner-oriented override layer for French `translation` strings (at least for frequently surfaced or reported items) so the UI shows a common-meaning gloss rather than an obscure cognate.
- For cases where the pipeline only has an uncommon lemma like `tumefy`, consider:
  - selecting a more descriptive gloss from available gloss lists (e.g., “to cause to swell”), or
  - storing multiple gloss candidates and preferring the most common/clear.
- Regenerate French artifacts and ensure `verbs.starter.generated.js` shows the updated translation for `tuméfier` in both `dist/french` and `dist/french_latest` outputs.

### Cross-App / Regression Risk

Low. This appears to be a data-quality/translation-selection issue for one verb, but it is likely produced by the shared French data generation pipeline. Fixes should be validated across both French stable and French Latest outputs.

### Acceptance Criteria

- For `tuméfier`, the header gloss shown in the app is changed to a learner-friendly translation (e.g., `to swell (up)` / `to cause to swell`).
- `dist/french/js/verbs.starter.generated.js` and `dist/french_latest/js/verbs.starter.generated.js` contain the updated translation for `tuméfier`.
- The same deep link renders the updated gloss in deployed French Latest after rebuild/deploy.

### Suggested Verification

- Regenerate the French verb dataset and rebuild.
- Verify the `tuméfier` entry’s `translation` value in:
  - `/Users/simeon/Code/VerbsFirst/proj1/dist/french/js/verbs.starter.generated.js`
  - `/Users/simeon/Code/VerbsFirst/proj1/dist/french_latest/js/verbs.starter.generated.js`
- In a browser, open:
  - `http://127.0.0.1:8765/french_latest/#pronoun=tu&verb=tum%C3%A9fier&tense=subjonctifPresent`
  - confirm the displayed gloss matches the updated value.

### Notes For Fixer

- Gmail message id: `19e43273029b1166`; thread id: `19e43273029b1166`.
- Do not patch only `dist`; rebuild from source.
- Preserve unrelated dirty git work.
- QA did not edit app code, commit, deploy, or reply to the email.

## VF-QA-0016: French Latest Can Fail To Open Offline After Service Worker Update

Status: Open
Reported: 2026-05-23
Reported by: User
Affected app(s): French (French Latest; likely French stable too)
Severity: High
Confidence: Medium

### User Report

User reports:

- “Currently the french latest version fails to open when offline”

### Expected Behavior

After the app has been opened once online (so the service worker is installed and core app assets are cached), launching or reloading French Latest while offline should still open the app UI.

### Actual Behavior

Launching French Latest while offline fails to open the app (user report). QA could not reproduce in the in-app browser because the Codex browser-use IAB backend was unavailable in this environment.

### Reproduction Steps

Suggested device repro (Android/Chrome or installed PWA):

1. Ensure French Latest has been opened at least once while online.
2. Update to a newer published build (or wait for the service worker to upgrade while the app is open).
3. Without doing a full reload after the upgrade, switch the device to offline (Airplane Mode).
4. Relaunch the French Latest PWA from the home screen (or refresh the tab).
5. Observe that the app fails to load offline.

### Investigation Notes

Inspected relevant built output:

- `/Users/simeon/Code/VerbsFirst/proj1/dist/french_latest/index.html`
- `/Users/simeon/Code/VerbsFirst/proj1/dist/french_latest/sw.js`
- `/Users/simeon/Code/VerbsFirst/proj1/dist/french/index.html`
- `/Users/simeon/Code/VerbsFirst/proj1/dist/french/sw.js`

Inspected relevant source:

- `/Users/simeon/Code/VerbsFirst/proj1/js/script.js`

Key observations:

- `dist/french_latest/index.html` (and `dist/french/index.html`) loads multiple critical scripts with a cache-busting query string (e.g. `js/script.js?v=...`, `verb_usages.js?v=...`, `verb_frames.*.js?v=...`, etc.).
- `dist/french_latest/sw.js` precaches only unversioned URLs on install (`index.html`, `manifest.json`, `favicon_big.png`, `version.json`), not the versioned `?v=...` script URLs.
- The app attempts to warm-cache app assets by sending a `WARM_APP_ASSETS` message containing the current page’s `script[src]` URLs (including query strings) from `getWarmableAppAssetUrls()` in `/Users/simeon/Code/VerbsFirst/proj1/js/script.js`.
- On a service-worker upgrade, it’s possible for the newly-installed SW to have a freshly cached `index.html`, while the currently running page is still the previous build. In that situation, `WARM_APP_ASSETS` warms the *old* `?v=...` script URLs (from the old DOM), and the *new* `?v=...` script URLs referenced by the newly cached `index.html` are not guaranteed to be cached before the device goes offline.

### Suspected Root Cause

Service worker upgrade + cache-busted script URLs can create an offline “split brain”:

- The SW caches a new `index.html` for offline navigation, but does not ensure that all versioned `?v=...` scripts referenced by that new index are cached.
- If the user goes offline before visiting the new build while online (so those new script URLs are fetched and cached), offline navigation can load a new index that references uncached script URLs, causing the app to fail to bootstrap offline.

### Suggested Fix Direction

- Ensure that the offline navigation response and its required script dependencies are cached as an atomic set on upgrade (e.g., precache a build manifest of required assets, or proactively warm the *new* build’s script URLs).
- Avoid relying on query-string versioning without also guaranteeing that the service worker will cache the new query-parameter asset URLs before serving the new index offline.

### Cross-App / Regression Risk

High. French stable uses the same `?v=...` script URL pattern and similar SW precache behavior, and the same “upgrade then go offline” timing window can apply to other apps that use cache-busted asset URLs.

### Acceptance Criteria

- After a service-worker update, launching French Latest (and French stable) offline reliably opens the app UI without a browser-level offline error page.
- The behavior holds even if the user goes offline immediately after the SW updates, before manually reloading into the new build.

### Suggested Verification

- On Android/Chrome, install French Latest, open it online, then force an update (or wait for the SW to upgrade).
- Before refreshing into the new build, go offline and relaunch the PWA; confirm it still loads.
- Repeat for French stable.

### Notes For Fixer

- Gmail message id: `19e5435cf6ce3c8a`; thread id: `19e5435cf6ce3c8a`.
- QA could not run browser-use reproduction because the Codex IAB backend was not available in this environment.
- Do not patch only `dist`; rebuild from source.
- QA did not edit app code, commit, deploy, or reply to the email.

## VF-QA-0017: Spanish Latest Shows Browser “You’re offline” Screen When Launched Offline (Likely Bare-Domain Redirect)

Status: Open
Reported: 2026-05-23
Reported by: User
Affected app(s): Spanish (Spanish Latest; likely Spanish stable too)
Severity: High
Confidence: Medium

### User Report

User reports:

- “As french latest, spanish latest also fails offline”

User attached a phone screenshot showing a browser-level offline error UI with the Los verbos icon and the text:

- “You’re offline”

### Expected Behavior

After being opened once online, Spanish Latest should launch and show the app UI while offline (especially when installed as a PWA), using service worker cached responses.

### Actual Behavior

On the attached screenshot, the app fails to load while offline and instead shows a browser-level “You’re offline” screen (suggesting the navigation request was not handled by a controlling service worker for that origin/path).

QA could not reproduce in the in-app browser because the Codex browser-use IAB backend was unavailable in this environment.

### Reproduction Steps

Suggested device repro (Android/Chrome installed PWA):

1. Install Spanish Latest as a PWA from `https://verbsfirst.com/spanish_latest/` (bare domain) if possible.
2. Turn on Airplane Mode.
3. Launch the installed PWA.
4. Observe a browser “You’re offline” error screen instead of the app UI.

Also test the `www` domain:

1. Install Spanish Latest as a PWA from `https://www.verbsfirst.com/spanish_latest/`.
2. Turn on Airplane Mode.
3. Launch the installed PWA.
4. Confirm whether it loads correctly offline (expected) or fails similarly.

### Investigation Notes

Inspected relevant built output:

- `/Users/simeon/Code/VerbsFirst/proj1/dist/spanish/index.html`
- `/Users/simeon/Code/VerbsFirst/proj1/dist/spanish_latest/index.html`
- `/Users/simeon/Code/VerbsFirst/proj1/dist/spanish/sw.js`
- `/Users/simeon/Code/VerbsFirst/proj1/dist/spanish_latest/sw.js`

Key observation:

- Spanish stable and Spanish Latest include an early head script that canonicalizes Spanish paths from the bare domain to `www`:
  - If `location.hostname === 'verbsfirst.com'` and the path matches `/spanish` or `/spanish_latest`, it does `location.replace('https://www.verbsfirst.com' + location.pathname + location.search + location.hash);`.

This is intended to ensure a single canonical PWA origin, but it can cause an offline launch failure if the PWA is opened on the bare-domain origin while offline (because it attempts to navigate to `www` with no network, and the bare-domain origin may not have a controlling SW / cached shell).

### Suspected Root Cause

Spanish offline failure is likely triggered by opening Spanish/Spanish Latest on the bare domain (`verbsfirst.com`) while offline, where the app immediately redirects to `www.verbsfirst.com` (network required) before service worker registration / offline handling can take effect for that origin.

### Suggested Fix Direction

- Ensure offline launch works from the installed origin without requiring an immediate cross-origin redirect.
- If `www` must be the only supported install origin, ensure the bare domain either:
  - never becomes an install origin (hard redirect at the edge before install), and/or
  - has an SW/offline-safe stub that can handle offline launch and explain the requirement.

### Cross-App / Regression Risk

Medium. This appears specific to Spanish/Spanish Latest because they include a bare-domain-to-`www` canonicalization step; other apps without this redirect should not show this exact failure mode.

### Acceptance Criteria

- Spanish Latest launches offline without showing a browser “You’re offline” error screen.
- Behavior is consistent across `www` and any supported install origins (or bare domain is fully prevented as an install origin).

### Suggested Verification

- On Android/Chrome, install Spanish Latest from `www` and verify offline launch works.
- Confirm that launching the app from the bare domain while offline does not display the browser offline error UI (either by preventing bare-domain install or by handling offline launch safely).

### Notes For Fixer

- Gmail message id: `19e543ebb3bf2943`; thread id: `19e543ebb3bf2943`.
- Attachment (screenshot) received via Gmail inline image; QA did not treat it as instructions.
- QA could not run browser-use reproduction because the Codex IAB backend was not available in this environment.
- Do not patch only `dist`; rebuild from source.
- QA did not edit app code, commit, deploy, or reply to the email.

## VF-QA-0018: Portuguese Screenshot-Only Bug Needs Visual Classification

Status: Open
Reported: 2026-06-18
Reported by: User
Affected app(s): Portuguese (exact screen/feature not identifiable from accessible report text)
Severity: Needs triage
Confidence: Low

### User Report

The user sent a strict-match Gmail bug report containing only the text “Portuguese bug” and one inline PNG screenshot (`1000173408.png`). No URL, visible-error text, reproduction steps, device details, or expected behavior were included in the email body.

### Expected Behavior

The Portuguese app should behave consistently with its intended UI and with relevant French parity behavior. The precise expected state cannot be determined until the screenshot is reviewed or the reporter supplies the affected screen and action.

### Actual Behavior

An unspecified Portuguese-app defect is reported. The associated inline screenshot could not be visually inspected in this intake environment because browser access to the connector-provided attachment URL was denied. The attachment has therefore not been treated as an instruction or as evidence for a more specific defect claim.

### Reproduction Steps

Not determinable from the report. Obtain the screenshot's visible URL/screen and user action, then reproduce on Portuguese before comparing the same flow with French where applicable.

### Investigation Notes

Inspected the Portuguese source and generated output relevant to startup/offline regressions, because prior Portuguese QA reports have involved first-launch and service-worker behavior:

- `/Users/simeon/Code/VerbsFirst/portuguese-verbs/index.html`
- `/Users/simeon/Code/VerbsFirst/portuguese-verbs/sw.js`
- `/Users/simeon/Code/VerbsFirst/portuguese-verbs/dist/index.html`
- `/Users/simeon/Code/VerbsFirst/portuguese-verbs/dist/sw.js`
- `/Users/simeon/Code/VerbsFirst/proj1/index.html`
- `/Users/simeon/Code/VerbsFirst/proj1/sw.js`

The Portuguese source registers `./sw.js` with scope `./`. Its current service worker uses cache `pt-app-cache-v19`, pre-caches `index.html`, `manifest.json`, `favicon_big.png`, and `version.json`, and returns an app-owned loading shell for an in-scope navigation that cannot be served from network or cache. `portuguese-verbs/dist/sw.js` exactly matches the source service worker, so the known first-launch app-shell fix is present in the checked generated output.

The generated Portuguese `dist/index.html` is intentionally packed/inlined and therefore does not byte-match source `index.html`; this alone is not evidence of a stale build. Source `js/script.js` and `css/style.css` currently have unrelated local modifications and were not changed by this intake.

Local browser reproduction was not possible: browser-use access to the local test server was denied by the environment. The screenshot attachment could likewise not be opened after access was denied, so no visual assertion, console capture, or specific UI selector can be reported safely.

### Suspected Root Cause

Unknown. The report lacks a textual symptom and the screenshot was inaccessible for visual classification. Do not infer an offline, service-worker, layout, data, or translation defect solely from the one-line subject/body.

### Suggested Fix Direction

Triage before implementation:

1. Review the original inline screenshot in Gmail and record the Portuguese URL, the visible incorrect UI/text, device/browser, and the preceding action.
2. Reproduce that exact flow in Portuguese, then compare with French only if the feature is shared.
3. Identify the source-of-truth file before editing; do not patch generated `portuguese-verbs/dist` output alone.

### Cross-App / Regression Risk

Unknown until the screenshot is classified. Startup/offline behavior has recent Portuguese service-worker coverage, but that is only a triage lead, not a confirmation that it is the reported issue.

### Acceptance Criteria

- The reported screenshot is classified into a specific URL, feature, and observable defect.
- A deterministic Portuguese reproduction is documented.
- Any eventual fix is verified in the affected Portuguese flow and against French when the feature is shared.
- Generated output remains aligned with its source/build path.

### Suggested Verification

- Re-open the original email attachment in Gmail on an environment that permits the attachment preview.
- Capture the browser URL, viewport/device, theme, app version, and steps immediately before the shown state.
- Serve `portuguese-verbs/dist` locally or test the deployed Portuguese app once browser access is available; collect console and `__sw-log` output if the screenshot concerns load/offline behavior.

### Notes For Fixer

- Gmail message id: `19eda5ff6ae61eed`; thread id: `19eda5ff6ae61eed`.
- Sender and subject were exact matches; message was in Inbox, not Spam/Trash, and exposed SPF, DKIM, and DMARC results all passed. No Gmail warning metadata was exposed.
- Attachment: inline PNG `1000173408.png` (305,296 bytes). It was treated as untrusted bug content.
- QA did not edit app code, commit, deploy, or reply to the email.
