// Canonical tense usage; English guidance follows the existing learner UI.
(() => {
    'use strict';
    const metadata = {
    "present": {
        "summary": "Actions happening now, habits, and general facts.",
        "examples": [
            {
                "text": "Je travaille.",
                "translation": "I am working."
            },
            {
                "text": "Il pleut souvent.",
                "translation": "It often rains."
            }
        ],
        "more": "Use it for what is happening now or what is usually true. French often uses this same form where English uses either “I work” or “I am working”."
    },
    "passeCompose": {
        "summary": "Completed past events, often used to say what happened.",
        "examples": [
            {
                "text": "Hier, j’ai travaillé.",
                "translation": "Yesterday, I worked."
            }
        ],
        "more": "Use it to tell what happened or to move a past story forward. Contrast it with the imparfait, which describes the background or what was going on."
    },
    "imparfait": {
        "summary": "Past habits, descriptions, and actions that were in progress.",
        "examples": [
            {
                "text": "Je lisais quand tu es arrivé.",
                "translation": "I was reading when you arrived."
            }
        ],
        "more": "Use it to set the scene, describe past habits, or show an action in progress. It does not itself present the action’s beginning or end; a passé composé event can interrupt that background."
    },
    "futurSimple": {
        "summary": "Actions or events that will happen in the future.",
        "examples": [
            {
                "text": "Demain, il pleuvra.",
                "translation": "Tomorrow, it will rain."
            }
        ],
        "more": "Use it for predictions, promises, and future events. In everyday conversation, aller followed by an infinitive is another common way to talk about the future."
    },
    "plusQueParfait": {
        "summary": "Something that had already happened before another past event.",
        "examples": [
            {
                "text": "J’avais mangé quand il est arrivé.",
                "translation": "I had eaten when he arrived."
            }
        ],
        "more": "Use it when looking back from a point that is already in the past. The earlier action takes this tense; the later event may be in the passé composé or imparfait."
    },
    "subjonctifPresent": {
        "summary": "Used after expressions of wishes, necessity, or doubt about the present or future.",
        "examples": [
            {
                "text": "Il faut que tu viennes.",
                "translation": "You need to come."
            }
        ],
        "more": "Look at the expression introducing the clause: il faut que and vouloir que commonly call for this mood. “Present” does not restrict it to now; the action can still be in the future."
    },
    "conditionnelPresent": {
        "summary": "Hypothetical actions, wishes, or polite requests.",
        "examples": [
            {
                "text": "Je voudrais un café.",
                "translation": "I would like a coffee."
            },
            {
                "text": "Avec plus de temps, je voyagerais.",
                "translation": "With more time, I would travel."
            }
        ],
        "more": "Use it for what would happen under a condition or to soften a request. In a hypothetical si sentence, the condition normally takes the imparfait and the result takes the conditional."
    }
};

    const language = "french";
    const speechLanguage = "fr";
    const labels = window[language + 'TenseKeyToLabel'] || {};
    const dismissed = new Set();
    const pending = [];
    let hint = null;
    const key = tense => window.getAppStorageKey
        ? window.getAppStorageKey(`tense-usage-dismissed:v1:${tense}`)
        : `${language}:tense-usage-dismissed:v1:${tense}`;
    let lastEncounter = null;
    let sessionReset = false;
    function bindSetting() {
        const reset = document.getElementById('reset-tense-hints-btn');
        if (!reset) return;
        reset.addEventListener('click', () => {
            let saved = true;
            Object.keys(metadata).forEach(tense => {
                try { localStorage.removeItem(key(tense)); } catch (_) { saved = false; }
            });
            dismissed.clear();
            sessionReset = !saved;
            pending.length = 0;
            hint?.remove();
            hint = null;
            if (lastEncounter) encounter(lastEncounter);
            const status = document.getElementById('reset-tense-hints-status');
            if (status) status.textContent = saved
                ? 'Tense hints reset. They will appear again as you practice.'
                : 'Hints reset for this session. Your browser could not save the reset.';
        });
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bindSetting);
    else bindSetting();
    function isDismissed(tense) {
        if (dismissed.has(tense)) return true;
        if (sessionReset) return false;
        try { return localStorage.getItem(key(tense)) === '1'; } catch (_) { return false; }
    }
    function element(tag, className, text) {
        const node = document.createElement(tag);
        node.className = className;
        if (text !== undefined) node.textContent = text;
        return node;
    }
    function get(tense) {
        const value = Object.prototype.hasOwnProperty.call(metadata, tense) && metadata[tense];
        return value && typeof value.summary === 'string' && value.examples?.length ? value : null;
    }
    // Both surfaces use this renderer and the same canonical metadata record.
    function content(tense) {
        const value = get(tense);
        if (!value) return null;
        const body = element('div', 'tense-usage-content');
        body.append(element('p', 'tense-usage-summary', value.summary));
        if (value.more) {
            const more = element('details', 'tense-usage-more');
            const toggle = element('summary', '', 'Read more');
            more.append(toggle, element('p', '', value.more));
            more.addEventListener('toggle', () => { toggle.textContent = more.open ? 'Read less' : 'Read more'; });
            body.append(more);
        }
        value.examples.forEach(example => {
            const line = element('p', 'tense-usage-example');
            const original = element('span', '', example.text);
            original.lang = speechLanguage;
            line.append(original, document.createTextNode(' — '), element('span', 'tense-usage-translation', example.translation));
            body.append(line);
        });
        return body;
    }
    function render() {
        while (pending.length && isDismissed(pending[0])) pending.shift();
        const tense = pending[0];
        if (!tense) { hint?.remove(); hint = null; return; }
        // Do not replace a visible hint on each answer/card or disturb its focus.
        if (hint?.dataset.tense === tense && hint.isConnected) return;
        const anchor = document.querySelector('#flashcard #phrase-container');
        if (!anchor) return;
        hint?.remove();
        hint = element('aside', 'tense-usage-hint');
        hint.id = 'tense-usage-hint';
        hint.dataset.tense = tense;
        hint.setAttribute('aria-label', `Tense usage: ${labels[tense] || tense}`);
        const heading = element('div', 'tense-usage-heading');
        heading.append(element('strong', '', `${labels[tense] || tense} · Usage`));
        const dismiss = element('button', 'tense-usage-dismiss', 'Got it');
        dismiss.type = 'button';
        dismiss.setAttribute('aria-label', `Dismiss usage hint for ${labels[tense] || tense}`);
        dismiss.addEventListener('click', () => {
            dismissed.add(tense);
            try { localStorage.setItem(key(tense), '1'); } catch (_) { /* Keep session dismissal when storage is unavailable. */ }
            render();
            (hint?.querySelector('button') || document.getElementById('answer-flow-btn'))?.focus({preventScroll: true});
        });
        heading.append(dismiss);
        hint.append(heading, content(tense));
        anchor.after(hint);
    }
    function encounter(tense) {
        if (!get(tense)) return;
        lastEncounter = tense;
        if (isDismissed(tense)) return;
        if (!pending.includes(tense)) pending.push(tense);
        render();
    }
    function appendDetails(parent, tense) {
        const body = content(tense);
        if (!body) return;
        parent.classList.add('has-tense-usage');
        const disclosure = element('details', 'tense-usage-details');
        disclosure.append(element('summary', '', 'Usage'), body);
        parent.append(disclosure);
    }
    window.addEventListener('storage', event => {
        if (pending.some(tense => event.key === key(tense))) render();
    });
    window.TenseUsage = {encounter, appendDetails};
})();
