// Practice Mode Toggle Logic
// This script adds a toggle for practice mode (verbs/phrases) to the options/settings UI
// and syncs it with localStorage. It does not affect any other app logic yet.

// Dummy phrase data for future use
const dummyPhrases = [
    { phrase: "Bonjour, comment ça va?", translation: "Hello, how are you?" },
    { phrase: "Je voudrais un café.", translation: "I would like a coffee." },
    { phrase: "Où est la bibliothèque?", translation: "Where is the library?" },
    { phrase: "Merci beaucoup!", translation: "Thank you very much!" },
    { phrase: "Je ne comprends pas.", translation: "I don't understand." }
];

function setupPracticeModeToggle() {
    // Insert toggle into options UI if not present
    const optionsContainer = document.getElementById('options-container');
    if (!optionsContainer) return;
    if (!document.getElementById('practice-mode-toggle')) {
        // Create toggle group
        const group = document.createElement('div');
        group.className = 'option-group';
        group.style.display = 'flex';
        group.style.flexDirection = 'row';
        group.style.alignItems = 'center';
        group.style.gap = '0.5em';
        // Label
        const label = document.createElement('label');
        label.htmlFor = 'practice-mode-toggle';
        label.textContent = 'Practice Mode: Phrases';
        // Toggle switch
        const toggleSwitch = document.createElement('div');
        toggleSwitch.className = 'toggle-switch';
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.id = 'practice-mode-toggle';
        input.className = 'toggle-input';
        const toggleLabel = document.createElement('label');
        toggleLabel.htmlFor = 'practice-mode-toggle';
        toggleLabel.className = 'toggle-label';
        toggleSwitch.appendChild(input);
        toggleSwitch.appendChild(toggleLabel);
        group.appendChild(label);
        group.appendChild(toggleSwitch);
        // Insert at top of options
        optionsContainer.insertBefore(group, optionsContainer.firstChild);
    }
    // Sync toggle with localStorage
    const toggle = document.getElementById('practice-mode-toggle');
    let practiceMode = localStorage.getItem('practiceMode') || 'verbs';
    toggle.checked = (practiceMode === 'phrases');
    toggle.addEventListener('change', (e) => {
        practiceMode = e.target.checked ? 'phrases' : 'verbs';
        localStorage.setItem('practiceMode', practiceMode);
    });
}

document.addEventListener('DOMContentLoaded', setupPracticeModeToggle);
