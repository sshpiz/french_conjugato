const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const source = fs.readFileSync(require('node:path').join(__dirname, '../../js/script.js'), 'utf8');
const start = source.indexOf('    const ensureExtraFrenchVerbDataLoaded =');
const end = source.indexOf('    const scheduleExtraFrenchVerbDataLoad =', start);
async function check({currentCard = null, empty = true, fail = false}) {
  let finish, calls = 0, retries = 0;
  const state = {status:'idle',promise:null};
  const settings = {exerciseTypes:['expressions'],tenseWeights:{present:1},frequencyWeights:{top500:1}};
  const context = vm.createContext({
    FRENCH_VERB_DATA_SPLIT:{extraUrl:'extra.json'}, frenchExtraVerbDataState:state,
    window:{location:{href:'https://example.test/french/'}}, URL, Date,
    fetch:()=>{ calls++; return new Promise(resolve=>{finish=()=>resolve({ok:!fail,status:503,json:async()=>({})});}); },
    mergeExtraFrenchVerbData:()=>({verbsAdded:0,tensesAdded:1}), optionsView:null,
    currentCard, flashcard:{classList:{contains:()=>empty}},
    cardGenerationOptions:settings,
    nextCard:()=>{ retries++; assert.equal(settings.frequencyWeights.top500, 1); },
  });
  vm.runInContext(source.slice(start,end)+'\nglobalThis.load = ensureExtraFrenchVerbDataLoaded;',context);
  const pending = context.load('test');
  assert.equal(context.load('duplicate'), pending);
  assert.equal(retries,0);
  finish(); await pending;
  assert.equal(calls,1);
  assert.equal(retries,!currentCard && empty && !fail ? 1 : 0);
  if (!fail) { await context.load('again'); assert.equal(calls,1); }
}
(async()=>{await check({});await check({currentCard:{verb:'aller'}});await check({empty:false});await check({fail:true});console.log('PASS: delayed data recovers only an empty card; failures and existing cards are preserved.');})();
