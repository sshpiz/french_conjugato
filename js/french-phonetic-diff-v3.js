/**
 * french-phonetic-diff-v3.js
 *
 * A small client-side utility for French-aware dictation comparison.
 *
 * Main goals:
 * - Convert French text to IPA-ish phonetics using eSpeak-ng WASM when available.
 * - Compare expected/correct text with an attempt/STT transcript.
 * - Use phonetics as the truth layer for learner-facing diffs; spelling diffs only explain/debug.
 * - Reduce false negatives caused by STT spelling variants: allé vs aller, etc.
 * - Detect likely elision / liaison-related mismatch zones.
 * - Render a calm learner-facing diff: mostly plain text, only problem areas marked.
 * - Work with no backend. After dependencies are bundled/cached by the app/PWA,
 *   it can run offline.
 *
 * This file is deliberately framework-free and can be imported by any app:
 *
 *   import { FrenchPhoneticDiff } from './french-phonetic-diff.js';
 *   const fpd = new FrenchPhoneticDiff();
 *   await fpd.init();
 *   const result = await fpd.compareTexts(expected, attempt);
 *
 * IMPORTANT PRODUCT HONESTY:
 * This is not acoustic pronunciation grading. It compares the expected text to
 * the text produced by STT, optionally via phonetics. That makes it a good
 * “French-aware dictation/STT match” tool, not a raw mic-to-IPA analyzer.
 */

const DEFAULTS = {
  language: "fr",

  // For quick browser demos. In production, prefer bundling this dependency
  // locally and pass that local URL instead, e.g. '/vendor/espeak-ng.js'.
  espeakUrl: "https://cdn.jsdelivr.net/npm/espeak-ng@1.0.2/dist/espeak-ng.js",

  // Try to load eSpeak by default. If it fails, the library still works in
  // degraded text-comparison mode.
  useEspeak: true,

  // If false, compareTexts() skips phonemization even if eSpeak is loaded.
  // Useful for debugging or for very low-end devices.
  preferPhoneticScore: true,

  // v3 behavior: learner-facing differences should be driven by the IPA/phonetic
  // comparison first, not by raw spelling. Raw text diff remains available for
  // debugging and explanations. If phonetics cannot load, the library falls
  // back to the older text-diff behavior.
  diffMode: "phonetic-first",

  // localStorage cache for text -> phonetics.
  cache: {
    enabled: true,
    key: "FrenchPhoneticDiff:v1:phonetics",
    maxEntries: 2500
  },

  // Manual phonetic overrides. Useful if eSpeak has one bad output you want to
  // patch locally without forking the engine.
  overrides: {
    enabled: true,
    key: "FrenchPhoneticDiff:v1:overrides"
  },

  // Used by compareTexts() when returning a verdict.
  thresholds: {
    veryClose: 92,
    close: 80
  },

  // Dictation-mode behavior: when the phonetic forms match perfectly or
  // almost perfectly, treat textual differences as STT/spelling artifacts.
  // Example: “Je suis allé” vs “Je suis aller”.
  // This prevents false liaison/elision warnings caused only by spelling.
  suppressTextDiffWhenPhoneticsMatch: true,
  phoneticEquivalentThreshold: 99
};

/** Deep-ish merge for this simple options object. */
function mergeOptions(base, patch = {}) {
  const out = structuredCloneIfAvailable(base);
  for (const [key, value] of Object.entries(patch || {})) {
    if (value && typeof value === "object" && !Array.isArray(value) && out[key]) {
      out[key] = { ...out[key], ...value };
    } else {
      out[key] = value;
    }
  }
  return out;
}

function structuredCloneIfAvailable(x) {
  if (typeof structuredClone === "function") return structuredClone(x);
  return JSON.parse(JSON.stringify(x));
}

function safeJsonParse(s, fallback) {
  try { return JSON.parse(s); } catch { return fallback; }
}

function canUseLocalStorage() {
  try {
    const k = "__FrenchPhoneticDiff_test__";
    localStorage.setItem(k, "1");
    localStorage.removeItem(k);
    return true;
  } catch {
    return false;
  }
}

/** Escape user-controlled text before putting it into generated HTML. */
export function escapeHtml(s) {
  return String(s ?? "").replace(/[&<>"']/g, ch => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  }[ch]));
}

export function normalizeBasic(s) {
  return String(s ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip accents for text matching
    .replace(/[’]/g, "'")
    .trim();
}

export function normalizeWord(w) {
  return normalizeBasic(w)
    .replace(/[^a-z'\s-]/g, "")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Tokenize French text into rough word tokens.
 * Keeps apostrophe forms as one token: j’ai, d’eau, l’homme.
 */
export function tokenizeFrenchWords(s) {
  return String(s ?? "").match(/[\p{L}]+(?:[’'][\p{L}]+)*/gu) || [];
}

/** Classic Levenshtein edit distance. Good enough for short sentences. */
export function levenshtein(a, b) {
  const aa = String(a ?? "");
  const bb = String(b ?? "");
  const dp = Array.from({ length: aa.length + 1 }, () => Array(bb.length + 1).fill(0));
  for (let i = 0; i <= aa.length; i++) dp[i][0] = i;
  for (let j = 0; j <= bb.length; j++) dp[0][j] = j;

  for (let i = 1; i <= aa.length; i++) {
    for (let j = 1; j <= bb.length; j++) {
      const cost = aa[i - 1] === bb[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[aa.length][bb.length];
}

export function scoreStrings(a, b) {
  const aa = String(a ?? "");
  const bb = String(b ?? "");
  const maxLen = Math.max(aa.length, bb.length, 1);
  const raw = 1 - levenshtein(aa, bb) / maxLen;
  return Math.max(0, Math.min(100, Math.round(raw * 100)));
}

/**
 * Simplify IPA for comparison.
 * We remove stress, separators, punctuation, and whitespace. This is a scoring
 * convenience, not linguistics purity.
 */
export function simplifyPhonetics(ipa) {
  return String(ipa ?? "")
    .normalize("NFC")
    .replace(/[ˈˌː\-\s‿|.,;:!?]/g, "")
    .replace(/[()\[\]]/g, "")
    .trim();
}

export function comparePhonetics(expectedPhonetics, attemptPhonetics) {
  return {
    score: scoreStrings(simplifyPhonetics(expectedPhonetics), simplifyPhonetics(attemptPhonetics)),
    expectedSimplified: simplifyPhonetics(expectedPhonetics),
    attemptSimplified: simplifyPhonetics(attemptPhonetics)
  };
}

/**
 * Character-level alignment for simplified phonetic strings.
 *
 * This is the core v3 idea: the learner-facing diff is decided by IPA/phonetic
 * strings, not spelling. Spelling is only used later to render/explain the
 * phonetic mismatch.
 */
export function alignCharacters(a, b) {
  const aa = String(a ?? "");
  const bb = String(b ?? "");
  const dp = Array.from({ length: aa.length + 1 }, () => Array(bb.length + 1).fill(0));
  const back = Array.from({ length: aa.length + 1 }, () => Array(bb.length + 1).fill(null));

  for (let i = 0; i <= aa.length; i++) { dp[i][0] = i; if (i) back[i][0] = "delete"; }
  for (let j = 0; j <= bb.length; j++) { dp[0][j] = j; if (j) back[0][j] = "insert"; }

  for (let i = 1; i <= aa.length; i++) {
    for (let j = 1; j <= bb.length; j++) {
      const same = aa[i - 1] === bb[j - 1];
      const choices = [
        { cost: dp[i - 1][j - 1] + (same ? 0 : 1), op: same ? "equal" : "replace" },
        { cost: dp[i - 1][j] + 1, op: "delete" },
        { cost: dp[i][j - 1] + 1, op: "insert" }
      ].sort((x, y) => x.cost - y.cost);
      dp[i][j] = choices[0].cost;
      back[i][j] = choices[0].op;
    }
  }

  const ops = [];
  let i = aa.length;
  let j = bb.length;
  while (i > 0 || j > 0) {
    const op = back[i][j];
    if (op === "equal" || op === "replace") {
      ops.push({ op, expectedChar: aa[i - 1], attemptChar: bb[j - 1], expectedIndex: i - 1, attemptIndex: j - 1 });
      i--; j--;
    } else if (op === "delete") {
      ops.push({ op, expectedChar: aa[i - 1], attemptChar: "", expectedIndex: i - 1, attemptIndex: -1 });
      i--;
    } else {
      ops.push({ op, expectedChar: "", attemptChar: bb[j - 1], expectedIndex: -1, attemptIndex: j - 1 });
      j--;
    }
  }
  return ops.reverse();
}

function contiguousRanges(indexSet) {
  const indexes = [...indexSet].sort((a, b) => a - b);
  const ranges = [];
  for (const idx of indexes) {
    const last = ranges[ranges.length - 1];
    if (last && idx === last.end) last.end = idx + 1;
    else ranges.push({ start: idx, end: idx + 1 });
  }
  return ranges;
}

/**
 * Detailed phonetic comparison.
 * Returns score plus the exact simplified-IPA character indexes that differ.
 */
export function comparePhoneticsDetailed(expectedPhonetics, attemptPhonetics) {
  const expectedSimplified = simplifyPhonetics(expectedPhonetics);
  const attemptSimplified = simplifyPhonetics(attemptPhonetics);
  const charOps = alignCharacters(expectedSimplified, attemptSimplified);
  const expectedDiffChars = new Set();
  const attemptDiffChars = new Set();

  for (const op of charOps) {
    if (op.op === "equal") continue;
    if (op.expectedIndex >= 0) expectedDiffChars.add(op.expectedIndex);
    if (op.attemptIndex >= 0) attemptDiffChars.add(op.attemptIndex);
  }

  return {
    score: scoreStrings(expectedSimplified, attemptSimplified),
    expectedSimplified,
    attemptSimplified,
    charOps,
    expectedDiffChars,
    attemptDiffChars,
    expectedDiffRanges: contiguousRanges(expectedDiffChars),
    attemptDiffRanges: contiguousRanges(attemptDiffChars)
  };
}

/**
 * Build a rough map from visible French tokens to ranges in the simplified IPA.
 *
 * eSpeak gives us full-sentence IPA. To render a word-level UI, we also ask
 * eSpeak for each token's IPA, then find those token IPA snippets inside the
 * full-sentence IPA. Gaps between token ranges often correspond to liaison-like
 * inserted sounds, which is useful pedagogically.
 *
 * This is approximate, but importantly it is only a mapping layer; it does not
 * decide correctness. Correctness was already decided by comparePhoneticsDetailed().
 */
export function buildPhoneticTokenMap(tokens, fullPhonetics, tokenPhoneticsList = []) {
  const fullSimplified = simplifyPhonetics(fullPhonetics);
  const records = [];
  let cursor = 0;

  for (let i = 0; i < tokens.length; i++) {
    const tokenPhonetics = tokenPhoneticsList[i] || "";
    const tokenSimplified = simplifyPhonetics(tokenPhonetics);
    let start = cursor;
    let end = cursor;
    let found = false;

    if (tokenSimplified) {
      const exact = fullSimplified.indexOf(tokenSimplified, cursor);
      if (exact >= 0) {
        start = exact;
        end = exact + tokenSimplified.length;
        found = true;
      } else {
        // Fallback: preserve order and approximate by token phonetic length.
        // This keeps the UI useful even when eSpeak changes the token slightly
        // in sentence context.
        start = cursor;
        end = Math.min(fullSimplified.length, cursor + tokenSimplified.length);
      }
    }

    records.push({
      index: i,
      token: tokens[i],
      phonetics: tokenPhonetics,
      simplified: tokenSimplified,
      start,
      end,
      found
    });
    cursor = Math.max(cursor, end);
  }

  return { fullPhonetics, fullSimplified, tokens: records };
}

function tokenIndexForChar(map, charIndex) {
  for (const rec of map.tokens) {
    if (charIndex >= rec.start && charIndex < rec.end) return rec.index;
  }
  return -1;
}

function boundaryIndexForChar(map, charIndex) {
  // Boundary i means between token i and token i+1.
  for (let i = 0; i < map.tokens.length - 1; i++) {
    const left = map.tokens[i];
    const right = map.tokens[i + 1];
    if (charIndex >= left.end && charIndex < right.start) return i;
  }
  return -1;
}

function mapDiffCharsToTokens(map, diffChars) {
  const tokenDiffs = new Set();
  const boundaryDiffs = new Set();
  for (const idx of diffChars) {
    const tokenIdx = tokenIndexForChar(map, idx);
    if (tokenIdx >= 0) {
      tokenDiffs.add(tokenIdx);
    } else {
      const boundaryIdx = boundaryIndexForChar(map, idx);
      if (boundaryIdx >= 0) boundaryDiffs.add(boundaryIdx);
    }
  }
  return { tokenDiffs, boundaryDiffs };
}

/**
 * Turn raw text alignment into learner-facing ops using phonetic differences.
 *
 * Raw spelling differences such as allé/aller may exist in rawOps, but if the
 * IPA layer says no sound changed, they become plain/equal in displayOps.
 */
export function buildDisplayOpsFromPhonetic(rawOps, phoneticAnalysis) {
  const out = [];
  const exp = phoneticAnalysis.expectedTokenDiffs;
  const att = phoneticAnalysis.attemptTokenDiffs;

  for (const op of rawOps) {
    if (op.op === "equal") {
      out.push({ ...op, op: "equal" });
      continue;
    }

    const expectedTouched = op.ei >= 0 && exp.has(op.ei);
    const attemptTouched = op.ai >= 0 && att.has(op.ai);
    const phoneticTouched = expectedTouched || attemptTouched;

    if (op.op === "delete") {
      if (expectedTouched) out.push({ ...op, op: "delete" });
      // If a spelling-only expected token disappeared but the sound did not,
      // don't show a learner-facing missing marker.
      continue;
    }

    if (op.op === "insert") {
      out.push({ ...op, op: attemptTouched ? "insert" : "equal" });
      continue;
    }

    // replace
    out.push({ ...op, op: phoneticTouched ? "replace" : "equal" });
  }
  return out;
}

export function makePhoneticDiffContext(phoneticAnalysis) {
  return {
    expected: phoneticAnalysis.expectedTokenDiffs,
    attempt: phoneticAnalysis.attemptTokenDiffs,
    expectedBoundaries: phoneticAnalysis.expectedBoundaryDiffs,
    attemptBoundaries: phoneticAnalysis.attemptBoundaryDiffs
  };
}

/**
 * Token alignment between expected/correct text and attempt/STT text.
 *
 * Returns a left-to-right stream of ops:
 * - equal   : same normalized token
 * - replace : expected token aligned with a different attempt token
 * - delete  : expected token missing from the attempt
 * - insert  : extra attempt token
 */
export function alignTokens(expectedTokens, attemptTokens) {
  const a = expectedTokens.map(t => ({ raw: t, norm: normalizeWord(t) }));
  const b = attemptTokens.map(t => ({ raw: t, norm: normalizeWord(t) }));

  const dp = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
  const back = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(null));

  for (let i = 0; i <= a.length; i++) { dp[i][0] = i; if (i) back[i][0] = "delete"; }
  for (let j = 0; j <= b.length; j++) { dp[0][j] = j; if (j) back[0][j] = "insert"; }

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const same = a[i - 1].norm === b[j - 1].norm;
      const subCost = same ? 0 : 1;
      const choices = [
        { cost: dp[i - 1][j - 1] + subCost, op: same ? "equal" : "replace" },
        { cost: dp[i - 1][j] + 1, op: "delete" },
        { cost: dp[i][j - 1] + 1, op: "insert" }
      ].sort((x, y) => x.cost - y.cost);
      dp[i][j] = choices[0].cost;
      back[i][j] = choices[0].op;
    }
  }

  const ops = [];
  let i = a.length;
  let j = b.length;

  while (i > 0 || j > 0) {
    const op = back[i][j];
    if (op === "equal" || op === "replace") {
      ops.push({ op, expected: a[i - 1].raw, attempt: b[j - 1].raw, ei: i - 1, ai: j - 1 });
      i--; j--;
    } else if (op === "delete") {
      ops.push({ op, expected: a[i - 1].raw, attempt: "", ei: i - 1, ai: -1 });
      i--;
    } else {
      ops.push({ op, expected: "", attempt: b[j - 1].raw, ei: -1, ai: j - 1 });
      j--;
    }
  }

  return ops.reverse();
}

function makeDiffIndexSets(ops) {
  const expected = new Set();
  const attempt = new Set();
  for (const op of ops) {
    if (op.op !== "equal") {
      if (op.ei >= 0) expected.add(op.ei);
      if (op.ai >= 0) attempt.add(op.ai);
    }
  }
  return { expected, attempt };
}

function opPositionsForExpectedIndex(ops, ei) {
  const positions = [];
  for (let k = 0; k < ops.length; k++) {
    if (ops[k].ei === ei) positions.push(k);
  }
  return positions;
}

function attemptIndicesNearExpectedIndex(ops, ei) {
  const hits = new Set();
  for (const k of opPositionsForExpectedIndex(ops, ei)) {
    const op = ops[k];
    if (op.ai >= 0) hits.add(op.ai);

    // Include only immediate inserted neighbors. This catches expected j’ai vs
    // attempt je ai, but prevents line leakage across the sentence.
    const prev = ops[k - 1];
    const next = ops[k + 1];
    if (prev && prev.op === "insert" && prev.ai >= 0) hits.add(prev.ai);
    if (next && next.op === "insert" && next.ai >= 0) hits.add(next.ai);
  }
  return [...hits];
}

const ELISION_MAP = {
  j: ["je"],
  l: ["le", "la"],
  d: ["de"],
  n: ["ne"],
  m: ["me"],
  t: ["te"],
  s: ["se", "si"],
  qu: ["que"],
  c: ["ce"]
};

function splitContraction(token) {
  const t = normalizeBasic(token);
  const m = t.match(/^([a-z]+)'([a-z].*)$/);
  if (!m) return null;
  const prefix = m[1];
  const rest = m[2];
  const fulls = ELISION_MAP[prefix];
  if (!fulls) return null;
  return { prefix, fulls, rest };
}

function isVowelish(word) {
  // Simplified: h is treated as vowel-starting. French h aspiré exceptions are
  // not modeled here. Since this is used for a warning, not a legal judgment,
  // that is a reasonable MVP compromise.
  const w = normalizeBasic(word).replace(/^[^a-z]+/, "");
  return /^[aeiouyh]/.test(w);
}

const COMMON_LIAISONS = new Map(Object.entries({
  // Determiners / possessives before vowel.
  les: "z", des: "z", mes: "z", tes: "z", ses: "z", nos: "z", vos: "z", leurs: "z", aux: "z",

  // Pronouns before vowel-starting verb.
  vous: "z", nous: "z", ils: "z", elles: "z", on: "n",

  // Common adjectives/adverbs/prepositions/numbers.
  un: "n", deux: "z", trois: "z", six: "z", dix: "z",
  mon: "n", ton: "n", son: "n", bon: "n", aucun: "n",
  grand: "t", petit: "t", tout: "t", quand: "t", comment: "t", est: "t",
  tres: "z", plus: "z", moins: "z", chez: "z", dans: "z", sans: "z", sous: "z"
}));

function liaisonSoundFor(prev, next) {
  const a = normalizeWord(prev);
  const b = normalizeWord(next);
  if (!a || !b || !isVowelish(b)) return null;

  if (COMMON_LIAISONS.has(a)) {
    return { sound: COMMON_LIAISONS.get(a), strength: "common" };
  }

  // Soft fallback. Many of these are optional or weird depending on register,
  // but marking them only when there is a diff keeps the UI sane.
  if (/[sxz]$/.test(a)) return { sound: "z", strength: "possible" };
  if (/[dt]$/.test(a)) return { sound: "t", strength: "possible" };
  if (/n$/.test(a)) return { sound: "n", strength: "possible" };
  return null;
}

function addKindToMap(map, index, kind) {
  if (index < 0) return;
  if (!map.has(index)) map.set(index, new Set());
  map.get(index).add(kind);
}

/**
 * Detect elision and liaison issue zones.
 *
 * Very important design rule:
 * theoretical liaison/elision opportunities are NOT displayed. They become
 * visible only if the actual diff overlaps that zone.
 */
export function detectFrenchZones(expectedTokens, attemptTokens, ops, diffContext = null) {
  const rawDiff = makeDiffIndexSets(ops);
  const diff = diffContext ? {
    expected: diffContext.expected || new Set(),
    attempt: diffContext.attempt || new Set(),
    expectedBoundaries: diffContext.expectedBoundaries || new Set(),
    attemptBoundaries: diffContext.attemptBoundaries || new Set()
  } : { ...rawDiff, expectedBoundaries: new Set(), attemptBoundaries: new Set() };
  const attemptZoneKinds = new Map();   // attempt token index -> Set('elision'|'liaison')
  const missingZoneKinds = new Map();   // op index for delete ops -> Set(...)
  const issues = [];

  const markAttemptIndexes = (indexes, kind) => {
    for (const idx of indexes) addKindToMap(attemptZoneKinds, idx, kind);
  };

  const markDeleteOpsForExpectedIndexes = (expectedIndexes, kind) => {
    for (let k = 0; k < ops.length; k++) {
      if (ops[k].op === "delete" && expectedIndexes.includes(ops[k].ei)) {
        addKindToMap(missingZoneKinds, k, kind);
      }
    }
  };

  // Elision: expected contracted token vs expanded attempt neighborhood.
  for (let ei = 0; ei < expectedTokens.length; ei++) {
    const contraction = splitContraction(expectedTokens[ei]);
    if (!contraction) continue;

    const nearbyAttemptIndexes = attemptIndicesNearExpectedIndex(ops, ei);
    const nearbyAttemptNorm = nearbyAttemptIndexes.map(idx => ({ idx, norm: normalizeBasic(attemptTokens[idx]) }));

    let separatedIndexes = [];
    let separatedText = "";

    for (const full of contraction.fulls) {
      for (let n = 0; n < nearbyAttemptNorm.length - 1; n++) {
        const a = nearbyAttemptNorm[n];
        const b = nearbyAttemptNorm[n + 1];
        if (a.norm === full && b.norm === contraction.rest) {
          separatedIndexes = [a.idx, b.idx];
          separatedText = `${attemptTokens[a.idx]} ${attemptTokens[b.idx]}`;
        }
      }
    }

    const overlapsDiff = diff.expected.has(ei) || nearbyAttemptIndexes.some(idx => diff.attempt.has(idx));
    if (!overlapsDiff && separatedIndexes.length === 0) continue;

    const indexesToMark = separatedIndexes.length
      ? separatedIndexes
      : nearbyAttemptIndexes.filter(idx => diff.attempt.has(idx));

    markAttemptIndexes(indexesToMark, "elision");
    markDeleteOpsForExpectedIndexes([ei], "elision");

    issues.push({
      kind: "elision",
      severity: separatedIndexes.length ? "bad" : "warn",
      title: separatedIndexes.length ? "Likely missing elision" : "Possible elision-related mismatch",
      detail: separatedIndexes.length
        ? `Expected “${expectedTokens[ei]}”, but attempt has “${separatedText}”. In normal French this contracts/elides.`
        : `The mismatch overlaps the contraction “${expectedTokens[ei]}”.`
    });
  }

  // Liaison: expected adjacent pair with a likely linking consonant.
  for (let ei = 0; ei < expectedTokens.length - 1; ei++) {
    const prev = expectedTokens[ei];
    const next = expectedTokens[ei + 1];
    const info = liaisonSoundFor(prev, next);
    if (!info) continue;

    const expectedPair = [ei, ei + 1];
    const attemptNearPair = [
      ...attemptIndicesNearExpectedIndex(ops, ei),
      ...attemptIndicesNearExpectedIndex(ops, ei + 1)
    ];

    const overlapsDiff =
      diff.expectedBoundaries.has(ei) ||
      expectedPair.some(idx => diff.expected.has(idx)) ||
      attemptNearPair.some(idx => diff.attempt.has(idx));

    if (!overlapsDiff) continue;

    // Mark only the attempt tokens that are actually different. This avoids
    // leaking the overline onto correct words like “vous” in “vous savez”.
    let changedAttemptIndexes = [...new Set(attemptNearPair)].filter(idx => diff.attempt.has(idx));
    // If the phonetic diff sits only in the expected boundary gap, there may be
    // no obvious changed attempt token. Mark the closest aligned attempt token
    // rather than leaking the mark onto the whole phrase.
    if (!changedAttemptIndexes.length && diff.expectedBoundaries.has(ei)) {
      changedAttemptIndexes = [...new Set(attemptNearPair)].slice(-1);
    }
    markAttemptIndexes(changedAttemptIndexes, "liaison");
    markDeleteOpsForExpectedIndexes(expectedPair, "liaison");

    issues.push({
      kind: "liaison",
      severity: info.strength === "common" ? "bad" : "warn",
      title: info.strength === "common" ? "Possible liaison-related mismatch" : "Mismatch near possible liaison",
      detail: `The mismatch overlaps “${prev} ${next}”. Expected linking sound is roughly /${info.sound}/: ${prev}‿${next}.`
    });
  }

  return { attemptZoneKinds, missingZoneKinds, issues };
}

function styleClasses({ diff, missing, zoneKinds }, prefix = "fpd") {
  const cls = [`${prefix}-mark`];
  const hasLiaison = zoneKinds.has("liaison");
  const hasElision = zoneKinds.has("elision");

  if (missing) {
    if (hasLiaison && hasElision) cls.push(`${prefix}-zone-both`);
    else if (hasLiaison) cls.push(`${prefix}-liaison`);
    else if (hasElision) cls.push(`${prefix}-elision`);
    else cls.push(`${prefix}-missing`);
    return cls.join(" ");
  }

  // Visual priority: special French issue > ordinary mismatch.
  if (hasLiaison && hasElision) cls.push(`${prefix}-zone-both`);
  else if (hasLiaison) cls.push(`${prefix}-liaison`);
  else if (hasElision) cls.push(`${prefix}-elision`);
  else if (diff) cls.push(`${prefix}-diff`);

  return cls.join(" ");
}

function tokenStyleKey(item) {
  const kinds = [...item.zoneKinds].sort().join("+");
  return `${item.diff ? "diff" : "ok"}|${item.missing ? "missing" : "word"}|${kinds}`;
}

/** Render only the attempt/STT line. Correct words remain plain. */
export function renderAttemptMarkup(ops, zones, options = {}) {
  const prefix = options.classPrefix || "fpd";
  const items = [];

  for (let opIndex = 0; opIndex < ops.length; opIndex++) {
    const op = ops[opIndex];

    if (op.op === "delete") {
      const zoneKinds = zones.missingZoneKinds.get(opIndex) || new Set();
      items.push({
        text: options.missingMarker || "∅",
        title: `Missing: ${op.expected}`,
        diff: true,
        missing: true,
        zoneKinds
      });
      continue;
    }

    const zoneKinds = zones.attemptZoneKinds.get(op.ai) || new Set();
    items.push({
      text: op.attempt,
      title: op.op === "equal" ? "" : `Expected: ${op.expected || "nothing"}`,
      diff: op.op !== "equal",
      missing: false,
      zoneKinds
    });
  }

  // Group consecutive tokens with identical visual styling so underlines look
  // like continuous spellcheck marks.
  const groups = [];
  for (const item of items) {
    const key = tokenStyleKey(item);
    const last = groups[groups.length - 1];
    if (last && last.key === key && !item.title && !last.title) {
      last.words.push(item.text);
    } else {
      groups.push({ ...item, key, words: [item.text] });
    }
  }

  return groups.map(group => {
    const text = group.words.join(" ");
    const hasStyle = group.diff || group.missing || group.zoneKinds.size;
    if (!hasStyle) return escapeHtml(text);
    const title = group.title ? ` title="${escapeHtml(group.title)}"` : "";
    return `<span class="${styleClasses(group, prefix)}"${title}>${escapeHtml(text)}</span>`;
  }).join(" ");
}

export function renderCorrectPlain(tokens) {
  return escapeHtml(tokens.join(" "));
}

function emptyZones() {
  return {
    attemptZoneKinds: new Map(),
    missingZoneKinds: new Map(),
    issues: []
  };
}

function makeCleanAttemptOps(attemptTokens) {
  return attemptTokens.map((token, ai) => ({
    op: "equal",
    expected: token,
    attempt: token,
    ei: -1,
    ai
  }));
}

export function scoreMood(score, thresholds = DEFAULTS.thresholds) {
  if (score >= thresholds.veryClose) return "good";
  if (score >= thresholds.close) return "warn";
  return "bad";
}

export function scoreColor(score) {
  // Red at 0, green at 100.
  const hue = Math.round(Math.max(0, Math.min(100, score)) * 1.2);
  return {
    background: `hsl(${hue} 78% 93%)`,
    border: `hsl(${hue} 55% 70%)`
  };
}

/** CSS needed by renderAttemptMarkup(). Apps can copy/customize this. */
export function defaultComparisonCss(prefix = "fpd") {
  return `
.${prefix}-mark {
  display: inline;
  padding: 0 1px 2px;
  border-radius: 2px;
  text-decoration-skip-ink: none;
  -webkit-text-decoration-skip: none;
}
.${prefix}-diff { border-bottom: 3px solid #dc2626; }
.${prefix}-missing {
  color: #dc2626;
  font-weight: 800;
  border-bottom: 3px dashed #dc2626;
}
.${prefix}-liaison {
  text-decoration-line: overline;
  text-decoration-style: wavy;
  text-decoration-color: #2563eb;
  text-decoration-thickness: 2px;
}
.${prefix}-elision {
  text-decoration-line: overline;
  text-decoration-style: dotted;
  text-decoration-color: #7c3aed;
  text-decoration-thickness: 2px;
}
.${prefix}-zone-both {
  text-decoration-line: overline;
  text-decoration-style: wavy;
  text-decoration-color: #7c3aed;
  text-decoration-thickness: 2px;
}`.trim();
}

class PhoneticsCache {
  constructor(options) {
    this.options = options;
    this.memory = new Map();
    this.storageOk = typeof localStorage !== "undefined" && canUseLocalStorage();
    this.load();
  }

  load() {
    if (!this.options.enabled || !this.storageOk) return;
    const saved = safeJsonParse(localStorage.getItem(this.options.key), []);
    if (Array.isArray(saved)) this.memory = new Map(saved);
  }

  save() {
    if (!this.options.enabled || !this.storageOk) return;
    const entries = [...this.memory.entries()].slice(-this.options.maxEntries);
    this.memory = new Map(entries);
    localStorage.setItem(this.options.key, JSON.stringify(entries));
  }

  get(key) { return this.options.enabled ? this.memory.get(key) : undefined; }

  set(key, value) {
    if (!this.options.enabled) return;
    this.memory.set(key, value);
    this.save();
  }

  clear() {
    this.memory.clear();
    if (this.storageOk) localStorage.removeItem(this.options.key);
  }

  export() { return Object.fromEntries(this.memory.entries()); }

  import(obj = {}, { merge = true } = {}) {
    if (!merge) this.memory.clear();
    for (const [k, v] of Object.entries(obj || {})) this.memory.set(k, v);
    this.save();
  }
}

class OverrideStore {
  constructor(options) {
    this.options = options;
    this.storageOk = typeof localStorage !== "undefined" && canUseLocalStorage();
    this.map = new Map();
    this.load();
  }

  load() {
    if (!this.options.enabled || !this.storageOk) return;
    const saved = safeJsonParse(localStorage.getItem(this.options.key), {});
    this.map = new Map(Object.entries(saved || {}));
  }

  save() {
    if (!this.options.enabled || !this.storageOk) return;
    localStorage.setItem(this.options.key, JSON.stringify(Object.fromEntries(this.map.entries())));
  }

  key(text, language) { return `${language}::${normalizeBasic(text)}`; }
  get(text, language) { return this.options.enabled ? this.map.get(this.key(text, language)) : undefined; }
  set(text, phonetics, language) { this.map.set(this.key(text, language), phonetics); this.save(); }
  remove(text, language) { this.map.delete(this.key(text, language)); this.save(); }
  clear() { this.map.clear(); if (this.storageOk) localStorage.removeItem(this.options.key); }
  export() { return Object.fromEntries(this.map.entries()); }
}

export class FrenchPhoneticDiff {
  constructor(options = {}) {
    this.options = mergeOptions(DEFAULTS, options);
    this.cache = new PhoneticsCache(this.options.cache);
    this.overrides = new OverrideStore(this.options.overrides);
    this.ESpeakNg = null;
    this.espeakAvailable = false;
    this.lastInitError = null;
  }

  /**
   * Load eSpeak-ng if enabled. Safe to call multiple times.
   *
   * For production/offline: bundle eSpeak and point espeakUrl to a local file,
   * or pass a module through setEspeakModule().
   */
  async init() {
    if (!this.options.useEspeak) return { espeakAvailable: false, reason: "disabled" };
    if (this.espeakAvailable) return { espeakAvailable: true };

    try {
      const module = await import(this.options.espeakUrl);
      this.ESpeakNg = module.default || module;

      // Smoke test: catches CDN/module/API problems early.
      await this.getPhonetics("bonjour", { bypassCache: true });
      this.espeakAvailable = true;
      return { espeakAvailable: true };
    } catch (err) {
      this.lastInitError = err;
      this.espeakAvailable = false;
      return { espeakAvailable: false, error: err };
    }
  }

  /** Advanced injection point for bundlers/tests. */
  setEspeakModule(ESpeakNg) {
    this.ESpeakNg = ESpeakNg;
    this.espeakAvailable = !!ESpeakNg;
  }

  cacheKey(text, language = this.options.language) {
    return `${language}::${normalizeBasic(text)}`;
  }

  /**
   * Get phonetics/IPA-ish output for text.
   * Uses override -> cache -> eSpeak, in that order.
   */
  async getPhonetics(text, opts = {}) {
    const language = opts.language || this.options.language;
    const sourceText = String(text ?? "");

    const override = this.overrides.get(sourceText, language);
    if (override && !opts.ignoreOverrides) {
      return { text: sourceText, phonetics: override, source: "override", language };
    }

    const key = this.cacheKey(sourceText, language);
    const cached = this.cache.get(key);
    if (cached && !opts.bypassCache) {
      return { text: sourceText, phonetics: cached, source: "cache", language };
    }

    if (!this.ESpeakNg) throw new Error("eSpeak-ng is not loaded. Call init() first, or provide setEspeakModule().");

    const phonetics = await this._phonemizeWithEspeak(sourceText, language);
    this.cache.set(key, phonetics);
    return { text: sourceText, phonetics, source: "espeak", language };
  }

  async _phonemizeWithEspeak(text, language) {
    // Pass text through a virtual file, not a CLI argument. This avoids accent
    // and quoting problems with French text like “J’ai déjà mangé”.
    const inputName = `fpd-input-${Math.random().toString(36).slice(2)}.txt`;
    const outputName = `fpd-output-${Math.random().toString(36).slice(2)}.txt`;

    const espeak = await this.ESpeakNg({
      preRun: [(Module) => {
        Module.FS.writeFile(inputName, text || " ");
      }],
      arguments: [
        "--phonout", outputName,
        "--sep= ",
        "-q",
        "--ipa=3",
        "-v", language,
        "-f", inputName
      ]
    });

    return espeak.FS.readFile(outputName, { encoding: "utf8" }).trim();
  }

  setOverride(text, phonetics, language = this.options.language) {
    this.overrides.set(text, phonetics, language);
  }

  removeOverride(text, language = this.options.language) {
    this.overrides.remove(text, language);
  }

  clearCache() { this.cache.clear(); }
  clearOverrides() { this.overrides.clear(); }
  exportCache() { return this.cache.export(); }
  importCache(obj, options) { return this.cache.import(obj, options); }
  exportOverrides() { return this.overrides.export(); }

  /**
   * Compare two already-produced phonetic strings.
   */
  comparePhonetics(expectedPhonetics, attemptPhonetics) {
    return comparePhonetics(expectedPhonetics, attemptPhonetics);
  }

  /**
   * Main high-level API.
   *
   * Returns a structured object that the app can use for UI, scoring, and logs.
   */
  async compareTexts(expectedText, attemptText, opts = {}) {
    const expectedTokens = tokenizeFrenchWords(expectedText);
    const attemptTokens = tokenizeFrenchWords(attemptText);

    // Raw text alignment is still useful for placement and debug, but in v3 it
    // is NOT the truth layer for learner-facing mistakes when phonetics works.
    const rawOps = alignTokens(expectedTokens, attemptTokens);
    const rawZones = detectFrenchZones(expectedTokens, attemptTokens, rawOps);

    let expectedPhonetics = "";
    let attemptPhonetics = "";
    let phoneticSources = null;
    let score = 0;
    let scoreMode = "text";
    let phoneticError = null;
    let phoneticDiff = null;
    let phoneticAnalysis = null;

    const shouldUsePhonetics = opts.preferPhoneticScore ?? this.options.preferPhoneticScore;
    const wantsPhoneticFirst = (opts.diffMode || this.options.diffMode) === "phonetic-first";

    if (shouldUsePhonetics && this.options.useEspeak) {
      try {
        if (!this.espeakAvailable) await this.init();
        if (this.espeakAvailable) {
          const [a, b] = await Promise.all([
            this.getPhonetics(expectedText, opts),
            this.getPhonetics(attemptText, opts)
          ]);
          expectedPhonetics = a.phonetics;
          attemptPhonetics = b.phonetics;
          phoneticSources = { expected: a.source, attempt: b.source };

          phoneticDiff = comparePhoneticsDetailed(expectedPhonetics, attemptPhonetics);
          score = phoneticDiff.score;
          scoreMode = "phonetic";

          // Build word <-> IPA maps only when needed for learner-facing markup.
          // If score is perfect, no visible diff is needed, so we can skip the
          // per-token phonemization cost unless the caller explicitly asks.
          const needsMapping = wantsPhoneticFirst && (score < 100 || opts.includePhoneticMaps);
          if (needsMapping) {
            const [expectedTokenResults, attemptTokenResults] = await Promise.all([
              Promise.all(expectedTokens.map(t => this.getPhonetics(t, opts).catch(() => ({ phonetics: "" })))),
              Promise.all(attemptTokens.map(t => this.getPhonetics(t, opts).catch(() => ({ phonetics: "" }))))
            ]);

            const expectedMap = buildPhoneticTokenMap(
              expectedTokens,
              expectedPhonetics,
              expectedTokenResults.map(x => x.phonetics)
            );
            const attemptMap = buildPhoneticTokenMap(
              attemptTokens,
              attemptPhonetics,
              attemptTokenResults.map(x => x.phonetics)
            );

            const expectedMapped = mapDiffCharsToTokens(expectedMap, phoneticDiff.expectedDiffChars);
            const attemptMapped = mapDiffCharsToTokens(attemptMap, phoneticDiff.attemptDiffChars);

            phoneticAnalysis = {
              expectedMap,
              attemptMap,
              expectedTokenDiffs: expectedMapped.tokenDiffs,
              attemptTokenDiffs: attemptMapped.tokenDiffs,
              expectedBoundaryDiffs: expectedMapped.boundaryDiffs,
              attemptBoundaryDiffs: attemptMapped.boundaryDiffs
            };
          }
        }
      } catch (err) {
        phoneticError = err;
      }
    }

    if (scoreMode !== "phonetic") {
      const expectedNorm = normalizeBasic(expectedText).replace(/\s+/g, "");
      const attemptNorm = normalizeBasic(attemptText).replace(/\s+/g, "");
      score = scoreStrings(expectedNorm, attemptNorm);
      scoreMode = "text-fallback";
    }

    const flags = {
      phoneticEquivalent: scoreMode === "phonetic" && score >= this.options.phoneticEquivalentThreshold,
      suppressedTextDiffs: false,
      diffMode: scoreMode === "phonetic" && wantsPhoneticFirst ? "phonetic-first" : "text-fallback"
    };

    let displayOps = rawOps;
    let displayZones = rawZones;

    if (scoreMode === "phonetic" && wantsPhoneticFirst) {
      if (score >= this.options.phoneticEquivalentThreshold) {
        // No phonetic difference = no learner-facing mistake. Raw spelling
        // differences remain in rawOps/rawZones for debug or strict modes.
        displayOps = makeCleanAttemptOps(attemptTokens);
        displayZones = emptyZones();
        flags.suppressedTextDiffs = rawOps.some(op => op.op !== "equal") || rawZones.issues.length > 0;
      } else if (phoneticAnalysis) {
        displayOps = buildDisplayOpsFromPhonetic(rawOps, phoneticAnalysis);
        displayZones = detectFrenchZones(
          expectedTokens,
          attemptTokens,
          displayOps,
          makePhoneticDiffContext(phoneticAnalysis)
        );
      } else {
        // Phonetic scoring worked but mapping failed/skipped. Be conservative:
        // use raw text placement, but keep the score phonetic.
        displayOps = rawOps;
        displayZones = rawZones;
      }
    }

    return {
      expectedText,
      attemptText,
      expectedTokens,
      attemptTokens,

      // Display-level alignment/zones: use these for learner UI.
      ops: displayOps,
      zones: displayZones,

      // Raw text alignment/zones: useful for debugging, logs, or strict modes.
      rawOps,
      rawZones,
      flags,

      // v3 truth/debug layer.
      phoneticDiff,
      phoneticAnalysis,

      score,
      scoreMode,
      mood: scoreMood(score, this.options.thresholds),
      scoreColor: scoreColor(score),
      expectedPhonetics,
      attemptPhonetics,
      phoneticSources,
      phoneticError,
      html: {
        attempt: renderAttemptMarkup(displayOps, displayZones, opts.render || {}),
        expected: renderCorrectPlain(expectedTokens)
      }
    };
  }

  /** Render a full compact block. Apps may prefer using result.html directly. */
  renderComparisonHtml(result, opts = {}) {
    const prefix = opts.classPrefix || "fpd";
    const labelAttempt = opts.labelAttempt || "Attempt";
    const labelExpected = opts.labelExpected || "Correct";
    return `
<div class="${prefix}-comparison" style="background:${result.scoreColor.background};border-color:${result.scoreColor.border};">
  <div class="${prefix}-score"><strong>${result.score}%</strong> <span>${escapeHtml(result.mood)}</span> <small>${escapeHtml(result.scoreMode)}</small></div>
  <div class="${prefix}-label">${escapeHtml(labelAttempt)}</div>
  <div class="${prefix}-line ${prefix}-attempt">${result.html.attempt}</div>
  <div class="${prefix}-label">${escapeHtml(labelExpected)}</div>
  <div class="${prefix}-line ${prefix}-expected">${result.html.expected}</div>
</div>`.trim();
  }
}

export function createFrenchPhoneticDiff(options) {
  return new FrenchPhoneticDiff(options);
}
