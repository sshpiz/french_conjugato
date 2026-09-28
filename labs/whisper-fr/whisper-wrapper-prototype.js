(function () {
    const DEFAULT_TIMEOUT_MS = 6000;
    const DEFAULT_POLL_INTERVAL_MS = 120;
    const DEFAULT_SETTLE_POLLS = 2;

    function delay(ms) {
        return new Promise((resolve) => {
            window.setTimeout(resolve, ms);
        });
    }

    function toFloat32Array(audio) {
        if (audio instanceof Float32Array) return audio;
        if (ArrayBuffer.isView(audio)) {
            return new Float32Array(audio.buffer, audio.byteOffset, audio.byteLength / Float32Array.BYTES_PER_ELEMENT);
        }
        if (audio instanceof ArrayBuffer) return new Float32Array(audio);
        throw new TypeError('transcribeFloat32 expects a Float32Array, typed-array view, or ArrayBuffer');
    }

    function readString(fn) {
        if (typeof fn !== 'function') return '';
        try {
            return String(fn() || '');
        } catch (_) {
            return '';
        }
    }

    function buildCapabilities() {
        return {
            jsSurface: ['init', 'set_audio', 'get_transcribed', 'get_status'],
            worksNow: [
                'fixed-language session init',
                'one-shot Float32 transcription',
                'whole-transcript polling',
                'structured status/timing result'
            ],
            needsCustomNativeExport: [
                'initial_prompt',
                'beam_size / best_of controls',
                'VAD threshold controls',
                'real segment timestamps',
                'confidence metadata',
                'alternatives / n-best candidates'
            ]
        };
    }

    function createWhisperSession(config) {
        const options = config || {};
        const moduleRef = options.Module || window.Module;
        const modelPath = options.modelPath || 'whisper.bin';
        const language = options.language || 'fr';
        const sampleRate = Number(options.sampleRate) || 16000;
        const print = typeof options.print === 'function' ? options.print : function () {};

        if (!moduleRef || typeof moduleRef.init !== 'function' || typeof moduleRef.set_audio !== 'function') {
            throw new Error('whisper runtime is missing the expected demo exports');
        }

        let instance = null;
        let activeRun = null;

        async function ensureReady() {
            if (!instance) {
                instance = moduleRef.init(modelPath, language);
                if (!instance) {
                    throw new Error(`Module.init(${modelPath}, ${language}) returned no instance`);
                }
            }

            return {
                instance,
                modelPath,
                language
            };
        }

        async function transcribeFloat32(audioInput, runOptions) {
            if (activeRun) {
                throw new Error('A transcription is already in progress for this session');
            }

            const input = toFloat32Array(audioInput);
            const opts = runOptions || {};
            const timeoutMs = Number(opts.timeoutMs) || DEFAULT_TIMEOUT_MS;
            const pollIntervalMs = Number(opts.pollIntervalMs) || DEFAULT_POLL_INTERVAL_MS;
            const settlePolls = Number(opts.settlePolls) || DEFAULT_SETTLE_POLLS;

            const runPromise = (async function () {
                const ready = await ensureReady();
                const startedAt = Date.now();
                const baselineTranscript = readString(moduleRef.get_transcribed).trim();
                const statusTrace = [];
                const transcriptTrace = [];
                let lastTranscript = baselineTranscript;
                let busySeen = false;
                let stablePolls = 0;
                let pollCount = 0;

                if (typeof moduleRef.set_status === 'function') {
                    try {
                        moduleRef.set_status('');
                    } catch (_) {}
                }

                moduleRef.set_audio(ready.instance, input);

                while (Date.now() - startedAt < timeoutMs) {
                    await delay(pollIntervalMs);
                    pollCount += 1;

                    const status = readString(moduleRef.get_status).trim();
                    const transcript = readString(moduleRef.get_transcribed).trim();
                    const atMs = Date.now() - startedAt;

                    statusTrace.push({
                        atMs,
                        status: status || 'idle'
                    });

                    if (status && status !== 'idle') {
                        busySeen = true;
                    }

                    if (transcript !== lastTranscript) {
                        transcriptTrace.push({
                            atMs,
                            transcript
                        });
                        lastTranscript = transcript;
                        stablePolls = transcript ? 1 : 0;
                    } else if (transcript) {
                        stablePolls += 1;
                    }

                    const transcriptChanged = transcript && transcript !== baselineTranscript;
                    const runtimeSettled = !status || status === 'idle';
                    if ((transcriptChanged && stablePolls >= settlePolls) || (busySeen && runtimeSettled)) {
                        break;
                    }
                }

                const completedAt = Date.now();
                const transcript = readString(moduleRef.get_transcribed).trim();
                const finalStatus = readString(moduleRef.get_status).trim() || 'idle';
                const structuredResult = {
                    transcript,
                    segments: transcript ? [
                        {
                            index: 0,
                            text: transcript,
                            startMs: null,
                            endMs: null,
                            synthetic: true
                        }
                    ] : [],
                    alternatives: [],
                    status: {
                        final: finalStatus,
                        trace: statusTrace
                    },
                    timing: {
                        startedAt,
                        completedAt,
                        elapsedMs: completedAt - startedAt,
                        pollCount
                    },
                    audio: {
                        sampleRate,
                        sampleCount: input.length,
                        durationMs: Math.round((input.length / sampleRate) * 1000)
                    },
                    trace: {
                        transcripts: transcriptTrace
                    },
                    capabilities: buildCapabilities()
                };

                print(
                    `wrapper: transcript="${structuredResult.transcript || ''}" elapsed=${structuredResult.timing.elapsedMs}ms polls=${pollCount} finalStatus=${finalStatus}`
                );

                return structuredResult;
            })();

            activeRun = runPromise.finally(() => {
                activeRun = null;
            });

            return activeRun;
        }

        return {
            ensureReady,
            transcribeFloat32,
            getCapabilities: buildCapabilities,
            get instance() {
                return instance;
            }
        };
    }

    window.createWhisperFrSession = createWhisperSession;
})();
