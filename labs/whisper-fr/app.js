(function () {
    const MODEL_OPTIONS = {
        tiny: {
            label: 'tiny',
            sizeMb: 75,
            description: 'Multilingual tiny model'
        },
        'tiny-q5_1': {
            label: 'tiny q5_1',
            sizeMb: 31,
            description: 'Smaller quantized tiny model'
        },
        base: {
            label: 'base',
            sizeMb: 142,
            description: 'Multilingual base model'
        },
        'base-q5_1': {
            label: 'base q5_1',
            sizeMb: 57,
            description: 'Smaller quantized base model'
        }
    };

    const MODEL_URLS = {
        tiny: 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-tiny.bin',
        'tiny-q5_1': 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-tiny-q5_1.bin',
        base: 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.bin',
        'base-q5_1': 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base-q5_1.bin'
    };

    const LANGUAGE = 'fr';
    const MODEL_DB_NAME = 'whisper.ggerganov.com';
    const MODEL_DB_VERSION = 1;
    const SAMPLE_RATE = 16000;
    const MAX_UTTERANCE_MS = 8000;
    const MAX_WAIT_FOR_SPEECH_MS = 3500;
    const MIN_SPEECH_MS = 300;
    const SILENCE_HOLD_MS = 900;
    const RMS_THRESHOLD = 0.028;

    var dbName = MODEL_DB_NAME;
    var dbVersion = MODEL_DB_VERSION;
    var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

    let context = null;
    let mediaRecorder = null;
    let currentStream = null;
    let analyserNode = null;
    let sourceNode = null;
    let silenceMonitorTimer = null;
    let doRecording = false;
    let audio = null;
    let instance = null;
    let currentModelKey = null;
    let transcriptLines = [];
    let latestTranscript = '';
    let updateTimer = null;
    let startTime = 0;
    let runtimeReady = false;
    let transcriptionPollDeadline = 0;

    const correctAnswerEl = document.getElementById('correct-answer');
    const modelGridEl = document.getElementById('model-grid');
    const clearCacheBtn = document.getElementById('clear-cache-btn');
    const modelStatusEl = document.getElementById('model-status');
    const downloadFillEl = document.getElementById('download-fill');
    const downloadTextEl = document.getElementById('download-text');
    const startBtn = document.getElementById('start-btn');
    const stopBtn = document.getElementById('stop-btn');
    const resetSessionBtn = document.getElementById('reset-session-btn');
    const latestTranscriptEl = document.getElementById('latest-transcript');
    const fullTranscriptEl = document.getElementById('full-transcript');
    const coiStatusEl = document.getElementById('coi-status');
    const engineStatusPillEl = document.getElementById('engine-status-pill');

    const metricExpectedEl = document.getElementById('metric-expected');
    const metricExpectedNormalizedEl = document.getElementById('metric-expected-normalized');
    const metricLatestNormalizedEl = document.getElementById('metric-latest-normalized');
    const metricLatestMatchEl = document.getElementById('metric-latest-match');
    const metricFullNormalizedEl = document.getElementById('metric-full-normalized');
    const metricFullMatchEl = document.getElementById('metric-full-match');
    const metricRuntimeStatusEl = document.getElementById('metric-runtime-status');
    const metricModelEl = document.getElementById('metric-model');

    function normalizeText(value) {
        return String(value || '')
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[’']/g, "'")
            .replace(/[^a-z0-9àâçéèêëîïôûùüÿñæœ'\s-]/gi, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function setMetricState(el, value, tone) {
        el.textContent = value;
        el.classList.remove('ok', 'warn', 'bad');
        if (tone) el.classList.add(tone);
    }

    function updateStartButtonState() {
        startBtn.disabled = !(currentModelKey && runtimeReady);
    }

    function updateComparison() {
        const expected = String(correctAnswerEl.value || '').trim();
        const expectedNormalized = normalizeText(expected);
        const latestNormalized = normalizeText(latestTranscript);
        const fullNormalized = normalizeText(transcriptLines.join(' ').trim());

        metricExpectedEl.textContent = expected || '—';
        metricExpectedNormalizedEl.textContent = expectedNormalized || '—';
        metricLatestNormalizedEl.textContent = latestNormalized || '—';
        metricFullNormalizedEl.textContent = fullNormalized || '—';

        const latestMatch = !!expectedNormalized && latestNormalized === expectedNormalized;
        const fullMatch = !!expectedNormalized && fullNormalized === expectedNormalized;

        setMetricState(metricLatestMatchEl, latestMatch ? 'Yes' : 'No', latestMatch ? 'ok' : 'bad');
        setMetricState(metricFullMatchEl, fullMatch ? 'Yes' : 'No', fullMatch ? 'ok' : 'bad');
    }

    function updateRuntimeStatus() {
        const status = typeof Module !== 'undefined' && typeof Module.get_status === 'function'
            ? (Module.get_status() || 'idle')
            : 'booting';
        metricRuntimeStatusEl.textContent = status;
        engineStatusPillEl.textContent = `Engine: ${status}`;
        metricModelEl.textContent = currentModelKey || 'none';
        coiStatusEl.textContent = window.crossOriginIsolated ? 'COI ready' : 'COI pending';
    }

    function setDownloadProgress(progress, message) {
        const pct = Math.max(0, Math.min(100, Math.round(progress * 100)));
        downloadFillEl.style.width = `${pct}%`;
        downloadTextEl.textContent = message || (pct ? `${pct}%` : 'No model download in progress.');
    }

    function setModelStatus(message) {
        modelStatusEl.textContent = message;
        updateRuntimeStatus();
    }

    function resetTranscriptState() {
        transcriptLines = [];
        latestTranscript = '';
        latestTranscriptEl.textContent = 'No transcript yet.';
        fullTranscriptEl.textContent = 'No transcript yet.';
        updateComparison();
    }

    function renderTranscript() {
        latestTranscriptEl.textContent = latestTranscript || 'No transcript yet.';
        fullTranscriptEl.textContent = transcriptLines.length ? transcriptLines.join('\n') : 'No transcript yet.';
        updateComparison();
    }

    function getSelectedModelKey() {
        return currentModelKey;
    }

    function setModelLoaded(key) {
        currentModelKey = key;
        instance = null;
        updateStartButtonState();
        stopBtn.disabled = true;
        setModelStatus(`Loaded model: ${key}`);
        setDownloadProgress(1, `Model ready: ${key}`);
    }

    function storeFS(fname, buf) {
        try {
            Module.FS_unlink(fname);
        } catch (_) {}

        Module.FS_createDataFile('/', fname, buf, true, true);
        setModelLoaded(getSelectedModelKey());
        printTextarea(`storeFS: stored model: ${fname} size: ${buf.length}`);
    }

    function loadModel(key) {
        const model = MODEL_OPTIONS[key];
        if (!model) return;
        currentModelKey = key;
        setModelStatus(`Loading ${model.label} ...`);
        setDownloadProgress(0, `Preparing ${model.label} download ...`);

        loadRemote(
            MODEL_URLS[key],
            'whisper.bin',
            model.sizeMb,
            (progress) => {
                setDownloadProgress(progress, `Downloading ${model.label}: ${Math.round(progress * 100)}%`);
            },
            storeFS,
            () => {
                setModelStatus('Model load cancelled.');
                setDownloadProgress(0, 'Model download cancelled.');
            },
            printTextarea
        );
    }

    function ensureContext() {
        if (!context) {
            const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
            context = new AudioContextCtor({
                sampleRate: SAMPLE_RATE,
                channelCount: 1,
                echoCancellation: false,
                autoGainControl: true,
                noiseSuppression: true
            });
        }
    }

    function clearSilenceMonitor() {
        if (silenceMonitorTimer) {
            clearInterval(silenceMonitorTimer);
            silenceMonitorTimer = null;
        }
    }

    function cleanupMediaResources() {
        clearSilenceMonitor();
        if (sourceNode) {
            try {
                sourceNode.disconnect();
            } catch (_) {}
            sourceNode = null;
        }
        if (analyserNode) {
            try {
                analyserNode.disconnect();
            } catch (_) {}
            analyserNode = null;
        }
        if (currentStream) {
            currentStream.getTracks().forEach((track) => track.stop());
            currentStream = null;
        }
        mediaRecorder = null;
    }

    function computeRms(analyser, buffer) {
        analyser.getByteTimeDomainData(buffer);
        let sumSquares = 0;
        for (let i = 0; i < buffer.length; i += 1) {
            const normalized = (buffer[i] - 128) / 128;
            sumSquares += normalized * normalized;
        }
        return Math.sqrt(sumSquares / buffer.length);
    }

    function decodeBlobToFloat32(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                const buf = event.target.result;
                if (!context) {
                    reject(new Error('Audio context unavailable'));
                    return;
                }
                context.decodeAudioData(buf.slice(0), (audioBuffer) => {
                    const OfflineAudioContextCtor = window.OfflineAudioContext || window.webkitOfflineAudioContext;
                    if (!OfflineAudioContextCtor) {
                        reject(new Error('OfflineAudioContext unavailable'));
                        return;
                    }
                    const offlineContext = new OfflineAudioContextCtor(
                        1,
                        audioBuffer.duration * SAMPLE_RATE,
                        SAMPLE_RATE
                    );
                    const source = offlineContext.createBufferSource();
                    source.buffer = audioBuffer;
                    source.connect(offlineContext.destination);
                    source.start(0);
                    offlineContext.startRendering().then((renderedBuffer) => {
                        resolve(renderedBuffer.getChannelData(0));
                    }).catch(reject);
                }, reject);
            };
            reader.onerror = reject;
            reader.readAsArrayBuffer(blob);
        });
    }

    async function finalizeRecordingBlob(blob, reason) {
        if (!blob || !blob.size) {
            printTextarea(`mic: no audio captured (${reason})`);
            return;
        }

        printTextarea(`mic: captured ${blob.size} bytes (${reason}), decoding ...`);

        try {
            const floatAudio = await decodeBlobToFloat32(blob);
            audio = floatAudio;
            printTextarea(`mic: decoded ${floatAudio.length} samples`);
            if (instance) {
                Module.set_audio(instance, floatAudio);
                transcriptionPollDeadline = Date.now() + 5000;
                printTextarea('mic: audio sent to whisper');
            }
        } catch (error) {
            printTextarea(`mic: decode failed: ${error}`);
        }
    }

    function stopRecording() {
        doRecording = false;
        audio = null;
        cleanupMediaResources();
        if (updateTimer) {
            clearInterval(updateTimer);
            updateTimer = null;
        }
        updateStartButtonState();
        stopBtn.disabled = true;
    }

    function stopMediaRecorder(reason) {
        if (!mediaRecorder || mediaRecorder.state === 'inactive') {
            cleanupMediaResources();
            return;
        }
        printTextarea(`mic: stopping recorder (${reason})`);
        doRecording = false;
        clearSilenceMonitor();
        mediaRecorder.stop();
    }

    function startRecording() {
        ensureContext();
        Module.set_status('');

        doRecording = true;
        startTime = Date.now();
        audio = null;
        startBtn.disabled = true;
        stopBtn.disabled = false;
        transcriptionPollDeadline = 0;
        printTextarea('mic: starting single-utterance capture ...');

        let chunks = [];

        navigator.mediaDevices.getUserMedia({ audio: true, video: false })
            .then((s) => {
                currentStream = s;
                mediaRecorder = new MediaRecorder(currentStream);
                sourceNode = context.createMediaStreamSource(currentStream);
                analyserNode = context.createAnalyser();
                analyserNode.fftSize = 2048;
                sourceNode.connect(analyserNode);

                const sampleBuffer = new Uint8Array(analyserNode.fftSize);
                let speechDetected = false;
                let speechStartedAt = 0;
                let lastLoudAt = 0;

                mediaRecorder.ondataavailable = (event) => {
                    if (event.data && event.data.size) {
                        chunks.push(event.data);
                    }
                };

                mediaRecorder.onstop = async () => {
                    const blob = new Blob(chunks, { type: mediaRecorder.mimeType || 'audio/webm' });
                    cleanupMediaResources();
                    updateStartButtonState();
                    stopBtn.disabled = true;
                    await finalizeRecordingBlob(blob, speechDetected ? 'speech ended' : 'no speech detected');
                    updateRuntimeStatus();
                };

                mediaRecorder.start();
                printTextarea('mic: listening for one short answer ...');

                silenceMonitorTimer = setInterval(() => {
                    if (!doRecording || !analyserNode) {
                        clearSilenceMonitor();
                        return;
                    }

                    const elapsed = Date.now() - startTime;
                    const rms = computeRms(analyserNode, sampleBuffer);

                    if (rms >= RMS_THRESHOLD) {
                        lastLoudAt = Date.now();
                        if (!speechDetected) {
                            speechDetected = true;
                            speechStartedAt = lastLoudAt;
                            printTextarea(`mic: speech detected (rms=${rms.toFixed(4)})`);
                        }
                    }

                    if (!speechDetected && elapsed >= MAX_WAIT_FOR_SPEECH_MS) {
                        stopMediaRecorder('speech timeout');
                        return;
                    }

                    if (speechDetected) {
                        const speechDuration = Date.now() - speechStartedAt;
                        const silenceDuration = Date.now() - lastLoudAt;
                        if (speechDuration >= MIN_SPEECH_MS && silenceDuration >= SILENCE_HOLD_MS) {
                            stopMediaRecorder('silence after speech');
                            return;
                        }
                    }

                    if (elapsed >= MAX_UTTERANCE_MS) {
                        stopMediaRecorder('max utterance reached');
                    }
                }, 100);
            })
            .catch((error) => {
                printTextarea(`mic: error getting audio stream: ${error}`);
                stopRecording();
            });
    }

    function pollTranscription() {
        if (!instance || typeof Module.get_transcribed !== 'function') return;
        const transcribed = Module.get_transcribed();
        if (transcribed && transcribed.trim()) {
            const trimmed = transcribed.trim();
            if (trimmed !== latestTranscript) {
                latestTranscript = trimmed;
                transcriptLines.push(trimmed);
                renderTranscript();
            }
        }
        if (transcriptionPollDeadline && Date.now() > transcriptionPollDeadline && !doRecording) {
            clearInterval(updateTimer);
            updateTimer = null;
        }
        updateRuntimeStatus();
    }

    function onStart() {
        if (!currentModelKey) {
            alert('Load a model first.');
            return;
        }

        if (!runtimeReady || typeof Module === 'undefined' || typeof Module.init !== 'function') {
            printTextarea('js: whisper runtime is not ready yet. Wait for initialization to finish, then try again.');
            updateRuntimeStatus();
            return;
        }

        if (!instance) {
            instance = Module.init('whisper.bin', LANGUAGE);
            if (instance) {
                printTextarea(`js: whisper initialized, instance: ${instance}`);
            }
        }

        if (!instance) {
            printTextarea('js: failed to initialize whisper');
            return;
        }

        if (updateTimer) clearInterval(updateTimer);
        updateTimer = setInterval(pollTranscription, 120);
        startRecording();
        updateRuntimeStatus();
    }

    function onStop() {
        printTextarea(`mic: stopping after ${((Date.now() - startTime) / 1000).toFixed(1)}s`);
        if (doRecording) {
            stopMediaRecorder('manual stop');
        } else {
            stopRecording();
        }
        updateRuntimeStatus();
    }

    function renderModelButtons() {
        Object.entries(MODEL_OPTIONS).forEach(([key, model]) => {
            const wrapper = document.createElement('div');
            wrapper.className = 'model-card';
            wrapper.innerHTML = `
                <div class="model-title">${model.label}</div>
                <div class="model-meta">${model.description}</div>
                <div class="model-meta">${model.sizeMb} MB</div>
            `;
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'secondary';
            button.textContent = `Download ${model.label}`;
            button.addEventListener('click', () => loadModel(key));
            wrapper.appendChild(button);
            modelGridEl.appendChild(wrapper);
        });
    }

    window.Module = {
        print: printTextarea,
        printErr: printTextarea,
        setStatus: function (text) {
            printTextarea(`js: ${text}`);
            updateRuntimeStatus();
        },
        monitorRunDependencies: function () {},
        preRun: function () {
            runtimeReady = false;
            updateStartButtonState();
            printTextarea('js: Preparing whisper runtime ...');
        },
        postRun: function () {
            runtimeReady = true;
            updateStartButtonState();
            printTextarea('js: Whisper runtime initialized.');
            updateRuntimeStatus();
        }
    };

    window.dbName = dbName;
    window.dbVersion = dbVersion;
    window.indexedDB = indexedDB;
    window.loadWhisperModel = loadModel;
    window.clearWhisperCache = clearCache;
    window.onStartWhisperLab = onStart;
    window.onStopWhisperLab = onStop;

    clearCacheBtn.addEventListener('click', () => clearCache());
    startBtn.addEventListener('click', onStart);
    stopBtn.addEventListener('click', onStop);
    resetSessionBtn.addEventListener('click', () => {
        resetTranscriptState();
        printTextarea('session: transcript reset');
    });
    correctAnswerEl.addEventListener('input', updateComparison);

    renderModelButtons();
    resetTranscriptState();
    updateRuntimeStatus();
    updateStartButtonState();
    setModelStatus('No model loaded yet.');
    setDownloadProgress(0, 'Choose a model to download and cache.');
})();
