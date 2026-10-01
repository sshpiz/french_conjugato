const {chromium}=require('/Users/simeon/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('assert/strict');
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true});try {
 const p=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
 p.on('pageerror',e=>errors.push(e.message));
 await p.addInitScript(()=>localStorage.setItem('frenchInlineTutorialStateV1',JSON.stringify({active:false,completed:true,stepIndex:20})));
 await p.goto('http://127.0.0.1:8765/proj1/dist/french/index.html',{waitUntil:'domcontentloaded'});
 await p.getByRole('button',{name:'Settings',exact:true}).click();
 await p.locator('#settings-v2-exercise-controls').getByLabel('Expressions',{exact:true}).check();
 await p.locator('#settings-v2-exercise-controls').getByLabel('Verbs',{exact:true}).uncheck();
 assert((await p.locator('#settings-v2-practice-summary').innerText()).startsWith('Expressions'));
 console.log(await p.locator('#settings-v2-practice-summary').innerText());
 await p.locator('#back-to-flashcard-from-options-btn').click();
 for(let i=0;i<4;i++){
  const label=(await p.locator('#verb-infinitive').innerText()).trim();
  assert(await p.evaluate(label=>verbs.find(v=>v.infinitive===label)?.verbExpression,label),label);
  await p.getByRole('button',{name:'Skip',exact:true}).filter({visible:true}).first().click();
 }
 await p.reload({waitUntil:'domcontentloaded'});
 await p.getByRole('button',{name:'Settings',exact:true}).click();
 assert(await p.locator('#settings-v2-exercise-controls').getByLabel('Expressions',{exact:true}).isChecked());
 await p.locator('#settings-v2-exercise-controls').getByLabel('Verbs',{exact:true}).check();
 await p.locator('#settings-v2-exercise-controls').getByLabel('Expressions',{exact:true}).uncheck();
 await p.locator('#back-to-flashcard-from-options-btn').click();
 assert(await p.evaluate(()=>!verbs.find(v=>v.infinitive===document.querySelector('#verb-infinitive').textContent.trim())?.verbExpression));
 assert.deepEqual(errors,[]);
 console.log('PASS: expressions remain in Conjugation; cards, reload persistence and single-verb filtering work.');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
