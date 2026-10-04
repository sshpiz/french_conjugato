const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const ctx={window:{}};vm.createContext(ctx);
for(const file of ['verbs.full.generated.js','referenceCards.js','referenceInventory.js','referenceEnYInventory.js','referenceEnY.js','referenceExpansion.js','referenceNegation.js'])vm.runInContext(fs.readFileSync(__dirname+'/js/'+file,'utf8')+(file.startsWith('verbs.')?';globalThis.data={verbs,tenses}':''),ctx);
const api=ctx.window.referenceCards;
const cases=[
 ['je le vois','je ne le vois pas','je le vois pas'],
 ["j'y vais","je n'y vais pas","j'y vais pas"],
 ["j'en ai besoin","je n'en ai pas besoin","j'en ai pas besoin"],
 ['elle me voit','elle ne me voit pas','elle me voit pas'],
 ["elle m'écoute","elle ne m'écoute pas","elle m'écoute pas"],
 ['nous les leur avions données','nous ne les leur avions pas données','nous les leur avions pas données'],
 ["elle me l'a offerte","elle ne me l'a pas offerte","elle me l'a pas offerte"],
 ["j'ai pensé à elle","je n'ai pas pensé à elle","j'ai pas pensé à elle"],
 ['il en avait envie',"il n'en avait pas envie",'il en avait pas envie'],
 ['vous lui répondiez','vous ne lui répondiez pas','vous lui répondiez pas'],
 ['elle me hait','elle ne me hait pas','elle me hait pas'],
 ['nous nous écoutons','nous ne nous écoutons pas','nous nous écoutons pas'],
];
for(const [base,standard,spoken] of cases)for(const [style,want]of [['standard',standard],['spoken',spoken]]){
 const result=api.negate({reference:'x',conjugated:base},style);assert.equal(result.conjugated,want);assert.equal(result._practiceAnswer,want);assert.equal(api.negate(result,style),result);
}
const plain={conjugated:'je parle'};assert.equal(api.negate(plain,'standard').conjugated,'je ne parle pas');
let count=0;
for(const mode of ['standard','spoken']){
 ctx.window.cardGenerationOptions={referenceObjects:'mixed',referenceNegation:mode};
 for(const verb of ctx.data.verbs.filter(v=>api.supports(v.infinitive)))for(const [tense,table]of Object.entries(ctx.data.tenses))for(const [pronoun,conjugated]of Object.entries(table[verb.infinitive]||{})){
  const card=api.prepareNegation(api.prepare({verb,tense,pronoun,conjugated}));assert.equal(card.negationStyle,mode,verb.infinitive);assert.equal((card.conjugated.match(/\bpas\b/g)||[]).length,1);assert(!/undefined|\bne [aeiouy]/.test(card.conjugated),card.conjugated);count++;
 }
}
console.log('PASS independent negation fixtures and',count,'negative generated cards');

for(const [v,p,t,f,want] of [
 ['parler','je','present','je parle','je ne parle pas'],
 ['aimer','je','present',"j'aime","je n'aime pas"],
 ['habiter','tu','present','tu habites',"tu n'habites pas"],
 ['haïr','tu','present','tu hais','tu ne hais pas'],
 ['se lever','elle','passeCompose',"elle s'est levée","elle ne s'est pas levée"],
 ['pouvoir','vous','plusQueParfait','vous aviez pu',"vous n'aviez pas pu"]
]) assert.equal(api.negate({verb:{infinitive:v},pronoun:p,tense:t,conjugated:f},'standard').conjugated,want);
ctx.window.cardGenerationOptions={referenceNegation:'mixed'};
const counts={affirmative:0,standard:0,spoken:0};for(let i=0;i<100000;i++){const c=api.prepareNegation({verb:{infinitive:'parler'},pronoun:'je',conjugated:'je parle'});counts[c.negationStyle||'affirmative']++;}
assert(Math.abs(counts.affirmative/100000-.75)<.01);assert(Math.abs(counts.standard/100000-.125)<.01);assert(Math.abs(counts.spoken/100000-.125)<.01);
console.log('PASS regular/reflexive/h-elision fixtures and mixed distribution',counts);
