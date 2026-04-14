# v0.91 Rollout Plan

Current long-running jobs:

- Greek TTS rebuild process: `pid 42140`
- Portuguese TTS build process: `pid 11532`

Current intent:

1. Wait for both background TTS jobs to finish.
2. Verify the generated Greek and Portuguese audio manifests.
3. Rebuild app bundles if needed.
4. Sync Greek and Portuguese `dist/` outputs into the French repo deploy tree.
5. Rebuild the French repo deploy output and refresh `dist-gh`.
6. Review final git status before pushing.

Notes:

- Greek `rebuild_greek_packed_tts.py` already rebuilds `dist/` at the end.
- Portuguese `build_portuguese_tts.py` does not rebuild `dist/`, so `python3 build.py` still needs to run afterward.
- The French repo remains the deploy hub. Greek should land in `proj1/dist/greek/` and Portuguese in `proj1/dist/portugese/`.
- The recent French `v0.91` UI/runtime changes still need to be propagated into Greek and Portuguese source files. That is a separate source-code sync task from the audio/build pipeline.

Watcher log:

- `/Users/simeon/Desktop/proj1/v091_watch.log`
