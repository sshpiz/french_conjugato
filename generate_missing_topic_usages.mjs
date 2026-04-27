#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";

const MODEL = process.env.MODEL || "gpt-5.4";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const BATCH_SIZE = Number(process.env.BATCH_SIZE || 8);

const CONFIGS = {
  french: {
    scriptPath: "/Users/simeon/Desktop/proj1/js/script.js",
    constName: "BUILTIN_VERB_SET_DEFINITIONS",
    usageJsonPath: "/Users/simeon/Desktop/proj1/verb_usages.json",
    usageJsPath: "/Users/simeon/Desktop/proj1/verb_usages.js",
    languageName: "French",
    exampleField: "example_fr",
  },
  spanish: {
    scriptPath: "/Users/simeon/Desktop/spanish-verbs/js/script.js",
    constName: "SPANISH_BUILTIN_VERB_SET_DEFINITIONS",
    usageJsonPath: "/Users/simeon/Desktop/spanish-verbs/spanish_usages.json",
    usageJsPath: "/Users/simeon/Desktop/spanish-verbs/verb_usages.js",
    languageName: "Spanish",
    exampleField: "example_fr",
  },
  german: {
    scriptPath: "/Users/simeon/Desktop/german-verbs/js/script.js",
    constName: "GERMAN_BUILTIN_VERB_SET_DEFINITIONS",
    usageJsonPath: null,
    usageJsPath: "/Users/simeon/Desktop/german-verbs/verb_usages.js",
    languageName: "German",
    exampleField: "example_fr",
  },
};

function slugify(value) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toLowerCase();
}

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }
  return out;
}

async function readText(filePath) {
  return fs.readFile(filePath, "utf8");
}

function parseVerbUsagesJs(raw) {
  const match = raw.match(/window\.verbUsages\s*=\s*(\[[\s\S]*\]);?\s*$/);
  if (!match) {
    throw new Error("Could not parse window.verbUsages assignment");
  }
  return JSON.parse(match[1]);
}

function serializeVerbUsagesJs(entries) {
  return `window.verbUsages = ${JSON.stringify(entries, null, 2)};\n`;
}

async function loadUsageEntries(config) {
  if (config.usageJsonPath) {
    const jsonRaw = await readText(config.usageJsonPath);
    const data = JSON.parse(jsonRaw);
    if (!Array.isArray(data)) {
      throw new Error(`${config.usageJsonPath} must contain a JSON array`);
    }
    return data;
  }
  const jsRaw = await readText(config.usageJsPath);
  return parseVerbUsagesJs(jsRaw);
}

async function saveUsageEntries(config, entries) {
  if (config.usageJsonPath) {
    await fs.writeFile(
      config.usageJsonPath,
      JSON.stringify(entries, null, 2) + "\n",
      "utf8",
    );
  }
  await fs.writeFile(config.usageJsPath, serializeVerbUsagesJs(entries), "utf8");
}

async function loadTopicDefinitions(scriptPath, constName) {
  const text = await readText(scriptPath);
  const startNeedle = `const ${constName} = [`;
  const idx = text.indexOf(startNeedle);
  if (idx < 0) {
    throw new Error(`Could not find ${constName} in ${scriptPath}`);
  }
  const start = text.indexOf("[", idx);
  let depth = 0;
  let end = -1;
  for (let i = start; i < text.length; i += 1) {
    const ch = text[i];
    if (ch === "[") depth += 1;
    if (ch === "]") {
      depth -= 1;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }
  if (end < 0) {
    throw new Error(`Unterminated ${constName} array in ${scriptPath}`);
  }
  // eslint-disable-next-line no-new-func
  return Function(`return (${text.slice(start, end + 1)})`)();
}

function buildMissingManifest(topicDefs, usageEntries) {
  const globalUsageVerbs = new Set(
    usageEntries
      .map((entry) => String(entry.verb || "").trim())
      .filter(Boolean),
  );
  const topicUsageVerbs = new Set();
  for (const def of topicDefs) {
    const topicUsages = def.topicUsages || {};
    for (const [verb, rows] of Object.entries(topicUsages)) {
      if (Array.isArray(rows) && rows.length) topicUsageVerbs.add(verb);
    }
  }

  const assigned = new Set();
  const manifest = [];
  for (const def of topicDefs) {
    const missingVerbs = (def.verbs || []).filter(
      (verb) =>
        !assigned.has(verb) &&
        !globalUsageVerbs.has(verb) &&
        !topicUsageVerbs.has(verb),
    );
    for (const verb of missingVerbs) assigned.add(verb);
    if (missingVerbs.length) {
      manifest.push({
        topicId: def.id,
        topic: def.name,
        scope: def.scope || "",
        verbs: missingVerbs,
      });
    }
  }
  return manifest;
}

function nextSenseId(entries, verb) {
  const slug = slugify(verb);
  const current = entries.filter((row) => row.verb === verb).length;
  return `${slug}_${String(current + 1).padStart(2, "0")}`;
}

function buildSystemPrompt(languageName) {
  return [
    `You are a ${languageName} language expert writing usage nuggets for a learner app.`,
    "Return strict JSON only.",
    'Use this schema: { "items": [ { "verb": "...", "pattern": "...", "meaning_en": "...", "example_target": "...", "example_en": "...", "register": "neutral|colloquial|formal", "tags": ["..."] } ] }',
    "Rules:",
    "- Return exactly one item per requested verb.",
    "- The verb field must exactly match the requested infinitive.",
    "- The example_target sentence must be in the target language only.",
    "- Make each usage clearly topical for the requested topic.",
    "- Keep examples natural, short, and learner-friendly.",
    "- Prefer present-tense or otherwise very natural everyday phrasing.",
    "- Do not use placeholders like someone/something in the example sentence.",
    "- Pattern labels should be concise and concrete.",
    "- meaning_en should be short and natural English.",
    "- Do not use markdown fences or commentary.",
  ].join("\n");
}

function buildUserPrompt(languageName, topic, scope, verbs) {
  const verbLines = verbs.map((verb) => `- ${verb}`).join("\n");
  return [
    `Language: ${languageName}`,
    `Topic: ${topic}`,
    `Topic scope: ${scope || "general topical context"}`,
    "",
    "Generate exactly one usage nugget per verb for the following verbs:",
    verbLines,
    "",
    "Each example must feel native and topical for this topic.",
    "Use the exact infinitive in the verb field.",
    "The output array length must exactly match the number of verbs above.",
  ].join("\n");
}

async function callOpenAI({ systemPrompt, userPrompt }) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.3,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenAI error ${response.status}: ${text}`);
  }

  const payload = await response.json();
  const content = payload?.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new Error("Empty model response");
  }
  return JSON.parse(content);
}

function validateBatchItems(items, verbs) {
  if (!Array.isArray(items)) {
    throw new Error("Model output items is not an array");
  }
  if (items.length !== verbs.length) {
    throw new Error(`Expected ${verbs.length} items, got ${items.length}`);
  }
  const wanted = new Set(verbs);
  const seen = new Set();
  for (const item of items) {
    const verb = String(item.verb || "").trim();
    if (!wanted.has(verb)) {
      throw new Error(`Unexpected verb in output: ${verb}`);
    }
    if (seen.has(verb)) {
      throw new Error(`Duplicate verb in output: ${verb}`);
    }
    seen.add(verb);
    if (!String(item.pattern || "").trim()) {
      throw new Error(`Missing pattern for ${verb}`);
    }
    if (!String(item.meaning_en || "").trim()) {
      throw new Error(`Missing meaning_en for ${verb}`);
    }
    if (!String(item.example_target || "").trim()) {
      throw new Error(`Missing example_target for ${verb}`);
    }
    if (!String(item.example_en || "").trim()) {
      throw new Error(`Missing example_en for ${verb}`);
    }
  }
}

async function generateBatch(languageName, topicName, scope, verbs) {
  const systemPrompt = buildSystemPrompt(languageName);
  const userPrompt = buildUserPrompt(languageName, topicName, scope, verbs);

  let lastError = null;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const data = await callOpenAI({ systemPrompt, userPrompt });
      const items = data.items;
      validateBatchItems(items, verbs);
      return items;
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
    }
  }

  if (verbs.length === 1) {
    throw lastError || new Error(`Failed to generate usage for ${verbs[0]}`);
  }

  const mid = Math.ceil(verbs.length / 2);
  const left = await generateBatch(languageName, topicName, scope, verbs.slice(0, mid));
  const right = await generateBatch(languageName, topicName, scope, verbs.slice(mid));
  return [...left, ...right];
}

function normalizeGeneratedItem(item, existingEntries) {
  const verb = String(item.verb).trim();
  return {
    verb,
    sense_id: nextSenseId(existingEntries, verb),
    pattern: String(item.pattern || "").trim(),
    meaning_en: String(item.meaning_en || "").trim(),
    comment: "",
    example_fr: String(item.example_target || "").trim(),
    example_en: String(item.example_en || "").trim(),
    register: String(item.register || "neutral").trim().toLowerCase() || "neutral",
    idiomatic: false,
    reflexive: verb.startsWith("se ") || verb.endsWith("se"),
    tags: Array.isArray(item.tags)
      ? item.tags.map((tag) => String(tag).trim()).filter(Boolean)
      : [],
  };
}

async function processLanguage(label, config) {
  const usageEntries = await loadUsageEntries(config);
  const topicDefs = await loadTopicDefinitions(config.scriptPath, config.constName);
  const manifest = buildMissingManifest(topicDefs, usageEntries);

  let added = 0;
  for (const group of manifest) {
    const verbChunks = chunk(group.verbs, BATCH_SIZE);
    for (const verbs of verbChunks) {
      const items = await generateBatch(
        config.languageName,
        group.topic,
        group.scope,
        verbs,
      );
      for (const item of items) {
        usageEntries.push(normalizeGeneratedItem(item, usageEntries));
        added += 1;
      }
      await saveUsageEntries(config, usageEntries);
      console.log(
        `[${label}] added ${verbs.length} usage(s) for ${group.topic} (${added} total)`,
      );
    }
  }

  return { label, added, finalUsageCount: usageEntries.length };
}

async function main() {
  if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set");
  }

  const requested = process.argv.slice(2);
  const languages = requested.length ? requested : Object.keys(CONFIGS);

  for (const language of languages) {
    if (!CONFIGS[language]) {
      throw new Error(`Unknown language: ${language}`);
    }
  }

  const results = [];
  for (const language of languages) {
    results.push(await processLanguage(language, CONFIGS[language]));
  }

  console.log(JSON.stringify(results, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
