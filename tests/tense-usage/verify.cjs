const {chromium}=require(process.env.PLAYWRIGHT_PATH || '/Users/simeon/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'), fs=require('node:fs'), path=require('node:path');
const base=process.env.PREVIEW_URL || 'http://127.0.0.1:8876/';
const apps={french:'proj1/french/',spanish:'spanish-verbs/',catalan:'catalan-verbs/',portuguese:'portuguese-verbs/',italian:'italian-verbs/'};
const settle=p=>p.waitForTimeout(700);
(async()=>{
const b=await chromium.launch({channel:'chrome',headless:true});
const results=[];
try {
 // Same browser origin/session deliberately exercises cross-language persistence isolation.
 const ctx=await b.newContext({viewport:{width:393,height:851},serviceWorkers:'block',reducedMotion:'reduce'});
 const p=await ctx.newPage();p.setDefaultTimeout(12000);
 const errors=[];p.on('pageerror',e=>errors.push(e.message));
 for(const [language,route] of Object.entries(apps)){
  console.log('Checking '+language);
  await p.goto(base+route);await p.locator('#app-loader').waitFor({state:'hidden'});await settle(p);
  const hint=p.locator('#tense-usage-hint');await hint.waitFor({state:'visible'});
  const first=await hint.getAttribute('data-tense');
  assert.equal(first,'present',language+' initial tense');
  const copy=await hint.locator('.tense-usage-content').innerText();
  const placement=await hint.evaluate(el=>({top:el.getBoundingClientRect().top,after:document.querySelector('#phrase-container').getBoundingClientRect().bottom,border:getComputedStyle(el).borderLeftWidth}));
  assert(placement.top>=placement.after-1,language+' hint follows answer area');
  assert.equal(placement.border,'0px',language+' quiet unboxed hint');
  // Reveal preserves the hint; a different tense immediately replaces it without dismissing it.
  await p.locator('#answer-flow-btn').click();await settle(p);
  assert.equal(await hint.getAttribute('data-tense'),first);
  const other=language==='french'?'futurSimple':'future';
  await p.evaluate(t=>window.TenseUsage.encounter(t),other);
  assert.equal(await hint.getAttribute('data-tense'),other);
  assert.equal(await hint.count(),1);
  await p.evaluate(()=>window.TenseUsage.encounter('missing-tense'));
  assert.equal(await hint.count(),0);
  await p.evaluate(()=>window.TenseUsage.encounter('present'));
  assert.equal(await hint.getAttribute('data-tense'),first);
  assert.equal(await p.evaluate(l=>localStorage.getItem(l+':tense-usage-dismissed:v1:present'),language),null);
  // Mobile and desktop flow: controls remain in viewport and accept pointer events.
  for(const [width,height] of [[320,568],[393,851],[1440,1000]]){
   await p.setViewportSize({width,height});await settle(p);
   const fit=await p.evaluate(()=>{
    const btn=document.querySelector('#answer-flow-btn'),r=btn.getBoundingClientRect();
    const target=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);
    return {width:document.documentElement.scrollWidth,bottom:r.bottom,top:r.top,clickable:!!target&&btn.contains(target)};
   });
   assert(fit.width<=width+1,language+' horizontal overflow');
   assert(fit.bottom<=height+1&&fit.top>=0&&fit.clickable,language+' practice controls blocked '+JSON.stringify(fit));
   await p.screenshot({path:path.join(__dirname,language+'-'+width+'.png')});
  }
  await p.setViewportSize({width:393,height:851});
  await hint.locator('button').click();
  assert.equal(await p.evaluate(l=>localStorage.getItem(l+':tense-usage-dismissed:v1:present'),language),'1');
  assert.equal(await hint.count(),0,'Got it must not reveal a queued hint');
  await p.evaluate(t=>window.TenseUsage.encounter(t),other);
  assert.equal(await hint.getAttribute('data-tense'),other,'undismissed tense returns');
  await p.evaluate(()=>window.TenseUsage.encounter('present'));
  assert.equal(await hint.count(),0,'dismissed current tense hides preceding hint');
  if(await p.locator('#tutorial-inline-skip-btn').isVisible()) await p.locator('#tutorial-inline-skip-btn').click();
  await p.reload();await p.locator('#app-loader').waitFor({state:'hidden'});await settle(p);
  await p.evaluate(()=>window.TenseUsage.encounter('present'));
  assert.equal(await p.locator('#tense-usage-hint[data-tense="present"]').count(),0,language+' persisted');
  if(language !== 'italian') {
   const share=p.locator('#question-share > summary');
   assert.equal((await share.innerText()).trim(),'');
   assert(await share.getAttribute('aria-label'));
   for(const width of [320,393,1440]) {
    await p.setViewportSize({width,height:851});
    const a=await share.boundingBox(),badge=await p.locator('#verb-frequency').boundingBox();
    assert(Math.abs(a.y+a.height/2-badge.y-badge.height/2)<1,language+' aligned share and frequency');
    assert(badge.x+badge.width<=a.x,language+' separate targets');
    assert(a.width>=44&&a.height>=44);
   }
   await p.setViewportSize({width:393,height:851});
   await p.screenshot({path:path.join(__dirname,language+'-share-alignment.png')});
   await share.click();
   assert(await p.locator('#copy-question-link-btn').isVisible());
   await share.click();
  }
  // Reopen through actual Verb Details navigation, then the tense's Usage disclosure.
  await p.locator(language==='italian' ? '#go-to-verb-btn' : '#verb-details-dock-btn').click();await settle(p);
  await p.getByRole('tab',{name:'Conjugation',exact:true}).click();
  const usage=p.locator('#detail-tense-present .tense-usage-details');
  const header=p.locator('#detail-tense-present .tense-header');
  const closed=await usage.boundingBox();
  assert(closed.height<=1,language+' closed Usage adds no row');
  const control=await usage.locator(':scope > summary').boundingBox(), title=await header.boundingBox();
  assert(control.x>title.x && control.y<title.y+title.height && control.y+control.height>title.y,language+' Usage beside heading');
  await usage.locator(':scope > summary').click();
  assert.equal(await usage.locator('.tense-usage-content').innerText(),copy,language+' same information');
  const more=usage.locator('.tense-usage-more');
  assert.equal(await more.getAttribute('open'),null);
  await more.locator('summary').click();
  assert(await more.locator('p').isVisible());
  assert((await more.locator('p').innerText()).length>60);
  await p.screenshot({path:path.join(__dirname,language+'-details.png')});
  await more.locator('summary').click();
  assert(!await more.locator('p').isVisible());
  // Every canonical tense has a summary and 1–2 translated examples in Details.
  const coverage=await p.evaluate(l=>Object.keys(window[l+'TenseKeyToLabel']).map(id=>{
   const d=document.querySelector('#detail-tense-'+id+' .tense-usage-details');
   return {id,summary:d?.querySelector('.tense-usage-summary')?.textContent,more:d?.querySelector('.tense-usage-more p')?.textContent,examples:d?.querySelectorAll('.tense-usage-example').length,translations:[...d?.querySelectorAll('.tense-usage-translation')||[]].every(x=>x.textContent.length>0)};
  }),language);
  assert(coverage.every(x=>x.summary&&x.more&&x.examples>=1&&x.examples<=2&&x.translations),JSON.stringify(coverage));
  // Reset all canonical dismissals from App settings, preserving other languages/preferences.
  await p.goto(base+route);await p.locator('#app-loader').waitFor({state:'hidden'});await settle(p);
  await p.evaluate(l=>{
   for(const id of Object.keys(window[l+'TenseKeyToLabel'])) localStorage.setItem(l+':tense-usage-dismissed:v1:'+id,'1');
   localStorage.setItem('other-language:tense-usage-dismissed:v1:present','1');
   localStorage.setItem(l+':unrelated-preference','keep');
  },language);
  await p.locator('#options-toggle-btn').click();
  await p.getByRole('tab',{name:'App',exact:true}).click();
  const reset=p.getByRole('button',{name:'Reset tense hints',exact:true});
  await reset.click();
  assert.match(await p.locator('#reset-tense-hints-status').innerText(),/Tense hints reset/);
  assert.equal(await p.locator('#tense-usage-toggle').count(),0);
  assert(await p.evaluate(l=>Object.keys(window[l+'TenseKeyToLabel']).every(id=>localStorage.getItem(l+':tense-usage-dismissed:v1:'+id)===null),language));
  assert.equal(await p.evaluate(()=>localStorage.getItem('other-language:tense-usage-dismissed:v1:present')),'1');
  assert.equal(await p.evaluate(l=>localStorage.getItem(l+':unrelated-preference'),language),'keep');
  assert.equal(await p.locator('#tense-usage-hint').count(),1,'reset restores current hint in memory');
  await p.screenshot({path:path.join(__dirname,language+'-reset-settings.png')});
  await p.goto(base+route);await p.locator('#app-loader').waitFor({state:'hidden'});await settle(p);
  await p.locator('#tense-usage-hint').waitFor({state:'visible'});
  results.push({language,tenses:coverage.length,passed:['first encounter','explicit dismissal','persistence after reload','language isolation','no timer or answer dismissal','current-tense switching without a queue','same content via Verb Details','canonical coverage','reset all tenses from App','reset persists and isolates language/preferences','320/393/1440 controls and overflow']});
 }
 assert.deepEqual(errors,[]);
 await ctx.close();
 // Module-level edge cases in a real DOM, including blocked persistence and absent metadata.
 const edge=await b.newContext({serviceWorkers:'block'});const q=await edge.newPage();
 await q.goto(base+'spanish-verbs/');await q.locator('#app-loader').waitFor({state:'hidden'});
 await q.evaluate(()=>{localStorage.clear();document.body.innerHTML='<div id="flashcard"><div class="meta-container"></div><div id="phrase-container"></div></div><button id="answer-flow-btn">Answer</button><div id="details"></div>';});
 const source=fs.readFileSync(path.join(__dirname,'../../../spanish-verbs/js/tenseUsage.js'),'utf8');
 await q.addScriptTag({content:source});
 await q.evaluate(()=>{TenseUsage.encounter('unknown');TenseUsage.appendDetails(document.querySelector('#details'),'unknown');});
 assert.equal(await q.locator('#tense-usage-hint, .tense-usage-details').count(),0);
 await q.evaluate(()=>{Storage.prototype.getItem=()=>{throw Error('blocked')};Storage.prototype.setItem=()=>{throw Error('blocked')};TenseUsage.encounter('future');});
 assert.match(await q.locator('.tense-usage-content').innerText(),/Future actions or guesses about the present\./);
 await q.getByRole('button',{name:/Dismiss usage/}).click();
 await q.evaluate(()=>TenseUsage.encounter('future'));assert.equal(await q.locator('#tense-usage-hint').count(),0);
 await edge.close();
 fs.writeFileSync(path.join(__dirname,'results.json'),JSON.stringify({results,edgeCases:['missing metadata','blocked storage session dismissal'],errors},null,2));
 console.log(JSON.stringify(results,null,2));
} finally {await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
