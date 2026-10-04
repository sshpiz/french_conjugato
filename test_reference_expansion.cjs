const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const ctx={window:{}};vm.createContext(ctx);
for(const file of ['verbs.full.generated.js','referenceCards.js','referenceInventory.js','referenceEnYInventory.js','referenceEnY.js','referenceExpansion.js'])vm.runInContext(fs.readFileSync(__dirname+'/js/'+file,'utf8')+(file.startsWith('verbs.')?';globalThis.data={verbs,tenses}':''),ctx);
const api=ctx.window.referenceCards,engine=api.expansion;
function answer(v,type,p,t,f,o=0,r=0){const rec=engine.records.find(x=>x.verb===v&&(x.type===type||x.type===({y:'prepY',en:'prepEn'}[type])));assert(rec,v+' '+type);return engine.construct({verb:{infinitive:v},pronoun:p,tense:t,conjugated:f},rec,o,r)?.conjugated;}
assert.equal(answer('haïr','person','elle','present','elle hait',0),'elle me hait');
assert.equal(answer('habiller','person','elle','present','elle habille',0),"elle m'habille");
assert.equal(answer('hâter','direct','je','present','je hâte',1),'je la hâte');
assert.equal(answer('devoir','double','je','passeCompose',"j'ai dû",1,0),'je la lui ai due');
assert.equal(answer('réfléchir','y','je','present','je réfléchis'),"j'y réfléchis");
assert.equal(answer('parler','en','je','present','je parle'),"j'en parle");
assert.equal(answer('donner','double','nous','plusQueParfait','nous avions donné',2,2),'nous les leur avions données');
assert.equal(answer('envoyer','double','elle','present','elle envoie',1,4),"elle me l'envoie");
assert.equal(answer('écrire','indirect','elle','passeCompose','elle a écrit',6),'elle nous a écrit');
assert.equal(answer('admirer','person','elle','passeCompose','elle a admiré',6),'elle nous a admirées');
assert.equal(answer('admirer','person','je','present',"j'admire",0),undefined);
let count=0;
for(const rec of engine.records){
 for(const [tense,table]of Object.entries(ctx.data.tenses))for(const [pronoun,conjugated]of Object.entries(table[rec.verb])){
  const card={verb:{infinitive:rec.verb},tense,pronoun,conjugated};
  for(let o=0;o<(['person','indirect'].includes(rec.type)?8:3);o++)for(let r=0;r<(rec.type==='double'?8:1);r++){
   const result=engine.construct(card,rec,o,r);if(!result)continue;
   assert(result.reference);assert(!/undefined|\bnull\b|—/.test(result.conjugated));assert.equal(result._practiceAnswer,result.conjugated);count++;
  }
  for(const mode of ['one','two','mixed']){
   ctx.window.cardGenerationOptions={referenceObjects:mode};if(!api.supports(rec.verb))continue;
   for(let i=0;i<3;i++)assert(api.prepare(card).reference,rec.verb+' '+mode);
  }
 }
}
const coverage=JSON.parse(fs.readFileSync(__dirname+'/data/pronoun-constructions/coverage.json'));
assert.equal(coverage.length,ctx.data.verbs.length);assert.equal(new Set(coverage.map(v=>v.verb)).size,coverage.length);
console.log('PASS',engine.records.length,'constructions,',count,'generated answers; every',coverage.length,'headword audited');
ctx.window.cardGenerationOptions={referenceObjects:'mixed'};
console.log('Playable unique verbs:',ctx.data.verbs.filter(v=>api.supports(v.infinitive)).length);
