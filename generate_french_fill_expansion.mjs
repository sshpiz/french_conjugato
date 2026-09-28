import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));

const readText = (relativePath) => fs.readFileSync(path.join(ROOT, relativePath), 'utf8');

function extractConstLiteral(source, name) {
  const marker = `const ${name} =`;
  const start = source.indexOf(marker);
  if (start < 0) throw new Error(`Could not find ${name}`);
  let index = start + marker.length;
  while (/\s/.test(source[index])) index += 1;
  const opener = source[index];
  const closer = opener === '[' ? ']' : opener === '{' ? '}' : null;
  if (!closer) throw new Error(`Unexpected literal opener for ${name}: ${opener}`);

  let depth = 0;
  let quote = '';
  let escaped = false;
  let lineComment = false;
  let blockComment = false;
  for (; index < source.length; index += 1) {
    const char = source[index];
    const next = source[index + 1];

    if (lineComment) {
      if (char === '\n') lineComment = false;
      continue;
    }
    if (blockComment) {
      if (char === '*' && next === '/') {
        blockComment = false;
        index += 1;
      }
      continue;
    }
    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === quote) {
        quote = '';
      }
      continue;
    }
    if (char === '/' && next === '/') {
      lineComment = true;
      index += 1;
      continue;
    }
    if (char === '/' && next === '*') {
      blockComment = true;
      index += 1;
      continue;
    }
    if (char === '"' || char === "'" || char === '`') {
      quote = char;
      continue;
    }
    if (char === opener) depth += 1;
    if (char === closer) {
      depth -= 1;
      if (depth === 0) return source.slice(start + marker.length, index + 1).trim();
    }
  }
  throw new Error(`Unclosed literal for ${name}`);
}

function loadRuntimeData() {
  const source = readText('js/verbs.full.generated.js') + '\nglobalThis.__data = { verbs, tenses };';
  const sandbox = {};
  vm.createContext(sandbox);
  vm.runInContext(source, sandbox);
  return sandbox.__data;
}

function loadTopicDefinitions() {
  const source = readText('js/script.js');
  const literal = extractConstLiteral(source, 'BUILTIN_VERB_SET_DEFINITIONS');
  const sandbox = {};
  vm.createContext(sandbox);
  vm.runInContext(`globalThis.__sets = ${literal};`, sandbox);
  return sandbox.__sets;
}

function stripSubject(fullForm, pronounKey) {
  const value = String(fullForm || '').trim();
  const pronoun = String(pronounKey || '').trim();
  if (!value) return '';
  if (/^j['’]/i.test(value)) return value.slice(2);
  const subject = pronoun.split('/')[0].trim();
  const subjectPattern = new RegExp(`^${subject.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s+`, 'i');
  return value.replace(subjectPattern, '').trim();
}

function normalizeApostrophes(value) {
  return String(value || '').replace(/[’`]/g, "'");
}

function isLetter(char) {
  return !!char && /\p{L}/u.test(char);
}

function replaceFirstAnswer(exampleFr, answer) {
  const source = String(exampleFr || '');
  const wanted = normalizeApostrophes(answer).toLowerCase();
  const haystack = normalizeApostrophes(source).toLowerCase();
  if (!source || !wanted) return null;

  let index = haystack.indexOf(wanted);
  while (index >= 0) {
    const before = haystack[index - 1] || '';
    const after = haystack[index + wanted.length] || '';
    if (!isLetter(before) && !isLetter(after)) {
      return {
        question: `${source.slice(0, index)}____${source.slice(index + wanted.length)}`,
        answer: source.slice(index, index + wanted.length),
      };
    }
    index = haystack.indexOf(wanted, index + 1);
  }
  return null;
}

function getPresentAnswerCandidates(tenses, verb) {
  const present = tenses.present?.[verb];
  if (!present) return [];
  return Object.entries(present)
    .map(([pronoun, fullForm]) => ({
      pronoun,
      answer: stripSubject(fullForm, pronoun),
    }))
    .filter((entry) => entry.answer && entry.answer.length >= 2)
    .sort((a, b) => b.answer.length - a.answer.length);
}

function slugify(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function makeFrame({ topic, topicId, verb, usage, tenses, index, source, isTopical = false }) {
  const exampleFr = String(usage.example_fr || '').trim();
  const exampleEn = String(usage.example_en || usage.meaning_en || '').trim();
  if (!exampleFr || !exampleEn) return null;

  for (const candidate of getPresentAnswerCandidates(tenses, verb)) {
    const replacement = replaceFirstAnswer(exampleFr, candidate.answer);
    if (!replacement) continue;
    return {
      frame_id: `topic_usage_${slugify(topicId)}_${slugify(verb)}_${String(index).padStart(3, '0')}`,
      verb,
      type: 'frame',
      tense: 'present',
      question: replacement.question,
      answer: replacement.answer,
      full_answer: exampleFr,
      frame_type: 'topic_phrase',
      source,
      meaning_en: exampleEn,
      category_id: isTopical ? topicId : '',
      category_name: isTopical ? topic : '',
      note: usage.pattern || 'topical phrase cloze',
    };
  }
  return null;
}

const manualMusicConsumerUsages = [
  { verb: 'écouter', pattern: 'écouter un morceau en boucle', example_fr: 'J’écoute ce morceau en boucle depuis ce matin.', example_en: 'I have been listening to this track on repeat since this morning.' },
  { verb: 'zapper', pattern: 'zapper une chanson', example_fr: 'On zappe cette chanson parce que tout le monde la connaît trop.', example_en: 'We skip this song because everyone knows it too well.' },
  { verb: 'partager', pattern: 'partager une playlist', example_fr: 'Elle partage une playlist avec le groupe avant le trajet.', example_en: 'She shares a playlist with the group before the trip.' },
  { verb: 'découvrir', pattern: 'découvrir un artiste', example_fr: 'Je découvre un artiste sur une reco et je garde tout l’album.', example_en: 'I discover an artist from a recommendation and save the whole album.' },
  { verb: 'réécouter', pattern: 'réécouter un refrain', example_fr: 'Tu réécoutes le refrain juste pour retrouver cette ligne de basse.', example_en: 'You replay the chorus just to catch that bass line again.' },
  { verb: 'fredonner', pattern: 'fredonner un refrain', example_fr: 'Il fredonne le refrain sans se souvenir du titre.', example_en: 'He hums the chorus without remembering the title.' },
  { verb: 'kiffer', pattern: 'kiffer un son', example_fr: 'On kiffe ce son dès que la batterie entre.', example_en: 'We love this track as soon as the drums come in.' },
  { verb: 'saigner', pattern: 'saigner un album', example_fr: 'Ils saignent le même album tout l’été.', example_en: 'They play the same album to death all summer.' },
  { verb: 'monter', pattern: 'monter le son', example_fr: 'Je monte le son quand le refrain arrive.', example_en: 'I turn the sound up when the chorus comes in.' },
  { verb: 'sortir', pattern: 'sortir un single', example_fr: 'Le groupe sort un single plus léger avant l’album.', example_en: 'The band releases a lighter single before the album.' },
  { verb: 'adorer', pattern: 'adorer une chanson', example_fr: 'Elle adore cette chanson même si les paroles sont nulles.', example_en: 'She loves this song even though the lyrics are awful.' },
  { verb: 'suivre', pattern: 'suivre un artiste', example_fr: 'Nous suivons cet artiste depuis son premier EP.', example_en: 'We have followed this artist since their first EP.' },
];

const { verbs, tenses } = loadRuntimeData();
const knownVerbs = new Set(verbs.map((verb) => verb.infinitive));
const topics = loadTopicDefinitions();
const globalUsages = JSON.parse(readText('verb_usages.json'));
const globalUsagesByVerb = new Map();
for (const usage of globalUsages) {
  const verb = String(usage.verb || '').trim();
  if (!verb) continue;
  if (!globalUsagesByVerb.has(verb)) globalUsagesByVerb.set(verb, []);
  globalUsagesByVerb.get(verb).push(usage);
}

const existingFrames = JSON.parse(readText('verb_frames.french_320.generated.json'));
const existingKeys = new Set(existingFrames.map((row) => `${row.verb}::${row.full_answer}`));
const frames = [];
const seenKeys = new Set(existingKeys);

for (const topic of topics) {
  const topicName = topic.name;
  const topicId = topic.id;
  const usageCandidates = [];

  Object.entries(topic.topicUsages || {}).forEach(([verb, entries]) => {
    for (const usage of entries || []) {
      usageCandidates.push({ verb, usage, source: 'topic_usage_expansion', isTopical: true });
    }
  });

  if (topicName === 'Music') {
    manualMusicConsumerUsages.forEach((usage) => {
      usageCandidates.push({ verb: usage.verb, usage, source: 'music_consumer_expansion', isTopical: true });
    });
  }

  for (const verb of topic.verbs || []) {
    for (const usage of globalUsagesByVerb.get(verb) || []) {
      usageCandidates.push({ verb, usage, source: 'global_usage_expansion', isTopical: false });
    }
  }

  let localIndex = 1;
  for (const candidate of usageCandidates) {
    if (!knownVerbs.has(candidate.verb)) continue;
    const frame = makeFrame({
      topic: topicName,
      topicId,
      verb: candidate.verb,
      usage: candidate.usage,
      tenses,
      index: localIndex,
      source: candidate.source,
      isTopical: !!candidate.isTopical,
    });
    localIndex += 1;
    if (!frame) continue;
    const key = `${frame.verb}::${frame.full_answer}`;
    if (seenKeys.has(key)) continue;
    seenKeys.add(key);
    frames.push(frame);
  }
}

frames.sort((a, b) => (
  a.category_name.localeCompare(b.category_name)
  || a.verb.localeCompare(b.verb)
  || a.frame_id.localeCompare(b.frame_id)
));

const jsonPath = path.join(ROOT, 'verb_frames.french_topic_expansion.generated.json');
const jsPath = path.join(ROOT, 'verb_frames.french_topic_expansion.js');
fs.writeFileSync(jsonPath, `${JSON.stringify(frames, null, 2)}\n`, 'utf8');
fs.writeFileSync(
  jsPath,
  `window.verbFrames = [\n  ...((Array.isArray(window.verbFrames) && window.verbFrames) || []),\n  ...${JSON.stringify(frames, null, 2)}\n];\n`,
  'utf8'
);

const byTopic = frames.reduce((acc, frame) => {
  acc[frame.category_name] = (acc[frame.category_name] || 0) + 1;
  return acc;
}, {});
const uniqueVerbs = new Set(frames.map((frame) => frame.verb));
console.log(JSON.stringify({
  supplementalCards: frames.length,
  supplementalUniqueVerbs: uniqueVerbs.size,
  byTopic,
}, null, 2));
