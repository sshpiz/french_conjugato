const vm=require('vm'),fs=require('fs'),assert=require('assert'),zlib=require('zlib');
const repo=__dirname;
const state={};
const c={window:{},location:{pathname:'/preview/'},localStorage:{getItem:k=>state[k]||null,setItem:(k,v)=>state[k]=v},document:{getElementById:()=>null}};
vm.createContext(c);
const core=fs.existsSync(repo+'/verb_core_patterns.json');
vm.runInContext(fs.readFileSync(repo+(core?'/verb_core_patterns.js':'/verb_usages.js'),'utf8'),c);
vm.runInContext(fs.readFileSync(repo+'/js/constructionCards.js','utf8'),c);
const groups=core?c.window.verbCorePatterns.map(r=>[r.verb,r.core_patterns]):Object.entries(Object.groupBy(c.window.verbUsages,r=>r.verb));
let source=fs.readFileSync(repo+'/js/verbs.full.generated.js','utf8');const packed=source.match(/compressedBase64\s*=\s*"([^"]+)"/);if(packed)source=zlib.gunzipSync(Buffer.from(packed[1],'base64')).toString();const defs=vm.runInNewContext(source+'; verbs');
const expanded=fs.existsSync(repo+'/CONSTRUCTION_COVERAGE.json');
const wanted=defs.filter(v=>(expanded ? ['top20','top-20','top50','top-50','top100','top-100','top500','top-500'] : ['top20','top-20']).includes(v.frequency)).map(v=>v.infinitive).sort();
if(expanded){
 const coverage=JSON.parse(fs.readFileSync(repo+'/CONSTRUCTION_COVERAGE.json','utf8'));
 assert.deepEqual(coverage.verbs.slice().sort(),wanted);
}
const selected=groups.filter(([verb,rows])=>rows.some(r=>r.drill_pattern));
const selectedNames=selected.map(([v])=>v).sort();
assert(selectedNames.every(v=>wanted.includes(v)), 'drill patterns must stay inside the configured coverage band');
const uncovered=wanted.filter(v=>!selectedNames.includes(v));
const explicitlyReferenceOnly=new Set(groups.filter(([,rows])=>rows.some(r=>r.reference_pattern)).map(([verb])=>verb));
assert(uncovered.every(v=>explicitlyReferenceOnly.has(v)), `uncovered verbs need an explicit reference-only decision: ${uncovered.filter(v=>!explicitlyReferenceOnly.has(v)).join(', ')}`);
let count=0;
for(const [verb,rows] of selected){
 const entries=rows.filter(r=>r.drill_pattern);
 assert.equal(new Set(entries.map(e=>e.pattern_id||e.sense_id)).size,entries.length);
 for(const entry of entries){
  const original={verb:{infinitive:verb},tense:entry.drill_pattern.allowed_tenses?.[0] || 'present',pronoun:'vous',conjugated:'MORPHOLOGY'};
  const result=c.window.constructionCards.prepare(original,rows);
  assert.equal(result.conjugated,'MORPHOLOGY');assert.equal(original._patternEntry,undefined);
  assert.equal(result._patternEntry,entry);
  assert.equal(c.window.constructionCards.prepare(result,rows)._patternEntry,entry);
  assert.equal(c.window.constructionCards.prepare(original,rows)._patternEntry,entry);
  assert.equal(c.window.constructionCards.label(entry),entry.drill_pattern.text);
  const audio=c.window.constructionCards.audio(result,'conj:'+verb,'MORPHOLOGY');
  assert.equal(audio.audioId,'conj:'+verb);assert.equal(audio.text,'MORPHOLOGY');
  assert(!/qqn|qqch|France|Carla|Marie/.test(entry.drill_pattern.text));
  if(expanded){
   const proof=entry.drill_pattern.verification;
   assert.equal(new Set(proof.checks.map(x=>x.model)).size,2);
   assert(proof.checks.every(x=>x.source_url && /^[a-f0-9]{64}$/.test(x.source_sha256)));
  }
  count++;
 }
 for(const tense of ['present','imparfait','futurSimple','passeCompose','plusQueParfait','conditionnelPresent','subjonctifPresent','imperfect','preterite','future','conditional','presentSubjunctive','imperative']){
  const input={verb:{infinitive:verb},tense,conjugated:'UNCHANGED'};
  assert.equal(c.window.constructionCards.prepare(input,rows).conjugated,'UNCHANGED');
 }
 for(const special of [{isFrameCard:true},{isPhraseMode:true}]){
  const input={verb:{infinitive:verb},conjugated:'BASE',...special};assert.equal(c.window.constructionCards.prepare(input,rows),input);
 }
}
const absent={verb:{infinitive:'unknown'},conjugated:'BASE'};assert.equal(c.window.constructionCards.prepare(absent,[]),absent);
const json=JSON.parse(fs.readFileSync(repo+(core?'/verb_core_patterns.json':repo.includes('spanish')?'/spanish_usages.json':'/catalan_usages.json'),'utf8'));
assert.equal(JSON.stringify(json),JSON.stringify(core?c.window.verbCorePatterns:c.window.verbUsages));
console.log(`${repo}: ${selected.length}/${wanted.length} verbs have ${count} shared drill patterns; ${uncovered.length} explicitly reference-only headwords; morphology/audio unchanged, stable selection, mode exclusions and JSON/JS parity pass.`);

// A prior preference to hide patterns must never change the answer.
const off={window:{},location:{pathname:'/preview/'},localStorage:{getItem:()=> 'off'},document:{getElementById:()=>null}};
vm.createContext(off);vm.runInContext(fs.readFileSync(repo+'/js/constructionCards.js','utf8'),off);
const [verb,records]=selected[0];
const hidden=off.window.constructionCards.prepare({verb:{infinitive:verb},conjugated:'ANSWER'},records);
assert.equal(hidden._patternEntry,null);assert.equal(hidden.conjugated,'ANSWER');assert(hidden._hasPatterns);
if(core){
 const patterns=new Set(groups.flatMap(([,rows])=>rows.map(r=>r.pattern_id)));
 const usages=JSON.parse(fs.readFileSync(repo+'/verb_usages.json','utf8'));
 for(const u of usages) if(u.core_pattern_id) assert(patterns.has(u.core_pattern_id),u.sense_id);
}

const restricted={pattern_id:'restricted',pattern:'venir de + infinitif',drill_pattern:{text:'venir de + infinitif',status:'private_preview',allowed_tenses:['present','imparfait']}};
const compound={verb:{infinitive:'venir'},tense:'passeCompose',conjugated:'suis venu'};
assert.equal(c.window.constructionCards.prepare(compound,[restricted]),compound);
