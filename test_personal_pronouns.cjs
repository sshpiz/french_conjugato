const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict'),path=require('path');
const root=path.resolve(__dirname,'..');
const suites={
fr:{repo:'proj1',file:'referenceCards.js',api:'referenceCards',subject:'ils',single:[
['voir','il','present','il voit',0,'il me voit'],['écouter','elle','present','elle écoute',1,"elle t'écoute"],['aimer','ils','present','ils aiment',2,'ils nous aiment'],['attendre','elle','present','elle attend',3,'elle vous attend'],['voir','il','passeCompose','il a vu',6,'il nous a vues'],['comprendre','elle','plusQueParfait','elle avait compris',6,'elle nous avait comprises'],['comprendre','elle','passeCompose','elle a compris',2,'elle nous a compris'],['écrire','elle','passeCompose','elle a écrit',2,'elle nous a écrit'],['téléphoner','ils','present','ils téléphonent',0,'ils me téléphonent'],['appeler','elles','present','elles appellent',0,"elles m'appellent"]],double:[
['donner','il','present','il donne',0,4,'il me le donne'],['donner','elle','present','elle donne',1,5,'elle te la donne'],['envoyer','elle','present','elle envoie',0,4,"elle me l'envoie"],['donner','il','passeCompose','il a donné',2,6,'il nous les a données'],['offrir','elles','plusQueParfait','elles avaient offert',1,7,"elles vous l'avaient offerte"]]},
es:{repo:'spanish-verbs',file:'exercisePractice.js',api:'exercisePractice',subject:'ellos',single:[
['ver','él','present','ve',0,'él me ve'],['escuchar','ella','present','escucha',1,'ella te escucha'],['conocer','ellos','present','conocen',2,'ellos nos conocen'],['ayudar','ellas','present','ayudan',3,'ellas os ayudan'],['escribir','él','preterite','escribió',2,'él nos escribió'],['invitar','ella','conditional','invitaría',0,'ella me invitaría']],double:[
['dar','él','present','da',0,4,'él me lo da'],['enviar','ella','present','envía',1,5,'ella te la envía'],['ofrecer','ellos','present','ofrecen',2,6,'ellos nos los ofrecen'],['mostrar','ellas','imperfect','mostraban',3,7,'ellas os las mostraban']]},
ca:{repo:'catalan-verbs',file:'exercisePractice.js',api:'exercisePractice',subject:'ells',single:[
['veure','ell','present','ell veu',0,'ell em veu'],['escoltar','ella','present','ella escolta',1,"ella t'escolta"],['conèixer','ells','present','ells coneixen',2,'ells ens coneixen'],['ajudar','elles','present','elles ajuden',3,'elles us ajuden'],['escriure','ell','preterite','ell va escriure',2,'ell ens va escriure'],['imaginar','ella','present','ella imagina',0,"ella m'imagina"]],double:[
['donar','ell','present','ell dona',0,4,"ell me'l dona"],['donar','ell','present','ell dona',1,4,'ell me la dona'],['donar','ell','present','ell dona',2,4,"ell me'ls dona"],['donar','ell','present','ell dona',3,4,'ell me les dona'],['enviar','ella','present','ella envia',0,5,"ella te l'envia"],['enviar','ella','present','ella envia',1,5,"ella te l'envia"],['donar','elles','present','elles donen',0,6,'elles ens el donen'],['enviar','elles','present','elles envien',1,6,"elles ens l'envien"],['donar','ells','present','ells donen',3,7,'ells us les donen'],['donar','ell','preterite','ell va donar',0,4,"ell me'l va donar"]]}
};
for(const [lang,suite]of Object.entries(suites)){
 const ctx={window:{}};vm.createContext(ctx);vm.runInContext(fs.readFileSync(path.join(root,suite.repo,'js',suite.file),'utf8'),ctx);const api=ctx.window[suite.api];
 const card=(v,p,t,f)=>({verb:{infinitive:v},pronoun:p,tense:t,conjugated:f});
 for(const [v,p,t,f,i,want]of suite.single)assert.equal(api.personalReference(card(v,p,t,f),i)?.conjugated,want);
 for(const [v,p,t,f,o,r,want]of suite.double)assert.equal(api.doubleReference(card(v,p,t,f),o,r)?.conjugated,want);
 // Independent complete cluster tables, including vowel-dependent Catalan spellings.
 const clusters=lang==='fr'?[
  ['me le','me la','me les'],['te le','te la','te les'],['nous le','nous la','nous les'],['vous le','vous la','vous les']
 ]:lang==='es'?[
  ['me lo','me la','me los','me las'],['te lo','te la','te los','te las'],['nos lo','nos la','nos los','nos las'],['os lo','os la','os los','os las']
 ]:[
  ["me'l",'me la',"me'ls",'me les'],["te'l",'te la',"te'ls",'te les'],['ens el','ens la','ens els','ens les'],['us el','us la','us els','us les']
 ];
 for(let i=0;i<4;i++)for(let o=0;o<clusters[i].length;o++){
  const verb=lang==='fr'?'donner':lang==='es'?'dar':'donar',form=lang==='fr'?'donnent':lang==='es'?'dan':'donen';
  assert.equal(api.doubleReference(card(verb,suite.subject,'present',form),o,i+4).conjugated,suite.subject+' '+clusters[i][o]+' '+form);
  if(lang!=='es'){
   const base=lang==='fr'?['me','te','nous','vous'][i]:['me','te','ens','us'][i];
   const cluster=o<2?base+" l'":clusters[i][o];
   const v=lang==='fr'?'envoyer':'enviar',f=lang==='fr'?'envoient':'envien';
   assert.equal(api.doubleReference(card(v,suite.subject,'present',f),o,i+4).conjugated,suite.subject+' '+cluster+(cluster.endsWith("'")?'':' ')+f);
  }
 }
 const selves=lang==='fr'?['je','tu','nous','vous']:lang==='es'?['yo','tú','nosotros','vosotros']:['jo','tu','nosaltres','vosaltres'];
 for(let i=0;i<4;i++){
  assert.equal(api.personalReference(card(Object.keys(api.personalConfig.direct)[0],selves[i],'present','x'),i),null);
  assert.equal(api.doubleReference(card(api.doubleVerbs[0],selves[i],'present','x'),0,4+i),null);
 }
 vm.runInContext(fs.readFileSync(path.join(root,suite.repo,'js',lang==='fr'?'verbs.full.generated.js':'verbs.full.js'),'utf8')+';globalThis.tables=tenses',ctx);
 let singles=0,doubles=0;const verbs=Object.keys({...api.personalConfig.direct,...api.personalConfig.indirect});
 for(const v of verbs){
  assert(ctx.tables.present[v],v);assert(api.personalUsageEntries(v).length>=4,v);
  for(const [t,table]of Object.entries(ctx.tables))for(const [p,f]of Object.entries(table[v]||{})){
   if(!f||f==='—')continue;
   const c=card(v,p.split('/')[0],t,f);
   if(t==='imperative'){assert.equal(api.personalReference(c,0),null);continue;}
   for(const i of api.personalIndices(c)){
    const result=api.personalReference(c,i);assert(result,v+' '+t);assert(!/undefined|\bnull\b/.test(result.conjugated));singles++;
   }
  }
 }
 for(const v of api.doubleVerbs)for(const [t,table]of Object.entries(ctx.tables))for(const [p,f]of Object.entries(table[v]||{})){
  if(!f||f==='—'||t==='imperative')continue;
  const c=card(v,p.split('/')[0],t,f);
  for(const i of api.personalIndices(c,true))for(let o=0;o<(lang==='fr'?3:4);o++){
   const result=api.doubleReference(c,o,i+4);assert(result,v+' '+t);assert.equal(result.references.length,2);doubles++;
  }
 }
 // The ordinary generation path includes personal-only verbs and never returns a plain card.
 const personOnly=verbs.find(v=>!api.specs[v]);assert(personOnly);
 if(lang==='fr'){
  for(const mode of ['one','mixed']){ctx.window.cardGenerationOptions={referenceObjects:mode};assert(api.supports(personOnly));for(let i=0;i<10;i++)assert(api.prepare(card(personOnly,'ils','present',ctx.tables.present[personOnly]['ils/elles'])).personalPronoun);}
 }else{
  for(const mode of ['one','mixed']){
   const options={exerciseTypes:['references'],referenceObjects:mode,tenseWeights:{present:1},frequencyWeights:{top500:1}};
   const v={infinitive:personOnly,frequency:'top500'};assert(api.eligible(v,options));
   for(let i=0;i<10;i++)assert(api.generate(options,[v],ctx.tables).personalPronoun);
  }
 }
 console.log(lang,verbs.length,'single verbs;',api.doubleVerbs.length,'double verbs;',singles,'single +',doubles,'double combinations PASS');
}
