// Regression for the October 2026 generic reply-content audit.
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const ctx={window:{}};vm.createContext(ctx);
for(const file of ['verbs.full.generated','referenceCards','referenceInventory','referenceEnYInventory','referenceEnY','referenceExpansion'])
 vm.runInContext(fs.readFileSync(`${__dirname}/js/${file}.js`,'utf8')+(file==='verbs.full.generated'?';globalThis.tables=tenses':''),ctx);
const api=ctx.window.referenceCards;
assert(!api.doubleVerbs.includes('répondre'));
assert.equal(api.doubleUsageEntries('répondre').length,0);
assert(!api.personalUsageEntries('répondre').some(e=>e.pattern_id==='personal-double:répondre'));
assert(!api.expansion.records.some(r=>r.verb==='répondre'&&(r.type==='double'||r.arity===2)));
let blocked=0;
for(const [tense,table]of Object.entries(ctx.tables))for(const [pronoun,conjugated]of Object.entries(table['répondre']||{})){
 const card={verb:{infinitive:'répondre'},tense,pronoun,conjugated};
 for(let o=0;o<3;o++)for(let r=0;r<8;r++){assert.equal(api.doubleReference(card,o,r),null);blocked++;}
 for(const mode of ['one','mixed']){
  ctx.window.cardGenerationOptions={referenceObjects:mode};
  for(let i=0;i<30;i++){const result=api.prepare(card);assert(result.reference);assert(!result.doublePronoun);}
 }
}
ctx.window.cardGenerationOptions={referenceObjects:'two'};
assert.equal(api.supports('répondre'),false);
assert.equal(api.supports('donner'),true);
const card={verb:{infinitive:'répondre'},tense:'present',pronoun:'tu',conjugated:'tu réponds'};
assert.equal(api.personalReference(card,2).conjugated,'tu nous réponds');
assert.equal(api.prepare(card,'ce truc').conjugated,'tu y réponds');
assert.equal(api.prepare(card,'cet homme').conjugated,'tu lui réponds');
assert.equal(api.doubleReference({...card,verb:{infinitive:'donner'},conjugated:'tu donnes'},0,6).conjugated,'tu nous le donnes');
console.log(`PASS ${blocked} blocked reply combinations, repeated one/mixed generation, two-object eligibility, natural alternatives`);
