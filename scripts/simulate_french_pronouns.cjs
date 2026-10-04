// Conditional pronoun-deck simulation. Equal verb/tense/subject sampling; this
// deliberately excludes app frequency weights, other decks and user history.
const fs=require('fs'),vm=require('vm'),path=require('path');
const root=path.resolve(__dirname,'..');let seed=20261001;
const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
const math=Object.create(Math);math.random=random;const ctx={window:{},Math:math};vm.createContext(ctx);
for(const file of ['verbs.full.generated.js','referenceCards.js','referenceInventory.js','referenceEnYInventory.js','referenceEnY.js','referenceExpansion.js','referenceNegation.js'])vm.runInContext(fs.readFileSync(path.join(root,'js',file),'utf8')+(file.startsWith('verbs.')?';globalThis.data={verbs,tenses}':''),ctx);
const api=ctx.window.referenceCards,pick=items=>items[Math.floor(random()*items.length)],results=[];
for(const top of [50,500,5000])for(const mode of ['one','mixed','two']){
 ctx.window.cardGenerationOptions={referenceObjects:mode,referenceNegation:'mixed'};
 const verbs=ctx.data.verbs.filter(v=>api.supports(v.infinitive)&&Number(String(v.frequency).replace(/\D/g,''))<=top&&/\d/.test(v.frequency));
 const counts={},negation={},tenseCounts={};
 for(let i=0;i<30000;i++){
  const verb=pick(verbs),tense=pick(Object.keys(ctx.data.tenses)),rows=ctx.data.tenses[tense][verb.infinitive];
  const pronoun=pick(Object.keys(rows)),card=api.prepareNegation(api.prepare({verb,tense,pronoun,conjugated:rows[pronoun]}));
  const answer=card.conjugated;
  const type=card.doublePronoun?'double':card.personalPronoun?'personal me/te/nous/vous':/ à (lui|elle|eux|elles)$/.test(answer)?'tonic':/\by\b|[’']y\b/.test(answer)?'y':/\ben\b|[’']en\b/.test(answer)?'en':/\b(lui|leur)\b/.test(answer)?'lui/leur':'le/la/les';
  counts[type]=(counts[type]||0)+1;negation[card.negationStyle||'affirmative']=(negation[card.negationStyle||'affirmative']||0)+1;tenseCounts[tense]=(tenseCounts[tense]||0)+1;
 }
 results.push({top,mode,eligibleVerbs:verbs.length,samples:30000,types:counts,forms:negation,tenses:tenseCounts});
}
const output={seed:20261001,assumptions:'Conditional pronoun deck only. Equal eligible verbs, seven tenses and six source subject rows. Frequency buckets, not exact rank. Uses real prepare() but not user-specific deck/frequency weights or history.',results};
fs.writeFileSync(path.join(root,'outputs/pronoun-balance/simulation.json'),JSON.stringify(output,null,2)+'\n');
for(const r of results)console.log('Top',r.top,r.mode,r.eligibleVerbs,'verbs',Object.fromEntries(Object.entries(r.types).map(([k,v])=>[k,(100*v/r.samples).toFixed(1)+'%'])));
