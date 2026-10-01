const {chromium}=require('/Users/simeon/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('assert/strict');
// Serve the workspace root on port 8765 before running this integration check.
(async()=>{const browser=await chromium.launch({headless:true,channel:'chrome'});const page=await browser.newPage({viewport:{width:390,height:844}});let errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.addInitScript(()=>{localStorage.setItem('frenchInlineTutorialStateV1',JSON.stringify({active:false,completed:true,stepIndex:20}));localStorage.setItem('french:ftue-shown','true');localStorage.setItem('french:tutorial_seen','yes');});
await page.goto('http://127.0.0.1:8765/proj1/dist/french/index.html?verb=faire%20attention',{waitUntil:'domcontentloaded'});await page.locator('#vf-details-tab-conjugation').waitFor();
assert.equal(await page.locator('.tense-block').count(),7);assert((await page.locator('#detail-tense-passeCompose').innerText()).includes("j'ai fait attention"));
await page.locator('#vf-details-tab-usage').click();assert((await page.locator('#vf-details-panel-usage').innerText()).includes('Je fais attention au bruit.'));
await page.locator('#vf-details-tab-family').click();assert((await page.locator('#vf-details-panel-family').innerText()).includes('Built on faire'));await page.locator('.vf-family-word').first().click();assert((await page.locator('.vf-family-definition:visible').innerText()).length>10);
await page.screenshot({path:'/private/tmp/expressions-family.png'});
await page.goto('http://127.0.0.1:8765/proj1/dist/french/index.html?verb=se%20rendre%20compte',{waitUntil:'domcontentloaded'});await page.locator('#vf-details-tab-conjugation').click();assert((await page.locator('#detail-tense-passeCompose').innerText()).includes("elle s'est rendu compte"));assert(!(await page.locator('#detail-tense-passeCompose').innerText()).includes('rendue'));
await page.goto('http://127.0.0.1:8765/proj1/dist/french/index.html?verb=passer%20un%20examen',{waitUntil:'domcontentloaded'});await page.locator('#vf-details-tab-conjugation').click();assert((await page.locator('#detail-tense-passeCompose').innerText()).includes('elle a passé un examen'));
await page.goto('http://127.0.0.1:8765/proj1/dist/french/index.html',{waitUntil:'domcontentloaded'});await page.waitForTimeout(700);
// A saved former expression mode must normalize back to Conjugation.
await page.evaluate(() => {
 const key=window.frenchLocalStorageKey;
 const options=JSON.parse(localStorage.getItem(key)||'{}');
 options.cardTypeMode='expressions';options.expressionFamily='everyday';
 localStorage.setItem(key,JSON.stringify(options));
});
await page.reload({waitUntil:"domcontentloaded"});
await page.getByRole('button',{name:'Settings',exact:true}).click();
assert.equal(await page.locator('#settings-v2-exercise-controls').getByRole('button',{name:'Expressions',exact:true}).count(),0);
assert.equal(await page.getByRole('button',{name:'Everyday',exact:true}).count(),0);
assert((await page.locator('#settings-v2-practice-summary').innerText()).startsWith('Verbs'));
await page.screenshot({path:'/private/tmp/reconciled-conjugation-settings.png'});
await page.goto('http://127.0.0.1:8765/proj1/dist/french/index.html#pronoun=je&verb=parler&tense=present',{waitUntil:'domcontentloaded'});
await page.locator('#construction-pattern').waitFor();
assert.equal(await page.locator('#construction-pattern .construction-example-label').textContent(),'Par exemple');
const placement=await page.evaluate(()=>{
 const pattern=document.getElementById('construction-pattern'),answer=document.getElementById('phrase-container');
 return {follows:!!(answer.compareDocumentPosition(pattern)&Node.DOCUMENT_POSITION_FOLLOWING),order:getComputedStyle(pattern).order};
});
assert(placement.follows);assert.equal(placement.order,'10');
await page.screenshot({path:'/private/tmp/reconciled-pattern-bottom.png'});
console.log('Passed: Conjugation controls, legacy-mode fallback, Par exemple below answer, expression tables and detail tabs.');
assert.equal(errors.length,0,errors.join('\n'));await browser.close()})().catch(e=>{console.error(e);process.exit(1)});
