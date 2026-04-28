#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";

const ROOT = "/Users/simeon/Desktop/proj1";
const VERBS_JS = path.join(ROOT, "js", "verbs.full.generated.js");
const USAGES_JSON = path.join(ROOT, "verb_usages.json");
const USAGES_JS = path.join(ROOT, "verb_usages.js");
const LEFFF_AD_COMBO = path.join(ROOT, "_experiments", "lefff_ad_combo_all.json");
const DEFAULT_OUT_DIR = path.join(ROOT, "expansion", "french_top2000_usages");
const TOP_2000_TIERS = new Set(["top-20", "top-50", "top-100", "top-500", "top-1000", "top-2000"]);
const FAMILY_ORDER = ["combo_a", "a_object", "de_object"];
const FAMILY_FROM_LEFFF_REASON = {
  "a-object": "a_object",
  "de-object": "de_object",
  "combo-a": "combo_a",
};
const FAMILY_COPY = {
  general: {
    label: "general usage",
    instruction: "Generate the most common, useful learner-facing use of this verb.",
  },
  a_object: {
    label: "à pattern",
    instruction: "The example must honestly instantiate a selected verb complement with à/au/aux/à la/à l'. Do not use a pure time phrase, random location, or unrelated à unless that is truly selected by the verb.",
  },
  de_object: {
    label: "de pattern",
    instruction: "The example must honestly instantiate a selected verb complement with de/du/des/de la/de l'/d'. Do not use partitive de, source/origin de, or noun-internal de unless it is truly governed by the verb.",
  },
  combo_a: {
    label: "object + à pattern",
    instruction: "The example must include both a direct object and a selected à-complement, usually a person/recipient/target. Do not make it a random location.",
  },
};
const OPENAI_KEY_CANDIDATES = [
  path.join(process.env.HOME || "", ".config", "openai", "env"),
  path.join(process.env.HOME || "", ".env.openai"),
  path.join(process.env.HOME || "", ".zshrc"),
];

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const part = argv[i];
    if (!part.startsWith("--")) {
      args._.push(part);
      continue;
    }
    const key = part.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      args[key] = true;
    } else {
      args[key] = next;
      i += 1;
    }
  }
  return args;
}

async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, "utf8"));
}

async function ensureOpenAiKey() {
  if (process.env.OPENAI_API_KEY) return process.env.OPENAI_API_KEY;
  const exportRe = /^\s*export\s+OPENAI_API_KEY\s*=\s*(['"]?)(.+?)\1\s*$/;
  for (const candidate of OPENAI_KEY_CANDIDATES) {
    if (!candidate) continue;
    try {
      const lines = (await fs.readFile(candidate, "utf8")).split(/\r?\n/);
      for (const line of lines) {
        const match = exportRe.exec(line.trim());
        const key = match?.[2]?.trim() || "";
        if (key && /^sk-/.test(key) && !/your.*key|placeholder|example/i.test(key)) {
          process.env.OPENAI_API_KEY = key;
          return process.env.OPENAI_API_KEY;
        }
      }
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
  }
  return "";
}

async function writeJson(filePath, data) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2) + "\n", "utf8");
}

function slugify(value) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toLowerCase();
}

function normalizeSpace(value) {
  return String(value || "")
    .replace(/\u2019/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function loadVerbsAndTenses(rawJs) {
  const context = {};
  vm.createContext(context);
  vm.runInContext(`${rawJs}\nglobalThis.__data = { verbs, tenses };`, context);
  return context.__data;
}

async function loadFrenchData() {
  const rawJs = await fs.readFile(VERBS_JS, "utf8");
  const { verbs, tenses } = loadVerbsAndTenses(rawJs);
  const usages = await readJson(USAGES_JSON);
  const lefff = await readJson(LEFFF_AD_COMBO);
  return { verbs, tenses, usages, lefff };
}

function buildLefffIndex(lefffRows) {
  const index = new Map();
  for (const row of lefffRows) {
    const verb = normalizeSpace(row.verb);
    if (!verb) continue;
    const candidatesByFamily = new Map();
    for (const candidate of row.candidates || []) {
      const family = FAMILY_FROM_LEFFF_REASON[String(candidate.reason || "").trim()];
      if (!family) continue;
      if (!candidatesByFamily.has(family)) candidatesByFamily.set(family, []);
      candidatesByFamily.get(family).push({
        pattern: normalizeSpace(candidate.pattern),
        reason: normalizeSpace(candidate.reason),
        score: Number(candidate.score || 0),
        example_fr: normalizeSpace(candidate.example_fr),
        source_file: normalizeSpace(candidate.source_file),
        source_orth: normalizeSpace(candidate.source_orth),
      });
    }
    if (candidatesByFamily.size) index.set(verb, candidatesByFamily);
  }
  return index;
}

function scopedVerbs(verbs, scope) {
  if (scope === "first2000") return verbs.slice(0, 2000);
  if (scope === "app-top2000") return verbs.filter((verb) => TOP_2000_TIERS.has(verb.frequency));
  throw new Error(`Unknown scope: ${scope}`);
}

function nextSenseIdFactory(existingUsages) {
  const counts = new Map();
  for (const row of existingUsages) {
    const verb = normalizeSpace(row.verb);
    if (!verb) continue;
    counts.set(verb, (counts.get(verb) || 0) + 1);
  }
  return (verb) => {
    const next = (counts.get(verb) || 0) + 1;
    counts.set(verb, next);
    return `${slugify(verb)}_${String(next).padStart(2, "0")}`;
  };
}

function taskIdFor(verb, family) {
  return `${slugify(verb)}__${family}`;
}

function buildTasks({ verbs, usages, lefff, scope }) {
  const existingUsageVerbs = new Set(usages.map((row) => normalizeSpace(row.verb)).filter(Boolean));
  const lefffIndex = buildLefffIndex(lefff);
  const makeSenseId = nextSenseIdFactory(usages);
  const selectedVerbs = scopedVerbs(verbs, scope);
  const tasks = [];

  for (let index = 0; index < selectedVerbs.length; index += 1) {
    const verb = selectedVerbs[index];
    const infinitive = normalizeSpace(verb.infinitive);
    if (!infinitive || existingUsageVerbs.has(infinitive)) continue;

    const familyCandidates = lefffIndex.get(infinitive);
    const families = familyCandidates
      ? FAMILY_ORDER.filter((family) => familyCandidates.has(family))
      : [];
    // Every missing verb needs a safe general usage; LEFFF families are extra,
    // constraint-specific value and should not be the only path to coverage.
    const taskFamilies = ["general", ...families];

    for (const family of taskFamilies) {
      const candidates = (familyCandidates?.get(family) || [])
        .sort((a, b) => (b.score - a.score) || a.pattern.localeCompare(b.pattern, "fr"));
      tasks.push({
        id: taskIdFor(infinitive, family),
        verb: infinitive,
        translation: normalizeSpace(verb.translation),
        frequency: normalizeSpace(verb.frequency),
        rank_index: index + 1,
        family,
        family_label: FAMILY_COPY[family].label,
        sense_id: makeSenseId(infinitive),
        generation_instruction: FAMILY_COPY[family].instruction,
        lefff_patterns: candidates.slice(0, 4),
      });
    }
  }

  return {
    metadata: {
      created_at: new Date().toISOString(),
      scope,
      selected_verb_count: selectedVerbs.length,
      existing_usage_verb_count_in_scope: selectedVerbs.filter((verb) => existingUsageVerbs.has(verb.infinitive)).length,
      missing_verb_count_in_scope: selectedVerbs.filter((verb) => !existingUsageVerbs.has(verb.infinitive)).length,
      task_count: tasks.length,
      task_family_counts: countBy(tasks, (task) => task.family),
      note: "Sidecar manifest only. Runtime files are not modified by manifest/generate.",
    },
    tasks,
  };
}

function countBy(items, keyFn) {
  const counts = {};
  for (const item of items) {
    const key = keyFn(item);
    counts[key] = (counts[key] || 0) + 1;
  }
  return counts;
}

function manifestPath(outDir) {
  return path.join(outDir, "french_top2000_missing_usages.manifest.json");
}

function generatedPath(outDir) {
  return path.join(outDir, "french_top2000_missing_usages.generated.json");
}

function reviewPath(outDir) {
  return path.join(outDir, "french_top2000_missing_usages.review.md");
}

function manifestReviewPath(outDir) {
  return path.join(outDir, "french_top2000_missing_usages.manifest.md");
}

function buildManifestMarkdown(manifest) {
  const lines = [
    "# French Top 2,000 Missing Usage Manifest",
    "",
    `- Scope: \`${manifest.metadata.scope}\``,
    `- Selected verbs: \`${manifest.metadata.selected_verb_count}\``,
    `- Verbs already covered: \`${manifest.metadata.existing_usage_verb_count_in_scope}\``,
    `- Missing verbs: \`${manifest.metadata.missing_verb_count_in_scope}\``,
    `- Generation tasks: \`${manifest.metadata.task_count}\``,
    "",
    "## Task Families",
    "",
  ];
  for (const [family, count] of Object.entries(manifest.metadata.task_family_counts)) {
    lines.push(`- \`${family}\`: \`${count}\``);
  }
  lines.push("", "## First Tasks", "");
  for (const task of manifest.tasks.slice(0, 80)) {
    const lefff = task.lefff_patterns.map((row) => row.pattern).filter(Boolean).join("; ");
    lines.push(`- \`${task.id}\` ${task.verb} (${task.frequency}) — ${task.family_label}${lefff ? ` — LEFFF: ${lefff}` : ""}`);
  }
  return lines.join("\n").trim() + "\n";
}

async function writeManifest({ outDir, scope }) {
  const data = await loadFrenchData();
  const manifest = buildTasks({ ...data, scope });
  await writeJson(manifestPath(outDir), manifest);
  await fs.writeFile(manifestReviewPath(outDir), buildManifestMarkdown(manifest), "utf8");
  return manifest;
}

function buildSystemPrompt() {
  return [
    "You are a native-level French linguist writing learner-facing verb usage examples for a serious conjugation app.",
    "Return strict JSON only. No markdown, no commentary.",
    "Each item must be natural modern French, short, and useful for learners.",
    "Prefer present tense and concrete everyday contexts.",
    "For verbs that are normally pronominal in the requested sense, use the pronominal form naturally even if the dataset lemma is bare.",
    "The French example must genuinely use the requested verb lemma, inflected if needed; do not swap in a different derivative and do not write meta-sentences about the word itself.",
    "Do not mark needs_review merely because a verb is rare, formal, technical, vulgar, literary, or regional. If the usage is correct in an appropriate context, set status ok and mention the register briefly in notes.",
    "For general usage tasks, status needs_review is only for genuine uncertainty or an unsafe example after trying to find a correct context.",
    "Do not use placeholders such as qqn, qqch, someone, something, X, or brackets in the example sentence.",
    "Do not force an à/de pattern if it would be wrong. If the requested LEFFF-backed pattern looks unsafe, still produce the best natural example but set status to needs_review and explain briefly.",
    "",
    "Output schema:",
    '{ "items": [ { "id": "...", "verb": "...", "status": "ok|needs_review", "pattern": "...", "meaning_en": "...", "example_fr": "...", "example_en": "...", "notes": "..." } ] }',
  ].join("\n");
}

function compactTaskForPrompt(task) {
  return {
    id: task.id,
    verb: task.verb,
    rough_translation: task.translation,
    family: task.family,
    required_behavior: task.generation_instruction,
    lefff_patterns: task.lefff_patterns.map((row) => ({
      pattern: row.pattern,
      reason: row.reason,
      example_fr: row.example_fr,
    })),
  };
}

function buildUserPrompt(tasks) {
  return [
    "Generate exactly one usage nugget for each requested task.",
    "",
    "Pattern-label rules:",
    "- Use concise labels like `manquer + à + person`, `dépendre + de + thing`, `recommander + object + à + person`, or `pouvoir + infinitive`.",
    "- The pattern label must honestly describe the French example.",
    "- For a_object/de_object/combo_a tasks, the example must visibly contain the requested complement family unless status is needs_review.",
    "- For constrained à/de tasks, spell out the preposition phrase in the example. Do not use only clitics like lui, leur, y, or en.",
    "- example_en must translate the full example_fr sentence naturally.",
    "",
    `Tasks:\n${JSON.stringify(tasks.map(compactTaskForPrompt), null, 2)}`,
  ].join("\n");
}

async function callOpenAI({ model, tasks }) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY || ""}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.25,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: buildSystemPrompt() },
        { role: "user", content: buildUserPrompt(tasks) },
      ],
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenAI ${response.status}: ${text}`);
  }
  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error("OpenAI returned an empty message");
  return JSON.parse(content);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function validateModelItems(items, tasks) {
  if (!Array.isArray(items)) throw new Error("Model response did not contain an items array");
  if (items.length !== tasks.length) throw new Error(`Expected ${tasks.length} items, got ${items.length}`);
  const wanted = new Set(tasks.map((task) => task.id));
  const seen = new Set();
  for (const item of items) {
    const id = String(item?.id || "");
    if (!wanted.has(id)) throw new Error(`Unexpected generated id: ${id}`);
    if (seen.has(id)) throw new Error(`Duplicate generated id: ${id}`);
    seen.add(id);
  }
}

async function generateBatchWithRetry({ model, tasks }) {
  let lastError = null;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const data = await callOpenAI({ model, tasks });
      validateModelItems(data.items, tasks);
      return data.items;
    } catch (error) {
      lastError = error;
      await sleep(1000 * attempt);
    }
  }

  if (tasks.length === 1) throw lastError || new Error(`Failed single task ${tasks[0].id}`);
  const mid = Math.ceil(tasks.length / 2);
  const left = await generateBatchWithRetry({ model, tasks: tasks.slice(0, mid) });
  const right = await generateBatchWithRetry({ model, tasks: tasks.slice(mid) });
  return [...left, ...right];
}

function hasAPrep(text) {
  return /(?:^|\s)(?:à|au|aux)(?=\s|$)|à la\b|à l'/i.test(text);
}

function hasDePrep(text) {
  return /(?:^|\s)(?:de|du|des)(?=\s|$)|de la\b|de l'|d'/i.test(text);
}

function validateGeneratedItem(item, task) {
  const warnings = [];
  const errors = [];
  const example = normalizeSpace(item.example_fr);
  const pattern = normalizeSpace(item.pattern);
  const status = normalizeSpace(item.status || "ok");

  if (item.id !== task.id) errors.push(`id mismatch: expected ${task.id}, got ${item.id}`);
  if (normalizeSpace(item.verb) !== task.verb) errors.push(`verb mismatch: expected ${task.verb}, got ${item.verb}`);
  if (!["ok", "needs_review"].includes(status)) errors.push(`bad status: ${status}`);
  if (!pattern) errors.push("missing pattern");
  if (!normalizeSpace(item.meaning_en)) errors.push("missing meaning_en");
  if (!example) errors.push("missing example_fr");
  if (!normalizeSpace(item.example_en)) errors.push("missing example_en");
  if (/\b(?:qqn|qqch|quelqu'un|quelque chose|someone|something|object|thing|person|xxx|placeholder)\b/i.test(example)) {
    errors.push("example contains placeholder text");
  }
  if (example.split(/\s+/).length > 18) warnings.push("long example");
  if (task.family === "a_object" && status === "ok" && !hasAPrep(example)) errors.push("a_object task lacks visible à/au/aux");
  if (task.family === "de_object" && status === "ok" && !hasDePrep(example)) errors.push("de_object task lacks visible de/du/des/d'");
  if (task.family === "combo_a" && status === "ok" && !hasAPrep(example)) errors.push("combo_a task lacks visible à/au/aux");
  if (task.family !== "general" && status === "ok" && !/[+]|à|de|object|objet|person|personne|qqn|qqch/i.test(pattern)) {
    warnings.push("pattern label may be too vague for constrained family");
  }

  return { errors, warnings };
}

function normalizeGeneratedItem(item, task, model) {
  const validation = validateGeneratedItem(item, task);
  return {
    id: task.id,
    verb: task.verb,
    sense_id: task.sense_id,
    frequency: task.frequency,
    rank_index: task.rank_index,
    family: task.family,
    lefff_patterns: task.lefff_patterns,
    pattern: normalizeSpace(item.pattern),
    meaning_en: normalizeSpace(item.meaning_en),
    example_fr: normalizeSpace(item.example_fr),
    example_en: normalizeSpace(item.example_en),
    model_status: normalizeSpace(item.status || "ok"),
    model_notes: normalizeSpace(item.notes),
    source: `ai:${model}:french-top2000-usage`,
    validation,
    generated_at: new Date().toISOString(),
  };
}

function chunk(items, size) {
  const chunks = [];
  for (let i = 0; i < items.length; i += size) chunks.push(items.slice(i, i + size));
  return chunks;
}

async function loadGenerated(outDir) {
  const filePath = generatedPath(outDir);
  try {
    return await readJson(filePath);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    return {
      metadata: {
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        note: "Generated sidecar. Runtime files are not modified until merge.",
      },
      items: [],
    };
  }
}

async function writeGenerated(outDir, generated) {
  generated.metadata.updated_at = new Date().toISOString();
  generated.metadata.item_count = generated.items.length;
  generated.metadata.valid_count = generated.items.filter((item) => !item.validation.errors.length).length;
  generated.metadata.needs_review_count = generated.items.filter((item) => item.model_status === "needs_review" || item.validation.errors.length).length;
  await writeJson(generatedPath(outDir), generated);
  await fs.writeFile(reviewPath(outDir), buildGeneratedMarkdown(generated), "utf8");
}

function buildGeneratedMarkdown(generated) {
  const lines = [
    "# French Top 2,000 Generated Usage Review",
    "",
    `- Items: \`${generated.items.length}\``,
    `- Valid by local checks: \`${generated.items.filter((item) => !item.validation.errors.length).length}\``,
    `- Needs review / local errors: \`${generated.items.filter((item) => item.model_status === "needs_review" || item.validation.errors.length).length}\``,
    "",
  ];
  for (const item of generated.items) {
    const marker = item.validation.errors.length || item.model_status === "needs_review" ? "⚠️" : "✅";
    lines.push(`## ${marker} ${item.verb} — ${item.family}`);
    lines.push("");
    lines.push(`- Pattern: \`${item.pattern}\``);
    lines.push(`- Meaning: ${item.meaning_en}`);
    lines.push(`- FR: ${item.example_fr}`);
    lines.push(`- EN: ${item.example_en}`);
    if (item.validation.errors.length) lines.push(`- Errors: ${item.validation.errors.join("; ")}`);
    if (item.validation.warnings.length) lines.push(`- Warnings: ${item.validation.warnings.join("; ")}`);
    if (item.model_notes) lines.push(`- Notes: ${item.model_notes}`);
    lines.push("");
  }
  return lines.join("\n").trim() + "\n";
}

async function generate({ outDir, model, batchSize, max, retryInvalid, sleepMs }) {
  if (!await ensureOpenAiKey()) {
    throw new Error("OPENAI_API_KEY is not set");
  }
  let manifest;
  try {
    manifest = await readJson(manifestPath(outDir));
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    manifest = await writeManifest({ outDir, scope: "app-top2000" });
  }

  const generated = await loadGenerated(outDir);
  if (retryInvalid) {
    // Retry hard local validation failures and any non-OK general usage.
    // Dubious constrained à/de extras remain useful review artifacts and should
    // not trap long runs forever.
    generated.items = generated.items.filter((item) => {
      if (item.validation.errors.length) return false;
      if (item.family === "general" && item.model_status !== "ok") return false;
      return true;
    });
  }
  const doneIds = new Set(generated.items.map((item) => item.id));
  const remaining = manifest.tasks.filter((task) => !doneIds.has(task.id));
  const selected = Number.isFinite(max) && max > 0 ? remaining.slice(0, max) : remaining;
  if (!selected.length) {
    await writeGenerated(outDir, generated);
    console.log("No remaining tasks.");
    return generated;
  }

  for (const batch of chunk(selected, batchSize)) {
    const items = await generateBatchWithRetry({ model, tasks: batch });
    const byId = new Map(batch.map((task) => [task.id, task]));
    for (const item of items) {
      const task = byId.get(item.id);
      if (!task) throw new Error(`Unexpected generated id: ${item.id}`);
      generated.items.push(normalizeGeneratedItem(item, task, model));
    }
    await writeGenerated(outDir, generated);
    console.log(`Generated ${generated.items.length}/${manifest.tasks.length}`);
    if (sleepMs > 0) await sleep(sleepMs);
  }
  return generated;
}

async function revalidate({ outDir }) {
  const manifest = await readJson(manifestPath(outDir));
  const generated = await loadGenerated(outDir);
  const taskById = new Map(manifest.tasks.map((task) => [task.id, task]));
  generated.items = generated.items.map((item) => {
    const task = taskById.get(item.id);
    return task ? { ...item, validation: validateGeneratedItem(item, task) } : item;
  });
  await writeGenerated(outDir, generated);
  console.log(`Revalidated ${generated.items.length} generated rows.`);
}

function serializeVerbUsagesJs(entries) {
  return `window.verbUsages = ${JSON.stringify(entries, null, 2)};\n`;
}

async function merge({ outDir }) {
  const generated = await readJson(generatedPath(outDir));
  const usages = await readJson(USAGES_JSON);
  const existingKeys = new Set(usages.map((row) => `${row.verb}\n${row.example_fr}`));
  const mergeable = generated.items.filter((item) => !item.validation.errors.length && item.model_status === "ok");
  const rows = [];
  for (const item of mergeable) {
    const key = `${item.verb}\n${item.example_fr}`;
    if (existingKeys.has(key)) continue;
    existingKeys.add(key);
    rows.push({
      verb: item.verb,
      sense_id: item.sense_id,
      pattern: item.pattern,
      meaning_en: item.meaning_en,
      example_fr: item.example_fr,
      example_en: item.example_en,
      source: item.source,
      family: item.family,
    });
  }
  const next = [...usages, ...rows].sort((a, b) => {
    const verbCmp = String(a.verb).localeCompare(String(b.verb), "fr");
    if (verbCmp) return verbCmp;
    return String(a.sense_id || "").localeCompare(String(b.sense_id || ""), "fr");
  });
  await writeJson(USAGES_JSON, next);
  await fs.writeFile(USAGES_JS, serializeVerbUsagesJs(next), "utf8");
  console.log(`Merged ${rows.length} usage rows into runtime files.`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const command = args._[0] || "manifest";
  const outDir = path.resolve(String(args["out-dir"] || DEFAULT_OUT_DIR));
  const scope = String(args.scope || "app-top2000");
  const model = String(args.model || process.env.MODEL || "gpt-5.4");
  const batchSize = Math.max(1, Number(args["batch-size"] || process.env.BATCH_SIZE || 8));
  const sleepMs = Math.max(0, Number(args["sleep-ms"] || 250));
  const max = args.max ? Number(args.max) : Infinity;

  if (command === "manifest") {
    const manifest = await writeManifest({ outDir, scope });
    console.log(JSON.stringify(manifest.metadata, null, 2));
    return;
  }
  if (command === "generate") {
    await generate({ outDir, model, batchSize, max, retryInvalid: !!args["retry-invalid"], sleepMs });
    return;
  }
  if (command === "revalidate") {
    await revalidate({ outDir });
    return;
  }
  if (command === "merge") {
    await merge({ outDir });
    return;
  }
  throw new Error(`Unknown command: ${command}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
