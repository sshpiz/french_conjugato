const verbs = [
  {
    "infinitive": "être",
    "translation": "be",
    "frequency": "common"
  },
  {
    "infinitive": "avoir",
    "translation": "have",
    "frequency": "common"
  },
  {
    "infinitive": "aller",
    "translation": "go",
    "frequency": "common"
  },
  {
    "infinitive": "faire",
    "translation": "do",
    "frequency": "common"
  },
  {
    "infinitive": "venir",
    "translation": "come",
    "frequency": "common"
  },
  {
    "infinitive": "pouvoir",
    "translation": "power",
    "frequency": "common"
  },
  {
    "infinitive": "vouloir",
    "translation": "want",
    "frequency": "common"
  },
  {
    "infinitive": "savoir",
    "translation": "know",
    "frequency": "common"
  },
  {
    "infinitive": "devoir",
    "translation": "duty",
    "frequency": "common"
  },
  {
    "infinitive": "dire",
    "translation": "say",
    "frequency": "common"
  },
  {
    "infinitive": "voir",
    "translation": "see",
    "frequency": "common"
  },
  {
    "infinitive": "prendre",
    "translation": "take",
    "frequency": "common"
  },
  {
    "infinitive": "mettre",
    "translation": "put",
    "frequency": "common"
  },
  {
    "infinitive": "croire",
    "translation": "think",
    "frequency": "common"
  },
  {
    "infinitive": "parler",
    "translation": "talk",
    "frequency": "common"
  },
  {
    "infinitive": "passer",
    "translation": "pass",
    "frequency": "common"
  },
  {
    "infinitive": "trouver",
    "translation": "find",
    "frequency": "common"
  },
  {
    "infinitive": "donner",
    "translation": "give",
    "frequency": "common"
  },
  {
    "infinitive": "comprendre",
    "translation": "understand",
    "frequency": "common"
  },
  {
    "infinitive": "partir",
    "translation": "go",
    "frequency": "common"
  },
  {
    "infinitive": "demander",
    "translation": "request",
    "frequency": "common"
  },
  {
    "infinitive": "tenir",
    "translation": "hold",
    "frequency": "common"
  },
  {
    "infinitive": "aimer",
    "translation": "love",
    "frequency": "common"
  },
  {
    "infinitive": "penser",
    "translation": "think",
    "frequency": "common"
  },
  {
    "infinitive": "rester",
    "translation": "remain",
    "frequency": "common"
  },
  {
    "infinitive": "manger",
    "translation": "eat",
    "frequency": "common"
  },
  {
    "infinitive": "laisser",
    "translation": "leave",
    "frequency": "common"
  },
  {
    "infinitive": "regarder",
    "translation": "look",
    "frequency": "common"
  },
  {
    "infinitive": "répondre",
    "translation": "reply",
    "frequency": "common"
  },
  {
    "infinitive": "vivre",
    "translation": "live",
    "frequency": "common"
  },
  {
    "infinitive": "chercher",
    "translation": "seek",
    "frequency": "common"
  },
  {
    "infinitive": "sentir",
    "translation": "feel",
    "frequency": "common"
  },
  {
    "infinitive": "entendre",
    "translation": "hear",
    "frequency": "common"
  },
  {
    "infinitive": "attendre",
    "translation": "expect",
    "frequency": "common"
  },
  {
    "infinitive": "sortir",
    "translation": "exit",
    "frequency": "common"
  },
  {
    "infinitive": "connaître",
    "translation": "know",
    "frequency": "common"
  },
  {
    "infinitive": "arriver",
    "translation": "arrive",
    "frequency": "common"
  },
  {
    "infinitive": "ouvrir",
    "translation": "open",
    "frequency": "common"
  },
  {
    "infinitive": "perdre",
    "translation": "lose",
    "frequency": "common"
  },
  {
    "infinitive": "écrire",
    "translation": "write",
    "frequency": "common"
  },
  {
    "infinitive": "devenir",
    "translation": "become",
    "frequency": "common"
  },
  {
    "infinitive": "suivre",
    "translation": "follow",
    "frequency": "common"
  },
  {
    "infinitive": "montrer",
    "translation": "show",
    "frequency": "common"
  },
  {
    "infinitive": "mourir",
    "translation": "die",
    "frequency": "common"
  },
  {
    "infinitive": "appeler",
    "translation": "call",
    "frequency": "common"
  },
  {
    "infinitive": "commencer",
    "translation": "start",
    "frequency": "common"
  },
  {
    "infinitive": "finir",
    "translation": "finish",
    "frequency": "common"
  },
  {
    "infinitive": "servir",
    "translation": "serve",
    "frequency": "common"
  },
  {
    "infinitive": "lire",
    "translation": "read",
    "frequency": "common"
  },
  {
    "infinitive": "travailler",
    "translation": "work",
    "frequency": "less-common"
  },
  {
    "infinitive": "jouer",
    "translation": "play",
    "frequency": "less-common"
  },
  {
    "infinitive": "recevoir",
    "translation": "receive",
    "frequency": "less-common"
  },
  {
    "infinitive": "changer",
    "translation": "change",
    "frequency": "less-common"
  },
  {
    "infinitive": "gagner",
    "translation": "win",
    "frequency": "less-common"
  },
  {
    "infinitive": "boire",
    "translation": "drink",
    "frequency": "less-common"
  },
  {
    "infinitive": "décider",
    "translation": "decide",
    "frequency": "less-common"
  },
  {
    "infinitive": "oublier",
    "translation": "forget",
    "frequency": "less-common"
  },
  {
    "infinitive": "dormir",
    "translation": "sleep",
    "frequency": "less-common"
  },
  {
    "infinitive": "courir",
    "translation": "run",
    "frequency": "less-common"
  },
  {
    "infinitive": "acheter",
    "translation": "buy",
    "frequency": "less-common"
  },
  {
    "infinitive": "payer",
    "translation": "pay",
    "frequency": "less-common"
  },
  {
    "infinitive": "choisir",
    "translation": "choose",
    "frequency": "less-common"
  },
  {
    "infinitive": "essayer",
    "translation": "try",
    "frequency": "less-common"
  },
  {
    "infinitive": "envoyer",
    "translation": "send",
    "frequency": "less-common"
  },
  {
    "infinitive": "rentrer",
    "translation": "return",
    "frequency": "less-common"
  },
  {
    "infinitive": "porter",
    "translation": "wear",
    "frequency": "less-common"
  },
  {
    "infinitive": "marcher",
    "translation": "walk",
    "frequency": "less-common"
  },
  {
    "infinitive": "monter",
    "translation": "mount",
    "frequency": "less-common"
  },
  {
    "infinitive": "aider",
    "translation": "help",
    "frequency": "less-common"
  },
  {
    "infinitive": "tomber",
    "translation": "fall",
    "frequency": "less-common"
  },
  {
    "infinitive": "conduire",
    "translation": "lead",
    "frequency": "less-common"
  },
  {
    "infinitive": "expliquer",
    "translation": "explain",
    "frequency": "less-common"
  },
  {
    "infinitive": "apprendre",
    "translation": "learn",
    "frequency": "less-common"
  },
  {
    "infinitive": "produire",
    "translation": "produce",
    "frequency": "less-common"
  },
  {
    "infinitive": "préparer",
    "translation": "prepare",
    "frequency": "less-common"
  },
  {
    "infinitive": "chanter",
    "translation": "sing",
    "frequency": "less-common"
  },
  {
    "infinitive": "danser",
    "translation": "dance",
    "frequency": "less-common"
  },
  {
    "infinitive": "raconter",
    "translation": "tell",
    "frequency": "less-common"
  },
  {
    "infinitive": "espérer",
    "translation": "hope",
    "frequency": "less-common"
  },
  {
    "infinitive": "offrir",
    "translation": "offer",
    "frequency": "less-common"
  },
  {
    "infinitive": "construire",
    "translation": "build",
    "frequency": "less-common"
  },
  {
    "infinitive": "détruire",
    "translation": "destroy",
    "frequency": "less-common"
  },
  {
    "infinitive": "traduire",
    "translation": "translate",
    "frequency": "less-common"
  },
  {
    "infinitive": "revenir",
    "translation": "return",
    "frequency": "less-common"
  },
  {
    "infinitive": "entrer",
    "translation": "enter",
    "frequency": "less-common"
  },
  {
    "infinitive": "sortir",
    "translation": "exit",
    "frequency": "less-common"
  },
  {
    "infinitive": "naître",
    "translation": "be born",
    "frequency": "less-common"
  },
  {
    "infinitive": "descendre",
    "translation": "descend",
    "frequency": "less-common"
  },
  {
    "infinitive": "plaire",
    "translation": "please",
    "frequency": "less-common"
  },
  {
    "infinitive": "sourire",
    "translation": "smile",
    "frequency": "less-common"
  },
  {
    "infinitive": "rire",
    "translation": "laugh",
    "frequency": "less-common"
  },
  {
    "infinitive": "vendre",
    "translation": "sale",
    "frequency": "less-common"
  },
  {
    "infinitive": "attendre",
    "translation": "expect",
    "frequency": "less-common"
  },
  {
    "infinitive": "permettre",
    "translation": "allow",
    "frequency": "less-common"
  },
  {
    "infinitive": "promettre",
    "translation": "promise",
    "frequency": "less-common"
  },
  {
    "infinitive": "paraître",
    "translation": "appear",
    "frequency": "less-common"
  },
  {
    "infinitive": "disparaître",
    "translation": "disappear",
    "frequency": "less-common"
  },
  {
    "infinitive": "reconnaître",
    "translation": "recognize",
    "frequency": "less-common"
  },
  {
    "infinitive": "battre",
    "translation": "beat",
    "frequency": "less-common"
  },
  {
    "infinitive": "mentir",
    "translation": "lie",
    "frequency": "less-common"
  },
  {
    "infinitive": "partager",
    "translation": "share",
    "frequency": "less-common"
  },
  {
    "infinitive": "protéger",
    "translation": "protect",
    "frequency": "less-common"
  },
  {
    "infinitive": "voyager",
    "translation": "travel",
    "frequency": "less-common"
  },
  {
    "infinitive": "étudier",
    "translation": "study",
    "frequency": "less-common"
  },
  {
    "infinitive": "réussir",
    "translation": "succeed",
    "frequency": "less-common"
  },
  {
    "infinitive": "grandir",
    "translation": "grow",
    "frequency": "less-common"
  },
  {
    "infinitive": "vieillir",
    "translation": "age",
    "frequency": "less-common"
  },
  {
    "infinitive": "rougir",
    "translation": "blush",
    "frequency": "less-common"
  },
  {
    "infinitive": "maigrir",
    "translation": "slim",
    "frequency": "less-common"
  },
  {
    "infinitive": "grossir",
    "translation": "enlarge",
    "frequency": "less-common"
  },
  {
    "infinitive": "obéir",
    "translation": "obey",
    "frequency": "less-common"
  },
  {
    "infinitive": "désobéir",
    "translation": "disobey",
    "frequency": "less-common"
  },
  {
    "infinitive": "réfléchir",
    "translation": "think",
    "frequency": "less-common"
  },
  {
    "infinitive": "remplir",
    "translation": "fill",
    "frequency": "less-common"
  },
  {
    "infinitive": "punir",
    "translation": "punish",
    "frequency": "less-common"
  },
  {
    "infinitive": "guérir",
    "translation": "heal",
    "frequency": "less-common"
  },
  {
    "infinitive": "bâtir",
    "translation": "build",
    "frequency": "less-common"
  },
  {
    "infinitive": "nourrir",
    "translation": "feed",
    "frequency": "less-common"
  },
  {
    "infinitive": "avertir",
    "translation": "warn",
    "frequency": "less-common"
  },
  {
    "infinitive": "agir",
    "translation": "act",
    "frequency": "less-common"
  },
  {
    "infinitive": "réagir",
    "translation": "react",
    "frequency": "less-common"
  },
  {
    "infinitive": "saisir",
    "translation": "seize",
    "frequency": "less-common"
  },
  {
    "infinitive": "établir",
    "translation": "establish",
    "frequency": "less-common"
  },
  {
    "infinitive": "investir",
    "translation": "invest",
    "frequency": "less-common"
  },
  {
    "infinitive": "finir",
    "translation": "finish",
    "frequency": "less-common"
  },
  {
    "infinitive": "dormir",
    "translation": "sleep",
    "frequency": "less-common"
  },
  {
    "infinitive": "servir",
    "translation": "serve",
    "frequency": "less-common"
  },
  {
    "infinitive": "sentir",
    "translation": "feel",
    "frequency": "less-common"
  },
  {
    "infinitive": "partir",
    "translation": "go",
    "frequency": "less-common"
  },
  {
    "infinitive": "sortir",
    "translation": "exit",
    "frequency": "less-common"
  },
  {
    "infinitive": "mentir",
    "translation": "lie",
    "frequency": "less-common"
  },
  {
    "infinitive": "courir",
    "translation": "run",
    "frequency": "less-common"
  },
  {
    "infinitive": "mourir",
    "translation": "die",
    "frequency": "less-common"
  },
  {
    "infinitive": "ouvrir",
    "translation": "open",
    "frequency": "less-common"
  },
  {
    "infinitive": "couvrir",
    "translation": "cover",
    "frequency": "less-common"
  },
  {
    "infinitive": "découvrir",
    "translation": "discover",
    "frequency": "less-common"
  },
  {
    "infinitive": "offrir",
    "translation": "offer",
    "frequency": "less-common"
  },
  {
    "infinitive": "souffrir",
    "translation": "suffer",
    "frequency": "less-common"
  },
  {
    "infinitive": "cueillir",
    "translation": "pick",
    "frequency": "less-common"
  },
  {
    "infinitive": "accueillir",
    "translation": "welcome",
    "frequency": "less-common"
  },
  {
    "infinitive": "assaillir",
    "translation": "assail",
    "frequency": "less-common"
  },
  {
    "infinitive": "tressaillir",
    "translation": "start",
    "frequency": "less-common"
  },
  {
    "infinitive": "fuir",
    "translation": "flee",
    "frequency": "less-common"
  },
  {
    "infinitive": "vêtir",
    "translation": "dress",
    "frequency": "less-common"
  },
  {
    "infinitive": "acquérir",
    "translation": "acquire",
    "frequency": "less-common"
  },
  {
    "infinitive": "conquérir",
    "translation": "conquer",
    "frequency": "less-common"
  },
  {
    "infinitive": "bouillir",
    "translation": "boil",
    "frequency": "less-common"
  },
  {
    "infinitive": "faillir",
    "translation": "fail",
    "frequency": "less-common"
  },
  {
    "infinitive": "haïr",
    "translation": "hate",
    "frequency": "less-common"
  },
  {
    "infinitive": "ouïr",
    "translation": "hear",
    "frequency": "less-common"
  },
  {
    "infinitive": "conduire",
    "translation": "lead",
    "frequency": "less-common"
  },
  {
    "infinitive": "traduire",
    "translation": "translate",
    "frequency": "less-common"
  },
  {
    "infinitive": "construire",
    "translation": "build",
    "frequency": "less-common"
  },
  {
    "infinitive": "détruire",
    "translation": "destroy",
    "frequency": "less-common"
  },
  {
    "infinitive": "produire",
    "translation": "produce",
    "frequency": "less-common"
  },
  {
    "infinitive": "réduire",
    "translation": "reduce",
    "frequency": "less-common"
  },
  {
    "infinitive": "séduire",
    "translation": "seduce",
    "frequency": "less-common"
  },
  {
    "infinitive": "introduire",
    "translation": "introduce",
    "frequency": "less-common"
  },
  {
    "infinitive": "cuire",
    "translation": "cook",
    "frequency": "less-common"
  },
  {
    "infinitive": "nuire",
    "translation": "harm",
    "frequency": "less-common"
  },
  {
    "infinitive": "luire",
    "translation": "gleam",
    "frequency": "less-common"
  },
  {
    "infinitive": "joindre",
    "translation": "join",
    "frequency": "less-common"
  },
  {
    "infinitive": "craindre",
    "translation": "fear",
    "frequency": "less-common"
  },
  {
    "infinitive": "peindre",
    "translation": "paint",
    "frequency": "less-common"
  },
  {
    "infinitive": "plaindre",
    "translation": "complain",
    "frequency": "less-common"
  },
  {
    "infinitive": "éteindre",
    "translation": "turn off",
    "frequency": "less-common"
  },
  {
    "infinitive": "atteindre",
    "translation": "achieve",
    "frequency": "less-common"
  },
  {
    "infinitive": "restreindre",
    "translation": "restrict",
    "frequency": "less-common"
  },
  {
    "infinitive": "feindre",
    "translation": "pretend",
    "frequency": "less-common"
  },
  {
    "infinitive": "geindre",
    "translation": "whine",
    "frequency": "less-common"
  },
  {
    "infinitive": "contraindre",
    "translation": "force",
    "frequency": "less-common"
  },
  {
    "infinitive": "résoudre",
    "translation": "solve",
    "frequency": "less-common"
  },
  {
    "infinitive": "absoudre",
    "translation": "absolve",
    "frequency": "less-common"
  },
  {
    "infinitive": "dissoudre",
    "translation": "dissolve",
    "frequency": "less-common"
  },
  {
    "infinitive": "coudre",
    "translation": "sew",
    "frequency": "less-common"
  },
  {
    "infinitive": "moudre",
    "translation": "grind",
    "frequency": "less-common"
  },
  {
    "infinitive": "suivre",
    "translation": "follow",
    "frequency": "less-common"
  },
  {
    "infinitive": "poursuivre",
    "translation": "continue",
    "frequency": "less-common"
  },
  {
    "infinitive": "vivre",
    "translation": "live",
    "frequency": "less-common"
  },
  {
    "infinitive": "survivre",
    "translation": "survive",
    "frequency": "less-common"
  },
  {
    "infinitive": "revivre",
    "translation": "relive",
    "frequency": "less-common"
  },
  {
    "infinitive": "conclure",
    "translation": "conclude",
    "frequency": "less-common"
  },
  {
    "infinitive": "exclure",
    "translation": "exclude",
    "frequency": "less-common"
  },
  {
    "infinitive": "inclure",
    "translation": "include",
    "frequency": "less-common"
  },
  {
    "infinitive": "lire",
    "translation": "read",
    "frequency": "less-common"
  },
  {
    "infinitive": "élire",
    "translation": "elect",
    "frequency": "less-common"
  },
  {
    "infinitive": "relire",
    "translation": "read back",
    "frequency": "less-common"
  },
  {
    "infinitive": "interdire",
    "translation": "ban",
    "frequency": "less-common"
  },
  {
    "infinitive": "prédire",
    "translation": "predict",
    "frequency": "less-common"
  },
  {
    "infinitive": "médire",
    "translation": "backbite",
    "frequency": "less-common"
  },
  {
    "infinitive": "contredire",
    "translation": "contradict",
    "frequency": "less-common"
  },
  {
    "infinitive": "suffire",
    "translation": "suffice",
    "frequency": "less-common"
  },
  {
    "infinitive": "circoncire",
    "translation": "circumcise",
    "frequency": "less-common"
  },
  {
    "infinitive": "rire",
    "translation": "laugh",
    "frequency": "less-common"
  },
  {
    "infinitive": "sourire",
    "translation": "smile",
    "frequency": "less-common"
  },
  {
    "infinitive": "boire",
    "translation": "drink",
    "frequency": "less-common"
  },
  {
    "infinitive": "croire",
    "translation": "think",
    "frequency": "less-common"
  },
  {
    "infinitive": "plaire",
    "translation": "please",
    "frequency": "rare"
  },
  {
    "infinitive": "déplaire",
    "translation": "displease",
    "frequency": "rare"
  },
  {
    "infinitive": "taire",
    "translation": "silence",
    "frequency": "rare"
  },
  {
    "infinitive": "naître",
    "translation": "be born",
    "frequency": "rare"
  },
  {
    "infinitive": "paraître",
    "translation": "appear",
    "frequency": "rare"
  },
  {
    "infinitive": "apparaître",
    "translation": "appear",
    "frequency": "rare"
  },
  {
    "infinitive": "disparaître",
    "translation": "disappear",
    "frequency": "rare"
  },
  {
    "infinitive": "connaître",
    "translation": "know",
    "frequency": "rare"
  },
  {
    "infinitive": "reconnaître",
    "translation": "recognize",
    "frequency": "rare"
  },
  {
    "infinitive": "paître",
    "translation": "graze",
    "frequency": "rare"
  },
  {
    "infinitive": "battre",
    "translation": "beat",
    "frequency": "rare"
  },
  {
    "infinitive": "combattre",
    "translation": "fight",
    "frequency": "rare"
  },
  {
    "infinitive": "abattre",
    "translation": "tear down",
    "frequency": "rare"
  },
  {
    "infinitive": "débattre",
    "translation": "debate",
    "frequency": "rare"
  },
  {
    "infinitive": "mettre",
    "translation": "put",
    "frequency": "rare"
  },
  {
    "infinitive": "admettre",
    "translation": "admit",
    "frequency": "rare"
  },
  {
    "infinitive": "commettre",
    "translation": "commit",
    "frequency": "rare"
  },
  {
    "infinitive": "compromettre",
    "translation": "compromise",
    "frequency": "rare"
  },
  {
    "infinitive": "permettre",
    "translation": "allow",
    "frequency": "rare"
  },
  {
    "infinitive": "promettre",
    "translation": "promise",
    "frequency": "rare"
  },
  {
    "infinitive": "remettre",
    "translation": "return",
    "frequency": "rare"
  },
  {
    "infinitive": "soumettre",
    "translation": "submit",
    "frequency": "rare"
  },
  {
    "infinitive": "transmettre",
    "translation": "transmit",
    "frequency": "rare"
  },
  {
    "infinitive": "prendre",
    "translation": "take",
    "frequency": "rare"
  },
  {
    "infinitive": "apprendre",
    "translation": "learn",
    "frequency": "rare"
  },
  {
    "infinitive": "comprendre",
    "translation": "understand",
    "frequency": "rare"
  },
  {
    "infinitive": "entreprendre",
    "translation": "undertake",
    "frequency": "rare"
  },
  {
    "infinitive": "reprendre",
    "translation": "take",
    "frequency": "rare"
  },
  {
    "infinitive": "surprendre",
    "translation": "surprise",
    "frequency": "rare"
  },
  {
    "infinitive": "résoudre",
    "translation": "solve",
    "frequency": "rare"
  },
  {
    "infinitive": "rompre",
    "translation": "break",
    "frequency": "rare"
  },
  {
    "infinitive": "corrompre",
    "translation": "corrupt",
    "frequency": "rare"
  },
  {
    "infinitive": "interrompre",
    "translation": "interrupt",
    "frequency": "rare"
  },
  {
    "infinitive": "vaincre",
    "translation": "overcome",
    "frequency": "rare"
  },
  {
    "infinitive": "convaincre",
    "translation": "convince",
    "frequency": "rare"
  },
  {
    "infinitive": "suivre",
    "translation": "follow",
    "frequency": "rare"
  },
  {
    "infinitive": "vivre",
    "translation": "live",
    "frequency": "rare"
  },
  {
    "infinitive": "acheter",
    "translation": "buy",
    "frequency": "rare"
  },
  {
    "infinitive": "amener",
    "translation": "bring",
    "frequency": "rare"
  },
  {
    "infinitive": "emmener",
    "translation": "drive",
    "frequency": "rare"
  },
  {
    "infinitive": "enlever",
    "translation": "remove",
    "frequency": "rare"
  },
  {
    "infinitive": "geler",
    "translation": "freeze",
    "frequency": "rare"
  },
  {
    "infinitive": "harceler",
    "translation": "harass",
    "frequency": "rare"
  },
  {
    "infinitive": "lever",
    "translation": "lift",
    "frequency": "rare"
  },
  {
    "infinitive": "mener",
    "translation": "lead",
    "frequency": "rare"
  },
  {
    "infinitive": "peler",
    "translation": "peel",
    "frequency": "rare"
  },
  {
    "infinitive": "peser",
    "translation": "weigh",
    "frequency": "rare"
  },
  {
    "infinitive": "promener",
    "translation": "promenade",
    "frequency": "rare"
  },
  {
    "infinitive": "semer",
    "translation": "sow",
    "frequency": "rare"
  },
  {
    "infinitive": "jeter",
    "translation": "throw",
    "frequency": "rare"
  },
  {
    "infinitive": "appeler",
    "translation": "call",
    "frequency": "rare"
  },
  {
    "infinitive": "épeler",
    "translation": "spell",
    "frequency": "rare"
  },
  {
    "infinitive": "feuilleter",
    "translation": "browse",
    "frequency": "rare"
  },
  {
    "infinitive": "projeter",
    "translation": "project",
    "frequency": "rare"
  },
  {
    "infinitive": "rejeter",
    "translation": "reject",
    "frequency": "rare"
  },
  {
    "infinitive": "renouveler",
    "translation": "renew",
    "frequency": "rare"
  },
  {
    "infinitive": "céder",
    "translation": "yield",
    "frequency": "rare"
  },
  {
    "infinitive": "célébrer",
    "translation": "celebrate",
    "frequency": "rare"
  },
  {
    "infinitive": "compléter",
    "translation": "complete",
    "frequency": "rare"
  },
  {
    "infinitive": "considérer",
    "translation": "consider",
    "frequency": "rare"
  },
  {
    "infinitive": "différer",
    "translation": "differ",
    "frequency": "rare"
  },
  {
    "infinitive": "espérer",
    "translation": "hope",
    "frequency": "rare"
  },
  {
    "infinitive": "exagérer",
    "translation": "exaggerate",
    "frequency": "rare"
  },
  {
    "infinitive": "gérer",
    "translation": "manage",
    "frequency": "rare"
  },
  {
    "infinitive": "inquiéter",
    "translation": "worry",
    "frequency": "rare"
  },
  {
    "infinitive": "modérer",
    "translation": "moderate",
    "frequency": "rare"
  },
  {
    "infinitive": "pénétrer",
    "translation": "penetrate",
    "frequency": "rare"
  },
  {
    "infinitive": "posséder",
    "translation": "have",
    "frequency": "rare"
  },
  {
    "infinitive": "préférer",
    "translation": "prefer",
    "frequency": "rare"
  },
  {
    "infinitive": "protéger",
    "translation": "protect",
    "frequency": "rare"
  },
  {
    "infinitive": "refléter",
    "translation": "reflect",
    "frequency": "rare"
  },
  {
    "infinitive": "répéter",
    "translation": "repeat",
    "frequency": "rare"
  },
  {
    "infinitive": "révéler",
    "translation": "reveal",
    "frequency": "rare"
  },
  {
    "infinitive": "suggérer",
    "translation": "suggest",
    "frequency": "rare"
  },
  {
    "infinitive": "zébrer",
    "translation": "streak",
    "frequency": "rare"
  },
  {
    "infinitive": "nettoyer",
    "translation": "clean",
    "frequency": "rare"
  },
  {
    "infinitive": "appuyer",
    "translation": "support",
    "frequency": "rare"
  },
  {
    "infinitive": "ennuyer",
    "translation": "bore",
    "frequency": "rare"
  },
  {
    "infinitive": "envoyer",
    "translation": "send",
    "frequency": "rare"
  },
  {
    "infinitive": "essayer",
    "translation": "try",
    "frequency": "rare"
  },
  {
    "infinitive": "essuyer",
    "translation": "wipe",
    "frequency": "rare"
  },
  {
    "infinitive": "payer",
    "translation": "pay",
    "frequency": "rare"
  },
  {
    "infinitive": "balayer",
    "translation": "sweep",
    "frequency": "rare"
  },
  {
    "infinitive": "effrayer",
    "translation": "scare",
    "frequency": "rare"
  },
  {
    "infinitive": "aboyer",
    "translation": "bark",
    "frequency": "rare"
  },
  {
    "infinitive": "noyer",
    "translation": "walnut",
    "frequency": "rare"
  },
  {
    "infinitive": "tutoyer",
    "translation": "thou",
    "frequency": "rare"
  },
  {
    "infinitive": "vouvoyer",
    "translation": "address as vous",
    "frequency": "rare"
  },
  {
    "infinitive": "commencer",
    "translation": "start",
    "frequency": "rare"
  },
  {
    "infinitive": "annoncer",
    "translation": "announce",
    "frequency": "rare"
  },
  {
    "infinitive": "avancer",
    "translation": "advance",
    "frequency": "rare"
  },
  {
    "infinitive": "dénoncer",
    "translation": "report",
    "frequency": "rare"
  },
  {
    "infinitive": "divorcer",
    "translation": "divorce",
    "frequency": "rare"
  },
  {
    "infinitive": "effacer",
    "translation": "delete",
    "frequency": "rare"
  },
  {
    "infinitive": "lancer",
    "translation": "launch",
    "frequency": "rare"
  },
  {
    "infinitive": "menacer",
    "translation": "threaten",
    "frequency": "rare"
  },
  {
    "infinitive": "placer",
    "translation": "place",
    "frequency": "rare"
  },
  {
    "infinitive": "prononcer",
    "translation": "pronounce",
    "frequency": "rare"
  },
  {
    "infinitive": "remplacer",
    "translation": "replace",
    "frequency": "rare"
  },
  {
    "infinitive": "renoncer",
    "translation": "renounce",
    "frequency": "rare"
  },
  {
    "infinitive": "manger",
    "translation": "eat",
    "frequency": "rare"
  },
  {
    "infinitive": "arranger",
    "translation": "arrange",
    "frequency": "rare"
  },
  {
    "infinitive": "bouger",
    "translation": "move",
    "frequency": "rare"
  },
  {
    "infinitive": "changer",
    "translation": "change",
    "frequency": "rare"
  },
  {
    "infinitive": "corriger",
    "translation": "correct",
    "frequency": "rare"
  },
  {
    "infinitive": "décourager",
    "translation": "discourage",
    "frequency": "rare"
  },
  {
    "infinitive": "déménager",
    "translation": "move",
    "frequency": "rare"
  },
  {
    "infinitive": "diriger",
    "translation": "direct",
    "frequency": "rare"
  },
  {
    "infinitive": "encourager",
    "translation": "encourage",
    "frequency": "rare"
  },
  {
    "infinitive": "engager",
    "translation": "engage",
    "frequency": "rare"
  },
  {
    "infinitive": "exiger",
    "translation": "require",
    "frequency": "rare"
  },
  {
    "infinitive": "juger",
    "translation": "judge",
    "frequency": "rare"
  },
  {
    "infinitive": "loger",
    "translation": "house",
    "frequency": "rare"
  },
  {
    "infinitive": "mélanger",
    "translation": "mix",
    "frequency": "rare"
  },
  {
    "infinitive": "nager",
    "translation": "swim",
    "frequency": "rare"
  },
  {
    "infinitive": "obliger",
    "translation": "force",
    "frequency": "rare"
  },
  {
    "infinitive": "partager",
    "translation": "share",
    "frequency": "rare"
  },
  {
    "infinitive": "plonger",
    "translation": "dive",
    "frequency": "rare"
  },
  {
    "infinitive": "ranger",
    "translation": "ranger",
    "frequency": "rare"
  },
  {
    "infinitive": "rédiger",
    "translation": "put writing, in good order, in a style clear and appropriate",
    "frequency": "rare"
  },
  {
    "infinitive": "voyager",
    "translation": "travel",
    "frequency": "rare"
  },
  {
    "infinitive": "ajouter",
    "translation": "add",
    "frequency": "rare"
  },
  {
    "infinitive": "durer",
    "translation": "last",
    "frequency": "rare"
  },
  {
    "infinitive": "écouter",
    "translation": "listen to",
    "frequency": "rare"
  },
  {
    "infinitive": "emprunter",
    "translation": "borrow",
    "frequency": "rare"
  },
  {
    "infinitive": "fermer",
    "translation": "close",
    "frequency": "rare"
  },
  {
    "infinitive": "gagner",
    "translation": "win",
    "frequency": "rare"
  },
  {
    "infinitive": "garder",
    "translation": "keep",
    "frequency": "rare"
  },
  {
    "infinitive": "jouer",
    "translation": "play",
    "frequency": "rare"
  },
  {
    "infinitive": "laver",
    "translation": "wash",
    "frequency": "rare"
  },
  {
    "infinitive": "monter",
    "translation": "mount",
    "frequency": "rare"
  },
  {
    "infinitive": "montrer",
    "translation": "show",
    "frequency": "rare"
  },
  {
    "infinitive": "oublier",
    "translation": "forget",
    "frequency": "rare"
  },
  {
    "infinitive": "pardonner",
    "translation": "forgive",
    "frequency": "rare"
  },
  {
    "infinitive": "penser",
    "translation": "think",
    "frequency": "rare"
  },
  {
    "infinitive": "porter",
    "translation": "wear",
    "frequency": "rare"
  },
  {
    "infinitive": "présenter",
    "translation": "present",
    "frequency": "rare"
  },
  {
    "infinitive": "prêter",
    "translation": "lend",
    "frequency": "rare"
  },
  {
    "infinitive": "quitter",
    "translation": "leave",
    "frequency": "rare"
  },
  {
    "infinitive": "raconter",
    "translation": "tell",
    "frequency": "rare"
  },
  {
    "infinitive": "refuser",
    "translation": "refuse",
    "frequency": "rare"
  },
  {
    "infinitive": "regarder",
    "translation": "look",
    "frequency": "rare"
  },
  {
    "infinitive": "rencontrer",
    "translation": "meet",
    "frequency": "rare"
  },
  {
    "infinitive": "rentrer",
    "translation": "return",
    "frequency": "rare"
  },
  {
    "infinitive": "reposer",
    "translation": "rest",
    "frequency": "rare"
  },
  {
    "infinitive": "rêver",
    "translation": "dream",
    "frequency": "rare"
  },
  {
    "infinitive": "saluer",
    "translation": "greet",
    "frequency": "rare"
  },
  {
    "infinitive": "sauter",
    "translation": "jump",
    "frequency": "rare"
  },
  {
    "infinitive": "sembler",
    "translation": "seem",
    "frequency": "rare"
  },
  {
    "infinitive": "signer",
    "translation": "sign",
    "frequency": "rare"
  },
  {
    "infinitive": "téléphoner",
    "translation": "call",
    "frequency": "rare"
  },
  {
    "infinitive": "terminer",
    "translation": "finish",
    "frequency": "rare"
  },
  {
    "infinitive": "travailler",
    "translation": "work",
    "frequency": "rare"
  },
  {
    "infinitive": "traverser",
    "translation": "cross",
    "frequency": "rare"
  },
  {
    "infinitive": "utiliser",
    "translation": "use",
    "frequency": "rare"
  },
  {
    "infinitive": "visiter",
    "translation": "visit",
    "frequency": "rare"
  },
  {
    "infinitive": "voler",
    "translation": "fly",
    "frequency": "rare"
  },
  {
    "infinitive": "accepter",
    "translation": "accept",
    "frequency": "rare"
  },
  {
    "infinitive": "adorer",
    "translation": "worship",
    "frequency": "rare"
  },
  {
    "infinitive": "aider",
    "translation": "help",
    "frequency": "rare"
  },
  {
    "infinitive": "aimer",
    "translation": "love",
    "frequency": "rare"
  },
  {
    "infinitive": "apporter",
    "translation": "bring",
    "frequency": "rare"
  },
  {
    "infinitive": "arrêter",
    "translation": "stop",
    "frequency": "rare"
  },
  {
    "infinitive": "arriver",
    "translation": "arrive",
    "frequency": "rare"
  },
  {
    "infinitive": "chanter",
    "translation": "sing",
    "frequency": "rare"
  },
  {
    "infinitive": "chercher",
    "translation": "seek",
    "frequency": "rare"
  },
  {
    "infinitive": "commander",
    "translation": "order",
    "frequency": "rare"
  },
  {
    "infinitive": "compter",
    "translation": "count",
    "frequency": "rare"
  },
  {
    "infinitive": "conseiller",
    "translation": "advisor",
    "frequency": "rare"
  },
  {
    "infinitive": "continuer",
    "translation": "continue",
    "frequency": "rare"
  },
  {
    "infinitive": "coûter",
    "translation": "cost",
    "frequency": "rare"
  },
  {
    "infinitive": "crier",
    "translation": "shout",
    "frequency": "rare"
  },
  {
    "infinitive": "danser",
    "translation": "dance",
    "frequency": "rare"
  },
  {
    "infinitive": "décider",
    "translation": "decide",
    "frequency": "rare"
  },
  {
    "infinitive": "déjeuner",
    "translation": "lunch",
    "frequency": "rare"
  },
  {
    "infinitive": "demander",
    "translation": "request",
    "frequency": "rare"
  },
  {
    "infinitive": "désirer",
    "translation": "desire",
    "frequency": "rare"
  },
  {
    "infinitive": "détester",
    "translation": "hate",
    "frequency": "rare"
  },
  {
    "infinitive": "dessiner",
    "translation": "draw",
    "frequency": "rare"
  },
  {
    "infinitive": "dîner",
    "translation": "dinner",
    "frequency": "rare"
  },
  {
    "infinitive": "discuter",
    "translation": "discuss",
    "frequency": "rare"
  },
  {
    "infinitive": "entrer",
    "translation": "enter",
    "frequency": "rare"
  },
  {
    "infinitive": "étudier",
    "translation": "study",
    "frequency": "rare"
  },
  {
    "infinitive": "éviter",
    "translation": "avoid",
    "frequency": "rare"
  },
  {
    "infinitive": "excuser",
    "translation": "excuse",
    "frequency": "rare"
  },
  {
    "infinitive": "expliquer",
    "translation": "explain",
    "frequency": "rare"
  },
  {
    "infinitive": "fumer",
    "translation": "smoke",
    "frequency": "rare"
  },
  {
    "infinitive": "habiter",
    "translation": "dwell",
    "frequency": "rare"
  },
  {
    "infinitive": "imaginer",
    "translation": "imagine",
    "frequency": "rare"
  },
  {
    "infinitive": "importer",
    "translation": "import",
    "frequency": "rare"
  },
  {
    "infinitive": "inviter",
    "translation": "invite",
    "frequency": "rare"
  },
  {
    "infinitive": "marcher",
    "translation": "walk",
    "frequency": "rare"
  },
  {
    "infinitive": "noter",
    "translation": "note",
    "frequency": "rare"
  },
  {
    "infinitive": "organiser",
    "translation": "organize",
    "frequency": "rare"
  },
  {
    "infinitive": "paraître",
    "translation": "appear",
    "frequency": "rare"
  },
  {
    "infinitive": "parier",
    "translation": "bet",
    "frequency": "rare"
  },
  {
    "infinitive": "pleurer",
    "translation": "cry",
    "frequency": "rare"
  },
  {
    "infinitive": "poser",
    "translation": "pose",
    "frequency": "rare"
  },
  {
    "infinitive": "pousser",
    "translation": "push",
    "frequency": "rare"
  },
  {
    "infinitive": "préparer",
    "translation": "prepare",
    "frequency": "rare"
  },
  {
    "infinitive": "prier",
    "translation": "pray",
    "frequency": "rare"
  },
  {
    "infinitive": "promener",
    "translation": "promenade",
    "frequency": "rare"
  },
  {
    "infinitive": "rappeler",
    "translation": "remember",
    "frequency": "rare"
  },
  {
    "infinitive": "remercier",
    "translation": "thank",
    "frequency": "rare"
  },
  {
    "infinitive": "respecter",
    "translation": "respect",
    "frequency": "rare"
  },
  {
    "infinitive": "retourner",
    "translation": "return",
    "frequency": "rare"
  },
  {
    "infinitive": "retrouver",
    "translation": "find",
    "frequency": "rare"
  },
  {
    "infinitive": "réveiller",
    "translation": "wake up",
    "frequency": "rare"
  },
  {
    "infinitive": "tomber",
    "translation": "fall",
    "frequency": "rare"
  },
  {
    "infinitive": "toucher",
    "translation": "touch",
    "frequency": "rare"
  },
  {
    "infinitive": "tuer",
    "translation": "kill",
    "frequency": "rare"
  },
  {
    "infinitive": "vérifier",
    "translation": "check",
    "frequency": "rare"
  }
];

const tenses = {
  "present": {
    "être": {
      "je": "suis",
      "tu": "es",
      "il/elle/on": "est",
      "nous": "sommes",
      "vous": "êtes",
      "ils/elles": "sont"
    },
    "avoir": {
      "je": "j'ai",
      "tu": "as",
      "il/elle/on": "a",
      "nous": "avons",
      "vous": "avez",
      "ils/elles": "ont"
    },
    "aller": {
      "je": "vais",
      "tu": "vas",
      "il/elle/on": "va",
      "nous": "allons",
      "vous": "allez",
      "ils/elles": "vont"
    },
    "faire": {
      "je": "fais",
      "tu": "fais",
      "il/elle/on": "fait",
      "nous": "faisons",
      "vous": "faites",
      "ils/elles": "font"
    },
    "venir": {
      "je": "viens",
      "tu": "viens",
      "il/elle/on": "vient",
      "nous": "venons",
      "vous": "venez",
      "ils/elles": "viennent"
    },
    "pouvoir": {
      "je": "peux",
      "tu": "peux",
      "il/elle/on": "peut",
      "nous": "pouvons",
      "vous": "pouvez",
      "ils/elles": "peuvent"
    },
    "vouloir": {
      "je": "veux",
      "tu": "veux",
      "il/elle/on": "veut",
      "nous": "voulons",
      "vous": "voulez",
      "ils/elles": "veulent"
    },
    "savoir": {
      "je": "sais",
      "tu": "sais",
      "il/elle/on": "sait",
      "nous": "savons",
      "vous": "savez",
      "ils/elles": "savent"
    },
    "devoir": {
      "je": "dois",
      "tu": "dois",
      "il/elle/on": "doit",
      "nous": "devons",
      "vous": "devez",
      "ils/elles": "doivent"
    },
    "dire": {
      "je": "dis",
      "tu": "dis",
      "il/elle/on": "dit",
      "nous": "disons",
      "vous": "dites",
      "ils/elles": "disent"
    },
    "voir": {
      "je": "vois",
      "tu": "vois",
      "il/elle/on": "voit",
      "nous": "voyons",
      "vous": "voyez",
      "ils/elles": "voient"
    },
    "prendre": {
      "je": "prends",
      "tu": "prends",
      "il/elle/on": "prend",
      "nous": "prenons",
      "vous": "prenez",
      "ils/elles": "prennent"
    },
    "mettre": {
      "je": "mets",
      "tu": "mets",
      "il/elle/on": "met",
      "nous": "mettons",
      "vous": "mettez",
      "ils/elles": "mettent"
    },
    "croire": {
      "je": "crois",
      "tu": "crois",
      "il/elle/on": "croit",
      "nous": "croyons",
      "vous": "croyez",
      "ils/elles": "croient"
    },
    "parler": {
      "je": "parle",
      "tu": "parles",
      "il/elle/on": "parle",
      "nous": "parlons",
      "vous": "parlez",
      "ils/elles": "parlent"
    },
    "passer": {
      "je": "passe",
      "tu": "passes",
      "il/elle/on": "passe",
      "nous": "passons",
      "vous": "passez",
      "ils/elles": "passent"
    },
    "trouver": {
      "je": "trouve",
      "tu": "trouves",
      "il/elle/on": "trouve",
      "nous": "trouvons",
      "vous": "trouvez",
      "ils/elles": "trouvent"
    },
    "donner": {
      "je": "donne",
      "tu": "donnes",
      "il/elle/on": "donne",
      "nous": "donnons",
      "vous": "donnez",
      "ils/elles": "donnent"
    },
    "comprendre": {
      "je": "comprends",
      "tu": "comprends",
      "il/elle/on": "comprend",
      "nous": "comprenons",
      "vous": "comprenez",
      "ils/elles": "comprennent"
    },
    "partir": {
      "je": "pars",
      "tu": "pars",
      "il/elle/on": "part",
      "nous": "partons",
      "vous": "partez",
      "ils/elles": "partent"
    },
    "demander": {
      "je": "demande",
      "tu": "demandes",
      "il/elle/on": "demande",
      "nous": "demandons",
      "vous": "demandez",
      "ils/elles": "demandent"
    },
    "tenir": {
      "je": "tiens",
      "tu": "tiens",
      "il/elle/on": "tient",
      "nous": "tenons",
      "vous": "tenez",
      "ils/elles": "tiennent"
    },
    "aimer": {
      "je": "j'aime",
      "tu": "aimes",
      "il/elle/on": "aime",
      "nous": "aimons",
      "vous": "aimez",
      "ils/elles": "aiment"
    },
    "penser": {
      "je": "pense",
      "tu": "penses",
      "il/elle/on": "pense",
      "nous": "pensons",
      "vous": "pensez",
      "ils/elles": "pensent"
    },
    "rester": {
      "je": "reste",
      "tu": "restes",
      "il/elle/on": "reste",
      "nous": "restons",
      "vous": "restez",
      "ils/elles": "restent"
    },
    "manger": {
      "je": "mange",
      "tu": "manges",
      "il/elle/on": "mange",
      "nous": "mangeons",
      "vous": "mangez",
      "ils/elles": "mangent"
    },
    "laisser": {
      "je": "laisse",
      "tu": "laisses",
      "il/elle/on": "laisse",
      "nous": "laissons",
      "vous": "laissez",
      "ils/elles": "laissent"
    },
    "regarder": {
      "je": "regarde",
      "tu": "regardes",
      "il/elle/on": "regarde",
      "nous": "regardons",
      "vous": "regardez",
      "ils/elles": "regardent"
    },
    "répondre": {
      "je": "réponds",
      "tu": "réponds",
      "il/elle/on": "répond",
      "nous": "répondons",
      "vous": "répondez",
      "ils/elles": "répondent"
    },
    "vivre": {
      "je": "vis",
      "tu": "vis",
      "il/elle/on": "vit",
      "nous": "vivons",
      "vous": "vivez",
      "ils/elles": "vivent"
    },
    "chercher": {
      "je": "cherche",
      "tu": "cherches",
      "il/elle/on": "cherche",
      "nous": "cherchons",
      "vous": "cherchez",
      "ils/elles": "cherchent"
    },
    "sentir": {
      "je": "sens",
      "tu": "sens",
      "il/elle/on": "sent",
      "nous": "sentons",
      "vous": "sentez",
      "ils/elles": "sentent"
    },
    "entendre": {
      "je": "j'entends",
      "tu": "entends",
      "il/elle/on": "entend",
      "nous": "entendons",
      "vous": "entendez",
      "ils/elles": "entendent"
    },
    "attendre": {
      "je": "j'attends",
      "tu": "attends",
      "il/elle/on": "attend",
      "nous": "attendons",
      "vous": "attendez",
      "ils/elles": "attendent"
    },
    "sortir": {
      "je": "sors",
      "tu": "sors",
      "il/elle/on": "sort",
      "nous": "sortons",
      "vous": "sortez",
      "ils/elles": "sortent"
    },
    "connaître": {
      "je": "connais",
      "tu": "connais",
      "il/elle/on": "connaît",
      "nous": "connaissons",
      "vous": "connaissez",
      "ils/elles": "connaissent"
    },
    "arriver": {
      "je": "j'arrive",
      "tu": "arrives",
      "il/elle/on": "arrive",
      "nous": "arrivons",
      "vous": "arrivez",
      "ils/elles": "arrivent"
    },
    "ouvrir": {
      "je": "j'ouvre",
      "tu": "ouvres",
      "il/elle/on": "ouvre",
      "nous": "ouvrons",
      "vous": "ouvrez",
      "ils/elles": "ouvrent"
    },
    "perdre": {
      "je": "perds",
      "tu": "perds",
      "il/elle/on": "perd",
      "nous": "perdons",
      "vous": "perdez",
      "ils/elles": "perdent"
    },
    "écrire": {
      "je": "j'écris",
      "tu": "écris",
      "il/elle/on": "écrit",
      "nous": "écrivons",
      "vous": "écrivez",
      "ils/elles": "écrivent"
    },
    "devenir": {
      "je": "deviens",
      "tu": "deviens",
      "il/elle/on": "devient",
      "nous": "devenons",
      "vous": "devenez",
      "ils/elles": "deviennent"
    },
    "suivre": {
      "je": "suis",
      "tu": "suis",
      "il/elle/on": "suit",
      "nous": "suivons",
      "vous": "suivez",
      "ils/elles": "suivent"
    },
    "montrer": {
      "je": "montre",
      "tu": "montres",
      "il/elle/on": "montre",
      "nous": "montrons",
      "vous": "montrez",
      "ils/elles": "montrent"
    },
    "mourir": {
      "je": "meurs",
      "tu": "meurs",
      "il/elle/on": "meurt",
      "nous": "mourons",
      "vous": "mourez",
      "ils/elles": "meurent"
    },
    "appeler": {
      "je": "j'appelle",
      "tu": "appelles",
      "il/elle/on": "appelle",
      "nous": "appelons",
      "vous": "appelez",
      "ils/elles": "appellent"
    },
    "commencer": {
      "je": "commence",
      "tu": "commences",
      "il/elle/on": "commence",
      "nous": "commençons",
      "vous": "commencez",
      "ils/elles": "commencent"
    },
    "finir": {
      "je": "finis",
      "tu": "finis",
      "il/elle/on": "finit",
      "nous": "finissons",
      "vous": "finissez",
      "ils/elles": "finissent"
    },
    "servir": {
      "je": "sers",
      "tu": "sers",
      "il/elle/on": "sert",
      "nous": "servons",
      "vous": "servez",
      "ils/elles": "servent"
    },
    "lire": {
      "je": "lis",
      "tu": "lis",
      "il/elle/on": "lit",
      "nous": "lisons",
      "vous": "lisez",
      "ils/elles": "lisent"
    },
    "travailler": {
      "je": "travaille",
      "tu": "travailles",
      "il/elle/on": "travaille",
      "nous": "travaillons",
      "vous": "travaillez",
      "ils/elles": "travaillent"
    },
    "jouer": {
      "je": "joue",
      "tu": "joues",
      "il/elle/on": "joue",
      "nous": "jouons",
      "vous": "jouez",
      "ils/elles": "jouent"
    },
    "recevoir": {
      "je": "reçois",
      "tu": "reçois",
      "il/elle/on": "reçoit",
      "nous": "recevons",
      "vous": "recevez",
      "ils/elles": "reçoivent"
    },
    "changer": {
      "je": "change",
      "tu": "changes",
      "il/elle/on": "change",
      "nous": "changeons",
      "vous": "changez",
      "ils/elles": "changent"
    },
    "gagner": {
      "je": "gagne",
      "tu": "gagnes",
      "il/elle/on": "gagne",
      "nous": "gagnons",
      "vous": "gagnez",
      "ils/elles": "gagnent"
    },
    "boire": {
      "je": "bois",
      "tu": "bois",
      "il/elle/on": "boit",
      "nous": "buvons",
      "vous": "buvez",
      "ils/elles": "boivent"
    },
    "décider": {
      "je": "décide",
      "tu": "décides",
      "il/elle/on": "décide",
      "nous": "décidons",
      "vous": "décidez",
      "ils/elles": "décident"
    },
    "oublier": {
      "je": "j'oublie",
      "tu": "oublies",
      "il/elle/on": "oublie",
      "nous": "oublions",
      "vous": "oubliez",
      "ils/elles": "oublient"
    },
    "dormir": {
      "je": "dors",
      "tu": "dors",
      "il/elle/on": "dort",
      "nous": "dormons",
      "vous": "dormez",
      "ils/elles": "dorment"
    },
    "courir": {
      "je": "cours",
      "tu": "cours",
      "il/elle/on": "court",
      "nous": "courons",
      "vous": "courez",
      "ils/elles": "courent"
    },
    "acheter": {
      "je": "j'achète",
      "tu": "achètes",
      "il/elle/on": "achète",
      "nous": "achetons",
      "vous": "achetez",
      "ils/elles": "achètent"
    },
    "payer": {
      "je": "paie",
      "tu": "paies",
      "il/elle/on": "paie",
      "nous": "payons",
      "vous": "payez",
      "ils/elles": "paient"
    },
    "choisir": {
      "je": "choisis",
      "tu": "choisis",
      "il/elle/on": "choisit",
      "nous": "choisissons",
      "vous": "choisissez",
      "ils/elles": "choisissent"
    },
    "essayer": {
      "je": "j'essaie",
      "tu": "essaies",
      "il/elle/on": "essaie",
      "nous": "essayons",
      "vous": "essayez",
      "ils/elles": "essaient"
    },
    "envoyer": {
      "je": "j'envoie",
      "tu": "envoies",
      "il/elle/on": "envoie",
      "nous": "envoyons",
      "vous": "envoyez",
      "ils/elles": "envoient"
    },
    "rentrer": {
      "je": "rentre",
      "tu": "rentres",
      "il/elle/on": "rentre",
      "nous": "rentrons",
      "vous": "rentrez",
      "ils/elles": "rentrent"
    },
    "porter": {
      "je": "porte",
      "tu": "portes",
      "il/elle/on": "porte",
      "nous": "portons",
      "vous": "portez",
      "ils/elles": "portent"
    },
    "marcher": {
      "je": "marche",
      "tu": "marches",
      "il/elle/on": "marche",
      "nous": "marchons",
      "vous": "marchez",
      "ils/elles": "marchent"
    },
    "monter": {
      "je": "monte",
      "tu": "montes",
      "il/elle/on": "monte",
      "nous": "montons",
      "vous": "montez",
      "ils/elles": "montent"
    },
    "aider": {
      "je": "j'aide",
      "tu": "aides",
      "il/elle/on": "aide",
      "nous": "aidons",
      "vous": "aidez",
      "ils/elles": "aident"
    },
    "tomber": {
      "je": "tombe",
      "tu": "tombes",
      "il/elle/on": "tombe",
      "nous": "tombons",
      "vous": "tombez",
      "ils/elles": "tombent"
    },
    "conduire": {
      "je": "conduis",
      "tu": "conduis",
      "il/elle/on": "conduit",
      "nous": "conduisons",
      "vous": "conduisez",
      "ils/elles": "conduisent"
    },
    "expliquer": {
      "je": "j'explique",
      "tu": "expliques",
      "il/elle/on": "explique",
      "nous": "expliquons",
      "vous": "expliquez",
      "ils/elles": "expliquent"
    },
    "apprendre": {
      "je": "j'apprends",
      "tu": "apprends",
      "il/elle/on": "apprend",
      "nous": "apprenons",
      "vous": "apprenez",
      "ils/elles": "apprennent"
    },
    "produire": {
      "je": "produis",
      "tu": "produis",
      "il/elle/on": "produit",
      "nous": "produisons",
      "vous": "produisez",
      "ils/elles": "produisent"
    },
    "préparer": {
      "je": "prépare",
      "tu": "prépares",
      "il/elle/on": "prépare",
      "nous": "préparons",
      "vous": "préparez",
      "ils/elles": "préparent"
    },
    "chanter": {
      "je": "chante",
      "tu": "chantes",
      "il/elle/on": "chante",
      "nous": "chantons",
      "vous": "chantez",
      "ils/elles": "chantent"
    },
    "danser": {
      "je": "danse",
      "tu": "danses",
      "il/elle/on": "danse",
      "nous": "dansons",
      "vous": "dansez",
      "ils/elles": "dansent"
    },
    "raconter": {
      "je": "raconte",
      "tu": "racontes",
      "il/elle/on": "raconte",
      "nous": "racontons",
      "vous": "racontez",
      "ils/elles": "racontent"
    },
    "espérer": {
      "je": "j'espère",
      "tu": "espères",
      "il/elle/on": "espère",
      "nous": "espérons",
      "vous": "espérez",
      "ils/elles": "espèrent"
    },
    "offrir": {
      "je": "j'offre",
      "tu": "offres",
      "il/elle/on": "offre",
      "nous": "offrons",
      "vous": "offrez",
      "ils/elles": "offrent"
    },
    "construire": {
      "je": "construis",
      "tu": "construis",
      "il/elle/on": "construit",
      "nous": "construisons",
      "vous": "construisez",
      "ils/elles": "construisent"
    },
    "détruire": {
      "je": "détruis",
      "tu": "détruis",
      "il/elle/on": "détruit",
      "nous": "détruisons",
      "vous": "détruisez",
      "ils/elles": "détruisent"
    },
    "traduire": {
      "je": "traduis",
      "tu": "traduis",
      "il/elle/on": "traduit",
      "nous": "traduisons",
      "vous": "traduisez",
      "ils/elles": "traduisent"
    },
    "revenir": {
      "je": "reviens",
      "tu": "reviens",
      "il/elle/on": "revient",
      "nous": "revenons",
      "vous": "revenez",
      "ils/elles": "reviennent"
    },
    "entrer": {
      "je": "j'entre",
      "tu": "entres",
      "il/elle/on": "entre",
      "nous": "entrons",
      "vous": "entrez",
      "ils/elles": "entrent"
    },
    "naître": {
      "je": "nais",
      "tu": "nais",
      "il/elle/on": "naît",
      "nous": "naissons",
      "vous": "naissez",
      "ils/elles": "naissent"
    },
    "descendre": {
      "je": "descends",
      "tu": "descends",
      "il/elle/on": "descend",
      "nous": "descendons",
      "vous": "descendez",
      "ils/elles": "descendent"
    },
    "plaire": {
      "je": "plais",
      "tu": "plais",
      "il/elle/on": "plaît",
      "nous": "plaisons",
      "vous": "plaisez",
      "ils/elles": "plaisent"
    },
    "sourire": {
      "je": "souris",
      "tu": "souris",
      "il/elle/on": "sourit",
      "nous": "sourions",
      "vous": "souriez",
      "ils/elles": "sourient"
    },
    "rire": {
      "je": "ris",
      "tu": "ris",
      "il/elle/on": "rit",
      "nous": "rions",
      "vous": "riez",
      "ils/elles": "rient"
    },
    "vendre": {
      "je": "vends",
      "tu": "vends",
      "il/elle/on": "vend",
      "nous": "vendons",
      "vous": "vendez",
      "ils/elles": "vendent"
    },
    "permettre": {
      "je": "permets",
      "tu": "permets",
      "il/elle/on": "permet",
      "nous": "permettons",
      "vous": "permettez",
      "ils/elles": "permettent"
    },
    "promettre": {
      "je": "promets",
      "tu": "promets",
      "il/elle/on": "promet",
      "nous": "promettons",
      "vous": "promettez",
      "ils/elles": "promettent"
    },
    "paraître": {
      "je": "parais",
      "tu": "parais",
      "il/elle/on": "paraît",
      "nous": "paraissons",
      "vous": "paraissez",
      "ils/elles": "paraissent"
    },
    "disparaître": {
      "je": "disparais",
      "tu": "disparais",
      "il/elle/on": "disparaît",
      "nous": "disparaissons",
      "vous": "disparaissez",
      "ils/elles": "disparaissent"
    },
    "reconnaître": {
      "je": "reconnais",
      "tu": "reconnais",
      "il/elle/on": "reconnaît",
      "nous": "reconnaissons",
      "vous": "reconnaissez",
      "ils/elles": "reconnaissent"
    },
    "battre": {
      "je": "bats",
      "tu": "bats",
      "il/elle/on": "bat",
      "nous": "battons",
      "vous": "battez",
      "ils/elles": "battent"
    },
    "mentir": {
      "je": "mens",
      "tu": "mens",
      "il/elle/on": "ment",
      "nous": "mentons",
      "vous": "mentez",
      "ils/elles": "mentent"
    },
    "partager": {
      "je": "partage",
      "tu": "partages",
      "il/elle/on": "partage",
      "nous": "partageons",
      "vous": "partagez",
      "ils/elles": "partagent"
    },
    "protéger": {
      "je": "protège",
      "tu": "protèges",
      "il/elle/on": "protège",
      "nous": "protégeons",
      "vous": "protégez",
      "ils/elles": "protègent"
    },
    "voyager": {
      "je": "voyage",
      "tu": "voyages",
      "il/elle/on": "voyage",
      "nous": "voyageons",
      "vous": "voyagez",
      "ils/elles": "voyagent"
    },
    "étudier": {
      "je": "j'étudie",
      "tu": "étudies",
      "il/elle/on": "étudie",
      "nous": "étudions",
      "vous": "étudiez",
      "ils/elles": "étudient"
    },
    "réussir": {
      "je": "réussis",
      "tu": "réussis",
      "il/elle/on": "réussit",
      "nous": "réussissons",
      "vous": "réussissez",
      "ils/elles": "réussissent"
    },
    "grandir": {
      "je": "grandis",
      "tu": "grandis",
      "il/elle/on": "grandit",
      "nous": "grandissons",
      "vous": "grandissez",
      "ils/elles": "grandissent"
    },
    "vieillir": {
      "je": "vieillis",
      "tu": "vieillis",
      "il/elle/on": "vieillit",
      "nous": "vieillissons",
      "vous": "vieillissez",
      "ils/elles": "vieillissent"
    },
    "rougir": {
      "je": "rougis",
      "tu": "rougis",
      "il/elle/on": "rougit",
      "nous": "rougissons",
      "vous": "rougissez",
      "ils/elles": "rougissent"
    },
    "maigrir": {
      "je": "maigris",
      "tu": "maigris",
      "il/elle/on": "maigrit",
      "nous": "maigrissons",
      "vous": "maigrissez",
      "ils/elles": "maigrissent"
    },
    "grossir": {
      "je": "grossis",
      "tu": "grossis",
      "il/elle/on": "grossit",
      "nous": "grossissons",
      "vous": "grossissez",
      "ils/elles": "grossissent"
    },
    "obéir": {
      "je": "j'obéis",
      "tu": "obéis",
      "il/elle/on": "obéit",
      "nous": "obéissons",
      "vous": "obéissez",
      "ils/elles": "obéissent"
    },
    "désobéir": {
      "je": "désobéis",
      "tu": "désobéis",
      "il/elle/on": "désobéit",
      "nous": "désobéissons",
      "vous": "désobéissez",
      "ils/elles": "désobéissent"
    },
    "réfléchir": {
      "je": "réfléchis",
      "tu": "réfléchis",
      "il/elle/on": "réfléchit",
      "nous": "réfléchissons",
      "vous": "réfléchissez",
      "ils/elles": "réfléchissent"
    },
    "remplir": {
      "je": "remplis",
      "tu": "remplis",
      "il/elle/on": "remplit",
      "nous": "remplissons",
      "vous": "remplissez",
      "ils/elles": "remplissent"
    },
    "punir": {
      "je": "punis",
      "tu": "punis",
      "il/elle/on": "punit",
      "nous": "punissons",
      "vous": "punissez",
      "ils/elles": "punissent"
    },
    "guérir": {
      "je": "guéris",
      "tu": "guéris",
      "il/elle/on": "guérit",
      "nous": "guérissons",
      "vous": "guérissez",
      "ils/elles": "guérissent"
    },
    "bâtir": {
      "je": "bâtis",
      "tu": "bâtis",
      "il/elle/on": "bâtit",
      "nous": "bâtissons",
      "vous": "bâtissez",
      "ils/elles": "bâtissent"
    },
    "nourrir": {
      "je": "nourris",
      "tu": "nourris",
      "il/elle/on": "nourrit",
      "nous": "nourrissons",
      "vous": "nourrissez",
      "ils/elles": "nourrissent"
    },
    "avertir": {
      "je": "j'avertis",
      "tu": "avertis",
      "il/elle/on": "avertit",
      "nous": "avertissons",
      "vous": "avertissez",
      "ils/elles": "avertissent"
    },
    "agir": {
      "je": "j'agis",
      "tu": "agis",
      "il/elle/on": "agit",
      "nous": "agissons",
      "vous": "agissez",
      "ils/elles": "agissent"
    },
    "réagir": {
      "je": "réagis",
      "tu": "réagis",
      "il/elle/on": "réagit",
      "nous": "réagissons",
      "vous": "réagissez",
      "ils/elles": "réagissent"
    },
    "saisir": {
      "je": "saisis",
      "tu": "saisis",
      "il/elle/on": "saisit",
      "nous": "saisissons",
      "vous": "saisissez",
      "ils/elles": "saisissent"
    },
    "établir": {
      "je": "j'établis",
      "tu": "établis",
      "il/elle/on": "établit",
      "nous": "établissons",
      "vous": "établissez",
      "ils/elles": "établissent"
    },
    "investir": {
      "je": "j'investis",
      "tu": "investis",
      "il/elle/on": "investit",
      "nous": "investissons",
      "vous": "investissez",
      "ils/elles": "investissent"
    },
    "couvrir": {
      "je": "couvre",
      "tu": "couvres",
      "il/elle/on": "couvre",
      "nous": "couvrons",
      "vous": "couvrez",
      "ils/elles": "couvrent"
    },
    "découvrir": {
      "je": "découvre",
      "tu": "découvres",
      "il/elle/on": "découvre",
      "nous": "découvrons",
      "vous": "découvrez",
      "ils/elles": "découvrent"
    },
    "souffrir": {
      "je": "souffre",
      "tu": "souffres",
      "il/elle/on": "souffre",
      "nous": "souffrons",
      "vous": "souffrez",
      "ils/elles": "souffrent"
    },
    "cueillir": {
      "je": "cueille",
      "tu": "cueilles",
      "il/elle/on": "cueille",
      "nous": "cueillons",
      "vous": "cueillez",
      "ils/elles": "cueillent"
    },
    "accueillir": {
      "je": "j'accueille",
      "tu": "accueilles",
      "il/elle/on": "accueille",
      "nous": "accueillons",
      "vous": "accueillez",
      "ils/elles": "accueillent"
    },
    "assaillir": {
      "je": "j'assaille",
      "tu": "assailles",
      "il/elle/on": "assaille",
      "nous": "assaillons",
      "vous": "assaillez",
      "ils/elles": "assaillent"
    },
    "tressaillir": {
      "je": "tressaille",
      "tu": "tressailles",
      "il/elle/on": "tressaille",
      "nous": "tressaillons",
      "vous": "tressaillez",
      "ils/elles": "tressaillent"
    },
    "fuir": {
      "je": "fuis",
      "tu": "fuis",
      "il/elle/on": "fuit",
      "nous": "fuyons",
      "vous": "fuyez",
      "ils/elles": "fuient"
    },
    "vêtir": {
      "je": "vêts",
      "tu": "vêts",
      "il/elle/on": "vêt",
      "nous": "vêtons",
      "vous": "vêtez",
      "ils/elles": "vêtent"
    },
    "acquérir": {
      "je": "j'acquiers",
      "tu": "acquiers",
      "il/elle/on": "acquiert",
      "nous": "acquérons",
      "vous": "acquérez",
      "ils/elles": "acquièrent"
    },
    "conquérir": {
      "je": "conquiers",
      "tu": "conquiers",
      "il/elle/on": "conquiert",
      "nous": "conquérons",
      "vous": "conquérez",
      "ils/elles": "conquièrent"
    },
    "bouillir": {
      "je": "bous",
      "tu": "bous",
      "il/elle/on": "bout",
      "nous": "bouillons",
      "vous": "bouillez",
      "ils/elles": "bouillent"
    },
    "faillir": {
      "je": "faux",
      "tu": "faux",
      "il/elle/on": "faut",
      "nous": "faillons",
      "vous": "faillez",
      "ils/elles": "faillent"
    },
    "haïr": {
      "je": "hais",
      "tu": "hais",
      "il/elle/on": "hait",
      "nous": "haïssons",
      "vous": "haïssez",
      "ils/elles": "haïssent"
    },
    "ouïr": {
      "je": "j'ois",
      "tu": "ois",
      "il/elle/on": "oit",
      "nous": "oyons",
      "vous": "oyez",
      "ils/elles": "oient"
    },
    "réduire": {
      "je": "réduis",
      "tu": "réduis",
      "il/elle/on": "réduit",
      "nous": "réduisons",
      "vous": "réduisez",
      "ils/elles": "réduisent"
    },
    "séduire": {
      "je": "séduis",
      "tu": "séduis",
      "il/elle/on": "séduit",
      "nous": "séduisons",
      "vous": "séduisez",
      "ils/elles": "séduisent"
    },
    "introduire": {
      "je": "j'introduis",
      "tu": "introduis",
      "il/elle/on": "introduit",
      "nous": "introduisons",
      "vous": "introduisez",
      "ils/elles": "introduisent"
    },
    "cuire": {
      "je": "cuis",
      "tu": "cuis",
      "il/elle/on": "cuit",
      "nous": "cuisons",
      "vous": "cuisez",
      "ils/elles": "cuisent"
    },
    "nuire": {
      "je": "nuis",
      "tu": "nuis",
      "il/elle/on": "nuit",
      "nous": "nuisons",
      "vous": "nuisez",
      "ils/elles": "nuisent"
    },
    "luire": {
      "je": "luis",
      "tu": "luis",
      "il/elle/on": "luit",
      "nous": "luisons",
      "vous": "luisez",
      "ils/elles": "luisent"
    },
    "joindre": {
      "je": "joins",
      "tu": "joins",
      "il/elle/on": "joint",
      "nous": "joignons",
      "vous": "joignez",
      "ils/elles": "joignent"
    },
    "craindre": {
      "je": "crains",
      "tu": "crains",
      "il/elle/on": "craint",
      "nous": "craignons",
      "vous": "craignez",
      "ils/elles": "craignent"
    },
    "peindre": {
      "je": "peins",
      "tu": "peins",
      "il/elle/on": "peint",
      "nous": "peignons",
      "vous": "peignez",
      "ils/elles": "peignent"
    },
    "plaindre": {
      "je": "plains",
      "tu": "plains",
      "il/elle/on": "plaint",
      "nous": "plaignons",
      "vous": "plaignez",
      "ils/elles": "plaignent"
    },
    "éteindre": {
      "je": "j'éteins",
      "tu": "éteins",
      "il/elle/on": "éteint",
      "nous": "éteignons",
      "vous": "éteignez",
      "ils/elles": "éteignent"
    },
    "atteindre": {
      "je": "j'atteins",
      "tu": "atteins",
      "il/elle/on": "atteint",
      "nous": "atteignons",
      "vous": "atteignez",
      "ils/elles": "atteignent"
    },
    "restreindre": {
      "je": "restreins",
      "tu": "restreins",
      "il/elle/on": "restreint",
      "nous": "restreignons",
      "vous": "restreignez",
      "ils/elles": "restreignent"
    },
    "feindre": {
      "je": "feins",
      "tu": "feins",
      "il/elle/on": "feint",
      "nous": "feignons",
      "vous": "feignez",
      "ils/elles": "feignent"
    },
    "geindre": {
      "je": "geins",
      "tu": "geins",
      "il/elle/on": "geint",
      "nous": "geignons",
      "vous": "geignez",
      "ils/elles": "geignent"
    },
    "contraindre": {
      "je": "contrains",
      "tu": "contrains",
      "il/elle/on": "contraint",
      "nous": "contraignons",
      "vous": "contraignez",
      "ils/elles": "contraignent"
    },
    "résoudre": {
      "je": "résous",
      "tu": "résous",
      "il/elle/on": "résout",
      "nous": "résolvons",
      "vous": "résolvez",
      "ils/elles": "résolvent"
    },
    "absoudre": {
      "je": "j'absous",
      "tu": "absous",
      "il/elle/on": "absout",
      "nous": "absolvons",
      "vous": "absolvez",
      "ils/elles": "absolvent"
    },
    "dissoudre": {
      "je": "dissous",
      "tu": "dissous",
      "il/elle/on": "dissout",
      "nous": "dissolvons",
      "vous": "dissolvez",
      "ils/elles": "dissolvent"
    },
    "coudre": {
      "je": "couds",
      "tu": "couds",
      "il/elle/on": "coud",
      "nous": "cousons",
      "vous": "cousez",
      "ils/elles": "cousent"
    },
    "moudre": {
      "je": "mouds",
      "tu": "mouds",
      "il/elle/on": "moud",
      "nous": "moulons",
      "vous": "moulez",
      "ils/elles": "moulent"
    },
    "poursuivre": {
      "je": "poursuis",
      "tu": "poursuis",
      "il/elle/on": "poursuit",
      "nous": "poursuivons",
      "vous": "poursuivez",
      "ils/elles": "poursuivent"
    },
    "survivre": {
      "je": "survis",
      "tu": "survis",
      "il/elle/on": "survit",
      "nous": "survivons",
      "vous": "survivez",
      "ils/elles": "survivent"
    },
    "revivre": {
      "je": "revis",
      "tu": "revis",
      "il/elle/on": "revit",
      "nous": "revivons",
      "vous": "revivez",
      "ils/elles": "revivent"
    },
    "conclure": {
      "je": "conclus",
      "tu": "conclus",
      "il/elle/on": "conclut",
      "nous": "concluons",
      "vous": "concluez",
      "ils/elles": "concluent"
    },
    "exclure": {
      "je": "j'exclus",
      "tu": "exclus",
      "il/elle/on": "exclut",
      "nous": "excluons",
      "vous": "excluez",
      "ils/elles": "excluent"
    },
    "inclure": {
      "je": "j'inclus",
      "tu": "inclus",
      "il/elle/on": "inclut",
      "nous": "incluons",
      "vous": "incluez",
      "ils/elles": "incluent"
    },
    "élire": {
      "je": "j'élis",
      "tu": "élis",
      "il/elle/on": "élit",
      "nous": "élisons",
      "vous": "élisez",
      "ils/elles": "élisent"
    },
    "relire": {
      "je": "relis",
      "tu": "relis",
      "il/elle/on": "relit",
      "nous": "relisons",
      "vous": "relisez",
      "ils/elles": "relisent"
    },
    "interdire": {
      "je": "j'interdis",
      "tu": "interdis",
      "il/elle/on": "interdit",
      "nous": "interdisons",
      "vous": "interdisez",
      "ils/elles": "interdisent"
    },
    "prédire": {
      "je": "prédis",
      "tu": "prédis",
      "il/elle/on": "prédit",
      "nous": "prédisons",
      "vous": "prédites",
      "ils/elles": "prédisent"
    },
    "médire": {
      "je": "médis",
      "tu": "médis",
      "il/elle/on": "médit",
      "nous": "médisons",
      "vous": "médisez",
      "ils/elles": "médisent"
    },
    "contredire": {
      "je": "contredis",
      "tu": "contredis",
      "il/elle/on": "contredit",
      "nous": "contredisons",
      "vous": "contredites",
      "ils/elles": "contredisent"
    },
    "suffire": {
      "je": "suffis",
      "tu": "suffis",
      "il/elle/on": "suffit",
      "nous": "suffisons",
      "vous": "suffisez",
      "ils/elles": "suffisent"
    },
    "circoncire": {
      "je": "circoncis",
      "tu": "circoncis",
      "il/elle/on": "circoncit",
      "nous": "circoncisons",
      "vous": "circoncisez",
      "ils/elles": "circoncisent"
    },
    "déplaire": {
      "je": "déplais",
      "tu": "déplais",
      "il/elle/on": "déplaît",
      "nous": "déplaisons",
      "vous": "déplaisez",
      "ils/elles": "déplaisent"
    },
    "taire": {
      "je": "tais",
      "tu": "tais",
      "il/elle/on": "tait",
      "nous": "taisons",
      "vous": "taisez",
      "ils/elles": "taisent"
    },
    "apparaître": {
      "je": "j'apparais",
      "tu": "apparais",
      "il/elle/on": "apparaît",
      "nous": "apparaissons",
      "vous": "apparaissez",
      "ils/elles": "apparaissent"
    },
    "paître": {
      "je": "pais",
      "tu": "pais",
      "il/elle/on": "paît",
      "nous": "paissons",
      "vous": "paissez",
      "ils/elles": "paissent"
    },
    "combattre": {
      "je": "combats",
      "tu": "combats",
      "il/elle/on": "combat",
      "nous": "combattons",
      "vous": "combattez",
      "ils/elles": "combattent"
    },
    "abattre": {
      "je": "j'abats",
      "tu": "abats",
      "il/elle/on": "abat",
      "nous": "abattons",
      "vous": "abattez",
      "ils/elles": "abattent"
    },
    "débattre": {
      "je": "débats",
      "tu": "débats",
      "il/elle/on": "débat",
      "nous": "débattons",
      "vous": "débattez",
      "ils/elles": "débattent"
    },
    "admettre": {
      "je": "j'admets",
      "tu": "admets",
      "il/elle/on": "admet",
      "nous": "admettons",
      "vous": "admettez",
      "ils/elles": "admettent"
    },
    "commettre": {
      "je": "commets",
      "tu": "commets",
      "il/elle/on": "commet",
      "nous": "commettons",
      "vous": "commettez",
      "ils/elles": "commettent"
    },
    "compromettre": {
      "je": "compromets",
      "tu": "compromets",
      "il/elle/on": "compromet",
      "nous": "compromettons",
      "vous": "compromettez",
      "ils/elles": "compromettent"
    },
    "remettre": {
      "je": "remets",
      "tu": "remets",
      "il/elle/on": "remet",
      "nous": "remettons",
      "vous": "remettez",
      "ils/elles": "remettent"
    },
    "soumettre": {
      "je": "soumets",
      "tu": "soumets",
      "il/elle/on": "soumet",
      "nous": "soumettons",
      "vous": "soumettez",
      "ils/elles": "soumettent"
    },
    "transmettre": {
      "je": "transmets",
      "tu": "transmets",
      "il/elle/on": "transmet",
      "nous": "transmettons",
      "vous": "transmettez",
      "ils/elles": "transmettent"
    },
    "entreprendre": {
      "je": "j'entreprends",
      "tu": "entreprends",
      "il/elle/on": "entreprend",
      "nous": "entreprenons",
      "vous": "entreprenez",
      "ils/elles": "entreprennent"
    },
    "reprendre": {
      "je": "reprends",
      "tu": "reprends",
      "il/elle/on": "reprend",
      "nous": "reprenons",
      "vous": "reprenez",
      "ils/elles": "reprennent"
    },
    "surprendre": {
      "je": "surprends",
      "tu": "surprends",
      "il/elle/on": "surprend",
      "nous": "surprenons",
      "vous": "surprenez",
      "ils/elles": "surprennent"
    },
    "rompre": {
      "je": "romps",
      "tu": "romps",
      "il/elle/on": "rompt",
      "nous": "rompons",
      "vous": "rompez",
      "ils/elles": "rompent"
    },
    "corrompre": {
      "je": "corromps",
      "tu": "corromps",
      "il/elle/on": "corrompt",
      "nous": "corrompons",
      "vous": "corrompez",
      "ils/elles": "corrompent"
    },
    "interrompre": {
      "je": "j'interromps",
      "tu": "interromps",
      "il/elle/on": "interrompt",
      "nous": "interrompons",
      "vous": "interrompez",
      "ils/elles": "interrompent"
    },
    "vaincre": {
      "je": "vaincs",
      "tu": "vaincs",
      "il/elle/on": "vainc",
      "nous": "vainquons",
      "vous": "vainquez",
      "ils/elles": "vainquent"
    },
    "convaincre": {
      "je": "convaincs",
      "tu": "convaincs",
      "il/elle/on": "convainc",
      "nous": "convainquons",
      "vous": "convainquez",
      "ils/elles": "convainquent"
    },
    "amener": {
      "je": "j'amène",
      "tu": "amènes",
      "il/elle/on": "amène",
      "nous": "amenons",
      "vous": "amenez",
      "ils/elles": "amènent"
    },
    "emmener": {
      "je": "j'emmène",
      "tu": "emmènes",
      "il/elle/on": "emmène",
      "nous": "emmenons",
      "vous": "emmenez",
      "ils/elles": "emmènent"
    },
    "enlever": {
      "je": "j'enlève",
      "tu": "enlèves",
      "il/elle/on": "enlève",
      "nous": "enlevons",
      "vous": "enlevez",
      "ils/elles": "enlèvent"
    },
    "geler": {
      "je": "gèle",
      "tu": "gèles",
      "il/elle/on": "gèle",
      "nous": "gelons",
      "vous": "gelez",
      "ils/elles": "gèlent"
    },
    "harceler": {
      "je": "harcelle",
      "tu": "harcelles",
      "il/elle/on": "harcelle",
      "nous": "harcelons",
      "vous": "harcelez",
      "ils/elles": "harcellent"
    },
    "lever": {
      "je": "lève",
      "tu": "lèves",
      "il/elle/on": "lève",
      "nous": "levons",
      "vous": "levez",
      "ils/elles": "lèvent"
    },
    "mener": {
      "je": "mène",
      "tu": "mènes",
      "il/elle/on": "mène",
      "nous": "menons",
      "vous": "menez",
      "ils/elles": "mènent"
    },
    "peler": {
      "je": "pèle",
      "tu": "pèles",
      "il/elle/on": "pèle",
      "nous": "pelons",
      "vous": "pelez",
      "ils/elles": "pèlent"
    },
    "peser": {
      "je": "pèse",
      "tu": "pèses",
      "il/elle/on": "pèse",
      "nous": "pesons",
      "vous": "pesez",
      "ils/elles": "pèsent"
    },
    "promener": {
      "je": "promène",
      "tu": "promènes",
      "il/elle/on": "promène",
      "nous": "promenons",
      "vous": "promenez",
      "ils/elles": "promènent"
    },
    "semer": {
      "je": "sème",
      "tu": "sèmes",
      "il/elle/on": "sème",
      "nous": "semons",
      "vous": "semez",
      "ils/elles": "sèment"
    },
    "jeter": {
      "je": "jette",
      "tu": "jettes",
      "il/elle/on": "jette",
      "nous": "jetons",
      "vous": "jetez",
      "ils/elles": "jettent"
    },
    "épeler": {
      "je": "j'épelle",
      "tu": "épelles",
      "il/elle/on": "épelle",
      "nous": "épelons",
      "vous": "épelez",
      "ils/elles": "épellent"
    },
    "feuilleter": {
      "je": "feuillette",
      "tu": "feuillettes",
      "il/elle/on": "feuillette",
      "nous": "feuilletons",
      "vous": "feuilletez",
      "ils/elles": "feuillettent"
    },
    "projeter": {
      "je": "projette",
      "tu": "projettes",
      "il/elle/on": "projette",
      "nous": "projetons",
      "vous": "projetez",
      "ils/elles": "projettent"
    },
    "rejeter": {
      "je": "rejette",
      "tu": "rejettes",
      "il/elle/on": "rejette",
      "nous": "rejetons",
      "vous": "rejetez",
      "ils/elles": "rejettent"
    },
    "renouveler": {
      "je": "renouvelle",
      "tu": "renouvelles",
      "il/elle/on": "renouvelle",
      "nous": "renouvelons",
      "vous": "renouvelez",
      "ils/elles": "renouvellent"
    },
    "céder": {
      "je": "cède",
      "tu": "cèdes",
      "il/elle/on": "cède",
      "nous": "cédons",
      "vous": "cédez",
      "ils/elles": "cèdent"
    },
    "célébrer": {
      "je": "célèbre",
      "tu": "célèbres",
      "il/elle/on": "célèbre",
      "nous": "célébrons",
      "vous": "célébrez",
      "ils/elles": "célèbrent"
    },
    "compléter": {
      "je": "complète",
      "tu": "complètes",
      "il/elle/on": "complète",
      "nous": "complétons",
      "vous": "complétez",
      "ils/elles": "complètent"
    },
    "considérer": {
      "je": "considère",
      "tu": "considères",
      "il/elle/on": "considère",
      "nous": "considérons",
      "vous": "considérez",
      "ils/elles": "considèrent"
    },
    "différer": {
      "je": "diffère",
      "tu": "diffères",
      "il/elle/on": "diffère",
      "nous": "différons",
      "vous": "différez",
      "ils/elles": "diffèrent"
    },
    "exagérer": {
      "je": "j'exagère",
      "tu": "exagères",
      "il/elle/on": "exagère",
      "nous": "exagérons",
      "vous": "exagérez",
      "ils/elles": "exagèrent"
    },
    "gérer": {
      "je": "gère",
      "tu": "gères",
      "il/elle/on": "gère",
      "nous": "gérons",
      "vous": "gérez",
      "ils/elles": "gèrent"
    },
    "inquiéter": {
      "je": "j'inquiète",
      "tu": "inquiètes",
      "il/elle/on": "inquiète",
      "nous": "inquiétons",
      "vous": "inquiétez",
      "ils/elles": "inquiètent"
    },
    "modérer": {
      "je": "modère",
      "tu": "modères",
      "il/elle/on": "modère",
      "nous": "modérons",
      "vous": "modérez",
      "ils/elles": "modèrent"
    },
    "pénétrer": {
      "je": "pénètre",
      "tu": "pénètres",
      "il/elle/on": "pénètre",
      "nous": "pénétrons",
      "vous": "pénétrez",
      "ils/elles": "pénètrent"
    },
    "posséder": {
      "je": "possède",
      "tu": "possèdes",
      "il/elle/on": "possède",
      "nous": "possédons",
      "vous": "possédez",
      "ils/elles": "possèdent"
    },
    "préférer": {
      "je": "préfère",
      "tu": "préfères",
      "il/elle/on": "préfère",
      "nous": "préférons",
      "vous": "préférez",
      "ils/elles": "préfèrent"
    },
    "refléter": {
      "je": "reflète",
      "tu": "reflètes",
      "il/elle/on": "reflète",
      "nous": "reflétons",
      "vous": "reflétez",
      "ils/elles": "reflètent"
    },
    "répéter": {
      "je": "répète",
      "tu": "répètes",
      "il/elle/on": "répète",
      "nous": "répétons",
      "vous": "répétez",
      "ils/elles": "répètent"
    },
    "révéler": {
      "je": "révèle",
      "tu": "révèles",
      "il/elle/on": "révèle",
      "nous": "révélons",
      "vous": "révélez",
      "ils/elles": "révèlent"
    },
    "suggérer": {
      "je": "suggère",
      "tu": "suggères",
      "il/elle/on": "suggère",
      "nous": "suggérons",
      "vous": "suggérez",
      "ils/elles": "suggèrent"
    },
    "zébrer": {
      "je": "zèbre",
      "tu": "zèbres",
      "il/elle/on": "zèbre",
      "nous": "zébrons",
      "vous": "zébrez",
      "ils/elles": "zèbrent"
    },
    "nettoyer": {
      "je": "nettoie",
      "tu": "nettoies",
      "il/elle/on": "nettoie",
      "nous": "nettoyons",
      "vous": "nettoyez",
      "ils/elles": "nettoient"
    },
    "appuyer": {
      "je": "j'appuie",
      "tu": "appuies",
      "il/elle/on": "appuie",
      "nous": "appuyons",
      "vous": "appuyez",
      "ils/elles": "appuient"
    },
    "ennuyer": {
      "je": "j'ennuie",
      "tu": "ennuies",
      "il/elle/on": "ennuie",
      "nous": "ennuyons",
      "vous": "ennuyez",
      "ils/elles": "ennuient"
    },
    "essuyer": {
      "je": "j'essuie",
      "tu": "essuies",
      "il/elle/on": "essuie",
      "nous": "essuyons",
      "vous": "essuyez",
      "ils/elles": "essuient"
    },
    "balayer": {
      "je": "balaie",
      "tu": "balaies",
      "il/elle/on": "balaie",
      "nous": "balayons",
      "vous": "balayez",
      "ils/elles": "balaient"
    },
    "effrayer": {
      "je": "j'effraie",
      "tu": "effraies",
      "il/elle/on": "effraie",
      "nous": "effrayons",
      "vous": "effrayez",
      "ils/elles": "effraient"
    },
    "aboyer": {
      "je": "j'aboie",
      "tu": "aboies",
      "il/elle/on": "aboie",
      "nous": "aboyons",
      "vous": "aboyez",
      "ils/elles": "aboient"
    },
    "noyer": {
      "je": "noie",
      "tu": "noies",
      "il/elle/on": "noie",
      "nous": "noyons",
      "vous": "noyez",
      "ils/elles": "noient"
    },
    "tutoyer": {
      "je": "tutoie",
      "tu": "tutoies",
      "il/elle/on": "tutoie",
      "nous": "tutoyons",
      "vous": "tutoyez",
      "ils/elles": "tutoient"
    },
    "vouvoyer": {
      "je": "vouvoie",
      "tu": "vouvoies",
      "il/elle/on": "vouvoie",
      "nous": "vouvoyons",
      "vous": "vouvoyez",
      "ils/elles": "vouvoient"
    },
    "annoncer": {
      "je": "j'annonce",
      "tu": "annonces",
      "il/elle/on": "annonce",
      "nous": "annonçons",
      "vous": "annoncez",
      "ils/elles": "annoncent"
    },
    "avancer": {
      "je": "j'avance",
      "tu": "avances",
      "il/elle/on": "avance",
      "nous": "avançons",
      "vous": "avancez",
      "ils/elles": "avancent"
    },
    "dénoncer": {
      "je": "dénonce",
      "tu": "dénonces",
      "il/elle/on": "dénonce",
      "nous": "dénonçons",
      "vous": "dénoncez",
      "ils/elles": "dénoncent"
    },
    "divorcer": {
      "je": "divorce",
      "tu": "divorces",
      "il/elle/on": "divorce",
      "nous": "divorçons",
      "vous": "divorcez",
      "ils/elles": "divorcent"
    },
    "effacer": {
      "je": "j'efface",
      "tu": "effaces",
      "il/elle/on": "efface",
      "nous": "effaçons",
      "vous": "effacez",
      "ils/elles": "effacent"
    },
    "lancer": {
      "je": "lance",
      "tu": "lances",
      "il/elle/on": "lance",
      "nous": "lançons",
      "vous": "lancez",
      "ils/elles": "lancent"
    },
    "menacer": {
      "je": "menace",
      "tu": "menaces",
      "il/elle/on": "menace",
      "nous": "menaçons",
      "vous": "menacez",
      "ils/elles": "menacent"
    },
    "placer": {
      "je": "place",
      "tu": "places",
      "il/elle/on": "place",
      "nous": "plaçons",
      "vous": "placez",
      "ils/elles": "placent"
    },
    "prononcer": {
      "je": "prononce",
      "tu": "prononces",
      "il/elle/on": "prononce",
      "nous": "prononçons",
      "vous": "prononcez",
      "ils/elles": "prononcent"
    },
    "remplacer": {
      "je": "remplace",
      "tu": "remplaces",
      "il/elle/on": "remplace",
      "nous": "remplaçons",
      "vous": "remplacez",
      "ils/elles": "remplacent"
    },
    "renoncer": {
      "je": "renonce",
      "tu": "renonces",
      "il/elle/on": "renonce",
      "nous": "renonçons",
      "vous": "renoncez",
      "ils/elles": "renoncent"
    },
    "arranger": {
      "je": "j'arrange",
      "tu": "arranges",
      "il/elle/on": "arrange",
      "nous": "arrangeons",
      "vous": "arrangez",
      "ils/elles": "arrangent"
    },
    "bouger": {
      "je": "bouge",
      "tu": "bouges",
      "il/elle/on": "bouge",
      "nous": "bougeons",
      "vous": "bougez",
      "ils/elles": "bougent"
    },
    "corriger": {
      "je": "corrige",
      "tu": "corriges",
      "il/elle/on": "corrige",
      "nous": "corrigeons",
      "vous": "corrigez",
      "ils/elles": "corrigent"
    },
    "décourager": {
      "je": "décourage",
      "tu": "décourages",
      "il/elle/on": "décourage",
      "nous": "décourageons",
      "vous": "découragez",
      "ils/elles": "découragent"
    },
    "déménager": {
      "je": "déménage",
      "tu": "déménages",
      "il/elle/on": "déménage",
      "nous": "déménageons",
      "vous": "déménagez",
      "ils/elles": "déménagent"
    },
    "diriger": {
      "je": "dirige",
      "tu": "diriges",
      "il/elle/on": "dirige",
      "nous": "dirigeons",
      "vous": "dirigez",
      "ils/elles": "dirigent"
    },
    "encourager": {
      "je": "j'encourage",
      "tu": "encourages",
      "il/elle/on": "encourage",
      "nous": "encourageons",
      "vous": "encouragez",
      "ils/elles": "encouragent"
    },
    "engager": {
      "je": "j'engage",
      "tu": "engages",
      "il/elle/on": "engage",
      "nous": "engageons",
      "vous": "engagez",
      "ils/elles": "engagent"
    },
    "exiger": {
      "je": "j'exige",
      "tu": "exiges",
      "il/elle/on": "exige",
      "nous": "exigeons",
      "vous": "exigez",
      "ils/elles": "exigent"
    },
    "juger": {
      "je": "juge",
      "tu": "juges",
      "il/elle/on": "juge",
      "nous": "jugeons",
      "vous": "jugez",
      "ils/elles": "jugent"
    },
    "loger": {
      "je": "loge",
      "tu": "loges",
      "il/elle/on": "loge",
      "nous": "logeons",
      "vous": "logez",
      "ils/elles": "logent"
    },
    "mélanger": {
      "je": "mélange",
      "tu": "mélanges",
      "il/elle/on": "mélange",
      "nous": "mélangeons",
      "vous": "mélangez",
      "ils/elles": "mélangent"
    },
    "nager": {
      "je": "nage",
      "tu": "nages",
      "il/elle/on": "nage",
      "nous": "nageons",
      "vous": "nagez",
      "ils/elles": "nagent"
    },
    "obliger": {
      "je": "j'oblige",
      "tu": "obliges",
      "il/elle/on": "oblige",
      "nous": "obligeons",
      "vous": "obligez",
      "ils/elles": "obligent"
    },
    "plonger": {
      "je": "plonge",
      "tu": "plonges",
      "il/elle/on": "plonge",
      "nous": "plongeons",
      "vous": "plongez",
      "ils/elles": "plongent"
    },
    "ranger": {
      "je": "range",
      "tu": "ranges",
      "il/elle/on": "range",
      "nous": "rangeons",
      "vous": "rangez",
      "ils/elles": "rangent"
    },
    "rédiger": {
      "je": "rédige",
      "tu": "rédiges",
      "il/elle/on": "rédige",
      "nous": "rédigeons",
      "vous": "rédigez",
      "ils/elles": "rédigent"
    },
    "ajouter": {
      "je": "j'ajoute",
      "tu": "ajoutes",
      "il/elle/on": "ajoute",
      "nous": "ajoutons",
      "vous": "ajoutez",
      "ils/elles": "ajoutent"
    },
    "durer": {
      "je": "dure",
      "tu": "dures",
      "il/elle/on": "dure",
      "nous": "durons",
      "vous": "durez",
      "ils/elles": "durent"
    },
    "écouter": {
      "je": "j'écoute",
      "tu": "écoutes",
      "il/elle/on": "écoute",
      "nous": "écoutons",
      "vous": "écoutez",
      "ils/elles": "écoutent"
    },
    "emprunter": {
      "je": "j'emprunte",
      "tu": "empruntes",
      "il/elle/on": "emprunte",
      "nous": "empruntons",
      "vous": "empruntez",
      "ils/elles": "empruntent"
    },
    "fermer": {
      "je": "ferme",
      "tu": "fermes",
      "il/elle/on": "ferme",
      "nous": "fermons",
      "vous": "fermez",
      "ils/elles": "ferment"
    },
    "garder": {
      "je": "garde",
      "tu": "gardes",
      "il/elle/on": "garde",
      "nous": "gardons",
      "vous": "gardez",
      "ils/elles": "gardent"
    },
    "laver": {
      "je": "lave",
      "tu": "laves",
      "il/elle/on": "lave",
      "nous": "lavons",
      "vous": "lavez",
      "ils/elles": "lavent"
    },
    "pardonner": {
      "je": "pardonne",
      "tu": "pardonnes",
      "il/elle/on": "pardonne",
      "nous": "pardonnons",
      "vous": "pardonnez",
      "ils/elles": "pardonnent"
    },
    "présenter": {
      "je": "présente",
      "tu": "présentes",
      "il/elle/on": "présente",
      "nous": "présentons",
      "vous": "présentez",
      "ils/elles": "présentent"
    },
    "prêter": {
      "je": "prête",
      "tu": "prêtes",
      "il/elle/on": "prête",
      "nous": "prêtons",
      "vous": "prêtez",
      "ils/elles": "prêtent"
    },
    "quitter": {
      "je": "quitte",
      "tu": "quittes",
      "il/elle/on": "quitte",
      "nous": "quittons",
      "vous": "quittez",
      "ils/elles": "quittent"
    },
    "refuser": {
      "je": "refuse",
      "tu": "refuses",
      "il/elle/on": "refuse",
      "nous": "refusons",
      "vous": "refusez",
      "ils/elles": "refusent"
    },
    "rencontrer": {
      "je": "rencontre",
      "tu": "rencontres",
      "il/elle/on": "rencontre",
      "nous": "rencontrons",
      "vous": "rencontrez",
      "ils/elles": "rencontrent"
    },
    "reposer": {
      "je": "repose",
      "tu": "reposes",
      "il/elle/on": "repose",
      "nous": "reposons",
      "vous": "reposez",
      "ils/elles": "reposent"
    },
    "rêver": {
      "je": "rêve",
      "tu": "rêves",
      "il/elle/on": "rêve",
      "nous": "rêvons",
      "vous": "rêvez",
      "ils/elles": "rêvent"
    },
    "saluer": {
      "je": "salue",
      "tu": "salues",
      "il/elle/on": "salue",
      "nous": "saluons",
      "vous": "saluez",
      "ils/elles": "saluent"
    },
    "sauter": {
      "je": "saute",
      "tu": "sautes",
      "il/elle/on": "saute",
      "nous": "sautons",
      "vous": "sautez",
      "ils/elles": "sautent"
    },
    "sembler": {
      "je": "semble",
      "tu": "sembles",
      "il/elle/on": "semble",
      "nous": "semblons",
      "vous": "semblez",
      "ils/elles": "semblent"
    },
    "signer": {
      "je": "signe",
      "tu": "signes",
      "il/elle/on": "signe",
      "nous": "signons",
      "vous": "signez",
      "ils/elles": "signent"
    },
    "téléphoner": {
      "je": "téléphone",
      "tu": "téléphones",
      "il/elle/on": "téléphone",
      "nous": "téléphonons",
      "vous": "téléphonez",
      "ils/elles": "téléphonent"
    },
    "terminer": {
      "je": "termine",
      "tu": "termines",
      "il/elle/on": "termine",
      "nous": "terminons",
      "vous": "terminez",
      "ils/elles": "terminent"
    },
    "traverser": {
      "je": "traverse",
      "tu": "traverses",
      "il/elle/on": "traverse",
      "nous": "traversons",
      "vous": "traversez",
      "ils/elles": "traversent"
    },
    "utiliser": {
      "je": "j'utilise",
      "tu": "utilises",
      "il/elle/on": "utilise",
      "nous": "utilisons",
      "vous": "utilisez",
      "ils/elles": "utilisent"
    },
    "visiter": {
      "je": "visite",
      "tu": "visites",
      "il/elle/on": "visite",
      "nous": "visitons",
      "vous": "visitez",
      "ils/elles": "visitent"
    },
    "voler": {
      "je": "vole",
      "tu": "voles",
      "il/elle/on": "vole",
      "nous": "volons",
      "vous": "volez",
      "ils/elles": "volent"
    },
    "accepter": {
      "je": "j'accepte",
      "tu": "acceptes",
      "il/elle/on": "accepte",
      "nous": "acceptons",
      "vous": "acceptez",
      "ils/elles": "acceptent"
    },
    "adorer": {
      "je": "j'adore",
      "tu": "adores",
      "il/elle/on": "adore",
      "nous": "adorons",
      "vous": "adorez",
      "ils/elles": "adorent"
    },
    "apporter": {
      "je": "j'apporte",
      "tu": "apportes",
      "il/elle/on": "apporte",
      "nous": "apportons",
      "vous": "apportez",
      "ils/elles": "apportent"
    },
    "arrêter": {
      "je": "j'arrête",
      "tu": "arrêtes",
      "il/elle/on": "arrête",
      "nous": "arrêtons",
      "vous": "arrêtez",
      "ils/elles": "arrêtent"
    },
    "commander": {
      "je": "commande",
      "tu": "commandes",
      "il/elle/on": "commande",
      "nous": "commandons",
      "vous": "commandez",
      "ils/elles": "commandent"
    },
    "compter": {
      "je": "compte",
      "tu": "comptes",
      "il/elle/on": "compte",
      "nous": "comptons",
      "vous": "comptez",
      "ils/elles": "comptent"
    },
    "conseiller": {
      "je": "conseille",
      "tu": "conseilles",
      "il/elle/on": "conseille",
      "nous": "conseillons",
      "vous": "conseillez",
      "ils/elles": "conseillent"
    },
    "continuer": {
      "je": "continue",
      "tu": "continues",
      "il/elle/on": "continue",
      "nous": "continuons",
      "vous": "continuez",
      "ils/elles": "continuent"
    },
    "coûter": {
      "je": "coûte",
      "tu": "coûtes",
      "il/elle/on": "coûte",
      "nous": "coûtons",
      "vous": "coûtez",
      "ils/elles": "coûtent"
    },
    "crier": {
      "je": "crie",
      "tu": "cries",
      "il/elle/on": "crie",
      "nous": "crions",
      "vous": "criez",
      "ils/elles": "crient"
    },
    "déjeuner": {
      "je": "déjeune",
      "tu": "déjeunes",
      "il/elle/on": "déjeune",
      "nous": "déjeunons",
      "vous": "déjeunez",
      "ils/elles": "déjeunent"
    },
    "désirer": {
      "je": "désire",
      "tu": "désires",
      "il/elle/on": "désire",
      "nous": "désirons",
      "vous": "désirez",
      "ils/elles": "désirent"
    },
    "détester": {
      "je": "déteste",
      "tu": "détestes",
      "il/elle/on": "déteste",
      "nous": "détestons",
      "vous": "détestez",
      "ils/elles": "détestent"
    },
    "dessiner": {
      "je": "dessine",
      "tu": "dessines",
      "il/elle/on": "dessine",
      "nous": "dessinons",
      "vous": "dessinez",
      "ils/elles": "dessinent"
    },
    "dîner": {
      "je": "dîne",
      "tu": "dînes",
      "il/elle/on": "dîne",
      "nous": "dînons",
      "vous": "dînez",
      "ils/elles": "dînent"
    },
    "discuter": {
      "je": "discute",
      "tu": "discutes",
      "il/elle/on": "discute",
      "nous": "discutons",
      "vous": "discutez",
      "ils/elles": "discutent"
    },
    "éviter": {
      "je": "j'évite",
      "tu": "évites",
      "il/elle/on": "évite",
      "nous": "évitons",
      "vous": "évitez",
      "ils/elles": "évitent"
    },
    "excuser": {
      "je": "j'excuse",
      "tu": "excuses",
      "il/elle/on": "excuse",
      "nous": "excusons",
      "vous": "excusez",
      "ils/elles": "excusent"
    },
    "fumer": {
      "je": "fume",
      "tu": "fumes",
      "il/elle/on": "fume",
      "nous": "fumons",
      "vous": "fumez",
      "ils/elles": "fument"
    },
    "habiter": {
      "je": "habite",
      "tu": "habites",
      "il/elle/on": "habite",
      "nous": "habitons",
      "vous": "habitez",
      "ils/elles": "habitent"
    },
    "imaginer": {
      "je": "j'imagine",
      "tu": "imagines",
      "il/elle/on": "imagine",
      "nous": "imaginons",
      "vous": "imaginez",
      "ils/elles": "imaginent"
    },
    "importer": {
      "je": "j'importe",
      "tu": "importes",
      "il/elle/on": "importe",
      "nous": "importons",
      "vous": "importez",
      "ils/elles": "importent"
    },
    "inviter": {
      "je": "j'invite",
      "tu": "invites",
      "il/elle/on": "invite",
      "nous": "invitons",
      "vous": "invitez",
      "ils/elles": "invitent"
    },
    "noter": {
      "je": "note",
      "tu": "notes",
      "il/elle/on": "note",
      "nous": "notons",
      "vous": "notez",
      "ils/elles": "notent"
    },
    "organiser": {
      "je": "j'organise",
      "tu": "organises",
      "il/elle/on": "organise",
      "nous": "organisons",
      "vous": "organisez",
      "ils/elles": "organisent"
    },
    "parier": {
      "je": "parie",
      "tu": "paries",
      "il/elle/on": "parie",
      "nous": "parions",
      "vous": "pariez",
      "ils/elles": "parient"
    },
    "pleurer": {
      "je": "pleure",
      "tu": "pleures",
      "il/elle/on": "pleure",
      "nous": "pleurons",
      "vous": "pleurez",
      "ils/elles": "pleurent"
    },
    "poser": {
      "je": "pose",
      "tu": "poses",
      "il/elle/on": "pose",
      "nous": "posons",
      "vous": "posez",
      "ils/elles": "posent"
    },
    "pousser": {
      "je": "pousse",
      "tu": "pousses",
      "il/elle/on": "pousse",
      "nous": "poussons",
      "vous": "poussez",
      "ils/elles": "poussent"
    },
    "prier": {
      "je": "prie",
      "tu": "pries",
      "il/elle/on": "prie",
      "nous": "prions",
      "vous": "priez",
      "ils/elles": "prient"
    },
    "rappeler": {
      "je": "rappelle",
      "tu": "rappelles",
      "il/elle/on": "rappelle",
      "nous": "rappelons",
      "vous": "rappelez",
      "ils/elles": "rappellent"
    },
    "remercier": {
      "je": "remercie",
      "tu": "remercies",
      "il/elle/on": "remercie",
      "nous": "remercions",
      "vous": "remerciez",
      "ils/elles": "remercient"
    },
    "respecter": {
      "je": "respecte",
      "tu": "respectes",
      "il/elle/on": "respecte",
      "nous": "respectons",
      "vous": "respectez",
      "ils/elles": "respectent"
    },
    "retourner": {
      "je": "retourne",
      "tu": "retournes",
      "il/elle/on": "retourne",
      "nous": "retournons",
      "vous": "retournez",
      "ils/elles": "retournent"
    },
    "retrouver": {
      "je": "retrouve",
      "tu": "retrouves",
      "il/elle/on": "retrouve",
      "nous": "retrouvons",
      "vous": "retrouvez",
      "ils/elles": "retrouvent"
    },
    "réveiller": {
      "je": "réveille",
      "tu": "réveilles",
      "il/elle/on": "réveille",
      "nous": "réveillons",
      "vous": "réveillez",
      "ils/elles": "réveillent"
    },
    "toucher": {
      "je": "touche",
      "tu": "touches",
      "il/elle/on": "touche",
      "nous": "touchons",
      "vous": "touchez",
      "ils/elles": "touchent"
    },
    "tuer": {
      "je": "tue",
      "tu": "tues",
      "il/elle/on": "tue",
      "nous": "tuons",
      "vous": "tuez",
      "ils/elles": "tuent"
    },
    "vérifier": {
      "je": "vérifie",
      "tu": "vérifies",
      "il/elle/on": "vérifie",
      "nous": "vérifions",
      "vous": "vérifiez",
      "ils/elles": "vérifient"
    }
  },
  "passeCompose": {
    "être": {
      "je": "été",
      "tu": "as été",
      "il/elle/on": "a été",
      "nous": "avons été",
      "vous": "avez été",
      "ils/elles": "ont été"
    },
    "avoir": {
      "je": "eu",
      "tu": "as eu",
      "il/elle/on": "a eu",
      "nous": "avons eu",
      "vous": "avez eu",
      "ils/elles": "ont eu"
    },
    "aller": {
      "je": "suis allé",
      "tu": "es allé",
      "il/elle/on": "est allé",
      "nous": "sommes allés",
      "vous": "êtes allés",
      "ils/elles": "sont allés"
    },
    "faire": {
      "je": "fait",
      "tu": "as fait",
      "il/elle/on": "a fait",
      "nous": "avons fait",
      "vous": "avez fait",
      "ils/elles": "ont fait"
    },
    "venir": {
      "je": "suis venu",
      "tu": "es venu",
      "il/elle/on": "est venu",
      "nous": "sommes venus",
      "vous": "êtes venus",
      "ils/elles": "sont venus"
    },
    "pouvoir": {
      "je": "pu",
      "tu": "as pu",
      "il/elle/on": "a pu",
      "nous": "avons pu",
      "vous": "avez pu",
      "ils/elles": "ont pu"
    },
    "vouloir": {
      "je": "voulu",
      "tu": "as voulu",
      "il/elle/on": "a voulu",
      "nous": "avons voulu",
      "vous": "avez voulu",
      "ils/elles": "ont voulu"
    },
    "savoir": {
      "je": "su",
      "tu": "as su",
      "il/elle/on": "a su",
      "nous": "avons su",
      "vous": "avez su",
      "ils/elles": "ont su"
    },
    "devoir": {
      "je": "dû",
      "tu": "as dû",
      "il/elle/on": "a dû",
      "nous": "avons dû",
      "vous": "avez dû",
      "ils/elles": "ont dû"
    },
    "dire": {
      "je": "dit",
      "tu": "as dit",
      "il/elle/on": "a dit",
      "nous": "avons dit",
      "vous": "avez dit",
      "ils/elles": "ont dit"
    },
    "voir": {
      "je": "vu",
      "tu": "as vu",
      "il/elle/on": "a vu",
      "nous": "avons vu",
      "vous": "avez vu",
      "ils/elles": "ont vu"
    },
    "prendre": {
      "je": "pris",
      "tu": "as pris",
      "il/elle/on": "a pris",
      "nous": "avons pris",
      "vous": "avez pris",
      "ils/elles": "ont pris"
    },
    "mettre": {
      "je": "mis",
      "tu": "as mis",
      "il/elle/on": "a mis",
      "nous": "avons mis",
      "vous": "avez mis",
      "ils/elles": "ont mis"
    },
    "croire": {
      "je": "cru",
      "tu": "as cru",
      "il/elle/on": "a cru",
      "nous": "avons cru",
      "vous": "avez cru",
      "ils/elles": "ont cru"
    },
    "parler": {
      "je": "parlé",
      "tu": "as parlé",
      "il/elle/on": "a parlé",
      "nous": "avons parlé",
      "vous": "avez parlé",
      "ils/elles": "ont parlé"
    },
    "passer": {
      "je": "suis passé",
      "tu": "es passé",
      "il/elle/on": "est passé",
      "nous": "sommes passés",
      "vous": "êtes passés",
      "ils/elles": "sont passés"
    },
    "trouver": {
      "je": "trouvé",
      "tu": "as trouvé",
      "il/elle/on": "a trouvé",
      "nous": "avons trouvé",
      "vous": "avez trouvé",
      "ils/elles": "ont trouvé"
    },
    "donner": {
      "je": "donné",
      "tu": "as donné",
      "il/elle/on": "a donné",
      "nous": "avons donné",
      "vous": "avez donné",
      "ils/elles": "ont donné"
    },
    "comprendre": {
      "je": "compris",
      "tu": "as compris",
      "il/elle/on": "a compris",
      "nous": "avons compris",
      "vous": "avez compris",
      "ils/elles": "ont compris"
    },
    "partir": {
      "je": "suis parti",
      "tu": "es parti",
      "il/elle/on": "est parti",
      "nous": "sommes partis",
      "vous": "êtes partis",
      "ils/elles": "sont partis"
    },
    "demander": {
      "je": "demandé",
      "tu": "as demandé",
      "il/elle/on": "a demandé",
      "nous": "avons demandé",
      "vous": "avez demandé",
      "ils/elles": "ont demandé"
    },
    "tenir": {
      "je": "tenu",
      "tu": "as tenu",
      "il/elle/on": "a tenu",
      "nous": "avons tenu",
      "vous": "avez tenu",
      "ils/elles": "ont tenu"
    },
    "aimer": {
      "je": "aimé",
      "tu": "as aimé",
      "il/elle/on": "a aimé",
      "nous": "avons aimé",
      "vous": "avez aimé",
      "ils/elles": "ont aimé"
    },
    "penser": {
      "je": "pensé",
      "tu": "as pensé",
      "il/elle/on": "a pensé",
      "nous": "avons pensé",
      "vous": "avez pensé",
      "ils/elles": "ont pensé"
    },
    "rester": {
      "je": "suis resté",
      "tu": "es resté",
      "il/elle/on": "est resté",
      "nous": "sommes restés",
      "vous": "êtes restés",
      "ils/elles": "sont restés"
    },
    "manger": {
      "je": "mangé",
      "tu": "as mangé",
      "il/elle/on": "a mangé",
      "nous": "avons mangé",
      "vous": "avez mangé",
      "ils/elles": "ont mangé"
    },
    "laisser": {
      "je": "laissé",
      "tu": "as laissé",
      "il/elle/on": "a laissé",
      "nous": "avons laissé",
      "vous": "avez laissé",
      "ils/elles": "ont laissé"
    },
    "regarder": {
      "je": "regardé",
      "tu": "as regardé",
      "il/elle/on": "a regardé",
      "nous": "avons regardé",
      "vous": "avez regardé",
      "ils/elles": "ont regardé"
    },
    "répondre": {
      "je": "répondu",
      "tu": "as répondu",
      "il/elle/on": "a répondu",
      "nous": "avons répondu",
      "vous": "avez répondu",
      "ils/elles": "ont répondu"
    },
    "vivre": {
      "je": "vécu",
      "tu": "as vécu",
      "il/elle/on": "a vécu",
      "nous": "avons vécu",
      "vous": "avez vécu",
      "ils/elles": "ont vécu"
    },
    "chercher": {
      "je": "cherché",
      "tu": "as cherché",
      "il/elle/on": "a cherché",
      "nous": "avons cherché",
      "vous": "avez cherché",
      "ils/elles": "ont cherché"
    },
    "sentir": {
      "je": "senti",
      "tu": "as senti",
      "il/elle/on": "a senti",
      "nous": "avons senti",
      "vous": "avez senti",
      "ils/elles": "ont senti"
    },
    "entendre": {
      "je": "entendu",
      "tu": "as entendu",
      "il/elle/on": "a entendu",
      "nous": "avons entendu",
      "vous": "avez entendu",
      "ils/elles": "ont entendu"
    },
    "attendre": {
      "je": "attendu",
      "tu": "as attendu",
      "il/elle/on": "a attendu",
      "nous": "avons attendu",
      "vous": "avez attendu",
      "ils/elles": "ont attendu"
    },
    "sortir": {
      "je": "suis sorti",
      "tu": "es sorti",
      "il/elle/on": "est sorti",
      "nous": "sommes sortis",
      "vous": "êtes sortis",
      "ils/elles": "sont sortis"
    },
    "connaître": {
      "je": "connu",
      "tu": "as connu",
      "il/elle/on": "a connu",
      "nous": "avons connu",
      "vous": "avez connu",
      "ils/elles": "ont connu"
    },
    "arriver": {
      "je": "suis arrivé",
      "tu": "es arrivé",
      "il/elle/on": "est arrivé",
      "nous": "sommes arrivés",
      "vous": "êtes arrivés",
      "ils/elles": "sont arrivés"
    },
    "ouvrir": {
      "je": "ouvert",
      "tu": "as ouvert",
      "il/elle/on": "a ouvert",
      "nous": "avons ouvert",
      "vous": "avez ouvert",
      "ils/elles": "ont ouvert"
    },
    "perdre": {
      "je": "perdu",
      "tu": "as perdu",
      "il/elle/on": "a perdu",
      "nous": "avons perdu",
      "vous": "avez perdu",
      "ils/elles": "ont perdu"
    },
    "écrire": {
      "je": "écrit",
      "tu": "as écrit",
      "il/elle/on": "a écrit",
      "nous": "avons écrit",
      "vous": "avez écrit",
      "ils/elles": "ont écrit"
    },
    "devenir": {
      "je": "suis devenu",
      "tu": "es devenu",
      "il/elle/on": "est devenu",
      "nous": "sommes devenus",
      "vous": "êtes devenus",
      "ils/elles": "sont devenus"
    },
    "suivre": {
      "je": "suivi",
      "tu": "as suivi",
      "il/elle/on": "a suivi",
      "nous": "avons suivi",
      "vous": "avez suivi",
      "ils/elles": "ont suivi"
    },
    "montrer": {
      "je": "montré",
      "tu": "as montré",
      "il/elle/on": "a montré",
      "nous": "avons montré",
      "vous": "avez montré",
      "ils/elles": "ont montré"
    },
    "mourir": {
      "je": "suis mort",
      "tu": "es mort",
      "il/elle/on": "est mort",
      "nous": "sommes morts",
      "vous": "êtes morts",
      "ils/elles": "sont morts"
    },
    "appeler": {
      "je": "appelé",
      "tu": "as appelé",
      "il/elle/on": "a appelé",
      "nous": "avons appelé",
      "vous": "avez appelé",
      "ils/elles": "ont appelé"
    },
    "commencer": {
      "je": "commencé",
      "tu": "as commencé",
      "il/elle/on": "a commencé",
      "nous": "avons commencé",
      "vous": "avez commencé",
      "ils/elles": "ont commencé"
    },
    "finir": {
      "je": "fini",
      "tu": "as fini",
      "il/elle/on": "a fini",
      "nous": "avons fini",
      "vous": "avez fini",
      "ils/elles": "ont fini"
    },
    "servir": {
      "je": "servi",
      "tu": "as servi",
      "il/elle/on": "a servi",
      "nous": "avons servi",
      "vous": "avez servi",
      "ils/elles": "ont servi"
    },
    "lire": {
      "je": "lu",
      "tu": "as lu",
      "il/elle/on": "a lu",
      "nous": "avons lu",
      "vous": "avez lu",
      "ils/elles": "ont lu"
    },
    "travailler": {
      "je": "travaillé",
      "tu": "as travaillé",
      "il/elle/on": "a travaillé",
      "nous": "avons travaillé",
      "vous": "avez travaillé",
      "ils/elles": "ont travaillé"
    },
    "jouer": {
      "je": "joué",
      "tu": "as joué",
      "il/elle/on": "a joué",
      "nous": "avons joué",
      "vous": "avez joué",
      "ils/elles": "ont joué"
    },
    "recevoir": {
      "je": "reçu",
      "tu": "as reçu",
      "il/elle/on": "a reçu",
      "nous": "avons reçu",
      "vous": "avez reçu",
      "ils/elles": "ont reçu"
    },
    "changer": {
      "je": "changé",
      "tu": "as changé",
      "il/elle/on": "a changé",
      "nous": "avons changé",
      "vous": "avez changé",
      "ils/elles": "ont changé"
    },
    "gagner": {
      "je": "gagné",
      "tu": "as gagné",
      "il/elle/on": "a gagné",
      "nous": "avons gagné",
      "vous": "avez gagné",
      "ils/elles": "ont gagné"
    },
    "boire": {
      "je": "bu",
      "tu": "as bu",
      "il/elle/on": "a bu",
      "nous": "avons bu",
      "vous": "avez bu",
      "ils/elles": "ont bu"
    },
    "décider": {
      "je": "décidé",
      "tu": "as décidé",
      "il/elle/on": "a décidé",
      "nous": "avons décidé",
      "vous": "avez décidé",
      "ils/elles": "ont décidé"
    },
    "oublier": {
      "je": "oublié",
      "tu": "as oublié",
      "il/elle/on": "a oublié",
      "nous": "avons oublié",
      "vous": "avez oublié",
      "ils/elles": "ont oublié"
    },
    "dormir": {
      "je": "dormi",
      "tu": "as dormi",
      "il/elle/on": "a dormi",
      "nous": "avons dormi",
      "vous": "avez dormi",
      "ils/elles": "ont dormi"
    },
    "courir": {
      "je": "couru",
      "tu": "as couru",
      "il/elle/on": "a couru",
      "nous": "avons couru",
      "vous": "avez couru",
      "ils/elles": "ont couru"
    },
    "acheter": {
      "je": "acheté",
      "tu": "as acheté",
      "il/elle/on": "a acheté",
      "nous": "avons acheté",
      "vous": "avez acheté",
      "ils/elles": "ont acheté"
    },
    "payer": {
      "je": "payé",
      "tu": "as payé",
      "il/elle/on": "a payé",
      "nous": "avons payé",
      "vous": "avez payé",
      "ils/elles": "ont payé"
    },
    "choisir": {
      "je": "choisi",
      "tu": "as choisi",
      "il/elle/on": "a choisi",
      "nous": "avons choisi",
      "vous": "avez choisi",
      "ils/elles": "ont choisi"
    },
    "essayer": {
      "je": "essayé",
      "tu": "as essayé",
      "il/elle/on": "a essayé",
      "nous": "avons essayé",
      "vous": "avez essayé",
      "ils/elles": "ont essayé"
    },
    "envoyer": {
      "je": "envoyé",
      "tu": "as envoyé",
      "il/elle/on": "a envoyé",
      "nous": "avons envoyé",
      "vous": "avez envoyé",
      "ils/elles": "ont envoyé"
    },
    "rentrer": {
      "je": "suis rentré",
      "tu": "es rentré",
      "il/elle/on": "est rentré",
      "nous": "sommes rentrés",
      "vous": "êtes rentrés",
      "ils/elles": "sont rentrés"
    },
    "porter": {
      "je": "porté",
      "tu": "as porté",
      "il/elle/on": "a porté",
      "nous": "avons porté",
      "vous": "avez porté",
      "ils/elles": "ont porté"
    },
    "marcher": {
      "je": "marché",
      "tu": "as marché",
      "il/elle/on": "a marché",
      "nous": "avons marché",
      "vous": "avez marché",
      "ils/elles": "ont marché"
    },
    "monter": {
      "je": "suis monté",
      "tu": "es monté",
      "il/elle/on": "est monté",
      "nous": "sommes montés",
      "vous": "êtes montés",
      "ils/elles": "sont montés"
    },
    "aider": {
      "je": "aidé",
      "tu": "as aidé",
      "il/elle/on": "a aidé",
      "nous": "avons aidé",
      "vous": "avez aidé",
      "ils/elles": "ont aidé"
    },
    "tomber": {
      "je": "suis tombé",
      "tu": "es tombé",
      "il/elle/on": "est tombé",
      "nous": "sommes tombés",
      "vous": "êtes tombés",
      "ils/elles": "sont tombés"
    },
    "conduire": {
      "je": "conduit",
      "tu": "as conduit",
      "il/elle/on": "a conduit",
      "nous": "avons conduit",
      "vous": "avez conduit",
      "ils/elles": "ont conduit"
    },
    "expliquer": {
      "je": "expliqué",
      "tu": "as expliqué",
      "il/elle/on": "a expliqué",
      "nous": "avons expliqué",
      "vous": "avez expliqué",
      "ils/elles": "ont expliqué"
    },
    "apprendre": {
      "je": "appris",
      "tu": "as appris",
      "il/elle/on": "a appris",
      "nous": "avons appris",
      "vous": "avez appris",
      "ils/elles": "ont appris"
    },
    "produire": {
      "je": "produit",
      "tu": "as produit",
      "il/elle/on": "a produit",
      "nous": "avons produit",
      "vous": "avez produit",
      "ils/elles": "ont produit"
    },
    "préparer": {
      "je": "préparé",
      "tu": "as préparé",
      "il/elle/on": "a préparé",
      "nous": "avons préparé",
      "vous": "avez préparé",
      "ils/elles": "ont préparé"
    },
    "chanter": {
      "je": "chanté",
      "tu": "as chanté",
      "il/elle/on": "a chanté",
      "nous": "avons chanté",
      "vous": "avez chanté",
      "ils/elles": "ont chanté"
    },
    "danser": {
      "je": "dansé",
      "tu": "as dansé",
      "il/elle/on": "a dansé",
      "nous": "avons dansé",
      "vous": "avez dansé",
      "ils/elles": "ont dansé"
    },
    "raconter": {
      "je": "raconté",
      "tu": "as raconté",
      "il/elle/on": "a raconté",
      "nous": "avons raconté",
      "vous": "avez raconté",
      "ils/elles": "ont raconté"
    },
    "espérer": {
      "je": "espéré",
      "tu": "as espéré",
      "il/elle/on": "a espéré",
      "nous": "avons espéré",
      "vous": "avez espéré",
      "ils/elles": "ont espéré"
    },
    "offrir": {
      "je": "offert",
      "tu": "as offert",
      "il/elle/on": "a offert",
      "nous": "avons offert",
      "vous": "avez offert",
      "ils/elles": "ont offert"
    },
    "construire": {
      "je": "construit",
      "tu": "as construit",
      "il/elle/on": "a construit",
      "nous": "avons construit",
      "vous": "avez construit",
      "ils/elles": "ont construit"
    },
    "détruire": {
      "je": "détruit",
      "tu": "as détruit",
      "il/elle/on": "a détruit",
      "nous": "avons détruit",
      "vous": "avez détruit",
      "ils/elles": "ont détruit"
    },
    "traduire": {
      "je": "traduit",
      "tu": "as traduit",
      "il/elle/on": "a traduit",
      "nous": "avons traduit",
      "vous": "avez traduit",
      "ils/elles": "ont traduit"
    },
    "revenir": {
      "je": "suis revenu",
      "tu": "es revenu",
      "il/elle/on": "est revenu",
      "nous": "sommes revenus",
      "vous": "êtes revenus",
      "ils/elles": "sont revenus"
    },
    "entrer": {
      "je": "suis entré",
      "tu": "es entré",
      "il/elle/on": "est entré",
      "nous": "sommes entrés",
      "vous": "êtes entrés",
      "ils/elles": "sont entrés"
    },
    "naître": {
      "je": "suis né",
      "tu": "es né",
      "il/elle/on": "est né",
      "nous": "sommes nés",
      "vous": "êtes nés",
      "ils/elles": "sont nés"
    },
    "descendre": {
      "je": "suis descendu",
      "tu": "es descendu",
      "il/elle/on": "est descendu",
      "nous": "sommes descendus",
      "vous": "êtes descendus",
      "ils/elles": "sont descendus"
    },
    "plaire": {
      "je": "plu",
      "tu": "as plu",
      "il/elle/on": "a plu",
      "nous": "avons plu",
      "vous": "avez plu",
      "ils/elles": "ont plu"
    },
    "sourire": {
      "je": "souri",
      "tu": "as souri",
      "il/elle/on": "a souri",
      "nous": "avons souri",
      "vous": "avez souri",
      "ils/elles": "ont souri"
    },
    "rire": {
      "je": "ri",
      "tu": "as ri",
      "il/elle/on": "a ri",
      "nous": "avons ri",
      "vous": "avez ri",
      "ils/elles": "ont ri"
    },
    "vendre": {
      "je": "vendu",
      "tu": "as vendu",
      "il/elle/on": "a vendu",
      "nous": "avons vendu",
      "vous": "avez vendu",
      "ils/elles": "ont vendu"
    },
    "permettre": {
      "je": "permis",
      "tu": "as permis",
      "il/elle/on": "a permis",
      "nous": "avons permis",
      "vous": "avez permis",
      "ils/elles": "ont permis"
    },
    "promettre": {
      "je": "promis",
      "tu": "as promis",
      "il/elle/on": "a promis",
      "nous": "avons promis",
      "vous": "avez promis",
      "ils/elles": "ont promis"
    },
    "paraître": {
      "je": "paru",
      "tu": "as paru",
      "il/elle/on": "a paru",
      "nous": "avons paru",
      "vous": "avez paru",
      "ils/elles": "ont paru"
    },
    "disparaître": {
      "je": "disparu",
      "tu": "as disparu",
      "il/elle/on": "a disparu",
      "nous": "avons disparu",
      "vous": "avez disparu",
      "ils/elles": "ont disparu"
    },
    "reconnaître": {
      "je": "reconnu",
      "tu": "as reconnu",
      "il/elle/on": "a reconnu",
      "nous": "avons reconnu",
      "vous": "avez reconnu",
      "ils/elles": "ont reconnu"
    },
    "battre": {
      "je": "battu",
      "tu": "as battu",
      "il/elle/on": "a battu",
      "nous": "avons battu",
      "vous": "avez battu",
      "ils/elles": "ont battu"
    },
    "mentir": {
      "je": "menti",
      "tu": "as menti",
      "il/elle/on": "a menti",
      "nous": "avons menti",
      "vous": "avez menti",
      "ils/elles": "ont menti"
    },
    "partager": {
      "je": "partagé",
      "tu": "as partagé",
      "il/elle/on": "a partagé",
      "nous": "avons partagé",
      "vous": "avez partagé",
      "ils/elles": "ont partagé"
    },
    "protéger": {
      "je": "protégé",
      "tu": "as protégé",
      "il/elle/on": "a protégé",
      "nous": "avons protégé",
      "vous": "avez protégé",
      "ils/elles": "ont protégé"
    },
    "voyager": {
      "je": "voyagé",
      "tu": "as voyagé",
      "il/elle/on": "a voyagé",
      "nous": "avons voyagé",
      "vous": "avez voyagé",
      "ils/elles": "ont voyagé"
    },
    "étudier": {
      "je": "étudié",
      "tu": "as étudié",
      "il/elle/on": "a étudié",
      "nous": "avons étudié",
      "vous": "avez étudié",
      "ils/elles": "ont étudié"
    },
    "réussir": {
      "je": "réussi",
      "tu": "as réussi",
      "il/elle/on": "a réussi",
      "nous": "avons réussi",
      "vous": "avez réussi",
      "ils/elles": "ont réussi"
    },
    "grandir": {
      "je": "grandi",
      "tu": "as grandi",
      "il/elle/on": "a grandi",
      "nous": "avons grandi",
      "vous": "avez grandi",
      "ils/elles": "ont grandi"
    },
    "vieillir": {
      "je": "vieilli",
      "tu": "as vieilli",
      "il/elle/on": "a vieilli",
      "nous": "avons vieilli",
      "vous": "avez vieilli",
      "ils/elles": "ont vieilli"
    },
    "rougir": {
      "je": "rougi",
      "tu": "as rougi",
      "il/elle/on": "a rougi",
      "nous": "avons rougi",
      "vous": "avez rougi",
      "ils/elles": "ont rougi"
    },
    "maigrir": {
      "je": "maigri",
      "tu": "as maigri",
      "il/elle/on": "a maigri",
      "nous": "avons maigri",
      "vous": "avez maigri",
      "ils/elles": "ont maigri"
    },
    "grossir": {
      "je": "grossi",
      "tu": "as grossi",
      "il/elle/on": "a grossi",
      "nous": "avons grossi",
      "vous": "avez grossi",
      "ils/elles": "ont grossi"
    },
    "obéir": {
      "je": "obéi",
      "tu": "as obéi",
      "il/elle/on": "a obéi",
      "nous": "avons obéi",
      "vous": "avez obéi",
      "ils/elles": "ont obéi"
    },
    "désobéir": {
      "je": "désobéi",
      "tu": "as désobéi",
      "il/elle/on": "a désobéi",
      "nous": "avons désobéi",
      "vous": "avez désobéi",
      "ils/elles": "ont désobéi"
    },
    "réfléchir": {
      "je": "réfléchi",
      "tu": "as réfléchi",
      "il/elle/on": "a réfléchi",
      "nous": "avons réfléchi",
      "vous": "avez réfléchi",
      "ils/elles": "ont réfléchi"
    },
    "remplir": {
      "je": "rempli",
      "tu": "as rempli",
      "il/elle/on": "a rempli",
      "nous": "avons rempli",
      "vous": "avez rempli",
      "ils/elles": "ont rempli"
    },
    "punir": {
      "je": "puni",
      "tu": "as puni",
      "il/elle/on": "a puni",
      "nous": "avons puni",
      "vous": "avez puni",
      "ils/elles": "ont puni"
    },
    "guérir": {
      "je": "guéri",
      "tu": "as guéri",
      "il/elle/on": "a guéri",
      "nous": "avons guéri",
      "vous": "avez guéri",
      "ils/elles": "ont guéri"
    },
    "bâtir": {
      "je": "bâti",
      "tu": "as bâti",
      "il/elle/on": "a bâti",
      "nous": "avons bâti",
      "vous": "avez bâti",
      "ils/elles": "ont bâti"
    },
    "nourrir": {
      "je": "nourri",
      "tu": "as nourri",
      "il/elle/on": "a nourri",
      "nous": "avons nourri",
      "vous": "avez nourri",
      "ils/elles": "ont nourri"
    },
    "avertir": {
      "je": "averti",
      "tu": "as averti",
      "il/elle/on": "a averti",
      "nous": "avons averti",
      "vous": "avez averti",
      "ils/elles": "ont averti"
    },
    "agir": {
      "je": "agi",
      "tu": "as agi",
      "il/elle/on": "a agi",
      "nous": "avons agi",
      "vous": "avez agi",
      "ils/elles": "ont agi"
    },
    "réagir": {
      "je": "réagi",
      "tu": "as réagi",
      "il/elle/on": "a réagi",
      "nous": "avons réagi",
      "vous": "avez réagi",
      "ils/elles": "ont réagi"
    },
    "saisir": {
      "je": "saisi",
      "tu": "as saisi",
      "il/elle/on": "a saisi",
      "nous": "avons saisi",
      "vous": "avez saisi",
      "ils/elles": "ont saisi"
    },
    "établir": {
      "je": "établi",
      "tu": "as établi",
      "il/elle/on": "a établi",
      "nous": "avons établi",
      "vous": "avez établi",
      "ils/elles": "ont établi"
    },
    "investir": {
      "je": "investi",
      "tu": "as investi",
      "il/elle/on": "a investi",
      "nous": "avons investi",
      "vous": "avez investi",
      "ils/elles": "ont investi"
    },
    "couvrir": {
      "je": "couvert",
      "tu": "as couvert",
      "il/elle/on": "a couvert",
      "nous": "avons couvert",
      "vous": "avez couvert",
      "ils/elles": "ont couvert"
    },
    "découvrir": {
      "je": "découvert",
      "tu": "as découvert",
      "il/elle/on": "a découvert",
      "nous": "avons découvert",
      "vous": "avez découvert",
      "ils/elles": "ont découvert"
    },
    "souffrir": {
      "je": "souffert",
      "tu": "as souffert",
      "il/elle/on": "a souffert",
      "nous": "avons souffert",
      "vous": "avez souffert",
      "ils/elles": "ont souffert"
    },
    "cueillir": {
      "je": "cueilli",
      "tu": "as cueilli",
      "il/elle/on": "a cueilli",
      "nous": "avons cueilli",
      "vous": "avez cueilli",
      "ils/elles": "ont cueilli"
    },
    "accueillir": {
      "je": "accueilli",
      "tu": "as accueilli",
      "il/elle/on": "a accueilli",
      "nous": "avons accueilli",
      "vous": "avez accueilli",
      "ils/elles": "ont accueilli"
    },
    "assaillir": {
      "je": "assailli",
      "tu": "as assailli",
      "il/elle/on": "a assailli",
      "nous": "avons assailli",
      "vous": "avez assailli",
      "ils/elles": "ont assailli"
    },
    "tressaillir": {
      "je": "tressailli",
      "tu": "as tressailli",
      "il/elle/on": "a tressailli",
      "nous": "avons tressailli",
      "vous": "avez tressailli",
      "ils/elles": "ont tressailli"
    },
    "fuir": {
      "je": "fui",
      "tu": "as fui",
      "il/elle/on": "a fui",
      "nous": "avons fui",
      "vous": "avez fui",
      "ils/elles": "ont fui"
    },
    "vêtir": {
      "je": "vêtu",
      "tu": "as vêtu",
      "il/elle/on": "a vêtu",
      "nous": "avons vêtu",
      "vous": "avez vêtu",
      "ils/elles": "ont vêtu"
    },
    "acquérir": {
      "je": "acquis",
      "tu": "as acquis",
      "il/elle/on": "a acquis",
      "nous": "avons acquis",
      "vous": "avez acquis",
      "ils/elles": "ont acquis"
    },
    "conquérir": {
      "je": "conquis",
      "tu": "as conquis",
      "il/elle/on": "a conquis",
      "nous": "avons conquis",
      "vous": "avez conquis",
      "ils/elles": "ont conquis"
    },
    "bouillir": {
      "je": "bouilli",
      "tu": "as bouilli",
      "il/elle/on": "a bouilli",
      "nous": "avons bouilli",
      "vous": "avez bouilli",
      "ils/elles": "ont bouilli"
    },
    "faillir": {
      "je": "failli",
      "tu": "as failli",
      "il/elle/on": "a failli",
      "nous": "avons failli",
      "vous": "avez failli",
      "ils/elles": "ont failli"
    },
    "haïr": {
      "je": "haï",
      "tu": "as haï",
      "il/elle/on": "a haï",
      "nous": "avons haï",
      "vous": "avez haï",
      "ils/elles": "ont haï"
    },
    "ouïr": {
      "je": "ouï",
      "tu": "as ouï",
      "il/elle/on": "a ouï",
      "nous": "avons ouï",
      "vous": "avez ouï",
      "ils/elles": "ont ouï"
    },
    "réduire": {
      "je": "réduit",
      "tu": "as réduit",
      "il/elle/on": "a réduit",
      "nous": "avons réduit",
      "vous": "avez réduit",
      "ils/elles": "ont réduit"
    },
    "séduire": {
      "je": "séduit",
      "tu": "as séduit",
      "il/elle/on": "a séduit",
      "nous": "avons séduit",
      "vous": "avez séduit",
      "ils/elles": "ont séduit"
    },
    "introduire": {
      "je": "introduit",
      "tu": "as introduit",
      "il/elle/on": "a introduit",
      "nous": "avons introduit",
      "vous": "avez introduit",
      "ils/elles": "ont introduit"
    },
    "cuire": {
      "je": "cuit",
      "tu": "as cuit",
      "il/elle/on": "a cuit",
      "nous": "avons cuit",
      "vous": "avez cuit",
      "ils/elles": "ont cuit"
    },
    "nuire": {
      "je": "nui",
      "tu": "as nui",
      "il/elle/on": "a nui",
      "nous": "avons nui",
      "vous": "avez nui",
      "ils/elles": "ont nui"
    },
    "luire": {
      "je": "lui",
      "tu": "as lui",
      "il/elle/on": "a lui",
      "nous": "avons lui",
      "vous": "avez lui",
      "ils/elles": "ont lui"
    },
    "joindre": {
      "je": "joint",
      "tu": "as joint",
      "il/elle/on": "a joint",
      "nous": "avons joint",
      "vous": "avez joint",
      "ils/elles": "ont joint"
    },
    "craindre": {
      "je": "craint",
      "tu": "as craint",
      "il/elle/on": "a craint",
      "nous": "avons craint",
      "vous": "avez craint",
      "ils/elles": "ont craint"
    },
    "peindre": {
      "je": "peint",
      "tu": "as peint",
      "il/elle/on": "a peint",
      "nous": "avons peint",
      "vous": "avez peint",
      "ils/elles": "ont peint"
    },
    "plaindre": {
      "je": "plaint",
      "tu": "as plaint",
      "il/elle/on": "a plaint",
      "nous": "avons plaint",
      "vous": "avez plaint",
      "ils/elles": "ont plaint"
    },
    "éteindre": {
      "je": "éteint",
      "tu": "as éteint",
      "il/elle/on": "a éteint",
      "nous": "avons éteint",
      "vous": "avez éteint",
      "ils/elles": "ont éteint"
    },
    "atteindre": {
      "je": "atteint",
      "tu": "as atteint",
      "il/elle/on": "a atteint",
      "nous": "avons atteint",
      "vous": "avez atteint",
      "ils/elles": "ont atteint"
    },
    "restreindre": {
      "je": "restreint",
      "tu": "as restreint",
      "il/elle/on": "a restreint",
      "nous": "avons restreint",
      "vous": "avez restreint",
      "ils/elles": "ont restreint"
    },
    "feindre": {
      "je": "feint",
      "tu": "as feint",
      "il/elle/on": "a feint",
      "nous": "avons feint",
      "vous": "avez feint",
      "ils/elles": "ont feint"
    },
    "geindre": {
      "je": "geint",
      "tu": "as geint",
      "il/elle/on": "a geint",
      "nous": "avons geint",
      "vous": "avez geint",
      "ils/elles": "ont geint"
    },
    "contraindre": {
      "je": "contraint",
      "tu": "as contraint",
      "il/elle/on": "a contraint",
      "nous": "avons contraint",
      "vous": "avez contraint",
      "ils/elles": "ont contraint"
    },
    "résoudre": {
      "je": "résolu",
      "tu": "as résolu",
      "il/elle/on": "a résolu",
      "nous": "avons résolu",
      "vous": "avez résolu",
      "ils/elles": "ont résolu"
    },
    "absoudre": {
      "je": "absous",
      "tu": "as absous",
      "il/elle/on": "a absous",
      "nous": "avons absous",
      "vous": "avez absous",
      "ils/elles": "ont absous"
    },
    "dissoudre": {
      "je": "dissous",
      "tu": "as dissous",
      "il/elle/on": "a dissous",
      "nous": "avons dissous",
      "vous": "avez dissous",
      "ils/elles": "ont dissous"
    },
    "coudre": {
      "je": "cousu",
      "tu": "as cousu",
      "il/elle/on": "a cousu",
      "nous": "avons cousu",
      "vous": "avez cousu",
      "ils/elles": "ont cousu"
    },
    "moudre": {
      "je": "moulu",
      "tu": "as moulu",
      "il/elle/on": "a moulu",
      "nous": "avons moulu",
      "vous": "avez moulu",
      "ils/elles": "ont moulu"
    },
    "poursuivre": {
      "je": "poursuivi",
      "tu": "as poursuivi",
      "il/elle/on": "a poursuivi",
      "nous": "avons poursuivi",
      "vous": "avez poursuivi",
      "ils/elles": "ont poursuivi"
    },
    "survivre": {
      "je": "survécu",
      "tu": "as survécu",
      "il/elle/on": "a survécu",
      "nous": "avons survécu",
      "vous": "avez survécu",
      "ils/elles": "ont survécu"
    },
    "revivre": {
      "je": "revécu",
      "tu": "as revécu",
      "il/elle/on": "a revécu",
      "nous": "avons revécu",
      "vous": "avez revécu",
      "ils/elles": "ont revécu"
    },
    "conclure": {
      "je": "conclu",
      "tu": "as conclu",
      "il/elle/on": "a conclu",
      "nous": "avons conclu",
      "vous": "avez conclu",
      "ils/elles": "ont conclu"
    },
    "exclure": {
      "je": "exclu",
      "tu": "as exclu",
      "il/elle/on": "a exclu",
      "nous": "avons exclu",
      "vous": "avez exclu",
      "ils/elles": "ont exclu"
    },
    "inclure": {
      "je": "inclus",
      "tu": "as inclus",
      "il/elle/on": "a inclus",
      "nous": "avons inclus",
      "vous": "avez inclus",
      "ils/elles": "ont inclus"
    },
    "élire": {
      "je": "élu",
      "tu": "as élu",
      "il/elle/on": "a élu",
      "nous": "avons élu",
      "vous": "avez élu",
      "ils/elles": "ont élu"
    },
    "relire": {
      "je": "relu",
      "tu": "as relu",
      "il/elle/on": "a relu",
      "nous": "avons relu",
      "vous": "avez relu",
      "ils/elles": "ont relu"
    },
    "interdire": {
      "je": "interdit",
      "tu": "as interdit",
      "il/elle/on": "a interdit",
      "nous": "avons interdit",
      "vous": "avez interdit",
      "ils/elles": "ont interdit"
    },
    "prédire": {
      "je": "prédit",
      "tu": "as prédit",
      "il/elle/on": "a prédit",
      "nous": "avons prédit",
      "vous": "avez prédit",
      "ils/elles": "ont prédit"
    },
    "médire": {
      "je": "médit",
      "tu": "as médit",
      "il/elle/on": "a médit",
      "nous": "avons médit",
      "vous": "avez médit",
      "ils/elles": "ont médit"
    },
    "contredire": {
      "je": "contredit",
      "tu": "as contredit",
      "il/elle/on": "a contredit",
      "nous": "avons contredit",
      "vous": "avez contredit",
      "ils/elles": "ont contredit"
    },
    "suffire": {
      "je": "suffi",
      "tu": "as suffi",
      "il/elle/on": "a suffi",
      "nous": "avons suffi",
      "vous": "avez suffi",
      "ils/elles": "ont suffi"
    },
    "circoncire": {
      "je": "circoncis",
      "tu": "as circoncis",
      "il/elle/on": "a circoncis",
      "nous": "avons circoncis",
      "vous": "avez circoncis",
      "ils/elles": "ont circoncis"
    },
    "déplaire": {
      "je": "déplu",
      "tu": "as déplu",
      "il/elle/on": "a déplu",
      "nous": "avons déplu",
      "vous": "avez déplu",
      "ils/elles": "ont déplu"
    },
    "taire": {
      "je": "tu",
      "tu": "as tu",
      "il/elle/on": "a tu",
      "nous": "avons tu",
      "vous": "avez tu",
      "ils/elles": "ont tu"
    },
    "apparaître": {
      "je": "apparu",
      "tu": "as apparu",
      "il/elle/on": "a apparu",
      "nous": "avons apparu",
      "vous": "avez apparu",
      "ils/elles": "ont apparu"
    },
    "paître": {
      "je": "pu",
      "tu": "as pu",
      "il/elle/on": "a pu",
      "nous": "avons pu",
      "vous": "avez pu",
      "ils/elles": "ont pu"
    },
    "combattre": {
      "je": "combattu",
      "tu": "as combattu",
      "il/elle/on": "a combattu",
      "nous": "avons combattu",
      "vous": "avez combattu",
      "ils/elles": "ont combattu"
    },
    "abattre": {
      "je": "abattu",
      "tu": "as abattu",
      "il/elle/on": "a abattu",
      "nous": "avons abattu",
      "vous": "avez abattu",
      "ils/elles": "ont abattu"
    },
    "débattre": {
      "je": "débattu",
      "tu": "as débattu",
      "il/elle/on": "a débattu",
      "nous": "avons débattu",
      "vous": "avez débattu",
      "ils/elles": "ont débattu"
    },
    "admettre": {
      "je": "admis",
      "tu": "as admis",
      "il/elle/on": "a admis",
      "nous": "avons admis",
      "vous": "avez admis",
      "ils/elles": "ont admis"
    },
    "commettre": {
      "je": "commis",
      "tu": "as commis",
      "il/elle/on": "a commis",
      "nous": "avons commis",
      "vous": "avez commis",
      "ils/elles": "ont commis"
    },
    "compromettre": {
      "je": "compromis",
      "tu": "as compromis",
      "il/elle/on": "a compromis",
      "nous": "avons compromis",
      "vous": "avez compromis",
      "ils/elles": "ont compromis"
    },
    "remettre": {
      "je": "remis",
      "tu": "as remis",
      "il/elle/on": "a remis",
      "nous": "avons remis",
      "vous": "avez remis",
      "ils/elles": "ont remis"
    },
    "soumettre": {
      "je": "soumis",
      "tu": "as soumis",
      "il/elle/on": "a soumis",
      "nous": "avons soumis",
      "vous": "avez soumis",
      "ils/elles": "ont soumis"
    },
    "transmettre": {
      "je": "transmis",
      "tu": "as transmis",
      "il/elle/on": "a transmis",
      "nous": "avons transmis",
      "vous": "avez transmis",
      "ils/elles": "ont transmis"
    },
    "entreprendre": {
      "je": "entrepris",
      "tu": "as entrepris",
      "il/elle/on": "a entrepris",
      "nous": "avons entrepris",
      "vous": "avez entrepris",
      "ils/elles": "ont entrepris"
    },
    "reprendre": {
      "je": "repris",
      "tu": "as repris",
      "il/elle/on": "a repris",
      "nous": "avons repris",
      "vous": "avez repris",
      "ils/elles": "ont repris"
    },
    "surprendre": {
      "je": "surpris",
      "tu": "as surpris",
      "il/elle/on": "a surpris",
      "nous": "avons surpris",
      "vous": "avez surpris",
      "ils/elles": "ont surpris"
    },
    "rompre": {
      "je": "rompu",
      "tu": "as rompu",
      "il/elle/on": "a rompu",
      "nous": "avons rompu",
      "vous": "avez rompu",
      "ils/elles": "ont rompu"
    },
    "corrompre": {
      "je": "corrompu",
      "tu": "as corrompu",
      "il/elle/on": "a corrompu",
      "nous": "avons corrompu",
      "vous": "avez corrompu",
      "ils/elles": "ont corrompu"
    },
    "interrompre": {
      "je": "interrompu",
      "tu": "as interrompu",
      "il/elle/on": "a interrompu",
      "nous": "avons interrompu",
      "vous": "avez interrompu",
      "ils/elles": "ont interrompu"
    },
    "vaincre": {
      "je": "vaincu",
      "tu": "as vaincu",
      "il/elle/on": "a vaincu",
      "nous": "avons vaincu",
      "vous": "avez vaincu",
      "ils/elles": "ont vaincu"
    },
    "convaincre": {
      "je": "convaincu",
      "tu": "as convaincu",
      "il/elle/on": "a convaincu",
      "nous": "avons convaincu",
      "vous": "avez convaincu",
      "ils/elles": "ont convaincu"
    },
    "amener": {
      "je": "amené",
      "tu": "as amené",
      "il/elle/on": "a amené",
      "nous": "avons amené",
      "vous": "avez amené",
      "ils/elles": "ont amené"
    },
    "emmener": {
      "je": "emmené",
      "tu": "as emmené",
      "il/elle/on": "a emmené",
      "nous": "avons emmené",
      "vous": "avez emmené",
      "ils/elles": "ont emmené"
    },
    "enlever": {
      "je": "enlevé",
      "tu": "as enlevé",
      "il/elle/on": "a enlevé",
      "nous": "avons enlevé",
      "vous": "avez enlevé",
      "ils/elles": "ont enlevé"
    },
    "geler": {
      "je": "gelé",
      "tu": "as gelé",
      "il/elle/on": "a gelé",
      "nous": "avons gelé",
      "vous": "avez gelé",
      "ils/elles": "ont gelé"
    },
    "harceler": {
      "je": "harcelé",
      "tu": "as harcelé",
      "il/elle/on": "a harcelé",
      "nous": "avons harcelé",
      "vous": "avez harcelé",
      "ils/elles": "ont harcelé"
    },
    "lever": {
      "je": "levé",
      "tu": "as levé",
      "il/elle/on": "a levé",
      "nous": "avons levé",
      "vous": "avez levé",
      "ils/elles": "ont levé"
    },
    "mener": {
      "je": "mené",
      "tu": "as mené",
      "il/elle/on": "a mené",
      "nous": "avons mené",
      "vous": "avez mené",
      "ils/elles": "ont mené"
    },
    "peler": {
      "je": "pelé",
      "tu": "as pelé",
      "il/elle/on": "a pelé",
      "nous": "avons pelé",
      "vous": "avez pelé",
      "ils/elles": "ont pelé"
    },
    "peser": {
      "je": "pesé",
      "tu": "as pesé",
      "il/elle/on": "a pesé",
      "nous": "avons pesé",
      "vous": "avez pesé",
      "ils/elles": "ont pesé"
    },
    "promener": {
      "je": "promené",
      "tu": "as promené",
      "il/elle/on": "a promené",
      "nous": "avons promené",
      "vous": "avez promené",
      "ils/elles": "ont promené"
    },
    "semer": {
      "je": "semé",
      "tu": "as semé",
      "il/elle/on": "a semé",
      "nous": "avons semé",
      "vous": "avez semé",
      "ils/elles": "ont semé"
    },
    "jeter": {
      "je": "jeté",
      "tu": "as jeté",
      "il/elle/on": "a jeté",
      "nous": "avons jeté",
      "vous": "avez jeté",
      "ils/elles": "ont jeté"
    },
    "épeler": {
      "je": "épelé",
      "tu": "as épelé",
      "il/elle/on": "a épelé",
      "nous": "avons épelé",
      "vous": "avez épelé",
      "ils/elles": "ont épelé"
    },
    "feuilleter": {
      "je": "feuilleté",
      "tu": "as feuilleté",
      "il/elle/on": "a feuilleté",
      "nous": "avons feuilleté",
      "vous": "avez feuilleté",
      "ils/elles": "ont feuilleté"
    },
    "projeter": {
      "je": "projeté",
      "tu": "as projeté",
      "il/elle/on": "a projeté",
      "nous": "avons projeté",
      "vous": "avez projeté",
      "ils/elles": "ont projeté"
    },
    "rejeter": {
      "je": "rejeté",
      "tu": "as rejeté",
      "il/elle/on": "a rejeté",
      "nous": "avons rejeté",
      "vous": "avez rejeté",
      "ils/elles": "ont rejeté"
    },
    "renouveler": {
      "je": "renouvelé",
      "tu": "as renouvelé",
      "il/elle/on": "a renouvelé",
      "nous": "avons renouvelé",
      "vous": "avez renouvelé",
      "ils/elles": "ont renouvelé"
    },
    "céder": {
      "je": "cédé",
      "tu": "as cédé",
      "il/elle/on": "a cédé",
      "nous": "avons cédé",
      "vous": "avez cédé",
      "ils/elles": "ont cédé"
    },
    "célébrer": {
      "je": "célébré",
      "tu": "as célébré",
      "il/elle/on": "a célébré",
      "nous": "avons célébré",
      "vous": "avez célébré",
      "ils/elles": "ont célébré"
    },
    "compléter": {
      "je": "complété",
      "tu": "as complété",
      "il/elle/on": "a complété",
      "nous": "avons complété",
      "vous": "avez complété",
      "ils/elles": "ont complété"
    },
    "considérer": {
      "je": "considéré",
      "tu": "as considéré",
      "il/elle/on": "a considéré",
      "nous": "avons considéré",
      "vous": "avez considéré",
      "ils/elles": "ont considéré"
    },
    "différer": {
      "je": "différé",
      "tu": "as différé",
      "il/elle/on": "a différé",
      "nous": "avons différé",
      "vous": "avez différé",
      "ils/elles": "ont différé"
    },
    "exagérer": {
      "je": "exagéré",
      "tu": "as exagéré",
      "il/elle/on": "a exagéré",
      "nous": "avons exagéré",
      "vous": "avez exagéré",
      "ils/elles": "ont exagéré"
    },
    "gérer": {
      "je": "géré",
      "tu": "as géré",
      "il/elle/on": "a géré",
      "nous": "avons géré",
      "vous": "avez géré",
      "ils/elles": "ont géré"
    },
    "inquiéter": {
      "je": "inquiété",
      "tu": "as inquiété",
      "il/elle/on": "a inquiété",
      "nous": "avons inquiété",
      "vous": "avez inquiété",
      "ils/elles": "ont inquiété"
    },
    "modérer": {
      "je": "modéré",
      "tu": "as modéré",
      "il/elle/on": "a modéré",
      "nous": "avons modéré",
      "vous": "avez modéré",
      "ils/elles": "ont modéré"
    },
    "pénétrer": {
      "je": "pénétré",
      "tu": "as pénétré",
      "il/elle/on": "a pénétré",
      "nous": "avons pénétré",
      "vous": "avez pénétré",
      "ils/elles": "ont pénétré"
    },
    "posséder": {
      "je": "possédé",
      "tu": "as possédé",
      "il/elle/on": "a possédé",
      "nous": "avons possédé",
      "vous": "avez possédé",
      "ils/elles": "ont possédé"
    },
    "préférer": {
      "je": "préféré",
      "tu": "as préféré",
      "il/elle/on": "a préféré",
      "nous": "avons préféré",
      "vous": "avez préféré",
      "ils/elles": "ont préféré"
    },
    "refléter": {
      "je": "reflété",
      "tu": "as reflété",
      "il/elle/on": "a reflété",
      "nous": "avons reflété",
      "vous": "avez reflété",
      "ils/elles": "ont reflété"
    },
    "répéter": {
      "je": "répété",
      "tu": "as répété",
      "il/elle/on": "a répété",
      "nous": "avons répété",
      "vous": "avez répété",
      "ils/elles": "ont répété"
    },
    "révéler": {
      "je": "révélé",
      "tu": "as révélé",
      "il/elle/on": "a révélé",
      "nous": "avons révélé",
      "vous": "avez révélé",
      "ils/elles": "ont révélé"
    },
    "suggérer": {
      "je": "suggéré",
      "tu": "as suggéré",
      "il/elle/on": "a suggéré",
      "nous": "avons suggéré",
      "vous": "avez suggéré",
      "ils/elles": "ont suggéré"
    },
    "zébrer": {
      "je": "zébré",
      "tu": "as zébré",
      "il/elle/on": "a zébré",
      "nous": "avons zébré",
      "vous": "avez zébré",
      "ils/elles": "ont zébré"
    },
    "nettoyer": {
      "je": "nettoyé",
      "tu": "as nettoyé",
      "il/elle/on": "a nettoyé",
      "nous": "avons nettoyé",
      "vous": "avez nettoyé",
      "ils/elles": "ont nettoyé"
    },
    "appuyer": {
      "je": "appuyé",
      "tu": "as appuyé",
      "il/elle/on": "a appuyé",
      "nous": "avons appuyé",
      "vous": "avez appuyé",
      "ils/elles": "ont appuyé"
    },
    "ennuyer": {
      "je": "ennuyé",
      "tu": "as ennuyé",
      "il/elle/on": "a ennuyé",
      "nous": "avons ennuyé",
      "vous": "avez ennuyé",
      "ils/elles": "ont ennuyé"
    },
    "essuyer": {
      "je": "essuyé",
      "tu": "as essuyé",
      "il/elle/on": "a essuyé",
      "nous": "avons essuyé",
      "vous": "avez essuyé",
      "ils/elles": "ont essuyé"
    },
    "balayer": {
      "je": "balayé",
      "tu": "as balayé",
      "il/elle/on": "a balayé",
      "nous": "avons balayé",
      "vous": "avez balayé",
      "ils/elles": "ont balayé"
    },
    "effrayer": {
      "je": "effrayé",
      "tu": "as effrayé",
      "il/elle/on": "a effrayé",
      "nous": "avons effrayé",
      "vous": "avez effrayé",
      "ils/elles": "ont effrayé"
    },
    "aboyer": {
      "je": "aboyé",
      "tu": "as aboyé",
      "il/elle/on": "a aboyé",
      "nous": "avons aboyé",
      "vous": "avez aboyé",
      "ils/elles": "ont aboyé"
    },
    "noyer": {
      "je": "noyé",
      "tu": "as noyé",
      "il/elle/on": "a noyé",
      "nous": "avons noyé",
      "vous": "avez noyé",
      "ils/elles": "ont noyé"
    },
    "tutoyer": {
      "je": "tutoyé",
      "tu": "as tutoyé",
      "il/elle/on": "a tutoyé",
      "nous": "avons tutoyé",
      "vous": "avez tutoyé",
      "ils/elles": "ont tutoyé"
    },
    "vouvoyer": {
      "je": "vouvoyé",
      "tu": "as vouvoyé",
      "il/elle/on": "a vouvoyé",
      "nous": "avons vouvoyé",
      "vous": "avez vouvoyé",
      "ils/elles": "ont vouvoyé"
    },
    "annoncer": {
      "je": "annoncé",
      "tu": "as annoncé",
      "il/elle/on": "a annoncé",
      "nous": "avons annoncé",
      "vous": "avez annoncé",
      "ils/elles": "ont annoncé"
    },
    "avancer": {
      "je": "avancé",
      "tu": "as avancé",
      "il/elle/on": "a avancé",
      "nous": "avons avancé",
      "vous": "avez avancé",
      "ils/elles": "ont avancé"
    },
    "dénoncer": {
      "je": "dénoncé",
      "tu": "as dénoncé",
      "il/elle/on": "a dénoncé",
      "nous": "avons dénoncé",
      "vous": "avez dénoncé",
      "ils/elles": "ont dénoncé"
    },
    "divorcer": {
      "je": "divorcé",
      "tu": "as divorcé",
      "il/elle/on": "a divorcé",
      "nous": "avons divorcé",
      "vous": "avez divorcé",
      "ils/elles": "ont divorcé"
    },
    "effacer": {
      "je": "effacé",
      "tu": "as effacé",
      "il/elle/on": "a effacé",
      "nous": "avons effacé",
      "vous": "avez effacé",
      "ils/elles": "ont effacé"
    },
    "lancer": {
      "je": "lancé",
      "tu": "as lancé",
      "il/elle/on": "a lancé",
      "nous": "avons lancé",
      "vous": "avez lancé",
      "ils/elles": "ont lancé"
    },
    "menacer": {
      "je": "menacé",
      "tu": "as menacé",
      "il/elle/on": "a menacé",
      "nous": "avons menacé",
      "vous": "avez menacé",
      "ils/elles": "ont menacé"
    },
    "placer": {
      "je": "placé",
      "tu": "as placé",
      "il/elle/on": "a placé",
      "nous": "avons placé",
      "vous": "avez placé",
      "ils/elles": "ont placé"
    },
    "prononcer": {
      "je": "prononcé",
      "tu": "as prononcé",
      "il/elle/on": "a prononcé",
      "nous": "avons prononcé",
      "vous": "avez prononcé",
      "ils/elles": "ont prononcé"
    },
    "remplacer": {
      "je": "remplacé",
      "tu": "as remplacé",
      "il/elle/on": "a remplacé",
      "nous": "avons remplacé",
      "vous": "avez remplacé",
      "ils/elles": "ont remplacé"
    },
    "renoncer": {
      "je": "renoncé",
      "tu": "as renoncé",
      "il/elle/on": "a renoncé",
      "nous": "avons renoncé",
      "vous": "avez renoncé",
      "ils/elles": "ont renoncé"
    },
    "arranger": {
      "je": "arrangé",
      "tu": "as arrangé",
      "il/elle/on": "a arrangé",
      "nous": "avons arrangé",
      "vous": "avez arrangé",
      "ils/elles": "ont arrangé"
    },
    "bouger": {
      "je": "bougé",
      "tu": "as bougé",
      "il/elle/on": "a bougé",
      "nous": "avons bougé",
      "vous": "avez bougé",
      "ils/elles": "ont bougé"
    },
    "corriger": {
      "je": "corrigé",
      "tu": "as corrigé",
      "il/elle/on": "a corrigé",
      "nous": "avons corrigé",
      "vous": "avez corrigé",
      "ils/elles": "ont corrigé"
    },
    "décourager": {
      "je": "découragé",
      "tu": "as découragé",
      "il/elle/on": "a découragé",
      "nous": "avons découragé",
      "vous": "avez découragé",
      "ils/elles": "ont découragé"
    },
    "déménager": {
      "je": "déménagé",
      "tu": "as déménagé",
      "il/elle/on": "a déménagé",
      "nous": "avons déménagé",
      "vous": "avez déménagé",
      "ils/elles": "ont déménagé"
    },
    "diriger": {
      "je": "dirigé",
      "tu": "as dirigé",
      "il/elle/on": "a dirigé",
      "nous": "avons dirigé",
      "vous": "avez dirigé",
      "ils/elles": "ont dirigé"
    },
    "encourager": {
      "je": "encouragé",
      "tu": "as encouragé",
      "il/elle/on": "a encouragé",
      "nous": "avons encouragé",
      "vous": "avez encouragé",
      "ils/elles": "ont encouragé"
    },
    "engager": {
      "je": "engagé",
      "tu": "as engagé",
      "il/elle/on": "a engagé",
      "nous": "avons engagé",
      "vous": "avez engagé",
      "ils/elles": "ont engagé"
    },
    "exiger": {
      "je": "exigé",
      "tu": "as exigé",
      "il/elle/on": "a exigé",
      "nous": "avons exigé",
      "vous": "avez exigé",
      "ils/elles": "ont exigé"
    },
    "juger": {
      "je": "jugé",
      "tu": "as jugé",
      "il/elle/on": "a jugé",
      "nous": "avons jugé",
      "vous": "avez jugé",
      "ils/elles": "ont jugé"
    },
    "loger": {
      "je": "logé",
      "tu": "as logé",
      "il/elle/on": "a logé",
      "nous": "avons logé",
      "vous": "avez logé",
      "ils/elles": "ont logé"
    },
    "mélanger": {
      "je": "mélangé",
      "tu": "as mélangé",
      "il/elle/on": "a mélangé",
      "nous": "avons mélangé",
      "vous": "avez mélangé",
      "ils/elles": "ont mélangé"
    },
    "nager": {
      "je": "nagé",
      "tu": "as nagé",
      "il/elle/on": "a nagé",
      "nous": "avons nagé",
      "vous": "avez nagé",
      "ils/elles": "ont nagé"
    },
    "obliger": {
      "je": "obligé",
      "tu": "as obligé",
      "il/elle/on": "a obligé",
      "nous": "avons obligé",
      "vous": "avez obligé",
      "ils/elles": "ont obligé"
    },
    "plonger": {
      "je": "plongé",
      "tu": "as plongé",
      "il/elle/on": "a plongé",
      "nous": "avons plongé",
      "vous": "avez plongé",
      "ils/elles": "ont plongé"
    },
    "ranger": {
      "je": "rangé",
      "tu": "as rangé",
      "il/elle/on": "a rangé",
      "nous": "avons rangé",
      "vous": "avez rangé",
      "ils/elles": "ont rangé"
    },
    "rédiger": {
      "je": "rédigé",
      "tu": "as rédigé",
      "il/elle/on": "a rédigé",
      "nous": "avons rédigé",
      "vous": "avez rédigé",
      "ils/elles": "ont rédigé"
    },
    "ajouter": {
      "je": "ajouté",
      "tu": "as ajouté",
      "il/elle/on": "a ajouté",
      "nous": "avons ajouté",
      "vous": "avez ajouté",
      "ils/elles": "ont ajouté"
    },
    "durer": {
      "je": "duré",
      "tu": "as duré",
      "il/elle/on": "a duré",
      "nous": "avons duré",
      "vous": "avez duré",
      "ils/elles": "ont duré"
    },
    "écouter": {
      "je": "écouté",
      "tu": "as écouté",
      "il/elle/on": "a écouté",
      "nous": "avons écouté",
      "vous": "avez écouté",
      "ils/elles": "ont écouté"
    },
    "emprunter": {
      "je": "emprunté",
      "tu": "as emprunté",
      "il/elle/on": "a emprunté",
      "nous": "avons emprunté",
      "vous": "avez emprunté",
      "ils/elles": "ont emprunté"
    },
    "fermer": {
      "je": "fermé",
      "tu": "as fermé",
      "il/elle/on": "a fermé",
      "nous": "avons fermé",
      "vous": "avez fermé",
      "ils/elles": "ont fermé"
    },
    "garder": {
      "je": "gardé",
      "tu": "as gardé",
      "il/elle/on": "a gardé",
      "nous": "avons gardé",
      "vous": "avez gardé",
      "ils/elles": "ont gardé"
    },
    "laver": {
      "je": "lavé",
      "tu": "as lavé",
      "il/elle/on": "a lavé",
      "nous": "avons lavé",
      "vous": "avez lavé",
      "ils/elles": "ont lavé"
    },
    "pardonner": {
      "je": "pardonné",
      "tu": "as pardonné",
      "il/elle/on": "a pardonné",
      "nous": "avons pardonné",
      "vous": "avez pardonné",
      "ils/elles": "ont pardonné"
    },
    "présenter": {
      "je": "présenté",
      "tu": "as présenté",
      "il/elle/on": "a présenté",
      "nous": "avons présenté",
      "vous": "avez présenté",
      "ils/elles": "ont présenté"
    },
    "prêter": {
      "je": "prêté",
      "tu": "as prêté",
      "il/elle/on": "a prêté",
      "nous": "avons prêté",
      "vous": "avez prêté",
      "ils/elles": "ont prêté"
    },
    "quitter": {
      "je": "quitté",
      "tu": "as quitté",
      "il/elle/on": "a quitté",
      "nous": "avons quitté",
      "vous": "avez quitté",
      "ils/elles": "ont quitté"
    },
    "refuser": {
      "je": "refusé",
      "tu": "as refusé",
      "il/elle/on": "a refusé",
      "nous": "avons refusé",
      "vous": "avez refusé",
      "ils/elles": "ont refusé"
    },
    "rencontrer": {
      "je": "rencontré",
      "tu": "as rencontré",
      "il/elle/on": "a rencontré",
      "nous": "avons rencontré",
      "vous": "avez rencontré",
      "ils/elles": "ont rencontré"
    },
    "reposer": {
      "je": "reposé",
      "tu": "as reposé",
      "il/elle/on": "a reposé",
      "nous": "avons reposé",
      "vous": "avez reposé",
      "ils/elles": "ont reposé"
    },
    "rêver": {
      "je": "rêvé",
      "tu": "as rêvé",
      "il/elle/on": "a rêvé",
      "nous": "avons rêvé",
      "vous": "avez rêvé",
      "ils/elles": "ont rêvé"
    },
    "saluer": {
      "je": "salué",
      "tu": "as salué",
      "il/elle/on": "a salué",
      "nous": "avons salué",
      "vous": "avez salué",
      "ils/elles": "ont salué"
    },
    "sauter": {
      "je": "sauté",
      "tu": "as sauté",
      "il/elle/on": "a sauté",
      "nous": "avons sauté",
      "vous": "avez sauté",
      "ils/elles": "ont sauté"
    },
    "sembler": {
      "je": "semblé",
      "tu": "as semblé",
      "il/elle/on": "a semblé",
      "nous": "avons semblé",
      "vous": "avez semblé",
      "ils/elles": "ont semblé"
    },
    "signer": {
      "je": "signé",
      "tu": "as signé",
      "il/elle/on": "a signé",
      "nous": "avons signé",
      "vous": "avez signé",
      "ils/elles": "ont signé"
    },
    "téléphoner": {
      "je": "téléphoné",
      "tu": "as téléphoné",
      "il/elle/on": "a téléphoné",
      "nous": "avons téléphoné",
      "vous": "avez téléphoné",
      "ils/elles": "ont téléphoné"
    },
    "terminer": {
      "je": "terminé",
      "tu": "as terminé",
      "il/elle/on": "a terminé",
      "nous": "avons terminé",
      "vous": "avez terminé",
      "ils/elles": "ont terminé"
    },
    "traverser": {
      "je": "traversé",
      "tu": "as traversé",
      "il/elle/on": "a traversé",
      "nous": "avons traversé",
      "vous": "avez traversé",
      "ils/elles": "ont traversé"
    },
    "utiliser": {
      "je": "utilisé",
      "tu": "as utilisé",
      "il/elle/on": "a utilisé",
      "nous": "avons utilisé",
      "vous": "avez utilisé",
      "ils/elles": "ont utilisé"
    },
    "visiter": {
      "je": "visité",
      "tu": "as visité",
      "il/elle/on": "a visité",
      "nous": "avons visité",
      "vous": "avez visité",
      "ils/elles": "ont visité"
    },
    "voler": {
      "je": "volé",
      "tu": "as volé",
      "il/elle/on": "a volé",
      "nous": "avons volé",
      "vous": "avez volé",
      "ils/elles": "ont volé"
    },
    "accepter": {
      "je": "accepté",
      "tu": "as accepté",
      "il/elle/on": "a accepté",
      "nous": "avons accepté",
      "vous": "avez accepté",
      "ils/elles": "ont accepté"
    },
    "adorer": {
      "je": "adoré",
      "tu": "as adoré",
      "il/elle/on": "a adoré",
      "nous": "avons adoré",
      "vous": "avez adoré",
      "ils/elles": "ont adoré"
    },
    "apporter": {
      "je": "apporté",
      "tu": "as apporté",
      "il/elle/on": "a apporté",
      "nous": "avons apporté",
      "vous": "avez apporté",
      "ils/elles": "ont apporté"
    },
    "arrêter": {
      "je": "arrêté",
      "tu": "as arrêté",
      "il/elle/on": "a arrêté",
      "nous": "avons arrêté",
      "vous": "avez arrêté",
      "ils/elles": "ont arrêté"
    },
    "commander": {
      "je": "commandé",
      "tu": "as commandé",
      "il/elle/on": "a commandé",
      "nous": "avons commandé",
      "vous": "avez commandé",
      "ils/elles": "ont commandé"
    },
    "compter": {
      "je": "compté",
      "tu": "as compté",
      "il/elle/on": "a compté",
      "nous": "avons compté",
      "vous": "avez compté",
      "ils/elles": "ont compté"
    },
    "conseiller": {
      "je": "conseillé",
      "tu": "as conseillé",
      "il/elle/on": "a conseillé",
      "nous": "avons conseillé",
      "vous": "avez conseillé",
      "ils/elles": "ont conseillé"
    },
    "continuer": {
      "je": "continué",
      "tu": "as continué",
      "il/elle/on": "a continué",
      "nous": "avons continué",
      "vous": "avez continué",
      "ils/elles": "ont continué"
    },
    "coûter": {
      "je": "coûté",
      "tu": "as coûté",
      "il/elle/on": "a coûté",
      "nous": "avons coûté",
      "vous": "avez coûté",
      "ils/elles": "ont coûté"
    },
    "crier": {
      "je": "crié",
      "tu": "as crié",
      "il/elle/on": "a crié",
      "nous": "avons crié",
      "vous": "avez crié",
      "ils/elles": "ont crié"
    },
    "déjeuner": {
      "je": "déjeuné",
      "tu": "as déjeuné",
      "il/elle/on": "a déjeuné",
      "nous": "avons déjeuné",
      "vous": "avez déjeuné",
      "ils/elles": "ont déjeuné"
    },
    "désirer": {
      "je": "désiré",
      "tu": "as désiré",
      "il/elle/on": "a désiré",
      "nous": "avons désiré",
      "vous": "avez désiré",
      "ils/elles": "ont désiré"
    },
    "détester": {
      "je": "détesté",
      "tu": "as détesté",
      "il/elle/on": "a détesté",
      "nous": "avons détesté",
      "vous": "avez détesté",
      "ils/elles": "ont détesté"
    },
    "dessiner": {
      "je": "dessiné",
      "tu": "as dessiné",
      "il/elle/on": "a dessiné",
      "nous": "avons dessiné",
      "vous": "avez dessiné",
      "ils/elles": "ont dessiné"
    },
    "dîner": {
      "je": "dîné",
      "tu": "as dîné",
      "il/elle/on": "a dîné",
      "nous": "avons dîné",
      "vous": "avez dîné",
      "ils/elles": "ont dîné"
    },
    "discuter": {
      "je": "discuté",
      "tu": "as discuté",
      "il/elle/on": "a discuté",
      "nous": "avons discuté",
      "vous": "avez discuté",
      "ils/elles": "ont discuté"
    },
    "éviter": {
      "je": "évité",
      "tu": "as évité",
      "il/elle/on": "a évité",
      "nous": "avons évité",
      "vous": "avez évité",
      "ils/elles": "ont évité"
    },
    "excuser": {
      "je": "excusé",
      "tu": "as excusé",
      "il/elle/on": "a excusé",
      "nous": "avons excusé",
      "vous": "avez excusé",
      "ils/elles": "ont excusé"
    },
    "fumer": {
      "je": "fumé",
      "tu": "as fumé",
      "il/elle/on": "a fumé",
      "nous": "avons fumé",
      "vous": "avez fumé",
      "ils/elles": "ont fumé"
    },
    "habiter": {
      "je": "habité",
      "tu": "as habité",
      "il/elle/on": "a habité",
      "nous": "avons habité",
      "vous": "avez habité",
      "ils/elles": "ont habité"
    },
    "imaginer": {
      "je": "imaginé",
      "tu": "as imaginé",
      "il/elle/on": "a imaginé",
      "nous": "avons imaginé",
      "vous": "avez imaginé",
      "ils/elles": "ont imaginé"
    },
    "importer": {
      "je": "importé",
      "tu": "as importé",
      "il/elle/on": "a importé",
      "nous": "avons importé",
      "vous": "avez importé",
      "ils/elles": "ont importé"
    },
    "inviter": {
      "je": "invité",
      "tu": "as invité",
      "il/elle/on": "a invité",
      "nous": "avons invité",
      "vous": "avez invité",
      "ils/elles": "ont invité"
    },
    "noter": {
      "je": "noté",
      "tu": "as noté",
      "il/elle/on": "a noté",
      "nous": "avons noté",
      "vous": "avez noté",
      "ils/elles": "ont noté"
    },
    "organiser": {
      "je": "organisé",
      "tu": "as organisé",
      "il/elle/on": "a organisé",
      "nous": "avons organisé",
      "vous": "avez organisé",
      "ils/elles": "ont organisé"
    },
    "parier": {
      "je": "parié",
      "tu": "as parié",
      "il/elle/on": "a parié",
      "nous": "avons parié",
      "vous": "avez parié",
      "ils/elles": "ont parié"
    },
    "pleurer": {
      "je": "pleuré",
      "tu": "as pleuré",
      "il/elle/on": "a pleuré",
      "nous": "avons pleuré",
      "vous": "avez pleuré",
      "ils/elles": "ont pleuré"
    },
    "poser": {
      "je": "posé",
      "tu": "as posé",
      "il/elle/on": "a posé",
      "nous": "avons posé",
      "vous": "avez posé",
      "ils/elles": "ont posé"
    },
    "pousser": {
      "je": "poussé",
      "tu": "as poussé",
      "il/elle/on": "a poussé",
      "nous": "avons poussé",
      "vous": "avez poussé",
      "ils/elles": "ont poussé"
    },
    "prier": {
      "je": "prié",
      "tu": "as prié",
      "il/elle/on": "a prié",
      "nous": "avons prié",
      "vous": "avez prié",
      "ils/elles": "ont prié"
    },
    "rappeler": {
      "je": "rappelé",
      "tu": "as rappelé",
      "il/elle/on": "a rappelé",
      "nous": "avons rappelé",
      "vous": "avez rappelé",
      "ils/elles": "ont rappelé"
    },
    "remercier": {
      "je": "remercié",
      "tu": "as remercié",
      "il/elle/on": "a remercié",
      "nous": "avons remercié",
      "vous": "avez remercié",
      "ils/elles": "ont remercié"
    },
    "respecter": {
      "je": "respecté",
      "tu": "as respecté",
      "il/elle/on": "a respecté",
      "nous": "avons respecté",
      "vous": "avez respecté",
      "ils/elles": "ont respecté"
    },
    "retourner": {
      "je": "suis retourné",
      "tu": "es retourné",
      "il/elle/on": "est retourné",
      "nous": "sommes retournés",
      "vous": "êtes retournés",
      "ils/elles": "sont retournés"
    },
    "retrouver": {
      "je": "retrouvé",
      "tu": "as retrouvé",
      "il/elle/on": "a retrouvé",
      "nous": "avons retrouvé",
      "vous": "avez retrouvé",
      "ils/elles": "ont retrouvé"
    },
    "réveiller": {
      "je": "réveillé",
      "tu": "as réveillé",
      "il/elle/on": "a réveillé",
      "nous": "avons réveillé",
      "vous": "avez réveillé",
      "ils/elles": "ont réveillé"
    },
    "toucher": {
      "je": "touché",
      "tu": "as touché",
      "il/elle/on": "a touché",
      "nous": "avons touché",
      "vous": "avez touché",
      "ils/elles": "ont touché"
    },
    "tuer": {
      "je": "tué",
      "tu": "as tué",
      "il/elle/on": "a tué",
      "nous": "avons tué",
      "vous": "avez tué",
      "ils/elles": "ont tué"
    },
    "vérifier": {
      "je": "vérifié",
      "tu": "as vérifié",
      "il/elle/on": "a vérifié",
      "nous": "avons vérifié",
      "vous": "avez vérifié",
      "ils/elles": "ont vérifié"
    }
  },
  "imparfait": {
    "être": {
      "je": "j'étais",
      "tu": "étais",
      "il/elle/on": "était",
      "nous": "étions",
      "vous": "étiez",
      "ils/elles": "étaient"
    },
    "avoir": {
      "je": "j'avais",
      "tu": "avais",
      "il/elle/on": "avait",
      "nous": "avions",
      "vous": "aviez",
      "ils/elles": "avaient"
    },
    "aller": {
      "je": "j'allais",
      "tu": "allais",
      "il/elle/on": "allait",
      "nous": "allions",
      "vous": "alliez",
      "ils/elles": "allaient"
    },
    "faire": {
      "je": "faisais",
      "tu": "faisais",
      "il/elle/on": "faisait",
      "nous": "faisions",
      "vous": "faisiez",
      "ils/elles": "faisaient"
    },
    "venir": {
      "je": "venais",
      "tu": "venais",
      "il/elle/on": "venait",
      "nous": "venions",
      "vous": "veniez",
      "ils/elles": "venaient"
    },
    "pouvoir": {
      "je": "pouvais",
      "tu": "pouvais",
      "il/elle/on": "pouvait",
      "nous": "pouvions",
      "vous": "pouviez",
      "ils/elles": "pouvaient"
    },
    "vouloir": {
      "je": "voulais",
      "tu": "voulais",
      "il/elle/on": "voulait",
      "nous": "voulions",
      "vous": "vouliez",
      "ils/elles": "voulaient"
    },
    "savoir": {
      "je": "savais",
      "tu": "savais",
      "il/elle/on": "savait",
      "nous": "savions",
      "vous": "saviez",
      "ils/elles": "savaient"
    },
    "devoir": {
      "je": "devais",
      "tu": "devais",
      "il/elle/on": "devait",
      "nous": "devions",
      "vous": "deviez",
      "ils/elles": "devaient"
    },
    "dire": {
      "je": "disais",
      "tu": "disais",
      "il/elle/on": "disait",
      "nous": "disions",
      "vous": "disiez",
      "ils/elles": "disaient"
    },
    "voir": {
      "je": "voyais",
      "tu": "voyais",
      "il/elle/on": "voyait",
      "nous": "voyions",
      "vous": "voyiez",
      "ils/elles": "voyaient"
    },
    "prendre": {
      "je": "prenais",
      "tu": "prenais",
      "il/elle/on": "prenait",
      "nous": "prenions",
      "vous": "preniez",
      "ils/elles": "prenaient"
    },
    "mettre": {
      "je": "mettais",
      "tu": "mettais",
      "il/elle/on": "mettait",
      "nous": "mettions",
      "vous": "mettiez",
      "ils/elles": "mettaient"
    },
    "croire": {
      "je": "croyais",
      "tu": "croyais",
      "il/elle/on": "croyait",
      "nous": "croyions",
      "vous": "croyiez",
      "ils/elles": "croyaient"
    },
    "parler": {
      "je": "parlais",
      "tu": "parlais",
      "il/elle/on": "parlait",
      "nous": "parlions",
      "vous": "parliez",
      "ils/elles": "parlaient"
    },
    "passer": {
      "je": "passais",
      "tu": "passais",
      "il/elle/on": "passait",
      "nous": "passions",
      "vous": "passiez",
      "ils/elles": "passaient"
    },
    "trouver": {
      "je": "trouvais",
      "tu": "trouvais",
      "il/elle/on": "trouvait",
      "nous": "trouvions",
      "vous": "trouviez",
      "ils/elles": "trouvaient"
    },
    "donner": {
      "je": "donnais",
      "tu": "donnais",
      "il/elle/on": "donnait",
      "nous": "donnions",
      "vous": "donniez",
      "ils/elles": "donnaient"
    },
    "comprendre": {
      "je": "comprenais",
      "tu": "comprenais",
      "il/elle/on": "comprenait",
      "nous": "comprenions",
      "vous": "compreniez",
      "ils/elles": "comprenaient"
    },
    "partir": {
      "je": "partais",
      "tu": "partais",
      "il/elle/on": "partait",
      "nous": "partions",
      "vous": "partiez",
      "ils/elles": "partaient"
    },
    "demander": {
      "je": "demandais",
      "tu": "demandais",
      "il/elle/on": "demandait",
      "nous": "demandions",
      "vous": "demandiez",
      "ils/elles": "demandaient"
    },
    "tenir": {
      "je": "tenais",
      "tu": "tenais",
      "il/elle/on": "tenait",
      "nous": "tenions",
      "vous": "teniez",
      "ils/elles": "tenaient"
    },
    "aimer": {
      "je": "j'aimais",
      "tu": "aimais",
      "il/elle/on": "aimait",
      "nous": "aimions",
      "vous": "aimiez",
      "ils/elles": "aimaient"
    },
    "penser": {
      "je": "pensais",
      "tu": "pensais",
      "il/elle/on": "pensait",
      "nous": "pensions",
      "vous": "pensiez",
      "ils/elles": "pensaient"
    },
    "rester": {
      "je": "restais",
      "tu": "restais",
      "il/elle/on": "restait",
      "nous": "restions",
      "vous": "restiez",
      "ils/elles": "restaient"
    },
    "manger": {
      "je": "mangeais",
      "tu": "mangeais",
      "il/elle/on": "mangeait",
      "nous": "mangions",
      "vous": "mangiez",
      "ils/elles": "mangeaient"
    },
    "laisser": {
      "je": "laissais",
      "tu": "laissais",
      "il/elle/on": "laissait",
      "nous": "laissions",
      "vous": "laissiez",
      "ils/elles": "laissaient"
    },
    "regarder": {
      "je": "regardais",
      "tu": "regardais",
      "il/elle/on": "regardait",
      "nous": "regardions",
      "vous": "regardiez",
      "ils/elles": "regardaient"
    },
    "répondre": {
      "je": "répondais",
      "tu": "répondais",
      "il/elle/on": "répondait",
      "nous": "répondions",
      "vous": "répondiez",
      "ils/elles": "répondaient"
    },
    "vivre": {
      "je": "vivais",
      "tu": "vivais",
      "il/elle/on": "vivait",
      "nous": "vivions",
      "vous": "viviez",
      "ils/elles": "vivaient"
    },
    "chercher": {
      "je": "cherchais",
      "tu": "cherchais",
      "il/elle/on": "cherchait",
      "nous": "cherchions",
      "vous": "cherchiez",
      "ils/elles": "cherchaient"
    },
    "sentir": {
      "je": "sentais",
      "tu": "sentais",
      "il/elle/on": "sentait",
      "nous": "sentions",
      "vous": "sentiez",
      "ils/elles": "sentaient"
    },
    "entendre": {
      "je": "j'entendais",
      "tu": "entendais",
      "il/elle/on": "entendait",
      "nous": "entendions",
      "vous": "entendiez",
      "ils/elles": "entendaient"
    },
    "attendre": {
      "je": "j'attendais",
      "tu": "attendais",
      "il/elle/on": "attendait",
      "nous": "attendions",
      "vous": "attendiez",
      "ils/elles": "attendaient"
    },
    "sortir": {
      "je": "sortais",
      "tu": "sortais",
      "il/elle/on": "sortait",
      "nous": "sortions",
      "vous": "sortiez",
      "ils/elles": "sortaient"
    },
    "connaître": {
      "je": "connaissais",
      "tu": "connaissais",
      "il/elle/on": "connaissait",
      "nous": "connaissions",
      "vous": "connaissiez",
      "ils/elles": "connaissaient"
    },
    "arriver": {
      "je": "j'arrivais",
      "tu": "arrivais",
      "il/elle/on": "arrivait",
      "nous": "arrivions",
      "vous": "arriviez",
      "ils/elles": "arrivaient"
    },
    "ouvrir": {
      "je": "j'ouvrais",
      "tu": "ouvrais",
      "il/elle/on": "ouvrait",
      "nous": "ouvrions",
      "vous": "ouvriez",
      "ils/elles": "ouvraient"
    },
    "perdre": {
      "je": "perdais",
      "tu": "perdais",
      "il/elle/on": "perdait",
      "nous": "perdions",
      "vous": "perdiez",
      "ils/elles": "perdaient"
    },
    "écrire": {
      "je": "j'écrivais",
      "tu": "écrivais",
      "il/elle/on": "écrivait",
      "nous": "écrivions",
      "vous": "écriviez",
      "ils/elles": "écrivaient"
    },
    "devenir": {
      "je": "devenais",
      "tu": "devenais",
      "il/elle/on": "devenait",
      "nous": "devenions",
      "vous": "deveniez",
      "ils/elles": "devenaient"
    },
    "suivre": {
      "je": "suivais",
      "tu": "suivais",
      "il/elle/on": "suivait",
      "nous": "suivions",
      "vous": "suiviez",
      "ils/elles": "suivaient"
    },
    "montrer": {
      "je": "montrais",
      "tu": "montrais",
      "il/elle/on": "montrait",
      "nous": "montrions",
      "vous": "montriez",
      "ils/elles": "montraient"
    },
    "mourir": {
      "je": "mourais",
      "tu": "mourais",
      "il/elle/on": "mourait",
      "nous": "mourions",
      "vous": "mouriez",
      "ils/elles": "mouraient"
    },
    "appeler": {
      "je": "j'appelais",
      "tu": "appelais",
      "il/elle/on": "appelait",
      "nous": "appelions",
      "vous": "appeliez",
      "ils/elles": "appelaient"
    },
    "commencer": {
      "je": "commençais",
      "tu": "commençais",
      "il/elle/on": "commençait",
      "nous": "commencions",
      "vous": "commenciez",
      "ils/elles": "commençaient"
    },
    "finir": {
      "je": "finissais",
      "tu": "finissais",
      "il/elle/on": "finissait",
      "nous": "finissions",
      "vous": "finissiez",
      "ils/elles": "finissaient"
    },
    "servir": {
      "je": "servais",
      "tu": "servais",
      "il/elle/on": "servait",
      "nous": "servions",
      "vous": "serviez",
      "ils/elles": "servaient"
    },
    "lire": {
      "je": "lisais",
      "tu": "lisais",
      "il/elle/on": "lisait",
      "nous": "lisions",
      "vous": "lisiez",
      "ils/elles": "lisaient"
    },
    "travailler": {
      "je": "travaillais",
      "tu": "travaillais",
      "il/elle/on": "travaillait",
      "nous": "travaillions",
      "vous": "travailliez",
      "ils/elles": "travaillaient"
    },
    "jouer": {
      "je": "jouais",
      "tu": "jouais",
      "il/elle/on": "jouait",
      "nous": "jouions",
      "vous": "jouiez",
      "ils/elles": "jouaient"
    },
    "recevoir": {
      "je": "recevais",
      "tu": "recevais",
      "il/elle/on": "recevait",
      "nous": "recevions",
      "vous": "receviez",
      "ils/elles": "recevaient"
    },
    "changer": {
      "je": "changeais",
      "tu": "changeais",
      "il/elle/on": "changeait",
      "nous": "changions",
      "vous": "changiez",
      "ils/elles": "changeaient"
    },
    "gagner": {
      "je": "gagnais",
      "tu": "gagnais",
      "il/elle/on": "gagnait",
      "nous": "gagnions",
      "vous": "gagniez",
      "ils/elles": "gagnaient"
    },
    "boire": {
      "je": "buvais",
      "tu": "buvais",
      "il/elle/on": "buvait",
      "nous": "buvions",
      "vous": "buviez",
      "ils/elles": "buvaient"
    },
    "décider": {
      "je": "décidais",
      "tu": "décidais",
      "il/elle/on": "décidait",
      "nous": "décidions",
      "vous": "décidiez",
      "ils/elles": "décidaient"
    },
    "oublier": {
      "je": "j'oubliais",
      "tu": "oubliais",
      "il/elle/on": "oubliait",
      "nous": "oubliions",
      "vous": "oubliiez",
      "ils/elles": "oubliaient"
    },
    "dormir": {
      "je": "dormais",
      "tu": "dormais",
      "il/elle/on": "dormait",
      "nous": "dormions",
      "vous": "dormiez",
      "ils/elles": "dormaient"
    },
    "courir": {
      "je": "courais",
      "tu": "courais",
      "il/elle/on": "courait",
      "nous": "courions",
      "vous": "couriez",
      "ils/elles": "couraient"
    },
    "acheter": {
      "je": "j'achetais",
      "tu": "achetais",
      "il/elle/on": "achetait",
      "nous": "achetions",
      "vous": "achetiez",
      "ils/elles": "achetaient"
    },
    "payer": {
      "je": "payais",
      "tu": "payais",
      "il/elle/on": "payait",
      "nous": "payions",
      "vous": "payiez",
      "ils/elles": "payaient"
    },
    "choisir": {
      "je": "choisissais",
      "tu": "choisissais",
      "il/elle/on": "choisissait",
      "nous": "choisissions",
      "vous": "choisissiez",
      "ils/elles": "choisissaient"
    },
    "essayer": {
      "je": "j'essayais",
      "tu": "essayais",
      "il/elle/on": "essayait",
      "nous": "essayions",
      "vous": "essayiez",
      "ils/elles": "essayaient"
    },
    "envoyer": {
      "je": "j'envoyais",
      "tu": "envoyais",
      "il/elle/on": "envoyait",
      "nous": "envoyions",
      "vous": "envoyiez",
      "ils/elles": "envoyaient"
    },
    "rentrer": {
      "je": "rentrais",
      "tu": "rentrais",
      "il/elle/on": "rentrait",
      "nous": "rentrions",
      "vous": "rentriez",
      "ils/elles": "rentraient"
    },
    "porter": {
      "je": "portais",
      "tu": "portais",
      "il/elle/on": "portait",
      "nous": "portions",
      "vous": "portiez",
      "ils/elles": "portaient"
    },
    "marcher": {
      "je": "marchais",
      "tu": "marchais",
      "il/elle/on": "marchait",
      "nous": "marchions",
      "vous": "marchiez",
      "ils/elles": "marchaient"
    },
    "monter": {
      "je": "montais",
      "tu": "montais",
      "il/elle/on": "montait",
      "nous": "montions",
      "vous": "montiez",
      "ils/elles": "montaient"
    },
    "aider": {
      "je": "j'aidais",
      "tu": "aidais",
      "il/elle/on": "aidait",
      "nous": "aidions",
      "vous": "aidiez",
      "ils/elles": "aidaient"
    },
    "tomber": {
      "je": "tombais",
      "tu": "tombais",
      "il/elle/on": "tombait",
      "nous": "tombions",
      "vous": "tombiez",
      "ils/elles": "tombaient"
    },
    "conduire": {
      "je": "conduisais",
      "tu": "conduisais",
      "il/elle/on": "conduisait",
      "nous": "conduisions",
      "vous": "conduisiez",
      "ils/elles": "conduisaient"
    },
    "expliquer": {
      "je": "j'expliquais",
      "tu": "expliquais",
      "il/elle/on": "expliquait",
      "nous": "expliquions",
      "vous": "expliquiez",
      "ils/elles": "expliquaient"
    },
    "apprendre": {
      "je": "j'apprenais",
      "tu": "apprenais",
      "il/elle/on": "apprenait",
      "nous": "apprenions",
      "vous": "appreniez",
      "ils/elles": "apprenaient"
    },
    "produire": {
      "je": "produisais",
      "tu": "produisais",
      "il/elle/on": "produisait",
      "nous": "produisions",
      "vous": "produisiez",
      "ils/elles": "produisaient"
    },
    "préparer": {
      "je": "préparais",
      "tu": "préparais",
      "il/elle/on": "préparait",
      "nous": "préparions",
      "vous": "prépariez",
      "ils/elles": "préparaient"
    },
    "chanter": {
      "je": "chantais",
      "tu": "chantais",
      "il/elle/on": "chantait",
      "nous": "chantions",
      "vous": "chantiez",
      "ils/elles": "chantaient"
    },
    "danser": {
      "je": "dansais",
      "tu": "dansais",
      "il/elle/on": "dansait",
      "nous": "dansions",
      "vous": "dansiez",
      "ils/elles": "dansaient"
    },
    "raconter": {
      "je": "racontais",
      "tu": "racontais",
      "il/elle/on": "racontait",
      "nous": "racontions",
      "vous": "racontiez",
      "ils/elles": "racontaient"
    },
    "espérer": {
      "je": "j'espérais",
      "tu": "espérais",
      "il/elle/on": "espérait",
      "nous": "espérions",
      "vous": "espériez",
      "ils/elles": "espéraient"
    },
    "offrir": {
      "je": "j'offrais",
      "tu": "offrais",
      "il/elle/on": "offrait",
      "nous": "offrions",
      "vous": "offriez",
      "ils/elles": "offraient"
    },
    "construire": {
      "je": "construisais",
      "tu": "construisais",
      "il/elle/on": "construisait",
      "nous": "construisions",
      "vous": "construisiez",
      "ils/elles": "construisaient"
    },
    "détruire": {
      "je": "détruisais",
      "tu": "détruisais",
      "il/elle/on": "détruisait",
      "nous": "détruisions",
      "vous": "détruisiez",
      "ils/elles": "détruisaient"
    },
    "traduire": {
      "je": "traduisais",
      "tu": "traduisais",
      "il/elle/on": "traduisait",
      "nous": "traduisions",
      "vous": "traduisiez",
      "ils/elles": "traduisaient"
    },
    "revenir": {
      "je": "revenais",
      "tu": "revenais",
      "il/elle/on": "revenait",
      "nous": "revenions",
      "vous": "reveniez",
      "ils/elles": "revenaient"
    },
    "entrer": {
      "je": "j'entrais",
      "tu": "entrais",
      "il/elle/on": "entrait",
      "nous": "entrions",
      "vous": "entriez",
      "ils/elles": "entraient"
    },
    "naître": {
      "je": "naissais",
      "tu": "naissais",
      "il/elle/on": "naissait",
      "nous": "naissions",
      "vous": "naissiez",
      "ils/elles": "naissaient"
    },
    "descendre": {
      "je": "descendais",
      "tu": "descendais",
      "il/elle/on": "descendait",
      "nous": "descendions",
      "vous": "descendiez",
      "ils/elles": "descendaient"
    },
    "plaire": {
      "je": "plaisais",
      "tu": "plaisais",
      "il/elle/on": "plaisait",
      "nous": "plaisions",
      "vous": "plaisiez",
      "ils/elles": "plaisaient"
    },
    "sourire": {
      "je": "souriais",
      "tu": "souriais",
      "il/elle/on": "souriait",
      "nous": "souriions",
      "vous": "souriiez",
      "ils/elles": "souriaient"
    },
    "rire": {
      "je": "riais",
      "tu": "riais",
      "il/elle/on": "riait",
      "nous": "riions",
      "vous": "riiez",
      "ils/elles": "riaient"
    },
    "vendre": {
      "je": "vendais",
      "tu": "vendais",
      "il/elle/on": "vendait",
      "nous": "vendions",
      "vous": "vendiez",
      "ils/elles": "vendaient"
    },
    "permettre": {
      "je": "permettais",
      "tu": "permettais",
      "il/elle/on": "permettait",
      "nous": "permettions",
      "vous": "permettiez",
      "ils/elles": "permettaient"
    },
    "promettre": {
      "je": "promettais",
      "tu": "promettais",
      "il/elle/on": "promettait",
      "nous": "promettions",
      "vous": "promettiez",
      "ils/elles": "promettaient"
    },
    "paraître": {
      "je": "paraissais",
      "tu": "paraissais",
      "il/elle/on": "paraissait",
      "nous": "paraissions",
      "vous": "paraissiez",
      "ils/elles": "paraissaient"
    },
    "disparaître": {
      "je": "disparaissais",
      "tu": "disparaissais",
      "il/elle/on": "disparaissait",
      "nous": "disparaissions",
      "vous": "disparaissiez",
      "ils/elles": "disparaissaient"
    },
    "reconnaître": {
      "je": "reconnaissais",
      "tu": "reconnaissais",
      "il/elle/on": "reconnaissait",
      "nous": "reconnaissions",
      "vous": "reconnaissiez",
      "ils/elles": "reconnaissaient"
    },
    "battre": {
      "je": "battais",
      "tu": "battais",
      "il/elle/on": "battait",
      "nous": "battions",
      "vous": "battiez",
      "ils/elles": "battaient"
    },
    "mentir": {
      "je": "mentais",
      "tu": "mentais",
      "il/elle/on": "mentait",
      "nous": "mentions",
      "vous": "mentiez",
      "ils/elles": "mentaient"
    },
    "partager": {
      "je": "partageais",
      "tu": "partageais",
      "il/elle/on": "partageait",
      "nous": "partagions",
      "vous": "partagiez",
      "ils/elles": "partageaient"
    },
    "protéger": {
      "je": "protégeais",
      "tu": "protégeais",
      "il/elle/on": "protégeait",
      "nous": "protégions",
      "vous": "protégiez",
      "ils/elles": "protégeaient"
    },
    "voyager": {
      "je": "voyageais",
      "tu": "voyageais",
      "il/elle/on": "voyageait",
      "nous": "voyagions",
      "vous": "voyagiez",
      "ils/elles": "voyageaient"
    },
    "étudier": {
      "je": "j'étudiais",
      "tu": "étudiais",
      "il/elle/on": "étudiait",
      "nous": "étudiions",
      "vous": "étudiiez",
      "ils/elles": "étudiaient"
    },
    "réussir": {
      "je": "réussissais",
      "tu": "réussissais",
      "il/elle/on": "réussissait",
      "nous": "réussissions",
      "vous": "réussissiez",
      "ils/elles": "réussissaient"
    },
    "grandir": {
      "je": "grandissais",
      "tu": "grandissais",
      "il/elle/on": "grandissait",
      "nous": "grandissions",
      "vous": "grandissiez",
      "ils/elles": "grandissaient"
    },
    "vieillir": {
      "je": "vieillissais",
      "tu": "vieillissais",
      "il/elle/on": "vieillissait",
      "nous": "vieillissions",
      "vous": "vieillissiez",
      "ils/elles": "vieillissaient"
    },
    "rougir": {
      "je": "rougissais",
      "tu": "rougissais",
      "il/elle/on": "rougissait",
      "nous": "rougissions",
      "vous": "rougissiez",
      "ils/elles": "rougissaient"
    },
    "maigrir": {
      "je": "maigrissais",
      "tu": "maigrissais",
      "il/elle/on": "maigrissait",
      "nous": "maigrissions",
      "vous": "maigrissiez",
      "ils/elles": "maigrissaient"
    },
    "grossir": {
      "je": "grossissais",
      "tu": "grossissais",
      "il/elle/on": "grossissait",
      "nous": "grossissions",
      "vous": "grossissiez",
      "ils/elles": "grossissaient"
    },
    "obéir": {
      "je": "j'obéissais",
      "tu": "obéissais",
      "il/elle/on": "obéissait",
      "nous": "obéissions",
      "vous": "obéissiez",
      "ils/elles": "obéissaient"
    },
    "désobéir": {
      "je": "désobéissais",
      "tu": "désobéissais",
      "il/elle/on": "désobéissait",
      "nous": "désobéissions",
      "vous": "désobéissiez",
      "ils/elles": "désobéissaient"
    },
    "réfléchir": {
      "je": "réfléchissais",
      "tu": "réfléchissais",
      "il/elle/on": "réfléchissait",
      "nous": "réfléchissions",
      "vous": "réfléchissiez",
      "ils/elles": "réfléchissaient"
    },
    "remplir": {
      "je": "remplissais",
      "tu": "remplissais",
      "il/elle/on": "remplissait",
      "nous": "remplissions",
      "vous": "remplissiez",
      "ils/elles": "remplissaient"
    },
    "punir": {
      "je": "punissais",
      "tu": "punissais",
      "il/elle/on": "punissait",
      "nous": "punissions",
      "vous": "punissiez",
      "ils/elles": "punissaient"
    },
    "guérir": {
      "je": "guérissais",
      "tu": "guérissais",
      "il/elle/on": "guérissait",
      "nous": "guérissions",
      "vous": "guérissiez",
      "ils/elles": "guérissaient"
    },
    "bâtir": {
      "je": "bâtissais",
      "tu": "bâtissais",
      "il/elle/on": "bâtissait",
      "nous": "bâtissions",
      "vous": "bâtissiez",
      "ils/elles": "bâtissaient"
    },
    "nourrir": {
      "je": "nourrissais",
      "tu": "nourrissais",
      "il/elle/on": "nourrissait",
      "nous": "nourrissions",
      "vous": "nourrissiez",
      "ils/elles": "nourrissaient"
    },
    "avertir": {
      "je": "j'avertissais",
      "tu": "avertissais",
      "il/elle/on": "avertissait",
      "nous": "avertissions",
      "vous": "avertissiez",
      "ils/elles": "avertissaient"
    },
    "agir": {
      "je": "j'agissais",
      "tu": "agissais",
      "il/elle/on": "agissait",
      "nous": "agissions",
      "vous": "agissiez",
      "ils/elles": "agissaient"
    },
    "réagir": {
      "je": "réagissais",
      "tu": "réagissais",
      "il/elle/on": "réagissait",
      "nous": "réagissions",
      "vous": "réagissiez",
      "ils/elles": "réagissaient"
    },
    "saisir": {
      "je": "saisissais",
      "tu": "saisissais",
      "il/elle/on": "saisissait",
      "nous": "saisissions",
      "vous": "saisissiez",
      "ils/elles": "saisissaient"
    },
    "établir": {
      "je": "j'établissais",
      "tu": "établissais",
      "il/elle/on": "établissait",
      "nous": "établissions",
      "vous": "établissiez",
      "ils/elles": "établissaient"
    },
    "investir": {
      "je": "j'investissais",
      "tu": "investissais",
      "il/elle/on": "investissait",
      "nous": "investissions",
      "vous": "investissiez",
      "ils/elles": "investissaient"
    },
    "couvrir": {
      "je": "couvrais",
      "tu": "couvrais",
      "il/elle/on": "couvrait",
      "nous": "couvrions",
      "vous": "couvriez",
      "ils/elles": "couvraient"
    },
    "découvrir": {
      "je": "découvrais",
      "tu": "découvrais",
      "il/elle/on": "découvrait",
      "nous": "découvrions",
      "vous": "découvriez",
      "ils/elles": "découvraient"
    },
    "souffrir": {
      "je": "souffrais",
      "tu": "souffrais",
      "il/elle/on": "souffrait",
      "nous": "souffrions",
      "vous": "souffriez",
      "ils/elles": "souffraient"
    },
    "cueillir": {
      "je": "cueillais",
      "tu": "cueillais",
      "il/elle/on": "cueillait",
      "nous": "cueillions",
      "vous": "cueilliez",
      "ils/elles": "cueillaient"
    },
    "accueillir": {
      "je": "j'accueillais",
      "tu": "accueillais",
      "il/elle/on": "accueillait",
      "nous": "accueillions",
      "vous": "accueilliez",
      "ils/elles": "accueillaient"
    },
    "assaillir": {
      "je": "j'assaillais",
      "tu": "assaillais",
      "il/elle/on": "assaillait",
      "nous": "assaillions",
      "vous": "assailliez",
      "ils/elles": "assaillaient"
    },
    "tressaillir": {
      "je": "tressaillais",
      "tu": "tressaillais",
      "il/elle/on": "tressaillait",
      "nous": "tressaillions",
      "vous": "tressailliez",
      "ils/elles": "tressaillaient"
    },
    "fuir": {
      "je": "fuyais",
      "tu": "fuyais",
      "il/elle/on": "fuyait",
      "nous": "fuyions",
      "vous": "fuyiez",
      "ils/elles": "fuyaient"
    },
    "vêtir": {
      "je": "vêtais",
      "tu": "vêtais",
      "il/elle/on": "vêtait",
      "nous": "vêtions",
      "vous": "vêtiez",
      "ils/elles": "vêtaient"
    },
    "acquérir": {
      "je": "j'acquérais",
      "tu": "acquérais",
      "il/elle/on": "acquérait",
      "nous": "acquérions",
      "vous": "acquériez",
      "ils/elles": "acquéraient"
    },
    "conquérir": {
      "je": "conquérais",
      "tu": "conquérais",
      "il/elle/on": "conquérait",
      "nous": "conquérions",
      "vous": "conquériez",
      "ils/elles": "conquéraient"
    },
    "bouillir": {
      "je": "bouillais",
      "tu": "bouillais",
      "il/elle/on": "bouillait",
      "nous": "bouillions",
      "vous": "bouilliez",
      "ils/elles": "bouillaient"
    },
    "faillir": {
      "je": "faillais",
      "tu": "faillais",
      "il/elle/on": "faillait",
      "nous": "faillions",
      "vous": "failliez",
      "ils/elles": "faillaient"
    },
    "haïr": {
      "je": "haïssais",
      "tu": "haïssais",
      "il/elle/on": "haïssait",
      "nous": "haïssions",
      "vous": "haïssiez",
      "ils/elles": "haïssaient"
    },
    "ouïr": {
      "je": "j'oyais",
      "tu": "oyais",
      "il/elle/on": "oyait",
      "nous": "oyions",
      "vous": "oyiez",
      "ils/elles": "oyaient"
    },
    "réduire": {
      "je": "réduisais",
      "tu": "réduisais",
      "il/elle/on": "réduisait",
      "nous": "réduisions",
      "vous": "réduisiez",
      "ils/elles": "réduisaient"
    },
    "séduire": {
      "je": "séduisais",
      "tu": "séduisais",
      "il/elle/on": "séduisait",
      "nous": "séduisions",
      "vous": "séduisiez",
      "ils/elles": "séduisaient"
    },
    "introduire": {
      "je": "j'introduisais",
      "tu": "introduisais",
      "il/elle/on": "introduisait",
      "nous": "introduisions",
      "vous": "introduisiez",
      "ils/elles": "introduisaient"
    },
    "cuire": {
      "je": "cuisais",
      "tu": "cuisais",
      "il/elle/on": "cuisait",
      "nous": "cuisions",
      "vous": "cuisiez",
      "ils/elles": "cuisaient"
    },
    "nuire": {
      "je": "nuisais",
      "tu": "nuisais",
      "il/elle/on": "nuisait",
      "nous": "nuisions",
      "vous": "nuisiez",
      "ils/elles": "nuisaient"
    },
    "luire": {
      "je": "luisais",
      "tu": "luisais",
      "il/elle/on": "luisait",
      "nous": "luisions",
      "vous": "luisiez",
      "ils/elles": "luisaient"
    },
    "joindre": {
      "je": "joignais",
      "tu": "joignais",
      "il/elle/on": "joignait",
      "nous": "joignions",
      "vous": "joigniez",
      "ils/elles": "joignaient"
    },
    "craindre": {
      "je": "craignais",
      "tu": "craignais",
      "il/elle/on": "craignait",
      "nous": "craignions",
      "vous": "craigniez",
      "ils/elles": "craignaient"
    },
    "peindre": {
      "je": "peignais",
      "tu": "peignais",
      "il/elle/on": "peignait",
      "nous": "peignions",
      "vous": "peigniez",
      "ils/elles": "peignaient"
    },
    "plaindre": {
      "je": "plaignais",
      "tu": "plaignais",
      "il/elle/on": "plaignait",
      "nous": "plaignions",
      "vous": "plaigniez",
      "ils/elles": "plaignaient"
    },
    "éteindre": {
      "je": "j'éteignais",
      "tu": "éteignais",
      "il/elle/on": "éteignait",
      "nous": "éteignions",
      "vous": "éteigniez",
      "ils/elles": "éteignaient"
    },
    "atteindre": {
      "je": "j'atteignais",
      "tu": "atteignais",
      "il/elle/on": "atteignait",
      "nous": "atteignions",
      "vous": "atteigniez",
      "ils/elles": "atteignaient"
    },
    "restreindre": {
      "je": "restreignais",
      "tu": "restreignais",
      "il/elle/on": "restreignait",
      "nous": "restreignions",
      "vous": "restreigniez",
      "ils/elles": "restreignaient"
    },
    "feindre": {
      "je": "feignais",
      "tu": "feignais",
      "il/elle/on": "feignait",
      "nous": "feignions",
      "vous": "feigniez",
      "ils/elles": "feignaient"
    },
    "geindre": {
      "je": "geignais",
      "tu": "geignais",
      "il/elle/on": "geignait",
      "nous": "geignions",
      "vous": "geigniez",
      "ils/elles": "geignaient"
    },
    "contraindre": {
      "je": "contraignais",
      "tu": "contraignais",
      "il/elle/on": "contraignait",
      "nous": "contraignions",
      "vous": "contraigniez",
      "ils/elles": "contraignaient"
    },
    "résoudre": {
      "je": "résolvais",
      "tu": "résolvais",
      "il/elle/on": "résolvait",
      "nous": "résolvions",
      "vous": "résolviez",
      "ils/elles": "résolvaient"
    },
    "absoudre": {
      "je": "j'absolvais",
      "tu": "absolvais",
      "il/elle/on": "absolvait",
      "nous": "absolvions",
      "vous": "absolviez",
      "ils/elles": "absolvaient"
    },
    "dissoudre": {
      "je": "dissolvais",
      "tu": "dissolvais",
      "il/elle/on": "dissolvait",
      "nous": "dissolvions",
      "vous": "dissolviez",
      "ils/elles": "dissolvaient"
    },
    "coudre": {
      "je": "cousais",
      "tu": "cousais",
      "il/elle/on": "cousait",
      "nous": "cousions",
      "vous": "cousiez",
      "ils/elles": "cousaient"
    },
    "moudre": {
      "je": "moulais",
      "tu": "moulais",
      "il/elle/on": "moulait",
      "nous": "moulions",
      "vous": "mouliez",
      "ils/elles": "moulaient"
    },
    "poursuivre": {
      "je": "poursuivais",
      "tu": "poursuivais",
      "il/elle/on": "poursuivait",
      "nous": "poursuivions",
      "vous": "poursuiviez",
      "ils/elles": "poursuivaient"
    },
    "survivre": {
      "je": "survivais",
      "tu": "survivais",
      "il/elle/on": "survivait",
      "nous": "survivions",
      "vous": "surviviez",
      "ils/elles": "survivaient"
    },
    "revivre": {
      "je": "revivais",
      "tu": "revivais",
      "il/elle/on": "revivait",
      "nous": "revivions",
      "vous": "reviviez",
      "ils/elles": "revivaient"
    },
    "conclure": {
      "je": "concluais",
      "tu": "concluais",
      "il/elle/on": "concluait",
      "nous": "concluions",
      "vous": "concluiez",
      "ils/elles": "concluaient"
    },
    "exclure": {
      "je": "j'excluais",
      "tu": "excluais",
      "il/elle/on": "excluait",
      "nous": "excluions",
      "vous": "excluiez",
      "ils/elles": "excluaient"
    },
    "inclure": {
      "je": "j'incluais",
      "tu": "incluais",
      "il/elle/on": "incluait",
      "nous": "incluions",
      "vous": "incluiez",
      "ils/elles": "incluaient"
    },
    "élire": {
      "je": "j'élisais",
      "tu": "élisais",
      "il/elle/on": "élisait",
      "nous": "élisions",
      "vous": "élisiez",
      "ils/elles": "élisaient"
    },
    "relire": {
      "je": "relisais",
      "tu": "relisais",
      "il/elle/on": "relisait",
      "nous": "relisions",
      "vous": "relisiez",
      "ils/elles": "relisaient"
    },
    "interdire": {
      "je": "j'interdisais",
      "tu": "interdisais",
      "il/elle/on": "interdisait",
      "nous": "interdisions",
      "vous": "interdisiez",
      "ils/elles": "interdisaient"
    },
    "prédire": {
      "je": "prédisais",
      "tu": "prédisais",
      "il/elle/on": "prédisait",
      "nous": "prédisions",
      "vous": "prédisiez",
      "ils/elles": "prédisaient"
    },
    "médire": {
      "je": "médisais",
      "tu": "médisais",
      "il/elle/on": "médisait",
      "nous": "médisions",
      "vous": "médisiez",
      "ils/elles": "médisaient"
    },
    "contredire": {
      "je": "contredisais",
      "tu": "contredisais",
      "il/elle/on": "contredisait",
      "nous": "contredisions",
      "vous": "contredisiez",
      "ils/elles": "contredisaient"
    },
    "suffire": {
      "je": "suffisais",
      "tu": "suffisais",
      "il/elle/on": "suffisait",
      "nous": "suffisions",
      "vous": "suffisiez",
      "ils/elles": "suffisaient"
    },
    "circoncire": {
      "je": "circoncisais",
      "tu": "circoncisais",
      "il/elle/on": "circoncisait",
      "nous": "circoncisions",
      "vous": "circoncisiez",
      "ils/elles": "circoncisaient"
    },
    "déplaire": {
      "je": "déplaisais",
      "tu": "déplaisais",
      "il/elle/on": "déplaisait",
      "nous": "déplaisions",
      "vous": "déplaisiez",
      "ils/elles": "déplaisaient"
    },
    "taire": {
      "je": "taisais",
      "tu": "taisais",
      "il/elle/on": "taisait",
      "nous": "taisions",
      "vous": "taisiez",
      "ils/elles": "taisaient"
    },
    "apparaître": {
      "je": "j'apparaissais",
      "tu": "apparaissais",
      "il/elle/on": "apparaissait",
      "nous": "apparaissions",
      "vous": "apparaissiez",
      "ils/elles": "apparaissaient"
    },
    "paître": {
      "je": "paissais",
      "tu": "paissais",
      "il/elle/on": "paissait",
      "nous": "paissions",
      "vous": "paissiez",
      "ils/elles": "paissaient"
    },
    "combattre": {
      "je": "combattais",
      "tu": "combattais",
      "il/elle/on": "combattait",
      "nous": "combattions",
      "vous": "combattiez",
      "ils/elles": "combattaient"
    },
    "abattre": {
      "je": "j'abattais",
      "tu": "abattais",
      "il/elle/on": "abattait",
      "nous": "abattions",
      "vous": "abattiez",
      "ils/elles": "abattaient"
    },
    "débattre": {
      "je": "débattais",
      "tu": "débattais",
      "il/elle/on": "débattait",
      "nous": "débattions",
      "vous": "débattiez",
      "ils/elles": "débattaient"
    },
    "admettre": {
      "je": "j'admettais",
      "tu": "admettais",
      "il/elle/on": "admettait",
      "nous": "admettions",
      "vous": "admettiez",
      "ils/elles": "admettaient"
    },
    "commettre": {
      "je": "commettais",
      "tu": "commettais",
      "il/elle/on": "commettait",
      "nous": "commettions",
      "vous": "commettiez",
      "ils/elles": "commettaient"
    },
    "compromettre": {
      "je": "compromettais",
      "tu": "compromettais",
      "il/elle/on": "compromettait",
      "nous": "compromettions",
      "vous": "compromettiez",
      "ils/elles": "compromettaient"
    },
    "remettre": {
      "je": "remettais",
      "tu": "remettais",
      "il/elle/on": "remettait",
      "nous": "remettions",
      "vous": "remettiez",
      "ils/elles": "remettaient"
    },
    "soumettre": {
      "je": "soumettais",
      "tu": "soumettais",
      "il/elle/on": "soumettait",
      "nous": "soumettions",
      "vous": "soumettiez",
      "ils/elles": "soumettaient"
    },
    "transmettre": {
      "je": "transmettais",
      "tu": "transmettais",
      "il/elle/on": "transmettait",
      "nous": "transmettions",
      "vous": "transmettiez",
      "ils/elles": "transmettaient"
    },
    "entreprendre": {
      "je": "j'entreprenais",
      "tu": "entreprenais",
      "il/elle/on": "entreprenait",
      "nous": "entreprenions",
      "vous": "entrepreniez",
      "ils/elles": "entreprenaient"
    },
    "reprendre": {
      "je": "reprenais",
      "tu": "reprenais",
      "il/elle/on": "reprenait",
      "nous": "reprenions",
      "vous": "repreniez",
      "ils/elles": "reprenaient"
    },
    "surprendre": {
      "je": "surprenais",
      "tu": "surprenais",
      "il/elle/on": "surprenait",
      "nous": "surprenions",
      "vous": "surpreniez",
      "ils/elles": "surprenaient"
    },
    "rompre": {
      "je": "rompais",
      "tu": "rompais",
      "il/elle/on": "rompait",
      "nous": "rompions",
      "vous": "rompiez",
      "ils/elles": "rompaient"
    },
    "corrompre": {
      "je": "corrompais",
      "tu": "corrompais",
      "il/elle/on": "corrompait",
      "nous": "corrompions",
      "vous": "corrompiez",
      "ils/elles": "corrompaient"
    },
    "interrompre": {
      "je": "j'interrompais",
      "tu": "interrompais",
      "il/elle/on": "interrompait",
      "nous": "interrompions",
      "vous": "interrompiez",
      "ils/elles": "interrompaient"
    },
    "vaincre": {
      "je": "vainquais",
      "tu": "vainquais",
      "il/elle/on": "vainquait",
      "nous": "vainquions",
      "vous": "vainquiez",
      "ils/elles": "vainquaient"
    },
    "convaincre": {
      "je": "convainquais",
      "tu": "convainquais",
      "il/elle/on": "convainquait",
      "nous": "convainquions",
      "vous": "convainquiez",
      "ils/elles": "convainquaient"
    },
    "amener": {
      "je": "j'amenais",
      "tu": "amenais",
      "il/elle/on": "amenait",
      "nous": "amenions",
      "vous": "ameniez",
      "ils/elles": "amenaient"
    },
    "emmener": {
      "je": "j'emmenais",
      "tu": "emmenais",
      "il/elle/on": "emmenait",
      "nous": "emmenions",
      "vous": "emmeniez",
      "ils/elles": "emmenaient"
    },
    "enlever": {
      "je": "j'enlevais",
      "tu": "enlevais",
      "il/elle/on": "enlevait",
      "nous": "enlevions",
      "vous": "enleviez",
      "ils/elles": "enlevaient"
    },
    "geler": {
      "je": "gelais",
      "tu": "gelais",
      "il/elle/on": "gelait",
      "nous": "gelions",
      "vous": "geliez",
      "ils/elles": "gelaient"
    },
    "harceler": {
      "je": "harcelais",
      "tu": "harcelais",
      "il/elle/on": "harcelait",
      "nous": "harcelions",
      "vous": "harceliez",
      "ils/elles": "harcelaient"
    },
    "lever": {
      "je": "levais",
      "tu": "levais",
      "il/elle/on": "levait",
      "nous": "levions",
      "vous": "leviez",
      "ils/elles": "levaient"
    },
    "mener": {
      "je": "menais",
      "tu": "menais",
      "il/elle/on": "menait",
      "nous": "menions",
      "vous": "meniez",
      "ils/elles": "menaient"
    },
    "peler": {
      "je": "pelais",
      "tu": "pelais",
      "il/elle/on": "pelait",
      "nous": "pelions",
      "vous": "peliez",
      "ils/elles": "pelaient"
    },
    "peser": {
      "je": "pesais",
      "tu": "pesais",
      "il/elle/on": "pesait",
      "nous": "pesions",
      "vous": "pesiez",
      "ils/elles": "pesaient"
    },
    "promener": {
      "je": "promenais",
      "tu": "promenais",
      "il/elle/on": "promenait",
      "nous": "promenions",
      "vous": "promeniez",
      "ils/elles": "promenaient"
    },
    "semer": {
      "je": "semais",
      "tu": "semais",
      "il/elle/on": "semait",
      "nous": "semions",
      "vous": "semiez",
      "ils/elles": "semaient"
    },
    "jeter": {
      "je": "jetais",
      "tu": "jetais",
      "il/elle/on": "jetait",
      "nous": "jetions",
      "vous": "jetiez",
      "ils/elles": "jetaient"
    },
    "épeler": {
      "je": "j'épelais",
      "tu": "épelais",
      "il/elle/on": "épelait",
      "nous": "épelions",
      "vous": "épeliez",
      "ils/elles": "épelaient"
    },
    "feuilleter": {
      "je": "feuilletais",
      "tu": "feuilletais",
      "il/elle/on": "feuilletait",
      "nous": "feuilletions",
      "vous": "feuilletiez",
      "ils/elles": "feuilletaient"
    },
    "projeter": {
      "je": "projetais",
      "tu": "projetais",
      "il/elle/on": "projetait",
      "nous": "projetions",
      "vous": "projetiez",
      "ils/elles": "projetaient"
    },
    "rejeter": {
      "je": "rejetais",
      "tu": "rejetais",
      "il/elle/on": "rejetait",
      "nous": "rejetions",
      "vous": "rejetiez",
      "ils/elles": "rejetaient"
    },
    "renouveler": {
      "je": "renouvelais",
      "tu": "renouvelais",
      "il/elle/on": "renouvelait",
      "nous": "renouvelions",
      "vous": "renouveliez",
      "ils/elles": "renouvelaient"
    },
    "céder": {
      "je": "cédais",
      "tu": "cédais",
      "il/elle/on": "cédait",
      "nous": "cédions",
      "vous": "cédiez",
      "ils/elles": "cédaient"
    },
    "célébrer": {
      "je": "célébrais",
      "tu": "célébrais",
      "il/elle/on": "célébrait",
      "nous": "célébrions",
      "vous": "célébriez",
      "ils/elles": "célébraient"
    },
    "compléter": {
      "je": "complétais",
      "tu": "complétais",
      "il/elle/on": "complétait",
      "nous": "complétions",
      "vous": "complétiez",
      "ils/elles": "complétaient"
    },
    "considérer": {
      "je": "considérais",
      "tu": "considérais",
      "il/elle/on": "considérait",
      "nous": "considérions",
      "vous": "considériez",
      "ils/elles": "considéraient"
    },
    "différer": {
      "je": "différais",
      "tu": "différais",
      "il/elle/on": "différait",
      "nous": "différions",
      "vous": "différiez",
      "ils/elles": "différaient"
    },
    "exagérer": {
      "je": "j'exagérais",
      "tu": "exagérais",
      "il/elle/on": "exagérait",
      "nous": "exagérions",
      "vous": "exagériez",
      "ils/elles": "exagéraient"
    },
    "gérer": {
      "je": "gérais",
      "tu": "gérais",
      "il/elle/on": "gérait",
      "nous": "gérions",
      "vous": "gériez",
      "ils/elles": "géraient"
    },
    "inquiéter": {
      "je": "j'inquiétais",
      "tu": "inquiétais",
      "il/elle/on": "inquiétait",
      "nous": "inquiétions",
      "vous": "inquiétiez",
      "ils/elles": "inquiétaient"
    },
    "modérer": {
      "je": "modérais",
      "tu": "modérais",
      "il/elle/on": "modérait",
      "nous": "modérions",
      "vous": "modériez",
      "ils/elles": "modéraient"
    },
    "pénétrer": {
      "je": "pénétrais",
      "tu": "pénétrais",
      "il/elle/on": "pénétrait",
      "nous": "pénétrions",
      "vous": "pénétriez",
      "ils/elles": "pénétraient"
    },
    "posséder": {
      "je": "possédais",
      "tu": "possédais",
      "il/elle/on": "possédait",
      "nous": "possédions",
      "vous": "possédiez",
      "ils/elles": "possédaient"
    },
    "préférer": {
      "je": "préférais",
      "tu": "préférais",
      "il/elle/on": "préférait",
      "nous": "préférions",
      "vous": "préfériez",
      "ils/elles": "préféraient"
    },
    "refléter": {
      "je": "reflétais",
      "tu": "reflétais",
      "il/elle/on": "reflétait",
      "nous": "reflétions",
      "vous": "reflétiez",
      "ils/elles": "reflétaient"
    },
    "répéter": {
      "je": "répétais",
      "tu": "répétais",
      "il/elle/on": "répétait",
      "nous": "répétions",
      "vous": "répétiez",
      "ils/elles": "répétaient"
    },
    "révéler": {
      "je": "révélais",
      "tu": "révélais",
      "il/elle/on": "révélait",
      "nous": "révélions",
      "vous": "révéliez",
      "ils/elles": "révélaient"
    },
    "suggérer": {
      "je": "suggérais",
      "tu": "suggérais",
      "il/elle/on": "suggérait",
      "nous": "suggérions",
      "vous": "suggériez",
      "ils/elles": "suggéraient"
    },
    "zébrer": {
      "je": "zébrais",
      "tu": "zébrais",
      "il/elle/on": "zébrait",
      "nous": "zébrions",
      "vous": "zébriez",
      "ils/elles": "zébraient"
    },
    "nettoyer": {
      "je": "nettoyais",
      "tu": "nettoyais",
      "il/elle/on": "nettoyait",
      "nous": "nettoyions",
      "vous": "nettoyiez",
      "ils/elles": "nettoyaient"
    },
    "appuyer": {
      "je": "j'appuyais",
      "tu": "appuyais",
      "il/elle/on": "appuyait",
      "nous": "appuyions",
      "vous": "appuyiez",
      "ils/elles": "appuyaient"
    },
    "ennuyer": {
      "je": "j'ennuyais",
      "tu": "ennuyais",
      "il/elle/on": "ennuyait",
      "nous": "ennuyions",
      "vous": "ennuyiez",
      "ils/elles": "ennuyaient"
    },
    "essuyer": {
      "je": "j'essuyais",
      "tu": "essuyais",
      "il/elle/on": "essuyait",
      "nous": "essuyions",
      "vous": "essuyiez",
      "ils/elles": "essuyaient"
    },
    "balayer": {
      "je": "balayais",
      "tu": "balayais",
      "il/elle/on": "balayait",
      "nous": "balayions",
      "vous": "balayiez",
      "ils/elles": "balayaient"
    },
    "effrayer": {
      "je": "j'effrayais",
      "tu": "effrayais",
      "il/elle/on": "effrayait",
      "nous": "effrayions",
      "vous": "effrayiez",
      "ils/elles": "effrayaient"
    },
    "aboyer": {
      "je": "j'aboyais",
      "tu": "aboyais",
      "il/elle/on": "aboyait",
      "nous": "aboyions",
      "vous": "aboyiez",
      "ils/elles": "aboyaient"
    },
    "noyer": {
      "je": "noyais",
      "tu": "noyais",
      "il/elle/on": "noyait",
      "nous": "noyions",
      "vous": "noyiez",
      "ils/elles": "noyaient"
    },
    "tutoyer": {
      "je": "tutoyais",
      "tu": "tutoyais",
      "il/elle/on": "tutoyait",
      "nous": "tutoyions",
      "vous": "tutoyiez",
      "ils/elles": "tutoyaient"
    },
    "vouvoyer": {
      "je": "vouvoyais",
      "tu": "vouvoyais",
      "il/elle/on": "vouvoyait",
      "nous": "vouvoyions",
      "vous": "vouvoyiez",
      "ils/elles": "vouvoyaient"
    },
    "annoncer": {
      "je": "j'annonçais",
      "tu": "annonçais",
      "il/elle/on": "annonçait",
      "nous": "annoncions",
      "vous": "annonciez",
      "ils/elles": "annonçaient"
    },
    "avancer": {
      "je": "j'avançais",
      "tu": "avançais",
      "il/elle/on": "avançait",
      "nous": "avancions",
      "vous": "avanciez",
      "ils/elles": "avançaient"
    },
    "dénoncer": {
      "je": "dénonçais",
      "tu": "dénonçais",
      "il/elle/on": "dénonçait",
      "nous": "dénoncions",
      "vous": "dénonciez",
      "ils/elles": "dénonçaient"
    },
    "divorcer": {
      "je": "divorçais",
      "tu": "divorçais",
      "il/elle/on": "divorçait",
      "nous": "divorcions",
      "vous": "divorciez",
      "ils/elles": "divorçaient"
    },
    "effacer": {
      "je": "j'effaçais",
      "tu": "effaçais",
      "il/elle/on": "effaçait",
      "nous": "effacions",
      "vous": "effaciez",
      "ils/elles": "effaçaient"
    },
    "lancer": {
      "je": "lançais",
      "tu": "lançais",
      "il/elle/on": "lançait",
      "nous": "lancions",
      "vous": "lanciez",
      "ils/elles": "lançaient"
    },
    "menacer": {
      "je": "menaçais",
      "tu": "menaçais",
      "il/elle/on": "menaçait",
      "nous": "menacions",
      "vous": "menaciez",
      "ils/elles": "menaçaient"
    },
    "placer": {
      "je": "plaçais",
      "tu": "plaçais",
      "il/elle/on": "plaçait",
      "nous": "placions",
      "vous": "placiez",
      "ils/elles": "plaçaient"
    },
    "prononcer": {
      "je": "prononçais",
      "tu": "prononçais",
      "il/elle/on": "prononçait",
      "nous": "prononcions",
      "vous": "prononciez",
      "ils/elles": "prononçaient"
    },
    "remplacer": {
      "je": "remplaçais",
      "tu": "remplaçais",
      "il/elle/on": "remplaçait",
      "nous": "remplacions",
      "vous": "remplaciez",
      "ils/elles": "remplaçaient"
    },
    "renoncer": {
      "je": "renonçais",
      "tu": "renonçais",
      "il/elle/on": "renonçait",
      "nous": "renoncions",
      "vous": "renonciez",
      "ils/elles": "renonçaient"
    },
    "arranger": {
      "je": "j'arrangeais",
      "tu": "arrangeais",
      "il/elle/on": "arrangeait",
      "nous": "arrangions",
      "vous": "arrangiez",
      "ils/elles": "arrangeaient"
    },
    "bouger": {
      "je": "bougeais",
      "tu": "bougeais",
      "il/elle/on": "bougeait",
      "nous": "bougions",
      "vous": "bougiez",
      "ils/elles": "bougeaient"
    },
    "corriger": {
      "je": "corrigeais",
      "tu": "corrigeais",
      "il/elle/on": "corrigeait",
      "nous": "corrigions",
      "vous": "corrigiez",
      "ils/elles": "corrigeaient"
    },
    "décourager": {
      "je": "décourageais",
      "tu": "décourageais",
      "il/elle/on": "décourageait",
      "nous": "découragions",
      "vous": "découragiez",
      "ils/elles": "décourageaient"
    },
    "déménager": {
      "je": "déménageais",
      "tu": "déménageais",
      "il/elle/on": "déménageait",
      "nous": "déménagions",
      "vous": "déménagiez",
      "ils/elles": "déménageaient"
    },
    "diriger": {
      "je": "dirigeais",
      "tu": "dirigeais",
      "il/elle/on": "dirigeait",
      "nous": "dirigions",
      "vous": "dirigiez",
      "ils/elles": "dirigeaient"
    },
    "encourager": {
      "je": "j'encourageais",
      "tu": "encourageais",
      "il/elle/on": "encourageait",
      "nous": "encouragions",
      "vous": "encouragiez",
      "ils/elles": "encourageaient"
    },
    "engager": {
      "je": "j'engageais",
      "tu": "engageais",
      "il/elle/on": "engageait",
      "nous": "engagions",
      "vous": "engagiez",
      "ils/elles": "engageaient"
    },
    "exiger": {
      "je": "j'exigeais",
      "tu": "exigeais",
      "il/elle/on": "exigeait",
      "nous": "exigions",
      "vous": "exigiez",
      "ils/elles": "exigeaient"
    },
    "juger": {
      "je": "jugeais",
      "tu": "jugeais",
      "il/elle/on": "jugeait",
      "nous": "jugions",
      "vous": "jugiez",
      "ils/elles": "jugeaient"
    },
    "loger": {
      "je": "logeais",
      "tu": "logeais",
      "il/elle/on": "logeait",
      "nous": "logions",
      "vous": "logiez",
      "ils/elles": "logeaient"
    },
    "mélanger": {
      "je": "mélangeais",
      "tu": "mélangeais",
      "il/elle/on": "mélangeait",
      "nous": "mélangions",
      "vous": "mélangiez",
      "ils/elles": "mélangeaient"
    },
    "nager": {
      "je": "nageais",
      "tu": "nageais",
      "il/elle/on": "nageait",
      "nous": "nagions",
      "vous": "nagiez",
      "ils/elles": "nageaient"
    },
    "obliger": {
      "je": "j'obligeais",
      "tu": "obligeais",
      "il/elle/on": "obligeait",
      "nous": "obligions",
      "vous": "obligiez",
      "ils/elles": "obligeaient"
    },
    "plonger": {
      "je": "plongeais",
      "tu": "plongeais",
      "il/elle/on": "plongeait",
      "nous": "plongions",
      "vous": "plongiez",
      "ils/elles": "plongeaient"
    },
    "ranger": {
      "je": "rangeais",
      "tu": "rangeais",
      "il/elle/on": "rangeait",
      "nous": "rangions",
      "vous": "rangiez",
      "ils/elles": "rangeaient"
    },
    "rédiger": {
      "je": "rédigeais",
      "tu": "rédigeais",
      "il/elle/on": "rédigeait",
      "nous": "rédigions",
      "vous": "rédigiez",
      "ils/elles": "rédigeaient"
    },
    "ajouter": {
      "je": "j'ajoutais",
      "tu": "ajoutais",
      "il/elle/on": "ajoutait",
      "nous": "ajoutions",
      "vous": "ajoutiez",
      "ils/elles": "ajoutaient"
    },
    "durer": {
      "je": "durais",
      "tu": "durais",
      "il/elle/on": "durait",
      "nous": "durions",
      "vous": "duriez",
      "ils/elles": "duraient"
    },
    "écouter": {
      "je": "j'écoutais",
      "tu": "écoutais",
      "il/elle/on": "écoutait",
      "nous": "écoutions",
      "vous": "écoutiez",
      "ils/elles": "écoutaient"
    },
    "emprunter": {
      "je": "j'empruntais",
      "tu": "empruntais",
      "il/elle/on": "empruntait",
      "nous": "empruntions",
      "vous": "empruntiez",
      "ils/elles": "empruntaient"
    },
    "fermer": {
      "je": "fermais",
      "tu": "fermais",
      "il/elle/on": "fermait",
      "nous": "fermions",
      "vous": "fermiez",
      "ils/elles": "fermaient"
    },
    "garder": {
      "je": "gardais",
      "tu": "gardais",
      "il/elle/on": "gardait",
      "nous": "gardions",
      "vous": "gardiez",
      "ils/elles": "gardaient"
    },
    "laver": {
      "je": "lavais",
      "tu": "lavais",
      "il/elle/on": "lavait",
      "nous": "lavions",
      "vous": "laviez",
      "ils/elles": "lavaient"
    },
    "pardonner": {
      "je": "pardonnais",
      "tu": "pardonnais",
      "il/elle/on": "pardonnait",
      "nous": "pardonnions",
      "vous": "pardonniez",
      "ils/elles": "pardonnaient"
    },
    "présenter": {
      "je": "présentais",
      "tu": "présentais",
      "il/elle/on": "présentait",
      "nous": "présentions",
      "vous": "présentiez",
      "ils/elles": "présentaient"
    },
    "prêter": {
      "je": "prêtais",
      "tu": "prêtais",
      "il/elle/on": "prêtait",
      "nous": "prêtions",
      "vous": "prêtiez",
      "ils/elles": "prêtaient"
    },
    "quitter": {
      "je": "quittais",
      "tu": "quittais",
      "il/elle/on": "quittait",
      "nous": "quittions",
      "vous": "quittiez",
      "ils/elles": "quittaient"
    },
    "refuser": {
      "je": "refusais",
      "tu": "refusais",
      "il/elle/on": "refusait",
      "nous": "refusions",
      "vous": "refusiez",
      "ils/elles": "refusaient"
    },
    "rencontrer": {
      "je": "rencontrais",
      "tu": "rencontrais",
      "il/elle/on": "rencontrait",
      "nous": "rencontrions",
      "vous": "rencontriez",
      "ils/elles": "rencontraient"
    },
    "reposer": {
      "je": "reposais",
      "tu": "reposais",
      "il/elle/on": "reposait",
      "nous": "reposions",
      "vous": "reposiez",
      "ils/elles": "reposaient"
    },
    "rêver": {
      "je": "rêvais",
      "tu": "rêvais",
      "il/elle/on": "rêvait",
      "nous": "rêvions",
      "vous": "rêviez",
      "ils/elles": "rêvaient"
    },
    "saluer": {
      "je": "saluais",
      "tu": "saluais",
      "il/elle/on": "saluait",
      "nous": "saluions",
      "vous": "saluiez",
      "ils/elles": "saluaient"
    },
    "sauter": {
      "je": "sautais",
      "tu": "sautais",
      "il/elle/on": "sautait",
      "nous": "sautions",
      "vous": "sautiez",
      "ils/elles": "sautaient"
    },
    "sembler": {
      "je": "semblais",
      "tu": "semblais",
      "il/elle/on": "semblait",
      "nous": "semblions",
      "vous": "sembliez",
      "ils/elles": "semblaient"
    },
    "signer": {
      "je": "signais",
      "tu": "signais",
      "il/elle/on": "signait",
      "nous": "signions",
      "vous": "signiez",
      "ils/elles": "signaient"
    },
    "téléphoner": {
      "je": "téléphonais",
      "tu": "téléphonais",
      "il/elle/on": "téléphonait",
      "nous": "téléphonions",
      "vous": "téléphoniez",
      "ils/elles": "téléphonaient"
    },
    "terminer": {
      "je": "terminais",
      "tu": "terminais",
      "il/elle/on": "terminait",
      "nous": "terminions",
      "vous": "terminiez",
      "ils/elles": "terminaient"
    },
    "traverser": {
      "je": "traversais",
      "tu": "traversais",
      "il/elle/on": "traversait",
      "nous": "traversions",
      "vous": "traversiez",
      "ils/elles": "traversaient"
    },
    "utiliser": {
      "je": "j'utilisais",
      "tu": "utilisais",
      "il/elle/on": "utilisait",
      "nous": "utilisions",
      "vous": "utilisiez",
      "ils/elles": "utilisaient"
    },
    "visiter": {
      "je": "visitais",
      "tu": "visitais",
      "il/elle/on": "visitait",
      "nous": "visitions",
      "vous": "visitiez",
      "ils/elles": "visitaient"
    },
    "voler": {
      "je": "volais",
      "tu": "volais",
      "il/elle/on": "volait",
      "nous": "volions",
      "vous": "voliez",
      "ils/elles": "volaient"
    },
    "accepter": {
      "je": "j'acceptais",
      "tu": "acceptais",
      "il/elle/on": "acceptait",
      "nous": "acceptions",
      "vous": "acceptiez",
      "ils/elles": "acceptaient"
    },
    "adorer": {
      "je": "j'adorais",
      "tu": "adorais",
      "il/elle/on": "adorait",
      "nous": "adorions",
      "vous": "adoriez",
      "ils/elles": "adoraient"
    },
    "apporter": {
      "je": "j'apportais",
      "tu": "apportais",
      "il/elle/on": "apportait",
      "nous": "apportions",
      "vous": "apportiez",
      "ils/elles": "apportaient"
    },
    "arrêter": {
      "je": "j'arrêtais",
      "tu": "arrêtais",
      "il/elle/on": "arrêtait",
      "nous": "arrêtions",
      "vous": "arrêtiez",
      "ils/elles": "arrêtaient"
    },
    "commander": {
      "je": "commandais",
      "tu": "commandais",
      "il/elle/on": "commandait",
      "nous": "commandions",
      "vous": "commandiez",
      "ils/elles": "commandaient"
    },
    "compter": {
      "je": "comptais",
      "tu": "comptais",
      "il/elle/on": "comptait",
      "nous": "comptions",
      "vous": "comptiez",
      "ils/elles": "comptaient"
    },
    "conseiller": {
      "je": "conseillais",
      "tu": "conseillais",
      "il/elle/on": "conseillait",
      "nous": "conseillions",
      "vous": "conseilliez",
      "ils/elles": "conseillaient"
    },
    "continuer": {
      "je": "continuais",
      "tu": "continuais",
      "il/elle/on": "continuait",
      "nous": "continuions",
      "vous": "continuiez",
      "ils/elles": "continuaient"
    },
    "coûter": {
      "je": "coûtais",
      "tu": "coûtais",
      "il/elle/on": "coûtait",
      "nous": "coûtions",
      "vous": "coûtiez",
      "ils/elles": "coûtaient"
    },
    "crier": {
      "je": "criais",
      "tu": "criais",
      "il/elle/on": "criait",
      "nous": "criions",
      "vous": "criiez",
      "ils/elles": "criaient"
    },
    "déjeuner": {
      "je": "déjeunais",
      "tu": "déjeunais",
      "il/elle/on": "déjeunait",
      "nous": "déjeunions",
      "vous": "déjeuniez",
      "ils/elles": "déjeunaient"
    },
    "désirer": {
      "je": "désirais",
      "tu": "désirais",
      "il/elle/on": "désirait",
      "nous": "désirions",
      "vous": "désiriez",
      "ils/elles": "désiraient"
    },
    "détester": {
      "je": "détestais",
      "tu": "détestais",
      "il/elle/on": "détestait",
      "nous": "détestions",
      "vous": "détestiez",
      "ils/elles": "détestaient"
    },
    "dessiner": {
      "je": "dessinais",
      "tu": "dessinais",
      "il/elle/on": "dessinait",
      "nous": "dessinions",
      "vous": "dessiniez",
      "ils/elles": "dessinaient"
    },
    "dîner": {
      "je": "dînais",
      "tu": "dînais",
      "il/elle/on": "dînait",
      "nous": "dînions",
      "vous": "dîniez",
      "ils/elles": "dînaient"
    },
    "discuter": {
      "je": "discutais",
      "tu": "discutais",
      "il/elle/on": "discutait",
      "nous": "discutions",
      "vous": "discutiez",
      "ils/elles": "discutaient"
    },
    "éviter": {
      "je": "j'évitais",
      "tu": "évitais",
      "il/elle/on": "évitait",
      "nous": "évitions",
      "vous": "évitiez",
      "ils/elles": "évitaient"
    },
    "excuser": {
      "je": "j'excusais",
      "tu": "excusais",
      "il/elle/on": "excusait",
      "nous": "excusions",
      "vous": "excusiez",
      "ils/elles": "excusaient"
    },
    "fumer": {
      "je": "fumais",
      "tu": "fumais",
      "il/elle/on": "fumait",
      "nous": "fumions",
      "vous": "fumiez",
      "ils/elles": "fumaient"
    },
    "habiter": {
      "je": "habitais",
      "tu": "habitais",
      "il/elle/on": "habitait",
      "nous": "habitions",
      "vous": "habitiez",
      "ils/elles": "habitaient"
    },
    "imaginer": {
      "je": "j'imaginais",
      "tu": "imaginais",
      "il/elle/on": "imaginait",
      "nous": "imaginions",
      "vous": "imaginiez",
      "ils/elles": "imaginaient"
    },
    "importer": {
      "je": "j'importais",
      "tu": "importais",
      "il/elle/on": "importait",
      "nous": "importions",
      "vous": "importiez",
      "ils/elles": "importaient"
    },
    "inviter": {
      "je": "j'invitais",
      "tu": "invitais",
      "il/elle/on": "invitait",
      "nous": "invitions",
      "vous": "invitiez",
      "ils/elles": "invitaient"
    },
    "noter": {
      "je": "notais",
      "tu": "notais",
      "il/elle/on": "notait",
      "nous": "notions",
      "vous": "notiez",
      "ils/elles": "notaient"
    },
    "organiser": {
      "je": "j'organisais",
      "tu": "organisais",
      "il/elle/on": "organisait",
      "nous": "organisions",
      "vous": "organisiez",
      "ils/elles": "organisaient"
    },
    "parier": {
      "je": "pariais",
      "tu": "pariais",
      "il/elle/on": "pariait",
      "nous": "pariions",
      "vous": "pariiez",
      "ils/elles": "pariaient"
    },
    "pleurer": {
      "je": "pleurais",
      "tu": "pleurais",
      "il/elle/on": "pleurait",
      "nous": "pleurions",
      "vous": "pleuriez",
      "ils/elles": "pleuraient"
    },
    "poser": {
      "je": "posais",
      "tu": "posais",
      "il/elle/on": "posait",
      "nous": "posions",
      "vous": "posiez",
      "ils/elles": "posaient"
    },
    "pousser": {
      "je": "poussais",
      "tu": "poussais",
      "il/elle/on": "poussait",
      "nous": "poussions",
      "vous": "poussiez",
      "ils/elles": "poussaient"
    },
    "prier": {
      "je": "priais",
      "tu": "priais",
      "il/elle/on": "priait",
      "nous": "priions",
      "vous": "priiez",
      "ils/elles": "priaient"
    },
    "rappeler": {
      "je": "rappelais",
      "tu": "rappelais",
      "il/elle/on": "rappelait",
      "nous": "rappelions",
      "vous": "rappeliez",
      "ils/elles": "rappelaient"
    },
    "remercier": {
      "je": "remerciais",
      "tu": "remerciais",
      "il/elle/on": "remerciait",
      "nous": "remerciions",
      "vous": "remerciiez",
      "ils/elles": "remerciaient"
    },
    "respecter": {
      "je": "respectais",
      "tu": "respectais",
      "il/elle/on": "respectait",
      "nous": "respections",
      "vous": "respectiez",
      "ils/elles": "respectaient"
    },
    "retourner": {
      "je": "retournais",
      "tu": "retournais",
      "il/elle/on": "retournait",
      "nous": "retournions",
      "vous": "retourniez",
      "ils/elles": "retournaient"
    },
    "retrouver": {
      "je": "retrouvais",
      "tu": "retrouvais",
      "il/elle/on": "retrouvait",
      "nous": "retrouvions",
      "vous": "retrouviez",
      "ils/elles": "retrouvaient"
    },
    "réveiller": {
      "je": "réveillais",
      "tu": "réveillais",
      "il/elle/on": "réveillait",
      "nous": "réveillions",
      "vous": "réveilliez",
      "ils/elles": "réveillaient"
    },
    "toucher": {
      "je": "touchais",
      "tu": "touchais",
      "il/elle/on": "touchait",
      "nous": "touchions",
      "vous": "touchiez",
      "ils/elles": "touchaient"
    },
    "tuer": {
      "je": "tuais",
      "tu": "tuais",
      "il/elle/on": "tuait",
      "nous": "tuions",
      "vous": "tuiez",
      "ils/elles": "tuaient"
    },
    "vérifier": {
      "je": "vérifiais",
      "tu": "vérifiais",
      "il/elle/on": "vérifiait",
      "nous": "vérifiions",
      "vous": "vérifiiez",
      "ils/elles": "vérifiaient"
    }
  },
  "plusQueParfait": {
    "être": {
      "je": "été",
      "tu": "avais été",
      "il/elle/on": "avait été",
      "nous": "avions été",
      "vous": "aviez été",
      "ils/elles": "avaient été"
    },
    "avoir": {
      "je": "eu",
      "tu": "avais eu",
      "il/elle/on": "avait eu",
      "nous": "avions eu",
      "vous": "aviez eu",
      "ils/elles": "avaient eu"
    },
    "aller": {
      "je": "allé",
      "tu": "étais allé",
      "il/elle/on": "était allé",
      "nous": "étions allés",
      "vous": "étiez allés",
      "ils/elles": "étaient allés"
    },
    "faire": {
      "je": "fait",
      "tu": "avais fait",
      "il/elle/on": "avait fait",
      "nous": "avions fait",
      "vous": "aviez fait",
      "ils/elles": "avaient fait"
    },
    "venir": {
      "je": "venu",
      "tu": "étais venu",
      "il/elle/on": "était venu",
      "nous": "étions venus",
      "vous": "étiez venus",
      "ils/elles": "étaient venus"
    },
    "pouvoir": {
      "je": "pu",
      "tu": "avais pu",
      "il/elle/on": "avait pu",
      "nous": "avions pu",
      "vous": "aviez pu",
      "ils/elles": "avaient pu"
    },
    "vouloir": {
      "je": "voulu",
      "tu": "avais voulu",
      "il/elle/on": "avait voulu",
      "nous": "avions voulu",
      "vous": "aviez voulu",
      "ils/elles": "avaient voulu"
    },
    "savoir": {
      "je": "su",
      "tu": "avais su",
      "il/elle/on": "avait su",
      "nous": "avions su",
      "vous": "aviez su",
      "ils/elles": "avaient su"
    },
    "devoir": {
      "je": "dû",
      "tu": "avais dû",
      "il/elle/on": "avait dû",
      "nous": "avions dû",
      "vous": "aviez dû",
      "ils/elles": "avaient dû"
    },
    "dire": {
      "je": "dit",
      "tu": "avais dit",
      "il/elle/on": "avait dit",
      "nous": "avions dit",
      "vous": "aviez dit",
      "ils/elles": "avaient dit"
    },
    "voir": {
      "je": "vu",
      "tu": "avais vu",
      "il/elle/on": "avait vu",
      "nous": "avions vu",
      "vous": "aviez vu",
      "ils/elles": "avaient vu"
    },
    "prendre": {
      "je": "pris",
      "tu": "avais pris",
      "il/elle/on": "avait pris",
      "nous": "avions pris",
      "vous": "aviez pris",
      "ils/elles": "avaient pris"
    },
    "mettre": {
      "je": "mis",
      "tu": "avais mis",
      "il/elle/on": "avait mis",
      "nous": "avions mis",
      "vous": "aviez mis",
      "ils/elles": "avaient mis"
    },
    "croire": {
      "je": "cru",
      "tu": "avais cru",
      "il/elle/on": "avait cru",
      "nous": "avions cru",
      "vous": "aviez cru",
      "ils/elles": "avaient cru"
    },
    "parler": {
      "je": "parlé",
      "tu": "avais parlé",
      "il/elle/on": "avait parlé",
      "nous": "avions parlé",
      "vous": "aviez parlé",
      "ils/elles": "avaient parlé"
    },
    "passer": {
      "je": "passé",
      "tu": "étais passé",
      "il/elle/on": "était passé",
      "nous": "étions passés",
      "vous": "étiez passés",
      "ils/elles": "étaient passés"
    },
    "trouver": {
      "je": "trouvé",
      "tu": "avais trouvé",
      "il/elle/on": "avait trouvé",
      "nous": "avions trouvé",
      "vous": "aviez trouvé",
      "ils/elles": "avaient trouvé"
    },
    "donner": {
      "je": "donné",
      "tu": "avais donné",
      "il/elle/on": "avait donné",
      "nous": "avions donné",
      "vous": "aviez donné",
      "ils/elles": "avaient donné"
    },
    "comprendre": {
      "je": "compris",
      "tu": "avais compris",
      "il/elle/on": "avait compris",
      "nous": "avions compris",
      "vous": "aviez compris",
      "ils/elles": "avaient compris"
    },
    "partir": {
      "je": "parti",
      "tu": "étais parti",
      "il/elle/on": "était parti",
      "nous": "étions partis",
      "vous": "étiez partis",
      "ils/elles": "étaient partis"
    },
    "demander": {
      "je": "demandé",
      "tu": "avais demandé",
      "il/elle/on": "avait demandé",
      "nous": "avions demandé",
      "vous": "aviez demandé",
      "ils/elles": "avaient demandé"
    },
    "tenir": {
      "je": "tenu",
      "tu": "avais tenu",
      "il/elle/on": "avait tenu",
      "nous": "avions tenu",
      "vous": "aviez tenu",
      "ils/elles": "avaient tenu"
    },
    "aimer": {
      "je": "aimé",
      "tu": "avais aimé",
      "il/elle/on": "avait aimé",
      "nous": "avions aimé",
      "vous": "aviez aimé",
      "ils/elles": "avaient aimé"
    },
    "penser": {
      "je": "pensé",
      "tu": "avais pensé",
      "il/elle/on": "avait pensé",
      "nous": "avions pensé",
      "vous": "aviez pensé",
      "ils/elles": "avaient pensé"
    },
    "rester": {
      "je": "resté",
      "tu": "étais resté",
      "il/elle/on": "était resté",
      "nous": "étions restés",
      "vous": "étiez restés",
      "ils/elles": "étaient restés"
    },
    "manger": {
      "je": "mangé",
      "tu": "avais mangé",
      "il/elle/on": "avait mangé",
      "nous": "avions mangé",
      "vous": "aviez mangé",
      "ils/elles": "avaient mangé"
    },
    "laisser": {
      "je": "laissé",
      "tu": "avais laissé",
      "il/elle/on": "avait laissé",
      "nous": "avions laissé",
      "vous": "aviez laissé",
      "ils/elles": "avaient laissé"
    },
    "regarder": {
      "je": "regardé",
      "tu": "avais regardé",
      "il/elle/on": "avait regardé",
      "nous": "avions regardé",
      "vous": "aviez regardé",
      "ils/elles": "avaient regardé"
    },
    "répondre": {
      "je": "répondu",
      "tu": "avais répondu",
      "il/elle/on": "avait répondu",
      "nous": "avions répondu",
      "vous": "aviez répondu",
      "ils/elles": "avaient répondu"
    },
    "vivre": {
      "je": "vécu",
      "tu": "avais vécu",
      "il/elle/on": "avait vécu",
      "nous": "avions vécu",
      "vous": "aviez vécu",
      "ils/elles": "avaient vécu"
    },
    "chercher": {
      "je": "cherché",
      "tu": "avais cherché",
      "il/elle/on": "avait cherché",
      "nous": "avions cherché",
      "vous": "aviez cherché",
      "ils/elles": "avaient cherché"
    },
    "sentir": {
      "je": "senti",
      "tu": "avais senti",
      "il/elle/on": "avait senti",
      "nous": "avions senti",
      "vous": "aviez senti",
      "ils/elles": "avaient senti"
    },
    "entendre": {
      "je": "entendu",
      "tu": "avais entendu",
      "il/elle/on": "avait entendu",
      "nous": "avions entendu",
      "vous": "aviez entendu",
      "ils/elles": "avaient entendu"
    },
    "attendre": {
      "je": "attendu",
      "tu": "avais attendu",
      "il/elle/on": "avait attendu",
      "nous": "avions attendu",
      "vous": "aviez attendu",
      "ils/elles": "avaient attendu"
    },
    "sortir": {
      "je": "sorti",
      "tu": "étais sorti",
      "il/elle/on": "était sorti",
      "nous": "étions sortis",
      "vous": "étiez sortis",
      "ils/elles": "étaient sortis"
    },
    "connaître": {
      "je": "connu",
      "tu": "avais connu",
      "il/elle/on": "avait connu",
      "nous": "avions connu",
      "vous": "aviez connu",
      "ils/elles": "avaient connu"
    },
    "arriver": {
      "je": "arrivé",
      "tu": "étais arrivé",
      "il/elle/on": "était arrivé",
      "nous": "étions arrivés",
      "vous": "étiez arrivés",
      "ils/elles": "étaient arrivés"
    },
    "ouvrir": {
      "je": "ouvert",
      "tu": "avais ouvert",
      "il/elle/on": "avait ouvert",
      "nous": "avions ouvert",
      "vous": "aviez ouvert",
      "ils/elles": "avaient ouvert"
    },
    "perdre": {
      "je": "perdu",
      "tu": "avais perdu",
      "il/elle/on": "avait perdu",
      "nous": "avions perdu",
      "vous": "aviez perdu",
      "ils/elles": "avaient perdu"
    },
    "écrire": {
      "je": "écrit",
      "tu": "avais écrit",
      "il/elle/on": "avait écrit",
      "nous": "avions écrit",
      "vous": "aviez écrit",
      "ils/elles": "avaient écrit"
    },
    "devenir": {
      "je": "devenu",
      "tu": "étais devenu",
      "il/elle/on": "était devenu",
      "nous": "étions devenus",
      "vous": "étiez devenus",
      "ils/elles": "étaient devenus"
    },
    "suivre": {
      "je": "suivi",
      "tu": "avais suivi",
      "il/elle/on": "avait suivi",
      "nous": "avions suivi",
      "vous": "aviez suivi",
      "ils/elles": "avaient suivi"
    },
    "montrer": {
      "je": "montré",
      "tu": "avais montré",
      "il/elle/on": "avait montré",
      "nous": "avions montré",
      "vous": "aviez montré",
      "ils/elles": "avaient montré"
    },
    "mourir": {
      "je": "mort",
      "tu": "étais mort",
      "il/elle/on": "était mort",
      "nous": "étions morts",
      "vous": "étiez morts",
      "ils/elles": "étaient morts"
    },
    "appeler": {
      "je": "appelé",
      "tu": "avais appelé",
      "il/elle/on": "avait appelé",
      "nous": "avions appelé",
      "vous": "aviez appelé",
      "ils/elles": "avaient appelé"
    },
    "commencer": {
      "je": "commencé",
      "tu": "avais commencé",
      "il/elle/on": "avait commencé",
      "nous": "avions commencé",
      "vous": "aviez commencé",
      "ils/elles": "avaient commencé"
    },
    "finir": {
      "je": "fini",
      "tu": "avais fini",
      "il/elle/on": "avait fini",
      "nous": "avions fini",
      "vous": "aviez fini",
      "ils/elles": "avaient fini"
    },
    "servir": {
      "je": "servi",
      "tu": "avais servi",
      "il/elle/on": "avait servi",
      "nous": "avions servi",
      "vous": "aviez servi",
      "ils/elles": "avaient servi"
    },
    "lire": {
      "je": "lu",
      "tu": "avais lu",
      "il/elle/on": "avait lu",
      "nous": "avions lu",
      "vous": "aviez lu",
      "ils/elles": "avaient lu"
    },
    "travailler": {
      "je": "travaillé",
      "tu": "avais travaillé",
      "il/elle/on": "avait travaillé",
      "nous": "avions travaillé",
      "vous": "aviez travaillé",
      "ils/elles": "avaient travaillé"
    },
    "jouer": {
      "je": "joué",
      "tu": "avais joué",
      "il/elle/on": "avait joué",
      "nous": "avions joué",
      "vous": "aviez joué",
      "ils/elles": "avaient joué"
    },
    "recevoir": {
      "je": "reçu",
      "tu": "avais reçu",
      "il/elle/on": "avait reçu",
      "nous": "avions reçu",
      "vous": "aviez reçu",
      "ils/elles": "avaient reçu"
    },
    "changer": {
      "je": "changé",
      "tu": "avais changé",
      "il/elle/on": "avait changé",
      "nous": "avions changé",
      "vous": "aviez changé",
      "ils/elles": "avaient changé"
    },
    "gagner": {
      "je": "gagné",
      "tu": "avais gagné",
      "il/elle/on": "avait gagné",
      "nous": "avions gagné",
      "vous": "aviez gagné",
      "ils/elles": "avaient gagné"
    },
    "boire": {
      "je": "bu",
      "tu": "avais bu",
      "il/elle/on": "avait bu",
      "nous": "avions bu",
      "vous": "aviez bu",
      "ils/elles": "avaient bu"
    },
    "décider": {
      "je": "décidé",
      "tu": "avais décidé",
      "il/elle/on": "avait décidé",
      "nous": "avions décidé",
      "vous": "aviez décidé",
      "ils/elles": "avaient décidé"
    },
    "oublier": {
      "je": "oublié",
      "tu": "avais oublié",
      "il/elle/on": "avait oublié",
      "nous": "avions oublié",
      "vous": "aviez oublié",
      "ils/elles": "avaient oublié"
    },
    "dormir": {
      "je": "dormi",
      "tu": "avais dormi",
      "il/elle/on": "avait dormi",
      "nous": "avions dormi",
      "vous": "aviez dormi",
      "ils/elles": "avaient dormi"
    },
    "courir": {
      "je": "couru",
      "tu": "avais couru",
      "il/elle/on": "avait couru",
      "nous": "avions couru",
      "vous": "aviez couru",
      "ils/elles": "avaient couru"
    },
    "acheter": {
      "je": "acheté",
      "tu": "avais acheté",
      "il/elle/on": "avait acheté",
      "nous": "avions acheté",
      "vous": "aviez acheté",
      "ils/elles": "avaient acheté"
    },
    "payer": {
      "je": "payé",
      "tu": "avais payé",
      "il/elle/on": "avait payé",
      "nous": "avions payé",
      "vous": "aviez payé",
      "ils/elles": "avaient payé"
    },
    "choisir": {
      "je": "choisi",
      "tu": "avais choisi",
      "il/elle/on": "avait choisi",
      "nous": "avions choisi",
      "vous": "aviez choisi",
      "ils/elles": "avaient choisi"
    },
    "essayer": {
      "je": "essayé",
      "tu": "avais essayé",
      "il/elle/on": "avait essayé",
      "nous": "avions essayé",
      "vous": "aviez essayé",
      "ils/elles": "avaient essayé"
    },
    "envoyer": {
      "je": "envoyé",
      "tu": "avais envoyé",
      "il/elle/on": "avait envoyé",
      "nous": "avions envoyé",
      "vous": "aviez envoyé",
      "ils/elles": "avaient envoyé"
    },
    "rentrer": {
      "je": "rentré",
      "tu": "étais rentré",
      "il/elle/on": "était rentré",
      "nous": "étions rentrés",
      "vous": "étiez rentrés",
      "ils/elles": "étaient rentrés"
    },
    "porter": {
      "je": "porté",
      "tu": "avais porté",
      "il/elle/on": "avait porté",
      "nous": "avions porté",
      "vous": "aviez porté",
      "ils/elles": "avaient porté"
    },
    "marcher": {
      "je": "marché",
      "tu": "avais marché",
      "il/elle/on": "avait marché",
      "nous": "avions marché",
      "vous": "aviez marché",
      "ils/elles": "avaient marché"
    },
    "monter": {
      "je": "monté",
      "tu": "étais monté",
      "il/elle/on": "était monté",
      "nous": "étions montés",
      "vous": "étiez montés",
      "ils/elles": "étaient montés"
    },
    "aider": {
      "je": "aidé",
      "tu": "avais aidé",
      "il/elle/on": "avait aidé",
      "nous": "avions aidé",
      "vous": "aviez aidé",
      "ils/elles": "avaient aidé"
    },
    "tomber": {
      "je": "tombé",
      "tu": "étais tombé",
      "il/elle/on": "était tombé",
      "nous": "étions tombés",
      "vous": "étiez tombés",
      "ils/elles": "étaient tombés"
    },
    "conduire": {
      "je": "conduit",
      "tu": "avais conduit",
      "il/elle/on": "avait conduit",
      "nous": "avions conduit",
      "vous": "aviez conduit",
      "ils/elles": "avaient conduit"
    },
    "expliquer": {
      "je": "expliqué",
      "tu": "avais expliqué",
      "il/elle/on": "avait expliqué",
      "nous": "avions expliqué",
      "vous": "aviez expliqué",
      "ils/elles": "avaient expliqué"
    },
    "apprendre": {
      "je": "appris",
      "tu": "avais appris",
      "il/elle/on": "avait appris",
      "nous": "avions appris",
      "vous": "aviez appris",
      "ils/elles": "avaient appris"
    },
    "produire": {
      "je": "produit",
      "tu": "avais produit",
      "il/elle/on": "avait produit",
      "nous": "avions produit",
      "vous": "aviez produit",
      "ils/elles": "avaient produit"
    },
    "préparer": {
      "je": "préparé",
      "tu": "avais préparé",
      "il/elle/on": "avait préparé",
      "nous": "avions préparé",
      "vous": "aviez préparé",
      "ils/elles": "avaient préparé"
    },
    "chanter": {
      "je": "chanté",
      "tu": "avais chanté",
      "il/elle/on": "avait chanté",
      "nous": "avions chanté",
      "vous": "aviez chanté",
      "ils/elles": "avaient chanté"
    },
    "danser": {
      "je": "dansé",
      "tu": "avais dansé",
      "il/elle/on": "avait dansé",
      "nous": "avions dansé",
      "vous": "aviez dansé",
      "ils/elles": "avaient dansé"
    },
    "raconter": {
      "je": "raconté",
      "tu": "avais raconté",
      "il/elle/on": "avait raconté",
      "nous": "avions raconté",
      "vous": "aviez raconté",
      "ils/elles": "avaient raconté"
    },
    "espérer": {
      "je": "espéré",
      "tu": "avais espéré",
      "il/elle/on": "avait espéré",
      "nous": "avions espéré",
      "vous": "aviez espéré",
      "ils/elles": "avaient espéré"
    },
    "offrir": {
      "je": "offert",
      "tu": "avais offert",
      "il/elle/on": "avait offert",
      "nous": "avions offert",
      "vous": "aviez offert",
      "ils/elles": "avaient offert"
    },
    "construire": {
      "je": "construit",
      "tu": "avais construit",
      "il/elle/on": "avait construit",
      "nous": "avions construit",
      "vous": "aviez construit",
      "ils/elles": "avaient construit"
    },
    "détruire": {
      "je": "détruit",
      "tu": "avais détruit",
      "il/elle/on": "avait détruit",
      "nous": "avions détruit",
      "vous": "aviez détruit",
      "ils/elles": "avaient détruit"
    },
    "traduire": {
      "je": "traduit",
      "tu": "avais traduit",
      "il/elle/on": "avait traduit",
      "nous": "avions traduit",
      "vous": "aviez traduit",
      "ils/elles": "avaient traduit"
    },
    "revenir": {
      "je": "revenu",
      "tu": "étais revenu",
      "il/elle/on": "était revenu",
      "nous": "étions revenus",
      "vous": "étiez revenus",
      "ils/elles": "étaient revenus"
    },
    "entrer": {
      "je": "entré",
      "tu": "étais entré",
      "il/elle/on": "était entré",
      "nous": "étions entrés",
      "vous": "étiez entrés",
      "ils/elles": "étaient entrés"
    },
    "naître": {
      "je": "né",
      "tu": "étais né",
      "il/elle/on": "était né",
      "nous": "étions nés",
      "vous": "étiez nés",
      "ils/elles": "étaient nés"
    },
    "descendre": {
      "je": "descendu",
      "tu": "étais descendu",
      "il/elle/on": "était descendu",
      "nous": "étions descendus",
      "vous": "étiez descendus",
      "ils/elles": "étaient descendus"
    },
    "plaire": {
      "je": "plu",
      "tu": "avais plu",
      "il/elle/on": "avait plu",
      "nous": "avions plu",
      "vous": "aviez plu",
      "ils/elles": "avaient plu"
    },
    "sourire": {
      "je": "souri",
      "tu": "avais souri",
      "il/elle/on": "avait souri",
      "nous": "avions souri",
      "vous": "aviez souri",
      "ils/elles": "avaient souri"
    },
    "rire": {
      "je": "ri",
      "tu": "avais ri",
      "il/elle/on": "avait ri",
      "nous": "avions ri",
      "vous": "aviez ri",
      "ils/elles": "avaient ri"
    },
    "vendre": {
      "je": "vendu",
      "tu": "avais vendu",
      "il/elle/on": "avait vendu",
      "nous": "avions vendu",
      "vous": "aviez vendu",
      "ils/elles": "avaient vendu"
    },
    "permettre": {
      "je": "permis",
      "tu": "avais permis",
      "il/elle/on": "avait permis",
      "nous": "avions permis",
      "vous": "aviez permis",
      "ils/elles": "avaient permis"
    },
    "promettre": {
      "je": "promis",
      "tu": "avais promis",
      "il/elle/on": "avait promis",
      "nous": "avions promis",
      "vous": "aviez promis",
      "ils/elles": "avaient promis"
    },
    "paraître": {
      "je": "paru",
      "tu": "avais paru",
      "il/elle/on": "avait paru",
      "nous": "avions paru",
      "vous": "aviez paru",
      "ils/elles": "avaient paru"
    },
    "disparaître": {
      "je": "disparu",
      "tu": "avais disparu",
      "il/elle/on": "avait disparu",
      "nous": "avions disparu",
      "vous": "aviez disparu",
      "ils/elles": "avaient disparu"
    },
    "reconnaître": {
      "je": "reconnu",
      "tu": "avais reconnu",
      "il/elle/on": "avait reconnu",
      "nous": "avions reconnu",
      "vous": "aviez reconnu",
      "ils/elles": "avaient reconnu"
    },
    "battre": {
      "je": "battu",
      "tu": "avais battu",
      "il/elle/on": "avait battu",
      "nous": "avions battu",
      "vous": "aviez battu",
      "ils/elles": "avaient battu"
    },
    "mentir": {
      "je": "menti",
      "tu": "avais menti",
      "il/elle/on": "avait menti",
      "nous": "avions menti",
      "vous": "aviez menti",
      "ils/elles": "avaient menti"
    },
    "partager": {
      "je": "partagé",
      "tu": "avais partagé",
      "il/elle/on": "avait partagé",
      "nous": "avions partagé",
      "vous": "aviez partagé",
      "ils/elles": "avaient partagé"
    },
    "protéger": {
      "je": "protégé",
      "tu": "avais protégé",
      "il/elle/on": "avait protégé",
      "nous": "avions protégé",
      "vous": "aviez protégé",
      "ils/elles": "avaient protégé"
    },
    "voyager": {
      "je": "voyagé",
      "tu": "avais voyagé",
      "il/elle/on": "avait voyagé",
      "nous": "avions voyagé",
      "vous": "aviez voyagé",
      "ils/elles": "avaient voyagé"
    },
    "étudier": {
      "je": "étudié",
      "tu": "avais étudié",
      "il/elle/on": "avait étudié",
      "nous": "avions étudié",
      "vous": "aviez étudié",
      "ils/elles": "avaient étudié"
    },
    "réussir": {
      "je": "réussi",
      "tu": "avais réussi",
      "il/elle/on": "avait réussi",
      "nous": "avions réussi",
      "vous": "aviez réussi",
      "ils/elles": "avaient réussi"
    },
    "grandir": {
      "je": "grandi",
      "tu": "avais grandi",
      "il/elle/on": "avait grandi",
      "nous": "avions grandi",
      "vous": "aviez grandi",
      "ils/elles": "avaient grandi"
    },
    "vieillir": {
      "je": "vieilli",
      "tu": "avais vieilli",
      "il/elle/on": "avait vieilli",
      "nous": "avions vieilli",
      "vous": "aviez vieilli",
      "ils/elles": "avaient vieilli"
    },
    "rougir": {
      "je": "rougi",
      "tu": "avais rougi",
      "il/elle/on": "avait rougi",
      "nous": "avions rougi",
      "vous": "aviez rougi",
      "ils/elles": "avaient rougi"
    },
    "maigrir": {
      "je": "maigri",
      "tu": "avais maigri",
      "il/elle/on": "avait maigri",
      "nous": "avions maigri",
      "vous": "aviez maigri",
      "ils/elles": "avaient maigri"
    },
    "grossir": {
      "je": "grossi",
      "tu": "avais grossi",
      "il/elle/on": "avait grossi",
      "nous": "avions grossi",
      "vous": "aviez grossi",
      "ils/elles": "avaient grossi"
    },
    "obéir": {
      "je": "obéi",
      "tu": "avais obéi",
      "il/elle/on": "avait obéi",
      "nous": "avions obéi",
      "vous": "aviez obéi",
      "ils/elles": "avaient obéi"
    },
    "désobéir": {
      "je": "désobéi",
      "tu": "avais désobéi",
      "il/elle/on": "avait désobéi",
      "nous": "avions désobéi",
      "vous": "aviez désobéi",
      "ils/elles": "avaient désobéi"
    },
    "réfléchir": {
      "je": "réfléchi",
      "tu": "avais réfléchi",
      "il/elle/on": "avait réfléchi",
      "nous": "avions réfléchi",
      "vous": "aviez réfléchi",
      "ils/elles": "avaient réfléchi"
    },
    "remplir": {
      "je": "rempli",
      "tu": "avais rempli",
      "il/elle/on": "avait rempli",
      "nous": "avions rempli",
      "vous": "aviez rempli",
      "ils/elles": "avaient rempli"
    },
    "punir": {
      "je": "puni",
      "tu": "avais puni",
      "il/elle/on": "avait puni",
      "nous": "avions puni",
      "vous": "aviez puni",
      "ils/elles": "avaient puni"
    },
    "guérir": {
      "je": "guéri",
      "tu": "avais guéri",
      "il/elle/on": "avait guéri",
      "nous": "avions guéri",
      "vous": "aviez guéri",
      "ils/elles": "avaient guéri"
    },
    "bâtir": {
      "je": "bâti",
      "tu": "avais bâti",
      "il/elle/on": "avait bâti",
      "nous": "avions bâti",
      "vous": "aviez bâti",
      "ils/elles": "avaient bâti"
    },
    "nourrir": {
      "je": "nourri",
      "tu": "avais nourri",
      "il/elle/on": "avait nourri",
      "nous": "avions nourri",
      "vous": "aviez nourri",
      "ils/elles": "avaient nourri"
    },
    "avertir": {
      "je": "averti",
      "tu": "avais averti",
      "il/elle/on": "avait averti",
      "nous": "avions averti",
      "vous": "aviez averti",
      "ils/elles": "avaient averti"
    },
    "agir": {
      "je": "agi",
      "tu": "avais agi",
      "il/elle/on": "avait agi",
      "nous": "avions agi",
      "vous": "aviez agi",
      "ils/elles": "avaient agi"
    },
    "réagir": {
      "je": "réagi",
      "tu": "avais réagi",
      "il/elle/on": "avait réagi",
      "nous": "avions réagi",
      "vous": "aviez réagi",
      "ils/elles": "avaient réagi"
    },
    "saisir": {
      "je": "saisi",
      "tu": "avais saisi",
      "il/elle/on": "avait saisi",
      "nous": "avions saisi",
      "vous": "aviez saisi",
      "ils/elles": "avaient saisi"
    },
    "établir": {
      "je": "établi",
      "tu": "avais établi",
      "il/elle/on": "avait établi",
      "nous": "avions établi",
      "vous": "aviez établi",
      "ils/elles": "avaient établi"
    },
    "investir": {
      "je": "investi",
      "tu": "avais investi",
      "il/elle/on": "avait investi",
      "nous": "avions investi",
      "vous": "aviez investi",
      "ils/elles": "avaient investi"
    },
    "couvrir": {
      "je": "couvert",
      "tu": "avais couvert",
      "il/elle/on": "avait couvert",
      "nous": "avions couvert",
      "vous": "aviez couvert",
      "ils/elles": "avaient couvert"
    },
    "découvrir": {
      "je": "découvert",
      "tu": "avais découvert",
      "il/elle/on": "avait découvert",
      "nous": "avions découvert",
      "vous": "aviez découvert",
      "ils/elles": "avaient découvert"
    },
    "souffrir": {
      "je": "souffert",
      "tu": "avais souffert",
      "il/elle/on": "avait souffert",
      "nous": "avions souffert",
      "vous": "aviez souffert",
      "ils/elles": "avaient souffert"
    },
    "cueillir": {
      "je": "cueilli",
      "tu": "avais cueilli",
      "il/elle/on": "avait cueilli",
      "nous": "avions cueilli",
      "vous": "aviez cueilli",
      "ils/elles": "avaient cueilli"
    },
    "accueillir": {
      "je": "accueilli",
      "tu": "avais accueilli",
      "il/elle/on": "avait accueilli",
      "nous": "avions accueilli",
      "vous": "aviez accueilli",
      "ils/elles": "avaient accueilli"
    },
    "assaillir": {
      "je": "assailli",
      "tu": "avais assailli",
      "il/elle/on": "avait assailli",
      "nous": "avions assailli",
      "vous": "aviez assailli",
      "ils/elles": "avaient assailli"
    },
    "tressaillir": {
      "je": "tressailli",
      "tu": "avais tressailli",
      "il/elle/on": "avait tressailli",
      "nous": "avions tressailli",
      "vous": "aviez tressailli",
      "ils/elles": "avaient tressailli"
    },
    "fuir": {
      "je": "fui",
      "tu": "avais fui",
      "il/elle/on": "avait fui",
      "nous": "avions fui",
      "vous": "aviez fui",
      "ils/elles": "avaient fui"
    },
    "vêtir": {
      "je": "vêtu",
      "tu": "avais vêtu",
      "il/elle/on": "avait vêtu",
      "nous": "avions vêtu",
      "vous": "aviez vêtu",
      "ils/elles": "avaient vêtu"
    },
    "acquérir": {
      "je": "acquis",
      "tu": "avais acquis",
      "il/elle/on": "avait acquis",
      "nous": "avions acquis",
      "vous": "aviez acquis",
      "ils/elles": "avaient acquis"
    },
    "conquérir": {
      "je": "conquis",
      "tu": "avais conquis",
      "il/elle/on": "avait conquis",
      "nous": "avions conquis",
      "vous": "aviez conquis",
      "ils/elles": "avaient conquis"
    },
    "bouillir": {
      "je": "bouilli",
      "tu": "avais bouilli",
      "il/elle/on": "avait bouilli",
      "nous": "avions bouilli",
      "vous": "aviez bouilli",
      "ils/elles": "avaient bouilli"
    },
    "faillir": {
      "je": "failli",
      "tu": "avais failli",
      "il/elle/on": "avait failli",
      "nous": "avions failli",
      "vous": "aviez failli",
      "ils/elles": "avaient failli"
    },
    "haïr": {
      "je": "haï",
      "tu": "avais haï",
      "il/elle/on": "avait haï",
      "nous": "avions haï",
      "vous": "aviez haï",
      "ils/elles": "avaient haï"
    },
    "ouïr": {
      "je": "ouï",
      "tu": "avais ouï",
      "il/elle/on": "avait ouï",
      "nous": "avions ouï",
      "vous": "aviez ouï",
      "ils/elles": "avaient ouï"
    },
    "réduire": {
      "je": "réduit",
      "tu": "avais réduit",
      "il/elle/on": "avait réduit",
      "nous": "avions réduit",
      "vous": "aviez réduit",
      "ils/elles": "avaient réduit"
    },
    "séduire": {
      "je": "séduit",
      "tu": "avais séduit",
      "il/elle/on": "avait séduit",
      "nous": "avions séduit",
      "vous": "aviez séduit",
      "ils/elles": "avaient séduit"
    },
    "introduire": {
      "je": "introduit",
      "tu": "avais introduit",
      "il/elle/on": "avait introduit",
      "nous": "avions introduit",
      "vous": "aviez introduit",
      "ils/elles": "avaient introduit"
    },
    "cuire": {
      "je": "cuit",
      "tu": "avais cuit",
      "il/elle/on": "avait cuit",
      "nous": "avions cuit",
      "vous": "aviez cuit",
      "ils/elles": "avaient cuit"
    },
    "nuire": {
      "je": "nui",
      "tu": "avais nui",
      "il/elle/on": "avait nui",
      "nous": "avions nui",
      "vous": "aviez nui",
      "ils/elles": "avaient nui"
    },
    "luire": {
      "je": "lui",
      "tu": "avais lui",
      "il/elle/on": "avait lui",
      "nous": "avions lui",
      "vous": "aviez lui",
      "ils/elles": "avaient lui"
    },
    "joindre": {
      "je": "joint",
      "tu": "avais joint",
      "il/elle/on": "avait joint",
      "nous": "avions joint",
      "vous": "aviez joint",
      "ils/elles": "avaient joint"
    },
    "craindre": {
      "je": "craint",
      "tu": "avais craint",
      "il/elle/on": "avait craint",
      "nous": "avions craint",
      "vous": "aviez craint",
      "ils/elles": "avaient craint"
    },
    "peindre": {
      "je": "peint",
      "tu": "avais peint",
      "il/elle/on": "avait peint",
      "nous": "avions peint",
      "vous": "aviez peint",
      "ils/elles": "avaient peint"
    },
    "plaindre": {
      "je": "plaint",
      "tu": "avais plaint",
      "il/elle/on": "avait plaint",
      "nous": "avions plaint",
      "vous": "aviez plaint",
      "ils/elles": "avaient plaint"
    },
    "éteindre": {
      "je": "éteint",
      "tu": "avais éteint",
      "il/elle/on": "avait éteint",
      "nous": "avions éteint",
      "vous": "aviez éteint",
      "ils/elles": "avaient éteint"
    },
    "atteindre": {
      "je": "atteint",
      "tu": "avais atteint",
      "il/elle/on": "avait atteint",
      "nous": "avions atteint",
      "vous": "aviez atteint",
      "ils/elles": "avaient atteint"
    },
    "restreindre": {
      "je": "restreint",
      "tu": "avais restreint",
      "il/elle/on": "avait restreint",
      "nous": "avions restreint",
      "vous": "aviez restreint",
      "ils/elles": "avaient restreint"
    },
    "feindre": {
      "je": "feint",
      "tu": "avais feint",
      "il/elle/on": "avait feint",
      "nous": "avions feint",
      "vous": "aviez feint",
      "ils/elles": "avaient feint"
    },
    "geindre": {
      "je": "geint",
      "tu": "avais geint",
      "il/elle/on": "avait geint",
      "nous": "avions geint",
      "vous": "aviez geint",
      "ils/elles": "avaient geint"
    },
    "contraindre": {
      "je": "contraint",
      "tu": "avais contraint",
      "il/elle/on": "avait contraint",
      "nous": "avions contraint",
      "vous": "aviez contraint",
      "ils/elles": "avaient contraint"
    },
    "résoudre": {
      "je": "résolu",
      "tu": "avais résolu",
      "il/elle/on": "avait résolu",
      "nous": "avions résolu",
      "vous": "aviez résolu",
      "ils/elles": "avaient résolu"
    },
    "absoudre": {
      "je": "absous",
      "tu": "avais absous",
      "il/elle/on": "avait absous",
      "nous": "avions absous",
      "vous": "aviez absous",
      "ils/elles": "avaient absous"
    },
    "dissoudre": {
      "je": "dissous",
      "tu": "avais dissous",
      "il/elle/on": "avait dissous",
      "nous": "avions dissous",
      "vous": "aviez dissous",
      "ils/elles": "avaient dissous"
    },
    "coudre": {
      "je": "cousu",
      "tu": "avais cousu",
      "il/elle/on": "avait cousu",
      "nous": "avions cousu",
      "vous": "aviez cousu",
      "ils/elles": "avaient cousu"
    },
    "moudre": {
      "je": "moulu",
      "tu": "avais moulu",
      "il/elle/on": "avait moulu",
      "nous": "avions moulu",
      "vous": "aviez moulu",
      "ils/elles": "avaient moulu"
    },
    "poursuivre": {
      "je": "poursuivi",
      "tu": "avais poursuivi",
      "il/elle/on": "avait poursuivi",
      "nous": "avions poursuivi",
      "vous": "aviez poursuivi",
      "ils/elles": "avaient poursuivi"
    },
    "survivre": {
      "je": "survécu",
      "tu": "avais survécu",
      "il/elle/on": "avait survécu",
      "nous": "avions survécu",
      "vous": "aviez survécu",
      "ils/elles": "avaient survécu"
    },
    "revivre": {
      "je": "revécu",
      "tu": "avais revécu",
      "il/elle/on": "avait revécu",
      "nous": "avions revécu",
      "vous": "aviez revécu",
      "ils/elles": "avaient revécu"
    },
    "conclure": {
      "je": "conclu",
      "tu": "avais conclu",
      "il/elle/on": "avait conclu",
      "nous": "avions conclu",
      "vous": "aviez conclu",
      "ils/elles": "avaient conclu"
    },
    "exclure": {
      "je": "exclu",
      "tu": "avais exclu",
      "il/elle/on": "avait exclu",
      "nous": "avions exclu",
      "vous": "aviez exclu",
      "ils/elles": "avaient exclu"
    },
    "inclure": {
      "je": "inclus",
      "tu": "avais inclus",
      "il/elle/on": "avait inclus",
      "nous": "avions inclus",
      "vous": "aviez inclus",
      "ils/elles": "avaient inclus"
    },
    "élire": {
      "je": "élu",
      "tu": "avais élu",
      "il/elle/on": "avait élu",
      "nous": "avions élu",
      "vous": "aviez élu",
      "ils/elles": "avaient élu"
    },
    "relire": {
      "je": "relu",
      "tu": "avais relu",
      "il/elle/on": "avait relu",
      "nous": "avions relu",
      "vous": "aviez relu",
      "ils/elles": "avaient relu"
    },
    "interdire": {
      "je": "interdit",
      "tu": "avais interdit",
      "il/elle/on": "avait interdit",
      "nous": "avions interdit",
      "vous": "aviez interdit",
      "ils/elles": "avaient interdit"
    },
    "prédire": {
      "je": "prédit",
      "tu": "avais prédit",
      "il/elle/on": "avait prédit",
      "nous": "avions prédit",
      "vous": "aviez prédit",
      "ils/elles": "avaient prédit"
    },
    "médire": {
      "je": "médit",
      "tu": "avais médit",
      "il/elle/on": "avait médit",
      "nous": "avions médit",
      "vous": "aviez médit",
      "ils/elles": "avaient médit"
    },
    "contredire": {
      "je": "contredit",
      "tu": "avais contredit",
      "il/elle/on": "avait contredit",
      "nous": "avions contredit",
      "vous": "aviez contredit",
      "ils/elles": "avaient contredit"
    },
    "suffire": {
      "je": "suffi",
      "tu": "avais suffi",
      "il/elle/on": "avait suffi",
      "nous": "avions suffi",
      "vous": "aviez suffi",
      "ils/elles": "avaient suffi"
    },
    "circoncire": {
      "je": "circoncis",
      "tu": "avais circoncis",
      "il/elle/on": "avait circoncis",
      "nous": "avions circoncis",
      "vous": "aviez circoncis",
      "ils/elles": "avaient circoncis"
    },
    "déplaire": {
      "je": "déplu",
      "tu": "avais déplu",
      "il/elle/on": "avait déplu",
      "nous": "avions déplu",
      "vous": "aviez déplu",
      "ils/elles": "avaient déplu"
    },
    "taire": {
      "je": "tu",
      "tu": "avais tu",
      "il/elle/on": "avait tu",
      "nous": "avions tu",
      "vous": "aviez tu",
      "ils/elles": "avaient tu"
    },
    "apparaître": {
      "je": "apparu",
      "tu": "avais apparu",
      "il/elle/on": "avait apparu",
      "nous": "avions apparu",
      "vous": "aviez apparu",
      "ils/elles": "avaient apparu"
    },
    "paître": {
      "je": "pu",
      "tu": "avais pu",
      "il/elle/on": "avait pu",
      "nous": "avions pu",
      "vous": "aviez pu",
      "ils/elles": "avaient pu"
    },
    "combattre": {
      "je": "combattu",
      "tu": "avais combattu",
      "il/elle/on": "avait combattu",
      "nous": "avions combattu",
      "vous": "aviez combattu",
      "ils/elles": "avaient combattu"
    },
    "abattre": {
      "je": "abattu",
      "tu": "avais abattu",
      "il/elle/on": "avait abattu",
      "nous": "avions abattu",
      "vous": "aviez abattu",
      "ils/elles": "avaient abattu"
    },
    "débattre": {
      "je": "débattu",
      "tu": "avais débattu",
      "il/elle/on": "avait débattu",
      "nous": "avions débattu",
      "vous": "aviez débattu",
      "ils/elles": "avaient débattu"
    },
    "admettre": {
      "je": "admis",
      "tu": "avais admis",
      "il/elle/on": "avait admis",
      "nous": "avions admis",
      "vous": "aviez admis",
      "ils/elles": "avaient admis"
    },
    "commettre": {
      "je": "commis",
      "tu": "avais commis",
      "il/elle/on": "avait commis",
      "nous": "avions commis",
      "vous": "aviez commis",
      "ils/elles": "avaient commis"
    },
    "compromettre": {
      "je": "compromis",
      "tu": "avais compromis",
      "il/elle/on": "avait compromis",
      "nous": "avions compromis",
      "vous": "aviez compromis",
      "ils/elles": "avaient compromis"
    },
    "remettre": {
      "je": "remis",
      "tu": "avais remis",
      "il/elle/on": "avait remis",
      "nous": "avions remis",
      "vous": "aviez remis",
      "ils/elles": "avaient remis"
    },
    "soumettre": {
      "je": "soumis",
      "tu": "avais soumis",
      "il/elle/on": "avait soumis",
      "nous": "avions soumis",
      "vous": "aviez soumis",
      "ils/elles": "avaient soumis"
    },
    "transmettre": {
      "je": "transmis",
      "tu": "avais transmis",
      "il/elle/on": "avait transmis",
      "nous": "avions transmis",
      "vous": "aviez transmis",
      "ils/elles": "avaient transmis"
    },
    "entreprendre": {
      "je": "entrepris",
      "tu": "avais entrepris",
      "il/elle/on": "avait entrepris",
      "nous": "avions entrepris",
      "vous": "aviez entrepris",
      "ils/elles": "avaient entrepris"
    },
    "reprendre": {
      "je": "repris",
      "tu": "avais repris",
      "il/elle/on": "avait repris",
      "nous": "avions repris",
      "vous": "aviez repris",
      "ils/elles": "avaient repris"
    },
    "surprendre": {
      "je": "surpris",
      "tu": "avais surpris",
      "il/elle/on": "avait surpris",
      "nous": "avions surpris",
      "vous": "aviez surpris",
      "ils/elles": "avaient surpris"
    },
    "rompre": {
      "je": "rompu",
      "tu": "avais rompu",
      "il/elle/on": "avait rompu",
      "nous": "avions rompu",
      "vous": "aviez rompu",
      "ils/elles": "avaient rompu"
    },
    "corrompre": {
      "je": "corrompu",
      "tu": "avais corrompu",
      "il/elle/on": "avait corrompu",
      "nous": "avions corrompu",
      "vous": "aviez corrompu",
      "ils/elles": "avaient corrompu"
    },
    "interrompre": {
      "je": "interrompu",
      "tu": "avais interrompu",
      "il/elle/on": "avait interrompu",
      "nous": "avions interrompu",
      "vous": "aviez interrompu",
      "ils/elles": "avaient interrompu"
    },
    "vaincre": {
      "je": "vaincu",
      "tu": "avais vaincu",
      "il/elle/on": "avait vaincu",
      "nous": "avions vaincu",
      "vous": "aviez vaincu",
      "ils/elles": "avaient vaincu"
    },
    "convaincre": {
      "je": "convaincu",
      "tu": "avais convaincu",
      "il/elle/on": "avait convaincu",
      "nous": "avions convaincu",
      "vous": "aviez convaincu",
      "ils/elles": "avaient convaincu"
    },
    "amener": {
      "je": "amené",
      "tu": "avais amené",
      "il/elle/on": "avait amené",
      "nous": "avions amené",
      "vous": "aviez amené",
      "ils/elles": "avaient amené"
    },
    "emmener": {
      "je": "emmené",
      "tu": "avais emmené",
      "il/elle/on": "avait emmené",
      "nous": "avions emmené",
      "vous": "aviez emmené",
      "ils/elles": "avaient emmené"
    },
    "enlever": {
      "je": "enlevé",
      "tu": "avais enlevé",
      "il/elle/on": "avait enlevé",
      "nous": "avions enlevé",
      "vous": "aviez enlevé",
      "ils/elles": "avaient enlevé"
    },
    "geler": {
      "je": "gelé",
      "tu": "avais gelé",
      "il/elle/on": "avait gelé",
      "nous": "avions gelé",
      "vous": "aviez gelé",
      "ils/elles": "avaient gelé"
    },
    "harceler": {
      "je": "harcelé",
      "tu": "avais harcelé",
      "il/elle/on": "avait harcelé",
      "nous": "avions harcelé",
      "vous": "aviez harcelé",
      "ils/elles": "avaient harcelé"
    },
    "lever": {
      "je": "levé",
      "tu": "avais levé",
      "il/elle/on": "avait levé",
      "nous": "avions levé",
      "vous": "aviez levé",
      "ils/elles": "avaient levé"
    },
    "mener": {
      "je": "mené",
      "tu": "avais mené",
      "il/elle/on": "avait mené",
      "nous": "avions mené",
      "vous": "aviez mené",
      "ils/elles": "avaient mené"
    },
    "peler": {
      "je": "pelé",
      "tu": "avais pelé",
      "il/elle/on": "avait pelé",
      "nous": "avions pelé",
      "vous": "aviez pelé",
      "ils/elles": "avaient pelé"
    },
    "peser": {
      "je": "pesé",
      "tu": "avais pesé",
      "il/elle/on": "avait pesé",
      "nous": "avions pesé",
      "vous": "aviez pesé",
      "ils/elles": "avaient pesé"
    },
    "promener": {
      "je": "promené",
      "tu": "avais promené",
      "il/elle/on": "avait promené",
      "nous": "avions promené",
      "vous": "aviez promené",
      "ils/elles": "avaient promené"
    },
    "semer": {
      "je": "semé",
      "tu": "avais semé",
      "il/elle/on": "avait semé",
      "nous": "avions semé",
      "vous": "aviez semé",
      "ils/elles": "avaient semé"
    },
    "jeter": {
      "je": "jeté",
      "tu": "avais jeté",
      "il/elle/on": "avait jeté",
      "nous": "avions jeté",
      "vous": "aviez jeté",
      "ils/elles": "avaient jeté"
    },
    "épeler": {
      "je": "épelé",
      "tu": "avais épelé",
      "il/elle/on": "avait épelé",
      "nous": "avions épelé",
      "vous": "aviez épelé",
      "ils/elles": "avaient épelé"
    },
    "feuilleter": {
      "je": "feuilleté",
      "tu": "avais feuilleté",
      "il/elle/on": "avait feuilleté",
      "nous": "avions feuilleté",
      "vous": "aviez feuilleté",
      "ils/elles": "avaient feuilleté"
    },
    "projeter": {
      "je": "projeté",
      "tu": "avais projeté",
      "il/elle/on": "avait projeté",
      "nous": "avions projeté",
      "vous": "aviez projeté",
      "ils/elles": "avaient projeté"
    },
    "rejeter": {
      "je": "rejeté",
      "tu": "avais rejeté",
      "il/elle/on": "avait rejeté",
      "nous": "avions rejeté",
      "vous": "aviez rejeté",
      "ils/elles": "avaient rejeté"
    },
    "renouveler": {
      "je": "renouvelé",
      "tu": "avais renouvelé",
      "il/elle/on": "avait renouvelé",
      "nous": "avions renouvelé",
      "vous": "aviez renouvelé",
      "ils/elles": "avaient renouvelé"
    },
    "céder": {
      "je": "cédé",
      "tu": "avais cédé",
      "il/elle/on": "avait cédé",
      "nous": "avions cédé",
      "vous": "aviez cédé",
      "ils/elles": "avaient cédé"
    },
    "célébrer": {
      "je": "célébré",
      "tu": "avais célébré",
      "il/elle/on": "avait célébré",
      "nous": "avions célébré",
      "vous": "aviez célébré",
      "ils/elles": "avaient célébré"
    },
    "compléter": {
      "je": "complété",
      "tu": "avais complété",
      "il/elle/on": "avait complété",
      "nous": "avions complété",
      "vous": "aviez complété",
      "ils/elles": "avaient complété"
    },
    "considérer": {
      "je": "considéré",
      "tu": "avais considéré",
      "il/elle/on": "avait considéré",
      "nous": "avions considéré",
      "vous": "aviez considéré",
      "ils/elles": "avaient considéré"
    },
    "différer": {
      "je": "différé",
      "tu": "avais différé",
      "il/elle/on": "avait différé",
      "nous": "avions différé",
      "vous": "aviez différé",
      "ils/elles": "avaient différé"
    },
    "exagérer": {
      "je": "exagéré",
      "tu": "avais exagéré",
      "il/elle/on": "avait exagéré",
      "nous": "avions exagéré",
      "vous": "aviez exagéré",
      "ils/elles": "avaient exagéré"
    },
    "gérer": {
      "je": "géré",
      "tu": "avais géré",
      "il/elle/on": "avait géré",
      "nous": "avions géré",
      "vous": "aviez géré",
      "ils/elles": "avaient géré"
    },
    "inquiéter": {
      "je": "inquiété",
      "tu": "avais inquiété",
      "il/elle/on": "avait inquiété",
      "nous": "avions inquiété",
      "vous": "aviez inquiété",
      "ils/elles": "avaient inquiété"
    },
    "modérer": {
      "je": "modéré",
      "tu": "avais modéré",
      "il/elle/on": "avait modéré",
      "nous": "avions modéré",
      "vous": "aviez modéré",
      "ils/elles": "avaient modéré"
    },
    "pénétrer": {
      "je": "pénétré",
      "tu": "avais pénétré",
      "il/elle/on": "avait pénétré",
      "nous": "avions pénétré",
      "vous": "aviez pénétré",
      "ils/elles": "avaient pénétré"
    },
    "posséder": {
      "je": "possédé",
      "tu": "avais possédé",
      "il/elle/on": "avait possédé",
      "nous": "avions possédé",
      "vous": "aviez possédé",
      "ils/elles": "avaient possédé"
    },
    "préférer": {
      "je": "préféré",
      "tu": "avais préféré",
      "il/elle/on": "avait préféré",
      "nous": "avions préféré",
      "vous": "aviez préféré",
      "ils/elles": "avaient préféré"
    },
    "refléter": {
      "je": "reflété",
      "tu": "avais reflété",
      "il/elle/on": "avait reflété",
      "nous": "avions reflété",
      "vous": "aviez reflété",
      "ils/elles": "avaient reflété"
    },
    "répéter": {
      "je": "répété",
      "tu": "avais répété",
      "il/elle/on": "avait répété",
      "nous": "avions répété",
      "vous": "aviez répété",
      "ils/elles": "avaient répété"
    },
    "révéler": {
      "je": "révélé",
      "tu": "avais révélé",
      "il/elle/on": "avait révélé",
      "nous": "avions révélé",
      "vous": "aviez révélé",
      "ils/elles": "avaient révélé"
    },
    "suggérer": {
      "je": "suggéré",
      "tu": "avais suggéré",
      "il/elle/on": "avait suggéré",
      "nous": "avions suggéré",
      "vous": "aviez suggéré",
      "ils/elles": "avaient suggéré"
    },
    "zébrer": {
      "je": "zébré",
      "tu": "avais zébré",
      "il/elle/on": "avait zébré",
      "nous": "avions zébré",
      "vous": "aviez zébré",
      "ils/elles": "avaient zébré"
    },
    "nettoyer": {
      "je": "nettoyé",
      "tu": "avais nettoyé",
      "il/elle/on": "avait nettoyé",
      "nous": "avions nettoyé",
      "vous": "aviez nettoyé",
      "ils/elles": "avaient nettoyé"
    },
    "appuyer": {
      "je": "appuyé",
      "tu": "avais appuyé",
      "il/elle/on": "avait appuyé",
      "nous": "avions appuyé",
      "vous": "aviez appuyé",
      "ils/elles": "avaient appuyé"
    },
    "ennuyer": {
      "je": "ennuyé",
      "tu": "avais ennuyé",
      "il/elle/on": "avait ennuyé",
      "nous": "avions ennuyé",
      "vous": "aviez ennuyé",
      "ils/elles": "avaient ennuyé"
    },
    "essuyer": {
      "je": "essuyé",
      "tu": "avais essuyé",
      "il/elle/on": "avait essuyé",
      "nous": "avions essuyé",
      "vous": "aviez essuyé",
      "ils/elles": "avaient essuyé"
    },
    "balayer": {
      "je": "balayé",
      "tu": "avais balayé",
      "il/elle/on": "avait balayé",
      "nous": "avions balayé",
      "vous": "aviez balayé",
      "ils/elles": "avaient balayé"
    },
    "effrayer": {
      "je": "effrayé",
      "tu": "avais effrayé",
      "il/elle/on": "avait effrayé",
      "nous": "avions effrayé",
      "vous": "aviez effrayé",
      "ils/elles": "avaient effrayé"
    },
    "aboyer": {
      "je": "aboyé",
      "tu": "avais aboyé",
      "il/elle/on": "avait aboyé",
      "nous": "avions aboyé",
      "vous": "aviez aboyé",
      "ils/elles": "avaient aboyé"
    },
    "noyer": {
      "je": "noyé",
      "tu": "avais noyé",
      "il/elle/on": "avait noyé",
      "nous": "avions noyé",
      "vous": "aviez noyé",
      "ils/elles": "avaient noyé"
    },
    "tutoyer": {
      "je": "tutoyé",
      "tu": "avais tutoyé",
      "il/elle/on": "avait tutoyé",
      "nous": "avions tutoyé",
      "vous": "aviez tutoyé",
      "ils/elles": "avaient tutoyé"
    },
    "vouvoyer": {
      "je": "vouvoyé",
      "tu": "avais vouvoyé",
      "il/elle/on": "avait vouvoyé",
      "nous": "avions vouvoyé",
      "vous": "aviez vouvoyé",
      "ils/elles": "avaient vouvoyé"
    },
    "annoncer": {
      "je": "annoncé",
      "tu": "avais annoncé",
      "il/elle/on": "avait annoncé",
      "nous": "avions annoncé",
      "vous": "aviez annoncé",
      "ils/elles": "avaient annoncé"
    },
    "avancer": {
      "je": "avancé",
      "tu": "avais avancé",
      "il/elle/on": "avait avancé",
      "nous": "avions avancé",
      "vous": "aviez avancé",
      "ils/elles": "avaient avancé"
    },
    "dénoncer": {
      "je": "dénoncé",
      "tu": "avais dénoncé",
      "il/elle/on": "avait dénoncé",
      "nous": "avions dénoncé",
      "vous": "aviez dénoncé",
      "ils/elles": "avaient dénoncé"
    },
    "divorcer": {
      "je": "divorcé",
      "tu": "avais divorcé",
      "il/elle/on": "avait divorcé",
      "nous": "avions divorcé",
      "vous": "aviez divorcé",
      "ils/elles": "avaient divorcé"
    },
    "effacer": {
      "je": "effacé",
      "tu": "avais effacé",
      "il/elle/on": "avait effacé",
      "nous": "avions effacé",
      "vous": "aviez effacé",
      "ils/elles": "avaient effacé"
    },
    "lancer": {
      "je": "lancé",
      "tu": "avais lancé",
      "il/elle/on": "avait lancé",
      "nous": "avions lancé",
      "vous": "aviez lancé",
      "ils/elles": "avaient lancé"
    },
    "menacer": {
      "je": "menacé",
      "tu": "avais menacé",
      "il/elle/on": "avait menacé",
      "nous": "avions menacé",
      "vous": "aviez menacé",
      "ils/elles": "avaient menacé"
    },
    "placer": {
      "je": "placé",
      "tu": "avais placé",
      "il/elle/on": "avait placé",
      "nous": "avions placé",
      "vous": "aviez placé",
      "ils/elles": "avaient placé"
    },
    "prononcer": {
      "je": "prononcé",
      "tu": "avais prononcé",
      "il/elle/on": "avait prononcé",
      "nous": "avions prononcé",
      "vous": "aviez prononcé",
      "ils/elles": "avaient prononcé"
    },
    "remplacer": {
      "je": "remplacé",
      "tu": "avais remplacé",
      "il/elle/on": "avait remplacé",
      "nous": "avions remplacé",
      "vous": "aviez remplacé",
      "ils/elles": "avaient remplacé"
    },
    "renoncer": {
      "je": "renoncé",
      "tu": "avais renoncé",
      "il/elle/on": "avait renoncé",
      "nous": "avions renoncé",
      "vous": "aviez renoncé",
      "ils/elles": "avaient renoncé"
    },
    "arranger": {
      "je": "arrangé",
      "tu": "avais arrangé",
      "il/elle/on": "avait arrangé",
      "nous": "avions arrangé",
      "vous": "aviez arrangé",
      "ils/elles": "avaient arrangé"
    },
    "bouger": {
      "je": "bougé",
      "tu": "avais bougé",
      "il/elle/on": "avait bougé",
      "nous": "avions bougé",
      "vous": "aviez bougé",
      "ils/elles": "avaient bougé"
    },
    "corriger": {
      "je": "corrigé",
      "tu": "avais corrigé",
      "il/elle/on": "avait corrigé",
      "nous": "avions corrigé",
      "vous": "aviez corrigé",
      "ils/elles": "avaient corrigé"
    },
    "décourager": {
      "je": "découragé",
      "tu": "avais découragé",
      "il/elle/on": "avait découragé",
      "nous": "avions découragé",
      "vous": "aviez découragé",
      "ils/elles": "avaient découragé"
    },
    "déménager": {
      "je": "déménagé",
      "tu": "avais déménagé",
      "il/elle/on": "avait déménagé",
      "nous": "avions déménagé",
      "vous": "aviez déménagé",
      "ils/elles": "avaient déménagé"
    },
    "diriger": {
      "je": "dirigé",
      "tu": "avais dirigé",
      "il/elle/on": "avait dirigé",
      "nous": "avions dirigé",
      "vous": "aviez dirigé",
      "ils/elles": "avaient dirigé"
    },
    "encourager": {
      "je": "encouragé",
      "tu": "avais encouragé",
      "il/elle/on": "avait encouragé",
      "nous": "avions encouragé",
      "vous": "aviez encouragé",
      "ils/elles": "avaient encouragé"
    },
    "engager": {
      "je": "engagé",
      "tu": "avais engagé",
      "il/elle/on": "avait engagé",
      "nous": "avions engagé",
      "vous": "aviez engagé",
      "ils/elles": "avaient engagé"
    },
    "exiger": {
      "je": "exigé",
      "tu": "avais exigé",
      "il/elle/on": "avait exigé",
      "nous": "avions exigé",
      "vous": "aviez exigé",
      "ils/elles": "avaient exigé"
    },
    "juger": {
      "je": "jugé",
      "tu": "avais jugé",
      "il/elle/on": "avait jugé",
      "nous": "avions jugé",
      "vous": "aviez jugé",
      "ils/elles": "avaient jugé"
    },
    "loger": {
      "je": "logé",
      "tu": "avais logé",
      "il/elle/on": "avait logé",
      "nous": "avions logé",
      "vous": "aviez logé",
      "ils/elles": "avaient logé"
    },
    "mélanger": {
      "je": "mélangé",
      "tu": "avais mélangé",
      "il/elle/on": "avait mélangé",
      "nous": "avions mélangé",
      "vous": "aviez mélangé",
      "ils/elles": "avaient mélangé"
    },
    "nager": {
      "je": "nagé",
      "tu": "avais nagé",
      "il/elle/on": "avait nagé",
      "nous": "avions nagé",
      "vous": "aviez nagé",
      "ils/elles": "avaient nagé"
    },
    "obliger": {
      "je": "obligé",
      "tu": "avais obligé",
      "il/elle/on": "avait obligé",
      "nous": "avions obligé",
      "vous": "aviez obligé",
      "ils/elles": "avaient obligé"
    },
    "plonger": {
      "je": "plongé",
      "tu": "avais plongé",
      "il/elle/on": "avait plongé",
      "nous": "avions plongé",
      "vous": "aviez plongé",
      "ils/elles": "avaient plongé"
    },
    "ranger": {
      "je": "rangé",
      "tu": "avais rangé",
      "il/elle/on": "avait rangé",
      "nous": "avions rangé",
      "vous": "aviez rangé",
      "ils/elles": "avaient rangé"
    },
    "rédiger": {
      "je": "rédigé",
      "tu": "avais rédigé",
      "il/elle/on": "avait rédigé",
      "nous": "avions rédigé",
      "vous": "aviez rédigé",
      "ils/elles": "avaient rédigé"
    },
    "ajouter": {
      "je": "ajouté",
      "tu": "avais ajouté",
      "il/elle/on": "avait ajouté",
      "nous": "avions ajouté",
      "vous": "aviez ajouté",
      "ils/elles": "avaient ajouté"
    },
    "durer": {
      "je": "duré",
      "tu": "avais duré",
      "il/elle/on": "avait duré",
      "nous": "avions duré",
      "vous": "aviez duré",
      "ils/elles": "avaient duré"
    },
    "écouter": {
      "je": "écouté",
      "tu": "avais écouté",
      "il/elle/on": "avait écouté",
      "nous": "avions écouté",
      "vous": "aviez écouté",
      "ils/elles": "avaient écouté"
    },
    "emprunter": {
      "je": "emprunté",
      "tu": "avais emprunté",
      "il/elle/on": "avait emprunté",
      "nous": "avions emprunté",
      "vous": "aviez emprunté",
      "ils/elles": "avaient emprunté"
    },
    "fermer": {
      "je": "fermé",
      "tu": "avais fermé",
      "il/elle/on": "avait fermé",
      "nous": "avions fermé",
      "vous": "aviez fermé",
      "ils/elles": "avaient fermé"
    },
    "garder": {
      "je": "gardé",
      "tu": "avais gardé",
      "il/elle/on": "avait gardé",
      "nous": "avions gardé",
      "vous": "aviez gardé",
      "ils/elles": "avaient gardé"
    },
    "laver": {
      "je": "lavé",
      "tu": "avais lavé",
      "il/elle/on": "avait lavé",
      "nous": "avions lavé",
      "vous": "aviez lavé",
      "ils/elles": "avaient lavé"
    },
    "pardonner": {
      "je": "pardonné",
      "tu": "avais pardonné",
      "il/elle/on": "avait pardonné",
      "nous": "avions pardonné",
      "vous": "aviez pardonné",
      "ils/elles": "avaient pardonné"
    },
    "présenter": {
      "je": "présenté",
      "tu": "avais présenté",
      "il/elle/on": "avait présenté",
      "nous": "avions présenté",
      "vous": "aviez présenté",
      "ils/elles": "avaient présenté"
    },
    "prêter": {
      "je": "prêté",
      "tu": "avais prêté",
      "il/elle/on": "avait prêté",
      "nous": "avions prêté",
      "vous": "aviez prêté",
      "ils/elles": "avaient prêté"
    },
    "quitter": {
      "je": "quitté",
      "tu": "avais quitté",
      "il/elle/on": "avait quitté",
      "nous": "avions quitté",
      "vous": "aviez quitté",
      "ils/elles": "avaient quitté"
    },
    "refuser": {
      "je": "refusé",
      "tu": "avais refusé",
      "il/elle/on": "avait refusé",
      "nous": "avions refusé",
      "vous": "aviez refusé",
      "ils/elles": "avaient refusé"
    },
    "rencontrer": {
      "je": "rencontré",
      "tu": "avais rencontré",
      "il/elle/on": "avait rencontré",
      "nous": "avions rencontré",
      "vous": "aviez rencontré",
      "ils/elles": "avaient rencontré"
    },
    "reposer": {
      "je": "reposé",
      "tu": "avais reposé",
      "il/elle/on": "avait reposé",
      "nous": "avions reposé",
      "vous": "aviez reposé",
      "ils/elles": "avaient reposé"
    },
    "rêver": {
      "je": "rêvé",
      "tu": "avais rêvé",
      "il/elle/on": "avait rêvé",
      "nous": "avions rêvé",
      "vous": "aviez rêvé",
      "ils/elles": "avaient rêvé"
    },
    "saluer": {
      "je": "salué",
      "tu": "avais salué",
      "il/elle/on": "avait salué",
      "nous": "avions salué",
      "vous": "aviez salué",
      "ils/elles": "avaient salué"
    },
    "sauter": {
      "je": "sauté",
      "tu": "avais sauté",
      "il/elle/on": "avait sauté",
      "nous": "avions sauté",
      "vous": "aviez sauté",
      "ils/elles": "avaient sauté"
    },
    "sembler": {
      "je": "semblé",
      "tu": "avais semblé",
      "il/elle/on": "avait semblé",
      "nous": "avions semblé",
      "vous": "aviez semblé",
      "ils/elles": "avaient semblé"
    },
    "signer": {
      "je": "signé",
      "tu": "avais signé",
      "il/elle/on": "avait signé",
      "nous": "avions signé",
      "vous": "aviez signé",
      "ils/elles": "avaient signé"
    },
    "téléphoner": {
      "je": "téléphoné",
      "tu": "avais téléphoné",
      "il/elle/on": "avait téléphoné",
      "nous": "avions téléphoné",
      "vous": "aviez téléphoné",
      "ils/elles": "avaient téléphoné"
    },
    "terminer": {
      "je": "terminé",
      "tu": "avais terminé",
      "il/elle/on": "avait terminé",
      "nous": "avions terminé",
      "vous": "aviez terminé",
      "ils/elles": "avaient terminé"
    },
    "traverser": {
      "je": "traversé",
      "tu": "avais traversé",
      "il/elle/on": "avait traversé",
      "nous": "avions traversé",
      "vous": "aviez traversé",
      "ils/elles": "avaient traversé"
    },
    "utiliser": {
      "je": "utilisé",
      "tu": "avais utilisé",
      "il/elle/on": "avait utilisé",
      "nous": "avions utilisé",
      "vous": "aviez utilisé",
      "ils/elles": "avaient utilisé"
    },
    "visiter": {
      "je": "visité",
      "tu": "avais visité",
      "il/elle/on": "avait visité",
      "nous": "avions visité",
      "vous": "aviez visité",
      "ils/elles": "avaient visité"
    },
    "voler": {
      "je": "volé",
      "tu": "avais volé",
      "il/elle/on": "avait volé",
      "nous": "avions volé",
      "vous": "aviez volé",
      "ils/elles": "avaient volé"
    },
    "accepter": {
      "je": "accepté",
      "tu": "avais accepté",
      "il/elle/on": "avait accepté",
      "nous": "avions accepté",
      "vous": "aviez accepté",
      "ils/elles": "avaient accepté"
    },
    "adorer": {
      "je": "adoré",
      "tu": "avais adoré",
      "il/elle/on": "avait adoré",
      "nous": "avions adoré",
      "vous": "aviez adoré",
      "ils/elles": "avaient adoré"
    },
    "apporter": {
      "je": "apporté",
      "tu": "avais apporté",
      "il/elle/on": "avait apporté",
      "nous": "avions apporté",
      "vous": "aviez apporté",
      "ils/elles": "avaient apporté"
    },
    "arrêter": {
      "je": "arrêté",
      "tu": "avais arrêté",
      "il/elle/on": "avait arrêté",
      "nous": "avions arrêté",
      "vous": "aviez arrêté",
      "ils/elles": "avaient arrêté"
    },
    "commander": {
      "je": "commandé",
      "tu": "avais commandé",
      "il/elle/on": "avait commandé",
      "nous": "avions commandé",
      "vous": "aviez commandé",
      "ils/elles": "avaient commandé"
    },
    "compter": {
      "je": "compté",
      "tu": "avais compté",
      "il/elle/on": "avait compté",
      "nous": "avions compté",
      "vous": "aviez compté",
      "ils/elles": "avaient compté"
    },
    "conseiller": {
      "je": "conseillé",
      "tu": "avais conseillé",
      "il/elle/on": "avait conseillé",
      "nous": "avions conseillé",
      "vous": "aviez conseillé",
      "ils/elles": "avaient conseillé"
    },
    "continuer": {
      "je": "continué",
      "tu": "avais continué",
      "il/elle/on": "avait continué",
      "nous": "avions continué",
      "vous": "aviez continué",
      "ils/elles": "avaient continué"
    },
    "coûter": {
      "je": "coûté",
      "tu": "avais coûté",
      "il/elle/on": "avait coûté",
      "nous": "avions coûté",
      "vous": "aviez coûté",
      "ils/elles": "avaient coûté"
    },
    "crier": {
      "je": "crié",
      "tu": "avais crié",
      "il/elle/on": "avait crié",
      "nous": "avions crié",
      "vous": "aviez crié",
      "ils/elles": "avaient crié"
    },
    "déjeuner": {
      "je": "déjeuné",
      "tu": "avais déjeuné",
      "il/elle/on": "avait déjeuné",
      "nous": "avions déjeuné",
      "vous": "aviez déjeuné",
      "ils/elles": "avaient déjeuné"
    },
    "désirer": {
      "je": "désiré",
      "tu": "avais désiré",
      "il/elle/on": "avait désiré",
      "nous": "avions désiré",
      "vous": "aviez désiré",
      "ils/elles": "avaient désiré"
    },
    "détester": {
      "je": "détesté",
      "tu": "avais détesté",
      "il/elle/on": "avait détesté",
      "nous": "avions détesté",
      "vous": "aviez détesté",
      "ils/elles": "avaient détesté"
    },
    "dessiner": {
      "je": "dessiné",
      "tu": "avais dessiné",
      "il/elle/on": "avait dessiné",
      "nous": "avions dessiné",
      "vous": "aviez dessiné",
      "ils/elles": "avaient dessiné"
    },
    "dîner": {
      "je": "dîné",
      "tu": "avais dîné",
      "il/elle/on": "avait dîné",
      "nous": "avions dîné",
      "vous": "aviez dîné",
      "ils/elles": "avaient dîné"
    },
    "discuter": {
      "je": "discuté",
      "tu": "avais discuté",
      "il/elle/on": "avait discuté",
      "nous": "avions discuté",
      "vous": "aviez discuté",
      "ils/elles": "avaient discuté"
    },
    "éviter": {
      "je": "évité",
      "tu": "avais évité",
      "il/elle/on": "avait évité",
      "nous": "avions évité",
      "vous": "aviez évité",
      "ils/elles": "avaient évité"
    },
    "excuser": {
      "je": "excusé",
      "tu": "avais excusé",
      "il/elle/on": "avait excusé",
      "nous": "avions excusé",
      "vous": "aviez excusé",
      "ils/elles": "avaient excusé"
    },
    "fumer": {
      "je": "fumé",
      "tu": "avais fumé",
      "il/elle/on": "avait fumé",
      "nous": "avions fumé",
      "vous": "aviez fumé",
      "ils/elles": "avaient fumé"
    },
    "habiter": {
      "je": "habité",
      "tu": "avais habité",
      "il/elle/on": "avait habité",
      "nous": "avions habité",
      "vous": "aviez habité",
      "ils/elles": "avaient habité"
    },
    "imaginer": {
      "je": "imaginé",
      "tu": "avais imaginé",
      "il/elle/on": "avait imaginé",
      "nous": "avions imaginé",
      "vous": "aviez imaginé",
      "ils/elles": "avaient imaginé"
    },
    "importer": {
      "je": "importé",
      "tu": "avais importé",
      "il/elle/on": "avait importé",
      "nous": "avions importé",
      "vous": "aviez importé",
      "ils/elles": "avaient importé"
    },
    "inviter": {
      "je": "invité",
      "tu": "avais invité",
      "il/elle/on": "avait invité",
      "nous": "avions invité",
      "vous": "aviez invité",
      "ils/elles": "avaient invité"
    },
    "noter": {
      "je": "noté",
      "tu": "avais noté",
      "il/elle/on": "avait noté",
      "nous": "avions noté",
      "vous": "aviez noté",
      "ils/elles": "avaient noté"
    },
    "organiser": {
      "je": "organisé",
      "tu": "avais organisé",
      "il/elle/on": "avait organisé",
      "nous": "avions organisé",
      "vous": "aviez organisé",
      "ils/elles": "avaient organisé"
    },
    "parier": {
      "je": "parié",
      "tu": "avais parié",
      "il/elle/on": "avait parié",
      "nous": "avions parié",
      "vous": "aviez parié",
      "ils/elles": "avaient parié"
    },
    "pleurer": {
      "je": "pleuré",
      "tu": "avais pleuré",
      "il/elle/on": "avait pleuré",
      "nous": "avions pleuré",
      "vous": "aviez pleuré",
      "ils/elles": "avaient pleuré"
    },
    "poser": {
      "je": "posé",
      "tu": "avais posé",
      "il/elle/on": "avait posé",
      "nous": "avions posé",
      "vous": "aviez posé",
      "ils/elles": "avaient posé"
    },
    "pousser": {
      "je": "poussé",
      "tu": "avais poussé",
      "il/elle/on": "avait poussé",
      "nous": "avions poussé",
      "vous": "aviez poussé",
      "ils/elles": "avaient poussé"
    },
    "prier": {
      "je": "prié",
      "tu": "avais prié",
      "il/elle/on": "avait prié",
      "nous": "avions prié",
      "vous": "aviez prié",
      "ils/elles": "avaient prié"
    },
    "rappeler": {
      "je": "rappelé",
      "tu": "avais rappelé",
      "il/elle/on": "avait rappelé",
      "nous": "avions rappelé",
      "vous": "aviez rappelé",
      "ils/elles": "avaient rappelé"
    },
    "remercier": {
      "je": "remercié",
      "tu": "avais remercié",
      "il/elle/on": "avait remercié",
      "nous": "avions remercié",
      "vous": "aviez remercié",
      "ils/elles": "avaient remercié"
    },
    "respecter": {
      "je": "respecté",
      "tu": "avais respecté",
      "il/elle/on": "avait respecté",
      "nous": "avions respecté",
      "vous": "aviez respecté",
      "ils/elles": "avaient respecté"
    },
    "retourner": {
      "je": "retourné",
      "tu": "étais retourné",
      "il/elle/on": "était retourné",
      "nous": "étions retournés",
      "vous": "étiez retournés",
      "ils/elles": "étaient retournés"
    },
    "retrouver": {
      "je": "retrouvé",
      "tu": "avais retrouvé",
      "il/elle/on": "avait retrouvé",
      "nous": "avions retrouvé",
      "vous": "aviez retrouvé",
      "ils/elles": "avaient retrouvé"
    },
    "réveiller": {
      "je": "réveillé",
      "tu": "avais réveillé",
      "il/elle/on": "avait réveillé",
      "nous": "avions réveillé",
      "vous": "aviez réveillé",
      "ils/elles": "avaient réveillé"
    },
    "toucher": {
      "je": "touché",
      "tu": "avais touché",
      "il/elle/on": "avait touché",
      "nous": "avions touché",
      "vous": "aviez touché",
      "ils/elles": "avaient touché"
    },
    "tuer": {
      "je": "tué",
      "tu": "avais tué",
      "il/elle/on": "avait tué",
      "nous": "avions tué",
      "vous": "aviez tué",
      "ils/elles": "avaient tué"
    },
    "vérifier": {
      "je": "vérifié",
      "tu": "avais vérifié",
      "il/elle/on": "avait vérifié",
      "nous": "avions vérifié",
      "vous": "aviez vérifié",
      "ils/elles": "avaient vérifié"
    }
  },
  "futurSimple": {
    "être": {
      "je": "serai",
      "tu": "seras",
      "il/elle/on": "sera",
      "nous": "serons",
      "vous": "serez",
      "ils/elles": "seront"
    },
    "avoir": {
      "je": "j'aurai",
      "tu": "auras",
      "il/elle/on": "aura",
      "nous": "aurons",
      "vous": "aurez",
      "ils/elles": "auront"
    },
    "aller": {
      "je": "j'irai",
      "tu": "iras",
      "il/elle/on": "ira",
      "nous": "irons",
      "vous": "irez",
      "ils/elles": "iront"
    },
    "faire": {
      "je": "ferai",
      "tu": "feras",
      "il/elle/on": "fera",
      "nous": "ferons",
      "vous": "ferez",
      "ils/elles": "feront"
    },
    "venir": {
      "je": "viendrai",
      "tu": "viendras",
      "il/elle/on": "viendra",
      "nous": "viendrons",
      "vous": "viendrez",
      "ils/elles": "viendront"
    },
    "pouvoir": {
      "je": "pourrai",
      "tu": "pourras",
      "il/elle/on": "pourra",
      "nous": "pourrons",
      "vous": "pourrez",
      "ils/elles": "pourront"
    },
    "vouloir": {
      "je": "voudrai",
      "tu": "voudras",
      "il/elle/on": "voudra",
      "nous": "voudrons",
      "vous": "voudrez",
      "ils/elles": "voudront"
    },
    "savoir": {
      "je": "saurai",
      "tu": "sauras",
      "il/elle/on": "saura",
      "nous": "saurons",
      "vous": "saurez",
      "ils/elles": "sauront"
    },
    "devoir": {
      "je": "devrai",
      "tu": "devras",
      "il/elle/on": "devra",
      "nous": "devrons",
      "vous": "devrez",
      "ils/elles": "devront"
    },
    "dire": {
      "je": "dirai",
      "tu": "diras",
      "il/elle/on": "dira",
      "nous": "dirons",
      "vous": "direz",
      "ils/elles": "diront"
    },
    "voir": {
      "je": "verrai",
      "tu": "verras",
      "il/elle/on": "verra",
      "nous": "verrons",
      "vous": "verrez",
      "ils/elles": "verront"
    },
    "prendre": {
      "je": "prendrai",
      "tu": "prendras",
      "il/elle/on": "prendra",
      "nous": "prendrons",
      "vous": "prendrez",
      "ils/elles": "prendront"
    },
    "mettre": {
      "je": "mettrai",
      "tu": "mettras",
      "il/elle/on": "mettra",
      "nous": "mettrons",
      "vous": "mettrez",
      "ils/elles": "mettront"
    },
    "croire": {
      "je": "croirai",
      "tu": "croiras",
      "il/elle/on": "croira",
      "nous": "croirons",
      "vous": "croirez",
      "ils/elles": "croiront"
    },
    "parler": {
      "je": "parlerai",
      "tu": "parleras",
      "il/elle/on": "parlera",
      "nous": "parlerons",
      "vous": "parlerez",
      "ils/elles": "parleront"
    },
    "passer": {
      "je": "passerai",
      "tu": "passeras",
      "il/elle/on": "passera",
      "nous": "passerons",
      "vous": "passerez",
      "ils/elles": "passeront"
    },
    "trouver": {
      "je": "trouverai",
      "tu": "trouveras",
      "il/elle/on": "trouvera",
      "nous": "trouverons",
      "vous": "trouverez",
      "ils/elles": "trouveront"
    },
    "donner": {
      "je": "donnerai",
      "tu": "donneras",
      "il/elle/on": "donnera",
      "nous": "donnerons",
      "vous": "donnerez",
      "ils/elles": "donneront"
    },
    "comprendre": {
      "je": "comprendrai",
      "tu": "comprendras",
      "il/elle/on": "comprendra",
      "nous": "comprendrons",
      "vous": "comprendrez",
      "ils/elles": "comprendront"
    },
    "partir": {
      "je": "partirai",
      "tu": "partiras",
      "il/elle/on": "partira",
      "nous": "partirons",
      "vous": "partirez",
      "ils/elles": "partiront"
    },
    "demander": {
      "je": "demanderai",
      "tu": "demanderas",
      "il/elle/on": "demandera",
      "nous": "demanderons",
      "vous": "demanderez",
      "ils/elles": "demanderont"
    },
    "tenir": {
      "je": "tiendrai",
      "tu": "tiendras",
      "il/elle/on": "tiendra",
      "nous": "tiendrons",
      "vous": "tiendrez",
      "ils/elles": "tiendront"
    },
    "aimer": {
      "je": "j'aimerai",
      "tu": "aimeras",
      "il/elle/on": "aimera",
      "nous": "aimerons",
      "vous": "aimerez",
      "ils/elles": "aimeront"
    },
    "penser": {
      "je": "penserai",
      "tu": "penseras",
      "il/elle/on": "pensera",
      "nous": "penserons",
      "vous": "penserez",
      "ils/elles": "penseront"
    },
    "rester": {
      "je": "resterai",
      "tu": "resteras",
      "il/elle/on": "restera",
      "nous": "resterons",
      "vous": "resterez",
      "ils/elles": "resteront"
    },
    "manger": {
      "je": "mangerai",
      "tu": "mangeras",
      "il/elle/on": "mangera",
      "nous": "mangerons",
      "vous": "mangerez",
      "ils/elles": "mangeront"
    },
    "laisser": {
      "je": "laisserai",
      "tu": "laisseras",
      "il/elle/on": "laissera",
      "nous": "laisserons",
      "vous": "laisserez",
      "ils/elles": "laisseront"
    },
    "regarder": {
      "je": "regarderai",
      "tu": "regarderas",
      "il/elle/on": "regardera",
      "nous": "regarderons",
      "vous": "regarderez",
      "ils/elles": "regarderont"
    },
    "répondre": {
      "je": "répondrai",
      "tu": "répondras",
      "il/elle/on": "répondra",
      "nous": "répondrons",
      "vous": "répondrez",
      "ils/elles": "répondront"
    },
    "vivre": {
      "je": "vivrai",
      "tu": "vivras",
      "il/elle/on": "vivra",
      "nous": "vivrons",
      "vous": "vivrez",
      "ils/elles": "vivront"
    },
    "chercher": {
      "je": "chercherai",
      "tu": "chercheras",
      "il/elle/on": "cherchera",
      "nous": "chercherons",
      "vous": "chercherez",
      "ils/elles": "chercheront"
    },
    "sentir": {
      "je": "sentirai",
      "tu": "sentiras",
      "il/elle/on": "sentira",
      "nous": "sentirons",
      "vous": "sentirez",
      "ils/elles": "sentiront"
    },
    "entendre": {
      "je": "j'entendrai",
      "tu": "entendras",
      "il/elle/on": "entendra",
      "nous": "entendrons",
      "vous": "entendrez",
      "ils/elles": "entendront"
    },
    "attendre": {
      "je": "j'attendrai",
      "tu": "attendras",
      "il/elle/on": "attendra",
      "nous": "attendrons",
      "vous": "attendrez",
      "ils/elles": "attendront"
    },
    "sortir": {
      "je": "sortirai",
      "tu": "sortiras",
      "il/elle/on": "sortira",
      "nous": "sortirons",
      "vous": "sortirez",
      "ils/elles": "sortiront"
    },
    "connaître": {
      "je": "connaîtrai",
      "tu": "connaîtras",
      "il/elle/on": "connaîtra",
      "nous": "connaîtrons",
      "vous": "connaîtrez",
      "ils/elles": "connaîtront"
    },
    "arriver": {
      "je": "j'arriverai",
      "tu": "arriveras",
      "il/elle/on": "arrivera",
      "nous": "arriverons",
      "vous": "arriverez",
      "ils/elles": "arriveront"
    },
    "ouvrir": {
      "je": "j'ouvrirai",
      "tu": "ouvriras",
      "il/elle/on": "ouvrira",
      "nous": "ouvrirons",
      "vous": "ouvrirez",
      "ils/elles": "ouvriront"
    },
    "perdre": {
      "je": "perdrai",
      "tu": "perdras",
      "il/elle/on": "perdra",
      "nous": "perdrons",
      "vous": "perdrez",
      "ils/elles": "perdront"
    },
    "écrire": {
      "je": "j'écrirai",
      "tu": "écriras",
      "il/elle/on": "écrira",
      "nous": "écrirons",
      "vous": "écrirez",
      "ils/elles": "écriront"
    },
    "devenir": {
      "je": "deviendrai",
      "tu": "deviendras",
      "il/elle/on": "deviendra",
      "nous": "deviendrons",
      "vous": "deviendrez",
      "ils/elles": "deviendront"
    },
    "suivre": {
      "je": "suivrai",
      "tu": "suivras",
      "il/elle/on": "suivra",
      "nous": "suivrons",
      "vous": "suivrez",
      "ils/elles": "suivront"
    },
    "montrer": {
      "je": "montrerai",
      "tu": "montreras",
      "il/elle/on": "montrera",
      "nous": "montrerons",
      "vous": "montrerez",
      "ils/elles": "montreront"
    },
    "mourir": {
      "je": "mourrai",
      "tu": "mourras",
      "il/elle/on": "mourra",
      "nous": "mourrons",
      "vous": "mourrez",
      "ils/elles": "mourront"
    },
    "appeler": {
      "je": "j'appellerai",
      "tu": "appelleras",
      "il/elle/on": "appellera",
      "nous": "appellerons",
      "vous": "appellerez",
      "ils/elles": "appelleront"
    },
    "commencer": {
      "je": "commencerai",
      "tu": "commenceras",
      "il/elle/on": "commencera",
      "nous": "commencerons",
      "vous": "commencerez",
      "ils/elles": "commenceront"
    },
    "finir": {
      "je": "finirai",
      "tu": "finiras",
      "il/elle/on": "finira",
      "nous": "finirons",
      "vous": "finirez",
      "ils/elles": "finiront"
    },
    "servir": {
      "je": "servirai",
      "tu": "serviras",
      "il/elle/on": "servira",
      "nous": "servirons",
      "vous": "servirez",
      "ils/elles": "serviront"
    },
    "lire": {
      "je": "lirai",
      "tu": "liras",
      "il/elle/on": "lira",
      "nous": "lirons",
      "vous": "lirez",
      "ils/elles": "liront"
    },
    "travailler": {
      "je": "travaillerai",
      "tu": "travailleras",
      "il/elle/on": "travaillera",
      "nous": "travaillerons",
      "vous": "travaillerez",
      "ils/elles": "travailleront"
    },
    "jouer": {
      "je": "jouerai",
      "tu": "joueras",
      "il/elle/on": "jouera",
      "nous": "jouerons",
      "vous": "jouerez",
      "ils/elles": "joueront"
    },
    "recevoir": {
      "je": "recevrai",
      "tu": "recevras",
      "il/elle/on": "recevra",
      "nous": "recevrons",
      "vous": "recevrez",
      "ils/elles": "recevront"
    },
    "changer": {
      "je": "changerai",
      "tu": "changeras",
      "il/elle/on": "changera",
      "nous": "changerons",
      "vous": "changerez",
      "ils/elles": "changeront"
    },
    "gagner": {
      "je": "gagnerai",
      "tu": "gagneras",
      "il/elle/on": "gagnera",
      "nous": "gagnerons",
      "vous": "gagnerez",
      "ils/elles": "gagneront"
    },
    "boire": {
      "je": "boirai",
      "tu": "boiras",
      "il/elle/on": "boira",
      "nous": "boirons",
      "vous": "boirez",
      "ils/elles": "boiront"
    },
    "décider": {
      "je": "déciderai",
      "tu": "décideras",
      "il/elle/on": "décidera",
      "nous": "déciderons",
      "vous": "déciderez",
      "ils/elles": "décideront"
    },
    "oublier": {
      "je": "j'oublierai",
      "tu": "oublieras",
      "il/elle/on": "oubliera",
      "nous": "oublierons",
      "vous": "oublierez",
      "ils/elles": "oublieront"
    },
    "dormir": {
      "je": "dormirai",
      "tu": "dormiras",
      "il/elle/on": "dormira",
      "nous": "dormirons",
      "vous": "dormirez",
      "ils/elles": "dormiront"
    },
    "courir": {
      "je": "courrai",
      "tu": "courras",
      "il/elle/on": "courra",
      "nous": "courrons",
      "vous": "courrez",
      "ils/elles": "courront"
    },
    "acheter": {
      "je": "j'achèterai",
      "tu": "achèteras",
      "il/elle/on": "achètera",
      "nous": "achèterons",
      "vous": "achèterez",
      "ils/elles": "achèteront"
    },
    "payer": {
      "je": "paierai",
      "tu": "paieras",
      "il/elle/on": "paiera",
      "nous": "paierons",
      "vous": "paierez",
      "ils/elles": "paieront"
    },
    "choisir": {
      "je": "choisirai",
      "tu": "choisiras",
      "il/elle/on": "choisira",
      "nous": "choisirons",
      "vous": "choisirez",
      "ils/elles": "choisiront"
    },
    "essayer": {
      "je": "j'essaierai",
      "tu": "essaieras",
      "il/elle/on": "essaiera",
      "nous": "essaierons",
      "vous": "essaierez",
      "ils/elles": "essaieront"
    },
    "envoyer": {
      "je": "j'enverrai",
      "tu": "enverras",
      "il/elle/on": "enverra",
      "nous": "enverrons",
      "vous": "enverrez",
      "ils/elles": "enverront"
    },
    "rentrer": {
      "je": "rentrerai",
      "tu": "rentreras",
      "il/elle/on": "rentrera",
      "nous": "rentrerons",
      "vous": "rentrerez",
      "ils/elles": "rentreront"
    },
    "porter": {
      "je": "porterai",
      "tu": "porteras",
      "il/elle/on": "portera",
      "nous": "porterons",
      "vous": "porterez",
      "ils/elles": "porteront"
    },
    "marcher": {
      "je": "marcherai",
      "tu": "marcheras",
      "il/elle/on": "marchera",
      "nous": "marcherons",
      "vous": "marcherez",
      "ils/elles": "marcheront"
    },
    "monter": {
      "je": "monterai",
      "tu": "monteras",
      "il/elle/on": "montera",
      "nous": "monterons",
      "vous": "monterez",
      "ils/elles": "monteront"
    },
    "aider": {
      "je": "j'aiderai",
      "tu": "aideras",
      "il/elle/on": "aidera",
      "nous": "aiderons",
      "vous": "aiderez",
      "ils/elles": "aideront"
    },
    "tomber": {
      "je": "tomberai",
      "tu": "tomberas",
      "il/elle/on": "tombera",
      "nous": "tomberons",
      "vous": "tomberez",
      "ils/elles": "tomberont"
    },
    "conduire": {
      "je": "conduirai",
      "tu": "conduiras",
      "il/elle/on": "conduira",
      "nous": "conduirons",
      "vous": "conduirez",
      "ils/elles": "conduiront"
    },
    "expliquer": {
      "je": "j'expliquerai",
      "tu": "expliqueras",
      "il/elle/on": "expliquera",
      "nous": "expliquerons",
      "vous": "expliquerez",
      "ils/elles": "expliqueront"
    },
    "apprendre": {
      "je": "j'apprendrai",
      "tu": "apprendras",
      "il/elle/on": "apprendra",
      "nous": "apprendrons",
      "vous": "apprendrez",
      "ils/elles": "apprendront"
    },
    "produire": {
      "je": "produirai",
      "tu": "produiras",
      "il/elle/on": "produira",
      "nous": "produirons",
      "vous": "produirez",
      "ils/elles": "produiront"
    },
    "préparer": {
      "je": "préparerai",
      "tu": "prépareras",
      "il/elle/on": "préparera",
      "nous": "préparerons",
      "vous": "préparerez",
      "ils/elles": "prépareront"
    },
    "chanter": {
      "je": "chanterai",
      "tu": "chanteras",
      "il/elle/on": "chantera",
      "nous": "chanterons",
      "vous": "chanterez",
      "ils/elles": "chanteront"
    },
    "danser": {
      "je": "danserai",
      "tu": "danseras",
      "il/elle/on": "dansera",
      "nous": "danserons",
      "vous": "danserez",
      "ils/elles": "danseront"
    },
    "raconter": {
      "je": "raconterai",
      "tu": "raconteras",
      "il/elle/on": "racontera",
      "nous": "raconterons",
      "vous": "raconterez",
      "ils/elles": "raconteront"
    },
    "espérer": {
      "je": "j'espérerai",
      "tu": "espéreras",
      "il/elle/on": "espérera",
      "nous": "espérerons",
      "vous": "espérerez",
      "ils/elles": "espéreront"
    },
    "offrir": {
      "je": "j'offrirai",
      "tu": "offriras",
      "il/elle/on": "offrira",
      "nous": "offrirons",
      "vous": "offrirez",
      "ils/elles": "offriront"
    },
    "construire": {
      "je": "construirai",
      "tu": "construiras",
      "il/elle/on": "construira",
      "nous": "construirons",
      "vous": "construirez",
      "ils/elles": "construiront"
    },
    "détruire": {
      "je": "détruirai",
      "tu": "détruiras",
      "il/elle/on": "détruira",
      "nous": "détruirons",
      "vous": "détruirez",
      "ils/elles": "détruiront"
    },
    "traduire": {
      "je": "traduirai",
      "tu": "traduiras",
      "il/elle/on": "traduira",
      "nous": "traduirons",
      "vous": "traduirez",
      "ils/elles": "traduiront"
    },
    "revenir": {
      "je": "reviendrai",
      "tu": "reviendras",
      "il/elle/on": "reviendra",
      "nous": "reviendrons",
      "vous": "reviendrez",
      "ils/elles": "reviendront"
    },
    "entrer": {
      "je": "j'entrerai",
      "tu": "entreras",
      "il/elle/on": "entrera",
      "nous": "entrerons",
      "vous": "entrerez",
      "ils/elles": "entreront"
    },
    "naître": {
      "je": "naîtrai",
      "tu": "naîtras",
      "il/elle/on": "naîtra",
      "nous": "naîtrons",
      "vous": "naîtrez",
      "ils/elles": "naîtront"
    },
    "descendre": {
      "je": "descendrai",
      "tu": "descendras",
      "il/elle/on": "descendra",
      "nous": "descendrons",
      "vous": "descendrez",
      "ils/elles": "descendront"
    },
    "plaire": {
      "je": "plairai",
      "tu": "plairas",
      "il/elle/on": "plaira",
      "nous": "plairons",
      "vous": "plairez",
      "ils/elles": "plairont"
    },
    "sourire": {
      "je": "sourirai",
      "tu": "souriras",
      "il/elle/on": "sourira",
      "nous": "sourirons",
      "vous": "sourirez",
      "ils/elles": "souriront"
    },
    "rire": {
      "je": "rirai",
      "tu": "riras",
      "il/elle/on": "rira",
      "nous": "rirons",
      "vous": "rirez",
      "ils/elles": "riront"
    },
    "vendre": {
      "je": "vendrai",
      "tu": "vendras",
      "il/elle/on": "vendra",
      "nous": "vendrons",
      "vous": "vendrez",
      "ils/elles": "vendront"
    },
    "permettre": {
      "je": "permettrai",
      "tu": "permettras",
      "il/elle/on": "permettra",
      "nous": "permettrons",
      "vous": "permettrez",
      "ils/elles": "permettront"
    },
    "promettre": {
      "je": "promettrai",
      "tu": "promettras",
      "il/elle/on": "promettra",
      "nous": "promettrons",
      "vous": "promettrez",
      "ils/elles": "promettront"
    },
    "paraître": {
      "je": "paraîtrai",
      "tu": "paraîtras",
      "il/elle/on": "paraîtra",
      "nous": "paraîtrons",
      "vous": "paraîtrez",
      "ils/elles": "paraîtront"
    },
    "disparaître": {
      "je": "disparaîtrai",
      "tu": "disparaîtras",
      "il/elle/on": "disparaîtra",
      "nous": "disparaîtrons",
      "vous": "disparaîtrez",
      "ils/elles": "disparaîtront"
    },
    "reconnaître": {
      "je": "reconnaîtrai",
      "tu": "reconnaîtras",
      "il/elle/on": "reconnaîtra",
      "nous": "reconnaîtrons",
      "vous": "reconnaîtrez",
      "ils/elles": "reconnaîtront"
    },
    "battre": {
      "je": "battrai",
      "tu": "battras",
      "il/elle/on": "battra",
      "nous": "battrons",
      "vous": "battrez",
      "ils/elles": "battront"
    },
    "mentir": {
      "je": "mentirai",
      "tu": "mentiras",
      "il/elle/on": "mentira",
      "nous": "mentirons",
      "vous": "mentirez",
      "ils/elles": "mentiront"
    },
    "partager": {
      "je": "partagerai",
      "tu": "partageras",
      "il/elle/on": "partagera",
      "nous": "partagerons",
      "vous": "partagerez",
      "ils/elles": "partageront"
    },
    "protéger": {
      "je": "protègerai",
      "tu": "protègeras",
      "il/elle/on": "protègera",
      "nous": "protègerons",
      "vous": "protègerez",
      "ils/elles": "protègeront"
    },
    "voyager": {
      "je": "voyagerai",
      "tu": "voyageras",
      "il/elle/on": "voyagera",
      "nous": "voyagerons",
      "vous": "voyagerez",
      "ils/elles": "voyageront"
    },
    "étudier": {
      "je": "j'étudierai",
      "tu": "étudieras",
      "il/elle/on": "étudiera",
      "nous": "étudierons",
      "vous": "étudierez",
      "ils/elles": "étudieront"
    },
    "réussir": {
      "je": "réussirai",
      "tu": "réussiras",
      "il/elle/on": "réussira",
      "nous": "réussirons",
      "vous": "réussirez",
      "ils/elles": "réussiront"
    },
    "grandir": {
      "je": "grandirai",
      "tu": "grandiras",
      "il/elle/on": "grandira",
      "nous": "grandirons",
      "vous": "grandirez",
      "ils/elles": "grandiront"
    },
    "vieillir": {
      "je": "vieillirai",
      "tu": "vieilliras",
      "il/elle/on": "vieillira",
      "nous": "vieillirons",
      "vous": "vieillirez",
      "ils/elles": "vieilliront"
    },
    "rougir": {
      "je": "rougirai",
      "tu": "rougiras",
      "il/elle/on": "rougira",
      "nous": "rougirons",
      "vous": "rougirez",
      "ils/elles": "rougiront"
    },
    "maigrir": {
      "je": "maigrirai",
      "tu": "maigriras",
      "il/elle/on": "maigrira",
      "nous": "maigrirons",
      "vous": "maigrirez",
      "ils/elles": "maigriront"
    },
    "grossir": {
      "je": "grossirai",
      "tu": "grossiras",
      "il/elle/on": "grossira",
      "nous": "grossirons",
      "vous": "grossirez",
      "ils/elles": "grossiront"
    },
    "obéir": {
      "je": "j'obéirai",
      "tu": "obéiras",
      "il/elle/on": "obéira",
      "nous": "obéirons",
      "vous": "obéirez",
      "ils/elles": "obéiront"
    },
    "désobéir": {
      "je": "désobéirai",
      "tu": "désobéiras",
      "il/elle/on": "désobéira",
      "nous": "désobéirons",
      "vous": "désobéirez",
      "ils/elles": "désobéiront"
    },
    "réfléchir": {
      "je": "réfléchirai",
      "tu": "réfléchiras",
      "il/elle/on": "réfléchira",
      "nous": "réfléchirons",
      "vous": "réfléchirez",
      "ils/elles": "réfléchiront"
    },
    "remplir": {
      "je": "remplirai",
      "tu": "rempliras",
      "il/elle/on": "remplira",
      "nous": "remplirons",
      "vous": "remplirez",
      "ils/elles": "rempliront"
    },
    "punir": {
      "je": "punirai",
      "tu": "puniras",
      "il/elle/on": "punira",
      "nous": "punirons",
      "vous": "punirez",
      "ils/elles": "puniront"
    },
    "guérir": {
      "je": "guérirai",
      "tu": "guériras",
      "il/elle/on": "guérira",
      "nous": "guérirons",
      "vous": "guérirez",
      "ils/elles": "guériront"
    },
    "bâtir": {
      "je": "bâtirai",
      "tu": "bâtiras",
      "il/elle/on": "bâtira",
      "nous": "bâtirons",
      "vous": "bâtirez",
      "ils/elles": "bâtiront"
    },
    "nourrir": {
      "je": "nourrirai",
      "tu": "nourriras",
      "il/elle/on": "nourrira",
      "nous": "nourrirons",
      "vous": "nourrirez",
      "ils/elles": "nourriront"
    },
    "avertir": {
      "je": "j'avertirai",
      "tu": "avertiras",
      "il/elle/on": "avertira",
      "nous": "avertirons",
      "vous": "avertirez",
      "ils/elles": "avertiront"
    },
    "agir": {
      "je": "j'agirai",
      "tu": "agiras",
      "il/elle/on": "agira",
      "nous": "agirons",
      "vous": "agirez",
      "ils/elles": "agiront"
    },
    "réagir": {
      "je": "réagirai",
      "tu": "réagiras",
      "il/elle/on": "réagira",
      "nous": "réagirons",
      "vous": "réagirez",
      "ils/elles": "réagiront"
    },
    "saisir": {
      "je": "saisirai",
      "tu": "saisiras",
      "il/elle/on": "saisira",
      "nous": "saisirons",
      "vous": "saisirez",
      "ils/elles": "saisiront"
    },
    "établir": {
      "je": "j'établirai",
      "tu": "établiras",
      "il/elle/on": "établira",
      "nous": "établirons",
      "vous": "établirez",
      "ils/elles": "établiront"
    },
    "investir": {
      "je": "j'investirai",
      "tu": "investiras",
      "il/elle/on": "investira",
      "nous": "investirons",
      "vous": "investirez",
      "ils/elles": "investiront"
    },
    "couvrir": {
      "je": "couvrirai",
      "tu": "couvriras",
      "il/elle/on": "couvrira",
      "nous": "couvrirons",
      "vous": "couvrirez",
      "ils/elles": "couvriront"
    },
    "découvrir": {
      "je": "découvrirai",
      "tu": "découvriras",
      "il/elle/on": "découvrira",
      "nous": "découvrirons",
      "vous": "découvrirez",
      "ils/elles": "découvriront"
    },
    "souffrir": {
      "je": "souffrirai",
      "tu": "souffriras",
      "il/elle/on": "souffrira",
      "nous": "souffrirons",
      "vous": "souffrirez",
      "ils/elles": "souffriront"
    },
    "cueillir": {
      "je": "cueillerai",
      "tu": "cueilleras",
      "il/elle/on": "cueillera",
      "nous": "cueillerons",
      "vous": "cueillerez",
      "ils/elles": "cueilleront"
    },
    "accueillir": {
      "je": "j'accueillerai",
      "tu": "accueilleras",
      "il/elle/on": "accueillera",
      "nous": "accueillerons",
      "vous": "accueillerez",
      "ils/elles": "accueilleront"
    },
    "assaillir": {
      "je": "j'assaillirai",
      "tu": "assailliras",
      "il/elle/on": "assaillira",
      "nous": "assaillirons",
      "vous": "assaillirez",
      "ils/elles": "assailliront"
    },
    "tressaillir": {
      "je": "tressaillirai",
      "tu": "tressailliras",
      "il/elle/on": "tressaillira",
      "nous": "tressaillirons",
      "vous": "tressaillirez",
      "ils/elles": "tressailliront"
    },
    "fuir": {
      "je": "fuirai",
      "tu": "fuiras",
      "il/elle/on": "fuira",
      "nous": "fuirons",
      "vous": "fuirez",
      "ils/elles": "fuiront"
    },
    "vêtir": {
      "je": "vêtirai",
      "tu": "vêtiras",
      "il/elle/on": "vêtira",
      "nous": "vêtirons",
      "vous": "vêtirez",
      "ils/elles": "vêtiront"
    },
    "acquérir": {
      "je": "j'acquerrai",
      "tu": "acquerras",
      "il/elle/on": "acquerra",
      "nous": "acquerrons",
      "vous": "acquerrez",
      "ils/elles": "acquerront"
    },
    "conquérir": {
      "je": "conquerrai",
      "tu": "conquerras",
      "il/elle/on": "conquerra",
      "nous": "conquerrons",
      "vous": "conquerrez",
      "ils/elles": "conquerront"
    },
    "bouillir": {
      "je": "bouillirai",
      "tu": "bouilliras",
      "il/elle/on": "bouillira",
      "nous": "bouillirons",
      "vous": "bouillirez",
      "ils/elles": "bouilliront"
    },
    "faillir": {
      "je": "faillirai",
      "tu": "failliras",
      "il/elle/on": "faillira",
      "nous": "faillirons",
      "vous": "faillirez",
      "ils/elles": "failliront"
    },
    "haïr": {
      "je": "haïrai",
      "tu": "haïras",
      "il/elle/on": "haïra",
      "nous": "haïrons",
      "vous": "haïrez",
      "ils/elles": "haïront"
    },
    "ouïr": {
      "je": "j'oirai",
      "tu": "oiras",
      "il/elle/on": "oira",
      "nous": "oirons",
      "vous": "oirez",
      "ils/elles": "oiront"
    },
    "réduire": {
      "je": "réduirai",
      "tu": "réduiras",
      "il/elle/on": "réduira",
      "nous": "réduirons",
      "vous": "réduirez",
      "ils/elles": "réduiront"
    },
    "séduire": {
      "je": "séduirai",
      "tu": "séduiras",
      "il/elle/on": "séduira",
      "nous": "séduirons",
      "vous": "séduirez",
      "ils/elles": "séduiront"
    },
    "introduire": {
      "je": "j'introduirai",
      "tu": "introduiras",
      "il/elle/on": "introduira",
      "nous": "introduirons",
      "vous": "introduirez",
      "ils/elles": "introduiront"
    },
    "cuire": {
      "je": "cuirai",
      "tu": "cuiras",
      "il/elle/on": "cuira",
      "nous": "cuirons",
      "vous": "cuirez",
      "ils/elles": "cuiront"
    },
    "nuire": {
      "je": "nuirai",
      "tu": "nuiras",
      "il/elle/on": "nuira",
      "nous": "nuirons",
      "vous": "nuirez",
      "ils/elles": "nuiront"
    },
    "luire": {
      "je": "luirai",
      "tu": "luiras",
      "il/elle/on": "luira",
      "nous": "luirons",
      "vous": "luirez",
      "ils/elles": "luiront"
    },
    "joindre": {
      "je": "joindrai",
      "tu": "joindras",
      "il/elle/on": "joindra",
      "nous": "joindrons",
      "vous": "joindrez",
      "ils/elles": "joindront"
    },
    "craindre": {
      "je": "craindrai",
      "tu": "craindras",
      "il/elle/on": "craindra",
      "nous": "craindrons",
      "vous": "craindrez",
      "ils/elles": "craindront"
    },
    "peindre": {
      "je": "peindrai",
      "tu": "peindras",
      "il/elle/on": "peindra",
      "nous": "peindrons",
      "vous": "peindrez",
      "ils/elles": "peindront"
    },
    "plaindre": {
      "je": "plaindrai",
      "tu": "plaindras",
      "il/elle/on": "plaindra",
      "nous": "plaindrons",
      "vous": "plaindrez",
      "ils/elles": "plaindront"
    },
    "éteindre": {
      "je": "j'éteindrai",
      "tu": "éteindras",
      "il/elle/on": "éteindra",
      "nous": "éteindrons",
      "vous": "éteindrez",
      "ils/elles": "éteindront"
    },
    "atteindre": {
      "je": "j'atteindrai",
      "tu": "atteindras",
      "il/elle/on": "atteindra",
      "nous": "atteindrons",
      "vous": "atteindrez",
      "ils/elles": "atteindront"
    },
    "restreindre": {
      "je": "restreindrai",
      "tu": "restreindras",
      "il/elle/on": "restreindra",
      "nous": "restreindrons",
      "vous": "restreindrez",
      "ils/elles": "restreindront"
    },
    "feindre": {
      "je": "feindrai",
      "tu": "feindras",
      "il/elle/on": "feindra",
      "nous": "feindrons",
      "vous": "feindrez",
      "ils/elles": "feindront"
    },
    "geindre": {
      "je": "geindrai",
      "tu": "geindras",
      "il/elle/on": "geindra",
      "nous": "geindrons",
      "vous": "geindrez",
      "ils/elles": "geindront"
    },
    "contraindre": {
      "je": "contraindrai",
      "tu": "contraindras",
      "il/elle/on": "contraindra",
      "nous": "contraindrons",
      "vous": "contraindrez",
      "ils/elles": "contraindront"
    },
    "résoudre": {
      "je": "résoudrai",
      "tu": "résoudras",
      "il/elle/on": "résoudra",
      "nous": "résoudrons",
      "vous": "résoudrez",
      "ils/elles": "résoudront"
    },
    "absoudre": {
      "je": "j'absoudrai",
      "tu": "absoudras",
      "il/elle/on": "absoudra",
      "nous": "absoudrons",
      "vous": "absoudrez",
      "ils/elles": "absoudront"
    },
    "dissoudre": {
      "je": "dissoudrai",
      "tu": "dissoudras",
      "il/elle/on": "dissoudra",
      "nous": "dissoudrons",
      "vous": "dissoudrez",
      "ils/elles": "dissoudront"
    },
    "coudre": {
      "je": "coudrai",
      "tu": "coudras",
      "il/elle/on": "coudra",
      "nous": "coudrons",
      "vous": "coudrez",
      "ils/elles": "coudront"
    },
    "moudre": {
      "je": "moudrai",
      "tu": "moudras",
      "il/elle/on": "moudra",
      "nous": "moudrons",
      "vous": "moudrez",
      "ils/elles": "moudront"
    },
    "poursuivre": {
      "je": "poursuivrai",
      "tu": "poursuivras",
      "il/elle/on": "poursuivra",
      "nous": "poursuivrons",
      "vous": "poursuivrez",
      "ils/elles": "poursuivront"
    },
    "survivre": {
      "je": "survivrai",
      "tu": "survivras",
      "il/elle/on": "survivra",
      "nous": "survivrons",
      "vous": "survivrez",
      "ils/elles": "survivront"
    },
    "revivre": {
      "je": "revivrai",
      "tu": "revivras",
      "il/elle/on": "revivra",
      "nous": "revivrons",
      "vous": "revivrez",
      "ils/elles": "revivront"
    },
    "conclure": {
      "je": "conclurai",
      "tu": "concluras",
      "il/elle/on": "conclura",
      "nous": "conclurons",
      "vous": "conclurez",
      "ils/elles": "concluront"
    },
    "exclure": {
      "je": "j'exclurai",
      "tu": "excluras",
      "il/elle/on": "exclura",
      "nous": "exclurons",
      "vous": "exclurez",
      "ils/elles": "excluront"
    },
    "inclure": {
      "je": "j'inclurai",
      "tu": "incluras",
      "il/elle/on": "inclura",
      "nous": "inclurons",
      "vous": "inclurez",
      "ils/elles": "incluront"
    },
    "élire": {
      "je": "j'élirai",
      "tu": "éliras",
      "il/elle/on": "élira",
      "nous": "élirons",
      "vous": "élirez",
      "ils/elles": "éliront"
    },
    "relire": {
      "je": "relirai",
      "tu": "reliras",
      "il/elle/on": "relira",
      "nous": "relirons",
      "vous": "relirez",
      "ils/elles": "reliront"
    },
    "interdire": {
      "je": "j'interdirai",
      "tu": "interdiras",
      "il/elle/on": "interdira",
      "nous": "interdirons",
      "vous": "interdirez",
      "ils/elles": "interdiront"
    },
    "prédire": {
      "je": "prédirai",
      "tu": "prédiras",
      "il/elle/on": "prédira",
      "nous": "prédirons",
      "vous": "prédirez",
      "ils/elles": "prédiront"
    },
    "médire": {
      "je": "médirai",
      "tu": "médiras",
      "il/elle/on": "médira",
      "nous": "médirons",
      "vous": "médirez",
      "ils/elles": "médiront"
    },
    "contredire": {
      "je": "contredirai",
      "tu": "contrediras",
      "il/elle/on": "contredira",
      "nous": "contredirons",
      "vous": "contredirez",
      "ils/elles": "contrediront"
    },
    "suffire": {
      "je": "suffirai",
      "tu": "suffiras",
      "il/elle/on": "suffira",
      "nous": "suffirons",
      "vous": "suffirez",
      "ils/elles": "suffiront"
    },
    "circoncire": {
      "je": "circoncirai",
      "tu": "circonciras",
      "il/elle/on": "circoncira",
      "nous": "circoncirons",
      "vous": "circoncirez",
      "ils/elles": "circonciront"
    },
    "déplaire": {
      "je": "déplairai",
      "tu": "déplairas",
      "il/elle/on": "déplaira",
      "nous": "déplairons",
      "vous": "déplairez",
      "ils/elles": "déplairont"
    },
    "taire": {
      "je": "tairai",
      "tu": "tairas",
      "il/elle/on": "taira",
      "nous": "tairons",
      "vous": "tairez",
      "ils/elles": "tairont"
    },
    "apparaître": {
      "je": "j'apparaîtrai",
      "tu": "apparaîtras",
      "il/elle/on": "apparaîtra",
      "nous": "apparaîtrons",
      "vous": "apparaîtrez",
      "ils/elles": "apparaîtront"
    },
    "paître": {
      "je": "paîtrai",
      "tu": "paîtras",
      "il/elle/on": "paîtra",
      "nous": "paîtrons",
      "vous": "paîtrez",
      "ils/elles": "paîtront"
    },
    "combattre": {
      "je": "combattrai",
      "tu": "combattras",
      "il/elle/on": "combattra",
      "nous": "combattrons",
      "vous": "combattrez",
      "ils/elles": "combattront"
    },
    "abattre": {
      "je": "j'abattrai",
      "tu": "abattras",
      "il/elle/on": "abattra",
      "nous": "abattrons",
      "vous": "abattrez",
      "ils/elles": "abattront"
    },
    "débattre": {
      "je": "débattrai",
      "tu": "débattras",
      "il/elle/on": "débattra",
      "nous": "débattrons",
      "vous": "débattrez",
      "ils/elles": "débattront"
    },
    "admettre": {
      "je": "j'admettrai",
      "tu": "admettras",
      "il/elle/on": "admettra",
      "nous": "admettrons",
      "vous": "admettrez",
      "ils/elles": "admettront"
    },
    "commettre": {
      "je": "commettrai",
      "tu": "commettras",
      "il/elle/on": "commettra",
      "nous": "commettrons",
      "vous": "commettrez",
      "ils/elles": "commettront"
    },
    "compromettre": {
      "je": "compromettrai",
      "tu": "compromettras",
      "il/elle/on": "compromettra",
      "nous": "compromettrons",
      "vous": "compromettrez",
      "ils/elles": "compromettront"
    },
    "remettre": {
      "je": "remettrai",
      "tu": "remettras",
      "il/elle/on": "remettra",
      "nous": "remettrons",
      "vous": "remettrez",
      "ils/elles": "remettront"
    },
    "soumettre": {
      "je": "soumettrai",
      "tu": "soumettras",
      "il/elle/on": "soumettra",
      "nous": "soumettrons",
      "vous": "soumettrez",
      "ils/elles": "soumettront"
    },
    "transmettre": {
      "je": "transmettrai",
      "tu": "transmettras",
      "il/elle/on": "transmettra",
      "nous": "transmettrons",
      "vous": "transmettrez",
      "ils/elles": "transmettront"
    },
    "entreprendre": {
      "je": "j'entreprendrai",
      "tu": "entreprendras",
      "il/elle/on": "entreprendra",
      "nous": "entreprendrons",
      "vous": "entreprendrez",
      "ils/elles": "entreprendront"
    },
    "reprendre": {
      "je": "reprendrai",
      "tu": "reprendras",
      "il/elle/on": "reprendra",
      "nous": "reprendrons",
      "vous": "reprendrez",
      "ils/elles": "reprendront"
    },
    "surprendre": {
      "je": "surprendrai",
      "tu": "surprendras",
      "il/elle/on": "surprendra",
      "nous": "surprendrons",
      "vous": "surprendrez",
      "ils/elles": "surprendront"
    },
    "rompre": {
      "je": "romprai",
      "tu": "rompras",
      "il/elle/on": "rompra",
      "nous": "romprons",
      "vous": "romprez",
      "ils/elles": "rompront"
    },
    "corrompre": {
      "je": "corromprai",
      "tu": "corrompras",
      "il/elle/on": "corrompra",
      "nous": "corromprons",
      "vous": "corromprez",
      "ils/elles": "corrompront"
    },
    "interrompre": {
      "je": "j'interromprai",
      "tu": "interrompras",
      "il/elle/on": "interrompra",
      "nous": "interromprons",
      "vous": "interromprez",
      "ils/elles": "interrompront"
    },
    "vaincre": {
      "je": "vaincrai",
      "tu": "vaincras",
      "il/elle/on": "vaincra",
      "nous": "vaincrons",
      "vous": "vaincrez",
      "ils/elles": "vaincront"
    },
    "convaincre": {
      "je": "convaincrai",
      "tu": "convaincras",
      "il/elle/on": "convaincra",
      "nous": "convaincrons",
      "vous": "convaincrez",
      "ils/elles": "convaincront"
    },
    "amener": {
      "je": "j'amènerai",
      "tu": "amèneras",
      "il/elle/on": "amènera",
      "nous": "amènerons",
      "vous": "amènerez",
      "ils/elles": "amèneront"
    },
    "emmener": {
      "je": "j'emmènerai",
      "tu": "emmèneras",
      "il/elle/on": "emmènera",
      "nous": "emmènerons",
      "vous": "emmènerez",
      "ils/elles": "emmèneront"
    },
    "enlever": {
      "je": "j'enlèverai",
      "tu": "enlèveras",
      "il/elle/on": "enlèvera",
      "nous": "enlèverons",
      "vous": "enlèverez",
      "ils/elles": "enlèveront"
    },
    "geler": {
      "je": "gèlerai",
      "tu": "gèleras",
      "il/elle/on": "gèlera",
      "nous": "gèlerons",
      "vous": "gèlerez",
      "ils/elles": "gèleront"
    },
    "harceler": {
      "je": "harcellerai",
      "tu": "harcelleras",
      "il/elle/on": "harcellera",
      "nous": "harcellerons",
      "vous": "harcellerez",
      "ils/elles": "harcelleront"
    },
    "lever": {
      "je": "lèverai",
      "tu": "lèveras",
      "il/elle/on": "lèvera",
      "nous": "lèverons",
      "vous": "lèverez",
      "ils/elles": "lèveront"
    },
    "mener": {
      "je": "mènerai",
      "tu": "mèneras",
      "il/elle/on": "mènera",
      "nous": "mènerons",
      "vous": "mènerez",
      "ils/elles": "mèneront"
    },
    "peler": {
      "je": "pèlerai",
      "tu": "pèleras",
      "il/elle/on": "pèlera",
      "nous": "pèlerons",
      "vous": "pèlerez",
      "ils/elles": "pèleront"
    },
    "peser": {
      "je": "pèserai",
      "tu": "pèseras",
      "il/elle/on": "pèsera",
      "nous": "pèserons",
      "vous": "pèserez",
      "ils/elles": "pèseront"
    },
    "promener": {
      "je": "promènerai",
      "tu": "promèneras",
      "il/elle/on": "promènera",
      "nous": "promènerons",
      "vous": "promènerez",
      "ils/elles": "promèneront"
    },
    "semer": {
      "je": "sèmerai",
      "tu": "sèmeras",
      "il/elle/on": "sèmera",
      "nous": "sèmerons",
      "vous": "sèmerez",
      "ils/elles": "sèmeront"
    },
    "jeter": {
      "je": "jetterai",
      "tu": "jetteras",
      "il/elle/on": "jettera",
      "nous": "jetterons",
      "vous": "jetterez",
      "ils/elles": "jetteront"
    },
    "épeler": {
      "je": "j'épellerai",
      "tu": "épelleras",
      "il/elle/on": "épellera",
      "nous": "épellerons",
      "vous": "épellerez",
      "ils/elles": "épelleront"
    },
    "feuilleter": {
      "je": "feuilletterai",
      "tu": "feuilletteras",
      "il/elle/on": "feuillettera",
      "nous": "feuilletterons",
      "vous": "feuilletterez",
      "ils/elles": "feuilletteront"
    },
    "projeter": {
      "je": "projetterai",
      "tu": "projetteras",
      "il/elle/on": "projettera",
      "nous": "projetterons",
      "vous": "projetterez",
      "ils/elles": "projetteront"
    },
    "rejeter": {
      "je": "rejetterai",
      "tu": "rejetteras",
      "il/elle/on": "rejettera",
      "nous": "rejetterons",
      "vous": "rejetterez",
      "ils/elles": "rejetteront"
    },
    "renouveler": {
      "je": "renouvellerai",
      "tu": "renouvelleras",
      "il/elle/on": "renouvellera",
      "nous": "renouvellerons",
      "vous": "renouvellerez",
      "ils/elles": "renouvelleront"
    },
    "céder": {
      "je": "céderai",
      "tu": "céderas",
      "il/elle/on": "cédera",
      "nous": "céderons",
      "vous": "céderez",
      "ils/elles": "céderont"
    },
    "célébrer": {
      "je": "célébrerai",
      "tu": "célébreras",
      "il/elle/on": "célébrera",
      "nous": "célébrerons",
      "vous": "célébrerez",
      "ils/elles": "célébreront"
    },
    "compléter": {
      "je": "compléterai",
      "tu": "compléteras",
      "il/elle/on": "complétera",
      "nous": "compléterons",
      "vous": "compléterez",
      "ils/elles": "compléteront"
    },
    "considérer": {
      "je": "considérerai",
      "tu": "considéreras",
      "il/elle/on": "considérera",
      "nous": "considérerons",
      "vous": "considérerez",
      "ils/elles": "considéreront"
    },
    "différer": {
      "je": "différerai",
      "tu": "différeras",
      "il/elle/on": "différera",
      "nous": "différerons",
      "vous": "différerez",
      "ils/elles": "différeront"
    },
    "exagérer": {
      "je": "j'exagérerai",
      "tu": "exagéreras",
      "il/elle/on": "exagérera",
      "nous": "exagérerons",
      "vous": "exagérerez",
      "ils/elles": "exagéreront"
    },
    "gérer": {
      "je": "gérerai",
      "tu": "géreras",
      "il/elle/on": "gérera",
      "nous": "gérerons",
      "vous": "gérerez",
      "ils/elles": "géreront"
    },
    "inquiéter": {
      "je": "j'inquiéterai",
      "tu": "inquiéteras",
      "il/elle/on": "inquiétera",
      "nous": "inquiéterons",
      "vous": "inquiéterez",
      "ils/elles": "inquiéteront"
    },
    "modérer": {
      "je": "modérerai",
      "tu": "modéreras",
      "il/elle/on": "modérera",
      "nous": "modérerons",
      "vous": "modérerez",
      "ils/elles": "modéreront"
    },
    "pénétrer": {
      "je": "pénétrerai",
      "tu": "pénétreras",
      "il/elle/on": "pénétrera",
      "nous": "pénétrerons",
      "vous": "pénétrerez",
      "ils/elles": "pénétreront"
    },
    "posséder": {
      "je": "posséderai",
      "tu": "posséderas",
      "il/elle/on": "possédera",
      "nous": "posséderons",
      "vous": "posséderez",
      "ils/elles": "posséderont"
    },
    "préférer": {
      "je": "préférerai",
      "tu": "préféreras",
      "il/elle/on": "préférera",
      "nous": "préférerons",
      "vous": "préférerez",
      "ils/elles": "préféreront"
    },
    "refléter": {
      "je": "refléterai",
      "tu": "refléteras",
      "il/elle/on": "reflétera",
      "nous": "refléterons",
      "vous": "refléterez",
      "ils/elles": "refléteront"
    },
    "répéter": {
      "je": "répéterai",
      "tu": "répéteras",
      "il/elle/on": "répétera",
      "nous": "répéterons",
      "vous": "répéterez",
      "ils/elles": "répéteront"
    },
    "révéler": {
      "je": "révélerai",
      "tu": "révéleras",
      "il/elle/on": "révélera",
      "nous": "révélerons",
      "vous": "révélerez",
      "ils/elles": "révéleront"
    },
    "suggérer": {
      "je": "suggérerai",
      "tu": "suggéreras",
      "il/elle/on": "suggérera",
      "nous": "suggérerons",
      "vous": "suggérerez",
      "ils/elles": "suggéreront"
    },
    "zébrer": {
      "je": "zébrerai",
      "tu": "zébreras",
      "il/elle/on": "zébrera",
      "nous": "zébrerons",
      "vous": "zébrerez",
      "ils/elles": "zébreront"
    },
    "nettoyer": {
      "je": "nettoierai",
      "tu": "nettoieras",
      "il/elle/on": "nettoiera",
      "nous": "nettoierons",
      "vous": "nettoierez",
      "ils/elles": "nettoieront"
    },
    "appuyer": {
      "je": "j'appuierai",
      "tu": "appuieras",
      "il/elle/on": "appuiera",
      "nous": "appuierons",
      "vous": "appuierez",
      "ils/elles": "appuieront"
    },
    "ennuyer": {
      "je": "j'ennuierai",
      "tu": "ennuieras",
      "il/elle/on": "ennuiera",
      "nous": "ennuierons",
      "vous": "ennuierez",
      "ils/elles": "ennuieront"
    },
    "essuyer": {
      "je": "j'essuierai",
      "tu": "essuieras",
      "il/elle/on": "essuiera",
      "nous": "essuierons",
      "vous": "essuierez",
      "ils/elles": "essuieront"
    },
    "balayer": {
      "je": "balaierai",
      "tu": "balaieras",
      "il/elle/on": "balaiera",
      "nous": "balaierons",
      "vous": "balaierez",
      "ils/elles": "balaieront"
    },
    "effrayer": {
      "je": "j'effraierai",
      "tu": "effraieras",
      "il/elle/on": "effraiera",
      "nous": "effraierons",
      "vous": "effraierez",
      "ils/elles": "effraieront"
    },
    "aboyer": {
      "je": "j'aboierai",
      "tu": "aboieras",
      "il/elle/on": "aboiera",
      "nous": "aboierons",
      "vous": "aboierez",
      "ils/elles": "aboieront"
    },
    "noyer": {
      "je": "noierai",
      "tu": "noieras",
      "il/elle/on": "noiera",
      "nous": "noierons",
      "vous": "noierez",
      "ils/elles": "noieront"
    },
    "tutoyer": {
      "je": "tutoierai",
      "tu": "tutoieras",
      "il/elle/on": "tutoiera",
      "nous": "tutoierons",
      "vous": "tutoierez",
      "ils/elles": "tutoieront"
    },
    "vouvoyer": {
      "je": "vouvoierai",
      "tu": "vouvoieras",
      "il/elle/on": "vouvoiera",
      "nous": "vouvoierons",
      "vous": "vouvoierez",
      "ils/elles": "vouvoieront"
    },
    "annoncer": {
      "je": "j'annoncerai",
      "tu": "annonceras",
      "il/elle/on": "annoncera",
      "nous": "annoncerons",
      "vous": "annoncerez",
      "ils/elles": "annonceront"
    },
    "avancer": {
      "je": "j'avancerai",
      "tu": "avanceras",
      "il/elle/on": "avancera",
      "nous": "avancerons",
      "vous": "avancerez",
      "ils/elles": "avanceront"
    },
    "dénoncer": {
      "je": "dénoncerai",
      "tu": "dénonceras",
      "il/elle/on": "dénoncera",
      "nous": "dénoncerons",
      "vous": "dénoncerez",
      "ils/elles": "dénonceront"
    },
    "divorcer": {
      "je": "divorcerai",
      "tu": "divorceras",
      "il/elle/on": "divorcera",
      "nous": "divorcerons",
      "vous": "divorcerez",
      "ils/elles": "divorceront"
    },
    "effacer": {
      "je": "j'effacerai",
      "tu": "effaceras",
      "il/elle/on": "effacera",
      "nous": "effacerons",
      "vous": "effacerez",
      "ils/elles": "effaceront"
    },
    "lancer": {
      "je": "lancerai",
      "tu": "lanceras",
      "il/elle/on": "lancera",
      "nous": "lancerons",
      "vous": "lancerez",
      "ils/elles": "lanceront"
    },
    "menacer": {
      "je": "menacerai",
      "tu": "menaceras",
      "il/elle/on": "menacera",
      "nous": "menacerons",
      "vous": "menacerez",
      "ils/elles": "menaceront"
    },
    "placer": {
      "je": "placerai",
      "tu": "placeras",
      "il/elle/on": "placera",
      "nous": "placerons",
      "vous": "placerez",
      "ils/elles": "placeront"
    },
    "prononcer": {
      "je": "prononcerai",
      "tu": "prononceras",
      "il/elle/on": "prononcera",
      "nous": "prononcerons",
      "vous": "prononcerez",
      "ils/elles": "prononceront"
    },
    "remplacer": {
      "je": "remplacerai",
      "tu": "remplaceras",
      "il/elle/on": "remplacera",
      "nous": "remplacerons",
      "vous": "remplacerez",
      "ils/elles": "remplaceront"
    },
    "renoncer": {
      "je": "renoncerai",
      "tu": "renonceras",
      "il/elle/on": "renoncera",
      "nous": "renoncerons",
      "vous": "renoncerez",
      "ils/elles": "renonceront"
    },
    "arranger": {
      "je": "j'arrangerai",
      "tu": "arrangeras",
      "il/elle/on": "arrangera",
      "nous": "arrangerons",
      "vous": "arrangerez",
      "ils/elles": "arrangeront"
    },
    "bouger": {
      "je": "bougerai",
      "tu": "bougeras",
      "il/elle/on": "bougera",
      "nous": "bougerons",
      "vous": "bougerez",
      "ils/elles": "bougeront"
    },
    "corriger": {
      "je": "corrigerai",
      "tu": "corrigeras",
      "il/elle/on": "corrigera",
      "nous": "corrigerons",
      "vous": "corrigerez",
      "ils/elles": "corrigeront"
    },
    "décourager": {
      "je": "découragerai",
      "tu": "décourageras",
      "il/elle/on": "découragera",
      "nous": "découragerons",
      "vous": "découragerez",
      "ils/elles": "décourageront"
    },
    "déménager": {
      "je": "déménagerai",
      "tu": "déménageras",
      "il/elle/on": "déménagera",
      "nous": "déménagerons",
      "vous": "déménagerez",
      "ils/elles": "déménageront"
    },
    "diriger": {
      "je": "dirigerai",
      "tu": "dirigeras",
      "il/elle/on": "dirigera",
      "nous": "dirigerons",
      "vous": "dirigerez",
      "ils/elles": "dirigeront"
    },
    "encourager": {
      "je": "j'encouragerai",
      "tu": "encourageras",
      "il/elle/on": "encouragera",
      "nous": "encouragerons",
      "vous": "encouragerez",
      "ils/elles": "encourageront"
    },
    "engager": {
      "je": "j'engagerai",
      "tu": "engageras",
      "il/elle/on": "engagera",
      "nous": "engagerons",
      "vous": "engagerez",
      "ils/elles": "engageront"
    },
    "exiger": {
      "je": "j'exigerai",
      "tu": "exigeras",
      "il/elle/on": "exigera",
      "nous": "exigerons",
      "vous": "exigerez",
      "ils/elles": "exigeront"
    },
    "juger": {
      "je": "jugerai",
      "tu": "jugeras",
      "il/elle/on": "jugera",
      "nous": "jugerons",
      "vous": "jugerez",
      "ils/elles": "jugeront"
    },
    "loger": {
      "je": "logerai",
      "tu": "logeras",
      "il/elle/on": "logera",
      "nous": "logerons",
      "vous": "logerez",
      "ils/elles": "logeront"
    },
    "mélanger": {
      "je": "mélangerai",
      "tu": "mélangeras",
      "il/elle/on": "mélangera",
      "nous": "mélangerons",
      "vous": "mélangerez",
      "ils/elles": "mélangeront"
    },
    "nager": {
      "je": "nagerai",
      "tu": "nageras",
      "il/elle/on": "nagera",
      "nous": "nagerons",
      "vous": "nagerez",
      "ils/elles": "nageront"
    },
    "obliger": {
      "je": "j'obligerai",
      "tu": "obligeras",
      "il/elle/on": "obligera",
      "nous": "obligerons",
      "vous": "obligerez",
      "ils/elles": "obligeront"
    },
    "plonger": {
      "je": "plongerai",
      "tu": "plongeras",
      "il/elle/on": "plongera",
      "nous": "plongerons",
      "vous": "plongerez",
      "ils/elles": "plongeront"
    },
    "ranger": {
      "je": "rangerai",
      "tu": "rangeras",
      "il/elle/on": "rangera",
      "nous": "rangerons",
      "vous": "rangerez",
      "ils/elles": "rangeront"
    },
    "rédiger": {
      "je": "rédigerai",
      "tu": "rédigeras",
      "il/elle/on": "rédigera",
      "nous": "rédigerons",
      "vous": "rédigerez",
      "ils/elles": "rédigeront"
    },
    "ajouter": {
      "je": "j'ajouterai",
      "tu": "ajouteras",
      "il/elle/on": "ajoutera",
      "nous": "ajouterons",
      "vous": "ajouterez",
      "ils/elles": "ajouteront"
    },
    "durer": {
      "je": "durerai",
      "tu": "dureras",
      "il/elle/on": "durera",
      "nous": "durerons",
      "vous": "durerez",
      "ils/elles": "dureront"
    },
    "écouter": {
      "je": "j'écouterai",
      "tu": "écouteras",
      "il/elle/on": "écoutera",
      "nous": "écouterons",
      "vous": "écouterez",
      "ils/elles": "écouteront"
    },
    "emprunter": {
      "je": "j'emprunterai",
      "tu": "emprunteras",
      "il/elle/on": "empruntera",
      "nous": "emprunterons",
      "vous": "emprunterez",
      "ils/elles": "emprunteront"
    },
    "fermer": {
      "je": "fermerai",
      "tu": "fermeras",
      "il/elle/on": "fermera",
      "nous": "fermerons",
      "vous": "fermerez",
      "ils/elles": "fermeront"
    },
    "garder": {
      "je": "garderai",
      "tu": "garderas",
      "il/elle/on": "gardera",
      "nous": "garderons",
      "vous": "garderez",
      "ils/elles": "garderont"
    },
    "laver": {
      "je": "laverai",
      "tu": "laveras",
      "il/elle/on": "lavera",
      "nous": "laverons",
      "vous": "laverez",
      "ils/elles": "laveront"
    },
    "pardonner": {
      "je": "pardonnerai",
      "tu": "pardonneras",
      "il/elle/on": "pardonnera",
      "nous": "pardonnerons",
      "vous": "pardonnerez",
      "ils/elles": "pardonneront"
    },
    "présenter": {
      "je": "présenterai",
      "tu": "présenteras",
      "il/elle/on": "présentera",
      "nous": "présenterons",
      "vous": "présenterez",
      "ils/elles": "présenteront"
    },
    "prêter": {
      "je": "prêterai",
      "tu": "prêteras",
      "il/elle/on": "prêtera",
      "nous": "prêterons",
      "vous": "prêterez",
      "ils/elles": "prêteront"
    },
    "quitter": {
      "je": "quitterai",
      "tu": "quitteras",
      "il/elle/on": "quittera",
      "nous": "quitterons",
      "vous": "quitterez",
      "ils/elles": "quitteront"
    },
    "refuser": {
      "je": "refuserai",
      "tu": "refuseras",
      "il/elle/on": "refusera",
      "nous": "refuserons",
      "vous": "refuserez",
      "ils/elles": "refuseront"
    },
    "rencontrer": {
      "je": "rencontrerai",
      "tu": "rencontreras",
      "il/elle/on": "rencontrera",
      "nous": "rencontrerons",
      "vous": "rencontrerez",
      "ils/elles": "rencontreront"
    },
    "reposer": {
      "je": "reposerai",
      "tu": "reposeras",
      "il/elle/on": "reposera",
      "nous": "reposerons",
      "vous": "reposerez",
      "ils/elles": "reposeront"
    },
    "rêver": {
      "je": "rêverai",
      "tu": "rêveras",
      "il/elle/on": "rêvera",
      "nous": "rêverons",
      "vous": "rêverez",
      "ils/elles": "rêveront"
    },
    "saluer": {
      "je": "saluerai",
      "tu": "salueras",
      "il/elle/on": "saluera",
      "nous": "saluerons",
      "vous": "saluerez",
      "ils/elles": "salueront"
    },
    "sauter": {
      "je": "sauterai",
      "tu": "sauteras",
      "il/elle/on": "sautera",
      "nous": "sauterons",
      "vous": "sauterez",
      "ils/elles": "sauteront"
    },
    "sembler": {
      "je": "semblerai",
      "tu": "sembleras",
      "il/elle/on": "semblera",
      "nous": "semblerons",
      "vous": "semblerez",
      "ils/elles": "sembleront"
    },
    "signer": {
      "je": "signerai",
      "tu": "signeras",
      "il/elle/on": "signera",
      "nous": "signerons",
      "vous": "signerez",
      "ils/elles": "signeront"
    },
    "téléphoner": {
      "je": "téléphonerai",
      "tu": "téléphoneras",
      "il/elle/on": "téléphonera",
      "nous": "téléphonerons",
      "vous": "téléphonerez",
      "ils/elles": "téléphoneront"
    },
    "terminer": {
      "je": "terminerai",
      "tu": "termineras",
      "il/elle/on": "terminera",
      "nous": "terminerons",
      "vous": "terminerez",
      "ils/elles": "termineront"
    },
    "traverser": {
      "je": "traverserai",
      "tu": "traverseras",
      "il/elle/on": "traversera",
      "nous": "traverserons",
      "vous": "traverserez",
      "ils/elles": "traverseront"
    },
    "utiliser": {
      "je": "j'utiliserai",
      "tu": "utiliseras",
      "il/elle/on": "utilisera",
      "nous": "utiliserons",
      "vous": "utiliserez",
      "ils/elles": "utiliseront"
    },
    "visiter": {
      "je": "visiterai",
      "tu": "visiteras",
      "il/elle/on": "visitera",
      "nous": "visiterons",
      "vous": "visiterez",
      "ils/elles": "visiteront"
    },
    "voler": {
      "je": "volerai",
      "tu": "voleras",
      "il/elle/on": "volera",
      "nous": "volerons",
      "vous": "volerez",
      "ils/elles": "voleront"
    },
    "accepter": {
      "je": "j'accepterai",
      "tu": "accepteras",
      "il/elle/on": "acceptera",
      "nous": "accepterons",
      "vous": "accepterez",
      "ils/elles": "accepteront"
    },
    "adorer": {
      "je": "j'adorerai",
      "tu": "adoreras",
      "il/elle/on": "adorera",
      "nous": "adorerons",
      "vous": "adorerez",
      "ils/elles": "adoreront"
    },
    "apporter": {
      "je": "j'apporterai",
      "tu": "apporteras",
      "il/elle/on": "apportera",
      "nous": "apporterons",
      "vous": "apporterez",
      "ils/elles": "apporteront"
    },
    "arrêter": {
      "je": "j'arrêterai",
      "tu": "arrêteras",
      "il/elle/on": "arrêtera",
      "nous": "arrêterons",
      "vous": "arrêterez",
      "ils/elles": "arrêteront"
    },
    "commander": {
      "je": "commanderai",
      "tu": "commanderas",
      "il/elle/on": "commandera",
      "nous": "commanderons",
      "vous": "commanderez",
      "ils/elles": "commanderont"
    },
    "compter": {
      "je": "compterai",
      "tu": "compteras",
      "il/elle/on": "comptera",
      "nous": "compterons",
      "vous": "compterez",
      "ils/elles": "compteront"
    },
    "conseiller": {
      "je": "conseillerai",
      "tu": "conseilleras",
      "il/elle/on": "conseillera",
      "nous": "conseillerons",
      "vous": "conseillerez",
      "ils/elles": "conseilleront"
    },
    "continuer": {
      "je": "continuerai",
      "tu": "continueras",
      "il/elle/on": "continuera",
      "nous": "continuerons",
      "vous": "continuerez",
      "ils/elles": "continueront"
    },
    "coûter": {
      "je": "coûterai",
      "tu": "coûteras",
      "il/elle/on": "coûtera",
      "nous": "coûterons",
      "vous": "coûterez",
      "ils/elles": "coûteront"
    },
    "crier": {
      "je": "crierai",
      "tu": "crieras",
      "il/elle/on": "criera",
      "nous": "crierons",
      "vous": "crierez",
      "ils/elles": "crieront"
    },
    "déjeuner": {
      "je": "déjeunerai",
      "tu": "déjeuneras",
      "il/elle/on": "déjeunera",
      "nous": "déjeunerons",
      "vous": "déjeunerez",
      "ils/elles": "déjeuneront"
    },
    "désirer": {
      "je": "désirerai",
      "tu": "désireras",
      "il/elle/on": "désirera",
      "nous": "désirerons",
      "vous": "désirerez",
      "ils/elles": "désireront"
    },
    "détester": {
      "je": "détesterai",
      "tu": "détesteras",
      "il/elle/on": "détestera",
      "nous": "détesterons",
      "vous": "détesterez",
      "ils/elles": "détesteront"
    },
    "dessiner": {
      "je": "dessinerai",
      "tu": "dessineras",
      "il/elle/on": "dessinera",
      "nous": "dessinerons",
      "vous": "dessinerez",
      "ils/elles": "dessineront"
    },
    "dîner": {
      "je": "dînerai",
      "tu": "dîneras",
      "il/elle/on": "dînera",
      "nous": "dînerons",
      "vous": "dînerez",
      "ils/elles": "dîneront"
    },
    "discuter": {
      "je": "discuterai",
      "tu": "discuteras",
      "il/elle/on": "discutera",
      "nous": "discuterons",
      "vous": "discuterez",
      "ils/elles": "discuteront"
    },
    "éviter": {
      "je": "j'éviterai",
      "tu": "éviteras",
      "il/elle/on": "évitera",
      "nous": "éviterons",
      "vous": "éviterez",
      "ils/elles": "éviteront"
    },
    "excuser": {
      "je": "j'excuserai",
      "tu": "excuseras",
      "il/elle/on": "excusera",
      "nous": "excuserons",
      "vous": "excuserez",
      "ils/elles": "excuseront"
    },
    "fumer": {
      "je": "fumerai",
      "tu": "fumeras",
      "il/elle/on": "fumera",
      "nous": "fumerons",
      "vous": "fumerez",
      "ils/elles": "fumeront"
    },
    "habiter": {
      "je": "habiterai",
      "tu": "habiteras",
      "il/elle/on": "habitera",
      "nous": "habiterons",
      "vous": "habiterez",
      "ils/elles": "habiteront"
    },
    "imaginer": {
      "je": "j'imaginerai",
      "tu": "imagineras",
      "il/elle/on": "imaginera",
      "nous": "imaginerons",
      "vous": "imaginerez",
      "ils/elles": "imagineront"
    },
    "importer": {
      "je": "j'importerai",
      "tu": "importeras",
      "il/elle/on": "importera",
      "nous": "importerons",
      "vous": "importerez",
      "ils/elles": "importeront"
    },
    "inviter": {
      "je": "j'inviterai",
      "tu": "inviteras",
      "il/elle/on": "invitera",
      "nous": "inviterons",
      "vous": "inviterez",
      "ils/elles": "inviteront"
    },
    "noter": {
      "je": "noterai",
      "tu": "noteras",
      "il/elle/on": "notera",
      "nous": "noterons",
      "vous": "noterez",
      "ils/elles": "noteront"
    },
    "organiser": {
      "je": "j'organiserai",
      "tu": "organiseras",
      "il/elle/on": "organisera",
      "nous": "organiserons",
      "vous": "organiserez",
      "ils/elles": "organiseront"
    },
    "parier": {
      "je": "parierai",
      "tu": "parieras",
      "il/elle/on": "pariera",
      "nous": "parierons",
      "vous": "parierez",
      "ils/elles": "parieront"
    },
    "pleurer": {
      "je": "pleurerai",
      "tu": "pleureras",
      "il/elle/on": "pleurera",
      "nous": "pleurerons",
      "vous": "pleurerez",
      "ils/elles": "pleureront"
    },
    "poser": {
      "je": "poserai",
      "tu": "poseras",
      "il/elle/on": "posera",
      "nous": "poserons",
      "vous": "poserez",
      "ils/elles": "poseront"
    },
    "pousser": {
      "je": "pousserai",
      "tu": "pousseras",
      "il/elle/on": "poussera",
      "nous": "pousserons",
      "vous": "pousserez",
      "ils/elles": "pousseront"
    },
    "prier": {
      "je": "prierai",
      "tu": "prieras",
      "il/elle/on": "priera",
      "nous": "prierons",
      "vous": "prierez",
      "ils/elles": "prieront"
    },
    "rappeler": {
      "je": "rappellerai",
      "tu": "rappelleras",
      "il/elle/on": "rappellera",
      "nous": "rappellerons",
      "vous": "rappellerez",
      "ils/elles": "rappelleront"
    },
    "remercier": {
      "je": "remercierai",
      "tu": "remercieras",
      "il/elle/on": "remerciera",
      "nous": "remercierons",
      "vous": "remercierez",
      "ils/elles": "remercieront"
    },
    "respecter": {
      "je": "respecterai",
      "tu": "respecteras",
      "il/elle/on": "respectera",
      "nous": "respecterons",
      "vous": "respecterez",
      "ils/elles": "respecteront"
    },
    "retourner": {
      "je": "retournerai",
      "tu": "retourneras",
      "il/elle/on": "retournera",
      "nous": "retournerons",
      "vous": "retournerez",
      "ils/elles": "retourneront"
    },
    "retrouver": {
      "je": "retrouverai",
      "tu": "retrouveras",
      "il/elle/on": "retrouvera",
      "nous": "retrouverons",
      "vous": "retrouverez",
      "ils/elles": "retrouveront"
    },
    "réveiller": {
      "je": "réveillerai",
      "tu": "réveilleras",
      "il/elle/on": "réveillera",
      "nous": "réveillerons",
      "vous": "réveillerez",
      "ils/elles": "réveilleront"
    },
    "toucher": {
      "je": "toucherai",
      "tu": "toucheras",
      "il/elle/on": "touchera",
      "nous": "toucherons",
      "vous": "toucherez",
      "ils/elles": "toucheront"
    },
    "tuer": {
      "je": "tuerai",
      "tu": "tueras",
      "il/elle/on": "tuera",
      "nous": "tuerons",
      "vous": "tuerez",
      "ils/elles": "tueront"
    },
    "vérifier": {
      "je": "vérifierai",
      "tu": "vérifieras",
      "il/elle/on": "vérifiera",
      "nous": "vérifierons",
      "vous": "vérifierez",
      "ils/elles": "vérifieront"
    }
  },
  "subjonctifPresent": {
    "être": {
      "je": "sois",
      "tu": "sois",
      "il/elle/on": "soit",
      "nous": "soyons",
      "vous": "soyez",
      "ils/elles": "soient"
    },
    "avoir": {
      "je": "j'aie",
      "tu": "aies",
      "il/elle/on": "ait",
      "nous": "ayons",
      "vous": "ayez",
      "ils/elles": "aient"
    },
    "aller": {
      "je": "j'aille",
      "tu": "ailles",
      "il/elle/on": "aille",
      "nous": "allions",
      "vous": "alliez",
      "ils/elles": "aillent"
    },
    "faire": {
      "je": "fasse",
      "tu": "fasses",
      "il/elle/on": "fasse",
      "nous": "fassions",
      "vous": "fassiez",
      "ils/elles": "fassent"
    },
    "venir": {
      "je": "vienne",
      "tu": "viennes",
      "il/elle/on": "vienne",
      "nous": "venions",
      "vous": "veniez",
      "ils/elles": "viennent"
    },
    "pouvoir": {
      "je": "puisse",
      "tu": "puisses",
      "il/elle/on": "puisse",
      "nous": "puissions",
      "vous": "puissiez",
      "ils/elles": "puissent"
    },
    "vouloir": {
      "je": "veuille",
      "tu": "veuilles",
      "il/elle/on": "veuille",
      "nous": "voulions",
      "vous": "vouliez",
      "ils/elles": "veuillent"
    },
    "savoir": {
      "je": "sache",
      "tu": "saches",
      "il/elle/on": "sache",
      "nous": "sachions",
      "vous": "sachiez",
      "ils/elles": "sachent"
    },
    "devoir": {
      "je": "doive",
      "tu": "doives",
      "il/elle/on": "doive",
      "nous": "devions",
      "vous": "deviez",
      "ils/elles": "doivent"
    },
    "dire": {
      "je": "dise",
      "tu": "dises",
      "il/elle/on": "dise",
      "nous": "disions",
      "vous": "disiez",
      "ils/elles": "disent"
    },
    "voir": {
      "je": "voie",
      "tu": "voies",
      "il/elle/on": "voie",
      "nous": "voyions",
      "vous": "voyiez",
      "ils/elles": "voient"
    },
    "prendre": {
      "je": "prenne",
      "tu": "prennes",
      "il/elle/on": "prenne",
      "nous": "prenions",
      "vous": "preniez",
      "ils/elles": "prennent"
    },
    "mettre": {
      "je": "mette",
      "tu": "mettes",
      "il/elle/on": "mette",
      "nous": "mettions",
      "vous": "mettiez",
      "ils/elles": "mettent"
    },
    "croire": {
      "je": "croie",
      "tu": "croies",
      "il/elle/on": "croie",
      "nous": "croyions",
      "vous": "croyiez",
      "ils/elles": "croient"
    },
    "parler": {
      "je": "parle",
      "tu": "parles",
      "il/elle/on": "parle",
      "nous": "parlions",
      "vous": "parliez",
      "ils/elles": "parlent"
    },
    "passer": {
      "je": "passe",
      "tu": "passes",
      "il/elle/on": "passe",
      "nous": "passions",
      "vous": "passiez",
      "ils/elles": "passent"
    },
    "trouver": {
      "je": "trouve",
      "tu": "trouves",
      "il/elle/on": "trouve",
      "nous": "trouvions",
      "vous": "trouviez",
      "ils/elles": "trouvent"
    },
    "donner": {
      "je": "donne",
      "tu": "donnes",
      "il/elle/on": "donne",
      "nous": "donnions",
      "vous": "donniez",
      "ils/elles": "donnent"
    },
    "comprendre": {
      "je": "comprenne",
      "tu": "comprennes",
      "il/elle/on": "comprenne",
      "nous": "comprenions",
      "vous": "compreniez",
      "ils/elles": "comprennent"
    },
    "partir": {
      "je": "parte",
      "tu": "partes",
      "il/elle/on": "parte",
      "nous": "partions",
      "vous": "partiez",
      "ils/elles": "partent"
    },
    "demander": {
      "je": "demande",
      "tu": "demandes",
      "il/elle/on": "demande",
      "nous": "demandions",
      "vous": "demandiez",
      "ils/elles": "demandent"
    },
    "tenir": {
      "je": "tienne",
      "tu": "tiennes",
      "il/elle/on": "tienne",
      "nous": "tenions",
      "vous": "teniez",
      "ils/elles": "tiennent"
    },
    "aimer": {
      "je": "j'aime",
      "tu": "aimes",
      "il/elle/on": "aime",
      "nous": "aimions",
      "vous": "aimiez",
      "ils/elles": "aiment"
    },
    "penser": {
      "je": "pense",
      "tu": "penses",
      "il/elle/on": "pense",
      "nous": "pensions",
      "vous": "pensiez",
      "ils/elles": "pensent"
    },
    "rester": {
      "je": "reste",
      "tu": "restes",
      "il/elle/on": "reste",
      "nous": "restions",
      "vous": "restiez",
      "ils/elles": "restent"
    },
    "manger": {
      "je": "mange",
      "tu": "manges",
      "il/elle/on": "mange",
      "nous": "mangions",
      "vous": "mangiez",
      "ils/elles": "mangent"
    },
    "laisser": {
      "je": "laisse",
      "tu": "laisses",
      "il/elle/on": "laisse",
      "nous": "laissions",
      "vous": "laissiez",
      "ils/elles": "laissent"
    },
    "regarder": {
      "je": "regarde",
      "tu": "regardes",
      "il/elle/on": "regarde",
      "nous": "regardions",
      "vous": "regardiez",
      "ils/elles": "regardent"
    },
    "répondre": {
      "je": "réponde",
      "tu": "répondes",
      "il/elle/on": "réponde",
      "nous": "répondions",
      "vous": "répondiez",
      "ils/elles": "répondent"
    },
    "vivre": {
      "je": "vive",
      "tu": "vives",
      "il/elle/on": "vive",
      "nous": "vivions",
      "vous": "viviez",
      "ils/elles": "vivent"
    },
    "chercher": {
      "je": "cherche",
      "tu": "cherches",
      "il/elle/on": "cherche",
      "nous": "cherchions",
      "vous": "cherchiez",
      "ils/elles": "cherchent"
    },
    "sentir": {
      "je": "sente",
      "tu": "sentes",
      "il/elle/on": "sente",
      "nous": "sentions",
      "vous": "sentiez",
      "ils/elles": "sentent"
    },
    "entendre": {
      "je": "j'entende",
      "tu": "entendes",
      "il/elle/on": "entende",
      "nous": "entendions",
      "vous": "entendiez",
      "ils/elles": "entendent"
    },
    "attendre": {
      "je": "j'attende",
      "tu": "attendes",
      "il/elle/on": "attende",
      "nous": "attendions",
      "vous": "attendiez",
      "ils/elles": "attendent"
    },
    "sortir": {
      "je": "sorte",
      "tu": "sortes",
      "il/elle/on": "sorte",
      "nous": "sortions",
      "vous": "sortiez",
      "ils/elles": "sortent"
    },
    "connaître": {
      "je": "connaisse",
      "tu": "connaisses",
      "il/elle/on": "connaisse",
      "nous": "connaissions",
      "vous": "connaissiez",
      "ils/elles": "connaissent"
    },
    "arriver": {
      "je": "j'arrive",
      "tu": "arrives",
      "il/elle/on": "arrive",
      "nous": "arrivions",
      "vous": "arriviez",
      "ils/elles": "arrivent"
    },
    "ouvrir": {
      "je": "j'ouvre",
      "tu": "ouvres",
      "il/elle/on": "ouvre",
      "nous": "ouvrions",
      "vous": "ouvriez",
      "ils/elles": "ouvrent"
    },
    "perdre": {
      "je": "perde",
      "tu": "perdes",
      "il/elle/on": "perde",
      "nous": "perdions",
      "vous": "perdiez",
      "ils/elles": "perdent"
    },
    "écrire": {
      "je": "j'écrive",
      "tu": "écrives",
      "il/elle/on": "écrive",
      "nous": "écrivions",
      "vous": "écriviez",
      "ils/elles": "écrivent"
    },
    "devenir": {
      "je": "devienne",
      "tu": "deviennes",
      "il/elle/on": "devienne",
      "nous": "devenions",
      "vous": "deveniez",
      "ils/elles": "deviennent"
    },
    "suivre": {
      "je": "suive",
      "tu": "suives",
      "il/elle/on": "suive",
      "nous": "suivions",
      "vous": "suiviez",
      "ils/elles": "suivent"
    },
    "montrer": {
      "je": "montre",
      "tu": "montres",
      "il/elle/on": "montre",
      "nous": "montrions",
      "vous": "montriez",
      "ils/elles": "montrent"
    },
    "mourir": {
      "je": "meure",
      "tu": "meures",
      "il/elle/on": "meure",
      "nous": "mourions",
      "vous": "mouriez",
      "ils/elles": "meurent"
    },
    "appeler": {
      "je": "j'appelle",
      "tu": "appelles",
      "il/elle/on": "appelle",
      "nous": "appelions",
      "vous": "appeliez",
      "ils/elles": "appellent"
    },
    "commencer": {
      "je": "commence",
      "tu": "commences",
      "il/elle/on": "commence",
      "nous": "commencions",
      "vous": "commenciez",
      "ils/elles": "commencent"
    },
    "finir": {
      "je": "finisse",
      "tu": "finisses",
      "il/elle/on": "finisse",
      "nous": "finissions",
      "vous": "finissiez",
      "ils/elles": "finissent"
    },
    "servir": {
      "je": "serve",
      "tu": "serves",
      "il/elle/on": "serve",
      "nous": "servions",
      "vous": "serviez",
      "ils/elles": "servent"
    },
    "lire": {
      "je": "lise",
      "tu": "lises",
      "il/elle/on": "lise",
      "nous": "lisions",
      "vous": "lisiez",
      "ils/elles": "lisent"
    },
    "travailler": {
      "je": "travaille",
      "tu": "travailles",
      "il/elle/on": "travaille",
      "nous": "travaillions",
      "vous": "travailliez",
      "ils/elles": "travaillent"
    },
    "jouer": {
      "je": "joue",
      "tu": "joues",
      "il/elle/on": "joue",
      "nous": "jouions",
      "vous": "jouiez",
      "ils/elles": "jouent"
    },
    "recevoir": {
      "je": "reçoive",
      "tu": "reçoives",
      "il/elle/on": "reçoive",
      "nous": "recevions",
      "vous": "receviez",
      "ils/elles": "reçoivent"
    },
    "changer": {
      "je": "change",
      "tu": "changes",
      "il/elle/on": "change",
      "nous": "changions",
      "vous": "changiez",
      "ils/elles": "changent"
    },
    "gagner": {
      "je": "gagne",
      "tu": "gagnes",
      "il/elle/on": "gagne",
      "nous": "gagnions",
      "vous": "gagniez",
      "ils/elles": "gagnent"
    },
    "boire": {
      "je": "boive",
      "tu": "boives",
      "il/elle/on": "boive",
      "nous": "buvions",
      "vous": "buviez",
      "ils/elles": "boivent"
    },
    "décider": {
      "je": "décide",
      "tu": "décides",
      "il/elle/on": "décide",
      "nous": "décidions",
      "vous": "décidiez",
      "ils/elles": "décident"
    },
    "oublier": {
      "je": "j'oublie",
      "tu": "oublies",
      "il/elle/on": "oublie",
      "nous": "oubliions",
      "vous": "oubliiez",
      "ils/elles": "oublient"
    },
    "dormir": {
      "je": "dorme",
      "tu": "dormes",
      "il/elle/on": "dorme",
      "nous": "dormions",
      "vous": "dormiez",
      "ils/elles": "dorment"
    },
    "courir": {
      "je": "coure",
      "tu": "coures",
      "il/elle/on": "coure",
      "nous": "courions",
      "vous": "couriez",
      "ils/elles": "courent"
    },
    "acheter": {
      "je": "j'achète",
      "tu": "achètes",
      "il/elle/on": "achète",
      "nous": "achetions",
      "vous": "achetiez",
      "ils/elles": "achètent"
    },
    "payer": {
      "je": "paie",
      "tu": "paies",
      "il/elle/on": "paie",
      "nous": "payions",
      "vous": "payiez",
      "ils/elles": "paient"
    },
    "choisir": {
      "je": "choisisse",
      "tu": "choisisses",
      "il/elle/on": "choisisse",
      "nous": "choisissions",
      "vous": "choisissiez",
      "ils/elles": "choisissent"
    },
    "essayer": {
      "je": "j'essaie",
      "tu": "essaies",
      "il/elle/on": "essaie",
      "nous": "essayions",
      "vous": "essayiez",
      "ils/elles": "essaient"
    },
    "envoyer": {
      "je": "j'envoie",
      "tu": "envoies",
      "il/elle/on": "envoie",
      "nous": "envoyions",
      "vous": "envoyiez",
      "ils/elles": "envoient"
    },
    "rentrer": {
      "je": "rentre",
      "tu": "rentres",
      "il/elle/on": "rentre",
      "nous": "rentrions",
      "vous": "rentriez",
      "ils/elles": "rentrent"
    },
    "porter": {
      "je": "porte",
      "tu": "portes",
      "il/elle/on": "porte",
      "nous": "portions",
      "vous": "portiez",
      "ils/elles": "portent"
    },
    "marcher": {
      "je": "marche",
      "tu": "marches",
      "il/elle/on": "marche",
      "nous": "marchions",
      "vous": "marchiez",
      "ils/elles": "marchent"
    },
    "monter": {
      "je": "monte",
      "tu": "montes",
      "il/elle/on": "monte",
      "nous": "montions",
      "vous": "montiez",
      "ils/elles": "montent"
    },
    "aider": {
      "je": "j'aide",
      "tu": "aides",
      "il/elle/on": "aide",
      "nous": "aidions",
      "vous": "aidiez",
      "ils/elles": "aident"
    },
    "tomber": {
      "je": "tombe",
      "tu": "tombes",
      "il/elle/on": "tombe",
      "nous": "tombions",
      "vous": "tombiez",
      "ils/elles": "tombent"
    },
    "conduire": {
      "je": "conduise",
      "tu": "conduises",
      "il/elle/on": "conduise",
      "nous": "conduisions",
      "vous": "conduisiez",
      "ils/elles": "conduisent"
    },
    "expliquer": {
      "je": "j'explique",
      "tu": "expliques",
      "il/elle/on": "explique",
      "nous": "expliquions",
      "vous": "expliquiez",
      "ils/elles": "expliquent"
    },
    "apprendre": {
      "je": "j'apprenne",
      "tu": "apprennes",
      "il/elle/on": "apprenne",
      "nous": "apprenions",
      "vous": "appreniez",
      "ils/elles": "apprennent"
    },
    "produire": {
      "je": "produise",
      "tu": "produises",
      "il/elle/on": "produise",
      "nous": "produisions",
      "vous": "produisiez",
      "ils/elles": "produisent"
    },
    "préparer": {
      "je": "prépare",
      "tu": "prépares",
      "il/elle/on": "prépare",
      "nous": "préparions",
      "vous": "prépariez",
      "ils/elles": "préparent"
    },
    "chanter": {
      "je": "chante",
      "tu": "chantes",
      "il/elle/on": "chante",
      "nous": "chantions",
      "vous": "chantiez",
      "ils/elles": "chantent"
    },
    "danser": {
      "je": "danse",
      "tu": "danses",
      "il/elle/on": "danse",
      "nous": "dansions",
      "vous": "dansiez",
      "ils/elles": "dansent"
    },
    "raconter": {
      "je": "raconte",
      "tu": "racontes",
      "il/elle/on": "raconte",
      "nous": "racontions",
      "vous": "racontiez",
      "ils/elles": "racontent"
    },
    "espérer": {
      "je": "j'espère",
      "tu": "espères",
      "il/elle/on": "espère",
      "nous": "espérions",
      "vous": "espériez",
      "ils/elles": "espèrent"
    },
    "offrir": {
      "je": "j'offre",
      "tu": "offres",
      "il/elle/on": "offre",
      "nous": "offrions",
      "vous": "offriez",
      "ils/elles": "offrent"
    },
    "construire": {
      "je": "construise",
      "tu": "construises",
      "il/elle/on": "construise",
      "nous": "construisions",
      "vous": "construisiez",
      "ils/elles": "construisent"
    },
    "détruire": {
      "je": "détruise",
      "tu": "détruises",
      "il/elle/on": "détruise",
      "nous": "détruisions",
      "vous": "détruisiez",
      "ils/elles": "détruisent"
    },
    "traduire": {
      "je": "traduise",
      "tu": "traduises",
      "il/elle/on": "traduise",
      "nous": "traduisions",
      "vous": "traduisiez",
      "ils/elles": "traduisent"
    },
    "revenir": {
      "je": "revienne",
      "tu": "reviennes",
      "il/elle/on": "revienne",
      "nous": "revenions",
      "vous": "reveniez",
      "ils/elles": "reviennent"
    },
    "entrer": {
      "je": "j'entre",
      "tu": "entres",
      "il/elle/on": "entre",
      "nous": "entrions",
      "vous": "entriez",
      "ils/elles": "entrent"
    },
    "naître": {
      "je": "naisse",
      "tu": "naisses",
      "il/elle/on": "naisse",
      "nous": "naissions",
      "vous": "naissiez",
      "ils/elles": "naissent"
    },
    "descendre": {
      "je": "descende",
      "tu": "descendes",
      "il/elle/on": "descende",
      "nous": "descendions",
      "vous": "descendiez",
      "ils/elles": "descendent"
    },
    "plaire": {
      "je": "plaise",
      "tu": "plaises",
      "il/elle/on": "plaise",
      "nous": "plaisions",
      "vous": "plaisiez",
      "ils/elles": "plaisent"
    },
    "sourire": {
      "je": "sourie",
      "tu": "souries",
      "il/elle/on": "sourie",
      "nous": "souriions",
      "vous": "souriiez",
      "ils/elles": "sourient"
    },
    "rire": {
      "je": "rie",
      "tu": "ries",
      "il/elle/on": "rie",
      "nous": "riions",
      "vous": "riiez",
      "ils/elles": "rient"
    },
    "vendre": {
      "je": "vende",
      "tu": "vendes",
      "il/elle/on": "vende",
      "nous": "vendions",
      "vous": "vendiez",
      "ils/elles": "vendent"
    },
    "permettre": {
      "je": "permette",
      "tu": "permettes",
      "il/elle/on": "permette",
      "nous": "permettions",
      "vous": "permettiez",
      "ils/elles": "permettent"
    },
    "promettre": {
      "je": "promette",
      "tu": "promettes",
      "il/elle/on": "promette",
      "nous": "promettions",
      "vous": "promettiez",
      "ils/elles": "promettent"
    },
    "paraître": {
      "je": "paraisse",
      "tu": "paraisses",
      "il/elle/on": "paraisse",
      "nous": "paraissions",
      "vous": "paraissiez",
      "ils/elles": "paraissent"
    },
    "disparaître": {
      "je": "disparaisse",
      "tu": "disparaisses",
      "il/elle/on": "disparaisse",
      "nous": "disparaissions",
      "vous": "disparaissiez",
      "ils/elles": "disparaissent"
    },
    "reconnaître": {
      "je": "reconnaisse",
      "tu": "reconnaisses",
      "il/elle/on": "reconnaisse",
      "nous": "reconnaissions",
      "vous": "reconnaissiez",
      "ils/elles": "reconnaissent"
    },
    "battre": {
      "je": "batte",
      "tu": "battes",
      "il/elle/on": "batte",
      "nous": "battions",
      "vous": "battiez",
      "ils/elles": "battent"
    },
    "mentir": {
      "je": "mente",
      "tu": "mentes",
      "il/elle/on": "mente",
      "nous": "mentions",
      "vous": "mentiez",
      "ils/elles": "mentent"
    },
    "partager": {
      "je": "partage",
      "tu": "partages",
      "il/elle/on": "partage",
      "nous": "partagions",
      "vous": "partagiez",
      "ils/elles": "partagent"
    },
    "protéger": {
      "je": "protège",
      "tu": "protèges",
      "il/elle/on": "protège",
      "nous": "protégions",
      "vous": "protégiez",
      "ils/elles": "protègent"
    },
    "voyager": {
      "je": "voyage",
      "tu": "voyages",
      "il/elle/on": "voyage",
      "nous": "voyagions",
      "vous": "voyagiez",
      "ils/elles": "voyagent"
    },
    "étudier": {
      "je": "j'étudie",
      "tu": "étudies",
      "il/elle/on": "étudie",
      "nous": "étudiions",
      "vous": "étudiiez",
      "ils/elles": "étudient"
    },
    "réussir": {
      "je": "réussisse",
      "tu": "réussisses",
      "il/elle/on": "réussisse",
      "nous": "réussissions",
      "vous": "réussissiez",
      "ils/elles": "réussissent"
    },
    "grandir": {
      "je": "grandisse",
      "tu": "grandisses",
      "il/elle/on": "grandisse",
      "nous": "grandissions",
      "vous": "grandissiez",
      "ils/elles": "grandissent"
    },
    "vieillir": {
      "je": "vieillisse",
      "tu": "vieillisses",
      "il/elle/on": "vieillisse",
      "nous": "vieillissions",
      "vous": "vieillissiez",
      "ils/elles": "vieillissent"
    },
    "rougir": {
      "je": "rougisse",
      "tu": "rougisses",
      "il/elle/on": "rougisse",
      "nous": "rougissions",
      "vous": "rougissiez",
      "ils/elles": "rougissent"
    },
    "maigrir": {
      "je": "maigrisse",
      "tu": "maigrisses",
      "il/elle/on": "maigrisse",
      "nous": "maigrissions",
      "vous": "maigrissiez",
      "ils/elles": "maigrissent"
    },
    "grossir": {
      "je": "grossisse",
      "tu": "grossisses",
      "il/elle/on": "grossisse",
      "nous": "grossissions",
      "vous": "grossissiez",
      "ils/elles": "grossissent"
    },
    "obéir": {
      "je": "j'obéisse",
      "tu": "obéisses",
      "il/elle/on": "obéisse",
      "nous": "obéissions",
      "vous": "obéissiez",
      "ils/elles": "obéissent"
    },
    "désobéir": {
      "je": "désobéisse",
      "tu": "désobéisses",
      "il/elle/on": "désobéisse",
      "nous": "désobéissions",
      "vous": "désobéissiez",
      "ils/elles": "désobéissent"
    },
    "réfléchir": {
      "je": "réfléchisse",
      "tu": "réfléchisses",
      "il/elle/on": "réfléchisse",
      "nous": "réfléchissions",
      "vous": "réfléchissiez",
      "ils/elles": "réfléchissent"
    },
    "remplir": {
      "je": "remplisse",
      "tu": "remplisses",
      "il/elle/on": "remplisse",
      "nous": "remplissions",
      "vous": "remplissiez",
      "ils/elles": "remplissent"
    },
    "punir": {
      "je": "punisse",
      "tu": "punisses",
      "il/elle/on": "punisse",
      "nous": "punissions",
      "vous": "punissiez",
      "ils/elles": "punissent"
    },
    "guérir": {
      "je": "guérisse",
      "tu": "guérisses",
      "il/elle/on": "guérisse",
      "nous": "guérissions",
      "vous": "guérissiez",
      "ils/elles": "guérissent"
    },
    "bâtir": {
      "je": "bâtisse",
      "tu": "bâtisses",
      "il/elle/on": "bâtisse",
      "nous": "bâtissions",
      "vous": "bâtissiez",
      "ils/elles": "bâtissent"
    },
    "nourrir": {
      "je": "nourrisse",
      "tu": "nourrisses",
      "il/elle/on": "nourrisse",
      "nous": "nourrissions",
      "vous": "nourrissiez",
      "ils/elles": "nourrissent"
    },
    "avertir": {
      "je": "j'avertisse",
      "tu": "avertisses",
      "il/elle/on": "avertisse",
      "nous": "avertissions",
      "vous": "avertissiez",
      "ils/elles": "avertissent"
    },
    "agir": {
      "je": "j'agisse",
      "tu": "agisses",
      "il/elle/on": "agisse",
      "nous": "agissions",
      "vous": "agissiez",
      "ils/elles": "agissent"
    },
    "réagir": {
      "je": "réagisse",
      "tu": "réagisses",
      "il/elle/on": "réagisse",
      "nous": "réagissions",
      "vous": "réagissiez",
      "ils/elles": "réagissent"
    },
    "saisir": {
      "je": "saisisse",
      "tu": "saisisses",
      "il/elle/on": "saisisse",
      "nous": "saisissions",
      "vous": "saisissiez",
      "ils/elles": "saisissent"
    },
    "établir": {
      "je": "j'établisse",
      "tu": "établisses",
      "il/elle/on": "établisse",
      "nous": "établissions",
      "vous": "établissiez",
      "ils/elles": "établissent"
    },
    "investir": {
      "je": "j'investisse",
      "tu": "investisses",
      "il/elle/on": "investisse",
      "nous": "investissions",
      "vous": "investissiez",
      "ils/elles": "investissent"
    },
    "couvrir": {
      "je": "couvre",
      "tu": "couvres",
      "il/elle/on": "couvre",
      "nous": "couvrions",
      "vous": "couvriez",
      "ils/elles": "couvrent"
    },
    "découvrir": {
      "je": "découvre",
      "tu": "découvres",
      "il/elle/on": "découvre",
      "nous": "découvrions",
      "vous": "découvriez",
      "ils/elles": "découvrent"
    },
    "souffrir": {
      "je": "souffre",
      "tu": "souffres",
      "il/elle/on": "souffre",
      "nous": "souffrions",
      "vous": "souffriez",
      "ils/elles": "souffrent"
    },
    "cueillir": {
      "je": "cueille",
      "tu": "cueilles",
      "il/elle/on": "cueille",
      "nous": "cueillions",
      "vous": "cueilliez",
      "ils/elles": "cueillent"
    },
    "accueillir": {
      "je": "j'accueille",
      "tu": "accueilles",
      "il/elle/on": "accueille",
      "nous": "accueillions",
      "vous": "accueilliez",
      "ils/elles": "accueillent"
    },
    "assaillir": {
      "je": "j'assaille",
      "tu": "assailles",
      "il/elle/on": "assaille",
      "nous": "assaillions",
      "vous": "assailliez",
      "ils/elles": "assaillent"
    },
    "tressaillir": {
      "je": "tressaille",
      "tu": "tressailles",
      "il/elle/on": "tressaille",
      "nous": "tressaillions",
      "vous": "tressailliez",
      "ils/elles": "tressaillent"
    },
    "fuir": {
      "je": "fuie",
      "tu": "fuies",
      "il/elle/on": "fuie",
      "nous": "fuyions",
      "vous": "fuyiez",
      "ils/elles": "fuient"
    },
    "vêtir": {
      "je": "vête",
      "tu": "vêtes",
      "il/elle/on": "vête",
      "nous": "vêtions",
      "vous": "vêtiez",
      "ils/elles": "vêtent"
    },
    "acquérir": {
      "je": "j'acquière",
      "tu": "acquières",
      "il/elle/on": "acquière",
      "nous": "acquérions",
      "vous": "acquériez",
      "ils/elles": "acquièrent"
    },
    "conquérir": {
      "je": "conquière",
      "tu": "conquières",
      "il/elle/on": "conquière",
      "nous": "conquérions",
      "vous": "conquériez",
      "ils/elles": "conquièrent"
    },
    "bouillir": {
      "je": "bouille",
      "tu": "bouilles",
      "il/elle/on": "bouille",
      "nous": "bouillions",
      "vous": "bouilliez",
      "ils/elles": "bouillent"
    },
    "faillir": {
      "je": "faillisse",
      "tu": "faillisses",
      "il/elle/on": "faillisse",
      "nous": "faillissions",
      "vous": "faillissiez",
      "ils/elles": "faillissent"
    },
    "haïr": {
      "je": "haïsse",
      "tu": "haïsses",
      "il/elle/on": "haïsse",
      "nous": "haïssions",
      "vous": "haïssiez",
      "ils/elles": "haïssent"
    },
    "ouïr": {
      "je": "j'oie",
      "tu": "oies",
      "il/elle/on": "oie",
      "nous": "oyions",
      "vous": "oyiez",
      "ils/elles": "oient"
    },
    "réduire": {
      "je": "réduise",
      "tu": "réduises",
      "il/elle/on": "réduise",
      "nous": "réduisions",
      "vous": "réduisiez",
      "ils/elles": "réduisent"
    },
    "séduire": {
      "je": "séduise",
      "tu": "séduises",
      "il/elle/on": "séduise",
      "nous": "séduisions",
      "vous": "séduisiez",
      "ils/elles": "séduisent"
    },
    "introduire": {
      "je": "j'introduise",
      "tu": "introduises",
      "il/elle/on": "introduise",
      "nous": "introduisions",
      "vous": "introduisiez",
      "ils/elles": "introduisent"
    },
    "cuire": {
      "je": "cuise",
      "tu": "cuises",
      "il/elle/on": "cuise",
      "nous": "cuisions",
      "vous": "cuisiez",
      "ils/elles": "cuisent"
    },
    "nuire": {
      "je": "nuise",
      "tu": "nuises",
      "il/elle/on": "nuise",
      "nous": "nuisions",
      "vous": "nuisiez",
      "ils/elles": "nuisent"
    },
    "luire": {
      "je": "luise",
      "tu": "luises",
      "il/elle/on": "luise",
      "nous": "luisions",
      "vous": "luisiez",
      "ils/elles": "luisent"
    },
    "joindre": {
      "je": "joigne",
      "tu": "joignes",
      "il/elle/on": "joigne",
      "nous": "joignions",
      "vous": "joigniez",
      "ils/elles": "joignent"
    },
    "craindre": {
      "je": "craigne",
      "tu": "craignes",
      "il/elle/on": "craigne",
      "nous": "craignions",
      "vous": "craigniez",
      "ils/elles": "craignent"
    },
    "peindre": {
      "je": "peigne",
      "tu": "peignes",
      "il/elle/on": "peigne",
      "nous": "peignions",
      "vous": "peigniez",
      "ils/elles": "peignent"
    },
    "plaindre": {
      "je": "plaigne",
      "tu": "plaignes",
      "il/elle/on": "plaigne",
      "nous": "plaignions",
      "vous": "plaigniez",
      "ils/elles": "plaignent"
    },
    "éteindre": {
      "je": "j'éteigne",
      "tu": "éteignes",
      "il/elle/on": "éteigne",
      "nous": "éteignions",
      "vous": "éteigniez",
      "ils/elles": "éteignent"
    },
    "atteindre": {
      "je": "j'atteigne",
      "tu": "atteignes",
      "il/elle/on": "atteigne",
      "nous": "atteignions",
      "vous": "atteigniez",
      "ils/elles": "atteignent"
    },
    "restreindre": {
      "je": "restreigne",
      "tu": "restreignes",
      "il/elle/on": "restreigne",
      "nous": "restreignions",
      "vous": "restreigniez",
      "ils/elles": "restreignent"
    },
    "feindre": {
      "je": "feigne",
      "tu": "feignes",
      "il/elle/on": "feigne",
      "nous": "feignions",
      "vous": "feigniez",
      "ils/elles": "feignent"
    },
    "geindre": {
      "je": "geigne",
      "tu": "geignes",
      "il/elle/on": "geigne",
      "nous": "geignions",
      "vous": "geigniez",
      "ils/elles": "geignent"
    },
    "contraindre": {
      "je": "contraigne",
      "tu": "contraignes",
      "il/elle/on": "contraigne",
      "nous": "contraignions",
      "vous": "contraigniez",
      "ils/elles": "contraignent"
    },
    "résoudre": {
      "je": "résolve",
      "tu": "résolves",
      "il/elle/on": "résolve",
      "nous": "résolvions",
      "vous": "résolviez",
      "ils/elles": "résolvent"
    },
    "absoudre": {
      "je": "j'absolve",
      "tu": "absolves",
      "il/elle/on": "absolve",
      "nous": "absolvions",
      "vous": "absolviez",
      "ils/elles": "absolvent"
    },
    "dissoudre": {
      "je": "dissolve",
      "tu": "dissolves",
      "il/elle/on": "dissolve",
      "nous": "dissolvions",
      "vous": "dissolviez",
      "ils/elles": "dissolvent"
    },
    "coudre": {
      "je": "couse",
      "tu": "couses",
      "il/elle/on": "couse",
      "nous": "cousions",
      "vous": "cousiez",
      "ils/elles": "cousent"
    },
    "moudre": {
      "je": "moule",
      "tu": "moules",
      "il/elle/on": "moule",
      "nous": "moulions",
      "vous": "mouliez",
      "ils/elles": "moulent"
    },
    "poursuivre": {
      "je": "poursuive",
      "tu": "poursuives",
      "il/elle/on": "poursuive",
      "nous": "poursuivions",
      "vous": "poursuiviez",
      "ils/elles": "poursuivent"
    },
    "survivre": {
      "je": "survive",
      "tu": "survives",
      "il/elle/on": "survive",
      "nous": "survivions",
      "vous": "surviviez",
      "ils/elles": "survivent"
    },
    "revivre": {
      "je": "revive",
      "tu": "revives",
      "il/elle/on": "revive",
      "nous": "revivions",
      "vous": "reviviez",
      "ils/elles": "revivent"
    },
    "conclure": {
      "je": "conclue",
      "tu": "conclues",
      "il/elle/on": "conclue",
      "nous": "concluions",
      "vous": "concluiez",
      "ils/elles": "concluent"
    },
    "exclure": {
      "je": "j'exclue",
      "tu": "exclues",
      "il/elle/on": "exclue",
      "nous": "excluions",
      "vous": "excluiez",
      "ils/elles": "excluent"
    },
    "inclure": {
      "je": "j'inclue",
      "tu": "inclues",
      "il/elle/on": "inclue",
      "nous": "incluions",
      "vous": "incluiez",
      "ils/elles": "incluent"
    },
    "élire": {
      "je": "j'élise",
      "tu": "élises",
      "il/elle/on": "élise",
      "nous": "élisions",
      "vous": "élisiez",
      "ils/elles": "élisent"
    },
    "relire": {
      "je": "relise",
      "tu": "relises",
      "il/elle/on": "relise",
      "nous": "relisions",
      "vous": "relisiez",
      "ils/elles": "relisent"
    },
    "interdire": {
      "je": "j'interdise",
      "tu": "interdises",
      "il/elle/on": "interdise",
      "nous": "interdisions",
      "vous": "interdisiez",
      "ils/elles": "interdisent"
    },
    "prédire": {
      "je": "prédise",
      "tu": "prédises",
      "il/elle/on": "prédise",
      "nous": "prédisions",
      "vous": "prédisiez",
      "ils/elles": "prédisent"
    },
    "médire": {
      "je": "médise",
      "tu": "médises",
      "il/elle/on": "médise",
      "nous": "médisions",
      "vous": "médisiez",
      "ils/elles": "médisent"
    },
    "contredire": {
      "je": "contredise",
      "tu": "contredises",
      "il/elle/on": "contredise",
      "nous": "contredisions",
      "vous": "contredisiez",
      "ils/elles": "contredisent"
    },
    "suffire": {
      "je": "suffise",
      "tu": "suffises",
      "il/elle/on": "suffise",
      "nous": "suffisions",
      "vous": "suffisiez",
      "ils/elles": "suffisent"
    },
    "circoncire": {
      "je": "circoncise",
      "tu": "circoncises",
      "il/elle/on": "circoncise",
      "nous": "circoncisions",
      "vous": "circoncisiez",
      "ils/elles": "circoncisent"
    },
    "déplaire": {
      "je": "déplaise",
      "tu": "déplaises",
      "il/elle/on": "déplaise",
      "nous": "déplaisions",
      "vous": "déplaisiez",
      "ils/elles": "déplaisent"
    },
    "taire": {
      "je": "taise",
      "tu": "taises",
      "il/elle/on": "taise",
      "nous": "taisions",
      "vous": "taisiez",
      "ils/elles": "taisent"
    },
    "apparaître": {
      "je": "j'apparaisse",
      "tu": "apparaisses",
      "il/elle/on": "apparaisse",
      "nous": "apparaissions",
      "vous": "apparaissiez",
      "ils/elles": "apparaissent"
    },
    "paître": {
      "je": "paisse",
      "tu": "paisses",
      "il/elle/on": "paisse",
      "nous": "paissions",
      "vous": "paissiez",
      "ils/elles": "paissent"
    },
    "combattre": {
      "je": "combatte",
      "tu": "combattes",
      "il/elle/on": "combatte",
      "nous": "combattions",
      "vous": "combattiez",
      "ils/elles": "combattent"
    },
    "abattre": {
      "je": "j'abatte",
      "tu": "abattes",
      "il/elle/on": "abatte",
      "nous": "abattions",
      "vous": "abattiez",
      "ils/elles": "abattent"
    },
    "débattre": {
      "je": "débatte",
      "tu": "débattes",
      "il/elle/on": "débatte",
      "nous": "débattions",
      "vous": "débattiez",
      "ils/elles": "débattent"
    },
    "admettre": {
      "je": "j'admette",
      "tu": "admettes",
      "il/elle/on": "admette",
      "nous": "admettions",
      "vous": "admettiez",
      "ils/elles": "admettent"
    },
    "commettre": {
      "je": "commette",
      "tu": "commettes",
      "il/elle/on": "commette",
      "nous": "commettions",
      "vous": "commettiez",
      "ils/elles": "commettent"
    },
    "compromettre": {
      "je": "compromette",
      "tu": "compromettes",
      "il/elle/on": "compromette",
      "nous": "compromettions",
      "vous": "compromettiez",
      "ils/elles": "compromettent"
    },
    "remettre": {
      "je": "remette",
      "tu": "remettes",
      "il/elle/on": "remette",
      "nous": "remettions",
      "vous": "remettiez",
      "ils/elles": "remettent"
    },
    "soumettre": {
      "je": "soumette",
      "tu": "soumettes",
      "il/elle/on": "soumette",
      "nous": "soumettions",
      "vous": "soumettiez",
      "ils/elles": "soumettent"
    },
    "transmettre": {
      "je": "transmette",
      "tu": "transmettes",
      "il/elle/on": "transmette",
      "nous": "transmettions",
      "vous": "transmettiez",
      "ils/elles": "transmettent"
    },
    "entreprendre": {
      "je": "j'entreprenne",
      "tu": "entreprennes",
      "il/elle/on": "entreprenne",
      "nous": "entreprenions",
      "vous": "entrepreniez",
      "ils/elles": "entreprennent"
    },
    "reprendre": {
      "je": "reprenne",
      "tu": "reprennes",
      "il/elle/on": "reprenne",
      "nous": "reprenions",
      "vous": "repreniez",
      "ils/elles": "reprennent"
    },
    "surprendre": {
      "je": "surprenne",
      "tu": "surprennes",
      "il/elle/on": "surprenne",
      "nous": "surprenions",
      "vous": "surpreniez",
      "ils/elles": "surprennent"
    },
    "rompre": {
      "je": "rompe",
      "tu": "rompes",
      "il/elle/on": "rompe",
      "nous": "rompions",
      "vous": "rompiez",
      "ils/elles": "rompent"
    },
    "corrompre": {
      "je": "corrompe",
      "tu": "corrompes",
      "il/elle/on": "corrompe",
      "nous": "corrompions",
      "vous": "corrompiez",
      "ils/elles": "corrompent"
    },
    "interrompre": {
      "je": "j'interrompe",
      "tu": "interrompes",
      "il/elle/on": "interrompe",
      "nous": "interrompions",
      "vous": "interrompiez",
      "ils/elles": "interrompent"
    },
    "vaincre": {
      "je": "vainque",
      "tu": "vainques",
      "il/elle/on": "vainque",
      "nous": "vainquions",
      "vous": "vainquiez",
      "ils/elles": "vainquent"
    },
    "convaincre": {
      "je": "convainque",
      "tu": "convainques",
      "il/elle/on": "convainque",
      "nous": "convainquions",
      "vous": "convainquiez",
      "ils/elles": "convainquent"
    },
    "amener": {
      "je": "j'amène",
      "tu": "amènes",
      "il/elle/on": "amène",
      "nous": "amenions",
      "vous": "ameniez",
      "ils/elles": "amènent"
    },
    "emmener": {
      "je": "j'emmène",
      "tu": "emmènes",
      "il/elle/on": "emmène",
      "nous": "emmenions",
      "vous": "emmeniez",
      "ils/elles": "emmènent"
    },
    "enlever": {
      "je": "j'enlève",
      "tu": "enlèves",
      "il/elle/on": "enlève",
      "nous": "enlevions",
      "vous": "enleviez",
      "ils/elles": "enlèvent"
    },
    "geler": {
      "je": "gèle",
      "tu": "gèles",
      "il/elle/on": "gèle",
      "nous": "gelions",
      "vous": "geliez",
      "ils/elles": "gèlent"
    },
    "harceler": {
      "je": "harcelle",
      "tu": "harcelles",
      "il/elle/on": "harcelle",
      "nous": "harcelions",
      "vous": "harceliez",
      "ils/elles": "harcellent"
    },
    "lever": {
      "je": "lève",
      "tu": "lèves",
      "il/elle/on": "lève",
      "nous": "levions",
      "vous": "leviez",
      "ils/elles": "lèvent"
    },
    "mener": {
      "je": "mène",
      "tu": "mènes",
      "il/elle/on": "mène",
      "nous": "menions",
      "vous": "meniez",
      "ils/elles": "mènent"
    },
    "peler": {
      "je": "pèle",
      "tu": "pèles",
      "il/elle/on": "pèle",
      "nous": "pelions",
      "vous": "peliez",
      "ils/elles": "pèlent"
    },
    "peser": {
      "je": "pèse",
      "tu": "pèses",
      "il/elle/on": "pèse",
      "nous": "pesions",
      "vous": "pesiez",
      "ils/elles": "pèsent"
    },
    "promener": {
      "je": "promène",
      "tu": "promènes",
      "il/elle/on": "promène",
      "nous": "promenions",
      "vous": "promeniez",
      "ils/elles": "promènent"
    },
    "semer": {
      "je": "sème",
      "tu": "sèmes",
      "il/elle/on": "sème",
      "nous": "semions",
      "vous": "semiez",
      "ils/elles": "sèment"
    },
    "jeter": {
      "je": "jette",
      "tu": "jettes",
      "il/elle/on": "jette",
      "nous": "jetions",
      "vous": "jetiez",
      "ils/elles": "jettent"
    },
    "épeler": {
      "je": "j'épelle",
      "tu": "épelles",
      "il/elle/on": "épelle",
      "nous": "épelions",
      "vous": "épeliez",
      "ils/elles": "épellent"
    },
    "feuilleter": {
      "je": "feuillette",
      "tu": "feuillettes",
      "il/elle/on": "feuillette",
      "nous": "feuilletions",
      "vous": "feuilletiez",
      "ils/elles": "feuillettent"
    },
    "projeter": {
      "je": "projette",
      "tu": "projettes",
      "il/elle/on": "projette",
      "nous": "projetions",
      "vous": "projetiez",
      "ils/elles": "projettent"
    },
    "rejeter": {
      "je": "rejette",
      "tu": "rejettes",
      "il/elle/on": "rejette",
      "nous": "rejetions",
      "vous": "rejetiez",
      "ils/elles": "rejettent"
    },
    "renouveler": {
      "je": "renouvelle",
      "tu": "renouvelles",
      "il/elle/on": "renouvelle",
      "nous": "renouvelions",
      "vous": "renouveliez",
      "ils/elles": "renouvellent"
    },
    "céder": {
      "je": "cède",
      "tu": "cèdes",
      "il/elle/on": "cède",
      "nous": "cédions",
      "vous": "cédiez",
      "ils/elles": "cèdent"
    },
    "célébrer": {
      "je": "célèbre",
      "tu": "célèbres",
      "il/elle/on": "célèbre",
      "nous": "célébrions",
      "vous": "célébriez",
      "ils/elles": "célèbrent"
    },
    "compléter": {
      "je": "complète",
      "tu": "complètes",
      "il/elle/on": "complète",
      "nous": "complétions",
      "vous": "complétiez",
      "ils/elles": "complètent"
    },
    "considérer": {
      "je": "considère",
      "tu": "considères",
      "il/elle/on": "considère",
      "nous": "considérions",
      "vous": "considériez",
      "ils/elles": "considèrent"
    },
    "différer": {
      "je": "diffère",
      "tu": "diffères",
      "il/elle/on": "diffère",
      "nous": "différions",
      "vous": "différiez",
      "ils/elles": "diffèrent"
    },
    "exagérer": {
      "je": "j'exagère",
      "tu": "exagères",
      "il/elle/on": "exagère",
      "nous": "exagérions",
      "vous": "exagériez",
      "ils/elles": "exagèrent"
    },
    "gérer": {
      "je": "gère",
      "tu": "gères",
      "il/elle/on": "gère",
      "nous": "gérions",
      "vous": "gériez",
      "ils/elles": "gèrent"
    },
    "inquiéter": {
      "je": "j'inquiète",
      "tu": "inquiètes",
      "il/elle/on": "inquiète",
      "nous": "inquiétions",
      "vous": "inquiétiez",
      "ils/elles": "inquiètent"
    },
    "modérer": {
      "je": "modère",
      "tu": "modères",
      "il/elle/on": "modère",
      "nous": "modérions",
      "vous": "modériez",
      "ils/elles": "modèrent"
    },
    "pénétrer": {
      "je": "pénètre",
      "tu": "pénètres",
      "il/elle/on": "pénètre",
      "nous": "pénétrions",
      "vous": "pénétriez",
      "ils/elles": "pénètrent"
    },
    "posséder": {
      "je": "possède",
      "tu": "possèdes",
      "il/elle/on": "possède",
      "nous": "possédions",
      "vous": "possédiez",
      "ils/elles": "possèdent"
    },
    "préférer": {
      "je": "préfère",
      "tu": "préfères",
      "il/elle/on": "préfère",
      "nous": "préférions",
      "vous": "préfériez",
      "ils/elles": "préfèrent"
    },
    "refléter": {
      "je": "reflète",
      "tu": "reflètes",
      "il/elle/on": "reflète",
      "nous": "reflétions",
      "vous": "reflétiez",
      "ils/elles": "reflètent"
    },
    "répéter": {
      "je": "répète",
      "tu": "répètes",
      "il/elle/on": "répète",
      "nous": "répétions",
      "vous": "répétiez",
      "ils/elles": "répètent"
    },
    "révéler": {
      "je": "révèle",
      "tu": "révèles",
      "il/elle/on": "révèle",
      "nous": "révélions",
      "vous": "révéliez",
      "ils/elles": "révèlent"
    },
    "suggérer": {
      "je": "suggère",
      "tu": "suggères",
      "il/elle/on": "suggère",
      "nous": "suggérions",
      "vous": "suggériez",
      "ils/elles": "suggèrent"
    },
    "zébrer": {
      "je": "zèbre",
      "tu": "zèbres",
      "il/elle/on": "zèbre",
      "nous": "zébrions",
      "vous": "zébriez",
      "ils/elles": "zèbrent"
    },
    "nettoyer": {
      "je": "nettoie",
      "tu": "nettoies",
      "il/elle/on": "nettoie",
      "nous": "nettoyions",
      "vous": "nettoyiez",
      "ils/elles": "nettoient"
    },
    "appuyer": {
      "je": "j'appuie",
      "tu": "appuies",
      "il/elle/on": "appuie",
      "nous": "appuyions",
      "vous": "appuyiez",
      "ils/elles": "appuient"
    },
    "ennuyer": {
      "je": "j'ennuie",
      "tu": "ennuies",
      "il/elle/on": "ennuie",
      "nous": "ennuyions",
      "vous": "ennuyiez",
      "ils/elles": "ennuient"
    },
    "essuyer": {
      "je": "j'essuie",
      "tu": "essuies",
      "il/elle/on": "essuie",
      "nous": "essuyions",
      "vous": "essuyiez",
      "ils/elles": "essuient"
    },
    "balayer": {
      "je": "balaie",
      "tu": "balaies",
      "il/elle/on": "balaie",
      "nous": "balayions",
      "vous": "balayiez",
      "ils/elles": "balaient"
    },
    "effrayer": {
      "je": "j'effraie",
      "tu": "effraies",
      "il/elle/on": "effraie",
      "nous": "effrayions",
      "vous": "effrayiez",
      "ils/elles": "effraient"
    },
    "aboyer": {
      "je": "j'aboie",
      "tu": "aboies",
      "il/elle/on": "aboie",
      "nous": "aboyions",
      "vous": "aboyiez",
      "ils/elles": "aboient"
    },
    "noyer": {
      "je": "noie",
      "tu": "noies",
      "il/elle/on": "noie",
      "nous": "noyions",
      "vous": "noyiez",
      "ils/elles": "noient"
    },
    "tutoyer": {
      "je": "tutoie",
      "tu": "tutoies",
      "il/elle/on": "tutoie",
      "nous": "tutoyions",
      "vous": "tutoyiez",
      "ils/elles": "tutoient"
    },
    "vouvoyer": {
      "je": "vouvoie",
      "tu": "vouvoies",
      "il/elle/on": "vouvoie",
      "nous": "vouvoyions",
      "vous": "vouvoyiez",
      "ils/elles": "vouvoient"
    },
    "annoncer": {
      "je": "j'annonce",
      "tu": "annonces",
      "il/elle/on": "annonce",
      "nous": "annoncions",
      "vous": "annonciez",
      "ils/elles": "annoncent"
    },
    "avancer": {
      "je": "j'avance",
      "tu": "avances",
      "il/elle/on": "avance",
      "nous": "avancions",
      "vous": "avanciez",
      "ils/elles": "avancent"
    },
    "dénoncer": {
      "je": "dénonce",
      "tu": "dénonces",
      "il/elle/on": "dénonce",
      "nous": "dénoncions",
      "vous": "dénonciez",
      "ils/elles": "dénoncent"
    },
    "divorcer": {
      "je": "divorce",
      "tu": "divorces",
      "il/elle/on": "divorce",
      "nous": "divorcions",
      "vous": "divorciez",
      "ils/elles": "divorcent"
    },
    "effacer": {
      "je": "j'efface",
      "tu": "effaces",
      "il/elle/on": "efface",
      "nous": "effacions",
      "vous": "effaciez",
      "ils/elles": "effacent"
    },
    "lancer": {
      "je": "lance",
      "tu": "lances",
      "il/elle/on": "lance",
      "nous": "lancions",
      "vous": "lanciez",
      "ils/elles": "lancent"
    },
    "menacer": {
      "je": "menace",
      "tu": "menaces",
      "il/elle/on": "menace",
      "nous": "menacions",
      "vous": "menaciez",
      "ils/elles": "menacent"
    },
    "placer": {
      "je": "place",
      "tu": "places",
      "il/elle/on": "place",
      "nous": "placions",
      "vous": "placiez",
      "ils/elles": "placent"
    },
    "prononcer": {
      "je": "prononce",
      "tu": "prononces",
      "il/elle/on": "prononce",
      "nous": "prononcions",
      "vous": "prononciez",
      "ils/elles": "prononcent"
    },
    "remplacer": {
      "je": "remplace",
      "tu": "remplaces",
      "il/elle/on": "remplace",
      "nous": "remplacions",
      "vous": "remplaciez",
      "ils/elles": "remplacent"
    },
    "renoncer": {
      "je": "renonce",
      "tu": "renonces",
      "il/elle/on": "renonce",
      "nous": "renoncions",
      "vous": "renonciez",
      "ils/elles": "renoncent"
    },
    "arranger": {
      "je": "j'arrange",
      "tu": "arranges",
      "il/elle/on": "arrange",
      "nous": "arrangions",
      "vous": "arrangiez",
      "ils/elles": "arrangent"
    },
    "bouger": {
      "je": "bouge",
      "tu": "bouges",
      "il/elle/on": "bouge",
      "nous": "bougions",
      "vous": "bougiez",
      "ils/elles": "bougent"
    },
    "corriger": {
      "je": "corrige",
      "tu": "corriges",
      "il/elle/on": "corrige",
      "nous": "corrigions",
      "vous": "corrigiez",
      "ils/elles": "corrigent"
    },
    "décourager": {
      "je": "décourage",
      "tu": "décourages",
      "il/elle/on": "décourage",
      "nous": "découragions",
      "vous": "découragiez",
      "ils/elles": "découragent"
    },
    "déménager": {
      "je": "déménage",
      "tu": "déménages",
      "il/elle/on": "déménage",
      "nous": "déménagions",
      "vous": "déménagiez",
      "ils/elles": "déménagent"
    },
    "diriger": {
      "je": "dirige",
      "tu": "diriges",
      "il/elle/on": "dirige",
      "nous": "dirigions",
      "vous": "dirigiez",
      "ils/elles": "dirigent"
    },
    "encourager": {
      "je": "j'encourage",
      "tu": "encourages",
      "il/elle/on": "encourage",
      "nous": "encouragions",
      "vous": "encouragiez",
      "ils/elles": "encouragent"
    },
    "engager": {
      "je": "j'engage",
      "tu": "engages",
      "il/elle/on": "engage",
      "nous": "engagions",
      "vous": "engagiez",
      "ils/elles": "engagent"
    },
    "exiger": {
      "je": "j'exige",
      "tu": "exiges",
      "il/elle/on": "exige",
      "nous": "exigions",
      "vous": "exigiez",
      "ils/elles": "exigent"
    },
    "juger": {
      "je": "juge",
      "tu": "juges",
      "il/elle/on": "juge",
      "nous": "jugions",
      "vous": "jugiez",
      "ils/elles": "jugent"
    },
    "loger": {
      "je": "loge",
      "tu": "loges",
      "il/elle/on": "loge",
      "nous": "logions",
      "vous": "logiez",
      "ils/elles": "logent"
    },
    "mélanger": {
      "je": "mélange",
      "tu": "mélanges",
      "il/elle/on": "mélange",
      "nous": "mélangions",
      "vous": "mélangiez",
      "ils/elles": "mélangent"
    },
    "nager": {
      "je": "nage",
      "tu": "nages",
      "il/elle/on": "nage",
      "nous": "nagions",
      "vous": "nagiez",
      "ils/elles": "nagent"
    },
    "obliger": {
      "je": "j'oblige",
      "tu": "obliges",
      "il/elle/on": "oblige",
      "nous": "obligions",
      "vous": "obligiez",
      "ils/elles": "obligent"
    },
    "plonger": {
      "je": "plonge",
      "tu": "plonges",
      "il/elle/on": "plonge",
      "nous": "plongions",
      "vous": "plongiez",
      "ils/elles": "plongent"
    },
    "ranger": {
      "je": "range",
      "tu": "ranges",
      "il/elle/on": "range",
      "nous": "rangions",
      "vous": "rangiez",
      "ils/elles": "rangent"
    },
    "rédiger": {
      "je": "rédige",
      "tu": "rédiges",
      "il/elle/on": "rédige",
      "nous": "rédigions",
      "vous": "rédigiez",
      "ils/elles": "rédigent"
    },
    "ajouter": {
      "je": "j'ajoute",
      "tu": "ajoutes",
      "il/elle/on": "ajoute",
      "nous": "ajoutions",
      "vous": "ajoutiez",
      "ils/elles": "ajoutent"
    },
    "durer": {
      "je": "dure",
      "tu": "dures",
      "il/elle/on": "dure",
      "nous": "durions",
      "vous": "duriez",
      "ils/elles": "durent"
    },
    "écouter": {
      "je": "j'écoute",
      "tu": "écoutes",
      "il/elle/on": "écoute",
      "nous": "écoutions",
      "vous": "écoutiez",
      "ils/elles": "écoutent"
    },
    "emprunter": {
      "je": "j'emprunte",
      "tu": "empruntes",
      "il/elle/on": "emprunte",
      "nous": "empruntions",
      "vous": "empruntiez",
      "ils/elles": "empruntent"
    },
    "fermer": {
      "je": "ferme",
      "tu": "fermes",
      "il/elle/on": "ferme",
      "nous": "fermions",
      "vous": "fermiez",
      "ils/elles": "ferment"
    },
    "garder": {
      "je": "garde",
      "tu": "gardes",
      "il/elle/on": "garde",
      "nous": "gardions",
      "vous": "gardiez",
      "ils/elles": "gardent"
    },
    "laver": {
      "je": "lave",
      "tu": "laves",
      "il/elle/on": "lave",
      "nous": "lavions",
      "vous": "laviez",
      "ils/elles": "lavent"
    },
    "pardonner": {
      "je": "pardonne",
      "tu": "pardonnes",
      "il/elle/on": "pardonne",
      "nous": "pardonnions",
      "vous": "pardonniez",
      "ils/elles": "pardonnent"
    },
    "présenter": {
      "je": "présente",
      "tu": "présentes",
      "il/elle/on": "présente",
      "nous": "présentions",
      "vous": "présentiez",
      "ils/elles": "présentent"
    },
    "prêter": {
      "je": "prête",
      "tu": "prêtes",
      "il/elle/on": "prête",
      "nous": "prêtions",
      "vous": "prêtiez",
      "ils/elles": "prêtent"
    },
    "quitter": {
      "je": "quitte",
      "tu": "quittes",
      "il/elle/on": "quitte",
      "nous": "quittions",
      "vous": "quittiez",
      "ils/elles": "quittent"
    },
    "refuser": {
      "je": "refuse",
      "tu": "refuses",
      "il/elle/on": "refuse",
      "nous": "refusions",
      "vous": "refusiez",
      "ils/elles": "refusent"
    },
    "rencontrer": {
      "je": "rencontre",
      "tu": "rencontres",
      "il/elle/on": "rencontre",
      "nous": "rencontrions",
      "vous": "rencontriez",
      "ils/elles": "rencontrent"
    },
    "reposer": {
      "je": "repose",
      "tu": "reposes",
      "il/elle/on": "repose",
      "nous": "reposions",
      "vous": "reposiez",
      "ils/elles": "reposent"
    },
    "rêver": {
      "je": "rêve",
      "tu": "rêves",
      "il/elle/on": "rêve",
      "nous": "rêvions",
      "vous": "rêviez",
      "ils/elles": "rêvent"
    },
    "saluer": {
      "je": "salue",
      "tu": "salues",
      "il/elle/on": "salue",
      "nous": "saluions",
      "vous": "saluiez",
      "ils/elles": "saluent"
    },
    "sauter": {
      "je": "saute",
      "tu": "sautes",
      "il/elle/on": "saute",
      "nous": "sautions",
      "vous": "sautiez",
      "ils/elles": "sautent"
    },
    "sembler": {
      "je": "semble",
      "tu": "sembles",
      "il/elle/on": "semble",
      "nous": "semblions",
      "vous": "sembliez",
      "ils/elles": "semblent"
    },
    "signer": {
      "je": "signe",
      "tu": "signes",
      "il/elle/on": "signe",
      "nous": "signions",
      "vous": "signiez",
      "ils/elles": "signent"
    },
    "téléphoner": {
      "je": "téléphone",
      "tu": "téléphones",
      "il/elle/on": "téléphone",
      "nous": "téléphonions",
      "vous": "téléphoniez",
      "ils/elles": "téléphonent"
    },
    "terminer": {
      "je": "termine",
      "tu": "termines",
      "il/elle/on": "termine",
      "nous": "terminions",
      "vous": "terminiez",
      "ils/elles": "terminent"
    },
    "traverser": {
      "je": "traverse",
      "tu": "traverses",
      "il/elle/on": "traverse",
      "nous": "traversions",
      "vous": "traversiez",
      "ils/elles": "traversent"
    },
    "utiliser": {
      "je": "j'utilise",
      "tu": "utilises",
      "il/elle/on": "utilise",
      "nous": "utilisions",
      "vous": "utilisiez",
      "ils/elles": "utilisent"
    },
    "visiter": {
      "je": "visite",
      "tu": "visites",
      "il/elle/on": "visite",
      "nous": "visitions",
      "vous": "visitiez",
      "ils/elles": "visitent"
    },
    "voler": {
      "je": "vole",
      "tu": "voles",
      "il/elle/on": "vole",
      "nous": "volions",
      "vous": "voliez",
      "ils/elles": "volent"
    },
    "accepter": {
      "je": "j'accepte",
      "tu": "acceptes",
      "il/elle/on": "accepte",
      "nous": "acceptions",
      "vous": "acceptiez",
      "ils/elles": "acceptent"
    },
    "adorer": {
      "je": "j'adore",
      "tu": "adores",
      "il/elle/on": "adore",
      "nous": "adorions",
      "vous": "adoriez",
      "ils/elles": "adorent"
    },
    "apporter": {
      "je": "j'apporte",
      "tu": "apportes",
      "il/elle/on": "apporte",
      "nous": "apportions",
      "vous": "apportiez",
      "ils/elles": "apportent"
    },
    "arrêter": {
      "je": "j'arrête",
      "tu": "arrêtes",
      "il/elle/on": "arrête",
      "nous": "arrêtions",
      "vous": "arrêtiez",
      "ils/elles": "arrêtent"
    },
    "commander": {
      "je": "commande",
      "tu": "commandes",
      "il/elle/on": "commande",
      "nous": "commandions",
      "vous": "commandiez",
      "ils/elles": "commandent"
    },
    "compter": {
      "je": "compte",
      "tu": "comptes",
      "il/elle/on": "compte",
      "nous": "comptions",
      "vous": "comptiez",
      "ils/elles": "comptent"
    },
    "conseiller": {
      "je": "conseille",
      "tu": "conseilles",
      "il/elle/on": "conseille",
      "nous": "conseillions",
      "vous": "conseilliez",
      "ils/elles": "conseillent"
    },
    "continuer": {
      "je": "continue",
      "tu": "continues",
      "il/elle/on": "continue",
      "nous": "continuions",
      "vous": "continuiez",
      "ils/elles": "continuent"
    },
    "coûter": {
      "je": "coûte",
      "tu": "coûtes",
      "il/elle/on": "coûte",
      "nous": "coûtions",
      "vous": "coûtiez",
      "ils/elles": "coûtent"
    },
    "crier": {
      "je": "crie",
      "tu": "cries",
      "il/elle/on": "crie",
      "nous": "criions",
      "vous": "criiez",
      "ils/elles": "crient"
    },
    "déjeuner": {
      "je": "déjeune",
      "tu": "déjeunes",
      "il/elle/on": "déjeune",
      "nous": "déjeunions",
      "vous": "déjeuniez",
      "ils/elles": "déjeunent"
    },
    "désirer": {
      "je": "désire",
      "tu": "désires",
      "il/elle/on": "désire",
      "nous": "désirions",
      "vous": "désiriez",
      "ils/elles": "désirent"
    },
    "détester": {
      "je": "déteste",
      "tu": "détestes",
      "il/elle/on": "déteste",
      "nous": "détestions",
      "vous": "détestiez",
      "ils/elles": "détestent"
    },
    "dessiner": {
      "je": "dessine",
      "tu": "dessines",
      "il/elle/on": "dessine",
      "nous": "dessinions",
      "vous": "dessiniez",
      "ils/elles": "dessinent"
    },
    "dîner": {
      "je": "dîne",
      "tu": "dînes",
      "il/elle/on": "dîne",
      "nous": "dînions",
      "vous": "dîniez",
      "ils/elles": "dînent"
    },
    "discuter": {
      "je": "discute",
      "tu": "discutes",
      "il/elle/on": "discute",
      "nous": "discutions",
      "vous": "discutiez",
      "ils/elles": "discutent"
    },
    "éviter": {
      "je": "j'évite",
      "tu": "évites",
      "il/elle/on": "évite",
      "nous": "évitions",
      "vous": "évitiez",
      "ils/elles": "évitent"
    },
    "excuser": {
      "je": "j'excuse",
      "tu": "excuses",
      "il/elle/on": "excuse",
      "nous": "excusions",
      "vous": "excusiez",
      "ils/elles": "excusent"
    },
    "fumer": {
      "je": "fume",
      "tu": "fumes",
      "il/elle/on": "fume",
      "nous": "fumions",
      "vous": "fumiez",
      "ils/elles": "fument"
    },
    "habiter": {
      "je": "habite",
      "tu": "habites",
      "il/elle/on": "habite",
      "nous": "habitions",
      "vous": "habitiez",
      "ils/elles": "habitent"
    },
    "imaginer": {
      "je": "j'imagine",
      "tu": "imagines",
      "il/elle/on": "imagine",
      "nous": "imaginions",
      "vous": "imaginiez",
      "ils/elles": "imaginent"
    },
    "importer": {
      "je": "j'importe",
      "tu": "importes",
      "il/elle/on": "importe",
      "nous": "importions",
      "vous": "importiez",
      "ils/elles": "importent"
    },
    "inviter": {
      "je": "j'invite",
      "tu": "invites",
      "il/elle/on": "invite",
      "nous": "invitions",
      "vous": "invitiez",
      "ils/elles": "invitent"
    },
    "noter": {
      "je": "note",
      "tu": "notes",
      "il/elle/on": "note",
      "nous": "notions",
      "vous": "notiez",
      "ils/elles": "notent"
    },
    "organiser": {
      "je": "j'organise",
      "tu": "organises",
      "il/elle/on": "organise",
      "nous": "organisions",
      "vous": "organisiez",
      "ils/elles": "organisent"
    },
    "parier": {
      "je": "parie",
      "tu": "paries",
      "il/elle/on": "parie",
      "nous": "pariions",
      "vous": "pariiez",
      "ils/elles": "parient"
    },
    "pleurer": {
      "je": "pleure",
      "tu": "pleures",
      "il/elle/on": "pleure",
      "nous": "pleurions",
      "vous": "pleuriez",
      "ils/elles": "pleurent"
    },
    "poser": {
      "je": "pose",
      "tu": "poses",
      "il/elle/on": "pose",
      "nous": "posions",
      "vous": "posiez",
      "ils/elles": "posent"
    },
    "pousser": {
      "je": "pousse",
      "tu": "pousses",
      "il/elle/on": "pousse",
      "nous": "poussions",
      "vous": "poussiez",
      "ils/elles": "poussent"
    },
    "prier": {
      "je": "prie",
      "tu": "pries",
      "il/elle/on": "prie",
      "nous": "priions",
      "vous": "priiez",
      "ils/elles": "prient"
    },
    "rappeler": {
      "je": "rappelle",
      "tu": "rappelles",
      "il/elle/on": "rappelle",
      "nous": "rappelions",
      "vous": "rappeliez",
      "ils/elles": "rappellent"
    },
    "remercier": {
      "je": "remercie",
      "tu": "remercies",
      "il/elle/on": "remercie",
      "nous": "remerciions",
      "vous": "remerciiez",
      "ils/elles": "remercient"
    },
    "respecter": {
      "je": "respecte",
      "tu": "respectes",
      "il/elle/on": "respecte",
      "nous": "respections",
      "vous": "respectiez",
      "ils/elles": "respectent"
    },
    "retourner": {
      "je": "retourne",
      "tu": "retournes",
      "il/elle/on": "retourne",
      "nous": "retournions",
      "vous": "retourniez",
      "ils/elles": "retournent"
    },
    "retrouver": {
      "je": "retrouve",
      "tu": "retrouves",
      "il/elle/on": "retrouve",
      "nous": "retrouvions",
      "vous": "retrouviez",
      "ils/elles": "retrouvent"
    },
    "réveiller": {
      "je": "réveille",
      "tu": "réveilles",
      "il/elle/on": "réveille",
      "nous": "réveillions",
      "vous": "réveilliez",
      "ils/elles": "réveillent"
    },
    "toucher": {
      "je": "touche",
      "tu": "touches",
      "il/elle/on": "touche",
      "nous": "touchions",
      "vous": "touchiez",
      "ils/elles": "touchent"
    },
    "tuer": {
      "je": "tue",
      "tu": "tues",
      "il/elle/on": "tue",
      "nous": "tuions",
      "vous": "tuiez",
      "ils/elles": "tuent"
    },
    "vérifier": {
      "je": "vérifie",
      "tu": "vérifies",
      "il/elle/on": "vérifie",
      "nous": "vérifiions",
      "vous": "vérifiiez",
      "ils/elles": "vérifient"
    }
  }
};

const pronouns = [
  "je",
  "tu",
  "il/elle/on",
  "nous",
  "vous",
  "ils/elles"
];