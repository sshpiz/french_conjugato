#!/usr/bin/env python3
"""
Build an audit checklist for rollout-tier French verbs focused on a/de/combo rows.

The goal is not to force every verb to get a row. It is to ensure every rollout
verb ends up with a verdict:
- covered
- candidate_add
- manual_review
- likely_none
"""

from __future__ import annotations

import json
from collections import Counter
from pathlib import Path

from core_patterns_lib import INPUT_FILE, load_usage_index, load_verbs

ROOT = Path("/Users/simeon/Desktop/proj1")
LEFFF_ALL_JSON = ROOT / "_experiments" / "lefff_ad_combo_all.json"
OUTPUT_JSON = ROOT / "ad_combo_audit_rollout.json"
OUTPUT_MD = ROOT / "ad_combo_audit_rollout.md"
ROLLOUT_TIERS = {"top20", "top50", "top100", "top500", "top1000"}

LOCATION_MARKERS = ("location", "place", "lieu", "table", "côté", "sport/jeu", "authority/person")
SUSPICIOUS_USAGE_PATTERNS = {
    "importer + à + person",
    "se rappeler + à + person",
    "s'asseoir + à + table",
    "s'asseoir + à + côté de + personne",
}
CONSERVATIVE_USAGE_NONE_PATTERNS = {
    "mettre + à + person",
    "se rappeler + à + person",
}
CONSERVATIVE_LEFFF_NONE_PATTERNS = {
    "croire qqch à qqn",
    "faire qqch à qqn",
    "faire de qqn / qqch",
    "savoir de qqn / qqch",
    "trouver qqch à qqn",
    "vouloir de qqn / qqch",
    "connaître qqch à qqn",
    "se trouver de qqn / qqch",
    "travailler à qqn / qqch",
    "accompagner de qqn / qqch",
    "amuser de qqn / qqch",
    "atteindre à qqn / qqch",
    "déjeuner de qqn / qqch",
    "dépasser de qqn / qqch",
    "opérer de qqn / qqch",
    "planter de qqn / qqch",
    "soutenir de qqn / qqch",
    "acquérir de qqn / qqch",
    "appuyer de qqn / qqch",
    "défier de qqn / qqch",
    "dégager de qqn / qqch",
    "dégoûter de qqn / qqch",
    "démarrer de qqn / qqch",
    "grever de qqn / qqch",
    "noter de qqn / qqch",
    "prostituer qqch à qqn",
    "punir de qqn / qqch",
    "soulager de qqn / qqch",
    "soupçonner de qqn / qqch",
    "suspecter de qqn / qqch",
    "venger de qqn / qqch",
    "viser à qqn / qqch",
    "parier à qqn / qqch",
    "plaire de qqn / qqch",
}
CONSERVATIVE_LEFFF_PARTIAL_NONE_PATTERNS = {
    "rester de qqn / qqch",
}


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def family_from_core(pattern_entry: dict) -> str:
    pattern_type = str(pattern_entry.get("pattern_type", "")).strip()
    if pattern_type in {"a-object", "de-object", "combo-a", "combo-de"}:
        return pattern_type
    return ""


def usage_signal(pattern_text: str) -> tuple[str, str]:
    pattern = str(pattern_text or "").strip()
    lower = pattern.lower()
    if not lower or "infinitive" in lower or "infinitif" in lower:
        return "", ""
    if "+ object + à +" in lower or "+ x + à + y" in lower or "+ cod + à +" in lower:
        return "combo-a", pattern
    if "+ object + de +" in lower or "+ x + de + y" in lower or "+ cod + de +" in lower:
        return "combo-de", pattern
    if "+ à +" in lower and not any(marker in lower for marker in LOCATION_MARKERS):
        return "a-object", pattern
    if "+ de +" in lower:
        return "de-object", pattern
    return "", ""


def classify_verb(verb: str, core_index: dict, usage_index: dict, lefff_index: dict) -> dict:
    core_patterns = core_index.get(verb, [])
    usage_entries = usage_index.get(verb, [])
    lefff_entries = lefff_index.get(verb, [])

    core_families = sorted({family_from_core(entry) for entry in core_patterns} - {""})
    usage_signals: list[dict] = []
    for entry in usage_entries:
        family, source_pattern = usage_signal(entry.get("pattern", ""))
        if not family:
            continue
        usage_signals.append(
            {
                "family": family,
                "pattern": source_pattern,
                "meaning_en": str(entry.get("meaning_en", "")).strip(),
                "example_fr": str(entry.get("example_fr", "")).strip(),
            }
        )

    usage_families = sorted({signal["family"] for signal in usage_signals})
    lefff_families = sorted({str(entry.get("reason", "")).strip() for entry in lefff_entries} - {""})
    missing_families = sorted((set(usage_families) | set(lefff_families)) - set(core_families))

    verdict = "likely_none"
    rationale = "No current a/de/combo evidence in nuggets or LEFFF."

    suspicious_usage = any(signal["pattern"] in SUSPICIOUS_USAGE_PATTERNS for signal in usage_signals)
    has_usage = bool(usage_families)
    has_lefff = bool(lefff_families)

    if missing_families:
        verdict = "candidate_add"
        rationale = "Usage and/or LEFFF evidence suggests a missing a/de/combo row."
        if usage_signals:
            usage_patterns = {signal["pattern"] for signal in usage_signals}
            if usage_patterns and usage_patterns.issubset(CONSERVATIVE_USAGE_NONE_PATTERNS) and not core_families and not has_lefff:
                verdict = "likely_none"
                rationale = "Usage suggests a niche or non-core row that this conservative layer intentionally skips."
        lefff_patterns = {str(entry.get("pattern", "")).strip() for entry in lefff_entries if entry.get("pattern")}
        missing_lefff_patterns = {
            str(entry.get("pattern", "")).strip()
            for entry in lefff_entries
            if str(entry.get("reason", "")).strip() in missing_families and entry.get("pattern")
        }
        usage_families_for_missing = {signal["family"] for signal in usage_signals if signal["family"] in missing_families}
        if lefff_entries and not usage_signals and not core_families:
            if lefff_patterns and lefff_patterns.issubset(CONSERVATIVE_LEFFF_NONE_PATTERNS):
                verdict = "likely_none"
                rationale = "LEFFF suggests a technically valid row, but it is too underspecified or dictionary-like for this conservative layer."
        elif missing_lefff_patterns and missing_lefff_patterns.issubset(CONSERVATIVE_LEFFF_PARTIAL_NONE_PATTERNS) and not usage_families_for_missing:
            verdict = "likely_none"
            rationale = "Only a weak leftover LEFFF row remains, and this conservative layer intentionally skips it."
        if verdict == "candidate_add" and (suspicious_usage or (has_usage and not has_lefff)):
            verdict = "manual_review"
            rationale = "Evidence exists, but it depends on nugget phrasing or a potentially ambiguous construction."
        elif verdict == "candidate_add" and core_families:
            rationale = "Verb has some a/de/combo coverage already, but evidence suggests another missing row."
    elif core_families:
        verdict = "covered"
        rationale = "Verb already has the a/de/combo rows currently supported by nuggets and LEFFF."

    return {
        "verb": verb,
        "core_families": core_families,
        "usage_families": usage_families,
        "lefff_families": lefff_families,
        "missing_families": missing_families,
        "verdict": verdict,
        "rationale": rationale,
        "usage_signals": usage_signals[:4],
        "lefff_patterns": [entry.get("pattern", "") for entry in lefff_entries[:4]],
    }


def render_markdown(items: list[dict]) -> str:
    counts = Counter(item["verdict"] for item in items)
    lines = [
        "# A/DE/Combo Audit",
        "",
        "*Rollout tiers: top20 / top50 / top100 / top500 / top1000*",
        "",
        f"- covered: {counts.get('covered', 0)}",
        f"- candidate_add: {counts.get('candidate_add', 0)}",
        f"- manual_review: {counts.get('manual_review', 0)}",
        f"- likely_none: {counts.get('likely_none', 0)}",
        "",
        "---",
        "",
    ]

    ordered_verdicts = ["manual_review", "candidate_add", "likely_none", "covered"]
    for verdict in ordered_verdicts:
        subset = [item for item in items if item["verdict"] == verdict]
        if not subset:
            continue
        lines.append(f"## {verdict} ({len(subset)})")
        lines.append("")
        for item in subset:
            lines.append(f"### {item['verb']}")
            lines.append(f"- rationale: {item['rationale']}")
            if item["core_families"]:
                lines.append(f"- core: {', '.join(item['core_families'])}")
            if item["usage_families"]:
                lines.append(f"- usage: {', '.join(item['usage_families'])}")
            if item["lefff_families"]:
                lines.append(f"- lefff: {', '.join(item['lefff_families'])}")
            if item["missing_families"]:
                lines.append(f"- missing: {', '.join(item['missing_families'])}")
            for signal in item["usage_signals"]:
                lines.append(f"- nugget: `{signal['pattern']}` -> {signal['meaning_en']}")
            for pattern in item["lefff_patterns"]:
                if pattern:
                    lines.append(f"- lefff row: `{pattern}`")
            lines.append("")
    return "\n".join(lines).rstrip() + "\n"


def main() -> None:
    rollout_verbs = [verb["infinitive"] for verb in load_verbs(ROLLOUT_TIERS)]
    core_index = {entry["verb"]: entry.get("core_patterns", []) for entry in load_json(INPUT_FILE)}
    usage_index = load_usage_index()
    lefff_index = {entry["verb"]: entry.get("candidates", []) for entry in load_json(LEFFF_ALL_JSON)}

    items = [classify_verb(verb, core_index, usage_index, lefff_index) for verb in rollout_verbs]
    OUTPUT_JSON.write_text(json.dumps(items, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    OUTPUT_MD.write_text(render_markdown(items), encoding="utf-8")

    counts = Counter(item["verdict"] for item in items)
    print(f"Wrote {OUTPUT_JSON}")
    print(f"Wrote {OUTPUT_MD}")
    print("Verdicts:")
    for verdict in ("covered", "candidate_add", "manual_review", "likely_none"):
        print(f"  {verdict:<13} {counts.get(verdict, 0)}")


if __name__ == "__main__":
    main()
