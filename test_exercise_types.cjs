const {chromium}=require('/Users/simeon/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('assert/strict');
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true});try {
 const p=await browser.newPage({viewport:{width:390,height:844}}), errors=[];
 p.on('pageerror',e=>errors.push(e.message));
 await p.addInitScript(()=>localStorage.setItem('frenchInlineTutorialStateV1',JSON.stringify({active:false,completed:true,stepIndex:20})));
 await p.goto('http://127.0.0.1:8765/proj1/dist/french/index.html',{waitUntil:'domcontentloaded'});
 await p.getByRole('button',{name:'Settings',exact:true}).click();
 const types=p.locator('#settings-v2-exercise-controls');
 await types.getByLabel('Expressions',{exact:true}).check();
 await types.getByLabel('Verbs',{exact:true}).uncheck();
 assert(!/fill\s*blanks/i.test(await p.locator('body').innerText()));
 for(const count of [20,50]) {
  await p.locator('.verb-pool-pill').getByText('Top '+count,{exact:true}).click();
  assert.match(await p.locator('.verb-pool-summary').innerText(),new RegExp('^'+count+' expressions'));
 }
 console.log('Expression pools: 20 and 50');
 await types.getByLabel('Verbs',{exact:true}).check();
 await types.getByLabel('Verbs with pronoun replacement',{exact:true}).check();
 await p.locator('#back-to-flashcard-from-options-btn').click();
 const seen=new Set();
 for(let i=0;i<9;i++) {
  const family=await p.evaluate(()=>{
   if(!document.getElementById('verb-reference').hidden)return 'references';
   const name=document.getElementById('verb-infinitive').textContent.trim();
   return verbs.find(v=>v.infinitive===name)?.verbExpression?'expressions':'verbs';
  }); seen.add(family);
  await p.getByRole('button',{name:'Skip',exact:true}).filter({visible:true}).first().click();
 }
 assert.equal(seen.size,3); console.log('Mixed families', [...seen]);
 await p.reload({waitUntil:'domcontentloaded'});
 await p.getByRole('button',{name:'Settings',exact:true}).click();
 assert.equal(await types.locator('input:checked').count(),3);
 p.on('dialog',dialog=>dialog.accept(dialog.message()==='Drill name'?'All three test':'Saved combination'));
 await p.getByRole('button',{name:'Save',exact:true}).click();
 await p.locator('[data-preset-key="builtin:verbs-expressions-50"]').click();
 assert.deepEqual(await p.evaluate(()=>window.cardGenerationOptions.exerciseTypes),['verbs','expressions']);
 await p.locator('[data-preset-key="builtin:pronoun-replacement"]').click();
 assert.deepEqual(await p.evaluate(()=>window.cardGenerationOptions.exerciseTypes),['references']);
 await p.locator('#saved-drills-container .preset-btn').filter({hasText:'All three test'}).click();
 assert.deepEqual(await p.evaluate(()=>window.cardGenerationOptions.exerciseTypes),['verbs','expressions','references']);
 await p.locator('#settings-v2-exercise-controls').scrollIntoViewIfNeeded();
 await p.screenshot({path:'/private/tmp/exercise-types.png'});
 assert.deepEqual(errors,[]);
 console.log('PASS: checkboxes, hidden fill blanks, mixed cards, Top N, persistence and preset options.');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
