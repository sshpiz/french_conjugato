// script.js
// Use language-specific helpers from window (French for now)
const pronounEmojiMap = window.frenchPronounEmojiMap;
const tenseKeyToPhraseKey = window.frenchTenseKeyToLabel;
const pronounOrder = window.frenchPronounOrder;
const getPrompt = window.getFrenchPrompt;
const UIStrings = window.frenchUIStrings;
const localStorageKey = window.frenchLocalStorageKey;
const speechLang = window.frenchSpeechLang;

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

    // Define the desired order of popularity for sorting the verb list.
    const frequencyOrder = {
        "common": 1,
        "intermediate": 2,
        "rare": 3
    };
    
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
    const answerContainer = document.getElementById('answer-container');
    const conjugatedVerbEl = document.getElementById('conjugated-verb');
    const verbPhraseEl = document.getElementById('verb-phrase');
    const questionPhraseEl = document.getElementById('question-phrase');
    
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
                    // --- AUTOSKIP ON CORRECT DICTATION (CONTAINS) ---
                    const autosayOn = localStorage.getItem('autosay-enabled') === 'true';
                    if (autosayOn && !isAnswerVisible && currentCard && !autoskipLock) {
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
                            setTimeout(() => {
                                if (recognition) {
                                    try { recognition.stop(); } catch (e) {}
                                }
                                handleNext(); // No auto dictation
                            }, 1500); // 1.5s delay for Bravo
                            return;
                        }
                    }
                    // In recognition.onresult, use correctDictationNextQuestion flag for Bravo autoskip
                    const correctDictationNextQuestion = localStorage.getItem('correct-dictation-next-question') === 'true';
                    if (correctDictationNextQuestion && !isAnswerVisible && currentCard && !autoskipLock) {
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
                            setTimeout(() => {
                                if (recognition) {
                                    try { recognition.stop(); } catch (e) {}
                                }
                                handleNext();
                            }, 1500);
                            return;
                        }
                    }
                    // Only update overlay if not autoskipping
                    showDictationOverlay(html, 'normal', 0, true, false);
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

    // Dynamically create frequency weights from the data, defaulting to 1.
    const frequencyWeights = {
        "common": 7,
        "intermediate": 2,
        "rare": 1
    };
    const uniqueFrequencies = [...new Set(uniqueVerbs.map(v => v.frequency || 'common'))];
    uniqueFrequencies.forEach(freq => {
        if (!(freq in frequencyWeights)) {
            frequencyWeights[freq] = 0; // Default other frequencies to 0
        }
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
        if (synth.speaking) {
            synth.cancel();
        }
        // Replace placeholders with "blanc" for speech
        const textToSpeak = prepareTextForSpeech(text);
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.lang = speechLang;
        // Use user-selected voice if set
        const voiceName = localStorage.getItem('ttsVoiceName');
        if (voiceName) {
            const voices = synth.getVoices();
            // Use all matching voices, but pick the first (browser order)
            const matches = voices.filter(v => v.name === voiceName && v.lang && v.lang.startsWith('fr-FR') && !v.name.toLowerCase().includes('english'));
            if (matches.length > 0) utterance.voice = matches[0];
        }
        utterance.rate = 0.9;
        synth.speak(utterance);
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
                        // Randomly select one pronoun with a conjugation for this verb/tense
                        const availablePronouns = pronouns.filter(p => conjugations[p]);
                        if (availablePronouns.length > 0) {
                            let pronounKey = availablePronouns[Math.floor(Math.random() * availablePronouns.length)];
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
                        // Randomly select one pronoun with a conjugation for this verb/tense
                        const availablePronouns = pronouns.filter(p => conjugations[p]);
                        if (availablePronouns.length > 0) {
                            let pronounKey = availablePronouns[Math.floor(Math.random() * availablePronouns.length)];
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
        const verbFrequency = card.verb.frequency || 'common'; 

        // Set infinitive and translation separately for proper styling
        let translation = card.verb.translation || '';
        if (translation && !/^to\s/i.test(translation)) {
            translation = 'to ' + translation;
        }
        verbInfinitiveEl.textContent = card.verb.infinitive;
        verbInfinitiveEl.classList.add('tappable-audio');
        verbTranslationEl.textContent = translation ? '(' + translation + ')' : '';
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
        verbFrequencyEl.classList.add(verbFrequency);

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
                    if (hasExactMatch && chosen.gap_sentence) {
                        const questionPhrase = document.createElement('div');
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
                    const answerPhrase = document.createElement('div');
                    answerPhrase.textContent = chosen.sentence;
                    answerPhrase.classList.add('tappable-audio');
                    answerPhrase.style.cursor = 'pointer';
                    
                    // Create collapsible details section
                    const detailsSection = document.createElement('details');
                    detailsSection.style.marginTop = '0.5em';
                    detailsSection.style.fontSize = '0.9em';
                    detailsSection.style.opacity = '0.8';
                    
                    const summary = document.createElement('summary');
                    summary.textContent = 'Détails';
                    summary.style.cursor = 'pointer';
                    summary.style.fontSize = '0.8em';
                    summary.style.color = '#666';
                    
                    const detailsContent = document.createElement('div');
                    detailsContent.style.marginTop = '0.3em';
                    detailsContent.style.paddingLeft = '1em';
                    
                    // Add English translation if available
                    if (chosen.translation) {
                        const translationDiv = document.createElement('div');
                        // Clean translation by removing [PRONOUN] and other markers
                        const cleanTranslation = chosen.translation
                            .replace(/\[PRONOUN\]/g, '')
                            .replace(/\s+/g, ' ')
                            .trim();
                        translationDiv.innerHTML = `<strong>Traduction:</strong> ${cleanTranslation}`;
                        translationDiv.style.marginBottom = '0.3em';
                        detailsContent.appendChild(translationDiv);
                    }
                    
                    // Add source if available
                    if (chosen.source) {
                        const sourceDiv = document.createElement('div');
                        sourceDiv.innerHTML = `<strong>Source:</strong> ${chosen.source}`;
                        detailsContent.appendChild(sourceDiv);
                    }
                    
                    detailsSection.appendChild(summary);
                    detailsSection.appendChild(detailsContent);
                    
                    // Add answer phrase and details to answer container
                    verbPhraseEl.appendChild(answerPhrase);
                    if (chosen.translation || chosen.source) {
                        verbPhraseEl.appendChild(detailsSection);
                    }
                    
                    // Make phrase container clickable for audio
                    verbPhraseEl.classList.add('tappable-audio');
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
        if (currentCard && currentCard.chosenPhrase && currentCard.chosenPhrase.gap_sentence) {
            questionPhraseEl.style.display = 'block';
        }
        isAnswerVisible = false;
    };

    // --- Card advance logic ---
    const nextCard = () => {
        autoskipLock = false;
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
        const groups = { common: [], intermediate: [], rare: [] };
        verbs.forEach(v => {
            const freq = v.frequency || 'common';
            if (groups[freq]) groups[freq].push(v);
        });
        return groups;
    }

    function populateExplorerList(filter = '') {
        verbListContainer.innerHTML = '';
        const normalizedFilter = removeAccents(filter.toLowerCase());
        const filteredVerbs = uniqueVerbs.filter(v => removeAccents(v.infinitive.toLowerCase()).includes(normalizedFilter));
        const groups = groupVerbsByFrequency(filteredVerbs);
        const freqLabels = { common: 'Common', intermediate: 'Intermediate', rare: 'Rare' };
        return groups;
    }

    function populateExplorerList(filter = '') {
        verbListContainer.innerHTML = '';
        const normalizedFilter = removeAccents(filter.toLowerCase());
        const filteredVerbs = uniqueVerbs.filter(v => removeAccents(v.infinitive.toLowerCase()).includes(normalizedFilter));
        const groups = groupVerbsByFrequency(filteredVerbs);
        const freqLabels = { common: 'Common', intermediate: 'Intermediate', rare: 'Rare' };
        ['common','intermediate','rare'].forEach(freq => {
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
            speak(audioText);
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
            speak(audioText);
        } else if (currentCard && currentCard.conjugated) {
            speak(currentCard.conjugated);
        }
    }
    conjugatedVerbEl.addEventListener('click', (e) => {
        e.stopPropagation();
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
        // Find the main phrase (first div with tappable-audio class or first text node)
        const mainPhraseDiv = verbPhraseEl.querySelector('.tappable-audio');
        if (mainPhraseDiv && mainPhraseDiv.textContent) {
            speak(mainPhraseDiv.textContent);
        } else if (verbPhraseEl.textContent) {
            // Fallback for old structure
            speak(verbPhraseEl.textContent);
        }
    });

    questionPhraseEl.addEventListener('click', (e) => {
        e.stopPropagation();
        // Find the main phrase in question container
        const mainPhraseDiv = questionPhraseEl.querySelector('.tappable-audio');
        if (mainPhraseDiv && mainPhraseDiv.textContent) {
            speak(mainPhraseDiv.textContent);
        } else if (questionPhraseEl.textContent) {
            speak(questionPhraseEl.textContent);
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

    // --- Initial Load ---
    const initializeApp = () => {
        loadOptions();
        populateOptions();
        nextCard();
        backBtn.disabled = true;
        populateExplorerList();

        // Set initial state without adding to history, then replace it
        // to have a state for the initial page.
        showView('flashcard-view', false);
        window.history.replaceState({ view: 'flashcard-view' }, '', '#flashcard-view');
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

    // Call the patched initializeApp
    window.initializeApp();
});
