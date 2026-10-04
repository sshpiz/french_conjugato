const fs=require('fs'),vm=require('vm'),path=require('path'),root=path.resolve(__dirname,'..');
const c={window:{}};vm.createContext(c);
for(const f of ['verbs.full.generated.js','referenceCards.js','referenceInventory.js','referenceEnYInventory.js','referenceEnY.js','referenceExpansion.js'])vm.runInContext(fs.readFileSync(path.join(root,'js',f),'utf8')+(f.startsWith('verbs.')?';globalThis.tables=tenses;globalThis.headwords=verbs':''),c);
const records=c.window.frenchEnYInventory;
for(const r of records){
 const person=r.type==='personY',subject=person?'ils':'je';
 const form=c.tables.present[r.verb][person?'ils/elles':'je'];
 const answer=c.window.referenceCards.expansion.construct({verb:{infinitive:r.verb},pronoun:subject,tense:'present',conjugated:form},r,0,0);
 if(!answer)throw Error('Missing example '+r.verb+' '+r.type);
 r.example=answer.conjugated[0].toUpperCase()+answer.conjugated.slice(1)+'.';
 const gloss=r.gloss.replace(/^to /,'');
 const ending={prepY:' it',prepEn:' it',location:' there',origin:' from there',quantity:' some',quantityY:' some there',directY:' it there',personY:' me there',recipientEn:' some to him',indirectEn:' it',directEn:' it'}[r.type];
 r.exampleEnglish=(person?'They ':'I ')+gloss+ending+'.';
 // Preserve a correct idiomatic translation for frames whose English argument order differs.
 const fixes={
 'prepY:rechigner':'I am reluctant about it.', 'prepY:répugner':'I am averse to it.',
 'prepEn:raffoler':'I am very fond of it.', 'location:être':'I am there.', 'location:naître':'I am born there.',
 'directY:remettre':'I put it back there.', 'directY:poser':'I put it down there.',
 'directY:ranger':'I put it away there.', 'directY:retrouver':'I find it there again.',
 'directY:revoir':'I see it there again.', 'directY:rapporter':'I bring it back there.',
 'directY:renvoyer':'I send it back there.', 'personY:ramener':'They bring me back there.',
 'personY:reconduire':'They take me back there.',
 'prepY:conclure':'I reach that conclusion.', 'prepEn:disposer':'I have it at my disposal.',
 'recipientEn:demander':'I ask him for some.', 'recipientEn:emprunter':'I borrow some from him.',
 'recipientEn:prendre':'I take some from him.', 'recipientEn:acheter':'I buy some for him.',
 'recipientEn:commander':'I order some for him.', 'recipientEn:réserver':'I reserve some for him.',
 'indirectEn:parler':'I talk to him about it.', 'indirectEn:reparler':'I talk to him about it again.'};
 if(r.type==='directEn')r.exampleEnglish='I '+gloss.replace('someone','him')+' it.';
 r.exampleEnglish=fixes[r.type+':'+r.verb]||r.exampleEnglish;
 r.generatedExampleReference=answer.references||[answer.reference];
}
fs.writeFileSync(path.join(root,'data/pronoun-constructions/en-y-editorial.json'),JSON.stringify(records,null,2)+'\n');
fs.writeFileSync(path.join(root,'js/referenceEnYInventory.js'),'/* Generated editorial frames. See data/pronoun-constructions/en-y-editorial.json for provenance. */\nwindow.frenchEnYInventory = '+JSON.stringify(records)+';\n');
console.log('Added',records.length,'worked French examples and translations');

const coverage=c.headwords.map(v=>({verb:v.infinitive,playable:c.window.referenceCards.supports(v.infinitive),enYTypes:records.filter(r=>r.verb===v.infinitive).map(r=>r.type)}));
fs.writeFileSync(path.join(root,'data/pronoun-constructions/coverage-expanded.json'),JSON.stringify(coverage,null,2)+'\n');
