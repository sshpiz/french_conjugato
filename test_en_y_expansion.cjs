const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');const c={window:{}};vm.createContext(c);
for(const f of ['verbs.full.generated.js','referenceCards.js','referenceInventory.js','referenceEnYInventory.js','referenceEnY.js','referenceExpansion.js','referenceNegation.js'])vm.runInContext(fs.readFileSync(__dirname+'/js/'+f,'utf8')+(f.startsWith('verbs.')?';globalThis.tables=tenses':''),c);
const api=c.window.referenceCards,records=c.window.frenchEnYInventory;
function card(v,type,p,t,form,o=0,r=0){const record=records.find(x=>x.verb===v&&x.type===type);assert(record,v+type);return api.expansion.construct({verb:{infinitive:v},pronoun:p,tense:t,conjugated:form},record,o,r);}
const fixtures=[
 ['aller','location','je','present','je vais',0,0,"j'y vais"],
 ['revenir','origin','elle','passeCompose','elle est revenue',0,0,'elle en est revenue'],
 ['travailler','location','nous','imparfait','nous travaillions',0,0,'nous y travaillions'],
 ['obéir','prepY','tu','present','tu obéis',0,0,'tu y obéis'],
 ['profiter','prepEn','je','present','je profite',0,0,"j'en profite"],
 ['acheter','quantity','je','passeCompose',"j'ai acheté",1,0,"j'en ai acheté deux"],
 ['manger','quantity','elle','passeCompose','elle a mangé',2,0,'elle en a mangé beaucoup'],
 ['mettre','directY','je','passeCompose',"j'ai mis",2,0,"je les y ai mises"],
 ['voir','directY','elle','present','elle voit',0,0,"elle l'y voit"],
 ['emmener','personY','elle','passeCompose','elle a emmené',6,0,'elle nous y a emmenées'],
 ['inviter','personY','il','present','il invite',1,0,"il t'y invite"],
 ['donner','recipientEn','elle','passeCompose','elle a donné',0,0,'elle lui en a donné'],
 ['donner','recipientEn','il','present','il donne',1,5,"il t'en donne deux"],
 ['parler','indirectEn','elle','present','elle parle',0,6,'elle nous en parle'],
 ['informer','directEn','je','passeCompose',"j'ai informé",1,0,"je l'en ai informée"],
 ['convaincre','directEn','elle','plusQueParfait','elle avait convaincu',3,0,'elle les en avait convaincues'],
];
for(const [v,type,p,t,f,o,r,want]of fixtures){const result=card(v,type,p,t,f,o,r);assert.equal(result.conjugated,want);assert(api.negate(result,'standard').conjugated.includes(' pas'));}
assert.equal(card('emmener','personY','je','present',"j'emmène",0),null);
let count=0;
for(const r of records){
 assert(r.example&&r.exampleEnglish&&r.pattern,r.verb);
 for(const [tense,table]of Object.entries(c.tables))for(const [pronoun,conjugated]of Object.entries(table[r.verb])){
  for(let o=0;o<(r.type==='personY'?8:r.type==='directEn'?4:3);o++)for(let i=0;i<(['recipientEn','indirectEn'].includes(r.type)?8:1);i++){
   const a=api.expansion.construct({verb:{infinitive:r.verb},pronoun,tense,conjugated},r,o,i);if(!a)continue;
   assert(!/undefined|\bnull\b|—/.test(a.conjugated),a.conjugated);assert(!/\by en\b/.test(a.conjugated),a.conjugated);assert.equal(!!a.doublePronoun,r.arity===2);assert(a.reference);count++;
  }
 }
}
for(const mode of ['one','two','mixed']){
 c.window.cardGenerationOptions={referenceObjects:mode};
 for(const r of records){if(!api.supports(r.verb))continue;
  for(let i=0;i<20;i++){
   const a=api.prepare({verb:{infinitive:r.verb},pronoun:'il',tense:'present',conjugated:c.tables.present[r.verb]['il/elle/on']});
   assert(a.reference,r.verb);if(mode==='one')assert(!a.doublePronoun);if(mode==='two')assert(a.doublePronoun,r.verb);
  }
 }
}
console.log('PASS independent y/en, quantity, cluster, agreement and negation fixtures;',count,'answer combinations;',records.length,'worked examples');

assert(!records.some(r=>r.type==='quantityY'));
assert.equal(c.window.constructFrenchEnY({verb:{infinitive:'boire'},pronoun:'je',tense:'present',conjugated:'je bois'},{type:'quantityY',verb:'boire',cue:'du café'}),null);
