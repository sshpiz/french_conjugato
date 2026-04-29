import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SOURCE_FILES = [
  'js/verbs.full.generated.js',
  'verb_frames.french_320.js',
  'verb_frames.french_topic_expansion.js',
  'js/pronounFillRows.js',
];

const FRAME_JSON_OUT = 'verb_frames.french_passe_compose.generated.json';
const FRAME_JS_OUT = 'verb_frames.french_passe_compose.js';
const PRONOUN_JSON_OUT = 'js/pronounFillRows.passeCompose.generated.json';
const PRONOUN_JS_OUT = 'js/pronounFillRows.passeCompose.js';

const ctx = { window: {}, console };
vm.createContext(ctx);
for (const file of SOURCE_FILES) {
  vm.runInContext(fs.readFileSync(path.join(__dirname, file), 'utf8'), ctx, { filename: file });
}

const verbs = vm.runInContext('verbs', ctx);
const tenses = vm.runInContext('tenses', ctx);
const verbSet = new Set(verbs.map((verb) => verb.infinitive));
const verbByInfinitive = new Map(verbs.map((verb) => [verb.infinitive, verb]));
const sourceFrames = Array.isArray(ctx.window.verbFrames) ? ctx.window.verbFrames : [];
const sourcePronounRows = Array.isArray(ctx.window.pronounFillRows) ? ctx.window.pronounFillRows : [];

const PRONOUN_KEYS = ['je', 'tu', 'il/elle/on', 'nous', 'vous', 'ils/elles'];
const PREPOSITION_TAILS = new Set(['a', 'à', 'de', "d'", 'd’', 'au', 'aux', 'du', 'des']);
const VOWELISH = /^[aeiouhàâäéèêëîïôöùûüœ]/i;
const ETRE_AUX = {
  je: 'suis',
  tu: 'es',
  'il/elle/on': 'est',
  nous: 'sommes',
  vous: 'êtes',
  'ils/elles': 'sont',
};
const REFLEXIVE_PREFIX = {
  je: 'me',
  tu: "t'",
  'il/elle/on': "s'",
  nous: 'nous',
  vous: 'vous',
  'ils/elles': 'se',
};
const PC_AUXILIARIES = new Set(['ai', 'as', 'a', 'avons', 'avez', 'ont', 'suis', 'es', 'est', 'sommes', 'êtes', 'sont', "s'est", "m'est", "t'est"]);

const DIRECT_OBJECT_FEATURES = new Map([
  ['la facture', { gender: 'f', number: 's' }],
  ['les messages', { gender: 'm', number: 'p' }],
  ['les billets', { gender: 'm', number: 'p' }],
  ['la règle', { gender: 'f', number: 's' }],
  ['le chargeur', { gender: 'm', number: 's' }],
  ['la vérité', { gender: 'f', number: 's' }],
  ["l'idée", { gender: 'f', number: 's' }],
  ["l’histoire", { gender: 'f', number: 's' }],
  ["l'histoire", { gender: 'f', number: 's' }],
  ['les résultats', { gender: 'm', number: 'p' }],
  ['le match', { gender: 'm', number: 's' }],
  ['la sortie', { gender: 'f', number: 's' }],
  ['le dossier', { gender: 'm', number: 's' }],
  ['les épisodes', { gender: 'm', number: 'p' }],
  ['alex', { gender: 'm', number: 's' }],
  ['les photos', { gender: 'f', number: 'p' }],
  ['le passeport', { gender: 'm', number: 's' }],
  ['la guitare', { gender: 'f', number: 's' }],
  ['les invitations', { gender: 'f', number: 'p' }],
  ['la facture -> les clients', { gender: 'f', number: 's' }],
  ['les plans', { gender: 'm', number: 'p' }],
  ['les plans -> nos voisins', { gender: 'm', number: 'p' }],
  ['la bande-annonce', { gender: 'f', number: 's' }],
]);

function normalize(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[’`]/g, "'");
}

function stripTerminalPunctuation(value) {
  return String(value || '').trim().replace(/[.!?…]+$/u, '');
}

function stripSubject(conjugated, pronounKey) {
  const text = String(conjugated || '').trim();
  const patterns = {
    je: /^(?:je\s+|j['’])/i,
    tu: /^tu\s+/i,
    'il/elle/on': /^(?:il|elle|on)\s+/i,
    nous: /^nous\s+/i,
    vous: /^vous\s+/i,
    'ils/elles': /^(?:ils|elles)\s+/i,
  };
  return text.replace(patterns[pronounKey] || /^\S+\s+/, '').trim();
}

function splitAuxTail(conjugatedTail) {
  const parts = String(conjugatedTail || '').trim().split(/\s+/).filter(Boolean);
  return {
    aux: parts[0] || '',
    participle: parts.slice(1).join(' '),
  };
}

function inferPronounFromTextBeforeAnswer(fullAnswer, answer) {
  const haystack = String(fullAnswer || '');
  const needle = String(answer || '').trim();
  const index = needle ? normalize(haystack).indexOf(normalize(needle)) : -1;
  const before = index >= 0 ? haystack.slice(0, index) : haystack;
  const beforeNorm = normalize(before);
  if (/(?:^|\s|,|;)j['’]?$/.test(beforeNorm) || /(?:^|\s|,|;)je\s*$/.test(beforeNorm)) return 'je';
  if (/(?:^|\s|,|;)tu\s*$/.test(beforeNorm)) return 'tu';
  if (/(?:^|\s|,|;)nous\s*$/.test(beforeNorm)) return 'nous';
  if (/(?:^|\s|,|;)vous\s*$/.test(beforeNorm)) return 'vous';
  if (/(?:^|\s|,|;)(ils|elles)\s*$/.test(beforeNorm)) return 'ils/elles';
  if (/(?:^|\s|,|;)(il|elle|on|ça|ce|c['’])\s*$/.test(beforeNorm)) return 'il/elle/on';
  return '';
}

function inferPronounKey(row, presentCore) {
  const presentTable = tenses.present?.[row.verb];
  if (!presentTable) return '';
  const matches = PRONOUN_KEYS.filter((key) =>
    normalize(stripSubject(presentTable[key], key)) === normalize(presentCore)
  );
  if (!matches.length) return '';
  const contextual = inferPronounFromTextBeforeAnswer(row.full_answer || row.question, presentCore);
  if (contextual && matches.includes(contextual)) return contextual;
  if (matches.includes('il/elle/on') && !/^(?:j['’]?|je|tu|nous|vous|ils|elles)\b/i.test(String(row.full_answer || '').trim())) {
    return 'il/elle/on';
  }
  return matches[0];
}

function subjectFeatures(fullAnswer) {
  const text = normalize(fullAnswer).replace(/[.!?…]+$/u, '');
  if (/^elles\b/.test(text)) return { gender: 'f', number: 'p' };
  if (/^(ils|les|des)\b/.test(text)) return { gender: 'm', number: 'p' };
  if (/^ses cheveux\b/.test(text)) return { gender: 'm', number: 'p' };
  if (/^(nous|vous)\b/.test(text)) return { gender: 'm', number: 'p' };
  if (/^(elle|la|une|cette)\b/.test(text)) return { gender: 'f', number: 's' };
  return { gender: 'm', number: 's' };
}

function agreeParticiple(participle, features = {}) {
  let value = String(participle || '').trim();
  if (!value || /[()]|\/|-$/.test(value)) return value;
  if (features.gender === 'f' && !value.endsWith('e')) value += 'e';
  if (features.number === 'p' && !value.endsWith('s')) value += 's';
  return value;
}

function findReflexivePrefix(fullAnswer, presentCore) {
  const escaped = String(presentCore || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const text = String(fullAnswer || '');
  const directMatch = text.match(
    new RegExp(`(?:^|[\\s,;:])((?:me\\s+|m['’]|te\\s+|t['’]|se\\s+|s['’])${escaped}\\b)`, 'i')
  );
  if (directMatch) return directMatch[1];

  const pluralMatch = text.match(new RegExp(`\\b(nous|vous)\\s+((?:nous|vous)\\s+)${escaped}\\b`, 'i'));
  return pluralMatch ? pluralMatch[0].replace(/^(nous|vous)\s+/i, '') : '';
}

function makeQuestion(fullAnswer, answer, hasParticleTail) {
  const blank = hasParticleTail ? '____ ____' : '____';
  const escaped = String(answer || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return String(fullAnswer || '').replace(new RegExp(escaped), blank);
}

function getTextBeforeAnswer(fullAnswer, answer) {
  const haystack = String(fullAnswer || '');
  const needle = String(answer || '').trim();
  if (!needle) return '';
  const normalizedHaystack = normalize(haystack);
  const normalizedNeedle = normalize(needle);
  const normalizedIndex = normalizedHaystack.indexOf(normalizedNeedle);
  if (normalizedIndex < 0) return '';
  return haystack.slice(0, normalizedIndex);
}

function hasAuxiliaryImmediatelyBeforeAnswer(row) {
  const before = normalize(getTextBeforeAnswer(row.full_answer || row.question, row.answer));
  const previousToken = before.split(/\s+/).filter(Boolean).pop() || '';
  return PC_AUXILIARIES.has(previousToken);
}

function isNegatedAroundAnswer(row, presentCore) {
  const text = normalize(`${row.question || ''} ${row.full_answer || ''}`);
  const escapedCore = String(presentCore || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`\\bne\\s+(?:\\S+\\s+){0,2}(?:____|${escapedCore})\\s+(?:pas|plus|jamais)\\b|\\bn['’](?:____|${escapedCore})\\s+(?:pas|plus|jamais)\\b|^\\s*n['’]|^\\s*ne\\b`, 'i').test(text);
}

function isUnsafePasseComposeSource(row, presentCore) {
  const fullAnswer = String(row.full_answer || '');
  const combined = `${row.question || ''} ${fullAnswer} ${row.note || ''}`;
  if (/,\s*$/.test(getTextBeforeAnswer(fullAnswer || row.question, row.answer))) return true;
  if (hasAuxiliaryImmediatelyBeforeAnswer(row)) return true;
  if (isNegatedAroundAnswer(row, presentCore)) return true;
  if (/\bdemain\b|\bdans\s+(?:cinq|5)\s+minutes\b/i.test(combined)) return true;
  if (/\bse\s+(?:courir|parler)\b/i.test(combined)) return true;
  if (row.verb === 'aller') {
    if (/\b(?:me|te|lui|leur)\s+(?:va|vont)\b/i.test(fullAnswer)) return true;
    if (/\b(?:vais|vas|va|allons|allez|vont)\s+(?:très\s+)?(?:bien|mal)\b/i.test(fullAnswer)) return true;
    if (/aller\s+(?:à|a)\s+quelqu/i.test(String(row.note || ''))) return true;
  }
  return false;
}

function polishPasseComposeSentence(text) {
  return String(text || '')
    .replace(/\bJe ai\b/g, "J'ai")
    .replace(/\bje ai\b/g, "j'ai")
    .replace(/\s+\./g, '.');
}

function createPasseComposeFrame(row) {
  if (!row || row.tense !== 'present' || !verbSet.has(row.verb)) return null;
  if (/^\s*____/.test(row.question || '')) return null;
  const answerTokens = String(row.answer || '').trim().split(/\s+/).filter(Boolean);
  if (!answerTokens.length) return null;
  const presentCore = answerTokens[0];
  if (isUnsafePasseComposeSource(row, presentCore)) return null;
  const particleTail = answerTokens.slice(1).join(' ');
  const pronounKey = inferPronounKey(row, presentCore);
  if (!pronounKey) return null;
  const pcFullConjugated = tenses.passeCompose?.[row.verb]?.[pronounKey];
  if (!pcFullConjugated) return null;
  const pcTail = stripSubject(pcFullConjugated, pronounKey);
  if (!pcTail) return null;

  const reflexiveSegment = findReflexivePrefix(row.full_answer, presentCore);
  let pcVerbPhrase = pcTail;
  let fullAnswer = '';
  if (reflexiveSegment) {
    const { participle } = splitAuxTail(pcTail);
    if (!participle) return null;
    const clitic = REFLEXIVE_PREFIX[pronounKey] || "s'";
    const aux = ETRE_AUX[pronounKey] || 'est';
    const agreed = agreeParticiple(participle, subjectFeatures(row.full_answer));
    pcVerbPhrase = `${clitic}${clitic.endsWith("'") ? '' : ' '}${aux} ${agreed}`.replace(/\s+/g, ' ').replace(/'\s+/g, "'");
    const presentSegment = reflexiveSegment + (particleTail ? ` ${particleTail}` : '');
    const replacement = pcVerbPhrase + (particleTail ? ` ${particleTail}` : '');
    fullAnswer = String(row.full_answer || '').replace(presentSegment, replacement);
  } else {
    const replacement = pcTail + (particleTail ? ` ${particleTail}` : '');
    fullAnswer = String(row.full_answer || '').replace(String(row.answer || '').trim(), replacement);
    pcVerbPhrase = replacement;
  }

  if (!fullAnswer || fullAnswer === row.full_answer) return null;
  fullAnswer = polishPasseComposeSentence(fullAnswer);
  const question = makeQuestion(fullAnswer, pcVerbPhrase, !!particleTail);
  return {
    ...row,
    frame_id: `${row.frame_id || `${row.verb}_frame`}_pc`,
    tense: 'passeCompose',
    question,
    answer: pcVerbPhrase,
    full_answer: fullAnswer,
    source: `${row.source || 'generated'}:passe_compose`,
    meaning_en: '',
    note: `${row.note || row.frame_type || 'frame'}; generated passé composé`,
  };
}

function inferDirectObjectFeatures(row) {
  const target = normalize(String(row.target_fr || '').split('->')[0].trim());
  if (DIRECT_OBJECT_FEATURES.has(target)) return DIRECT_OBJECT_FEATURES.get(target);
  if (DIRECT_OBJECT_FEATURES.has(normalize(row.target_fr))) return DIRECT_OBJECT_FEATURES.get(normalize(row.target_fr));
  if (/\bdirect object,\s*feminine singular\b/i.test(row.reason || '')) return { gender: 'f', number: 's' };
  if (/\bdirect object,\s*masculine singular\b/i.test(row.reason || '')) return { gender: 'm', number: 's' };
  if (/\bdirect object,\s*plural\b/i.test(row.reason || '')) return { gender: 'm', number: 'p' };
  return null;
}

function inferPronounRowKey(row) {
  const text = String(row.full_answer || row.question || '').trim();
  if (/^j['’]/i.test(text) || /^je\b/i.test(text)) return 'je';
  if (/^tu\b/i.test(text)) return 'tu';
  if (/^nous\b/i.test(text)) return 'nous';
  if (/^vous\b/i.test(text)) return 'vous';
  if (/^(ils|elles)\b/i.test(text)) return 'ils/elles';
  return 'il/elle/on';
}

function subjectSurface(row, pronounKey) {
  const text = String(row.full_answer || row.question || '').trim();
  const match = text.match(/^(J['’]|Je|Tu|Il|Elle|On|Nous|Vous|Ils|Elles)\b/i);
  if (match) return match[1];
  return {
    je: 'Je',
    tu: 'Tu',
    'il/elle/on': 'Il',
    nous: 'Nous',
    vous: 'Vous',
    'ils/elles': 'Ils',
  }[pronounKey] || 'Il';
}

function elideFinalDirectObjectPronoun(answer, aux) {
  const parts = String(answer || '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length || !VOWELISH.test(aux || '')) return { answer: String(answer || '').trim(), elided: false };
  const last = parts[parts.length - 1];
  if (last === 'le' || last === 'la') {
    parts[parts.length - 1] = "l'";
    return { answer: parts.join(' '), elided: true };
  }
  return { answer: parts.join(' '), elided: false };
}

function pronounHasPreposedDirectObject(row) {
  const answer = String(row.answer || '').trim();
  if (row.family === 'direct_object') return true;
  if (row.family === 'multi_clitic') {
    return /\b(?:le|la|les)\b/.test(answer);
  }
  return false;
}

function createPasseComposePronounRow(row) {
  if (!row || row.tense !== 'present' || !verbSet.has(row.verb)) return null;
  const pronounKey = inferPronounRowKey(row);
  const pcFullConjugated = tenses.passeCompose?.[row.verb]?.[pronounKey];
  if (!pcFullConjugated) return null;
  const pcTailRaw = stripSubject(pcFullConjugated, pronounKey);
  const { aux, participle } = splitAuxTail(pcTailRaw);
  if (!aux || !participle) return null;
  const adjusted = elideFinalDirectObjectPronoun(row.answer, aux);
  const features = pronounHasPreposedDirectObject(row) ? inferDirectObjectFeatures(row) : null;
  const agreedParticiple = features ? agreeParticiple(participle, features) : participle;
  const pcTail = `${aux} ${agreedParticiple}`;
  const subject = subjectSurface(row, pronounKey);
  const subjectForQuestion = /^je$/i.test(subject) && VOWELISH.test(adjusted.answer) ? "J'" : subject;
  const spacer = subjectForQuestion.endsWith("'") ? '' : ' ';
  const fullAnswer = `${subjectForQuestion}${spacer}${adjusted.answer} ${pcTail}.`
    .replace(/\s+/g, ' ')
    .replace(/'\s+/g, "'")
    .replace(/\s+\./g, '.');
  const question = `${subjectForQuestion}${spacer}____ ${pcTail}.`
    .replace(/\s+/g, ' ')
    .replace(/'\s+/g, "'")
    .replace(/\s+\./g, '.');
  return {
    ...row,
    id: `${row.id}_pc`,
    tense: 'passeCompose',
    question,
    answer: adjusted.answer,
    full_answer: fullAnswer,
    source: `${row.source || 'generated'}:passe_compose`,
    meaning_en: '',
    reason: `${row.reason || ''}; generated passé composé`.replace(/^;\s*/, ''),
  };
}

function loadExistingMeanings(relativePath, idKey) {
  try {
    const rows = JSON.parse(fs.readFileSync(path.join(__dirname, relativePath), 'utf8'));
    if (!Array.isArray(rows)) return new Map();
    return new Map(rows
      .map((row) => [String(row?.[idKey] || '').trim(), String(row?.meaning_en || '').trim()])
      .filter(([id, meaning]) => id && meaning));
  } catch {
    return new Map();
  }
}

function preserveExistingMeanings(rows, relativePath, idKey) {
  let existingRows = [];
  try {
    existingRows = JSON.parse(fs.readFileSync(path.join(__dirname, relativePath), 'utf8'));
  } catch {
    existingRows = [];
  }
  const existingById = new Map(Array.isArray(existingRows)
    ? existingRows.map((row) => [String(row?.[idKey] || '').trim(), row]).filter(([id]) => id)
    : []);
  const existing = loadExistingMeanings(relativePath, idKey);
  return rows.map((row) => {
    const id = String(row?.[idKey] || '').trim();
    const existingRow = existingById.get(id);
    if (existingRow && String(existingRow.source || '').includes('passe_compose_content')) {
      return { ...row, ...existingRow };
    }
    const meaning = existing.get(id);
    return meaning ? { ...row, meaning_en: meaning } : row;
  });
}

const frameRows = preserveExistingMeanings(sourceFrames
  .map(createPasseComposeFrame)
  .filter(Boolean), FRAME_JSON_OUT, 'frame_id');
const pronounRows = preserveExistingMeanings(sourcePronounRows
  .map(createPasseComposePronounRow)
  .filter(Boolean), PRONOUN_JSON_OUT, 'id');

fs.writeFileSync(path.join(__dirname, FRAME_JSON_OUT), `${JSON.stringify(frameRows, null, 2)}\n`, 'utf8');
fs.writeFileSync(
  path.join(__dirname, FRAME_JS_OUT),
  `window.verbFrames = [\n  ...((Array.isArray(window.verbFrames) && window.verbFrames) || []),\n  ...${JSON.stringify(frameRows, null, 2)}\n];\n`,
  'utf8'
);
fs.writeFileSync(path.join(__dirname, PRONOUN_JSON_OUT), `${JSON.stringify(pronounRows, null, 2)}\n`, 'utf8');
fs.writeFileSync(
  path.join(__dirname, PRONOUN_JS_OUT),
  `(function initPronounFillRowsPasseCompose() {\n  const rows = ${JSON.stringify(pronounRows, null, 2)};\n  window.pronounFillRows = [\n    ...((Array.isArray(window.pronounFillRows) && window.pronounFillRows) || []),\n    ...rows,\n  ];\n})();\n`,
  'utf8'
);

const reflexiveCount = frameRows.filter((row) => /\bs['’]|(?:^|\s)se\s/.test(row.full_answer)).length;
const etreCount = frameRows.filter((row) => /\b(?:suis|es|est|sommes|êtes|sont)\s+\S+/.test(row.answer)).length;
console.log(JSON.stringify({
  generatedFrameRows: frameRows.length,
  generatedPronounRows: pronounRows.length,
  reflexivePasseComposeFrameRows: reflexiveCount,
  etreAuxiliaryFrameRows: etreCount,
  frameJson: FRAME_JSON_OUT,
  frameJs: FRAME_JS_OUT,
  pronounJson: PRONOUN_JSON_OUT,
  pronounJs: PRONOUN_JS_OUT,
}, null, 2));
