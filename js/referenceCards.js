/* A small, explicit inventory: never infer object behaviour from a verb ending.
 * Grammar: https://www.laits.utexas.edu/tex/gr/pro5.html (including agreement),
 * https://www.laits.utexas.edu/tex/gr/pro6.html, /pro7.html and /pro8.html.
 * Tonic contrasts: https://www.lawlessfrench.com/grammar/indirect-objects-2/
 */
(() => {
  const things = ['ce truc', 'cette chose', 'ces choses'];
  const people = ['cet homme', 'cette femme', 'ces hommes', 'ces femmes'];
  const specs = {
    chercher: { type: 'direct' }, regarder: { type: 'direct' },
    aimer: { type: 'direct' }, voir: { type: 'direct' },
    prendre: { type: 'direct' }, trouver: { type: 'direct' },
    comprendre: { type: 'direct' }, vouloir: { type: 'direct' },
    penser: { type: 'y', label: 'penser à', people: true, peopleType: 'tonic' },
    songer: { type: 'y', label: 'songer à', people: true, peopleType: 'tonic' },
    tenir: { type: 'y', label: 'tenir à', people: true, peopleType: 'tonic' },
    renoncer: { type: 'y', label: 'renoncer à', people: true, peopleType: 'tonic' },
    recourir: { type: 'y', label: 'recourir à', people: true, peopleType: 'tonic' },
    parler: { type: 'en', label: 'parler de', people: true, peopleLabel: 'parler à' },
    répondre: { type: 'y', label: 'répondre à', people: true },
    écrire: { type: 'indirect', label: 'écrire à' },
    téléphoner: { type: 'indirect', label: 'téléphoner à' },
    sourire: { type: 'indirect', label: 'sourire à' },
    aller: { type: 'y', label: 'aller à', place: true },
    'avoir besoin': { type: 'en', label: 'avoir besoin de', strip: ' de quelque chose' },
    'avoir envie': { type: 'en', label: 'avoir envie de', strip: ' de quelque chose' },
    'faire attention': { type: 'y', label: 'faire attention à', people: true, peopleType: 'tonic', strip: ' à quelque chose' },
  };
  // Explicit transitive thing-object constructions, using existing paradigms.
  for (const verb of ["acheter", "apporter", "apprendre", "attendre", "boire", "changer", "choisir", "commencer", "connaître", "construire", "continuer", "couper", "croire", "décider", "demander", "décrire", "découvrir", "défendre", "dépenser", "détruire", "développer", "dire", "donner", "écouter", "écrire", "expliquer", "faire", "fermer", "finir", "garder", "imaginer", "laisser", "lire", "manger", "mettre", "montrer", "nettoyer", "obtenir", "oublier", "ouvrir", "payer", "perdre", "porter", "poser", "préparer", "présenter", "produire", "proposer", "raconter", "recevoir", "reconnaître", "refuser", "rendre", "réparer", "répéter", "reprendre", "réserver", "résoudre", "retrouver", "savoir", "sentir", "suivre", "supprimer", "tenir", "terminer", "toucher", "transformer", "transmettre", "utiliser", "vendre", "vérifier", "visiter", "accepter", "ajouter", "améliorer", "annoncer", "arrêter", "atteindre", "comprendre", "conserver", "considérer", "consulter", "corriger", "créer", "dessiner", "éviter", "examiner", "essayer", "fabriquer", "gagner", "installer", "jeter", "laver", "livrer", "organiser", "partager", "protéger", "remplacer", "remplir", "retirer", "sauver", "soutenir", "traduire", "transporter"]) {
    if (!specs[verb]) specs[verb] = { type: 'direct' };
  }
  for (const verb of ['dépendre', 'profiter', 'rêver', 'douter', 'manquer', 'bénéficier', 'disposer', 'souffrir']) {
    if (!specs[verb]) specs[verb] = { type: 'en', label: verb + ' de' };
  }
  for (const verb of ['participer', 'contribuer', 'réfléchir', 'assister']) {
    if (!specs[verb]) specs[verb] = { type: 'y', label: verb + ' à' };
  }
  // https://www.laits.utexas.edu/tex/gr/pro9.html
  const doubleExamples = [
  [
    "donner",
    "to give something to someone",
    "Je donne le livre à Marie.",
    "Je le lui donne.",
    "I give the book to Marie.",
    "I give it to her."
  ],
  [
    "offrir",
    "to offer something to someone",
    "Nous offrons ces fleurs à nos voisins.",
    "Nous les leur offrons.",
    "We offer these flowers to our neighbors.",
    "We offer them to them."
  ],
  [
    "envoyer",
    "to send something to someone",
    "Elle envoie la photo à Paul.",
    "Elle la lui envoie.",
    "She sends the photo to Paul.",
    "She sends it to him."
  ],
  [
    "apporter",
    "to bring something to someone",
    "J'apporte les clés à mes parents.",
    "Je les leur apporte.",
    "I bring the keys to my parents.",
    "I bring them to them."
  ],
  [
    "prêter",
    "to lend something to someone",
    "Tu prêtes ton vélo à Luc.",
    "Tu le lui prêtes.",
    "You lend your bicycle to Luc.",
    "You lend it to him."
  ],
  [
    "rendre",
    "to return something to someone",
    "Nous rendons la voiture à Léa.",
    "Nous la lui rendons.",
    "We return the car to Léa.",
    "We return it to her."
  ],
  [
    "vendre",
    "to sell something to someone",
    "Il vend sa maison à ces acheteurs.",
    "Il la leur vend.",
    "He sells his house to these buyers.",
    "He sells it to them."
  ],
  [
    "acheter",
    "to buy something for someone",
    "J'achète cette veste à ma fille.",
    "Je la lui achète.",
    "I buy this jacket for my daughter.",
    "I buy it for her."
  ],
  [
    "montrer",
    "to show something to someone",
    "Tu montres le chemin aux touristes.",
    "Tu le leur montres.",
    "You show the way to the tourists.",
    "You show it to them."
  ],
  [
    "présenter",
    "to present something to someone",
    "Elle présente le projet au directeur.",
    "Elle le lui présente.",
    "She presents the project to the director.",
    "She presents it to him."
  ],
  [
    "expliquer",
    "to explain something to someone",
    "J'explique la règle aux élèves.",
    "Je la leur explique.",
    "I explain the rule to the students.",
    "I explain it to them."
  ],
  [
    "raconter",
    "to tell someone a story or account",
    "Nous racontons cette histoire à Emma.",
    "Nous la lui racontons.",
    "We tell this story to Emma.",
    "We tell it to her."
  ],
  [
    "dire",
    "to tell something to someone",
    "Tu dis la vérité à tes amis.",
    "Tu la leur dis.",
    "You tell the truth to your friends.",
    "You tell it to them."
  ],
  [
    "écrire",
    "to write something to someone",
    "J'écris cette lettre à ma sœur.",
    "Je la lui écris.",
    "I write this letter to my sister.",
    "I write it to her."
  ],
  [
    "lire",
    "to read something to someone",
    "Elle lit le conte aux enfants.",
    "Elle le leur lit.",
    "She reads the story to the children.",
    "She reads it to them."
  ],
  [
    "apprendre",
    "to teach something to someone",
    "Il apprend cette chanson à sa fille.",
    "Il la lui apprend.",
    "He teaches this song to his daughter.",
    "He teaches it to her."
  ],
  [
    "enseigner",
    "to teach something to someone",
    "Nous enseignons cette méthode aux débutants.",
    "Nous la leur enseignons.",
    "We teach this method to the beginners.",
    "We teach it to them."
  ],
  [
    "annoncer",
    "to announce something to someone",
    "J'annonce la nouvelle à mes parents.",
    "Je la leur annonce.",
    "I announce the news to my parents.",
    "I announce it to them."
  ],
  [
    "proposer",
    "to propose something to someone",
    "Tu proposes cette solution à Julie.",
    "Tu la lui proposes.",
    "You propose this solution to Julie.",
    "You propose it to her."
  ],
  [
    "promettre",
    "to promise something to someone",
    "Il promet cette récompense aux enfants.",
    "Il la leur promet.",
    "He promises this reward to the children.",
    "He promises it to them."
  ],
  [
    "demander",
    "to ask someone for something",
    "Je demande les documents à la secrétaire.",
    "Je les lui demande.",
    "I ask the secretary for the documents.",
    "I ask her for them."
  ],
  [
    "répondre",
    "to give someone an answer",
    "Elle répond la même chose aux journalistes.",
    "Elle la leur répond.",
    "She gives the journalists the same answer.",
    "She gives it to them."
  ],
  [
    "rappeler",
    "to remind someone of something",
    "Je rappelle la date à mon frère.",
    "Je la lui rappelle.",
    "I remind my brother of the date.",
    "I remind him of it."
  ],
  [
    "recommander",
    "to recommend something to someone",
    "Nous recommandons ce restaurant à nos amis.",
    "Nous le leur recommandons.",
    "We recommend this restaurant to our friends.",
    "We recommend it to them."
  ],
  [
    "conseiller",
    "to recommend something to someone",
    "Tu conseilles ce livre à Anne.",
    "Tu le lui conseilles.",
    "You recommend this book to Anne.",
    "You recommend it to her."
  ],
  [
    "interdire",
    "to forbid something to someone",
    "Le médecin interdit le café à Paul.",
    "Le médecin le lui interdit.",
    "The doctor forbids Paul to drink coffee.",
    "The doctor forbids it to him."
  ],
  [
    "permettre",
    "to allow something to someone",
    "Nous permettons cette sortie aux enfants.",
    "Nous la leur permettons.",
    "We allow the children this outing.",
    "We allow it to them."
  ],
  [
    "refuser",
    "to refuse someone something",
    "Elle refuse cette faveur à son voisin.",
    "Elle la lui refuse.",
    "She refuses her neighbor this favor.",
    "She refuses it to him."
  ],
  [
    "accorder",
    "to grant something to someone",
    "Le jury accorde le prix à cette artiste.",
    "Le jury le lui accorde.",
    "The jury grants the prize to this artist.",
    "The jury grants it to her."
  ],
  [
    "confier",
    "to entrust something to someone",
    "Je confie les clés à mes voisins.",
    "Je les leur confie.",
    "I entrust the keys to my neighbors.",
    "I entrust them to them."
  ],
  [
    "transmettre",
    "to pass something on to someone",
    "Tu transmets le message à Luc.",
    "Tu le lui transmets.",
    "You pass the message on to Luc.",
    "You pass it on to him."
  ],
  [
    "communiquer",
    "to communicate something to someone",
    "Nous communiquons les résultats aux candidats.",
    "Nous les leur communiquons.",
    "We communicate the results to the candidates.",
    "We communicate them to them."
  ],
  [
    "remettre",
    "to hand something to someone",
    "Elle remet le dossier à sa collègue.",
    "Elle le lui remet.",
    "She hands the file to her colleague.",
    "She hands it to her."
  ],
  [
    "distribuer",
    "to distribute something to people",
    "Je distribue les feuilles aux élèves.",
    "Je les leur distribue.",
    "I distribute the sheets to the students.",
    "I distribute them to them."
  ],
  [
    "fournir",
    "to supply something to someone",
    "Il fournit le matériel aux ouvriers.",
    "Il le leur fournit.",
    "He supplies the equipment to the workers.",
    "He supplies it to them."
  ],
  [
    "livrer",
    "to deliver something to someone",
    "Nous livrons les meubles à cette cliente.",
    "Nous les lui livrons.",
    "We deliver the furniture to this customer.",
    "We deliver it to her."
  ],
  [
    "servir",
    "to serve something to someone",
    "Tu sers la soupe aux invités.",
    "Tu la leur sers.",
    "You serve the soup to the guests.",
    "You serve it to them."
  ],
  [
    "payer",
    "to pay someone something",
    "Je paie le loyer au propriétaire.",
    "Je le lui paie.",
    "I pay the rent to the landlord.",
    "I pay it to him."
  ],
  [
    "voler",
    "to steal something from someone",
    "Il vole le portefeuille à ce voyageur.",
    "Il le lui vole.",
    "He steals the wallet from this traveler.",
    "He steals it from him."
  ],
  [
    "enlever",
    "to take something off someone",
    "Elle enlève les chaussures à son fils.",
    "Elle les lui enlève.",
    "She takes her son's shoes off.",
    "She takes them off him."
  ],
  [
    "retirer",
    "to take something away from someone",
    "La police retire le permis à ce conducteur.",
    "La police le lui retire.",
    "The police take this driver's license away.",
    "The police take it away from him."
  ],
  [
    "emprunter",
    "to borrow something from someone",
    "J'emprunte la valise à ma sœur.",
    "Je la lui emprunte.",
    "I borrow the suitcase from my sister.",
    "I borrow it from her."
  ],
  [
    "réserver",
    "to reserve something for someone",
    "Nous réservons cette chambre à nos amis.",
    "Nous la leur réservons.",
    "We reserve this room for our friends.",
    "We reserve it for them."
  ],
  [
    "préparer",
    "to prepare something for someone",
    "Je prépare le repas aux enfants.",
    "Je le leur prépare.",
    "I prepare the meal for the children.",
    "I prepare it for them."
  ]
];

 // Explicit person-object constructions; see data/expressions/personal-pronoun-review.json.
 const personalConfig = {
  "lang": "fr",
  "direct": {
    "voir": "see",
    "regarder": "watch",
    "aimer": "love",
    "chercher": "look for",
    "trouver": "find",
    "comprendre": "understand",
    "attendre": "wait for",
    "connaître": "know",
    "écouter": "listen to",
    "reconnaître": "recognize",
    "suivre": "follow",
    "protéger": "protect",
    "soutenir": "support",
    "retrouver": "find again",
    "sauver": "save",
    "remplacer": "replace",
    "consulter": "consult",
    "examiner": "examine",
    "accepter": "accept",
    "défendre": "defend",
    "éviter": "avoid",
    "considérer": "consider",
    "recevoir": "receive",
    "arrêter": "stop",
    "aider": "help",
    "appeler": "call",
    "inviter": "invite",
    "remercier": "thank",
    "rencontrer": "meet",
    "rejoindre": "join",
    "saluer": "greet",
    "embrasser": "kiss",
    "prévenir": "warn",
    "accompagner": "accompany",
    "accueillir": "welcome",
    "conduire": "drive",
    "emmener": "take along",
    "ramener": "bring back",
    "rassurer": "reassure",
    "convaincre": "convince",
    "persuader": "persuade",
    "surprendre": "surprise",
    "impressionner": "impress",
    "respecter": "respect",
    "admirer": "admire",
    "détester": "hate",
    "blesser": "hurt",
    "soigner": "care for",
    "interroger": "question",
    "informer": "inform",
    "déranger": "disturb",
    "réveiller": "wake up",
    "entendre": "hear",
    "recruter": "recruit",
    "féliciter": "congratulate",
    "critiquer": "criticize",
    "punir": "punish",
    "observer": "observe",
    "libérer": "free",
    "abandonner": "abandon"
  },
  "indirect": {
    "parler": "speak to",
    "répondre": "reply to",
    "écrire": "write to",
    "téléphoner": "phone",
    "sourire": "smile at"
  },
  "cues": [
    "moi",
    "toi",
    "nous",
    "vous (pl.)"
  ],
  "clitics": [
    "me",
    "te",
    "nous",
    "vous"
  ]
};
 function personalAllowed(card, index) {
  const subject=card.pronoun.split('/')[0];
  const first=['je','nous','yo','nosotros','nosotras','jo','nosaltres'];
  const second=['tu','vous','tú','vosotros','vosotras','vosaltres'];
  return !((index%2===0 && first.includes(subject)) || (index%2===1 && second.includes(subject)));
 }
 function personalIndices(card, double=false) {
  if(card.tense==='imperative')return [];
  const v=card.verb.infinitive;
  if(!double&&!personalConfig.direct[v]&&!personalConfig.indirect[v])return [];
  const count=!double&&personalConfig.lang==='fr'&&personalConfig.direct[v]?8:4;
  return Array.from({length:count},(_,i)=>i).filter(i=>personalAllowed(card,i%4));
 }
 const personalExamples = [
  {"verb":"voir","pattern_id":"personal:voir","pattern":"voir → me / te / nous / vous","meaning_en":"to see someone","example_fr":"Ils me voient.","example_en":"They see me."},
  {"verb":"voir","pattern_id":"personal:voir","pattern":"voir → me / te / nous / vous","meaning_en":"to see someone","example_fr":"Ils te voient.","example_en":"They see you."},
  {"verb":"voir","pattern_id":"personal:voir","pattern":"voir → me / te / nous / vous","meaning_en":"to see someone","example_fr":"Ils nous voient.","example_en":"They see us."},
  {"verb":"voir","pattern_id":"personal:voir","pattern":"voir → me / te / nous / vous","meaning_en":"to see someone","example_fr":"Ils vous voient.","example_en":"They see you all."},
  {"verb":"regarder","pattern_id":"personal:regarder","pattern":"regarder → me / te / nous / vous","meaning_en":"to watch someone","example_fr":"Ils me regardent.","example_en":"They watch me."},
  {"verb":"regarder","pattern_id":"personal:regarder","pattern":"regarder → me / te / nous / vous","meaning_en":"to watch someone","example_fr":"Ils te regardent.","example_en":"They watch you."},
  {"verb":"regarder","pattern_id":"personal:regarder","pattern":"regarder → me / te / nous / vous","meaning_en":"to watch someone","example_fr":"Ils nous regardent.","example_en":"They watch us."},
  {"verb":"regarder","pattern_id":"personal:regarder","pattern":"regarder → me / te / nous / vous","meaning_en":"to watch someone","example_fr":"Ils vous regardent.","example_en":"They watch you all."},
  {"verb":"aimer","pattern_id":"personal:aimer","pattern":"aimer → me / te / nous / vous","meaning_en":"to love someone","example_fr":"Ils m'aiment.","example_en":"They love me."},
  {"verb":"aimer","pattern_id":"personal:aimer","pattern":"aimer → me / te / nous / vous","meaning_en":"to love someone","example_fr":"Ils t'aiment.","example_en":"They love you."},
  {"verb":"aimer","pattern_id":"personal:aimer","pattern":"aimer → me / te / nous / vous","meaning_en":"to love someone","example_fr":"Ils nous aiment.","example_en":"They love us."},
  {"verb":"aimer","pattern_id":"personal:aimer","pattern":"aimer → me / te / nous / vous","meaning_en":"to love someone","example_fr":"Ils vous aiment.","example_en":"They love you all."},
  {"verb":"chercher","pattern_id":"personal:chercher","pattern":"chercher → me / te / nous / vous","meaning_en":"to look for someone","example_fr":"Ils me cherchent.","example_en":"They look for me."},
  {"verb":"chercher","pattern_id":"personal:chercher","pattern":"chercher → me / te / nous / vous","meaning_en":"to look for someone","example_fr":"Ils te cherchent.","example_en":"They look for you."},
  {"verb":"chercher","pattern_id":"personal:chercher","pattern":"chercher → me / te / nous / vous","meaning_en":"to look for someone","example_fr":"Ils nous cherchent.","example_en":"They look for us."},
  {"verb":"chercher","pattern_id":"personal:chercher","pattern":"chercher → me / te / nous / vous","meaning_en":"to look for someone","example_fr":"Ils vous cherchent.","example_en":"They look for you all."},
  {"verb":"trouver","pattern_id":"personal:trouver","pattern":"trouver → me / te / nous / vous","meaning_en":"to find someone","example_fr":"Ils me trouvent.","example_en":"They find me."},
  {"verb":"trouver","pattern_id":"personal:trouver","pattern":"trouver → me / te / nous / vous","meaning_en":"to find someone","example_fr":"Ils te trouvent.","example_en":"They find you."},
  {"verb":"trouver","pattern_id":"personal:trouver","pattern":"trouver → me / te / nous / vous","meaning_en":"to find someone","example_fr":"Ils nous trouvent.","example_en":"They find us."},
  {"verb":"trouver","pattern_id":"personal:trouver","pattern":"trouver → me / te / nous / vous","meaning_en":"to find someone","example_fr":"Ils vous trouvent.","example_en":"They find you all."},
  {"verb":"comprendre","pattern_id":"personal:comprendre","pattern":"comprendre → me / te / nous / vous","meaning_en":"to understand someone","example_fr":"Ils me comprennent.","example_en":"They understand me."},
  {"verb":"comprendre","pattern_id":"personal:comprendre","pattern":"comprendre → me / te / nous / vous","meaning_en":"to understand someone","example_fr":"Ils te comprennent.","example_en":"They understand you."},
  {"verb":"comprendre","pattern_id":"personal:comprendre","pattern":"comprendre → me / te / nous / vous","meaning_en":"to understand someone","example_fr":"Ils nous comprennent.","example_en":"They understand us."},
  {"verb":"comprendre","pattern_id":"personal:comprendre","pattern":"comprendre → me / te / nous / vous","meaning_en":"to understand someone","example_fr":"Ils vous comprennent.","example_en":"They understand you all."},
  {"verb":"attendre","pattern_id":"personal:attendre","pattern":"attendre → me / te / nous / vous","meaning_en":"to wait for someone","example_fr":"Ils m'attendent.","example_en":"They wait for me."},
  {"verb":"attendre","pattern_id":"personal:attendre","pattern":"attendre → me / te / nous / vous","meaning_en":"to wait for someone","example_fr":"Ils t'attendent.","example_en":"They wait for you."},
  {"verb":"attendre","pattern_id":"personal:attendre","pattern":"attendre → me / te / nous / vous","meaning_en":"to wait for someone","example_fr":"Ils nous attendent.","example_en":"They wait for us."},
  {"verb":"attendre","pattern_id":"personal:attendre","pattern":"attendre → me / te / nous / vous","meaning_en":"to wait for someone","example_fr":"Ils vous attendent.","example_en":"They wait for you all."},
  {"verb":"connaître","pattern_id":"personal:connaître","pattern":"connaître → me / te / nous / vous","meaning_en":"to know someone","example_fr":"Ils me connaissent.","example_en":"They know me."},
  {"verb":"connaître","pattern_id":"personal:connaître","pattern":"connaître → me / te / nous / vous","meaning_en":"to know someone","example_fr":"Ils te connaissent.","example_en":"They know you."},
  {"verb":"connaître","pattern_id":"personal:connaître","pattern":"connaître → me / te / nous / vous","meaning_en":"to know someone","example_fr":"Ils nous connaissent.","example_en":"They know us."},
  {"verb":"connaître","pattern_id":"personal:connaître","pattern":"connaître → me / te / nous / vous","meaning_en":"to know someone","example_fr":"Ils vous connaissent.","example_en":"They know you all."},
  {"verb":"écouter","pattern_id":"personal:écouter","pattern":"écouter → me / te / nous / vous","meaning_en":"to listen to someone","example_fr":"Ils m'écoutent.","example_en":"They listen to me."},
  {"verb":"écouter","pattern_id":"personal:écouter","pattern":"écouter → me / te / nous / vous","meaning_en":"to listen to someone","example_fr":"Ils t'écoutent.","example_en":"They listen to you."},
  {"verb":"écouter","pattern_id":"personal:écouter","pattern":"écouter → me / te / nous / vous","meaning_en":"to listen to someone","example_fr":"Ils nous écoutent.","example_en":"They listen to us."},
  {"verb":"écouter","pattern_id":"personal:écouter","pattern":"écouter → me / te / nous / vous","meaning_en":"to listen to someone","example_fr":"Ils vous écoutent.","example_en":"They listen to you all."},
  {"verb":"reconnaître","pattern_id":"personal:reconnaître","pattern":"reconnaître → me / te / nous / vous","meaning_en":"to recognize someone","example_fr":"Ils me reconnaissent.","example_en":"They recognize me."},
  {"verb":"reconnaître","pattern_id":"personal:reconnaître","pattern":"reconnaître → me / te / nous / vous","meaning_en":"to recognize someone","example_fr":"Ils te reconnaissent.","example_en":"They recognize you."},
  {"verb":"reconnaître","pattern_id":"personal:reconnaître","pattern":"reconnaître → me / te / nous / vous","meaning_en":"to recognize someone","example_fr":"Ils nous reconnaissent.","example_en":"They recognize us."},
  {"verb":"reconnaître","pattern_id":"personal:reconnaître","pattern":"reconnaître → me / te / nous / vous","meaning_en":"to recognize someone","example_fr":"Ils vous reconnaissent.","example_en":"They recognize you all."},
  {"verb":"suivre","pattern_id":"personal:suivre","pattern":"suivre → me / te / nous / vous","meaning_en":"to follow someone","example_fr":"Ils me suivent.","example_en":"They follow me."},
  {"verb":"suivre","pattern_id":"personal:suivre","pattern":"suivre → me / te / nous / vous","meaning_en":"to follow someone","example_fr":"Ils te suivent.","example_en":"They follow you."},
  {"verb":"suivre","pattern_id":"personal:suivre","pattern":"suivre → me / te / nous / vous","meaning_en":"to follow someone","example_fr":"Ils nous suivent.","example_en":"They follow us."},
  {"verb":"suivre","pattern_id":"personal:suivre","pattern":"suivre → me / te / nous / vous","meaning_en":"to follow someone","example_fr":"Ils vous suivent.","example_en":"They follow you all."},
  {"verb":"protéger","pattern_id":"personal:protéger","pattern":"protéger → me / te / nous / vous","meaning_en":"to protect someone","example_fr":"Ils me protègent.","example_en":"They protect me."},
  {"verb":"protéger","pattern_id":"personal:protéger","pattern":"protéger → me / te / nous / vous","meaning_en":"to protect someone","example_fr":"Ils te protègent.","example_en":"They protect you."},
  {"verb":"protéger","pattern_id":"personal:protéger","pattern":"protéger → me / te / nous / vous","meaning_en":"to protect someone","example_fr":"Ils nous protègent.","example_en":"They protect us."},
  {"verb":"protéger","pattern_id":"personal:protéger","pattern":"protéger → me / te / nous / vous","meaning_en":"to protect someone","example_fr":"Ils vous protègent.","example_en":"They protect you all."},
  {"verb":"soutenir","pattern_id":"personal:soutenir","pattern":"soutenir → me / te / nous / vous","meaning_en":"to support someone","example_fr":"Ils me soutiennent.","example_en":"They support me."},
  {"verb":"soutenir","pattern_id":"personal:soutenir","pattern":"soutenir → me / te / nous / vous","meaning_en":"to support someone","example_fr":"Ils te soutiennent.","example_en":"They support you."},
  {"verb":"soutenir","pattern_id":"personal:soutenir","pattern":"soutenir → me / te / nous / vous","meaning_en":"to support someone","example_fr":"Ils nous soutiennent.","example_en":"They support us."},
  {"verb":"soutenir","pattern_id":"personal:soutenir","pattern":"soutenir → me / te / nous / vous","meaning_en":"to support someone","example_fr":"Ils vous soutiennent.","example_en":"They support you all."},
  {"verb":"retrouver","pattern_id":"personal:retrouver","pattern":"retrouver → me / te / nous / vous","meaning_en":"to find again someone","example_fr":"Ils me retrouvent.","example_en":"They find me again."},
  {"verb":"retrouver","pattern_id":"personal:retrouver","pattern":"retrouver → me / te / nous / vous","meaning_en":"to find again someone","example_fr":"Ils te retrouvent.","example_en":"They find you again."},
  {"verb":"retrouver","pattern_id":"personal:retrouver","pattern":"retrouver → me / te / nous / vous","meaning_en":"to find again someone","example_fr":"Ils nous retrouvent.","example_en":"They find us again."},
  {"verb":"retrouver","pattern_id":"personal:retrouver","pattern":"retrouver → me / te / nous / vous","meaning_en":"to find again someone","example_fr":"Ils vous retrouvent.","example_en":"They find you all again."},
  {"verb":"sauver","pattern_id":"personal:sauver","pattern":"sauver → me / te / nous / vous","meaning_en":"to save someone","example_fr":"Ils me sauvent.","example_en":"They save me."},
  {"verb":"sauver","pattern_id":"personal:sauver","pattern":"sauver → me / te / nous / vous","meaning_en":"to save someone","example_fr":"Ils te sauvent.","example_en":"They save you."},
  {"verb":"sauver","pattern_id":"personal:sauver","pattern":"sauver → me / te / nous / vous","meaning_en":"to save someone","example_fr":"Ils nous sauvent.","example_en":"They save us."},
  {"verb":"sauver","pattern_id":"personal:sauver","pattern":"sauver → me / te / nous / vous","meaning_en":"to save someone","example_fr":"Ils vous sauvent.","example_en":"They save you all."},
  {"verb":"remplacer","pattern_id":"personal:remplacer","pattern":"remplacer → me / te / nous / vous","meaning_en":"to replace someone","example_fr":"Ils me remplacent.","example_en":"They replace me."},
  {"verb":"remplacer","pattern_id":"personal:remplacer","pattern":"remplacer → me / te / nous / vous","meaning_en":"to replace someone","example_fr":"Ils te remplacent.","example_en":"They replace you."},
  {"verb":"remplacer","pattern_id":"personal:remplacer","pattern":"remplacer → me / te / nous / vous","meaning_en":"to replace someone","example_fr":"Ils nous remplacent.","example_en":"They replace us."},
  {"verb":"remplacer","pattern_id":"personal:remplacer","pattern":"remplacer → me / te / nous / vous","meaning_en":"to replace someone","example_fr":"Ils vous remplacent.","example_en":"They replace you all."},
  {"verb":"consulter","pattern_id":"personal:consulter","pattern":"consulter → me / te / nous / vous","meaning_en":"to consult someone","example_fr":"Ils me consultent.","example_en":"They consult me."},
  {"verb":"consulter","pattern_id":"personal:consulter","pattern":"consulter → me / te / nous / vous","meaning_en":"to consult someone","example_fr":"Ils te consultent.","example_en":"They consult you."},
  {"verb":"consulter","pattern_id":"personal:consulter","pattern":"consulter → me / te / nous / vous","meaning_en":"to consult someone","example_fr":"Ils nous consultent.","example_en":"They consult us."},
  {"verb":"consulter","pattern_id":"personal:consulter","pattern":"consulter → me / te / nous / vous","meaning_en":"to consult someone","example_fr":"Ils vous consultent.","example_en":"They consult you all."},
  {"verb":"examiner","pattern_id":"personal:examiner","pattern":"examiner → me / te / nous / vous","meaning_en":"to examine someone","example_fr":"Ils m'examinent.","example_en":"They examine me."},
  {"verb":"examiner","pattern_id":"personal:examiner","pattern":"examiner → me / te / nous / vous","meaning_en":"to examine someone","example_fr":"Ils t'examinent.","example_en":"They examine you."},
  {"verb":"examiner","pattern_id":"personal:examiner","pattern":"examiner → me / te / nous / vous","meaning_en":"to examine someone","example_fr":"Ils nous examinent.","example_en":"They examine us."},
  {"verb":"examiner","pattern_id":"personal:examiner","pattern":"examiner → me / te / nous / vous","meaning_en":"to examine someone","example_fr":"Ils vous examinent.","example_en":"They examine you all."},
  {"verb":"accepter","pattern_id":"personal:accepter","pattern":"accepter → me / te / nous / vous","meaning_en":"to accept someone","example_fr":"Ils m'acceptent.","example_en":"They accept me."},
  {"verb":"accepter","pattern_id":"personal:accepter","pattern":"accepter → me / te / nous / vous","meaning_en":"to accept someone","example_fr":"Ils t'acceptent.","example_en":"They accept you."},
  {"verb":"accepter","pattern_id":"personal:accepter","pattern":"accepter → me / te / nous / vous","meaning_en":"to accept someone","example_fr":"Ils nous acceptent.","example_en":"They accept us."},
  {"verb":"accepter","pattern_id":"personal:accepter","pattern":"accepter → me / te / nous / vous","meaning_en":"to accept someone","example_fr":"Ils vous acceptent.","example_en":"They accept you all."},
  {"verb":"défendre","pattern_id":"personal:défendre","pattern":"défendre → me / te / nous / vous","meaning_en":"to defend someone","example_fr":"Ils me défendent.","example_en":"They defend me."},
  {"verb":"défendre","pattern_id":"personal:défendre","pattern":"défendre → me / te / nous / vous","meaning_en":"to defend someone","example_fr":"Ils te défendent.","example_en":"They defend you."},
  {"verb":"défendre","pattern_id":"personal:défendre","pattern":"défendre → me / te / nous / vous","meaning_en":"to defend someone","example_fr":"Ils nous défendent.","example_en":"They defend us."},
  {"verb":"défendre","pattern_id":"personal:défendre","pattern":"défendre → me / te / nous / vous","meaning_en":"to defend someone","example_fr":"Ils vous défendent.","example_en":"They defend you all."},
  {"verb":"éviter","pattern_id":"personal:éviter","pattern":"éviter → me / te / nous / vous","meaning_en":"to avoid someone","example_fr":"Ils m'évitent.","example_en":"They avoid me."},
  {"verb":"éviter","pattern_id":"personal:éviter","pattern":"éviter → me / te / nous / vous","meaning_en":"to avoid someone","example_fr":"Ils t'évitent.","example_en":"They avoid you."},
  {"verb":"éviter","pattern_id":"personal:éviter","pattern":"éviter → me / te / nous / vous","meaning_en":"to avoid someone","example_fr":"Ils nous évitent.","example_en":"They avoid us."},
  {"verb":"éviter","pattern_id":"personal:éviter","pattern":"éviter → me / te / nous / vous","meaning_en":"to avoid someone","example_fr":"Ils vous évitent.","example_en":"They avoid you all."},
  {"verb":"considérer","pattern_id":"personal:considérer","pattern":"considérer → me / te / nous / vous","meaning_en":"to consider someone","example_fr":"Ils me considèrent.","example_en":"They consider me."},
  {"verb":"considérer","pattern_id":"personal:considérer","pattern":"considérer → me / te / nous / vous","meaning_en":"to consider someone","example_fr":"Ils te considèrent.","example_en":"They consider you."},
  {"verb":"considérer","pattern_id":"personal:considérer","pattern":"considérer → me / te / nous / vous","meaning_en":"to consider someone","example_fr":"Ils nous considèrent.","example_en":"They consider us."},
  {"verb":"considérer","pattern_id":"personal:considérer","pattern":"considérer → me / te / nous / vous","meaning_en":"to consider someone","example_fr":"Ils vous considèrent.","example_en":"They consider you all."},
  {"verb":"recevoir","pattern_id":"personal:recevoir","pattern":"recevoir → me / te / nous / vous","meaning_en":"to receive someone","example_fr":"Ils me reçoivent.","example_en":"They receive me."},
  {"verb":"recevoir","pattern_id":"personal:recevoir","pattern":"recevoir → me / te / nous / vous","meaning_en":"to receive someone","example_fr":"Ils te reçoivent.","example_en":"They receive you."},
  {"verb":"recevoir","pattern_id":"personal:recevoir","pattern":"recevoir → me / te / nous / vous","meaning_en":"to receive someone","example_fr":"Ils nous reçoivent.","example_en":"They receive us."},
  {"verb":"recevoir","pattern_id":"personal:recevoir","pattern":"recevoir → me / te / nous / vous","meaning_en":"to receive someone","example_fr":"Ils vous reçoivent.","example_en":"They receive you all."},
  {"verb":"arrêter","pattern_id":"personal:arrêter","pattern":"arrêter → me / te / nous / vous","meaning_en":"to stop someone","example_fr":"Ils m'arrêtent.","example_en":"They stop me."},
  {"verb":"arrêter","pattern_id":"personal:arrêter","pattern":"arrêter → me / te / nous / vous","meaning_en":"to stop someone","example_fr":"Ils t'arrêtent.","example_en":"They stop you."},
  {"verb":"arrêter","pattern_id":"personal:arrêter","pattern":"arrêter → me / te / nous / vous","meaning_en":"to stop someone","example_fr":"Ils nous arrêtent.","example_en":"They stop us."},
  {"verb":"arrêter","pattern_id":"personal:arrêter","pattern":"arrêter → me / te / nous / vous","meaning_en":"to stop someone","example_fr":"Ils vous arrêtent.","example_en":"They stop you all."},
  {"verb":"aider","pattern_id":"personal:aider","pattern":"aider → me / te / nous / vous","meaning_en":"to help someone","example_fr":"Ils m'aident.","example_en":"They help me."},
  {"verb":"aider","pattern_id":"personal:aider","pattern":"aider → me / te / nous / vous","meaning_en":"to help someone","example_fr":"Ils t'aident.","example_en":"They help you."},
  {"verb":"aider","pattern_id":"personal:aider","pattern":"aider → me / te / nous / vous","meaning_en":"to help someone","example_fr":"Ils nous aident.","example_en":"They help us."},
  {"verb":"aider","pattern_id":"personal:aider","pattern":"aider → me / te / nous / vous","meaning_en":"to help someone","example_fr":"Ils vous aident.","example_en":"They help you all."},
  {"verb":"appeler","pattern_id":"personal:appeler","pattern":"appeler → me / te / nous / vous","meaning_en":"to call someone","example_fr":"Ils m'appellent.","example_en":"They call me."},
  {"verb":"appeler","pattern_id":"personal:appeler","pattern":"appeler → me / te / nous / vous","meaning_en":"to call someone","example_fr":"Ils t'appellent.","example_en":"They call you."},
  {"verb":"appeler","pattern_id":"personal:appeler","pattern":"appeler → me / te / nous / vous","meaning_en":"to call someone","example_fr":"Ils nous appellent.","example_en":"They call us."},
  {"verb":"appeler","pattern_id":"personal:appeler","pattern":"appeler → me / te / nous / vous","meaning_en":"to call someone","example_fr":"Ils vous appellent.","example_en":"They call you all."},
  {"verb":"inviter","pattern_id":"personal:inviter","pattern":"inviter → me / te / nous / vous","meaning_en":"to invite someone","example_fr":"Ils m'invitent.","example_en":"They invite me."},
  {"verb":"inviter","pattern_id":"personal:inviter","pattern":"inviter → me / te / nous / vous","meaning_en":"to invite someone","example_fr":"Ils t'invitent.","example_en":"They invite you."},
  {"verb":"inviter","pattern_id":"personal:inviter","pattern":"inviter → me / te / nous / vous","meaning_en":"to invite someone","example_fr":"Ils nous invitent.","example_en":"They invite us."},
  {"verb":"inviter","pattern_id":"personal:inviter","pattern":"inviter → me / te / nous / vous","meaning_en":"to invite someone","example_fr":"Ils vous invitent.","example_en":"They invite you all."},
  {"verb":"remercier","pattern_id":"personal:remercier","pattern":"remercier → me / te / nous / vous","meaning_en":"to thank someone","example_fr":"Ils me remercient.","example_en":"They thank me."},
  {"verb":"remercier","pattern_id":"personal:remercier","pattern":"remercier → me / te / nous / vous","meaning_en":"to thank someone","example_fr":"Ils te remercient.","example_en":"They thank you."},
  {"verb":"remercier","pattern_id":"personal:remercier","pattern":"remercier → me / te / nous / vous","meaning_en":"to thank someone","example_fr":"Ils nous remercient.","example_en":"They thank us."},
  {"verb":"remercier","pattern_id":"personal:remercier","pattern":"remercier → me / te / nous / vous","meaning_en":"to thank someone","example_fr":"Ils vous remercient.","example_en":"They thank you all."},
  {"verb":"rencontrer","pattern_id":"personal:rencontrer","pattern":"rencontrer → me / te / nous / vous","meaning_en":"to meet someone","example_fr":"Ils me rencontrent.","example_en":"They meet me."},
  {"verb":"rencontrer","pattern_id":"personal:rencontrer","pattern":"rencontrer → me / te / nous / vous","meaning_en":"to meet someone","example_fr":"Ils te rencontrent.","example_en":"They meet you."},
  {"verb":"rencontrer","pattern_id":"personal:rencontrer","pattern":"rencontrer → me / te / nous / vous","meaning_en":"to meet someone","example_fr":"Ils nous rencontrent.","example_en":"They meet us."},
  {"verb":"rencontrer","pattern_id":"personal:rencontrer","pattern":"rencontrer → me / te / nous / vous","meaning_en":"to meet someone","example_fr":"Ils vous rencontrent.","example_en":"They meet you all."},
  {"verb":"rejoindre","pattern_id":"personal:rejoindre","pattern":"rejoindre → me / te / nous / vous","meaning_en":"to join someone","example_fr":"Ils me rejoignent.","example_en":"They join me."},
  {"verb":"rejoindre","pattern_id":"personal:rejoindre","pattern":"rejoindre → me / te / nous / vous","meaning_en":"to join someone","example_fr":"Ils te rejoignent.","example_en":"They join you."},
  {"verb":"rejoindre","pattern_id":"personal:rejoindre","pattern":"rejoindre → me / te / nous / vous","meaning_en":"to join someone","example_fr":"Ils nous rejoignent.","example_en":"They join us."},
  {"verb":"rejoindre","pattern_id":"personal:rejoindre","pattern":"rejoindre → me / te / nous / vous","meaning_en":"to join someone","example_fr":"Ils vous rejoignent.","example_en":"They join you all."},
  {"verb":"saluer","pattern_id":"personal:saluer","pattern":"saluer → me / te / nous / vous","meaning_en":"to greet someone","example_fr":"Ils me saluent.","example_en":"They greet me."},
  {"verb":"saluer","pattern_id":"personal:saluer","pattern":"saluer → me / te / nous / vous","meaning_en":"to greet someone","example_fr":"Ils te saluent.","example_en":"They greet you."},
  {"verb":"saluer","pattern_id":"personal:saluer","pattern":"saluer → me / te / nous / vous","meaning_en":"to greet someone","example_fr":"Ils nous saluent.","example_en":"They greet us."},
  {"verb":"saluer","pattern_id":"personal:saluer","pattern":"saluer → me / te / nous / vous","meaning_en":"to greet someone","example_fr":"Ils vous saluent.","example_en":"They greet you all."},
  {"verb":"embrasser","pattern_id":"personal:embrasser","pattern":"embrasser → me / te / nous / vous","meaning_en":"to kiss someone","example_fr":"Ils m'embrassent.","example_en":"They kiss me."},
  {"verb":"embrasser","pattern_id":"personal:embrasser","pattern":"embrasser → me / te / nous / vous","meaning_en":"to kiss someone","example_fr":"Ils t'embrassent.","example_en":"They kiss you."},
  {"verb":"embrasser","pattern_id":"personal:embrasser","pattern":"embrasser → me / te / nous / vous","meaning_en":"to kiss someone","example_fr":"Ils nous embrassent.","example_en":"They kiss us."},
  {"verb":"embrasser","pattern_id":"personal:embrasser","pattern":"embrasser → me / te / nous / vous","meaning_en":"to kiss someone","example_fr":"Ils vous embrassent.","example_en":"They kiss you all."},
  {"verb":"prévenir","pattern_id":"personal:prévenir","pattern":"prévenir → me / te / nous / vous","meaning_en":"to warn someone","example_fr":"Ils me préviennent.","example_en":"They warn me."},
  {"verb":"prévenir","pattern_id":"personal:prévenir","pattern":"prévenir → me / te / nous / vous","meaning_en":"to warn someone","example_fr":"Ils te préviennent.","example_en":"They warn you."},
  {"verb":"prévenir","pattern_id":"personal:prévenir","pattern":"prévenir → me / te / nous / vous","meaning_en":"to warn someone","example_fr":"Ils nous préviennent.","example_en":"They warn us."},
  {"verb":"prévenir","pattern_id":"personal:prévenir","pattern":"prévenir → me / te / nous / vous","meaning_en":"to warn someone","example_fr":"Ils vous préviennent.","example_en":"They warn you all."},
  {"verb":"accompagner","pattern_id":"personal:accompagner","pattern":"accompagner → me / te / nous / vous","meaning_en":"to accompany someone","example_fr":"Ils m'accompagnent.","example_en":"They accompany me."},
  {"verb":"accompagner","pattern_id":"personal:accompagner","pattern":"accompagner → me / te / nous / vous","meaning_en":"to accompany someone","example_fr":"Ils t'accompagnent.","example_en":"They accompany you."},
  {"verb":"accompagner","pattern_id":"personal:accompagner","pattern":"accompagner → me / te / nous / vous","meaning_en":"to accompany someone","example_fr":"Ils nous accompagnent.","example_en":"They accompany us."},
  {"verb":"accompagner","pattern_id":"personal:accompagner","pattern":"accompagner → me / te / nous / vous","meaning_en":"to accompany someone","example_fr":"Ils vous accompagnent.","example_en":"They accompany you all."},
  {"verb":"accueillir","pattern_id":"personal:accueillir","pattern":"accueillir → me / te / nous / vous","meaning_en":"to welcome someone","example_fr":"Ils m'accueillent.","example_en":"They welcome me."},
  {"verb":"accueillir","pattern_id":"personal:accueillir","pattern":"accueillir → me / te / nous / vous","meaning_en":"to welcome someone","example_fr":"Ils t'accueillent.","example_en":"They welcome you."},
  {"verb":"accueillir","pattern_id":"personal:accueillir","pattern":"accueillir → me / te / nous / vous","meaning_en":"to welcome someone","example_fr":"Ils nous accueillent.","example_en":"They welcome us."},
  {"verb":"accueillir","pattern_id":"personal:accueillir","pattern":"accueillir → me / te / nous / vous","meaning_en":"to welcome someone","example_fr":"Ils vous accueillent.","example_en":"They welcome you all."},
  {"verb":"conduire","pattern_id":"personal:conduire","pattern":"conduire → me / te / nous / vous","meaning_en":"to drive someone","example_fr":"Ils me conduisent.","example_en":"They drive me."},
  {"verb":"conduire","pattern_id":"personal:conduire","pattern":"conduire → me / te / nous / vous","meaning_en":"to drive someone","example_fr":"Ils te conduisent.","example_en":"They drive you."},
  {"verb":"conduire","pattern_id":"personal:conduire","pattern":"conduire → me / te / nous / vous","meaning_en":"to drive someone","example_fr":"Ils nous conduisent.","example_en":"They drive us."},
  {"verb":"conduire","pattern_id":"personal:conduire","pattern":"conduire → me / te / nous / vous","meaning_en":"to drive someone","example_fr":"Ils vous conduisent.","example_en":"They drive you all."},
  {"verb":"emmener","pattern_id":"personal:emmener","pattern":"emmener → me / te / nous / vous","meaning_en":"to take along someone","example_fr":"Ils m'emmènent.","example_en":"They take me along."},
  {"verb":"emmener","pattern_id":"personal:emmener","pattern":"emmener → me / te / nous / vous","meaning_en":"to take along someone","example_fr":"Ils t'emmènent.","example_en":"They take you along."},
  {"verb":"emmener","pattern_id":"personal:emmener","pattern":"emmener → me / te / nous / vous","meaning_en":"to take along someone","example_fr":"Ils nous emmènent.","example_en":"They take us along."},
  {"verb":"emmener","pattern_id":"personal:emmener","pattern":"emmener → me / te / nous / vous","meaning_en":"to take along someone","example_fr":"Ils vous emmènent.","example_en":"They take you all along."},
  {"verb":"ramener","pattern_id":"personal:ramener","pattern":"ramener → me / te / nous / vous","meaning_en":"to bring back someone","example_fr":"Ils me ramènent.","example_en":"They bring me back."},
  {"verb":"ramener","pattern_id":"personal:ramener","pattern":"ramener → me / te / nous / vous","meaning_en":"to bring back someone","example_fr":"Ils te ramènent.","example_en":"They bring you back."},
  {"verb":"ramener","pattern_id":"personal:ramener","pattern":"ramener → me / te / nous / vous","meaning_en":"to bring back someone","example_fr":"Ils nous ramènent.","example_en":"They bring us back."},
  {"verb":"ramener","pattern_id":"personal:ramener","pattern":"ramener → me / te / nous / vous","meaning_en":"to bring back someone","example_fr":"Ils vous ramènent.","example_en":"They bring you all back."},
  {"verb":"rassurer","pattern_id":"personal:rassurer","pattern":"rassurer → me / te / nous / vous","meaning_en":"to reassure someone","example_fr":"Ils me rassurent.","example_en":"They reassure me."},
  {"verb":"rassurer","pattern_id":"personal:rassurer","pattern":"rassurer → me / te / nous / vous","meaning_en":"to reassure someone","example_fr":"Ils te rassurent.","example_en":"They reassure you."},
  {"verb":"rassurer","pattern_id":"personal:rassurer","pattern":"rassurer → me / te / nous / vous","meaning_en":"to reassure someone","example_fr":"Ils nous rassurent.","example_en":"They reassure us."},
  {"verb":"rassurer","pattern_id":"personal:rassurer","pattern":"rassurer → me / te / nous / vous","meaning_en":"to reassure someone","example_fr":"Ils vous rassurent.","example_en":"They reassure you all."},
  {"verb":"convaincre","pattern_id":"personal:convaincre","pattern":"convaincre → me / te / nous / vous","meaning_en":"to convince someone","example_fr":"Ils me convainquent.","example_en":"They convince me."},
  {"verb":"convaincre","pattern_id":"personal:convaincre","pattern":"convaincre → me / te / nous / vous","meaning_en":"to convince someone","example_fr":"Ils te convainquent.","example_en":"They convince you."},
  {"verb":"convaincre","pattern_id":"personal:convaincre","pattern":"convaincre → me / te / nous / vous","meaning_en":"to convince someone","example_fr":"Ils nous convainquent.","example_en":"They convince us."},
  {"verb":"convaincre","pattern_id":"personal:convaincre","pattern":"convaincre → me / te / nous / vous","meaning_en":"to convince someone","example_fr":"Ils vous convainquent.","example_en":"They convince you all."},
  {"verb":"persuader","pattern_id":"personal:persuader","pattern":"persuader → me / te / nous / vous","meaning_en":"to persuade someone","example_fr":"Ils me persuadent.","example_en":"They persuade me."},
  {"verb":"persuader","pattern_id":"personal:persuader","pattern":"persuader → me / te / nous / vous","meaning_en":"to persuade someone","example_fr":"Ils te persuadent.","example_en":"They persuade you."},
  {"verb":"persuader","pattern_id":"personal:persuader","pattern":"persuader → me / te / nous / vous","meaning_en":"to persuade someone","example_fr":"Ils nous persuadent.","example_en":"They persuade us."},
  {"verb":"persuader","pattern_id":"personal:persuader","pattern":"persuader → me / te / nous / vous","meaning_en":"to persuade someone","example_fr":"Ils vous persuadent.","example_en":"They persuade you all."},
  {"verb":"surprendre","pattern_id":"personal:surprendre","pattern":"surprendre → me / te / nous / vous","meaning_en":"to surprise someone","example_fr":"Ils me surprennent.","example_en":"They surprise me."},
  {"verb":"surprendre","pattern_id":"personal:surprendre","pattern":"surprendre → me / te / nous / vous","meaning_en":"to surprise someone","example_fr":"Ils te surprennent.","example_en":"They surprise you."},
  {"verb":"surprendre","pattern_id":"personal:surprendre","pattern":"surprendre → me / te / nous / vous","meaning_en":"to surprise someone","example_fr":"Ils nous surprennent.","example_en":"They surprise us."},
  {"verb":"surprendre","pattern_id":"personal:surprendre","pattern":"surprendre → me / te / nous / vous","meaning_en":"to surprise someone","example_fr":"Ils vous surprennent.","example_en":"They surprise you all."},
  {"verb":"impressionner","pattern_id":"personal:impressionner","pattern":"impressionner → me / te / nous / vous","meaning_en":"to impress someone","example_fr":"Ils m'impressionnent.","example_en":"They impress me."},
  {"verb":"impressionner","pattern_id":"personal:impressionner","pattern":"impressionner → me / te / nous / vous","meaning_en":"to impress someone","example_fr":"Ils t'impressionnent.","example_en":"They impress you."},
  {"verb":"impressionner","pattern_id":"personal:impressionner","pattern":"impressionner → me / te / nous / vous","meaning_en":"to impress someone","example_fr":"Ils nous impressionnent.","example_en":"They impress us."},
  {"verb":"impressionner","pattern_id":"personal:impressionner","pattern":"impressionner → me / te / nous / vous","meaning_en":"to impress someone","example_fr":"Ils vous impressionnent.","example_en":"They impress you all."},
  {"verb":"respecter","pattern_id":"personal:respecter","pattern":"respecter → me / te / nous / vous","meaning_en":"to respect someone","example_fr":"Ils me respectent.","example_en":"They respect me."},
  {"verb":"respecter","pattern_id":"personal:respecter","pattern":"respecter → me / te / nous / vous","meaning_en":"to respect someone","example_fr":"Ils te respectent.","example_en":"They respect you."},
  {"verb":"respecter","pattern_id":"personal:respecter","pattern":"respecter → me / te / nous / vous","meaning_en":"to respect someone","example_fr":"Ils nous respectent.","example_en":"They respect us."},
  {"verb":"respecter","pattern_id":"personal:respecter","pattern":"respecter → me / te / nous / vous","meaning_en":"to respect someone","example_fr":"Ils vous respectent.","example_en":"They respect you all."},
  {"verb":"admirer","pattern_id":"personal:admirer","pattern":"admirer → me / te / nous / vous","meaning_en":"to admire someone","example_fr":"Ils m'admirent.","example_en":"They admire me."},
  {"verb":"admirer","pattern_id":"personal:admirer","pattern":"admirer → me / te / nous / vous","meaning_en":"to admire someone","example_fr":"Ils t'admirent.","example_en":"They admire you."},
  {"verb":"admirer","pattern_id":"personal:admirer","pattern":"admirer → me / te / nous / vous","meaning_en":"to admire someone","example_fr":"Ils nous admirent.","example_en":"They admire us."},
  {"verb":"admirer","pattern_id":"personal:admirer","pattern":"admirer → me / te / nous / vous","meaning_en":"to admire someone","example_fr":"Ils vous admirent.","example_en":"They admire you all."},
  {"verb":"détester","pattern_id":"personal:détester","pattern":"détester → me / te / nous / vous","meaning_en":"to hate someone","example_fr":"Ils me détestent.","example_en":"They hate me."},
  {"verb":"détester","pattern_id":"personal:détester","pattern":"détester → me / te / nous / vous","meaning_en":"to hate someone","example_fr":"Ils te détestent.","example_en":"They hate you."},
  {"verb":"détester","pattern_id":"personal:détester","pattern":"détester → me / te / nous / vous","meaning_en":"to hate someone","example_fr":"Ils nous détestent.","example_en":"They hate us."},
  {"verb":"détester","pattern_id":"personal:détester","pattern":"détester → me / te / nous / vous","meaning_en":"to hate someone","example_fr":"Ils vous détestent.","example_en":"They hate you all."},
  {"verb":"blesser","pattern_id":"personal:blesser","pattern":"blesser → me / te / nous / vous","meaning_en":"to hurt someone","example_fr":"Ils me blessent.","example_en":"They hurt me."},
  {"verb":"blesser","pattern_id":"personal:blesser","pattern":"blesser → me / te / nous / vous","meaning_en":"to hurt someone","example_fr":"Ils te blessent.","example_en":"They hurt you."},
  {"verb":"blesser","pattern_id":"personal:blesser","pattern":"blesser → me / te / nous / vous","meaning_en":"to hurt someone","example_fr":"Ils nous blessent.","example_en":"They hurt us."},
  {"verb":"blesser","pattern_id":"personal:blesser","pattern":"blesser → me / te / nous / vous","meaning_en":"to hurt someone","example_fr":"Ils vous blessent.","example_en":"They hurt you all."},
  {"verb":"soigner","pattern_id":"personal:soigner","pattern":"soigner → me / te / nous / vous","meaning_en":"to care for someone","example_fr":"Ils me soignent.","example_en":"They care for me."},
  {"verb":"soigner","pattern_id":"personal:soigner","pattern":"soigner → me / te / nous / vous","meaning_en":"to care for someone","example_fr":"Ils te soignent.","example_en":"They care for you."},
  {"verb":"soigner","pattern_id":"personal:soigner","pattern":"soigner → me / te / nous / vous","meaning_en":"to care for someone","example_fr":"Ils nous soignent.","example_en":"They care for us."},
  {"verb":"soigner","pattern_id":"personal:soigner","pattern":"soigner → me / te / nous / vous","meaning_en":"to care for someone","example_fr":"Ils vous soignent.","example_en":"They care for you all."},
  {"verb":"interroger","pattern_id":"personal:interroger","pattern":"interroger → me / te / nous / vous","meaning_en":"to question someone","example_fr":"Ils m'interrogent.","example_en":"They question me."},
  {"verb":"interroger","pattern_id":"personal:interroger","pattern":"interroger → me / te / nous / vous","meaning_en":"to question someone","example_fr":"Ils t'interrogent.","example_en":"They question you."},
  {"verb":"interroger","pattern_id":"personal:interroger","pattern":"interroger → me / te / nous / vous","meaning_en":"to question someone","example_fr":"Ils nous interrogent.","example_en":"They question us."},
  {"verb":"interroger","pattern_id":"personal:interroger","pattern":"interroger → me / te / nous / vous","meaning_en":"to question someone","example_fr":"Ils vous interrogent.","example_en":"They question you all."},
  {"verb":"informer","pattern_id":"personal:informer","pattern":"informer → me / te / nous / vous","meaning_en":"to inform someone","example_fr":"Ils m'informent.","example_en":"They inform me."},
  {"verb":"informer","pattern_id":"personal:informer","pattern":"informer → me / te / nous / vous","meaning_en":"to inform someone","example_fr":"Ils t'informent.","example_en":"They inform you."},
  {"verb":"informer","pattern_id":"personal:informer","pattern":"informer → me / te / nous / vous","meaning_en":"to inform someone","example_fr":"Ils nous informent.","example_en":"They inform us."},
  {"verb":"informer","pattern_id":"personal:informer","pattern":"informer → me / te / nous / vous","meaning_en":"to inform someone","example_fr":"Ils vous informent.","example_en":"They inform you all."},
  {"verb":"déranger","pattern_id":"personal:déranger","pattern":"déranger → me / te / nous / vous","meaning_en":"to disturb someone","example_fr":"Ils me dérangent.","example_en":"They disturb me."},
  {"verb":"déranger","pattern_id":"personal:déranger","pattern":"déranger → me / te / nous / vous","meaning_en":"to disturb someone","example_fr":"Ils te dérangent.","example_en":"They disturb you."},
  {"verb":"déranger","pattern_id":"personal:déranger","pattern":"déranger → me / te / nous / vous","meaning_en":"to disturb someone","example_fr":"Ils nous dérangent.","example_en":"They disturb us."},
  {"verb":"déranger","pattern_id":"personal:déranger","pattern":"déranger → me / te / nous / vous","meaning_en":"to disturb someone","example_fr":"Ils vous dérangent.","example_en":"They disturb you all."},
  {"verb":"réveiller","pattern_id":"personal:réveiller","pattern":"réveiller → me / te / nous / vous","meaning_en":"to wake up someone","example_fr":"Ils me réveillent.","example_en":"They wake me up."},
  {"verb":"réveiller","pattern_id":"personal:réveiller","pattern":"réveiller → me / te / nous / vous","meaning_en":"to wake up someone","example_fr":"Ils te réveillent.","example_en":"They wake you up."},
  {"verb":"réveiller","pattern_id":"personal:réveiller","pattern":"réveiller → me / te / nous / vous","meaning_en":"to wake up someone","example_fr":"Ils nous réveillent.","example_en":"They wake us up."},
  {"verb":"réveiller","pattern_id":"personal:réveiller","pattern":"réveiller → me / te / nous / vous","meaning_en":"to wake up someone","example_fr":"Ils vous réveillent.","example_en":"They wake you all up."},
  {"verb":"entendre","pattern_id":"personal:entendre","pattern":"entendre → me / te / nous / vous","meaning_en":"to hear someone","example_fr":"Ils m'entendent.","example_en":"They hear me."},
  {"verb":"entendre","pattern_id":"personal:entendre","pattern":"entendre → me / te / nous / vous","meaning_en":"to hear someone","example_fr":"Ils t'entendent.","example_en":"They hear you."},
  {"verb":"entendre","pattern_id":"personal:entendre","pattern":"entendre → me / te / nous / vous","meaning_en":"to hear someone","example_fr":"Ils nous entendent.","example_en":"They hear us."},
  {"verb":"entendre","pattern_id":"personal:entendre","pattern":"entendre → me / te / nous / vous","meaning_en":"to hear someone","example_fr":"Ils vous entendent.","example_en":"They hear you all."},
  {"verb":"recruter","pattern_id":"personal:recruter","pattern":"recruter → me / te / nous / vous","meaning_en":"to recruit someone","example_fr":"Ils me recrutent.","example_en":"They recruit me."},
  {"verb":"recruter","pattern_id":"personal:recruter","pattern":"recruter → me / te / nous / vous","meaning_en":"to recruit someone","example_fr":"Ils te recrutent.","example_en":"They recruit you."},
  {"verb":"recruter","pattern_id":"personal:recruter","pattern":"recruter → me / te / nous / vous","meaning_en":"to recruit someone","example_fr":"Ils nous recrutent.","example_en":"They recruit us."},
  {"verb":"recruter","pattern_id":"personal:recruter","pattern":"recruter → me / te / nous / vous","meaning_en":"to recruit someone","example_fr":"Ils vous recrutent.","example_en":"They recruit you all."},
  {"verb":"féliciter","pattern_id":"personal:féliciter","pattern":"féliciter → me / te / nous / vous","meaning_en":"to congratulate someone","example_fr":"Ils me félicitent.","example_en":"They congratulate me."},
  {"verb":"féliciter","pattern_id":"personal:féliciter","pattern":"féliciter → me / te / nous / vous","meaning_en":"to congratulate someone","example_fr":"Ils te félicitent.","example_en":"They congratulate you."},
  {"verb":"féliciter","pattern_id":"personal:féliciter","pattern":"féliciter → me / te / nous / vous","meaning_en":"to congratulate someone","example_fr":"Ils nous félicitent.","example_en":"They congratulate us."},
  {"verb":"féliciter","pattern_id":"personal:féliciter","pattern":"féliciter → me / te / nous / vous","meaning_en":"to congratulate someone","example_fr":"Ils vous félicitent.","example_en":"They congratulate you all."},
  {"verb":"critiquer","pattern_id":"personal:critiquer","pattern":"critiquer → me / te / nous / vous","meaning_en":"to criticize someone","example_fr":"Ils me critiquent.","example_en":"They criticize me."},
  {"verb":"critiquer","pattern_id":"personal:critiquer","pattern":"critiquer → me / te / nous / vous","meaning_en":"to criticize someone","example_fr":"Ils te critiquent.","example_en":"They criticize you."},
  {"verb":"critiquer","pattern_id":"personal:critiquer","pattern":"critiquer → me / te / nous / vous","meaning_en":"to criticize someone","example_fr":"Ils nous critiquent.","example_en":"They criticize us."},
  {"verb":"critiquer","pattern_id":"personal:critiquer","pattern":"critiquer → me / te / nous / vous","meaning_en":"to criticize someone","example_fr":"Ils vous critiquent.","example_en":"They criticize you all."},
  {"verb":"punir","pattern_id":"personal:punir","pattern":"punir → me / te / nous / vous","meaning_en":"to punish someone","example_fr":"Ils me punissent.","example_en":"They punish me."},
  {"verb":"punir","pattern_id":"personal:punir","pattern":"punir → me / te / nous / vous","meaning_en":"to punish someone","example_fr":"Ils te punissent.","example_en":"They punish you."},
  {"verb":"punir","pattern_id":"personal:punir","pattern":"punir → me / te / nous / vous","meaning_en":"to punish someone","example_fr":"Ils nous punissent.","example_en":"They punish us."},
  {"verb":"punir","pattern_id":"personal:punir","pattern":"punir → me / te / nous / vous","meaning_en":"to punish someone","example_fr":"Ils vous punissent.","example_en":"They punish you all."},
  {"verb":"observer","pattern_id":"personal:observer","pattern":"observer → me / te / nous / vous","meaning_en":"to observe someone","example_fr":"Ils m'observent.","example_en":"They observe me."},
  {"verb":"observer","pattern_id":"personal:observer","pattern":"observer → me / te / nous / vous","meaning_en":"to observe someone","example_fr":"Ils t'observent.","example_en":"They observe you."},
  {"verb":"observer","pattern_id":"personal:observer","pattern":"observer → me / te / nous / vous","meaning_en":"to observe someone","example_fr":"Ils nous observent.","example_en":"They observe us."},
  {"verb":"observer","pattern_id":"personal:observer","pattern":"observer → me / te / nous / vous","meaning_en":"to observe someone","example_fr":"Ils vous observent.","example_en":"They observe you all."},
  {"verb":"libérer","pattern_id":"personal:libérer","pattern":"libérer → me / te / nous / vous","meaning_en":"to free someone","example_fr":"Ils me libèrent.","example_en":"They free me."},
  {"verb":"libérer","pattern_id":"personal:libérer","pattern":"libérer → me / te / nous / vous","meaning_en":"to free someone","example_fr":"Ils te libèrent.","example_en":"They free you."},
  {"verb":"libérer","pattern_id":"personal:libérer","pattern":"libérer → me / te / nous / vous","meaning_en":"to free someone","example_fr":"Ils nous libèrent.","example_en":"They free us."},
  {"verb":"libérer","pattern_id":"personal:libérer","pattern":"libérer → me / te / nous / vous","meaning_en":"to free someone","example_fr":"Ils vous libèrent.","example_en":"They free you all."},
  {"verb":"abandonner","pattern_id":"personal:abandonner","pattern":"abandonner → me / te / nous / vous","meaning_en":"to abandon someone","example_fr":"Ils m'abandonnent.","example_en":"They abandon me."},
  {"verb":"abandonner","pattern_id":"personal:abandonner","pattern":"abandonner → me / te / nous / vous","meaning_en":"to abandon someone","example_fr":"Ils t'abandonnent.","example_en":"They abandon you."},
  {"verb":"abandonner","pattern_id":"personal:abandonner","pattern":"abandonner → me / te / nous / vous","meaning_en":"to abandon someone","example_fr":"Ils nous abandonnent.","example_en":"They abandon us."},
  {"verb":"abandonner","pattern_id":"personal:abandonner","pattern":"abandonner → me / te / nous / vous","meaning_en":"to abandon someone","example_fr":"Ils vous abandonnent.","example_en":"They abandon you all."},
  {"verb":"parler","pattern_id":"personal:parler","pattern":"parler → me / te / nous / vous","meaning_en":"to speak to someone","example_fr":"Ils me parlent.","example_en":"They speak to me."},
  {"verb":"parler","pattern_id":"personal:parler","pattern":"parler → me / te / nous / vous","meaning_en":"to speak to someone","example_fr":"Ils te parlent.","example_en":"They speak to you."},
  {"verb":"parler","pattern_id":"personal:parler","pattern":"parler → me / te / nous / vous","meaning_en":"to speak to someone","example_fr":"Ils nous parlent.","example_en":"They speak to us."},
  {"verb":"parler","pattern_id":"personal:parler","pattern":"parler → me / te / nous / vous","meaning_en":"to speak to someone","example_fr":"Ils vous parlent.","example_en":"They speak to you all."},
  {"verb":"répondre","pattern_id":"personal:répondre","pattern":"répondre → me / te / nous / vous","meaning_en":"to reply to someone","example_fr":"Ils me répondent.","example_en":"They reply to me."},
  {"verb":"répondre","pattern_id":"personal:répondre","pattern":"répondre → me / te / nous / vous","meaning_en":"to reply to someone","example_fr":"Ils te répondent.","example_en":"They reply to you."},
  {"verb":"répondre","pattern_id":"personal:répondre","pattern":"répondre → me / te / nous / vous","meaning_en":"to reply to someone","example_fr":"Ils nous répondent.","example_en":"They reply to us."},
  {"verb":"répondre","pattern_id":"personal:répondre","pattern":"répondre → me / te / nous / vous","meaning_en":"to reply to someone","example_fr":"Ils vous répondent.","example_en":"They reply to you all."},
  {"verb":"écrire","pattern_id":"personal:écrire","pattern":"écrire → me / te / nous / vous","meaning_en":"to write to someone","example_fr":"Ils m'écrivent.","example_en":"They write to me."},
  {"verb":"écrire","pattern_id":"personal:écrire","pattern":"écrire → me / te / nous / vous","meaning_en":"to write to someone","example_fr":"Ils t'écrivent.","example_en":"They write to you."},
  {"verb":"écrire","pattern_id":"personal:écrire","pattern":"écrire → me / te / nous / vous","meaning_en":"to write to someone","example_fr":"Ils nous écrivent.","example_en":"They write to us."},
  {"verb":"écrire","pattern_id":"personal:écrire","pattern":"écrire → me / te / nous / vous","meaning_en":"to write to someone","example_fr":"Ils vous écrivent.","example_en":"They write to you all."},
  {"verb":"téléphoner","pattern_id":"personal:téléphoner","pattern":"téléphoner → me / te / nous / vous","meaning_en":"to phone someone","example_fr":"Ils me téléphonent.","example_en":"They phone me."},
  {"verb":"téléphoner","pattern_id":"personal:téléphoner","pattern":"téléphoner → me / te / nous / vous","meaning_en":"to phone someone","example_fr":"Ils te téléphonent.","example_en":"They phone you."},
  {"verb":"téléphoner","pattern_id":"personal:téléphoner","pattern":"téléphoner → me / te / nous / vous","meaning_en":"to phone someone","example_fr":"Ils nous téléphonent.","example_en":"They phone us."},
  {"verb":"téléphoner","pattern_id":"personal:téléphoner","pattern":"téléphoner → me / te / nous / vous","meaning_en":"to phone someone","example_fr":"Ils vous téléphonent.","example_en":"They phone you all."},
  {"verb":"sourire","pattern_id":"personal:sourire","pattern":"sourire → me / te / nous / vous","meaning_en":"to smile at someone","example_fr":"Ils me sourient.","example_en":"They smile at me."},
  {"verb":"sourire","pattern_id":"personal:sourire","pattern":"sourire → me / te / nous / vous","meaning_en":"to smile at someone","example_fr":"Ils te sourient.","example_en":"They smile at you."},
  {"verb":"sourire","pattern_id":"personal:sourire","pattern":"sourire → me / te / nous / vous","meaning_en":"to smile at someone","example_fr":"Ils nous sourient.","example_en":"They smile at us."},
  {"verb":"sourire","pattern_id":"personal:sourire","pattern":"sourire → me / te / nous / vous","meaning_en":"to smile at someone","example_fr":"Ils vous sourient.","example_en":"They smile at you all."},
  {"verb":"donner","pattern_id":"personal-double:donner","pattern":"donner + quelque chose + à quelqu’un","meaning_en":"to give something to someone","example_fr":"Ils me le donnent.","example_en":"They give it to me."},
  {"verb":"donner","pattern_id":"personal-double:donner","pattern":"donner + quelque chose + à quelqu’un","meaning_en":"to give something to someone","example_fr":"Ils te la donnent.","example_en":"They give it to you."},
  {"verb":"donner","pattern_id":"personal-double:donner","pattern":"donner + quelque chose + à quelqu’un","meaning_en":"to give something to someone","example_fr":"Ils nous les donnent.","example_en":"They give them to us."},
  {"verb":"donner","pattern_id":"personal-double:donner","pattern":"donner + quelque chose + à quelqu’un","meaning_en":"to give something to someone","example_fr":"Ils vous le donnent.","example_en":"They give it to you all."},
  {"verb":"offrir","pattern_id":"personal-double:offrir","pattern":"offrir + quelque chose + à quelqu’un","meaning_en":"to offer something to someone","example_fr":"Ils me l'offrent.","example_en":"They offer it to me."},
  {"verb":"offrir","pattern_id":"personal-double:offrir","pattern":"offrir + quelque chose + à quelqu’un","meaning_en":"to offer something to someone","example_fr":"Ils te l'offrent.","example_en":"They offer it to you."},
  {"verb":"offrir","pattern_id":"personal-double:offrir","pattern":"offrir + quelque chose + à quelqu’un","meaning_en":"to offer something to someone","example_fr":"Ils nous les offrent.","example_en":"They offer them to us."},
  {"verb":"offrir","pattern_id":"personal-double:offrir","pattern":"offrir + quelque chose + à quelqu’un","meaning_en":"to offer something to someone","example_fr":"Ils vous l'offrent.","example_en":"They offer it to you all."},
  {"verb":"envoyer","pattern_id":"personal-double:envoyer","pattern":"envoyer + quelque chose + à quelqu’un","meaning_en":"to send something to someone","example_fr":"Ils me l'envoient.","example_en":"They send it to me."},
  {"verb":"envoyer","pattern_id":"personal-double:envoyer","pattern":"envoyer + quelque chose + à quelqu’un","meaning_en":"to send something to someone","example_fr":"Ils te l'envoient.","example_en":"They send it to you."},
  {"verb":"envoyer","pattern_id":"personal-double:envoyer","pattern":"envoyer + quelque chose + à quelqu’un","meaning_en":"to send something to someone","example_fr":"Ils nous les envoient.","example_en":"They send them to us."},
  {"verb":"envoyer","pattern_id":"personal-double:envoyer","pattern":"envoyer + quelque chose + à quelqu’un","meaning_en":"to send something to someone","example_fr":"Ils vous l'envoient.","example_en":"They send it to you all."},
  {"verb":"apporter","pattern_id":"personal-double:apporter","pattern":"apporter + quelque chose + à quelqu’un","meaning_en":"to bring something to someone","example_fr":"Ils me l'apportent.","example_en":"They bring it to me."},
  {"verb":"apporter","pattern_id":"personal-double:apporter","pattern":"apporter + quelque chose + à quelqu’un","meaning_en":"to bring something to someone","example_fr":"Ils te l'apportent.","example_en":"They bring it to you."},
  {"verb":"apporter","pattern_id":"personal-double:apporter","pattern":"apporter + quelque chose + à quelqu’un","meaning_en":"to bring something to someone","example_fr":"Ils nous les apportent.","example_en":"They bring them to us."},
  {"verb":"apporter","pattern_id":"personal-double:apporter","pattern":"apporter + quelque chose + à quelqu’un","meaning_en":"to bring something to someone","example_fr":"Ils vous l'apportent.","example_en":"They bring it to you all."},
  {"verb":"prêter","pattern_id":"personal-double:prêter","pattern":"prêter + quelque chose + à quelqu’un","meaning_en":"to lend something to someone","example_fr":"Ils me le prêtent.","example_en":"They lend it to me."},
  {"verb":"prêter","pattern_id":"personal-double:prêter","pattern":"prêter + quelque chose + à quelqu’un","meaning_en":"to lend something to someone","example_fr":"Ils te la prêtent.","example_en":"They lend it to you."},
  {"verb":"prêter","pattern_id":"personal-double:prêter","pattern":"prêter + quelque chose + à quelqu’un","meaning_en":"to lend something to someone","example_fr":"Ils nous les prêtent.","example_en":"They lend them to us."},
  {"verb":"prêter","pattern_id":"personal-double:prêter","pattern":"prêter + quelque chose + à quelqu’un","meaning_en":"to lend something to someone","example_fr":"Ils vous le prêtent.","example_en":"They lend it to you all."},
  {"verb":"rendre","pattern_id":"personal-double:rendre","pattern":"rendre + quelque chose + à quelqu’un","meaning_en":"to return something to someone","example_fr":"Ils me le rendent.","example_en":"They return it to me."},
  {"verb":"rendre","pattern_id":"personal-double:rendre","pattern":"rendre + quelque chose + à quelqu’un","meaning_en":"to return something to someone","example_fr":"Ils te la rendent.","example_en":"They return it to you."},
  {"verb":"rendre","pattern_id":"personal-double:rendre","pattern":"rendre + quelque chose + à quelqu’un","meaning_en":"to return something to someone","example_fr":"Ils nous les rendent.","example_en":"They return them to us."},
  {"verb":"rendre","pattern_id":"personal-double:rendre","pattern":"rendre + quelque chose + à quelqu’un","meaning_en":"to return something to someone","example_fr":"Ils vous le rendent.","example_en":"They return it to you all."},
  {"verb":"vendre","pattern_id":"personal-double:vendre","pattern":"vendre + quelque chose + à quelqu’un","meaning_en":"to sell something to someone","example_fr":"Ils me le vendent.","example_en":"They sell it to me."},
  {"verb":"vendre","pattern_id":"personal-double:vendre","pattern":"vendre + quelque chose + à quelqu’un","meaning_en":"to sell something to someone","example_fr":"Ils te la vendent.","example_en":"They sell it to you."},
  {"verb":"vendre","pattern_id":"personal-double:vendre","pattern":"vendre + quelque chose + à quelqu’un","meaning_en":"to sell something to someone","example_fr":"Ils nous les vendent.","example_en":"They sell them to us."},
  {"verb":"vendre","pattern_id":"personal-double:vendre","pattern":"vendre + quelque chose + à quelqu’un","meaning_en":"to sell something to someone","example_fr":"Ils vous le vendent.","example_en":"They sell it to you all."},
  {"verb":"acheter","pattern_id":"personal-double:acheter","pattern":"acheter + quelque chose + à quelqu’un","meaning_en":"to buy something for someone","example_fr":"Ils me l'achètent.","example_en":"They buy it for me."},
  {"verb":"acheter","pattern_id":"personal-double:acheter","pattern":"acheter + quelque chose + à quelqu’un","meaning_en":"to buy something for someone","example_fr":"Ils te l'achètent.","example_en":"They buy it for you."},
  {"verb":"acheter","pattern_id":"personal-double:acheter","pattern":"acheter + quelque chose + à quelqu’un","meaning_en":"to buy something for someone","example_fr":"Ils nous les achètent.","example_en":"They buy them for us."},
  {"verb":"acheter","pattern_id":"personal-double:acheter","pattern":"acheter + quelque chose + à quelqu’un","meaning_en":"to buy something for someone","example_fr":"Ils vous l'achètent.","example_en":"They buy it for you all."},
  {"verb":"montrer","pattern_id":"personal-double:montrer","pattern":"montrer + quelque chose + à quelqu’un","meaning_en":"to show something to someone","example_fr":"Ils me le montrent.","example_en":"They show it to me."},
  {"verb":"montrer","pattern_id":"personal-double:montrer","pattern":"montrer + quelque chose + à quelqu’un","meaning_en":"to show something to someone","example_fr":"Ils te la montrent.","example_en":"They show it to you."},
  {"verb":"montrer","pattern_id":"personal-double:montrer","pattern":"montrer + quelque chose + à quelqu’un","meaning_en":"to show something to someone","example_fr":"Ils nous les montrent.","example_en":"They show them to us."},
  {"verb":"montrer","pattern_id":"personal-double:montrer","pattern":"montrer + quelque chose + à quelqu’un","meaning_en":"to show something to someone","example_fr":"Ils vous le montrent.","example_en":"They show it to you all."},
  {"verb":"présenter","pattern_id":"personal-double:présenter","pattern":"présenter + quelque chose + à quelqu’un","meaning_en":"to present something to someone","example_fr":"Ils me le présentent.","example_en":"They present it to me."},
  {"verb":"présenter","pattern_id":"personal-double:présenter","pattern":"présenter + quelque chose + à quelqu’un","meaning_en":"to present something to someone","example_fr":"Ils te la présentent.","example_en":"They present it to you."},
  {"verb":"présenter","pattern_id":"personal-double:présenter","pattern":"présenter + quelque chose + à quelqu’un","meaning_en":"to present something to someone","example_fr":"Ils nous les présentent.","example_en":"They present them to us."},
  {"verb":"présenter","pattern_id":"personal-double:présenter","pattern":"présenter + quelque chose + à quelqu’un","meaning_en":"to present something to someone","example_fr":"Ils vous le présentent.","example_en":"They present it to you all."},
  {"verb":"expliquer","pattern_id":"personal-double:expliquer","pattern":"expliquer + quelque chose + à quelqu’un","meaning_en":"to explain something to someone","example_fr":"Ils me l'expliquent.","example_en":"They explain it to me."},
  {"verb":"expliquer","pattern_id":"personal-double:expliquer","pattern":"expliquer + quelque chose + à quelqu’un","meaning_en":"to explain something to someone","example_fr":"Ils te l'expliquent.","example_en":"They explain it to you."},
  {"verb":"expliquer","pattern_id":"personal-double:expliquer","pattern":"expliquer + quelque chose + à quelqu’un","meaning_en":"to explain something to someone","example_fr":"Ils nous les expliquent.","example_en":"They explain them to us."},
  {"verb":"expliquer","pattern_id":"personal-double:expliquer","pattern":"expliquer + quelque chose + à quelqu’un","meaning_en":"to explain something to someone","example_fr":"Ils vous l'expliquent.","example_en":"They explain it to you all."},
  {"verb":"raconter","pattern_id":"personal-double:raconter","pattern":"raconter + quelque chose + à quelqu’un","meaning_en":"to tell someone a story or account","example_fr":"Ils me le racontent.","example_en":"They tell me a story or account."},
  {"verb":"raconter","pattern_id":"personal-double:raconter","pattern":"raconter + quelque chose + à quelqu’un","meaning_en":"to tell someone a story or account","example_fr":"Ils te la racontent.","example_en":"They tell you a story or account."},
  {"verb":"raconter","pattern_id":"personal-double:raconter","pattern":"raconter + quelque chose + à quelqu’un","meaning_en":"to tell someone a story or account","example_fr":"Ils nous les racontent.","example_en":"They tell us a story or account."},
  {"verb":"raconter","pattern_id":"personal-double:raconter","pattern":"raconter + quelque chose + à quelqu’un","meaning_en":"to tell someone a story or account","example_fr":"Ils vous le racontent.","example_en":"They tell you all a story or account."},
  {"verb":"dire","pattern_id":"personal-double:dire","pattern":"dire + quelque chose + à quelqu’un","meaning_en":"to tell something to someone","example_fr":"Ils me le disent.","example_en":"They tell it to me."},
  {"verb":"dire","pattern_id":"personal-double:dire","pattern":"dire + quelque chose + à quelqu’un","meaning_en":"to tell something to someone","example_fr":"Ils te la disent.","example_en":"They tell it to you."},
  {"verb":"dire","pattern_id":"personal-double:dire","pattern":"dire + quelque chose + à quelqu’un","meaning_en":"to tell something to someone","example_fr":"Ils nous les disent.","example_en":"They tell them to us."},
  {"verb":"dire","pattern_id":"personal-double:dire","pattern":"dire + quelque chose + à quelqu’un","meaning_en":"to tell something to someone","example_fr":"Ils vous le disent.","example_en":"They tell it to you all."},
  {"verb":"écrire","pattern_id":"personal-double:écrire","pattern":"écrire + quelque chose + à quelqu’un","meaning_en":"to write something to someone","example_fr":"Ils me l'écrivent.","example_en":"They write it to me."},
  {"verb":"écrire","pattern_id":"personal-double:écrire","pattern":"écrire + quelque chose + à quelqu’un","meaning_en":"to write something to someone","example_fr":"Ils te l'écrivent.","example_en":"They write it to you."},
  {"verb":"écrire","pattern_id":"personal-double:écrire","pattern":"écrire + quelque chose + à quelqu’un","meaning_en":"to write something to someone","example_fr":"Ils nous les écrivent.","example_en":"They write them to us."},
  {"verb":"écrire","pattern_id":"personal-double:écrire","pattern":"écrire + quelque chose + à quelqu’un","meaning_en":"to write something to someone","example_fr":"Ils vous l'écrivent.","example_en":"They write it to you all."},
  {"verb":"lire","pattern_id":"personal-double:lire","pattern":"lire + quelque chose + à quelqu’un","meaning_en":"to read something to someone","example_fr":"Ils me le lisent.","example_en":"They read it to me."},
  {"verb":"lire","pattern_id":"personal-double:lire","pattern":"lire + quelque chose + à quelqu’un","meaning_en":"to read something to someone","example_fr":"Ils te la lisent.","example_en":"They read it to you."},
  {"verb":"lire","pattern_id":"personal-double:lire","pattern":"lire + quelque chose + à quelqu’un","meaning_en":"to read something to someone","example_fr":"Ils nous les lisent.","example_en":"They read them to us."},
  {"verb":"lire","pattern_id":"personal-double:lire","pattern":"lire + quelque chose + à quelqu’un","meaning_en":"to read something to someone","example_fr":"Ils vous le lisent.","example_en":"They read it to you all."},
  {"verb":"apprendre","pattern_id":"personal-double:apprendre","pattern":"apprendre + quelque chose + à quelqu’un","meaning_en":"to teach something to someone","example_fr":"Ils me l'apprennent.","example_en":"They teach it to me."},
  {"verb":"apprendre","pattern_id":"personal-double:apprendre","pattern":"apprendre + quelque chose + à quelqu’un","meaning_en":"to teach something to someone","example_fr":"Ils te l'apprennent.","example_en":"They teach it to you."},
  {"verb":"apprendre","pattern_id":"personal-double:apprendre","pattern":"apprendre + quelque chose + à quelqu’un","meaning_en":"to teach something to someone","example_fr":"Ils nous les apprennent.","example_en":"They teach them to us."},
  {"verb":"apprendre","pattern_id":"personal-double:apprendre","pattern":"apprendre + quelque chose + à quelqu’un","meaning_en":"to teach something to someone","example_fr":"Ils vous l'apprennent.","example_en":"They teach it to you all."},
  {"verb":"enseigner","pattern_id":"personal-double:enseigner","pattern":"enseigner + quelque chose + à quelqu’un","meaning_en":"to teach something to someone","example_fr":"Ils me l'enseignent.","example_en":"They teach it to me."},
  {"verb":"enseigner","pattern_id":"personal-double:enseigner","pattern":"enseigner + quelque chose + à quelqu’un","meaning_en":"to teach something to someone","example_fr":"Ils te l'enseignent.","example_en":"They teach it to you."},
  {"verb":"enseigner","pattern_id":"personal-double:enseigner","pattern":"enseigner + quelque chose + à quelqu’un","meaning_en":"to teach something to someone","example_fr":"Ils nous les enseignent.","example_en":"They teach them to us."},
  {"verb":"enseigner","pattern_id":"personal-double:enseigner","pattern":"enseigner + quelque chose + à quelqu’un","meaning_en":"to teach something to someone","example_fr":"Ils vous l'enseignent.","example_en":"They teach it to you all."},
  {"verb":"annoncer","pattern_id":"personal-double:annoncer","pattern":"annoncer + quelque chose + à quelqu’un","meaning_en":"to announce something to someone","example_fr":"Ils me l'annoncent.","example_en":"They announce it to me."},
  {"verb":"annoncer","pattern_id":"personal-double:annoncer","pattern":"annoncer + quelque chose + à quelqu’un","meaning_en":"to announce something to someone","example_fr":"Ils te l'annoncent.","example_en":"They announce it to you."},
  {"verb":"annoncer","pattern_id":"personal-double:annoncer","pattern":"annoncer + quelque chose + à quelqu’un","meaning_en":"to announce something to someone","example_fr":"Ils nous les annoncent.","example_en":"They announce them to us."},
  {"verb":"annoncer","pattern_id":"personal-double:annoncer","pattern":"annoncer + quelque chose + à quelqu’un","meaning_en":"to announce something to someone","example_fr":"Ils vous l'annoncent.","example_en":"They announce it to you all."},
  {"verb":"proposer","pattern_id":"personal-double:proposer","pattern":"proposer + quelque chose + à quelqu’un","meaning_en":"to propose something to someone","example_fr":"Ils me le proposent.","example_en":"They propose it to me."},
  {"verb":"proposer","pattern_id":"personal-double:proposer","pattern":"proposer + quelque chose + à quelqu’un","meaning_en":"to propose something to someone","example_fr":"Ils te la proposent.","example_en":"They propose it to you."},
  {"verb":"proposer","pattern_id":"personal-double:proposer","pattern":"proposer + quelque chose + à quelqu’un","meaning_en":"to propose something to someone","example_fr":"Ils nous les proposent.","example_en":"They propose them to us."},
  {"verb":"proposer","pattern_id":"personal-double:proposer","pattern":"proposer + quelque chose + à quelqu’un","meaning_en":"to propose something to someone","example_fr":"Ils vous le proposent.","example_en":"They propose it to you all."},
  {"verb":"promettre","pattern_id":"personal-double:promettre","pattern":"promettre + quelque chose + à quelqu’un","meaning_en":"to promise something to someone","example_fr":"Ils me le promettent.","example_en":"They promise it to me."},
  {"verb":"promettre","pattern_id":"personal-double:promettre","pattern":"promettre + quelque chose + à quelqu’un","meaning_en":"to promise something to someone","example_fr":"Ils te la promettent.","example_en":"They promise it to you."},
  {"verb":"promettre","pattern_id":"personal-double:promettre","pattern":"promettre + quelque chose + à quelqu’un","meaning_en":"to promise something to someone","example_fr":"Ils nous les promettent.","example_en":"They promise them to us."},
  {"verb":"promettre","pattern_id":"personal-double:promettre","pattern":"promettre + quelque chose + à quelqu’un","meaning_en":"to promise something to someone","example_fr":"Ils vous le promettent.","example_en":"They promise it to you all."},
  {"verb":"demander","pattern_id":"personal-double:demander","pattern":"demander + quelque chose + à quelqu’un","meaning_en":"to ask someone for something","example_fr":"Ils me le demandent.","example_en":"They ask me for it."},
  {"verb":"demander","pattern_id":"personal-double:demander","pattern":"demander + quelque chose + à quelqu’un","meaning_en":"to ask someone for something","example_fr":"Ils te la demandent.","example_en":"They ask you for it."},
  {"verb":"demander","pattern_id":"personal-double:demander","pattern":"demander + quelque chose + à quelqu’un","meaning_en":"to ask someone for something","example_fr":"Ils nous les demandent.","example_en":"They ask us for them."},
  {"verb":"demander","pattern_id":"personal-double:demander","pattern":"demander + quelque chose + à quelqu’un","meaning_en":"to ask someone for something","example_fr":"Ils vous le demandent.","example_en":"They ask you all for it."},
  {"verb":"répondre","pattern_id":"personal-double:répondre","pattern":"répondre + quelque chose + à quelqu’un","meaning_en":"to give someone an answer","example_fr":"Ils me le répondent.","example_en":"They give me an answer."},
  {"verb":"répondre","pattern_id":"personal-double:répondre","pattern":"répondre + quelque chose + à quelqu’un","meaning_en":"to give someone an answer","example_fr":"Ils te la répondent.","example_en":"They give you an answer."},
  {"verb":"répondre","pattern_id":"personal-double:répondre","pattern":"répondre + quelque chose + à quelqu’un","meaning_en":"to give someone an answer","example_fr":"Ils nous les répondent.","example_en":"They give us an answer."},
  {"verb":"répondre","pattern_id":"personal-double:répondre","pattern":"répondre + quelque chose + à quelqu’un","meaning_en":"to give someone an answer","example_fr":"Ils vous le répondent.","example_en":"They give you all an answer."},
  {"verb":"rappeler","pattern_id":"personal-double:rappeler","pattern":"rappeler + quelque chose + à quelqu’un","meaning_en":"to remind someone of something","example_fr":"Ils me le rappellent.","example_en":"They remind me of it."},
  {"verb":"rappeler","pattern_id":"personal-double:rappeler","pattern":"rappeler + quelque chose + à quelqu’un","meaning_en":"to remind someone of something","example_fr":"Ils te la rappellent.","example_en":"They remind you of it."},
  {"verb":"rappeler","pattern_id":"personal-double:rappeler","pattern":"rappeler + quelque chose + à quelqu’un","meaning_en":"to remind someone of something","example_fr":"Ils nous les rappellent.","example_en":"They remind us of them."},
  {"verb":"rappeler","pattern_id":"personal-double:rappeler","pattern":"rappeler + quelque chose + à quelqu’un","meaning_en":"to remind someone of something","example_fr":"Ils vous le rappellent.","example_en":"They remind you all of it."},
  {"verb":"recommander","pattern_id":"personal-double:recommander","pattern":"recommander + quelque chose + à quelqu’un","meaning_en":"to recommend something to someone","example_fr":"Ils me le recommandent.","example_en":"They recommend it to me."},
  {"verb":"recommander","pattern_id":"personal-double:recommander","pattern":"recommander + quelque chose + à quelqu’un","meaning_en":"to recommend something to someone","example_fr":"Ils te la recommandent.","example_en":"They recommend it to you."},
  {"verb":"recommander","pattern_id":"personal-double:recommander","pattern":"recommander + quelque chose + à quelqu’un","meaning_en":"to recommend something to someone","example_fr":"Ils nous les recommandent.","example_en":"They recommend them to us."},
  {"verb":"recommander","pattern_id":"personal-double:recommander","pattern":"recommander + quelque chose + à quelqu’un","meaning_en":"to recommend something to someone","example_fr":"Ils vous le recommandent.","example_en":"They recommend it to you all."},
  {"verb":"conseiller","pattern_id":"personal-double:conseiller","pattern":"conseiller + quelque chose + à quelqu’un","meaning_en":"to recommend something to someone","example_fr":"Ils me le conseillent.","example_en":"They recommend it to me."},
  {"verb":"conseiller","pattern_id":"personal-double:conseiller","pattern":"conseiller + quelque chose + à quelqu’un","meaning_en":"to recommend something to someone","example_fr":"Ils te la conseillent.","example_en":"They recommend it to you."},
  {"verb":"conseiller","pattern_id":"personal-double:conseiller","pattern":"conseiller + quelque chose + à quelqu’un","meaning_en":"to recommend something to someone","example_fr":"Ils nous les conseillent.","example_en":"They recommend them to us."},
  {"verb":"conseiller","pattern_id":"personal-double:conseiller","pattern":"conseiller + quelque chose + à quelqu’un","meaning_en":"to recommend something to someone","example_fr":"Ils vous le conseillent.","example_en":"They recommend it to you all."},
  {"verb":"interdire","pattern_id":"personal-double:interdire","pattern":"interdire + quelque chose + à quelqu’un","meaning_en":"to forbid something to someone","example_fr":"Ils me l'interdisent.","example_en":"They forbid it to me."},
  {"verb":"interdire","pattern_id":"personal-double:interdire","pattern":"interdire + quelque chose + à quelqu’un","meaning_en":"to forbid something to someone","example_fr":"Ils te l'interdisent.","example_en":"They forbid it to you."},
  {"verb":"interdire","pattern_id":"personal-double:interdire","pattern":"interdire + quelque chose + à quelqu’un","meaning_en":"to forbid something to someone","example_fr":"Ils nous les interdisent.","example_en":"They forbid them to us."},
  {"verb":"interdire","pattern_id":"personal-double:interdire","pattern":"interdire + quelque chose + à quelqu’un","meaning_en":"to forbid something to someone","example_fr":"Ils vous l'interdisent.","example_en":"They forbid it to you all."},
  {"verb":"permettre","pattern_id":"personal-double:permettre","pattern":"permettre + quelque chose + à quelqu’un","meaning_en":"to allow something to someone","example_fr":"Ils me le permettent.","example_en":"They allow it to me."},
  {"verb":"permettre","pattern_id":"personal-double:permettre","pattern":"permettre + quelque chose + à quelqu’un","meaning_en":"to allow something to someone","example_fr":"Ils te la permettent.","example_en":"They allow it to you."},
  {"verb":"permettre","pattern_id":"personal-double:permettre","pattern":"permettre + quelque chose + à quelqu’un","meaning_en":"to allow something to someone","example_fr":"Ils nous les permettent.","example_en":"They allow them to us."},
  {"verb":"permettre","pattern_id":"personal-double:permettre","pattern":"permettre + quelque chose + à quelqu’un","meaning_en":"to allow something to someone","example_fr":"Ils vous le permettent.","example_en":"They allow it to you all."},
  {"verb":"refuser","pattern_id":"personal-double:refuser","pattern":"refuser + quelque chose + à quelqu’un","meaning_en":"to refuse someone something","example_fr":"Ils me le refusent.","example_en":"They refuse me it."},
  {"verb":"refuser","pattern_id":"personal-double:refuser","pattern":"refuser + quelque chose + à quelqu’un","meaning_en":"to refuse someone something","example_fr":"Ils te la refusent.","example_en":"They refuse you it."},
  {"verb":"refuser","pattern_id":"personal-double:refuser","pattern":"refuser + quelque chose + à quelqu’un","meaning_en":"to refuse someone something","example_fr":"Ils nous les refusent.","example_en":"They refuse us them."},
  {"verb":"refuser","pattern_id":"personal-double:refuser","pattern":"refuser + quelque chose + à quelqu’un","meaning_en":"to refuse someone something","example_fr":"Ils vous le refusent.","example_en":"They refuse you all it."},
  {"verb":"accorder","pattern_id":"personal-double:accorder","pattern":"accorder + quelque chose + à quelqu’un","meaning_en":"to grant something to someone","example_fr":"Ils me l'accordent.","example_en":"They grant it to me."},
  {"verb":"accorder","pattern_id":"personal-double:accorder","pattern":"accorder + quelque chose + à quelqu’un","meaning_en":"to grant something to someone","example_fr":"Ils te l'accordent.","example_en":"They grant it to you."},
  {"verb":"accorder","pattern_id":"personal-double:accorder","pattern":"accorder + quelque chose + à quelqu’un","meaning_en":"to grant something to someone","example_fr":"Ils nous les accordent.","example_en":"They grant them to us."},
  {"verb":"accorder","pattern_id":"personal-double:accorder","pattern":"accorder + quelque chose + à quelqu’un","meaning_en":"to grant something to someone","example_fr":"Ils vous l'accordent.","example_en":"They grant it to you all."},
  {"verb":"confier","pattern_id":"personal-double:confier","pattern":"confier + quelque chose + à quelqu’un","meaning_en":"to entrust something to someone","example_fr":"Ils me le confient.","example_en":"They entrust it to me."},
  {"verb":"confier","pattern_id":"personal-double:confier","pattern":"confier + quelque chose + à quelqu’un","meaning_en":"to entrust something to someone","example_fr":"Ils te la confient.","example_en":"They entrust it to you."},
  {"verb":"confier","pattern_id":"personal-double:confier","pattern":"confier + quelque chose + à quelqu’un","meaning_en":"to entrust something to someone","example_fr":"Ils nous les confient.","example_en":"They entrust them to us."},
  {"verb":"confier","pattern_id":"personal-double:confier","pattern":"confier + quelque chose + à quelqu’un","meaning_en":"to entrust something to someone","example_fr":"Ils vous le confient.","example_en":"They entrust it to you all."},
  {"verb":"transmettre","pattern_id":"personal-double:transmettre","pattern":"transmettre + quelque chose + à quelqu’un","meaning_en":"to pass something on to someone","example_fr":"Ils me le transmettent.","example_en":"They pass it on to me."},
  {"verb":"transmettre","pattern_id":"personal-double:transmettre","pattern":"transmettre + quelque chose + à quelqu’un","meaning_en":"to pass something on to someone","example_fr":"Ils te la transmettent.","example_en":"They pass it on to you."},
  {"verb":"transmettre","pattern_id":"personal-double:transmettre","pattern":"transmettre + quelque chose + à quelqu’un","meaning_en":"to pass something on to someone","example_fr":"Ils nous les transmettent.","example_en":"They pass them on to us."},
  {"verb":"transmettre","pattern_id":"personal-double:transmettre","pattern":"transmettre + quelque chose + à quelqu’un","meaning_en":"to pass something on to someone","example_fr":"Ils vous le transmettent.","example_en":"They pass it on to you all."},
  {"verb":"communiquer","pattern_id":"personal-double:communiquer","pattern":"communiquer + quelque chose + à quelqu’un","meaning_en":"to communicate something to someone","example_fr":"Ils me le communiquent.","example_en":"They communicate it to me."},
  {"verb":"communiquer","pattern_id":"personal-double:communiquer","pattern":"communiquer + quelque chose + à quelqu’un","meaning_en":"to communicate something to someone","example_fr":"Ils te la communiquent.","example_en":"They communicate it to you."},
  {"verb":"communiquer","pattern_id":"personal-double:communiquer","pattern":"communiquer + quelque chose + à quelqu’un","meaning_en":"to communicate something to someone","example_fr":"Ils nous les communiquent.","example_en":"They communicate them to us."},
  {"verb":"communiquer","pattern_id":"personal-double:communiquer","pattern":"communiquer + quelque chose + à quelqu’un","meaning_en":"to communicate something to someone","example_fr":"Ils vous le communiquent.","example_en":"They communicate it to you all."},
  {"verb":"remettre","pattern_id":"personal-double:remettre","pattern":"remettre + quelque chose + à quelqu’un","meaning_en":"to hand something to someone","example_fr":"Ils me le remettent.","example_en":"They hand it to me."},
  {"verb":"remettre","pattern_id":"personal-double:remettre","pattern":"remettre + quelque chose + à quelqu’un","meaning_en":"to hand something to someone","example_fr":"Ils te la remettent.","example_en":"They hand it to you."},
  {"verb":"remettre","pattern_id":"personal-double:remettre","pattern":"remettre + quelque chose + à quelqu’un","meaning_en":"to hand something to someone","example_fr":"Ils nous les remettent.","example_en":"They hand them to us."},
  {"verb":"remettre","pattern_id":"personal-double:remettre","pattern":"remettre + quelque chose + à quelqu’un","meaning_en":"to hand something to someone","example_fr":"Ils vous le remettent.","example_en":"They hand it to you all."},
  {"verb":"distribuer","pattern_id":"personal-double:distribuer","pattern":"distribuer + quelque chose + à quelqu’un","meaning_en":"to distribute something to people","example_fr":"Ils me le distribuent.","example_en":"They distribute it to people."},
  {"verb":"distribuer","pattern_id":"personal-double:distribuer","pattern":"distribuer + quelque chose + à quelqu’un","meaning_en":"to distribute something to people","example_fr":"Ils te la distribuent.","example_en":"They distribute it to people."},
  {"verb":"distribuer","pattern_id":"personal-double:distribuer","pattern":"distribuer + quelque chose + à quelqu’un","meaning_en":"to distribute something to people","example_fr":"Ils nous les distribuent.","example_en":"They distribute them to people."},
  {"verb":"distribuer","pattern_id":"personal-double:distribuer","pattern":"distribuer + quelque chose + à quelqu’un","meaning_en":"to distribute something to people","example_fr":"Ils vous le distribuent.","example_en":"They distribute it to people."},
  {"verb":"fournir","pattern_id":"personal-double:fournir","pattern":"fournir + quelque chose + à quelqu’un","meaning_en":"to supply something to someone","example_fr":"Ils me le fournissent.","example_en":"They supply it to me."},
  {"verb":"fournir","pattern_id":"personal-double:fournir","pattern":"fournir + quelque chose + à quelqu’un","meaning_en":"to supply something to someone","example_fr":"Ils te la fournissent.","example_en":"They supply it to you."},
  {"verb":"fournir","pattern_id":"personal-double:fournir","pattern":"fournir + quelque chose + à quelqu’un","meaning_en":"to supply something to someone","example_fr":"Ils nous les fournissent.","example_en":"They supply them to us."},
  {"verb":"fournir","pattern_id":"personal-double:fournir","pattern":"fournir + quelque chose + à quelqu’un","meaning_en":"to supply something to someone","example_fr":"Ils vous le fournissent.","example_en":"They supply it to you all."},
  {"verb":"livrer","pattern_id":"personal-double:livrer","pattern":"livrer + quelque chose + à quelqu’un","meaning_en":"to deliver something to someone","example_fr":"Ils me le livrent.","example_en":"They deliver it to me."},
  {"verb":"livrer","pattern_id":"personal-double:livrer","pattern":"livrer + quelque chose + à quelqu’un","meaning_en":"to deliver something to someone","example_fr":"Ils te la livrent.","example_en":"They deliver it to you."},
  {"verb":"livrer","pattern_id":"personal-double:livrer","pattern":"livrer + quelque chose + à quelqu’un","meaning_en":"to deliver something to someone","example_fr":"Ils nous les livrent.","example_en":"They deliver them to us."},
  {"verb":"livrer","pattern_id":"personal-double:livrer","pattern":"livrer + quelque chose + à quelqu’un","meaning_en":"to deliver something to someone","example_fr":"Ils vous le livrent.","example_en":"They deliver it to you all."},
  {"verb":"servir","pattern_id":"personal-double:servir","pattern":"servir + quelque chose + à quelqu’un","meaning_en":"to serve something to someone","example_fr":"Ils me le servent.","example_en":"They serve it to me."},
  {"verb":"servir","pattern_id":"personal-double:servir","pattern":"servir + quelque chose + à quelqu’un","meaning_en":"to serve something to someone","example_fr":"Ils te la servent.","example_en":"They serve it to you."},
  {"verb":"servir","pattern_id":"personal-double:servir","pattern":"servir + quelque chose + à quelqu’un","meaning_en":"to serve something to someone","example_fr":"Ils nous les servent.","example_en":"They serve them to us."},
  {"verb":"servir","pattern_id":"personal-double:servir","pattern":"servir + quelque chose + à quelqu’un","meaning_en":"to serve something to someone","example_fr":"Ils vous le servent.","example_en":"They serve it to you all."},
  {"verb":"payer","pattern_id":"personal-double:payer","pattern":"payer + quelque chose + à quelqu’un","meaning_en":"to pay someone something","example_fr":"Ils me le paient.","example_en":"They pay me it."},
  {"verb":"payer","pattern_id":"personal-double:payer","pattern":"payer + quelque chose + à quelqu’un","meaning_en":"to pay someone something","example_fr":"Ils te la paient.","example_en":"They pay you it."},
  {"verb":"payer","pattern_id":"personal-double:payer","pattern":"payer + quelque chose + à quelqu’un","meaning_en":"to pay someone something","example_fr":"Ils nous les paient.","example_en":"They pay us them."},
  {"verb":"payer","pattern_id":"personal-double:payer","pattern":"payer + quelque chose + à quelqu’un","meaning_en":"to pay someone something","example_fr":"Ils vous le paient.","example_en":"They pay you all it."},
  {"verb":"voler","pattern_id":"personal-double:voler","pattern":"voler + quelque chose + à quelqu’un","meaning_en":"to steal something from someone","example_fr":"Ils me le volent.","example_en":"They steal it from me."},
  {"verb":"voler","pattern_id":"personal-double:voler","pattern":"voler + quelque chose + à quelqu’un","meaning_en":"to steal something from someone","example_fr":"Ils te la volent.","example_en":"They steal it from you."},
  {"verb":"voler","pattern_id":"personal-double:voler","pattern":"voler + quelque chose + à quelqu’un","meaning_en":"to steal something from someone","example_fr":"Ils nous les volent.","example_en":"They steal them from us."},
  {"verb":"voler","pattern_id":"personal-double:voler","pattern":"voler + quelque chose + à quelqu’un","meaning_en":"to steal something from someone","example_fr":"Ils vous le volent.","example_en":"They steal it from you all."},
  {"verb":"enlever","pattern_id":"personal-double:enlever","pattern":"enlever + quelque chose + à quelqu’un","meaning_en":"to take something off someone","example_fr":"Ils me l'enlèvent.","example_en":"They take it off me."},
  {"verb":"enlever","pattern_id":"personal-double:enlever","pattern":"enlever + quelque chose + à quelqu’un","meaning_en":"to take something off someone","example_fr":"Ils te l'enlèvent.","example_en":"They take it off you."},
  {"verb":"enlever","pattern_id":"personal-double:enlever","pattern":"enlever + quelque chose + à quelqu’un","meaning_en":"to take something off someone","example_fr":"Ils nous les enlèvent.","example_en":"They take them off us."},
  {"verb":"enlever","pattern_id":"personal-double:enlever","pattern":"enlever + quelque chose + à quelqu’un","meaning_en":"to take something off someone","example_fr":"Ils vous l'enlèvent.","example_en":"They take it off you all."},
  {"verb":"retirer","pattern_id":"personal-double:retirer","pattern":"retirer + quelque chose + à quelqu’un","meaning_en":"to take something away from someone","example_fr":"Ils me le retirent.","example_en":"They take it away from me."},
  {"verb":"retirer","pattern_id":"personal-double:retirer","pattern":"retirer + quelque chose + à quelqu’un","meaning_en":"to take something away from someone","example_fr":"Ils te la retirent.","example_en":"They take it away from you."},
  {"verb":"retirer","pattern_id":"personal-double:retirer","pattern":"retirer + quelque chose + à quelqu’un","meaning_en":"to take something away from someone","example_fr":"Ils nous les retirent.","example_en":"They take them away from us."},
  {"verb":"retirer","pattern_id":"personal-double:retirer","pattern":"retirer + quelque chose + à quelqu’un","meaning_en":"to take something away from someone","example_fr":"Ils vous le retirent.","example_en":"They take it away from you all."},
  {"verb":"emprunter","pattern_id":"personal-double:emprunter","pattern":"emprunter + quelque chose + à quelqu’un","meaning_en":"to borrow something from someone","example_fr":"Ils me l'empruntent.","example_en":"They borrow it from me."},
  {"verb":"emprunter","pattern_id":"personal-double:emprunter","pattern":"emprunter + quelque chose + à quelqu’un","meaning_en":"to borrow something from someone","example_fr":"Ils te l'empruntent.","example_en":"They borrow it from you."},
  {"verb":"emprunter","pattern_id":"personal-double:emprunter","pattern":"emprunter + quelque chose + à quelqu’un","meaning_en":"to borrow something from someone","example_fr":"Ils nous les empruntent.","example_en":"They borrow them from us."},
  {"verb":"emprunter","pattern_id":"personal-double:emprunter","pattern":"emprunter + quelque chose + à quelqu’un","meaning_en":"to borrow something from someone","example_fr":"Ils vous l'empruntent.","example_en":"They borrow it from you all."},
  {"verb":"réserver","pattern_id":"personal-double:réserver","pattern":"réserver + quelque chose + à quelqu’un","meaning_en":"to reserve something for someone","example_fr":"Ils me le réservent.","example_en":"They reserve it for me."},
  {"verb":"réserver","pattern_id":"personal-double:réserver","pattern":"réserver + quelque chose + à quelqu’un","meaning_en":"to reserve something for someone","example_fr":"Ils te la réservent.","example_en":"They reserve it for you."},
  {"verb":"réserver","pattern_id":"personal-double:réserver","pattern":"réserver + quelque chose + à quelqu’un","meaning_en":"to reserve something for someone","example_fr":"Ils nous les réservent.","example_en":"They reserve them for us."},
  {"verb":"réserver","pattern_id":"personal-double:réserver","pattern":"réserver + quelque chose + à quelqu’un","meaning_en":"to reserve something for someone","example_fr":"Ils vous le réservent.","example_en":"They reserve it for you all."},
  {"verb":"préparer","pattern_id":"personal-double:préparer","pattern":"préparer + quelque chose + à quelqu’un","meaning_en":"to prepare something for someone","example_fr":"Ils me le préparent.","example_en":"They prepare it for me."},
  {"verb":"préparer","pattern_id":"personal-double:préparer","pattern":"préparer + quelque chose + à quelqu’un","meaning_en":"to prepare something for someone","example_fr":"Ils te la préparent.","example_en":"They prepare it for you."},
  {"verb":"préparer","pattern_id":"personal-double:préparer","pattern":"préparer + quelque chose + à quelqu’un","meaning_en":"to prepare something for someone","example_fr":"Ils nous les préparent.","example_en":"They prepare them for us."},
  {"verb":"préparer","pattern_id":"personal-double:préparer","pattern":"préparer + quelque chose + à quelqu’un","meaning_en":"to prepare something for someone","example_fr":"Ils vous le préparent.","example_en":"They prepare it for you all."}
 ];
 function personalUsageEntries(verb) {return personalExamples.filter(e=>e.verb===verb);}
 function personalReference(card,index=0) {
  if(!personalIndices(card).includes(index)||card.reference)return null;
  const lang=personalConfig.lang,v=card.verb.infinitive,indirect=!!personalConfig.indirect[v],i=index%4;
  const normalized=lang==='fr'&&window.handleLanguageSpecificLastChange?window.handleLanguageSpecificLastChange(card.pronoun,card.conjugated):card.conjugated;
  let body=String(normalized||'').replace(lang==='fr'?/^j['’]|^(?:je|tu|il|elle|on|nous|vous|ils|elles)\s+/u:lang==='es'?/^(?:yo|tú|él|ella|usted|nosotros|nosotras|vosotros|vosotras|ellos|ellas|ustedes)\s+/u:/^(?:jo|tu|ell|ella|nosaltres|vosaltres|ells|elles)\s+/u,'');
  if(!body||body==='—')return null;
  const compound=lang==='fr'&&['passeCompose','plusQueParfait'].includes(card.tense);
  if(compound&&!indirect)body=body.replace(/\S+$/u,p=>{let agreed=p+(index>=4&&!p.endsWith('e')?'e':'');return agreed+(i>=2&&!agreed.endsWith('s')?'s':'');});
  let object=personalConfig.clitics[i];
  if(lang!=='es'&&i<2&&/^h?[aàâäeéèêëiîïoôöuùûüyœ]/iu.test(body))object=i===0?"m'":"t'";
  let cue=personalConfig.cues[i];
  if(compound&&!indirect)cue+=' ('+(index>=4?'fém.':'masc.')+')';
  if(indirect||lang!=='fr')cue=(lang==='fr'?'à ':'a ')+cue;
  const answer=card.pronoun.split('/')[0]+' '+object+(object.endsWith("'")?'':' ')+body;
  return {...card,verb:{...card.verb,translation:'to '+(personalConfig.indirect[v]||personalConfig.direct[v])+' someone'},conjugated:answer,_practiceAnswer:answer,reference:cue,referenceLabel:v+(indirect?(lang==='fr'?' à':' a'):''),personalPronoun:true};
 }
 function randomPersonal(card) {
  const choices=personalIndices(card);return choices.length?personalReference(card,choices[Math.floor(Math.random()*choices.length)]):null;
 }

 const doubleVerbs = doubleExamples.map(row => row[0]);
  for (const verb of ['donner', 'montrer', 'apporter', 'envoyer', 'prêter', 'expliquer', 'raconter', 'rendre']) if (!specs[verb]) specs[verb] = { type: 'direct' };
  const doubleTenses = ['present', 'imparfait', 'futurSimple', 'conditionnelPresent', 'subjonctifPresent', 'passeCompose', 'plusQueParfait'];

 function doubleUsageEntries(verb) {
  const row = doubleExamples.find(row => row[0] === verb);
  if (!row) return [];
  return [0, 1].map(i => ({verb, pattern_id: 'double-pronoun:' + verb,
   pattern: verb + " + quelque chose + à quelqu’un", meaning_en: row[1], example_fr: row[2+i], example_en: row[4+i],
   source: 'editorial:double-pronouns'}));
 }
 function randomRecipient(card) {
  const choices=[0,1,2,3,...personalIndices(card,true).map(i=>i+4)];
  return choices[Math.floor(Math.random()*choices.length)];
 }
 function doubleReference(card, objectIndex = 0, recipientIndex = 0) {
    if (!doubleVerbs.includes(card?.verb?.infinitive) || !doubleTenses.includes(card.tense) || card.reference) return null;
    const pi=recipientIndex-4;
    if(pi>=0&&!personalAllowed(card,pi))return null;
    const objectCue = things[objectIndex % things.length], recipient = pi>=0?personalConfig.cues[pi]:people[recipientIndex % people.length];
    const subject = card.pronoun.split('/')[0];
    const normalized = window.handleLanguageSpecificLastChange ? window.handleLanguageSpecificLastChange(card.pronoun, card.conjugated) : card.conjugated;
    let body = normalized.replace(/^j['’]|^(?:je|tu|il|elle|on|nous|vous|ils|elles)\s+/u, '');
    if (!body || body === '—') return null;
    const direct = objectCue === 'ce truc' ? 'le' : objectCue === 'cette chose' ? 'la' : 'les';
    if (['passeCompose', 'plusQueParfait'].includes(card.tense) && objectCue !== 'ce truc') {
      body = body.replace(/\S+$/u, p => p + (p.endsWith('e') ? '' : 'e') + (objectCue === 'ces choses' ? 's' : ''));
    }
    const indirect = recipient.startsWith('ces ') ? 'leur' : 'lui';
    const personal=pi>=0?personalConfig.clitics[pi]:null;
    const vowel=/^h?[aàâäeéèêëiîïoôöuùûüyœ]/iu.test(body);
    const d=personal&&direct!=='les'&&vowel?"l'":direct;
    const cluster=personal?personal+' '+d:direct+' '+indirect;
    const answer = subject + ' ' + cluster + (cluster.endsWith("'")?'':' ') + body;
    const references = [objectCue, 'à ' + recipient];
    return { ...card, verb: {...card.verb, translation: doubleExamples.find(row => row[0] === card.verb.infinitive)[1]}, conjugated: answer, reference: references.join(' + '), references, referenceLabel: card.verb.infinitive, doublePronoun: true };
  }
  function controls(container, options, onChange) {
    const label = document.createElement('label'); label.className = 'reference-count-control';
    label.textContent = 'Pronouns per answer ';
    const select = document.createElement('select'); select.setAttribute('aria-label', 'Pronouns per answer');
    for (const [value, text] of [['one','One'],['two','Two'],['mixed','Mixed']]) select.add(new Option(text,value));
    select.value = options.referenceObjects || 'mixed';
    select.onchange = () => { options.referenceObjects = select.value; onChange(); };
    label.append(select); container.append(label);
  }
  function referencesFor(verb) {
    const spec = specs[verb];
    if (!spec) return [];
    if (spec.place) return ['cet endroit'];
    if (spec.type === 'indirect') return people;
    return spec.people ? [...things, ...people] : things;
  }
  function prepare(card, reference) {
    const spec = specs[card?.verb?.infinitive];
    if (!card || card.isFrameCard || card.isPhraseMode || card.reference) return card;
    const mode = window.cardGenerationOptions?.referenceObjects || 'mixed';
    if (!reference && (mode === 'two' || (mode === 'mixed' && (!spec || Math.random() < .35)))) {
      const dual = doubleReference(card, Math.floor(Math.random()*3), randomRecipient(card));
      if (dual) return dual;
    }
    if (!reference && (!spec || Math.random()<.5)) { const personal=randomPersonal(card); if(personal)return personal; }
    if (!spec) return card;
    const references = referencesFor(card.verb.infinitive);
    reference = references.includes(reference) ? reference : references[Math.floor(Math.random() * references.length)];
    const subject = card.pronoun.split('/')[0];
    const normalized = window.handleLanguageSpecificLastChange
      ? window.handleLanguageSpecificLastChange(card.pronoun, card.conjugated) : card.conjugated;
    let body = normalized.replace(/^j['’]|^(?:je|tu|il|elle|on|nous|vous|ils|elles)\s+/u, '');
    if (spec.strip) {
      if (!body.endsWith(spec.strip)) throw new Error(`Unexpected reference complement: ${card.verb.infinitive}`);
      body = body.slice(0, -spec.strip.length);
    }
    const person = people.includes(reference);
    let object = person ? (reference.startsWith('ces ') ? 'leur' : 'lui') : spec.type;
    if (spec.type === 'direct') {
      object = reference === 'ce truc' ? 'le' : reference === 'cette chose' ? 'la' : 'les';
      if (['passeCompose', 'plusQueParfait'].includes(card.tense) && reference !== 'ce truc') {
        body = body.replace(/\S+$/u, participle => participle + (participle.endsWith('e') ? '' : 'e') + (reference === 'ces choses' ? 's' : ''));
      }
      if (object !== 'les' && /^[aàâäeéèêëiîïoôöuùûüyœ]/iu.test(body)) object = "l'";
    }
    const tonic = person && spec.peopleType === 'tonic';
    const tonicPronouns = { 'cet homme': 'lui', 'cette femme': 'elle', 'ces hommes': 'eux', 'ces femmes': 'elles' };
    let predicate = tonic ? body + ' à ' + tonicPronouns[reference]
      : object + (object === "l'" ? '' : ' ') + body;
    // Tonic complements follow the complete verb phrase (j'ai pensé à elle).
    const elideSubject = tonic ? /^[aàâäeéèêëiîïoôöuùûüyœ]/iu.test(body) : ['en', 'y'].includes(object);
    const answer = (subject === 'je' && elideSubject ? "j'" : subject + ' ') + predicate;
    return { ...card, conjugated: answer, reference, referenceLabel: (person && spec.peopleLabel) || spec.label || card.verb.infinitive };
  }
  function render(card) {
    const element = document.getElementById('verb-reference');
    if (!element) return;
    element.hidden = !card?.reference;
    element.replaceChildren();
    element.classList.toggle('double-reference', Boolean(card?.doublePronoun));
    if (!card?.reference) return;
    if (card.references) {
      card.references.forEach((text, index) => { const line = document.createElement('strong'); line.textContent = (index ? '👤 ' : '📦 ') + text; element.appendChild(line); });
      element.setAttribute('aria-label', 'Replace both: ' + card.reference); return;
    }
    const icons = { 'ce truc': '📦', 'cette chose': '🔹', 'ces choses': '📦📦', 'cet endroit': '📍', 'cet homme': '👨', 'cette femme': '👩', 'ces hommes': '👨👨', 'ces femmes': '👩👩' };
    const icon = document.createElement('span');
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = icons[card.reference] || (card.personalPronoun?'👤':'📦');
    const value = document.createElement('strong');
    value.textContent = card.reference;
    element.setAttribute('aria-label', 'Reference: ' + card.reference);
    element.append(icon, value);
  }
  window.referenceCards = { specs, prepare, render, referencesFor, doubleReference, doubleVerbs, doubleUsageEntries, personalReference, personalIndices, personalConfig, personalUsageEntries, controls, supports: verb => window.cardGenerationOptions?.referenceObjects === 'two' ? doubleVerbs.includes(verb) : Boolean(specs[verb] || personalConfig.direct[verb] || personalConfig.indirect[verb]) || (window.cardGenerationOptions?.referenceObjects !== 'one' && doubleVerbs.includes(verb)) };
})();
