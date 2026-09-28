(function () {
    let legacyRuntimePromise = null;

    function delay(ms) {
        return new Promise((resolve) => window.setTimeout(resolve, ms));
    }

    function toFloat32Array(audio) {
        if (audio instanceof Float32Array) return audio;
        if (ArrayBuffer.isView(audio)) {
            return new Float32Array(audio.buffer, audio.byteOffset, audio.byteLength / Float32Array.BYTES_PER_ELEMENT);
        }
        if (audio instanceof ArrayBuffer) return new Float32Array(audio);
        throw new TypeError('Expected Float32Array-compatible audio input');
    }

    function readString(fn) {
        if (typeof fn !== 'function') return '';
        try {
            return String(fn() || '');
        } catch (_) {
            return '';
        }
    }

    function buildWarning(message, code) {
        return {
            code: code || 'info',
            message
        };
    }

    function buildParamsUsed(config, request) {
        return {
            language: config.language || 'fr',
            mode: config.mode || 'short-answer',
            stable: {
                initialPrompt: request.stable?.initialPrompt || '',
                shortUtterance: request.stable?.shortUtterance !== false
            },
            experimental: { ...(request.experimental || {}) }
        };
    }

    function loadLegacyRuntimeScript() {
        if (window.Module && typeof window.Module.init === 'function' && typeof window.Module.set_audio === 'function') {
            return Promise.resolve(window.Module);
        }

        if (legacyRuntimePromise) return legacyRuntimePromise;

        legacyRuntimePromise = new Promise((resolve, reject) => {
            const existing = document.querySelector('script[data-whisper-legacy-runtime="1"]');
            if (existing) {
                existing.addEventListener('load', () => resolve(window.Module), { once: true });
                existing.addEventListener('error', () => reject(new Error('Failed to load legacy whisper runtime.')), { once: true });
                return;
            }

            const script = document.createElement('script');
            script.src = './stream.js';
            script.async = true;
            script.dataset.whisperLegacyRuntime = '1';
            script.onload = function () {
                resolve(window.Module);
            };
            script.onerror = function () {
                reject(new Error('Failed to load legacy whisper runtime.'));
            };
            document.head.appendChild(script);
        }).catch((error) => {
            legacyRuntimePromise = null;
            throw error;
        });

        return legacyRuntimePromise;
    }

    function createLegacySession(config) {
        const moduleRef = config.Module || window.Module;
        const print = typeof config.print === 'function' ? config.print : function () {};
        let instance = null;

        async function ensureReady() {
            if (!moduleRef || typeof moduleRef.init !== 'function' || typeof moduleRef.set_audio !== 'function') {
                await loadLegacyRuntimeScript();
            }

            if (!moduleRef || typeof moduleRef.init !== 'function' || typeof moduleRef.set_audio !== 'function') {
                throw new Error('Legacy whisper demo runtime is not available');
            }

            if (!instance) {
                instance = moduleRef.init(config.modelPath || 'whisper.bin', config.language || 'fr');
                if (!instance) {
                    throw new Error('Legacy demo runtime failed to initialize');
                }
            }

            return {
                engine: 'legacy-demo-runtime',
                instance
            };
        }

        async function transcribeFloat32(audioInput, request) {
            const ready = await ensureReady();
            const input = toFloat32Array(audioInput);
            const startedAt = Date.now();
            const transcriptBefore = readString(moduleRef.get_transcribed).trim();
            const pollIntervalMs = Number(request.pollIntervalMs) || 120;
            const timeoutMs = Number(request.timeoutMs) || 6000;
            const statusTrace = [];
            const transcriptTrace = [];
            const warnings = [
                buildWarning('Using legacy vendored demo runtime; advanced controls are not yet wired natively.', 'legacy_runtime')
            ];
            let lastTranscript = transcriptBefore;
            let finalTranscript = transcriptBefore;
            let busySeen = false;
            let stablePolls = 0;

            if (request.stable?.initialPrompt) {
                warnings.push(buildWarning('initialPrompt requested but not supported by the current vendored runtime.', 'unsupported_initial_prompt'));
            }

            if (request.experimental && Object.keys(request.experimental).length) {
                warnings.push(buildWarning('Experimental decode controls were requested but are not yet supported by the current vendored runtime.', 'unsupported_experimental_controls'));
            }

            if (typeof moduleRef.set_status === 'function') {
                try {
                    moduleRef.set_status('');
                } catch (_) {}
            }

            moduleRef.set_audio(ready.instance, input);

            while (Date.now() - startedAt < timeoutMs) {
                await delay(pollIntervalMs);

                const status = readString(moduleRef.get_status).trim() || 'idle';
                const transcript = readString(moduleRef.get_transcribed).trim();
                const atMs = Date.now() - startedAt;

                statusTrace.push({ atMs, status });

                if (status !== 'idle') {
                    busySeen = true;
                }

                if (transcript && transcript !== lastTranscript) {
                    transcriptTrace.push({ atMs, transcript });
                    lastTranscript = transcript;
                    finalTranscript = transcript;
                    stablePolls = 1;
                } else if (transcript) {
                    stablePolls += 1;
                    finalTranscript = transcript;
                }

                if ((finalTranscript && finalTranscript !== transcriptBefore && stablePolls >= 2) || (busySeen && status === 'idle')) {
                    break;
                }
            }

            const completedAt = Date.now();
            const finalStatus = readString(moduleRef.get_status).trim() || 'idle';
            const transcript = readString(moduleRef.get_transcribed).trim() || finalTranscript;

            print(`demo-api: legacy transcript="${transcript}" finalStatus=${finalStatus}`);

            return {
                transcript,
                segments: transcript ? [
                    {
                        index: 0,
                        text: transcript,
                        t0Ms: null,
                        t1Ms: null,
                        synthetic: true
                    }
                ] : [],
                avgLogprob: null,
                noSpeechProb: null,
                language: config.language || 'fr',
                languageProbability: null,
                timing: {
                    totalMs: completedAt - startedAt,
                    decodeMs: completedAt - startedAt
                },
                audio: {
                    sampleRate: Number(config.sampleRate) || 16000,
                    sampleCount: input.length,
                    durationMs: Math.round((input.length / (Number(config.sampleRate) || 16000)) * 1000)
                },
                paramsUsed: buildParamsUsed(config, request),
                warnings,
                debug: {
                    engine: 'legacy-demo-runtime',
                    statusTrace,
                    transcriptTrace,
                    tokenTimestamps: [],
                    vadInfo: null
                }
            };
        }

        return {
            ensureReady,
            transcribeFloat32,
            reset() {
                instance = null;
            }
        };
    }

    function createCustomRuntimeSession(config) {
        const runtime = window.LesVerbesWhisperRuntime;
        const print = typeof config.print === 'function' ? config.print : function () {};
        let sessionHandle = null;

        async function ensureReady() {
            if (!runtime || typeof runtime.createSession !== 'function') {
                throw new Error('Custom Les Verbes whisper runtime is not available');
            }

            if (!sessionHandle) {
                sessionHandle = await runtime.createSession({
                    modelPath: config.modelPath || 'whisper.bin',
                    modelBytes: config.modelBytes || null,
                    language: config.language || 'fr',
                    sampleRate: config.sampleRate || 16000,
                    mode: config.mode || 'short-answer'
                });
            }

            return {
                engine: 'custom-runtime',
                instance: sessionHandle
            };
        }

        async function transcribeFloat32(audioInput, request) {
            const ready = await ensureReady();
            const result = await runtime.transcribeFloat32(ready.instance, toFloat32Array(audioInput), request);
            print(`demo-api: custom-runtime transcript="${result?.transcript || ''}"`);
            return result;
        }

        return {
            ensureReady,
            transcribeFloat32,
            reset() {
                if (sessionHandle && typeof runtime.resetSession === 'function') {
                    runtime.resetSession(sessionHandle);
                }
            },
            destroy() {
                if (sessionHandle && typeof runtime.destroySession === 'function') {
                    runtime.destroySession(sessionHandle);
                    sessionHandle = null;
                }
            }
        };
    }

    function createLesVerbesWhisperSession(config) {
        const sessionConfig = config || {};
        const hasCustomRuntime = !!(window.LesVerbesWhisperRuntime && typeof window.LesVerbesWhisperRuntime.createSession === 'function');
        if (hasCustomRuntime) {
            return createCustomRuntimeSession(sessionConfig);
        }
        return createLegacySession(sessionConfig);
    }

    window.createLesVerbesWhisperSession = createLesVerbesWhisperSession;
})();
