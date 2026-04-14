// script.js
// Use language-specific helpers from window (French for now)
const pronounEmojiMap = window.frenchPronounEmojiMap;
const tenseKeyToLabel = window.frenchTenseKeyToLabel;
const tenseKeyToPhraseKey = window.frenchTenseKeyToLabel;
const pronounOrder = window.frenchPronounOrder;
const pronounMapping = window.frenchPronounMapping || {};
const getPrompt = window.getFrenchPrompt;
const UIStrings = window.frenchUIStrings;
const localStorageKey = window.frenchLocalStorageKey;
const speechLang = window.frenchSpeechLang;
const ENABLE_LEGACY_SENTENCE_DATA = false;

// Feature flag to control gap sentence behavior
const ENABLE_GAP_SENTENCES = false;
const FRENCH_FLASHCARD_FEATURES = {
    longPressCopyOnPlayableText: true,
    usageNuggetVisibilityToggle: true,
    contextualSpeakerButton: true,
};

// List of irregular verbs
const IRREGULAR_VERBS = new Set([
    'être', 'avoir', 'aller', 'faire', 'dire', 'pouvoir', 'vouloir', 'savoir', 
    'voir', 'devoir', 'venir', 'prendre', 'mettre', 'croire', 'connaître', 
    'vivre', 'sortir', 'partir', 'tenir', 'écrire', 'lire', 'boire', 'naître', 
    'ouvrir', 'suivre', 'rire', 'dormir', 'courir', 'mourir', 'asseoir', 
    'conduire', 'battre', 'valoir', 'pleuvoir', 'falloir', 'joindre', 'fuir', 
    'paraître', 'apparaître', 'craindre', 'résoudre', 'suffire', 'accueillir', 
    'cueillir', 'atteindre', 'construire', 'détruire', 'offrir', 'produire', 
    'taire', 'traduire', 'se taire', 's\'asseoir', 's\'endormir', 's\'en aller'
]);

// Top 20 most common French verbs
const TOP_20_VERBS = new Set([
    'être', 'avoir', 'faire', 'dire', 'aller', 'voir', 'savoir', 'prendre', 
    'venir', 'vouloir', 'pouvoir', 'falloir', 'devoir', 'croire', 'trouver', 
    'donner', 'parler', 'aimer', 'passer', 'mettre'
]);

const APP_VERSION = "v2";

if (localStorage.getItem("app_version") !== APP_VERSION) {
  localStorage.clear();
  localStorage.setItem("app_version", APP_VERSION);
}


// --- Seeded Random Number Generator ---
let seedValue = null;

// Simple hash function to convert string to number
function hashString(str) {
    let hash = 0;
    if (str.length === 0) return hash;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
}

// Linear Congruential Generator for seeded random
function seededRandom() {
    if (seedValue === null) {
        return Math.random(); // Fallback to normal random if no seed
    }
    seedValue = (seedValue * 1664525 + 1013904223) % 4294967296;
    return seedValue / 4294967296;
}

// Parse seed from URL query params and initialize seeded random
function initializeSeededRandom() {
    const urlParams = new URLSearchParams(window.location.search);
    const seedParam = urlParams.get('seed');
    
    if (seedParam) {
        seedValue = hashString(seedParam);
        console.log(`🎲 Using seed: "${seedParam}" (numeric: ${seedValue})`);
        
        // Override Math.random with our seeded version
        Math.random = seededRandom;
    } else {
        console.log(`🎲 No seed provided, using normal random`);
    }
}

// Initialize seeded random before anything else
initializeSeededRandom();

// Ensure language-specific last change handler exists
if (typeof window.handleLanguageSpecificLastChange !== 'function') {
    window.handleLanguageSpecificLastChange = function(pronoun, conjugated) {
        return pronoun + ' ' + conjugated;
    };
}

// Simple function to enhance gap sentences with styled placeholders
function enhanceGapSentence(text) {
    if (!text) return '';
    return text
        .replace(/\[VERB\]/g, '<span class="gap-placeholder gap-verb">______</span>')
        .replace(/\[AUX\]/g, '<span class="gap-placeholder gap-aux">____</span>')
        .replace(/\[PRONOUN\]/g, '<span class="gap-placeholder gap-pronoun">____</span>');
}

// Simple function to prepare text for speech (replace placeholders with "blanc")
function prepareTextForSpeech(text) {
    if (!text) return '';
    let ret =  text.replace(/\[VERB\]/g, 'blanc').replace(/\[AUX\]/g, 'blanc').replace(/\[PRONOUN\]/g, 'blanc');
    ret = ret.replace(/-/g, ' ');
    return ret;
}

// ── Theme management ─────────────────────────────────────────────────────────
(function initTheme() {
    const html = document.documentElement;
    const saved = localStorage.getItem('themeMode') || 'system';

    function applyTheme(mode) {
        localStorage.setItem('themeMode', mode);
        if (mode === 'dark')        html.setAttribute('data-theme', 'dark');
        else if (mode === 'light')  html.setAttribute('data-theme', 'light');
        else                        html.removeAttribute('data-theme');

        // Sync pill active state
        document.querySelectorAll('#theme-pills .reflexive-pill').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === mode);
        });
    }

    // Wire up pills (may run before or after DOMContentLoaded)
    function bindThemePills() {
        document.querySelectorAll('#theme-pills .reflexive-pill').forEach(btn => {
            btn.addEventListener('click', () => applyTheme(btn.dataset.theme));
        });
        applyTheme(saved); // set active pill
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bindThemePills);
    } else {
        bindThemePills();
    }

    // Expose for external use
    window.applyTheme = applyTheme;
})();

// ── Font size ─────────────────────────────────────────────────────────────────
(function initFontSize() {
    const CARD_SELECTOR = '#flashcard';
    const KEY = 'fontScale';
    const saved = parseFloat(localStorage.getItem(KEY)) || 1;

    function applyFontScale(scale) {
        document.documentElement.style.setProperty('--font-scale', scale);
        const card = document.querySelector(CARD_SELECTOR);
        if (card) card.style.setProperty('--font-scale', scale);
        const slider = document.getElementById('font-size-slider');
        if (slider) slider.value = scale;
        localStorage.setItem(KEY, scale);
    }

    function bindSlider() {
        const slider = document.getElementById('font-size-slider');
        if (!slider) return;
        slider.value = saved;
        slider.addEventListener('input', () => applyFontScale(parseFloat(slider.value)));
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => { applyFontScale(saved); bindSlider(); });
    } else {
        applyFontScale(saved); bindSlider();
    }
})();

// ── Verb usages index ─────────────────────────────────────────────────────────
const verbUsagesIndex = {};
(function buildUsagesIndex() {
    const usages = window.verbUsages || [];
    for (const u of usages) {
        if (!verbUsagesIndex[u.verb]) verbUsagesIndex[u.verb] = [];
        verbUsagesIndex[u.verb].push(u);
    }
})();

function renderVerbUsages(container, infinitive, options = {}) {
    if (!container) return 0;

    const {
        sectionClass = '',
        heading = '',
    } = options;

    container.innerHTML = '';
    if (sectionClass) container.className = sectionClass;

    const usages = verbUsagesIndex[infinitive];
    if (!usages || !usages.length) return 0;

    if (heading) {
        const headingEl = document.createElement('h3');
        headingEl.className = 'verb-usages-heading';
        headingEl.textContent = heading;
        container.appendChild(headingEl);
    }

    usages.forEach(u => {
        const item = document.createElement('div');
        item.className = 'usage-item';

        const pattern = document.createElement('span');
        pattern.className = 'usage-pattern';
        pattern.textContent = u.pattern || '';
        item.appendChild(pattern);

        const exampleFr = document.createElement('span');
        exampleFr.className = 'usage-fr tappable-audio';
        exampleFr.dataset.speak = u.example_fr || '';
        if (u.sense_id) exampleFr.dataset.audioId = `usage:${u.sense_id}`;
        exampleFr.textContent = u.example_fr || '';
        item.appendChild(exampleFr);

        if (u.example_en) {
            const exampleEn = document.createElement('span');
            exampleEn.className = 'usage-en';
            exampleEn.textContent = u.example_en;
            item.appendChild(exampleEn);
        }

        container.appendChild(item);
    });

    return usages.length;
}

document.addEventListener('DOMContentLoaded', () => {
    const PACKAGED_TTS = window.preRenderedFrenchTts || null;
    // --- Dictation (Speech Recognition) ---
    // (Moved to after DOM element assignments)
    const phrasebook = {};
    if (ENABLE_LEGACY_SENTENCE_DATA) {
        // Legacy phrasebook support for old sentence/gap-sentence practice data.
        const allSentences = [
            ...(typeof sentences !== 'undefined' ? sentences : []),
            ...(typeof window.reflexiveSentences !== 'undefined' ? window.reflexiveSentences : []),
        ];
        for (const item of allSentences) {
            if (!phrasebook[item.verb]) {
                phrasebook[item.verb] = {};
            }
            if (!phrasebook[item.verb][item.tense]) {
                phrasebook[item.verb][item.tense] = [];
            }
            phrasebook[item.verb][item.tense].push({
                pronoun: item.pronoun,
                sentence: item.sentence,
                translation: item.translation || '',
                gap_sentence: item.gap_sentence || '',
                verb_form: item.verb_form || '',
                source: item.source || ''
            });
        }
    }

    // --- Data Sorting and Deduplication ---
    // Create a unique list of verbs, keeping the first entry found for each infinitive.
    // This makes the app resilient to duplicate entries in the data files.
    const uniqueVerbs = Array.from(new Map(verbs.map(v => [v.infinitive, v])).values());
    // Normalize frequency keys: old data uses "top-500" style; new code expects "top500"
    const freqNormMap = { 'top-20':'top20','top-50':'top50','top-100':'top100','top-500':'top500','top-1000':'top1000' };
    uniqueVerbs.forEach(v => { if (freqNormMap[v.frequency]) v.frequency = freqNormMap[v.frequency]; });
    // Compute a classification category for each verb (e.g., "ir/venir-tenir", "er", "re/faire", "oir")
    uniqueVerbs.forEach(v => {
        try {
            v.category = classifyFrenchVerb(v.infinitive);
        } catch (e) {
            v.category = 'unknown';
        }
    });
    // All discovered categories for UI filters
    const allVerbCategories = [...new Set(uniqueVerbs.map(v => v.category))].sort();

    // Dynamically determine frequency categories and their order from the data
    const allFrequencies = [...new Set(uniqueVerbs.map(v => v.frequency || 'common'))];
    
    // Create frequency order based on frequency of occurrence in the data
    const frequencyCount = {};
    uniqueVerbs.forEach(verb => {
        const freq = verb.frequency || 'common';
        frequencyCount[freq] = (frequencyCount[freq] || 0) + 1;
    });
    
    // Sort frequencies by their count (most common first) to create a natural ordering
    const sortedFrequencies = allFrequencies.sort((a, b) => 
        (frequencyCount[b] || 0) - (frequencyCount[a] || 0)
    );
    
    // Create frequency order mapping
    const frequencyOrder = {};
    sortedFrequencies.forEach((freq, index) => {
        frequencyOrder[freq] = index;
    });
    
    // Sort the unique `verbs` array in place. This is done once on load.
    // Note: we are sorting `uniqueVerbs`, not the original `verbs` array.
    uniqueVerbs.sort((a, b) => {
        const freqA = frequencyOrder[a.frequency] || 99; // Use a high number for any unclassified verbs
        const freqB = frequencyOrder[b.frequency] || 99;
        // First, sort by frequency. If they are different, the sort is done.
        if (freqA !== freqB) return freqA - freqB;
        // If frequency is the same, sort alphabetically by the infinitive.
        return a.infinitive.localeCompare(b.infinitive);
    });

    // Calculate verb counts per frequency for display in options
    const frequencyCounts = uniqueVerbs.reduce((acc, verb) => {
        const freq = verb.frequency || 'common';
        acc[freq] = (acc[freq] || 0) + 1;
        return acc;
    }, {});

    const canonicalPronounKey = (pronoun) => {
        if (!pronoun) return pronoun;
        if (pronounOrder.includes(pronoun)) return pronoun;
        for (const [combined, variants] of Object.entries(pronounMapping)) {
            if (variants.includes(pronoun)) return combined;
        }
        return pronoun;
    };

    const tenseAudioId = (tenseKey) => `shared:tense:${tenseKey}`;
    const pronounAudioId = (pronoun) => `shared:pronoun:${canonicalPronounKey(pronoun)}`;
    const lemmaAudioId = (infinitive) => `lemma:${infinitive}`;
    const conjugationAudioId = (infinitive, tenseKey, pronoun) => `conj:${infinitive}:${tenseKey}:${canonicalPronounKey(pronoun)}`;

    const playAudioTarget = (audioId, text) => {
        void (async () => {
            let packagedFallbackReason = null;
            if (audioId && PACKAGED_TTS && PACKAGED_TTS.isEnabled()) {
                try {
                    const played = await PACKAGED_TTS.playAudioId(audioId);
                    if (played) return;
                    packagedFallbackReason = 'missing-pack';
                } catch (error) {
                    packagedFallbackReason = 'play-error';
                    if (window.appLog) {
                        window.appLog(`packed-tts play-error id=${audioId} message="${error.message}"`);
                    }
                    if (typeof window.showFrenchTtsFeedback === 'function') {
                        window.showFrenchTtsFeedback('Packaged French audio failed. Falling back if browser French audio exists.', { persistent: false });
                    }
                }
            }
            if (audioId && packagedFallbackReason && window.appLog) {
                window.appLog(`packed-tts fallback reason=${packagedFallbackReason} id=${audioId}`);
            }
            if (text) speak(text);
        })();
    };

    const flashcardView = document.getElementById('flashcard-view'); // Main flashcard view
    const explorerListView = document.getElementById('explorer-list-view');
    const explorerDetailView = document.getElementById('explorer-detail-view');
    const optionsView = document.getElementById('options-view'); // The new options view
    
    const flashcard = document.getElementById('flashcard');
    const verbInfinitiveEl = document.getElementById('verb-infinitive');
    const verbTranslationEl = document.getElementById('verb-translation');
    const verbHintEl = document.getElementById('verb-hint');
    const verbPronounEl = document.getElementById('verb-pronoun');
    const verbTenseEl = document.getElementById('verb-tense');
    const verbFrequencyEl = document.getElementById('verb-frequency');
    const verbCategoryEl = document.getElementById('verb-category');
    const verbIrregularEl = document.getElementById('verb-irregular');
    const answerContainer = document.getElementById('answer-container');
    const conjugatedVerbEl = document.getElementById('conjugated-verb');
    const verbPhraseEl = document.getElementById('verb-phrase');
    const questionPhraseEl = document.getElementById('question-phrase');
    // English toggle elements
    const englishBtn = document.getElementById('english-btn');
    const englishInfinitiveLineEl = document.getElementById('english-infinitive-line');
    const englishVerbInfinitiveEl = document.getElementById('english-verb-infinitive');
    const englishVerbTranslationEl = document.getElementById('english-verb-translation');
    const englishVerbPhraseEl = document.getElementById('english-verb-phrase');
    // --- ENGLISH BUTTON TOGGLE LOGIC ---
    if (englishBtn) {
        // Prevent flashcard click from firing when pressing English button
        ['mousedown'].forEach(evt => {
            englishBtn.addEventListener(evt, function(e) {
                e.stopPropagation();
                e.preventDefault();
                showEnglish();
                englishBtn.classList.add('active');
            });
        });
        
        // Add touchstart with passive option to avoid warning
        englishBtn.addEventListener('touchstart', function(e) {
            e.stopPropagation();
            showEnglish();
            englishBtn.classList.add('active');
        }, { passive: true });
        
        ['mouseup', 'mouseleave', 'touchend', 'touchcancel'].forEach(evt => {
            englishBtn.addEventListener(evt, function(e) {
                e.stopPropagation();
                e.preventDefault();
                hideEnglish();
                englishBtn.classList.remove('active');
            });
        });
    }

    function showEnglish() {
        // Hide French
        if (verbInfinitiveEl) verbInfinitiveEl.parentElement.style.display = 'none';
        if (verbTranslationEl) verbTranslationEl.style.display = 'none';
        if (verbPhraseEl) verbPhraseEl.style.display = 'none';
        // Show English
        if (englishInfinitiveLineEl) englishInfinitiveLineEl.style.display = 'flex';
        if (englishVerbTranslationEl) englishVerbTranslationEl.style.display = 'block';
        if (englishVerbPhraseEl) englishVerbPhraseEl.style.display = 'block';
    }
    function hideEnglish() {
        // Show French
        if (verbInfinitiveEl) verbInfinitiveEl.parentElement.style.display = 'flex';
        if (verbTranslationEl) verbTranslationEl.style.display = 'block';
        if (verbPhraseEl) verbPhraseEl.style.display = 'block';
        // Hide English
        if (englishInfinitiveLineEl) englishInfinitiveLineEl.style.display = 'none';
        if (englishVerbTranslationEl) englishVerbTranslationEl.style.display = 'none';
        if (englishVerbPhraseEl) englishVerbPhraseEl.style.display = 'none';
    }
    
    const infinitiveAudioBtn = document.getElementById('infinitive-audio-btn');
    const goToVerbBtn = document.getElementById('go-to-verb-btn');
    const conjugatedAudioBtn = document.getElementById('conjugated-audio-btn');
    const packagedTtsEnabledToggle = document.getElementById('packaged-tts-enabled');
    const packagedTtsDownloadTop20Btn = document.getElementById('packaged-tts-download-top20-btn');
    const packagedTtsDownloadTop100Btn = document.getElementById('packaged-tts-download-top100-btn');
    const packagedTtsDownloadTop500Btn = document.getElementById('packaged-tts-download-top500-btn');
    const packagedTtsDownloadTop1000Btn = document.getElementById('packaged-tts-download-top1000-btn');
    const packagedTtsDownloadRareBtn = document.getElementById('packaged-tts-download-rare-btn');
    const packagedTtsDownloadFullBtn = document.getElementById('packaged-tts-download-full-btn');
    const packagedTtsRemoveBtn = document.getElementById('packaged-tts-remove-btn');
    const packagedTtsStatusText = document.getElementById('packaged-tts-status-text');
    const ttsWarningBanner = document.getElementById('tts-warning-banner');
    const ttsWarningText = document.getElementById('tts-warning-text');
    const ttsWarningOpenSettingsBtn = document.getElementById('tts-warning-open-settings-btn');
    
    const backBtn = document.getElementById('back-btn');
    const nextBtn = document.getElementById('next-btn');
    const explorerToggleBtn = document.getElementById('explorer-toggle-btn');
    const optionsToggleBtn = document.getElementById('options-toggle-btn'); // Gear icon button
    const answerFlowBtn = document.getElementById('answer-flow-btn');
    const contextAudioBtn = document.getElementById('context-audio-btn');
    const backToFlashcardBtn = document.getElementById('back-to-flashcard-btn');
    const backToListBtn = document.getElementById('back-to-list-btn');
    const backToFlashcardFromOptionsBtn = document.getElementById('back-to-flashcard-from-options-btn'); // Back button in options
    const usageNuggetEl = document.getElementById('usage-nugget');
    const usageVisibilityBtn = document.getElementById('usage-visibility-btn');
    const answerFlowLabelEl = answerFlowBtn ? answerFlowBtn.querySelector('.control-dock-label') : null;

    const searchBar = document.getElementById('search-bar');
    const verbListContainer = document.getElementById('verb-list-container');
    const verbDetailContainer = document.getElementById('verb-detail-container');
    let packagedTtsBusy = false;
    let packagedTtsAutoStarted = false;
    let longPressCopyTimer = null;
    let suppressTapAudioUntil = 0;

    const playAudioElement = (element, options = {}) => {
        if (!element) return;
        const audioId = element.dataset.audioId || null;
        const text = String(element.dataset.speak || element.textContent || '').trim();
        if (!audioId && !text) return;
        if (options.withHuh) {
            maybeWhisperHuhBefore(text, audioId);
        } else {
            playAudioTarget(audioId, text);
        }
    };

    const shouldSuppressTapAudio = () => Date.now() < suppressTapAudioUntil;

    const copyTextToClipboard = async (text) => {
        const trimmed = String(text || '').trim();
        if (!trimmed || !navigator.clipboard || typeof navigator.clipboard.writeText !== 'function') {
            return false;
        }
        try {
            await navigator.clipboard.writeText(trimmed);
            if (navigator.vibrate) navigator.vibrate(12);
            if (dictationResultEl && typeof showDictationOverlay === 'function') {
                showDictationOverlay(`Copied: ${trimmed}`, 'prompt', 1100, false, true);
            }
            return true;
        } catch (error) {
            console.warn('Clipboard copy failed:', error);
            return false;
        }
    };

    const refreshContextAudioButton = () => {
        if (!contextAudioBtn) return;
        if (!FRENCH_FLASHCARD_FEATURES.contextualSpeakerButton) {
            contextAudioBtn.style.display = 'none';
            contextAudioBtn.disabled = true;
            return;
        }
        const canPlayInfinitive = !!(currentCard && currentCard.verb && currentCard.verb.infinitive);
        const canPlayAnswer = !!(currentCard && currentCard.conjugated);
        const enabled = isAnswerVisible ? canPlayAnswer : canPlayInfinitive;
        contextAudioBtn.disabled = !enabled;
        contextAudioBtn.setAttribute(
            'title',
            isAnswerVisible ? 'Play the shown answer' : 'Play the infinitive again'
        );
    };

    const refreshAnswerFlowButton = () => {
        if (!answerFlowBtn) return;
        const hasCard = !!currentCard;
        const mode = isAnswerVisible ? 'next' : 'show';
        answerFlowBtn.dataset.mode = mode;
        answerFlowBtn.disabled = !hasCard;
        if (answerFlowLabelEl) {
            answerFlowLabelEl.textContent = isAnswerVisible ? 'Next' : 'Show';
        }
        const label = isAnswerVisible ? 'Go to the next flashcard' : 'Show the answer';
        answerFlowBtn.setAttribute('title', label);
        answerFlowBtn.setAttribute('aria-label', label);
    };

    const syncUsageNuggetVisibility = () => {
        if (!usageNuggetEl) return;
        const shouldShow = !!(
            isAnswerVisible &&
            currentCard &&
            currentCard._hasUsages &&
            cardGenerationOptions.showUsageNugget
        );
        usageNuggetEl.style.display = shouldShow ? 'block' : 'none';
        usageNuggetEl.classList.toggle('usage-nugget-hidden', !shouldShow);

        if (usageVisibilityBtn) {
            const canToggle = !!(FRENCH_FLASHCARD_FEATURES.usageNuggetVisibilityToggle && currentCard && currentCard._hasUsages);
            usageVisibilityBtn.style.display = canToggle ? 'inline-flex' : 'none';
            usageVisibilityBtn.disabled = !canToggle;
            usageVisibilityBtn.setAttribute('aria-pressed', cardGenerationOptions.showUsageNugget ? 'true' : 'false');
            usageVisibilityBtn.setAttribute(
                'aria-label',
                cardGenerationOptions.showUsageNugget ? 'Hide verb usage' : 'Show verb usage'
            );
            usageVisibilityBtn.setAttribute(
                'title',
                cardGenerationOptions.showUsageNugget ? 'Hide verb usage' : 'Show verb usage'
            );
        }
    };

    const playContextAudioHint = () => {
        if (!currentCard || !currentCard.verb) return;
        if (isAnswerVisible) {
            playConjugatedAudio();
        } else {
            playInfinitiveAudio();
        }
    };

    const isInteractiveFlashcardTarget = (target) => {
        if (!(target instanceof Element)) return false;
        return !!target.closest(
            'button, input, label, select, textarea, a, .tappable-audio, #usage-nugget, #go-to-verb-btn-container, #tts-warning-banner'
        );
    };

    const clearLongPressCopy = () => {
        if (longPressCopyTimer) {
            window.clearTimeout(longPressCopyTimer);
            longPressCopyTimer = null;
        }
    };

    const scheduleLongPressCopy = (target) => {
        if (!FRENCH_FLASHCARD_FEATURES.longPressCopyOnPlayableText) return;
        if (!(target instanceof Element)) return;
        const playableTarget = target.closest('.tappable-audio');
        if (!playableTarget) return;
        const text = String(playableTarget.dataset.speak || playableTarget.textContent || '').trim();
        if (!text) return;
        clearLongPressCopy();
        longPressCopyTimer = window.setTimeout(async () => {
            suppressTapAudioUntil = Date.now() + 700;
            playableTarget.classList.add('playable-copying');
            await copyTextToClipboard(text);
            window.setTimeout(() => playableTarget.classList.remove('playable-copying'), 500);
            clearLongPressCopy();
        }, 450);
    };

    const stopActiveDictation = (options = {}) => {
        const { abort = false, silent = true } = options;
        clearTimeout(dictationTimeout);
        if (recognition) {
            ignoreNextDictationEnd = true;
            try {
                if (abort) recognition.abort();
                else recognition.stop();
            } catch (error) {
                console.warn('Dictation stop failed:', error);
            }
        }
        recognition = null;
        isDictating = false;
        setDictating(false);
        if (silent && dictationResultEl) {
            dictationResultEl.style.opacity = '0';
            window.setTimeout(() => {
                if (dictationResultEl) dictationResultEl.style.display = 'none';
            }, 120);
        }
    };

    const setPackagedTtsBusy = (busy) => {
        packagedTtsBusy = busy;
        const disabled = busy || !PACKAGED_TTS;
        if (packagedTtsEnabledToggle) packagedTtsEnabledToggle.disabled = !PACKAGED_TTS || busy;
        if (packagedTtsDownloadTop20Btn) packagedTtsDownloadTop20Btn.disabled = disabled;
        if (packagedTtsDownloadTop100Btn) packagedTtsDownloadTop100Btn.disabled = disabled;
        if (packagedTtsDownloadTop500Btn) packagedTtsDownloadTop500Btn.disabled = disabled;
        if (packagedTtsDownloadTop1000Btn) packagedTtsDownloadTop1000Btn.disabled = disabled;
        if (packagedTtsDownloadRareBtn) packagedTtsDownloadRareBtn.disabled = disabled;
        if (packagedTtsDownloadFullBtn) packagedTtsDownloadFullBtn.disabled = disabled;
        if (packagedTtsRemoveBtn) packagedTtsRemoveBtn.disabled = disabled;
    };

    const setPackagedTtsStatus = (message) => {
        if (packagedTtsStatusText) packagedTtsStatusText.textContent = message;
    };

    const updateMainAudioSetupBanner = async () => {
        if (!ttsWarningBanner || !ttsWarningText) return;

        const browserStatus = typeof window.getFrenchTtsStatus === 'function'
            ? window.getFrenchTtsStatus()
            : { available: false, state: 'unsupported' };

        let packagedStatus = null;
        if (PACKAGED_TTS) {
            try {
                packagedStatus = await PACKAGED_TTS.getStatus();
            } catch (error) {
                packagedStatus = {
                    error: error.message,
                    enabled: PACKAGED_TTS.isEnabled ? PACKAGED_TTS.isEnabled() : false,
                    cachedPacks: 0,
                };
            }
        }

        const browserReady = !!browserStatus.available;
        const packagedEnabled = !!(packagedStatus && packagedStatus.enabled);
        const packagedReady = !!(packagedStatus && packagedStatus.cachedPacks > 0);
        const packagedFull = !!(packagedStatus && packagedStatus.totalPacks > 0 && packagedStatus.cachedPacks >= packagedStatus.totalPacks);
        const packagedLayout = packagedStatus && packagedStatus.layout;
        const needsGuidance = !browserReady && !packagedReady;

        if (packagedTtsBusy) {
            const total = packagedStatus && packagedStatus.totalPacks ? packagedStatus.totalPacks : '?';
            const cached = packagedStatus && typeof packagedStatus.cachedPacks === 'number' ? packagedStatus.cachedPacks : 0;
            ttsWarningText.textContent = `Downloading French audio for offline playback... ${cached}/${total} packs cached so far.`;
            ttsWarningBanner.classList.remove('hidden');
            return;
        }

        if (!needsGuidance && (browserReady || packagedFull)) {
            ttsWarningBanner.classList.add('hidden');
            return;
        }

        let message = 'Audio is not ready on this device yet. French audio can be downloaded for offline playback.';
        if (packagedEnabled && !packagedReady) {
            message = packagedLayout === 'clips'
                ? 'Packaged French audio is enabled in clip-debug mode. Audio files will be fetched as needed.'
                : 'Packaged French audio is enabled, but nothing is downloaded yet on this device.';
        } else if (location.protocol === 'file:') {
            message = 'You opened the app directly from disk. Packaged French audio needs the hosted site or a local server, not file://.';
        } else if (packagedStatus && packagedStatus.error) {
            message = 'This build does not include packaged French audio files yet. Open Settings > Audio Voice after the audio packs are generated and deployed.';
        } else if (browserStatus.state === 'checking') {
            message = 'French browser audio is still being checked.';
        }

        ttsWarningText.textContent = message;
        ttsWarningBanner.classList.remove('hidden');
    };

    const ensureAutomaticPackagedTtsDownload = async () => {
        if (!PACKAGED_TTS || packagedTtsBusy || packagedTtsAutoStarted) return;
        if (location.protocol === 'file:') return;
        packagedTtsAutoStarted = true;

        try {
            PACKAGED_TTS.setEnabled(true);
            const status = await PACKAGED_TTS.getStatus();
            if (status.error || !status.totalPacks || status.cachedPacks >= status.totalPacks || status.layout === 'clips') {
                await refreshPackagedTtsUi();
                return;
            }

            await runPackagedTtsJob('Downloading French audio for offline playback...', async () => {
                await PACKAGED_TTS.downloadAllAudio(({ completed, total }) => {
                    setPackagedTtsStatus(`Downloading packaged French audio... ${completed}/${total} packs`);
                });
            });
        } catch (error) {
            packagedTtsAutoStarted = false;
            if (window.appLog) {
                window.appLog(`packed-tts auto-download-error message="${error.message}"`);
            }
            await refreshPackagedTtsUi();
        }
    };

    const refreshPackagedTtsUi = async () => {
        if (!PACKAGED_TTS) {
            if (packagedTtsEnabledToggle) packagedTtsEnabledToggle.checked = false;
            setPackagedTtsStatus('Packaged French audio runtime is unavailable in this build.');
            setPackagedTtsBusy(false);
            await updateMainAudioSetupBanner();
            if (typeof window.renderFrenchTtsStatus === 'function') window.renderFrenchTtsStatus();
            return;
        }

        try {
            const status = await PACKAGED_TTS.getStatus();
            if (packagedTtsEnabledToggle) packagedTtsEnabledToggle.checked = !!status.enabled;

            let message = 'Packaged French audio is not enabled.';
            if (location.protocol === 'file:') {
                message = 'Packaged audio cannot load from file://. Use a local server or the hosted site to test offline audio packs.';
            } else if (status.error) {
                message = 'Packaged audio files were not found. Run build_french_tts.py and then build.py.';
            } else if (status.layout === 'clips') {
                message = `Clip-debug layout active. ${status.cachedPacks}/${status.totalPacks} groups are fully cached. Disable packaged audio to force browser TTS instead.`;
            } else if (status.cachedPacks > 0 && status.mode === 'full' && status.cachedPacks >= status.totalPacks) {
                message = 'French audio ready offline for the full set.';
            } else if (status.cachedPacks > 0 && ['top20', 'top100', 'top500', 'top1000', 'rare'].includes(status.mode)) {
                const labelMap = {
                    top20: 'top 20',
                    top100: 'top 100',
                    top500: 'top 500',
                    top1000: 'top 1000',
                    rare: 'rare verbs',
                };
                message = `French audio ready offline for ${labelMap[status.mode] || status.mode} (${status.cachedPacks}/${status.totalPacks} packs cached).`;
            } else if (status.cachedPacks > 0) {
                message = `French audio cached for ${status.cachedPacks}/${status.totalPacks} packs.`;
            } else if (status.enabled) {
                message = 'Packaged French audio is enabled. Missing packs will download on demand.';
            }

            setPackagedTtsStatus(message);
        } catch (error) {
            setPackagedTtsStatus(`Packaged French audio error: ${error.message}`);
        }

        setPackagedTtsBusy(false);
        await updateMainAudioSetupBanner();
        if (typeof window.renderFrenchTtsStatus === 'function') {
            window.renderFrenchTtsStatus();
        }
    };

    const runPackagedTtsJob = async (statusMessage, runner) => {
        if (!PACKAGED_TTS || packagedTtsBusy) return;
        setPackagedTtsBusy(true);
        setPackagedTtsStatus(statusMessage);
        try {
            await runner();
        } catch (error) {
            if (window.appLog) {
                window.appLog(`packed-tts ui-error message="${error.message}"`);
            }
            setPackagedTtsStatus(`Packaged French audio failed: ${error.message}`);
        } finally {
            await refreshPackagedTtsUi();
        }
    };

    window.refreshPackagedFrenchTtsUi = refreshPackagedTtsUi;

    // Returns a clean English translation, or '' if translation is just "to <frenchInfinitive>"
    const cleanTranslation = (infinitive, rawTranslation) => {
        if (!rawTranslation) return '';
        let t = rawTranslation.trim();
        if (!/^to\s/i.test(t)) t = 'to ' + t;
        if (t.toLowerCase() === 'to ' + (infinitive || '').toLowerCase().trim()) return '';
        return rawTranslation.trim();
    };

    const infoBtn = document.getElementById('info-btn');
    const infoPanel = document.getElementById('info-panel');

    // --- Stability: Safe Mode & Global Error Logging ---
    // Enable Safe Mode by setting localStorage.setItem('safe-mode', 'true').
    // It reduces potentially fragile features (speech, dictation) for older devices.
    const SAFE_MODE = localStorage.getItem('safe-mode') === 'true';

    function logGlobalError(source, message, extra) {
        try {
            const key = 'error-log';
            const existing = JSON.parse(localStorage.getItem(key) || '[]');
            const entry = {
                ts: new Date().toISOString(),
                source,
                message: String(message || ''),
                extra: extra ? {
                    filename: extra.filename,
                    lineno: extra.lineno,
                    colno: extra.colno,
                    stack: extra.stack
                } : undefined,
                ua: navigator.userAgent
            };
            existing.push(entry);
            while (existing.length > 50) existing.shift();
            localStorage.setItem(key, JSON.stringify(existing));
        } catch (e) {
            // Swallow logging errors to avoid cascading failures
            console.warn('Error while logging error:', e);
        }
    }

    // Capture synchronous errors
    window.addEventListener('error', (e) => {
        logGlobalError('error', e && e.message, {
            filename: e && e.filename,
            lineno: e && e.lineno,
            colno: e && e.colno,
            stack: e && e.error && (e.error.stack || e.error.toString())
        });
    });
    // Capture unhandled promise rejections
    window.addEventListener('unhandledrejection', (e) => {
        const reason = e && e.reason;
        logGlobalError('unhandledrejection', reason && (reason.message || reason.toString()), {
            stack: reason && reason.stack
        });
    });

    // --- Dictation (Speech Recognition) ---
    const dictateBtn = document.getElementById('dictate-btn-bottom');
    const dictateBtnSvgHTML = dictateBtn ? dictateBtn.innerHTML : '';
    const setDictating = (on) => {
        if (!dictateBtn) return;
        if (on) {
            dictateBtn.classList.add('recording');
            dictateBtn.setAttribute('data-recording', 'true');
        } else {
            dictateBtn.classList.remove('recording');
            dictateBtn.removeAttribute('data-recording');
            dictateBtn.innerHTML = dictateBtnSvgHTML; // restore SVG if overwritten
        }
    };
    let recognition = null;
    let isDictating = false;
    let dictationResultEl = null;
    let dictationTimeout = null;
    let ignoreNextDictationEnd = false;

    // Overlay helpers (already defined above)
    // function showDictationOverlay(...) {...}
    // function hideDictationOverlay() {...}

    function setupDictation() {
        // In Safe Mode, proactively disable dictation (more crash-prone on some devices)
        if (SAFE_MODE) {
            if (dictateBtn) dictateBtn.disabled = true;
            return;
        }
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            if (dictateBtn) dictateBtn.disabled = true;
            return;
        }
        dictationResultEl = document.getElementById('dictation-result');
        if (!dictationResultEl) {
            dictationResultEl = document.createElement('div');
            dictationResultEl.id = 'dictation-result';
            dictationResultEl.style.position = 'absolute';
            dictationResultEl.style.left = '50%';
            dictationResultEl.style.transform = 'translateX(-50%)';
            dictationResultEl.style.top = '75%';
            dictationResultEl.style.width = '58%';
            dictationResultEl.style.boxShadow = '0 8px 32px rgba(44,62,80,0.18)';
            dictationResultEl.style.borderRadius = '18px';
            dictationResultEl.style.padding = '1em 1.2em';
            dictationResultEl.style.fontSize = '1.25em';
            dictationResultEl.style.minHeight = '2.2em';
            dictationResultEl.style.display = 'none';
            dictationResultEl.style.zIndex = '100';
            dictationResultEl.style.textAlign = 'center';
            dictationResultEl.style.pointerEvents = 'none';
            dictationResultEl.style.transition = 'opacity 0.5s';
            flashcard.style.position = 'relative';
            // Color scheme aware background/text
            const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (isDark) {
                dictationResultEl.style.background = 'rgba(24, 32, 48, 0.92)';
                dictationResultEl.style.color = '#eaf6fb';
                dictationResultEl.style.border = '2px solid #2c3e50';
            } else {
                dictationResultEl.style.background = 'rgba(255,255,255,0.92)';
                dictationResultEl.style.color = '#222';
                dictationResultEl.style.border = '2px solid #3498db55';
            }
            flashcard.appendChild(dictationResultEl);
        }
        // Update overlay style on color scheme change
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
                if (!dictationResultEl) return;
                if (e.matches) {
                    dictationResultEl.style.background = 'rgba(24, 32, 48, 0.92)';
                    dictationResultEl.style.color = '#eaf6fb';
                    dictationResultEl.style.border = '2px solid #2c3e50';
                } else {
                    dictationResultEl.style.background = 'rgba(255,255,255,0.92)';
                    dictationResultEl.style.color = '#222';
                    dictationResultEl.style.border = '2px solid #3498db55';
                }
            });
        }
        // Attach click handler ONCE
        if (!dictateBtn._dictationHandlerAttached) {
            dictateBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                // If already dictating, stop
                if (isDictating && recognition) {
                    recognition.stop();
                    return;
                }
                // Clean up any previous session
                if (recognition) {
                    try { recognition.abort(); } catch (e) {}
                    recognition = null;
                }
                clearTimeout(dictationTimeout);
                isDictating = true;
                setDictating(true);
                // Reset overlay for new session
                dictationResultEl.textContent = '';
                dictationResultEl.style.display = 'block';
                showDictationOverlay('Parlez maintenant...', 'prompt', 0, false, false);
                // Create new recognition instance
                const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                recognition = new SpeechRecognition();
                recognition.lang = speechLang;
                recognition.interimResults = true;
                recognition.continuous = true; // Allow continuous dictation, not just single utterance
                recognition.onstart = () => {
                    isDictating = true;
                    setDictating(true);
                    dictationResultEl.textContent = '';
                    dictationResultEl.style.display = 'block';
                    showDictationOverlay('Parlez maintenant...', 'prompt', 0, false, false);
                };
                recognition.onend = () => {
                    if (ignoreNextDictationEnd) {
                        ignoreNextDictationEnd = false;
                        return;
                    }
                    isDictating = false;
                    setDictating(false);
                    clearTimeout(dictationTimeout);
                    if (!dictationResultEl.textContent || dictationResultEl.textContent.includes('Parlez maintenant')) {
                        showDictationOverlay(UIStrings.noSpeech, 'prompt', 1800, false, true);
                    } else {
                        showDictationOverlay(dictationResultEl.innerHTML, 'normal', 4000, true, true);
                    }
                };
                recognition.onerror = (event) => {
                    if (ignoreNextDictationEnd) {
                        ignoreNextDictationEnd = false;
                        return;
                    }
                    isDictating = false;
                    setDictating(false);
                    clearTimeout(dictationTimeout);
                    showDictationOverlay(`${UIStrings.error}: ${event.error || UIStrings.unknown}`, 'error', 2200, false, true);
                };
                // let bravoHappened = false; // Track if Bravo was shown
                let correctDictationWasShown = false; // Track if correct dictation was shown
                recognition.onresult = (event) => {
                    let html = '';
                    let bestTranscript = '';
                    let bestConfidence = 0;

                    console.log('--- Speech Recognition Results ---');
                    for (let i = event.resultIndex; i < event.results.length; ++i) {
                        const alternatives = event.results[i];
                        console.log(`Result ${i}: isFinal = ${alternatives.isFinal}`);
                        for (let j = 0; j < alternatives.length; ++j) {
                            const alt = alternatives[j];
                            console.log(`  [${j}] "${alt.transcript.trim()}" (${(alt.confidence * 100).toFixed(1)}% confidence)`);
                        }
                    }
                    for (let i = event.resultIndex; i < event.results.length; ++i) {
                        const alternatives = event.results[i];
                        for (let j = 0; j < alternatives.length; ++j) {
                            const alt = alternatives[j];
                            // Use confidence for opacity, min 0.4 for visibility
                            let opacity = 0.4 + 0.6 * (alt.confidence || 0);
                            if (opacity > 1) opacity = 1;
                            if (opacity < 0.4) opacity = 0.4;
                            const conf = alt.confidence ? ` <span style='font-size:0.8em;color:#888;'>(${(alt.confidence * 100).toFixed(1)}%)</span>` : '';
                            html += `<div style=\"opacity:${opacity};font-weight:${j === 0 ? 700 : 400};margin-bottom:0.1em;\">${alt.transcript}${conf}</div>`;
                            
                            if (j === 0 && (!bestTranscript || (alt.confidence || 0) > bestConfidence)) {
                                bestTranscript = alt.transcript.trim();
                                bestConfidence = alt.confidence || 0;
                            }
                        }
                    }
                    // --- CHECK FOR CORRECT DICTATION (ALWAYS SHOW BRAVO) ---
                    if (!isAnswerVisible && currentCard && !autoskipLock) {
                        let expected;
                        let isPhrase = currentCard.isPhraseMode || !currentCard.verb;
                        
                        if (isPhrase) {
                            expected = (currentCard.phrase || '').trim();
                        } else {
                            expected = window.handleLanguageSpecificLastChange(currentCard.pronoun, currentCard.conjugated).trim();
                        }
                        const normalize = s => s.toLowerCase().replace(/[’']/g, "'").replace(/[.,!?;:()\[\]{}]/g, '').normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/\s+/g, ' ').trim();
                        const normExpected = normalize(expected);
                        const normTranscript = normalize(bestTranscript);
                        let isCorrect = false;
                        if (isPhrase) {
                            // Fuzzy word match: at least 70% of expected words present in transcript
                            const expectedWords = normExpected.split(' ');
                            const transcriptWords = normTranscript.split(' ');
                            let matchCount = 0;
                            expectedWords.forEach(word => {
                                if (transcriptWords.includes(word)) matchCount++;
                            });
                            if (expectedWords.length > 0 && (matchCount / expectedWords.length) >= 0.9) {
                                isCorrect = true;
                            }
                            console.log(`Phrase match: expected "${normExpected}", got "${normTranscript}" - ${isCorrect ? 'correct' : 'incorrect'}`);
                        } else {
                            // Strict match for verbs
                            if (normTranscript.includes(normExpected)) {
                                isCorrect = true;
                            }
                        }
                        if (isCorrect || correctDictationWasShown) {
                            // console.log(`🎉 Bravo! Correct dictation: "${bestTranscript}" matches expected: "${expected}". stopping recognition`);
                            // autoskipLock = true;
                            // setTimeout(() => {
                            //         if (recognition) {
                            //             try { recognition.stop(); } catch (e) {}
                            //         }
                            //     }, 500);
                            // Always show Bravo for correct answers
                            dictationResultEl.innerHTML = html + `<div style=\"opacity:1;font-weight:700;color:#27ae60;margin-top:0.5em;\">🎉 Bravo !</div>`;
                            dictationResultEl.style.display = 'block';
                            dictationResultEl.style.opacity = '1';
                            correctDictationWasShown= true;
                            
                        }
                        if (isCorrect) {
                            showAnswer();

                            // Log bravo event (robust for phrase mode)
                            if (isPhrase) {
                                logSessionEntry('phrase', '', '', 'bravo');
                            } else if (currentCard.verb) {
                            if (currentCard.verb) {
                                logSessionEntry(currentCard.verb.infinitive, currentCard.tense, currentCard.pronoun, 'bravo');
                            } else {
                                // Phrase mode: log safe values
                                logSessionEntry('phrase', '', '', 'bravo');
                            }
                            }
                            maybeWhisperMolodez();
                            
                            // Check if auto-advance is enabled
                            const autosayOn = localStorage.getItem('autosay-enabled') === 'true';
                            const correctDictationNextQuestion = localStorage.getItem('correct-dictation-next-question') === 'true';
                            
                            if (autosayOn || correctDictationNextQuestion) {
                                // Auto-advance to next question
                                setTimeout(() => {
                                    if (recognition) {
                                        try { recognition.stop(); } catch (e) {}
                                    }
                                    handleNext();
                                }, 1500); // 1.5s delay for Bravo
                            } else {
                                // Just stop recognition, don't auto-advance
                                setTimeout(() => {
                                    if (recognition) {
                                        try { recognition.stop(); } catch (e) {}
                                    }
                                }, 1500);
                            }
                            return;
                        }
                    }
                    // Only update overlay if not showing Bravo
                    showDictationOverlay(html, 'normal', 0, true, false);
                        let expected;
                        if (currentCard.isPhraseMode || !currentCard.verb) {
                            expected = (currentCard.phrase || '').trim();
                        } else {
                            expected = window.handleLanguageSpecificLastChange(currentCard.pronoun, currentCard.conjugated).trim();
                        }
                        const normalize = s => s.toLowerCase().replace(/[’']/g, "'").normalize('NFD').replace(/\p{Diacritic}/gu, '');
                        const normExpected = normalize(expected);
                        const normTranscript = normalize(bestTranscript);
                        if(correctDictationWasShown){
                            if(!dictationResultEl.innerHTML.includes('🎉 Bravo !')) {
                            dictationResultEl.innerHTML = dictationResultEl.innerHTML + `<div style=\"opacity:1;font-weight:700;color:#27ae60;margin-top:0.5em;\">🎉 Bravo !</div>`;
                            }
                        }
                        if (normTranscript.includes(normExpected)) {
                            autoskipLock = true;
                            correctDictationWasShown = true;

                            dictationResultEl.innerHTML = html + `<div style=\"opacity:1;font-weight:700;color:#27ae60;margin-top:0.5em;\">🎉 Bravo !</div>`;
                            dictationResultEl.style.display = 'block';
                            dictationResultEl.style.opacity = '1';
                            showAnswer();

                            // Log bravo event
                            if (currentCard.verb) {
                                logSessionEntry(currentCard.verb.infinitive, currentCard.tense, currentCard.pronoun, 'bravo');
                            } else {
                                logSessionEntry('phrase', '', '', 'bravo');
                            }
                            maybeWhisperMolodez();

                            setTimeout(() => {
                                if (recognition) {
                                    try { recognition.stop(); } catch (e) {}
                                }
                                if(localStorage.getItem('correct-dictation-next-question') === 'true'){
                                    handleNext();
                                }
                            }, 1500);
                            return;
                        }
                };
                recognition.start();
                // Safety: stop after 10s if not already ended
                dictationTimeout = setTimeout(() => {
                    if (isDictating && recognition) recognition.stop();
                }, 10000);
            });
            dictateBtn._dictationHandlerAttached = true;
        }
    }
    if (dictateBtn) setupDictation();

    // --- State ---
    let currentCard = null;
    let currentDetailVerb = null;
    let history = [];
    let historyIndex = -1;
    let isAnswerVisible = false;
    let recentCardKeys = []; // track last N card keys to avoid immediate repeats

    // --- Options UI Elements ---
    const hierarchicalToggle = document.getElementById('hierarchical-toggle');
    const showPhrasesToggle = document.getElementById('show-phrases-toggle');
    const verbsWithSentencesToggle = document.getElementById('verbs-with-sentences-toggle');
    const tenseWeightsContainer = document.getElementById('tense-weights-container');
    const frequencyWeightsContainer = document.getElementById('frequency-weights-container');

    // --- Card Generation Algorithm Options ---
    // This configuration object holds the settings for the flashcard
    // generation algorithm. These values can be modified, for example,
    // by a user settings UI in the future.

    // Dynamically create tense weights, defaulting to 1 for each tense.
    const tenseWeights = Object.keys(tenses).reduce((acc, tense) => {
        // Default to present tense only
        acc[tense] = (tense === 'present') ? 1 : 0;
        return acc;
    }, {});

    // Dynamically create frequency weights from the data
    // Default to "Master the Basics I" weights (top20=3, top50=1, rest=0)
    // so the first-ever open starts with a sensible beginner configuration.
    const starterWeights = { top20: 3, top50: 1, top100: 0, top500: 0, top1000: 0, rare: 0 };
    const frequencyWeights = {};
    allFrequencies.forEach(freq => {
        frequencyWeights[freq] = starterWeights[freq] ?? 0;
    });

    const cardGenerationOptions = {
        hierarchical: true, // When true, pick frequency group first, then verb.
        showPhrases: true,
        verbsWithSentencesOnly: false, // When true, only show verbs that have sentences
        balancedPronouns: false, // When true, all 9 pronouns get equal weight
        showUsageNugget: true,
        reflexiveMode: 'include', // 'include' = both, 'only' = reflexive only, 'exclude' = no reflexive
        tenseWeights,
        frequencyWeights,
        // New filters (objects: true = included)
        regularityFilter: { regular: true, irregular: true },
        endingFilter: { er: true, ir: true, re: true, other: true },
        categoryFilter: 'all',   // 'all' | one of classifyFrenchVerb categories
        // TODO(Filter): Consider allowing multiple categories (multi-select) and store as array.
    };

    // --- Local Storage for Options ---
    // Use generic localStorageKey for options
    const saveOptions = () => {
        try {
            localStorage.setItem(localStorageKey, JSON.stringify(cardGenerationOptions));
            // activePreset = "👤";
            // highlightActivePreset();
            updateCustomPresetFromUI();
            
        } catch (e) {
            console.warn("Could not save options to localStorage:", e);
        }
    };

    const loadOptions = () => {
        try {
            const savedOptionsJSON = localStorage.getItem(localStorageKey);
            if (savedOptionsJSON) {
                const savedOptions = JSON.parse(savedOptionsJSON);

                // Update toggles, checking for undefined to not break on old saves
                if (typeof savedOptions.hierarchical === 'boolean') {
                    cardGenerationOptions.hierarchical = savedOptions.hierarchical;
                }
                if (typeof savedOptions.showPhrases === 'boolean') {
                    cardGenerationOptions.showPhrases = savedOptions.showPhrases;
                }
                if (typeof savedOptions.verbsWithSentencesOnly === 'boolean') {
                    cardGenerationOptions.verbsWithSentencesOnly = ENABLE_LEGACY_SENTENCE_DATA && savedOptions.verbsWithSentencesOnly;
                }
                if (typeof savedOptions.balancedPronouns === 'boolean') {
                    cardGenerationOptions.balancedPronouns = savedOptions.balancedPronouns;
                }
                if (typeof savedOptions.showUsageNugget === 'boolean') {
                    cardGenerationOptions.showUsageNugget = savedOptions.showUsageNugget;
                }
                if (savedOptions.reflexiveMode) {
                    cardGenerationOptions.reflexiveMode = savedOptions.reflexiveMode;
                } else if (typeof savedOptions.includeReflexive === 'boolean') {
                    // migrate old boolean
                    cardGenerationOptions.reflexiveMode = savedOptions.includeReflexive ? 'include' : 'exclude';
                }

                // Update weights by merging into the existing objects
                if (savedOptions.tenseWeights) { Object.assign(tenseWeights, savedOptions.tenseWeights); }
                if (savedOptions.frequencyWeights) {
                    // Normalize any old hyphenated keys before merging
                    const savedFW = savedOptions.frequencyWeights;
                    const fwNorm = { 'top-20':'top20','top-50':'top50','top-100':'top100','top-500':'top500','top-1000':'top1000' };
                    Object.keys(fwNorm).forEach(old => {
                        if (old in savedFW) { savedFW[fwNorm[old]] = savedFW[old]; delete savedFW[old]; }
                    });
                    Object.assign(frequencyWeights, savedFW);
                }

                // Load new filters if present (with backward-compat for old string format)
                if (savedOptions.regularityFilter) {
                    if (typeof savedOptions.regularityFilter === 'string') {
                        const r = { regular: true, irregular: true };
                        if (savedOptions.regularityFilter === 'regular') r.irregular = false;
                        if (savedOptions.regularityFilter === 'irregular') r.regular = false;
                        cardGenerationOptions.regularityFilter = r;
                    } else if (typeof savedOptions.regularityFilter === 'object') {
                        Object.assign(cardGenerationOptions.regularityFilter, savedOptions.regularityFilter);
                    }
                }
                if (savedOptions.endingFilter) {
                    if (typeof savedOptions.endingFilter === 'string') {
                        const e = { er: true, ir: true, re: true, other: true };
                        if (savedOptions.endingFilter !== 'all') {
                            e.er = false; e.ir = false; e.re = false; e.other = false;
                            e[savedOptions.endingFilter] = true;
                        }
                        cardGenerationOptions.endingFilter = e;
                    } else if (typeof savedOptions.endingFilter === 'object') {
                        Object.assign(cardGenerationOptions.endingFilter, savedOptions.endingFilter);
                    }
                }
                if (typeof savedOptions.categoryFilter === 'string') {
                    cardGenerationOptions.categoryFilter = savedOptions.categoryFilter;
                }
            }
        } catch (e) {
            console.warn("Could not load options from localStorage:", e);
        }
    };


    // French verb classifier → returns a string like "ir/venir-tenir" or "er".
// Policy: all -oir verbs collapse to "oir" (no subcategories).

    function classifyFrenchVerb(input) {
        if (!input) return "unknown";

        // --- normalize: lowercase, trim, strip reflexive "se/s' ", remove diacritics ---
        let verb = input.trim().toLowerCase();
        verb = verb.replace(/^(se\s+|s')/, ""); // se tenir, s'enfuir, etc.
        const stripDiacritics = s =>
            s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const v = stripDiacritics(verb);

        // quick guard on endings (we only handle canonical infinitives)
        const ends = suf => v.endsWith(suf);
        const reEnds = re => re.test(v);

        // --- exact truly-standalone irregulars (one-offs) ---
        const exact = {
            // auxiliaries
            "etre": "other/etre",
            "avoir": "other/avoir",

            // oddballs that don't fit neat suffix rules
            "aller": "er/aller",          // only major irregular -er
            "faire": "re/faire",
            "dire": "re/dire",
            "lire": "re/lire",
            "ecrire": "re/ecrire",
            "plaire": "re/plaire",
            "taire": "re/taire",
            "traire": "re/traire",

            // rare/defective but worth catching
            "clore": "re/clore",
            "enclore": "re/clore",
            "declore": "re/clore",  // historical/rare
        };
        if (exact[v]) return exact[v];

        // --- –OIR family: collapse to "oir" by policy ---
        // IMPORTANT: only match pure -oir, not -oire (e.g., "boire" is NOT oir).
        if (reEnds(/oir$/)) return "oir";

        // --- –IR families (irregular third-group –ir) ---

        // venir / tenir and their derivatives
        if (reEnds(/(?:venir|tenir)$/)) return "ir/venir-tenir";
        if (reEnds(/(?:devenir|revenir|survenir|convenir|intervenir|prevenir|souvenir)$/)) return "ir/venir-tenir";
        if (reEnds(/(?:obtenir|retenir|appartenir|contenir|entretenir|maintenir|soutenir)$/)) return "ir/venir-tenir";

        // quérir family (acquérir, conquérir, requérir…)
        if (reEnds(/querir$/)) return "ir/querir";

        // ouvrir/offrir/couvrir/souffrir/cueillir families (llir / vrir / frir behave like -er in the present)
        if (reEnds(/(?:llir|vrir|frir)$/)) return "ir/llir-vrir-frir";

        // short-stem drop in singular: dormir/partir/sortir/servir/sentir/mentir (+ prefixed forms)
        if (reEnds(/(?:dormir|partir|sortir|servir|sentir|mentir)$/)) return "ir/short-stem";
        if (reEnds(/(?:redormir|endormir|repartir|departir|ressortir|desservir|pressentir|resentir|démentir|rementir)$/)) return "ir/short-stem";

        // courir (+ derivatives)
        if (reEnds(/courir$/) || reEnds(/(?:accourir|parcourir|secourir|recourir)$/)) return "ir/courir";

        // fuir (+ derivatives)
        if (reEnds(/fuir$/) || reEnds(/(?:refuir|enfuir)$/)) return "ir/fuir";

        // mourir
        if (reEnds(/mourir$/)) return "ir/mourir";

        // bouillir
        if (reEnds(/bouillir$/)) return "ir/bouillir";

        // vetir (vêtir) + revêtir, dévêtir
        if (reEnds(/vetir$/) || reEnds(/(?:revetir|devetir)$/)) return "ir/vetir";

        // haïr (hair after strip) — double-stem (haï- / haïss-)
        if (reEnds(/hair$/)) return "ir/hair";

        // assaillir / saillir / tressaillir
        if (reEnds(/(?:assaillir|saillir|tressaillir)$/)) return "ir/saillir";

        // faillir
        if (reEnds(/faillir$/)) return "ir/faillir";

        // maudire (quirky –ir)
        if (reEnds(/maudire$/)) return "ir/maudire";

        // ouïr (ouir) archaic
        if (reEnds(/ouir$/)) return "ir/ouir";

        // default regular –ir (2nd group) if nothing above matched
        if (ends("ir")) return "ir";

        // --- –RE families (vowel+re and consonant+re sets) ---

        // prendre family (reprendre, apprendre, comprendre, surprendre…)
        if (reEnds(/prendre$/) || reEnds(/(?:reprendre|apprendre|comprendre|surprendre|meprendre|meprendre)$/)) return "re/prendre";

        // mettre family (permettre, soumettre, remettre, transmettre…)
        if (reEnds(/mettre$/) || reEnds(/(?:permettre|soumettre|remettre|transmettre|promettre|admettre|omettre|commettre|submettre)$/)) return "re/mettre";

        // battre family (abattre, combattre, débattre…)
        if (reEnds(/battre$/) || reEnds(/(?:abattre|combattre|debattre|rebattre)$/)) return "re/battre";

        // rompre family (corrompre, interrompre…)
        if (reEnds(/rompre$/) || reEnds(/(?:corrompre|interrompre)$/)) return "re/rompre";

        // vaincre / convaincre
        if (reEnds(/(?:vaincre|convaincre)$/)) return "re/vaincre";

        // -indre / -aindre / -eindre / -oindre (craindre, peindre, joindre…)
        if (reEnds(/(?:indre|aindre|eindre|oindre)$/)) return "re/indre";

        // -soudre (resoudre, dissoudre, absoudre…)
        if (reEnds(/soudre$/)) return "re/soudre";

        // -uire (conduire, produire, traduire, cuire…)
        if (reEnds(/uire$/)) return "re/uire";

        // -aître / -aitre (connaître, naître, paraître…); also -oître/-oitre (croître)
        if (reEnds(/(?:aitre|aitre)$/) || reEnds(/(?:oitre|oitre)$/)) return "re/aitre";

        // boire, croire (NOTE: they end with -re; do not confuse with -oir)
        if (reEnds(/boire$/)) return "re/boire";
        if (reEnds(/croire$/)) return "re/croire";

        // rire / sourire
        if (reEnds(/(?:rire|sourire)$/)) return "re/rire";

        // suivre (+ poursuivre)
        if (reEnds(/suivre$/) || reEnds(/poursuivre$/)) return "re/suivre";

        // vivre (+ revivre, survivre)
        if (reEnds(/vivre$/) || reEnds(/(?:revivre|survivre)$/)) return "re/vivre";

        // dire derivatives (redire, contredire, prédire…)
        if (reEnds(/(?:redire|contredire|predire)$/)) return "re/dire";

        // ecrire derivatives (decrire, inscrire, prescrire…)
        if (reEnds(/(?:decrire|inscrire|prescrire|recrire|transcrire|souscrire)$/)) return "re/ecrire";

        // plaire derivatives (deplaire)
        if (reEnds(/deplaire$/)) return "re/plaire";

        // faire derivatives (satisfaire, contrefaire, défaire…)
        if (reEnds(/(?:satisfaire|contrefaire|defaire|refaire)$/)) return "re/faire";

        // default –re
        if (ends("re")) return "re";

        // --- default –er (regular) ---
        if (ends("er")) return "er";

        return "unknown";
    }

    // --- quick sanity checks ---
    // console.log(classifyFrenchVerb("parler"));      // "er"
    // console.log(classifyFrenchVerb("aller"));       // "er/aller"
    // console.log(classifyFrenchVerb("venir"));       // "ir/venir-tenir"
    // console.log(classifyFrenchVerb("devenir"));     // "ir/venir-tenir"
    // console.log(classifyFrenchVerb("ouvrir"));      // "ir/llir-vrir-frir"
    // console.log(classifyFrenchVerb("dormir"));      // "ir/short-stem"
    // console.log(classifyFrenchVerb("maudire"));     // "ir/maudire"
    // console.log(classifyFrenchVerb("pouvoir"));     // "oir"
    // console.log(classifyFrenchVerb("boire"));       // "re/boire"
    // console.log(classifyFrenchVerb("prendre"));     // "re/prendre"
    // console.log(classifyFrenchVerb("croître"));     // "re/aitre"
    // console.log(classifyFrenchVerb("s'enfuir"));    // "ir/fuir"

    // --- Helper: Compute how many verbs are currently "in play" ---
    // Criteria: verb belongs to a frequency group with non-zero weight AND passes regularity/ending filters
    // and, if enabled, has practice sentences (gap_sentence) in at least one enabled tense.
    const computeActiveVerbPoolCount = () => {
        try {
            const {
                frequencyWeights = {},
                regularityFilter = { regular: true, irregular: true },
                endingFilter = { er: true, ir: true, re: true, other: true },
                categoryFilter = 'all',
                verbsWithSentencesOnly = false,
                tenseWeights = {}
            } = cardGenerationOptions || {};

            const activeFrequencies = new Set(
                Object.entries(frequencyWeights)
                    .filter(([, w]) => (w || 0) > 0)
                    .map(([f]) => f)
            );
            if (activeFrequencies.size === 0) return 0;

            const isIrregular = (inf) => IRREGULAR_VERBS.has(inf);
            const getEnding = (inf) => {
                if (inf.endsWith('er')) return 'er';
                if (inf.endsWith('ir')) return 'ir';
                if (inf.endsWith('re')) return 're';
                return 'other';
            };
            const passesFilters = (verbInfo) => {
                if (cardGenerationOptions.reflexiveMode === 'only' && !verbInfo.reflexive) return false;
                if (cardGenerationOptions.reflexiveMode === 'exclude' && verbInfo.reflexive) return false;
                const irreg = isIrregular(verbInfo.infinitive);
                if (irreg && !regularityFilter.irregular) return false;
                if (!irreg && !regularityFilter.regular) return false;
                const end = getEnding(verbInfo.infinitive);
                if (!endingFilter[end]) return false;
                if (categoryFilter !== 'all') {
                    const cat = verbInfo.category || classifyFrenchVerb(verbInfo.infinitive);
                    if (cat !== categoryFilter) return false;
                }
                return true;
            };
            const hasPracticeSentences = (inf) => {
                if (!ENABLE_LEGACY_SENTENCE_DATA) return true;
                // If the sentences-only filter is OFF, don't exclude any verbs based on sentences
                if (!verbsWithSentencesOnly) return true;
                const verbPhrases = phrasebook[inf];
                if (!verbPhrases) return false;
                for (const tenseName in tenseWeights) {
                    if ((tenseWeights[tenseName] || 0) <= 0) continue;
                    const phraseKey = tenseKeyToPhraseKey[tenseName];
                    const tenseArr = verbPhrases && verbPhrases[phraseKey];
                    if (!Array.isArray(tenseArr)) continue;
                    if (tenseArr.some(p => p && p.gap_sentence)) return true;
                }
                return false;
            };

            let count = 0;
            for (const v of uniqueVerbs) {
                // In reflexive-only mode, bypass frequency filter — count all reflexive verbs
                if (cardGenerationOptions.reflexiveMode !== 'only') {
                    const freq = v.frequency || 'common';
                    if (!activeFrequencies.has(freq)) continue;
                }
                if (!passesFilters(v)) continue;
                if (!hasPracticeSentences(v.infinitive)) continue;
                count++;
            }
            return count;
        } catch (err) {
            console.warn('computeActiveVerbPoolCount error:', err);
            return 0;
        }
    };

    // Update the count label in the Options -> Verb filters section if present
    const updateVerbFiltersCountLabel = () => {
        const el = document.getElementById('verb-filters-count');
        if (!el) return;
        const n = computeActiveVerbPoolCount();
        el.textContent = `In play: ${n} verbs`;
    };
    // --- Audio Synthesis ---
    // Use generic speechLang for speech synthesis, and allow user-selected voice
    const synth = window.speechSynthesis;
    const speak = (text) => {
        // In Safe Mode, avoid invoking speech synthesis on potentially fragile devices
        if (SAFE_MODE) return;
        // Replace placeholders with "blanc" for speech
        const textToSpeak = prepareTextForSpeech(text);
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.lang = speechLang;
        
        // Cancel current speech only if different text
        if (synth.speaking) {
            synth.cancel();
            // Small delay to ensure cancellation completes
            setTimeout(() => {
                // Use user-selected voice if set
                const voiceName = localStorage.getItem('ttsVoiceName');
                if (voiceName) {
                    const voices = synth.getVoices();
                    const matches = voices.filter(v => v.name === voiceName && v.lang && v.lang.startsWith('fr-FR') && !v.name.toLowerCase().includes('english'));
                    if (matches.length > 0) utterance.voice = matches[0];
                }
                utterance.rate = 0.9;
                synth.speak(utterance);
            }, 100);
        } else {
            // Use user-selected voice if set
            const voiceName = localStorage.getItem('ttsVoiceName');
            if (voiceName) {
                const voices = synth.getVoices();
                const matches = voices.filter(v => v.name === voiceName && v.lang && v.lang.startsWith('fr-FR') && !v.name.toLowerCase().includes('english'));
                if (matches.length > 0) utterance.voice = matches[0];
            }
            utterance.rate = 0.9;
            synth.speak(utterance);
        }
    };

    // Helper function to check if two pronouns are equivalent (same person/number)
    const arePronounsEquivalent = (pronoun1, pronoun2) => {
        // Normalize pronouns to arrays
        const p1Variants = pronoun1.includes('/') ? pronoun1.split('/') : [pronoun1];
        const p2Variants = pronoun2.includes('/') ? pronoun2.split('/') : [pronoun2];
        
        // Define pronoun groups (same person/number)
        const pronounGroups = [
            ['je'],
            ['tu'], 
            ['il', 'elle', 'on'],
            ['nous'],
            ['vous'],
            ['ils', 'elles']
        ];
        
        // Check if both pronouns belong to the same group
        for (const group of pronounGroups) {
            const p1InGroup = p1Variants.some(p => group.includes(p));
            const p2InGroup = p2Variants.some(p => group.includes(p));
            if (p1InGroup && p2InGroup) {
                return true;
            }
        }
        return false;
    };

    // --- Flashcard Logic ---
    const removeAccents = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    const cardKey = (card) => `${card.verb?.infinitive}|${card.tense}|${card.pronoun}`;

    const performWeightedSelection = (weightedItems) => {
        if (!weightedItems || weightedItems.length === 0) return null;

        // Filter out recently seen cards (keep at most 1/3 of deck size as buffer)
        const bufferSize = Math.max(1, Math.floor(weightedItems.length / 3));
        const recentSet = new Set(recentCardKeys.slice(-bufferSize));
        const filtered = weightedItems.filter(item => !recentSet.has(cardKey(item.card)));
        const pool = filtered.length > 0 ? filtered : weightedItems; // fallback to full deck if all recent

        const totalWeight = pool.reduce((sum, item) => sum + (item.score || 0), 0);
        if (totalWeight <= 0) {
            return pool[Math.floor(Math.random() * pool.length)].card;
        }

        let random = Math.random() * totalWeight;
        for (const item of pool) {
            random -= (item.score || 0);
            if (random <= 0) return item.card;
        }
        return pool[pool.length - 1].card;
    };

    const generateNewCard = (options = {}) => {
        // --- PRACTICE MODE LOGIC ---
        const practiceMode = localStorage.getItem('practiceMode') || 'verbs';
        if (practiceMode === 'phrases') {
            let phrasesList;
            // Dummy phrase mode: pick a random phrase from dummyPhrases
            if(practicePhrases){
                phrasesList = practicePhrases;
            }
            else{
                phrasesList = [
                    { fr: "Bonjour, comment ça va?", en: "Hello, how are you?" },
                    { fr: "Je voudrais un café.", en: "I would like a coffee." },
                    { fr: "Où est la bibliothèque?", en: "Where is the library?" },
                    { fr: "Merci beaucoup!", en: "Thank you very much!" },
                    { fr: "Je ne comprends pas.", en: "I don't understand." }
                ];
            }
            const chosen = phrasesList[Math.floor(Math.random() * phrasesList.length)];
            // Return a card-like object for phrase mode
            return {
                phrase: chosen.fr,
                translation: chosen.en,
                // Add any other fields needed for displayCard
                isPhraseMode: true
            };
        }

        // ...existing verb card logic...
    const { hierarchical = false, tenseWeights = {}, frequencyWeights = {}, verbsWithSentencesOnly = false, regularityFilter = { regular: true, irregular: true }, endingFilter = { er: true, ir: true, re: true, other: true }, categoryFilter = 'all' } = options;
    const sentenceFilterEnabled = ENABLE_LEGACY_SENTENCE_DATA && verbsWithSentencesOnly;

        // Helpers for filters
        const isIrregular = (inf) => IRREGULAR_VERBS.has(inf);
        const getEnding = (inf) => {
            if (inf.endsWith('er')) return 'er';
            if (inf.endsWith('ir')) return 'ir';
            if (inf.endsWith('re')) return 're';
            return 'other';
        };
        const passesFilters = (verbInfo) => {
            if (cardGenerationOptions.reflexiveMode === 'only' && !verbInfo.reflexive) return false;
            if (cardGenerationOptions.reflexiveMode === 'exclude' && verbInfo.reflexive) return false;
            // Regularity
            const irreg = isIrregular(verbInfo.infinitive);
            if (irreg && !regularityFilter.irregular) return false;
            if (!irreg && !regularityFilter.regular) return false;
            // Ending
            const end = getEnding(verbInfo.infinitive);
            if (!endingFilter[end]) return false;
            // Category
            if (categoryFilter !== 'all') {
                const cat = verbInfo.category || classifyFrenchVerb(verbInfo.infinitive);
                if (cat !== categoryFilter) return false;
            }
            return true;
        };

        // Helper function to check if a verb has sentences with gap sentences for actual practice
        const verbHasSentences = (verbInfinitive) => {
            if (!ENABLE_LEGACY_SENTENCE_DATA) return true;
            const verbPhrases = phrasebook[verbInfinitive];
            if (!verbPhrases) return false;
            
            // If verbsWithSentencesOnly is enabled, we want verbs that have gap sentences for interactive practice
            if (sentenceFilterEnabled) {
                // Check if this verb has gap sentences for any tense/pronoun combination we might actually use
                for (const tenseName in tenseWeights) {
                    if (tenseWeights[tenseName] <= 0) continue; // Skip disabled tenses
                    
                    const phraseKey = tenseKeyToPhraseKey[tenseName];
                    const tenseArr = verbPhrases[phraseKey];
                    if (!Array.isArray(tenseArr)) continue;
                    
                    // Check if any sentence in this tense has a gap_sentence
                    const hasGapSentence = tenseArr.some(phrase => phrase.gap_sentence);
                    if (hasGapSentence) return true;
                }
                return false;
            } else {
                // Just check if there are any sentences at all
                return Object.keys(verbPhrases).length > 0;
            }
        };

        let newCard = null;

        if (hierarchical) {
            // ...existing code...
            // In reflexive-only mode, bypass frequency selection — use all reflexive verbs
            let verbsInFrequency;
            if (cardGenerationOptions.reflexiveMode === 'only') {
                verbsInFrequency = uniqueVerbs.filter(passesFilters);
            } else {
                const weightedFrequencies = Object.entries(frequencyWeights)
                    .map(([freq, score]) => ({ card: freq, score: score }))
                    .filter(item => item.score > 0);
                if (weightedFrequencies.length === 0) return null;
                const selectedFrequency = performWeightedSelection(weightedFrequencies);
                if (!selectedFrequency) return null;
                verbsInFrequency = uniqueVerbs.filter(v => (v.frequency || 'common') === selectedFrequency);
            }
            // Exclude verbs with no real English translation
            verbsInFrequency = verbsInFrequency.filter(v => cleanTranslation(v.infinitive, v.translation || ''));
            // Apply new filters
            verbsInFrequency = verbsInFrequency.filter(passesFilters);
            if (sentenceFilterEnabled) {
                verbsInFrequency = verbsInFrequency.filter(v => verbHasSentences(v.infinitive));
            }
            if (verbsInFrequency.length === 0) return null;

            const weightedDeck = [];
            for (const tenseName in tenses) {
                const tenseWeight = tenseWeights[tenseName] || 0;
                if (tenseWeight === 0) continue;

                for (const verbInfo of verbsInFrequency) {
                    const tenseData = tenses[tenseName];
                    const conjugations = tenseData && tenseData[verbInfo.infinitive];
                    if (conjugations) {
                        const availablePronouns = pronouns.filter(p => conjugations[p]);
                        for (const pronounKey of availablePronouns) {
                            if (cardGenerationOptions.balancedPronouns && pronounKey.includes('/')) {
                                // Balanced: one entry per individual pronoun with equal weight
                                const options = pronounKey.split('/');
                                for (const pronoun of options) {
                                    weightedDeck.push({
                                        card: { verb: verbInfo, tense: tenseName, pronoun, conjugated: conjugations[pronounKey] },
                                        score: tenseWeight
                                    });
                                }
                            } else {
                                let pronoun = pronounKey;
                                if (pronounKey.includes('/')) {
                                    const options = pronounKey.split('/');
                                    pronoun = options[Math.floor(Math.random() * options.length)];
                                }
                                weightedDeck.push({
                                    card: { verb: verbInfo, tense: tenseName, pronoun, conjugated: conjugations[pronounKey] },
                                    score: tenseWeight
                                });
                            }
                        }
                    }
                }
            }
            newCard = performWeightedSelection(weightedDeck);

        } else {
            // ...existing code...
            const weightedDeck = [];
            for (const tenseName in tenses) {
                const tenseWeight = tenseWeights[tenseName] || 0;
                if (tenseWeight === 0) continue;

                for (const verbInfo of uniqueVerbs) {
                    // Apply new filters
                    if (!passesFilters(verbInfo)) continue;
                    if (sentenceFilterEnabled && !verbHasSentences(verbInfo.infinitive)) {
                        continue;
                    }
                    // In reflexive-only mode, bypass frequency weights — use all reflexive verbs equally
                    const freqWeight = cardGenerationOptions.reflexiveMode === 'only'
                        ? 1
                        : (frequencyWeights[verbInfo.frequency || 'common'] || 0);
                    const score = tenseWeight * freqWeight;
                    if (score === 0) continue;

                    const tenseData = tenses[tenseName];
                    const conjugations = tenseData && tenseData[verbInfo.infinitive];
                    if (conjugations) {
                        const availablePronouns = pronouns.filter(p => conjugations[p]);
                        for (const pronounKey of availablePronouns) {
                            if (cardGenerationOptions.balancedPronouns && pronounKey.includes('/')) {
                                const options = pronounKey.split('/');
                                for (const pronoun of options) {
                                    weightedDeck.push({
                                        card: { verb: verbInfo, tense: tenseName, pronoun, conjugated: conjugations[pronounKey] },
                                        score: score
                                    });
                                }
                            } else {
                                let pronoun = pronounKey;
                                if (pronounKey.includes('/')) {
                                    const options = pronounKey.split('/');
                                    pronoun = options[Math.floor(Math.random() * options.length)];
                                }
                                weightedDeck.push({
                                    card: { verb: verbInfo, tense: tenseName, pronoun, conjugated: conjugations[pronounKey] },
                                    score: score
                                });
                            }
                        }
                    }
                }
            }
            newCard = performWeightedSelection(weightedDeck);
        }

        if (!newCard) {
            console.error("No cards available with the current weight settings. Please adjust the options.");
            verbInfinitiveEl.textContent = "Error";
            verbTranslationEl.textContent = "No cards available for current options.";
            verbPronounEl.textContent = "";
            verbTenseEl.textContent = "";
            verbFrequencyEl.textContent = "";
            conjugatedVerbEl.textContent = "Please adjust options";
            answerContainer.classList.add('is-visible');
            isAnswerVisible = true;
            return null;
        }

        return newCard;
    };
    function maybeWhisperMolodez(probability = null) {
        console.log("maybeWhisperMolodez called");
        const sfx = document.getElementById("molodez_sound");

        let finalProbability;

        if (probability !== null) {
            finalProbability = probability;
        } else {
            // Use time-based dynamic probability
            const now = new Date();
            const day = now.getDay();       // 0 (Sun) - 6 (Sat)
            const hour = now.getHours();    // 0 - 23

            // Divide the week into 21 slots (7 days × 3 slots/day)
            const slotIndex = day * 3 + Math.floor(hour / 8); // 0 - 20

            // Example: assign probabilities to each slot (can be tweaked)
            const slotProbabilities = [
            0.002, 0.003, 0.001,  // Sunday
            0.005, 0.007, 0.004,  // Monday
            0.008, 0.009, 0.005,  // Tuesday
            0.01,  0.012, 0.006,  // Wednesday
            0.015, 0.018, 0.009,  // Thursday
            0.02,  0.025, 0.01,   // Friday
            0.03,  0.02,  0.015   // Saturday
            ];

            finalProbability = slotProbabilities[slotIndex];
        }

        if (Math.random() < finalProbability) {
            sfx?.play();
        }
        }


    function maybeWhisperHuhBefore(whatToSpeakAfter, audioId = null) {
        console.log("maybeWhisperHuh called");
        if (Math.random() < 0.03) {
            const sfx = document.getElementById("huh_sound");
            sfx.currentTime = 0;
            sfx.play();
            sfx.onended = () => playAudioTarget(audioId, whatToSpeakAfter);
        } else {
            playAudioTarget(audioId, whatToSpeakAfter);
        }
    }
    // --- Autotalk prompt template ---
    function getPromptTemplate(card) {
      // Example: "Comment dire [VERB] au [TENSE] pour [PRONOUN] ?"
      // You can refine this template as needed for natural French
      const tenseMap = {
        'present': 'présent',
        'passeCompose': 'passé composé',
        'imparfait': 'imparfait',
        'futurSimple': 'futur simple',
        'plusQueParfait': 'tense-plusQueParfait',
        'subjonctifPresent': 'subjonctif présent',
        'conditionnelPresent': 'conditionnel présent'
      };
      const pronoun = card.pronoun;
      const verb = card.verb.infinitive;
      const tense = tenseMap[card.tense] || card.tense;
      return `Comment dire « ${verb} » au ${tense} pour « ${pronoun} » ?`;
    }

    const updateHashParams = (card) => {
        if (card.verb) {
            const params = new URLSearchParams();
            params.set('pronoun', card.pronoun);
            params.set('verb', card.verb.infinitive);
            params.set('tense', card.tense);
            window.location.hash = params.toString();
        } else {
            window.location.hash = '';
        }
    };

    const displayCard = (card) => {
        currentCard = card;
        // Track recent cards to avoid immediate repeats
        if (card.verb) {
            recentCardKeys.push(cardKey(card));
            if (recentCardKeys.length > 200) recentCardKeys.shift();
        }
        updateHashParams(card);
        // --- PHRASE MODE ---
        const isPhraseMode = card.isPhraseMode || (!card.verb && card.phrase);
        const answerContainerConjugatedLine = document.querySelector("#answer-contsainer .conjugated-line");
        
        if (isPhraseMode) {
            // Hide all verb-specific UI elements robustly
            if (verbInfinitiveEl) { verbInfinitiveEl.textContent = ''; verbInfinitiveEl.parentElement.style.display = 'none'; }
            if (verbTranslationEl) { verbTranslationEl.textContent = ''; verbTranslationEl.style.display = 'none'; }
            if (verbHintEl) { verbHintEl.textContent = ''; verbHintEl.style.display = 'none'; }
            if (verbPronounEl) { verbPronounEl.textContent = ''; verbPronounEl.style.display = 'none'; }
            if (verbTenseEl) { verbTenseEl.textContent = ''; verbTenseEl.style.display = 'none'; }
            if (verbFrequencyEl) { verbFrequencyEl.textContent = ''; verbFrequencyEl.style.display = 'none'; }
            if (verbCategoryEl) { verbCategoryEl.textContent = ''; verbCategoryEl.style.display = 'none'; }
            if (verbIrregularEl) { verbIrregularEl.style.display = 'none'; }
            if (conjugatedVerbEl) { conjugatedVerbEl.textContent = ''; conjugatedVerbEl.style.display = 'none'; }
            // Clear phrase containers
            if (verbPhraseEl) { verbPhraseEl.innerHTML = ''; verbPhraseEl.style.display = ''; }
            if (questionPhraseEl) { questionPhraseEl.innerHTML = ''; questionPhraseEl.style.display = 'block'; }
            if (answerContainerConjugatedLine) {
                answerContainerConjugatedLine.style.display = "none";
            }
            // Show English translation in question container (visible immediately)
            if (card.translation && questionPhraseEl) {
                const translationDiv = document.createElement('div');
                translationDiv.innerHTML = `Comment dit-on <br> <strong> "${card.translation}"</strong>? `;
                translationDiv.style.marginTop = '0.0em';
                translationDiv.style.fontSize = '0.9em';
                // translationDiv.style.fontWeight = "bold";
                translationDiv.style.marginBottom = '0.3em';
                // translationDiv.classList.add('tappable-audio');
                translationDiv.style.color = 'var(--text-color)';
                // questionPhraseEl.prepend(translationDiv);
                questionPhraseEl.appendChild(translationDiv);
                questionPhraseEl.style.top = '8%';
                questionPhraseEl.style.display = 'block'; // Ensure visible
                console.log("Phrase mode: showing translation in questionPhraseEl");
                // answerContainer.
                // document.getElementById("conjugated-line").style.display = 'none';
            }

            // Put French sentence in answer container (hidden until answer is revealed)
            if (card.phrase && verbPhraseEl) {
                const phraseSpan = document.createElement('p');
                phraseSpan.textContent = card.phrase;
                phraseSpan.classList.add('tappable-audio');
                phraseSpan.style.cursor = 'pointer';
                phraseSpan.style.display = ''; // Visible when answer is revealed
                phraseSpan.id = 'phrase-french-sentence';
                verbPhraseEl.appendChild(phraseSpan);
            }

            // Set English phrase for English toggle
            if (englishVerbPhraseEl) englishVerbPhraseEl.textContent = card.translation || '';
            if (englishVerbInfinitiveEl) englishVerbInfinitiveEl.textContent = '';
            if (englishVerbTranslationEl) englishVerbTranslationEl.textContent = '';

            // Hide answer container until answer is revealed
            if (answerContainer) answerContainer.classList.remove('is-visible');
            isAnswerVisible = false;
            syncUsageNuggetVisibility();
            refreshContextAudioButton();
            refreshAnswerFlowButton();
            return;
        } else {
            // --- VERB MODE ---
            // Restore all verb-specific UI elements robustly
            if (answerContainerConjugatedLine) {
                answerContainerConjugatedLine.style.display = "";
            }
            if (verbInfinitiveEl) { verbInfinitiveEl.parentElement.style.display = 'flex'; }
            if (verbTranslationEl) { verbTranslationEl.style.display = 'block'; }
            if (verbHintEl) { verbHintEl.style.display = ''; }
            if (verbPronounEl) { verbPronounEl.style.display = ''; }
            if (verbTenseEl) { verbTenseEl.style.display = ''; }
            if (verbFrequencyEl) { verbFrequencyEl.style.display = ''; }
            if (verbCategoryEl) { verbCategoryEl.style.display = ''; }
            if (verbIrregularEl) { verbIrregularEl.style.display = ''; }
            if (conjugatedVerbEl) { conjugatedVerbEl.style.display = ''; }
        }
        // --- VERB CARD LOGIC ---
        const verbFrequency = card.verb.frequency || 'common'; 
        const rawTranslation = cleanTranslation(card.verb.infinitive, card.verb.translation || '');
        let translation = rawTranslation;
        if (translation && !/^to\s/i.test(translation)) {
            translation = 'to ' + translation;
        }
        verbInfinitiveEl.textContent = card.verb.infinitive;
        verbInfinitiveEl.classList.add('tappable-audio');
        verbInfinitiveEl.dataset.audioId = lemmaAudioId(card.verb.infinitive);
        verbInfinitiveEl.dataset.speak = card.verb.infinitive;
        verbTranslationEl.textContent = translation || '';
        if (verbHintEl) verbHintEl.textContent = card.verb.hint || '';
        if (englishVerbInfinitiveEl) englishVerbInfinitiveEl.textContent = translation.replace(/^[\(|\)]/g, '');
        if (englishVerbTranslationEl) englishVerbTranslationEl.textContent = '';
        let pronounDisplay = card.pronoun;
        if (pronounDisplay.includes('/')) {
            pronounDisplay = pronounDisplay.split('/').map(p => (pronounEmojiMap[p.trim()] || '') + ' ' + p.trim()).join(' / ');
        } else {
            pronounDisplay = (pronounEmojiMap[pronounDisplay] || '') + ' ' + pronounDisplay;
        }
        verbPronounEl.textContent = pronounDisplay.trim();
        verbTenseEl.textContent = tenseKeyToLabel[card.tense] || card.tense;
        verbTenseEl.className = 'meta-info';
        const tenseClassMap = {
            'present': 'tense-present',
            'passeCompose': 'tense-passeCompose',
            'imparfait': 'tense-imparfait',
            'futurSimple': 'tense-futurSimple',
            'plusQueParfait': 'tense-plusQueParfait',
            'subjonctifPresent': 'tense-subjonctifPresent',
            'conditionnelPresent': 'tense-conditionnelPresent'
        };
        if (tenseClassMap[card.tense]) {
            verbTenseEl.classList.add(tenseClassMap[card.tense]);
        }
        const frequencyText = verbFrequency.replace('-', ' ');
        verbFrequencyEl.textContent = frequencyText;
        verbFrequencyEl.className = 'meta-info frequency-tag';
        verbFrequencyEl.classList.add(verbFrequency.replace(/\s+/g, '-'));
        // Set verb category (classification)
        if (verbCategoryEl) {
            const category = (card.verb && card.verb.category) ? card.verb.category : classifyFrenchVerb(card.verb.infinitive);
            verbCategoryEl.textContent = category;
            verbCategoryEl.className = 'meta-info category-tag';
            // TODO(UI): Color-code category-tag by high-level family (er/ir/re/oir) for quick scanning.
            // Example: parse prefix before '/' and add CSS class like 'cat-er', 'cat-ir', etc.
        }
        const isIrregular = IRREGULAR_VERBS.has(card.verb.infinitive);
        if (isIrregular) {
            verbIrregularEl.style.display = 'block';
        } else {
            verbIrregularEl.style.display = 'none';
        }
        let answerText = window.handleLanguageSpecificLastChange(card.pronoun, card.conjugated);
        conjugatedVerbEl.textContent = answerText;
        conjugatedVerbEl.classList.add('tappable-audio');
        conjugatedVerbEl.dataset.audioId = conjugationAudioId(card.verb.infinitive, card.tense, card.pronounKey || card.pronoun);
        conjugatedVerbEl.dataset.speak = card.conjugated;
        verbPhraseEl.innerHTML = '';
        questionPhraseEl.innerHTML = '';
        verbPhraseEl.classList.remove('tappable-audio');
        questionPhraseEl.classList.remove('tappable-audio');
        questionPhraseEl.style.display = 'none';
        currentCard.chosenPhrase = null;

        // ── Usage nugget — all usages for this verb, revealed with answer ────────
        const nuggetEl = document.getElementById('usage-nugget');
        if (nuggetEl) {
            nuggetEl.style.display = 'none';
            currentCard._hasUsages = renderVerbUsages(nuggetEl, card.verb.infinitive) > 0;
        }
        syncUsageNuggetVisibility();
        refreshContextAudioButton();
        refreshAnswerFlowButton();

        // --- AUTOTALK: Speak prompt if enabled ---
        const autosayOn = localStorage.getItem('autosay-enabled') === 'true';
        if (autosayOn) {
            const prompt = getFrenchPrompt(card);
            speak(prompt);
        }
    }
    

    const showAnswer = () => {
        if (!isAnswerVisible) {
            answerContainer.classList.add('is-visible');
            isAnswerVisible = true;
            if (window.incrementDailyCount) window.incrementDailyCount();
            // In phrase mode, show the French sentence now
            if (currentCard && !currentCard.verb) {
                const phraseSpan = document.getElementById('phrase-french-sentence');
                if (phraseSpan) phraseSpan.style.display = '';
            }
            // Show usage nugget when answer reveals
            syncUsageNuggetVisibility();
            refreshContextAudioButton();
            refreshAnswerFlowButton();
            // Do NOT speak the answer automatically
        }
    };

    const hideAnswer = () => {
        answerContainer.classList.remove('is-visible');
        // Show question phrase again if it was visible before (now they are siblings)
        if (ENABLE_GAP_SENTENCES && currentCard && currentCard.chosenPhrase && currentCard.chosenPhrase.gap_sentence) {
            questionPhraseEl.style.display = 'block';
        }
        isAnswerVisible = false;
        syncUsageNuggetVisibility();
        refreshContextAudioButton();
        refreshAnswerFlowButton();
    };

    // --- Card advance logic ---
    let autoskipLock = false;
    const nextCard = () => {
        autoskipLock = false;
        stopActiveDictation({ abort: true, silent: true });
        if (currentCard && currentCard.verb) {
            logSessionEntry(currentCard.verb.infinitive, currentCard.tense, currentCard.pronoun, 'next');
        }
        // For phrase mode, skip logging or handle differently if needed
        if (historyIndex < history.length - 1 && history.length > 0) {
            historyIndex++;
            displayCard(history[historyIndex]);
            backBtn.disabled = false;
        } else {
            const newCard = generateNewCard(cardGenerationOptions);
            if (newCard) {
                history.push(newCard);
                historyIndex = history.length - 1;
                displayCard(newCard);
                backBtn.disabled = historyIndex === 0;
            } else {
                // No card could be generated — show a hint on the card face
                if (verbInfinitiveEl) verbInfinitiveEl.textContent = 'No verbs match current filters';
                if (verbTranslationEl) { verbTranslationEl.textContent = 'Adjust settings to continue'; verbTranslationEl.style.display = 'block'; }
                console.warn('generateNewCard returned null — check frequency weights and filters');
            }
        }
        // Do NOT start dictation automatically
    };

    const handleNext = () => {
        if (isAnswerVisible) {
            hideAnswer();
            setTimeout(() => {
                nextCard();
            }, 300);
        } else {
            nextCard();
        }
    };

    const handlePrev = () => {
        if (isAnswerVisible) {
            hideAnswer();
            setTimeout(prevCard, 300);
        } else {
            prevCard();
        }
    };

    const prevCard = () => {
        stopActiveDictation({ abort: true, silent: true });
        if (historyIndex > 0) {
            historyIndex--;
            displayCard(history[historyIndex]);
        }
        backBtn.disabled = historyIndex === 0;
    };

    // --- View Management & Routing ---
    const mnemonicsView = document.getElementById('mnemonics-view');
    const views = [flashcardView, explorerListView, explorerDetailView, optionsView, mnemonicsView];

    function showView(viewId, pushState = true) {
        if (viewId !== 'flashcard-view') {
            stopActiveDictation({ abort: true, silent: true });
        }
        let targetView = null;
        views.forEach(view => {
            if (view.id === viewId) {
                view.classList.remove('hidden');
                targetView = view;
            } else {
                view.classList.add('hidden');
            }
        });

        if (pushState && targetView) {
            // We only push a new state if it's different from the current one
            // to avoid duplicate entries when handling popstate.
            if (!window.history.state || window.history.state.view !== viewId) {
                window.history.pushState({ view: viewId }, '', `#${viewId}`);
            }
        }
    }

    const showExplorerList = () => {
        showView('explorer-list-view');
        populateExplorerList(searchBar.value);
    };

    const showFlashcards = () => {
        showView('flashcard-view');
    };

    const showOptions = () => {
        showView('options-view');
    };

    if (ttsWarningOpenSettingsBtn) {
        ttsWarningOpenSettingsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            showOptions();
        });
    }

    const showMnemonics = () => {
        showView('mnemonics-view');
    };

    const showVerbDetail = (verbInfinitive, tenseToFocus = null) => {
        const verb = uniqueVerbs.find(v => v.infinitive === verbInfinitive);
        if (!verb) return;
        currentDetailVerb = verb;
        showView('explorer-detail-view'); // This pushes state for the back button
        populateVerbDetail(verb, tenseToFocus);
    };

    const highlightAndScrollToTense = (tenseToFocus) => {
        if (!tenseToFocus) return;

        const targetBlock = document.getElementById(`detail-tense-${tenseToFocus}`);
        if (targetBlock) {
            // Use a timeout to ensure the view is rendered before scrolling
            setTimeout(() => {
                targetBlock.scrollIntoView({ behavior: 'smooth', block: 'center' });
                // Add a temporary highlight class for visual feedback
                targetBlock.classList.add('highlight');
                // Remove the highlight after the animation
                setTimeout(() => targetBlock.classList.remove('highlight'), 1500);
            }, 100); // A small delay allows the DOM to update
        }
    };

    // --- Verb List Modes (no modules, file:// compatible) ---
    // (Mode toggle functionality removed; always show frequency mode)
    function groupVerbsByFrequency(verbs) {
        const groups = {};
        // Initialize groups for all frequencies found in the data
        allFrequencies.forEach(freq => {
            groups[freq] = [];
        });
        
        verbs.forEach(v => {
            const freq = v.frequency || 'common';
            if (groups[freq]) {
                groups[freq].push(v);
            } else {
                // Handle any frequency not in our list (shouldn't happen)
                if (!groups[freq]) groups[freq] = [];
                groups[freq].push(v);
            }
        });
        return groups;
    }

    function populateExplorerList(filter = '') {
        verbListContainer.innerHTML = '';
        const normalizedFilter = removeAccents(filter.toLowerCase().trim());
        const filteredVerbs = uniqueVerbs.filter(v => {
            if (!normalizedFilter) return true;
            // Match French infinitive
            if (removeAccents(v.infinitive.toLowerCase()).includes(normalizedFilter)) return true;
            // Match English translation
            const trans = cleanTranslation(v.infinitive, v.translation || '');
            if (trans && removeAccents(trans.toLowerCase()).includes(normalizedFilter)) return true;
            // Match any conjugated form across all tenses.
            // For compound forms (e.g. "j'ai abandonné"), only match the participle part —
            // otherwise aux verbs (avoir/être) would match every single verb.
            const auxPrefix = /^(j'ai|tu as|il a|elle a|on a|nous avons|vous avez|ils ont|elles ont|j'avais|tu avais|il avait|elle avait|on avait|nous avions|vous aviez|ils avaient|elles avaient|je suis|tu es|il est|elle est|on est|nous sommes|vous êtes|ils sont|elles sont|j'étais|tu étais|il était|elle était|on était|nous étions|vous étiez|ils étaient|elles étaient)\s+/i;
            for (const tenseName in tenses) {
                const conjugations = tenses[tenseName] && tenses[tenseName][v.infinitive];
                if (!conjugations) continue;
                for (const form of Object.values(conjugations)) {
                    const searchable = removeAccents(form.replace(auxPrefix, '').toLowerCase());
                    if (searchable.includes(normalizedFilter)) return true;
                }
            }
            return false;
        });
        const groups = groupVerbsByFrequency(filteredVerbs);

        // TODO(Explorer): Add a category chip next to each verb (use verb.category) and consider an Explorer-level
        // category filter (single-select aligned with Options) to narrow the list. Keep search and Active-only in sync.
        
        // Create labels by capitalizing frequency names
        const freqLabels = {};
        allFrequencies.forEach(freq => {
            freqLabels[freq] = freq.charAt(0).toUpperCase() + freq.slice(1);
        });
        
        // Calculate basic group sizes from the full verb list
        const groupSizes = {};
        allFrequencies.forEach(freq => {
            groupSizes[freq] = uniqueVerbs.filter(v => v.frequency === freq).length;
        });

        // Sort frequencies by basic group size (smallest first)
        const sortedBySize = [...allFrequencies].sort((a, b) => groupSizes[a] - groupSizes[b]);

        // Use the sorted frequency order to display sections
        sortedBySize.forEach(freq => {
            if (groups[freq] && groups[freq].length) {
                const section = document.createElement('div');
                section.innerHTML = `<div class="frequency-section-header">${freqLabels[freq]}</div>`;
                // Sort verbs alphabetically within each group
                groups[freq].sort((a, b) => a.infinitive.localeCompare(b.infinitive));
                groups[freq].forEach(verb => {
                    const item = document.createElement('div');
                    item.className = 'verb-list-item';
                    item.dataset.infinitive = verb.infinitive;
                    const listTranslation = cleanTranslation(verb.infinitive, verb.translation);
                    item.innerHTML = `
                        <div class="verb-list-item-text">
                            <span class="infinitive">${verb.infinitive}</span>
                            <span class="translation">${listTranslation}</span>
                        </div>
                        <button class="audio-btn" data-speak="${verb.infinitive}" data-audio-id="${lemmaAudioId(verb.infinitive)}">🔊</button>
                    `;
                    section.appendChild(item);
                });
                verbListContainer.appendChild(section);
            }
        });
    }

    const populateVerbDetail = (verb, tenseToFocus = null) => {
        verbDetailContainer.innerHTML = ''; // Clear previous content

        const header = document.createElement('div');
        header.className = 'verb-detail-header';
        const detailTranslation = cleanTranslation(verb.infinitive, verb.translation);
        const infinitiveSpan = document.createElement('span');
        infinitiveSpan.className = 'infinitive tappable-audio';
        infinitiveSpan.dataset.speak = verb.infinitive;
        infinitiveSpan.dataset.audioId = lemmaAudioId(verb.infinitive);
        infinitiveSpan.textContent = verb.infinitive;
        header.appendChild(infinitiveSpan);
        if (detailTranslation) {
            const translationEl = document.createElement('p');
            translationEl.className = 'translation';
            translationEl.textContent = detailTranslation;
            header.appendChild(translationEl);
        }
        // TODO(Detail): Show verb.category in the header (chip next to infinitive) and make it clickable to filter Explorer
        // by this category (navigates back to list with category pre-selected).
        verbDetailContainer.appendChild(header);

        Object.keys(tenses).forEach(tenseName => {
            const tenseBlock = document.createElement('div');
            tenseBlock.className = 'tense-block';
            tenseBlock.id = `detail-tense-${tenseName}`; // Add ID for focusing

            const tenseHeader = document.createElement('h4');
            tenseHeader.className = 'tense-header tappable-audio';
            tenseHeader.dataset.speak = tenseKeyToLabel[tenseName] || tenseName;
            tenseHeader.dataset.audioId = tenseAudioId(tenseName);
            tenseHeader.textContent = tenseKeyToLabel[tenseName] || tenseName;
            tenseBlock.appendChild(tenseHeader);

            const grid = document.createElement('div');
            grid.className = 'conjugation-grid';

            const conjugationsForVerb = tenses[tenseName][verb.infinitive];
            pronouns.forEach(pronoun => {
                const conjugation = conjugationsForVerb[pronoun] || '—'; // Fallback for missing conjugations
                const item = document.createElement('div');
                item.className = 'conjugation-item';
                const pronounSpan = document.createElement('span');
                pronounSpan.className = 'pronoun tappable-audio';
                pronounSpan.dataset.speak = pronoun;
                pronounSpan.dataset.audioId = pronounAudioId(pronoun);
                pronounSpan.textContent = pronoun;
                item.appendChild(pronounSpan);

                const conjugationSpan = document.createElement('span');
                conjugationSpan.className = conjugation === '—' ? 'conjugation' : 'conjugation tappable-audio';
                conjugationSpan.dataset.speak = conjugation === '—' ? '' : conjugation;
                if (conjugation !== '—') {
                    conjugationSpan.dataset.audioId = conjugationAudioId(verb.infinitive, tenseName, pronoun);
                }
                conjugationSpan.textContent = conjugation;
                item.appendChild(conjugationSpan);
                grid.appendChild(item);
            });
            tenseBlock.appendChild(grid);
            verbDetailContainer.appendChild(tenseBlock);
        });

        const usageSection = document.createElement('section');
        const usageCount = renderVerbUsages(usageSection, verb.infinitive, {
            sectionClass: 'verb-usages-detail-section',
            heading: 'Usages & examples',
        });
        if (usageCount > 0) {
            verbDetailContainer.appendChild(usageSection);
        }

        // After populating, scroll to the focused tense if provided
        highlightAndScrollToTense(tenseToFocus);
    };

    // --- Options UI Logic ---
    const populateOptions = () => {
        // Set initial state of the hierarchical toggle
        if (hierarchicalToggle) hierarchicalToggle.checked = cardGenerationOptions.hierarchical;
        if (showPhrasesToggle) showPhrasesToggle.checked = cardGenerationOptions.showPhrases;
        if (verbsWithSentencesToggle) verbsWithSentencesToggle.checked = cardGenerationOptions.verbsWithSentencesOnly;
        const balancedPronounsToggle = document.getElementById('balanced-pronouns-toggle');
        if (balancedPronounsToggle) balancedPronounsToggle.checked = cardGenerationOptions.balancedPronouns;
        // reflexive pills are dynamically created in frequencyWeightsContainer, no sync needed here

        // Helper function to create a slider control for a given weight object
        const tenseDisplayNames = {
            'present': 'présent', 'passeCompose': 'passé composé',
            'imparfait': 'imparfait', 'futurSimple': 'futur simple',
            'plusQueParfait': 'plus-que-parfait',
            'subjonctifPresent': 'subjonctif présent',
            'conditionnelPresent': 'conditionnel présent'
        };
        const tenseClasses = {
            'present': 'tense-present', 'passeCompose': 'tense-passeCompose',
            'imparfait': 'tense-imparfait', 'futurSimple': 'tense-futurSimple',
            'plusQueParfait': 'tense-plusQueParfait',
            'subjonctifPresent': 'tense-subjonctifPresent',
            'conditionnelPresent': 'tense-conditionnelPresent'
        };
        const freqDisplayNames = {
            'top1000': 'Top 1000', 'top500': 'Top 500', 'top100': 'Top 100',
            'top50': 'Top 50', 'top20': 'Top 20'
        };

        const createSlider = (key, value, container, weightType) => {
            if (weightType === 'tenseWeights') {
                // Render as a colored toggle pill
                const btn = document.createElement('button');
                btn.className = 'tense-weight-pill';
                btn.textContent = tenseDisplayNames[key] || key;
                btn.dataset.key = key;
                const tc = tenseClasses[key] || '';
                if (value > 0) btn.classList.add('active', tc);
                btn.addEventListener('click', () => {
                    const cur = cardGenerationOptions.tenseWeights[key] || 0;
                    const newVal = cur > 0 ? 0 : 1;
                    cardGenerationOptions.tenseWeights[key] = newVal;
                    if (newVal > 0) { btn.classList.add('active', tc); }
                    else { btn.classList.remove('active', tc); }
                    saveOptions();
                    updateVerbFiltersCountLabel();
                });
                container.appendChild(btn);
                return;
            }

            if (weightType === 'frequencyWeights') {
                // Render as a 0-5 segmented step row
                const row = document.createElement('div');
                row.className = 'freq-weight-row';
                const label = document.createElement('span');
                label.className = 'freq-label';
                let labelText = freqDisplayNames[key] || key.replace(/([A-Z])/g, ' $1');
                const count = frequencyCounts[key] || 0;
                if (count) labelText += ` (${count})`;
                label.textContent = labelText;
                const stepsRow = document.createElement('div');
                stepsRow.className = 'freq-steps';
                const clamped = Math.max(0, Math.min(5, value));
                for (let i = 0; i <= 5; i++) {
                    const step = document.createElement('button');
                    step.className = 'freq-step-btn' + (i === clamped ? ' active' : '');
                    step.textContent = i;
                    step.addEventListener('click', () => {
                        cardGenerationOptions.frequencyWeights[key] = i;
                        stepsRow.querySelectorAll('.freq-step-btn').forEach((b, idx) => {
                            b.classList.toggle('active', idx === i);
                        });
                        saveOptions();
                        updateVerbFiltersCountLabel();
                    });
                    stepsRow.appendChild(step);
                }
                row.appendChild(label);
                row.appendChild(stepsRow);
                container.appendChild(row);
                return;
            }

            // Fallback: original range slider
            const sliderGroup = document.createElement('div');
            sliderGroup.className = 'slider-group';
            const label = document.createElement('label');
            label.htmlFor = `slider-${key}`;
            let labelText = key.replace(/([A-Z])/g, ' $1').replace('-', ' ');
            label.textContent = labelText;
            const slider = document.createElement('input');
            slider.type = 'range';
            slider.id = `slider-${key}`;
            slider.min = 0;
            slider.max = 10;
            slider.value = value;
            slider.dataset.key = key;
            const sliderValue = document.createElement('span');
            sliderValue.className = 'slider-value';
            sliderValue.textContent = value;
            slider.addEventListener('input', (e) => {
                const newValue = parseInt(e.target.value, 10);
                sliderValue.textContent = newValue;
                cardGenerationOptions[weightType][e.target.dataset.key] = newValue;
                saveOptions();
                updateVerbFiltersCountLabel();
            });
            sliderGroup.appendChild(label);
            sliderGroup.appendChild(slider);
            sliderGroup.appendChild(sliderValue);
            container.appendChild(sliderGroup);
        };

        tenseWeightsContainer.innerHTML = '';
        Object.entries(cardGenerationOptions.tenseWeights).forEach(([tense, weight]) => createSlider(tense, weight, tenseWeightsContainer, 'tenseWeights'));

        frequencyWeightsContainer.innerHTML = '';
        // Render in ascending rarity order: top20 first, rare last
        const freqOrder = ['top20', 'top50', 'top100', 'top500', 'top1000', 'rare'];
        const freqEntries = Object.entries(cardGenerationOptions.frequencyWeights);
        freqEntries.sort(([a], [b]) => {
            const ai = freqOrder.indexOf(a), bi = freqOrder.indexOf(b);
            return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
        });
        freqEntries.forEach(([freq, weight]) => createSlider(freq, weight, frequencyWeightsContainer, 'frequencyWeights'));

        // Balance verb randomizer toggle (after freq weights)
        const balanceRow = document.createElement('div');
        balanceRow.className = 'toggle-row';
        balanceRow.style.marginTop = '0.6rem';
        balanceRow.innerHTML = `
            <label for="hierarchical-toggle" style="font-weight:600;font-size:0.9rem;color:var(--text-color);">Balance verb randomizer</label>
            <div class="toggle-switch">
                <input type="checkbox" id="hierarchical-toggle" class="toggle-input" ${cardGenerationOptions.hierarchical ? 'checked' : ''}>
                <label for="hierarchical-toggle" class="toggle-label"></label>
            </div>`;
        balanceRow.querySelector('#hierarchical-toggle').addEventListener('change', (e) => {
            cardGenerationOptions.hierarchical = e.target.checked;
            saveOptions();
        });
        frequencyWeightsContainer.appendChild(balanceRow);

        // Reflexive mode pills — lives next to balance toggle (same conceptual group)
        const reflexiveRow = document.createElement('div');
        reflexiveRow.className = 'toggle-row';
        reflexiveRow.style.marginTop = '0.4rem';
        const activeMode = cardGenerationOptions.reflexiveMode || 'include';
        reflexiveRow.innerHTML = `
            <label style="font-weight:600;font-size:0.9rem;color:var(--text-color);">Reflexive verbs</label>
            <div class="reflexive-mode-pills" id="reflexive-mode-pills">
                <button class="reflexive-pill${activeMode==='exclude'?' active':''}" data-mode="exclude">Without</button>
                <button class="reflexive-pill${activeMode==='include'?' active':''}" data-mode="include">Both</button>
                <button class="reflexive-pill${activeMode==='only'?' active':''}" data-mode="only">Only</button>
            </div>`;
        reflexiveRow.querySelectorAll('.reflexive-pill').forEach(btn => {
            btn.addEventListener('click', () => {
                cardGenerationOptions.reflexiveMode = btn.dataset.mode;
                reflexiveRow.querySelectorAll('.reflexive-pill').forEach(b => b.classList.toggle('active', b === btn));
                saveOptions();
                updateCustomPresetFromUI();
                updateVerbFiltersCountLabel();
            });
        });
        frequencyWeightsContainer.appendChild(reflexiveRow);

        // --- New Filters UI (Regularity and Verb Ending) ---
        // Add a small section inside frequencyWeightsContainer for visual grouping
    const filtersSection = document.createElement('div');
    filtersSection.className = 'filters-section';
    filtersSection.style.marginTop = '1em';
    // Card-like styling
    filtersSection.style.padding = '0.75em 0.9em';
    filtersSection.style.border = '1px solid #e9ecef';
    filtersSection.style.borderRadius = '12px';
    filtersSection.style.background = 'var(--card-bg, #f8f9fa)';

        const heading = document.createElement('div');
    heading.textContent = 'Verb filters';
    heading.style.fontWeight = '700';
    heading.style.fontSize = '1.05rem';
    heading.style.color = 'var(--accent-color, #3498db)';
    heading.style.margin = '0.2em 0 0.6em 0';
        filtersSection.appendChild(heading);

        const createCheckboxGroup = (labelText, options, currentValues) => {
            const group = document.createElement('div');
            group.style.margin = '0.5rem 0 0.7rem';

            const label = document.createElement('div');
            label.textContent = labelText;
            label.style.fontWeight = '600';
            label.style.fontSize = '0.9rem';
            label.style.color = 'var(--text-color, #2c3e50)';
            label.style.marginBottom = '0.45rem';
            group.appendChild(label);

            const row = document.createElement('div');
            row.style.display = 'flex';
            row.style.flexWrap = 'wrap';
            row.style.gap = '0.4rem';

            options.forEach(({ value, text }) => {
                const pill = document.createElement('label');
                pill.style.display = 'inline-flex';
                pill.style.alignItems = 'center';
                pill.style.padding = '0.28em 0.8em';
                pill.style.borderRadius = '999px';
                pill.style.border = '1.5px solid var(--border-color, #e9ecef)';
                pill.style.cursor = 'pointer';
                pill.style.fontSize = '0.88rem';
                pill.style.fontWeight = '600';
                pill.style.userSelect = 'none';
                pill.style.transition = 'background 0.15s, border-color 0.15s, opacity 0.15s';

                const cb = document.createElement('input');
                cb.type = 'checkbox';
                cb.checked = currentValues[value] !== false;
                cb.style.display = 'none';

                const applyPillStyle = () => {
                    if (cb.checked) {
                        pill.style.background = 'var(--accent-color, #3498db)';
                        pill.style.borderColor = 'var(--accent-color, #3498db)';
                        pill.style.color = '#fff';
                        pill.style.opacity = '1';
                    } else {
                        pill.style.background = 'transparent';
                        pill.style.borderColor = 'var(--border-color, #e9ecef)';
                        pill.style.color = 'var(--text-color, #2c3e50)';
                        pill.style.opacity = '0.45';
                    }
                };
                applyPillStyle();

                cb.addEventListener('change', () => {
                    currentValues[value] = cb.checked;
                    applyPillStyle();
                    saveOptions();
                    updateVerbFiltersCountLabel();
                });

                pill.appendChild(cb);
                pill.appendChild(document.createTextNode(text));
                row.appendChild(pill);
            });

            group.appendChild(row);
            return group;
        };

        // Regular/Irregular filter
        const regularityGroup = createCheckboxGroup(
            'Regular Vs Irregular',
            [
                { value: 'regular', text: 'Regular' },
                { value: 'irregular', text: 'Irregular' },
            ],
            cardGenerationOptions.regularityFilter
        );
        filtersSection.appendChild(regularityGroup);

        // Verb ending filter
        const endingGroup = createCheckboxGroup(
            'Verb Ending',
            [
                { value: 'er', text: '-er' },
                { value: 'ir', text: '-ir' },
                { value: 're', text: '-re' },
                { value: 'other', text: 'other' },
            ],
            cardGenerationOptions.endingFilter
        );
        filtersSection.appendChild(endingGroup);

    // Verb category filter (from classifyFrenchVerb)
    /*const categoryOptions = [{ value: 'all', text: 'All categories' }].concat(
        (allVerbCategories || []).map(c => ({ value: c, text: c }))
    );
    const categoryGroup = createSelectGroup(
        'Verb Category',
        'category-filter',
        categoryOptions,
        cardGenerationOptions.categoryFilter || 'all',
        (val) => { cardGenerationOptions.categoryFilter = val; }
    );
    filtersSection.appendChild(categoryGroup);
    */

    // Informative count under filters
    const countEl = document.createElement('div');
    countEl.id = 'verb-filters-count';
    countEl.style.marginTop = '0.6rem';
    countEl.style.fontSize = '0.95rem';
    countEl.style.fontWeight = '600';
    countEl.style.color = 'var(--text-muted, #6c757d)';
    countEl.textContent = 'In play: …';
    // TODO(UX): If Explorer gets a category filter, consider mirroring that state here or vice versa,
    // so the "In play" count and list feel consistent.
    filtersSection.appendChild(countEl);

        frequencyWeightsContainer.appendChild(filtersSection);
        
        // Initial count render
        updateVerbFiltersCountLabel();
    };

    // Expose so applyPreset (global scope) can re-render the settings UI
    window._populateOptions = populateOptions;

    // --- Event Listeners ---
    flashcard.addEventListener('click', (event) => {
        if (isInteractiveFlashcardTarget(event.target)) return;
        if (isAnswerVisible) {
            handleNext();
        } else {
            showAnswer();
        }
    });
    nextBtn.addEventListener('click', handleNext);
    backBtn.addEventListener('click', handlePrev);
    answerFlowBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!currentCard) return;
        if (isAnswerVisible) {
            handleNext();
        } else {
            showAnswer();
        }
    });

    infinitiveAudioBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        playAudioTarget(lemmaAudioId(currentCard.verb.infinitive), currentCard.verb.infinitive);
    });

    conjugatedAudioBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (currentCard && currentCard.pronoun && currentCard.conjugated) {
            let audioText = window.handleLanguageSpecificLastChange(currentCard.pronoun, currentCard.conjugated);
            maybeWhisperHuhBefore(audioText, conjugationAudioId(currentCard.verb.infinitive, currentCard.tense, currentCard.pronounKey || currentCard.pronoun));
        } else if (currentCard && currentCard.conjugated) {
            playAudioTarget(null, currentCard.conjugated);
        }
    });

    // Make infinitive tappable for audio (keyboard and click)
    function playInfinitiveAudio() {
        if (shouldSuppressTapAudio()) return;
        if (currentCard && currentCard.verb.infinitive) {
            playAudioTarget(lemmaAudioId(currentCard.verb.infinitive), currentCard.verb.infinitive);
        }
    }
    verbInfinitiveEl.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        playInfinitiveAudio();
    });
    verbInfinitiveEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            playInfinitiveAudio();
        }
    });

    // Make conjugated verb tappable for audio (keyboard and click)
    function playConjugatedAudio() {
        if (shouldSuppressTapAudio()) return;
        if (currentCard && currentCard.pronoun && currentCard.conjugated) {
            let audioText = window.handleLanguageSpecificLastChange(currentCard.pronoun, currentCard.conjugated);
            maybeWhisperHuhBefore(audioText, conjugationAudioId(currentCard.verb.infinitive, currentCard.tense, currentCard.pronounKey || currentCard.pronoun));
            
        } else if (currentCard && currentCard.conjugated) {
            playAudioTarget(null, currentCard.conjugated);
        }
    }
    conjugatedVerbEl.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        playConjugatedAudio();
    });
    conjugatedVerbEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            playConjugatedAudio();
        }
    });

    goToVerbBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (currentCard) {
            showVerbDetail(currentCard.verb.infinitive, currentCard.tense);
        }
    });

    if (packagedTtsEnabledToggle) {
        packagedTtsEnabledToggle.addEventListener('change', async () => {
            if (!PACKAGED_TTS) return;
            PACKAGED_TTS.setEnabled(packagedTtsEnabledToggle.checked);
            if (window.appLog) {
                window.appLog(`packed-tts toggle enabled=${packagedTtsEnabledToggle.checked ? 'true' : 'false'}`);
            }
            await refreshPackagedTtsUi();
        });
    }

    if (packagedTtsDownloadTop20Btn) {
        packagedTtsDownloadTop20Btn.addEventListener('click', () => {
            if (!PACKAGED_TTS) return;
            PACKAGED_TTS.setEnabled(true);
            void runPackagedTtsJob('Downloading packaged French audio for the top 20...', async () => {
                await PACKAGED_TTS.prefetchTop20(({ completed, total }) => {
                    setPackagedTtsStatus(`Downloading packaged French audio... ${completed}/${total} packs`);
                });
            });
        });
    }

    if (packagedTtsDownloadTop100Btn) {
        packagedTtsDownloadTop100Btn.addEventListener('click', () => {
            if (!PACKAGED_TTS) return;
            PACKAGED_TTS.setEnabled(true);
            void runPackagedTtsJob('Downloading packaged French audio for the top 100...', async () => {
                await PACKAGED_TTS.downloadTier('top100', ({ completed, total }) => {
                    setPackagedTtsStatus(`Downloading packaged French audio... ${completed}/${total} packs`);
                });
            });
        });
    }

    if (packagedTtsDownloadTop500Btn) {
        packagedTtsDownloadTop500Btn.addEventListener('click', () => {
            if (!PACKAGED_TTS) return;
            if (!window.confirm('Download packaged French audio through the top 500 verbs?')) return;
            PACKAGED_TTS.setEnabled(true);
            void runPackagedTtsJob('Downloading packaged French audio for the top 500...', async () => {
                await PACKAGED_TTS.downloadTier('top500', ({ completed, total }) => {
                    setPackagedTtsStatus(`Downloading packaged French audio... ${completed}/${total} packs`);
                });
            });
        });
    }

    if (packagedTtsDownloadTop1000Btn) {
        packagedTtsDownloadTop1000Btn.addEventListener('click', () => {
            if (!PACKAGED_TTS) return;
            if (!window.confirm('Download packaged French audio through the top 1000 verbs?')) return;
            PACKAGED_TTS.setEnabled(true);
            void runPackagedTtsJob('Downloading packaged French audio for the top 1000...', async () => {
                await PACKAGED_TTS.downloadTier('top1000', ({ completed, total }) => {
                    setPackagedTtsStatus(`Downloading packaged French audio... ${completed}/${total} packs`);
                });
            });
        });
    }

    if (packagedTtsDownloadRareBtn) {
        packagedTtsDownloadRareBtn.addEventListener('click', () => {
            if (!PACKAGED_TTS) return;
            if (!window.confirm('Download packaged French audio for the rare-verb set?')) return;
            PACKAGED_TTS.setEnabled(true);
            void runPackagedTtsJob('Downloading packaged French audio for rare verbs...', async () => {
                await PACKAGED_TTS.downloadTier('rare', ({ completed, total }) => {
                    setPackagedTtsStatus(`Downloading packaged French audio... ${completed}/${total} packs`);
                });
            });
        });
    }

    if (packagedTtsDownloadFullBtn) {
        packagedTtsDownloadFullBtn.addEventListener('click', () => {
            if (!PACKAGED_TTS) return;
            if (!window.confirm('This may download a sizable French audio set for offline playback. Continue?')) return;
            PACKAGED_TTS.setEnabled(true);
            void runPackagedTtsJob('Downloading the full packaged French audio set...', async () => {
                await PACKAGED_TTS.downloadAllAudio(({ completed, total }) => {
                    setPackagedTtsStatus(`Downloading packaged French audio... ${completed}/${total} packs`);
                });
            });
        });
    }

    if (packagedTtsRemoveBtn) {
        packagedTtsRemoveBtn.addEventListener('click', () => {
            if (!PACKAGED_TTS) return;
            if (!window.confirm('Remove all downloaded packaged French audio from this device?')) return;
            void runPackagedTtsJob('Removing packaged French audio...', async () => {
                await PACKAGED_TTS.removeAllAudio();
            });
        });
    }

    verbPhraseEl.addEventListener('click', (e) => {
        if (e.target.classList.contains('tappable-audio') && e.target.textContent) {
            e.stopPropagation();
            e.preventDefault();
            playAudioElement(e.target, { withHuh: true });
        }
    });

    questionPhraseEl.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        if (e.target.classList.contains('tappable-audio') && e.target.textContent) {
            playAudioElement(e.target);
        }
    });

    if (usageNuggetEl) {
        usageNuggetEl.addEventListener('pointerdown', (e) => {
            scheduleLongPressCopy(e.target);
        });
        ['pointerup', 'pointercancel', 'pointerleave'].forEach((eventName) => {
            usageNuggetEl.addEventListener(eventName, clearLongPressCopy);
        });
        usageNuggetEl.addEventListener('click', (e) => {
            const audioTarget = e.target instanceof Element
                ? e.target.closest('.tappable-audio')
                : null;

            if (audioTarget && (audioTarget.dataset.speak || audioTarget.dataset.audioId)) {
                e.stopPropagation();
                e.preventDefault();
                if (!shouldSuppressTapAudio()) {
                    playAudioTarget(audioTarget.dataset.audioId || null, audioTarget.dataset.speak);
                }
                return;
            }

            e.stopPropagation();
            e.preventDefault();
            if (isAnswerVisible) {
                handleNext();
            }
        });
    }

    // View Toggling
    explorerToggleBtn.addEventListener('click', showExplorerList);
    optionsToggleBtn.addEventListener('click', showOptions);
    if (contextAudioBtn) {
        if (!FRENCH_FLASHCARD_FEATURES.contextualSpeakerButton) {
            contextAudioBtn.style.display = 'none';
        }
        contextAudioBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            playContextAudioHint();
        });
    }
    if (usageVisibilityBtn) {
        usageVisibilityBtn.style.display = 'none';
        usageVisibilityBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            cardGenerationOptions.showUsageNugget = !cardGenerationOptions.showUsageNugget;
            saveOptions();
            syncUsageNuggetVisibility();
        });
    }
    // These buttons should now act like the browser's back button
    backToFlashcardBtn.addEventListener('click', () => window.history.back());
    backToFlashcardFromOptionsBtn.addEventListener('click', () => window.history.back());
    backToListBtn.addEventListener('click', () => window.history.back());
    // Mnemonics back button
    const backToOptionsBtn = document.getElementById('back-to-options-btn');
    if (backToOptionsBtn) {
        backToOptionsBtn.addEventListener('click', () => window.history.back());
    }

    // Event listener for browser's back/forward buttons
    window.addEventListener('popstate', (event) => {
        if (event.state && event.state.view) {
            showView(event.state.view, false); // false to prevent re-pushing state
        } else {
            showView('flashcard-view', false); // Default to flashcard view
        }
    });

    // Info Panel Logic
    function setupInfoPanel() {
        const infoBtn = document.getElementById('info-btn');
        const infoPanel = document.getElementById('info-panel');
        if (infoBtn && infoPanel) {
            infoBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                infoPanel.classList.toggle('hidden');
            });
            document.addEventListener('click', (e) => {
                if (!infoPanel.classList.contains('hidden') && !infoPanel.contains(e.target) && e.target !== infoBtn) {
                    infoPanel.classList.add('hidden');
                }
            });
        }
    }
    setupInfoPanel();

    // Options controls (hierarchicalToggle listener now lives in populateOptions dynamic row)
    if (showPhrasesToggle) showPhrasesToggle.addEventListener('change', (e) => {
        cardGenerationOptions.showPhrases = e.target.checked;
        saveOptions();
    });
    const balancedPronounsToggle = document.getElementById('balanced-pronouns-toggle');
    if (balancedPronounsToggle) balancedPronounsToggle.addEventListener('change', (e) => {
        cardGenerationOptions.balancedPronouns = e.target.checked;
        saveOptions();
    });
    if (verbsWithSentencesToggle) verbsWithSentencesToggle.addEventListener('change', (e) => {
        cardGenerationOptions.verbsWithSentencesOnly = ENABLE_LEGACY_SENTENCE_DATA && e.target.checked;
        e.target.checked = cardGenerationOptions.verbsWithSentencesOnly;
        saveOptions();
        // Generate a new card immediately to reflect the filter change
        if (cardGenerationOptions.verbsWithSentencesOnly) {
            // When enabling the filter, get a new card that should have gap sentences
            hideAnswer();
            setTimeout(() => {
                nextCard();
            }, 300);
        }
        // Update the options filters count label if visible
        updateVerbFiltersCountLabel();
    });

    // --- Correct Dictation Next Question Toggle Logic ---
    const correctDictationToggle = document.getElementById('correct-dictation-toggle');
    if (correctDictationToggle) {
        // Set initial state from localStorage
        const enabled = localStorage.getItem('correct-dictation-next-question') === 'true';
        correctDictationToggle.checked = enabled;
        correctDictationToggle.addEventListener('change', function() {
            localStorage.setItem('correct-dictation-next-question', correctDictationToggle.checked ? 'true' : 'false');
            activePreset = "Custom";
            highlightActivePreset();

        });
    }

    // Explorer Search and Audio
    searchBar.addEventListener('input', (e) => populateExplorerList(e.target.value));
    
    verbListContainer.addEventListener('click', (e) => {
        const targetItem = e.target.closest('.verb-list-item');
        if (targetItem) {
            if (e.target.matches('.audio-btn')) {
                e.stopPropagation();
                playAudioTarget(e.target.dataset.audioId || null, e.target.dataset.speak);
            } else {
                showVerbDetail(targetItem.dataset.infinitive);
            }
        }
    });

    verbDetailContainer.addEventListener('click', (e) => {
        if (e.target.matches('.tappable-audio') && (e.target.dataset.speak || e.target.dataset.audioId)) {
            e.stopPropagation();
            playAudioTarget(e.target.dataset.audioId || null, e.target.dataset.speak);
        }
    });

    // --- AUTOSAY READY MODAL LOGIC ---
    const autosayToggleBtn = document.getElementById('autosay-toggle-btn');
    // --- AUTOSAY TOGGLE BUTTON LOGIC ---
    if (autosayToggleBtn) {
        autosayToggleBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            const emojiSpan = autosayToggleBtn.querySelector('span');
            const autosayOn = localStorage.getItem('autosay-enabled') === 'true';
            if (autosayOn) {
                localStorage.setItem('autosay-enabled', 'false');
                if (emojiSpan) emojiSpan.textContent = '🔇';
                autosayToggleBtn.setAttribute('aria-pressed', 'false');
                autosayToggleBtn.classList.remove('autosay-on');
                autosayToggleBtn.classList.add('autosay-off');
            } else {
                localStorage.setItem('autosay-enabled', 'true');
                if (emojiSpan) emojiSpan.textContent = '🔊';
                autosayToggleBtn.setAttribute('aria-pressed', 'true');
                autosayToggleBtn.classList.remove('autosay-off');
                autosayToggleBtn.classList.add('autosay-on');
            }
        });
        // Set initial state on load
        const emojiSpan = autosayToggleBtn.querySelector('span');
        const autosayOn = localStorage.getItem('autosay-enabled') === 'true';
        if (emojiSpan) emojiSpan.textContent = autosayOn ? '🔊' : '🔇';
        autosayToggleBtn.setAttribute('aria-pressed', autosayOn ? 'true' : 'false');
        autosayToggleBtn.classList.toggle('autosay-on', autosayOn);
        autosayToggleBtn.classList.toggle('autosay-off', !autosayOn);
    }
    const autosayReadyModal = document.getElementById('autosay-ready-modal');
    const autosayReadyContinueBtn = document.getElementById('autosay-ready-continue-btn');
    let firstCardReady = false;

    function showAutosayReadyModalIfNeeded(startAppCallback) {
      const autosayOn = localStorage.getItem('autosay-enabled') === 'true';
      if (autosayOn && autosayReadyModal) {
        autosayReadyModal.style.display = 'flex';
        // Remove any previous listeners
        autosayReadyModal.onclick = function() {
          autosayReadyModal.style.display = 'none';
          firstCardReady = true;
          startAppCallback();
        };
        // Optionally, focus the button for accessibility
        if (autosayReadyContinueBtn) autosayReadyContinueBtn.focus();
      } else {
        firstCardReady = true;
        startAppCallback();
      }
    }

    // // --- AUTOSAY READY MODAL LOGIC ---
    // const autosayToggleBtn = document.getElementById('autosay-toggle-btn');
    // // --- AUTOSAY TOGGLE BUTTON LOGIC ---
    // if (autosayToggleBtn) {
    //     autosayToggleBtn.addEventListener('click', function(e) {
    //         e.stopPropagation();
    //         const emojiSpan = autosayToggleBtn.querySelector('span');
    //         const autosayOn = localStorage.getItem('autosay-enabled') === 'true';
    //         if (autosayOn) {
    //             localStorage.setItem('autosay-enabled', 'false');
    //             if (emojiSpan) emojiSpan.textContent = '🔇';
    //             autosayToggleBtn.setAttribute('aria-pressed', 'false');
    //             autosayToggleBtn.classList.remove('autosay-on');
    //             autosayToggleBtn.classList.add('autosay-off');
    //         } else {
    //             localStorage.setItem('autosay-enabled', 'true');
    //             if (emojiSpan) emojiSpan.textContent = '🔊';
    //             autosayToggleBtn.setAttribute('aria-pressed', 'true');
    //             autosayToggleBtn.classList.remove('autosay-off');
    //             autosayToggleBtn.classList.add('autosay-on');
    //         }
    //     });
    //     // Set initial state on load
    //     const emojiSpan = autosayToggleBtn.querySelector('span');
    //     const autosayOn = localStorage.getItem('autosay-enabled') === 'true';
    //     if (emojiSpan) emojiSpan.textContent = autosayOn ? '🔊' : '🔇';
    //     autosayToggleBtn.setAttribute('aria-pressed', autosayOn ? 'true' : 'false');
    //     autosayToggleBtn.classList.toggle('autosay-on', autosayOn);
    //     autosayToggleBtn.classList.toggle('autosay-off', !autosayOn);
    // }
    // const autosayReadyModal = document.getElementById('autosay-ready-modal');
    // const autosayReadyContinueBtn = document.getElementById('autosay-ready-continue-btn');
    // let firstCardReady = false;

    // function showAutosayReadyModalIfNeeded(startAppCallback) {
    //   const autosayOn = localStorage.getItem('autosay-enabled') === 'true';
    //   if (autosayOn && autosayReadyModal) {
    //     autosayReadyModal.style.display = 'flex';
    //     // Remove any previous listeners
    //     autosayReadyModal.onclick = function() {
    //       autosayReadyModal.style.display = 'none';
    //       firstCardReady = true;
    //       startAppCallback();
    //     };
    //     // Optionally, focus the button for accessibility
    //     if (autosayReadyContinueBtn) autosayReadyContinueBtn.focus();
    //   } else {
    //     firstCardReady = true;
    //     startAppCallback();
    //   }
    // }

    // --- Initial Load ---
    const initializeApp = () => {
        loadOptions();
        populateOptions();
        refreshContextAudioButton();
        
        // Check for URL parameters for initial card - but only if no seed is present
        const urlParams = new URLSearchParams(window.location.search);
        const hasSeed = urlParams.get('seed');
        
        if (!hasSeed) {
            const params = parseHashParams();
            if (params.pronoun && params.verb && params.tense) {
                const customCard = generateCardFromParams(params.pronoun, params.verb, params.tense);
                if (customCard) {
                    history.push(customCard);
                    historyIndex = history.length - 1;
                    displayCard(customCard);
                    backBtn.disabled = historyIndex === 0;
                } else {
                    nextCard(); // Fall back to random card if params are invalid
                }
            } else {
                nextCard(); // Normal random card
            }
        } else {
            // Seed is present, ignore hash params and use seeded random
            nextCard();
        }
        
        backBtn.disabled = true;
        populateExplorerList();

        // Set initial state without adding to history, then replace it
        // to have a state for the initial page.
        showView('flashcard-view', false);
        // Don't overwrite hash if we have card parameters
        const currentHash = window.location.hash;
        if (!currentHash.includes('pronoun=') || !currentHash.includes('verb=') || !currentHash.includes('tense=')) {
            window.history.replaceState({ view: 'flashcard-view' }, '', '#flashcard-view');
        }
    };

    // Expose showView globally for inline script
    window.showView = showView;

    // Patch initializeApp to wait for ready modal if needed
    const originalInitializeApp = initializeApp;
    window.initializeApp = function() {
      showAutosayReadyModalIfNeeded(function() {
        if (typeof originalInitializeApp === 'function') originalInitializeApp();
      });
    };

    // Patch displayCard to not play prompt until ready
    const originalDisplayCard = window.displayCard || displayCard;
    window.displayCard = function(card) {
      if (!firstCardReady) return; // Don't show/play until ready
      originalDisplayCard(card);
    };

    // Use generic UIStrings for overlays and UI
    function showDictationOverlay(text, type = 'prompt', duration = 1800, isHtml = false, allowTimeout = true) {
        if (isHtml) {
            dictationResultEl.innerHTML = text;
        } else {
            dictationResultEl.textContent = text;
        }
        dictationResultEl.style.display = 'block';
        dictationResultEl.style.opacity = '1'; // Ensure visible every time
        dictationResultEl.className = 'dictation-result ' + (type || 'prompt');
        clearTimeout(dictationTimeout);
        if (allowTimeout) {
            dictationTimeout = setTimeout(hideDictationOverlay, duration);
        }
    }
    function hideDictationOverlay() {
        dictationResultEl.style.opacity = '0';
        setTimeout(() => {
            dictationResultEl.style.display = 'none';
        }, 500);
    }

    // --- Tips Button Logic ---
    const tipsBtn = document.getElementById('tips-btn');
    if (tipsBtn && flashcard) {
        tipsBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            // Show all tip-labels inside the flashcard
            flashcard.querySelectorAll('.tip-label').forEach(span => {
                span.hidden = false;
                span.classList.add('show');
            });
            // Hide them again after 3 seconds
            setTimeout(() => {
                flashcard.querySelectorAll('.tip-label').forEach(span => {
                    span.hidden = true;
                    span.classList.remove('show');
                });
            }, 3000);
        });
    }

    // --- URL Parameter Support ---
    const parseHashParams = () => {
        const hash = window.location.hash.substring(1); // Remove the # symbol
        const params = {};
        if (hash) {
            hash.split('&').forEach(param => {
                const [key, value] = param.split('=');
                if (key && value) {
                    params[decodeURIComponent(key)] = decodeURIComponent(value);
                }
            });
        }
        return params;
    };

    const generateCardFromParams = (pronoun, verb, tense) => {
        // Validate tense exists
        if (!tenses[tense]) {
            console.warn(`Invalid tense: ${tense}`);
            return null;
        }

        // Find verb info
        const verbInfo = uniqueVerbs.find(v => v.infinitive === verb);
        if (!verbInfo) {
            console.warn(`Verb not found: ${verb}`);
            return null;
        }

        // Check if conjugation exists for this verb/tense/pronoun
        const tenseData = tenses[tense];
        const conjugations = tenseData && tenseData[verb];
        if (!conjugations) {
            console.warn(`No conjugations found for ${verb} ${tense}`);
            return null;
        }

        // Handle pronoun mapping - find the correct pronoun key in the data
        let actualPronounKey = pronoun;
        
        // If direct match doesn't exist, try to find the combined form
        if (!conjugations[pronoun]) {
            // Map individual pronouns to their combined forms in the data
            const pronounMapping = {
                'il': 'il/elle/on',
                'elle': 'il/elle/on', 
                'on': 'il/elle/on',
                'ils': 'ils/elles',
                'elles': 'ils/elles'
            };
            
            if (pronounMapping[pronoun]) {
                actualPronounKey = pronounMapping[pronoun];
            }
        }
        
        // Check if we have the conjugation
        if (!conjugations[actualPronounKey]) {
            console.warn(`No conjugation found for ${pronoun} (tried ${actualPronounKey}) ${verb} ${tense}`);
            return null;
        }

        // Create the card with the original pronoun for display, but use the actual key for conjugation
        return {
            verb: verbInfo,
            tense: tense,
            pronoun: pronoun, // Keep the original pronoun for display
            pronounKey: actualPronounKey, // Store the actual key used for lookup
            conjugated: conjugations[actualPronounKey]
        };
    };

    // --- Initial Card Loading ---
    const loadCardFromHash = () => {
        const params = parseHashParams();
        if (params.pronoun && params.verb && params.tense) {
            const card = generateCardFromParams(params.pronoun, params.verb, params.tense);
            if (card) {
                // Directly display the card without going through history
                displayCard(card);
                history = [card]; // Reset history to just this card
                historyIndex = 0;
                backBtn.disabled = true;
                return;
            }
        }
        // If no valid card found, fall back to regular card generation
        const newCard = generateNewCard(cardGenerationOptions);
        if (newCard) {
            history.push(newCard);
            historyIndex = history.length - 1;
            displayCard(newCard);
            backBtn.disabled = historyIndex === 0;
        }
    };

    // Call the patched initializeApp
    window.initializeApp();
    void refreshPackagedTtsUi();

    // Hide loading screen once app is ready
    const loader = document.getElementById('app-loader');
    if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => { if (loader.parentNode) loader.parentNode.removeChild(loader); }, 380);
    }
    if (window.appLog) window.appLog('app-ready');
    // Load card from URL hash on initial load
    loadCardFromHash();

    // --- General Event Handler for Tappable Audio Elements ---
    // Handle clicks on tappable-audio elements with data-speak attribute (in detail view)
    document.addEventListener('click', (e) => {
        if (e.target.matches('.tappable-audio') && (e.target.dataset.speak || e.target.dataset.audioId)) {
            e.stopPropagation(); // Keep this to prevent bubbling
            if (shouldSuppressTapAudio()) return;
            playAudioTarget(e.target.dataset.audioId || null, e.target.dataset.speak);
        }
    });

    if (FRENCH_FLASHCARD_FEATURES.longPressCopyOnPlayableText) {
        document.addEventListener('pointerdown', (e) => {
            scheduleLongPressCopy(e.target);
        });
        ['pointerup', 'pointercancel', 'pointerleave'].forEach((eventName) => {
            document.addEventListener(eventName, clearLongPressCopy);
        });
        document.addEventListener('contextmenu', (e) => {
            if (e.target instanceof Element && e.target.closest('.tappable-audio')) {
                e.preventDefault();
            }
        });
    }

    // --- Contact Modal ---
    const contactBtn = document.getElementById('contact-btn');
    const contactModal = document.getElementById('contact-modal');
    let selectedType = null;

    // Open modal
    contactBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        contactModal.style.display = 'flex';
        selectedType = null;
        document.querySelectorAll('.report-btn').forEach(btn => btn.style.borderColor = '#e9ecef');
        document.getElementById('contact-msg').value = '';
    });

    // Close modal
    function closeModal() {
        contactModal.style.display = 'none';
    }
    document.getElementById('contact-close')?.addEventListener('click', closeModal);
    document.getElementById('contact-cancel')?.addEventListener('click', closeModal);
    contactModal?.addEventListener('click', (e) => e.target === contactModal && closeModal());
    document.addEventListener('keydown', (e) => e.key === 'Escape' && contactModal.style.display === 'flex' && closeModal());

    // Select report type
    document.querySelectorAll('.report-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.report-btn').forEach(b => b.style.borderColor = '#e9ecef');
            btn.style.borderColor = '#3498db';
            selectedType = btn.dataset.type;
        });
    });

    // Send report
    document.getElementById('contact-send')?.addEventListener('click', () => {
        if (!selectedType) return alert('Please select a report type first.');
        
        const types = {wrong: 'This is wrong', sentence: 'Weird sentence', translation: 'Bad translation', custom: 'Custom message'};
        const verb = currentCard?.verb?.infinitive || 'N/A';
        const tense = currentCard?.tense || 'N/A';
        const pronoun = currentCard?.pronoun || 'N/A';
        const sentence = currentCard?.chosenPhrase?.sentence || 'N/A';
        const msg = document.getElementById('contact-msg').value.trim();
        const subject = `Les Verbes Report: ${types[selectedType]}`;
        let text = `Les Verbes Report: ${types[selectedType]}\n\nContext:\n• Verb: ${verb}\n• Tense: ${tense}\n• Pronoun: ${pronoun}\n• Sentence: ${sentence}`;
        let body = `Context:\n• Verb: ${verb}\n• Tense: ${tense}\n• Pronoun: ${pronoun}\n• Sentence: ${sentence}`;
        if (msg) text += `\n\nDetails:\n${msg}`;
        text += '\n\nSent from Les Verbes app';
        
        // UTF-8 to base64 encoding (handles emojis and special characters)
        // const encodedPayload = btoa(unescape(encodeURIComponent(text))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
        // const url = `https://t.me/LesVerbesBot?start=${encodedPayload}`;
        
        // // Try to copy to clipboard silently (no fallback)
        // if (navigator.clipboard) {
        //     navigator.clipboard.writeText(text).catch(() => {});
        // }
        
        // window.open(url, '_blank');
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                         (navigator.maxTouchPoints && navigator.maxTouchPoints > 1 && /MacIntel/.test(navigator.platform));
        
        if (isMobile) {
            // Mobile: Use mailto for better native app integration
            const mailtoUrl = `mailto:franconjugue@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            window.open(mailtoUrl, '_self');
        } else {
            // Desktop: Use Gmail web interface to avoid "find email app" dialogs
            const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=franconjugue@gmail.com&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            window.open(gmailUrl, '_blank');
        }
        closeModal();
    });
    function logSessionEntry(verb, tense, pronoun, eventType = 'next') {
        try {
            const entry = {
                timestamp: Date.now(),
                key: `${verb}__${tense}__${pronoun}`,
                eventType: eventType // 'next' or 'bravo'
            };
            
            // Get existing log or create new array
            let verbLog = JSON.parse(localStorage.getItem('verbLog') || '[]');
            
            // Add new entry
            verbLog.push(entry);
            
            // Keep only the most recent 1000 items
            if (verbLog.length > 1000) {
                verbLog = verbLog.slice(-1000);
            }
            
            // Save back to localStorage
            localStorage.setItem('verbLog', JSON.stringify(verbLog));
            
            // Log to console
            console.log(`📊 Session logged: ${eventType} - ${entry.key} at ${new Date(entry.timestamp).toLocaleTimeString()}`);
            
        } catch (error) {
            console.warn('Failed to log session entry:', error);
        }
}

// ---------- PRESET SYSTEM ----------
const defaultPresets = [
  {
    emoji: "🌱",
    name: "Master the Basics I",
    desc: "Top 50 verbs · présent only",
    config: {
      cardGenerationOptions: {
        tenseWeights: { present: 1, passeCompose: 0, imparfait: 0, futurSimple: 0, conditionnelPresent: 0, subjonctifPresent: 0, plusQueParfait: 0 },
        frequencyWeights: { top20: 3, top50: 1, top100: 0, top500: 0, top1000: 0, rare: 0 },
      },
    },
  },
  {
    emoji: "🌿",
    name: "Master the Basics II",
    desc: "Top 50 verbs · présent + passé composé",
    config: {
      cardGenerationOptions: {
        tenseWeights: { present: 1, passeCompose: 1, imparfait: 0, futurSimple: 0, conditionnelPresent: 0, subjonctifPresent: 0, plusQueParfait: 0 },
        frequencyWeights: { top20: 3, top50: 1, top100: 0, top500: 0, top1000: 0, rare: 0 },
      },
    },
  },
  {
    emoji: "🌳",
    name: "Master the Basics III",
    desc: "Top 50 verbs · futur + conditionnel + subjonctif",
    config: {
      cardGenerationOptions: {
        tenseWeights: { present: 0, passeCompose: 0, imparfait: 0, futurSimple: 1, conditionnelPresent: 1, subjonctifPresent: 1, plusQueParfait: 0 },
        frequencyWeights: { top20: 3, top50: 1, top100: 0, top500: 0, top1000: 0, rare: 0 },
      },
    },
  },
  {
    emoji: "🌍",
    name: "Broaden Horizons",
    desc: "Top 1000 verbs · all tenses",
    config: {
      cardGenerationOptions: {
        tenseWeights: { present: 1, passeCompose: 1, imparfait: 1, futurSimple: 1, conditionnelPresent: 1, subjonctifPresent: 1, plusQueParfait: 1 },
        frequencyWeights: { top20: 1, top50: 1, top100: 2, top500: 2, top1000: 2, rare: 0 },
      },
    },
  },
  {
    emoji: "🧠",
    name: "All Verbs All Tenses",
    desc: "All verbs · all tenses · equal weight",
    config: {
      cardGenerationOptions: {
        tenseWeights: { present: 1, passeCompose: 1, imparfait: 1, futurSimple: 1, conditionnelPresent: 1, subjonctifPresent: 1, plusQueParfait: 1 },
        frequencyWeights: { top20: 1, top50: 1, top100: 1, top500: 1, top1000: 1, rare: 1 },
      },
    },
  },
  {
    emoji: "⚙️",
    name: "Custom",
    desc: "Your current settings",
    config: {} // gets filled from localStorage on load
  }
];

let activePreset = "Custom";
let presets = defaultPresets; // always use hardcoded defaults; only Custom config persists

// Apply a preset (except 👤), update UI but do not overwrite custom config
function applyPreset(preset) {
  const { cardGenerationOptions: cfg } = preset.config;
  if (cfg) {
    if (cfg.tenseWeights) cardGenerationOptions.tenseWeights = { ...cardGenerationOptions.tenseWeights, ...cfg.tenseWeights };
    if (cfg.frequencyWeights) cardGenerationOptions.frequencyWeights = { ...cardGenerationOptions.frequencyWeights, ...cfg.frequencyWeights };
    // Re-render the whole settings UI so pills + step buttons reflect the new values
    if (window._populateOptions) window._populateOptions();
  }
  activePreset = preset.name;
  localStorage.setItem("lastPreset", activePreset);
  highlightActivePreset();
}



// Switch to Custom and save config whenever user changes any setting
function updateCustomPresetFromUI() {
    activePreset = "Custom";
    localStorage.setItem("lastPreset", "Custom");
    highlightActivePreset();
    const custom = presets.find(p => p.name === "Custom");
    if (custom) {
        custom.config.cardGenerationOptions = {
        tenseWeights: { ...cardGenerationOptions.tenseWeights },
        frequencyWeights: { ...cardGenerationOptions.frequencyWeights },
        };
        localStorage.setItem("presets", JSON.stringify(presets));
        activePreset = "Custom";
        localStorage.setItem("lastPreset", activePreset);
        highlightActivePreset();
    }
}

// function applyPreset(preset) {
//   const { weights, dictateToAnswer, balancedRandomizer, frequencyWeights } = preset.config;
  
//   if (weights) {
//     cardGenerationOptions.tenseWeights = weights;
    

//     // Object.entries(weights).forEach(([tense, val]) => {
//     //   const el = document.querySelector(`input[data-tense-weight="${tense}"]`);
//     //   if (el) el.value = val;
//     // });
//   }
//   if(frequencyWeights){
//     cardGenerationOptions.frequencyWeights = weights;
//   }
  

//   if (dictateToAnswer !== undefined) {
//     correctDictationToggle.checked = dictateToAnswer;
//     localStorage.setItem('correct-dictation-next-question', correctDictationToggle.checked ? 'true' : 'false');
//     // const el = document.getElementById("dictate_to_answer");
//     // if (el) el.checked = dictateToAnswer;
//   }

//   if (balancedRandomizer !== undefined) {
//     cardGenerationOptions.hierarchical = balancedRandomizer;
//     hierarchicalToggle.checked = balancedRandomizer;
//     // const el = document.getElementById("balanced_verb_randomizer");
//     // if (el) el.checked = balancedRandomizer;
//   }

//   activePreset = preset.emoji;
//   highlightActivePreset();
  
// }

// function updateCustomPresetFromUI() {
//   const weights = {};
//   document.querySelectorAll("input[data-tense-weight]").forEach(input => {
//     weights[input.dataset.tenseWeight] = parseFloat(input.value || "1");
//   });

//   const dictateToAnswer = document.getElementById("dictate_to_answer")?.checked || false;
//   const balancedRandomizer = document.getElementById("balanced_verb_randomizer")?.checked || false;

//   const custom = presets.find(p => p.emoji === "👤");
//   if (custom) {
//     custom.config = { weights, dictateToAnswer, balancedRandomizer };
//     localStorage.setItem("presets", JSON.stringify(presets));
//     activePreset = "👤";
//     localStorage.setItem("lastPreset", activePreset);
//     highlightActivePreset();
//   }
// }

function renderPresets() {
  const container = document.getElementById("presets-container");
  if (!container) return;
  container.innerHTML = "";
  presets.forEach(preset => {
    const btn = document.createElement("button");
    btn.className = "preset-btn";
    btn.dataset.presetName = preset.name;
    if (preset.name === activePreset) btn.classList.add("active");
    btn.innerHTML = `<span class="preset-icon">${preset.emoji}</span><span class="preset-text"><span class="preset-name">${preset.name}</span><span class="preset-desc">${preset.desc || ''}</span></span>`;
    btn.onclick = () => {
      applyPreset(preset);
      localStorage.setItem("lastPreset", preset.name);
    };
    container.appendChild(btn);
  });
}

function highlightActivePreset() {
  document.querySelectorAll(".preset-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.presetName === activePreset);
  });
  const badge = document.getElementById('preset-badge');
  if (badge) {
    const isCustom = activePreset === 'Custom';
    if (!isCustom && activePreset) {
      const preset = presets.find(p => p.name === activePreset);
      const emoji = preset?.emoji || '📚';
      badge.innerHTML = `<span class="preset-badge-icon">${emoji}</span><span class="preset-badge-name">${activePreset}</span>`;
      badge.style.display = 'inline-flex';
    } else {
      badge.innerHTML = '';
      badge.style.display = 'none';
    }
  }
}

// On load, fill 👤 from localStorage cardGenerationOptions
const storedOptions = JSON.parse(localStorage.getItem("cardGenerationOptions"));
if (storedOptions) {
  const custom = presets.find(p => p.name === "Custom");
  if (custom) {
    custom.config.cardGenerationOptions = {
      tenseWeights: storedOptions.tenseWeights || {},
      frequencyWeights: storedOptions.frequencyWeights || {},
    };
  }
}

function applyConfigToUI(config) {
  if (config.tenseWeights) {
    Object.entries(config.tenseWeights).forEach(([key, value]) => {
      const el = document.querySelector(`#slider-${key}`);
      if (el) {el.value = value;
        const sibling = Array.from(el.parentNode.children).find(
  child => child !== el && child.classList.contains("slider-value")
);

        el.labelText = value;
        sibling.innerText = value;
      }
    });
  }

  if (config.frequencyWeights) {
    Object.entries(config.frequencyWeights).forEach(([key, value]) => {
      const el = document.querySelector(`#slider-${key}`);
      if (el) {el.value = value;
        el.labelText = value;
        const sibling = Array.from(el.parentNode.children).find(
  child => child !== el && child.classList.contains("slider-value")
);

        el.labelText = value;
        sibling.innerText = value;

      }
    });
  }


  // Also apply checkboxes like showPhrases, hierarchical, etc.
  ["hierarchical", "showPhrases", "verbsWithSentencesOnly"].forEach(key => {
    if (key in config) {
      const el = document.querySelector(`input[name="${key}"]`);
      if (el) el.checked = config[key];
    }
  });

    // Update the Verb filters count label if present
    updateVerbFiltersCountLabel();
}


// Load last-used preset on startup; default to "Master the Basics I" on first open
const lastUsed = localStorage.getItem("lastPreset");
if (lastUsed) {
  const found = presets.find(p => p.name === lastUsed || p.emoji === lastUsed);
  if (found) applyPreset(found);
} else {
  // First time ever — start with the most beginner-friendly preset
  const starter = presets.find(p => p.name === "Master the Basics I");
  if (starter) applyPreset(starter);
}

// // Watch setting changes
// document.querySelectorAll("input[data-tense-weight], #dictate_to_answer, #balanced_verb_randomizer").forEach(el =>
//   el.addEventListener("change", updateCustomPresetFromUI)
// );

// // Apply last preset on load
// const last = localStorage.getItem("lastPreset");
// if (last && presets.some(p => p.emoji === last)) {
//   applyPreset(presets.find(p => p.emoji === last));
// } else {
//   applyPreset(presets.find(p => p.emoji === "👤"));
// }
renderPresets();


});
