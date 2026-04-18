#!/usr/bin/env python3
"""
Extract learner-facing French core-pattern candidates from the intentional LEFFF.
"""

from __future__ import annotations

import argparse
import re
from collections import defaultdict
from pathlib import Path

from core_patterns_lib import load_verbs, write_json

DEFAULT_LEFFF_DIR = Path("/private/tmp/lefff-3.4")
DEFAULT_OUTPUT_JSON = Path("/Users/simeon/Desktop/proj1/_experiments/lefff_core_patterns_top20.json")
DEFAULT_OUTPUT_MD = Path("/Users/simeon/Desktop/proj1/_experiments/lefff_core_patterns_top20.md")
SOURCE_FILES = ("v_new.ilex", "v.ilex")

USAGE_RE = re.compile(r"<usage(?: [^>]*)?>(.*?)</usage>")
REFLEXIVE_MARKER_RE = re.compile(r"\b(?:me|m'|te|t'|se|s'|nous|vous)\b", re.IGNORECASE)
QUE_CLAUSE_RE = re.compile(
    r"(?:\bque\s+(?:je|tu|il|elle|on|nous|vous|ils|elles|ce|ça|cela)\b|"
    r"\bqu['’](?:il|elle|on|ils|elles|on|un|une|ce)\b)",
    re.IGNORECASE,
)
SI_CLAUSE_RE = re.compile(r"\bsi\b", re.IGNORECASE)
DE_INFINITIVE_RE = re.compile(r"(?:\bde\s+|d['’])[a-zà-ÿ-]{2,}(?:er|ir|re|oir)\b", re.IGNORECASE)
A_INFINITIVE_RE = re.compile(r"\bà\s+[a-zà-ÿ-]{2,}(?:er|ir|re|oir)\b", re.IGNORECASE)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Extract learner-facing core-pattern candidates from LEFFF.")
    parser.add_argument("--lefff-dir", default=str(DEFAULT_LEFFF_DIR))
    parser.add_argument("--tier", action="append", dest="tiers", help="Frequency tier(s) from verbs.full.js, e.g. top20")
    parser.add_argument("--verb", action="append", dest="verbs", help="Explicit verb(s) to extract.")
    parser.add_argument("--max-verbs", type=int)
    parser.add_argument("--max-candidates", type=int, default=4, help="Maximum candidates to keep per verb after core-only filtering.")
    parser.add_argument(
        "--focus",
        choices=("core", "ad-combo"),
        default="core",
        help="Extraction focus: 'core' keeps the broader conservative core set; 'ad-combo' keeps only à/de and combo rows.",
    )
    parser.add_argument("--output-json", default=str(DEFAULT_OUTPUT_JSON))
    parser.add_argument("--output-md", default=str(DEFAULT_OUTPUT_MD))
    return parser


def split_top_level(text: str, separator: str = ",") -> list[str]:
    items: list[str] = []
    current: list[str] = []
    depth = 0
    for char in text:
        if char == "(":
            depth += 1
        elif char == ")":
            depth = max(depth - 1, 0)
        elif char == separator and depth == 0:
            item = "".join(current).strip()
            if item:
                items.append(item)
            current = []
            continue
        current.append(char)
    item = "".join(current).strip()
    if item:
        items.append(item)
    return items


def parse_slot_values(raw_value: str) -> set[str]:
    value = raw_value.strip()
    if value.startswith("(") and value.endswith(")"):
        parts = split_top_level(value[1:-1], separator="|")
    else:
        parts = [part.strip() for part in value.split("|")]
    return {part.strip() for part in parts if part.strip()}


def parse_slots(frame_text: str) -> dict[str, set[str]]:
    slots: dict[str, set[str]] = {}
    for chunk in split_top_level(frame_text):
        if ":" not in chunk:
            continue
        key, raw_value = chunk.split(":", 1)
        slots[key.strip()] = parse_slot_values(raw_value)
    return slots


def parse_entry(line: str, source_name: str) -> dict | None:
    line = line.rstrip()
    if not line or line.startswith("#"):
        return None

    core, *comment_parts = line.split("#", 1)
    fields = core.split("\t")
    if len(fields) < 3:
        return None

    orth = fields[0].strip()
    details = fields[2].strip()
    if "<" not in details or ">" not in details:
        return None

    before_frame, after_open = details.split("<", 1)
    frame_text, after_frame = after_open.split(">", 1)
    head_parts = [part.strip() for part in before_frame.split(";") if part.strip()]
    if len(head_parts) < 3 or head_parts[1] not in {"Lemma", "se Lemma", "s'Lemma"}:
        return None

    reflexive = head_parts[1] in {"se Lemma", "s'Lemma"}
    sense = orth
    lemma = orth.split("___", 1)[0]

    comment = comment_parts[0] if comment_parts else ""
    usages = [match.strip() for match in USAGE_RE.findall(comment) if match.strip()]

    return {
        "source_file": source_name,
        "line": line,
        "orth": orth,
        "lemma": lemma,
        "sense": sense,
        "reflexive": reflexive,
        "slots": parse_slots(frame_text),
        "metadata": after_frame.strip(),
        "comment": comment.strip(),
        "usages": usages,
    }


def load_entries(lefff_dir: Path) -> dict[str, list[dict]]:
    entries_by_verb: dict[str, list[dict]] = defaultdict(list)
    for source_name in SOURCE_FILES:
        path = lefff_dir / source_name
        text = path.read_text(encoding="utf-8", errors="replace")
        for line in text.splitlines():
            entry = parse_entry(line, source_name)
            if not entry:
                continue
            entries_by_verb[entry["lemma"]].append(entry)
    return entries_by_verb


def display_lemma(entry: dict) -> str:
    if not entry["reflexive"]:
        return entry["lemma"]
    lemma = entry["lemma"]
    if lemma[:1].lower() in {"a", "e", "i", "o", "u", "y", "h", "à", "â", "é", "è", "ê", "ë", "î", "ï", "ô", "ù", "û", "ü"}:
        return f"s'{lemma}"
    return f"se {lemma}"


def has_any(values: set[str], needles: set[str]) -> bool:
    return any(value in needles for value in values)


def normalize_example(example: str) -> str:
    return (example or "").replace("’", "'").strip()


def supports_reflexive(entry: dict) -> bool:
    if not entry["reflexive"]:
        return True
    example = normalize_example(entry["usages"][0] if entry["usages"] else "")
    return bool(example and REFLEXIVE_MARKER_RE.search(example))


def supports_que_clause(entry: dict) -> bool:
    example = normalize_example(entry["usages"][0] if entry["usages"] else "")
    if not example:
        return False
    lowered = example.lower()
    if "qu'est-ce que" in lowered or "qu est-ce que" in lowered:
        return False
    return bool(QUE_CLAUSE_RE.search(example))


def supports_si_clause(entry: dict) -> bool:
    example = normalize_example(entry["usages"][0] if entry["usages"] else "")
    return bool(example and SI_CLAUSE_RE.search(example))


def supports_de_inf(entry: dict) -> bool:
    example = normalize_example(entry["usages"][0] if entry["usages"] else "")
    return bool(example and DE_INFINITIVE_RE.search(example))


def supports_a_inf(entry: dict) -> bool:
    example = normalize_example(entry["usages"][0] if entry["usages"] else "")
    return bool(example and A_INFINITIVE_RE.search(example))


def supports_indirect_object(entry: dict) -> bool:
    example = normalize_example(entry["usages"][0] if entry["usages"] else "")
    if not example:
        return False
    return any(marker in example.lower() for marker in (" à ", " lui ", " leur ", " y "))


def has_personlike_a_slot(entry: dict) -> bool:
    obja = entry["slots"].get("Objà", set())
    return has_any(obja, {"cld", "seréc", "seréfl"})


def supports_a_object(entry: dict) -> bool:
    obja = entry["slots"].get("Objà", set())
    obj = entry["slots"].get("Obj", set())
    if not obja or not supports_indirect_object(entry):
        return False
    if supports_a_inf(entry) and not has_personlike_a_slot(entry):
        return False
    if not obj:
        return True
    return has_personlike_a_slot(entry)


def supports_combo_a(entry: dict) -> bool:
    obj = entry["slots"].get("Obj", set())
    obja = entry["slots"].get("Objà", set())
    return has_any(obj, {"sn", "cla", "seréc"}) and bool(obja) and has_personlike_a_slot(entry) and supports_indirect_object(entry)


def supports_de_object(entry: dict) -> bool:
    example = normalize_example(entry["usages"][0] if entry["usages"] else "")
    if not example:
        return False
    lowered = f" {example.lower()} "
    return " en " in lowered or " d'" in lowered or " de " in lowered


def is_clause_or_inf_example(entry: dict) -> bool:
    return any(
        (
            supports_que_clause(entry),
            supports_si_clause(entry),
            supports_de_inf(entry),
            supports_a_inf(entry),
        )
    )


def supports_bare(entry: dict) -> bool:
    if not entry["usages"]:
        return False
    if "impersonnel" in entry.get("metadata", ""):
        return False
    return True


def add_candidate(candidates: dict[str, dict], pattern: str, entry: dict, reason: str, score: int) -> None:
    existing = candidates.get(pattern)
    payload = {
        "pattern": pattern,
        "reason": reason,
        "score": score,
        "source_file": entry["source_file"],
        "source_orth": entry["orth"],
        "example_fr": entry["usages"][0] if entry["usages"] else "",
        "raw_frame": entry["line"],
    }
    if existing is None or payload["score"] > existing["score"] or (
        payload["score"] == existing["score"] and entry["source_file"] == "v_new.ilex"
    ):
        candidates[pattern] = payload


def extract_candidates_for_entry(entry: dict) -> list[dict]:
    slots = entry["slots"]
    lemma = display_lemma(entry)
    candidates: dict[str, dict] = {}

    if not supports_reflexive(entry):
        return []

    obj = slots.get("Obj", set())
    obja = slots.get("Objà", set())
    objde = slots.get("Objde", set())
    att = slots.get("Att", set())
    loc = slots.get("Loc", set())
    obl = slots.get("Obl", set())

    if not any([obj, obja, objde, att, loc, obl]) and supports_bare(entry):
        add_candidate(candidates, lemma, entry, "bare", 50)

    if has_any(obj, {"sn", "seréc"}) and not is_clause_or_inf_example(entry):
        add_candidate(candidates, f"{lemma} qqn / qqch", entry, "direct-object", 86)

    if has_any(obj, {"de-sinf"}) and supports_de_inf(entry):
        add_candidate(candidates, f"{lemma} de + infinitif", entry, "de-infinitive", 90)

    if has_any(obj, {"à-sinf"}) and supports_a_inf(entry):
        add_candidate(candidates, f"{lemma} à + infinitif", entry, "a-infinitive", 91)

    if has_any(obj, {"cla", "scompl"}) and supports_que_clause(entry):
        add_candidate(candidates, f"{lemma} que + proposition", entry, "que-clause", 88)

    if has_any(obj, {"qcompl"}) and supports_si_clause(entry):
        add_candidate(candidates, f"{lemma} si + proposition", entry, "si-clause", 89)

    if has_any(obja, {"à-sn", "cld", "y"}) and supports_a_object(entry):
        add_candidate(candidates, f"{lemma} à qqn / qqch", entry, "a-object", 94)

    if has_any(obja, {"à-sinf"}) and supports_a_inf(entry):
        add_candidate(candidates, f"{lemma} à + infinitif", entry, "a-infinitive", 91)

    if has_any(objde, {"de-sn", "en"}) and supports_de_object(entry):
        add_candidate(candidates, f"{lemma} de qqn / qqch", entry, "de-object", 92)

    if has_any(objde, {"de-sinf"}) and supports_de_inf(entry):
        add_candidate(candidates, f"{lemma} de + infinitif", entry, "de-infinitive", 90)

    if has_any(objde, {"scompl", "de-scompl"}) and supports_que_clause(entry):
        add_candidate(candidates, f"{lemma} que + proposition", entry, "que-clause", 88)

    if supports_combo_a(entry):
        add_candidate(candidates, f"{lemma} qqch à qqn", entry, "combo-a", 100)

    return list(candidates.values())


def pick_entries_for_verb(entries: list[dict]) -> list[dict]:
    v_new = [entry for entry in entries if entry["source_file"] == "v_new.ilex"]
    return v_new or entries


def prefer_entries_for_target(entries: list[dict], verb: str) -> list[dict]:
    preferred = pick_entries_for_verb(entries)
    wants_reflexive = verb.startswith("se ") or verb.startswith("s'")
    filtered = [entry for entry in preferred if entry["reflexive"] == wants_reflexive]
    return filtered or preferred


def candidate_family(candidate: dict) -> str:
    reason = candidate.get("reason", "")
    if reason == "combo-a":
        return "combo-a"
    if reason == "combo-de":
        return "combo-de"
    if reason == "a-object":
        return "a-object"
    if reason == "de-object":
        return "de-object"
    if reason == "direct-object":
        return "direct-object"
    if reason == "a-infinitive":
        return "a-infinitive"
    if reason == "de-infinitive":
        return "de-infinitive"
    if reason == "que-clause":
        return "que-clause"
    if reason == "si-clause":
        return "si-clause"
    if reason == "bare":
        return "bare"
    return "other"


def family_priority(family: str) -> int:
    priorities = {
        "combo-a": 100,
        "a-object": 96,
        "de-object": 94,
        "direct-object": 92,
        "combo-de": 90,
        "a-infinitive": 82,
        "de-infinitive": 80,
        "que-clause": 74,
        "si-clause": 72,
        "bare": 60,
        "other": 0,
    }
    return priorities.get(family, 0)


def is_same_focus(family_a: str, family_b: str) -> bool:
    paired_families = {
        ("combo-a", "a-object"),
        ("combo-de", "de-object"),
    }
    return family_a == family_b or (family_a, family_b) in paired_families or (family_b, family_a) in paired_families


def filter_core_candidates(verb: str, candidates: list[dict], max_candidates: int) -> list[dict]:
    wants_reflexive = verb.startswith("se ") or verb.startswith("s'")
    ordered = sorted(
        candidates,
        key=lambda item: (-family_priority(candidate_family(item)), -item["score"], item["pattern"]),
    )

    selected: list[dict] = []
    selected_families: list[str] = []
    for candidate in ordered:
        family = candidate_family(candidate)
        if family_priority(family) <= 0:
            continue
        if family == "bare" and any(candidate_family(item) != "bare" for item in ordered):
            continue
        if wants_reflexive != candidate["pattern"].startswith(("se ", "s'")):
            continue

        if any(is_same_focus(family, chosen_family) for chosen_family in selected_families):
            # Keep combo rows over their simpler family, otherwise avoid duplicates.
            if family in {"combo-a", "combo-de"}:
                replace_idx = next(
                    (
                        idx
                        for idx, chosen_family in enumerate(selected_families)
                        if is_same_focus(family, chosen_family) and chosen_family != family
                    ),
                    None,
                )
                if replace_idx is not None:
                    selected[replace_idx] = candidate
                    selected_families[replace_idx] = family
            continue

        selected.append(candidate)
        selected_families.append(family)
        if len(selected) >= max_candidates:
            break

    if not selected and ordered:
        fallback = [candidate for candidate in ordered if candidate_family(candidate) in {"direct-object", "bare"}]
        return fallback[:max_candidates] if fallback else ordered[:max_candidates]

    return selected


def filter_ad_combo_candidates(verb: str, candidates: list[dict], max_candidates: int) -> list[dict]:
    wants_reflexive = verb.startswith("se ") or verb.startswith("s'")
    allowed = {"combo-a", "combo-de", "a-object", "de-object"}
    ordered = sorted(
        candidates,
        key=lambda item: (-family_priority(candidate_family(item)), -item["score"], item["pattern"]),
    )

    selected: list[dict] = []
    selected_families: list[str] = []
    for candidate in ordered:
        family = candidate_family(candidate)
        if family not in allowed:
            continue
        if wants_reflexive != candidate["pattern"].startswith(("se ", "s'")):
            continue
        if any(is_same_focus(family, chosen_family) for chosen_family in selected_families):
            if family in {"combo-a", "combo-de"}:
                replace_idx = next(
                    (
                        idx
                        for idx, chosen_family in enumerate(selected_families)
                        if is_same_focus(family, chosen_family) and chosen_family != family
                    ),
                    None,
                )
                if replace_idx is not None:
                    selected[replace_idx] = candidate
                    selected_families[replace_idx] = family
            continue
        selected.append(candidate)
        selected_families.append(family)
        if len(selected) >= max_candidates:
            break
    return selected


def extract_for_verbs(entries_by_verb: dict[str, list[dict]], verbs: list[str], max_candidates: int, focus: str) -> list[dict]:
    results: list[dict] = []
    for verb in verbs:
        lookup_forms = [verb]
        if verb.startswith("se "):
            lookup_forms.append(verb[3:])
        elif verb.startswith("s'"):
            lookup_forms.append(verb[2:])

        entries: list[dict] = []
        for form in lookup_forms:
            entries = entries_by_verb.get(form, [])
            if entries:
                break
        if not entries:
            results.append({"verb": verb, "candidates": []})
            continue

        candidates_by_pattern: dict[str, dict] = {}
        preferred_entries = prefer_entries_for_target(entries, verb)
        for entry in preferred_entries:
            for candidate in extract_candidates_for_entry(entry):
                existing = candidates_by_pattern.get(candidate["pattern"])
                if existing is None or candidate["score"] > existing["score"] or (
                    candidate["score"] == existing["score"] and candidate["source_file"] == "v_new.ilex"
                ):
                    candidates_by_pattern[candidate["pattern"]] = candidate

        if not candidates_by_pattern and not (verb.startswith("se ") or verb.startswith("s'")) and preferred_entries != pick_entries_for_verb(entries):
            for entry in pick_entries_for_verb(entries):
                for candidate in extract_candidates_for_entry(entry):
                    existing = candidates_by_pattern.get(candidate["pattern"])
                    if existing is None or candidate["score"] > existing["score"] or (
                        candidate["score"] == existing["score"] and candidate["source_file"] == "v_new.ilex"
                    ):
                        candidates_by_pattern[candidate["pattern"]] = candidate

        ordered = sorted(
            candidates_by_pattern.values(),
            key=lambda item: (-item["score"], item["pattern"]),
        )
        if focus == "ad-combo":
            filtered = filter_ad_combo_candidates(verb, ordered, max_candidates)
        else:
            filtered = filter_core_candidates(verb, ordered, max_candidates)
        results.append({"verb": verb, "candidates": filtered})
    return results


def render_markdown(results: list[dict]) -> str:
    lines = ["# LEFFF Core Pattern Preview", ""]
    for entry in results:
        verb = entry["verb"]
        candidates = entry["candidates"]
        lines.append(f"## {verb} ({len(candidates)} candidates)")
        lines.append("")
        if not candidates:
            lines.append("- no LEFFF entry found")
            lines.append("")
            continue
        for candidate in candidates:
            lines.append(f"- `{candidate['pattern']}`")
            lines.append(f"  source: `{candidate['source_file']}` via `{candidate['source_orth']}`")
            lines.append(f"  reason: `{candidate['reason']}`")
            if candidate.get("example_fr"):
                lines.append(f"  example: {candidate['example_fr']}")
        lines.append("")
    return "\n".join(lines).rstrip() + "\n"


def resolve_target_verbs(args: argparse.Namespace) -> list[str]:
    if args.verbs:
        verbs = [verb.strip() for verb in args.verbs if verb and verb.strip()]
    else:
        tiers = set(args.tiers or [])
        verbs = [item["infinitive"] for item in load_verbs(tiers or None)]
    if args.max_verbs:
        verbs = verbs[: args.max_verbs]
    return verbs


def main() -> None:
    args = build_parser().parse_args()
    lefff_dir = Path(args.lefff_dir).expanduser().resolve()
    output_json = Path(args.output_json).expanduser().resolve()
    output_md = Path(args.output_md).expanduser().resolve()

    entries_by_verb = load_entries(lefff_dir)
    verbs = resolve_target_verbs(args)
    results = extract_for_verbs(entries_by_verb, verbs, args.max_candidates, args.focus)

    output_json.parent.mkdir(parents=True, exist_ok=True)
    write_json(output_json, results)
    output_md.write_text(render_markdown(results), encoding="utf-8")

    found = sum(1 for entry in results if entry["candidates"])
    total_candidates = sum(len(entry["candidates"]) for entry in results)
    print(f"Processed {len(results)} verbs")
    print(f"Found LEFFF candidates for {found} verbs")
    print(f"Total candidates: {total_candidates}")
    print(f"JSON: {output_json}")
    print(f"MD: {output_md}")


if __name__ == "__main__":
    main()
