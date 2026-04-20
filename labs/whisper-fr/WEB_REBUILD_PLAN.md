# Web Rebuild Plan

This file defines the recommended rebuild path for turning the French lab into a local-first but pushable custom web demo.

## Goal

Produce a browser-based Whisper demo that:

- works locally first
- is static-host-friendly later
- is tuned for French short-answer dictation
- supports richer experimental controls than the current vendored demo runtime
- remains narrow enough to evolve into a cleaner product API later

## Current State

Current lab:

- [index.html](/Users/simeon/Desktop/proj1/labs/whisper-fr/index.html:1)
- [app.js](/Users/simeon/Desktop/proj1/labs/whisper-fr/app.js:1)
- [helpers.js](/Users/simeon/Desktop/proj1/labs/whisper-fr/helpers.js:1)
- [coi-serviceworker.js](/Users/simeon/Desktop/proj1/labs/whisper-fr/coi-serviceworker.js:1)
- vendored built runtime: `stream.js`

Current constraints:

- the current web runtime appears to rely on worker/thread-capable WASM behavior
- the lab already uses a COI service worker to reach `crossOriginIsolated`
- models are fetched and cached in IndexedDB
- there is no local `whisper.cpp` source checkout in this repo right now

## Key Rebuild Decision

Do not rebuild directly into the page code.

Instead, rebuild around a custom web runtime package with a clear boundary:

- upstream/native source lives separately
- the lab page consumes a generated runtime artifact
- the app-side JS only talks to a higher-level wrapper

## Recommended Architecture

### Source-side ownership

Recommended source structure:

```text
labs/whisper-fr/
  index.html
  app.js
  helpers.js
  coi-serviceworker.js
  whisper-demo-api.js
  CUSTOM_WEB_API.md
  WEB_REBUILD_PLAN.md

vendor-src/
  whisper.cpp/            # upstream source checkout or subtree
  lesverbes-whisper-web/  # custom wrapper source and build scripts
```

### Generated runtime artifacts

These should be build outputs, not hand-edited source:

```text
labs/whisper-fr/runtime/
  lesverbes-whisper.js
  lesverbes-whisper.wasm
  lesverbes-whisper.worker.js
```

This keeps the demo pushable as static files later.

## Browser Runtime Requirements

The demo should assume:

- secure context
- service-worker-based COI fallback or server-set COOP/COEP headers
- worker support
- IndexedDB caching

Practical implications:

- local dev should be served over `http://localhost` or another secure-context-compatible setup
- pushed hosting must preserve worker/WASM serving and COI behavior
- a static host is fine as long as the required browser isolation path works

## Local-First, Pushable Demo Shape

The demo should be treated as a static site from the beginning:

- one HTML entry point
- plain JS wrapper
- WASM and worker assets beside it
- model downloads handled at runtime

That means local development should mirror the final host shape as closely as possible.

## Demo UX Recommendation

Start with a simple demo plus an expandable experimental panel.

### Always-visible

- model selection
- prompt text
- start/stop recording
- transcript
- segments
- timing/status

### Expandable experimental panel

- beam size
- best-of
- no-speech threshold
- timestamps mode
- VAD options
- language-detect toggle
- debug result JSON

This keeps the demo usable while still supporting serious testing.

## Native Wrapper Scope

The first rebuild should target one-shot transcription only.

Why:

- the product use case is short-answer dictation
- one-shot audio is simpler to test and reason about
- it reduces wrapper complexity
- it is enough to validate prompting, decoding, and segmentation experiments

Skip streaming for v1.

## Rebuild Phases

### Phase 1: Design freeze

- finalize API contract
- finalize result schema
- finalize demo UX shape

### Phase 2: Source integration

- vendor or subtree `whisper.cpp`
- add custom wrapper source
- add build script for web runtime output

### Phase 3: Local runtime build

- compile JS/WASM/worker artifacts
- load the runtime from the lab page
- verify COI and worker behavior locally

### Phase 4: Experimental validation

- test prompt tiers
- test short-utterance presets
- test segment outputs
- test VAD options
- compare results on real conjugation prompts

### Phase 5: Pushable packaging

- confirm static-host compatibility
- confirm asset layout
- confirm COI strategy on final host

## What Must Be Verified Early

These are the first real risks to check once source is vendored:

- can the custom build expose the desired wrapper functions cleanly
- can the browser build still run under the lab's COI path
- can segment/timestamp output be surfaced without turning the API into a mess
- can prompts improve constrained French recognition without over-biasing

## First Useful Runtime Capability Set

A strong v1 rebuild target is:

- French fixed by default
- `initialPrompt`
- one-shot `Float32` transcription
- segment outputs
- `avgLogprob`
- `noSpeechProb`
- optional VAD controls
- optional beam/best-of controls

That is enough to answer the important product questions.

## What To Delay

Delay these until the first rebuild proves stable:

- streaming
- alternatives / n-best hypotheses
- token-level debug UI
- generic multilingual productization
- full low-level decoder exposure

## Recommended Next Concrete Step

The next concrete engineering step is not page polish.

It is:

1. add the wrapper contract to source
2. vendor upstream `whisper.cpp` source
3. create a dedicated custom web wrapper build target
4. produce a local runtime artifact that the existing lab can load

That is the shortest path from the current prototype discussion to a real, pushable custom web demo.
