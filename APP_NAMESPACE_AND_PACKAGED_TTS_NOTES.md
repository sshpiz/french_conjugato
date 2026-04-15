## App Namespace And Packaged TTS Notes

This note captures the cross-app browser-state pattern used by the French, Greek, and Portuguese apps, plus the current packaged-audio prefetch behavior.

### Storage rules

- Each app now defines `window.appStoragePrefix` in its `index.html`.
- Each app also exposes:
  - `window.getAppStorageKey(name)`
  - `window.getAppStoredItem(name)`
  - `window.setAppStoredItem(name, value)`
  - `window.removeAppStoredItem(name)`
- App-specific browser state should use those helpers.
- Do not use generic `localStorage` keys for app behavior, because all apps share the same origin and therefore the same `localStorage` namespace.

### Keys that are now app-scoped

- `app_version`
- `ttsVoiceName`
- `practiceMode`
- `app-debug-log`
- daily progress counter keys
- `safe-mode`
- `error-log`
- `ftue-shown`
- `tutorial_seen`
- `correct-dictation-next-question`
- `autosay-enabled`
- `verbLog`
- `lastPreset`
- `presets`

### Keys intentionally left shared

- `themeMode`
- `fontScale`

These still behave like cross-app device preferences on purpose.

### Important migration choice

The new namespaced keys do **not** import old generic values automatically.

Reason:
- the old generic keys were already polluted by sibling apps on the same origin
- importing them would preserve the exact collision bug we are trying to eliminate

So the new behavior prefers a clean app-specific reset over carrying forward contaminated shared state.

### Version handling

Do **not** call `localStorage.clear()` on app version mismatch.

Each app now stores its own scoped version key instead:
- `french:app_version`
- `greek:app_version`
- `portuguese:app_version`

That avoids one app wiping another app's settings.

### Packaged TTS gradual download behavior

Current intended behavior:

1. If the app detects no good native TTS voice for its language:
- packaged TTS is auto-enabled
- top 20 packaged audio is prefetched once
- the current card's verb pack is then prefetched as the user advances

2. If the user manually enables packaged audio:
- top 20 packaged audio is also prefetched once
- the current card's verb pack is prefetched as the user advances

3. Manual prefetch buttons still work as before:
- `top20`
- other tiers or full bundle, depending on the app

4. On-demand playback is still the last fallback:
- if a needed pack is still missing when the user taps audio, the runtime can fetch it then

### Implementation pattern for new language clones

When creating a new language app:

1. In `index.html`, set:
- `window.appStoragePrefix = '<language>'`

2. Expose the 4 helper functions above.

3. In `js/script.js`, derive:
- `APP_STORAGE_PREFIX`
- `getScopedStorageKey`
- `getScopedStorageItem`
- `setScopedStorageItem`
- `removeScopedStorageItem`

4. Use those helpers for every app-specific browser key.

5. Keep packaged-audio gradual prefetch tied to:
- packaged TTS explicitly enabled, or
- native TTS unavailable/unsupported

6. Avoid generic storage keys unless they are intentionally shared across all apps.
