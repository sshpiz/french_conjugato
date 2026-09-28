# Bureaucracy & Delivery Frame Deck

- Category id: `builtin-bureaucracy-delivery`
- Scope: `forms, signatures, intercoms, drop-offs, pickup windows`
- Verbs planned: `21`
- Accepted cards: `22`
- Rejected rows: `4`

## Family Inventory

- `signer`: direct — Core bureaucracy use is signer un document / un formulaire; the direct object pattern is central and already supported.
- `remplir`: direct — In forms and paperwork, remplir un formulaire / un champ is the basic learner-facing pattern.
- `envoyer`: direct + à, direct — Both are central here: envoyer un colis / un document and envoyer qqch à qqn are standard for delivery and admin contexts.
- `recevoir`: direct — Core usage is recevoir un colis / un document / un SMS; direct object is the main pattern in this category.
- `déposer`: direct — For filing and drop-offs, déposer un dossier / un colis is the safest core pattern.
- `livrer`: direct + à — In delivery contexts, livrer qqch à qqn is the most central useful pattern.
- `laisser`: direct + à, direct — Both fit the category well: laisser un colis / un message and laisser qqch à l'accueil / à quelqu'un.
- `appeler`: direct — For intercoms and contact, appeler quelqu'un is the core modern learner-facing pattern.
- `répondre`: à — In this category, répondre à l'interphone / à un message / à quelqu'un is central; répondre de is a different sense and not suitable here.
- `attendre`: direct — For pickup windows and delivery, attendre quelqu'un / un colis is the most natural core pattern; attendre de is less central here.
- `ouvrir`: direct — Core use is ouvrir la porte / le guichet / le colis; direct object is the standard pattern.
- `fermer`: direct — Core use is fermer la porte / le guichet / l'enveloppe; direct object is the standard pattern.
- `confirmer`: direct + à, direct — Both are natural in admin exchanges: confirmer un rendez-vous / une réception and confirmer qqch à qqn.
- `indiquer`: à, direct — Indiquer à quelqu'un is established, and indicating a code/number/address directly is also central in forms and pickup instructions.
- `joindre`: direct — In bureaucracy, joindre un document / une pièce jointe is a very common direct-object pattern.
- `imprimer`: direct — Core paperwork use is imprimer un formulaire / un reçu / une étiquette.
- `récupérer`: direct — For pickups, récupérer un colis / un document is the central pattern.
- `renvoyer`: direct — In forms and returns, renvoyer un document / un colis is the safest core pattern.
- `sonner`: direct — For intercom and building entry, sonner une adresse / un appartement is a common practical direct-object use.
- `venir`: direct — In this category the useful sense is venir chercher un colis / un document, which behaves as a direct object pattern for learners.
- `passer`: direct + à, direct — Both are useful here: passer un coup de fil / une commande and passer qqch à quelqu'un at a counter or window.

## Accepted Cards

- `signer` `direct_object`: `Je ____ le formulaire au guichet` -> `signe` :: `Je signe le formulaire au guichet`
- `remplir` `direct_object`: `Je ____ le formulaire à l'accueil` -> `remplis` :: `Je remplis le formulaire à l'accueil`
- `envoyer` `combo_a`: `L'employé ____ le formulaire signé ____ l'accueil` -> `envoie à` :: `L'employé envoie le formulaire signé à l'accueil`
- `envoyer` `direct_object`: `Le coursier ____ le dossier` -> `envoie` :: `Le coursier envoie le dossier`
- `recevoir` `direct_object`: `Je ____ le colis au guichet` -> `reçois` :: `Je reçois le colis au guichet`
- `déposer` `direct_object`: `Je ____ le formulaire au guichet` -> `dépose` :: `Je dépose le formulaire au guichet`
- `livrer` `combo_a`: `Le service ____ le dossier signé ____ l'accueil` -> `livre à` :: `Le service livre le dossier signé à l'accueil`
- `laisser` `combo_a`: `L'agent ____ un avis de passage ____ l'accueil` -> `laisse à` :: `L'agent laisse un avis de passage à l'accueil`
- `laisser` `direct_object`: `Le livreur ____ le formulaire signé` -> `laisse` :: `Le livreur laisse le formulaire signé`
- `appeler` `direct_object`: `La secrétaire ____ le livreur` -> `appelle` :: `La secrétaire appelle le livreur`
- `répondre` `a_object`: `Je ____ ____ l'interphone` -> `réponds à` :: `Je réponds à l'interphone`
- `attendre` `direct_object`: `À l'accueil, j'____ une signature` -> `attends` :: `À l'accueil, j'attends une signature`
- `ouvrir` `direct_object`: `L'agent ____ le guichet` -> `ouvre` :: `L'agent ouvre le guichet`
- `fermer` `direct_object`: `L'agent ____ le guichet` -> `ferme` :: `L'agent ferme le guichet`
- `confirmer` `direct_object`: `L'agent ____ la réception du dossier` -> `confirme` :: `L'agent confirme la réception du dossier`
- `indiquer` `direct_object`: `Le formulaire ____ la signature requise` -> `indique` :: `Le formulaire indique la signature requise`
- `joindre` `direct_object`: `Je ____ la copie de ma pièce d'identité` -> `joins` :: `Je joins la copie de ma pièce d'identité`
- `imprimer` `direct_object`: `J'____ le formulaire` -> `imprime` :: `J'imprime le formulaire`
- `récupérer` `direct_object`: `Je ____ le colis au guichet` -> `récupère` :: `Je récupère le colis au guichet`
- `renvoyer` `direct_object`: `Je ____ le formulaire signé` -> `renvoie` :: `Je renvoie le formulaire signé`
- `sonner`: none accepted
- `venir`: none accepted
- `passer` `combo_a`: `L'agent ____ le dossier ____ la collègue au guichet` -> `passe à` :: `L'agent passe le dossier à la collègue au guichet`
- `passer` `direct_object`: `Le livreur ____ le colis à l'accueil` -> `passe` :: `Le livreur passe le colis à l'accueil`

## Rejected Rows

- `confirmer` `combo_a`: Le cadre ne teste pas clairement le verbe: « confirmer le dépôt à l'accueil » est peu naturel dans ce contexte bureaucratique, où l'on dirait plutôt « confirme le dépôt auprès de l'accueil » ou « confirme à l'accueil que le dépôt a été fait ». Le choix de préposition/famille paraît forcé.
- `indiquer` `a_object`: French is ungrammatical: it should be "j'indique" before a vowel, and "indiquer à la livraison" is unnatural/incorrect here. The sentence does not cleanly fit the a_object family or a natural bureaucracy/delivery context.
- `sonner` `direct_object`: "sonner à l'accueil" is not a direct_object use; here "sonner" is intransitive with a prepositional complement. Family mismatch.
- `venir` `direct_object`: verb_form_not_in_present_table
