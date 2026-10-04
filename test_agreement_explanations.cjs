const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');const c={window:{},TextEncoder,TextDecoder,btoa,atob};vm.createContext(c);for(const f of ['pronounExplanation','referenceCards','referenceInventory','referenceEnYInventory','referenceEnY','referenceExpansion','questionShare'])vm.runInContext(fs.readFileSync('js/'+f+'.js','utf8'),c);
const api=c.window.referenceCards;
for(const [tense,aux] of [['passeCompose','a'],['plusQueParfait','avait']]){
const base={verb:{infinitive:'voir'},pronoun:'il',tense,conjugated:'il '+aux+' vu'};
const direct=api.prepare(base,'cette chose');assert.equal(direct.conjugated,'il l\''+aux+' vue');assert(direct.explanation.some(x=>x.includes('complément direct placé avant')));
const indirect=api.prepare({...base,verb:{infinitive:'téléphoner'},conjugated:'il '+aux+' téléphoné'},'ces femmes');assert.equal(indirect.conjugated,'il leur '+aux+' téléphoné');assert(indirect.explanation.some(x=>x.includes('ne s’accorde pas')));
const record=c.window.frenchReferenceInventory.find(x=>x.type==='double');const double=api.expansion.construct({...base,verb:{infinitive:record.verb},conjugated:'il '+aux+' donné'},record,2,1);assert(double.explanation.some(x=>x.includes('ces choses')&&x.includes('complément direct')));assert(double.explanation.some(x=>x.includes('à cette femme')&&x.includes('indirect')));assert.deepEqual(c.window.QuestionShare.decode(c.window.QuestionShare.encode(double)).explanation,double.explanation);
const q=c.window.frenchEnYInventory.find(x=>x.type==='quantity');const quantity=api.expansion.construct({...base,verb:{infinitive:q.verb},conjugated:'il '+aux+' acheté'},q,1,0);assert(quantity.explanation.some(x=>x.includes('reste invariable')));
}
const present=api.prepare({verb:{infinitive:'voir'},pronoun:'il',tense:'present',conjugated:'il voit'},'cette chose');assert(!present.explanation.some(x=>x.includes('participe passé')));
console.log('PASS both compound tenses: direct agreement, indirect non-agreement, double contrast, quantitative en, shared explanations; present unchanged');
