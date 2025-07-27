// script.js
// Use language-specific helpers from window (French for now)
const pronounEmojiMap = window.frenchPronounEmojiMap;
const tenseKeyToPhraseKey = window.frenchTenseKeyToLabel;
const pronounOrder = window.frenchPronounOrder;
const getPrompt = window.getFrenchPrompt;
const UIStrings = window.frenchUIStrings;
const localStorageKey = window.frenchLocalStorageKey;
const speechLang = window.frenchSpeechLang;

// Feature flag to control gap sentence behavior
const ENABLE_GAP_SENTENCES = false;

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
    return text.replace(/\[VERB\]/g, 'blanc').replace(/\[AUX\]/g, 'blanc').replace(/\[PRONOUN\]/g, 'blanc');
}

document.addEventListener('DOMContentLoaded', () => {
    // --- Dictation (Speech Recognition) ---
    // (Moved to after DOM element assignments)
    // --- Phrasebook Creation ---
    // This processes the raw sentences into a fast-lookup structure.
    // It maps verb -> tense -> sentence.
    const phrasebook = {};
    if (typeof sentences !== 'undefined') {
        for (const item of sentences) {
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

    // Maps tense keys from `verbs.full.js` to the keys in `sentences.jsonl`
    const tenseKeyToPhraseKey = {
        'present': 'présent',
        'passeCompose': 'passé composé',
        'imparfait': 'imparfait',
        'futurSimple': 'futur simple',
        'plusQueParfait': 'plus-que-parfait',
        'subjonctifPresent': 'subjonctif présent',
        'conditionnelPresent': 'conditionnel présent'
    };

    // --- Data Sorting and Deduplication ---
    // Create a unique list of verbs, keeping the first entry found for each infinitive.
    // This makes the app resilient to duplicate entries in the data files.
    const uniqueVerbs = Array.from(new Map(verbs.map(v => [v.infinitive, v])).values());

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

    const flashcardView = document.getElementById('flashcard-view'); // Main flashcard view
    const explorerListView = document.getElementById('explorer-list-view');
    const explorerDetailView = document.getElementById('explorer-detail-view');
    const optionsView = document.getElementById('options-view'); // The new options view
    
    const flashcard = document.getElementById('flashcard');
    const verbInfinitiveEl = document.getElementById('verb-infinitive');
    const verbTranslationEl = document.getElementById('verb-translation');
    const verbPronounEl = document.getElementById('verb-pronoun');
    const verbTenseEl = document.getElementById('verb-tense');
    const verbFrequencyEl = document.getElementById('verb-frequency');
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
    
    const backBtn = document.getElementById('back-btn');
    const nextBtn = document.getElementById('next-btn');
    const explorerToggleBtn = document.getElementById('explorer-toggle-btn');
    const optionsToggleBtn = document.getElementById('options-toggle-btn'); // Gear icon button
    const backToFlashcardBtn = document.getElementById('back-to-flashcard-btn');
    const backToListBtn = document.getElementById('back-to-list-btn');
    const backToFlashcardFromOptionsBtn = document.getElementById('back-to-flashcard-from-options-btn'); // Back button in options

    const searchBar = document.getElementById('search-bar');
    const verbListContainer = document.getElementById('verb-list-container');
    const verbDetailContainer = document.getElementById('verb-detail-container');

    const infoBtn = document.getElementById('info-btn');
    const infoPanel = document.getElementById('info-panel');

    // --- Dictation (Speech Recognition) ---
    const dictateBtn = document.getElementById('dictate-btn');
    let recognition = null;
    let isDictating = false;
    let dictationResultEl = null;
    let dictationTimeout = null;

    // Overlay helpers (already defined above)
    // function showDictationOverlay(...) {...}
    // function hideDictationOverlay() {...}

    function setupDictation() {
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
                dictateBtn.textContent = '🛑';
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
                    dictateBtn.textContent = '🛑';
                    dictationResultEl.textContent = '';
                    dictationResultEl.style.display = 'block';
                    showDictationOverlay('Parlez maintenant...', 'prompt', 0, false, false);
                };
                recognition.onend = () => {
                    isDictating = false;
                    dictateBtn.textContent = '🎤';
                    clearTimeout(dictationTimeout);
                    if (!dictationResultEl.textContent || dictationResultEl.textContent.includes('Parlez maintenant')) {
                        showDictationOverlay(UIStrings.noSpeech, 'prompt', 1800, false, true);
                    } else {
                        showDictationOverlay(dictationResultEl.innerHTML, 'normal', 4000, true, true);
                    }
                };
                recognition.onerror = (event) => {
                    isDictating = false;
                    dictateBtn.textContent = '🎤';
                    clearTimeout(dictationTimeout);
                    showDictationOverlay(`${UIStrings.error}: ${event.error || UIStrings.unknown}`, 'error', 2200, false, true);
                };
                recognition.onresult = (event) => {
                    let html = '';
                    let bestTranscript = '';
                    let bestConfidence = 0;
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
                        let expected = window.handleLanguageSpecificLastChange(currentCard.pronoun, currentCard.conjugated).trim();
                        const normalize = s => s.toLowerCase().replace(/[’']/g, "'").normalize('NFD').replace(/\p{Diacritic}/gu, '');
                        const normExpected = normalize(expected);
                        const normTranscript = normalize(bestTranscript);
                        if (normTranscript.includes(normExpected)) {
                            autoskipLock = true;
                            // Always show Bravo for correct answers
                            dictationResultEl.innerHTML = html + `<div style=\"opacity:1;font-weight:700;color:#27ae60;margin-top:0.5em;\">🎉 Bravo !</div>`;
                            dictationResultEl.style.display = 'block';
                            dictationResultEl.style.opacity = '1';
                            showAnswer();


                            // Log bravo event
                            logSessionEntry(currentCard.verb.infinitive, currentCard.tense, currentCard.pronoun, 'bravo');
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
                        let expected = window.handleLanguageSpecificLastChange(currentCard.pronoun, currentCard.conjugated).trim();
                        const normalize = s => s.toLowerCase().replace(/[’']/g, "'").normalize('NFD').replace(/\p{Diacritic}/gu, '');
                        const normExpected = normalize(expected);
                        const normTranscript = normalize(bestTranscript);
                        if (normTranscript.includes(normExpected)) {
                            autoskipLock = true;
                            dictationResultEl.innerHTML = html + `<div style=\"opacity:1;font-weight:700;color:#27ae60;margin-top:0.5em;\">🎉 Bravo !</div>`;
                            dictationResultEl.style.display = 'block';
                            dictationResultEl.style.opacity = '1';
                            showAnswer();

                            // Log bravo event
                            logSessionEntry(currentCard.verb.infinitive, currentCard.tense, currentCard.pronoun, 'bravo');
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
    // Start with a weight of 1 for all frequencies found in the data
    const frequencyWeights = {};
    allFrequencies.forEach(freq => {
        frequencyWeights[freq] = 1; // Default all frequencies to equal weight
    });

    const cardGenerationOptions = {
        hierarchical: true, // When true, pick frequency group first, then verb.
        showPhrases: true,
        verbsWithSentencesOnly: false, // When true, only show verbs that have sentences
        tenseWeights,
        frequencyWeights,
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
                    cardGenerationOptions.verbsWithSentencesOnly = savedOptions.verbsWithSentencesOnly;
                }

                // Update weights by merging into the existing objects
                if (savedOptions.tenseWeights) { Object.assign(tenseWeights, savedOptions.tenseWeights); }
                if (savedOptions.frequencyWeights) { Object.assign(frequencyWeights, savedOptions.frequencyWeights); }
            }
        } catch (e) {
            console.warn("Could not load options from localStorage:", e);
        }
    };
    // --- Audio Synthesis ---
    // Use generic speechLang for speech synthesis, and allow user-selected voice
    const synth = window.speechSynthesis;
    const speak = (text) => {
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

    const performWeightedSelection = (weightedItems) => {
        if (!weightedItems || weightedItems.length === 0) {
            return null;
        }

        const totalWeight = weightedItems.reduce((sum, item) => sum + (item.score || 0), 0);
        if (totalWeight <= 0) {
            // Fallback to uniform random if all weights are zero
            return weightedItems[Math.floor(Math.random() * weightedItems.length)].card;
        }

        let random = Math.random() * totalWeight;

        for (const item of weightedItems) {
            random -= (item.score || 0);
            if (random <= 0) {
                return item.card;
            }
        }

        // Fallback in case of floating point issues
        return weightedItems[weightedItems.length - 1].card;
    };

    const generateNewCard = (options = {}) => {
        const { hierarchical = false, tenseWeights = {}, frequencyWeights = {}, verbsWithSentencesOnly = false } = options;

        // Helper function to check if a verb has sentences with gap sentences for actual practice
        const verbHasSentences = (verbInfinitive) => {
            const verbPhrases = phrasebook[verbInfinitive];
            if (!verbPhrases) return false;
            
            // If verbsWithSentencesOnly is enabled, we want verbs that have gap sentences for interactive practice
            if (verbsWithSentencesOnly) {
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
            // --- Hierarchical Selection ---
            // 1. Select a frequency group based on its weight.
            const weightedFrequencies = Object.entries(frequencyWeights)
                .map(([freq, score]) => ({ card: freq, score: score }))
                .filter(item => item.score > 0);

            if (weightedFrequencies.length === 0) return null;

            const selectedFrequency = performWeightedSelection(weightedFrequencies);
            if (!selectedFrequency) return null;

            // 2. Filter verbs for that frequency group.
            let verbsInFrequency = uniqueVerbs.filter(v => (v.frequency || 'common') === selectedFrequency);
            
            // 2b. If verbsWithSentencesOnly is enabled, filter further
            if (verbsWithSentencesOnly) {
                verbsInFrequency = verbsInFrequency.filter(v => verbHasSentences(v.infinitive));
            }
            
            if (verbsInFrequency.length === 0) return null;

            // 3. Build a deck from this verb group, weighted ONLY by tense.
            const weightedDeck = [];
            for (const tenseName in tenses) {
                const tenseWeight = tenseWeights[tenseName] || 0;
                if (tenseWeight === 0) continue;

                for (const verbInfo of verbsInFrequency) {
                    const tenseData = tenses[tenseName];
                    const conjugations = tenseData && tenseData[verbInfo.infinitive];
                    if (conjugations) {
                        // Add ALL available pronouns for this verb/tense to create better variety
                        const availablePronouns = pronouns.filter(p => conjugations[p]);
                        for (const pronounKey of availablePronouns) {
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
            newCard = performWeightedSelection(weightedDeck);

        } else {
            // --- Flat Selection (Non-Hierarchical) ---
            // Build a single deck weighted by both tense and frequency.
            const weightedDeck = [];
            for (const tenseName in tenses) {
                const tenseWeight = tenseWeights[tenseName] || 0;
                if (tenseWeight === 0) continue;

                for (const verbInfo of uniqueVerbs) {
                    // Skip verbs without sentences if filter is enabled
                    if (verbsWithSentencesOnly && !verbHasSentences(verbInfo.infinitive)) {
                        continue;
                    }
                    
                    const freq = verbInfo.frequency || 'common';
                    const freqWeight = frequencyWeights[freq] || 0;
                    const score = tenseWeight * freqWeight;
                    if (score === 0) continue;

                    const tenseData = tenses[tenseName];
                    const conjugations = tenseData && tenseData[verbInfo.infinitive];
                    if (conjugations) {
                        // Add ALL available pronouns for this verb/tense to create better variety
                        const availablePronouns = pronouns.filter(p => conjugations[p]);
                        for (const pronounKey of availablePronouns) {
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
    function maybeWhisperMolodez(){
        console.log("maybeWhisperMolodez called");
        const sfx = document.getElementById("molodez_sound");
        if(Math.random() < 0.1) {
            sfx.play();
        }
        
        // if (Math.random() < 0.5) {
        //     const sfx = document.getElementById("molodez_sound");
        //     sfx.currentTime = 0;
            
        //     sfx.onended = () => speak(whatToSpeakAfter);
        // } else {
        //     speak(whatToSpeakAfter);
        // }
    }

    function maybeWhisperHuhBefore(whatToSpeakAfter) {
        console.log("maybeWhisperHuh called");
        if (Math.random() < 0.03) {
            const sfx = document.getElementById("huh_sound");
            sfx.currentTime = 0;
            sfx.play();
            sfx.onended = () => speak(whatToSpeakAfter);
        } else {
            speak(whatToSpeakAfter);
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

    const displayCard = (card) => {
        currentCard = card;
        
        // Update URL hash with current card parameters
        updateHashParams(card);
        
        const verbFrequency = card.verb.frequency || 'common'; 

        // Set infinitive and translation separately for proper styling
        let translation = card.verb.translation || '';
        if (translation && !/^to\s/i.test(translation)) {
            translation = 'to ' + translation;
        }
        verbInfinitiveEl.textContent = card.verb.infinitive;
        verbInfinitiveEl.classList.add('tappable-audio');
        verbTranslationEl.textContent = translation ? '(' + translation + ')' : '';
        // Set English infinitive/translation
        if (englishVerbInfinitiveEl) englishVerbInfinitiveEl.textContent = translation.replace(/^\(|\)$/g, ''); // Remove parentheses for English display
        if (englishVerbTranslationEl) englishVerbTranslationEl.textContent = ''; // Don't show translation of translation
        // Add emoji to pronoun (language-specific)
        let pronounDisplay = card.pronoun;
        if (pronounDisplay.includes('/')) {
            pronounDisplay = pronounDisplay.split('/').map(p => (pronounEmojiMap[p.trim()] || '') + ' ' + p.trim()).join(' / ');
        } else {
            pronounDisplay = (pronounEmojiMap[pronounDisplay] || '') + ' ' + pronounDisplay;
        }
        verbPronounEl.textContent = pronounDisplay.trim();
        verbTenseEl.textContent = card.tense;
        // Remove any previous tense color classes
        verbTenseEl.className = 'meta-info';
        // Add tense color class if known
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
        verbFrequencyEl.classList.add(verbFrequency.replace(/\s+/g, '-')); // Convert spaces to hyphens for CSS class

        // Handle irregular verb indicator
        const isIrregular = IRREGULAR_VERBS.has(card.verb.infinitive);
        if (isIrregular) {
            verbIrregularEl.style.display = 'block';
        } else {
            verbIrregularEl.style.display = 'none';
        }

        // Show answer as pronoun + conjugated verb, but handle language-specific edge case
        let answerText = window.handleLanguageSpecificLastChange(card.pronoun, card.conjugated);
        conjugatedVerbEl.textContent = answerText;
        conjugatedVerbEl.classList.add('tappable-audio');

        // --- New Phrase Logic ---
        verbPhraseEl.innerHTML = ''; // Clear answer phrase
        questionPhraseEl.innerHTML = ''; // Clear question phrase
        verbPhraseEl.classList.remove('tappable-audio');
        questionPhraseEl.classList.remove('tappable-audio');
        
        // Initially hide question phrase, will show if we have a gap sentence
        questionPhraseEl.style.display = 'none';
        
        // Store chosen phrase data for answer reveal
        currentCard.chosenPhrase = null;
        
        if (cardGenerationOptions.showPhrases) {
            const phraseKey = tenseKeyToPhraseKey[card.tense];
            const verbPhrases = phrasebook[card.verb.infinitive] && phrasebook[card.verb.infinitive][phraseKey];
            let filtered = [];
            let hasExactMatch = false;
            
            if (verbPhrases && verbPhrases.length) {
                // 1. Try exact pronoun match only
                filtered = verbPhrases.filter(p => p.pronoun === card.pronoun);
                hasExactMatch = filtered.length > 0;
                
                // 2. If no exact match, try matching pronoun variants (like ils/elles matching either ils or elles)
                if (!hasExactMatch && card.pronoun.includes('/')) {
                    const pronounVariants = card.pronoun.split('/');
                    filtered = verbPhrases.filter(p => pronounVariants.includes(p.pronoun));
                    hasExactMatch = filtered.length > 0;
                }
                
                // 3. Try reverse matching (sentence has combined form, card has single)
                if (!hasExactMatch) {
                    filtered = verbPhrases.filter(p => {
                        if (p.pronoun.includes('/')) {
                            const sentenceVariants = p.pronoun.split('/');
                            return sentenceVariants.includes(card.pronoun);
                        }
                        return false;
                    });
                    hasExactMatch = filtered.length > 0;
                }
                
                // 4. If still no match, use any phrase for this verb+tense (but no gap sentence)
                if (filtered.length === 0) {
                    filtered = verbPhrases;
                    hasExactMatch = false; // No gap sentence for non-matching pronouns
                }
                
                // 4. Pick random if any
                if (filtered.length > 0) {
                    const chosen = filtered[Math.floor(Math.random() * filtered.length)];
                    currentCard.chosenPhrase = chosen; // Store for answer reveal
                    
                    // If we have an exact match AND a gap sentence, show it in question container
                    if (ENABLE_GAP_SENTENCES && hasExactMatch && chosen.gap_sentence) {
                        const questionPhrase = document.createElement('span');
                        questionPhrase.innerHTML = enhanceGapSentence(chosen.gap_sentence);
                        questionPhrase.classList.add('tappable-audio');
                        questionPhrase.style.cursor = 'pointer';
                        
                        questionPhraseEl.appendChild(questionPhrase);
                        questionPhraseEl.classList.add('tappable-audio');
                        questionPhraseEl.style.display = 'block'; // Show the question phrase
                        
                        console.log('Showing gap sentence in question container:', chosen.gap_sentence);
                        console.log('Question phrase element display:', questionPhraseEl.style.display);
                        console.log('Question phrase element children:', questionPhraseEl.children.length);
                    }
                    
                    // Always prepare the full sentence for the answer container
                    const answerPhrase = document.createElement('span');
                    answerPhrase.textContent = chosen.sentence;
                    answerPhrase.classList.add('tappable-audio');
                    answerPhrase.style.cursor = 'pointer';
                    
                    // Add answer phrase to answer container
                    verbPhraseEl.appendChild(answerPhrase);
                    // Set English phrase
                    if (englishVerbPhraseEl) englishVerbPhraseEl.textContent = chosen.translation ? chosen.translation.replace(/\[PRONOUN\]/g, '').replace(/\s+/g, ' ').trim() : '';
                    
                    // Add English translation if available (directly visible)
                    if (chosen.translation) {
                        const translationDiv = document.createElement('div');
                        // Clean translation by removing [PRONOUN] and other markers
                        const cleanTranslation = chosen.translation
                            .replace(/\[PRONOUN\]/g, '')
                            .replace(/\s+/g, ' ')
                            .trim();
                        translationDiv.innerHTML = `<strong>Traduction:</strong> ${cleanTranslation}`;
                        translationDiv.style.marginTop = '5em';
                        translationDiv.style.fontSize = '0.9em';
                        translationDiv.style.marginBottom = '0.3em';
                        // Better visibility in dark mode
                        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                            translationDiv.style.color = '#f4f7f9';
                            translationDiv.style.opacity = '0.9';
                        } else {
                            translationDiv.style.opacity = '0.8';
                        }
                        verbPhraseEl.appendChild(translationDiv);
                    }
                    
                    // Add source if available (directly visible)
                    if (chosen.source) {
                        const sourceDiv = document.createElement('div');
                        sourceDiv.innerHTML = `<strong>Source:</strong> ${chosen.source}`;
                        sourceDiv.style.marginTop = '0.3em';
                        sourceDiv.style.fontSize = '0.9em';
                        // Better visibility in dark mode
                        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                            sourceDiv.style.color = '#f4f7f9';
                            sourceDiv.style.opacity = '0.9';
                        } else {
                            sourceDiv.style.opacity = '0.8';
                        }
                        verbPhraseEl.appendChild(sourceDiv);
                    }
                    
                    // Don't make the entire phrase container clickable - only the sentence itself is tappable
                    // verbPhraseEl.classList.add('tappable-audio'); // Removed to fix large tap area
                    console.log('Added phrase elements to answer:', {
                        questionHasContent: questionPhraseEl.children.length > 0,
                        answerHasContent: verbPhraseEl.children.length > 0,
                        hasGapSentence: !!chosen.gap_sentence,
                        hasExactMatch: hasExactMatch,
                        pronoun: card.pronoun,
                        chosenPronoun: chosen.pronoun,
                        showingGapSentence: hasExactMatch && !!chosen.gap_sentence,
                        fullSentence: chosen.sentence
                    });
                }
            }
        }

        // --- AUTOTALK: Speak prompt if enabled ---
        const autosayOn = localStorage.getItem('autosay-enabled') === 'true';
        if (autosayOn) {
          const prompt = getFrenchPrompt(card);
          speak(prompt);
        }
    };

    const showAnswer = () => {
        if (!isAnswerVisible) {
            answerContainer.classList.add('is-visible');
            // Hide question phrase when showing answer (now they are siblings)
            questionPhraseEl.style.display = 'none';
            isAnswerVisible = true;
            if (window.incrementDailyCount) window.incrementDailyCount();
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
    };

    // --- Card advance logic ---
    const nextCard = () => {
        autoskipLock = false;
        if (currentCard) {
            logSessionEntry(currentCard.verb.infinitive, currentCard.tense, currentCard.pronoun, 'next');
        }

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
        const normalizedFilter = removeAccents(filter.toLowerCase());
        const filteredVerbs = uniqueVerbs.filter(v => removeAccents(v.infinitive.toLowerCase()).includes(normalizedFilter));
        const groups = groupVerbsByFrequency(filteredVerbs);
        
        // Create labels by capitalizing frequency names
        const freqLabels = {};
        allFrequencies.forEach(freq => {
            freqLabels[freq] = freq.charAt(0).toUpperCase() + freq.slice(1);
        });
        
        // Use the sorted frequency order to display sections
        sortedFrequencies.forEach(freq => {
            if (groups[freq] && groups[freq].length) {
                const section = document.createElement('div');
                section.innerHTML = `<div class="frequency-section-header">${freqLabels[freq]}</div>`;
                groups[freq].forEach(verb => {
                    const item = document.createElement('div');
                    item.className = 'verb-list-item';
                    item.dataset.infinitive = verb.infinitive;
                    item.innerHTML = `
                        <div class="verb-list-item-text">
                            <span class="infinitive">${verb.infinitive}</span>
                            <span class="translation">${verb.translation}</span>
                        </div>
                        <button class="audio-btn" data-speak="${verb.infinitive}">🔊</button>
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
       header.innerHTML = `
            <span class="infinitive tappable-audio" data-speak="${verb.infinitive}">${verb.infinitive}</span>
            <p class="translation">${verb.translation}</p>
        `;
        verbDetailContainer.appendChild(header);

        Object.keys(tenses).forEach(tenseName => {
            const tenseBlock = document.createElement('div');
            tenseBlock.className = 'tense-block';
            tenseBlock.id = `detail-tense-${tenseName}`; // Add ID for focusing

            const tenseHeader = document.createElement('h4');
            tenseHeader.className = 'tense-header tappable-audio';
            tenseHeader.dataset.speak = tenseName;
            tenseHeader.textContent = tenseName;
            tenseBlock.appendChild(tenseHeader);

            const grid = document.createElement('div');
            grid.className = 'conjugation-grid';

            const conjugationsForVerb = tenses[tenseName][verb.infinitive];
            pronouns.forEach(pronoun => {
                const conjugation = conjugationsForVerb[pronoun] || '—'; // Fallback for missing conjugations
                const item = document.createElement('div');
                item.className = 'conjugation-item';
                item.innerHTML = `
                    <span class="pronoun tappable-audio" data-speak="${pronoun}">${pronoun}</span>
                    <span class="conjugation tappable-audio" data-speak="${conjugation}">${conjugation}</span>
                `;
                grid.appendChild(item);
            });
            tenseBlock.appendChild(grid);
            verbDetailContainer.appendChild(tenseBlock);
        });

        // --- All Example Phrases Section ---
        const phrasebookForVerb = phrasebook[verb.infinitive];
        if (phrasebookForVerb) {
            const phrasesSection = document.createElement('section');
            phrasesSection.className = 'all-phrases-section';
            phrasesSection.style.marginTop = '2.5em';
            phrasesSection.innerHTML = `<h3 style="margin-bottom:0.5em;font-size:1.2em;color:#3498db;">Exemples de phrases</h3>`;
            Object.entries(phrasebookForVerb).forEach(([tense, phraseArr]) => {
                if (!Array.isArray(phraseArr) || phraseArr.length === 0) return;
                // Sort phraseArr by pronoun order
                const sortedArr = [...phraseArr].sort((a, b) => {
                    const idxA = pronounOrder.indexOf(a.pronoun);
                    const idxB = pronounOrder.indexOf(b.pronoun);
                    // If not found in order, put at end
                    const finalIdxA = idxA === -1 ? 999 : idxA;
                    const finalIdxB = idxB === -1 ? 999 : idxB;
                    return finalIdxA - finalIdxB;
                });
                const tenseBlock = document.createElement('div');
                tenseBlock.className = 'all-phrases-tense-block';
                tenseBlock.innerHTML = `<div style="font-weight:600;margin-top:1em;">${tense}</div>`;
                sortedArr.forEach(p => {
                    const pEl = document.createElement('div');
                    pEl.className = 'all-phrases-item tappable-audio';
                    pEl.style.margin = '0.2em 0 0.2em 1.2em';
                    pEl.style.fontSize = '1em';
                    pEl.dataset.speak = p.sentence;
                    
                    // Build the HTML with optional translation
                    let html = `<span style='color:#888;'>${p.pronoun}:</span> <span>${p.sentence}</span> <span style='font-size:0.95em;opacity:0.7;cursor:pointer;margin-left:0.4em;'>🔊</span>`;
                    if (p.translation && p.translation.trim()) {
                        html += `<br><span style='color:#666;font-size:0.9em;font-style:italic;margin-left:1.2em;'>${p.translation}</span>`;
                    }
                    
                    pEl.innerHTML = html;
                    pEl.addEventListener('click', function(e) {
                        e.stopPropagation();
                        if (pEl.dataset.speak) speak(pEl.dataset.speak);
                    });
                    tenseBlock.appendChild(pEl);
                });
                // (No global tappable-audio handler here; only phrase items get their own handler)
                phrasesSection.appendChild(tenseBlock);
            });
            verbDetailContainer.appendChild(phrasesSection);
        }

        // After populating, scroll to the focused tense if provided
        highlightAndScrollToTense(tenseToFocus);
    };

    // --- Options UI Logic ---
    const populateOptions = () => {
        // Set initial state of the hierarchical toggle
        hierarchicalToggle.checked = cardGenerationOptions.hierarchical;
        showPhrasesToggle.checked = cardGenerationOptions.showPhrases;
        verbsWithSentencesToggle.checked = cardGenerationOptions.verbsWithSentencesOnly;

        // Helper function to create a slider control for a given weight object
        const createSlider = (key, value, container, weightType) => {
            const sliderGroup = document.createElement('div');
            sliderGroup.className = 'slider-group';

            const label = document.createElement('label');
            label.htmlFor = `slider-${key}`;
            let labelText = key.replace(/([A-Z])/g, ' $1').replace('-', ' ');

            // Add verb count for frequency weights
            if (weightType === 'frequencyWeights') {
                const count = frequencyCounts[key] || 0;
                labelText += ` (${count} verbs)`;
            }
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

            // Update the configuration object and the displayed value when the slider moves
            slider.addEventListener('input', (e) => {
                const newValue = parseInt(e.target.value, 10);
                sliderValue.textContent = newValue;
                cardGenerationOptions[weightType][e.target.dataset.key] = newValue;
                saveOptions();

                
            });

            sliderGroup.appendChild(label);
            sliderGroup.appendChild(slider);
            sliderGroup.appendChild(sliderValue);
            container.appendChild(sliderGroup);
        };

        tenseWeightsContainer.innerHTML = '';
        Object.entries(cardGenerationOptions.tenseWeights).forEach(([tense, weight]) => createSlider(tense, weight, tenseWeightsContainer, 'tenseWeights'));

        frequencyWeightsContainer.innerHTML = '';
        Object.entries(cardGenerationOptions.frequencyWeights).forEach(([freq, weight]) => createSlider(freq, weight, frequencyWeightsContainer, 'frequencyWeights'));
        
    };

    // --- Event Listeners ---
    flashcard.addEventListener('click', () => {
        if (isAnswerVisible) {
            handleNext();
        } else {
            showAnswer();
        }
    });
    nextBtn.addEventListener('click', handleNext);
    backBtn.addEventListener('click', handlePrev);

    infinitiveAudioBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        speak(currentCard.verb.infinitive);
    });

    conjugatedAudioBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (currentCard && currentCard.pronoun && currentCard.conjugated) {
            let audioText = window.handleLanguageSpecificLastChange(currentCard.pronoun, currentCard.conjugated);
            // speak(audioText);
            maybeWhisperHuhBefore(audioText);
        } else if (currentCard && currentCard.conjugated) {
            speak(currentCard.conjugated);
        }
    });

    // Make infinitive tappable for audio (keyboard and click)
    function playInfinitiveAudio() {
        if (currentCard && currentCard.verb.infinitive) {
            speak(currentCard.verb.infinitive);
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
        if (currentCard && currentCard.pronoun && currentCard.conjugated) {
            let audioText = window.handleLanguageSpecificLastChange(currentCard.pronoun, currentCard.conjugated);
            // speak(audioText);
            maybeWhisperHuhBefore(audioText);
            
        } else if (currentCard && currentCard.conjugated) {
            speak(currentCard.conjugated);
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

    verbPhraseEl.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        
        // Only handle clicks on tappable-audio elements, not the container
        if (e.target.classList.contains('tappable-audio') && e.target.textContent) {
            maybeWhisperHuhBefore(e.target.textContent);
            // speak(e.target.textContent);
        }
    });

    questionPhraseEl.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        
        // Only handle clicks on tappable-audio elements, not the container
        if (e.target.classList.contains('tappable-audio') && e.target.textContent) {
            speak(e.target.textContent);
        }
    });

    // View Toggling
    explorerToggleBtn.addEventListener('click', showExplorerList);
    optionsToggleBtn.addEventListener('click', showOptions);
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

    // Options controls
    hierarchicalToggle.addEventListener('change', (e) => {
        cardGenerationOptions.hierarchical = e.target.checked;
        saveOptions();
    });
    showPhrasesToggle.addEventListener('change', (e) => {
        cardGenerationOptions.showPhrases = e.target.checked;
        saveOptions();
    });
    verbsWithSentencesToggle.addEventListener('change', (e) => {
        cardGenerationOptions.verbsWithSentencesOnly = e.target.checked;
        saveOptions();
        // Generate a new card immediately to reflect the filter change
        if (e.target.checked) {
            // When enabling the filter, get a new card that should have gap sentences
            hideAnswer();
            setTimeout(() => {
                nextCard();
            }, 300);
        }
    });

    // --- Correct Dictation Next Question Toggle Logic ---
    const correctDictationToggle = document.getElementById('correct-dictation-toggle');
    if (correctDictationToggle) {
        // Set initial state from localStorage
        const enabled = localStorage.getItem('correct-dictation-next-question') === 'true';
        correctDictationToggle.checked = enabled;
        correctDictationToggle.addEventListener('change', function() {
            localStorage.setItem('correct-dictation-next-question', correctDictationToggle.checked ? 'true' : 'false');
            activePreset = "👤";
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
                speak(e.target.dataset.speak);
            } else {
                showVerbDetail(targetItem.dataset.infinitive);
            }
        }
    });

    verbDetailContainer.addEventListener('click', (e) => {
        if (e.target.matches('.tappable-audio') && e.target.dataset.speak) {
            speak(e.target.dataset.speak);
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

    // Add a per-card autoskip lock
let autoskipLock = false;

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

    const updateHashParams = (card) => {
        const params = new URLSearchParams();
        params.set('pronoun', card.pronoun);
        params.set('verb', card.verb.infinitive);
        params.set('tense', card.tense);
        window.location.hash = params.toString();
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
    // Load card from URL hash on initial load
    loadCardFromHash();

    // --- General Event Handler for Tappable Audio Elements ---
    // Handle clicks on tappable-audio elements with data-speak attribute (in detail view)
    document.addEventListener('click', (e) => {
        if (e.target.matches('.tappable-audio') && e.target.dataset.speak) {
            e.stopPropagation(); // Keep this to prevent bubbling
            speak(e.target.dataset.speak);
        }
    });

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
        const subject = `LesVerbes Report: ${types[selectedType]}`;
        let text = `LesVerbes Report: ${types[selectedType]}\n\nContext:\n• Verb: ${verb}\n• Tense: ${tense}\n• Pronoun: ${pronoun}\n• Sentence: ${sentence}`;
        let body = `Context:\n• Verb: ${verb}\n• Tense: ${tense}\n• Pronoun: ${pronoun}\n• Sentence: ${sentence}`;
        if (msg) text += `\n\nDetails:\n${msg}`;
        text += '\n\nSent from LesVerbes app';
        
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
// 🐣 🐓 🦆 🦜 🦚 🦉
const defaultPresets = [
  {
    emoji: "🐣",
    name: "Drill",
    config: {
      cardGenerationOptions: {
        tenseWeights: { present: 1, passeCompose: 0, imparfait: 0, futurSimple: 0, conditionnelPresent: 0, subjonctifPresent: 0 , plusQueParfait:0},
        frequencyWeights: { "top-20": 4, "top-50": 1, "top-100": 0, "top-500": 0, "top-1000": 0, rare: 0 },
      },
    },
  },
  {
    emoji: "🐓",
    name: "Drill+",
    config: {
      cardGenerationOptions: {
        tenseWeights: { present: 1, passeCompose: 1, imparfait: 0, futurSimple: 0, conditionnelPresent: 0, subjonctifPresent: 0 , plusQueParfait:0},
        frequencyWeights: { "top-20": 1, "top-50": 1, "top-100": 0, "top-500": 0, "top-1000": 0, rare: 0 },
        },
        },
    }
    ,
    {
    emoji: "🦜",
    name: "Know a lot",
    config: {
      cardGenerationOptions: {
        tenseWeights: { present: 1, passeCompose: 1, imparfait: 0, futurSimple: 1, conditionnelPresent: 1, subjonctifPresent: 0 , plusQueParfait:1},
        frequencyWeights: { "top-20": 1, "top-50": 1, "top-100": 1, "top-500": 1, "top-1000": 0, rare: 0 },
        },
        },
    
    },
    {
    emoji: "🦉",
    name: "Knowitall",
    config: {
      cardGenerationOptions: {
        tenseWeights: { present: 1, passeCompose: 1, imparfait: 1, futurSimple: 1, conditionnelPresent: 1, subjonctifPresent: 1 , plusQueParfait:1,},
        frequencyWeights: { "top-20": 1, "top-50": 1, "top-100": 1, "top-500": 3, "top-1000": 4, rare: 4 },
        },
        },
    }
    ,
  {
    emoji: "👤",
    name: "Custom",
    config: {} // gets filled from localStorage on load
  }
];

let activePreset = "👤";
let presets = JSON.parse(localStorage.getItem("presets") || "null") || defaultPresets;

// Apply a preset (except 👤), update UI but do not overwrite custom config
function applyPreset(preset) {
  const { cardGenerationOptions: cfg } = preset.config;
  if (cfg) {
    cardGenerationOptions.tenseWeights = { ...cardGenerationOptions.tenseWeights, ...cfg.tenseWeights };
    cardGenerationOptions.frequencyWeights = { ...cardGenerationOptions.frequencyWeights, ...cfg.frequencyWeights };
    // saveOptions();
    applyConfigToUI(cardGenerationOptions);
  }
  activePreset = preset.emoji;
  localStorage.setItem("lastPreset", activePreset);
  highlightActivePreset();
}



// Save 👤 preset when sliders or toggles change
function updateCustomPresetFromUI() {
    if (activePreset !== "👤") return;
    const custom = presets.find(p => p.emoji === "👤");
    if (custom) {
        custom.config.cardGenerationOptions = {
        tenseWeights: { ...cardGenerationOptions.tenseWeights },
        frequencyWeights: { ...cardGenerationOptions.frequencyWeights },
        };
        localStorage.setItem("presets", JSON.stringify(presets));
        activePreset = "👤";
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
    btn.innerText = preset.emoji;
    if (preset.emoji === activePreset) btn.classList.add("active");
    btn.onclick = () => {
      applyPreset(preset);
      localStorage.setItem("lastPreset", preset.emoji);
    };
    container.appendChild(btn);
  });
}

function highlightActivePreset() {
  document.querySelectorAll(".preset-btn").forEach(btn => {
    btn.classList.toggle("active", btn.innerText === activePreset);
  });
}

// On load, fill 👤 from localStorage cardGenerationOptions
const storedOptions = JSON.parse(localStorage.getItem("cardGenerationOptions"));
if (storedOptions) {
  const custom = presets.find(p => p.emoji === "👤");
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
}


// Load last-used preset or 👤
const lastUsed = localStorage.getItem("lastPreset");
if (lastUsed && presets.find(p => p.emoji === lastUsed)) {
  applyPreset(presets.find(p => p.emoji === lastUsed));
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

