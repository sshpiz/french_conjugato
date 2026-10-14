const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const src=fs.readFileSync(path.join(__dirname,'../../js/script.js'),'utf8');
const helper=src.slice(src.indexOf('    const hasEnoughPracticeForRefresher ='),src.indexOf('    const getDailyRewardStageFromMetrics ='));
function eligible(entries){const storage=new Map(entries);return vm.runInNewContext(helper+'\nhasEnoughPracticeForRefresher()', {getScopedStorageKey:k=>'french:'+k,localStorage:{length:storage.size,key:i=>[...storage.keys()][i],getItem:k=>storage.get(k)}});}
assert.equal(eligible([]),false);
assert.equal(eligible([['french:activeStudyMs_a','600000']]),false);
assert.equal(eligible([['french:activeStudyMs_a','600001']]),true);
assert.equal(eligible([['french:activeStudyMs_a','300000'],['french:activeStudyMs_b','300001']]),true);
assert.equal(eligible([['spanish:activeStudyMs_a','900000'],['french:activeStudyMs_b','NaN']]),false);
const format=src.slice(src.indexOf('    const formatReopenElapsedText ='),src.indexOf('    const getElapsedOnlyReopenPrompt ='));
const apply=src.slice(src.indexOf('    const applyReopenMessagePrompt ='),src.indexOf('    const initializeReopenMessageState ='));
const state={FOCUSED_ONBOARDING:true,REOPEN_MESSAGE_THRESHOLD_MS:43200000,reopenMessageState:{elapsedMs:3*86400000}};vm.runInNewContext(format+apply+'\napplyReopenMessagePrompt()',state);assert.equal(state.reopenMessageState.body,'It’s been 3 days since your last conjugation.');
const {chromium}=require('/Users/simeon/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true});try{
for(const total of [0,900000]){
const ctx=await browser.newContext({serviceWorkers:'block',viewport:{width:393,height:851}});await ctx.addInitScript(ms=>{localStorage.setItem('frenchFocusedTutorialPreviewV1',JSON.stringify({active:false,completed:true,stepIndex:1}));localStorage.setItem('french:reopenMessageLastOpenAtV1',String(Date.now()-3*86400000));localStorage.setItem('french:activeStudyMs_2026_10_13',String(ms));},total);
const p=await ctx.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto('http://127.0.0.1:8876/proj1/french/',{waitUntil:'domcontentloaded'});await p.locator('#app-loader').waitFor({state:'hidden'});
await p.locator('#return-inline-message').waitFor({state:'visible'});
assert.match(await p.locator('#return-inline-message').innerText(),/It’s been 3 days since your last conjugation\./);
assert.equal(await p.locator('.focused-refresher').isVisible(),total>600000);
assert.equal(await p.locator('#tense-usage-hint').count(),1);
await p.screenshot({path:path.join(__dirname,'welcome-integrated-'+total+'.png')});assert.deepEqual(errors,[]);await ctx.close();
}
const ctx=await browser.newContext({serviceWorkers:'block'}),p=await ctx.newPage();await p.goto('http://127.0.0.1:8876/italian-verbs/',{waitUntil:'domcontentloaded'});await p.locator('#app-loader').waitFor({state:'hidden'});if(await p.locator('#tutorial-inline-skip-btn').isVisible())await p.locator('#tutorial-inline-skip-btn').click();await p.locator('#go-to-verb-btn').click();await p.getByRole('tab',{name:'Usage',exact:true}).click();assert(!(await p.locator('#vf-details-panel-usage').innerText()).includes('inherited candidates'));
await p.getByRole('tab',{name:'Conjugation',exact:true}).click();assert(await p.locator('.tense-usage-details').count()>0);await ctx.close();console.log('PASS: welcome elapsed text, threshold, cumulative/language isolation; real French welcome + hints; Italian 99de6de + hints.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
