(function () {
    let runtimePromise = null;
    let runtimeUrl = './runtime/lesverbes-whisper.js';
    let runtimeBase = './runtime/';

    function post(type, payload) {
        self.postMessage({ type, ...payload });
    }

    function log(text) {
        post('log', { text: String(text) });
    }

    function ensureUint8Array(value) {
        if (value instanceof Uint8Array) return value;
        if (ArrayBuffer.isView(value)) {
            return new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
        }
        if (value instanceof ArrayBuffer) return new Uint8Array(value);
        throw new TypeError('Expected Uint8Array-compatible data');
    }

    function ensureFloat32Array(value) {
        if (value instanceof Float32Array) return value;
        if (ArrayBuffer.isView(value)) {
            return new Float32Array(value.buffer, value.byteOffset, value.byteLength / Float32Array.BYTES_PER_ELEMENT);
        }
        if (value instanceof ArrayBuffer) return new Float32Array(value);
        throw new TypeError('Expected Float32Array-compatible audio');
    }

    async function ensureRuntime() {
        if (runtimePromise) return runtimePromise;

        runtimePromise = (async function () {
            importScripts(runtimeUrl);
            if (typeof self.createLesVerbesWhisperModule !== 'function') {
                throw new Error('createLesVerbesWhisperModule was not found after loading the custom runtime.');
            }

            const runtimeScriptUrl = new URL(runtimeUrl, self.location.href).href;
            const module = await self.createLesVerbesWhisperModule({
                noInitialRun: true,
                mainScriptUrlOrBlob: runtimeScriptUrl,
                print: log,
                printErr: log,
                locateFile: function (path) {
                    return runtimeBase + path;
                }
            });

            log(`custom-runtime-worker: runtime booted from ${runtimeScriptUrl}`);

            return module;
        })();

        return runtimePromise;
    }

    function prepareModelFile(module, modelPath, modelBytes) {
        const bytes = ensureUint8Array(modelBytes);
        try {
            module.FS_unlink(modelPath);
        } catch (_) {}
        module.FS_createDataFile('/', modelPath, bytes, true, true);
    }

    async function handleCreateSession(message) {
        const module = await ensureRuntime();
        const config = message.config || {};
        const modelPath = config.modelPath || 'whisper.bin';
        prepareModelFile(module, modelPath, config.modelBytes);
        const sessionConfig = {
            language: config.language || 'fr',
            sampleRate: config.sampleRate || 16000,
            mode: config.mode || 'short-answer'
        };

        const handle = module.ccall(
            'lv_whisper_create_session',
            'number',
            ['string', 'string'],
            [modelPath, JSON.stringify(sessionConfig)]
        );

        if (!handle || handle < 0) {
            throw new Error('Custom runtime failed to create a session.');
        }

        return { handle };
    }

    async function handleTranscribe(message) {
        const module = await ensureRuntime();
        const audio = ensureFloat32Array(message.audio);
        const ptr = module._malloc(audio.length * Float32Array.BYTES_PER_ELEMENT);
        module.HEAPF32.set(audio, ptr >> 2);

        try {
            const rc = module.ccall(
                'lv_whisper_transcribe_float32',
                'number',
                ['number', 'number', 'number', 'string'],
                [message.handle, ptr, audio.length, JSON.stringify(message.request || {})]
            );

            if (rc !== 0) {
                const errorJson = module.ccall(
                    'lv_whisper_get_last_error_json',
                    'string',
                    ['number'],
                    [message.handle]
                );
                throw new Error(errorJson || `Custom runtime transcription failed with code ${rc}.`);
            }

            const resultJson = module.ccall(
                'lv_whisper_get_last_result_json',
                'string',
                ['number'],
                [message.handle]
            );

            return JSON.parse(resultJson || '{}');
        } finally {
            module._free(ptr);
        }
    }

    async function handleReset(message) {
        const module = await ensureRuntime();
        module.ccall('lv_whisper_reset_session', null, ['number'], [message.handle]);
        return { ok: true };
    }

    async function handleDestroy(message) {
        const module = await ensureRuntime();
        module.ccall('lv_whisper_destroy_session', null, ['number'], [message.handle]);
        return { ok: true };
    }

    self.onmessage = async function (event) {
        const message = event.data || {};
        const id = message.id;

        try {
            if (message.type === 'init') {
                runtimeUrl = message.runtimeUrl || runtimeUrl;
                runtimeBase = runtimeUrl.slice(0, runtimeUrl.lastIndexOf('/') + 1) || './runtime/';
                await ensureRuntime();
                post('result', { id, result: { ready: true } });
                return;
            }

            if (message.type === 'createSession') {
                post('result', { id, result: await handleCreateSession(message) });
                return;
            }

            if (message.type === 'transcribe') {
                post('result', { id, result: await handleTranscribe(message) });
                return;
            }

            if (message.type === 'resetSession') {
                post('result', { id, result: await handleReset(message) });
                return;
            }

            if (message.type === 'destroySession') {
                post('result', { id, result: await handleDestroy(message) });
                return;
            }

            throw new Error(`Unknown worker message type: ${message.type}`);
        } catch (error) {
            post('error', {
                id,
                error: error instanceof Error ? error.message : String(error)
            });
        }
    };
})();
