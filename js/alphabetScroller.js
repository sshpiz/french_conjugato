// alphabetScroller.js
// UI for alphabetic quick-jump in verb explorer

export function createAlphabetScroller(onLetterClick) {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const scroller = document.createElement('div');
    scroller.className = 'alphabet-scroller';
    alphabet.forEach(letter => {
        const btn = document.createElement('button');
        btn.className = 'alphabet-letter';
        btn.textContent = letter;
        btn.addEventListener('click', () => onLetterClick(letter));
        scroller.appendChild(btn);
    });
    return scroller;
}
