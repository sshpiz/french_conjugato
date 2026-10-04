/* Downloaded Piper runtime. All inference reads downloaded assets, never the network. */
let config, session, phonemizer, modelConfig, loadedVoice, phonemes;
const blobUrls = [];
async function asset(url) {
    const response = await (await caches.open(config.cache)).match(url);
    if (!response) throw new Error('Voice files are missing. Download the voice again.');
    return response;
}
async function blobUrl(url, type) {
    const data = await (await asset(url)).arrayBuffer();
    const result = URL.createObjectURL(new Blob([data], { type }));
    blobUrls.push(result);
    return result;
}
async function load(voice) {
    if (!phonemizer) {
        importScripts(await blobUrl(config.runtime.ort, 'text/javascript'));
        ort.env.wasm.numThreads = 1;
        ort.env.wasm.proxy = false;
        ort.env.wasm.wasmPaths = { 'ort-wasm.wasm': await blobUrl(config.runtime.ortWasm, 'application/wasm') };
        ort.env.wasm.simd = false;
        importScripts(await blobUrl(config.runtime.piper, 'text/javascript'));
        const wasmBinary = await (await asset(config.runtime.piperWasm)).arrayBuffer();
        const data = await (await asset(config.runtime.piperData)).arrayBuffer();
        phonemizer = await createPiperPhonemize({
            wasmBinary,
            getPreloadedPackage: () => data,
            print: (message) => { phonemes = JSON.parse(message).phonemes; },
            printErr: (message) => console.warn(message),
            noInitialRun: true,
        });
    }
    if (loadedVoice !== voice.url) {
        if (session) await session.release();
        session = null;
        modelConfig = await (await asset(voice.url + '.json')).json();
        session = await ort.InferenceSession.create(await (await asset(voice.url)).arrayBuffer(), { executionProviders: ['wasm'] });
        loadedVoice = voice.url;
    }
}
let queue = Promise.resolve();
onmessage = ({ data }) => {
    queue = queue.then(async () => {
        const { id, voice, text, speed } = data;
        try {
            config = data.config;
            const started = performance.now();
            await load(voice);
            phonemes = null;
            phonemizer.callMain(['-l', modelConfig.espeak.voice, '--input', JSON.stringify([{ text }]), '--espeak_data', '/espeak-ng-data']);
            if (!phonemes?.length) throw new Error('Could not pronounce this text.');
            // Older voices have their own symbol IDs: the phonemizer's default IDs do not apply.
            const map = modelConfig.phoneme_id_map;
            const ids = [...map['^'], ...map['_']];
            for (const symbol of phonemes) {
                for (const mapped of (modelConfig.phoneme_map?.[symbol] || [symbol])) {
                    if (!map[mapped]) throw new Error('Unmapped sound: ' + JSON.stringify(mapped) + ' in ' + JSON.stringify(phonemes));
                    ids.push(...map[mapped], ...map['_']);
                }
            }
            ids.push(...map['$']);
            const feeds = {
                input: new ort.Tensor('int64', BigInt64Array.from(ids, BigInt), [1, ids.length]),
                input_lengths: new ort.Tensor('int64', BigInt64Array.from([ids.length], BigInt), [1]),
                scales: new ort.Tensor('float32', [modelConfig.inference.noise_scale, modelConfig.inference.length_scale / speed, modelConfig.inference.noise_w]),
            };
            if (modelConfig.num_speakers > 1) feeds.sid = new ort.Tensor('int64', BigInt64Array.from([voice.speaker], BigInt), [1]);
            const result = await session.run(feeds);
            const pcm = Float32Array.from(result.output.data);
            postMessage({ id, pcm, sampleRate: modelConfig.audio.sample_rate, ms: Math.round(performance.now() - started) }, [pcm.buffer]);
        } catch (error) { postMessage({ id, error: String(error.message || error) }); }
    });
};
