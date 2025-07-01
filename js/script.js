// script.js
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
                sentence: item.sentence
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
        "less-common": 2,
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

    function setupDictation() {
        console.log("Setting up dictation...");
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            if (dictateBtn) dictateBtn.disabled = true;
            return;
        }
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.lang = 'fr-FR';
        recognition.interimResults = true;
        recognition.continuous = false;

        // Create or get the result element as an overlay inside the flashcard
        dictationResultEl = document.getElementById('dictation-result');
        if (!dictationResultEl) {
            dictationResultEl = document.createElement('div');
            dictationResultEl.id = 'dictation-result';
            dictationResultEl.style.position = 'absolute';
            dictationResultEl.style.left = '50%';
            dictationResultEl.style.transform = 'translateX(-50%)';
            dictationResultEl.style.top = '75%';
            dictationResultEl.style.width = '80%';
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

        function showDictationOverlay(text, type = 'normal') {
            let html = '';
            if (type === 'prompt') {
                html = `<span style="color:#888;font-style:italic;">${text}</span>`;
            } else if (type === 'error') {
                html = `<span style="color:#c0392b;font-style:italic;">${text}</span>`;
            } else {
                html = `<span style="color:#2166af;font-weight:700;letter-spacing:0.01em;">${text}</span>`;
            }
            dictationResultEl.innerHTML = html;
            dictationResultEl.style.opacity = '1';
            dictationResultEl.style.display = 'block';
        }
        function hideDictationOverlay() {
            dictationResultEl.style.opacity = '0';
            setTimeout(() => {
                dictationResultEl.style.display = 'none';
            }, 500);
        }

        recognition.onstart = () => {
            isDictating = true;
            dictateBtn.textContent = '🛑';
            showDictationOverlay('Parlez maintenant...', 'prompt');
        };
        recognition.onend = () => {
            isDictating = false;
            dictateBtn.textContent = '🎤';
            if (!dictationResultEl.textContent || dictationResultEl.textContent.includes('Parlez maintenant')) {
                showDictationOverlay('Aucune parole détectée.', 'prompt');
            }
            setTimeout(hideDictationOverlay, 1200);
        };
        recognition.onerror = (event) => {
            isDictating = false;
            dictateBtn.textContent = '🎤 Dictate';
            showDictationOverlay('Erreur: ' + (event.error || 'inconnue'), 'error');
            setTimeout(hideDictationOverlay, 1800);
        };
        recognition.onresult = (event) => {
            let transcript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                transcript += event.results[i][0].transcript;
            }
            showDictationOverlay(transcript, 'normal');
        };

        dictateBtn.addEventListener('click', (e) => {
            // Prevent this click from bubbling up to the flashcard
            e.stopPropagation();
            if (isDictating) {
                recognition.stop();
            } else {
                showDictationOverlay('');
                recognition.start();
            }
        });
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
        "less-common": 2,
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
        tenseWeights,
        frequencyWeights,
    };

    // --- Local Storage for Options ---
    const saveOptions = () => {
        try {
            localStorage.setItem('frenchVerbsOptions', JSON.stringify(cardGenerationOptions));
        } catch (e) {
            console.warn("Could not save options to localStorage:", e);
        }
    };

    const loadOptions = () => {
        try {
            const savedOptionsJSON = localStorage.getItem('frenchVerbsOptions');
            if (savedOptionsJSON) {
                const savedOptions = JSON.parse(savedOptionsJSON);

                // Update toggles, checking for undefined to not break on old saves
                if (typeof savedOptions.hierarchical === 'boolean') {
                    cardGenerationOptions.hierarchical = savedOptions.hierarchical;
                }
                if (typeof savedOptions.showPhrases === 'boolean') {
                    cardGenerationOptions.showPhrases = savedOptions.showPhrases;
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
    const synth = window.speechSynthesis;
    const speak = (text) => {
        if (synth.speaking) {
            synth.cancel();
        }
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'fr-FR';
        utterance.rate = 0.9;
        synth.speak(utterance);
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
        const { hierarchical = false, tenseWeights = {}, frequencyWeights = {} } = options;

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
            const verbsInFrequency = uniqueVerbs.filter(v => (v.frequency || 'common') === selectedFrequency);
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

    // --- Autotalk French prompt template ---
    function getFrenchPrompt(card) {
      // Example: "Comment dire [VERB] au [TENSE] pour [PRONOUN] ?"
      // You can refine this template as needed for natural French
      const tenseMap = {
        'present': 'présent',
        'passeCompose': 'passé composé',
        'imparfait': 'imparfait',
        'futurSimple': 'futur simple',
        'plusQueParfait': 'plus-que-parfait',
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
        // Add emoji to pronoun
        const pronounEmojiMap = {
            'je': '🧑',
            "j'": '🧑',
            'tu': '🫵',
            'il': '👦',
            'elle': '👧',
            'on': '👥',
            'nous': '👨‍👩‍👧‍👦',
            'vous': '🫵🫵',
            'ils': '👦👦',
            'elles': '👧👧'
        };
        let pronounDisplay = card.pronoun;
        // Handle split pronouns like "il/elle/on"
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

        // Show answer as pronoun + conjugated verb, but handle j' edge case
        let answerText = card.pronoun + ' ' + card.conjugated;
        if (card.pronoun === 'je' && card.conjugated.trim().toLowerCase().startsWith("j'")) {
            answerText = card.conjugated;
        }
        conjugatedVerbEl.textContent = answerText;
        conjugatedVerbEl.classList.add('tappable-audio');

        // --- New Phrase Logic ---
        verbPhraseEl.textContent = ''; // Clear by default
        verbPhraseEl.classList.remove('tappable-audio');
        if (cardGenerationOptions.showPhrases) {
            const phraseKey = tenseKeyToPhraseKey[card.tense];
            const verbPhrases = phrasebook[card.verb.infinitive] && phrasebook[card.verb.infinitive][phraseKey];
            let filtered = [];
            if (verbPhrases && verbPhrases.length) {
                // 1. Try to match verb+tense+pronoun
                filtered = verbPhrases.filter(p => p.pronoun === card.pronoun);
                // 2. If none, match verb+tense
                if (filtered.length === 0) filtered = verbPhrases;
                // 3. Pick random if any
                if (filtered.length > 0) {
                    const chosen = filtered[Math.floor(Math.random() * filtered.length)];
                    verbPhraseEl.textContent = chosen.sentence;
                    verbPhraseEl.classList.add('tappable-audio');
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
            isAnswerVisible = true;
            if (window.incrementDailyCount) window.incrementDailyCount();
            // --- AUTOTALK: Speak answer if enabled ---
            const autosayOn = localStorage.getItem('autosay-enabled') === 'true';
            if (autosayOn && currentCard) {
              // Match the answer display logic for pronoun + conjugated
              let answerText = currentCard.pronoun + ' ' + currentCard.conjugated;
              if (currentCard.pronoun === 'je' && currentCard.conjugated.trim().toLowerCase().startsWith("j'")) {
                answerText = currentCard.conjugated;
              }
              speak(answerText);
            }
        }
    };

    const hideAnswer = () => {
        answerContainer.classList.remove('is-visible');
        isAnswerVisible = false;
    };

    const handleNext = () => {
        if (isAnswerVisible) {
            hideAnswer();
            setTimeout(nextCard, 300);
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

    const nextCard = () => {
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
        const groups = { common: [], 'less-common': [], rare: [] };
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
        const freqLabels = { common: 'Common', 'less-common': 'Less Common', rare: 'Rare' };
        ['common','less-common','rare'].forEach(freq => {
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
            const pronounOrder = ["je", "tu", "il", "elle", "nous", "vous", "ils", "elles"];
            Object.entries(phrasebookForVerb).forEach(([tense, phraseArr]) => {
                if (!Array.isArray(phraseArr) || phraseArr.length === 0) return;
                // Sort phraseArr by pronoun order
                const sortedArr = [...phraseArr].sort((a, b) => {
                    const idxA = pronounOrder.indexOf(a.pronoun);
                    const idxB = pronounOrder.indexOf(b.pronoun);
                    // If not found, put at end
                    return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
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
                    pEl.innerHTML = `<span style='color:#888;'>${p.pronoun}:</span> <span>${p.sentence}</span> <span style='font-size:0.95em;opacity:0.7;cursor:pointer;margin-left:0.4em;'>🔊</span>`;
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
            let audioText = currentCard.pronoun + ' ' + currentCard.conjugated;
            if (currentCard.pronoun === 'je' && currentCard.conjugated.trim().toLowerCase().startsWith("j'")) {
                audioText = currentCard.conjugated;
            }
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
            let audioText = currentCard.pronoun + ' ' + currentCard.conjugated;
            if (currentCard.pronoun === 'je' && currentCard.conjugated.trim().toLowerCase().startsWith("j'")) {
                audioText = currentCard.conjugated;
            }
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
        if (verbPhraseEl.textContent) {
            speak(verbPhraseEl.textContent);
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

    // Call the patched initializeApp
    window.initializeApp();
});
