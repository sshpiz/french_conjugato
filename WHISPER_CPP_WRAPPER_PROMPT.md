Please investigate a **custom French whisper.cpp web wrapper** for our lab.

Important:
- research/prototype only
- French lab only
- source files only
- do not touch `dist/`, `dist-gh/`, or generated files
- do not push or deploy unless explicitly asked
- respond in English

## Context

Repo:
- `/Users/simeon/Desktop/proj1`

Current experiment page:
- `/Users/simeon/Desktop/proj1/labs/whisper-fr/`

Current runtime:
- official `whisper.cpp` browser demo runtime vendored locally
- currently used through the narrow JS surface from the upstream demo

Problem:
- the default runtime is very limited from JS
- we want to know how hard it would be to expose more useful controls/outputs for our constrained short-answer use case

## Goal

Investigate how to expose a richer JS-facing wrapper around `whisper.cpp` for the web experiment, especially for short French dictation.

We are **not** asking you to fully ship it into the app.
This is an investigation / prototype / implementation-feasibility pass.

## What we care about

Please find out how realistic it is to expose some or all of these:

1. Better decoding / control parameters:
   - language fixed to French
   - short utterance mode
   - VAD / silence threshold controls
   - `initial_prompt` or similar contextual hinting if available
   - beam/best-of style decoding parameters if available

2. Better outputs:
   - richer transcript access than the current single rolling result
   - confidence-like metadata if available
   - multiple candidates / alternative hypotheses if realistically exposable
   - segment-level outputs if available

3. A JS API shape that would be useful for our app later, for example:
   - `createSession(...)`
   - `transcribeFloat32(audio, options)`
   - returns:
     - transcript
     - segments
     - candidates / alternatives (if possible)
     - timing / confidence info

## Deliverables

Please provide:

1. A short explanation of:
   - what the upstream `whisper.cpp` web demo currently exposes
   - what would need a custom wrapper or custom build
   - which requested features are easy vs medium vs hard

2. If practical, a small prototype or proof-of-concept in the lab source tree showing one extra useful exposed capability.

Examples of acceptable small wins:
- exposing a configurable prompt/parameter surface
- exposing a direct one-shot transcription function
- exposing segment text/timestamps in a cleaner JS result

3. A recommendation for the next best engineering step if we keep pursuing this experiment.

## Constraints

- Do not redesign the whole lab UI
- Do not deploy
- Do not spend time on unrelated product polish
- Focus on the wrapper/API feasibility and the most useful next capability

## Notes

Our use case is unusually constrained:
- short answers
- language known
- expected answer known

So a wrapper that gives us even modest extra control could still be very valuable.
