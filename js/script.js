// script.js
document.addEventListener('DOMContentLoaded', () => {
    // --- Data Sorting ---
    // Define the desired order of popularity.
    const frequencyOrder = {
        "super-common": 1,
        "common": 2,
        "rare": 3,
        "super-rare": 4
    };

    // Sort the main `verbs` array in place. This is done once on load.
    verbs.sort((a, b) => {
        const freqA = frequencyOrder[a.frequency] || 99; // Use a high number for any unclassified verbs
        const freqB = frequencyOrder[b.frequency] || 99;
        // First, sort by frequency. If they are different, the sort is done.
        if (freqA !== freqB) return freqA - freqB;
        // If frequency is the same, sort alphabetically by the infinitive.
        return a.infinitive.localeCompare(b.infinitive);
    });
    // --- DOM Elements ---
    const flashcardView = document.getElementById('flashcard-view');
    const explorerListView = document.getElementById('explorer-list-view');
    const explorerDetailView = document.getElementById('explorer-detail-view');
    
    const flashcard = document.getElementById('flashcard');
    const verbInfinitiveEl = document.getElementById('verb-infinitive');
    const verbTranslationEl = document.getElementById('verb-translation');
    const verbPronounEl = document.getElementById('verb-pronoun');
    const verbTenseEl = document.getElementById('verb-tense');
    const verbFrequencyEl = document.getElementById('verb-frequency');
    const answerContainer = document.getElementById('answer-container');
    const conjugatedVerbEl = document.getElementById('conjugated-verb');
    
    const infinitiveAudioBtn = document.getElementById('infinitive-audio-btn');
    const conjugatedAudioBtn = document.getElementById('conjugated-audio-btn');
    
    const backBtn = document.getElementById('back-btn');
    const nextBtn = document.getElementById('next-btn');
    const explorerToggleBtn = document.getElementById('explorer-toggle-btn');
    const backToFlashcardBtn = document.getElementById('back-to-flashcard-btn');
    const backToListBtn = document.getElementById('back-to-list-btn');

    const searchBar = document.getElementById('search-bar');
    const verbListContainer = document.getElementById('verb-list-container');
    const verbDetailContainer = document.getElementById('verb-detail-container');

    // --- State ---
    let currentCard = null;
    let currentDetailVerb = null;
    let history = [];
    let historyIndex = -1;
    let isAnswerVisible = false;

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

    const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

    const generateNewCard = () => {
        const verb = getRandomItem(verbs);
        console.log(verb);
        // tenses.key
        const tense = getRandomItem(Object.getOwnPropertyNames(tenses));
        const pronoun = getRandomItem(pronouns);
        const conjugated = tenses[tense][verb["infinitive"]][pronoun];

        return { verb, tense, pronoun, conjugated };
    };

    const displayCard = (card) => {
        currentCard = card;
        const verbFrequency = card.verb.frequency || 'common'; 

        verbInfinitiveEl.textContent = card.verb.infinitive;
        verbTranslationEl.textContent = card.verb.translation;
        verbPronounEl.textContent = card.pronoun;
        verbTenseEl.textContent = card.tense;

        const frequencyText = verbFrequency.replace('-', ' ');
        verbFrequencyEl.textContent = frequencyText;
        verbFrequencyEl.className = 'meta-info frequency-tag';
        verbFrequencyEl.classList.add(verbFrequency);

        conjugatedVerbEl.textContent = card.conjugated;
    };

    const showAnswer = () => {
        if (!isAnswerVisible) {
            answerContainer.classList.add('is-visible');
            isAnswerVisible = true;
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
        if (historyIndex < history.length - 1) {
            historyIndex++;
            displayCard(history[historyIndex]);
        } else {
            const newCard = generateNewCard();
            history.push(newCard);
            historyIndex = history.length - 1;
            displayCard(newCard);
        }
        backBtn.disabled = false;
    };

    const prevCard = () => {
        if (historyIndex > 0) {
            historyIndex--;
            displayCard(history[historyIndex]);
        }
        backBtn.disabled = historyIndex === 0;
    };

    // --- Verb Explorer Logic ---
    const showExplorerList = () => {
        flashcardView.classList.add('hidden');
        explorerDetailView.classList.add('hidden');
        explorerListView.classList.remove('hidden');
        populateExplorerList(searchBar.value);
    };

    const showFlashcards = () => {
        explorerListView.classList.add('hidden');
        explorerDetailView.classList.add('hidden');
        flashcardView.classList.remove('hidden');
    };

    const showVerbDetail = (verbInfinitive) => {
        const verb = verbs.find(v => v.infinitive === verbInfinitive);
        if (!verb) return;
        currentDetailVerb = verb;

        explorerListView.classList.add('hidden');
        explorerDetailView.classList.remove('hidden');
        populateVerbDetail(verb);
    };

    const populateExplorerList = (filter = '') => {
        verbListContainer.innerHTML = '';
        const normalizedFilter = removeAccents(filter.toLowerCase());
        const filteredVerbs = verbs.filter(v => removeAccents(v.infinitive.toLowerCase()).includes(normalizedFilter));

        filteredVerbs.forEach(verb => {
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
            verbListContainer.appendChild(item);
        });
    };

    const populateVerbDetail = (verb) => {
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
        speak(currentCard.conjugated);
    });

    // View Toggling
    explorerToggleBtn.addEventListener('click', showExplorerList);
    backToFlashcardBtn.addEventListener('click', showFlashcards);
    backToListBtn.addEventListener('click', showExplorerList);

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

    // --- Initial Load ---
    const initializeApp = () => {
        nextCard();
        backBtn.disabled = true;
        populateExplorerList();
    };

    initializeApp();
});
