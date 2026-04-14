import argparse
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parent
VERBS_PATH = ROOT / "js" / "verbs.full.js"
USAGES_PATH = ROOT / "verb_usages.js"
OUTPUT_PATH = ROOT / "french_tts_inventory.json"
FREQUENCY_ORDER = ["top20", "top50", "top100", "top500", "top1000", "rare"]

FRENCH_TENSE_LABELS = {
    "present": "present",
    "passeCompose": "passe compose",
    "imparfait": "imparfait",
    "futurSimple": "futur simple",
    "plusQueParfait": "plus-que-parfait",
    "subjonctifPresent": "subjonctif present",
    "conditionnelPresent": "conditionnel present",
}

TENSE_ORDER = [
    "present",
    "passeCompose",
    "imparfait",
    "futurSimple",
    "plusQueParfait",
    "subjonctifPresent",
    "conditionnelPresent",
]

PRONOUN_VARIANTS = {
    "il/elle/on": ["il", "elle", "on"],
    "ils/elles": ["ils", "elles"],
}

SHARED_PRONOUNS = [
    "je",
    "tu",
    "il",
    "elle",
    "on",
    "nous",
    "vous",
    "ils",
    "elles",
    "il/elle/on",
    "ils/elles",
]

PRONOUN_SPOKEN_MAP = {
    "il/elle/on": "il, elle, on",
    "ils/elles": "ils, elles",
}

ETRE_AUX_SINGULAR = {"est", "etait", "sera", "serait", "soit", "fut"}
ETRE_AUX_PLURAL = {"sont", "etaient", "seront", "seraient", "soient", "fussent"}


def normalize_text(text):
    return " ".join(str(text or "").split())


def slugify(value):
    safe = []
    for ch in str(value or ""):
        if ch.isalnum():
            safe.append(ch.lower())
        elif ch in {"-", "_"}:
            safe.append(ch)
        else:
            safe.append("-")
    slug = "".join(safe).strip("-")
    while "--" in slug:
        slug = slug.replace("--", "-")
    return slug or "item"


def strip_accents(value):
    replacements = str.maketrans(
        {
            "à": "a",
            "â": "a",
            "ä": "a",
            "ç": "c",
            "é": "e",
            "è": "e",
            "ê": "e",
            "ë": "e",
            "î": "i",
            "ï": "i",
            "ô": "o",
            "ö": "o",
            "ù": "u",
            "û": "u",
            "ü": "u",
            "ÿ": "y",
            "À": "A",
            "Â": "A",
            "Ä": "A",
            "Ç": "C",
            "É": "E",
            "È": "E",
            "Ê": "E",
            "Ë": "E",
            "Î": "I",
            "Ï": "I",
            "Ô": "O",
            "Ö": "O",
            "Ù": "U",
            "Û": "U",
            "Ü": "U",
            "Ÿ": "Y",
        }
    )
    return (value or "").translate(replacements)


def extract_js_literal(source, marker):
    start = source.find(marker)
    if start == -1:
        raise ValueError(f"Could not find marker: {marker}")
    index = start + len(marker)
    while index < len(source) and source[index].isspace():
        index += 1

    opener = source[index]
    closer = {"[": "]", "{": "}"}[opener]
    depth = 0
    in_string = False
    string_quote = ""
    escaped = False

    for pos in range(index, len(source)):
        ch = source[pos]
        if in_string:
            if escaped:
                escaped = False
            elif ch == "\\":
                escaped = True
            elif ch == string_quote:
                in_string = False
        else:
            if ch in {'"', "'"}:
                in_string = True
                string_quote = ch
            elif ch == opener:
                depth += 1
            elif ch == closer:
                depth -= 1
                if depth == 0:
                    return source[index : pos + 1]

    raise ValueError(f"Unterminated literal for marker: {marker}")


def load_js_data():
    verbs_source = VERBS_PATH.read_text(encoding="utf-8")
    usages_source = USAGES_PATH.read_text(encoding="utf-8")
    verbs = json.loads(extract_js_literal(verbs_source, "const verbs ="))
    tenses = json.loads(extract_js_literal(verbs_source, "const tenses ="))
    pronouns = json.loads(extract_js_literal(verbs_source, "const pronouns ="))
    usages = json.loads(extract_js_literal(usages_source, "window.verbUsages ="))
    return verbs, tenses, pronouns, usages


def feminize_participle(parts, pronoun):
    if len(parts) < 3:
        return parts

    participle = parts[-1]
    if pronoun == "elle":
        if not participle.endswith("e"):
            parts[-1] = participle + "e"
    elif pronoun == "elles":
        if participle.endswith("s") and not participle.endswith("es"):
            parts[-1] = participle[:-1] + "es"
    return parts


def apply_pronoun_variant(pronoun, conjugated):
    conjugated = normalize_text(conjugated)
    if not conjugated:
        return ""

    lower = conjugated.lower()
    parts = conjugated.split(" ")
    first = parts[0].lower()

    if pronoun == "je" and lower.startswith("j'"):
        return conjugated

    if pronoun in {"ils", "elles"} and first in {"ils", "elles"}:
        parts[0] = pronoun
        if pronoun == "elles" and strip_accents(conjugated.lower()).split(" ")[1:2]:
            second = strip_accents(parts[1].lower()) if len(parts) > 1 else ""
            if second in ETRE_AUX_PLURAL:
                feminize_participle(parts, "elles")
        return " ".join(parts)

    if pronoun in {"il", "elle", "on"} and first in {"il", "elle", "on"}:
        parts[0] = pronoun
        if pronoun == "elle" and len(parts) > 1:
            second = strip_accents(parts[1].lower())
            if second in ETRE_AUX_SINGULAR:
                feminize_participle(parts, "elle")
        return " ".join(parts)

    return f"{pronoun} {conjugated}"


def normalize_frequency(value):
    value = normalize_text(value)
    if not value:
        return None
    mapping = {
        "top-20": "top20",
        "top-50": "top50",
        "top-100": "top100",
        "top-500": "top500",
        "top-1000": "top1000",
    }
    return mapping.get(value, value)


def resolve_allowed_frequencies(tiers):
    if not tiers:
        return None

    normalized = []
    for tier in tiers:
        for part in str(tier).split(","):
            value = normalize_frequency(part)
            if value:
                normalized.append(value)

    if not normalized:
        return None

    allowed = set()
    for tier in normalized:
        if tier in {"top20", "top100", "top500", "top1000"}:
            cutoff = {
                "top20": "top20",
                "top100": "top100",
                "top500": "top500",
                "top1000": "top1000",
            }[tier]
            for freq in FREQUENCY_ORDER:
                allowed.add(freq)
                if freq == cutoff:
                    break
        elif tier in FREQUENCY_ORDER:
            allowed.add(tier)
        else:
            raise ValueError(f"Unsupported tier: {tier}")
    return allowed


def sort_frequencies(values):
    order = {name: index for index, name in enumerate(FREQUENCY_ORDER)}
    return sorted(values, key=lambda value: order.get(value, 999))


def build_inventory(verbs, tenses, pronouns, usages, allowed_frequencies=None):
    items = []
    seen_ids = set()

    def add_item(
        *,
        item_id,
        pack_id,
        pack_slug,
        kind,
        display_text,
        spoken_text,
        verb=None,
        tense=None,
        pronoun=None,
        frequency=None,
        sense_id=None,
    ):
        display_text = normalize_text(display_text)
        spoken_text = normalize_text(spoken_text)
        if not display_text or not spoken_text:
            return
        if item_id in seen_ids:
            return
        seen_ids.add(item_id)
        items.append(
            {
                "id": item_id,
                "pack_id": pack_id,
                "pack_slug": pack_slug,
                "kind": kind,
                "verb": verb,
                "tense": tense,
                "pronoun": pronoun,
                "frequency": frequency,
                "sense_id": sense_id,
                "display_text": display_text,
                "spoken_text": spoken_text,
            }
        )

    for pronoun in SHARED_PRONOUNS:
        add_item(
            item_id=f"shared:pronoun:{pronoun}",
            pack_id="shared",
            pack_slug="shared",
            kind="pronoun",
            display_text=pronoun,
            spoken_text=PRONOUN_SPOKEN_MAP.get(pronoun, pronoun),
            pronoun=pronoun,
        )

    for tense_key in TENSE_ORDER:
        add_item(
            item_id=f"shared:tense:{tense_key}",
            pack_id="shared",
            pack_slug="shared",
            kind="tense_label",
            display_text=FRENCH_TENSE_LABELS[tense_key],
            spoken_text=FRENCH_TENSE_LABELS[tense_key],
            tense=tense_key,
        )

    usage_by_verb = {}
    for usage in usages:
        verb = normalize_text(usage.get("verb"))
        if not verb:
            continue
        usage_by_verb.setdefault(verb, []).append(usage)

    for verb_row in verbs:
        infinitive = normalize_text(verb_row.get("infinitive"))
        if not infinitive:
            continue

        frequency = normalize_frequency(verb_row.get("frequency"))
        if allowed_frequencies is not None and frequency not in allowed_frequencies:
            continue
        pack_id = f"verb:{infinitive}"
        pack_slug = f"verb-{slugify(infinitive)}"

        add_item(
            item_id=f"lemma:{infinitive}",
            pack_id=pack_id,
            pack_slug=pack_slug,
            kind="lemma",
            display_text=infinitive,
            spoken_text=infinitive,
            verb=infinitive,
            frequency=frequency,
        )

        for tense_key in TENSE_ORDER:
            table = (tenses.get(tense_key) or {}).get(infinitive)
            if not isinstance(table, dict):
                continue

            for pronoun_key in pronouns:
                form = normalize_text(table.get(pronoun_key))
                if not form:
                    continue

                add_item(
                    item_id=f"conj:{infinitive}:{tense_key}:{pronoun_key}",
                    pack_id=pack_id,
                    pack_slug=pack_slug,
                    kind="conjugation",
                    display_text=form,
                    spoken_text=form,
                    verb=infinitive,
                    tense=tense_key,
                    pronoun=pronoun_key,
                    frequency=frequency,
                )

                for variant in PRONOUN_VARIANTS.get(pronoun_key, []):
                    variant_form = apply_pronoun_variant(variant, form)
                    add_item(
                        item_id=f"conj:{infinitive}:{tense_key}:{variant}",
                        pack_id=pack_id,
                        pack_slug=pack_slug,
                        kind="conjugation",
                        display_text=variant_form,
                        spoken_text=variant_form,
                        verb=infinitive,
                        tense=tense_key,
                        pronoun=variant,
                        frequency=frequency,
                    )

        for usage in usage_by_verb.get(infinitive, []):
            example = normalize_text(usage.get("example_fr"))
            if not example:
                continue
            sense_id = normalize_text(usage.get("sense_id")) or f"{infinitive}:{len(items):04d}"
            add_item(
                item_id=f"usage:{sense_id}",
                pack_id=pack_id,
                pack_slug=pack_slug,
                kind="usage_example",
                display_text=example,
                spoken_text=example,
                verb=infinitive,
                frequency=frequency,
                sense_id=sense_id,
            )

    return {
        "version": 1,
        "slot_labels": FRENCH_TENSE_LABELS,
        "included_frequencies": sort_frequencies(allowed_frequencies) if allowed_frequencies else FREQUENCY_ORDER,
        "items": items,
    }


def parse_args():
    parser = argparse.ArgumentParser(description="Generate the French TTS inventory.")
    parser.add_argument("--verbs", type=Path, default=VERBS_PATH)
    parser.add_argument("--usages", type=Path, default=USAGES_PATH)
    parser.add_argument("--output", type=Path, default=OUTPUT_PATH)
    parser.add_argument(
        "--tiers",
        nargs="+",
        help="Frequency tiers to include. Examples: top20, top100, top500, top1000, rare. top100/top500/top1000 are cumulative.",
    )
    return parser.parse_args()


def generate_inventory(verbs_path=VERBS_PATH, usages_path=USAGES_PATH, output_path=OUTPUT_PATH, tiers=None):
    global VERBS_PATH, USAGES_PATH
    VERBS_PATH = Path(verbs_path)
    USAGES_PATH = Path(usages_path)
    verbs, tenses, pronouns, usages = load_js_data()
    allowed_frequencies = resolve_allowed_frequencies(tiers)
    inventory = build_inventory(verbs, tenses, pronouns, usages, allowed_frequencies=allowed_frequencies)
    Path(output_path).write_text(
        json.dumps(inventory, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(f"✅ Wrote {output_path}")
    print(f"   items: {len(inventory['items'])}")
    if allowed_frequencies:
        print(f"   tiers: {', '.join(sort_frequencies(allowed_frequencies))}")
    return inventory


def main():
    args = parse_args()
    generate_inventory(
        verbs_path=args.verbs,
        usages_path=args.usages,
        output_path=args.output,
        tiers=args.tiers,
    )


if __name__ == "__main__":
    main()
