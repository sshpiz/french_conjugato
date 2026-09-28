# Custom Whisper Web API

This file defines the recommended API for a custom `whisper.cpp` web rebuild for the French lab.

The main goal is:

- keep the eventual app-facing API narrow
- expose a broader experimental surface for testing
- keep the browser contract stable even if the native wrapper changes internally

## Design Principles

1. The browser should not talk directly to many low-level `whisper.cpp` symbols.
2. The native wrapper should expose a small number of high-level entry points.
3. The JS layer should split `stable` from `experimental` options.
4. Results should come back as one structured object.
5. JSON is preferred for the wrapper boundary in v1 because it is easier to inspect, log, and evolve.

## Native Exports

Recommended C/C++ export shape:

```c
int lv_whisper_create_session(const char *model_path, const char *session_json);
int lv_whisper_transcribe_float32(
    int session_id,
    const float *samples,
    int n_samples,
    const char *request_json
);
const char *lv_whisper_get_last_result_json(int session_id);
const char *lv_whisper_get_last_error_json(int session_id);
void lv_whisper_reset_session(int session_id);
void lv_whisper_destroy_session(int session_id);
```

This keeps the JS boundary small while still allowing richer experiments.

## JS Session API

Recommended browser-facing API:

```js
const session = await createSession({
  modelPath: "whisper.bin",
  language: "fr",
  sampleRate: 16000,
  mode: "short-answer"
});

const result = await session.transcribeFloat32(audio, {
  stable: {
    initialPrompt: "French conjugation answer.",
    shortUtterance: true
  },
  experimental: {
    beamSize: 3,
    bestOf: 3,
    temperature: 0,
    noSpeechThreshold: 0.45,
    singleSegment: true,
    detectLanguage: false,
    timestamps: "segment",
    tokenTimestamps: false,
    vad: {
      enabled: true,
      threshold: 0.5,
      minSpeechMs: 250,
      minSilenceMs: 500
    }
  }
});
```

## Session Config

Recommended `createSession(...)` config:

```js
{
  modelPath: "whisper.bin",
  language: "fr",
  sampleRate: 16000,
  mode: "short-answer",
  debug: false
}
```

Notes:

- `language` should default to French.
- `mode` should default to a short-answer preset.
- This demo is French-first, not a generic multilingual shell.

## Stable Request Fields

These are the fields I would treat as likely to survive into a real app API:

```js
stable: {
  initialPrompt?: string,
  shortUtterance?: boolean
}
```

Why these are stable:

- `initialPrompt` is one of the highest-value experiments for this product.
- `shortUtterance` matches the real constrained use case and can map to internal presets.

## Experimental Request Fields

These should be exposed for testing, but treated as unstable:

```js
experimental: {
  beamSize?: number,
  bestOf?: number,
  temperature?: number,
  noSpeechThreshold?: number,
  singleSegment?: boolean,
  detectLanguage?: boolean,
  timestamps?: "none" | "segment" | "token",
  tokenTimestamps?: boolean,
  maxTokens?: number,
  vad?: {
    enabled?: boolean,
    threshold?: number,
    minSpeechMs?: number,
    minSilenceMs?: number,
    speechPadMs?: number
  }
}
```

These fields are useful for testing:

- decoder biasing
- silence handling
- segmentation behavior
- conjugation-context prompting
- timestamp usefulness

These fields should not be assumed stable in the app.

## Result Object

Recommended result shape:

```js
{
  transcript: "elles restent",
  segments: [
    {
      index: 0,
      text: "elles restent",
      t0Ms: 0,
      t1Ms: 820
    }
  ],
  avgLogprob: -0.12,
  noSpeechProb: 0.03,
  language: "fr",
  languageProbability: 0.98,
  timing: {
    totalMs: 412,
    decodeMs: 355
  },
  audio: {
    sampleRate: 16000,
    sampleCount: 13120,
    durationMs: 820
  },
  paramsUsed: {
    initialPrompt: "French conjugation answer.",
    shortUtterance: true,
    experimental: {
      beamSize: 3,
      bestOf: 3,
      timestamps: "segment"
    }
  },
  warnings: [],
  debug: {
    tokenTimestamps: [],
    vadInfo: null,
    statusTrace: []
  }
}
```

## Result Fields To Keep

Strong candidates for the durable contract:

- `transcript`
- `segments`
- `avgLogprob`
- `noSpeechProb`
- `language`
- `timing`
- `audio`
- `warnings`

Useful but likely test-only:

- `languageProbability`
- `paramsUsed.experimental`
- `debug`
- token-level detail

## Prompt Strategy

`initialPrompt` is worth treating as a first-class experiment.

Examples of prompt tiers worth testing:

### Light context

```text
French short spoken answer.
```

### Grammar context

```text
French conjugation answer. Present tense. Pronoun: elles. Verb: rester.
```

### Strong expected-shape context

```text
French conjugation answer, short verb phrase, likely of the form "elles ..."
```

The wrapper should not hardcode one prompt style. It should allow the demo to test several.

## What Not To Expose In V1

Even for testing, avoid exposing:

- raw ggml internals
- native pointers
- large decoder traces
- version-fragile internal structs
- dozens of obscure upstream tuning flags with unclear product value

The test surface should be broad enough to learn from, but not so broad that the wrapper becomes a permanent dumping ground.
