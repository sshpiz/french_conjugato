(function () {
    const runtimeUrl = window.__LESVERBES_WHISPER_RUNTIME_URL__ || './runtime/lesverbes-whisper.js';
    const useBridgeWorker = window.__LESVERBES_USE_RUNTIME_BRIDGE_WORKER__ === true;
    const workerUrl = window.__LESVERBES_WHISPER_WORKER_URL__ || './lesverbes-whisper-runtime-worker.js';
    let runtimeReady = null;
    let runtimeModule = null;
    let worker = null;
    let nextRequestId = 1;
    const pending = new Map();

    function print(text) {
        if (typeof window.printTextarea === 'function') {
            window.printTextarea(text);
            return;
        }
        console.log(text);
    }

    function toUint8Array(value) {
        if (!value) return null;
        if (value instanceof Uint8Array) return value;
        if (ArrayBuffer.isView(value)) {
            return new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
        }
        if (value instanceof ArrayBuffer) return new Uint8Array(value);
        throw new TypeError('Expected Uint8Array-compatible model bytes');
    }

    function fingerprintBytes(bytes) {
        const view = toUint8Array(bytes);
        if (!view) return '';
        const head = Array.from(view.slice(0, 8)).map((value) => value.toString(16).padStart(2, '0')).join('');
        const tail = Array.from(view.slice(Math.max(0, view.length - 8))).map((value) => value.toString(16).padStart(2, '0')).join('');
        return `${view.length}:${head}:${tail}`;
    }

    function sendMessage(type, payload) {
        return new Promise((resolve, reject) => {
            const id = nextRequestId++;
            pending.set(id, { resolve, reject });
            worker.postMessage({ id, type, ...(payload || {}) });
        });
    }

    function ensureRuntimeScript() {
        if (runtimeReady) return runtimeReady;

        runtimeReady = new Promise((resolve, reject) => {
            if (typeof window.createLesVerbesWhisperModule === 'function') {
                resolve(window.createLesVerbesWhisperModule);
                return;
            }

            const script = document.createElement('script');
            script.async = true;
            script.src = runtimeUrl;
            script.onload = function () {
                if (typeof window.createLesVerbesWhisperModule !== 'function') {
                    reject(new Error('createLesVerbesWhisperModule was not found after loading the custom runtime.'));
                    return;
                }
                resolve(window.createLesVerbesWhisperModule);
            };
            script.onerror = function () {
                reject(new Error(`Failed to load ${runtimeUrl}`));
            };
            document.head.appendChild(script);
        }).catch((error) => {
            print(`custom-runtime: ${error.message || error}`);
            runtimeReady = null;
            throw error;
        });

        return runtimeReady;
    }

    function ensureWorker() {
        if (!useBridgeWorker) {
            return Promise.reject(new Error('Bridge worker mode is disabled.'));
        }

        if (runtimeReady) return runtimeReady;

        runtimeReady = new Promise((resolve, reject) => {
            try {
                worker = new Worker(workerUrl);
            } catch (error) {
                reject(error);
                return;
            }

            worker.onmessage = function (event) {
                const message = event.data || {};

                if (message.type === 'log') {
                    print(message.text);
                    return;
                }

                const request = pending.get(message.id);
                if (!request) return;
                pending.delete(message.id);

                if (message.type === 'error') {
                    request.reject(new Error(message.error || 'Worker request failed'));
                    return;
                }

                request.resolve(message.result);
            };

            worker.onerror = function (error) {
                reject(error instanceof ErrorEvent ? error.error || new Error(error.message) : error);
            };

            sendMessage('init', { runtimeUrl }).then(function () {
                print(`custom-runtime: runtime worker ready from ${runtimeUrl}`);
                resolve(worker);
            }).catch(reject);
        }).catch((error) => {
            print(`custom-runtime: ${error.message || error}`);
            runtimeReady = null;
            worker = null;
            throw error;
        });

        return runtimeReady;
    }

    function ensureFloat32Array(value) {
        if (value instanceof Float32Array) return value;
        if (ArrayBuffer.isView(value)) {
            return new Float32Array(value.buffer, value.byteOffset, value.byteLength / Float32Array.BYTES_PER_ELEMENT);
        }
        if (value instanceof ArrayBuffer) return new Float32Array(value);
        throw new TypeError('Expected Float32Array-compatible audio');
    }

    function prepareModelFile(module, modelPath, modelBytes) {
        const bytes = toUint8Array(modelBytes);
        try {
            module.FS_unlink(modelPath);
        } catch (_) {}
        module.FS_createDataFile('/', modelPath, bytes, true, true);
    }

    async function ensureModule() {
        if (useBridgeWorker) {
            await ensureWorker();
            return null;
        }

        if (runtimeModule) return runtimeModule;

        const createModule = await ensureRuntimeScript();
        const runtimeScriptUrl = new URL(runtimeUrl, window.location.href).href;
        const runtimeBase = runtimeScriptUrl.slice(0, runtimeScriptUrl.lastIndexOf('/') + 1);

        runtimeModule = await createModule({
            noInitialRun: true,
            mainScriptUrlOrBlob: runtimeScriptUrl,
            print,
            printErr: print,
            locateFile: function (path) {
                return runtimeBase + path;
            }
        });

        print(`custom-runtime: main-thread runtime ready from ${runtimeScriptUrl}`);
        return runtimeModule;
    }

    async function createSession(config) {
        if (useBridgeWorker) {
            await ensureWorker();
            const modelPath = config.modelPath || 'whisper.bin';
            const modelBytes = toUint8Array(config.modelBytes);
            if (!modelBytes || !modelBytes.length) {
                throw new Error(`Model bytes are required to initialize ${modelPath} in the custom runtime.`);
            }

            const sessionConfig = await sendMessage('createSession', {
                config: {
                    modelPath,
                    modelBytes,
                    modelFingerprint: fingerprintBytes(modelBytes),
                    language: config.language || 'fr',
                    sampleRate: config.sampleRate || 16000,
                    mode: config.mode || 'short-answer'
                }
            });

            return {
                handle: sessionConfig.handle,
                modelPath
            };
        }

        const module = await ensureModule();
        const modelPath = config.modelPath || 'whisper.bin';
        const modelBytes = toUint8Array(config.modelBytes);
        if (!modelBytes || !modelBytes.length) {
            throw new Error(`Model bytes are required to initialize ${modelPath} in the custom runtime.`);
        }

        prepareModelFile(module, modelPath, modelBytes);

        const handle = module.ccall(
            'lv_whisper_create_session',
            'number',
            ['string', 'string'],
            [modelPath, JSON.stringify({
                language: config.language || 'fr',
                sampleRate: config.sampleRate || 16000,
                mode: config.mode || 'short-answer'
            })]
        );

        if (!handle || handle < 0) {
            throw new Error('Custom runtime failed to create a session.');
        }

        return { handle, modelPath };
    }

    async function transcribeFloat32(session, audioInput, request) {
        if (useBridgeWorker) {
            await ensureWorker();
            const audio = audioInput instanceof Float32Array ? audioInput : new Float32Array(audioInput);
            return sendMessage('transcribe', {
                handle: session.handle,
                audio,
                request: request || {}
            });
        }

        const module = await ensureModule();
        const audio = ensureFloat32Array(audioInput);
        const ptr = module._malloc(audio.length * Float32Array.BYTES_PER_ELEMENT);
        module.HEAPF32.set(audio, ptr >> 2);

        try {
            const rc = module.ccall(
                'lv_whisper_transcribe_float32',
                'number',
                ['number', 'number', 'number', 'string'],
                [session.handle, ptr, audio.length, JSON.stringify(request || {})]
            );

            if (rc !== 0) {
                const errorJson = module.ccall(
                    'lv_whisper_get_last_error_json',
                    'string',
                    ['number'],
                    [session.handle]
                );
                throw new Error(errorJson || `Custom runtime transcription failed with code ${rc}.`);
            }

            const resultJson = module.ccall(
                'lv_whisper_get_last_result_json',
                'string',
                ['number'],
                [session.handle]
            );

            return JSON.parse(resultJson || '{}');
        } finally {
            module._free(ptr);
        }
    }

    async function resetSession(session) {
        if (useBridgeWorker) {
            await ensureWorker();
            return sendMessage('resetSession', { handle: session.handle });
        }

        const module = await ensureModule();
        module.ccall('lv_whisper_reset_session', null, ['number'], [session.handle]);
        return { ok: true };
    }

    async function destroySession(session) {
        if (useBridgeWorker) {
            await ensureWorker();
            return sendMessage('destroySession', { handle: session.handle });
        }

        const module = await ensureModule();
        module.ccall('lv_whisper_destroy_session', null, ['number'], [session.handle]);
        return { ok: true };
    }

    function bootstrapRuntime() {
        if (window.crossOriginIsolated === false && 'serviceWorker' in navigator) {
            print('custom-runtime: waiting for COI before initializing custom runtime.');
            return;
        }

        ensureModule().then(function () {
            window.LesVerbesWhisperRuntime = {
                createSession,
                transcribeFloat32,
                resetSession,
                destroySession
            };
            window.dispatchEvent(new CustomEvent('lesverbes-runtime-ready', {
                detail: {
                    mode: useBridgeWorker ? 'bridge-worker' : 'main-thread'
                }
            }));
        }).catch(function () {
            window.dispatchEvent(new CustomEvent('lesverbes-runtime-failed'));
        });
    }

    bootstrapRuntime();
})();
