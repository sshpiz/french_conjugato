# Codex Handoff

Use this repo, not the stale path:
- Correct repo: `/Users/simeon/Desktop/proj1`
- Wrong/stale path that caused confusion before: `/Users/simeon/Documents/ccode/proj1`

## Current deploy state
- `gh-pages` worktree: `/Users/simeon/Desktop/proj1/dist-gh`
- Remote `gh-pages` is up to date with local.
- Latest deploy commit on `gh-pages`: `a25f487`
- Previous larger multi-app deploy commit: `e94c0c9`

## Live site layout on GitHub Pages
- French app: `/`
- Greek app: `/greek-verbs/`
- Portuguese app: `/portugese/`
- It is **not** `/greek/`

## Recent work completed
- French app:
  - packaged TTS pipeline using macOS `say`
  - packed audio assets in `dist/tts/`
  - debug log now has an in-app back/close path
  - text-size scaling now also affects usage nuggets
- Greek app:
  - deployed as subfolder under `/greek-verbs/`
- Portuguese app:
  - live on `/portugese/`
  - latest follow-up deploy updated `portugese/favicon_big.png`, `portugese/index.html`, and `portugese/portoconjugue.html`

## Important repo details
- `dist/` currently contains:
  - French root files
  - `dist/greek-verbs/`
  - `dist/portugese/`
  - French `dist/tts/`
- Deploy flow used:
  - sync `dist/` into `dist-gh/`
  - commit on `dist-gh` branch `gh-pages`
  - push `origin gh-pages`

## If continuing work
1. Start Codex in `/Users/simeon/Desktop/proj1`.
2. Check `git status` in both repo root and `dist-gh` before changing deploys.
3. If touching GitHub Pages, remember the published Greek path is `greek-verbs`, not `greek`.
4. If working on Portuguese packaged audio, the prompt for Claude was already prepared in chat: use Portugal Portuguese voice (`pt-PT`) and packed mode only (`--pack` as the main path).

## Open follow-up
- Rebuild packaged TTS for newer phrase / fill-blanks decks after phrase content changes land. The phrase-side audio inventory will lag unless we regenerate it explicitly.

## Quick sanity commands
```bash
cd /Users/simeon/Desktop/proj1
git status

git -C dist-gh status
git -C dist-gh log --oneline -n 3
```
