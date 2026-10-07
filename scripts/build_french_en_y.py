"""Editorial en/y construction inventory; no inference from auxiliary choice.
Source IDs are supporting lexical records, not claims of automated verification.
"""
import json,re,subprocess,collections
from pathlib import Path
root=Path(__file__).resolve().parents[1]
base=json.loads((root/'data/pronoun-constructions/candidates.json').read_text())
lookup={(r['verb'],r['type']):r for r in base}
records=[]
def add(kind,text):
 for line in text.strip().splitlines():
  v,english,*cue=line.strip().split('|')
  record={'verb':v,'type':kind,'gloss':'to '+english,'sourceId':'editorial-en-y:'+kind+':'+v,'arity':2 if kind in ['directY','personY','recipientEn','indirectEn','directEn','quantityY'] else 1}
  if cue:record['cue']=cue[0]
  source=lookup.get((v,{'location':'place','origin':'en','prepY':'y','prepEn':'en'}.get(kind,kind)))
  record['provenance']={'review':'editorial construction review, 2026-10-01','grammar':['https://www.laits.utexas.edu/tex/gr/pro6.html','https://www.laits.utexas.edu/tex/gr/pro7.html','https://www.laits.utexas.edu/tex/gr/pro9.html']}
  if source:record['provenance'].update({'dicovalenceId':source['sourceId'],'sourceExample':source['example'],'sourceFrame':source['sourceFrame']})
  records.append(record)
add('prepY','''accéder|agree to
acquiescer|agree to
adhérer|subscribe to
applaudir|approve of
aspirer|aspire to
assister|attend
céder|give in to
collaborer|collaborate on
compatir|sympathize with
conclure|conclude that
consentir|consent to
contrevenir|contravene
contribuer|contribute to
coopérer|cooperate on
cotiser|contribute to
croire|believe in
déférer|comply with
déroger|depart from
désobéir|disobey
échapper|escape
échouer|fail at
faillir|fail in
goûter|taste
manquer|fail to fulfill
obéir|obey
obtempérer|comply with
parer|guard against
participer|participate in
penser|think about
pourvoir|provide for
prétendre|lay claim to
procéder|proceed with
réagir|react to
rechigner|be reluctant about
recourir|resort to
réfléchir|think about
remédier|remedy
renoncer|give up
repenser|think again about
répliquer|respond to
répondre|respond to
répugner|be averse to
résister|resist
ressembler|resemble
rêver|dream about
satisfaire|meet the requirements of
songer|think about
souscrire|subscribe to
subvenir|provide for
succomber|succumb to
surseoir|defer
survivre|survive
tendre|aspire to
tenir|care about
toucher|touch
travailler|work on
veiller|attend to''')
add('prepEn','''abuser|overuse
bavarder|chat about
bénéficier|benefit from
causer|chat about
convenir|acknowledge
décider|decide on
démissionner|resign from
discourir|speak at length about
disposer|have at one's disposal
disserter|speak at length about
douter|doubt
guérir|recover from
hériter|inherit
jaser|gossip about
jouir|enjoy
juger|judge
justifier|provide evidence of
mourir|die of
parler|talk about
pâtir|suffer from
préjuger|prejudge
profiter|benefit from
raffoler|be very fond of
reparler|talk again about
répondre|take responsibility for
rêver|dream of
rigoler|laugh about
rire|laugh about
souffrir|suffer from
subsister|subsist on
témoigner|testify to
traiter|deal with
user|make use of''')
add('location','''aller|go
arriver|arrive
entrer|enter
rentrer|return
revenir|come back
retourner|return
rester|stay
venir|come
monter|go up
descendre|go down
remonter|go back up
redescendre|go back down
passer|pass
repasser|come by again
être|be
habiter|live
vivre|live
travailler|work
étudier|study
apprendre|learn
enseigner|teach
manger|eat
dîner|have dinner
déjeuner|have lunch
souper|have supper
dormir|sleep
loger|stay
résider|reside
séjourner|stay
demeurer|stay
emménager|move in
immigrer|immigrate
voyager|travel
marcher|walk
courir|run
nager|swim
jouer|play
danser|dance
chanter|sing
rire|laugh
pleurer|cry
attendre|wait
patienter|wait
flâner|stroll
rôder|prowl
traîner|linger
barboter|splash about
hiverner|spend the winter
camper|camp
pique-niquer|have a picnic
sécher|dry
apparaître|appear
disparaître|disappear
intervenir|intervene
pénétrer|enter
régner|reign
siéger|sit
prospérer|prosper
exister|exist
naître|be born
mourir|die''')
add('origin','''venir|come
revenir|come back
sortir|come out
ressortir|come back out
partir|leave
repartir|leave again
rentrer|return
descendre|come down
redescendre|come back down
remonter|come back up
arriver|arrive
émerger|emerge
fuir|flee
accourir|come running''')
add('quantity','''acheter|buy|des livres
vendre|sell|des livres
revendre|resell|des livres
lire|read|des livres
relire|reread|des livres
écrire|write|des lettres
récrire|rewrite|des lettres
recevoir|receive|des lettres
envoyer|send|des lettres
renvoyer|send back|des lettres
apporter|bring|des cadeaux
rapporter|bring back|des cadeaux
emporter|take away|des livres
remporter|win|des prix
prendre|take|des biscuits
reprendre|take again|des biscuits
comprendre|understand|des phrases
apprendre|learn|des mots
retenir|remember|des mots
oublier|forget|des mots
connaître|know|des chansons
reconnaître|recognize|des chansons
chanter|sing|des chansons
entendre|hear|des bruits
écouter|listen to|des chansons
voir|see|des oiseaux
apercevoir|catch sight of|des oiseaux
regarder|watch|des films
trouver|find|des clés
retrouver|find again|des clés
chercher|look for|des livres
obtenir|obtain|des résultats
produire|produce|des résultats
créer|create|des objets
fabriquer|make|des objets
construire|build|des maisons
détruire|destroy|des objets
réparer|repair|des objets
remplacer|replace|des pièces
utiliser|use|des outils
employer|use|des outils
essayer|try|des vêtements
porter|wear|des vêtements
laver|wash|des vêtements
nettoyer|clean|des vitres
ranger|put away|des livres
classer|sort|des documents
conserver|keep|des documents
garder|keep|des livres
jeter|throw away|des papiers
ramasser|pick up|des papiers
collecter|collect|des données
récolter|harvest|des pommes
cueillir|pick|des fleurs
planter|plant|des arbres
cultiver|grow|des légumes
préparer|prepare|des repas
cuisiner|cook|des légumes
manger|eat|des pommes
boire|drink|du café
goûter|taste|du fromage
consommer|consume|du pain
commander|order|des livres
réserver|reserve|des places
annuler|cancel|des commandes
accepter|accept|des cadeaux
refuser|refuse|des cadeaux
proposer|suggest|des solutions
choisir|choose|des livres
sélectionner|select|des livres
imaginer|imagine|des solutions
inventer|invent|des histoires
raconter|tell|des histoires
répéter|repeat|des phrases
prononcer|pronounce|des mots
traduire|translate|des phrases
corriger|correct|des erreurs
éviter|avoid|des erreurs
commettre|make|des erreurs
faire|make|des gâteaux
dessiner|draw|des maisons
peindre|paint|des tableaux
photographier|photograph|des oiseaux
filmer|film|des scènes
enregistrer|record|des chansons
imprimer|print|des documents
copier|copy|des documents
publier|publish|des livres
partager|share|des photos
distribuer|distribute|des livres
livrer|deliver|des colis
transporter|transport|des colis
déplacer|move|des objets
pousser|push|des chariots
tirer|pull|des chariots
soulever|lift|des caisses
perdre|lose|des clés
casser|break|des verres
briser|break|des verres
ouvrir|open|des fenêtres
fermer|close|des fenêtres
avoir|have|des livres
vouloir|want|des livres
posséder|own|des livres
détenir|hold|des documents
manquer|miss|des occasions
saisir|seize|des occasions
visiter|visit|des musées
organiser|organize|des fêtes
payer|pay|des factures
gagner|earn|de l’argent
dépenser|spend|de l’argent
économiser|save|de l’argent''')
add('directY','''mettre|put
remettre|put back
poser|put down
déposer|deposit
placer|place
installer|install
ranger|put away
stocker|store
laisser|leave
cacher|hide
chercher|look for
trouver|find
retrouver|find again
voir|see
revoir|see again
apercevoir|catch sight of
acheter|buy
vendre|sell
fabriquer|make
construire|build
préparer|prepare
réparer|repair
laver|wash
nettoyer|clean
conserver|keep
garder|keep
exposer|exhibit
apporter|bring
rapporter|bring back
envoyer|send
renvoyer|send back
transporter|transport
livrer|deliver
planter|plant''')
add('personY','''emmener|take
amener|bring
ramener|bring back
accompagner|accompany
conduire|take
reconduire|take back
accueillir|welcome
recevoir|receive
retrouver|meet
attendre|wait for
rejoindre|join
chercher|look for
voir|see
rencontrer|meet
héberger|accommodate
loger|accommodate
installer|settle
inviter|invite''')
add('recipientEn','''donner|give|des livres
offrir|offer|des fleurs
apporter|bring|des cadeaux
rapporter|bring back|des cadeaux
envoyer|send|des lettres
renvoyer|send back|des lettres
prêter|lend|des livres
rendre|give back|des livres
vendre|sell|des livres
acheter|buy|des cadeaux
commander|order|des livres
réserver|reserve|des places
servir|serve|du café
verser|pour|du café
fournir|supply|des documents
livrer|deliver|des colis
transmettre|forward|des documents
montrer|show|des photos
proposer|offer|des solutions
recommander|recommend|des livres
promettre|promise|des cadeaux
refuser|refuse|des cadeaux
accorder|grant|des permissions
expliquer|explain|des règles
enseigner|teach|des mots
apprendre|teach|des mots
raconter|tell|des histoires
demander|ask for|des conseils
emprunter|borrow|des livres
prendre|take from|des livres''')
add('indirectEn','''parler|talk to someone about
reparler|talk to someone again about''')
add('directEn','''remercier|thank someone for
féliciter|congratulate someone on
informer|inform someone of
avertir|warn someone of
prévenir|notify someone of
convaincre|convince someone of
persuader|persuade someone of
accuser|accuse someone of
soupçonner|suspect someone of
charger|put someone in charge of
priver|deprive someone of
dispenser|exempt someone from
libérer|free someone from
débarrasser|rid someone of
consoler|console someone about''')
# Do not generate y + en quantity/location drills: valid combinations can be
# marginal in contemporary usage and are unsuitable for this everyday-practice pool.
# Keep ordinary y, en and the independently curated il y en a family.
# Concrete neutral cues where a generic thing would obscure the verb sense.
custom={
 'prepY':{'accéder':'cette demande','acquiescer':'cette proposition','adhérer':'cette idée','aspirer':'ce poste','assister':'cette réunion','compatir':'cette peine','conclure':'cette conclusion','cotiser':'ce fonds','contrevenir':'cette règle','déroger':'cette règle','désobéir':'cette règle','échouer':'cet examen','faillir':'ce devoir','manquer':'ce devoir','obéir':'cette règle','obtempérer':'cet ordre','parer':'ce danger','pourvoir':'ce besoin','prétendre':'ce titre','procéder':'cette vérification','réagir':'cette nouvelle','remédier':'ce problème','ressembler':'ce modèle','satisfaire':'cette exigence','souscrire':'cette idée','subvenir':'ce besoin','succomber':'cette tentation','surseoir':'cette décision','tendre':'cet objectif','veiller':'cette tâche'},
 'prepEn':{'bénéficier':'cet avantage','convenir':'ce fait','démissionner':'ce poste','disposer':'cet outil','guérir':'cette maladie','hériter':'cette maison','jouir':'ce droit','justifier':'cette expérience','mourir':'cette maladie','pâtir':'ce problème','raffoler':'ce plat','subsister':'ces dons','témoigner':'ce fait'}}
for r in records:
 if r['verb'] in custom.get(r['type'],{}):r['cue']=custom[r['type']][r['verb']]
# Match every record against the real paradigms and preserve deferred cases.
js="const fs=require('fs'),vm=require('vm'),c={window:{}};vm.createContext(c);vm.runInContext(fs.readFileSync('js/verbs.full.generated.js','utf8')+';globalThis.data={verbs,tenses}',c);console.log(JSON.stringify(c.data))"
data=json.loads(subprocess.check_output(['node','-e',js],cwd=root));verbs={v['infinitive'] for v in data['verbs']}
accepted=[];deferred=[]
for r in records:
 v=r['verb'];reason=None
 if v not in verbs:reason='missing headword'
 elif any(len(table.get(v,{}))!=6 or any(not x or x=='—' for x in table.get(v,{}).values()) for table in data['tenses'].values()):reason='incomplete paradigm'
 elif r['type'] in ['quantity','directY','personY','recipientEn','indirectEn','directEn','quantityY']:
  # Direct-object senses require avoir; never reuse an intransitive être table.
  if not re.match(r"^j['’]ai ",data['tenses']['passeCompose'][v]['je']):reason='requires transitive avoir paradigm'
 if reason:deferred.append({**r,'reason':reason});continue
 r['pattern']=v+' '+{'prepY':'à quelque chose','prepEn':'de quelque chose','location':'à/dans un lieu','origin':'de ce lieu','quantity':r.get('cue',''),'directY':'quelque chose dans un lieu','personY':'quelqu’un dans un lieu','recipientEn':r.get('cue','')+' à quelqu’un','indirectEn':'à quelqu’un de quelque chose','directEn':'quelqu’un de quelque chose','quantityY':r.get('cue','')+' dans un lieu'}[r['type']]
 accepted.append(r)
(root/'data/pronoun-constructions/en-y-editorial.json').write_text(json.dumps(accepted,ensure_ascii=False,indent=2)+'\n')
(root/'data/pronoun-constructions/en-y-deferred.json').write_text(json.dumps(deferred,ensure_ascii=False,indent=2)+'\n')
(root/'js/referenceEnYInventory.js').write_text('/* Generated by scripts/build_french_en_y.py. Editorial constructions, with provenance in data/pronoun-constructions/en-y-editorial.json. */\nwindow.frenchEnYInventory = '+json.dumps(accepted,ensure_ascii=False,separators=(',',':'))+';\n')
print(len(accepted),'constructions;',len(set(r['verb'] for r in accepted)),'verbs;',collections.Counter(r['type'] for r in accepted));print('deferred',[(r['verb'],r['reason'])for r in deferred])
subprocess.run(['node',str(root/'scripts/en_y_examples.cjs')],cwd=root,check=True)
