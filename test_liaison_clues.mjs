import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';import ESpeakNG from './js/vendor/espeak-ng.js';
const ctx={window:{}};vm.createContext(ctx);vm.runInContext(fs.readFileSync(new URL('./js/liaisonClues.js',import.meta.url),'utf8'),ctx);
const fixtures=[
 ['vous en avez pas eu besoin','avoir besoin',[[0,'required','z'],[1,'required','n'],[3,'optional','z']]],
 ["vous n'en avez pas eu besoin",'en avoir besoin',[[1,'required','n'],[3,'optional','z']]],
 ['elle a pas hésité','hésiter',[[2,'optional','z']]],
 ['elle a pas hurlé','hurler',[]],
 ['nous avons aimé','aimer',[[0,'required','z'],[1,'optional','z']]],
 ['vous écoutez','écouter',[[0,'required','z']]],
 ['ils nous ont vus','voir',[[1,'required','z']]],
 ['nous les avons aimées','aimer',[[1,'required','z'],[2,'optional','z']]],
 ['nous en avons','avoir',[[0,'required','z'],[1,'required','n']]],
 ['ils ont haï','haïr',[[0,'required','z']]],
 ['nous hurlons','hurler',[]],['vous hachez','hacher',[]],
 ['ils habitent','habiter',[[0,'required','z']]],
 ['elle arrive','arriver',[]],['ils le lui donnent','donner',[]],
 ['ils me la donnent','donner',[]],['ils vous les avaient données','donner',[[2,'required','z']]],
 ['il est arrivé','arriver',[[1,'optional','t']]],['on arrive','arriver',[[0,'required','n']]]
];
// Reviewed pronoun/negation cases: OQLF obligatory pronoun links, optional
// verbal/adverb links, and forbidden liaison before aspirated h / after et.
fixtures.push(
 ['elles y en avaient pas trouvé beaucoup','trouver',[[0,'required','z'],[2,'required','n']]],
 ["elles n’y en avaient pas trouvé beaucoup",'trouver',[[2,'required','n']]],
 ["elles n'y en avaient pas trouvé beaucoup",'trouver',[[2,'required','n']]],
 ['elles y vont','aller',[[0,'required','z']]],
 ['ils y arrivent','arriver',[[0,'required','z']]],
 ['nous y allons','aller',[[0,'required','z']]],
 ['vous y êtes','être',[[0,'required','z']]],
 ['on y arrive','arriver',[[0,'required','n']]],
 ['elles y en ont','avoir',[[0,'required','z'],[2,'required','n']]],
 ['je les y mets','mettre',[[1,'required','z']]],
 ['en y pensant','penser',[[0,'required','n']]],
 ['ils y ont pas été','être',[[0,'required','z'],[3,'optional','z']]],
 ['ils n’y ont pas été','être',[[3,'optional','z']]],
 ['ils en ont pas eu','avoir',[[0,'required','z'],[1,'required','n'],[3,'optional','z']]],
 ['ils n’en ont pas eu','avoir',[[1,'required','n'],[3,'optional','z']]],
 ['elles ne les ont pas aimés','aimer',[[2,'required','z'],[4,'optional','z']]],
 ['elles les ont pas aimés','aimer',[[1,'required','z'],[3,'optional','z']]],
 ['elle y arrive','arriver',[]],
 ['il y en a','avoir',[[2,'required','n']]],
 ['elles y','aller',[]], // An incomplete phrase remains uncertain.
 ['les yachts','voir',[]],['les héros','voir',[]],['et eux','voir',[]]
);
for(const [subject,form,sound] of [['nous','avons','z'],['vous','avez','z'],['ils','ont','z'],['elles','ont','z'],['on','a','n']]){
 fixtures.push(
  [`${subject} y en ${form}`,'avoir',[[0,'required',sound],[2,'required','n']]],
  [`${subject} y en ${form} pas`,'avoir',[[0,'required',sound],[2,'required','n']]],
  [`${subject} n’y en ${form} pas`,'avoir',[[2,'required','n']]],
  [`${subject} n'en ${form} pas`,'avoir',[[1,'required','n']]]
 );
}
const corpusPath=new URL('../outputs/liaison-audit-300/results.json',import.meta.url);
const corpus=fs.existsSync(corpusPath)?JSON.parse(fs.readFileSync(corpusPath)):[];
const strings=new Set();for(const text of [...fixtures.map(x=>x[0]),...corpus.map(x=>x.answer)]){strings.add(text);const w=text.split(/\s+/u);w.forEach(x=>strings.add(x));for(let i=0;i<w.length-1;i++){strings.add(w[i]+' '+w[i+1]);strings.add(w.slice(i).join(' '));strings.add(w.slice(i+1).join(' '));}}
const inputs=[...strings];const mod=await ESpeakNG({wasmBinary:fs.readFileSync(new URL('./js/vendor/espeak-ng.wasm',import.meta.url)),preRun:[m=>m.FS.writeFile('in.txt',inputs.map(x=>x+'.').join('\n'))],arguments:['--phonout','out.txt','--sep= ','-q','--ipa=3','-v','fr-fr','-f','in.txt']});
const lines=mod.FS.readFile('out.txt',{encoding:'utf8'}).trim().split('\n').filter(x=>x.trim());assert.equal(lines.length,inputs.length);const lookup=new Map(inputs.map((x,i)=>[x,lines[i]]));
for(const [text,verb,want]of fixtures){const result=await ctx.window.liaisonClues.analyze(text,{verb:{infinitive:verb}},async x=>lookup.get(x));assert.deepEqual(JSON.parse(JSON.stringify(result.links.map(l=>[l.index,l.kind,l.sound]))),want,text);}
let links=0;for(const row of corpus){const result=await ctx.window.liaisonClues.analyze(row.answer,{verb:{infinitive:row.verb}},async x=>lookup.get(x));links+=result.links.length;}
console.log(fixtures.length,'independent liaison fixtures PASS;',corpus.length,'audit answers analyzed;',links,'conservative clues');

// This is not a spelling-based exception: no confirmed added consonant means
// no clue, even in a grammatically plausible subject + y sentence.
for(const [sentenceIPA,tailIPA] of [['ɛlivɔ̃','ivɔ̃'],['ɛlzivɔ̃','iɡʁɛkvɔ̃']]){
 const isolated={window:{}};vm.createContext(isolated);vm.runInContext(fs.readFileSync(new URL('./js/liaisonClues.js',import.meta.url),'utf8'),isolated);
 const phonetics=new Map([['elles y vont',sentenceIPA],['elles','ɛl'],['y','iɡʁɛk'],['elles y','ɛliɡʁɛk'],['y vont',tailIPA]]);
 const result=await isolated.window.liaisonClues.analyze('elles y vont',{verb:{infinitive:'aller'}},async text=>phonetics.get(text));
 assert.equal(result.links.length,0,'Unconfirmed context must remain unmarked');
}
console.log('2 uncertain-pronunciation guards PASS');
