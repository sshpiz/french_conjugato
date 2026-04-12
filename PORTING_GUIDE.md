# Porting LesVerbes to Another Language

This guide explains the architecture, data formats, and lessons learned from building LesVerbes (French conjugation trainer) so that an AI agent can create a similar app for another language (Italian, Greek, Spanish, etc.).

## Architecture overview

The app is a single-page PWA with no backend. Everything runs client-side. The build step bundles all HTML, CSS, JS, and data into one standalone `index.html` file (~3MB).

```
User's phone
  └── dist/index.html (standalone, all assets inlined)
       ├── Verb data: 7,046 verbs with full conjugation tables
       ├── Usage nuggets: 2,731 example sentences showing verbs in context
       ├── App logic: flashcard engine, settings, dictation, TTS
       └── Service worker: offline caching (stale-while-revalidate)
```

## The two data files you need to generate

### 1. Verb conjugation data (`js/verbs.full.js`)

This is the core dataset. For French it contains 7,046 verbs. Structure:

```javascript
const verbs = [
  {
    "infinitive": "aller",       // Dictionary form
    "translation": "to go",      // English translation
    "frequency": "top20",        // Frequency tier (see below)
    "usage_count": 0             // Legacy field, can be 0
  },
  // ... 7,046 entries
];

const tenses = {
  "present": {
    "aller": {
      "je": "je vais",
      "tu": "tu vas",
      "il/elle/on": "il va",
      "nous": "nous allons",
      "vous": "vous allez",
      "ils/elles": "ils vont"
    },
    // ... every verb
  },
  "imparfait": { /* same structure */ },
  "futurSimple": { /* same structure */ },
  "passeCompose": { /* same structure */ },
  "plusQueParfait": { /* same structure */ },
  "conditionnelPresent": { /* same structure */ },
  "subjonctifPresent": { /* same structure */ }
};

const pronouns = ["je", "tu", "il/elle/on", "nous", "vous", "ils/elles"];
```

**Key design decisions:**

- **Frequency tiers are exclusive (non-overlapping).** `top20` = the 20 most common, `top50` = the next 30, `top100` = the next 50, etc. The app uses these tiers for weighted random selection so users can focus on common verbs first.
- **Tenses are keyed by camelCase identifiers** that the app uses internally. The display names are mapped separately in `script.js`.
- **Pronouns include the subject pronoun in the conjugated form.** E.g., `"je vais"` not just `"vais"`. This is what gets displayed on the flashcard.
- **The `tenses` object is verb-indexed inside each tense** (not tense-indexed inside each verb). This matters for the data shape.

**For a new language, you need to decide:**
- Which tenses to include (equivalent to the 7 French tenses above)
- What pronouns / subject forms exist
- How to get conjugation data (see "Data sources" below)
- How to assign frequency tiers

### 2. Usage nuggets (`verb_usages.js`)

These show each verb's different meanings with real example sentences. Displayed on the flashcard after the user reveals the answer.

```javascript
window.verbUsages = [
  {
    "verb": "aller",              // Must match an infinitive in verbs array
    "sense_id": "aller_01",       // Unique ID per sense
    "pattern": "aller à + place", // Usage pattern (shown as title)
    "meaning_en": "go to",        // Short English meaning for this sense
    "example_fr": "Demain, je vais à Paris.",   // Example in target language
    "example_en": "I'm going to Paris tomorrow." // English translation
  },
  // Multiple senses per verb. French has 2,731 entries across 744 verbs.
];
```

**Why this matters:** Many verbs have multiple unrelated meanings. "Prendre" can mean "take", "have (a meal)", "catch (transport)", etc. The nuggets disambiguate — users learn real usage, not just dictionary definitions.

**For a new language:** Generate these via an LLM (we used GPT-4o). Prompt it to produce 3-8 senses per verb, focusing on common/distinct meanings with natural example sentences. See `generate_verb_usages.py` for the exact prompt structure.

## How the app works (what to keep vs. adapt)

### Keep as-is (language-agnostic):
- **Flashcard UI** — show verb + pronoun + tense, user taps to reveal conjugated form
- **Settings system** — theme, font size, presets, tense/frequency weights
- **Frequency-weighted random selection** — the `generateNewCard()` algorithm
- **History / back navigation** — card history stack
- **PWA infrastructure** — service worker, manifest, offline support
- **Loading screen** — shown during JS parse on slow devices
- **Explorer view** — searchable verb list with full conjugation tables
- **Debug logging** — SW + app startup logs at `?debug`

### Adapt per language:
- **Pronouns** — Italian has "io, tu, lui/lei, noi, voi, loro". Greek has different forms.
- **Tenses** — each language has different tenses. Map them to internal camelCase keys.
- **Tense display names** — the `tenseDisplayNames` map in `script.js`
- **TTS language** — change `window.frenchSpeechLang = 'fr-FR'` to the target language code
- **Dictation language** — speech recognition language code
- **Verb irregularity detection** — French has a hardcoded `IRREGULAR_VERBS` set. Each language needs its own.
- **Verb categories** — French groups by ending (-er, -ir, -re). Other languages have their own groupings.
- **Reflexive verb handling** — French prepends "se/s'". Italian uses "si". Greek doesn't work this way.
- **Pronoun contractions** — French has "j'" before vowels, "l'" etc. Italian has similar elisions.
- **Presets** — the named presets (Master the Basics, Broaden Horizons, etc.) work for any language since they just set tense/frequency weights

### Language-specific considerations:

**Italian:** Very similar to French. Same 6 persons, similar tense system. `verbecc` library supports Italian (`Conjugator('it')`), which is the same tool used for French. Reflexive verbs work similarly ("si" instead of "se").

**Greek:** Very different. Has different verb aspects (perfective/imperfective), middle/passive voice, and the writing system is non-Latin. TTS and dictation support varies. The `pronouns` would be Greek subject pronouns and the conjugated forms would include them.

**Spanish:** Also similar to French/Italian. `verbecc` supports Spanish. Has vosotros (Spain) vs. ustedes (Latin America) distinction to handle.

## Data sources for conjugation tables

**Option 1: `verbecc` library (recommended for Romance languages)**
```python
from verbecc import Conjugator
cg = Conjugator(lang='fr')  # or 'it', 'es', 'pt', 'ro'
result = cg.conjugate('aller')
# Returns all tenses with all person forms
```
Supports: French, Italian, Spanish, Portuguese, Romanian.

**Option 2: Wiktionary scraping**
Good for languages not in verbecc (Greek, German, etc.). Wiktionary has conjugation tables for most verbs in most languages.

**Option 3: LLM generation**
Use GPT-4 / Claude to generate conjugation tables. Less reliable for rare verbs — always verify a sample. Best used as a supplement, not primary source.

**Option 4: Existing datasets**
Check for open-source conjugation databases for your target language before generating from scratch.

## Frequency data

Verb frequency tiers are essential — without them, users get overwhelmed by rare verbs. Sources:

- **Subtitle corpora** (OpenSubtitles) — real spoken language frequency. We used this for French.
- **Word frequency lists** — many languages have published frequency lists (Wiktionary, Hermit Dave's lists, etc.)
- **LLM ranking** — ask an LLM to rank verbs by frequency as a quick approximation. Less accurate but fast.

Assign exclusive tiers: top20 (20 verbs), top50 (next 30), top100 (next 50), top500 (next 400), top1000 (next 500+), rare (everything else).

## Build pipeline for a new language

1. **Get a verb list** with infinitives and English translations (500-2000 verbs to start)
2. **Get conjugation tables** for each verb in each tense (via verbecc, scraping, or LLM)
3. **Assign frequency tiers** based on corpus data or LLM ranking
4. **Format as `verbs.full.js`** matching the structure above
5. **Compress** with `compress_large_js_objects.py` → `verbs.full.generated.js`
6. **Generate usage nuggets** via LLM → `verb_usages.js`
7. **Adapt `index.html` and `script.js`** — pronouns, tenses, TTS/dictation language codes, display names
8. **Run `build.py`** to produce the standalone app

## Lessons learned

1. **Start with ~500 common verbs, not 7,000.** The rare verbs add bulk but most users never see them. Get the top 500 right first.

2. **Frequency weighting is the killer feature.** Without it, users see "abjurer" as often as "aller" and quit. The weighted presets (Master the Basics = top20 heavily weighted) make the app actually usable for beginners.

3. **Usage nuggets make a huge difference.** Raw conjugation drilling is boring. The example sentences showing real-world usage ("prendre le bus" vs "prendre un cafe") transform the learning experience.

4. **The single-file build is important for PWA reliability.** Fewer network requests = fewer failure points on mobile. The gzip+base64 compression of verb data (`compress_large_js_objects.py`) keeps the file manageable (~3MB) despite containing thousands of verbs.

5. **Service worker strategy matters.** We went through network-first (caused 10s+ splash hangs on mobile) before landing on stale-while-revalidate (instant open, background refresh). For an offline-first app, always use cache-first.

6. **TTS and dictation are platform-dependent.** Not all languages have good voices on all devices. iOS Safari's speech recognition is limited. Test on actual devices early. The voice selection dropdown in settings lets users pick the best available voice.

7. **Hand-curated overrides are necessary.** No automated source gets everything right. The `verb_overrides.json` pattern (a small JSON of corrections applied on top of generated data) is a good approach — it separates generated data from manual fixes.

8. **The verb data is the hardest part.** Getting correct conjugation tables for thousands of verbs, with proper handling of irregulars, reflexives, and compound tenses, is where most of the effort goes. The app UI is relatively straightforward.

9. **Pronouns in the conjugated form, not separate.** Displaying "je vais" rather than prompting the pronoun separately and showing "vais" is more natural and teaches the full form as it's actually spoken.

10. **Font scaling via CSS custom property.** Use `calc(Xrem * var(--font-scale, 1))` rather than `em` units or `font-size` on a container. The custom property approach scales exactly the elements you want without cascade side effects.
