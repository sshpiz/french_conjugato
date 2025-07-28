const practicePhrases = [
  {
    "en": "I just moved here.",
    "fr": "Je viens d’emménager ici.",
    "situation": "administration"
  },
  {
    "en": "Sorry, I don’t speak French very well yet.",
    "fr": "Désolé, je ne parle pas encore très bien français.",
    "situation": "social"
  },
  {
    "en": "Can you repeat that more slowly?",
    "fr": "Pouvez-vous répéter plus lentement ?",
    "situation": "communication"
  },
  {
    "en": "I don’t understand, can you explain another way?",
    "fr": "Je ne comprends pas, pouvez-vous expliquer autrement ?",
    "situation": "communication"
  },
  {
    "en": "Could you write it down for me?",
    "fr": "Pouvez-vous me l’écrire ?",
    "situation": "communication"
  },
  {
    "en": "Thank you for your help.",
    "fr": "Merci pour votre aide.",
    "situation": "politeness"
  },
  {
    "en": "I need help with this form.",
    "fr": "J’ai besoin d’aide pour ce formulaire.",
    "situation": "administration"
  },
  {
    "en": "I’m looking for the nearest pharmacy.",
    "fr": "Je cherche la pharmacie la plus proche.",
    "situation": "emergency"
  },
  {
    "en": "Is this the right bus for Marseille?",
    "fr": "Est-ce que c’est le bon bus pour Marseille ?",
    "situation": "transport"
  },
  {
    "en": "Do I need to buy a ticket in advance?",
    "fr": "Faut‑il acheter un ticket à l’avance ?",
    "situation": "transport"
  },
  {
    "en": "How long will it take to get there?",
    "fr": "Combien de temps cela prendra‑t‑il ?",
    "situation": "transport"
  },
  {
    "en": "I’m calling about a delivery.",
    "fr": "Je téléphone au sujet d’une livraison.",
    "situation": "phone"
  },
  {
    "en": "You can leave it by the door, I’m not home.",
    "fr": "Vous pouvez le laisser devant la porte, je ne suis pas chez moi.",
    "situation": "delivery"
  },
  {
    "en": "Can you call me when you arrive?",
    "fr": "Pouvez-vous m’appeler à votre arrivée ?",
    "situation": "delivery"
  },
  {
    "en": "I think this was delivered to the wrong address.",
    "fr": "Je pense que cela a été livré à la mauvaise adresse.",
    "situation": "delivery"
  },
  {
    "en": "Do you have this in another size?",
    "fr": "Vous avez ceci dans une autre taille ?",
    "situation": "shopping"
  },
  {
    "en": "I’m just looking for now, thank you.",
    "fr": "Je regarde juste pour l’instant, merci.",
    "situation": "shopping"
  },
  {
    "en": "Can I pay by card?",
    "fr": "Je peux payer par carte ?",
    "situation": "shopping"
  },
  {
    "en": "I’d like to order takeaway.",
    "fr": "Je voudrais commander à emporter.",
    "situation": "food"
  },
  {
    "en": "I’m allergic to peanuts.",
    "fr": "Je suis allergique aux cacahuètes.",
    "situation": "food"
  },
  {
    "en": "Can I get the bill, please?",
    "fr": "L’addition, s’il vous plaît.",
    "situation": "food"
  },
  {
    "en": "Where can I find toothpaste?",
    "fr": "Où puis-je trouver du dentifrice ?",
    "situation": "shopping"
  },
  {
    "en": "Can I make an appointment?",
    "fr": "Puis-je prendre rendez-vous ?",
    "situation": "administration"
  },
  {
    "en": "Is it possible to reschedule?",
    "fr": "Est‑il possible de reprogrammer ?",
    "situation": "administration"
  },
  {
    "en": "I’d like to cancel my appointment.",
    "fr": "Je voudrais annuler mon rendez-vous.",
    "situation": "administration"
  },
  {
    "en": "It’s an emergency.",
    "fr": "C’est une urgence.",
    "situation": "medical"
  },
  {
    "en": "I need to see a doctor.",
    "fr": "Je dois voir un médecin.",
    "situation": "medical"
  },
  {
    "en": "Where is the nearest hospital?",
    "fr": "Où se trouve l’hôpital le plus proche ?",
    "situation": "medical"
  },
  {
    "en": "Can I get a receipt?",
    "fr": "Puis-je avoir un reçu ?",
    "situation": "administration"
  },
  {
    "en": "What documents do I need?",
    "fr": "Quels documents dois-je fournir ?",
    "situation": "administration"
  },
  {
    "en": "I have an appointment at 10:00.",
    "fr": "J’ai un rendez-vous à 10 h.",
    "situation": "administration"
  },
  {
    "en": "Do I need to sign anything?",
    "fr": "Dois-je signer quelque chose ?",
    "situation": "administration"
  },
  {
    "en": "I just arrived yesterday.",
    "fr": "Je suis arrivé(e) hier.",
    "situation": "social"
  },
  {
    "en": "How do I get to the train station?",
    "fr": "Comment aller à la gare ?",
    "situation": "transport"
  },
  {
    "en": "Where’s the closest metro station?",
    "fr": "Où est la station de métro la plus proche ?",
    "situation": "transport"
  },
  {
    "en": "Do you know if there’s a bus to Marseille?",
    "fr": "Savez-vous s’il y a un bus pour Marseille ?",
    "situation": "transport"
  },
  {
    "en": "Do you need help with this?",
    "fr": "Vous avez besoin d’aide avec ça ?",
    "situation": "casual_help"
  },
  {
    "en": "Can you show me how this works?",
    "fr": "Pouvez-vous me montrer comment cela fonctionne ?",
    "situation": "casual_help"
  },
  {
    "en": "Can you recommend a good place to eat nearby?",
    "fr": "Pouvez-vous recommander un bon endroit pour manger dans le coin ?",
    "situation": "casual"
  },
  {
    "en": "I’m looking for a place to buy groceries.",
    "fr": "Je cherche un endroit pour acheter des courses.",
    "situation": "shopping"
  },
  {
    "en": "I need to find a SIM card for my phone.",
    "fr": "Je dois trouver une carte SIM pour mon téléphone.",
    "situation": "administration"
  },
  {
    "en": "Can I charge my phone here?",
    "fr": "Puis-je charger mon téléphone ici ?",
    "situation": "casual_help"
  },
  {
    "en": "What’s the word for this in French?",
    "fr": "Comment dit-on cela en français ?",
    "situation": "learning"
  },
  {
    "en": "Is it okay if I speak in English?",
    "fr": "Est‑ce que je peux parler en anglais ?",
    "situation": "communication"
  },
  {
    "en": "Could you speak a bit more slowly?",
    "fr": "Pourriez-vous parler un peu plus lentement ?",
    "situation": "communication"
  },
  {
    "en": "I think I dropped something here earlier.",
    "fr": "Je crois avoir laissé quelque chose ici plus tôt.",
    "situation": "lost_and_found"
  },
  {
    "en": "Is there a lost and found?",
    "fr": "Y a‑t‑il un objet trouvé ?",
    "situation": "lost_and_found"
  },
  {
    "en": "I forgot my ID at home.",
    "fr": "J’ai oublié ma pièce d’identité à la maison.",
    "situation": "administration"
  },
  {
    "en": "I don’t know how this machine works.",
    "fr": "Je ne sais pas comment fonctionne cette machine.",
    "situation": "casual_help"
  },
  {
    "en": "I don’t have cash, is that okay?",
    "fr": "Je n’ai pas de liquide, ça va ?",
    "situation": "shopping"
  },
  {
    "en": "I’m sorry I’m late.",
    "fr": "Désolé(e), je suis en retard.",
    "situation": "politeness"
  },
  {
    "en": "Can I have a few more minutes?",
    "fr": "Puis-je avoir encore quelques minutes ?",
    "situation": "politeness"
  },
  {
    "en": "Is there a restroom nearby?",
    "fr": "Y a‑t‑il des toilettes à proximité ?",
    "situation": "basic"
  },
  {
    "en": "I’m not sure what this means.",
    "fr": "Je ne suis pas sûr(e) de ce que cela signifie.",
    "situation": "understanding"
  },
  {
    "en": "Can I take this to go?",
    "fr": "Puis-je prendre cela à emporter ?",
    "situation": "food"
  },
  {
    "en": "Can I ask a question?",
    "fr": "Puis-je poser une question ?",
    "situation": "basic"
  },
  {
    "en": "I have a question about this product.",
    "fr": "J’ai une question au sujet de ce produit.",
    "situation": "shopping"
  },
  {
    "en": "Do you know where this place is?",
    "fr": "Savez-vous où se trouve cet endroit ?",
    "situation": "direction"
  },
  {
    "en": "I need a doctor who speaks English.",
    "fr": "J’ai besoin d’un médecin qui parle anglais.",
    "situation": "medical"
  },
  {
    "en": "Where is the emergency room?",
    "fr": "Où est la salle d’urgence ?",
    "situation": "medical"
  },
  {
    "en": "I don’t feel well.",
    "fr": "Je ne me sens pas bien.",
    "situation": "medical"
  },
  {
    "en": "I need to get a prescription filled.",
    "fr": "Je dois faire remplir une ordonnance.",
    "situation": "medical"
  },
  {
    "en": "I think I lost my phone.",
    "fr": "Je crois avoir perdu mon téléphone.",
    "situation": "lost_and_found"
  },
  {
    "en": "Can I borrow a charger?",
    "fr": "Puis-je emprunter un chargeur ?",
    "situation": "casual_help"
  },
  {
    "en": "Can you call a taxi for me?",
    "fr": "Pouvez-vous appeler un taxi pour moi ?",
    "situation": "transport"
  },
  {
    "en": "Is there parking nearby?",
    "fr": "Y a‑t‑il un parking à proximité ?",
    "situation": "transport"
  },
  {
    "en": "I don’t understand this bill.",
    "fr": "Je ne comprends pas cette facture.",
    "situation": "administration"
  },
  {
    "en": "Can I return this item?",
    "fr": "Puis-je retourner cet article ?",
    "situation": "shopping"
  },
  {
    "en": "Do you have this in stock?",
    "fr": "Avez-vous ceci en stock ?",
    "situation": "shopping"
  },
  {
    "en": "Can I get a discount on this?",
    "fr": "Puis-je avoir une réduction ?",
    "situation": "shopping"
  },
  {
    "en": "When does the kitchen close?",
    "fr": "À quelle heure ferme la cuisine ?",
    "situation": "food"
  },
  {
    "en": "What are your opening hours?",
    "fr": "Quelles sont vos heures d’ouverture ?",
    "situation": "administration"
  },
  {
    "en": "Do I need to make a reservation?",
    "fr": "Faut-il faire une réservation ?",
    "situation": "food"
  },
  {
    "en": "I need help with my account.",
    "fr": "J’ai besoin d’aide avec mon compte.",
    "situation": "administration"
  },
  {
    "en": "Can you send that to my email?",
    "fr": "Pouvez-vous l’envoyer à mon e-mail ?",
    "situation": "administration"
  },
  {
    "en": "Can I change the delivery address?",
    "fr": "Puis-je changer l’adresse de livraison ?",
    "situation": "delivery"
  },
  {
    "en": "Where can I recycle this?",
    "fr": "Où puis-je recycler ça ?",
    "situation": "environment"
  },
  {
    "en": "Do I need to register this somewhere?",
    "fr": "Dois-je l’enregistrer quelque part ?",
    "situation": "administration"
  },
  {
    "en": "Where can I pay this fine?",
    "fr": "Où puis-je payer cette amende ?",
    "situation": "administration"
  },
  {
    "en": "I just received this letter but I don’t understand it.",
    "fr": "Je viens de recevoir cette lettre mais je ne la comprends pas.",
    "situation": "administration"
  },
  {
    "en": "Can I sign up online?",
    "fr": "Puis-je m’inscrire en ligne ?",
    "situation": "administration"
  },
  {
    "en": "Do you want to grab a coffee sometime?",
    "fr": "Tu veux prendre un café un de ces jours ?",
    "situation": "casual"
  },
  {
    "en": "Is this seat taken?",
    "fr": "Cette place est-elle prise ?",
    "situation": "casual"
  },
  {
    "en": "Can I sit here?",
    "fr": "Puis-je m’asseoir ici ?",
    "situation": "casual"
  },
  {
    "en": "Do you know a good bar or pub around here?",
    "fr": "Connais-tu un bon bar ou pub dans le coin ?",
    "situation": "casual"
  },
  {
    "en": "I’m meeting someone here.",
    "fr": "Je rencontre quelqu’un ici.",
    "situation": "casual"
  },
  {
    "en": "I’ll have the same as them, please.",
    "fr": "Je prendrai la même chose qu’eux, s’il vous plaît.",
    "situation": "casual"
  },
  {
    "en": "This place looks really nice.",
    "fr": "Cet endroit a l’air vraiment sympa.",
    "situation": "opinion"
  },
  {
    "en": "What do you recommend from the menu?",
    "fr": "Que recommandez-vous sur le menu ?",
    "situation": "food"
  },
  {
    "en": "I’ve heard good things about this place.",
    "fr": "J’ai entendu du bien de cet endroit.",
    "situation": "opinion"
  },
  {
    "en": "Is there a cover charge to get in?",
    "fr": "Y a-t-il un droit d’entrée ?",
    "situation": "social"
  },
  {
    "en": "Do I need to show ID?",
    "fr": "Faut-il montrer une carte d’identité ?",
    "situation": "social"
  },
  {
    "en": "Do you accept tips here?",
    "fr": "Acceptez-vous les pourboires ici ?",
    "situation": "social"
  },
  {
    "en": "Is there table service or do I order at the bar?",
    "fr": "Y a-t-il un service à table ou je commande au bar ?",
    "situation": "casual"
  },
  {
    "en": "I’m just here for a drink.",
    "fr": "Je suis juste venu pour un verre.",
    "situation": "casual"
  },
  {
    "en": "I’m not from around here.",
    "fr": "Je ne suis pas du coin.",
    "situation": "social"
  },
  {
    "en": "Do you live in this area?",
    "fr": "Tu habites dans le quartier ?",
    "situation": "social"
  },
  {
    "en": "It’s my first time in this city.",
    "fr": "C’est ma première fois dans cette ville.",
    "situation": "social"
  },
  {
    "en": "I really like it here so far.",
    "fr": "J’aime vraiment cet endroit jusqu’à présent.",
    "situation": "opinion"
  },
  {
    "en": "The people here have been very friendly.",
    "fr": "Les gens ici ont été très sympathiques.",
    "situation": "opinion"
  },
  {
    "en": "It’s a bit more expensive than I expected.",
    "fr": "C’est un peu plus cher que je ne pensais.",
    "situation": "opinion"
  },
  {
    "en": "I live in Lille but I’m from Rio.",
    "fr": "J’habite à Lille mais je viens de Rio.",
    "situation": "about_me"
  },
  {
    "en": "I have two dogs and a lazy cat.",
    "fr": "J’ai deux chiens et un chat paresseux.",
    "situation": "about_me"
  },
  {
    "en": "My family is from Argentina originally.",
    "fr": "Ma famille vient à l’origine d’Argentine.",
    "situation": "about_me"
  },
  {
    "en": "I work in tech and love coffee.",
    "fr": "Je travaille dans la tech et j’adore le café.",
    "situation": "about_me"
  },
  {
    "en": "I’m learning French and Spanish.",
    "fr": "J’apprends le français et l’espagnol.",
    "situation": "about_me"
  },
  {
    "en": "I enjoy hiking in the Alps.",
    "fr": "J’aime faire de la randonnée dans les Alpes.",
    "situation": "about_me"
  },
  {
    "en": "I grew up in a small town near Lyon.",
    "fr": "J’ai grandi dans une petite ville près de Lyon.",
    "situation": "about_me"
  },
  {
    "en": "My sister studies art in Paris.",
    "fr": "Ma sœur étudie l’art à Paris.",
    "situation": "about_me"
  },
  {
    "en": "I love cooking Brazilian food.",
    "fr": "J’adore cuisiner de la cuisine brésilienne.",
    "situation": "about_me"
  },
  {
    "en": "I’m interested in history and books.",
    "fr": "Je m’intéresse à l’histoire et aux livres.",
    "situation": "about_me"
  },
  {
    "en": "I have one brother and a younger sister.",
    "fr": "J’ai un frère et une sœur cadette.",
    "situation": "about_me"
  },
  {
    "en": "My favorite color is green.",
    "fr": "Ma couleur préférée est le vert.",
    "situation": "about_me"
  },
  {
    "en": "I’m allergic to cats but still have one.",
    "fr": "Je suis allergique aux chats mais j’en ai un.",
    "situation": "about_me"
  },
  {
    "en": "I often ride a bike in the city.",
    "fr": "Je fais souvent du vélo en ville.",
    "situation": "about_me"
  },
  {
    "en": "I’ve been learning photography recently.",
    "fr": "J’apprends la photographie récemment.",
    "situation": "about_me"
  },
  {
    "en": "I like listening to jazz and funk.",
    "fr": "J’aime écouter du jazz et du funk.",
    "situation": "about_me"
  },
  {
    "en": "I sometimes volunteer at the local shelter.",
    "fr": "Je fais parfois du bénévolat au refuge local.",
    "situation": "about_me"
  }
]
