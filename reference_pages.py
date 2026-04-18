import ast
import datetime
import hashlib
import html
import json
import os
import re
import unicodedata
import urllib.parse


BASE_URL = "https://www.lesverb.es"
REFERENCE_MANIFEST_FILE = ".seo_reference_manifest.json"

LANGUAGE_CONFIGS = [
    {
        "id": "french",
        "label": "French",
        "html_lang": "fr",
        "reference_slug": "french",
        "app_path": "/french/",
        "speech_lang": "fr-FR",
        "source_js": ("root", "js/verbs.full.js"),
        "index_html": ("root", "index.html"),
        "usage_js_candidates": [("root", "verb_usages.js")],
        "tense_map_var": "frenchTenseKeyToLabel",
        "pronoun_mapping_var": "frenchPronounMapping",
        "tense_order": [
            "present",
            "imparfait",
            "futurSimple",
            "passeCompose",
            "plusQueParfait",
            "conditionnelPresent",
            "subjonctifPresent",
        ],
    },
    {
        "id": "greek",
        "label": "Greek",
        "html_lang": "el",
        "reference_slug": "greek",
        "app_path": "/greek/",
        "speech_lang": "el-GR",
        "source_js": ("desktop", "greek-verbs/greek_v1.verbs.full.js"),
        "index_html": ("desktop", "greek-verbs/index.html"),
        "usage_js_candidates": [
            ("desktop", "greek-verbs/greek_v1_usages.js"),
            ("desktop", "greek-verbs/verb_usages.js"),
        ],
        "tense_map_var": "greekTenseKeyToLabel",
        "pronoun_mapping_var": "greekPronounMapping",
        "tense_order": [
            "present",
            "imperfect",
            "aorist",
            "futureContinuous",
            "futureSimple",
            "subjunctiveContinuous",
            "subjunctiveSimple",
        ],
    },
    {
        "id": "portugese",
        "label": "Portuguese",
        "html_lang": "pt",
        "reference_slug": "portugese",
        "app_path": "/portugese/",
        "speech_lang": "pt-PT",
        "source_js": ("desktop", "portuguese-verbs/js/verbs.full.js"),
        "index_html": ("desktop", "portuguese-verbs/index.html"),
        "usage_js_candidates": [("desktop", "portuguese-verbs/verb_usages.js")],
        "tense_map_var": "portugueseTenseKeyToLabel",
        "pronoun_mapping_var": "portuguesePronounMapping",
        "tense_order": [
            "present",
            "preterite",
            "imperfect",
            "future",
            "conditional",
            "presentSubjunctive",
            "pastPerfect",
        ],
    },
    {
        "id": "spanish",
        "label": "Spanish",
        "html_lang": "es",
        "reference_slug": "spanish",
        "app_path": "/spanish/",
        "speech_lang": "es-ES",
        "source_js": ("desktop", "spanish-verbs/js/verbs.full.js"),
        "index_html": ("desktop", "spanish-verbs/index.html"),
        "usage_js_candidates": [("desktop", "spanish-verbs/verb_usages.js")],
        "tense_map_var": "spanishTenseKeyToLabel",
        "pronoun_mapping_var": "spanishPronounMapping",
        "tense_order": [
            "present",
            "preterite",
            "imperfect",
            "future",
            "conditional",
            "presentSubjunctive",
            "imperative",
        ],
    },
    {
        "id": "russian",
        "label": "Russian",
        "html_lang": "ru",
        "reference_slug": "russian",
        "app_path": "/russian/",
        "speech_lang": "ru-RU",
        "source_js": ("desktop", "russian-verbs/js/verbs.full.js"),
        "index_html": ("desktop", "russian-verbs/index.html"),
        "usage_js_candidates": [("desktop", "russian-verbs/verb_usages.js")],
        "tense_map_var": "russianTenseKeyToLabel",
        "pronoun_mapping_var": "russianPronounMapping",
        "tense_order": ["present", "past", "future", "imperative", "conditional"],
    },
    {
        "id": "catalan",
        "label": "Catalan",
        "html_lang": "ca",
        "reference_slug": "catalan",
        "app_path": "/catalan/",
        "speech_lang": "ca-ES",
        "source_js": ("desktop", "catalan-verbs/js/verbs.full.js"),
        "index_html": ("desktop", "catalan-verbs/index.html"),
        "usage_js_candidates": [("desktop", "catalan-verbs/verb_usages.js")],
        "tense_map_var": "catalanTenseKeyToLabel",
        "pronoun_mapping_var": "catalanPronounMapping",
        "tense_order": [
            "present",
            "imperfect",
            "preterite",
            "future",
            "conditional",
            "presentSubjunctive",
            "imperative",
        ],
    },
    {
        "id": "ukrainian",
        "label": "Ukrainian",
        "html_lang": "uk",
        "reference_slug": "ukrainian",
        "app_path": "/ukrainian/",
        "speech_lang": "uk-UA",
        "source_js": ("desktop", "ukrainian-verbs/js/verbs.full.js"),
        "index_html": ("desktop", "ukrainian-verbs/index.html"),
        "usage_js_candidates": [
            ("desktop", "ukrainian-verbs/verb_usages.js"),
            ("desktop", "ukrainian-verbs/js/verb_usages.js"),
        ],
        "tense_map_var": "ukrainianTenseKeyToLabel",
        "pronoun_mapping_var": "ukrainianPronounMapping",
        "tense_order": ["present", "past", "future", "imperative", "conditional"],
    },
    {
        "id": "latvian",
        "label": "Latvian",
        "html_lang": "lv",
        "reference_slug": "latvian",
        "app_path": "/latvian/",
        "speech_lang": "lv-LV",
        "source_js": ("desktop", "latvian-verbs/js/verbs.full.js"),
        "index_html": ("desktop", "latvian-verbs/index.html"),
        "usage_js_candidates": [("desktop", "latvian-verbs/verb_usages.js")],
        "tense_map_var": "latvianTenseKeyToLabel",
        "pronoun_mapping_var": "latvianPronounMapping",
        "tense_order": [
            "present",
            "preterite",
            "imperfect",
            "past",
            "future",
            "pastPerfect",
            "presentSubjunctive",
            "imperative",
            "conditional",
        ],
    },
]


def _resolve_path(root_dir, desktop_dir, path_spec):
    base, rel = path_spec
    root = root_dir if base == "root" else desktop_dir
    return os.path.join(root, rel)


def _extract_bracket_literal(js_text, start_index):
    if start_index >= len(js_text) or js_text[start_index] not in ("[", "{"):
        raise ValueError("Assigned value does not start with [ or {")

    opening = js_text[start_index]
    closing = "]" if opening == "[" else "}"
    depth = 0
    in_string = False
    string_char = ""
    escape = False

    for cursor in range(start_index, len(js_text)):
        char = js_text[cursor]

        if in_string:
            if escape:
                escape = False
            elif char == "\\":
                escape = True
            elif char == string_char:
                in_string = False
            continue

        if char in ('"', "'"):
            in_string = True
            string_char = char
            continue

        if char == opening:
            depth += 1
        elif char == closing:
            depth -= 1
            if depth == 0:
                return js_text[start_index:cursor + 1]

    raise ValueError("Could not parse literal")


def _extract_js_const_literal(js_text, const_name):
    pattern = re.compile(rf"\bconst\s+{re.escape(const_name)}\s*=\s*")
    match = pattern.search(js_text)
    if not match:
        raise ValueError(f"Could not find const {const_name}")

    index = match.end()
    while index < len(js_text) and js_text[index].isspace():
        index += 1
    return _extract_bracket_literal(js_text, index)


def _extract_js_assignment_literal(js_text, assignment_pattern):
    pattern = re.compile(assignment_pattern)
    match = pattern.search(js_text)
    if not match:
        raise ValueError(f"Could not find assignment matching pattern: {assignment_pattern}")

    index = match.end()
    while index < len(js_text) and js_text[index].isspace():
        index += 1
    return _extract_bracket_literal(js_text, index)


def _parse_js_literal(literal):
    try:
        return json.loads(literal)
    except Exception:
        cleaned = re.sub(r"\btrue\b", "True", literal)
        cleaned = re.sub(r"\bfalse\b", "False", cleaned)
        cleaned = re.sub(r"\bnull\b", "None", cleaned)
        return ast.literal_eval(cleaned)


def _load_verb_data(source_js_path):
    with open(source_js_path, "r", encoding="utf-8") as handle:
        js_text = handle.read()

    verbs = _parse_js_literal(_extract_js_const_literal(js_text, "verbs"))
    tenses = _parse_js_literal(_extract_js_const_literal(js_text, "tenses"))

    try:
        pronouns = _parse_js_literal(_extract_js_const_literal(js_text, "pronouns"))
    except Exception:
        pronouns = []
        for tense_forms in tenses.values():
            if not tense_forms:
                continue
            first_verb = next(iter(tense_forms.values()))
            pronouns = list(first_verb.keys())
            break

    return verbs, tenses, pronouns


def _load_verb_usages(source_js_path):
    with open(source_js_path, "r", encoding="utf-8") as handle:
        js_text = handle.read()
    literal = _extract_js_assignment_literal(js_text, r"\bwindow\.verbUsages\s*=\s*")
    return _parse_js_literal(literal)


def _load_language_meta(index_html_path, tense_map_var, pronoun_mapping_var):
    with open(index_html_path, "r", encoding="utf-8") as handle:
        html_text = handle.read()

    tense_labels = {}
    pronoun_mapping = {}

    if tense_map_var:
        try:
            literal = _extract_js_assignment_literal(
                html_text, rf"\bwindow\.{re.escape(tense_map_var)}\s*=\s*"
            )
            parsed = _parse_js_literal(literal)
            if isinstance(parsed, dict):
                tense_labels = parsed
        except Exception:
            tense_labels = {}

    if pronoun_mapping_var:
        try:
            literal = _extract_js_assignment_literal(
                html_text, rf"\bwindow\.{re.escape(pronoun_mapping_var)}\s*=\s*"
            )
            parsed = _parse_js_literal(literal)
            if isinstance(parsed, dict):
                pronoun_mapping = parsed
        except Exception:
            pronoun_mapping = {}

    return tense_labels, pronoun_mapping


def _humanize_tense_key(key):
    spaced = re.sub(r"([a-z])([A-Z])", r"\1 \2", key)
    spaced = spaced.replace("_", " ").strip()
    return spaced if spaced else key


def _slugify(value):
    normalized = unicodedata.normalize("NFKC", str(value or "")).strip().lower()
    normalized = normalized.replace("’", "").replace("'", "")
    normalized = re.sub(r"[^\w\s-]", "", normalized, flags=re.UNICODE)
    normalized = re.sub(r"[\s_]+", "-", normalized, flags=re.UNICODE)
    normalized = re.sub(r"-{2,}", "-", normalized).strip("-")
    return normalized or "verb"


def _unique_slug(value, used_slugs):
    base = _slugify(value)
    candidate = base
    index = 2
    while candidate in used_slugs:
        candidate = f"{base}-{index}"
        index += 1
    used_slugs.add(candidate)
    return candidate


def _canonical_pronoun_for_link(pronoun):
    text = str(pronoun or "").strip()
    if "/" in text:
        return text.split("/", 1)[0].strip()
    return text


def _canonical_pronoun_for_audio(pronoun, pronoun_mapping):
    text = str(pronoun or "").strip()
    if not text:
        return text
    if text in pronoun_mapping:
        return text
    for combined, variants in pronoun_mapping.items():
        if isinstance(variants, (list, tuple)) and text in variants:
            return str(combined)
    return text


def _build_app_link(app_path, pronoun, infinitive, tense_key):
    params = urllib.parse.urlencode(
        {
            "pronoun": _canonical_pronoun_for_link(pronoun),
            "verb": infinitive,
            "tense": tense_key,
        },
        quote_via=urllib.parse.quote,
    )
    return f"{app_path}#{params}"


def _rank_frequency(entry):
    rank = {
        "top20": 0,
        "top50": 1,
        "top100": 2,
        "top500": 3,
        "top1000": 4,
        "rare": 5,
    }
    return rank.get(entry.get("frequency"), 99), entry.get("infinitive", "")


def _build_related_index(verbs):
    entries = [entry for entry in verbs if entry.get("infinitive")]
    sorted_entries = sorted(entries, key=_rank_frequency)
    buckets = {4: {}, 3: {}, 2: {}}

    for entry in entries:
        infinitive = str(entry.get("infinitive", "")).lower()
        for width in (4, 3, 2):
            if len(infinitive) < width:
                continue
            suffix = infinitive[-width:]
            buckets[width].setdefault(suffix, []).append(entry)

    for width_buckets in buckets.values():
        for suffix in list(width_buckets.keys()):
            width_buckets[suffix].sort(key=_rank_frequency)

    return {"all_sorted": sorted_entries, "buckets": buckets}


def _pick_related_verbs(index, target_infinitive, count=3):
    target = str(target_infinitive or "")
    lowered = target.lower()
    similar = []

    for width in (4, 3, 2):
        if len(lowered) < width:
            continue
        suffix = lowered[-width:]
        bucket = index["buckets"][width].get(suffix, [])
        filtered = [entry for entry in bucket if entry.get("infinitive") != target]
        if len(filtered) >= count:
            return filtered[:count]
        if not similar and filtered:
            similar = filtered[:]

    used = {entry.get("infinitive") for entry in similar}
    used.add(target)
    for entry in index["all_sorted"]:
        infinitive = entry.get("infinitive")
        if infinitive in used:
            continue
        similar.append(entry)
        used.add(infinitive)
        if len(similar) >= count:
            break

    return similar[:count]


def _render_reference_html(
    *,
    html_lang,
    speech_lang,
    base_url,
    app_path,
    reference_path,
    language_reference_path,
    language_label,
    infinitive,
    translation,
    pronouns,
    tense_rows,
    cta_pronoun,
    cta_tense,
    pronoun_mapping,
    related_links,
    usage_rows,
):
    title = f"{infinitive} conjugation ({language_label}) - all tenses"
    description = (
        f'Full conjugation of "{infinitive}" in {language_label.lower()}. '
        "All major tenses in one fast reference page."
    )
    canonical = f"{base_url}{reference_path}"
    app_link = _build_app_link(app_path, cta_pronoun, infinitive, cta_tense)

    jump_links = " · ".join(
        f'<a href="#detail-tense-{html.escape(tense_key)}">{html.escape(tense_label)}</a>'
        for tense_key, tense_label, _ in tense_rows
    )

    tense_sections = []
    for tense_key, tense_label, forms in tense_rows:
        rows = []
        for pronoun in pronouns:
            audio_pronoun_key = _canonical_pronoun_for_audio(pronoun, pronoun_mapping)
            conjugation = forms.get(pronoun, "—")

            pronoun_data_speak = html.escape(pronoun)
            pronoun_data_audio_id = html.escape(f"shared:pronoun:{audio_pronoun_key}")

            conjugation_class = "conjugation" if conjugation == "—" else "conjugation tappable-audio"
            conjugation_data_speak = ""
            conjugation_data_audio_id = ""
            if conjugation != "—":
                conjugation_data_speak = f' data-speak="{html.escape(conjugation)}"'
                conjugation_data_audio_id = (
                    f' data-audio-id="{html.escape(f"conj:{infinitive}:{tense_key}:{audio_pronoun_key}")}"'
                )

            rows.append(
                "<div class=\"conjugation-item\">"
                f"<span class=\"pronoun tappable-audio\" data-speak=\"{pronoun_data_speak}\" data-audio-id=\"{pronoun_data_audio_id}\">{html.escape(pronoun)}</span>"
                f"<span class=\"{conjugation_class}\"{conjugation_data_speak}{conjugation_data_audio_id}>{html.escape(conjugation)}</span>"
                "</div>"
            )

        tense_sections.append(
            f"""
      <div class="tense-block" id="detail-tense-{html.escape(tense_key)}">
        <h4 class="tense-header tappable-audio" data-speak="{html.escape(tense_label)}" data-audio-id="shared:tense:{html.escape(tense_key)}">{html.escape(tense_label)}</h4>
        <div class="conjugation-grid">
          {''.join(rows)}
        </div>
      </div>
"""
        )

    usage_section = ""
    if usage_rows:
        usage_items = []
        for usage in usage_rows:
            pattern = html.escape((usage.get("pattern") or "").strip())
            example_native_raw = (
                usage.get("example_fr")
                or usage.get("example")
                or usage.get("example_native")
                or ""
            ).strip()
            example_en = html.escape((usage.get("example_en") or "").strip())
            example_native = html.escape(example_native_raw)
            sense_id = (usage.get("sense_id") or "").strip()
            audio_attr = f' data-audio-id="{html.escape(f"usage:{sense_id}")}"' if sense_id else ""
            usage_items.append(
                "<div class=\"usage-item\">"
                f"<span class=\"usage-pattern\">{pattern}</span>"
                f"<span class=\"usage-fr tappable-audio\" data-speak=\"{example_native}\"{audio_attr}>{example_native}</span>"
                + (f"<span class=\"usage-en\">{example_en}</span>" if example_en else "")
                + "</div>"
            )

        usage_section = f"""
      <section class="verb-usages-detail-section">
        <h3 class="verb-usages-heading">Usages &amp; examples</h3>
        {''.join(usage_items)}
      </section>
"""

    related_link_markup = []
    for item in related_links:
        related_infinitive = item.get("infinitive", "")
        related_translation = item.get("translation", "")
        related_reference_path = item.get("reference_path", "")
        related_app_link = item.get("app_link", "")
        related_link_markup.append(
            "<li>"
            f'<a href="{html.escape(related_reference_path)}">{html.escape(related_infinitive)}</a>'
            + (f' <span class="translation">({html.escape(related_translation)})</span>' if related_translation else "")
            + (f' <a class="related-app-link" href="{html.escape(related_app_link)}">Open in app</a>' if related_app_link else "")
            + "</li>"
        )

    language_reference_url = f"{base_url}{language_reference_path}"
    structured_data = json.dumps(
        {
            "@context": "https://schema.org",
            "@graph": [
                {
                    "@type": "DefinedTerm",
                    "name": f"{infinitive} conjugation",
                    "inDefinedTermSet": f"{language_label} verbs",
                    "url": canonical,
                    "description": description,
                },
                {
                    "@type": "BreadcrumbList",
                    "itemListElement": [
                        {
                            "@type": "ListItem",
                            "position": 1,
                            "name": "Home",
                            "item": f"{base_url}/",
                        },
                        {
                            "@type": "ListItem",
                            "position": 2,
                            "name": f"{language_label} verbs",
                            "item": language_reference_url,
                        },
                        {
                            "@type": "ListItem",
                            "position": 3,
                            "name": f"{infinitive} conjugation",
                            "item": canonical,
                        },
                    ],
                },
            ],
        },
        ensure_ascii=False,
    ).replace("</", "<\\/")

    return f"""<!doctype html>
<html lang="{html.escape(html_lang)}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{html.escape(title)}</title>
  <meta name="description" content="{html.escape(description)}">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="{html.escape(canonical)}">
  <script type="application/ld+json">{structured_data}</script>
  <style>
    :root {{
      --primary-bg: #f4f7f9;
      --card-bg: #ffffff;
      --text-color: #2c3e50;
      --accent-color: #3498db;
      --meta-color: #5f6f82;
      --border-color: #e0e6ed;
      --shadow: 0 4px 15px rgba(0,0,0,0.08);
    }}
    * {{ box-sizing: border-box; }}
    body {{
      margin: 0;
      background: var(--primary-bg);
      color: var(--text-color);
      font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.45;
      padding: 1rem;
    }}
    .page-wrap {{
      max-width: 840px;
      margin: 0 auto;
    }}
    .breadcrumbs {{
      margin: 0 0 0.45rem;
      color: var(--meta-color);
      font-size: 0.85rem;
      line-height: 1.4;
    }}
    .breadcrumbs a {{
      color: var(--meta-color);
      text-decoration: none;
    }}
    .breadcrumbs a:hover {{
      text-decoration: underline;
    }}
    .breadcrumbs .sep {{
      margin: 0 0.35rem;
    }}
    .seo-title {{
      margin: 0.2rem 0 0.4rem;
      text-align: center;
      font-size: clamp(1.3rem, 2.8vw, 1.8rem);
      line-height: 1.2;
    }}
    .summary {{
      margin: 0.35rem 0 0.85rem;
      color: var(--meta-color);
      font-size: 0.95rem;
      text-align: center;
    }}
    .top-actions {{
      margin: 0 0 0.9rem;
      display: flex;
      justify-content: center;
      gap: 0.6rem;
      flex-wrap: wrap;
    }}
    .open-app-btn {{
      text-decoration: none;
      border: 1px solid var(--accent-color);
      color: #fff;
      background: var(--accent-color);
      border-radius: 999px;
      padding: 0.55rem 0.95rem;
      font-weight: 700;
      font-size: 0.92rem;
    }}
    .browse-language-btn {{
      text-decoration: none;
      border: 1px solid var(--border-color);
      color: var(--text-color);
      background: #fff;
      border-radius: 999px;
      padding: 0.55rem 0.95rem;
      font-weight: 600;
      font-size: 0.92rem;
    }}
    .jump {{
      border-top: 1px solid var(--border-color);
      border-bottom: 1px solid var(--border-color);
      margin: 0 0 1rem;
      padding: 0.7rem 0.2rem;
      font-size: 0.92rem;
      color: var(--meta-color);
      text-align: center;
    }}
    .jump a {{
      color: var(--accent-color);
      text-decoration: none;
    }}
    .jump a:hover {{ text-decoration: underline; }}

    #verb-detail-container {{
      background: var(--card-bg);
      border-radius: 16px;
      padding: 1rem;
      box-shadow: var(--shadow);
      overflow-y: auto;
      max-height: 70vh;
    }}
    .verb-detail-header {{
      text-align: center;
      margin-bottom: 1.5rem;
      font-size: 1.5rem;
      font-weight: 700;
    }}
    .verb-detail-header .infinitive {{
      font-size: 1.5rem;
      font-weight: 700;
    }}
    .verb-detail-header .translation {{
      font-size: 1rem;
      font-weight: 400;
      color: var(--meta-color);
      margin-top: 0.25rem;
    }}
    .tense-block {{
      margin-bottom: 1.75rem;
    }}
    .tense-block:last-child {{
      margin-bottom: 0.5rem;
    }}
    .tense-header {{
      font-size: 1rem;
      font-weight: 600;
      margin-bottom: 0.75rem;
      padding-bottom: 0.25rem;
      border-bottom: 1px solid var(--border-color);
      color: var(--accent-color);
    }}
    .conjugation-grid {{
      display: grid;
      grid-template-rows: repeat(3, auto);
      grid-template-columns: repeat(2, 1fr);
      grid-auto-flow: column;
      gap: 0.5rem 1rem;
    }}
    .conjugation-item {{
      display: flex;
      align-items: baseline;
      padding: 0.2rem 0;
    }}
    .conjugation-item .pronoun {{
      color: var(--meta-color);
      font-size: 0.9rem;
      width: 75px;
      flex-shrink: 0;
    }}
    .conjugation {{
      font-weight: 600;
    }}

    .tappable-audio {{
      cursor: pointer;
      display: inline;
      padding: 0;
      margin: 0;
      line-height: inherit;
      -webkit-tap-highlight-color: transparent !important;
      -webkit-touch-callout: none;
      -webkit-user-select: none;
      user-select: none;
      transition: none !important;
      border: none;
      background: none;
      text-decoration: none;
    }}
    .tappable-audio.playable-copying {{
      text-shadow: 0 0 0.55rem rgba(82, 196, 26, 0.45);
    }}
    .tappable-audio:focus,
    .tappable-audio:active,
    .tappable-audio:hover,
    .tappable-audio:visited {{
      background: transparent !important;
      outline: none !important;
      box-shadow: none !important;
      text-decoration: none !important;
      border: none !important;
    }}

    .usage-item {{
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      gap: 0.3em 0.5em;
      padding: 0.38rem 0.18rem;
      border-bottom: 1px solid var(--border-color);
      line-height: 1.4;
      border-radius: 12px;
      transition: background-color 150ms ease;
    }}
    .usage-item:last-child {{ border-bottom: none; }}
    .usage-pattern {{
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--accent-color);
      white-space: nowrap;
      flex-shrink: 0;
    }}
    .usage-fr {{
      font-size: 0.98rem;
      color: var(--text-color);
      font-style: italic;
      line-height: 1.5;
    }}
    .usage-en {{
      font-size: 0.86rem;
      color: var(--meta-color);
      line-height: 1.45;
    }}
    .usage-en::before {{ content: "· "; }}
    .verb-usages-detail-section {{
      margin-top: 2.5rem;
      padding-top: 0.75rem;
      border-top: 1px solid var(--border-color);
    }}
    .verb-usages-heading {{
      margin: 0 0 0.85rem;
      font-size: 1.2rem;
      color: var(--accent-color);
    }}
    .verb-usages-detail-section .usage-item {{
      padding: 0.65rem 0;
    }}

    .related {{
      margin-top: 1.8rem;
      padding-top: 0.8rem;
      border-top: 1px solid var(--border-color);
    }}
    .related h2 {{
      margin: 0 0 0.6rem;
      color: var(--accent-color);
      font-size: 1.05rem;
    }}
    .related ul {{
      margin: 0;
      padding-left: 1.1rem;
    }}
    .related li {{
      margin: 0.3rem 0;
    }}
    .related a {{
      color: var(--text-color);
    }}
    .related .related-app-link {{
      margin-left: 0.35rem;
      color: var(--accent-color);
      font-size: 0.85rem;
    }}
    .related .translation {{
      color: var(--meta-color);
      font-size: 0.9rem;
    }}

    @media (max-width: 720px) {{
      .conjugation-grid {{
        grid-template-columns: 1fr;
        grid-template-rows: none;
        grid-auto-flow: row;
      }}
      #verb-detail-container {{
        max-height: none;
      }}
    }}
  </style>
</head>
<body>
  <main class="page-wrap">
    <nav class="breadcrumbs" aria-label="Breadcrumb">
      <a href="/">Home</a><span class="sep">/</span><a href="{html.escape(language_reference_path)}">{html.escape(language_label)}</a><span class="sep">/</span><span aria-current="page">{html.escape(infinitive)}</span>
    </nav>
    <h1 class="seo-title">{html.escape(infinitive)} conjugation in {html.escape(language_label)}</h1>

    <p class="summary">
      "{html.escape(infinitive)}" is a common {html.escape(language_label.lower())} verb meaning "{html.escape(translation)}". Below are its conjugations across major tenses.
    </p>

    <div class="top-actions">
      <a class="open-app-btn" href="{html.escape(app_link)}">Open This Verb In App</a>
      <a class="browse-language-btn" href="{html.escape(language_reference_path)}">Browse {html.escape(language_label)} Verbs</a>
    </div>

    <nav class="jump" aria-label="Jump to tense">
      Jump to: {jump_links}
    </nav>

    <div id="verb-detail-container">
      <div class="verb-detail-header">
        <span class="infinitive tappable-audio" data-speak="{html.escape(infinitive)}" data-audio-id="lemma:{html.escape(infinitive)}">{html.escape(infinitive)}</span>
        <p class="translation">{html.escape(translation)}</p>
      </div>

      {''.join(tense_sections)}
      {usage_section}
    </div>

    <section class="related">
      <h2>Related Verbs</h2>
      <ul>
        {''.join(related_link_markup)}
      </ul>
    </section>
  </main>

  <script>
    (() => {{
      const synth = ("speechSynthesis" in window) ? window.speechSynthesis : null;
      let touchSuppressionUntil = 0;
      const speechLang = {json.dumps(speech_lang)};

      const pickVoice = () => {{
        if (!synth || typeof synth.getVoices !== "function") return null;
        const voices = synth.getVoices() || [];
        const langPrefix = (speechLang || "en").split("-")[0].toLowerCase();
        return voices.find((voice) => String(voice.lang || "").toLowerCase().startsWith(String(speechLang || "").toLowerCase()))
          || voices.find((voice) => String(voice.lang || "").toLowerCase().startsWith(langPrefix))
          || null;
      }};

      let cachedVoice = pickVoice();
      if (synth && "onvoiceschanged" in synth) {{
        synth.onvoiceschanged = () => {{
          cachedVoice = pickVoice();
        }};
      }}

      const speak = (text) => {{
        if (!synth || !text) return;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = speechLang || "en";
        if (cachedVoice) {{
          utterance.voice = cachedVoice;
        }}
        if (synth.speaking) {{
          synth.cancel();
        }}
        synth.speak(utterance);
      }};

      const playElement = (element) => {{
        if (!element) return;
        const text = String(element.dataset.speak || element.textContent || "").trim();
        if (!text) return;
        element.classList.add("playable-copying");
        window.setTimeout(() => element.classList.remove("playable-copying"), 260);
        speak(text);
      }};

      document.addEventListener("touchend", (event) => {{
        const target = event.target instanceof Element ? event.target.closest(".tappable-audio") : null;
        if (!target) return;
        touchSuppressionUntil = Date.now() + 650;
        playElement(target);
      }}, {{ passive: true }});

      document.addEventListener("click", (event) => {{
        const target = event.target instanceof Element ? event.target.closest(".tappable-audio") : null;
        if (!target) return;
        if (Date.now() < touchSuppressionUntil) return;
        playElement(target);
      }});
    }})();
  </script>
</body>
</html>
"""


def _render_language_index_html(
    *,
    html_lang,
    base_url,
    language_label,
    language_reference_path,
    app_path,
    verb_links,
):
    title = f"{language_label} verb conjugations reference"
    description = (
        f"Browse {len(verb_links)} {language_label.lower()} verbs with full conjugation tables. "
        "Open any verb in the practice app."
    )
    canonical = f"{base_url}{language_reference_path}"
    item_list = [
        {
            "@type": "ListItem",
            "position": i + 1,
            "url": f'{base_url}{item["reference_path"]}',
            "name": item["infinitive"],
        }
        for i, item in enumerate(verb_links[:100])
    ]
    structured_data = json.dumps(
        {
            "@context": "https://schema.org",
            "@graph": [
                {
                    "@type": "CollectionPage",
                    "name": title,
                    "description": description,
                    "url": canonical,
                },
                {
                    "@type": "ItemList",
                    "name": f"{language_label} verb references",
                    "itemListElement": item_list,
                },
            ],
        },
        ensure_ascii=False,
    ).replace("</", "<\\/")

    rows = []
    for item in verb_links:
        translation = item.get("translation", "")
        rows.append(
            "<li>"
            f'<a href="{html.escape(item["reference_path"])}">{html.escape(item["infinitive"])}</a>'
            + (f' <span class="translation">({html.escape(translation)})</span>' if translation else "")
            + f' <a class="open-app" href="{html.escape(item["app_link"])}">Open in app</a>'
            + "</li>"
        )

    return f"""<!doctype html>
<html lang="{html.escape(html_lang)}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{html.escape(title)}</title>
  <meta name="description" content="{html.escape(description)}">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="{html.escape(canonical)}">
  <script type="application/ld+json">{structured_data}</script>
  <style>
    body {{
      margin: 0;
      background: #f4f7f9;
      color: #2c3e50;
      font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.45;
      padding: 1rem;
    }}
    .wrap {{
      max-width: 920px;
      margin: 0 auto;
      background: #fff;
      border-radius: 16px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.08);
      padding: 1rem 1.1rem 1.2rem;
    }}
    .breadcrumbs {{
      margin: 0 0 0.45rem;
      color: #5f6f82;
      font-size: 0.85rem;
    }}
    .breadcrumbs a {{
      color: #5f6f82;
      text-decoration: none;
    }}
    .breadcrumbs .sep {{
      margin: 0 0.35rem;
    }}
    h1 {{
      margin: 0.25rem 0 0.35rem;
      font-size: clamp(1.25rem, 2.6vw, 1.8rem);
    }}
    p {{
      margin: 0 0 0.8rem;
      color: #5f6f82;
    }}
    .app-link {{
      display: inline-block;
      margin: 0 0 1rem;
      text-decoration: none;
      border: 1px solid #3498db;
      color: #fff;
      background: #3498db;
      border-radius: 999px;
      padding: 0.5rem 0.9rem;
      font-weight: 700;
      font-size: 0.9rem;
    }}
    ul {{
      margin: 0;
      padding-left: 1.1rem;
      columns: 2;
      column-gap: 2rem;
    }}
    li {{
      break-inside: avoid;
      margin: 0.28rem 0;
    }}
    .translation {{
      color: #5f6f82;
      font-size: 0.9rem;
    }}
    .open-app {{
      color: #3498db;
      font-size: 0.85rem;
      margin-left: 0.3rem;
    }}
    @media (max-width: 760px) {{
      ul {{ columns: 1; }}
    }}
  </style>
</head>
<body>
  <main class="wrap">
    <nav class="breadcrumbs" aria-label="Breadcrumb">
      <a href="/">Home</a><span class="sep">/</span><span aria-current="page">{html.escape(language_label)}</span>
    </nav>
    <h1>{html.escape(language_label)} Verb Conjugations</h1>
    <p>Choose a verb to view its full conjugation table and tap any form to hear it.</p>
    <a class="app-link" href="{html.escape(app_path)}">Open {html.escape(language_label)} App</a>
    <ul>
      {''.join(rows)}
    </ul>
  </main>
</body>
</html>
"""


def _render_reference_home_html(*, base_url, language_rows):
    title = "Verb conjugation reference"
    description = (
        "Browse language-specific verb reference indexes with full conjugation tables and open any verb in its practice app."
    )
    canonical = f"{base_url}/reference/"
    item_list = [
        {
            "@type": "ListItem",
            "position": i + 1,
            "url": f'{base_url}{item["reference_path"]}',
            "name": f'{item["label"]} verb reference',
        }
        for i, item in enumerate(language_rows)
    ]
    structured_data = json.dumps(
        {
            "@context": "https://schema.org",
            "@graph": [
                {
                    "@type": "CollectionPage",
                    "name": title,
                    "description": description,
                    "url": canonical,
                },
                {
                    "@type": "ItemList",
                    "name": "Language reference indexes",
                    "itemListElement": item_list,
                },
            ],
        },
        ensure_ascii=False,
    ).replace("</", "<\\/")

    cards = []
    for item in language_rows:
        cards.append(
            '<li class="language-card">'
            f'<a class="language-link" href="{html.escape(item["reference_path"])}">'
            f'<span class="language-name">{html.escape(item["label"])}</span>'
            f'<span class="language-count">{int(item["count"])} verbs</span>'
            "</a>"
            f'<a class="open-app" href="{html.escape(item["app_path"])}">Open app</a>'
            "</li>"
        )

    return f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{html.escape(title)}</title>
  <meta name="description" content="{html.escape(description)}">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="{html.escape(canonical)}">
  <script type="application/ld+json">{structured_data}</script>
  <style>
    body {{
      margin: 0;
      background: #f4f7f9;
      color: #2c3e50;
      font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.45;
      padding: 1rem;
    }}
    .wrap {{
      max-width: 920px;
      margin: 0 auto;
      background: #fff;
      border-radius: 16px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.08);
      padding: 1rem 1.1rem 1.2rem;
    }}
    .breadcrumbs {{
      margin: 0 0 0.45rem;
      color: #5f6f82;
      font-size: 0.85rem;
    }}
    .breadcrumbs a {{
      color: #5f6f82;
      text-decoration: none;
    }}
    .breadcrumbs .sep {{
      margin: 0 0.35rem;
    }}
    h1 {{
      margin: 0.25rem 0 0.35rem;
      font-size: clamp(1.25rem, 2.6vw, 1.8rem);
    }}
    p {{
      margin: 0 0 1rem;
      color: #5f6f82;
    }}
    ul {{
      list-style: none;
      margin: 0;
      padding: 0;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 0.85rem;
    }}
    .language-card {{
      border: 1px solid #d8e2ec;
      border-radius: 14px;
      padding: 0.85rem 0.9rem;
      background: linear-gradient(180deg, #fbfdff, #f5f9fc);
    }}
    .language-link {{
      display: block;
      text-decoration: none;
      color: inherit;
      margin-bottom: 0.45rem;
    }}
    .language-name {{
      display: block;
      font-weight: 800;
      font-size: 1rem;
      margin-bottom: 0.12rem;
    }}
    .language-count {{
      display: block;
      color: #5f6f82;
      font-size: 0.9rem;
    }}
    .open-app {{
      color: #3498db;
      font-size: 0.9rem;
      font-weight: 700;
      text-decoration: none;
    }}
  </style>
</head>
<body>
  <main class="wrap">
    <nav class="breadcrumbs" aria-label="Breadcrumb">
      <a href="/">Home</a><span class="sep">/</span><span aria-current="page">Reference</span>
    </nav>
    <h1>Verb Conjugation Reference</h1>
    <p>Pick a language to browse verb reference pages and jump straight into the corresponding practice app.</p>
    <ul>
      {''.join(cards)}
    </ul>
  </main>
</body>
</html>
"""


def _write_text(path, text):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as handle:
        handle.write(text)


def _read_reference_manifest(dist_dir):
    manifest_path = os.path.join(dist_dir, "reference", REFERENCE_MANIFEST_FILE)
    if not os.path.exists(manifest_path):
        return manifest_path, {"entries": {}}
    try:
        with open(manifest_path, "r", encoding="utf-8") as handle:
            data = json.load(handle)
        if not isinstance(data, dict):
            return manifest_path, {"entries": {}}
        if not isinstance(data.get("entries"), dict):
            data["entries"] = {}
        return manifest_path, data
    except Exception:
        return manifest_path, {"entries": {}}


def _write_reference_manifest(manifest_path, entries):
    payload = {
        "version": 1,
        "generated_at": datetime.datetime.utcnow().replace(microsecond=0).isoformat() + "Z",
        "entries": entries,
    }
    _write_text(manifest_path, json.dumps(payload, ensure_ascii=False, indent=2, sort_keys=True) + "\n")


def _sha256_text(text):
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def _write_sitemap(dist_dir, generated_paths, app_paths, lastmod_by_path):
    entries = ["/"] + sorted(set(app_paths)) + generated_paths
    now = datetime.datetime.utcnow().replace(microsecond=0).isoformat() + "Z"

    unique_entries = []
    seen = set()
    for entry in entries:
        if entry in seen:
            continue
        seen.add(entry)
        unique_entries.append(entry)

    lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ]
    for entry in unique_entries:
        lines.append("  <url>")
        lines.append(f"    <loc>{html.escape(BASE_URL + entry)}</loc>")
        lines.append(f"    <lastmod>{lastmod_by_path.get(entry, now)}</lastmod>")
        lines.append("  </url>")
    lines.append("</urlset>")
    sitemap_path = os.path.join(dist_dir, "sitemap.xml")
    _write_text(sitemap_path, "\n".join(lines) + "\n")
    return sitemap_path


def _try_load_usages(usage_candidates):
    for usage_path in usage_candidates:
        if not os.path.exists(usage_path):
            continue
        try:
            usages = _load_verb_usages(usage_path)
            if isinstance(usages, list):
                return usages
        except Exception:
            continue
    return []


def _build_usage_index(usages):
    index = {}
    for usage in usages:
        infinitive = (usage.get("verb") or "").strip()
        if not infinitive:
            continue
        index.setdefault(infinitive, []).append(usage)
    return index


def generate_reference_pages(root_dir, dist_dir):
    desktop_dir = os.path.dirname(root_dir)
    limit_env = os.environ.get("SEO_REFERENCE_LIMIT", "").strip()
    per_language_limit = int(limit_env) if limit_env.isdigit() and int(limit_env) > 0 else None

    manifest_path, old_manifest = _read_reference_manifest(dist_dir)
    old_entries = old_manifest.get("entries", {})
    now_iso = datetime.datetime.utcnow().replace(microsecond=0).isoformat() + "Z"

    generated_reference_paths = []
    sample_paths = []
    by_language_counts = {}
    generated_languages = []
    warnings = []
    new_manifest_entries = {}
    lastmod_by_path = {}
    reference_home_rows = []

    for config in LANGUAGE_CONFIGS:
        source_js_path = _resolve_path(root_dir, desktop_dir, config["source_js"])
        index_html_path = _resolve_path(root_dir, desktop_dir, config["index_html"])
        usage_candidates = [
            _resolve_path(root_dir, desktop_dir, path_spec)
            for path_spec in config.get("usage_js_candidates", [])
        ]

        if not os.path.exists(source_js_path):
            warnings.append(f'{config["id"]}: missing source JS ({source_js_path})')
            continue
        if not os.path.exists(index_html_path):
            warnings.append(f'{config["id"]}: missing index HTML ({index_html_path})')
            continue

        verbs, tenses, pronouns = _load_verb_data(source_js_path)
        tense_labels, pronoun_mapping = _load_language_meta(
            index_html_path=index_html_path,
            tense_map_var=config.get("tense_map_var"),
            pronoun_mapping_var=config.get("pronoun_mapping_var"),
        )
        usages = _try_load_usages(usage_candidates)
        usage_index = _build_usage_index(usages)

        related_index = _build_related_index(verbs)
        used_slugs = set()
        language_count = 0

        tense_order = config.get("tense_order") or list(tenses.keys())
        selected_verbs = verbs[:per_language_limit] if per_language_limit else verbs
        language_reference_path = f'/reference/{config["reference_slug"]}/'

        page_records = []
        reference_path_by_infinitive = {}
        for verb_record in selected_verbs:
            infinitive = (verb_record.get("infinitive") or "").strip()
            if not infinitive:
                continue
            slug = _unique_slug(infinitive, used_slugs)
            reference_path = f'/reference/{config["reference_slug"]}/{slug}/'
            output_path = os.path.join(
                dist_dir,
                "reference",
                config["reference_slug"],
                slug,
                "index.html",
            )
            record = {
                "verb_record": verb_record,
                "infinitive": infinitive,
                "slug": slug,
                "reference_path": reference_path,
                "output_path": output_path,
            }
            page_records.append(record)
            reference_path_by_infinitive.setdefault(infinitive, reference_path)

        language_index_rows = []

        for record in page_records:
            verb_record = record["verb_record"]
            infinitive = record["infinitive"]
            tense_rows = []
            for tense_key in tense_order:
                forms = tenses.get(tense_key, {}).get(infinitive)
                if not forms:
                    continue
                tense_label = str(tense_labels.get(tense_key) or _humanize_tense_key(tense_key))
                tense_rows.append((tense_key, tense_label, forms))
            if not tense_rows:
                continue

            cta_pronoun = pronouns[0] if pronouns else "je"
            cta_tense = tense_rows[0][0]
            translation = (verb_record.get("translation") or "").strip() or "to practice"

            related_verbs = _pick_related_verbs(related_index, infinitive, count=3)
            usage_rows = usage_index.get(infinitive, [])[:4]

            related_links = []
            for related_entry in related_verbs:
                related_infinitive = (related_entry.get("infinitive") or "").strip()
                if not related_infinitive:
                    continue
                related_reference_path = reference_path_by_infinitive.get(related_infinitive)
                if not related_reference_path:
                    continue
                related_links.append(
                    {
                        "infinitive": related_infinitive,
                        "translation": related_entry.get("translation", ""),
                        "reference_path": related_reference_path,
                        "app_link": _build_app_link(app_path=config["app_path"], pronoun=cta_pronoun, infinitive=related_infinitive, tense_key=cta_tense),
                    }
                )

            html_page = _render_reference_html(
                html_lang=config["html_lang"],
                speech_lang=config["speech_lang"],
                base_url=BASE_URL,
                app_path=config["app_path"],
                reference_path=record["reference_path"],
                language_reference_path=language_reference_path,
                language_label=config["label"],
                infinitive=infinitive,
                translation=translation,
                pronouns=pronouns,
                tense_rows=tense_rows,
                cta_pronoun=cta_pronoun,
                cta_tense=cta_tense,
                pronoun_mapping=pronoun_mapping,
                related_links=related_links,
                usage_rows=usage_rows,
            )

            content_hash = _sha256_text(html_page)
            previous_entry = old_entries.get(record["reference_path"], {})
            previous_hash = previous_entry.get("hash")
            previous_lastmod = previous_entry.get("lastmod")

            if previous_hash == content_hash and previous_lastmod:
                page_lastmod = previous_lastmod
            else:
                page_lastmod = now_iso

            if not (previous_hash == content_hash and os.path.exists(record["output_path"])):
                _write_text(record["output_path"], html_page)

            new_manifest_entries[record["reference_path"]] = {"hash": content_hash, "lastmod": page_lastmod}
            lastmod_by_path[record["reference_path"]] = page_lastmod
            generated_reference_paths.append(record["reference_path"])

            if len(sample_paths) < 8:
                sample_paths.append(record["output_path"])
            language_count += 1
            language_index_rows.append(
                {
                    "infinitive": infinitive,
                    "translation": translation,
                    "reference_path": record["reference_path"],
                    "app_link": _build_app_link(
                        app_path=config["app_path"],
                        pronoun=cta_pronoun,
                        infinitive=infinitive,
                        tense_key=cta_tense,
                    ),
                }
            )

        if language_count > 0:
            by_language_counts[config["id"]] = language_count
            generated_languages.append(config["id"])
            reference_home_rows.append(
                {
                    "label": config["label"],
                    "reference_path": language_reference_path,
                    "app_path": config["app_path"],
                    "count": language_count,
                }
            )

            language_index_html = _render_language_index_html(
                html_lang=config["html_lang"],
                base_url=BASE_URL,
                language_label=config["label"],
                language_reference_path=language_reference_path,
                app_path=config["app_path"],
                verb_links=language_index_rows,
            )
            language_index_hash = _sha256_text(language_index_html)
            language_index_previous = old_entries.get(language_reference_path, {})
            language_index_previous_hash = language_index_previous.get("hash")
            language_index_previous_lastmod = language_index_previous.get("lastmod")
            if language_index_previous_hash == language_index_hash and language_index_previous_lastmod:
                language_index_lastmod = language_index_previous_lastmod
            else:
                language_index_lastmod = now_iso

            language_index_output_path = os.path.join(
                dist_dir,
                "reference",
                config["reference_slug"],
                "index.html",
            )
            if not (language_index_previous_hash == language_index_hash and os.path.exists(language_index_output_path)):
                _write_text(language_index_output_path, language_index_html)

            new_manifest_entries[language_reference_path] = {
                "hash": language_index_hash,
                "lastmod": language_index_lastmod,
            }
            lastmod_by_path[language_reference_path] = language_index_lastmod
            generated_reference_paths.append(language_reference_path)

    reference_home_path = "/reference/"
    if reference_home_rows:
        reference_home_rows.sort(key=lambda item: item["label"].lower())
        reference_home_html = _render_reference_home_html(
            base_url=BASE_URL,
            language_rows=reference_home_rows,
        )
        reference_home_hash = _sha256_text(reference_home_html)
        reference_home_previous = old_entries.get(reference_home_path, {})
        reference_home_previous_hash = reference_home_previous.get("hash")
        reference_home_previous_lastmod = reference_home_previous.get("lastmod")
        if reference_home_previous_hash == reference_home_hash and reference_home_previous_lastmod:
            reference_home_lastmod = reference_home_previous_lastmod
        else:
            reference_home_lastmod = now_iso

        reference_home_output_path = os.path.join(
            dist_dir,
            "reference",
            "index.html",
        )
        if not (reference_home_previous_hash == reference_home_hash and os.path.exists(reference_home_output_path)):
            _write_text(reference_home_output_path, reference_home_html)

        new_manifest_entries[reference_home_path] = {
            "hash": reference_home_hash,
            "lastmod": reference_home_lastmod,
        }
        lastmod_by_path[reference_home_path] = reference_home_lastmod
        generated_reference_paths.append(reference_home_path)

    app_paths = [
        config["app_path"]
        for config in LANGUAGE_CONFIGS
        if config["id"] in set(generated_languages)
    ]

    if per_language_limit:
        merged_entries = dict(old_entries)
        merged_entries.update(new_manifest_entries)
        _write_reference_manifest(manifest_path, merged_entries)
    else:
        _write_reference_manifest(manifest_path, new_manifest_entries)
    sitemap_path = _write_sitemap(
        dist_dir,
        generated_reference_paths,
        app_paths,
        lastmod_by_path=lastmod_by_path,
    )

    return {
        "total_pages": len(generated_reference_paths),
        "by_language": by_language_counts,
        "sample_paths": sample_paths,
        "warnings": warnings,
        "sitemap_path": sitemap_path,
        "limited": per_language_limit,
    }
