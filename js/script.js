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
const APP_STORAGE_PREFIX = window.appStoragePrefix || 'french';
const getScopedStorageKey = window.getAppStorageKey || ((name) => `${APP_STORAGE_PREFIX}:${name}`);
const getScopedStorageItem = window.getAppStoredItem || ((name) => localStorage.getItem(getScopedStorageKey(name)));
const setScopedStorageItem = window.setAppStoredItem || ((name, value) => localStorage.setItem(getScopedStorageKey(name), value));
const removeScopedStorageItem = window.removeAppStoredItem || ((name) => localStorage.removeItem(getScopedStorageKey(name)));
const ENABLE_LEGACY_SENTENCE_DATA = false;
const APP_VERSION_TEMPLATE_MARKER = ['{{APP_VERSION', '}}'].join('');
const normalizeAppVersion = (value) => {
    const raw = String(value || '').trim();
    return !raw || raw.includes(APP_VERSION_TEMPLATE_MARKER) ? 'dev' : raw;
};
const parseAppVersionParts = (version) => {
    const match = /^(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})$/.exec(String(version || '').trim());
    if (!match) return null;
    const [, year, month, day, hour, minute, second] = match;
    return {
        year: Number(year),
        month: Number(month),
        day: Number(day),
        hour: Number(hour),
        minute: Number(minute),
        second: Number(second)
    };
};
const buildAppVersionDate = (version) => {
    const parts = parseAppVersionParts(version);
    if (!parts) return null;
    return new Date(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
};
const formatAppVersionLabel = (version) => {
    const builtAt = buildAppVersionDate(version);
    if (!builtAt) {
        return version === 'dev' ? 'Source' : String(version || 'Unknown');
    }
    return builtAt.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};
const formatAppVersionDetail = (version) => {
    const builtAt = buildAppVersionDate(version);
    if (!builtAt) {
        return 'Build time unavailable';
    }
    return `Built ${builtAt.toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })}`;
};
const KNOWN_FREQUENCY_ORDER = ['top20', 'top50', 'top100', 'top500', 'top1000', 'top2000', 'top3000', 'top4000', 'top5000', 'rare'];
const LEGACY_FREQUENCY_KEY_MAP = {
    'top-20': 'top20',
    'top-50': 'top50',
    'top-100': 'top100',
    'top-500': 'top500',
    'top-1000': 'top1000',
    'top-2000': 'top2000',
    'top-3000': 'top3000',
    'top-4000': 'top4000',
    'top-5000': 'top5000',
};

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

const APP_VERSION = normalizeAppVersion(window.APP_BUILD_VERSION);

if (getScopedStorageItem("app_version") !== APP_VERSION) {
  setScopedStorageItem("app_version", APP_VERSION);
}

(() => {
    const url = new URL(window.location.href);
    if (!url.searchParams.has('__refresh')) return;
    url.searchParams.delete('__refresh');
    const search = url.searchParams.toString();
    window.history.replaceState(null, '', `${url.pathname}${search ? `?${search}` : ''}${url.hash}`);
})();


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

const startupMark = (() => {
    let fallbackBaseMs = null;
    return (label, extra = '') => {
        if (typeof window.appStartupMark === 'function') {
            window.appStartupMark(label, extra);
            return;
        }
        const now = (window.performance && typeof window.performance.now === 'function')
            ? window.performance.now()
            : Date.now();
        if (fallbackBaseMs === null) fallbackBaseMs = now;
        const delta = Math.round(now - fallbackBaseMs);
        const suffix = extra ? ` ${extra}` : '';
        const msg = `startup t+${delta}ms ${label}${suffix}`;
        if (window.appLog) {
            window.appLog(msg);
        } else {
            console.log('[APP]', msg);
        }
    };
})();

const appDebugLog = (message) => {
    if (window.appLog) {
        window.appLog(message);
    } else {
        console.log('[APP]', message);
    }
};

startupMark('main-script-start');

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
    ret = ret.replace(/____/g, 'blanc');
    ret = ret.replace(/-/g, ' ');
    return ret;
}

const CARD_TYPE_VALUES = new Set(['conjugation', 'both', 'frame']);

function normalizeCardTypeMode(value) {
    return CARD_TYPE_VALUES.has(String(value || '').trim()) ? String(value || '').trim() : 'conjugation';
}

function normalizeVerbSetVerbCandidate(value) {
    return String(value || '')
        .replace(/[\u2018\u2019\u02BC]/g, "'")
        .trim()
        .toLowerCase()
        .replace(/\s*'\s*/g, "'")
        .replace(/\s+/g, ' ');
}

function parseVerbSetRawInput(rawText) {
    const pieces = String(rawText || '').split(/[,\n\r;]+/);
    const seen = new Set();
    const candidates = [];
    pieces.forEach((piece) => {
        const normalized = normalizeVerbSetVerbCandidate(piece);
        if (!normalized || seen.has(normalized)) return;
        seen.add(normalized);
        candidates.push(normalized);
    });
    return candidates;
}

function escapeHtml(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function splitFrameQuestion(question) {
    const text = String(question || '').trim();
    if (!text) return { before: '', after: '' };

    const gapMatch = text.match(/(?:\s*____\s*)+/);
    if (!gapMatch || gapMatch.index == null) {
        return { before: text, after: '' };
    }

    const start = gapMatch.index;
    const end = start + gapMatch[0].length;
    return {
        before: text.slice(0, start).trimEnd(),
        after: text.slice(end).trimStart(),
    };
}

function highlightFrameSubject(text) {
    const raw = String(text || '');
    if (!raw) return '';
    const subjectPattern = /(^|[\s,;:([{«"“”'’])((?:j'|je|tu|il|elle|on|nous|vous|ils|elles|ça|ce|c'))(?=$|[\s,;:)\]}»"“”'’])/i;
    const match = subjectPattern.exec(raw);
    if (!match || match.index == null) {
        return escapeHtml(raw);
    }
    const boundary = match[1] || '';
    const pronoun = match[2] || '';
    const pronounStart = match.index + boundary.length;
    const pronounEnd = pronounStart + pronoun.length;
    const before = raw.slice(0, pronounStart);
    const after = raw.slice(pronounEnd);
    return `${escapeHtml(before)}<span class="frame-card-subject">${escapeHtml(pronoun)}</span>${escapeHtml(after)}`;
}

function renderFramePromptMarkup(question) {
    const { before, after } = splitFrameQuestion(question);

    const parts = [];
    if (before) {
        parts.push(`<span class="frame-card-prefix">${highlightFrameSubject(before)}</span>`);
    }
    parts.push('<span class="frame-card-gap" aria-hidden="true"></span>');
    if (after) {
        parts.push(`<span class="frame-card-tail">${escapeHtml(after)}</span>`);
    }
    return parts.join(' ');
}

function renderFrameSolvedMarkup(question, answer) {
    const { before, after } = splitFrameQuestion(question);
    const parts = [];
    if (before) {
        parts.push(`<span class="frame-card-prefix">${highlightFrameSubject(before)}</span>`);
    }
    parts.push(`<span class="frame-card-inserted">${escapeHtml(String(answer || '').trim())}</span>`);
    if (after) {
        parts.push(`<span class="frame-card-tail">${escapeHtml(after)}</span>`);
    }
    return parts.join(' ');
}

function normalizeVerbSetUsageEntry(rawEntry) {
    if (!rawEntry || typeof rawEntry !== 'object') return null;
    const pattern = String(rawEntry.pattern || '').trim();
    const example_fr = String(rawEntry.example_fr || '').trim();
    const example_en = String(rawEntry.example_en || '').trim();
    if (!pattern && !example_fr && !example_en) return null;
    return { pattern, example_fr, example_en };
}

function getCurrentVerbSetOptions() {
    return window.cardGenerationOptions || null;
}

function getResolvedVerbSetSelectionBridge(options) {
    const resolver = window.getResolvedVerbSetSelection;
    return typeof resolver === 'function' ? resolver(options) : null;
}

function getBuiltInVerbUsageFallbacks() {
    return window.builtinVerbUsageFallbacks || {};
}

// ── Theme management ─────────────────────────────────────────────────────────
(function initTheme() {
    const html = document.documentElement;
    const saved = localStorage.getItem('themeMode') || 'system';
    const systemDarkQuery = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

    function isDarkThemeActive() {
        const forcedTheme = html.getAttribute('data-theme');
        if (forcedTheme === 'dark') return true;
        if (forcedTheme === 'light') return false;
        return !!(systemDarkQuery && systemDarkQuery.matches);
    }

    function emitThemeChange() {
        window.dispatchEvent(new CustomEvent('app-theme-change', {
            detail: {
                mode: localStorage.getItem('themeMode') || 'system',
                isDark: isDarkThemeActive(),
            }
        }));
    }

    function applyTheme(mode) {
        localStorage.setItem('themeMode', mode);
        if (mode === 'dark')        html.setAttribute('data-theme', 'dark');
        else if (mode === 'light')  html.setAttribute('data-theme', 'light');
        else                        html.removeAttribute('data-theme');

        // Sync pill active state
        document.querySelectorAll('#theme-pills .reflexive-pill').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === mode);
        });

        emitThemeChange();
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

    if (systemDarkQuery) {
        systemDarkQuery.addEventListener('change', () => {
            if (!html.hasAttribute('data-theme')) {
                emitThemeChange();
            }
        });
    }

    // Expose for external use
    window.applyTheme = applyTheme;
    window.isDarkThemeActive = isDarkThemeActive;
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

// ── TTS speed ────────────────────────────────────────────────────────────────
(function initTtsSpeed() {
    const KEY = 'ttsRate';
    const DEFAULT_RATE = 1;
    const MIN_RATE = 0.7;
    const MAX_RATE = 1.3;
    const saved = parseFloat(getScopedStorageItem(KEY));
    const initialRate = Number.isFinite(saved) ? Math.min(MAX_RATE, Math.max(MIN_RATE, saved)) : DEFAULT_RATE;

    function formatRate(rate) {
        return `${rate.toFixed(2)}x`;
    }

    function applyTtsRate(rate) {
        const clamped = Math.min(MAX_RATE, Math.max(MIN_RATE, rate));
        const slider = document.getElementById('tts-speed-slider');
        const value = document.getElementById('tts-speed-value');
        if (slider) slider.value = clamped;
        if (value) value.textContent = formatRate(clamped);
        setScopedStorageItem(KEY, String(clamped));
    }

    function bindSlider() {
        const slider = document.getElementById('tts-speed-slider');
        if (!slider) return;
        slider.value = initialRate;
        slider.addEventListener('input', () => applyTtsRate(parseFloat(slider.value)));
    }

    window.getConfiguredTtsRate = function() {
        const raw = parseFloat(getScopedStorageItem(KEY));
        return Number.isFinite(raw) ? Math.min(MAX_RATE, Math.max(MIN_RATE, raw)) : DEFAULT_RATE;
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => { applyTtsRate(initialRate); bindSlider(); });
    } else {
        applyTtsRate(initialRate); bindSlider();
    }
})();

// ── Deferred verb context data ────────────────────────────────────────────────
const VERB_CORE_PATTERNS_DATA_ELEMENT_ID = 'verb-core-patterns-data';
const VERB_USAGES_DATA_ELEMENT_ID = 'verb-usages-data';
const FRENCH_HOMOPHONE_GROUP_BY_ANSWER = window.frenchHomophoneGroupByAnswer || {};
const FRENCH_HOMOPHONE_GROUP_META = window.frenchHomophoneGroupMeta || null;
let verbCorePatternsIndex = null;
let verbUsagesIndex = null;

function parseDeferredJsonDataScript(elementId) {
    const element = document.getElementById(elementId);
    if (!element) return [];
    try {
        const parsed = JSON.parse(element.textContent || '[]');
        element.remove();
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.warn(`[verb-context] Failed to parse deferred data from #${elementId}`, error);
        return [];
    }
}

function ensureVerbCorePatternsLoaded() {
    if (!Array.isArray(window.verbCorePatterns)) {
        window.verbCorePatterns = parseDeferredJsonDataScript(VERB_CORE_PATTERNS_DATA_ELEMENT_ID);
    }
    return window.verbCorePatterns;
}

function ensureVerbUsagesLoaded() {
    if (!Array.isArray(window.verbUsages)) {
        window.verbUsages = parseDeferredJsonDataScript(VERB_USAGES_DATA_ELEMENT_ID);
    }
    return window.verbUsages;
}

function getVerbCorePatternsIndex() {
    if (verbCorePatternsIndex) return verbCorePatternsIndex;

    const index = {};
    const entries = ensureVerbCorePatternsLoaded();
    for (const entry of entries) {
        if (!entry || !entry.verb || !Array.isArray(entry.core_patterns)) continue;
        const patterns = entry.core_patterns.filter((patternEntry) =>
            patternEntry &&
            typeof patternEntry.pattern === 'string' &&
            patternEntry.pattern.trim()
        );
        if (patterns.length) {
            index[entry.verb] = patterns;
        }
    }
    verbCorePatternsIndex = index;
    return verbCorePatternsIndex;
}

function getVerbUsagesIndex() {
    if (verbUsagesIndex) return verbUsagesIndex;

    const index = {};
    const usages = ensureVerbUsagesLoaded();
    for (const u of usages) {
        if (!u || !u.verb) continue;
        if (!index[u.verb]) index[u.verb] = [];
        index[u.verb].push(u);
    }
    verbUsagesIndex = index;
    return verbUsagesIndex;
}

function appendVerbSectionHeading(container, text, className) {
    if (!text) return;
    const headingEl = document.createElement('h3');
    headingEl.className = className || 'verb-usages-heading';
    headingEl.textContent = text;
    container.appendChild(headingEl);
}

function renderVerbCorePatterns(container, infinitive, options = {}) {
    if (!container) return 0;

    const {
        sectionClass = '',
        heading = '',
        headingClass = 'verb-usages-heading',
    } = options;

    container.innerHTML = '';
    if (sectionClass) container.className = sectionClass;

    const patterns = getVerbCorePatternsIndex()[infinitive];
    if (!patterns || !patterns.length) return 0;

    appendVerbSectionHeading(container, heading, headingClass);

    patterns.forEach((entry) => {
        const item = document.createElement('div');
        item.className = 'core-pattern-item';

        const patternEl = document.createElement('span');
        patternEl.className = 'core-pattern-pattern';
        patternEl.textContent = entry.pattern || '';
        item.appendChild(patternEl);

        if (entry.meaning_en) {
            const meaningEl = document.createElement('span');
            meaningEl.className = 'core-pattern-meaning';
            meaningEl.textContent = entry.meaning_en;
            item.appendChild(meaningEl);
        }

        if (entry.notes) {
            const notesEl = document.createElement('span');
            notesEl.className = 'core-pattern-notes';
            notesEl.textContent = entry.notes;
            item.appendChild(notesEl);
        }

        container.appendChild(item);
    });

    return patterns.length;
}

function renderVerbUsages(container, infinitive, options = {}) {
    if (!container) return 0;

    const {
        sectionClass = '',
        heading = '',
        headingClass = 'verb-usages-heading',
    } = options;

    container.innerHTML = '';
    if (sectionClass) container.className = sectionClass;

    const usages = getVerbUsagesIndex()[infinitive];
    if (!usages || !usages.length) return 0;
    return renderUsageEntries(container, usages, {
        heading,
        headingClass,
    });
}

function renderUsageEntries(container, usages, options = {}) {
    if (!container || !Array.isArray(usages) || !usages.length) return 0;

    const {
        heading = '',
        headingClass = 'verb-usages-heading',
    } = options;

    appendVerbSectionHeading(container, heading, headingClass);

    usages.forEach((u) => {
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

function getVerbSetUsageEntries(infinitive, options = {}) {
    const activeSelection = getResolvedVerbSetSelectionBridge(options.verbSetOptions || getCurrentVerbSetOptions());
    if (!activeSelection || !activeSelection.topicUsages) return [];
    const entries = activeSelection.topicUsages[infinitive];
    if (Array.isArray(entries) && entries.length) return entries;
    const fallbackEntries = getBuiltInVerbUsageFallbacks()[infinitive];
    return Array.isArray(fallbackEntries) ? fallbackEntries : [];
}

function renderVerbSetUsages(container, infinitive, options = {}) {
    if (!container) return 0;

    const {
        sectionClass = '',
        heading = '',
        headingClass = 'verb-usages-heading',
        verbSetOptions = getCurrentVerbSetOptions(),
    } = options;

    container.innerHTML = '';
    if (sectionClass) container.className = sectionClass;

    const usages = getVerbSetUsageEntries(infinitive, { verbSetOptions });
    if (!usages.length) return 0;

    return renderUsageEntries(container, usages, {
        heading,
        headingClass,
    });
}

function renderVerbUsagePanel(container, infinitive, options = {}) {
    if (!container) return 0;

    const {
        sectionClass = '',
        coreHeading = 'Core patterns',
        verbSetUsageHeading = 'Set-specific usages',
        usageHeading = 'Usages & examples',
        headingClass = 'verb-context-heading',
        verbSetOptions = getCurrentVerbSetOptions(),
    } = options;

    container.innerHTML = '';
    if (sectionClass) container.className = sectionClass;
    const activeVerbSet = getResolvedVerbSetSelectionBridge(verbSetOptions);

    const coreSection = document.createElement('section');
    const coreCount = renderVerbCorePatterns(coreSection, infinitive, {
        sectionClass: 'verb-context-subsection verb-core-patterns-subsection',
        heading: coreHeading,
        headingClass,
    });
    if (coreCount > 0) {
        container.appendChild(coreSection);
    }

    const verbSetUsageSection = document.createElement('section');
    const verbSetUsageCount = renderVerbSetUsages(verbSetUsageSection, infinitive, {
        sectionClass: 'verb-context-subsection verb-set-usages-subsection',
        heading: '',
        headingClass,
        verbSetOptions,
    });
    if (verbSetUsageCount > 0) {
        container.appendChild(verbSetUsageSection);
    }

    const usageSection = document.createElement('section');
    const usageCount = renderVerbUsages(usageSection, infinitive, {
        sectionClass: 'verb-context-subsection verb-usages-subsection',
        heading: coreCount > 0 || verbSetUsageCount > 0 ? usageHeading : '',
        headingClass,
    });
    if (usageCount > 0) {
        container.appendChild(usageSection);
    }

    return coreCount + verbSetUsageCount + usageCount;
}

function focusUsageExamplesInPanel(container, options = {}) {
    if (!container) return;
    const usageSection = container.querySelector('.verb-usages-subsection');
    const coreSection = container.querySelector('.verb-core-patterns-subsection');
    if (!usageSection || !coreSection) return;

    const targetTop = Math.max(0, usageSection.offsetTop - 10);
    const behavior = options.behavior || 'smooth';
    window.requestAnimationFrame(() => {
        try {
            container.scrollTo({ top: targetTop, behavior });
        } catch (error) {
            container.scrollTop = targetTop;
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    startupMark('dom-bootstrap-start');
    const PACKAGED_TTS = window.preRenderedFrenchTts || null;
    if (FRENCH_HOMOPHONE_GROUP_META) {
        appDebugLog(
            `homophone-groups loaded groups=${FRENCH_HOMOPHONE_GROUP_META.groupCount || 0} `
            + `normalizedAnswers=${FRENCH_HOMOPHONE_GROUP_META.normalizedAnswerCount || 0} `
            + `multiGroupAnswers=${FRENCH_HOMOPHONE_GROUP_META.multiGroupAnswerCount || 0}`
        );
    } else {
        appDebugLog('homophone-groups unavailable; homophone dictation fallback disabled');
    }
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
    uniqueVerbs.forEach((verb) => {
        const normalizedFrequency = normalizeFrequencyKey(verb.frequency);
        if (normalizedFrequency) verb.frequency = normalizedFrequency;
    });
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

    const discoveredFrequencies = [...new Set(uniqueVerbs.map((verb) => normalizeFrequencyKey(verb.frequency) || 'common'))];
    const allFrequencies = [
        ...KNOWN_FREQUENCY_ORDER.filter((key) => discoveredFrequencies.includes(key)),
        ...discoveredFrequencies.filter((key) => !KNOWN_FREQUENCY_ORDER.includes(key)).sort(),
    ];

    const frequencyOrder = {};
    let nextFrequencyIndex = 0;
    KNOWN_FREQUENCY_ORDER.forEach((freq) => {
        frequencyOrder[freq] = nextFrequencyIndex++;
    });
    allFrequencies.forEach((freq) => {
        if (!(freq in frequencyOrder)) {
            frequencyOrder[freq] = nextFrequencyIndex++;
        }
    });
    
    // Sort the unique `verbs` array in place. This is done once on load.
    // Note: we are sorting `uniqueVerbs`, not the original `verbs` array.
    uniqueVerbs.sort((a, b) => {
        const freqA = frequencyOrder[normalizeFrequencyKey(a.frequency)] ?? Number.MAX_SAFE_INTEGER;
        const freqB = frequencyOrder[normalizeFrequencyKey(b.frequency)] ?? Number.MAX_SAFE_INTEGER;
        // First, sort by frequency. If they are different, the sort is done.
        if (freqA !== freqB) return freqA - freqB;
        // If frequency is the same, sort alphabetically by the infinitive.
        return a.infinitive.localeCompare(b.infinitive);
    });

    const uniqueVerbByInfinitive = new Map(uniqueVerbs.map((verb) => [verb.infinitive, verb]));
    const FRAME_CARD_QUARANTINED_VERBS = new Set(['approprier', 'carter', 'coter', 'crémer', 'douer', 'enculer', 'souvenir']);
    const PREPOSITIONAL_FRAME_TYPES = new Set([
        'a_object',
        'de_object',
        'avec_object',
        'chez_person',
        'locative_a',
        'a_infinitive',
        'de_infinitive',
    ]);
    const rawVerbFrames = Array.isArray(window.verbFrames) ? window.verbFrames : [];
    const playableVerbFrames = rawVerbFrames
        .filter((entry) => entry && typeof entry === 'object')
        .filter((entry) => !entry.needs_review)
        .filter((entry) => !FRAME_CARD_QUARANTINED_VERBS.has(String(entry.verb || '').trim()))
        .filter((entry) => uniqueVerbByInfinitive.has(String(entry.verb || '').trim()));
    const verbsWithPrepositionalFrames = new Set(
        playableVerbFrames
            .filter((entry) => PREPOSITIONAL_FRAME_TYPES.has(String(entry.frame_type || '').trim()))
            .map((entry) => String(entry.verb || '').trim())
            .filter(Boolean)
    );
    const verbSetLookupByNormalizedInfinitive = new Map();
    uniqueVerbs.forEach((verb) => {
        const normalized = normalizeVerbSetVerbCandidate(verb.infinitive);
        if (normalized && !verbSetLookupByNormalizedInfinitive.has(normalized)) {
            verbSetLookupByNormalizedInfinitive.set(normalized, verb.infinitive);
        }
    });

    function inferFrameCardPronoun(text) {
        const normalized = String(text || '').trim().toLowerCase().replace(/[\u2018\u2019\u02bc]/g, "'");
        if (!normalized) return 'je';
        if (normalized.startsWith("j'") || normalized.startsWith('je ')) return 'je';
        if (normalized.startsWith('tu ')) return 'tu';
        if (normalized.startsWith('nous ')) return 'nous';
        if (normalized.startsWith('vous ')) return 'vous';
        if (normalized.startsWith('ils ') || normalized.startsWith('elles ')) return 'ils';
        if (normalized.startsWith('il ') || normalized.startsWith('elle ') || normalized.startsWith('on ')) return 'il';
        if (normalized.startsWith('ça ') || normalized.startsWith("c'")) return 'il';
        if (/^(le|la|les|un|une|ce|cet|cette)\b/.test(normalized)) return 'il';
        return 'je';
    }

    function getFrameCardPronounKey(pronoun) {
        const normalized = String(pronoun || '').trim();
        if (['il', 'elle', 'on'].includes(normalized)) return 'il/elle/on';
        if (['ils', 'elles'].includes(normalized)) return 'ils/elles';
        return normalized || 'je';
    }

    function buildFramePracticeCard(entry) {
        const verbInfo = uniqueVerbByInfinitive.get(entry.verb);
        if (!verbInfo) return null;
        const pronoun = inferFrameCardPronoun(entry.question || entry.full_answer || '');
        const answer = String(entry.answer || '').trim();
        return {
            isFrameCard: true,
            frameId: String(entry.frame_id || `${entry.verb}:frame`),
            frameType: String(entry.frame_type || 'frame'),
            frameQuestion: String(entry.question || '').trim(),
            frameAnswer: answer,
            frameFullAnswer: String(entry.full_answer || '').trim(),
            verb: verbInfo,
            tense: 'present',
            pronoun,
            pronounKey: getFrameCardPronounKey(pronoun),
            conjugated: answer,
            source: String(entry.source || '').trim(),
        };
    }
    const BUILTIN_VERB_USAGE_FALLBACKS = {
        assembler: [{ pattern: 'assembler les pièces', example_fr: 'J’assemble les pièces avant de fixer le cadre.', example_en: 'I am assembling the pieces before securing the frame.' }],
        automatiser: [{ pattern: 'automatiser une tâche', example_fr: 'On automatise une tâche répétitive avec un script simple.', example_en: 'We are automating a repetitive task with a simple script.' }],
        bidouiller: [{ pattern: 'bidouiller un montage', example_fr: 'Je bidouille un montage pour faire tenir la lampe.', example_en: 'I am tinkering with a setup to keep the lamp standing.' }],
        bricoler: [{ pattern: 'bricoler un support', example_fr: 'On bricole un support avec des chutes de bois.', example_en: 'We are cobbling together a support out of scrap wood.' }],
        calculer: [{ pattern: 'calculer un total', example_fr: 'Elle calcule le total avant de rendre sa copie.', example_en: 'She is calculating the total before handing in her work.' }],
        camper: [{ pattern: 'camper en forêt', example_fr: 'Nous campons en forêt malgré le vent.', example_en: 'We are camping in the woods despite the wind.' }],
        cliquer: [{ pattern: 'cliquer sur un lien', example_fr: 'Il clique sur un lien pour ouvrir la documentation.', example_en: 'He is clicking a link to open the documentation.' }],
        clouer: [{ pattern: 'clouer un fond', example_fr: 'Il cloue le fond de la caisse avant de la renforcer.', example_en: 'He is nailing the bottom of the crate before reinforcing it.' }],
        contrer: [{ pattern: 'contrer un tir', example_fr: 'Il contre un tir juste avant le buzzer.', example_en: 'He is blocking a shot right before the buzzer.' }],
        coder: [{ pattern: 'coder une fonctionnalité', example_fr: 'Je code une fonctionnalité avant la réunion de démo.', example_en: 'I am coding a feature before the demo meeting.' }],
        collectionner: [{ pattern: 'collectionner des affiches', example_fr: 'Elle collectionne des affiches anciennes de cinéma.', example_en: 'She collects vintage movie posters.' }],
        configurer: [{ pattern: 'configurer un service', example_fr: 'Nous configurons un service pour la nouvelle équipe.', example_en: 'We are configuring a service for the new team.' }],
        coudre: [{ pattern: 'coudre à la main', example_fr: 'Elle coud à la main pour finir l’ourlet.', example_en: 'She is sewing by hand to finish the hem.' }],
        cuver: [{ pattern: 'cuver sur le canapé', example_fr: 'Il cuve sur le canapé après être rentré à l’aube.', example_en: 'He is sleeping it off on the couch after getting home at dawn.' }],
        débattre: [{ pattern: 'débattre d’un sujet', example_fr: 'Ils débattent d’un sujet sensible pendant l’émission.', example_en: 'They are debating a sensitive issue during the program.' }],
        déboguer: [{ pattern: 'déboguer une erreur', example_fr: 'Je débogue une erreur qui bloque la page d’accueil.', example_en: 'I am debugging an error that blocks the home page.' }],
        déconner: [{ pattern: 'déconner entre potes', example_fr: 'On déconne un peu trop après minuit au bar.', example_en: 'We are messing around a bit too much at the bar after midnight.' }],
        déployer: [{ pattern: 'déployer un correctif', example_fr: 'On déploie un correctif avant la pause déjeuner.', example_en: 'We are deploying a fix before lunch.' }],
        diffuser: [{ pattern: 'diffuser un épisode', example_fr: 'La chaîne diffuse un épisode spécial ce soir.', example_en: 'The channel is broadcasting a special episode tonight.' }],
        dribbler: [{ pattern: 'dribbler jusqu’au cercle', example_fr: 'Elle dribble jusqu’au cercle avant de finir main gauche.', example_en: 'She is dribbling to the rim before finishing left-handed.' }],
        écouter: [{ pattern: 'écouter un morceau', example_fr: 'J’écoute un morceau pour vérifier le mixage.', example_en: 'I am listening to a track to check the mix.' }],
        embarquer: [{ pattern: 'embarquer à l’heure', example_fr: 'Les passagers embarquent à l’heure malgré la pluie.', example_en: 'The passengers are boarding on time despite the rain.' }],
        engueuler: [{ pattern: 'engueuler quelqu’un', example_fr: 'Elle engueule son ex en pleine rue après le mensonge de trop.', example_en: 'She is yelling at her ex in the middle of the street after one lie too many.' }],
        escalader: [{ pattern: 'escalader une paroi', example_fr: 'Ils escaladent une paroi avant midi.', example_en: 'They are climbing a rock face before noon.' }],
        explorer: [{ pattern: 'explorer un quartier', example_fr: 'Nous explorons un quartier calme derrière la gare.', example_en: 'We are exploring a quiet neighborhood behind the station.' }],
        flirter: [{ pattern: 'flirter au bar', example_fr: 'Ils flirtent au bar sans se prendre au sérieux.', example_en: 'They are flirting at the bar without taking themselves too seriously.' }],
        foirer: [{ pattern: 'foirer une découpe', example_fr: 'Je foire la découpe si je vais trop vite.', example_en: 'I mess up the cut if I go too fast.' }],
        frapper: [{ pattern: 'frapper au marteau', example_fr: 'Il frappe au marteau pour faire rentrer l’assemblage sans fendre le bois.', example_en: 'He is striking with a hammer to seat the joint without splitting the wood.' }],
        frire: [{ pattern: 'frire des légumes', example_fr: 'Elle fait frire des légumes avec un peu d’huile.', example_en: 'She is frying vegetables with a little oil.' }],
        goûter: [{ pattern: 'goûter une sauce', example_fr: 'Je goûte une sauce avant de servir le plat.', example_en: 'I am tasting a sauce before serving the dish.' }],
        gouverner: [{ pattern: 'gouverner un pays', example_fr: 'Il promet de gouverner le pays avec plus de transparence.', example_en: 'He promises to govern the country with more transparency.' }],
        graver: [{ pattern: 'graver un motif', example_fr: 'Elle grave un motif simple sur le bois.', example_en: 'She is engraving a simple pattern into the wood.' }],
        imprimer: [{ pattern: 'imprimer un dossier', example_fr: 'J’imprime un dossier pour la réunion de demain.', example_en: 'I am printing a file for tomorrow’s meeting.' }],
        improviser: [{ pattern: 'improviser un solo', example_fr: 'Il improvise un solo pendant la balance.', example_en: 'He is improvising a solo during soundcheck.' }],
        interpréter: [{ pattern: 'interpréter un rôle', example_fr: 'Elle interprète un rôle difficile dans la série.', example_en: 'She is playing a difficult role in the series.' }],
        larguer: [{ pattern: 'larguer quelqu’un', example_fr: 'Il la largue par message après des semaines de tension.', example_en: 'He is dumping her by text after weeks of tension.' }],
        manifester: [{ pattern: 'manifester dans la rue', example_fr: 'Des étudiants manifestent dans la rue cet après-midi.', example_en: 'Students are demonstrating in the street this afternoon.' }],
        marcher: [{ pattern: 'marcher longtemps', example_fr: 'Nous marchons longtemps avant d’atteindre le sommet.', example_en: 'We are walking for a long time before reaching the summit.' }],
        merder: [{ pattern: 'merder sur une finition', example_fr: 'On merde sur la finition dès qu’on se dépêche.', example_en: 'We mess up the finish as soon as we rush.' }],
        mesurer: [{ pattern: 'mesurer une planche', example_fr: 'Il mesure une planche avant de la couper.', example_en: 'He is measuring a board before cutting it.' }],
        modeler: [{ pattern: 'modeler une forme', example_fr: 'Elle modèle une forme souple dans l’atelier.', example_en: 'She is shaping a soft form in the studio.' }],
        naviguer: [{ pattern: 'naviguer en kayak', example_fr: 'Ils naviguent en kayak sur une rivière calme.', example_en: 'They are paddling by kayak on a calm river.' }],
        pagayer: [{ pattern: 'pagayer ensemble', example_fr: 'Nous pagayons ensemble pour garder le rythme.', example_en: 'We are paddling together to keep the rhythm.' }],
        pêcher: [{ pattern: 'pêcher tôt le matin', example_fr: 'Il pêche tôt le matin près du ponton.', example_en: 'He is fishing early in the morning near the dock.' }],
        percer: [{ pattern: 'percer un avant-trou', example_fr: 'Je perce un avant-trou pour éviter de fendre le bois.', example_en: 'I am drilling a pilot hole to keep the wood from splitting.' }],
        picoler: [{ pattern: 'picoler toute la soirée', example_fr: 'Ils picolent toute la soirée avant de finir au kebab.', example_en: 'They are drinking all evening before ending up at the kebab shop.' }],
        photographier: [{ pattern: 'photographier une scène', example_fr: 'Je photographie une scène de rue au coucher du soleil.', example_en: 'I am photographing a street scene at sunset.' }],
        plaquer: [{ pattern: 'plaquer un adversaire', example_fr: 'Il plaque son adversaire près de la ligne.', example_en: 'He is tackling his opponent near the line.' }],
        planifier: [{ pattern: 'planifier la semaine', example_fr: 'Nous planifions la semaine avant d’ouvrir le bureau.', example_en: 'We are planning the week before opening the office.' }],
        planter: [{ pattern: 'se planter sur une mesure', example_fr: 'Je me plante sur une mesure et tout l’assemblage part de travers.', example_en: 'I mess up a measurement and the whole assembly goes crooked.' }],
        poncer: [{ pattern: 'poncer une surface', example_fr: 'Il ponce une surface pour la rendre lisse.', example_en: 'He is sanding a surface to make it smooth.' }],
        programmer: [{ pattern: 'programmer une solution', example_fr: 'Elle programme une solution plus robuste pour le service.', example_en: 'She is programming a more robust solution for the service.' }],
        protester: [{ pattern: 'protester contre une décision', example_fr: 'Ils protestent contre une décision jugée injuste.', example_en: 'They are protesting against a decision seen as unfair.' }],
        raboter: [{ pattern: 'raboter un chant', example_fr: 'Je rabote le chant pour rattraper le faux niveau.', example_en: 'I am planing the edge to fix the uneven level.' }],
        rafistoler: [{ pattern: 'rafistoler un tabouret', example_fr: 'Il rafistole un vieux tabouret avec ce qu’il a sous la main.', example_en: 'He is patching up an old stool with whatever he has on hand.' }],
        randonner: [{ pattern: 'randonner en montagne', example_fr: 'Nous randonnons en montagne pendant tout le week-end.', example_en: 'We are hiking in the mountains all weekend.' }],
        rater: [{ pattern: 'rater l’alignement', example_fr: 'Elle rate l’alignement du tiroir de quelques millimètres.', example_en: 'She misses the drawer alignment by a few millimeters.' }],
        réformer: [{ pattern: 'réformer un système', example_fr: 'Le gouvernement veut réformer un système devenu trop lent.', example_en: 'The government wants to reform a system that has become too slow.' }],
        réviser: [{ pattern: 'réviser un chapitre', example_fr: 'Elle révise un chapitre avant le contrôle.', example_en: 'She is reviewing a chapter before the test.' }],
        rôtir: [{ pattern: 'rôtir au four', example_fr: 'Le chef fait rôtir les légumes au four.', example_en: 'The chef is roasting the vegetables in the oven.' }],
        sculpter: [{ pattern: 'sculpter une pièce', example_fr: 'Il sculpte une pièce plus fine pour l’exposition.', example_en: 'He is sculpting a more refined piece for the exhibition.' }],
        séduire: [{ pattern: 'séduire quelqu’un', example_fr: 'Il essaie de séduire quelqu’un avec son humour.', example_en: 'He is trying to charm someone with his humor.' }],
        séjourner: [{ pattern: 'séjourner quelques jours', example_fr: 'Nous séjournons quelques jours dans le vieux centre.', example_en: 'We are staying a few days in the old center.' }],
        skier: [{ pattern: 'skier toute la journée', example_fr: 'Ils skient toute la journée malgré le froid.', example_en: 'They are skiing all day despite the cold.' }],
        surfer: [{ pattern: 'surfer tôt', example_fr: 'Elle surfe tôt pour profiter des meilleures vagues.', example_en: 'She is surfing early to catch the best waves.' }],
        sprinter: [{ pattern: 'sprinter vers la ligne', example_fr: 'Il sprinte vers la ligne pour sauver le ballon.', example_en: 'He is sprinting toward the line to save the ball.' }],
        tailler: [{ pattern: 'tailler le bois', example_fr: 'Je taille le bois avec un petit couteau précis.', example_en: 'I am carving the wood with a small precise knife.' }],
        tisser: [{ pattern: 'tisser un motif', example_fr: 'Elle tisse un motif régulier sur le métier.', example_en: 'She is weaving a regular pattern on the loom.' }],
        traduire: [{ pattern: 'traduire un passage', example_fr: 'Ils traduisent un passage difficile en groupe.', example_en: 'They are translating a difficult passage together.' }],
        travailler: [{ pattern: 'travailler tard', example_fr: 'Nous travaillons tard pour finir le dossier.', example_en: 'We are working late to finish the file.' }],
        tricoter: [{ pattern: 'tricoter une écharpe', example_fr: 'Elle tricote une écharpe pour l’hiver.', example_en: 'She is knitting a scarf for winter.' }],
        trinquer: [{ pattern: 'trinquer au succès', example_fr: 'On trinque au succès du projet après la présentation.', example_en: 'We are toasting the project’s success after the presentation.' }],
        ajuster: [{ pattern: 'ajuster un panneau', example_fr: 'J’ajuste le panneau avant de fixer la dernière vis.', example_en: 'I am adjusting the panel before fastening the last screw.' }],
        appeler: [{ pattern: 'appeler quelqu’un', example_fr: 'Je l’appelle en sortant du métro.', example_en: 'I am calling them as I leave the subway.' }],
        archiver: [{ pattern: 'archiver un dossier', example_fr: 'Elle archive le dossier une fois le projet bouclé.', example_en: 'She is archiving the file once the project is wrapped up.' }],
        bachoter: [{ pattern: 'bachoter toute la nuit', example_fr: 'Il bachote toute la nuit avant le partiel.', example_en: 'He is cramming all night before the exam.' }],
        bosser: [{ pattern: 'bosser tard', example_fr: 'On bosse tard pour sortir la version avant vendredi.', example_en: 'We are working late to ship the release before Friday.' }],
        bouffer: [{ pattern: 'bouffer sur le pouce', example_fr: 'On bouffe sur le pouce entre deux réunions.', example_en: 'We are grabbing a quick bite between two meetings.' }],
        boycotter: [{ pattern: 'boycotter une marque', example_fr: 'Ils boycottent la marque après la dernière polémique.', example_en: 'They are boycotting the brand after the latest controversy.' }],
        bouger: [{ pattern: 'bouger vite', example_fr: 'Il faut bouger vite si on veut avoir une table.', example_en: 'We need to move fast if we want to get a table.' }],
        brancher: [{ pattern: 'brancher la sono', example_fr: 'Je branche la sono avant les balances.', example_en: 'I am hooking up the sound system before soundcheck.' }],
        caler: [{ pattern: 'caler un créneau', example_fr: 'On cale un créneau demain matin pour en parler.', example_en: 'We are locking in a time slot tomorrow morning to talk about it.' }],
        classer: [{ pattern: 'classer des archives', example_fr: 'Elle classe des archives dans la réserve du musée.', example_en: 'She is sorting archives in the museum storage room.' }],
        conserver: [{ pattern: 'conserver une trace', example_fr: 'Le labo conserve une trace de chaque restauration.', example_en: 'The lab keeps a record of every restoration.' }],
        crapahuter: [{ pattern: 'crapahuter sur le sentier', example_fr: 'On crapahute sur le sentier depuis le lever du jour.', example_en: 'We are scrambling along the trail since daybreak.' }],
        croquer: [{ pattern: 'croquer un visage', example_fr: 'Elle croque un visage en quelques traits rapides.', example_en: 'She is sketching a face in a few quick strokes.' }],
        cuire: [{ pattern: 'cuire à feu doux', example_fr: 'La sauce cuit à feu doux pendant qu’on dresse la table.', example_en: 'The sauce is cooking over low heat while we set the table.' }],
        débarquer: [{ pattern: 'débarquer quelque part', example_fr: 'On débarque à Lisbonne avec juste deux sacs chacun.', example_en: 'We are arriving in Lisbon with just two bags each.' }],
        démonter: [{ pattern: 'démonter une pièce', example_fr: 'Il démonte la pièce pour comprendre d’où vient le jeu.', example_en: 'He is taking the piece apart to understand where the slack comes from.' }],
        dévorer: [{ pattern: 'dévorer son assiette', example_fr: 'Ils dévorent leur assiette après l’entraînement.', example_en: 'They are wolfing down their meal after practice.' }],
        documenter: [{ pattern: 'documenter un process', example_fr: 'Je documente le process pour éviter de refaire les mêmes erreurs.', example_en: 'I am documenting the process to avoid repeating the same mistakes.' }],
        dresser: [{ pattern: 'dresser une assiette', example_fr: 'Le chef dresse les assiettes juste avant le service.', example_en: 'The chef is plating the dishes right before service.' }],
        embrouiller: [{ pattern: 'embrouiller quelqu’un', example_fr: 'Il l’embrouille avec des explications qui ne tiennent pas debout.', example_en: 'He is confusing her with explanations that do not hold up.' }],
        envoyer: [{ pattern: 'envoyer un message', example_fr: 'Je t’envoie un message dès que j’arrive.', example_en: 'I am sending you a message as soon as I get there.' }],
        errer: [{ pattern: 'errer dans une ville', example_fr: 'On erre dans les ruelles sans vrai plan pour l’après-midi.', example_en: 'We are wandering the alleys without a real plan for the afternoon.' }],
        esquisser: [{ pattern: 'esquisser une idée', example_fr: 'Il esquisse une idée de décor sur un coin de carnet.', example_en: 'He is sketching out a set idea in the corner of a notebook.' }],
        fermer: [{ pattern: 'fermer la porte', example_fr: 'Tu peux fermer la porte en sortant ?', example_en: 'Can you close the door on your way out?' }],
        flâner: [{ pattern: 'flâner dans un quartier', example_fr: 'Nous flânons dans le vieux quartier sans regarder l’heure.', example_en: 'We are strolling around the old quarter without checking the time.' }],
        fouiller: [{ pattern: 'fouiller les archives', example_fr: 'Elle fouille les archives pour retrouver une lettre perdue.', example_en: 'She is digging through the archives to find a lost letter.' }],
        fusionner: [{ pattern: 'fusionner deux branches', example_fr: 'On fusionne deux branches avant la mise en prod.', example_en: 'We are merging two branches before production release.' }],
        galoper: [{ pattern: 'galoper sur la plage', example_fr: 'Ils galopent sur la plage avant la tombée du jour.', example_en: 'They are galloping on the beach before nightfall.' }],
        grignoter: [{ pattern: 'grignoter entre amis', example_fr: 'On grignote un peu avant de repartir danser.', example_en: 'We are snacking a bit before going back out dancing.' }],
        kiffer: [{ pattern: 'kiffer l’ambiance', example_fr: 'Ils kiffent l’ambiance du bar dès les premières minutes.', example_en: 'They are really into the vibe of the bar from the first few minutes.' }],
        mater: [{ pattern: 'mater une série', example_fr: 'On mate une série nulle juste pour débrancher.', example_en: 'We are watching a dumb series just to switch off.' }],
        mijoter: [{ pattern: 'mijoter tranquillement', example_fr: 'Le plat mijote tranquillement pendant qu’on prépare le reste.', example_en: 'The dish is simmering away while we prepare the rest.' }],
        militer: [{ pattern: 'militer pour une cause', example_fr: 'Elle milite pour une réforme du logement depuis des années.', example_en: 'She is campaigning for housing reform and has been for years.' }],
        mixer: [{ pattern: 'mixer un morceau', example_fr: 'Il mixe le morceau une dernière fois avant l’envoi.', example_en: 'He is mixing the track one last time before sending it off.' }],
        montrer: [{ pattern: 'montrer quelque chose', example_fr: 'Je te montre comment ça marche en deux minutes.', example_en: 'I am showing you how it works in two minutes.' }],
        nettoyer: [{ pattern: 'nettoyer le plan de travail', example_fr: 'Elle nettoie le plan de travail pendant que l’eau bout.', example_en: 'She is cleaning the counter while the water boils.' }],
        ouvrir: [{ pattern: 'ouvrir la fenêtre', example_fr: 'J’ouvre la fenêtre parce qu’il fait trop chaud.', example_en: 'I am opening the window because it is too hot.' }],
        oublier: [{ pattern: 'oublier quelque chose', example_fr: 'J’oublie toujours un truc quand je pars trop vite.', example_en: 'I always forget something when I leave in too much of a rush.' }],
        payer: [{ pattern: 'payer l’addition', example_fr: 'Je paie l’addition pendant que vous prenez vos vestes.', example_en: 'I am paying the bill while you grab your jackets.' }],
        pointer: [{ pattern: 'pointer un problème', example_fr: 'Elle pointe un problème que personne n’avait vu.', example_en: 'She is pointing out a problem nobody had noticed.' }],
        poser: [{ pattern: 'poser quelque chose', example_fr: 'Pose ça ici, on verra après.', example_en: 'Put that here and we will deal with it later.' }],
        potasser: [{ pattern: 'potasser un chapitre', example_fr: 'Je potasse le chapitre depuis le début de l’après-midi.', example_en: 'I have been grinding through the chapter since early afternoon.' }],
        ramener: [{ pattern: 'ramener quelqu’un', example_fr: 'Je le ramène en voiture après le dîner.', example_en: 'I am giving him a ride home after dinner.' }],
        ranger: [{ pattern: 'ranger le bureau', example_fr: 'Elle range le bureau avant l’arrivée du client.', example_en: 'She is tidying the office before the client arrives.' }],
        relancer: [{ pattern: 'relancer un contact', example_fr: 'Je relance le client parce qu’on n’a toujours pas de réponse.', example_en: 'I am following up with the client because we still do not have an answer.' }],
        reprocher: [{ pattern: 'reprocher quelque chose à quelqu’un', example_fr: 'Elle lui reproche encore de ne jamais répondre franchement.', example_en: 'She is once again blaming him for never answering honestly.' }],
        retoucher: [{ pattern: 'retoucher une image', example_fr: 'Il retouche l’image pour calmer un peu les contrastes.', example_en: 'He is touching up the image to soften the contrast a bit.' }],
        régler: [{ pattern: 'régler un souci', example_fr: 'On règle le souci avant que ça remonte à tout le monde.', example_en: 'We are sorting out the issue before it blows up for everyone.' }],
        ramer: [{ pattern: 'ramer contre le courant', example_fr: 'Ils rament contre le courant depuis plus d’une heure.', example_en: 'They are rowing against the current for more than an hour.' }],
        saisir: [{ pattern: 'saisir la viande', example_fr: 'Je saisis la viande très fort avant de baisser le feu.', example_en: 'I am searing the meat hard before lowering the heat.' }],
        sauvegarder: [{ pattern: 'sauvegarder son travail', example_fr: 'Pense à sauvegarder ton travail avant de fermer.', example_en: 'Remember to save your work before closing.' }],
        souder: [{ pattern: 'souder une jonction', example_fr: 'Il soude la jonction avant de poncer les bords.', example_en: 'He is soldering the joint before sanding the edges.' }],
        survoler: [{ pattern: 'survoler un cours', example_fr: 'Je survole le cours pour repérer les points à revoir.', example_en: 'I am skimming the course to spot what I need to review.' }],
        tracer: [{ pattern: 'tracer une ligne', example_fr: 'Elle trace une ligne nette avant de couper.', example_en: 'She is marking a clean line before cutting.' }],
        traîner: [{ pattern: 'traîner quelque part', example_fr: 'On traîne encore un peu dehors avant de rentrer.', example_en: 'We are hanging around outside a bit longer before heading home.' }],
        trimballer: [{ pattern: 'trimballer sa valise', example_fr: 'Je trimballe ma valise dans tout le quartier depuis une heure.', example_en: 'I am lugging my suitcase all over the neighborhood for an hour.' }],
        traiter: [{ pattern: 'traiter un sujet', example_fr: 'Le journal traite le sujet sous un angle très politique.', example_en: 'The paper is covering the issue from a very political angle.' }],
        valider: [{ pattern: 'valider une version', example_fr: 'On valide la version finale après le dernier test.', example_en: 'We are validating the final version after the last test.' }],
        verser: [{ pattern: 'verser une sauce', example_fr: 'Elle verse la sauce juste avant de servir.', example_en: 'She is pouring the sauce just before serving.' }],
        vernir: [{ pattern: 'vernir la pièce', example_fr: 'Elle vernit la pièce après le dernier ponçage.', example_en: 'She is varnishing the piece after the final sanding.' }],
        visser: [{ pattern: 'visser une charnière', example_fr: 'Elle visse la charnière avant d’ajuster la porte.', example_en: 'She is screwing on the hinge before adjusting the door.' }],
        voter: [{ pattern: 'voter dimanche', example_fr: 'Ils votent dimanche dans leur quartier.', example_en: 'They are voting on Sunday in their neighborhood.' }],
        voyager: [{ pattern: 'voyager léger', example_fr: 'Je voyage léger pour changer de ville plus facilement.', example_en: 'I am traveling light to move between cities more easily.' }],
        zoner: [{ pattern: 'zoner en ville', example_fr: 'Ils zonent en ville sans savoir où finir la nuit.', example_en: 'They are drifting around town without knowing where they will end the night.' }],
    };
    const BUILTIN_VERB_SET_DEFINITIONS = [
        {
            id: 'builtin-super-everyday',
            name: 'Super Everyday',
            scope: 'core daily life, errands, movement, conversations',
            verbs: ['être', 'avoir', 'faire', 'aller', 'venir', 'prendre', 'mettre', 'parler', 'aimer', 'donner', 'trouver', 'passer', 'laisser', 'demander', 'acheter', 'manger', 'boire', 'regarder', 'écouter', 'sortir', 'rentrer', 'arriver', 'partir', 'travailler', 'attendre', 'ouvrir', 'fermer', 'porter', 'poser', 'montrer', 'appeler', 'envoyer', 'payer', 'aider', 'oublier', 'ramener', 'ranger', 'bouger', 'traîner'],
            topicUsages: {
                attendre: [{ pattern: 'attendre quelqu’un', example_fr: 'J’attends quelqu’un devant la boulangerie.', example_en: 'I am waiting for someone in front of the bakery.' }],
                payer: [{ pattern: 'payer l’addition', example_fr: 'Je paie l’addition pendant que vous mettez vos manteaux.', example_en: 'I am paying the bill while you put on your coats.' }],
                traîner: [{ pattern: 'traîner dehors', example_fr: 'On traîne dehors après le dîner parce qu’il fait bon.', example_en: 'We are hanging around outside after dinner because the weather is nice.' }],
            },
        },
        {
            id: 'builtin-sports-fitness',
            name: 'Sports & Fitness',
            scope: 'training, competition, ball sports, defense, injuries',
            verbs: ['jouer', 'courir', 'nager', 'sauter', 'skier', 'surfer', 'entraîner', 'gagner', 'perdre', 'marquer', 'tirer', 'passer', 'lancer', 'recevoir', 'attraper', 'dribbler', 'bloquer', 'défendre', 'contrer', 'sprinter', 'plaquer', 'frapper', 'centrer', 'changer', 'blesser', 'tomber', 'boiter', 'soigner', 'glacer', 'tordre', 'saigner', 'bander'],
            topicUsages: {
                courir: [
                    {
                        pattern: 'courir un 10 km',
                        example_fr: 'Je cours un 10 km dimanche avec mon club.',
                        example_en: 'I am running a 10K on Sunday with my club.',
                    },
                ],
                tirer: [
                    {
                        pattern: 'tirer de loin',
                        example_fr: 'Il tire de loin dès que la défense recule.',
                        example_en: 'He is shooting from long range as soon as the defense drops back.',
                    },
                ],
                passer: [
                    {
                        pattern: 'passer le ballon',
                        example_fr: 'Elle passe le ballon au dernier moment pour créer le décalage.',
                        example_en: 'She is passing the ball at the last moment to create space.',
                    },
                ],
                dribbler: [
                    {
                        pattern: 'dribbler son défenseur',
                        example_fr: 'Il dribble son défenseur avant d’attaquer le panier.',
                        example_en: 'He is dribbling past his defender before attacking the basket.',
                    },
                ],
                défendre: [
                    {
                        pattern: 'défendre fort',
                        example_fr: 'On défend fort tout le quatrième quart-temps.',
                        example_en: 'We are defending hard for the whole fourth quarter.',
                    },
                ],
                contrer: [
                    {
                        pattern: 'contrer un tir',
                        example_fr: 'Elle contre un tir près de la planche en fin de match.',
                        example_en: 'She is blocking a shot near the backboard late in the game.',
                    },
                ],
                bloquer: [
                    {
                        pattern: 'bloquer un adversaire',
                        example_fr: 'Il bloque un adversaire pour libérer le rebond.',
                        example_en: 'He is boxing out an opponent to free up the rebound.',
                    },
                ],
                centrer: [
                    {
                        pattern: 'centrer en retrait',
                        example_fr: 'Il centre en retrait pour un coéquipier lancé.',
                        example_en: 'He is cutting the ball back for an onrushing teammate.',
                    },
                ],
                plaquer: [
                    {
                        pattern: 'plaquer bas',
                        example_fr: 'Il plaque bas pour arrêter l’action net.',
                        example_en: 'He is tackling low to stop the play cleanly.',
                    },
                ],
                blesser: [
                    {
                        pattern: 'se blesser à l’entraînement',
                        example_fr: 'Elle se blesse à l’entraînement en retombant sur un pied.',
                        example_en: 'She gets injured in training by landing on someone’s foot.',
                    },
                ],
                boiter: [
                    {
                        pattern: 'boiter après le match',
                        example_fr: 'Il boite encore après le choc au genou de la veille.',
                        example_en: 'He is still limping after yesterday’s knock to the knee.',
                    },
                ],
                glacer: [
                    {
                        pattern: 'glacer une cheville',
                        example_fr: 'On glace sa cheville tout de suite après la torsion.',
                        example_en: 'We are icing his ankle right after the twist.',
                    },
                ],
                bander: [
                    {
                        pattern: 'bander un genou',
                        example_fr: 'Le kiné lui bande le genou avant la reprise.',
                        example_en: 'The physio is wrapping his knee before he gets back out there.',
                    },
                ],
            },
        },
        {
            id: 'builtin-cooking-food',
            name: 'Cooking & Food',
            scope: 'kitchen, meals, service, casual eating, cuts & burns',
            verbs: ['cuisiner', 'couper', 'mélanger', 'préparer', 'manger', 'boire', 'servir', 'goûter', 'frire', 'rôtir', 'cuire', 'verser', 'dresser', 'nettoyer', 'éplucher', 'mijoter', 'bouffer', 'grignoter', 'dévorer', 'saisir', 'mixer', 'brûler', 'saigner'],
            topicUsages: {
                préparer: [
                    {
                        pattern: 'préparer le dîner',
                        example_fr: 'Je prépare le dîner pendant que le four chauffe.',
                        example_en: 'I am preparing dinner while the oven heats up.',
                    },
                ],
                mijoter: [
                    {
                        pattern: 'mijoter tranquillement',
                        example_fr: 'Le plat mijote depuis une heure et toute la cuisine sent bon.',
                        example_en: 'The dish has been simmering for an hour and the whole kitchen smells amazing.',
                    },
                ],
                saisir: [
                    {
                        pattern: 'saisir la viande',
                        example_fr: 'Il saisit la viande très fort pour bien la colorer.',
                        example_en: 'He is searing the meat hard to brown it well.',
                    },
                ],
                bouffer: [
                    {
                        pattern: 'bouffer sur le pouce',
                        example_fr: 'On bouffe sur le pouce avant de repartir bosser.',
                        example_en: 'We are grabbing a quick bite before heading back to work.',
                    },
                ],
                dresser: [
                    {
                        pattern: 'dresser une assiette',
                        example_fr: 'Elle dresse les assiettes pendant que le chef goûte la sauce.',
                        example_en: 'She is plating the dishes while the chef tastes the sauce.',
                    },
                ],
                brûler: [
                    {
                        pattern: 'se brûler en cuisine',
                        example_fr: 'Je me brûle en sortant la plaque du four trop vite.',
                        example_en: 'I burn myself taking the tray out of the oven too quickly.',
                    },
                ],
                couper: [
                    {
                        pattern: 'se couper en épluchant',
                        example_fr: 'Il se coupe en épluchant les légumes à toute vitesse.',
                        example_en: 'He cuts himself peeling vegetables too fast.',
                    },
                ],
                saigner: [
                    {
                        pattern: 'saigner du doigt',
                        example_fr: 'Elle saigne du doigt après avoir ripé avec le couteau.',
                        example_en: 'Her finger is bleeding after the knife slipped.',
                    },
                ],
            },
        },
        {
            id: 'builtin-outdoors-nature',
            name: 'Outdoors & Nature',
            scope: 'hiking, camping, trails, water, exploration',
            verbs: ['marcher', 'camper', 'randonner', 'explorer', 'grimper', 'pagayer', 'pêcher', 'observer', 'escalader', 'naviguer', 'ramer', 'crapahuter', 'tracer', 'galoper'],
            topicUsages: {
                camper: [
                    {
                        pattern: 'camper près du lac',
                        example_fr: 'Nous campons près du lac pour voir le lever du soleil.',
                        example_en: 'We are camping by the lake to watch the sunrise.',
                    },
                ],
                crapahuter: [
                    {
                        pattern: 'crapahuter dans les rochers',
                        example_fr: 'On crapahute dans les rochers depuis le matin avec les sacs sur le dos.',
                        example_en: 'We have been scrambling over the rocks since morning with packs on our backs.',
                    },
                ],
                ramer: [
                    {
                        pattern: 'ramer contre le vent',
                        example_fr: 'Ils rament contre le vent pour rejoindre la rive avant l’orage.',
                        example_en: 'They are rowing into the wind to reach the shore before the storm.',
                    },
                ],
                tracer: [
                    {
                        pattern: 'tracer un itinéraire',
                        example_fr: 'Je trace un itinéraire plus court avant qu’il fasse nuit.',
                        example_en: 'I am mapping out a shorter route before it gets dark.',
                    },
                ],
            },
        },
        {
            id: 'builtin-woodworking',
            name: 'Woodworking',
            scope: 'cutting, sanding, shaping, fitting, assembly',
            verbs: ['sculpter', 'tailler', 'poncer', 'mesurer', 'assembler', 'fabriquer', 'graver', 'coller', 'percer', 'visser', 'clouer', 'raboter', 'vernir', 'frapper', 'ajuster', 'monter', 'démonter', 'régler'],
            topicUsages: {
                poncer: [
                    {
                        pattern: 'poncer une planche',
                        example_fr: 'Il ponce une planche avant de la vernir.',
                        example_en: 'He is sanding a board before varnishing it.',
                    },
                ],
                percer: [
                    {
                        pattern: 'percer un avant-trou',
                        example_fr: 'Je perce un avant-trou pour éviter que la planche fende.',
                        example_en: 'I am drilling a pilot hole so the board does not split.',
                    },
                ],
                visser: [
                    {
                        pattern: 'visser une charnière',
                        example_fr: 'Elle visse une charnière avant d’aligner la porte.',
                        example_en: 'She is screwing on a hinge before aligning the door.',
                    },
                ],
                raboter: [
                    {
                        pattern: 'raboter un bord',
                        example_fr: 'Il rabote un bord pour que le tiroir coulisse mieux.',
                        example_en: 'He is planing an edge so the drawer slides better.',
                    },
                ],
                vernir: [
                    {
                        pattern: 'vernir une pièce',
                        example_fr: 'Je vernis la pièce une fois la poussière retirée.',
                        example_en: 'I am varnishing the piece once the dust is gone.',
                    },
                ],
                frapper: [
                    {
                        pattern: 'frapper au maillet',
                        example_fr: 'Il frappe au maillet pour ajuster le tenon sans marquer la surface.',
                        example_en: 'He is striking with a mallet to fit the tenon without denting the surface.',
                    },
                ],
                ajuster: [
                    {
                        pattern: 'ajuster un assemblage',
                        example_fr: 'Je dois ajuster l’assemblage au millimètre pour que ça ferme bien.',
                        example_en: 'I need to fine-tune the joint to the millimeter so it closes properly.',
                    },
                ],
                démonter: [
                    {
                        pattern: 'démonter un gabarit',
                        example_fr: 'Il démonte le gabarit pour corriger ce qui coinçait.',
                        example_en: 'He is taking the jig apart to fix what was binding.',
                    },
                ],
            },
        },
        {
            id: 'builtin-art-design',
            name: 'Art & Design',
            scope: 'visual art, sketching, making, exhibiting',
            verbs: ['dessiner', 'peindre', 'sculpter', 'exposer', 'créer', 'photographier', 'filmer', 'graver', 'modeler', 'esquisser', 'croquer', 'retoucher', 'tracer', 'restaurer'],
            topicUsages: {
                exposer: [
                    {
                        pattern: 'exposer ses oeuvres',
                        example_fr: 'Elle expose ses oeuvres dans une petite galerie du centre.',
                        example_en: 'She is exhibiting her work in a small downtown gallery.',
                    },
                ],
                esquisser: [
                    {
                        pattern: 'esquisser une composition',
                        example_fr: 'Il esquisse une composition avant de sortir les couleurs.',
                        example_en: 'He is sketching out a composition before pulling out the colors.',
                    },
                ],
                retoucher: [
                    {
                        pattern: 'retoucher une photo',
                        example_fr: 'Elle retouche une photo jusqu’à ce que la lumière tienne vraiment.',
                        example_en: 'She is touching up a photo until the lighting really works.',
                    },
                ],
                croquer: [
                    {
                        pattern: 'croquer une scène',
                        example_fr: 'Je croque la scène depuis le fond de la salle pendant les répétitions.',
                        example_en: 'I am sketching the scene from the back of the room during rehearsals.',
                    },
                ],
            },
        },
        {
            id: 'builtin-nightlife-partying',
            name: 'Nightlife & Partying',
            scope: 'going out, bars, flirting, afters',
            verbs: ['sortir', 'boire', 'danser', 'fêter', 'trinquer', 'inviter', 'dépenser', 'rentrer', 'draguer', 'dormir', 'picoler', 'cuver', 'déconner', 'flirter', 'brancher', 'kiffer', 'mater', 'zoner', 'bouffer'],
            topicUsages: {
                trinquer: [
                    {
                        pattern: 'trinquer à quelque chose',
                        example_fr: 'On trinque à la fin de la semaine avec des amis.',
                        example_en: 'We are toasting the end of the week with friends.',
                    },
                ],
                picoler: [
                    {
                        pattern: 'picoler toute la soirée',
                        example_fr: 'Ils picolent toute la soirée avant de changer de bar.',
                        example_en: 'They are drinking all evening before changing bars.',
                    },
                ],
                cuver: [
                    {
                        pattern: 'cuver le lendemain',
                        example_fr: 'Il cuve tout le dimanche après avoir trop bu.',
                        example_en: 'He is sleeping it off all Sunday after drinking too much.',
                    },
                ],
                déconner: [
                    {
                        pattern: 'déconner avec des amis',
                        example_fr: 'On déconne avec des amis en terrasse jusqu’à tard.',
                        example_en: 'We are fooling around with friends on the terrace until late.',
                    },
                ],
                brancher: [
                    {
                        pattern: 'brancher quelqu’un',
                        example_fr: 'Il essaie de brancher quelqu’un au comptoir depuis dix minutes.',
                        example_en: 'He has been trying to chat someone up at the bar for ten minutes.',
                    },
                ],
                kiffer: [
                    {
                        pattern: 'kiffer l’ambiance',
                        example_fr: 'On kiffe l’ambiance dès qu’on passe la porte.',
                        example_en: 'We are loving the vibe as soon as we walk in.',
                    },
                ],
                zoner: [
                    {
                        pattern: 'zoner après la fermeture',
                        example_fr: 'Ils zonent encore dehors après la fermeture du bar.',
                        example_en: 'They are still hanging around outside after the bar has closed.',
                    },
                ],
            },
        },
        {
            id: 'builtin-music',
            name: 'Music',
            scope: 'bands, rehearsal, performance, production',
            verbs: ['chanter', 'écouter', 'composer', 'enregistrer', 'répéter', 'interpréter', 'danser', 'jouer', 'improviser', 'mixer', 'accorder', 'brancher', 'caler', 'assurer', 'accélérer', 'ralentir', 'chauffer', 'foirer', 'rater'],
            topicUsages: {
                répéter: [
                    {
                        pattern: 'répéter avec le groupe',
                        example_fr: 'Nous répétons avec le groupe avant le concert de vendredi.',
                        example_en: 'We are rehearsing with the band before Friday\'s concert.',
                    },
                ],
                mixer: [
                    {
                        pattern: 'mixer un morceau',
                        example_fr: 'Il mixe le morceau au casque pour régler les derniers détails.',
                        example_en: 'He is mixing the track on headphones to fine-tune the last details.',
                    },
                ],
                accorder: [
                    {
                        pattern: 'accorder sa guitare',
                        example_fr: 'Elle accorde sa guitare juste avant de monter sur scène.',
                        example_en: 'She is tuning her guitar right before going on stage.',
                    },
                ],
                brancher: [
                    {
                        pattern: 'brancher la sono',
                        example_fr: 'On branche la sono pendant que le batteur s’échauffe.',
                        example_en: 'We are hooking up the sound system while the drummer warms up.',
                    },
                ],
                accélérer: [
                    {
                        pattern: 'accélérer le tempo',
                        example_fr: 'Vous accélérez le tempo à chaque refrain sans vous en rendre compte.',
                        example_en: 'You are speeding up the tempo at every chorus without realizing it.',
                    },
                ],
                ralentir: [
                    {
                        pattern: 'ralentir sur la fin',
                        example_fr: 'Le groupe ralentit sur la fin alors que le clic reste stable.',
                        example_en: 'The band is slowing down at the end while the click stays steady.',
                    },
                ],
                chauffer: [
                    {
                        pattern: 'chauffer la salle',
                        example_fr: 'Le DJ chauffe la salle avant l’arrivée de la tête d’affiche.',
                        example_en: 'The DJ is warming up the crowd before the headliner comes on.',
                    },
                ],
                foirer: [
                    {
                        pattern: 'foirer une entrée',
                        example_fr: 'On foire l’entrée du couplet et tout le monde se regarde.',
                        example_en: 'We mess up the verse entrance and everyone looks at each other.',
                    },
                ],
            },
        },
        {
            id: 'builtin-history-culture',
            name: 'History & Culture',
            scope: 'archives, heritage, storytelling, preservation',
            verbs: ['lire', 'écrire', 'raconter', 'explorer', 'collectionner', 'restaurer', 'exposer', 'étudier', 'conserver', 'classer', 'fouiller', 'documenter', 'traduire'],
            topicUsages: {
                restaurer: [
                    {
                        pattern: 'restaurer un document ancien',
                        example_fr: 'Le musée restaure un document ancien très fragile.',
                        example_en: 'The museum is restoring a very fragile old document.',
                    },
                ],
                fouiller: [
                    {
                        pattern: 'fouiller les archives',
                        example_fr: 'Elle fouille les archives municipales pour recoller l’histoire du quartier.',
                        example_en: 'She is digging through the city archives to piece together the neighborhood’s history.',
                    },
                ],
                conserver: [
                    {
                        pattern: 'conserver une trace',
                        example_fr: 'On conserve une trace de chaque intervention sur l’objet.',
                        example_en: 'We are keeping a record of every intervention on the object.',
                    },
                ],
                documenter: [
                    {
                        pattern: 'documenter une collection',
                        example_fr: 'Ils documentent la collection avant le nouveau catalogue.',
                        example_en: 'They are documenting the collection before the new catalog.',
                    },
                ],
            },
        },
        {
            id: 'builtin-politics-current-events',
            name: 'Politics & Current Events',
            scope: 'debate, protest, campaigns, media pressure',
            verbs: ['voter', 'gouverner', 'manifester', 'débattre', 'négocier', 'protester', 'réformer', 'discuter', 'militer', 'boycotter', 'surveiller', 'traiter', 'relancer', 'pointer', 'gérer', 'accuser', 'démentir', 'promettre', 'imposer', 'soutenir', 'condamner', 'dénoncer'],
            topicUsages: {
                débattre: [
                    {
                        pattern: 'débattre d\'une réforme',
                        example_fr: 'Les députés débattent d\'une réforme au parlement.',
                        example_en: 'The deputies are debating a reform in parliament.',
                    },
                ],
                militer: [
                    {
                        pattern: 'militer pour une cause',
                        example_fr: 'Elle milite pour cette cause depuis ses années de fac.',
                        example_en: 'She has been campaigning for this cause since college.',
                    },
                ],
                boycotter: [
                    {
                        pattern: 'boycotter un vote',
                        example_fr: 'L’opposition boycotte le vote pour dénoncer la procédure.',
                        example_en: 'The opposition is boycotting the vote to denounce the procedure.',
                    },
                ],
                pointer: [
                    {
                        pattern: 'pointer une contradiction',
                        example_fr: 'Le journaliste pointe une contradiction dans le discours du ministre.',
                        example_en: 'The journalist is pointing out a contradiction in the minister’s speech.',
                    },
                ],
                accuser: [
                    {
                        pattern: 'accuser quelqu’un de quelque chose',
                        example_fr: 'L’opposition accuse le ministre d’avoir menti sur les chiffres.',
                        example_en: 'The opposition is accusing the minister of lying about the numbers.',
                    },
                ],
                démentir: [
                    {
                        pattern: 'démentir une rumeur',
                        example_fr: 'Le gouvernement dément la rumeur quelques heures après sa diffusion.',
                        example_en: 'The government is denying the rumor a few hours after it spread.',
                    },
                ],
                promettre: [
                    {
                        pattern: 'promettre une réforme',
                        example_fr: 'Le candidat promet une réforme rapide s’il est élu.',
                        example_en: 'The candidate is promising a quick reform if elected.',
                    },
                ],
                dénoncer: [
                    {
                        pattern: 'dénoncer une décision',
                        example_fr: 'Plusieurs associations dénoncent une décision jugée brutale.',
                        example_en: 'Several groups are denouncing a decision seen as heavy-handed.',
                    },
                ],
            },
        },
        {
            id: 'builtin-cinema-series',
            name: 'Cinema & Series',
            scope: 'shooting, editing, acting, binge-watching',
            verbs: ['regarder', 'filmer', 'tourner', 'diffuser', 'monter', 'interpréter', 'raconter', 'écouter', 'mater', 'zapper', 'documenter', 'enregistrer', 'enchaîner', 'couper'],
            topicUsages: {
                tourner: [
                    {
                        pattern: 'tourner une scène',
                        example_fr: 'Ils tournent une scène de nuit dans une rue vide.',
                        example_en: 'They are shooting a night scene on an empty street.',
                    },
                ],
                mater: [
                    {
                        pattern: 'mater une série',
                        example_fr: 'On mate une série entière pendant le week-end pluvieux.',
                        example_en: 'We are binge-watching a whole series over the rainy weekend.',
                    },
                ],
                zapper: [
                    {
                        pattern: 'zapper entre deux chaînes',
                        example_fr: 'Il zappe entre deux chaînes en attendant le début du film.',
                        example_en: 'He is channel-hopping while waiting for the film to start.',
                    },
                ],
                monter: [
                    {
                        pattern: 'monter un épisode',
                        example_fr: 'Elle monte l’épisode jusque tard dans la nuit.',
                        example_en: 'She is editing the episode late into the night.',
                    },
                ],
                enchaîner: [
                    {
                        pattern: 'enchaîner les épisodes',
                        example_fr: 'On enchaîne les épisodes sans voir passer la soirée.',
                        example_en: 'We are plowing through episodes without noticing the evening go by.',
                    },
                ],
                couper: [
                    {
                        pattern: 'couper une scène',
                        example_fr: 'Ils coupent une scène entière parce qu’elle casse le rythme.',
                        example_en: 'They are cutting an entire scene because it breaks the pacing.',
                    },
                ],
            },
        },
        {
            id: 'builtin-relationship-drama',
            name: 'Relationship Drama',
            scope: 'dating, conflict, mixed signals, breakup',
            verbs: ['aimer', 'embrasser', 'rompre', 'discuter', 'pardonner', 'mentir', 'séduire', 'draguer', 'sortir', 'larguer', 'engueuler', 'flirter', 'disputer', 'embrouiller', 'reprocher', 'appeler', 'quitter', 'tromper', 'trahir'],
            topicUsages: {
                rompre: [
                    {
                        pattern: 'rompre avec quelqu\'un',
                        example_fr: 'Elle veut rompre après leur longue dispute.',
                        example_en: 'She wants to break up after their long argument.',
                    },
                ],
                larguer: [
                    {
                        pattern: 'larguer quelqu’un',
                        example_fr: 'Il la largue juste après un week-end catastrophique.',
                        example_en: 'He is dumping her right after a disastrous weekend.',
                    },
                ],
                engueuler: [
                    {
                        pattern: 'engueuler son partenaire',
                        example_fr: 'Elle l’engueule encore pour le même message suspect.',
                        example_en: 'She is yelling at him again over the same suspicious message.',
                    },
                ],
                flirter: [
                    {
                        pattern: 'flirter avec quelqu’un',
                        example_fr: 'Il flirte avec quelqu’un d’autre juste devant elle.',
                        example_en: 'He is flirting with someone else right in front of her.',
                    },
                ],
                embrouiller: [
                    {
                        pattern: 'embrouiller quelqu’un',
                        example_fr: 'Il l’embrouille avec des excuses différentes à chaque fois.',
                        example_en: 'He is confusing her with a different excuse every time.',
                    },
                ],
                reprocher: [
                    {
                        pattern: 'reprocher quelque chose à quelqu’un',
                        example_fr: 'Elle lui reproche encore de disparaître dès que ça devient sérieux.',
                        example_en: 'She is once again blaming him for disappearing as soon as things get serious.',
                    },
                ],
                quitter: [
                    {
                        pattern: 'quitter quelqu’un',
                        example_fr: 'Il la quitte sans vraie explication après des mois de flottement.',
                        example_en: 'He is leaving her without a real explanation after months of uncertainty.',
                    },
                ],
                tromper: [
                    {
                        pattern: 'tromper quelqu’un',
                        example_fr: 'Elle le trompe avec un collègue et tout finit par se savoir.',
                        example_en: 'She is cheating on him with a coworker and it all eventually comes out.',
                    },
                ],
                trahir: [
                    {
                        pattern: 'trahir la confiance de quelqu’un',
                        example_fr: 'Il trahit sa confiance en racontant leur histoire à tout le monde.',
                        example_en: 'He is betraying her trust by telling everyone about their relationship.',
                    },
                ],
            },
        },
        {
            id: 'builtin-office-admin',
            name: 'Office & Admin',
            scope: 'planning, paperwork, meetings, day-to-day office grind',
            verbs: ['travailler', 'gérer', 'planifier', 'organiser', 'présenter', 'imprimer', 'classer', 'signer', 'répondre', 'bosser', 'caler', 'relancer', 'archiver', 'traiter', 'ranger', 'pointer', 'valider', 'régler', 'assurer', 'envoyer', 'annuler', 'reporter', 'transférer', 'corriger', 'rappeler', 'boucler'],
            topicUsages: {
                planifier: [
                    {
                        pattern: 'planifier une réunion',
                        example_fr: 'Je planifie une réunion pour lundi matin.',
                        example_en: 'I am scheduling a meeting for Monday morning.',
                    },
                ],
                bosser: [
                    {
                        pattern: 'bosser sur un dossier',
                        example_fr: 'On bosse sur ce dossier depuis le début de la semaine.',
                        example_en: 'We have been working on this file since the start of the week.',
                    },
                ],
                relancer: [
                    {
                        pattern: 'relancer un client',
                        example_fr: 'Je relance le client avant la fermeture pour avoir un accord clair.',
                        example_en: 'I am following up with the client before close of business to get a clear answer.',
                    },
                ],
                archiver: [
                    {
                        pattern: 'archiver un dossier',
                        example_fr: 'Elle archive le dossier une fois la signature obtenue.',
                        example_en: 'She is archiving the file once the signature is in.',
                    },
                ],
                annuler: [
                    {
                        pattern: 'annuler une réunion',
                        example_fr: 'On annule la réunion de 16 h parce que le client a décommandé.',
                        example_en: 'We are canceling the 4 p.m. meeting because the client pulled out.',
                    },
                ],
                reporter: [
                    {
                        pattern: 'reporter à demain',
                        example_fr: 'Elle reporte ça à demain parce que tout le monde est déjà saturé.',
                        example_en: 'She is pushing it to tomorrow because everyone is already overloaded.',
                    },
                ],
                boucler: [
                    {
                        pattern: 'boucler un dossier',
                        example_fr: 'On boucle le dossier avant midi si personne ne change encore d’avis.',
                        example_en: 'We are wrapping up the file before noon if nobody changes their mind again.',
                    },
                ],
            },
        },
        {
            id: 'builtin-tech-digital-work',
            name: 'Tech & Digital Work',
            scope: 'shipping, debugging, automation, infrastructure',
            verbs: ['coder', 'programmer', 'déployer', 'tester', 'déboguer', 'configurer', 'automatiser', 'cliquer', 'partager', 'analyser', 'fusionner', 'documenter', 'sauvegarder', 'valider', 'surveiller', 'planter', 'bidouiller', 'archiver', 'casser', 'redémarrer', 'récupérer', 'bloquer', 'corriger', 'boucler'],
            topicUsages: {
                déployer: [
                    {
                        pattern: 'déployer une nouvelle version',
                        example_fr: 'On déploie une nouvelle version en production ce soir.',
                        example_en: 'We are deploying a new version to production tonight.',
                    },
                ],
                fusionner: [
                    {
                        pattern: 'fusionner une branche',
                        example_fr: 'Je fusionne la branche après le dernier feu vert.',
                        example_en: 'I am merging the branch after the final green light.',
                    },
                ],
                planter: [
                    {
                        pattern: 'planter en prod',
                        example_fr: 'Le service plante en prod dès qu’on pousse ce correctif.',
                        example_en: 'The service crashes in production as soon as we push this fix.',
                    },
                ],
                sauvegarder: [
                    {
                        pattern: 'sauvegarder la base',
                        example_fr: 'On sauvegarde la base avant toute migration risquée.',
                        example_en: 'We are backing up the database before any risky migration.',
                    },
                ],
                casser: [
                    {
                        pattern: 'casser la build',
                        example_fr: 'Tu casses la build dès qu’on active ce flag.',
                        example_en: 'You break the build as soon as we enable this flag.',
                    },
                ],
                redémarrer: [
                    {
                        pattern: 'redémarrer un service',
                        example_fr: 'Je redémarre le service pour voir si le bug disparaît.',
                        example_en: 'I am restarting the service to see whether the bug goes away.',
                    },
                ],
                récupérer: [
                    {
                        pattern: 'récupérer les logs',
                        example_fr: 'On récupère les logs avant que le conteneur reparte.',
                        example_en: 'We are pulling the logs before the container comes back up.',
                    },
                ],
                bloquer: [
                    {
                        pattern: 'bloquer une release',
                        example_fr: 'Le bug de paiement bloque la release depuis ce matin.',
                        example_en: 'The payment bug is blocking the release since this morning.',
                    },
                ],
            },
        },
        {
            id: 'builtin-travel-tourism',
            name: 'Travel & Tourism',
            scope: 'booking, transport, sightseeing, wandering around',
            verbs: ['voyager', 'visiter', 'réserver', 'embarquer', 'décoller', 'atterrir', 'guider', 'partir', 'arriver', 'séjourner', 'louer', 'débarquer', 'flâner', 'errer', 'trimballer', 'crapahuter', 'payer', 'bouger', 'rater', 'louper', 'perdre', 'suivre', 'rejoindre', 'déposer', 'récupérer'],
            topicUsages: {
                réserver: [
                    {
                        pattern: 'réserver une chambre',
                        example_fr: 'Nous réservons une chambre près de la gare.',
                        example_en: 'We are booking a room near the station.',
                    },
                ],
                flâner: [
                    {
                        pattern: 'flâner dans une ville',
                        example_fr: 'On flâne dans le centre sans programme précis.',
                        example_en: 'We are strolling through downtown with no fixed plan.',
                    },
                ],
                trimballer: [
                    {
                        pattern: 'trimballer sa valise',
                        example_fr: 'Je trimballe ma valise de station en station depuis ce matin.',
                        example_en: 'I have been dragging my suitcase from station to station since this morning.',
                    },
                ],
                débarquer: [
                    {
                        pattern: 'débarquer quelque part',
                        example_fr: 'Ils débarquent en ville sans avoir réservé quoi que ce soit.',
                        example_en: 'They are showing up in town without having booked anything.',
                    },
                ],
                rater: [
                    {
                        pattern: 'rater son train',
                        example_fr: 'On rate notre train de deux minutes et tout le planning saute.',
                        example_en: 'We miss our train by two minutes and the whole plan falls apart.',
                    },
                ],
                perdre: [
                    {
                        pattern: 'perdre ses bagages',
                        example_fr: 'Elle perd ses bagages à l’escale et doit tout racheter.',
                        example_en: 'She loses her luggage during the layover and has to buy everything again.',
                    },
                ],
                rejoindre: [
                    {
                        pattern: 'rejoindre quelqu’un',
                        example_fr: 'Je vous rejoins directement au musée après le check-in.',
                        example_en: 'I am joining you directly at the museum after check-in.',
                    },
                ],
                déposer: [
                    {
                        pattern: 'déposer quelqu’un à l’aéroport',
                        example_fr: 'On le dépose à l’aéroport avant de reprendre la route.',
                        example_en: 'We are dropping him at the airport before getting back on the road.',
                    },
                ],
            },
        },
        {
            id: 'builtin-crafts-making',
            name: 'Crafts & Making',
            scope: 'handmade, sewing, assembly, fixing, improvising',
            verbs: ['fabriquer', 'assembler', 'mesurer', 'coller', 'coudre', 'tisser', 'tricoter', 'poncer', 'bricoler', 'bidouiller', 'rafistoler', 'rater', 'foirer', 'planter', 'merder', 'souder', 'monter', 'démonter', 'ajuster', 'régler'],
            topicUsages: {
                coudre: [
                    {
                        pattern: 'coudre une poche',
                        example_fr: 'Elle coud une poche sur un sac en toile.',
                        example_en: 'She is sewing a pocket onto a canvas bag.',
                    },
                ],
                bricoler: [
                    {
                        pattern: 'bricoler une solution',
                        example_fr: 'On bricole une solution provisoire avant le marché de demain.',
                        example_en: 'We are improvising a temporary fix before tomorrow’s market.',
                    },
                ],
                bidouiller: [
                    {
                        pattern: 'bidouiller un montage',
                        example_fr: 'Je bidouille un montage pour sauver la pièce.',
                        example_en: 'I am tinkering with a setup to save the piece.',
                    },
                ],
                rafistoler: [
                    {
                        pattern: 'rafistoler un objet',
                        example_fr: 'Il rafistole l’objet au lieu de tout recommencer.',
                        example_en: 'He is patching up the object instead of starting over.',
                    },
                ],
                foirer: [
                    {
                        pattern: 'foirer une finition',
                        example_fr: 'Tu foires la finition si tu poses trop de vernis d’un coup.',
                        example_en: 'You ruin the finish if you apply too much varnish at once.',
                    },
                ],
                rater: [
                    {
                        pattern: 'rater un alignement',
                        example_fr: 'Elle rate un alignement et la façade penche un peu.',
                        example_en: 'She misses an alignment and the front panel tilts a bit.',
                    },
                ],
                planter: [
                    {
                        pattern: 'se planter sur une mesure',
                        example_fr: 'Je me plante sur une mesure et il faut tout recouper.',
                        example_en: 'I mess up a measurement and have to recut everything.',
                    },
                ],
                merder: [
                    {
                        pattern: 'merder sur un collage',
                        example_fr: 'On merde sur un collage dès qu’on travaille trop vite.',
                        example_en: 'We mess up a glue-up as soon as we work too fast.',
                    },
                ],
                souder: [
                    {
                        pattern: 'souder une jonction',
                        example_fr: 'Elle soude la jonction avant de reprendre la finition.',
                        example_en: 'She is soldering the joint before returning to the finish.',
                    },
                ],
                ajuster: [
                    {
                        pattern: 'ajuster une pièce',
                        example_fr: 'Il ajuste la pièce à la lime pour qu’elle tienne enfin.',
                        example_en: 'He is fine-tuning the piece with a file so it finally fits.',
                    },
                ],
            },
        },
        {
            id: 'builtin-education-learning',
            name: 'Education & Learning',
            scope: 'study, teaching, revision, cramming',
            verbs: ['apprendre', 'enseigner', 'étudier', 'réviser', 'expliquer', 'analyser', 'calculer', 'traduire', 'lire', 'écrire', 'bachoter', 'potasser', 'survoler', 'présenter'],
            topicUsages: {
                réviser: [
                    {
                        pattern: 'réviser pour un examen',
                        example_fr: 'Ils révisent pour un examen final très important.',
                        example_en: 'They are reviewing for a very important final exam.',
                    },
                ],
                bachoter: [
                    {
                        pattern: 'bachoter avant un partiel',
                        example_fr: 'On bachote depuis le matin parce qu’on s’y est pris trop tard.',
                        example_en: 'We have been cramming since morning because we started too late.',
                    },
                ],
                potasser: [
                    {
                        pattern: 'potasser un chapitre',
                        example_fr: 'Elle potasse le chapitre le plus dense avant le cours de demain.',
                        example_en: 'She is grinding through the densest chapter before tomorrow’s class.',
                    },
                ],
                survoler: [
                    {
                        pattern: 'survoler un cours',
                        example_fr: 'Il survole le cours juste pour repérer les notions à reprendre.',
                        example_en: 'He is skimming the lesson just to spot the concepts he needs to revisit.',
                    },
                ],
            },
        },
    ];
    const builtInVerbSets = BUILTIN_VERB_SET_DEFINITIONS
        .map((set, index) => {
            const normalized = normalizeStoredVerbSet({
                ...set,
                createdAt: index,
                updatedAt: index,
            });
            return normalized ? { ...normalized, isBuiltIn: true } : null;
        })
        .filter(Boolean);
    window.builtinVerbUsageFallbacks = BUILTIN_VERB_USAGE_FALLBACKS;

    // Calculate verb counts per frequency for display in options
    const frequencyCounts = uniqueVerbs.reduce((acc, verb) => {
        const freq = normalizeFrequencyKey(verb.frequency) || 'common';
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

    const FRENCH_IL_ONLY_VERBS = new Set(['falloir', 'pleuvoir']);
    const FRENCH_IL_ONLY_CARD_PRONOUN = 'il/elle/on';
    const FRENCH_IL_ONLY_DETAIL_PRONOUN = 'il';
    const FRENCH_IL_ONLY_SOURCE_KEYS = [
        FRENCH_IL_ONLY_CARD_PRONOUN,
        'je',
        'tu',
        'nous',
        'vous',
        'ils/elles',
    ];

    const isFrenchIlOnlyVerb = (verbInfinitive) => FRENCH_IL_ONLY_VERBS.has(String(verbInfinitive || '').trim());

    const isFrenchIlOnlySingularForm = (conjugated) => String(conjugated || '')
        .trim()
        .toLowerCase()
        .startsWith('il ');

    const resolveFrenchIlOnlyConjugation = (verbInfinitive, conjugations) => {
        if (!isFrenchIlOnlyVerb(verbInfinitive) || !conjugations) return null;

        for (const sourcePronounKey of FRENCH_IL_ONLY_SOURCE_KEYS) {
            const conjugated = String(conjugations[sourcePronounKey] || '').trim();
            if (!conjugated || !isFrenchIlOnlySingularForm(conjugated)) continue;
            return {
                cardPronoun: FRENCH_IL_ONLY_CARD_PRONOUN,
                detailPronoun: FRENCH_IL_ONLY_DETAIL_PRONOUN,
                sourcePronounKey,
                conjugated,
            };
        }

        const canonicalConjugation = String(conjugations[FRENCH_IL_ONLY_CARD_PRONOUN] || '').trim();
        if (!canonicalConjugation) return null;

        return {
            cardPronoun: FRENCH_IL_ONLY_CARD_PRONOUN,
            detailPronoun: FRENCH_IL_ONLY_DETAIL_PRONOUN,
            sourcePronounKey: FRENCH_IL_ONLY_CARD_PRONOUN,
            conjugated: canonicalConjugation,
        };
    };

    const buildFlashcardPronounEntries = (verbInfinitive, conjugations, options = {}) => {
        if (!conjugations) return [];

        const impersonalEntry = resolveFrenchIlOnlyConjugation(verbInfinitive, conjugations);
        if (isFrenchIlOnlyVerb(verbInfinitive)) {
            return impersonalEntry ? [{
                pronoun: impersonalEntry.cardPronoun,
                pronounKey: impersonalEntry.sourcePronounKey,
                conjugated: impersonalEntry.conjugated,
            }] : [];
        }

        const entries = [];
        const availablePronouns = pronouns.filter((pronounKey) => conjugations[pronounKey]);
        for (const pronounKey of availablePronouns) {
            if (options.balancedPronouns && pronounKey.includes('/')) {
                for (const pronoun of pronounKey.split('/')) {
                    entries.push({
                        pronoun,
                        pronounKey,
                        conjugated: conjugations[pronounKey],
                    });
                }
                continue;
            }

            let pronoun = pronounKey;
            if (pronounKey.includes('/')) {
                const variants = pronounKey.split('/');
                pronoun = variants[Math.floor(Math.random() * variants.length)];
            }
            entries.push({
                pronoun,
                pronounKey,
                conjugated: conjugations[pronounKey],
            });
        }

        return entries;
    };

    const buildVerbDetailRows = (verbInfinitive, conjugations) => {
        const impersonalEntry = resolveFrenchIlOnlyConjugation(verbInfinitive, conjugations);
        if (isFrenchIlOnlyVerb(verbInfinitive)) {
            return [{
                pronounLabel: FRENCH_IL_ONLY_DETAIL_PRONOUN,
                pronounAudio: FRENCH_IL_ONLY_DETAIL_PRONOUN,
                pronounKey: impersonalEntry ? impersonalEntry.sourcePronounKey : FRENCH_IL_ONLY_CARD_PRONOUN,
                conjugated: impersonalEntry ? impersonalEntry.conjugated : '—',
            }];
        }

        return pronouns.map((pronoun) => ({
            pronounLabel: pronoun,
            pronounAudio: pronoun,
            pronounKey: pronoun,
            conjugated: conjugations?.[pronoun] || '—',
        }));
    };

    const normalizeRequestedCardPronoun = (pronoun, verbInfinitive) => {
        const normalized = String(pronoun || '').trim();
        if (!normalized) return normalized;
        if (isFrenchIlOnlyVerb(verbInfinitive)) {
            return FRENCH_IL_ONLY_CARD_PRONOUN;
        }
        return normalized;
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
    const appInstallPill = document.getElementById('app-install-pill');
    const appInstallActionBtn = document.getElementById('app-install-action-btn');
    const appInstallDismissBtn = document.getElementById('app-install-dismiss-btn');
    const appInstallStatusText = document.getElementById('app-install-status-text');
    const appUpdatePill = document.getElementById('app-update-pill');
    const appUpdateActionBtn = document.getElementById('app-update-action-btn');
    const appUpdateStatusText = document.getElementById('app-update-status-text');
    const appVersionBadge = document.getElementById('app-version-badge');
    const appVersionDetail = document.getElementById('app-version-detail');
    const appInstallModal = document.getElementById('app-install-modal');
    const appInstallModalTitle = document.getElementById('app-install-modal-title');
    const appInstallModalText = document.getElementById('app-install-modal-text');
    const appInstallModalSteps = document.getElementById('app-install-modal-steps');
    const appInstallModalNote = document.getElementById('app-install-modal-note');
    const appInstallModalCloseBtn = document.getElementById('app-install-modal-close-btn');
    const verbSetModal = document.getElementById('verb-set-modal');
    const verbSetModalTitle = document.getElementById('verb-set-modal-title');
    const verbSetModalText = document.getElementById('verb-set-modal-text');
    const verbSetModalCloseBtn = document.getElementById('verb-set-modal-close-btn');
    const verbSetNameInput = document.getElementById('verb-set-name-input');
    const verbSetVerbsInput = document.getElementById('verb-set-verbs-input');
    const verbSetValidation = document.getElementById('verb-set-validation');
    const verbSetModalDeleteBtn = document.getElementById('verb-set-modal-delete-btn');
    const verbSetModalSaveBtn = document.getElementById('verb-set-modal-save-btn');
    
    const backBtn = document.getElementById('back-btn');
    const nextBtn = document.getElementById('next-btn');
    const explorerToggleBtn = document.getElementById('explorer-toggle-btn');
    const optionsToggleBtn = document.getElementById('options-toggle-btn'); // Gear icon button
    const helpBtn = document.getElementById('help-btn');
    const helpNavBtn = document.getElementById('help-nav-btn');
    const answerFlowBtn = document.getElementById('answer-flow-btn');
    const contextAudioBtn = document.getElementById('context-audio-btn');
    const backToFlashcardBtn = document.getElementById('back-to-flashcard-btn');
    const backToListBtn = document.getElementById('back-to-list-btn');
    const backToFlashcardFromOptionsBtn = document.getElementById('back-to-flashcard-from-options-btn'); // Back button in options
    const usageNuggetEl = document.getElementById('usage-nugget');
    const usageVisibilityBtn = document.getElementById('usage-visibility-btn');
    const answerFlowLabelEl = answerFlowBtn ? answerFlowBtn.querySelector('.control-dock-label') : null;
    const dictateBtnLabelEl = document.querySelector('#dictate-btn-bottom .control-dock-label');
    const tutorialInlineHintEl = document.getElementById('tutorial-inline-hint');
    const tutorialInlineTextEl = tutorialInlineHintEl ? tutorialInlineHintEl.querySelector('.tutorial-inline-text') : null;
    const tutorialInlineSkipBtn = document.getElementById('tutorial-inline-skip-btn');
    const tutorialInlineHeadingEl = tutorialInlineHintEl ? tutorialInlineHintEl.querySelector('.tutorial-inline-heading') : null;
    const tutorialInlineBodyEl = tutorialInlineHintEl ? tutorialInlineHintEl.querySelector('.tutorial-inline-body') : null;
    const returnInlineMessageEl = document.getElementById('return-inline-message');
    const returnInlineBadgeEl = returnInlineMessageEl ? returnInlineMessageEl.querySelector('.return-inline-badge') : null;
    const returnInlineBodyEl = returnInlineMessageEl ? returnInlineMessageEl.querySelector('.return-inline-body') : null;
    const correctDictationHelperEl = document.getElementById('correct-dictation-helper');
    const pressToDictateHelperEl = document.getElementById('press-to-dictate-helper');

    const searchBar = document.getElementById('search-bar');
    const verbListContainer = document.getElementById('verb-list-container');
    const verbDetailContainer = document.getElementById('verb-detail-container');
    let packagedTtsBusy = false;
    let packagedTtsAutoStarted = false;
    let longPressCopyTimer = null;
    let suppressTapAudioUntil = 0;
    const TUTORIAL_STORAGE_KEY = 'frenchInlineTutorialStateV1';
    const escapeHtml = (value) => String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    const TUTORIAL_STEPS = [
        {
            headingBefore: "Welcome! Let's start!",
            headingAfter: 'Tutorial',
            before: 'Try to conjugate the verb you see <strong>(parler)</strong>. How would you say "I speak" in French? Tap Show to reveal the answer.',
            after: `That's the answer. Did you get it right? Tap Next for another card.`
        },
        {
            heading: 'Tutorial',
            before: (card) => `The goal is to conjugate the verb correctly for the pronoun shown. Can you conjugate "<strong>${escapeHtml(card?.verb?.infinitive || '')}</strong>" for "<strong>${escapeHtml(card?.pronoun || '')}</strong>"?`,
            after: 'You can tap the verb or the answer to hear it spoken aloud. Use Hear any time you want to listen again.'
        },
        {
            heading: 'Tutorial',
            before: 'Almost done. Can you conjugate this?',
            after: 'After reveal, the mic lets you practice saying the answer aloud.'
        },
        {
            heading: 'Tutorial',
            before: 'To search for a verb, use Search at the bottom. To drill into the current verb, use the book icon next to the verb.',
            after: 'Master the common verbs in the present first. Then explore more tenses and verbs in Settings.'
        },
        {
            heading: 'Tutorial',
            before: `That's it. You're ready to practice.`,
            after: ''
        }
    ];
    const tutorialState = {
        active: false,
        completed: false,
        stepIndex: 0
    };
    const INSTALL_REMINDER_DISMISSED_KEY = 'installReminderDismissedV1';
    const IDLE_NUDGE_ENABLED_KEY = 'idleNudgeEnabledV1';
    const PRESS_TO_DICTATE_ENABLED_KEY = 'pressToDictateEnabledV1';
    const SHOW_TIPS_ENABLED_KEY = 'showTipsEnabledV1';
    const REOPEN_MESSAGE_LAST_OPEN_KEY = 'reopenMessageLastOpenAtV1';
    const REOPEN_MESSAGE_THRESHOLD_MS = 12 * 60 * 60 * 1000;
    const REOPEN_MESSAGE_WELCOME_BACK_THRESHOLD_MS = 24 * 60 * 60 * 1000;
    const REOPEN_MESSAGE_SHORT_GAP_CHANCE = 0.45;
    const REOPEN_MESSAGE_EXTRA_PROMPTS = [
        {
            badge: '',
            body: '',
            includeElapsedLead: true
        },
        {
            badge: '',
            body: '💡 Search also works by English translation.'
        },
        {
            badge: '',
            body: '💡 Try a drill first. Then change one thing.'
        },
        {
            badge: '',
            body: 'You can create drills, save them, and share them.'
        },
        {
            badge: '',
            body: '💡 Open verb details for the full table and usage patterns.'
        },
        {
            badge: '',
            body: '💡 You can use the mic to answer the cards. Go to Settings.'
        },
        {
            badge: '',
            body: '💡 Tap any word or phrase in French to hear how it sounds.'
        }
    ];
    const reopenMessageState = {
        active: false,
        dismissed: false,
        badge: '',
        body: '',
        elapsedMs: 0,
        prompt: null,
        shownCardKey: null
    };
    let idleNudgeEnabled = getScopedStorageItem(IDLE_NUDGE_ENABLED_KEY) !== 'false';
    let pressToDictateEnabled = getScopedStorageItem(PRESS_TO_DICTATE_ENABLED_KEY) === 'true';
    let showTipsEnabled = getScopedStorageItem(SHOW_TIPS_ENABLED_KEY) !== 'false';
    const installState = {
        deferredPrompt: null,
        installed: false,
        reminderDismissed: getScopedStorageItem(INSTALL_REMINDER_DISMISSED_KEY) === 'true',
        cardsSeenThisSession: 0
    };
    const appUpdateState = Object.assign({
        registration: null,
        status: 'idle',
        updateAvailable: false,
        latestVersion: '',
        checkedAt: 0,
        lastUpdatedAt: 0,
        debugForceVisible: false
    }, window.__appUpdateState || {});

    const APP_UPDATE_STATUS_TEXT = {
        idle: 'App is up to date.',
        checking: 'Checking for updates...',
        ready: 'New version available.',
        unsupported: 'Updates are only available when the app is installed from the web.',
        error: 'Could not check right now. Please try again.'
    };

    const DETAIL_ROUTE_VERB_PARAM = 'verb';
    const DETAIL_ROUTE_TENSE_PARAM = 'tense';
    const DETAIL_ROUTE_PRONOUN_PARAM = 'pronoun';
    const REOPEN_MESSAGE_DEBUG_PARAM = 'backAfter';

    const parseBackAfterOverrideMs = () => {
        try {
            const url = new URL(window.location.href);
            const raw = String(url.searchParams.get(REOPEN_MESSAGE_DEBUG_PARAM) || '').trim();
            if (!raw) return null;

            console.log('[reopen-debug] backAfter raw param:', raw);

            const normalized = raw.toLowerCase();
            let overrideMs = null;

            if (/^\d+$/.test(normalized)) {
                overrideMs = Number(normalized) * 60 * 60 * 1000;
            } else {
                const match = normalized.match(/^(\d+(?:\.\d+)?)(m|h|d|w)$/);
                if (match) {
                    const value = Number(match[1]);
                    const unit = match[2];
                    const unitMs = unit === 'm'
                        ? 60 * 1000
                        : unit === 'h'
                            ? 60 * 60 * 1000
                            : unit === 'd'
                                ? 24 * 60 * 60 * 1000
                                : 7 * 24 * 60 * 60 * 1000;
                    overrideMs = value * unitMs;
                }
            }

            url.searchParams.delete(REOPEN_MESSAGE_DEBUG_PARAM);
            const cleanedUrl = `${url.pathname}${url.search}${url.hash}`;
            window.history.replaceState(window.history.state, '', cleanedUrl);

            console.log('[reopen-debug] backAfter normalized ms:', overrideMs);
            console.log('[reopen-debug] backAfter param removed from URL after parsing');

            return Number.isFinite(overrideMs) && overrideMs > 0 ? overrideMs : null;
        } catch (error) {
            console.warn('Could not parse backAfter override:', error);
            return null;
        }
    };

    const formatReopenElapsedText = (elapsedMs) => {
        if (!Number.isFinite(elapsedMs) || elapsedMs < REOPEN_MESSAGE_THRESHOLD_MS) {
            return '';
        }
        const dayMs = 24 * 60 * 60 * 1000;
        if (elapsedMs < dayMs) return 'less than a day';
        const days = Math.max(1, Math.floor(elapsedMs / dayMs));
        return days === 1 ? '1 day' : `${days} days`;
    };

    const getElapsedOnlyReopenPrompt = () => ({
        badge: '',
        body: '',
        includeElapsedLead: true
    });

    const buildReopenMessageBody = (elapsedMs, prompt) => {
        const activePrompt = prompt || getElapsedOnlyReopenPrompt();
        if (activePrompt.includeElapsedLead) {
            const elapsedText = formatReopenElapsedText(elapsedMs);
            const lead = `Welcome back. It has been ${elapsedText} since your last conjugation.`;
            return activePrompt.body ? `${lead} ${activePrompt.body}` : lead;
        }
        return activePrompt.body || '';
    };

    const applyReopenMessagePrompt = () => {
        const prompt = showTipsEnabled
            ? (reopenMessageState.prompt || getElapsedOnlyReopenPrompt())
            : getElapsedOnlyReopenPrompt();
        reopenMessageState.badge = prompt.badge || '';
        reopenMessageState.body = buildReopenMessageBody(reopenMessageState.elapsedMs, prompt);
    };

    const initializeReopenMessageState = () => {
        const now = Date.now();
        const debugOverrideMs = parseBackAfterOverrideMs();
        const previousRaw = Number(getScopedStorageItem(REOPEN_MESSAGE_LAST_OPEN_KEY) || 0);
        setScopedStorageItem(REOPEN_MESSAGE_LAST_OPEN_KEY, String(now));

        const elapsed = Number.isFinite(debugOverrideMs) && debugOverrideMs > 0
            ? debugOverrideMs
            : (Number.isFinite(previousRaw) && previousRaw > 0 ? now - previousRaw : 0);
        console.log('[reopen-debug] initializeReopenMessageState', {
            debugOverrideMs,
            previousRaw,
            elapsed,
            thresholdMs: REOPEN_MESSAGE_THRESHOLD_MS
        });
        if (elapsed < REOPEN_MESSAGE_THRESHOLD_MS) return;

        const extra = REOPEN_MESSAGE_EXTRA_PROMPTS[Math.floor(Math.random() * REOPEN_MESSAGE_EXTRA_PROMPTS.length)];
        const isLongGap = elapsed >= REOPEN_MESSAGE_WELCOME_BACK_THRESHOLD_MS;
        if (!isLongGap && Math.random() > REOPEN_MESSAGE_SHORT_GAP_CHANCE) {
            console.log('[reopen-debug] short-gap reopen prompt skipped by chance gate');
            return;
        }
        reopenMessageState.active = true;
        reopenMessageState.dismissed = false;
        reopenMessageState.elapsedMs = elapsed;
        reopenMessageState.prompt = extra;
        reopenMessageState.shownCardKey = null;
        applyReopenMessagePrompt();
        console.log('[reopen-debug] reopen message activated', {
            badge: reopenMessageState.badge,
            body: reopenMessageState.body
        });
    };

    initializeReopenMessageState();

    const getReloadUrlForFreshApp = () => {
        const url = new URL(window.location.href);
        url.searchParams.set('__refresh', Date.now().toString());
        return url.toString();
    };

    const fetchLatestAppVersion = async () => {
        const response = await fetch(`./version.json?t=${Date.now()}`, { cache: 'no-store' });
        if (!response.ok) {
            throw new Error(`version status ${response.status}`);
        }
        const payload = await response.json();
        return normalizeAppVersion(payload && payload.version);
    };

    const getVersionValueForUi = () => {
        if (APP_VERSION !== 'dev') return APP_VERSION;
        return appUpdateState.latestVersion || APP_VERSION;
    };

    const syncAppVersionUi = () => {
        const versionForUi = getVersionValueForUi();
        if (appVersionBadge) {
            appVersionBadge.textContent = formatAppVersionLabel(versionForUi);
        }
        if (appVersionDetail) {
            if (APP_VERSION === 'dev' && appUpdateState.latestVersion) {
                appVersionDetail.textContent = `Latest published ${formatAppVersionDetail(appUpdateState.latestVersion).replace(/^Built /, 'build ')}`;
            } else {
                appVersionDetail.textContent = formatAppVersionDetail(versionForUi);
            }
        }
    };

    let shellWarmupRequested = false;
    const requestShellWarmup = async (reason = 'unknown') => {
        if (shellWarmupRequested || !('serviceWorker' in navigator)) return;
        try {
            const registration = await navigator.serviceWorker.getRegistration('./');
            const worker = registration && (registration.active || registration.waiting || registration.installing);
            if (!worker) return;
            worker.postMessage({ type: 'WARM_INDEX', reason });
            shellWarmupRequested = true;
            if (window.appLog) window.appLog(`shell-warmup requested reason=${reason}`);
        } catch (error) {
            if (window.appLog) window.appLog(`shell-warmup failed reason=${reason} message="${error.message}"`);
        }
    };

    const isStandaloneInstalled = () => {
        const standaloneMatch = window.matchMedia && typeof window.matchMedia === 'function'
            ? window.matchMedia('(display-mode: standalone)').matches
            : false;
        return standaloneMatch || window.navigator.standalone === true;
    };

    const isAppleInstallPlatform = () => {
        const ua = navigator.userAgent || '';
        const platform = navigator.platform || '';
        const maxTouchPoints = navigator.maxTouchPoints || 0;
        return /iPad|iPhone|iPod/i.test(ua) || (/Mac/i.test(platform) && maxTouchPoints > 1);
    };

    const isSafariFamilyBrowser = () => {
        const ua = navigator.userAgent || '';
        if (!isAppleInstallPlatform()) return false;
        return /Safari/i.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS/i.test(ua);
    };

    const isInstallPromptSupported = () => !!installState.deferredPrompt;

    const shouldShowInstallPill = () => {
        if (installState.installed || installState.reminderDismissed) return false;
        if (installState.cardsSeenThisSession < 1 || installState.cardsSeenThisSession > 5) return false;
        const flashcardView = document.getElementById('flashcard-view');
        if (!flashcardView || flashcardView.classList.contains('hidden')) return false;
        if (appUpdatePill && !appUpdatePill.classList.contains('hidden')) return false;
        return isInstallPromptSupported() || isAppleInstallPlatform();
    };

    const getInstallSupportKind = () => {
        if (installState.installed) return 'installed';
        if (isInstallPromptSupported()) return 'prompt';
        if (isAppleInstallPlatform()) return 'apple';
        return 'browser-menu';
    };

    const getInstallStatusText = () => {
        const supportKind = getInstallSupportKind();
        let message = 'Add this app to your Home Screen for a cleaner, app-like experience.';
        if (supportKind === 'installed') {
            message = 'This app is already installed on this device.';
        } else if (supportKind === 'prompt') {
            message = 'This browser can install the app directly. Tap Start install to open the install prompt.';
        } else if (supportKind === 'apple') {
            message = isSafariFamilyBrowser()
                ? 'On iPad or iPhone, install from Safari with Share > Add to Home Screen.'
                : 'For iPad or iPhone install, open this page in Safari and use Share > Add to Home Screen.';
        } else {
            message = 'Use your browser menu to install the app or add it to your Home Screen if offered.';
        }
        if (installState.reminderDismissed && !installState.installed) {
            message += ' Install reminders are off.';
        }
        return message;
    };

    const openInstallInstructionsModal = (options = {}) => {
        if (!appInstallModal || !appInstallModalText || !appInstallModalSteps || !appInstallModalNote || !appInstallModalTitle) {
            return;
        }
        const supportKind = options.kind || getInstallSupportKind();
        const inSafari = isSafariFamilyBrowser();
        let title = 'Install Les Verbes';
        let text = 'Add the app to your Home Screen for a cleaner, app-like experience.';
        let steps = [];
        let note = '';

        if (supportKind === 'apple') {
            title = 'Install on iPad or iPhone';
            text = inSafari
                ? 'Use Safari’s standard Home Screen flow.'
                : 'Open this page in Safari to install it like an app.';
            steps = inSafari
                ? [
                    'Tap the Share button in Safari.',
                    'Choose Add to Home Screen.',
                    'If iPadOS offers Open as Web App, keep that enabled.',
                    'Tap Add.'
                ]
                : [
                    'Open this page in Safari.',
                    'Tap the Share button.',
                    'Choose Add to Home Screen.',
                    'Tap Add.'
                ];
            note = 'After that, open Les Verbes from your Home Screen for the best app-like behavior.';
        } else {
            title = 'Install this app';
            text = 'This browser did not expose a direct install prompt just now, but it may still offer install from its menu.';
            steps = [
                'Open the browser menu.',
                'Look for Install app, Add to Home Screen, or a similar option.',
                'Confirm the install if the browser offers it.'
            ];
            note = 'If you do not see an install option here, try Safari on iPad/iPhone or Chrome on Android.';
        }

        appInstallModalTitle.textContent = title;
        appInstallModalText.textContent = text;
        appInstallModalSteps.innerHTML = steps.map((step) => `<li>${escapeHtml(step)}</li>`).join('');
        appInstallModalNote.textContent = note;
        appInstallModal.classList.remove('hidden');
    };

    const closeInstallInstructionsModal = () => {
        if (appInstallModal) {
            appInstallModal.classList.add('hidden');
        }
    };

    const setInstallReminderDismissed = (dismissed) => {
        installState.reminderDismissed = !!dismissed;
        if (dismissed) {
            setScopedStorageItem(INSTALL_REMINDER_DISMISSED_KEY, 'true');
        } else {
            removeScopedStorageItem(INSTALL_REMINDER_DISMISSED_KEY);
        }
        syncAppInstallUi();
    };

    const syncAppInstallUi = () => {
        if (appInstallStatusText) {
            appInstallStatusText.textContent = getInstallStatusText();
        }
        if (appInstallActionBtn) {
            appInstallActionBtn.textContent = installState.installed ? 'Installed' : 'Start install';
            appInstallActionBtn.disabled = installState.installed;
        }
        if (appInstallDismissBtn) {
            appInstallDismissBtn.textContent = installState.reminderDismissed ? 'Show reminders again' : "Don't remind me";
            appInstallDismissBtn.disabled = installState.installed;
        }
        if (appInstallPill) {
            appInstallPill.classList.toggle('hidden', !shouldShowInstallPill());
        }
    };

    const triggerInstallFlow = async () => {
        installState.installed = isStandaloneInstalled();
        if (installState.installed) {
            syncAppInstallUi();
            return;
        }
        if (installState.deferredPrompt) {
            const promptEvent = installState.deferredPrompt;
            installState.deferredPrompt = null;
            try {
                await promptEvent.prompt();
                const choice = await promptEvent.userChoice;
                if (choice && choice.outcome === 'accepted') {
                    installState.installed = true;
                }
            } catch (error) {
                console.warn('Install prompt failed:', error);
                openInstallInstructionsModal({ kind: 'browser-menu' });
            }
            syncAppInstallUi();
            return;
        }
        openInstallInstructionsModal({ kind: getInstallSupportKind() });
        syncAppInstallUi();
    };

    installState.installed = isStandaloneInstalled();

    const syncAppUpdateUi = () => {
        const status = appUpdateState.status || 'idle';
        const showPill = !!(appUpdateState.updateAvailable || appUpdateState.debugForceVisible);

        if (appUpdatePill) {
            appUpdatePill.classList.toggle('hidden', !showPill);
            appUpdatePill.textContent = appUpdateState.updateAvailable ? 'Update available' : 'Update app';
        }

        if (appUpdateStatusText) {
            let message = APP_UPDATE_STATUS_TEXT[status] || APP_UPDATE_STATUS_TEXT.idle;
            if (status === 'ready' && appUpdateState.latestVersion && appUpdateState.latestVersion !== APP_VERSION) {
                message = `New version available (${formatAppVersionLabel(appUpdateState.latestVersion)}).`;
            }
            appUpdateStatusText.textContent = message;
        }

        if (appUpdateActionBtn) {
            appUpdateActionBtn.disabled = status === 'checking';
            appUpdateActionBtn.textContent = appUpdateState.updateAvailable ? 'Reload now' : 'Check for updates';
        }
        syncAppInstallUi();
    };

    const setAppUpdateState = (patch = {}) => {
        Object.assign(appUpdateState, patch);
        if (typeof window.__setAppUpdateState === 'function') {
            window.__setAppUpdateState(patch);
            return;
        }
        syncAppUpdateUi();
        syncAppVersionUi();
    };

    const syncExternalAppUpdateState = (detail = {}) => {
        Object.assign(appUpdateState, detail);
        syncAppUpdateUi();
        syncAppVersionUi();
    };

    const openSettingsForUpdate = () => {
        showOptions();
        if (appUpdateActionBtn) {
            window.setTimeout(() => {
                appUpdateActionBtn.focus({ preventScroll: true });
                appUpdateActionBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 40);
        }
    };

    const checkForAppUpdates = async () => {
        if (location.protocol === 'file:' || !('serviceWorker' in navigator)) {
            setAppUpdateState({ status: 'unsupported', updateAvailable: false });
            return;
        }

        setAppUpdateState({
            status: 'checking',
            checkedAt: Date.now()
        });

        try {
            const registration = appUpdateState.registration || await navigator.serviceWorker.getRegistration('./');
            if (!registration) {
                setAppUpdateState({ status: 'unsupported', updateAvailable: false });
                return;
            }

            setAppUpdateState({ registration });
            await registration.update();

            if (registration.waiting) {
                setAppUpdateState({ status: 'ready', updateAvailable: true, registration });
                return;
            }

            const latestVersion = await fetchLatestAppVersion();
            if (latestVersion && latestVersion !== APP_VERSION) {
                setAppUpdateState({
                    status: 'ready',
                    updateAvailable: true,
                    latestVersion,
                    registration
                });
                return;
            }

            window.setTimeout(() => {
                if (!appUpdateState.updateAvailable && appUpdateState.status === 'checking') {
                    setAppUpdateState({ status: 'idle', latestVersion: APP_VERSION });
                }
            }, 3800);
        } catch (error) {
            console.warn('App update check failed:', error);
            setAppUpdateState({ status: 'error' });
        }
    };

    window.addEventListener('app-update-state', (event) => {
        syncExternalAppUpdateState(event.detail || {});
    });

    window.addEventListener('beforeinstallprompt', (event) => {
        event.preventDefault();
        installState.deferredPrompt = event;
        syncAppInstallUi();
    });

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(() => {
            requestShellWarmup('ready');
        }).catch(() => {});
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            requestShellWarmup('controllerchange');
        });
    }

    window.addEventListener('appinstalled', () => {
        installState.installed = true;
        installState.deferredPrompt = null;
        syncAppInstallUi();
    });

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

    const showTransientFeedback = (message, duration = 1100) => {
        const trimmed = String(message || '').trim();
        if (!trimmed) return;
        if (dictationResultEl && typeof showDictationOverlay === 'function') {
            showDictationOverlay(trimmed, 'prompt', duration, false, true);
            return;
        }
        window.alert(trimmed);
    };

    const legacyCopyTextToClipboard = (text) => {
        const trimmed = String(text || '').trim();
        if (!trimmed || !document.body) {
            return false;
        }
        const activeElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        const textarea = document.createElement('textarea');
        textarea.value = trimmed;
        textarea.setAttribute('readonly', 'readonly');
        textarea.setAttribute('aria-hidden', 'true');
        textarea.style.position = 'fixed';
        textarea.style.top = '-9999px';
        textarea.style.left = '-9999px';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        textarea.setSelectionRange(0, textarea.value.length);

        let copied = false;
        try {
            copied = !!document.execCommand('copy');
        } catch (error) {
            console.warn('Legacy clipboard copy failed:', error);
        } finally {
            document.body.removeChild(textarea);
            if (activeElement && typeof activeElement.focus === 'function') {
                try {
                    activeElement.focus({ preventScroll: true });
                } catch (error) {
                    activeElement.focus();
                }
            }
        }
        return copied;
    };

    const copyTextToClipboard = async (text, options = {}) => {
        const trimmed = String(text || '').trim();
        const successMessage = typeof options.successMessage === 'string'
            ? options.successMessage
            : `Copied: ${trimmed}`;
        if (!trimmed) {
            return false;
        }
        try {
            if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
                await navigator.clipboard.writeText(trimmed);
            } else if (!legacyCopyTextToClipboard(trimmed)) {
                return false;
            }
            if (navigator.vibrate) navigator.vibrate(12);
            showTransientFeedback(successMessage);
            return true;
        } catch (error) {
            console.warn('Clipboard copy failed:', error);
            const copied = legacyCopyTextToClipboard(trimmed);
            if (copied) {
                if (navigator.vibrate) navigator.vibrate(12);
                showTransientFeedback(successMessage);
            }
            return copied;
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
        contextAudioBtn.style.display = 'inline-flex';
        contextAudioBtn.setAttribute(
            'title',
            isAnswerVisible ? 'Play the shown answer' : 'Play the infinitive again'
        );
    };

    const isAppleMobileBrowser = () => isAppleInstallPlatform();

    const getMicUnavailableOverlayMessage = (availability, micMode) => {
        if (availability === 'unsupported') {
            if (isAppleMobileBrowser()) {
                return 'Sorry, voice dictation is not available on iPhone Safari yet. Use Hear for now, or wait for our iOS app.';
            }
            return 'Sorry, voice dictation is not available on this browser yet.';
        }
        if (availability === 'safeModeBlocked') {
            return 'Mic input is disabled in Safe mode.';
        }
        if (availability === 'tutorial-locked') {
            return 'The tutorial unlocks the mic on step 3, after reveal.';
        }
        if (availability === 'phase-disabled') {
            return micMode === 'answerByVoice'
                ? 'Voice-answer mode listens before reveal.'
                : 'Reveal the answer first, then tap Say.';
        }
        return '';
    };

    const refreshDictationButton = () => {
        if (!dictateBtn) return;
        const availability = getMicAvailability();
        const micMode = getEffectiveMicMode();
        const hardDisabled = availability === 'tutorial-locked' || availability === 'phase-disabled';

        dictateBtn.style.display = 'inline-flex';
        dictateBtn.dataset.micMode = micMode;
        dictateBtn.dataset.availability = availability;

        dictateBtn.classList.toggle('is-tutorial-locked', availability === 'tutorial-locked');
        dictateBtn.classList.toggle('is-phase-disabled', availability === 'phase-disabled');
        dictateBtn.classList.toggle('is-unsupported', availability === 'unsupported' || availability === 'safeModeBlocked');
        dictateBtn.classList.toggle('is-no-content', false);

        dictateBtn.disabled = hardDisabled;

        if (dictateBtnLabelEl) {
            dictateBtnLabelEl.textContent = micMode === 'answerByVoice' ? 'Answer' : 'Say';
        }

        let title = 'Practice saying the answer aloud';
        if (availability === 'tutorial-locked') {
            title = 'The tutorial unlocks the mic a little later';
        } else if (availability === 'phase-disabled') {
            title = micMode === 'answerByVoice'
                ? 'Voice-answer mode works before reveal'
                : 'Reveal the answer to use the mic';
        } else if (availability === 'unsupported') {
            title = 'Speech recognition is unavailable on this device';
        } else if (availability === 'safeModeBlocked') {
            title = 'Mic input is disabled in safe mode';
        } else if (pressToDictateEnabled) {
            title = micMode === 'answerByVoice'
                ? 'Hold the mic to answer before reveal, or practice after reveal'
                : 'Hold the mic while speaking, then release to transcribe';
        } else if (micMode === 'answerByVoice') {
            title = 'Use the mic to answer before reveal, or practice after reveal';
        }

        dictateBtn.setAttribute('title', title);
        dictateBtn.setAttribute('aria-label', title);
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
        const availability = getUsageAvailability();
        const shouldShow = !!(
            isAnswerVisible &&
            currentCard &&
            currentCard._hasUsages &&
            availability === 'enabled' &&
            cardGenerationOptions.showUsageNugget
        );
        usageNuggetEl.style.display = shouldShow ? 'block' : 'none';
        usageNuggetEl.classList.toggle('usage-nugget-hidden', !shouldShow);

        if (usageVisibilityBtn) {
            usageVisibilityBtn.style.display = FRENCH_FLASHCARD_FEATURES.usageNuggetVisibilityToggle ? 'inline-flex' : 'none';
            usageVisibilityBtn.dataset.availability = availability;
            usageVisibilityBtn.classList.toggle('is-tutorial-locked', availability === 'tutorial-locked');
            usageVisibilityBtn.classList.toggle('is-phase-disabled', availability === 'phase-disabled');
            usageVisibilityBtn.classList.toggle('is-no-content', availability === 'no-content');
            usageVisibilityBtn.classList.toggle('is-unsupported', false);
            usageVisibilityBtn.disabled = availability !== 'enabled';
            usageVisibilityBtn.setAttribute('aria-pressed', cardGenerationOptions.showUsageNugget ? 'true' : 'false');

            let usageTitle = cardGenerationOptions.showUsageNugget ? 'Hide verb usage' : 'Show verb usage';
            if (availability === 'tutorial-locked') {
                usageTitle = 'Usage examples unlock after the tutorial';
            } else if (availability === 'no-content') {
                usageTitle = 'No usage notes for this verb yet';
            } else if (availability === 'phase-disabled') {
                usageTitle = 'Usage is only available on verb cards';
            }

            usageVisibilityBtn.setAttribute('aria-label', usageTitle);
            usageVisibilityBtn.setAttribute('title', usageTitle);
        }
        refreshTutorialAwareUi();
        refreshDictationButton();
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
            'button, input, label, select, textarea, a, .tappable-audio, #usage-nugget, #go-to-verb-btn-container, #tts-warning-banner, #app-update-pill, #app-install-pill'
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

    const DICTATION_POST_RESULT_SILENCE_MS = 1500;
    const DICTATION_LONG_SILENCE_MS = 10000;

    const clearDictationListeningTimers = () => {
        clearTimeout(dictationPostResultTimeout);
        dictationPostResultTimeout = null;
        clearTimeout(dictationLongTimeout);
        dictationLongTimeout = null;
    };

    const clearDictationOverlayTimeout = () => {
        clearTimeout(dictationOverlayTimeout);
        dictationOverlayTimeout = null;
    };

    const scheduleDictationPostResultTimeout = () => {
        clearTimeout(dictationPostResultTimeout);
        if (pressToDictateEnabled) return;
        if (!isDictating || !recognition) return;
        dictationPostResultTimeout = setTimeout(() => {
            if (isDictating && recognition) {
                stopActiveDictation({ silent: false });
            }
        }, DICTATION_POST_RESULT_SILENCE_MS);
    };

    const scheduleDictationLongTimeout = () => {
        clearTimeout(dictationLongTimeout);
        if (pressToDictateEnabled) return;
        if (!isDictating || !recognition) return;
        dictationLongTimeout = setTimeout(() => {
            if (isDictating && recognition) {
                stopActiveDictation({ silent: false });
            }
        }, DICTATION_LONG_SILENCE_MS);
    };

    const stopActiveDictation = (options = {}) => {
        const { abort = false, silent = true } = options;
        const activeRecognition = recognition;
        clearDictationListeningTimers();
        clearDictationOverlayTimeout();
        recognition = null;
        isDictating = false;
        dictationStopRequested = !silent;
        setDictating(false);
        refreshDictationButton();
        if (silent && dictationResultEl) {
            hideDictationOverlay();
        }
        if (!activeRecognition) {
            dictationStopRequested = false;
            return;
        }
        if (silent) {
            activeRecognition.onstart = null;
            activeRecognition.onresult = null;
            activeRecognition.onend = null;
            activeRecognition.onerror = null;
        }
        try {
            if (abort) activeRecognition.abort();
            else activeRecognition.stop();
        } catch (error) {
            dictationStopRequested = false;
            console.warn('Dictation stop failed:', error);
        }
    };

    const normalizeDictationText = (value) => String(value || '')
        .toLowerCase()
        .replace(/[’']/g, "'")
        .replace(/[.,!?;:()\[\]{}]/g, '')
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .replace(/\s+/g, ' ')
        .trim();

    const getFrenchHomophoneGroupIds = (value) => {
        const normalized = normalizeDictationText(value);
        if (!normalized) return [];
        const entry = FRENCH_HOMOPHONE_GROUP_BY_ANSWER[normalized];
        if (Array.isArray(entry)) {
            return entry.filter((groupId) => Number.isInteger(groupId));
        }
        return Number.isInteger(entry) ? [entry] : [];
    };

    const getFrenchSharedHomophoneGroupId = (valueA, valueB) => {
        const idsA = getFrenchHomophoneGroupIds(valueA);
        const idsB = getFrenchHomophoneGroupIds(valueB);
        if (!idsA.length || !idsB.length) {
            return null;
        }
        const idSetB = new Set(idsB);
        return idsA.find((groupId) => idSetB.has(groupId)) || null;
    };

    const getCardAnswerText = (card = currentCard) => {
        if (!card) return '';
        if (card.isPhraseMode || !card.verb) {
            return (card.phrase || '').trim();
        }
        if (card.isFrameCard) {
            return String(card.frameAnswer || card.conjugated || '').trim();
        }
        return window.handleLanguageSpecificLastChange(card.pronoun, card.conjugated).trim();
    };

    const getExpectedDictationText = (card = currentCard) => {
        return getCardAnswerText(card);
    };

    const updateFrameCardInlineState = (card, revealed = false) => {
        if (!card || !card.isFrameCard) return;
        if (answerContainer) {
            answerContainer.classList.add('frame-card-inline');
            answerContainer.classList.toggle('frame-card-revealed', !!revealed);
        }
        conjugatedVerbEl.classList.add('frame-card-inline-text');
        conjugatedVerbEl.classList.toggle('tappable-audio', !!revealed);
        conjugatedVerbEl.dataset.audioId = '';
        conjugatedVerbEl.dataset.speak = revealed ? (card.frameFullAnswer || '') : '';
        conjugatedVerbEl.setAttribute('aria-label', revealed ? 'Hear solved phrase' : 'Reveal answer');
        conjugatedVerbEl.title = revealed ? 'Tap to hear full phrase' : 'Tap to reveal';
        conjugatedVerbEl.innerHTML = revealed
            ? renderFrameSolvedMarkup(card.frameQuestion || '', card.frameAnswer || '')
            : renderFramePromptMarkup(card.frameQuestion || '');
    };

    const FRENCH_HOMOPHONE_FALLBACK_TENSES = new Set(['present', 'imparfait', 'subjonctifPresent']);
    const FRENCH_PLURAL_HOMOPHONE_SINGULAR_MAP = {
        ils: 'il',
        elles: 'elle',
    };
    const FRENCH_SAFE_HOMOPHONE_SUFFIX_PATTERNS = [
        { singular: 'e', plural: 'ent' },
        { singular: 'ait', plural: 'aient' },
        { singular: 'isse', plural: 'issent' },
    ];

    const getFrenchPronounLookupKey = (pronoun) => {
        const mapping = {
            il: 'il/elle/on',
            elle: 'il/elle/on',
            on: 'il/elle/on',
            ils: 'ils/elles',
            elles: 'ils/elles',
        };
        return mapping[String(pronoun || '').trim()] || String(pronoun || '').trim();
    };

    const getFrenchConjugationForPronoun = (card, pronoun) => {
        if (!card || !card.verb || !card.tense) return '';
        const conjugations = tenses?.[card.tense]?.[card.verb.infinitive];
        if (!conjugations) return '';
        const directKey = String(pronoun || '').trim();
        const lookupKey = getFrenchPronounLookupKey(directKey);
        return String(conjugations[directKey] || conjugations[lookupKey] || '').trim();
    };

    const getFrenchComparableVerbForm = (value) => {
        const normalized = normalizeDictationText(value);
        if (!normalized) return '';
        return normalized.replace(/^(il|elle|on|ils|elles)\s+/, '').trim();
    };

    const matchesFrenchSafeHomophonePattern = (singularForm, pluralForm) => {
        const singular = getFrenchComparableVerbForm(singularForm);
        const plural = getFrenchComparableVerbForm(pluralForm);
        if (!singular || !plural || singular.includes(' ') || plural.includes(' ')) return false;

        return FRENCH_SAFE_HOMOPHONE_SUFFIX_PATTERNS.some(({ singular: singularSuffix, plural: pluralSuffix }) => (
            singular.endsWith(singularSuffix)
            && plural.endsWith(pluralSuffix)
            && singular.slice(0, -singularSuffix.length) === plural.slice(0, -pluralSuffix.length)
        ));
    };

    const getFrenchPluralHomophoneFallbackResult = (transcript, card = currentCard) => {
        if (!card || card.isPhraseMode || !card.verb) return null;
        const pluralPronoun = String(card.pronoun || '').trim();
        const singularPronoun = FRENCH_PLURAL_HOMOPHONE_SINGULAR_MAP[pluralPronoun];
        if (!singularPronoun) return null;
        if (!FRENCH_HOMOPHONE_FALLBACK_TENSES.has(card.tense)) return null;

        const pluralPhrase = getExpectedDictationText(card);
        const pluralConjugation = String(card.conjugated || '').trim();
        const singularConjugation = getFrenchConjugationForPronoun(card, singularPronoun);
        if (!pluralPhrase || !pluralConjugation || !singularConjugation) return null;
        if (!matchesFrenchSafeHomophonePattern(singularConjugation, pluralConjugation)) return null;

        const singularPhrase = window.handleLanguageSpecificLastChange(singularPronoun, singularConjugation).trim();
        const heard = normalizeDictationText(transcript);
        const normalizedSingularPhrase = normalizeDictationText(singularPhrase);
        if (!heard || !normalizedSingularPhrase || !heard.includes(normalizedSingularPhrase)) return null;

        return {
            matched: true,
            displayText: `${singularPhrase} / ${pluralPhrase}`,
        };
    };

    const getFrenchHomophoneGroupFallbackResult = (transcript, card = currentCard) => {
        if (!card || card.isPhraseMode || !card.verb) return null;

        const expectedPhrase = getExpectedDictationText(card);
        const heardNormalized = normalizeDictationText(transcript);
        const expectedNormalized = normalizeDictationText(expectedPhrase);

        if (!heardNormalized || !expectedNormalized || heardNormalized === expectedNormalized) {
            return null;
        }

        const sharedGroupId = getFrenchSharedHomophoneGroupId(heardNormalized, expectedNormalized);
        if (!sharedGroupId) {
            return null;
        }

        appDebugLog(
            `[dictation][homophone-group] matched group=${sharedGroupId} `
            + `heard="${heardNormalized}" expected="${expectedNormalized}"`
        );

        return {
            matched: true,
            groupId: sharedGroupId,
            displayText: `${String(transcript || '').trim()} / ${expectedPhrase}`,
        };
    };

    const getDictationMatchResult = (transcript, card = currentCard) => {
        if (!card) return { matched: false };
        const expected = normalizeDictationText(getExpectedDictationText(card));
        const heard = normalizeDictationText(transcript);
        if (!expected || !heard) return { matched: false };

        if (card.isPhraseMode || !card.verb) {
            const expectedWords = expected.split(' ');
            const heardWords = heard.split(' ');
            let matchCount = 0;
            expectedWords.forEach((word) => {
                if (heardWords.includes(word)) matchCount += 1;
            });
            return {
                matched: expectedWords.length > 0 && (matchCount / expectedWords.length) >= 0.9,
            };
        }

        if (heard.includes(expected)) {
            return { matched: true };
        }

        const frenchFallback = getFrenchPluralHomophoneFallbackResult(transcript, card);
        if (frenchFallback?.matched) {
            return {
                matched: true,
                viaFrenchPluralHomophoneFallback: true,
                displayText: frenchFallback.displayText,
            };
        }

        const homophoneGroupFallback = getFrenchHomophoneGroupFallbackResult(transcript, card);
        if (homophoneGroupFallback?.matched) {
            return {
                matched: true,
                viaFrenchHomophoneGroupFallback: true,
                displayText: homophoneGroupFallback.displayText,
                homophoneGroupId: homophoneGroupFallback.groupId,
            };
        }

        return { matched: false };
    };

    const handleMicSuccess = () => {
        const micMode = getEffectiveMicMode();
        if (!currentCard) return;

        if (!currentCard.isPhraseMode && currentCard.verb) {
            logSessionEntry(currentCard.verb.infinitive, currentCard.tense, currentCard.pronoun, 'bravo');
        } else {
            logSessionEntry('phrase', '', '', 'bravo');
        }

        maybeWhisperMolodez();

        const shouldAutoAdvanceOnMicSuccess = micMode === 'answerByVoice' && !isAnswerVisible;
        if (shouldAutoAdvanceOnMicSuccess) {
            pendingPressToDictateRestart = !!(pressToDictateEnabled && activeDictationPointerId !== null);
            showAnswer();
            window.setTimeout(() => {
                if (recognition) {
                    try { recognition.stop(); } catch (error) {}
                }
                handleNext();
            }, 1450);
            return;
        }

        window.setTimeout(() => {
            if (recognition) {
                try { recognition.stop(); } catch (error) {}
            }
        }, 1350);
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

    const getNativeTtsAvailability = () => {
        if (!('speechSynthesis' in window) || !window.speechSynthesis || typeof window.speechSynthesis.getVoices !== 'function') {
            return 'unsupported';
        }
        const voices = window.speechSynthesis.getVoices();
        if (!voices.length) return 'checking';
        const langPrefix = String(speechLang || '').split('-')[0].toLowerCase();
        const hasMatchingVoice = voices.some((voice) => voice.lang && voice.lang.toLowerCase().startsWith(langPrefix));
        return hasMatchingVoice ? 'available' : 'unavailable';
    };

    const shouldUseAutomaticPackagedTtsFallback = () => {
        const availability = getNativeTtsAvailability();
        return availability === 'unsupported' || availability === 'unavailable';
    };

    const shouldGraduallyPrefetchPackagedTts = () => {
        if (!PACKAGED_TTS) return false;
        return !!(PACKAGED_TTS.isEnabled && PACKAGED_TTS.isEnabled());
    };

    const ensureAutomaticPackagedTtsDownload = async () => {
        if (!PACKAGED_TTS || packagedTtsBusy || packagedTtsAutoStarted) return;
        if (location.protocol === 'file:') return;
        if (!shouldGraduallyPrefetchPackagedTts()) return;
        packagedTtsAutoStarted = true;

        try {
            const status = await PACKAGED_TTS.getStatus();
            if (status.error || !status.enabled || !status.totalPacks || status.layout === 'clips') {
                await refreshPackagedTtsUi();
                return;
            }
            if (status.cachedPacks >= status.totalPacks || status.mode !== 'none') {
                await refreshPackagedTtsUi();
                return;
            }

            await runPackagedTtsJob('Downloading French audio for the top 20...', async () => {
                await PACKAGED_TTS.prefetchTop20(({ completed, total }) => {
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

    const maybePrefetchCurrentCardPackagedAudio = async (card = currentCard) => {
        if (!PACKAGED_TTS || packagedTtsBusy) return;
        if (location.protocol === 'file:') return;
        if (!shouldGraduallyPrefetchPackagedTts()) return;
        if (!card || !card.verb || !card.verb.infinitive) return;

        const audioId = lemmaAudioId(card.verb.infinitive);
        try {
            const alreadyAvailable = await PACKAGED_TTS.isAudioIdAvailable(audioId);
            if (alreadyAvailable) return;
            await PACKAGED_TTS.prefetchAudioId(audioId);
            if (window.appLog) {
                window.appLog(`packed-tts background-prefetch id=${audioId}`);
            }
        } catch (error) {
            if (window.appLog) {
                window.appLog(`packed-tts background-prefetch-error id=${audioId} message="${error.message}"`);
            }
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
            } else if (status.cachedPacks > 0 && [...getStandardFrequencyKeys(), 'rare'].includes(status.mode)) {
                const tierLabel = status.mode === 'rare'
                    ? `verbs ${describeRareFrequencyBucket()}`
                    : formatFrequencyLabel(status.mode);
                message = `French audio ready offline for ${tierLabel} (${status.cachedPacks}/${status.totalPacks} packs cached).`;
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
    // Enable Safe Mode by setting setScopedStorageItem('safe-mode', 'true').
    // It reduces potentially fragile features (speech, dictation) for older devices.
    const SAFE_MODE = getScopedStorageItem('safe-mode') === 'true';

    function logGlobalError(source, message, extra) {
        try {
            const key = getScopedStorageKey('error-log');
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
    let dictationOverlayTimeout = null;
    let dictationPostResultTimeout = null;
    let dictationLongTimeout = null;
    let dictationStopRequested = false;
    let activeDictationPromptText = '';
    let activeDictationPointerId = null;
    let suppressNextDictationClick = false;
    let pendingPressToDictateRestart = false;
    let beginDictationSessionRef = null;

    // Overlay helpers (already defined above)
    // function showDictationOverlay(...) {...}
    // function hideDictationOverlay() {...}

    function setupDictation() {
        if (!dictateBtn) return;

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
            dictationResultEl.style.transition = 'opacity 0.5s';
            flashcard.style.position = 'relative';
            const applyDictationResultTheme = () => {
                const isDark = typeof window.isDarkThemeActive === 'function'
                    ? window.isDarkThemeActive()
                    : !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
                if (isDark) {
                    dictationResultEl.style.background = 'rgba(24, 32, 48, 0.92)';
                    dictationResultEl.style.color = '#eaf6fb';
                    dictationResultEl.style.border = '2px solid #2c3e50';
                } else {
                    dictationResultEl.style.background = 'rgba(255,255,255,0.92)';
                    dictationResultEl.style.color = '#222';
                    dictationResultEl.style.border = '2px solid #3498db55';
                }
            };
            applyDictationResultTheme();
            window.addEventListener('app-theme-change', applyDictationResultTheme);
            flashcard.appendChild(dictationResultEl);
        }
        dictationResultEl.style.pointerEvents = 'auto';
        dictationResultEl.style.cursor = 'pointer';
        if (!dictationResultEl._dictationStopHandlerAttached) {
            dictationResultEl.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopPropagation();
                if (isDictating && recognition) {
                    stopActiveDictation({ silent: false });
                }
            });
            dictationResultEl._dictationStopHandlerAttached = true;
        }

        const beginDictationSession = () => {
            const availability = getMicAvailability();
            const micMode = getEffectiveMicMode();
            if (availability !== 'enabled') {
                const unavailableMessage = getMicUnavailableOverlayMessage(availability, micMode);
                if (unavailableMessage) {
                    showDictationOverlay(
                        unavailableMessage,
                        availability === 'unsupported' || availability === 'safeModeBlocked' ? 'error' : 'prompt',
                        2600,
                        false,
                        true
                    );
                }
                refreshDictationButton();
                return false;
            }
            if (isDictating && recognition) {
                return true;
            }
            if (recognition) {
                stopActiveDictation({ abort: true, silent: true });
            }
            clearDictationListeningTimers();
            isDictating = true;
            dictationStopRequested = false;
            setDictating(true);
            dictationResultEl.textContent = '';
            dictationResultEl.style.display = 'block';
            activeDictationPromptText = getDictationPromptText();
            showDictationOverlay(activeDictationPromptText, 'prompt', 0, false, false);
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognition = new SpeechRecognition();
            recognition.lang = speechLang;
            recognition.interimResults = true;
            recognition.continuous = true;
            recognition.onstart = () => {
                isDictating = true;
                setDictating(true);
                dictationStopRequested = false;
                dictationResultEl.textContent = '';
                dictationResultEl.style.display = 'block';
                activeDictationPromptText = getDictationPromptText();
                showDictationOverlay(activeDictationPromptText, 'prompt', 0, false, false);
                scheduleDictationLongTimeout();
            };
            recognition.onend = () => {
                const wasStopRequested = dictationStopRequested;
                const shouldRestartWhileHeld = !!(
                    pressToDictateEnabled &&
                    activeDictationPointerId !== null &&
                    !wasStopRequested &&
                    !pendingPressToDictateRestart
                );
                dictationStopRequested = false;
                recognition = null;
                isDictating = false;
                setDictating(false);
                refreshDictationButton();
                clearDictationListeningTimers();
                if (shouldRestartWhileHeld) {
                    appDebugLog('[dictation] engine-ended-while-held restarting');
                    window.setTimeout(() => {
                        if (!pressToDictateEnabled) return;
                        if (activeDictationPointerId === null) return;
                        if (isDictating || recognition) return;
                        if (typeof beginDictationSessionRef !== 'function') return;
                        beginDictationSessionRef();
                    }, 0);
                    return;
                }
                if (wasStopRequested) {
                    activeDictationPointerId = null;
                    pendingPressToDictateRestart = false;
                }
                if (!dictationResultEl.textContent || String(dictationResultEl.textContent).trim() === String(activeDictationPromptText || '').trim()) {
                    showDictationOverlay(UIStrings.noSpeech, 'prompt', 1800, false, true);
                } else {
                    showDictationOverlay(dictationResultEl.innerHTML, 'normal', 4000, true, true);
                }
            };
            recognition.onerror = (event) => {
                if (dictationStopRequested) {
                    return;
                }
                recognition = null;
                isDictating = false;
                activeDictationPointerId = null;
                setDictating(false);
                refreshDictationButton();
                clearDictationListeningTimers();
                showDictationOverlay(`${UIStrings.error}: ${event.error || UIStrings.unknown}`, 'error', 2200, false, true);
            };
            recognition.onresult = (event) => {
                let html = '';
                let bestTranscript = '';
                let bestConfidence = 0;
                let bestFinalTranscript = '';
                let bestFinalConfidence = 0;
                let sawFinalResult = false;
                clearTimeout(dictationPostResultTimeout);
                dictationPostResultTimeout = null;

                appDebugLog('[dictation] results-start');
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    const alternatives = event.results[i];
                    const resultKind = alternatives.isFinal ? 'final' : 'interim';
                    appDebugLog(`[dictation][${resultKind}] result=${i} alternatives=${alternatives.length}`);
                    if (alternatives.isFinal) {
                        sawFinalResult = true;
                    }
                    for (let j = 0; j < alternatives.length; ++j) {
                        const alt = alternatives[j];
                        const transcript = alt.transcript.trim();
                        const confidencePct = ((alt.confidence || 0) * 100).toFixed(1);
                        appDebugLog(`[dictation][${resultKind}] result=${i} alt=${j} text="${transcript}" confidence=${confidencePct}%`);
                    }
                }
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    const alternatives = event.results[i];
                    for (let j = 0; j < alternatives.length; ++j) {
                        const alt = alternatives[j];
                        let opacity = 0.4 + 0.6 * (alt.confidence || 0);
                        if (opacity > 1) opacity = 1;
                        if (opacity < 0.4) opacity = 0.4;
                        const conf = alt.confidence ? ` <span style='font-size:0.8em;color:#888;'>(${(alt.confidence * 100).toFixed(1)}%)</span>` : '';
                        html += `<div style=\"opacity:${opacity};font-weight:${j === 0 ? 700 : 400};margin-bottom:0.1em;\">${alt.transcript}${conf}</div>`;

                        if (j === 0 && (!bestTranscript || (alt.confidence || 0) > bestConfidence)) {
                            bestTranscript = alt.transcript.trim();
                            bestConfidence = alt.confidence || 0;
                        }
                        if (alternatives.isFinal && j === 0 && (!bestFinalTranscript || (alt.confidence || 0) >= bestFinalConfidence)) {
                            bestFinalTranscript = alt.transcript.trim();
                            bestFinalConfidence = alt.confidence || 0;
                        }
                    }
                }
                const transcriptForMatch = bestFinalTranscript || bestTranscript;
                appDebugLog(`[dictation] best-overall="${bestTranscript}" best-final="${bestFinalTranscript}" transcript-for-match="${transcriptForMatch}"`);
                scheduleDictationLongTimeout();
                if (sawFinalResult) {
                    scheduleDictationPostResultTimeout();
                }
                const matchResult = currentCard && !autoskipLock
                    ? getDictationMatchResult(transcriptForMatch, currentCard)
                    : { matched: false };
                if (matchResult.matched) {
                    clearDictationListeningTimers();
                    const successHtml = matchResult.viaFrenchPluralHomophoneFallback
                        ? `<div style="opacity:1;font-weight:700;margin-bottom:0.1em;">${escapeHtml(matchResult.displayText)}</div>`
                        : matchResult.viaFrenchHomophoneGroupFallback
                            ? `<div style="opacity:1;font-weight:700;margin-bottom:0.1em;">${escapeHtml(matchResult.displayText)}</div><div style="opacity:0.9;font-size:0.92em;color:#2c3e50;">Accepted as the same-sounding answer.</div>`
                        : html;
                    dictationResultEl.innerHTML = successHtml + `<div style=\"opacity:1;font-weight:700;color:#27ae60;margin-top:0.5em;\">🎉 Bravo !</div>`;
                    dictationResultEl.style.display = 'block';
                    dictationResultEl.style.opacity = '1';
                    handleMicSuccess();
                    return;
                }

                showDictationOverlay(html, 'normal', 0, true, false);
            };
            recognition.start();
            scheduleDictationLongTimeout();
            return true;
        };
        beginDictationSessionRef = beginDictationSession;

        const endPressToDictateSession = (pointerId) => {
            if (activeDictationPointerId !== pointerId) return;
            activeDictationPointerId = null;
            pendingPressToDictateRestart = false;
            if (isDictating && recognition) {
                stopActiveDictation({ silent: false });
            }
        };

        // Attach click handler ONCE
        if (!dictateBtn._dictationHandlerAttached) {
            dictateBtn.addEventListener('pointerdown', (event) => {
                if (!pressToDictateEnabled) return;
                if (event.button !== undefined && event.button !== 0) return;
                if (activeDictationPointerId !== null || (isDictating && recognition)) return;
                activeDictationPointerId = event.pointerId;
                suppressNextDictationClick = true;
                if (typeof dictateBtn.setPointerCapture === 'function') {
                    try {
                        dictateBtn.setPointerCapture(event.pointerId);
                    } catch (error) {
                        console.warn('Could not capture dictation pointer:', error);
                    }
                }
                event.preventDefault();
                event.stopPropagation();
                beginDictationSession();
            });
            dictateBtn.addEventListener('pointerup', (event) => {
                if (!pressToDictateEnabled) return;
                event.preventDefault();
                event.stopPropagation();
                endPressToDictateSession(event.pointerId);
            });
            dictateBtn.addEventListener('pointercancel', (event) => {
                if (!pressToDictateEnabled) return;
                endPressToDictateSession(event.pointerId);
            });
            dictateBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                if (pressToDictateEnabled) {
                    if (suppressNextDictationClick) {
                        suppressNextDictationClick = false;
                        return;
                    }
                    if (e.detail !== 0) {
                        return;
                    }
                }
                const availability = getMicAvailability();
                const micMode = getEffectiveMicMode();
                if (availability !== 'enabled') {
                    const unavailableMessage = getMicUnavailableOverlayMessage(availability, micMode);
                    if (unavailableMessage) {
                        showDictationOverlay(
                            unavailableMessage,
                            availability === 'unsupported' || availability === 'safeModeBlocked' ? 'error' : 'prompt',
                            2600,
                            false,
                            true
                        );
                    }
                    refreshDictationButton();
                    return;
                }
                if (isDictating && recognition) {
                    stopActiveDictation({ silent: false });
                    return;
                }
                beginDictationSession();
            });
            dictateBtn._dictationHandlerAttached = true;
        }
        refreshDictationButton();
    }
    // --- State ---
    let currentCard = null;
    let currentDetailVerb = null;
    let currentDetailRouteState = null;
    let history = [];
    let historyIndex = -1;
    let isAnswerVisible = false;
    let recentCardKeys = []; // track last N card keys to avoid immediate repeats
    let sharedEntryTutorialPending = false;
    const IDLE_HIDDEN_NUDGE_DELAY_MS = 7000;
    const IDLE_REVEALED_NUDGE_DELAY_MS = 6000;
    let idleGuidanceTimeout = null;

    const loadTutorialState = () => {
        try {
            const saved = localStorage.getItem(TUTORIAL_STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                tutorialState.active = !!parsed.active;
                tutorialState.completed = !!parsed.completed;
                tutorialState.stepIndex = Math.max(0, Math.min(TUTORIAL_STEPS.length, Number(parsed.stepIndex) || 0));
                return;
            }
        } catch (error) {
            console.warn('Could not load tutorial state:', error);
        }

        const alreadyOnboarded = getScopedStorageItem('ftue-shown') === 'true' || getScopedStorageItem('tutorial_seen') === 'yes';
        tutorialState.active = !alreadyOnboarded;
        tutorialState.completed = alreadyOnboarded;
        tutorialState.stepIndex = alreadyOnboarded ? TUTORIAL_STEPS.length : 0;
    };

    const saveTutorialState = () => {
        try {
            localStorage.setItem(TUTORIAL_STORAGE_KEY, JSON.stringify({
                active: tutorialState.active,
                completed: tutorialState.completed,
                stepIndex: tutorialState.stepIndex
            }));
            if (tutorialState.completed) {
                setScopedStorageItem('ftue-shown', 'true');
                setScopedStorageItem('tutorial_seen', 'yes');
            }
        } catch (error) {
            console.warn('Could not save tutorial state:', error);
        }
    };

    const getSpeechRecognitionState = () => {
        if (SAFE_MODE) return 'safeModeBlocked';
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) return 'unsupported';
        return 'ready';
    };

    const isTutorialDeferredForSharedEntry = () => !!(
        sharedEntryTutorialPending
        && currentCard
        && currentCard._sharedDetailEntryCard
    );

    const getEffectiveMicMode = () => (
        tutorialState.active && !isTutorialDeferredForSharedEntry()
            ? 'practiceAfterReveal'
            : (cardGenerationOptions.useMicToAnswer ? 'answerByVoice' : 'practiceAfterReveal')
    );

    const getDictationPromptText = () => {
        if (currentCard && getEffectiveMicMode() === 'answerByVoice' && !isAnswerVisible) {
            return getPrompt(currentCard);
        }
        return UIStrings.speakNow || 'Speak now.';
    };

    const isTutorialMicLocked = () => {
        if (isTutorialDeferredForSharedEntry()) return false;
        if (!tutorialState.active) return false;
        return tutorialState.stepIndex < 2 || (tutorialState.stepIndex === 2 && !isAnswerVisible);
    };

    const getMicAvailability = () => {
        const speechState = getSpeechRecognitionState();
        if (speechState !== 'ready') return speechState;
        if (!currentCard || currentCard.isPhraseMode || !currentCard.verb) return 'phase-disabled';
        if (isTutorialMicLocked()) return 'tutorial-locked';

        const micMode = getEffectiveMicMode();
        if (micMode === 'practiceAfterReveal' && !isAnswerVisible) return 'phase-disabled';
        return 'enabled';
    };

    const getUsageAvailability = () => {
        if (!FRENCH_FLASHCARD_FEATURES.usageNuggetVisibilityToggle) return 'hidden';
        if (tutorialState.active && !isTutorialDeferredForSharedEntry()) return 'tutorial-locked';
        if (!currentCard || currentCard.isPhraseMode) return 'phase-disabled';
        if (!currentCard._hasUsages) return 'no-content';
        return 'enabled';
    };

    const setMicAnswerMode = (enabled, options = {}) => {
        const { persist = true } = options;
        cardGenerationOptions.useMicToAnswer = !!enabled;
        if (persist) saveOptions();
    };

    const setIdleNudgeEnabled = (enabled) => {
        idleNudgeEnabled = !!enabled;
        setScopedStorageItem(IDLE_NUDGE_ENABLED_KEY, idleNudgeEnabled ? 'true' : 'false');
        clearIdleGuidanceState();
        refreshIdleGuidance();
    };

    const setPressToDictateEnabled = (enabled) => {
        pressToDictateEnabled = !!enabled;
        setScopedStorageItem(PRESS_TO_DICTATE_ENABLED_KEY, pressToDictateEnabled ? 'true' : 'false');
        if (!pressToDictateEnabled) {
            activeDictationPointerId = null;
            suppressNextDictationClick = false;
        }
        refreshDictationButton();
    };

    const syncIdleNudgeSettingUi = () => {
        const idleNudgeToggle = document.getElementById('idle-nudge-toggle');
        if (!idleNudgeToggle) return;
        idleNudgeToggle.checked = idleNudgeEnabled;
    };

    const syncPressToDictateSettingUi = () => {
        const pressToDictateToggle = document.getElementById('press-to-dictate-toggle');
        if (!pressToDictateToggle) return;
        pressToDictateToggle.checked = pressToDictateEnabled;
        if (pressToDictateHelperEl) {
            pressToDictateHelperEl.textContent = 'Hold the mic while speaking, then release to transcribe.';
        }
    };

    const setShowTipsEnabled = (enabled) => {
        showTipsEnabled = !!enabled;
        setScopedStorageItem(SHOW_TIPS_ENABLED_KEY, showTipsEnabled ? 'true' : 'false');
        applyReopenMessagePrompt();
        renderReopenMessage();
    };

    const syncShowTipsSettingUi = () => {
        const showTipsToggle = document.getElementById('show-tips-toggle');
        if (!showTipsToggle) return;
        showTipsToggle.checked = showTipsEnabled;
    };

    const syncMicModeSettingUi = () => {
        const correctDictationToggle = document.getElementById('correct-dictation-toggle');
        if (!correctDictationToggle) return;
        const tutorialLocksMicMode = tutorialState.active && !isTutorialDeferredForSharedEntry();
        correctDictationToggle.checked = !!cardGenerationOptions.useMicToAnswer;
        correctDictationToggle.disabled = tutorialLocksMicMode;
        if (correctDictationHelperEl) {
            correctDictationHelperEl.textContent = tutorialLocksMicMode
                ? 'The tutorial begins with after-reveal pronunciation practice.'
                : 'When off, the mic is used for pronunciation practice after reveal.';
        }
    };

    const getCurrentTutorialHint = () => {
        if (isTutorialDeferredForSharedEntry()) return '';
        if (!tutorialState.active || !currentCard || currentCard.isPhraseMode || !currentCard.verb) return '';
        const step = TUTORIAL_STEPS[tutorialState.stepIndex];
        if (!step) return '';
        const rawHint = isAnswerVisible ? step.after : step.before;
        return typeof rawHint === 'function' ? rawHint(currentCard) : rawHint;
    };

    const getCurrentTutorialHeading = () => {
        if (isTutorialDeferredForSharedEntry()) return '';
        if (!tutorialState.active || !currentCard || currentCard.isPhraseMode || !currentCard.verb) return '';
        const step = TUTORIAL_STEPS[tutorialState.stepIndex];
        if (!step) return '';
        return isAnswerVisible ? (step.headingAfter || step.heading || '') : (step.headingBefore || step.heading || '');
    };

    const renderTutorialHint = () => {
        if (!tutorialInlineHintEl || !tutorialInlineTextEl || !tutorialInlineHeadingEl || !tutorialInlineBodyEl) return;
        const hint = getCurrentTutorialHint();
        const heading = getCurrentTutorialHeading();
        tutorialInlineHintEl.classList.toggle('hidden', !hint);
        tutorialInlineHintEl.classList.toggle('tutorial-before', !!hint && !isAnswerVisible);
        tutorialInlineHintEl.classList.toggle('tutorial-after', !!hint && isAnswerVisible);
        tutorialInlineHeadingEl.textContent = hint && heading ? heading : '';
        tutorialInlineBodyEl.innerHTML = hint || '';
        renderReopenMessage();
        refreshIdleGuidance();
    };

    const renderReopenMessage = () => {
        if (!returnInlineMessageEl || !returnInlineBadgeEl || !returnInlineBodyEl) return;
        const currentCardKey = currentCard && currentCard.verb
            ? `verb:${currentCard.verb.infinitive}|${currentCard.tense}|${currentCard.pronoun}`
            : '';
        const isSameShownCard = !!(reopenMessageState.shownCardKey && currentCardKey && reopenMessageState.shownCardKey === currentCardKey);
        const shouldShow = !!(
            reopenMessageState.active
            && !reopenMessageState.dismissed
            && tutorialState.completed
            && !tutorialState.active
            && !isAnswerVisible
            && currentCard
            && currentCard.verb
            && (!reopenMessageState.shownCardKey || isSameShownCard)
        );
        if (shouldShow && !reopenMessageState.shownCardKey && currentCardKey) {
            reopenMessageState.shownCardKey = currentCardKey;
            console.log('[reopen-debug] reopen message locked to card', currentCardKey);
        }
        const badgeText = shouldShow ? String(reopenMessageState.badge || '').trim() : '';
        returnInlineMessageEl.classList.toggle('hidden', !shouldShow);
        returnInlineBadgeEl.textContent = badgeText;
        returnInlineBadgeEl.style.display = badgeText ? '' : 'none';
        returnInlineBodyEl.textContent = shouldShow ? reopenMessageState.body : '';
    };

    const dismissReopenMessage = () => {
        if (!reopenMessageState.active || reopenMessageState.dismissed) return;
        reopenMessageState.dismissed = true;
        renderReopenMessage();
    };

    const isReopenMessageVisible = () => !!(
        returnInlineMessageEl
        && !returnInlineMessageEl.classList.contains('hidden')
    );

    const refreshTutorialAwareUi = () => {
        renderTutorialHint();
        syncMicModeSettingUi();
        syncIdleNudgeSettingUi();
        syncShowTipsSettingUi();
    };

    const clearIdleGuidanceTimer = () => {
        if (idleGuidanceTimeout) {
            clearTimeout(idleGuidanceTimeout);
            idleGuidanceTimeout = null;
        }
    };

    const clearIdleGuidanceState = () => {
        clearIdleGuidanceTimer();
        if (questionPhraseEl) {
            questionPhraseEl.classList.remove('idle-nudge-active');
            if (questionPhraseEl.classList.contains('flashcard-task-prompt')) {
                questionPhraseEl.style.display = 'none';
            }
        }
        if (tutorialInlineHintEl) tutorialInlineHintEl.classList.remove('idle-nudge-active');
        if (answerFlowBtn) answerFlowBtn.classList.remove('idle-nudge-active');
        if (nextBtn) nextBtn.classList.remove('idle-nudge-active');
    };

    const isFlashcardViewActive = () => !!(flashcardView && !flashcardView.classList.contains('hidden'));

    const getIdleGuidancePromptText = (card) => {
        if (!card || !card.verb) return '';
        const rawPrompt = typeof getPrompt === 'function' ? String(getPrompt(card) || '') : '';
        const normalizedPrompt = rawPrompt
            .replace(/<br\s*\/?>/gi, ' ')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        const promptWithoutReveal = normalizedPrompt
            .replace(/\s*(tap|click)\s+show\s+to\s+reveal(?:\s+the\s+answer)?\.?$/i, '')
            .replace(/\s*think\s+of\s+the\s+answer.*$/i, '')
            .trim();
        const tenseLabels = {
            passeCompose: 'passé composé',
            imparfait: 'imperfect',
            futurSimple: 'future',
            plusQueParfait: 'pluperfect',
            subjonctifPresent: 'present subjunctive',
            conditionnelPresent: 'conditional',
            preterite: 'preterite',
            imperfect: 'imperfect',
            future: 'future',
            conditional: 'conditional',
            imperative: 'imperative',
            presentSubjunctive: 'present subjunctive',
            pastSubjunctive: 'past subjunctive',
            activePresent: 'present',
            activePast: 'past',
            activeFuture: 'future',
            aorist: 'aorist'
        };
        const verb = String(card.verb.infinitive || '').trim();
        const pronoun = String(card.pronoun || '').trim();
        const tenseKey = String(card.tense || '').trim();
        const tense = tenseLabels[tenseKey] || tenseKey.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[_-]+/g, ' ').toLowerCase();
        const fallbackPrompt = (
            (verb && pronoun && tense) ? `Conjugate "${verb}" for "${pronoun}" in ${tense}.`
                : (verb && pronoun) ? `Conjugate "${verb}" for "${pronoun}".`
                    : verb ? `Conjugate "${verb}".`
                        : ''
        );
        const basePrompt = promptWithoutReveal || fallbackPrompt;
        if (!basePrompt) return '';
        const lead = /[.?!]$/.test(basePrompt) ? basePrompt : `${basePrompt}.`;
        return `${lead} Think of the answer, then tap Show or tap anywhere to reveal.`;
    };

    const syncTaskPromptVisibility = () => {
        if (!questionPhraseEl) return;

        const isPhraseMode = !!(currentCard && (currentCard.isPhraseMode || (!currentCard.verb && currentCard.phrase)));
        const isFrameCard = !!(currentCard && currentCard.isFrameCard);
        const hasGapSentencePrompt = !!(
            ENABLE_GAP_SENTENCES
            && currentCard
            && currentCard.chosenPhrase
            && currentCard.chosenPhrase.gap_sentence
        );

        if (isPhraseMode || isFrameCard || hasGapSentencePrompt) {
            questionPhraseEl.classList.remove('flashcard-task-prompt', 'idle-nudge-active');
            return false;
        }

        if (!currentCard || !currentCard.verb || isAnswerVisible) {
            questionPhraseEl.classList.remove('flashcard-task-prompt', 'idle-nudge-active');
            questionPhraseEl.textContent = '';
            questionPhraseEl.style.display = 'none';
            questionPhraseEl.style.top = '';
            return false;
        }

        const tutorialVisible = !!(tutorialInlineHintEl && !tutorialInlineHintEl.classList.contains('hidden'));
        if (tutorialVisible) {
            questionPhraseEl.classList.remove('flashcard-task-prompt', 'idle-nudge-active');
            questionPhraseEl.textContent = '';
            questionPhraseEl.style.display = 'none';
            questionPhraseEl.style.top = '';
            return false;
        }

        const promptText = getIdleGuidancePromptText(currentCard);
        if (!promptText) {
            questionPhraseEl.classList.remove('flashcard-task-prompt', 'idle-nudge-active');
            questionPhraseEl.textContent = '';
            questionPhraseEl.style.display = 'none';
            questionPhraseEl.style.top = '';
            return false;
        }

        questionPhraseEl.textContent = promptText;
        questionPhraseEl.style.display = 'none';
        questionPhraseEl.style.top = '';
        questionPhraseEl.classList.add('flashcard-task-prompt');
        return true;
    };

    const showGeneratedTaskPrompt = () => {
        if (
            !questionPhraseEl
            || !questionPhraseEl.classList.contains('flashcard-task-prompt')
            || !questionPhraseEl.textContent.trim()
        ) {
            return false;
        }
        questionPhraseEl.style.display = 'block';
        questionPhraseEl.classList.add('idle-nudge-active');
        return true;
    };

    const refreshIdleGuidance = () => {
        clearIdleGuidanceState();
        const hasGeneratedPrompt = syncTaskPromptVisibility();

        if (!isFlashcardViewActive() || !currentCard) return;
        if (!idleNudgeEnabled) return;
        if (isReopenMessageVisible()) return;

        if (isAnswerVisible) {
            if (!answerFlowBtn) return;
            idleGuidanceTimeout = setTimeout(() => {
                if (!isFlashcardViewActive() || !currentCard || !isAnswerVisible) return;
                answerFlowBtn.classList.add('idle-nudge-active');
            }, IDLE_REVEALED_NUDGE_DELAY_MS);
            return;
        }

        idleGuidanceTimeout = setTimeout(() => {
            if (!isFlashcardViewActive() || !currentCard || isAnswerVisible) return;
            if (tutorialInlineHintEl && !tutorialInlineHintEl.classList.contains('hidden')) {
                tutorialInlineHintEl.classList.add('idle-nudge-active');
                return;
            }
            if (hasGeneratedPrompt) {
                showGeneratedTaskPrompt();
            }
        }, IDLE_HIDDEN_NUDGE_DELAY_MS);
    };

    const completeTutorialIfNeeded = () => {
        if (!tutorialState.active) return;
        if (tutorialState.stepIndex >= TUTORIAL_STEPS.length - 1) {
            tutorialState.active = false;
            tutorialState.completed = true;
            tutorialState.stepIndex = TUTORIAL_STEPS.length;
        } else {
            tutorialState.stepIndex += 1;
        }
        saveTutorialState();
    };

    const skipTutorialFlow = () => {
        if (!tutorialState.active) return;
        stopActiveDictation({ abort: true, silent: true });
        tutorialState.active = false;
        tutorialState.completed = true;
        tutorialState.stepIndex = TUTORIAL_STEPS.length;
        saveTutorialState();
        renderTutorialHint();
        refreshTutorialAwareUi();
        refreshContextAudioButton();
        refreshAnswerFlowButton();
        syncUsageNuggetVisibility();
        refreshDictationButton();
        syncTaskPromptVisibility();
        refreshIdleGuidance();
    };

    const restartTutorialFlow = (options = {}) => {
        const { confirmRestart = false } = options;
        if (confirmRestart && !window.confirm('Restart the tutorial from the beginning?')) {
            return;
        }
        stopActiveDictation({ abort: true, silent: true });
        tutorialState.active = true;
        tutorialState.completed = false;
        tutorialState.stepIndex = 0;
        if (typeof resetTutorialPracticeBaseline === 'function') {
            resetTutorialPracticeBaseline();
        } else {
            setMicAnswerMode(false, { persist: false });
        }
        saveTutorialState();
        showFlashcards();
        if (!showTutorialIntroCard()) {
            const fallbackCard = generateNewCard(cardGenerationOptions);
            if (fallbackCard) {
                history = [fallbackCard];
                historyIndex = 0;
                displayCard(fallbackCard);
                hideAnswer();
                backBtn.disabled = true;
            } else if (isAnswerVisible) {
                hideAnswer();
            } else {
                refreshTutorialAwareUi();
                refreshContextAudioButton();
                refreshAnswerFlowButton();
                syncUsageNuggetVisibility();
            }
        }
    };

    window.startTutorial = () => restartTutorialFlow({ confirmRestart: false });
    window.skipTutorial = skipTutorialFlow;

    if (tutorialInlineSkipBtn) {
        tutorialInlineSkipBtn.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            skipTutorialFlow();
        });
    }

    // --- Options UI Elements ---
    const tenseWeightsContainer = document.getElementById('tense-weights-container');
    const verbPoolBasicContainer = document.getElementById('verb-pool-basic-container');
    const verbSetContainer = document.getElementById('verb-set-container');
    const advancedPracticeContainer = document.getElementById('advanced-practice-container');
    const currentDrillCard = document.getElementById('current-drill-card');
    const savedDrillsGroup = document.getElementById('saved-drills-group');
    const savedDrillsContainer = document.getElementById('saved-drills-container');

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

    // Dynamically create frequency weights from the data.
    // The starter drill later reshapes these into the first real user-facing setup,
    // but we still initialize a sensible beginner-friendly baseline here.
    const starterWeights = { top20: 3, top50: 1, top100: 0, top500: 0, top1000: 0, top2000: 0, top3000: 0, top4000: 0, top5000: 0, rare: 0 };
    const frequencyWeights = {};
    allFrequencies.forEach(freq => {
        frequencyWeights[freq] = starterWeights[freq] ?? 0;
    });

    const cardGenerationOptions = {
        hierarchical: true, // When true, pick frequency group first, then verb.
        showPhrases: true,
        verbsWithSentencesOnly: false, // When true, only show verbs that have sentences
        balancedPronouns: false, // When true, all 9 pronouns get equal weight
        useMicToAnswer: false, // When true, the mic answers before reveal instead of practicing after reveal.
        showUsageNugget: false,
        cardTypeMode: 'conjugation', // 'conjugation' | 'both' | 'frame'
        reflexiveMode: 'include', // 'include' = both, 'only' = reflexive only, 'exclude' = no reflexive
        prepositionalVerbMode: 'all', // 'all' | 'only'
        tenseWeights,
        frequencyWeights,
        // New filters (objects: true = included)
        regularityFilter: { regular: true, irregular: true },
        endingFilter: { er: true, ir: true, re: true, other: true },
        categoryFilter: 'all',   // 'all' | one of classifyFrenchVerb categories
        // TODO(Filter): Consider allowing multiple categories (multi-select) and store as array.
    };
    window.cardGenerationOptions = cardGenerationOptions;

    // --- Lightweight local review-priority model ---
    // This is intentionally not a classic spaced-repetition scheduler.
    // It only nudges the existing weighted-random generator toward cards that
    // are statically harder, less familiar, or mildly signaled as troublesome.
    const REVIEW_MODEL_STORAGE_KEY = 'reviewModelStateV1';
    const reviewModelConfig = {
        enabled: true,
        selection: {
            recentHardBlockTurns: 6,
            candidatePoolSize: 0, // 0 = use the full eligible deck
            randomnessExponent: 1,
            minimumWeight: 0.0001,
        },
        staticDifficulty: {
            tenseBonuses: {
                present: 0,
                passeCompose: 0.14,
                imparfait: 0.1,
                futurSimple: 0.12,
                plusQueParfait: 0.18,
                subjonctifPresent: 0.22,
                conditionnelPresent: 0.16,
            },
            frequencyBonuses: {
                top20: 0,
                top50: 0.04,
                top100: 0.08,
                top500: 0.14,
                top1000: 0.2,
                top2000: 0.24,
                top3000: 0.28,
                top4000: 0.32,
                top5000: 0.36,
                rare: 0.42,
            },
            irregularVerbBonus: 0.14,
            reflexiveVerbBonus: 0.05,
        },
        familiarity: {
            maxBoost: 0.45,
            decayExponent: 0.85,
        },
        recency: {
            floorMultiplier: 0.12,
            fullRecoveryTurns: 18,
        },
        detailsHint: {
            boostPerOpen: 0.1,
            maxBoost: 0.28,
            seenDecayPerExposure: 0.18,
            fullDecayTurns: 48,
        },
        dwellHint: {
            enabled: false,
            minBaselineSamples: 4,
            ewmaAlpha: 0.18,
            slowThresholdMultiplier: 1.6,
            minimumRevealMs: 900,
            maximumTrackedRevealMs: 45000,
            boostPerHint: 0.04,
            maxBoost: 0.12,
            hardHintCap: 3,
        },
        storage: {
            maxCardEntries: 12000,
            maxVerbEntries: 2000,
        },
    };

    const buildEmptyReviewModelState = () => ({
        turnCounter: 0,
        cards: {},
        verbs: {},
        dwellBaselineMs: 0,
        dwellSampleCount: 0,
    });

    const loadReviewModelState = () => {
        try {
            const raw = getScopedStorageItem(REVIEW_MODEL_STORAGE_KEY);
            if (!raw) return buildEmptyReviewModelState();
            const parsed = JSON.parse(raw);
            return {
                ...buildEmptyReviewModelState(),
                ...parsed,
                cards: parsed && typeof parsed.cards === 'object' && parsed.cards ? parsed.cards : {},
                verbs: parsed && typeof parsed.verbs === 'object' && parsed.verbs ? parsed.verbs : {},
            };
        } catch (error) {
            console.warn('Could not load review model state:', error);
            return buildEmptyReviewModelState();
        }
    };

    const getVerbReviewFreshness = (meta = {}) => Math.max(meta.lastSeenTurn || 0, meta.lastDetailsOpenedTurn || 0);

    const pruneReviewModelState = (state) => {
        const pruneMap = (entries, maxEntries, getFreshness) => {
            const keys = Object.keys(entries || {});
            if (keys.length <= maxEntries) return;
            keys
                .sort((a, b) => getFreshness(entries[b]) - getFreshness(entries[a]))
                .slice(maxEntries)
                .forEach((key) => {
                    delete entries[key];
                });
        };
        pruneMap(state.cards, reviewModelConfig.storage.maxCardEntries, (meta) => meta.lastSeenTurn || 0);
        pruneMap(state.verbs, reviewModelConfig.storage.maxVerbEntries, getVerbReviewFreshness);
    };

    const persistReviewModelState = () => {
        try {
            pruneReviewModelState(reviewModelState);
            setScopedStorageItem(REVIEW_MODEL_STORAGE_KEY, JSON.stringify(reviewModelState));
        } catch (error) {
            console.warn('Could not save review model state:', error);
        }
    };

    const getCardReviewMeta = (card, create = false) => {
        if (!card || !card.verb) return null;
        const key = cardKey(card);
        if (!reviewModelState.cards[key] && create) {
            reviewModelState.cards[key] = { seenCount: 0, lastSeenTurn: 0, slowHintCount: 0 };
        }
        return reviewModelState.cards[key] || null;
    };

    const getVerbReviewMeta = (verbInfinitive, create = false) => {
        if (!verbInfinitive) return null;
        if (!reviewModelState.verbs[verbInfinitive] && create) {
            reviewModelState.verbs[verbInfinitive] = { seenCount: 0, lastSeenTurn: 0, openedDetailsCount: 0, lastDetailsOpenedTurn: 0 };
        }
        return reviewModelState.verbs[verbInfinitive] || null;
    };

    const getTurnsSinceLastSeen = (card) => {
        const meta = getCardReviewMeta(card);
        if (!meta || !meta.lastSeenTurn) return null;
        return Math.max(0, (reviewModelState.turnCounter || 0) - meta.lastSeenTurn);
    };

    const isCardHardBlockedByRecency = (card) => {
        const turnsSinceLastSeen = getTurnsSinceLastSeen(card);
        if (turnsSinceLastSeen === null) return false;
        return turnsSinceLastSeen < reviewModelConfig.selection.recentHardBlockTurns;
    };

    const recordCardSeen = (card) => {
        if (!reviewModelConfig.enabled || !card || !card.verb) return;
        reviewModelState.turnCounter = (reviewModelState.turnCounter || 0) + 1;
        const currentTurn = reviewModelState.turnCounter;
        const cardMeta = getCardReviewMeta(card, true);
        const verbMeta = getVerbReviewMeta(card.verb.infinitive, true);
        cardMeta.seenCount = (cardMeta.seenCount || 0) + 1;
        cardMeta.lastSeenTurn = currentTurn;
        verbMeta.seenCount = (verbMeta.seenCount || 0) + 1;
        verbMeta.lastSeenTurn = currentTurn;
        persistReviewModelState();
    };

    const recordVerbDetailOpen = (verbInfinitive) => {
        if (!reviewModelConfig.enabled || !verbInfinitive) return;
        const verbMeta = getVerbReviewMeta(verbInfinitive, true);
        verbMeta.openedDetailsCount = (verbMeta.openedDetailsCount || 0) + 1;
        verbMeta.lastDetailsOpenedTurn = reviewModelState.turnCounter || 0;
        persistReviewModelState();
    };

    const recordSlowRevealHintIfNeeded = (card, elapsedMs) => {
        const dwellConfig = reviewModelConfig.dwellHint;
        if (!reviewModelConfig.enabled || !dwellConfig.enabled || !card || !card.verb) return;
        if (!Number.isFinite(elapsedMs)) return;
        if (elapsedMs < dwellConfig.minimumRevealMs || elapsedMs > dwellConfig.maximumTrackedRevealMs) return;

        const previousBaseline = reviewModelState.dwellBaselineMs || 0;
        const previousSamples = reviewModelState.dwellSampleCount || 0;
        const hasBaseline = previousSamples >= dwellConfig.minBaselineSamples && previousBaseline > 0;

        if (hasBaseline && elapsedMs >= previousBaseline * dwellConfig.slowThresholdMultiplier) {
            const cardMeta = getCardReviewMeta(card, true);
            cardMeta.slowHintCount = Math.min(dwellConfig.hardHintCap, (cardMeta.slowHintCount || 0) + 1);
        }

        reviewModelState.dwellBaselineMs = previousSamples <= 0
            ? elapsedMs
            : (previousBaseline * (1 - dwellConfig.ewmaAlpha)) + (elapsedMs * dwellConfig.ewmaAlpha);
        reviewModelState.dwellSampleCount = previousSamples + 1;
        persistReviewModelState();
    };

    const getStaticDifficultyMultiplier = (card) => {
        if (!card || !card.verb) return 1;
        const staticConfig = reviewModelConfig.staticDifficulty;
        let bonus = staticConfig.tenseBonuses[card.tense] || 0;
        bonus += staticConfig.frequencyBonuses[card.verb.frequency || 'top50'] || 0;
        if (IRREGULAR_VERBS.has(card.verb.infinitive)) bonus += staticConfig.irregularVerbBonus;
        if (card.verb.reflexive) bonus += staticConfig.reflexiveVerbBonus;
        return 1 + bonus;
    };

    const getFamiliarityMultiplier = (card) => {
        if (!card || !card.verb) return 1;
        const seenCount = getCardReviewMeta(card)?.seenCount || 0;
        const familiarityConfig = reviewModelConfig.familiarity;
        const boost = familiarityConfig.maxBoost / Math.pow(seenCount + 1, familiarityConfig.decayExponent);
        return 1 + boost;
    };

    const getRecencyMultiplier = (card) => {
        if (!card || !card.verb) return 1;
        const turnsSinceLastSeen = getTurnsSinceLastSeen(card);
        if (turnsSinceLastSeen === null) return 1;
        const recencyConfig = reviewModelConfig.recency;
        const blockTurns = reviewModelConfig.selection.recentHardBlockTurns;
        if (turnsSinceLastSeen < blockTurns) {
            return recencyConfig.floorMultiplier;
        }
        const recoveryTurns = Math.max(blockTurns + 1, recencyConfig.fullRecoveryTurns);
        const progress = Math.min(1, (turnsSinceLastSeen - blockTurns) / Math.max(1, recoveryTurns - blockTurns));
        return recencyConfig.floorMultiplier + ((1 - recencyConfig.floorMultiplier) * progress);
    };

    const getDetailsHintMultiplier = (card) => {
        if (!card || !card.verb) return 1;
        const detailsConfig = reviewModelConfig.detailsHint;
        const verbMeta = getVerbReviewMeta(card.verb.infinitive);
        if (!verbMeta || !verbMeta.openedDetailsCount) return 1;
        const turnsSinceDetails = Math.max(0, (reviewModelState.turnCounter || 0) - (verbMeta.lastDetailsOpenedTurn || 0));
        const timeDecay = turnsSinceDetails >= detailsConfig.fullDecayTurns
            ? 0
            : 1 - (turnsSinceDetails / Math.max(1, detailsConfig.fullDecayTurns));
        const detailPressure = Math.max(0, (verbMeta.openedDetailsCount || 0) - ((verbMeta.seenCount || 0) * detailsConfig.seenDecayPerExposure));
        const boost = Math.min(detailsConfig.maxBoost, detailPressure * detailsConfig.boostPerOpen * timeDecay);
        return 1 + boost;
    };

    const getDwellHintMultiplier = (card) => {
        if (!reviewModelConfig.dwellHint.enabled || !card || !card.verb) return 1;
        const slowHintCount = getCardReviewMeta(card)?.slowHintCount || 0;
        const dwellConfig = reviewModelConfig.dwellHint;
        const boost = Math.min(dwellConfig.maxBoost, slowHintCount * dwellConfig.boostPerHint);
        return 1 + boost;
    };

    const scoreCardForReviewModel = (card, baseScore) => {
        if (!reviewModelConfig.enabled || !card || !card.verb) {
            return Math.max(reviewModelConfig.selection.minimumWeight, baseScore || 0);
        }
        const adjusted = (baseScore || 0)
            * getStaticDifficultyMultiplier(card)
            * getFamiliarityMultiplier(card)
            * getRecencyMultiplier(card)
            * getDetailsHintMultiplier(card)
            * getDwellHintMultiplier(card);
        return Math.max(reviewModelConfig.selection.minimumWeight, adjusted);
    };

    const buildWeightedCandidatePool = (weightedItems, options = {}) => {
        const { allowRecentCardBlocking = false } = options;
        if (!Array.isArray(weightedItems) || weightedItems.length === 0) return [];

        let pool = weightedItems;
        if (allowRecentCardBlocking) {
            const filtered = weightedItems.filter((item) => !isCardHardBlockedByRecency(item.card));
            if (filtered.length > 0) {
                pool = filtered;
            }
        }

        const candidatePoolSize = reviewModelConfig.selection.candidatePoolSize || 0;
        if (candidatePoolSize > 0 && pool.length > candidatePoolSize) {
            pool = [...pool]
                .sort((a, b) => (b.score || 0) - (a.score || 0))
                .slice(0, candidatePoolSize);
        }

        return pool;
    };

    const applyReviewModelToWeightedDeck = (weightedDeck) => (
        weightedDeck.map((item) => ({
            ...item,
            score: scoreCardForReviewModel(item.card, item.score || 0),
        }))
    );

    let reviewModelState = loadReviewModelState();
    let currentCardShownAtMs = 0;

    // --- Local Storage for Options ---
    // Use generic localStorageKey for options
    const saveOptions = (options = {}) => {
        try {
            localStorage.setItem(localStorageKey, JSON.stringify(cardGenerationOptions));
            setScopedStorageItem('correct-dictation-next-question', cardGenerationOptions.useMicToAnswer ? 'true' : 'false');
            if (!options.preserveActiveDrill) {
                updateCustomPresetFromUI();
            }
            
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
                if (typeof savedOptions.useMicToAnswer === 'boolean') {
                    cardGenerationOptions.useMicToAnswer = savedOptions.useMicToAnswer;
                } else {
                    cardGenerationOptions.useMicToAnswer = getScopedStorageItem('correct-dictation-next-question') === 'true';
                }
                if (typeof savedOptions.showUsageNugget === 'boolean') {
                    cardGenerationOptions.showUsageNugget = savedOptions.showUsageNugget;
                }
                if (savedOptions.cardTypeMode) {
                    cardGenerationOptions.cardTypeMode = normalizeCardTypeMode(savedOptions.cardTypeMode);
                }
                if (savedOptions.reflexiveMode) {
                    cardGenerationOptions.reflexiveMode = savedOptions.reflexiveMode;
                } else if (typeof savedOptions.includeReflexive === 'boolean') {
                    // migrate old boolean
                    cardGenerationOptions.reflexiveMode = savedOptions.includeReflexive ? 'include' : 'exclude';
                }
                if (savedOptions.prepositionalVerbMode === 'only') {
                    cardGenerationOptions.prepositionalVerbMode = 'only';
                } else {
                    cardGenerationOptions.prepositionalVerbMode = 'all';
                }

                // Update weights by merging into the existing objects
                if (savedOptions.tenseWeights) { Object.assign(tenseWeights, savedOptions.tenseWeights); }
                if (savedOptions.frequencyWeights) {
                    Object.assign(frequencyWeights, normalizeFrequencyWeightsConfig(savedOptions.frequencyWeights));
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
                if (Array.isArray(savedOptions.selectedVerbSetIds)) {
                    cardGenerationOptions.selectedVerbSetIds = savedOptions.selectedVerbSetIds.map((id) => String(id)).filter(Boolean);
                } else if (savedOptions.selectedVerbSetId) {
                    cardGenerationOptions.selectedVerbSetIds = [String(savedOptions.selectedVerbSetId)];
                } else {
                    cardGenerationOptions.selectedVerbSetIds = [];
                }
                cardGenerationOptions.sharedVerbSet = normalizeEmbeddedVerbSet(savedOptions.sharedVerbSet);
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
    const activeVerbSet = getResolvedVerbSetSelection(cardGenerationOptions);
    const candidateVerbs = getResolvedVerbUniverse(cardGenerationOptions);
            const {
                frequencyWeights = {},
                regularityFilter = { regular: true, irregular: true },
                endingFilter = { er: true, ir: true, re: true, other: true },
                categoryFilter = 'all',
                prepositionalVerbMode = 'all',
                verbsWithSentencesOnly = false,
                tenseWeights = {}
            } = cardGenerationOptions || {};

            const activeFrequencies = new Set(
                Object.entries(frequencyWeights)
                    .filter(([, w]) => (w || 0) > 0)
                    .map(([f]) => f)
            );
            if (!activeVerbSet && activeFrequencies.size === 0) return 0;

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
                if (prepositionalVerbMode === 'only' && !verbsWithPrepositionalFrames.has(verbInfo.infinitive)) return false;
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
            for (const v of candidateVerbs) {
                if (!activeVerbSet && cardGenerationOptions.reflexiveMode !== 'only') {
                    const freq = v.frequency || 'common';
                    if (!activeFrequencies.has(freq)) continue;
                }
                if (!activeVerbSet && !passesFilters(v)) continue;
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
        const activeVerbSet = getResolvedVerbSetSelection();
        const categoryCount = activeVerbSet?.selectionCount || (activeVerbSet ? 1 : 0);
        el.textContent = activeVerbSet
            ? `In play: ${n} verbs from ${categoryCount} ${categoryCount === 1 ? 'category' : 'categories'}`
            : `In play: ${n} verbs`;
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
        const configuredRate = typeof window.getConfiguredTtsRate === 'function' ? window.getConfiguredTtsRate() : 1;
        
        // Cancel current speech only if different text
        if (synth.speaking) {
            synth.cancel();
            // Small delay to ensure cancellation completes
            setTimeout(() => {
                // Use user-selected voice if set
                const voiceName = getScopedStorageItem('ttsVoiceName');
                if (voiceName) {
                    const voices = synth.getVoices();
                    const matches = voices.filter(v => v.name === voiceName && v.lang && v.lang.startsWith('fr-FR') && !v.name.toLowerCase().includes('english'));
                    if (matches.length > 0) utterance.voice = matches[0];
                }
                utterance.rate = configuredRate;
                synth.speak(utterance);
            }, 100);
        } else {
            // Use user-selected voice if set
            const voiceName = getScopedStorageItem('ttsVoiceName');
            if (voiceName) {
                const voices = synth.getVoices();
                const matches = voices.filter(v => v.name === voiceName && v.lang && v.lang.startsWith('fr-FR') && !v.name.toLowerCase().includes('english'));
                if (matches.length > 0) utterance.voice = matches[0];
            }
            utterance.rate = configuredRate;
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

    const cardKey = (card) => card?.isFrameCard
        ? `frame|${card.frameId || `${card.verb?.infinitive}|${card.pronoun}`}`
        : `${card.verb?.infinitive}|${card.tense}|${card.pronoun}`;

    const performWeightedSelection = (weightedItems, options = {}) => {
        if (!weightedItems || weightedItems.length === 0) return null;

        const pool = buildWeightedCandidatePool(weightedItems, options);

        const totalWeight = pool.reduce((sum, item) => sum + (item.score || 0), 0);
        if (totalWeight <= 0) {
            return pool[Math.floor(Math.random() * pool.length)].card;
        }

        const randomnessExponent = reviewModelConfig.selection.randomnessExponent || 1;
        const weightedPool = randomnessExponent === 1
            ? pool
            : pool.map((item) => ({
                ...item,
                score: Math.pow(Math.max(reviewModelConfig.selection.minimumWeight, item.score || 0), randomnessExponent),
            }));

        const adjustedTotalWeight = weightedPool.reduce((sum, item) => sum + (item.score || 0), 0);
        let random = Math.random() * adjustedTotalWeight;
        for (const item of weightedPool) {
            random -= (item.score || 0);
            if (random <= 0) return item.card;
        }
        return weightedPool[weightedPool.length - 1].card;
    };

    const generateNewCard = (options = {}) => {
        const activeVerbSet = getResolvedVerbSetSelection(options);
        const baseVerbUniverse = getResolvedVerbUniverse(options);
        const {
            hierarchical = false,
            tenseWeights = {},
            frequencyWeights = {},
            verbsWithSentencesOnly = false,
            regularityFilter = { regular: true, irregular: true },
            endingFilter = { er: true, ir: true, re: true, other: true },
            categoryFilter = 'all',
            cardTypeMode = 'conjugation',
            reflexiveMode = 'include',
            prepositionalVerbMode = 'all',
        } = options;
        const resolvedCardTypeMode = normalizeCardTypeMode(cardTypeMode);
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
            if (reflexiveMode === 'only' && !verbInfo.reflexive) return false;
            if (reflexiveMode === 'exclude' && verbInfo.reflexive) return false;
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
            if (prepositionalVerbMode === 'only' && !verbsWithPrepositionalFrames.has(verbInfo.infinitive)) return false;
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

        const buildFrameDeck = () => {
            const candidateVerbIds = new Set(
                baseVerbUniverse
                    .filter((verbInfo) => activeVerbSet || passesFilters(verbInfo))
                    .map((verbInfo) => verbInfo.infinitive)
            );

            return playableVerbFrames
                .filter((entry) => candidateVerbIds.has(entry.verb))
                .map((entry) => {
                    const verbInfo = uniqueVerbByInfinitive.get(entry.verb);
                    if (!verbInfo) return null;
                    const score = activeVerbSet || reflexiveMode === 'only'
                        ? 1
                        : (frequencyWeights[verbInfo.frequency || 'common'] || 0);
                    if (score <= 0) return null;
                    const card = buildFramePracticeCard(entry);
                    if (!card) return null;
                    return { card, score };
                })
                .filter(Boolean);
        };

        let newCard = null;
        let conjugationCard = null;
        let frameCard = null;

        if (resolvedCardTypeMode !== 'frame' && hierarchical) {
            // ...existing code...
            // In reflexive-only mode or an active verb set, bypass frequency selection.
            let verbsInFrequency;
            if (activeVerbSet) {
                verbsInFrequency = [...baseVerbUniverse];
            } else if (reflexiveMode === 'only') {
                verbsInFrequency = baseVerbUniverse.filter(passesFilters);
            } else {
                const weightedFrequencies = Object.entries(frequencyWeights)
                    .map(([freq, score]) => ({ card: freq, score: score }))
                    .filter(item => item.score > 0);
                if (weightedFrequencies.length === 0) {
                    verbsInFrequency = [];
                } else {
                    const selectedFrequency = performWeightedSelection(weightedFrequencies);
                    verbsInFrequency = selectedFrequency
                        ? baseVerbUniverse.filter(v => (v.frequency || 'common') === selectedFrequency)
                        : [];
                }
            }
            // Exclude verbs with no real English translation
            verbsInFrequency = verbsInFrequency.filter(v => cleanTranslation(v.infinitive, v.translation || ''));
            if (!activeVerbSet) {
                verbsInFrequency = verbsInFrequency.filter(passesFilters);
            }
            if (sentenceFilterEnabled) {
                verbsInFrequency = verbsInFrequency.filter(v => verbHasSentences(v.infinitive));
            }
            if (verbsInFrequency.length > 0) {
                const weightedDeck = [];
                for (const tenseName in tenses) {
                    const tenseWeight = tenseWeights[tenseName] || 0;
                    if (tenseWeight === 0) continue;

                    for (const verbInfo of verbsInFrequency) {
                        const tenseData = tenses[tenseName];
                        const conjugations = tenseData && tenseData[verbInfo.infinitive];
                        if (conjugations) {
                            const pronounEntries = buildFlashcardPronounEntries(verbInfo.infinitive, conjugations, {
                                balancedPronouns: cardGenerationOptions.balancedPronouns,
                            });
                            for (const pronounEntry of pronounEntries) {
                                weightedDeck.push({
                                    card: {
                                        verb: verbInfo,
                                        tense: tenseName,
                                        pronoun: pronounEntry.pronoun,
                                        pronounKey: pronounEntry.pronounKey,
                                        conjugated: pronounEntry.conjugated,
                                    },
                                    score: tenseWeight
                                });
                            }
                        }
                    }
                }
                conjugationCard = performWeightedSelection(applyReviewModelToWeightedDeck(weightedDeck), { allowRecentCardBlocking: true });
            }

        } else if (resolvedCardTypeMode !== 'frame') {
            // ...existing code...
            const weightedDeck = [];
            for (const tenseName in tenses) {
                const tenseWeight = tenseWeights[tenseName] || 0;
                if (tenseWeight === 0) continue;

                for (const verbInfo of baseVerbUniverse) {
                    if (!activeVerbSet && !passesFilters(verbInfo)) continue;
                    if (sentenceFilterEnabled && !verbHasSentences(verbInfo.infinitive)) {
                        continue;
                    }
                    // In reflexive-only mode or with an active verb set, use the exact pool equally.
                    const freqWeight = activeVerbSet || reflexiveMode === 'only'
                        ? 1
                        : (frequencyWeights[verbInfo.frequency || 'common'] || 0);
                    const score = tenseWeight * freqWeight;
                    if (score === 0) continue;

                    const tenseData = tenses[tenseName];
                    const conjugations = tenseData && tenseData[verbInfo.infinitive];
                    if (conjugations) {
                        const pronounEntries = buildFlashcardPronounEntries(verbInfo.infinitive, conjugations, {
                            balancedPronouns: cardGenerationOptions.balancedPronouns,
                        });
                        for (const pronounEntry of pronounEntries) {
                            weightedDeck.push({
                                card: {
                                    verb: verbInfo,
                                    tense: tenseName,
                                    pronoun: pronounEntry.pronoun,
                                    pronounKey: pronounEntry.pronounKey,
                                    conjugated: pronounEntry.conjugated,
                                },
                                score: score
                            });
                        }
                    }
                }
            }
            conjugationCard = performWeightedSelection(applyReviewModelToWeightedDeck(weightedDeck), { allowRecentCardBlocking: true });
        }

        if (resolvedCardTypeMode !== 'conjugation') {
            frameCard = performWeightedSelection(applyReviewModelToWeightedDeck(buildFrameDeck()), { allowRecentCardBlocking: true });
        }

        if (resolvedCardTypeMode === 'both') {
            const familyDeck = [];
            if (conjugationCard) familyDeck.push({ card: 'conjugation', score: 1 });
            if (frameCard) familyDeck.push({ card: 'frame', score: 1 });
            const selectedFamily = performWeightedSelection(familyDeck, { allowRecentCardBlocking: false });
            if (selectedFamily === 'frame') {
                newCard = frameCard;
            } else if (selectedFamily === 'conjugation') {
                newCard = conjugationCard;
            }
        } else if (resolvedCardTypeMode === 'frame') {
            newCard = frameCard;
        } else {
            newCard = conjugationCard;
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
        if (card?.isFrameCard) {
            window.location.hash = '';
        } else if (card.verb) {
            const params = new URLSearchParams();
            params.set('pronoun', card.pronoun);
            params.set('verb', card.verb.infinitive);
            params.set('tense', card.tense);
            window.location.hash = params.toString();
        } else {
            window.location.hash = '';
        }
    };

    let hasLoggedFirstCardDisplay = false;
    const displayCard = (card) => {
        currentCard = card;
        currentCardShownAtMs = performance.now();
        if (!hasLoggedFirstCardDisplay) {
            hasLoggedFirstCardDisplay = true;
            const cardSummary = card && card.verb
                ? `verb=${card.verb.infinitive} tense=${card.tense} pronoun=${card.pronoun}`
                : (card && card.phrase ? 'phrase-mode' : 'unknown-card');
            startupMark('first-card-displayed', cardSummary);
        }
        recordCardSeen(card);
        installState.cardsSeenThisSession += 1;
        // Track recent cards to avoid immediate repeats
        if (card.verb) {
            recentCardKeys.push(cardKey(card));
            if (recentCardKeys.length > 200) recentCardKeys.shift();
        }
        updateHashParams(card);
        // --- PHRASE MODE ---
        const isPhraseMode = card.isPhraseMode || (!card.verb && card.phrase);
        const answerContainerConjugatedLine = document.querySelector("#answer-contsainer .conjugated-line");
        if (answerContainer) {
            answerContainer.classList.remove('frame-card-inline', 'frame-card-revealed', 'frame-card-transitioning');
        }
        if (conjugatedVerbEl) {
            conjugatedVerbEl.classList.remove('frame-card-inline-text');
            conjugatedVerbEl.title = 'Tap to hear';
            conjugatedVerbEl.setAttribute('aria-label', 'Hear conjugation');
        }
        
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
            refreshDictationButton();
            renderTutorialHint();
            syncAppInstallUi();
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

        if (card.isFrameCard) {
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
            if (englishVerbPhraseEl) englishVerbPhraseEl.textContent = '';

            const normalizedVerbFrequency = normalizeFrequencyKey(verbFrequency) || String(verbFrequency || '').trim();
            const frequencyText = formatFrequencyLabel(normalizedVerbFrequency);
            verbFrequencyEl.textContent = frequencyText;
            verbFrequencyEl.className = 'meta-info frequency-tag';
            verbFrequencyEl.classList.add((normalizedVerbFrequency || 'common').replace(/\s+/g, '-'));

            if (verbCategoryEl) {
                const category = (card.verb && card.verb.category) ? card.verb.category : classifyFrenchVerb(card.verb.infinitive);
                verbCategoryEl.textContent = category;
                verbCategoryEl.className = 'meta-info category-tag';
            }
            if (IRREGULAR_VERBS.has(card.verb.infinitive)) {
                verbIrregularEl.style.display = 'block';
            } else {
                verbIrregularEl.style.display = 'none';
            }

            verbPronounEl.textContent = '';
            verbPronounEl.style.display = 'none';
            verbTenseEl.textContent = 'présent';
            verbTenseEl.className = 'meta-info';

            updateFrameCardInlineState(card, false);

            questionPhraseEl.innerHTML = '';
            questionPhraseEl.removeAttribute('aria-label');
            questionPhraseEl.classList.remove('tappable-audio', 'flashcard-task-prompt', 'idle-nudge-active', 'frame-card-question');
            questionPhraseEl.style.display = 'none';
            questionPhraseEl.style.top = '';

            verbPhraseEl.innerHTML = '';
            verbPhraseEl.classList.remove('tappable-audio');
            verbPhraseEl.dataset.audioId = '';
            verbPhraseEl.dataset.speak = '';
            verbPhraseEl.style.display = 'none';
            currentCard.chosenPhrase = null;

            const nuggetEl = document.getElementById('usage-nugget');
            if (nuggetEl) {
                nuggetEl.style.display = 'none';
                currentCard._hasUsages = renderVerbUsagePanel(nuggetEl, card.verb.infinitive) > 0;
            }
            syncUsageNuggetVisibility();
            refreshContextAudioButton();
            refreshAnswerFlowButton();
            refreshDictationButton();
            renderTutorialHint();

            const autosayOn = getScopedStorageItem('autosay-enabled') === 'true';
            if (autosayOn) {
                const prompt = getFrenchPrompt(card);
                speak(prompt);
            }
            void ensureAutomaticPackagedTtsDownload();
            syncAppInstallUi();
            return;
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
        let pronounDisplay = isFrenchIlOnlyVerb(card.verb.infinitive)
            ? FRENCH_IL_ONLY_DETAIL_PRONOUN
            : card.pronoun;
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
        const normalizedVerbFrequency = normalizeFrequencyKey(verbFrequency) || String(verbFrequency || '').trim();
        const frequencyText = formatFrequencyLabel(normalizedVerbFrequency);
        verbFrequencyEl.textContent = frequencyText;
        verbFrequencyEl.className = 'meta-info frequency-tag';
        verbFrequencyEl.classList.add((normalizedVerbFrequency || 'common').replace(/\s+/g, '-'));
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
        let answerText = getCardAnswerText(card);
        conjugatedVerbEl.textContent = answerText;
        conjugatedVerbEl.classList.add('tappable-audio');
        conjugatedVerbEl.dataset.audioId = conjugationAudioId(card.verb.infinitive, card.tense, card.pronounKey || card.pronoun);
        conjugatedVerbEl.dataset.speak = card.conjugated;
        verbPhraseEl.innerHTML = '';
        questionPhraseEl.innerHTML = '';
        verbPhraseEl.classList.remove('tappable-audio');
        questionPhraseEl.classList.remove('tappable-audio', 'frame-card-question');
        questionPhraseEl.style.display = 'none';
        currentCard.chosenPhrase = null;

        // ── Usage nugget — core patterns first, then usages/examples ─────────────
        const nuggetEl = document.getElementById('usage-nugget');
        if (nuggetEl) {
            nuggetEl.style.display = 'none';
            currentCard._hasUsages = renderVerbUsagePanel(nuggetEl, card.verb.infinitive) > 0;
        }
        syncUsageNuggetVisibility();
        refreshContextAudioButton();
        refreshAnswerFlowButton();
        refreshDictationButton();
        renderTutorialHint();

        // --- AUTOTALK: Speak prompt if enabled ---
        const autosayOn = getScopedStorageItem('autosay-enabled') === 'true';
        if (autosayOn) {
            const prompt = getFrenchPrompt(card);
            speak(prompt);
        }
        void ensureAutomaticPackagedTtsDownload();
        void maybePrefetchCurrentCardPackagedAudio(card);
        syncAppInstallUi();
    }
    

    const showAnswer = () => {
        if (!isAnswerVisible) {
            stopActiveDictation({ abort: true, silent: true });
            if (currentCard && currentCard.verb) {
                recordSlowRevealHintIfNeeded(currentCard, performance.now() - currentCardShownAtMs);
            }
            dismissReopenMessage();
            answerContainer.classList.add('is-visible');
            isAnswerVisible = true;
            if (window.incrementDailyCount) window.incrementDailyCount();
            if (currentCard?.isFrameCard) {
                updateFrameCardInlineState(currentCard, true);
            }
            // In phrase mode, show the French sentence now
            if (currentCard && !currentCard.verb) {
                const phraseSpan = document.getElementById('phrase-french-sentence');
                if (phraseSpan) phraseSpan.style.display = '';
            }
            // Show usage nugget when answer reveals
            syncUsageNuggetVisibility();
            refreshContextAudioButton();
            refreshAnswerFlowButton();
            refreshDictationButton();
            renderTutorialHint();
            // Do NOT speak the answer automatically
        }
    };

    const hideAnswer = (options = {}) => {
        const { suppressFramePrompt = false } = options;
        if (answerContainer) {
            answerContainer.classList.toggle('frame-card-transitioning', !!(suppressFramePrompt && currentCard?.isFrameCard));
        }
        answerContainer.classList.remove('is-visible');
        // Show question phrase again if it was visible before (now they are siblings)
        if (ENABLE_GAP_SENTENCES && currentCard && currentCard.chosenPhrase && currentCard.chosenPhrase.gap_sentence) {
            questionPhraseEl.style.display = 'block';
        }
        isAnswerVisible = false;
        if (currentCard?.isFrameCard) {
            updateFrameCardInlineState(currentCard, false);
        }
        syncUsageNuggetVisibility();
        refreshContextAudioButton();
        refreshAnswerFlowButton();
        refreshDictationButton();
        renderTutorialHint();
    };

    // --- Card advance logic ---
    let autoskipLock = false;
    const maybeRestartPressToDictateOnNewCard = () => {
        if (!pendingPressToDictateRestart) return;
        pendingPressToDictateRestart = false;
        if (!pressToDictateEnabled) return;
        if (activeDictationPointerId === null) return;
        if (isAnswerVisible || !currentCard) return;
        if (typeof beginDictationSessionRef !== 'function') return;
        window.setTimeout(() => {
            if (!pressToDictateEnabled) return;
            if (activeDictationPointerId === null) return;
            if (isDictating || recognition) return;
            if (isAnswerVisible || !currentCard) return;
            beginDictationSessionRef();
        }, 0);
    };

    const nextCard = () => {
        autoskipLock = false;
        stopActiveDictation({ abort: true, silent: true });
        if (isTutorialDeferredForSharedEntry()) {
            sharedEntryTutorialPending = false;
            if (showTutorialIntroCard()) {
                refreshTutorialAwareUi();
                return;
            }
        }
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
                const activeVerbSet = getResolvedVerbSetSelection(cardGenerationOptions);
                if (verbInfinitiveEl) {
                    verbInfinitiveEl.textContent = activeVerbSet
                        ? `No verbs match "${activeVerbSet.name}"`
                        : 'No verbs match current filters';
                }
                if (verbTranslationEl) {
                    verbTranslationEl.textContent = activeVerbSet
                        ? 'Try different tenses or switch verb sets'
                        : 'Adjust settings to continue';
                    verbTranslationEl.style.display = 'block';
                }
                console.warn('generateNewCard returned null — check frequency weights and filters');
            }
        }
        // Do NOT start dictation automatically
        refreshTutorialAwareUi();
        maybeRestartPressToDictateOnNewCard();
    };

    const handleNext = () => {
        if (isAnswerVisible) {
            if (tutorialState.active && !isTutorialDeferredForSharedEntry()) {
                completeTutorialIfNeeded();
            }
            if (currentCard?.isFrameCard) {
                answerContainer.classList.remove('is-visible', 'frame-card-revealed', 'frame-card-transitioning');
                isAnswerVisible = false;
                nextCard();
                return;
            }
            hideAnswer({ suppressFramePrompt: true });
            setTimeout(() => {
                nextCard();
            }, 300);
        } else {
            nextCard();
        }
    };

    const handlePrev = () => {
        if (isAnswerVisible) {
            if (currentCard?.isFrameCard) {
                answerContainer.classList.remove('is-visible', 'frame-card-revealed', 'frame-card-transitioning');
                isAnswerVisible = false;
                prevCard();
                return;
            }
            hideAnswer({ suppressFramePrompt: true });
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

    let hasLoggedFirstViewShown = false;
    function showView(viewId, pushState = true) {
        if (!hasLoggedFirstViewShown) {
            hasLoggedFirstViewShown = true;
            startupMark('first-view-shown', `view=${viewId}`);
        }
        if (viewId !== 'flashcard-view') {
            stopActiveDictation({ abort: true, silent: true });
            clearIdleGuidanceState();
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
                window.history.pushState({ view: viewId }, '', buildUrlForView(viewId));
            }
        }

        if (viewId === 'flashcard-view') {
            renderTutorialHint();
            refreshContextAudioButton();
            refreshAnswerFlowButton();
            refreshDictationButton();
            syncUsageNuggetVisibility();
        }
        syncAppInstallUi();
    }

    const showExplorerList = () => {
        showView('explorer-list-view');
        populateExplorerList(searchBar.value);
    };

    const openSearchFromFlashcard = () => {
        showView('explorer-list-view');
        searchBar.value = '';
        populateExplorerList('');
        focusSearchBarForEntry({ clear: true });
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
    if (appUpdatePill) {
        appUpdatePill.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            openSettingsForUpdate();
        });
    }
    if (appInstallPill) {
        appInstallPill.addEventListener('click', async (e) => {
            e.stopPropagation();
            e.preventDefault();
            await triggerInstallFlow();
        });
    }

    const showMnemonics = () => {
        showView('mnemonics-view');
    };

    const normalizeDetailRouteTense = (tense) => (tense && tenses[tense]) ? tense : null;

    const normalizeDetailRoutePronoun = (pronoun) => {
        const normalized = String(pronoun || '').trim();
        return normalized || null;
    };

    const hydrateDetailRouteCard = ({ verbInfinitive, tenseToFocus, pronoun }) => {
        const normalizedPronoun = normalizeDetailRoutePronoun(pronoun);
        const normalizedTense = normalizeDetailRouteTense(tenseToFocus);
        if (!verbInfinitive || !normalizedPronoun || !normalizedTense) {
            return null;
        }
        return generateCardFromParams(normalizedPronoun, verbInfinitive, normalizedTense);
    };

    const resolveVerbDetailRouteState = (route = {}) => {
        const verbInfinitive = String(route.verbInfinitive || route.verb || '').trim();
        if (!verbInfinitive) return null;
        const tenseToFocus = normalizeDetailRouteTense(route.tenseToFocus || route.tense || route.card?.tense);
        const pronoun = normalizeDetailRoutePronoun(route.pronoun || route.card?.pronoun);
        let card = route.card || null;
        if (card && (!card.verb || card.verb.infinitive !== verbInfinitive || (tenseToFocus && card.tense !== tenseToFocus))) {
            card = null;
        }
        if (!card) {
            card = hydrateDetailRouteCard({ verbInfinitive, tenseToFocus, pronoun });
        }
        return {
            verbInfinitive,
            tenseToFocus,
            pronoun: card ? (normalizeDetailRoutePronoun(card.pronoun) || pronoun) : pronoun,
            card,
        };
    };

    const buildVerbDetailHistoryState = (routeState) => ({
        view: 'explorer-detail-view',
        verbInfinitive: routeState.verbInfinitive,
        tenseToFocus: routeState.tenseToFocus,
        pronoun: routeState.card ? routeState.card.pronoun : routeState.pronoun,
    });

    const seedFlashcardHistoryWithCard = (card, options = {}) => {
        if (!card) return false;
        sharedEntryTutorialPending = !!options.deferTutorial;
        if (options.deferTutorial) {
            card._sharedDetailEntryCard = true;
        } else {
            delete card._sharedDetailEntryCard;
        }
        history = [card];
        historyIndex = 0;
        displayCard(card);
        backBtn.disabled = true;
        return true;
    };

    const buildVerbDetailShareUrl = (route = currentDetailRouteState) => {
        const routeState = resolveVerbDetailRouteState(route || {});
        if (!routeState) return '';
        const url = new URL(window.location.href);
        url.hash = '';
        url.search = '';
        url.searchParams.set(DETAIL_ROUTE_VERB_PARAM, routeState.verbInfinitive);
        if (routeState.tenseToFocus) {
            url.searchParams.set(DETAIL_ROUTE_TENSE_PARAM, routeState.tenseToFocus);
        }
        if (routeState.card && routeState.card.pronoun) {
            url.searchParams.set(DETAIL_ROUTE_PRONOUN_PARAM, routeState.card.pronoun);
        }
        return url.toString();
    };

    const buildVerbDetailSharePayload = (route = currentDetailRouteState) => {
        const routeState = resolveVerbDetailRouteState(route || {});
        if (!routeState) return null;
        const tenseLabel = routeState.tenseToFocus
            ? (tenseKeyToLabel[routeState.tenseToFocus] || routeState.tenseToFocus)
            : '';
        const pronoun = routeState.card?.pronoun || null;
        const text = pronoun && tenseLabel
            ? `Open ${routeState.verbInfinitive} in ${tenseLabel} for ${pronoun}.`
            : tenseLabel
                ? `Open ${routeState.verbInfinitive} in ${tenseLabel}.`
                : `Open ${routeState.verbInfinitive} in Les Verbes.`;
        return {
            routeState,
            title: `Les Verbes · ${routeState.verbInfinitive}`,
            text,
            url: buildVerbDetailShareUrl(routeState),
        };
    };

    const shareCurrentVerbDetail = async () => {
        const payload = buildVerbDetailSharePayload();
        if (!payload || !payload.url) return;

        const shareData = {
            title: payload.title,
            text: payload.text,
            url: payload.url,
        };

        if (typeof navigator.share === 'function') {
            try {
                await navigator.share(shareData);
                return;
            } catch (error) {
                if (error && error.name === 'AbortError') {
                    return;
                }
                console.warn('Native share failed, falling back to clipboard:', error);
            }
        }

        const copied = await copyTextToClipboard(payload.url, { successMessage: 'Link copied' });
        if (!copied) {
            showTransientFeedback('Could not copy link');
        }
    };

    const copyCurrentVerbDetailLink = async () => {
        const payload = buildVerbDetailSharePayload();
        if (!payload || !payload.url) return;
        const copied = await copyTextToClipboard(payload.url, { successMessage: 'Link copied' });
        if (!copied) {
            showTransientFeedback('Could not copy link');
        }
    };

    const canNativeShareVerbDetail = () => typeof navigator.share === 'function';

    const setVerbDetailShareMenuOpen = (shareShell, isOpen) => {
        if (!(shareShell instanceof HTMLElement)) return;
        shareShell.classList.toggle('is-open', isOpen);
        const toggleButton = shareShell.querySelector('.verb-detail-share-toggle-btn');
        if (toggleButton instanceof HTMLElement) {
            toggleButton.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        }
    };

    const closeAllVerbDetailShareMenus = () => {
        document.querySelectorAll('.verb-detail-share-shell.is-open').forEach((shareShell) => {
            setVerbDetailShareMenuOpen(shareShell, false);
        });
    };

    const toggleVerbDetailShareMenu = (shareShell) => {
        if (!(shareShell instanceof HTMLElement)) return;
        const shouldOpen = !shareShell.classList.contains('is-open');
        closeAllVerbDetailShareMenus();
        if (shouldOpen) {
            setVerbDetailShareMenuOpen(shareShell, true);
        }
    };

    const showVerbDetail = (verbInfinitive, tenseToFocus = null, options = {}) => {
        const routeState = resolveVerbDetailRouteState({
            verbInfinitive,
            tenseToFocus,
            card: options.card || null,
        });
        if (!routeState) return;
        const verb = uniqueVerbs.find(v => v.infinitive === routeState.verbInfinitive);
        if (!verb) return;
        recordVerbDetailOpen(routeState.verbInfinitive);
        currentDetailVerb = verb;
        currentDetailRouteState = routeState;
        showView('explorer-detail-view', false);
        window.history.pushState(
            buildVerbDetailHistoryState(routeState),
            '',
            buildVerbDetailUrl(routeState)
        );
        populateVerbDetail(verb, routeState.tenseToFocus);
    };

    const highlightAndScrollToTense = (tenseToFocus) => {
        if (!tenseToFocus) return;

        const targetBlock = document.getElementById(`detail-tense-${tenseToFocus}`);
        if (targetBlock) {
            // The focused tense is rendered highlighted from the start, so this pass only
            // corrects visibility once layout has settled instead of causing a second-phase repaint.
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    const containerRect = verbDetailContainer ? verbDetailContainer.getBoundingClientRect() : null;
                    const targetRect = targetBlock.getBoundingClientRect();
                    const isAlreadyVisible = containerRect
                        ? targetRect.top >= containerRect.top + 12 && targetRect.bottom <= containerRect.bottom - 12
                        : true;
                    if (!isAlreadyVisible) {
                        targetBlock.scrollIntoView({ behavior: 'auto', block: 'center' });
                    }
                    window.setTimeout(() => targetBlock.classList.remove('detail-focus-highlight'), 1500);
                });
            });
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
        verbDetailContainer.scrollTop = 0;
        closeAllVerbDetailShareMenus();

        const header = document.createElement('div');
        header.className = 'verb-detail-header';
        const shareShell = document.createElement('div');
        shareShell.className = 'verb-detail-share-shell';

        const shareButton = document.createElement('button');
        shareButton.type = 'button';
        shareButton.className = 'verb-detail-share-toggle-btn';
        shareButton.setAttribute('aria-label', 'Open share options');
        shareButton.setAttribute('aria-haspopup', 'menu');
        shareButton.setAttribute('aria-expanded', 'false');
        shareButton.title = 'Share options';
        shareButton.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <circle cx="18" cy="5" r="3"></circle>
                <circle cx="6" cy="12" r="3"></circle>
                <circle cx="18" cy="19" r="3"></circle>
                <path d="M8.7 10.7l6.6-3.4"></path>
                <path d="M8.7 13.3l6.6 3.4"></path>
            </svg>
            <span>Share</span>
        `;
        shareButton.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            toggleVerbDetailShareMenu(shareShell);
        });
        shareShell.appendChild(shareButton);

        const shareBackdrop = document.createElement('button');
        shareBackdrop.type = 'button';
        shareBackdrop.className = 'verb-detail-share-backdrop';
        shareBackdrop.setAttribute('aria-label', 'Close share options');
        shareBackdrop.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            closeAllVerbDetailShareMenus();
        });
        shareShell.appendChild(shareBackdrop);

        const shareMenu = document.createElement('div');
        shareMenu.className = 'verb-detail-share-menu';
        shareMenu.setAttribute('role', 'menu');

        if (canNativeShareVerbDetail()) {
            const nativeShareButton = document.createElement('button');
            nativeShareButton.type = 'button';
            nativeShareButton.className = 'verb-detail-share-menu-btn';
            nativeShareButton.setAttribute('role', 'menuitem');
            nativeShareButton.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <circle cx="18" cy="5" r="3"></circle>
                    <circle cx="6" cy="12" r="3"></circle>
                    <circle cx="18" cy="19" r="3"></circle>
                    <path d="M8.7 10.7l6.6-3.4"></path>
                    <path d="M8.7 13.3l6.6 3.4"></path>
                </svg>
                <span>Share…</span>
            `;
            nativeShareButton.addEventListener('click', async (event) => {
                event.preventDefault();
                event.stopPropagation();
                closeAllVerbDetailShareMenus();
                await shareCurrentVerbDetail();
            });
            shareMenu.appendChild(nativeShareButton);
        }

        const copyButton = document.createElement('button');
        copyButton.type = 'button';
        copyButton.className = 'verb-detail-share-menu-btn';
        copyButton.setAttribute('role', 'menuitem');
        copyButton.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <rect x="9" y="9" width="11" height="11" rx="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            <span>Copy link</span>
        `;
        copyButton.addEventListener('click', async (event) => {
            event.preventDefault();
            event.stopPropagation();
            closeAllVerbDetailShareMenus();
            await copyCurrentVerbDetailLink();
        });
        shareMenu.appendChild(copyButton);
        shareShell.appendChild(shareMenu);
        header.appendChild(shareShell);
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
            if (tenseName === tenseToFocus) {
                tenseBlock.classList.add('detail-focus-highlight');
            }

            const tenseHeader = document.createElement('h4');
            tenseHeader.className = 'tense-header tappable-audio';
            tenseHeader.dataset.speak = tenseKeyToLabel[tenseName] || tenseName;
            tenseHeader.dataset.audioId = tenseAudioId(tenseName);
            tenseHeader.textContent = tenseKeyToLabel[tenseName] || tenseName;
            tenseBlock.appendChild(tenseHeader);

            const grid = document.createElement('div');
            grid.className = 'conjugation-grid';

            const conjugationsForVerb = tenses[tenseName][verb.infinitive];
            const detailRows = buildVerbDetailRows(verb.infinitive, conjugationsForVerb);
            detailRows.forEach((row) => {
                const conjugation = row.conjugated || '—';
                const item = document.createElement('div');
                item.className = 'conjugation-item';
                const pronounSpan = document.createElement('span');
                pronounSpan.className = 'pronoun tappable-audio';
                pronounSpan.dataset.speak = row.pronounAudio;
                pronounSpan.dataset.audioId = pronounAudioId(row.pronounAudio);
                pronounSpan.textContent = row.pronounLabel;
                item.appendChild(pronounSpan);

                const conjugationSpan = document.createElement('span');
                conjugationSpan.className = conjugation === '—' ? 'conjugation' : 'conjugation tappable-audio';
                conjugationSpan.dataset.speak = conjugation === '—' ? '' : conjugation;
                if (conjugation !== '—') {
                    conjugationSpan.dataset.audioId = conjugationAudioId(verb.infinitive, tenseName, row.pronounKey);
                }
                conjugationSpan.textContent = conjugation;
                item.appendChild(conjugationSpan);
                grid.appendChild(item);
            });
            tenseBlock.appendChild(grid);
            verbDetailContainer.appendChild(tenseBlock);
        });

        const usagePanelSection = document.createElement('section');
        const usagePanelCount = renderVerbUsagePanel(usagePanelSection, verb.infinitive, {
            sectionClass: 'verb-usages-detail-section',
            coreHeading: 'Core patterns',
            verbSetUsageHeading: 'Set-specific usages',
            usageHeading: 'Usages & examples',
        });
        if (usagePanelCount > 0) {
            verbDetailContainer.appendChild(usagePanelSection);
        }

        // After populating, scroll to the focused tense if provided
        highlightAndScrollToTense(tenseToFocus);
    };

    const getVerbDetailRouteParams = () => {
        const params = new URLSearchParams(window.location.search);
        const verbInfinitive = params.get(DETAIL_ROUTE_VERB_PARAM);
        if (!verbInfinitive) return null;
        return {
            verbInfinitive,
            tenseToFocus: normalizeDetailRouteTense(params.get(DETAIL_ROUTE_TENSE_PARAM)),
            pronoun: normalizeDetailRoutePronoun(params.get(DETAIL_ROUTE_PRONOUN_PARAM)),
        };
    };

    const buildCurrentUrl = (mutateParams, hashValue = window.location.hash) => {
        const url = new URL(window.location.href);
        url.searchParams.delete('__refresh');
        mutateParams(url.searchParams);
        const search = url.searchParams.toString();
        const normalizedHash = hashValue
            ? (hashValue.startsWith('#') ? hashValue : `#${hashValue}`)
            : '';
        return `${url.pathname}${search ? `?${search}` : ''}${normalizedHash}`;
    };

    const buildUrlForView = (viewId) => buildCurrentUrl((params) => {
        params.delete(DETAIL_ROUTE_VERB_PARAM);
        params.delete(DETAIL_ROUTE_TENSE_PARAM);
        params.delete(DETAIL_ROUTE_PRONOUN_PARAM);
    }, viewId);

    const buildVerbDetailUrl = (routeOrVerb, tenseToFocus = null, card = null) => {
        const routeState = typeof routeOrVerb === 'object'
            ? resolveVerbDetailRouteState(routeOrVerb)
            : resolveVerbDetailRouteState({ verbInfinitive: routeOrVerb, tenseToFocus, card });
        if (!routeState) return buildUrlForView('explorer-detail-view');
        return buildCurrentUrl((params) => {
            params.set(DETAIL_ROUTE_VERB_PARAM, routeState.verbInfinitive);
            if (routeState.tenseToFocus) {
                params.set(DETAIL_ROUTE_TENSE_PARAM, routeState.tenseToFocus);
            } else {
                params.delete(DETAIL_ROUTE_TENSE_PARAM);
            }
            if (routeState.card && routeState.card.pronoun) {
                params.set(DETAIL_ROUTE_PRONOUN_PARAM, routeState.card.pronoun);
            } else {
                params.delete(DETAIL_ROUTE_PRONOUN_PARAM);
            }
        }, '');
    };

    const focusSearchBarForEntry = ({ clear = false } = {}) => {
        if (!searchBar) return;
        if (clear) {
            searchBar.value = '';
        }
        const applyFocus = () => {
            try {
                searchBar.focus({ preventScroll: true });
            } catch (error) {
                searchBar.focus();
            }
            if (typeof searchBar.setSelectionRange === 'function') {
                searchBar.setSelectionRange(searchBar.value.length, searchBar.value.length);
            }
        };
        // First focus is still inside the original click gesture, which helps mobile keyboards.
        applyFocus();
        requestAnimationFrame(() => {
            requestAnimationFrame(applyFocus);
        });
    };

    const openVerbDetailFromRoute = (route, useReplaceState = false) => {
        const routeState = resolveVerbDetailRouteState(route || {});
        if (!routeState) return false;
        const verb = uniqueVerbs.find(v => v.infinitive === routeState.verbInfinitive);
        if (!verb) return false;
        recordVerbDetailOpen(verb.infinitive);
        currentDetailVerb = verb;
        currentDetailRouteState = routeState;
        showView('explorer-detail-view', false);
        populateVerbDetail(verb, routeState.tenseToFocus);
        const method = useReplaceState ? 'replaceState' : 'pushState';
        window.history[method](
            buildVerbDetailHistoryState(routeState),
            '',
            buildVerbDetailUrl(routeState)
        );
        return true;
    };

    // --- Options UI Logic ---
    const populateOptions = () => {
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
                let labelText = formatFrequencyLabel(key, { long: key === 'rare' }) || key.replace(/([A-Z])/g, ' $1');
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

        const createToggleRow = (labelText, helperText, checked, onChange) => {
            const row = document.createElement('div');
            row.className = 'toggle-row';
            const inputId = `toggle-${labelText.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Math.random().toString(36).slice(2, 8)}`;
            row.innerHTML = `
                <div class="settings-row-copy">
                    <label for="${inputId}">${labelText}</label>
                    ${helperText ? `<p class="setting-helper-text">${helperText}</p>` : ''}
                </div>
                <div class="toggle-switch">
                    <input type="checkbox" id="${inputId}" class="toggle-input" ${checked ? 'checked' : ''}>
                    <label for="${inputId}" class="toggle-label"></label>
                </div>
            `;
            row.querySelector('input').addEventListener('change', (event) => onChange(event.target.checked));
            return row;
        };

        const createAdvancedCard = (title) => {
            const card = document.createElement('div');
            card.className = 'advanced-card';
            const heading = document.createElement('div');
            heading.className = 'advanced-card-title';
            heading.textContent = title;
            card.appendChild(heading);
            return card;
        };
        const createSegmentedPillRow = (labelText, helperText, options, activeValue, onSelect) => {
            const row = document.createElement('div');
            row.className = 'toggle-row';
            row.style.marginTop = '0.4rem';

            const pills = options.map(({ value, label }) => (
                `<button class="reflexive-pill${activeValue === value ? ' active' : ''}" data-value="${escapeHtml(value)}">${escapeHtml(label)}</button>`
            )).join('');

            row.innerHTML = `
                <div class="settings-row-copy">
                    <label style="margin:0;">${escapeHtml(labelText)}</label>
                    ${helperText ? `<p class="setting-helper-text">${escapeHtml(helperText)}</p>` : ''}
                </div>
                <div class="reflexive-mode-pills">
                    ${pills}
                </div>`;

            row.querySelectorAll('.reflexive-pill').forEach((btn) => {
                btn.addEventListener('click', () => {
                    const nextValue = btn.dataset.value || '';
                    onSelect(nextValue);
                    row.querySelectorAll('.reflexive-pill').forEach((pill) => pill.classList.toggle('active', pill === btn));
                });
            });
            return row;
        };
        const activeVerbSetSelection = getResolvedVerbSetSelection();
        const activeVerbSetSelections = getResolvedVerbSetSelections();
        const activeVerbSetIds = new Set(activeVerbSetSelections.map((selection) => selection.id).filter(Boolean));
        const verbSetGroup = document.getElementById('verb-set-group');
        if (verbSetGroup instanceof HTMLDetailsElement && activeVerbSetSelection) {
            verbSetGroup.open = true;
        }

        tenseWeightsContainer.innerHTML = '';
        Object.keys(tenses).forEach((tense) => {
            const weight = cardGenerationOptions.tenseWeights[tense] || 0;
            createSlider(tense, weight, tenseWeightsContainer, 'tenseWeights');
        });

        if (verbPoolBasicContainer) {
            verbPoolBasicContainer.innerHTML = '';
            const verbPoolPanel = document.createElement('div');
            verbPoolPanel.className = 'verb-pool-panel';

            const rangeRow = document.createElement('div');
            rangeRow.className = 'verb-pool-range';
            const selectedRange = getSelectedVerbPoolRangeKey();
            getBasicVerbPoolRangeKeys().forEach((freqKey) => {
                if (!(freqKey in cardGenerationOptions.frequencyWeights)) return;
                const pill = document.createElement('button');
                pill.type = 'button';
                pill.className = `verb-pool-pill${selectedRange === freqKey ? ' active' : ''}`;
                pill.textContent = formatFrequencyLabel(freqKey);
                pill.addEventListener('click', () => {
                    setVerbPoolRange(freqKey);
                    saveOptions();
                    populateOptions();
                    updateVerbFiltersCountLabel();
                });
                rangeRow.appendChild(pill);
            });
            verbPoolPanel.appendChild(rangeRow);

            const summary = document.createElement('div');
            summary.className = 'verb-pool-summary';
            summary.textContent = getVerbPoolSummary();
            verbPoolPanel.appendChild(summary);

            verbPoolBasicContainer.appendChild(verbPoolPanel);
        }

        if (verbSetContainer) {
            verbSetContainer.innerHTML = '';
            const panel = document.createElement('div');
            panel.className = 'verb-set-panel';

            const grid = document.createElement('div');
            grid.className = 'verb-set-grid';

            const allCard = document.createElement('button');
            allCard.type = 'button';
            allCard.className = `verb-set-card${activeVerbSetSelection ? '' : ' active'}`;
            allCard.innerHTML = `
                <span class="verb-set-card-title">All verbs</span>
                <span class="verb-set-card-meta">Use the regular Top N pool.</span>
            `;
            allCard.addEventListener('click', () => clearVerbSetSelection());
            grid.appendChild(allCard);

            builtInVerbSets.forEach((set) => {
                const isActive = activeVerbSetIds.has(set.id);
                const card = document.createElement('button');
                card.type = 'button';
                card.className = `verb-set-card${isActive ? ' active' : ''}`;
                card.innerHTML = `
                    <span class="verb-set-card-title">${escapeHtml(set.name)}</span>
                    <span class="verb-set-card-meta">${escapeHtml(set.scope || 'Built-in')} · ${set.verbs.length} verbs</span>
                `;
                card.addEventListener('click', () => toggleVerbSetSelection(set.id));
                grid.appendChild(card);
            });

            savedVerbSets.forEach((set) => {
                const isActive = activeVerbSetIds.has(set.id);
                const card = document.createElement('button');
                card.type = 'button';
                card.className = `verb-set-card${isActive ? ' active' : ''}`;
                card.innerHTML = `
                    <span class="verb-set-card-title">${escapeHtml(set.name)}</span>
                    <span class="verb-set-card-meta">Saved · ${set.verbs.length} verbs</span>
                    <span class="verb-set-card-actions">
                        <span class="verb-set-card-action" data-action="edit">Edit</span>
                        <span class="verb-set-card-action" data-action="delete">Delete</span>
                    </span>
                `;
                card.addEventListener('click', () => toggleVerbSetSelection(set.id));
                card.querySelector('[data-action="edit"]')?.addEventListener('click', (event) => {
                    event.stopPropagation();
                    openVerbSetModal({ mode: 'edit', setId: set.id });
                });
                card.querySelector('[data-action="delete"]')?.addEventListener('click', (event) => {
                    event.stopPropagation();
                    deleteVerbSetById(set.id);
                });
                grid.appendChild(card);
            });

            if (activeVerbSetSelection?.source === 'shared') {
                const sharedCard = document.createElement('button');
                sharedCard.type = 'button';
                sharedCard.className = 'verb-set-card active shared-set-card';
                sharedCard.innerHTML = `
                    <span class="verb-set-card-title">${escapeHtml(activeVerbSetSelection.name)}</span>
                    <span class="verb-set-card-meta">Shared set · ${activeVerbSetSelection.count} verbs</span>
                `;
                grid.appendChild(sharedCard);
            }

            const newSetCard = document.createElement('button');
            newSetCard.type = 'button';
            newSetCard.className = 'verb-set-card new-set-card';
            newSetCard.innerHTML = `
                <span class="verb-set-card-title">New category</span>
                <span class="verb-set-card-meta">Paste a list of infinitives.</span>
            `;
            newSetCard.addEventListener('click', () => openVerbSetModal({ mode: 'create' }));
            grid.appendChild(newSetCard);

            panel.appendChild(grid);

            const summary = document.createElement('div');
            summary.className = 'verb-set-summary';
            const categoryCount = activeVerbSetSelection?.selectionCount || (activeVerbSetSelection ? 1 : 0);
            summary.textContent = activeVerbSetSelection
                ? `Exact pool active: ${categoryCount} ${categoryCount === 1 ? 'category' : 'categories'} with ${activeVerbSetSelection.count} unique verbs. ${activeVerbSetSelection.scope ? `${activeVerbSetSelection.scope}. ` : ''}Tenses still apply.`
                : 'When categories are active, their verbs are merged into one exact pool for drills and sharing.';
            panel.appendChild(summary);

            if (activeVerbSetSelection?.source === 'shared') {
                const actionsRow = document.createElement('div');
                actionsRow.className = 'verb-set-actions-row';
                const saveSharedBtn = document.createElement('button');
                saveSharedBtn.type = 'button';
                saveSharedBtn.className = 'secondary-btn verb-set-secondary-btn';
                saveSharedBtn.textContent = 'Save this verb set';
                saveSharedBtn.addEventListener('click', () => {
                    saveSharedVerbSetToLibrary(activeVerbSetSelection);
                });
                actionsRow.appendChild(saveSharedBtn);
                panel.appendChild(actionsRow);
            }

            verbSetContainer.appendChild(panel);
        }

        if (advancedPracticeContainer) {
            advancedPracticeContainer.innerHTML = '';
            const advancedSections = document.createElement('div');
            advancedSections.className = 'advanced-sections';

            const frequencyBehaviorCard = createAdvancedCard('Frequency behavior');
            if (activeVerbSetSelection) {
                const ignoredHelper = document.createElement('div');
                ignoredHelper.className = 'advanced-action-helper';
                ignoredHelper.textContent = `Verb set "${activeVerbSetSelection.name}" is active, so Top N settings below are currently ignored.`;
                frequencyBehaviorCard.appendChild(ignoredHelper);
            }
            frequencyBehaviorCard.appendChild(createToggleRow(
                'Favor common verbs',
                'When off, included verbs are practiced more evenly across the selected pool.',
                !!cardGenerationOptions.hierarchical,
                (checked) => {
                    cardGenerationOptions.hierarchical = checked;
                    saveOptions();
                    populateOptions();
                }
            ));
            if (hasRareFrequencyBucket()) {
                frequencyBehaviorCard.appendChild(createToggleRow(
                    'Include rare verbs',
                    `Adds verbs ${describeRareFrequencyBucket()} as a separate outlier bucket.`,
                    (cardGenerationOptions.frequencyWeights.rare || 0) > 0,
                    (checked) => {
                        cardGenerationOptions.frequencyWeights.rare = checked ? 1 : 0;
                        saveOptions();
                        populateOptions();
                        updateVerbFiltersCountLabel();
                    }
                ));
            }
            advancedSections.appendChild(frequencyBehaviorCard);

            const freqCard = createAdvancedCard('Detailed frequency');
            const freqHelper = document.createElement('div');
            freqHelper.className = 'advanced-action-helper';
            freqHelper.textContent = 'Fine-tune the exact weights when the simple Verb Pool controls are not enough.';
            const detailedFrequencyContainer = document.createElement('div');
            const freqEntries = Object.entries(cardGenerationOptions.frequencyWeights);
            freqEntries.sort(([a], [b]) => {
                return getFrequencySortIndex(a) - getFrequencySortIndex(b);
            });
            freqEntries.forEach(([freq, weight]) => createSlider(freq, weight, detailedFrequencyContainer, 'frequencyWeights'));
            freqCard.appendChild(detailedFrequencyContainer);
            freqCard.appendChild(freqHelper);
            advancedSections.appendChild(freqCard);

            const practiceCard = createAdvancedCard('Practice filters');
            if (activeVerbSetSelection) {
                const filtersIgnoredHelper = document.createElement('div');
                filtersIgnoredHelper.className = 'advanced-action-helper';
                filtersIgnoredHelper.textContent = `Verb filters are ignored while "${activeVerbSetSelection.name}" is selected.`;
                practiceCard.appendChild(filtersIgnoredHelper);
            }
            practiceCard.appendChild(createToggleRow(
                'Practice all pronouns evenly',
                'Split grouped pronouns so they appear more evenly in the deck.',
                !!cardGenerationOptions.balancedPronouns,
                (checked) => {
                    cardGenerationOptions.balancedPronouns = checked;
                    saveOptions();
                    updateVerbFiltersCountLabel();
                }
            ));

            const cardFamilyRow = createSegmentedPillRow(
                'Card family',
                'Choose conjugation cards, frame cards, or both. Frame cards are present-only for now, and quarantined verbs stay excluded.',
                [
                    { value: 'conjugation', label: 'Conjugation' },
                    { value: 'both', label: 'Both' },
                    { value: 'frame', label: 'Frames' }
                ],
                normalizeCardTypeMode(cardGenerationOptions.cardTypeMode),
                (value) => {
                    cardGenerationOptions.cardTypeMode = normalizeCardTypeMode(value);
                    saveOptions();
                    updateVerbFiltersCountLabel();
                }
            );
            practiceCard.appendChild(cardFamilyRow);

            const reflexiveRow = createSegmentedPillRow(
                'Reflexive verbs',
                'Limit the drill to reflexives, exclude them, or mix both.',
                [
                    { value: 'exclude', label: 'Without' },
                    { value: 'include', label: 'Both' },
                    { value: 'only', label: 'Only' }
                ],
                cardGenerationOptions.reflexiveMode || 'include',
                (value) => {
                    cardGenerationOptions.reflexiveMode = value;
                    saveOptions();
                    updateVerbFiltersCountLabel();
                }
            );
            practiceCard.appendChild(reflexiveRow);

            const prepositionRow = createSegmentedPillRow(
                'Prepositional verbs',
                'Keep all verbs, or only verbs that take a preposition in at least one playable frame.',
                [
                    { value: 'all', label: 'All' },
                    { value: 'only', label: 'Only' }
                ],
                cardGenerationOptions.prepositionalVerbMode || 'all',
                (value) => {
                    cardGenerationOptions.prepositionalVerbMode = value === 'only' ? 'only' : 'all';
                    saveOptions();
                    updateVerbFiltersCountLabel();
                }
            );
            practiceCard.appendChild(prepositionRow);

            const filtersSection = document.createElement('div');
            filtersSection.className = 'filters-section';
            filtersSection.style.marginTop = '1rem';
            filtersSection.style.padding = '0.75em 0.9em';
            filtersSection.style.border = '1px solid var(--border-color)';
            filtersSection.style.borderRadius = '12px';
            filtersSection.style.background = 'var(--settings-subtle-bg, var(--card-bg, #f8f9fa))';

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
                            pill.style.color = 'var(--settings-chip-active-text, #fff)';
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

            const regularityGroup = createCheckboxGroup(
                'Regular Vs Irregular',
                [
                    { value: 'regular', text: 'Regular' },
                    { value: 'irregular', text: 'Irregular' },
                ],
                cardGenerationOptions.regularityFilter
            );
            filtersSection.appendChild(regularityGroup);

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

            const countEl = document.createElement('div');
            countEl.id = 'verb-filters-count';
            countEl.style.marginTop = '0.6rem';
            countEl.style.fontSize = '0.95rem';
            countEl.style.fontWeight = '600';
            countEl.style.color = 'var(--meta-color, #6c757d)';
            countEl.textContent = 'In play: …';
            filtersSection.appendChild(countEl);

            practiceCard.appendChild(filtersSection);
            advancedSections.appendChild(practiceCard);

            const drillActionsCard = createAdvancedCard('Drill actions');
            const actionsRow = document.createElement('div');
            actionsRow.className = 'advanced-actions';

            const saveBtn = document.createElement('button');
            saveBtn.type = 'button';
            saveBtn.className = 'advanced-action-btn';
            saveBtn.textContent = 'Save current drill';
            saveBtn.addEventListener('click', () => saveCurrentDrillPrompt());

            const shareBtn = document.createElement('button');
            shareBtn.type = 'button';
            shareBtn.className = 'advanced-action-btn';
            shareBtn.textContent = 'Share current drill';
            shareBtn.addEventListener('click', () => shareCurrentDrill());

            actionsRow.appendChild(saveBtn);
            actionsRow.appendChild(shareBtn);
            drillActionsCard.appendChild(actionsRow);

            const actionsHelper = document.createElement('div');
            actionsHelper.className = 'advanced-action-helper';
            actionsHelper.textContent = `Current drill: ${getCurrentDrillDisplayName()}`;
            drillActionsCard.appendChild(actionsHelper);
            advancedSections.appendChild(drillActionsCard);

            advancedPracticeContainer.appendChild(advancedSections);
        }

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

    function playCurrentAnswerAudio() {
        if (!currentCard || !currentCard.conjugated) return;
        if (currentCard.isFrameCard) {
            if (!isAnswerVisible) {
                showAnswer();
                return;
            }
            playAudioTarget(null, currentCard.frameFullAnswer || getCardAnswerText(currentCard));
            return;
        }
        if (currentCard.pronoun) {
            const audioText = getCardAnswerText(currentCard);
            maybeWhisperHuhBefore(audioText, conjugationAudioId(currentCard.verb.infinitive, currentCard.tense, currentCard.pronounKey || currentCard.pronoun));
            return;
        }
        playAudioTarget(null, currentCard.conjugated);
    }

    conjugatedAudioBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        playCurrentAnswerAudio();
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
        playCurrentAnswerAudio();
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
        if (currentCard && currentCard.verb) {
            showVerbDetail(currentCard.verb.infinitive, currentCard.tense, { card: currentCard });
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
            if (packagedTtsEnabledToggle.checked) {
                void ensureAutomaticPackagedTtsDownload();
                void maybePrefetchCurrentCardPackagedAudio(currentCard);
            }
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
            const refinedMainPoolKey = getRefinedMainPoolMaxKey();
            const refinedMainPoolLabel = formatFrequencyLabel(refinedMainPoolKey);
            if (!refinedMainPoolKey || !window.confirm(`Download packaged French audio through ${refinedMainPoolLabel}?`)) return;
            PACKAGED_TTS.setEnabled(true);
            void runPackagedTtsJob(`Downloading packaged French audio through ${refinedMainPoolLabel}...`, async () => {
                await PACKAGED_TTS.downloadTier(refinedMainPoolKey, ({ completed, total }) => {
                    setPackagedTtsStatus(`Downloading packaged French audio... ${completed}/${total} packs`);
                });
            });
        });
    }

    if (packagedTtsDownloadRareBtn) {
        packagedTtsDownloadRareBtn.addEventListener('click', () => {
            if (!PACKAGED_TTS) return;
            if (!window.confirm(`Download packaged French audio for verbs ${describeRareFrequencyBucket()}?`)) return;
            PACKAGED_TTS.setEnabled(true);
            void runPackagedTtsJob(`Downloading packaged French audio for verbs ${describeRareFrequencyBucket()}...`, async () => {
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
        if (e.target.classList.contains('tappable-audio') && e.target.textContent) {
            e.stopPropagation();
            e.preventDefault();
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
    explorerToggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        openSearchFromFlashcard();
    });
    optionsToggleBtn.addEventListener('click', showOptions);
    [helpBtn, helpNavBtn].filter(Boolean).forEach((btn) => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            restartTutorialFlow({ confirmRestart: true });
        });
    });
    if (appUpdateActionBtn) {
        appUpdateActionBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            e.preventDefault();
            if (appUpdateState.updateAvailable) {
                window.location.assign(getReloadUrlForFreshApp());
                return;
            }
            await checkForAppUpdates();
        });
    }
    if (appInstallActionBtn) {
        appInstallActionBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            e.preventDefault();
            await triggerInstallFlow();
        });
    }
    if (appInstallDismissBtn) {
        appInstallDismissBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            setInstallReminderDismissed(!installState.reminderDismissed);
        });
    }
    if (appInstallModal) {
        appInstallModal.addEventListener('click', (e) => {
            if (e.target instanceof Element && e.target.closest('[data-close-install-modal="true"]')) {
                closeInstallInstructionsModal();
            }
        });
    }
    if (appInstallModalCloseBtn) {
        appInstallModalCloseBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            closeInstallInstructionsModal();
        });
    }
    if (verbSetModal) {
        verbSetModal.addEventListener('click', (e) => {
            if (e.target instanceof Element && e.target.closest('[data-close-verb-set-modal="true"]')) {
                closeVerbSetModal();
            }
        });
    }
    if (verbSetModalCloseBtn) {
        verbSetModalCloseBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            closeVerbSetModal();
        });
    }
    if (verbSetNameInput) {
        verbSetNameInput.addEventListener('input', () => {
            renderVerbSetValidation(verbSetVerbsInput?.value || '');
        });
    }
    if (verbSetVerbsInput) {
        verbSetVerbsInput.addEventListener('input', () => {
            renderVerbSetValidation(verbSetVerbsInput.value);
        });
    }
    if (verbSetModalSaveBtn) {
        verbSetModalSaveBtn.addEventListener('click', (e) => {
            e.preventDefault();
            saveVerbSetFromModal();
        });
    }
    if (verbSetModalDeleteBtn) {
        verbSetModalDeleteBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (!verbSetModalState.editingSetId) return;
            const deletingId = verbSetModalState.editingSetId;
            closeVerbSetModal();
            deleteVerbSetById(deletingId);
        });
    }
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && appInstallModal && !appInstallModal.classList.contains('hidden')) {
            closeInstallInstructionsModal();
        }
        if (e.key === 'Escape' && verbSetModal && !verbSetModal.classList.contains('hidden')) {
            closeVerbSetModal();
        }
        if (e.key === 'Escape') {
            closeAllVerbDetailShareMenus();
        }
    });
    document.addEventListener('pointerdown', () => {
        if (!isFlashcardViewActive()) return;
        refreshIdleGuidance();
    }, true);
    document.addEventListener('keydown', () => {
        if (!isFlashcardViewActive()) return;
        refreshIdleGuidance();
    }, true);
    if (contextAudioBtn) {
        if (!FRENCH_FLASHCARD_FEATURES.contextualSpeakerButton) {
            contextAudioBtn.style.display = 'none';
        }
        contextAudioBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (contextAudioBtn.disabled) return;
            playContextAudioHint();
        });
    }
    if (usageVisibilityBtn) {
        usageVisibilityBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (usageVisibilityBtn.disabled) return;
            const wasShowing = !!cardGenerationOptions.showUsageNugget;
            cardGenerationOptions.showUsageNugget = !cardGenerationOptions.showUsageNugget;
            saveOptions();
            syncUsageNuggetVisibility();
            if (!wasShowing && cardGenerationOptions.showUsageNugget && usageNuggetEl && isAnswerVisible) {
                focusUsageExamplesInPanel(usageNuggetEl);
            }
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
    if (verbDetailContainer) {
        verbDetailContainer.addEventListener('scroll', () => {
            closeAllVerbDetailShareMenus();
        }, { passive: true });
    }

    // Event listener for browser's back/forward buttons
    window.addEventListener('popstate', (event) => {
        closeAllVerbDetailShareMenus();
        const routedDetail = getVerbDetailRouteParams();
        if (event.state && event.state.view === 'explorer-detail-view' && event.state.verbInfinitive) {
            openVerbDetailFromRoute({
                verbInfinitive: event.state.verbInfinitive,
                tenseToFocus: event.state.tenseToFocus,
                pronoun: event.state.pronoun,
            }, true);
            return;
        }
        if (routedDetail && (!event.state || event.state.view === 'explorer-detail-view')) {
            openVerbDetailFromRoute(routedDetail, true);
            return;
        }
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
    syncAppUpdateUi();

    // --- Correct Dictation Next Question Toggle Logic ---
    const correctDictationToggle = document.getElementById('correct-dictation-toggle');
    if (correctDictationToggle) {
        correctDictationToggle.addEventListener('change', function() {
            setMicAnswerMode(correctDictationToggle.checked);
            syncMicModeSettingUi();
            refreshDictationButton();
            updateCustomPresetFromUI();
        });
    }

    const idleNudgeToggle = document.getElementById('idle-nudge-toggle');
    if (idleNudgeToggle) {
        idleNudgeToggle.addEventListener('change', function() {
            setIdleNudgeEnabled(idleNudgeToggle.checked);
            syncIdleNudgeSettingUi();
        });
    }

    const pressToDictateToggle = document.getElementById('press-to-dictate-toggle');
    if (pressToDictateToggle) {
        pressToDictateToggle.addEventListener('change', function() {
            setPressToDictateEnabled(pressToDictateToggle.checked);
            syncPressToDictateSettingUi();
        });
    }

    const showTipsToggle = document.getElementById('show-tips-toggle');
    if (showTipsToggle) {
        showTipsToggle.addEventListener('change', function() {
            setShowTipsEnabled(showTipsToggle.checked);
            syncShowTipsSettingUi();
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
            const autosayOn = getScopedStorageItem('autosay-enabled') === 'true';
            if (autosayOn) {
                setScopedStorageItem('autosay-enabled', 'false');
                if (emojiSpan) emojiSpan.textContent = '🔇';
                autosayToggleBtn.setAttribute('aria-pressed', 'false');
                autosayToggleBtn.classList.remove('autosay-on');
                autosayToggleBtn.classList.add('autosay-off');
            } else {
                setScopedStorageItem('autosay-enabled', 'true');
                if (emojiSpan) emojiSpan.textContent = '🔊';
                autosayToggleBtn.setAttribute('aria-pressed', 'true');
                autosayToggleBtn.classList.remove('autosay-off');
                autosayToggleBtn.classList.add('autosay-on');
            }
        });
        // Set initial state on load
        const emojiSpan = autosayToggleBtn.querySelector('span');
        const autosayOn = getScopedStorageItem('autosay-enabled') === 'true';
        if (emojiSpan) emojiSpan.textContent = autosayOn ? '🔊' : '🔇';
        autosayToggleBtn.setAttribute('aria-pressed', autosayOn ? 'true' : 'false');
        autosayToggleBtn.classList.toggle('autosay-on', autosayOn);
        autosayToggleBtn.classList.toggle('autosay-off', !autosayOn);
    }
    const autosayReadyModal = document.getElementById('autosay-ready-modal');
    const autosayReadyContinueBtn = document.getElementById('autosay-ready-continue-btn');
    let firstCardReady = false;

    function showAutosayReadyModalIfNeeded(startAppCallback) {
      const autosayOn = getScopedStorageItem('autosay-enabled') === 'true';
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
        startupMark('initialize-app-start');
        loadOptions();
        loadTutorialState();
        if (dictateBtn) setupDictation();
        populateOptions();
        syncAppVersionUi();
        if (APP_VERSION === 'dev') {
            fetchLatestAppVersion()
                .then((latestVersion) => {
                    if (latestVersion) setAppUpdateState({ latestVersion });
                })
                .catch(() => {});
        }
        syncMicModeSettingUi();
        syncPressToDictateSettingUi();
        refreshContextAudioButton();
        refreshDictationButton();
        renderTutorialHint();
        const detailRoute = getVerbDetailRouteParams();
        const sharedDetailCard = detailRoute ? hydrateDetailRouteCard(detailRoute) : null;
        const shouldDeferTutorialForSharedEntry = !!(
            sharedDetailCard
            && tutorialState.active
            && tutorialState.stepIndex === 0
        );

        // Check for URL parameters for initial card - but only if no seed is present
        const urlParams = new URLSearchParams(window.location.search);
        const hasSeed = urlParams.get('seed');
        
        if (sharedDetailCard && seedFlashcardHistoryWithCard(sharedDetailCard, {
            deferTutorial: shouldDeferTutorialForSharedEntry,
        })) {
            // Shared detail routes keep their exact source card underneath the detail view.
        } else if (tutorialState.active && tutorialState.stepIndex === 0 && showTutorialIntroCard()) {
            // Keep the tutorial intro deterministic on the first card.
        } else if (!hasSeed) {
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
        window.history.replaceState({ view: 'flashcard-view' }, '', buildUrlForView('flashcard-view'));
        if (detailRoute) {
            openVerbDetailFromRoute({
                ...detailRoute,
                card: sharedDetailCard,
            }, false);
        }
        startupMark('initialize-app-complete');
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
        clearDictationOverlayTimeout();
        if (allowTimeout) {
            dictationOverlayTimeout = setTimeout(hideDictationOverlay, duration);
        }
    }
    function hideDictationOverlay() {
        clearDictationOverlayTimeout();
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

        const normalizedPronoun = normalizeRequestedCardPronoun(pronoun, verb);

        if (isFrenchIlOnlyVerb(verb)) {
            const impersonalEntry = resolveFrenchIlOnlyConjugation(verb, conjugations);
            if (!impersonalEntry) {
                console.warn(`No impersonal conjugation found for ${verb} ${tense}`);
                return null;
            }
            return {
                verb: verbInfo,
                tense: tense,
                pronoun: impersonalEntry.cardPronoun,
                pronounKey: impersonalEntry.sourcePronounKey,
                conjugated: impersonalEntry.conjugated,
            };
        }

        // Handle pronoun mapping - find the correct pronoun key in the data
        let actualPronounKey = normalizedPronoun;
        
        // If direct match doesn't exist, try to find the combined form
        if (!conjugations[normalizedPronoun]) {
            // Map individual pronouns to their combined forms in the data
            const pronounMapping = {
                'il': 'il/elle/on',
                'elle': 'il/elle/on', 
                'on': 'il/elle/on',
                'ils': 'ils/elles',
                'elles': 'ils/elles'
            };
            
            if (pronounMapping[normalizedPronoun]) {
                actualPronounKey = pronounMapping[normalizedPronoun];
            }
        }
        
        // Check if we have the conjugation
        if (!conjugations[actualPronounKey]) {
            console.warn(`No conjugation found for ${normalizedPronoun} (tried ${actualPronounKey}) ${verb} ${tense}`);
            return null;
        }

        // Create the card with the original pronoun for display, but use the actual key for conjugation
        return {
            verb: verbInfo,
            tense: tense,
            pronoun: normalizedPronoun, // Keep the requested pronoun for display after normalization
            pronounKey: actualPronounKey, // Store the actual key used for lookup
            conjugated: conjugations[actualPronounKey]
        };
    };

    function getTutorialIntroCard() {
        return generateCardFromParams('je', 'parler', 'present');
    }

    function showTutorialIntroCard() {
        const introCard = getTutorialIntroCard();
        if (!introCard) return false;
        history = [introCard];
        historyIndex = 0;
        displayCard(introCard);
        hideAnswer();
        backBtn.disabled = true;
        return true;
    }

    // --- Initial Card Loading ---
    const loadCardFromHash = () => {
        // Shared verb-detail links already hydrate the underlying flashcard during
        // initializeApp(); re-running the legacy hash startup here would replace it
        // with tutorial or random fallback state before Back can reveal the right card.
        if (getVerbDetailRouteParams()) {
            return;
        }
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
        if (tutorialState.active && tutorialState.stepIndex === 0 && showTutorialIntroCard()) {
            return;
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
            let verbLog = JSON.parse(getScopedStorageItem('verbLog') || '[]');
            
            // Add new entry
            verbLog.push(entry);
            
            // Keep only the most recent 1000 items
            if (verbLog.length > 1000) {
                verbLog = verbLog.slice(-1000);
            }
            
            // Save back to localStorage
            setScopedStorageItem('verbLog', JSON.stringify(verbLog));
            
            // Log to console
            console.log(`📊 Session logged: ${eventType} - ${entry.key} at ${new Date(entry.timestamp).toLocaleTimeString()}`);
            
        } catch (error) {
            console.warn('Failed to log session entry:', error);
        }
}

// ---------- DRILL SYSTEM ----------
const DRILL_STORAGE_KEY = 'savedDrills';
const VERB_SET_STORAGE_KEY = 'savedVerbSets';
const LAST_DRILL_STORAGE_KEY = 'lastDrill';
const STARTER_DRILL_ID = 'most-common';
const DRILL_SHARE_VERSION = 1;
const DRILL_OPTION_KEYS = [
    'tenseWeights',
    'frequencyWeights',
    'hierarchical',
    'balancedPronouns',
    'useMicToAnswer',
    'cardTypeMode',
    'reflexiveMode',
    'prepositionalVerbMode',
    'regularityFilter',
    'endingFilter',
    'categoryFilter',
    'selectedVerbSetIds',
    'sharedVerbSet',
];

function deepClone(value) {
    return JSON.parse(JSON.stringify(value));
}

function makeVerbSetId() {
    return `set_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeEmbeddedVerbSet(rawVerbSet) {
    if (!rawVerbSet || typeof rawVerbSet !== 'object') return null;
    const name = String(rawVerbSet.name || '').trim();
    const scope = String(rawVerbSet.scope || '').trim();
    const candidates = Array.isArray(rawVerbSet.verbs)
        ? rawVerbSet.verbs.map((verb) => normalizeVerbSetVerbCandidate(verb)).filter(Boolean)
        : [];
    const seen = new Set();
    const verbs = [];
    candidates.forEach((candidate) => {
        const canonical = verbSetLookupByNormalizedInfinitive.get(candidate);
        if (!canonical || seen.has(canonical)) return;
        seen.add(canonical);
        verbs.push(canonical);
    });
    if (!name || verbs.length === 0) return null;
    const topicUsages = {};
    if (rawVerbSet.topicUsages && typeof rawVerbSet.topicUsages === 'object') {
        Object.entries(rawVerbSet.topicUsages).forEach(([verbKey, rawEntries]) => {
            const canonicalVerb = verbSetLookupByNormalizedInfinitive.get(normalizeVerbSetVerbCandidate(verbKey));
            if (!canonicalVerb || !Array.isArray(rawEntries)) return;
            const entries = rawEntries
                .map((entry) => normalizeVerbSetUsageEntry(entry))
                .filter(Boolean);
            if (entries.length) {
                topicUsages[canonicalVerb] = entries;
            }
        });
    }
    return { name, verbs, scope, topicUsages };
}

function getVerbSetValidationSummary(rawText) {
    const candidates = parseVerbSetRawInput(rawText);
    const validVerbs = [];
    const notFound = [];
    const seenValid = new Set();
    candidates.forEach((candidate) => {
        const canonical = verbSetLookupByNormalizedInfinitive.get(candidate);
        if (!canonical) {
            notFound.push(candidate);
            return;
        }
        if (seenValid.has(canonical)) return;
        seenValid.add(canonical);
        validVerbs.push(canonical);
    });
    return {
        candidates,
        validVerbs,
        notFound,
        recognizedCount: validVerbs.length,
        notFoundCount: notFound.length,
    };
}

function formatVerbSetPreviewList(items, emptyText, limit = 24) {
    if (!Array.isArray(items) || items.length === 0) return emptyText;
    const shown = items.slice(0, limit).join(', ');
    const remaining = items.length - Math.min(items.length, limit);
    return remaining > 0 ? `${shown} + ${remaining} more` : shown;
}

function normalizeStoredVerbSet(rawSet) {
    if (!rawSet || typeof rawSet !== 'object') return null;
    const embedded = normalizeEmbeddedVerbSet(rawSet);
    if (!embedded) return null;
    const now = Date.now();
    return {
        id: String(rawSet.id || makeVerbSetId()),
        name: embedded.name,
        verbs: embedded.verbs,
        scope: embedded.scope || '',
        topicUsages: embedded.topicUsages || {},
        createdAt: Number(rawSet.createdAt) || now,
        updatedAt: Number(rawSet.updatedAt) || now,
    };
}

function loadSavedVerbSets() {
    try {
        const raw = getScopedStorageItem(VERB_SET_STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        const sets = Array.isArray(parsed)
            ? parsed
            : Array.isArray(parsed?.sets)
                ? parsed.sets
                : [];
        return sets
            .map((set) => normalizeStoredVerbSet(set))
            .filter(Boolean)
            .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    } catch (error) {
        console.warn('Could not load saved verb sets:', error);
        return [];
    }
}

function persistSavedVerbSets() {
    try {
        setScopedStorageItem(VERB_SET_STORAGE_KEY, JSON.stringify({
            version: 1,
            sets: savedVerbSets,
        }));
    } catch (error) {
        console.warn('Could not save verb sets:', error);
    }
}

function getBuiltInVerbSetById(id) {
    if (!id) return null;
    return builtInVerbSets.find((set) => set.id === id) || null;
}

function getSavedVerbSetById(id) {
    if (!id) return null;
    return savedVerbSets.find((set) => set.id === id) || null;
}

function getAvailableVerbSetById(id) {
    return getBuiltInVerbSetById(id) || getSavedVerbSetById(id);
}

function mergeVerbSetTopicUsages(selections) {
    const merged = {};
    (Array.isArray(selections) ? selections : []).forEach((selection) => {
        if (!selection || !selection.topicUsages || typeof selection.topicUsages !== 'object') return;
        Object.entries(selection.topicUsages).forEach(([verb, entries]) => {
            if (!Array.isArray(entries) || !entries.length) return;
            if (!merged[verb]) merged[verb] = [];
            merged[verb].push(...entries);
        });
    });
    return merged;
}

function getResolvedVerbSetSelections(options = cardGenerationOptions) {
    if (!options || typeof options !== 'object') return null;
    const selectedIds = Array.isArray(options.selectedVerbSetIds)
        ? options.selectedVerbSetIds.map((id) => String(id)).filter(Boolean)
        : options.selectedVerbSetId
            ? [String(options.selectedVerbSetId)]
            : [];
    const selections = selectedIds
        .map((id) => getAvailableVerbSetById(id))
        .filter(Boolean)
        .map((selectedSet) => ({
            source: selectedSet.isBuiltIn ? 'builtin' : 'saved',
            id: selectedSet.id,
            name: selectedSet.name,
            verbs: [...selectedSet.verbs],
            scope: selectedSet.scope || '',
            topicUsages: deepClone(selectedSet.topicUsages || {}),
            count: selectedSet.verbs.length,
        }));
    if (selections.length) return selections;
    const sharedSet = normalizeEmbeddedVerbSet(options.sharedVerbSet);
    if (sharedSet) {
        return [{
            source: 'shared',
            id: null,
            name: sharedSet.name,
            verbs: [...sharedSet.verbs],
            scope: sharedSet.scope || '',
            topicUsages: deepClone(sharedSet.topicUsages || {}),
            count: sharedSet.verbs.length,
        }];
    }
    return [];
}

function getResolvedVerbSetSelection(options = cardGenerationOptions) {
    const selections = getResolvedVerbSetSelections(options);
    if (!selections.length) return null;
    if (selections.length === 1) return selections[0];
    const uniqueVerbs = [...new Set(selections.flatMap((selection) => selection.verbs))];
    const first = selections[0];
    return {
        source: 'multiple',
        id: null,
        name: `${first.name} + ${selections.length - 1} more`,
        verbs: uniqueVerbs,
        scope: `${selections.length} categories selected`,
        topicUsages: mergeVerbSetTopicUsages(selections),
        count: uniqueVerbs.length,
        selectionCount: selections.length,
        selections,
    };
}
window.getResolvedVerbSetSelection = getResolvedVerbSetSelection;

function getResolvedVerbUniverse(options = cardGenerationOptions) {
    const selection = getResolvedVerbSetSelection(options);
    if (!selection) return uniqueVerbs;
    return selection.verbs
        .map((verb) => uniqueVerbByInfinitive.get(verb))
        .filter(Boolean);
}

function buildSharedVerbSetPayloadFromOptions(options = cardGenerationOptions) {
    const selection = getResolvedVerbSetSelection(options);
    return selection ? {
        name: selection.name,
        verbs: [...selection.verbs],
        scope: selection.scope || '',
        topicUsages: deepClone(selection.topicUsages || {}),
    } : null;
}

function clearVerbSetSelection(options = {}) {
    cardGenerationOptions.selectedVerbSetIds = [];
    cardGenerationOptions.sharedVerbSet = null;
    saveOptions(options);
    populateOptions();
}

function toggleVerbSetSelection(setId) {
    const target = getAvailableVerbSetById(setId);
    if (!target) {
        clearVerbSetSelection();
        return;
    }
    const currentIds = Array.isArray(cardGenerationOptions.selectedVerbSetIds)
        ? [...cardGenerationOptions.selectedVerbSetIds]
        : [];
    const alreadySelected = currentIds.includes(target.id);
    cardGenerationOptions.selectedVerbSetIds = alreadySelected
        ? currentIds.filter((id) => id !== target.id)
        : [...currentIds, target.id];
    cardGenerationOptions.sharedVerbSet = null;
    saveOptions();
    populateOptions();
}

function applySharedVerbSet(verbSet, options = {}) {
    const normalized = normalizeEmbeddedVerbSet(verbSet);
    if (!normalized) {
        clearVerbSetSelection(options);
        return;
    }
    cardGenerationOptions.selectedVerbSetIds = [];
    cardGenerationOptions.sharedVerbSet = normalized;
    saveOptions(options);
    populateOptions();
}

function syncVerbSetSelectionAfterLibraryChange(options = {}) {
    const selectedIds = Array.isArray(cardGenerationOptions.selectedVerbSetIds)
        ? cardGenerationOptions.selectedVerbSetIds
        : [];
    const validIds = selectedIds.filter((id) => getAvailableVerbSetById(id));
    if (validIds.length !== selectedIds.length) {
        cardGenerationOptions.selectedVerbSetIds = validIds;
        if (!options.skipSave) {
            saveOptions({ preserveActiveDrill: true });
        }
    }
}

function normalizeFrequencyKey(value) {
    const raw = String(value || '').trim().toLowerCase();
    if (!raw) return '';
    return LEGACY_FREQUENCY_KEY_MAP[raw] || raw;
}

function getFrequencySortIndex(key) {
    const normalized = normalizeFrequencyKey(key);
    if (!normalized) return Number.MAX_SAFE_INTEGER;
    const knownIndex = KNOWN_FREQUENCY_ORDER.indexOf(normalized);
    if (knownIndex !== -1) return knownIndex;
    const discoveredIndex = allFrequencies.indexOf(normalized);
    return discoveredIndex === -1 ? Number.MAX_SAFE_INTEGER : KNOWN_FREQUENCY_ORDER.length + discoveredIndex;
}

function getStandardFrequencyKeys() {
    return KNOWN_FREQUENCY_ORDER.filter((key) => key !== 'rare' && allFrequencies.includes(key));
}

function hasRareFrequencyBucket() {
    return allFrequencies.includes('rare');
}

function getBasicVerbPoolRangeKeys() {
    return getStandardFrequencyKeys();
}

function getRefinedMainPoolMaxKey() {
    const standardKeys = getStandardFrequencyKeys();
    return standardKeys[standardKeys.length - 1] || null;
}

function formatFrequencyLabel(key, options = {}) {
    const { long = false } = options;
    const normalized = normalizeFrequencyKey(key);
    if (!normalized) return '';
    if (normalized === 'rare') {
        return long ? 'Rare / outlier verbs' : 'Rare / outlier';
    }
    const topMatch = normalized.match(/^top(\d+)$/);
    if (topMatch) {
        return `Top ${Number(topMatch[1]).toLocaleString('en-US')}`;
    }
    return normalized.replace(/-/g, ' ');
}

function describeRareFrequencyBucket() {
    const refinedMainPoolKey = getRefinedMainPoolMaxKey();
    return refinedMainPoolKey ? `beyond ${formatFrequencyLabel(refinedMainPoolKey)}` : 'outside the main pool';
}

function normalizeFrequencyWeightsConfig(rawFrequencyWeights = {}) {
    if (!rawFrequencyWeights || typeof rawFrequencyWeights !== 'object') return {};

    const normalized = {};
    Object.entries(rawFrequencyWeights).forEach(([key, value]) => {
        const normalizedKey = normalizeFrequencyKey(key) || String(key || '').trim();
        if (!normalizedKey) return;
        normalized[normalizedKey] = value;
    });

    const refinedExtensionKeys = getStandardFrequencyKeys().filter((key) => getFrequencySortIndex(key) > getFrequencySortIndex('top1000'));
    const hasExplicitRefinedKeys = refinedExtensionKeys.some((key) => Object.prototype.hasOwnProperty.call(normalized, key));
    if (!hasExplicitRefinedKeys && (normalized.rare || 0) > 0) {
        refinedExtensionKeys.forEach((key) => {
            normalized[key] = normalized.rare;
        });
    }

    return normalized;
}

function buildEmptyTenseWeights() {
    return Object.keys(tenses).reduce((acc, tense) => {
        acc[tense] = 0;
        return acc;
    }, {});
}

function buildAllTenseWeights() {
    return Object.keys(tenses).reduce((acc, tense) => {
        acc[tense] = 1;
        return acc;
    }, {});
}

function buildRangeFrequencyWeights(maxKey, options = {}) {
    const weights = {};
    const rangeKeys = getStandardFrequencyKeys();
    const maxIndex = rangeKeys.indexOf(normalizeFrequencyKey(maxKey));
    rangeKeys.forEach((key, index) => {
        weights[key] = maxIndex >= 0 && index <= maxIndex ? 1 : 0;
    });
    if (hasRareFrequencyBucket()) {
        weights.rare = options.includeRare ? 1 : 0;
    }
    return weights;
}

function buildDrillCardOptions(overrides = {}) {
    const baseTenseWeights = buildEmptyTenseWeights();
    const baseFrequencyWeights = buildRangeFrequencyWeights('top50');
    const normalizedFrequencyWeights = normalizeFrequencyWeightsConfig(overrides.frequencyWeights || {});
    const normalizedSharedVerbSet = normalizeEmbeddedVerbSet(overrides.sharedVerbSet);
    const normalizedCardTypeMode = normalizeCardTypeMode(overrides.cardTypeMode);
    return {
        hierarchical: true,
        balancedPronouns: false,
        useMicToAnswer: false,
        cardTypeMode: normalizedCardTypeMode,
        reflexiveMode: 'include',
        prepositionalVerbMode: 'all',
        categoryFilter: 'all',
        selectedVerbSetIds: [],
        sharedVerbSet: null,
        ...overrides,
        tenseWeights: { ...baseTenseWeights, ...(overrides.tenseWeights || {}) },
        frequencyWeights: { ...baseFrequencyWeights, ...normalizedFrequencyWeights },
        regularityFilter: { regular: true, irregular: true, ...(overrides.regularityFilter || {}) },
        endingFilter: { er: true, ir: true, re: true, other: true, ...(overrides.endingFilter || {}) },
        selectedVerbSetIds: Array.isArray(overrides.selectedVerbSetIds)
            ? overrides.selectedVerbSetIds.map((id) => String(id)).filter(Boolean)
            : overrides.selectedVerbSetId
                ? [String(overrides.selectedVerbSetId)]
                : [],
        sharedVerbSet: normalizedSharedVerbSet,
    };
}

const defaultPresets = [
  {
    id: 'most-common',
    emoji: "🎯",
    name: "Most Crucial",
    desc: "présent · top 20",
    config: {
      cardGenerationOptions: buildDrillCardOptions({
        tenseWeights: { present: 1 },
        frequencyWeights: buildRangeFrequencyWeights('top20'),
      }),
    },
  },
  {
    id: 'present',
    emoji: "☀️",
    name: "Master Present",
    desc: "présent · top 100 · extra weight on top 20 and 50",
    config: {
      cardGenerationOptions: buildDrillCardOptions({
        tenseWeights: { present: 1 },
        frequencyWeights: {
            ...buildRangeFrequencyWeights('top100'),
            top20: 3,
            top50: 2,
            top100: 1,
        },
      }),
    },
  },
  {
    id: 'passe-compose',
    emoji: "🕰️",
    name: "Passé composé",
    desc: "passé composé · top 100",
    config: {
      cardGenerationOptions: buildDrillCardOptions({
        tenseWeights: { passeCompose: 1 },
        frequencyWeights: buildRangeFrequencyWeights('top100'),
      }),
    },
  },
  {
    id: 'common-irregulars',
    emoji: "🌀",
    name: "Common Irregulars",
    desc: "présent · top 100 · irregular only",
    config: {
      cardGenerationOptions: buildDrillCardOptions({
        tenseWeights: { present: 1 },
        frequencyWeights: buildRangeFrequencyWeights('top100'),
        regularityFilter: { regular: false, irregular: true },
      }),
    },
  },
  {
    id: 'beyond-present',
    emoji: "📈",
    name: "Beyond Present",
    desc: "imparfait + futur simple + conditionnel · top 100",
    config: {
      cardGenerationOptions: buildDrillCardOptions({
        tenseWeights: { imparfait: 1, futurSimple: 1, conditionnelPresent: 1 },
        frequencyWeights: buildRangeFrequencyWeights('top100'),
      }),
    },
  },
  {
    id: 'subjonctif',
    emoji: "⚡",
    name: "Subjonctif",
    desc: "subjonctif présent · top 100",
    config: {
      cardGenerationOptions: buildDrillCardOptions({
        tenseWeights: { subjonctifPresent: 1 },
        frequencyWeights: buildRangeFrequencyWeights('top100'),
      }),
    },
  },
  {
    id: 'subjonctif-no-er',
    emoji: "✂️",
    name: "Subjonctif sans -er",
    desc: "subjonctif présent · top 100 · no -er verbs",
    config: {
      cardGenerationOptions: buildDrillCardOptions({
        tenseWeights: { subjonctifPresent: 1 },
        frequencyWeights: buildRangeFrequencyWeights('top100'),
        endingFilter: { er: false, ir: true, re: true, other: true },
      }),
    },
  },
  {
    id: 'explore-500',
    emoji: "🌍",
    name: "Explore 500",
    desc: "all tenses · top 500",
    config: {
      cardGenerationOptions: buildDrillCardOptions({
        tenseWeights: buildAllTenseWeights(),
        frequencyWeights: buildRangeFrequencyWeights('top500'),
      }),
    },
  },
  {
    id: 'irregular-500',
    emoji: "🧩",
    name: "Irregular 500",
    desc: "all tenses · top 500 · irregular only",
    config: {
      cardGenerationOptions: buildDrillCardOptions({
        tenseWeights: buildAllTenseWeights(),
        frequencyWeights: buildRangeFrequencyWeights('top500'),
        regularityFilter: { regular: false, irregular: true },
      }),
    },
  },
  {
    id: 'reflexive-challenge',
    emoji: "🔁",
    name: "Reflexive Challenge",
    desc: "passé composé + subjonctif · top 500 · reflexive only",
    config: {
      cardGenerationOptions: buildDrillCardOptions({
        tenseWeights: { passeCompose: 1, subjonctifPresent: 1 },
        frequencyWeights: buildRangeFrequencyWeights('top500'),
        reflexiveMode: 'only',
      }),
    },
  },
  {
    id: 'custom',
    emoji: "⚙️",
    name: "Custom",
    desc: "Your current settings",
    isCustom: true,
    config: { cardGenerationOptions: {} }
  }
];

let activePreset = "Custom";
let activePresetKey = "builtin:custom";
let presets = defaultPresets;
let savedDrills = [];
let savedVerbSets = [];
let verbSetModalState = {
    mode: 'create',
    editingSetId: null,
    scope: '',
    topicUsages: {},
};

function getPresetKey(preset, source = 'builtin') {
    return `${source}:${preset.id || preset.name}`;
}

function loadSavedDrills() {
    try {
        const raw = getScopedStorageItem(DRILL_STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed)
            ? parsed.map((drill) => {
                const normalizedConfig = deepClone(drill.config || {});
                const target = normalizedConfig.cardGenerationOptions || normalizedConfig || {};
                const normalizedOptions = buildDrillCardOptions(target);
                if (normalizedConfig.cardGenerationOptions) {
                    normalizedConfig.cardGenerationOptions = normalizedOptions;
                } else {
                    Object.assign(normalizedConfig, normalizedOptions);
                }
                return { ...drill, config: normalizedConfig };
            })
            : [];
    } catch (error) {
        console.warn('Could not load saved drills:', error);
        return [];
    }
}

function persistSavedDrills() {
    try {
        setScopedStorageItem(DRILL_STORAGE_KEY, JSON.stringify(savedDrills));
    } catch (error) {
        console.warn('Could not save drills:', error);
    }
}

function renderVerbSetValidation(rawText) {
    if (!verbSetValidation) return null;
    const summary = getVerbSetValidationSummary(rawText);
    const validPreview = formatVerbSetPreviewList(summary.validVerbs, 'None yet');
    const invalidPreview = formatVerbSetPreviewList(summary.notFound, 'Everything pasted is recognized so far.');
    verbSetValidation.innerHTML = `
        <div class="verb-set-validation-summary">
            Recognized: <strong>${summary.recognizedCount}</strong> · Not found: <strong>${summary.notFoundCount}</strong>
        </div>
        <div class="verb-set-validation-groups">
            <div class="verb-set-validation-group">
                <div class="verb-set-validation-heading">Valid verbs</div>
                <div class="verb-set-validation-list${summary.validVerbs.length ? '' : ' verb-set-validation-empty'}">${escapeHtml(validPreview)}</div>
            </div>
            <div class="verb-set-validation-group invalid">
                <div class="verb-set-validation-heading">Not found</div>
                <div class="verb-set-validation-list${summary.notFound.length ? '' : ' verb-set-validation-empty'}">${escapeHtml(invalidPreview)}</div>
            </div>
        </div>
    `;
    if (verbSetModalSaveBtn) {
        verbSetModalSaveBtn.disabled = summary.recognizedCount === 0;
    }
    return summary;
}

function closeVerbSetModal() {
    if (!verbSetModal) return;
    verbSetModal.classList.add('hidden');
    verbSetModalState = { mode: 'create', editingSetId: null, scope: '', topicUsages: {} };
}

function openVerbSetModal(options = {}) {
    if (!verbSetModal || !verbSetNameInput || !verbSetVerbsInput) return;
    const { mode = 'create', setId = null, initialVerbSet = null } = options;
    const existingSet = setId ? getSavedVerbSetById(setId) : null;
    const sourceSet = existingSet || normalizeEmbeddedVerbSet(initialVerbSet);
    verbSetModalState = {
        mode,
        editingSetId: existingSet?.id || null,
        scope: sourceSet?.scope || '',
        topicUsages: deepClone(sourceSet?.topicUsages || {}),
    };
    verbSetModalTitle.textContent = existingSet ? 'Edit category' : 'New category';
    verbSetModalText.textContent = 'Paste infinitives, comma-, semicolon-, or newline-separated to add your own category.';
    verbSetNameInput.value = sourceSet?.name || '';
    verbSetVerbsInput.value = sourceSet?.verbs?.join('\n') || '';
    verbSetModalDeleteBtn?.classList.toggle('hidden', !existingSet);
    renderVerbSetValidation(verbSetVerbsInput.value);
    verbSetModal.classList.remove('hidden');
    window.requestAnimationFrame(() => {
        try {
            verbSetNameInput.focus({ preventScroll: true });
        } catch (error) {
            verbSetNameInput.focus();
        }
        if (!verbSetNameInput.value && sourceSet?.name) {
            verbSetNameInput.setSelectionRange(0, sourceSet.name.length);
        }
    });
}

function saveVerbSetFromModal() {
    const validation = renderVerbSetValidation(verbSetVerbsInput?.value || '');
    if (!validation || validation.recognizedCount === 0) {
        window.alert('Add at least one recognized verb before saving.');
        return;
    }

    const trimmedName = String(verbSetNameInput?.value || '').trim();
    if (!trimmedName) {
        window.alert('Give this category a name.');
        return;
    }

    const existingSet = verbSetModalState.editingSetId
        ? getSavedVerbSetById(verbSetModalState.editingSetId)
        : null;
    const now = Date.now();
    const nextSet = {
        id: existingSet?.id || makeVerbSetId(),
        name: trimmedName,
        verbs: validation.validVerbs,
        scope: verbSetModalState.scope || existingSet?.scope || '',
        topicUsages: deepClone(verbSetModalState.topicUsages || existingSet?.topicUsages || {}),
        createdAt: existingSet?.createdAt || now,
        updatedAt: now,
    };

    if (existingSet) {
        savedVerbSets = savedVerbSets.map((set) => set.id === existingSet.id ? nextSet : set);
    } else {
        savedVerbSets = [nextSet, ...savedVerbSets];
    }
    savedVerbSets.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    persistSavedVerbSets();
    cardGenerationOptions.selectedVerbSetIds = [nextSet.id];
    cardGenerationOptions.sharedVerbSet = null;
    saveOptions();
    populateOptions();
    closeVerbSetModal();
}

function deleteVerbSetById(setId) {
    const target = getSavedVerbSetById(setId);
    if (!target) return;
    if (!window.confirm(`Delete category "${target.name}"?`)) return;
    savedVerbSets = savedVerbSets.filter((set) => set.id !== setId);
    persistSavedVerbSets();
    if ((cardGenerationOptions.selectedVerbSetIds || []).includes(setId)) {
        clearVerbSetSelection();
    } else {
        populateOptions();
    }
}

function saveSharedVerbSetToLibrary(sharedSelection = getResolvedVerbSetSelection()) {
    if (!sharedSelection || sharedSelection.source !== 'shared') return;
    openVerbSetModal({
        mode: 'create',
        initialVerbSet: {
            name: sharedSelection.name,
            verbs: sharedSelection.verbs,
            scope: sharedSelection.scope || '',
            topicUsages: sharedSelection.topicUsages || {},
        },
    });
}

function getCustomPreset() {
    return presets.find((preset) => preset.isCustom || preset.name === 'Custom');
}

function getActiveDrill() {
    const builtin = presets.find((preset) => getPresetKey(preset, 'builtin') === activePresetKey);
    if (builtin) return { preset: builtin, source: 'builtin' };
    const saved = savedDrills.find((preset) => getPresetKey(preset, 'saved') === activePresetKey);
    if (saved) return { preset: saved, source: 'saved' };
    const custom = getCustomPreset();
    return custom ? { preset: custom, source: 'builtin' } : null;
}

function getCurrentDrillDisplayName() {
    return getActiveDrill()?.preset?.name || 'Custom';
}

function snapshotCurrentDrillConfig(options = {}) {
    const { forShare = false } = options;
    const snapshot = {};
    DRILL_OPTION_KEYS.forEach((key) => {
        if (cardGenerationOptions[key] === undefined) return;
        snapshot[key] = deepClone(cardGenerationOptions[key]);
    });
    if (forShare) {
        const sharedVerbSet = buildSharedVerbSetPayloadFromOptions(cardGenerationOptions);
        snapshot.selectedVerbSetIds = [];
        snapshot.sharedVerbSet = sharedVerbSet;
    }
    return { cardGenerationOptions: snapshot };
}

function summarizeFrequencyWeights(frequencyWeights = {}) {
    const normalizedFrequencyWeights = normalizeFrequencyWeightsConfig(frequencyWeights);
    const selectedRange = getSelectedVerbPoolRangeKey(normalizedFrequencyWeights);
    const parts = [];
    if (selectedRange) {
        parts.push(formatFrequencyLabel(selectedRange));
    } else {
        parts.push('custom pool');
    }
    if ((normalizedFrequencyWeights.rare || 0) > 0) {
        parts.push('rare/outliers on');
    }
    return parts.join(' · ');
}

function describeDrillConfig(config = {}) {
    const options = buildDrillCardOptions(config.cardGenerationOptions || config);
    const tenseLabels = Object.entries(options.tenseWeights || {})
        .filter(([, value]) => value > 0)
        .map(([key]) => window.frenchTenseKeyToLabel?.[key] || key);
    const tenseSummary = tenseLabels.length === Object.keys(tenses).length
        ? 'all tenses'
        : tenseLabels.length === 1
            ? tenseLabels[0]
            : tenseLabels.slice(0, 2).join(' + ');

    const activeVerbSet = getResolvedVerbSetSelection(options);
    const parts = [tenseSummary || 'mixed tenses'];
    if (activeVerbSet) {
        parts.push(
            activeVerbSet.selectionCount && activeVerbSet.selectionCount > 1
                ? `${activeVerbSet.selectionCount} categories · ${activeVerbSet.count} verbs`
                : `${activeVerbSet.name} · ${activeVerbSet.count} verbs`
        );
    } else {
        parts.push(summarizeFrequencyWeights(options.frequencyWeights || {}));
    }
    if (!activeVerbSet && options.regularityFilter && options.regularityFilter.regular === false && options.regularityFilter.irregular !== false) {
        parts.push('irregular focus');
    }
    if (!activeVerbSet && options.reflexiveMode === 'only') {
        parts.push('reflexive only');
    }
    if (!activeVerbSet && options.prepositionalVerbMode === 'only') {
        parts.push('prepositional verbs only');
    }
    if (options.cardTypeMode === 'frame') {
        parts.push('frame cards only');
    } else if (options.cardTypeMode === 'both') {
        parts.push('includes frame cards');
    }
    return parts.join(' · ');
}

function setVerbPoolRange(maxKey) {
    const rangeWeights = buildRangeFrequencyWeights(maxKey, {
        includeRare: (cardGenerationOptions.frequencyWeights.rare || 0) > 0,
    });
    cardGenerationOptions.frequencyWeights = {
        ...cardGenerationOptions.frequencyWeights,
        ...rangeWeights,
    };
}

function getSelectedVerbPoolRangeKey(frequencyWeights = cardGenerationOptions.frequencyWeights) {
    const normalizedFrequencyWeights = normalizeFrequencyWeightsConfig(frequencyWeights);
    const rangeKeys = getStandardFrequencyKeys();
    let selected = null;
    for (const freqKey of rangeKeys) {
        const index = rangeKeys.indexOf(freqKey);
        const prefixEnabled = rangeKeys.slice(0, index + 1).every((key) => (normalizedFrequencyWeights[key] || 0) > 0);
        const suffixDisabled = rangeKeys.slice(index + 1).every((key) => (normalizedFrequencyWeights[key] || 0) === 0);
        if (prefixEnabled && suffixDisabled) {
            selected = freqKey;
        }
    }
    return selected;
}

function getVerbPoolSummary() {
    const activeVerbSet = getResolvedVerbSetSelection();
    if (activeVerbSet) {
        const categoryCount = activeVerbSet.selectionCount || 1;
        return `Exact pool from ${categoryCount} ${categoryCount === 1 ? 'category' : 'categories'} · ${activeVerbSet.count} verbs · Top N and other verb filters are ignored`;
    }
    const selectedRange = getSelectedVerbPoolRangeKey();
    const parts = [];
    parts.push(selectedRange ? `Including verbs through ${formatFrequencyLabel(selectedRange)}` : 'Using a custom frequency mix');
    if (hasRareFrequencyBucket() && (cardGenerationOptions.frequencyWeights.rare || 0) > 0) {
        parts.push('rare/outlier verbs included');
    }
    return parts.join(' · ');
}

function applyDrillCardOptions(config = {}) {
    const resolved = buildDrillCardOptions(config);
    cardGenerationOptions.tenseWeights = deepClone(resolved.tenseWeights);
    cardGenerationOptions.frequencyWeights = deepClone(resolved.frequencyWeights);
    cardGenerationOptions.hierarchical = resolved.hierarchical;
    cardGenerationOptions.balancedPronouns = resolved.balancedPronouns;
    cardGenerationOptions.useMicToAnswer = resolved.useMicToAnswer;
    cardGenerationOptions.cardTypeMode = normalizeCardTypeMode(resolved.cardTypeMode);
    cardGenerationOptions.reflexiveMode = resolved.reflexiveMode;
    cardGenerationOptions.prepositionalVerbMode = resolved.prepositionalVerbMode === 'only' ? 'only' : 'all';
    cardGenerationOptions.regularityFilter = deepClone(resolved.regularityFilter);
    cardGenerationOptions.endingFilter = deepClone(resolved.endingFilter);
    cardGenerationOptions.categoryFilter = resolved.categoryFilter;
    cardGenerationOptions.selectedVerbSetIds = [...(resolved.selectedVerbSetIds || [])];
    cardGenerationOptions.sharedVerbSet = deepClone(resolved.sharedVerbSet);
    syncVerbSetSelectionAfterLibraryChange({ skipSave: true });
}

function applyPreset(preset, options = {}) {
    const source = options.source || 'builtin';
    const cfg = preset?.config?.cardGenerationOptions || {};
    applyDrillCardOptions(cfg);

    saveOptions({ preserveActiveDrill: true });
    if (typeof syncMicModeSettingUi === 'function') syncMicModeSettingUi();
    if (typeof refreshDictationButton === 'function') refreshDictationButton();
    if (typeof refreshTutorialAwareUi === 'function') refreshTutorialAwareUi();

    activePreset = preset.name;
    activePresetKey = getPresetKey(preset, source);
    setScopedStorageItem(LAST_DRILL_STORAGE_KEY, activePresetKey);
    setScopedStorageItem("lastPreset", activePreset);
    if (window._populateOptions) window._populateOptions();
    highlightActivePreset();
}

function resetTutorialPracticeBaseline() {
  const starter = presets.find(p => p.id === STARTER_DRILL_ID);
  if (starter) {
    applyPreset(starter);
  }

  cardGenerationOptions.hierarchical = true;
  cardGenerationOptions.showPhrases = true;
  cardGenerationOptions.verbsWithSentencesOnly = false;
  cardGenerationOptions.balancedPronouns = false;
  cardGenerationOptions.useMicToAnswer = false;
  cardGenerationOptions.showUsageNugget = false;
  cardGenerationOptions.cardTypeMode = 'conjugation';
  cardGenerationOptions.reflexiveMode = 'include';
  cardGenerationOptions.prepositionalVerbMode = 'all';
  cardGenerationOptions.regularityFilter = { regular: true, irregular: true };
  cardGenerationOptions.endingFilter = { er: true, ir: true, re: true, other: true };
  cardGenerationOptions.categoryFilter = 'all';
  cardGenerationOptions.selectedVerbSetIds = [];
  cardGenerationOptions.sharedVerbSet = null;

  try {
    localStorage.setItem(localStorageKey, JSON.stringify(cardGenerationOptions));
    setScopedStorageItem('correct-dictation-next-question', 'false');
  } catch (e) {
    console.warn("Could not save tutorial baseline options to localStorage:", e);
  }

  updateCustomPresetFromUI();
  if (starter) {
    applyPreset(starter);
  }
  if (window._populateOptions) window._populateOptions();
  if (typeof syncMicModeSettingUi === 'function') syncMicModeSettingUi();
  if (typeof refreshTutorialAwareUi === 'function') refreshTutorialAwareUi();
}

function refreshCurrentDrillCard() {
    if (!currentDrillCard) return;
    const active = getActiveDrill();
    const currentPreset = active?.preset || getCustomPreset();
    if (!currentPreset) return;
    const currentConfig = currentPreset.isCustom ? snapshotCurrentDrillConfig() : currentPreset.config;
    currentDrillCard.innerHTML = `
        <div class="current-drill-label">Current drill</div>
        <div class="current-drill-name">${currentPreset.emoji || '📚'} ${currentPreset.name}</div>
        <div class="current-drill-desc">${currentPreset.desc || describeDrillConfig(currentConfig)}</div>
    `;
}

function renderSavedDrills() {
    if (!savedDrillsContainer || !savedDrillsGroup) return;
    savedDrillsContainer.innerHTML = '';
    savedDrillsGroup.classList.toggle('hidden', savedDrills.length === 0);

    savedDrills.forEach((preset) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'preset-btn';
        btn.dataset.presetKey = getPresetKey(preset, 'saved');
        if (getPresetKey(preset, 'saved') === activePresetKey) btn.classList.add('active');
        btn.innerHTML = `
            <span class="preset-icon">${preset.emoji || '💾'}</span>
            <span class="preset-text">
                <span class="preset-name">${preset.name}</span>
                <span class="preset-desc">${preset.desc || describeDrillConfig(preset.config)}</span>
            </span>
            <span class="drill-card-actions">
                <span class="drill-card-action-btn danger" data-action="delete">Delete</span>
            </span>
        `;
        btn.addEventListener('click', () => {
            applyPreset(preset, { source: 'saved' });
        });
        btn.querySelector('[data-action="delete"]')?.addEventListener('click', (event) => {
            event.stopPropagation();
            if (!window.confirm(`Delete saved drill "${preset.name}"?`)) return;
            savedDrills = savedDrills.filter((item) => item.id !== preset.id);
            persistSavedDrills();
            if (activePresetKey === getPresetKey(preset, 'saved')) {
                updateCustomPresetFromUI();
            } else {
                renderSavedDrills();
                highlightActivePreset();
            }
        });
        savedDrillsContainer.appendChild(btn);
    });
}

function renderPresets() {
  const container = document.getElementById("presets-container");
  if (!container) return;
  container.innerHTML = "";
  presets.forEach(preset => {
    const btn = document.createElement("button");
    btn.type = 'button';
    btn.className = "preset-btn preset-block";
    btn.dataset.presetKey = getPresetKey(preset, 'builtin');
    if (getPresetKey(preset, 'builtin') === activePresetKey) btn.classList.add("active");
    btn.title = preset.desc || describeDrillConfig(preset.config);
    btn.innerHTML = `<span class="preset-icon">${preset.emoji}</span><span class="preset-text"><span class="preset-name">${preset.name}</span></span>`;
    btn.onclick = () => {
      applyPreset(preset);
    };
    container.appendChild(btn);
  });
  renderSavedDrills();
}

function highlightActivePreset() {
  document.querySelectorAll(".preset-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.presetKey === activePresetKey);
  });
  refreshCurrentDrillCard();
  const badge = document.getElementById('preset-badge');
  if (badge) {
    const active = getActiveDrill();
    const currentPreset = active?.preset;
    const isCustom = currentPreset?.isCustom || activePreset === 'Custom';
    if (!isCustom && currentPreset) {
      const emoji = currentPreset.emoji || '📚';
      badge.innerHTML = `<span class="preset-badge-icon">${emoji}</span><span class="preset-badge-name">${currentPreset.name}</span>`;
      badge.style.display = 'inline-flex';
    } else {
      badge.innerHTML = '';
      badge.style.display = 'none';
    }
  }
}

function promptForDrillMetadata(defaultName, defaultDescription = '') {
    const name = window.prompt('Drill name', defaultName || '');
    if (name === null) return null;
    const trimmedName = name.trim();
    if (!trimmedName) return null;
    const description = window.prompt('Short description (optional)', defaultDescription || '');
    if (description === null) return null;
    return { name: trimmedName, desc: description.trim() };
}

function encodeDrillPayload(payload) {
    return btoa(unescape(encodeURIComponent(JSON.stringify(payload))))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/g, '');
}

function decodeDrillPayload(encoded) {
    const normalized = encoded.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized + '='.repeat((4 - normalized.length % 4) % 4);
    return JSON.parse(decodeURIComponent(escape(atob(padded))));
}

function buildCurrentDrillPayload(options = {}) {
    const active = getActiveDrill();
    const currentPreset = active?.preset;
    return {
        version: DRILL_SHARE_VERSION,
        name: options.name || currentPreset?.name || 'Custom',
        desc: options.desc ?? currentPreset?.desc ?? '',
        seed: options.seed || currentPreset?.seed || '',
        config: snapshotCurrentDrillConfig({ forShare: !!options.forShare }),
    };
}

function shareCurrentDrill() {
    const active = getActiveDrill();
    const currentPreset = active?.preset;
    let metadata = {
        name: currentPreset?.name || 'Custom',
        desc: currentPreset?.desc || '',
    };
    if (!currentPreset || currentPreset.isCustom) {
        const prompted = promptForDrillMetadata(metadata.name, metadata.desc);
        if (!prompted) return;
        metadata = prompted;
    }

    const payload = buildCurrentDrillPayload({ ...metadata, forShare: true });
    const encoded = encodeDrillPayload(payload);
    const url = `${window.location.origin}${window.location.pathname}#drill=${encoded}`;
    copyTextToClipboard(url)
        .then((copied) => {
            if (copied) {
                window.alert(`Copied drill link for "${payload.name}".`);
                return;
            }
            window.prompt('Copy this drill link', url);
        })
        .catch(() => window.prompt('Copy this drill link', url));
}

function saveCurrentDrillPrompt() {
    const active = getActiveDrill();
    const currentPreset = active?.preset;
    const prompted = promptForDrillMetadata(
        currentPreset?.isCustom ? '' : `${currentPreset?.name || 'Custom'} copy`,
        currentPreset?.isCustom ? '' : (currentPreset?.desc || '')
    );
    if (!prompted) return;

    const payload = buildCurrentDrillPayload(prompted);
    const savedDrill = {
        id: `saved-${Date.now().toString(36)}`,
        emoji: '💾',
        name: payload.name,
        desc: payload.desc,
        seed: payload.seed,
        config: payload.config,
    };
    savedDrills.unshift(savedDrill);
    persistSavedDrills();
    renderSavedDrills();
    applyPreset(savedDrill, { source: 'saved' });
}

function importSharedDrillFromHash() {
    const hash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : '';
    if (!hash) return null;
    const params = new URLSearchParams(hash);
    const encoded = params.get('drill');
    if (!encoded) return null;
    try {
        const payload = decodeDrillPayload(encoded);
        if (!payload || payload.version !== DRILL_SHARE_VERSION || !payload.config?.cardGenerationOptions) {
            return null;
        }
        const normalizedConfig = deepClone(payload.config);
        normalizedConfig.cardGenerationOptions = buildDrillCardOptions(normalizedConfig.cardGenerationOptions || {});
        const signature = hashString(JSON.stringify(normalizedConfig));
        const existing = savedDrills.find((drill) => hashString(JSON.stringify(drill.config)) === signature);
        if (existing) {
            window.history.replaceState(null, '', window.location.pathname + window.location.search);
            return existing;
        }
        const imported = {
            id: `shared-${Date.now().toString(36)}`,
            emoji: '🔗',
            name: payload.name || 'Shared drill',
            desc: payload.desc || describeDrillConfig(normalizedConfig),
            seed: payload.seed || '',
            config: normalizedConfig,
        };
        savedDrills.unshift(imported);
        persistSavedDrills();
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
        return imported;
    } catch (error) {
        console.warn('Could not import drill from URL:', error);
        return null;
    }
}

// Switch to Custom and save config whenever user changes any setting
function updateCustomPresetFromUI() {
    activePreset = "Custom";
    activePresetKey = getPresetKey(getCustomPreset(), 'builtin');
    setScopedStorageItem(LAST_DRILL_STORAGE_KEY, activePresetKey);
    setScopedStorageItem("lastPreset", activePreset);
    const custom = getCustomPreset();
    if (custom) {
        custom.config = snapshotCurrentDrillConfig();
        custom.desc = describeDrillConfig(custom.config);
    }
    renderPresets();
    highlightActivePreset();
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

savedDrills = loadSavedDrills();
savedVerbSets = loadSavedVerbSets();
syncVerbSetSelectionAfterLibraryChange({ skipSave: true });

// On load, fill Custom from localStorage cardGenerationOptions
const storedOptions = JSON.parse(localStorage.getItem(localStorageKey) || 'null');
if (storedOptions) {
  const custom = getCustomPreset();
  if (custom) {
    custom.config = snapshotCurrentDrillConfig();
    custom.desc = describeDrillConfig(custom.config);
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


const importedSharedDrill = importSharedDrillFromHash();
if (importedSharedDrill) {
  applyPreset(importedSharedDrill, { source: 'saved' });
} else if (tutorialState.active) {
  resetTutorialPracticeBaseline();
} else {
  const lastDrill = getScopedStorageItem(LAST_DRILL_STORAGE_KEY);
  const lastPreset = getScopedStorageItem("lastPreset");
  let found = null;

  if (lastDrill) {
    found = presets.find((preset) => getPresetKey(preset, 'builtin') === lastDrill)
      || savedDrills.find((preset) => getPresetKey(preset, 'saved') === lastDrill);
    if (found) {
      applyPreset(found, { source: savedDrills.includes(found) ? 'saved' : 'builtin' });
    }
  }

  if (!found && lastPreset) {
    const legacyPresetMap = {
      'Master the Basics I': 'most-common',
      'Master the Basics II': 'present',
      'Master the Basics III': 'explore',
      'Broaden Horizons': 'explore',
      'All Verbs All Tenses': 'explore',
      'Custom': 'custom',
    };
    const targetId = legacyPresetMap[lastPreset];
    const legacyMatch = presets.find((preset) => preset.id === targetId || preset.name === lastPreset || preset.emoji === lastPreset);
    if (legacyMatch) {
      applyPreset(legacyMatch);
      found = legacyMatch;
    }
  }

  if (!found) {
    const starter = presets.find((preset) => preset.id === STARTER_DRILL_ID);
    if (starter) applyPreset(starter);
  }
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

// Call the patched initializeApp only after tutorial/preset state is fully defined.
window.initializeApp();

// Hide loading screen once app is ready
const loader = document.getElementById('app-loader');
if (loader) {
    loader.style.opacity = '0';
    setTimeout(() => { if (loader.parentNode) loader.parentNode.removeChild(loader); }, 380);
}
startupMark('app-ready');
if (window.appLog) window.appLog('app-ready');
// Load card from URL hash on initial load
loadCardFromHash();


});
