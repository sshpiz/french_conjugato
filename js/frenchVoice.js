// Device French voice discovery and playback. Downloaded synthesis is selected separately.
(function () {
    let generation = 0;
    let checking = true;
    let pendingCancel = null;
    const voices = () => {
        try { return (window.speechSynthesis?.getVoices() || []).filter(v => /^fr(?:[-_]|$)/i.test(v.lang)); }
        catch (_) { return []; }
    };
    const notify = () => window.dispatchEvent(new Event('frenchvoicechange'));
    const recheck = async () => {
        checking = true; notify();
        const deadline = Date.now() + 1500;
        while (!voices().length && window.speechSynthesis && Date.now() < deadline) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        checking = false; notify();
        return voices();
    };
    function stop() {
        generation++;
        pendingCancel?.(); pendingCancel = null;
        try { window.speechSynthesis?.cancel(); } catch (_) {}
    }
    async function play(text, {deviceOnly = false, voiceName = '', rate = 1} = {}) {
        stop();
        const request = generation;
        if (!voices().length && checking) await recheck();
        if (request !== generation) return 'cancelled';
        const available = voices();
        const voice = available.find(v => v.name === voiceName) || available.find(v => /^fr[-_]FR$/i.test(v.lang)) || available[0];
        let result = 'unavailable';
        if (voice && window.SpeechSynthesisUtterance) {
            result = await new Promise(resolve => {
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.voice = voice; utterance.lang = voice.lang; utterance.rate = rate;
                let settled = false, started = false, timer;
                const finish = value => {
                    if (settled) return;
                    settled = true; clearTimeout(timer); pendingCancel = null; resolve(value);
                };
                pendingCancel = () => finish('cancelled');
                utterance.onstart = () => { started = true; clearTimeout(timer); };
                utterance.onend = () => finish('device');
                utterance.onerror = event => finish(request !== generation || ['canceled', 'interrupted'].includes(event.error)
                    ? 'cancelled' : started ? 'interrupted' : 'unavailable');
                timer = setTimeout(() => { finish('unavailable'); window.speechSynthesis.cancel(); }, 5000);
                try { window.speechSynthesis.speak(utterance); } catch (_) { finish('unavailable'); }
            });
        }
        if (request !== generation) return 'cancelled';
        if (result !== 'unavailable') return result;
        if (!deviceOnly) window.showFrenchTtsFeedback?.('No audio for this answer. Open Voice settings to choose or download a French voice.');
        return 'unavailable';
    }
    window.frenchVoice = {play, stop, voices, recheck, isChecking: () => checking};
    window.speechSynthesis?.addEventListener('voiceschanged', notify);
    void recheck();
})();
