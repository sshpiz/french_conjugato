// verbListModes.js
// Helper for switching between alphabetical and frequency modes

export function groupVerbsByFrequency(verbs) {
    const groups = { common: [], 'less-common': [], rare: [] };
    verbs.forEach(v => {
        const freq = v.frequency || 'common';
        if (groups[freq]) groups[freq].push(v);
    });
    return groups;
}

export function groupVerbsAlphabetically(verbs) {
    const groups = {};
    verbs.forEach(v => {
        const letter = v.infinitive[0].toUpperCase();
        if (!groups[letter]) groups[letter] = [];
        groups[letter].push(v);
    });
    return groups;
}
