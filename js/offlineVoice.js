/* Optional on-device French synthesis. No voice files download until requested. */
(() => {
    const CACHE = 'vf-offline-voice-piper-v1';
    const KEY = 'vf-offline-voice-v1';
    const scriptUrl = document.currentScript.src || new URL('js/offlineVoice.js', document.baseURI).href;
    const workerUrl = new URL('offlineVoiceWorker.js', scriptUrl).href;
    const model = { size: 76733615, hash: '9abb3800c199148897a9ed64e100d224f3de83579f100044174ad19418f1786f', url: 'https://huggingface.co/rhasspy/piper-voices/resolve/c10ece1aade47bb51c153c893d14e5bf8e5b7117/fr/fr_FR/upmc/medium/fr_FR-upmc-medium.onnx' };
    const voices = [
        { ...model, id: 'jessica', name: 'Jessica', speaker: 0 },
        { ...model, id: 'pierre', name: 'Pierre', speaker: 1 },
    ];
    const runtime = {
        ort: new URL('offline-voice-runtime/ort.min.js', scriptUrl).href,
        ortWasm: new URL('offline-voice-runtime/ort-wasm.wasm', scriptUrl).href,
        piper: new URL('offline-voice-runtime/piper_phonemize.js', scriptUrl).href,
        piperWasm: new URL('offline-voice-runtime/piper_phonemize.wasm', scriptUrl).href,
        piperData: new URL('offline-voice-runtime/piper_phonemize.data', scriptUrl).href,
    };
    let state = { voice: 'jessica', enabled: false };
    try { Object.assign(state, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch {}
    if (!voices.some(v => v.id === state.voice)) state.voice = voices[0].id;
    delete state.speed; // The existing Voice setting is the single source of truth.
    const getSpeed = () => Math.max(.7, Math.min(1.3, Number(window.getConfiguredTtsRate?.()) || 1));
    let supported = true;
    let panel, status, ready = false, busy = false, controller, worker, audio, playing, request = 0, generation = 0;
    const pending = new Map();
    let prepared = null, questionText = "", prepareTimer, engineEpoch = 0;
    const voice = () => voices.find(v => v.id === state.voice);
    const assets = () => [workerUrl, ...Object.values(runtime), voice().url + '.json', voice().url];
    const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {} };
    const sayStatus = message => { if (status) status.textContent = message; };
    function update() {
        if (!panel) return;
        document.getElementById('offline-voice-use').checked = !!state.enabled;
        document.getElementById('offline-voice-use').disabled = busy || !ready || !supported;
        document.getElementById('device-voice-use').checked = !state.enabled;
        document.getElementById('device-voice-settings').hidden = !!state.enabled;
        panel.querySelector('#offline-voice-test').disabled = busy || !ready || !supported;
        window.renderFrenchTtsStatus?.();
        panel.querySelector('#offline-voice-download').disabled = busy || ready || !supported;
        panel.querySelector('#offline-voice-remove').disabled = busy || !supported;
        panel.querySelector('#offline-voice-name').disabled = busy || !supported;
        panel.querySelector('#offline-voice-cancel').hidden = !busy;
    }
    async function refresh() {
        const cache = await caches.open(CACHE);
        ready = (await Promise.all([...assets(), workerUrl + '?validated=upmc-medium'].map(url => cache.match(url)))).every(Boolean);
        if (!ready) { state.enabled = false; save(); }
        sayStatus(ready ? (state.enabled ? 'Ready offline · your selected voice.' : 'Ready offline. Choose Downloaded voice above to use it.') : 'One download for Jessica and Pierre · about 106 MB.');
        update();
    }
    function stop() {
        generation++;
        if (playing) { try { playing.stop(); } catch {} playing = null; }
    }
    function resetWorker(reason = 'Voice stopped.') {
        clearTimeout(prepareTimer);
        engineEpoch++;
        prepared = null;
        worker?.terminate(); worker = null;
        for (const entry of pending.values()) { clearTimeout(entry.timer); const error = new Error(reason); if (reason === 'Voice stopped.' || reason === 'Cancelled') error.name = 'AbortError'; entry.reject(error); }
        pending.clear();
    }
    async function startWorker() {
        if (worker) return worker;
        const response = await (await caches.open(CACHE)).match(workerUrl);
        if (!response) throw new Error('Download the voice first.');
        const url = URL.createObjectURL(new Blob([await response.text()], { type: 'text/javascript' }));
        worker = new Worker(url);
        URL.revokeObjectURL(url);
        worker.onmessage = ({ data }) => {
            const entry = pending.get(data.id);
            if (!entry) return;
            pending.delete(data.id); clearTimeout(entry.timer);
            data.error ? entry.reject(new Error(data.error)) : entry.resolve(data);
        };
        worker.onerror = () => resetWorker('The offline voice could not start. Try again or turn it off.');
        return worker;
    }
    function unlock() {
        audio ||= new (window.AudioContext || window.webkitAudioContext)();
        void audio.resume().catch(() => {});
    }
    const speechKey = text => JSON.stringify([state.voice, getSpeed(), text]);
    async function generate(input) {
        const epoch = engineEpoch;
        const selectedVoice = voice(), speed = getSpeed();
        const activeWorker = await startWorker();
        if (epoch !== engineEpoch) throw new DOMException('Cancelled', 'AbortError');
        const id = ++request;
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => resetWorker('This voice took too long. Try a shorter phrase.'), 180000);
            pending.set(id, { resolve, reject, timer });
            activeWorker.postMessage({ id, voice: selectedVoice, text: input, speed, config: { cache: CACHE, runtime } });
        });
    }
    function prepare(text, force = false) {
        questionText = String(text || '').trim();
        clearTimeout(prepareTimer);
        stop();
        const key = speechKey(questionText);
        if (!force && prepared?.key === key) return;
        if (pending.size) resetWorker();
        prepared = null;
        if (!state.enabled || !ready || document.hidden || !questionText || questionText.length > 600) return;
        // Let the card paint first, and avoid work for cards skipped immediately.
        prepareTimer = setTimeout(() => {
            const entry = { key, done: false, promise: generate(questionText) };
            prepared = entry;
            entry.promise.then(() => {
                if (prepared !== entry) return;
                entry.done = true;
                sayStatus('Answer ready · made silently on this device.');
            }).catch(error => {
                if (prepared === entry) prepared = null;
                if (error.name !== 'AbortError') sayStatus('Could not prepare this answer. Tap Hear to try again.');
            });
        }, 350);
    }
    async function speak(text) {
        stop();
        clearTimeout(prepareTimer);
        const token = generation;
        unlock();
        window.frenchVoice?.stop();
        const input = String(text || '').trim();
        if (!input) return;
        if (input.length > 600) throw new Error('Try a shorter phrase (up to 600 characters).');
        const matching = prepared?.key === speechKey(input) ? prepared : null;
        const wasReady = !!matching?.done;
        sayStatus(wasReady ? 'Playing prepared answer…' : 'Making speech on this device…');
        if (!matching && pending.size) resetWorker();
        const result = await (matching ? matching.promise : generate(input));
        if (token !== generation) return;
        const buffer = audio.createBuffer(1, result.pcm.length, result.sampleRate);
        buffer.copyToChannel(result.pcm, 0);
        playing = audio.createBufferSource(); playing.buffer = buffer; playing.connect(audio.destination); playing.start();
        sayStatus(wasReady ? 'Offline voice · played the prepared answer.' : `Offline voice · speech made in ${(result.ms / 1000).toFixed(1)}s.`);
    }
    function report(error) {
        if (error.name === 'AbortError') return;
        sayStatus(`${error.message || error} You can choose Device voice in Voice settings.`);
        window.showFrenchTtsFeedback?.('Offline voice could not play. Check Settings → Voice.', { persistent: false });
    }
    window.offlineFrenchVoice = {
        isEnabled: () => !!state.enabled,
        intercept(text) {
            if (!state.enabled) return false;
            void speak(text).catch(report);
            return true; // Keep a failed selected voice visible instead of silently changing voices.
        }, stop, prepare, cancel: () => { stop(); resetWorker(); },
        preparationState: () => ({ ready: !!prepared?.done, pending: !!prepared && !prepared.done }),
    };
    document.addEventListener('visibilitychange', () => { if (document.hidden) { clearTimeout(prepareTimer); stop(); resetWorker(); } else prepare(questionText, true); });
    window.addEventListener('hashchange', stop);
    window.addEventListener('pagehide', () => { stop(); resetWorker(); });
    async function download() {
        busy = true; ready = false; state.enabled = false; save(); update();
        controller = new AbortController();
        const signal = controller.signal;
        try {
            const cache = await caches.open(CACHE);
            let index = 0;
            for (const url of assets()) {
                index++;
                if (await cache.match(url)) continue;
                sayStatus(`Downloading file ${index}/${assets().length}…`);
                const response = await fetch(url, { signal });
                if (!response.ok) throw new Error(`Download failed (${response.status}). Tap Download to retry.`);
                const reader = response.body.getReader(); const chunks = []; let received = 0;
                const total = url === voice().url ? voice().size : 0;
                while (true) {
                    const { done, value } = await reader.read(); if (done) break;
                    chunks.push(value); received += value.length;
                    sayStatus(`Downloading file ${index}/${assets().length} · ${(received / 1e6).toFixed(1)} MB${total ? ' / ' + (total / 1e6).toFixed(1) + ' MB' : ''}`);
                }
                const blob = new Blob(chunks);
                if (url === voice().url) {
                    const hash = [...new Uint8Array(await crypto.subtle.digest('SHA-256', await blob.arrayBuffer()))].map(x => x.toString(16).padStart(2, '0')).join('');
                    if (received !== voice().size || hash !== voice().hash) throw new Error('The download was incomplete. Please retry.');
                }
                if (signal.aborted) throw new DOMException('Cancelled', 'AbortError');
                await cache.put(url, new Response(blob));
            }
            // Preflight real synthesis before claiming the pack works; do not auto-play.
            sayStatus('Checking the downloaded voice…');
            const activeWorker = await startWorker();
            const id = ++request;
            await new Promise((resolve, reject) => {
                const timer = setTimeout(() => resetWorker('Voice check took too long. Try a shorter phrase.'), 180000);
                pending.set(id, { resolve, reject, timer });
                activeWorker.postMessage({ id, voice: voice(), text: 'Bonjour.', speed: getSpeed(), config: { cache: CACHE, runtime } });
            });
            if (signal.aborted) throw new DOMException('Cancelled', 'AbortError');
            await cache.put(workerUrl + '?validated=upmc-medium', new Response('ready'));
            await navigator.storage.persist?.().catch(() => false);
            await refresh();
            sayStatus('Ready offline. Test it, then choose Downloaded voice above.');
        } catch (error) {
            sayStatus(error.name === 'AbortError' ? 'Download cancelled. Tap Download to resume.' : `Could not prepare the voice: ${error.message}. Tap Download to retry.`);
        } finally { busy = false; update(); }
    }
    function mount() {
        const target = document.getElementById('model-voice-slot');
        if (!target || panel) return;
        panel = document.createElement('section'); panel.id = 'offline-voice-panel';
        panel.innerHTML = `<h4>Downloadable voices</h4>
<p class="setting-helper-text">French speech made on your device, even offline. Download once, then use it for any answer.</p>
<label for="offline-voice-name">Voice</label>
<select id="offline-voice-name" class="styled-select"></select>
<p id="offline-voice-status" class="setting-helper-text" role="status" aria-live="polite"></p>
<div class="voice-actions"><button type="button" id="offline-voice-download" class="secondary-btn">Download voices · 106 MB</button><button type="button" id="offline-voice-cancel" class="secondary-btn" hidden>Cancel download</button></div>
<div class="voice-actions"><button type="button" id="offline-voice-test" class="secondary-btn">Test downloaded voice</button><button type="button" id="offline-voice-stop" class="secondary-btn">Stop</button></div>
<details class="voice-setup-help"><summary>Download details</summary>
<p>Both voices share one download. Answers are prepared silently while you think. Your browser may remove the download when storage is low.</p>
<button type="button" id="offline-voice-remove" class="secondary-btn">Remove downloaded voices</button>
<p><a href="js/offline-voice-runtime/NOTICE.txt" target="_blank" rel="noopener">Voice credits and licences</a></p></details>`;
        target.appendChild(panel); status = panel.querySelector('#offline-voice-status');
        const select = panel.querySelector('#offline-voice-name');
        for (const v of voices) select.add(new Option(v.name, v.id));
        select.value = state.voice;
        select.onchange = async () => { stop(); resetWorker(); state.voice = select.value; update(); save(); await refresh(); prepare(questionText, true); };
        document.addEventListener('input', event => {
            if (event.target.id === 'tts-speed-slider') prepare(questionText, true);
        });
        panel.querySelector('#offline-voice-download').onclick = download;
        panel.querySelector('#offline-voice-cancel').onclick = () => { controller?.abort(); resetWorker('Cancelled'); };
        panel.querySelector('#offline-voice-test').onclick = () => { unlock(); void speak('Bonjour ! Je parle français. Elles n’y en avaient pas trouvé beaucoup.').catch(report); };
        panel.querySelector('#offline-voice-stop').onclick = () => { clearTimeout(prepareTimer); stop(); resetWorker(); sayStatus('Stopped.'); };
        document.getElementById('offline-voice-use').onchange = event => { window.frenchVoice?.stop(); stop(); resetWorker(); state.enabled = event.target.checked; save(); void refresh().then(() => prepare(questionText, true)); };
        document.getElementById('device-voice-use').onchange = () => { stop(); resetWorker(); state.enabled = false; save(); void refresh(); };
        panel.querySelector('#offline-voice-remove').onclick = async () => { stop(); resetWorker(); state.enabled = false; save(); await caches.delete(CACHE); await refresh(); };
        if (location.protocol === 'file:' || !window.isSecureContext || !window.caches || !window.Worker || !window.WebAssembly) {
            supported = false; state.enabled = false; save(); update(); sayStatus('Downloaded voices are unavailable in this browser. Use Device voice above.');
        } else void refresh().then(() => prepare(questionText)).catch(error => { supported = false; state.enabled = false; save(); update(); sayStatus('Voice storage is unavailable. Use Device voice above.'); });
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
})();
