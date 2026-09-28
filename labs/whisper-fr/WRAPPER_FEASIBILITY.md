# Whisper.cpp Web Wrapper Feasibility

This lab currently uses the narrow JS surface from the vendored `whisper.cpp` web demo.

## What The Current Demo Exposes

From the runtime surface used in this lab, the practical JS API is:

- `Module.init(modelPath, language)`
- `Module.set_audio(instance, float32Audio)`
- `Module.get_transcribed()`
- `Module.get_status()`

That is enough for:

- fixed-language initialization
- sending decoded `Float32Array` audio into the model
- polling a single rolling transcript string
- polling coarse runtime status

It is not enough for:

- prompt injection from JS
- beam/best-of controls from JS
- real segment arrays from JS
- confidence or token metadata from JS
- alternative hypotheses from JS

## What The Vendored Native Bundle Seems To Contain Internally

The bundled `stream.js` string table strongly suggests native support exists internally for:

- VAD and speech-segment processing
- initial prompt handling
- token-level timestamp code paths
- language auto-detection
- internal `whisper_full(...)` execution

However, those lower-level `whisper_*` entry points are not exported on the current `Module` object in the browser-facing demo build. In local inspection, the raw `_whisper_*` symbols are not directly available through `Module`.

## Easy Vs Medium Vs Hard

### Easy

- Keep language fixed to French at session creation time
- Offer a cleaner JS session API
- Add a direct one-shot `transcribeFloat32(audio)` wrapper
- Return structured timing and status information
- Return a whole-result transcript object instead of only a rolling string

### Medium

- Expose configurable decode params if the existing C++ wrapper already has them but they are just not bound yet
- Expose segment text and timestamps if we add a small native wrapper plus embind/export glue
- Add JS-visible VAD on/off or use built-in VAD modes if the native wrapper can surface them simply

### Hard

- Confidence-like metadata with product-grade meaning
- Multiple candidates / n-best hypotheses
- Fine beam/best-of decoding control with a stable JS API
- Token-level timestamps or per-token probabilities in a way that is worth shipping

Those harder items likely need a custom `whisper.cpp` wrapper layer, explicit exported structs/functions, and a rebuild of the vendored web runtime.

## Prototype Included In This Lab

This prototype adds `whisper-wrapper-prototype.js`, which exposes:

- `window.createWhisperFrSession(...)`
- `session.ensureReady()`
- `session.transcribeFloat32(audio, options)`

The wrapper currently returns:

- `transcript`
- synthetic single-item `segments` array
- `alternatives` as an empty array
- structured `status.trace`
- structured timing/audio metadata
- a capabilities summary describing what still needs native exports

This is intentionally a research/prototype API, not a ship-ready contract.

## Recommendation

The next best engineering step is:

1. Fork the vendored `whisper.cpp` web wrapper source, not just the lab app JS.
2. Add one small exported native result function that returns segment-level data after `whisper_full(...)`.
3. Add one small exported options object for the highest-value constrained controls:
   - fixed French
   - prompt text
   - VAD mode/thresholds
   - short-utterance decoding preset
4. Rebuild the vendored runtime only after that minimal wrapper shape is agreed.

For this lab's constrained short-answer French use case, the highest-value first native upgrade is probably:

- `transcribeFloat32(audio, { initialPrompt, vadPreset, shortUtterance: true })`
- returning `{ transcript, segments }`

That would deliver most of the practical value before attempting confidence or n-best hypotheses.
