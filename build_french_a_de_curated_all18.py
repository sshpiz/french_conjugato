#!/usr/bin/env python3
"""
Build the all-category curated French A/De dataset.

This extends the first-10-category curated dataset with hand-validated rows for
the remaining categories. It intentionally prefers deterministic coverage over
waiting for another model run to stumble into the missing complement patterns.
"""

from __future__ import annotations

import json
from collections import defaultdict
from pathlib import Path

from generate_category_phrase_harvest import load_category_spec, load_dicovalence_hints, mechanical_judgment_for_row


ROOT = Path(__file__).parent
BASE_DATASET = ROOT / "french_a_de_curated_dataset.first10.json"
OUT_TARGETS = ROOT / "french_a_de_curated_targets.all18.json"
OUT_DATASET = ROOT / "french_a_de_curated_dataset.all18.json"
OUT_REPORT = ROOT / "french_a_de_curated_dataset.all18.md"


ADDITIONAL_TARGETS = [
    {"category_id": "builtin-cinema-series", "verb": "raconter", "family": "a", "accepted_labels": ["a_selected"], "reason": "tell something to someone"},
    {"category_id": "builtin-relationship-drama", "verb": "discuter", "family": "de", "accepted_labels": ["de_selected"], "reason": "talk about"},
    {"category_id": "builtin-relationship-drama", "verb": "pardonner", "family": "a", "accepted_labels": ["a_selected"], "reason": "forgive someone"},
    {"category_id": "builtin-relationship-drama", "verb": "reprocher", "family": "a", "accepted_labels": ["a_selected"], "reason": "reproach someone for"},
    {"category_id": "builtin-relationship-drama", "verb": "sortir", "family": "de", "accepted_labels": ["de_selected", "de_source_or_location"], "reason": "get out of / leave"},
    {"category_id": "builtin-office-admin", "verb": "assurer", "family": "de", "accepted_labels": ["de_selected"], "reason": "assure of"},
    {"category_id": "builtin-office-admin", "verb": "envoyer", "family": "a", "accepted_labels": ["a_selected"], "reason": "send to"},
    {"category_id": "builtin-office-admin", "verb": "rappeler", "family": "a", "accepted_labels": ["a_selected"], "reason": "remind/tell again to"},
    {"category_id": "builtin-office-admin", "verb": "répondre", "family": "a", "accepted_labels": ["a_selected"], "reason": "reply to"},
    {"category_id": "builtin-office-admin", "verb": "traiter", "family": "de", "accepted_labels": ["de_selected"], "reason": "deal with / treat of"},
    {"category_id": "builtin-office-admin", "verb": "travailler", "family": "a", "accepted_labels": ["a_selected"], "reason": "work on"},
    {"category_id": "builtin-bureaucracy-delivery", "verb": "attendre", "family": "de", "accepted_labels": ["de_selected"], "reason": "expect from"},
    {"category_id": "builtin-bureaucracy-delivery", "verb": "confirmer", "family": "a", "accepted_labels": ["a_selected"], "reason": "confirm to"},
    {"category_id": "builtin-bureaucracy-delivery", "verb": "envoyer", "family": "a", "accepted_labels": ["a_selected"], "reason": "send to"},
    {"category_id": "builtin-bureaucracy-delivery", "verb": "laisser", "family": "a", "accepted_labels": ["a_selected", "a_movement_or_location"], "reason": "leave with/at"},
    {"category_id": "builtin-bureaucracy-delivery", "verb": "livrer", "family": "a", "accepted_labels": ["a_selected", "a_movement_or_location"], "reason": "deliver to"},
    {"category_id": "builtin-bureaucracy-delivery", "verb": "passer", "family": "a", "accepted_labels": ["a_selected", "a_movement_or_location"], "reason": "come by / stop at"},
    {"category_id": "builtin-bureaucracy-delivery", "verb": "répondre", "family": "a", "accepted_labels": ["a_selected"], "reason": "reply to"},
    {"category_id": "builtin-bureaucracy-delivery", "verb": "venir", "family": "a", "accepted_labels": ["a_selected", "a_movement_or_location"], "reason": "come to"},
    {"category_id": "builtin-travel-tourism", "verb": "arriver", "family": "a", "accepted_labels": ["a_selected", "a_movement_or_location"], "reason": "arrive at"},
    {"category_id": "builtin-travel-tourism", "verb": "payer", "family": "a", "accepted_labels": ["a_selected"], "reason": "pay someone / pay to"},
    {"category_id": "builtin-travel-tourism", "verb": "réserver", "family": "a", "accepted_labels": ["a_selected"], "reason": "reserve for"},
    {"category_id": "builtin-education-learning", "verb": "apprendre", "family": "a", "accepted_labels": ["a_selected"], "reason": "teach/learn to"},
    {"category_id": "builtin-education-learning", "verb": "enseigner", "family": "a", "accepted_labels": ["a_selected"], "reason": "teach to"},
]


SECOND_WAVE_TARGETS = [
    {"category_id": "builtin-art-design", "verb": "exposer", "family": "a", "accepted_labels": ["a_selected"], "reason": "expose something to the public"},
    {"category_id": "builtin-bureaucracy-delivery", "verb": "appeler", "family": "a", "accepted_labels": ["a_selected"], "reason": "call a service or desk"},
    {"category_id": "builtin-bureaucracy-delivery", "verb": "indiquer", "family": "a", "accepted_labels": ["a_selected"], "reason": "indicate something to someone"},
    {"category_id": "builtin-bureaucracy-delivery", "verb": "joindre", "family": "a", "accepted_labels": ["a_selected"], "reason": "attach something to something"},
    {"category_id": "builtin-bureaucracy-delivery", "verb": "ouvrir", "family": "a", "accepted_labels": ["a_selected"], "reason": "open something to the public"},
    {"category_id": "builtin-cinema-series", "verb": "couper", "family": "a", "accepted_labels": ["a_selected"], "reason": "cut someone off"},
    {"category_id": "builtin-cinema-series", "verb": "tourner", "family": "a", "accepted_labels": ["a_selected"], "reason": "turn into"},
    {"category_id": "builtin-cooking-food", "verb": "mélanger", "family": "a", "accepted_labels": ["a_selected"], "reason": "mix into/with"},
    {"category_id": "builtin-cooking-food", "verb": "préparer", "family": "a", "accepted_labels": ["a_selected"], "reason": "prepare something for someone"},
    {"category_id": "builtin-crafts-making", "verb": "ajuster", "family": "a", "accepted_labels": ["a_selected"], "reason": "adjust to"},
    {"category_id": "builtin-crafts-making", "verb": "coller", "family": "a", "accepted_labels": ["a_selected"], "reason": "glue onto"},
    {"category_id": "builtin-crafts-making", "verb": "coudre", "family": "a", "accepted_labels": ["a_selected"], "reason": "sew onto"},
    {"category_id": "builtin-education-learning", "verb": "apprendre", "family": "de", "accepted_labels": ["de_selected"], "reason": "learn from"},
    {"category_id": "builtin-education-learning", "verb": "expliquer", "family": "a", "accepted_labels": ["a_selected"], "reason": "explain to"},
    {"category_id": "builtin-education-learning", "verb": "présenter", "family": "a", "accepted_labels": ["a_selected"], "reason": "present to"},
    {"category_id": "builtin-education-learning", "verb": "écrire", "family": "a", "accepted_labels": ["a_selected"], "reason": "write to"},
    {"category_id": "builtin-history-culture", "verb": "exposer", "family": "a", "accepted_labels": ["a_selected"], "reason": "show to the public"},
    {"category_id": "builtin-history-culture", "verb": "écrire", "family": "a", "accepted_labels": ["a_selected"], "reason": "write to an institution"},
    {"category_id": "builtin-music", "verb": "assurer", "family": "a", "accepted_labels": ["a_selected"], "reason": "guarantee/provide to"},
    {"category_id": "builtin-music", "verb": "jouer", "family": "de", "accepted_labels": ["de_selected"], "reason": "play an instrument"},
    {"category_id": "builtin-nightlife-partying", "verb": "inviter", "family": "a", "accepted_labels": ["a_selected"], "reason": "invite to"},
    {"category_id": "builtin-nightlife-partying", "verb": "sortir", "family": "a", "accepted_labels": ["a_selected", "a_movement_or_location"], "reason": "go out to"},
    {"category_id": "builtin-office-admin", "verb": "assurer", "family": "a", "accepted_labels": ["a_selected"], "reason": "assure or guarantee to"},
    {"category_id": "builtin-office-admin", "verb": "bosser", "family": "a", "accepted_labels": ["a_selected"], "reason": "work on"},
    {"category_id": "builtin-office-admin", "verb": "présenter", "family": "a", "accepted_labels": ["a_selected"], "reason": "present to"},
    {"category_id": "builtin-office-admin", "verb": "répondre", "family": "de", "accepted_labels": ["de_selected"], "reason": "be responsible for"},
    {"category_id": "builtin-office-admin", "verb": "transférer", "family": "a", "accepted_labels": ["a_selected"], "reason": "transfer to"},
    {"category_id": "builtin-outdoors-nature", "verb": "grimper", "family": "a", "accepted_labels": ["a_selected", "a_movement_or_location"], "reason": "climb to"},
    {"category_id": "builtin-politics-current-events", "verb": "condamner", "family": "a", "accepted_labels": ["a_selected"], "reason": "sentence to"},
    {"category_id": "builtin-politics-current-events", "verb": "débattre", "family": "de", "accepted_labels": ["de_selected"], "reason": "debate about"},
    {"category_id": "builtin-politics-current-events", "verb": "imposer", "family": "a", "accepted_labels": ["a_selected"], "reason": "impose on"},
    {"category_id": "builtin-politics-current-events", "verb": "promettre", "family": "a", "accepted_labels": ["a_selected"], "reason": "promise to"},
    {"category_id": "builtin-relationship-drama", "verb": "mentir", "family": "a", "accepted_labels": ["a_selected"], "reason": "lie to"},
    {"category_id": "builtin-sports-fitness", "verb": "jouer", "family": "a", "accepted_labels": ["a_selected"], "reason": "play a sport/game"},
    {"category_id": "builtin-super-everyday", "verb": "acheter", "family": "a", "accepted_labels": ["a_selected"], "reason": "buy from or for"},
    {"category_id": "builtin-super-everyday", "verb": "aller", "family": "a", "accepted_labels": ["a_selected", "a_movement_or_location"], "reason": "go to"},
    {"category_id": "builtin-super-everyday", "verb": "appeler", "family": "a", "accepted_labels": ["a_selected"], "reason": "call a place or service"},
    {"category_id": "builtin-super-everyday", "verb": "sortir", "family": "a", "accepted_labels": ["a_selected", "a_movement_or_location"], "reason": "go out to"},
    {"category_id": "builtin-super-everyday", "verb": "venir", "family": "de", "accepted_labels": ["de_selected", "de_source_or_location"], "reason": "come from"},
    {"category_id": "builtin-travel-tourism", "verb": "louer", "family": "a", "accepted_labels": ["a_selected"], "reason": "rent to"},
    {"category_id": "builtin-travel-tourism", "verb": "partir", "family": "de", "accepted_labels": ["de_selected", "de_source_or_location"], "reason": "leave from"},
    {"category_id": "builtin-woodworking", "verb": "ajuster", "family": "a", "accepted_labels": ["a_selected"], "reason": "adjust to fit"},
    {"category_id": "builtin-woodworking", "verb": "coller", "family": "a", "accepted_labels": ["a_selected"], "reason": "glue onto"},
]


ADDITIONAL_ROWS = {
    ("builtin-cinema-series", "raconter", "a"): {
        "sentence_fr": "Le réalisateur raconte la scène au producteur après la projection.",
        "translation_en": "The director describes the scene to the producer after the screening.",
        "tense": "present",
        "subject": "le réalisateur",
    },
    ("builtin-relationship-drama", "discuter", "de"): {
        "sentence_fr": "On discute de cette dispute pendant le dîner.",
        "translation_en": "We're talking about this argument over dinner.",
        "tense": "present",
        "subject": "on",
    },
    ("builtin-relationship-drama", "pardonner", "a"): {
        "sentence_fr": "Elle pardonne enfin à Marc après son message.",
        "translation_en": "She finally forgives Marc after his message.",
        "tense": "present",
        "subject": "elle",
    },
    ("builtin-relationship-drama", "reprocher", "a"): {
        "sentence_fr": "Je reproche à Léa son silence depuis lundi.",
        "translation_en": "I blame Léa for her silence since Monday.",
        "tense": "present",
        "subject": "je",
    },
    ("builtin-relationship-drama", "sortir", "de"): {
        "sentence_fr": "Elle veut sortir de cette relation avant l'été.",
        "translation_en": "She wants to get out of this relationship before summer.",
        "tense": "present",
        "subject": "elle",
    },
    ("builtin-office-admin", "assurer", "de"): {
        "sentence_fr": "Le directeur nous assure du soutien du siège cette semaine.",
        "translation_en": "The director assures us of head office's support this week.",
        "tense": "present",
        "subject": "le directeur",
    },
    ("builtin-office-admin", "envoyer", "a"): {
        "sentence_fr": "J'envoie le dossier au service paie avant dix heures.",
        "translation_en": "I'm sending the file to payroll before ten o'clock.",
        "tense": "present",
        "subject": "je",
    },
    ("builtin-office-admin", "rappeler", "a"): {
        "sentence_fr": "Je rappelle la procédure à l'équipe chaque lundi.",
        "translation_en": "I remind the team of the procedure every Monday.",
        "tense": "present",
        "subject": "je",
    },
    ("builtin-office-admin", "répondre", "a"): {
        "sentence_fr": "Le service répond au client dans la matinée.",
        "translation_en": "The department replies to the client during the morning.",
        "tense": "present",
        "subject": "le service",
    },
    ("builtin-office-admin", "traiter", "de"): {
        "sentence_fr": "Le rapport traite de la baisse des ventes ce trimestre.",
        "translation_en": "The report deals with the drop in sales this quarter.",
        "tense": "present",
        "subject": "le rapport",
    },
    ("builtin-office-admin", "travailler", "a"): {
        "sentence_fr": "Je travaille au budget du trimestre cet après-midi.",
        "translation_en": "I'm working on the quarterly budget this afternoon.",
        "tense": "present",
        "subject": "je",
    },
    ("builtin-bureaucracy-delivery", "attendre", "de"): {
        "sentence_fr": "Le service attend de vous un justificatif signé.",
        "translation_en": "The department is expecting a signed supporting document from you.",
        "tense": "present",
        "subject": "le service",
    },
    ("builtin-bureaucracy-delivery", "confirmer", "a"): {
        "sentence_fr": "Je confirme le rendez-vous à l'agent par mail.",
        "translation_en": "I confirm the appointment to the clerk by email.",
        "tense": "present",
        "subject": "je",
    },
    ("builtin-bureaucracy-delivery", "envoyer", "a"): {
        "sentence_fr": "Nous envoyons le dossier au service central avant midi.",
        "translation_en": "We send the file to the central department before noon.",
        "tense": "present",
        "subject": "nous",
    },
    ("builtin-bureaucracy-delivery", "laisser", "a"): {
        "sentence_fr": "Je laisse les copies à l'accueil avant midi.",
        "translation_en": "I leave the copies at reception before noon.",
        "tense": "present",
        "subject": "je",
    },
    ("builtin-bureaucracy-delivery", "livrer", "a"): {
        "sentence_fr": "Le transporteur livre le dossier au service central demain matin.",
        "translation_en": "The carrier delivers the file to the central department tomorrow morning.",
        "tense": "present",
        "subject": "le transporteur",
    },
    ("builtin-bureaucracy-delivery", "passer", "a"): {
        "sentence_fr": "Je passe au guichet après ma pause.",
        "translation_en": "I'm stopping by the counter after my break.",
        "tense": "present",
        "subject": "je",
    },
    ("builtin-bureaucracy-delivery", "répondre", "a"): {
        "sentence_fr": "L'agent répond à l'interphone tout de suite.",
        "translation_en": "The clerk answers the intercom right away.",
        "tense": "present",
        "subject": "l'agent",
    },
    ("builtin-bureaucracy-delivery", "venir", "a"): {
        "sentence_fr": "Vous venez au guichet avec votre numéro de dossier.",
        "translation_en": "You come to the counter with your file number.",
        "tense": "present",
        "subject": "vous",
    },
    ("builtin-travel-tourism", "arriver", "a"): {
        "sentence_fr": "Nous arrivons à la gare avant l'aube.",
        "translation_en": "We arrive at the station before dawn.",
        "tense": "present",
        "subject": "nous",
    },
    ("builtin-travel-tourism", "payer", "a"): {
        "sentence_fr": "Je paie un supplément au chauffeur pour la navette privée.",
        "translation_en": "I pay the driver a surcharge for the private shuttle.",
        "tense": "present",
        "subject": "je",
    },
    ("builtin-travel-tourism", "réserver", "a"): {
        "sentence_fr": "Je réserve une chambre à mes parents pour le week-end.",
        "translation_en": "I'm booking a room for my parents for the weekend.",
        "tense": "present",
        "subject": "je",
    },
    ("builtin-education-learning", "apprendre", "a"): {
        "sentence_fr": "Le professeur apprend la règle aux élèves dès le matin.",
        "translation_en": "The teacher teaches the rule to the students first thing in the morning.",
        "tense": "present",
        "subject": "le professeur",
    },
    ("builtin-education-learning", "enseigner", "a"): {
        "sentence_fr": "Le professeur enseigne la grammaire aux débutants.",
        "translation_en": "The teacher teaches grammar to beginners.",
        "tense": "present",
        "subject": "le professeur",
    },
}


SECOND_WAVE_ROWS = {
    ("builtin-art-design", "exposer", "a"): {
        "sentence_fr": "La galerie expose les nouvelles toiles au public dès vendredi.",
        "translation_en": "The gallery is showing the new canvases to the public starting Friday.",
        "tense": "present",
        "subject": "la galerie",
    },
    ("builtin-bureaucracy-delivery", "appeler", "a"): {
        "sentence_fr": "J'appelle au standard dès l'ouverture du service.",
        "translation_en": "I'm calling the switchboard as soon as the department opens.",
        "tense": "present",
        "subject": "je",
    },
    ("builtin-bureaucracy-delivery", "indiquer", "a"): {
        "sentence_fr": "L'agent indique la sortie au visiteur sans attendre.",
        "translation_en": "The clerk points out the exit to the visitor without waiting.",
        "tense": "present",
        "subject": "l'agent",
    },
    ("builtin-bureaucracy-delivery", "joindre", "a"): {
        "sentence_fr": "Je joins mon CV à la candidature ce soir.",
        "translation_en": "I'm attaching my CV to the application tonight.",
        "tense": "present",
        "subject": "je",
    },
    ("builtin-bureaucracy-delivery", "ouvrir", "a"): {
        "sentence_fr": "Le service ouvre ses portes au public dès huit heures.",
        "translation_en": "The department opens its doors to the public at eight sharp.",
        "tense": "present",
        "subject": "le service",
    },
    ("builtin-cinema-series", "couper", "a"): {
        "sentence_fr": "Le monteur coupe la parole à l'actrice pendant l'interview.",
        "translation_en": "The editor cuts the actress off during the interview.",
        "tense": "present",
        "subject": "le monteur",
    },
    ("builtin-cinema-series", "tourner", "a"): {
        "sentence_fr": "La scène tourne à la farce en moins d'une minute.",
        "translation_en": "The scene turns into farce in less than a minute.",
        "tense": "present",
        "subject": "la scène",
    },
    ("builtin-cooking-food", "mélanger", "a"): {
        "sentence_fr": "Je mélange la sauce aux pâtes encore chaudes.",
        "translation_en": "I mix the sauce into the still-hot pasta.",
        "tense": "present",
        "subject": "je",
    },
    ("builtin-cooking-food", "préparer", "a"): {
        "sentence_fr": "Je prépare un brunch aux voisins de passage.",
        "translation_en": "I'm making brunch for the neighbors who dropped by.",
        "tense": "present",
        "subject": "je",
    },
    ("builtin-crafts-making", "ajuster", "a"): {
        "sentence_fr": "J'ajuste la sangle au sac avant la livraison.",
        "translation_en": "I'm adjusting the strap to the bag before delivery.",
        "tense": "present",
        "subject": "je",
    },
    ("builtin-crafts-making", "coller", "a"): {
        "sentence_fr": "Je colle l'étiquette au bocal encore tiède.",
        "translation_en": "I'm gluing the label onto the still-warm jar.",
        "tense": "present",
        "subject": "je",
    },
    ("builtin-crafts-making", "coudre", "a"): {
        "sentence_fr": "Je couds la doublure au manteau ce soir.",
        "translation_en": "I'm sewing the lining into the coat tonight.",
        "tense": "present",
        "subject": "je",
    },
    ("builtin-education-learning", "apprendre", "de"): {
        "sentence_fr": "Les élèves apprennent de leurs erreurs en laboratoire.",
        "translation_en": "The students learn from their mistakes in the lab.",
        "tense": "present",
        "subject": "les élèves",
    },
    ("builtin-education-learning", "expliquer", "a"): {
        "sentence_fr": "La prof explique la règle à Hugo au premier rang.",
        "translation_en": "The teacher explains the rule to Hugo in the front row.",
        "tense": "present",
        "subject": "la prof",
    },
    ("builtin-education-learning", "présenter", "a"): {
        "sentence_fr": "L'étudiante présente son projet au jury demain matin.",
        "translation_en": "The student presents her project to the panel tomorrow morning.",
        "tense": "present",
        "subject": "l'étudiante",
    },
    ("builtin-education-learning", "écrire", "a"): {
        "sentence_fr": "J'écris au professeur pour clarifier la consigne.",
        "translation_en": "I'm writing to the teacher to clarify the instructions.",
        "tense": "present",
        "subject": "je",
    },
    ("builtin-history-culture", "exposer", "a"): {
        "sentence_fr": "Le musée expose ses archives au public cet été.",
        "translation_en": "The museum is displaying its archives to the public this summer.",
        "tense": "present",
        "subject": "le musée",
    },
    ("builtin-history-culture", "écrire", "a"): {
        "sentence_fr": "L'historienne écrit au musée pour consulter les lettres.",
        "translation_en": "The historian is writing to the museum to consult the letters.",
        "tense": "present",
        "subject": "l'historienne",
    },
    ("builtin-music", "assurer", "a"): {
        "sentence_fr": "Le régisseur assure au groupe un retour clair sur scène.",
        "translation_en": "The stage manager gives the band a clear monitor feed on stage.",
        "tense": "present",
        "subject": "le régisseur",
    },
    ("builtin-music", "jouer", "de"): {
        "sentence_fr": "Elle joue du violoncelle pendant tout le rappel.",
        "translation_en": "She plays cello throughout the encore.",
        "tense": "present",
        "subject": "elle",
    },
    ("builtin-nightlife-partying", "inviter", "a"): {
        "sentence_fr": "J'invite l'équipe à l'after du vendredi.",
        "translation_en": "I'm inviting the team to Friday's after-party.",
        "tense": "present",
        "subject": "je",
    },
    ("builtin-nightlife-partying", "sortir", "a"): {
        "sentence_fr": "On sort au club vers minuit.",
        "translation_en": "We're going out to the club around midnight.",
        "tense": "present",
        "subject": "on",
    },
    ("builtin-office-admin", "assurer", "a"): {
        "sentence_fr": "Le manager assure au client un suivi hebdomadaire.",
        "translation_en": "The manager guarantees the client weekly follow-up.",
        "tense": "present",
        "subject": "le manager",
    },
    ("builtin-office-admin", "bosser", "a"): {
        "sentence_fr": "Je bosse au rapport annuel tout l'après-midi.",
        "translation_en": "I'm working on the annual report all afternoon.",
        "tense": "present",
        "subject": "je",
    },
    ("builtin-office-admin", "présenter", "a"): {
        "sentence_fr": "Je présente le budget à la direction avant midi.",
        "translation_en": "I'm presenting the budget to management before noon.",
        "tense": "present",
        "subject": "je",
    },
    ("builtin-office-admin", "répondre", "de"): {
        "sentence_fr": "Le directeur répond de la conformité du dossier.",
        "translation_en": "The director is accountable for the file's compliance.",
        "tense": "present",
        "subject": "le directeur",
    },
    ("builtin-office-admin", "transférer", "a"): {
        "sentence_fr": "Je transfère le dossier au service juridique dès que Marc signe.",
        "translation_en": "I'm transferring the file to legal as soon as Marc signs.",
        "tense": "present",
        "subject": "je",
    },
    ("builtin-outdoors-nature", "grimper", "a"): {
        "sentence_fr": "On grimpe au belvédère avant le lever du soleil.",
        "translation_en": "We're climbing up to the viewpoint before sunrise.",
        "tense": "present",
        "subject": "on",
    },
    ("builtin-politics-current-events", "condamner", "a"): {
        "sentence_fr": "Le tribunal condamne le militant à six mois avec sursis.",
        "translation_en": "The court sentences the activist to a six-month suspended term.",
        "tense": "present",
        "subject": "le tribunal",
    },
    ("builtin-politics-current-events", "débattre", "de"): {
        "sentence_fr": "Les députés débattent de la réforme pendant la séance.",
        "translation_en": "The MPs debate the reform during the session.",
        "tense": "present",
        "subject": "les députés",
    },
    ("builtin-politics-current-events", "imposer", "a"): {
        "sentence_fr": "Le ministre impose un calendrier serré aux préfets.",
        "translation_en": "The minister imposes a tight schedule on the prefects.",
        "tense": "present",
        "subject": "le ministre",
    },
    ("builtin-politics-current-events", "promettre", "a"): {
        "sentence_fr": "Le candidat promet une baisse d'impôts aux retraités.",
        "translation_en": "The candidate promises retirees a tax cut.",
        "tense": "present",
        "subject": "le candidat",
    },
    ("builtin-relationship-drama", "mentir", "a"): {
        "sentence_fr": "Il ment à sa compagne depuis des semaines.",
        "translation_en": "He's been lying to his partner for weeks.",
        "tense": "present",
        "subject": "il",
    },
    ("builtin-sports-fitness", "jouer", "a"): {
        "sentence_fr": "On joue au basket sur le terrain couvert.",
        "translation_en": "We're playing basketball on the covered court.",
        "tense": "present",
        "subject": "on",
    },
    ("builtin-super-everyday", "acheter", "a"): {
        "sentence_fr": "J'achète un journal au kiosquier avant le train.",
        "translation_en": "I'm buying a newspaper from the kiosk seller before the train.",
        "tense": "present",
        "subject": "je",
    },
    ("builtin-super-everyday", "aller", "a"): {
        "sentence_fr": "Je vais à la pharmacie avant de rentrer.",
        "translation_en": "I'm going to the pharmacy before heading home.",
        "tense": "present",
        "subject": "je",
    },
    ("builtin-super-everyday", "appeler", "a"): {
        "sentence_fr": "J'appelle au cabinet du dentiste avant de partir.",
        "translation_en": "I'm calling the dentist's office before I leave.",
        "tense": "present",
        "subject": "je",
    },
    ("builtin-super-everyday", "sortir", "a"): {
        "sentence_fr": "Je sors au marché avant neuf heures.",
        "translation_en": "I'm going out to the market before nine o'clock.",
        "tense": "present",
        "subject": "je",
    },
    ("builtin-super-everyday", "venir", "de"): {
        "sentence_fr": "Je viens du marché avec deux sacs.",
        "translation_en": "I'm coming back from the market with two bags.",
        "tense": "present",
        "subject": "je",
    },
    ("builtin-travel-tourism", "louer", "a"): {
        "sentence_fr": "On loue ce studio aux touristes en juillet.",
        "translation_en": "We rent this studio to tourists in July.",
        "tense": "present",
        "subject": "on",
    },
    ("builtin-travel-tourism", "partir", "de"): {
        "sentence_fr": "Nous partons du terminal B avant le lever du jour.",
        "translation_en": "We're leaving from Terminal B before daybreak.",
        "tense": "present",
        "subject": "nous",
    },
    ("builtin-woodworking", "ajuster", "a"): {
        "sentence_fr": "J'ajuste le gabarit à l'épaisseur du plateau.",
        "translation_en": "I'm adjusting the jig to the thickness of the panel.",
        "tense": "present",
        "subject": "je",
    },
    ("builtin-woodworking", "coller", "a"): {
        "sentence_fr": "Je colle le chant au panneau avant le serrage.",
        "translation_en": "I'm gluing the edge banding onto the panel before clamping.",
        "tense": "present",
        "subject": "je",
    },
}


def load_base_dataset() -> list[dict]:
    return json.loads(BASE_DATASET.read_text(encoding="utf-8"))


def build_additional_rows() -> list[dict]:
    all_targets = ADDITIONAL_TARGETS + SECOND_WAVE_TARGETS
    all_rows = {**ADDITIONAL_ROWS, **SECOND_WAVE_ROWS}
    rows = []
    for target in all_targets:
        key = (target["category_id"], target["verb"], target["family"])
        base = all_rows[key]
        category = load_category_spec(target["category_id"])
        row = {
            "category_id": target["category_id"],
            "category_name": category["name"],
            "scope": category["scope"],
            "verb": target["verb"],
            "family": target["family"],
            "accepted_labels": target["accepted_labels"],
            "target_reason": target["reason"],
            "source": "manual_backfill",
            "sentence_fr": base["sentence_fr"],
            "translation_en": base["translation_en"],
            "tense": base["tense"],
            "subject": base["subject"],
            "note": "manual_curated_backfill",
        }
        verdict = mechanical_judgment_for_row(
            {"verb": row["verb"], "sentence_fr": row["sentence_fr"]},
            hints=load_dicovalence_hints(target["category_id"]),
        )
        if verdict.get("label") not in set(target["accepted_labels"]):
            raise ValueError(f"Manual row failed validation for {key}: {verdict}")
        row["bonus_label"] = verdict["label"]
        row["bonus_reason"] = verdict.get("reason", "")
        row["judge_source"] = "manual_mechanical"
        rows.append(row)
    return rows


def write_outputs(dataset: list[dict], targets: list[dict]) -> None:
    OUT_TARGETS.write_text(json.dumps(targets, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    OUT_DATASET.write_text(json.dumps(dataset, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    by_category: dict[str, list[dict]] = defaultdict(list)
    manual_count = 0
    for row in dataset:
        by_category[row["category_id"]].append(row)
        if row["source"] == "manual_backfill":
            manual_count += 1

    lines = [
        "# French A/De Curated Dataset (All 18 Categories)",
        "",
        f"- Target count: `{len(dataset)}`",
        f"- Coverage: `{len(dataset)}/{len(targets)}`",
        f"- Existing kept rows: `{len(dataset) - manual_count}`",
        f"- Manual backfills: `{manual_count}`",
        "",
        "## By Category",
        "",
        "| Category | Targets | Manual |",
        "| --- | ---: | ---: |",
    ]

    for category_id, rows in sorted(by_category.items()):
        category_name = rows[0]["category_name"]
        category_manual = sum(1 for row in rows if row["source"] == "manual_backfill")
        lines.append(f"| {category_name} | {len(rows)} | {category_manual} |")

    lines.extend(
        [
            "",
            "## Rows",
            "",
            "| Category | Verb | Family | Label | Source | French |",
            "| --- | --- | --- | --- | --- | --- |",
        ]
    )

    for row in dataset:
        lines.append(
            f"| {row['category_name']} | {row['verb']} | {row['family']} | {row['bonus_label']} | {row['source']} | {row['sentence_fr'].replace('|', '/')} |"
        )

    OUT_REPORT.write_text("\n".join(lines).rstrip() + "\n", encoding="utf-8")


def main() -> None:
    base_dataset = load_base_dataset()
    additional_rows = build_additional_rows()
    dataset = sorted(base_dataset + additional_rows, key=lambda row: (row["category_id"], row["verb"], row["family"]))
    targets = []
    for row in dataset:
        targets.append(
            {
                "category_id": row["category_id"],
                "verb": row["verb"],
                "family": row["family"],
                "accepted_labels": row["accepted_labels"],
                "reason": row["target_reason"],
            }
        )
    write_outputs(dataset, targets)
    print(f"Wrote all-category curated dataset with {len(dataset)}/{len(targets)} coverage to {OUT_DATASET}")


if __name__ == "__main__":
    main()
