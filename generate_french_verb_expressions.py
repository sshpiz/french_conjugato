#!/usr/bin/env python3
"""Add French verb-expression cards to the generated web data.

The source conjugation table already contains the base verbs. This script derives
expression infinitives such as ``s'en aller`` and ``en avoir marre`` by wrapping
the base conjugated form with the right clitic expression.
"""

from __future__ import annotations

import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parent
VERB_DATA_PATH = ROOT / "js" / "verbs.full.generated.js"
USAGES_JSON_PATH = ROOT / "verb_usages.json"
USAGES_JS_PATH = ROOT / "verb_usages.js"
EXPRESSION_FREQUENCY = "top-500"

PRONOUNS = ["je", "tu", "il/elle/on", "nous", "vous", "ils/elles"]
SUBJECT = {
    "je": "je",
    "tu": "tu",
    "il/elle/on": "il",
    "nous": "nous",
    "vous": "vous",
    "ils/elles": "ils",
}
REFLEXIVE_EN = {
    "je": "m'en",
    "tu": "t'en",
    "il/elle/on": "s'en",
    "nous": "nous en",
    "vous": "vous en",
    "ils/elles": "s'en",
}
ETRE_PRESENT = {
    "je": "suis",
    "tu": "es",
    "il/elle/on": "est",
    "nous": "sommes",
    "vous": "êtes",
    "ils/elles": "sont",
}
ETRE_IMPARFAIT = {
    "je": "étais",
    "tu": "étais",
    "il/elle/on": "était",
    "nous": "étions",
    "vous": "étiez",
    "ils/elles": "étaient",
}


def canonical(value: str) -> str:
    return value.replace("’", "'").strip()


EXPRESSIONS = [
    # Core expression deck.
    {"expression": "s'en aller", "base": "aller", "kind": "reflexive_en", "gloss": "to go away; leave", "usage": "Je m'en vais avant la pluie.", "usage_en": "I'm leaving before the rain."},
    {"expression": "s'en foutre", "base": "foutre", "kind": "reflexive_en", "gloss": "not to give a damn", "usage": "Il s'en fout complètement.", "usage_en": "He really doesn't give a damn.", "hint": "vulgar; very informal"},
    {"expression": "s'en fiche", "base": "ficher", "kind": "reflexive_en", "gloss": "not to care", "usage": "Elle s'en fiche du regard des autres.", "usage_en": "She doesn't care what others think.", "hint": "informal"},
    {"expression": "s'en sortir", "base": "sortir", "kind": "reflexive_en", "gloss": "to manage; get through it", "usage": "On s'en sort avec un peu d'aide.", "usage_en": "We're managing with a little help."},
    {"expression": "s'en tirer", "base": "tirer", "kind": "reflexive_en", "gloss": "to get away with it; manage", "usage": "Tu t'en tires bien cette fois.", "usage_en": "You get out of it well this time."},
    {"expression": "s'en occuper", "base": "occuper", "kind": "reflexive_en", "gloss": "to take care of it", "usage": "Je m'en occupe après le déjeuner.", "usage_en": "I'll take care of it after lunch."},
    {"expression": "s'en charger", "base": "charger", "kind": "reflexive_en", "gloss": "to handle it; take charge of it", "usage": "Nous nous en chargeons demain matin.", "usage_en": "We'll handle it tomorrow morning."},
    {"expression": "s'en servir", "base": "servir", "kind": "reflexive_en", "gloss": "to use it", "usage": "Elle s'en sert pour réparer son vélo.", "usage_en": "She uses it to fix her bike."},
    {"expression": "s'en passer", "base": "passer", "kind": "reflexive_en", "gloss": "to do without it", "usage": "Je m'en passe très bien.", "usage_en": "I do perfectly well without it."},
    {"expression": "s'en souvenir", "base": "souvenir", "kind": "reflexive_en", "gloss": "to remember it", "usage": "Tu t'en souviens encore ?", "usage_en": "Do you still remember it?"},
    {"expression": "s'en rappeler", "base": "rappeler", "kind": "reflexive_en", "gloss": "to remember it", "usage": "Il s'en rappelle soudain.", "usage_en": "He suddenly remembers it."},
    {"expression": "s'en rendre compte", "base": "rendre", "kind": "reflexive_en", "tail": "compte", "gloss": "to realize it", "usage": "Je m'en rends compte trop tard.", "usage_en": "I realize it too late."},
    {"expression": "s'en apercevoir", "base": "apercevoir", "kind": "reflexive_en", "gloss": "to notice it", "usage": "Elle s'en aperçoit en relisant le message.", "usage_en": "She notices it while rereading the message."},
    {"expression": "s'en douter", "base": "douter", "kind": "reflexive_en", "gloss": "to suspect it", "usage": "Je m'en doutais depuis hier.", "usage_en": "I suspected it since yesterday."},
    {"expression": "s'en méfier", "base": "méfier", "kind": "reflexive_en", "gloss": "to be wary of it", "usage": "Ils s'en méfient maintenant.", "usage_en": "They're wary of it now."},
    {"expression": "s'en moquer", "base": "moquer", "kind": "reflexive_en", "gloss": "not to care about it; mock it", "usage": "Elle s'en moque gentiment.", "usage_en": "She jokes about it lightly."},
    {"expression": "s'en plaindre", "base": "plaindre", "kind": "reflexive_en", "gloss": "to complain about it", "usage": "Il s'en plaint à chaque réunion.", "usage_en": "He complains about it at every meeting."},
    {"expression": "s'en réjouir", "base": "réjouir", "kind": "reflexive_en", "gloss": "to be delighted about it", "usage": "Nous nous en réjouissons sincèrement.", "usage_en": "We're sincerely delighted about it."},
    {"expression": "s'en étonner", "base": "étonner", "kind": "reflexive_en", "gloss": "to be surprised by it", "usage": "Personne ne s'en étonne vraiment.", "usage_en": "No one is really surprised by it."},
    {"expression": "s'en inquiéter", "base": "inquiéter", "kind": "reflexive_en", "gloss": "to worry about it", "usage": "Je m'en inquiète un peu.", "usage_en": "I'm a little worried about it."},
    {"expression": "s'en lasser", "base": "lasser", "kind": "reflexive_en", "gloss": "to get tired of it", "usage": "Tu t'en lasses vite.", "usage_en": "You get tired of it quickly."},
    {"expression": "s'en remettre", "base": "remettre", "kind": "reflexive_en", "gloss": "to recover from it", "usage": "Elle s'en remet lentement.", "usage_en": "She's slowly recovering from it."},
    {"expression": "s'en remettre à quelqu'un", "base": "remettre", "kind": "reflexive_en", "tail": "à lui", "gloss": "to rely on someone", "usage": "Je m'en remets à toi.", "usage_en": "I'm relying on you."},
    {"expression": "s'en tenir à", "base": "tenir", "kind": "reflexive_en", "tail": "à ça", "gloss": "to stick to it", "usage": "Nous nous en tenons au plan.", "usage_en": "We're sticking to the plan."},
    {"expression": "s'en prendre à quelqu'un", "base": "prendre", "kind": "reflexive_en", "tail": "à lui", "gloss": "to take it out on someone", "usage": "Il s'en prend toujours au stagiaire.", "usage_en": "He always takes it out on the intern."},
    {"expression": "en vouloir à quelqu'un", "base": "vouloir", "kind": "en", "tail": "à lui", "gloss": "to be mad at someone", "usage": "Je t'en veux encore un peu.", "usage_en": "I'm still a little mad at you."},
    {"expression": "s'en vouloir", "base": "vouloir", "kind": "reflexive_en", "gloss": "to blame oneself", "usage": "Elle s'en veut beaucoup.", "usage_en": "She blames herself a lot."},
    {"expression": "en avoir assez", "base": "avoir", "kind": "en", "tail": "assez", "gloss": "to have had enough", "usage": "J'en ai assez de ces excuses.", "usage_en": "I've had enough of these excuses."},
    {"expression": "en avoir marre", "base": "avoir", "kind": "en", "tail": "marre", "gloss": "to be fed up", "usage": "On en a marre du bruit.", "usage_en": "We're fed up with the noise.", "hint": "informal"},
    {"expression": "en avoir ras-le-bol", "base": "avoir", "kind": "en", "tail": "ras-le-bol", "gloss": "to be totally fed up", "usage": "Ils en ont ras-le-bol des retards.", "usage_en": "They're completely fed up with the delays.", "hint": "informal"},
    {"expression": "en avoir besoin", "base": "avoir", "kind": "en", "tail": "besoin", "gloss": "to need it", "usage": "J'en ai besoin pour travailler.", "usage_en": "I need it for work."},
    {"expression": "en avoir envie", "base": "avoir", "kind": "en", "tail": "envie", "gloss": "to feel like it; want some", "usage": "Tu en as vraiment envie ?", "usage_en": "Do you really feel like it?"},
    {"expression": "en avoir peur", "base": "avoir", "kind": "en", "tail": "peur", "gloss": "to be afraid of it", "usage": "Elle en a peur depuis l'accident.", "usage_en": "She's been afraid of it since the accident."},
    {"expression": "en avoir honte", "base": "avoir", "kind": "en", "tail": "honte", "gloss": "to be ashamed of it", "usage": "Il en a honte aujourd'hui.", "usage_en": "He's ashamed of it today."},
    {"expression": "en être sûr", "base": "être", "kind": "en", "tail": "sûr", "gloss": "to be sure of it", "usage": "J'en suis sûr à cent pour cent.", "usage_en": "I'm one hundred percent sure of it."},
    {"expression": "en être capable", "base": "être", "kind": "en", "tail": "capable", "gloss": "to be capable of it", "usage": "Tu en es capable.", "usage_en": "You're capable of it."},
    {"expression": "en parler", "base": "parler", "kind": "en", "gloss": "to talk about it", "usage": "On en parle ce soir.", "usage_en": "We'll talk about it tonight."},
    {"expression": "en discuter", "base": "discuter", "kind": "en", "gloss": "to discuss it", "usage": "Nous en discutons après le cours.", "usage_en": "We'll discuss it after class."},
    {"expression": "en revenir", "base": "revenir", "kind": "en", "gloss": "to get over it; come back from it", "usage": "Je n'en reviens pas.", "usage_en": "I can't get over it."},
    {"expression": "en finir avec", "base": "finir", "kind": "en", "tail": "avec ça", "gloss": "to be done with it", "usage": "Je veux en finir avec ce dossier.", "usage_en": "I want to be done with this file."},
    {"expression": "en profiter", "base": "profiter", "kind": "en", "gloss": "to take advantage of it; enjoy it", "usage": "Profitez-en pendant les soldes.", "usage_en": "Take advantage of it during the sales."},
    {"expression": "en dépendre", "base": "dépendre", "kind": "en", "gloss": "to depend on it", "usage": "Le résultat en dépend.", "usage_en": "The result depends on it."},
    {"expression": "en rire", "base": "rire", "kind": "en", "gloss": "to laugh about it", "usage": "Un jour, on en rira.", "usage_en": "One day we'll laugh about it."},
    {"expression": "en pleurer", "base": "pleurer", "kind": "en", "gloss": "to cry about it", "usage": "Elle en pleure encore.", "usage_en": "She's still crying about it."},
    {"expression": "en mourir", "base": "mourir", "kind": "en", "gloss": "to die from it; be dying for it", "usage": "Il en meurt d'envie.", "usage_en": "He's dying for it."},
    {"expression": "s'en approcher", "base": "approcher", "kind": "reflexive_en", "gloss": "to approach it", "usage": "Ne t'en approche pas trop.", "usage_en": "Don't get too close to it."},
    {"expression": "s'en éloigner", "base": "éloigner", "kind": "reflexive_en", "gloss": "to move away from it", "usage": "Nous nous en éloignons doucement.", "usage_en": "We're slowly moving away from it."},
    {"expression": "s'en échapper", "base": "échapper", "kind": "reflexive_en", "gloss": "to escape from it", "usage": "Le prisonnier s'en échappe la nuit.", "usage_en": "The prisoner escapes from it at night."},
    {"expression": "s'en débarrasser", "base": "débarrasser", "kind": "reflexive_en", "gloss": "to get rid of it", "usage": "Je m'en débarrasse ce week-end.", "usage_en": "I'm getting rid of it this weekend."},
    # More colorful idioms.
    {"expression": "s'en mordre les doigts", "base": "mordre", "kind": "reflexive_en", "tail": "les doigts", "gloss": "to kick oneself; regret it", "usage": "Il s'en mord les doigts maintenant.", "usage_en": "He's kicking himself for it now.", "level": "idiom"},
    {"expression": "s'en mettre plein les poches", "base": "mettre", "kind": "reflexive_en", "tail": "plein les poches", "gloss": "to make a lot of money dishonestly", "usage": "Ils s'en mettent plein les poches.", "usage_en": "They're lining their pockets.", "level": "idiom"},
    {"expression": "s'en laver les mains", "base": "laver", "kind": "reflexive_en", "tail": "les mains", "gloss": "to wash one's hands of it", "usage": "La direction s'en lave les mains.", "usage_en": "Management washes its hands of it.", "level": "idiom"},
    {"expression": "s'en donner à cœur joie", "base": "donner", "kind": "reflexive_en", "tail": "à cœur joie", "gloss": "to have a field day", "usage": "Les enfants s'en donnent à cœur joie.", "usage_en": "The kids are having a field day.", "level": "idiom"},
    {"expression": "s'en donner les moyens", "base": "donner", "kind": "reflexive_en", "tail": "les moyens", "gloss": "to give oneself the means", "usage": "Si tu veux réussir, tu t'en donnes les moyens.", "usage_en": "If you want to succeed, you give yourself the means.", "level": "idiom"},
    {"expression": "s'en sortir haut la main", "base": "sortir", "kind": "reflexive_en", "tail": "haut la main", "gloss": "to come through with flying colors", "usage": "Elle s'en sort haut la main.", "usage_en": "She comes through with flying colors.", "level": "idiom"},
    {"expression": "s'en tirer à bon compte", "base": "tirer", "kind": "reflexive_en", "tail": "à bon compte", "gloss": "to get off lightly", "usage": "Tu t'en tires à bon compte.", "usage_en": "You get off lightly.", "level": "idiom"},
    {"expression": "s'en prendre plein la figure", "base": "prendre", "kind": "reflexive_en", "tail": "plein la figure", "gloss": "to take a beating; get blasted", "usage": "Il s'en prend plein la figure en ligne.", "usage_en": "He's getting blasted online.", "level": "idiom", "hint": "informal"},
    {"expression": "s'en prendre à plus faible que soi", "base": "prendre", "kind": "reflexive_en", "tail": "à plus faible que soi", "gloss": "to pick on someone weaker", "usage": "Il s'en prend à plus faible que lui.", "usage_en": "He picks on someone weaker than him.", "level": "idiom"},
    {"expression": "s'en remettre au hasard", "base": "remettre", "kind": "reflexive_en", "tail": "au hasard", "gloss": "to leave it to chance", "usage": "On s'en remet au hasard.", "usage_en": "We're leaving it to chance.", "level": "idiom"},
    {"expression": "s'en remettre à Dieu", "base": "remettre", "kind": "reflexive_en", "tail": "à Dieu", "gloss": "to leave it to God", "usage": "Elle s'en remet à Dieu.", "usage_en": "She leaves it to God.", "level": "idiom"},
    {"expression": "s'en tenir là", "base": "tenir", "kind": "reflexive_en", "tail": "là", "gloss": "to leave it at that", "usage": "On s'en tient là pour aujourd'hui.", "usage_en": "We'll leave it at that for today.", "level": "idiom"},
    {"expression": "s'en tenir aux faits", "base": "tenir", "kind": "reflexive_en", "tail": "aux faits", "gloss": "to stick to the facts", "usage": "Le témoin s'en tient aux faits.", "usage_en": "The witness sticks to the facts.", "level": "idiom"},
    {"expression": "s'en tenir à sa version", "base": "tenir", "kind": "reflexive_en", "tail": "à sa version", "gloss": "to stick to one's version", "usage": "Il s'en tient à sa version.", "usage_en": "He sticks to his version.", "level": "idiom"},
    {"expression": "s'en faire pour rien", "base": "faire", "kind": "reflexive_en", "tail": "pour rien", "gloss": "to worry for nothing", "usage": "Tu t'en fais pour rien.", "usage_en": "You're worrying for nothing.", "level": "idiom"},
    {"expression": "ne pas s'en faire", "base": "faire", "kind": "negative_reflexive_en", "gloss": "not to worry", "usage": "Ne t'en fais pas, ça ira.", "usage_en": "Don't worry, it'll be fine.", "level": "idiom"},
    {"expression": "s'en faire tout un monde", "base": "faire", "kind": "reflexive_en", "tail": "tout un monde", "gloss": "to make a huge deal of it", "usage": "Elle s'en fait tout un monde.", "usage_en": "She's making a huge deal of it.", "level": "idiom"},
    {"expression": "s'en faire une montagne", "base": "faire", "kind": "reflexive_en", "tail": "une montagne", "gloss": "to make a mountain out of it", "usage": "Tu t'en fais une montagne.", "usage_en": "You're making a mountain out of it.", "level": "idiom"},
    {"expression": "s'en payer une tranche", "base": "payer", "kind": "reflexive_en", "tail": "une tranche", "gloss": "to have a good laugh", "usage": "Ils s'en paient une tranche.", "usage_en": "They're having a good laugh.", "level": "idiom", "hint": "informal"},
    {"expression": "s'en payer une bonne", "base": "payer", "kind": "reflexive_en", "tail": "une bonne", "gloss": "to have a good laugh", "usage": "On s'en paie une bonne.", "usage_en": "We're having a good laugh.", "level": "idiom", "hint": "informal"},
    {"expression": "s'en jeter un derrière la cravate", "base": "jeter", "kind": "reflexive_en", "tail": "un derrière la cravate", "gloss": "to knock back a drink", "usage": "Il s'en jette un derrière la cravate.", "usage_en": "He knocks back a drink.", "level": "idiom", "hint": "old-fashioned; informal"},
    {"expression": "s'en mettre jusque-là", "base": "mettre", "kind": "reflexive_en", "tail": "jusque-là", "gloss": "to stuff oneself; overdo it", "usage": "Au buffet, ils s'en mettent jusque-là.", "usage_en": "At the buffet, they really stuff themselves.", "level": "idiom", "hint": "informal"},
    {"expression": "s'en mettre plein la vue", "base": "mettre", "kind": "reflexive_en", "tail": "plein la vue", "gloss": "to dazzle oneself; show off", "usage": "Ils s'en mettent plein la vue avec ce décor.", "usage_en": "They dazzle themselves with that decor.", "level": "idiom"},
    {"expression": "en faire trop", "base": "faire", "kind": "en", "tail": "trop", "gloss": "to overdo it", "usage": "Tu en fais trop avec cette histoire.", "usage_en": "You're overdoing it with this story.", "level": "idiom"},
    {"expression": "en faire des tonnes", "base": "faire", "kind": "en", "tail": "des tonnes", "gloss": "to lay it on thick", "usage": "Il en fait des tonnes pour impressionner.", "usage_en": "He lays it on thick to impress people.", "level": "idiom", "hint": "informal"},
    {"expression": "en faire tout un plat", "base": "faire", "kind": "en", "tail": "tout un plat", "gloss": "to make a big fuss about it", "usage": "N'en fais pas tout un plat.", "usage_en": "Don't make a big fuss about it.", "level": "idiom", "hint": "informal"},
    {"expression": "en avoir gros sur le cœur", "base": "avoir", "kind": "en", "tail": "gros sur le cœur", "gloss": "to have a heavy heart about it", "usage": "J'en ai gros sur le cœur.", "usage_en": "I have a heavy heart about it.", "level": "idiom"},
    {"expression": "en avoir par-dessus la tête", "base": "avoir", "kind": "en", "tail": "par-dessus la tête", "gloss": "to be sick of it", "usage": "On en a par-dessus la tête.", "usage_en": "We're sick of it.", "level": "idiom"},
    {"expression": "en avoir jusqu'au cou", "base": "avoir", "kind": "en", "tail": "jusqu'au cou", "gloss": "to be up to one's neck in it", "usage": "Elle en a jusqu'au cou.", "usage_en": "She's up to her neck in it.", "level": "idiom"},
    {"expression": "en avoir jusque-là", "base": "avoir", "kind": "en", "tail": "jusque-là", "gloss": "to have had it up to here", "usage": "J'en ai jusque-là.", "usage_en": "I've had it up to here.", "level": "idiom", "hint": "informal"},
    {"expression": "en avoir pour son argent", "base": "avoir", "kind": "en", "tail": "pour son argent", "gloss": "to get one's money's worth", "usage": "Avec ce concert, tu en as pour ton argent.", "usage_en": "With this concert, you get your money's worth.", "level": "idiom"},
    {"expression": "en voir de toutes les couleurs", "base": "voir", "kind": "en", "tail": "de toutes les couleurs", "gloss": "to go through a lot", "usage": "Ils en voient de toutes les couleurs.", "usage_en": "They go through a lot.", "level": "idiom"},
    {"expression": "en prendre de la graine", "base": "prendre", "kind": "en", "tail": "de la graine", "gloss": "to learn from it; take a lesson", "usage": "Tu devrais en prendre de la graine.", "usage_en": "You should learn from it.", "level": "idiom"},
    {"expression": "en perdre son latin", "base": "perdre", "kind": "en", "tail": "son latin", "gloss": "to be completely baffled", "usage": "J'en perds mon latin.", "usage_en": "I'm completely baffled.", "level": "idiom"},
    {"expression": "en baver", "base": "baver", "kind": "en", "gloss": "to have a hard time", "usage": "Ils en bavent pendant l'entraînement.", "usage_en": "They're having a hard time during training.", "level": "idiom", "hint": "informal"},
    {"expression": "en chier", "base": "chier", "kind": "en", "gloss": "to struggle badly", "usage": "J'en chie avec ce dossier.", "usage_en": "I'm really struggling with this file.", "level": "idiom", "hint": "vulgar"},
    {"expression": "en suer", "base": "suer", "kind": "en", "gloss": "to sweat over it; struggle", "usage": "Tu vas en suer sur cet exercice.", "usage_en": "You're going to sweat over this exercise.", "level": "idiom", "hint": "informal"},
    {"expression": "en découdre", "base": "découdre", "kind": "en", "gloss": "to fight it out", "usage": "Ils veulent en découdre ce soir.", "usage_en": "They want to fight it out tonight.", "level": "idiom"},
    {"expression": "en rester bouche bée", "base": "rester", "kind": "en", "tail": "bouche bée", "gloss": "to be left speechless", "usage": "Elle en reste bouche bée.", "usage_en": "She's left speechless.", "level": "idiom"},
    {"expression": "en rester là", "base": "rester", "kind": "en", "tail": "là", "gloss": "to leave it there", "usage": "On en reste là pour ce soir.", "usage_en": "We'll leave it there for tonight.", "level": "idiom"},
    {"expression": "en venir aux mains", "base": "venir", "kind": "en", "tail": "aux mains", "gloss": "to come to blows", "usage": "Les voisins en viennent aux mains.", "usage_en": "The neighbors come to blows.", "level": "idiom"},
    {"expression": "en venir au fait", "base": "venir", "kind": "en", "tail": "au fait", "gloss": "to get to the point", "usage": "Venons-en au fait.", "usage_en": "Let's get to the point.", "level": "idiom"},
    {"expression": "en revenir à ses moutons", "base": "revenir", "kind": "en", "tail": "à ses moutons", "gloss": "to get back to the subject", "usage": "Revenons-en à nos moutons.", "usage_en": "Let's get back to the subject.", "level": "idiom"},
    {"expression": "en dire long", "base": "dire", "kind": "en", "tail": "long", "gloss": "to say a lot about it", "usage": "Son silence en dit long.", "usage_en": "His silence says a lot.", "level": "idiom"},
    {"expression": "en savoir long", "base": "savoir", "kind": "en", "tail": "long", "gloss": "to know a lot about it", "usage": "Elle en sait long sur l'affaire.", "usage_en": "She knows a lot about the matter.", "level": "idiom"},
    {"expression": "en vouloir toujours plus", "base": "vouloir", "kind": "en", "tail": "toujours plus", "gloss": "to always want more", "usage": "Il en veut toujours plus.", "usage_en": "He always wants more.", "level": "idiom"},
]


def extract_const(script: str, name: str):
    pattern = re.compile(rf"const\s+{re.escape(name)}\s*=\s*(.*?);\s*(?=\nconst\s+|\Z)", re.S)
    match = pattern.search(script)
    if not match:
        raise ValueError(f"Could not find const assignment for {name}")
    return json.loads(match.group(1))


def write_verb_data(verbs, tenses, pronouns):
    body = "\n".join(
        [
            "// AUTO-GENERATED by combine_dataset_enhanced.py",
            "// Augmented by generate_french_verb_expressions.py",
            "// SAFE OUTPUT - does not overwrite existing files",
            "",
            "const verbs = " + json.dumps(verbs, ensure_ascii=False, indent=2) + ";",
            "",
            "const tenses = " + json.dumps(tenses, ensure_ascii=False, indent=2) + ";",
            "",
            "const pronouns = " + json.dumps(pronouns, ensure_ascii=False, indent=2) + ";",
            "",
        ]
    )
    VERB_DATA_PATH.write_text(body, encoding="utf-8")


def strip_subject(form: str, pronoun: str) -> str:
    form = form.strip()
    subject = SUBJECT[pronoun]
    if pronoun == "je" and form.startswith("j'"):
        return form[2:].strip()
    prefix = subject + " "
    if form.startswith(prefix):
        return form[len(prefix):].strip()
    return form


def past_participle(tenses, base: str, pronoun: str = "je") -> str:
    form = tenses["passeCompose"][base][pronoun]
    rest = strip_subject(form, pronoun)
    for aux in ("ai ", "suis "):
        if rest.startswith(aux):
            return rest[len(aux):].strip()
    return rest.split(" ", 1)[-1]


def should_agree_reflexive_participle(spec) -> bool:
    if spec.get("agree") is not None:
        return bool(spec["agree"])
    tail = str(spec.get("tail") or "")
    no_agreement_fragments = [
        "compte",
        "les doigts",
        "plein les poches",
        "les mains",
        "à cœur joie",
        "les moyens",
        "plein la figure",
        "pour rien",
        "tout un monde",
        "une montagne",
        "une tranche",
        "une bonne",
        "un derrière",
        "jusque-là",
        "plein la vue",
    ]
    return not any(fragment in tail for fragment in no_agreement_fragments)


def agree_participle(participle: str, pronoun: str) -> str:
    if pronoun not in {"nous", "vous", "ils/elles"}:
        return participle
    words = participle.split(" ", 1)
    first = words[0]
    rest = f" {words[1]}" if len(words) > 1 else ""
    if first.endswith(("s", "x")):
        return participle
    return f"{first}s{rest}"


def phrase_tail(tail: str | None) -> str:
    return f" {tail.strip()}" if tail else ""


def conjugate_en(base_form: str, pronoun: str, tail: str | None) -> str:
    rest = strip_subject(base_form, pronoun)
    if pronoun == "je":
        return f"j'en {rest}{phrase_tail(tail)}"
    return f"{SUBJECT[pronoun]} en {rest}{phrase_tail(tail)}"


def conjugate_reflexive_en(base_form: str, pronoun: str, tail: str | None) -> str:
    rest = strip_subject(base_form, pronoun)
    return f"{SUBJECT[pronoun]} {REFLEXIVE_EN[pronoun]} {rest}{phrase_tail(tail)}"


def conjugate_reflexive_en_compound(tenses, spec, pronoun: str, tense: str) -> str:
    base = spec["base"]
    tail = spec.get("tail")
    aux = ETRE_PRESENT[pronoun] if tense == "passeCompose" else ETRE_IMPARFAIT[pronoun]
    participle = past_participle(tenses, base, pronoun)
    if should_agree_reflexive_participle(spec):
        participle = agree_participle(participle, pronoun)
    return f"{SUBJECT[pronoun]} {REFLEXIVE_EN[pronoun]} {aux} {participle}{phrase_tail(tail)}"


def conjugate_negative_reflexive_en(base_form: str, pronoun: str, tail: str | None) -> str:
    rest = strip_subject(base_form, pronoun)
    return f"{SUBJECT[pronoun]} ne {REFLEXIVE_EN[pronoun]} {rest} pas{phrase_tail(tail)}"


def conjugate_negative_reflexive_en_compound(tenses, spec, pronoun: str, tense: str) -> str:
    base = spec["base"]
    tail = spec.get("tail")
    aux = ETRE_PRESENT[pronoun] if tense == "passeCompose" else ETRE_IMPARFAIT[pronoun]
    participle = past_participle(tenses, base, pronoun)
    if should_agree_reflexive_participle(spec):
        participle = agree_participle(participle, pronoun)
    return f"{SUBJECT[pronoun]} ne {REFLEXIVE_EN[pronoun]} {aux} pas {participle}{phrase_tail(tail)}"


def build_expression_forms(tenses, spec):
    base = spec["base"]
    kind = spec["kind"]
    tail = spec.get("tail")
    expression_forms = {}
    for tense_name, tense_data in tenses.items():
        if base not in tense_data:
            raise KeyError(f"{base} missing from {tense_name}")
        expression_forms[tense_name] = {}
        for pronoun in PRONOUNS:
            base_form = tense_data[base][pronoun]
            if kind == "en":
                value = conjugate_en(base_form, pronoun, tail)
            elif kind == "reflexive_en":
                if tense_name in {"passeCompose", "plusQueParfait"}:
                    value = conjugate_reflexive_en_compound(tenses, spec, pronoun, tense_name)
                else:
                    value = conjugate_reflexive_en(base_form, pronoun, tail)
            elif kind == "negative_reflexive_en":
                if tense_name in {"passeCompose", "plusQueParfait"}:
                    value = conjugate_negative_reflexive_en_compound(tenses, spec, pronoun, tense_name)
                else:
                    value = conjugate_negative_reflexive_en(base_form, pronoun, tail)
            else:
                raise ValueError(f"Unknown expression kind: {kind}")
            expression_forms[tense_name][pronoun] = value
    return expression_forms


def slug(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "_", canonical(value).lower()).strip("_")


def main() -> None:
    source = VERB_DATA_PATH.read_text(encoding="utf-8")
    verbs = extract_const(source, "verbs")
    tenses = extract_const(source, "tenses")
    pronouns = extract_const(source, "pronouns")
    by_infinitive = {verb["infinitive"]: verb for verb in verbs}

    expression_count = 0
    for raw_spec in EXPRESSIONS:
        spec = {**raw_spec, "expression": canonical(raw_spec["expression"])}
        expression = spec["expression"]
        base = spec["base"]
        if base not in by_infinitive:
            raise KeyError(f"Base verb missing: {base} for {expression}")
        forms_by_tense = build_expression_forms(tenses, spec)
        metadata = {
            "infinitive": expression,
            "translation": spec["gloss"],
            # Expressions should follow their base verb's conjugation, not its
            # core-frequency priority. Keep them discoverable without crowding
            # the Top 20 drills when the base verb is avoir/être/faire/etc.
            "frequency": spec.get("frequency", EXPRESSION_FREQUENCY),
            "usage_count": 1,
            "hint": spec.get("hint", "verb expression with en"),
            "verbExpression": True,
            "expressionOf": base,
            "expressionLevel": spec.get("level", "core"),
            "reflexive": spec["kind"] in {"reflexive_en", "negative_reflexive_en"},
        }
        if expression in by_infinitive:
            by_infinitive[expression].update(metadata)
        else:
            verbs.append(metadata)
            by_infinitive[expression] = metadata
        for tense_name, forms in forms_by_tense.items():
            tenses[tense_name][expression] = forms
        expression_count += 1

    write_verb_data(verbs, tenses, pronouns)

    usages = json.loads(USAGES_JSON_PATH.read_text(encoding="utf-8"))
    usage_by_sense = {entry.get("sense_id"): entry for entry in usages}
    for raw_spec in EXPRESSIONS:
        spec = {**raw_spec, "expression": canonical(raw_spec["expression"])}
        sense_id = f"expr_{slug(spec['expression'])}_01"
        entry = {
            "verb": spec["expression"],
            "sense_id": sense_id,
            "pattern": spec["expression"],
            "meaning_en": spec["gloss"],
            "example_fr": spec["usage"],
            "example_en": spec["usage_en"],
            "source": "curated:french-verb-expressions",
            "family": "verb_expression",
        }
        if sense_id in usage_by_sense:
            usage_by_sense[sense_id].update(entry)
        else:
            usages.append(entry)
            usage_by_sense[sense_id] = entry

    USAGES_JSON_PATH.write_text(json.dumps(usages, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    USAGES_JS_PATH.write_text(
        "window.verbUsages = " + json.dumps(usages, ensure_ascii=False, indent=2) + ";\n",
        encoding="utf-8",
    )
    print(f"Added/updated {expression_count} French verb expressions.")


if __name__ == "__main__":
    main()
