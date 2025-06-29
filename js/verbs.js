
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
    }
  },

};


const pronouns = [
  "je",
  "tu",
  "il/elle/on",
  "nous",
  "vous",
  "ils/elles"
];
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
