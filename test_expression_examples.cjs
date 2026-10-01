const vm=require('vm'),fs=require('fs'),assert=require('assert/strict');
const c={window:{},location:{pathname:'/french/'},localStorage:{getItem:()=>null},document:{getElementById:()=>null}};vm.createContext(c);
vm.runInContext(fs.readFileSync(__dirname+'/js/verbs.full.generated.js','utf8')+';window.entries=verbs;',c);
for(const file of ['verb_usages.js','verb_core_patterns.js','js/constructionCards.js'])vm.runInContext(fs.readFileSync(__dirname+'/'+file,'utf8'),c);
const expressions=c.window.entries.filter(v=>v.verbExpression);
for(const verb of expressions){
 const input={verb,tense:'present',conjugated:'UNCHANGED'};
 const records=c.window.verbCorePatterns.find(r=>r.verb===verb.infinitive)?.core_patterns||[];
 const card=c.window.constructionCards.prepare(input,records);
 assert(card._patternEntry,verb.infinitive);assert(card._patternEntry.example_fr,verb.infinitive);assert(card._patternEntry.example_en,verb.infinitive);
 assert.equal(card.conjugated,'UNCHANGED');assert.equal(c.window.constructionCards.prepare(card,records)._patternEntry,card._patternEntry);
}
const age=expressions.filter(v=>/^avoir .* ans$/.test(v.infinitive));assert.equal(age.length,1);assert.equal(age[0].infinitive,'avoir vingt ans');
const prior=JSON.parse(fs.readFileSync(__dirname+'/../outputs/word-family-production/french_latest/verb_usages.js','utf8').split('window.verbUsages = ')[1].trim().replace(/;$/,''));
// Example sentences are maintained by parallel editorial work; the reviewed
// construction records must still be preserved independently of those examples.
const reviewedFields = rows => rows.map(({example_fr, example_en, example_provenance, ...record}) => record);
assert.equal(JSON.stringify(reviewedFields(c.window.verbUsages.slice(0,prior.length))),JSON.stringify(reviewedFields(prior)));
console.log(`${expressions.length}/${expressions.length} expressions have bilingual expandable examples; reviewed records preserved; one age entry.`);
