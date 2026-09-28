#!/usr/bin/env python3
from __future__ import annotations

import json
from collections import Counter, defaultdict
from pathlib import Path


ROOT = Path(__file__).parent
BASE_JSON = ROOT / "verb_frames.french_300.generated.json"
OUT_JSON = ROOT / "verb_frames.french_320.generated.json"
OUT_JS = ROOT / "verb_frames.french_320.js"
OUT_MD = ROOT / "verb_frames.french_320.md"


MANUAL_EXTRA_ROWS = [
    {
        "verb": "présenter",
        "frame_type": "a_object",
        "question": "Le guide ____ la fresque ____ étudiants ce soir",
        "answer": "présente aux",
        "full_answer": "Le guide présente la fresque aux étudiants ce soir",
        "meaning_en": "The guide is presenting the fresco to the students tonight.",
        "category_id": "builtin-art-design",
        "category_name": "Art & Design",
        "note": "manual_night_extension",
    },
    {
        "verb": "parler",
        "frame_type": "de_object",
        "question": "Nous ____ ____ vernissage sous la verrière",
        "answer": "parlons du",
        "full_answer": "Nous parlons du vernissage sous la verrière",
        "meaning_en": "We're talking about the opening under the glass roof.",
        "category_id": "builtin-art-design",
        "category_name": "Art & Design",
        "note": "manual_night_extension",
    },
    {
        "verb": "répondre",
        "frame_type": "a_object",
        "question": "Je ____ ____ guichetier avec mon numéro de dossier",
        "answer": "réponds au",
        "full_answer": "Je réponds au guichetier avec mon numéro de dossier",
        "meaning_en": "I'm replying to the clerk with my file number.",
        "category_id": "builtin-bureaucracy-delivery",
        "category_name": "Bureaucracy & Delivery",
        "note": "manual_night_extension",
    },
    {
        "verb": "parler",
        "frame_type": "de_object",
        "question": "La critique ____ ____ montage pendant le débat",
        "answer": "parle du",
        "full_answer": "La critique parle du montage pendant le débat",
        "meaning_en": "The critic is talking about the editing during the discussion.",
        "category_id": "builtin-cinema-series",
        "category_name": "Cinema & Series",
        "note": "manual_night_extension",
    },
    {
        "verb": "servir",
        "frame_type": "a_object",
        "question": "Le cuisinier ____ le plat ____ derniers clients",
        "answer": "sert aux",
        "full_answer": "Le cuisinier sert le plat aux derniers clients",
        "meaning_en": "The cook serves the dish to the last customers.",
        "category_id": "builtin-cooking-food",
        "category_name": "Cooking & Food",
        "note": "manual_night_extension",
    },
    {
        "verb": "goûter",
        "frame_type": "a_object",
        "question": "On ____ ____ bouillon avant le barbecue",
        "answer": "goûte au",
        "full_answer": "On goûte au bouillon avant le barbecue",
        "meaning_en": "We're tasting the broth before the barbecue.",
        "category_id": "builtin-cooking-food",
        "category_name": "Cooking & Food",
        "note": "manual_night_extension",
    },
    {
        "verb": "coudre",
        "frame_type": "a_object",
        "question": "Je ____ l'étiquette ____ cabas pour le salon",
        "answer": "couds au",
        "full_answer": "Je couds l'étiquette au cabas pour le salon",
        "meaning_en": "I'm sewing the label onto the tote bag for the fair.",
        "category_id": "builtin-crafts-making",
        "category_name": "Crafts & Making",
        "note": "manual_night_extension",
    },
    {
        "verb": "répondre",
        "frame_type": "a_object",
        "question": "La prof ____ ____ questions après le quiz",
        "answer": "répond aux",
        "full_answer": "La prof répond aux questions après le quiz",
        "meaning_en": "The teacher answers the questions after the quiz.",
        "category_id": "builtin-education-learning",
        "category_name": "Education & Learning",
        "note": "manual_night_extension",
    },
    {
        "verb": "montrer",
        "frame_type": "a_object",
        "question": "Le conservateur ____ la carte ____ visiteurs",
        "answer": "montre aux",
        "full_answer": "Le conservateur montre la carte aux visiteurs",
        "meaning_en": "The curator shows the map to the visitors.",
        "category_id": "builtin-history-culture",
        "category_name": "History & Culture",
        "note": "manual_night_extension",
    },
    {
        "verb": "parler",
        "frame_type": "de_object",
        "question": "Le chanteur ____ ____ rappel dans les loges",
        "answer": "parle du",
        "full_answer": "Le chanteur parle du rappel dans les loges",
        "meaning_en": "The singer is talking about the encore backstage.",
        "category_id": "builtin-music",
        "category_name": "Music",
        "note": "manual_night_extension",
    },
    {
        "verb": "répondre",
        "frame_type": "a_object",
        "question": "Je ____ ____ videur avant d'entrer",
        "answer": "réponds au",
        "full_answer": "Je réponds au videur avant d'entrer",
        "meaning_en": "I answer the bouncer before going in.",
        "category_id": "builtin-nightlife-partying",
        "category_name": "Nightlife & Partying",
        "note": "manual_night_extension",
    },
    {
        "verb": "présenter",
        "frame_type": "a_object",
        "question": "Le chef ____ le planning ____ collègues dès huit heures",
        "answer": "présente aux",
        "full_answer": "Le chef présente le planning aux collègues dès huit heures",
        "meaning_en": "The manager presents the schedule to the colleagues at eight sharp.",
        "category_id": "builtin-office-admin",
        "category_name": "Office & Admin",
        "note": "manual_night_extension",
    },
    {
        "verb": "parler",
        "frame_type": "de_object",
        "question": "Je ____ ____ sentier avec le gardien du refuge",
        "answer": "parle du",
        "full_answer": "Je parle du sentier avec le gardien du refuge",
        "meaning_en": "I'm talking about the trail with the refuge keeper.",
        "category_id": "builtin-outdoors-nature",
        "category_name": "Outdoors & Nature",
        "note": "manual_night_extension",
    },
    {
        "verb": "répondre",
        "frame_type": "a_object",
        "question": "Le député ____ ____ journalistes en bas des marches",
        "answer": "répond aux",
        "full_answer": "Le député répond aux journalistes en bas des marches",
        "meaning_en": "The MP responds to the journalists at the foot of the steps.",
        "category_id": "builtin-politics-current-events",
        "category_name": "Politics & Current Events",
        "note": "manual_night_extension",
    },
    {
        "verb": "répondre",
        "frame_type": "a_object",
        "question": "Je ____ ____ Paul après deux jours de silence",
        "answer": "réponds à",
        "full_answer": "Je réponds à Paul après deux jours de silence",
        "meaning_en": "I reply to Paul after two days of silence.",
        "category_id": "builtin-relationship-drama",
        "category_name": "Relationship Drama",
        "note": "manual_night_extension",
    },
    {
        "verb": "montrer",
        "frame_type": "a_object",
        "question": "Le coach ____ la tactique ____ remplaçants dans le couloir",
        "answer": "montre aux",
        "full_answer": "Le coach montre la tactique aux remplaçants dans le couloir",
        "meaning_en": "The coach shows the tactics to the substitutes in the corridor.",
        "category_id": "builtin-sports-fitness",
        "category_name": "Sports & Fitness",
        "note": "manual_night_extension",
    },
    {
        "verb": "répondre",
        "frame_type": "a_object",
        "question": "Je ____ ____ voisin depuis le balcon",
        "answer": "réponds au",
        "full_answer": "Je réponds au voisin depuis le balcon",
        "meaning_en": "I answer the neighbor from the balcony.",
        "category_id": "builtin-super-everyday",
        "category_name": "Super Everyday",
        "note": "manual_night_extension",
    },
    {
        "verb": "répondre",
        "frame_type": "a_object",
        "question": "Le guide ____ ____ touristes devant l'embarcadère",
        "answer": "répond aux",
        "full_answer": "Le guide répond aux touristes devant l'embarcadère",
        "meaning_en": "The guide answers the tourists in front of the landing stage.",
        "category_id": "builtin-travel-tourism",
        "category_name": "Travel & Tourism",
        "note": "manual_night_extension",
    },
    {
        "verb": "montrer",
        "frame_type": "a_object",
        "question": "Je ____ le gabarit ____ client avant la découpe",
        "answer": "montre au",
        "full_answer": "Je montre le gabarit au client avant la découpe",
        "meaning_en": "I show the jig to the client before the cut.",
        "category_id": "builtin-woodworking",
        "category_name": "Woodworking",
        "note": "manual_night_extension",
    },
    {
        "verb": "parler",
        "frame_type": "de_object",
        "question": "Nous ____ ____ colis sur le chemin du retour",
        "answer": "parlons du",
        "full_answer": "Nous parlons du colis sur le chemin du retour",
        "meaning_en": "We're talking about the parcel on the way back.",
        "category_id": "builtin-bureaucracy-delivery",
        "category_name": "Bureaucracy & Delivery",
        "note": "manual_night_extension",
    },
]


def load_rows(path: Path) -> list[dict]:
    return json.loads(path.read_text(encoding="utf-8"))


def rebuild_ids(rows: list[dict]) -> list[dict]:
    family_counter: dict[tuple[str, str], int] = defaultdict(int)
    rebuilt = []
    for row in rows:
        item = dict(row)
        key = (item["verb"], item["frame_type"])
        family_counter[key] += 1
        item["frame_id"] = f"{item['verb']}_{item['frame_type']}_{family_counter[key]:02d}"
        rebuilt.append(item)
    return rebuilt


def write_outputs(rows: list[dict]) -> None:
    OUT_JSON.write_text(json.dumps(rows, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    OUT_JS.write_text("window.verbFrames = " + json.dumps(rows, ensure_ascii=False, indent=2) + ";\n", encoding="utf-8")

    by_category = Counter(row.get("category_name") or "" for row in rows)
    by_source = Counter(row.get("source") or "" for row in rows)
    lines = [
        "# French 320 Deck",
        "",
        f"- Total frame cards: {len(rows)}",
        "",
        "## By Source",
        "",
    ]
    for source, count in sorted(by_source.items()):
        lines.append(f"- {source}: {count}")
    lines.extend([
        "",
        "## By Category",
        "",
    ])
    for category_name, count in sorted(by_category.items()):
        lines.append(f"- {category_name}: {count}")
    OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> None:
    base_rows = load_rows(BASE_JSON)
    extra_rows = []
    for row in MANUAL_EXTRA_ROWS:
        item = dict(row)
        item["type"] = "frame"
        item["tense"] = "present"
        item["source"] = "manual_night_extension"
        extra_rows.append(item)
    merged = rebuild_ids(base_rows + extra_rows)
    write_outputs(merged)
    print(f"Wrote {len(merged)} frame cards to {OUT_JSON}")


if __name__ == "__main__":
    main()
