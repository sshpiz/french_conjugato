const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const c={window:{}};vm.createContext(c);
vm.runInContext(fs.readFileSync(__dirname+'/js/verbs.full.generated.js','utf8')+';globalThis.dataset={verbs,tenses}',c);
vm.runInContext(fs.readFileSync(__dirname+'/js/referenceCards.js','utf8'),c);
const api=c.window.referenceCards;let count=0;
for(const verb of Object.keys(api.specs)){
 assert(c.dataset.verbs.some(v=>v.infinitive===verb),'Missing '+verb);
 for(const [tense,rows] of Object.entries(c.dataset.tenses)){
  assert(rows[verb],'Missing '+verb+' '+tense);
  for(const [pronoun,conjugated] of Object.entries(rows[verb])) for(const reference of api.referencesFor(verb)){
   const card=api.prepare({verb:{infinitive:verb},tense,pronoun,conjugated},reference);
   assert(card.conjugated&&!/undefined|quelque chose/.test(card.conjugated),verb+' '+tense);
   count++;
  }
 }
}
console.log('PASS '+Object.keys(api.specs).length+' verbs / '+count+' loaded conjugation-reference combinations');
