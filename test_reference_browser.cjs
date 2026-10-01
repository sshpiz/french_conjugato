const {chromium}=require('/Users/simeon/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('assert/strict');
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true});try {
 const p=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
 p.on('pageerror',e=>errors.push(e.message));
 await p.addInitScript(()=>localStorage.setItem('frenchInlineTutorialStateV1',JSON.stringify({active:false,completed:true,stepIndex:20})));
 await p.goto('http://127.0.0.1:8765/proj1/dist/french/index.html',{waitUntil:'domcontentloaded'});
 await p.getByRole('button',{name:'Settings',exact:true}).click();
 await p.locator('#settings-v2-exercise-controls').getByLabel('Verbs with pronoun replacement',{exact:true}).check();
 await p.locator('#settings-v2-exercise-controls').getByLabel('Verbs',{exact:true}).uncheck();
 await p.locator('#back-to-flashcard-from-options-btn').click();
 for(let i=0;i<6;i++){
  assert(await p.locator('#verb-reference').isVisible());
  assert.match(await p.locator('#verb-reference').innerText(),/ce truc|cette chose|ces choses|cet endroit/);
  assert.equal(await p.locator('#conjugated-verb').getAttribute('data-audio-id'),'');
  console.log(await p.locator('#verb-infinitive').innerText(),await p.locator('#conjugated-verb').textContent());
  await p.getByRole('button',{name:'Skip',exact:true}).filter({visible:true}).first().click();
 }
 await p.locator('#answer-flow-btn').click();
 await p.locator('#conjugated-verb').waitFor({state:'visible'});
 await p.screenshot({path:'/private/tmp/reference-card.png'});
 const allForms = await p.evaluate(() => {
   let count = 0;
   for (const [tense, rows] of Object.entries(tenses)) {
     for (const name of Object.keys(window.referenceCards.specs)) {
       if (!rows[name]) throw new Error('Missing reference verb: '+name);
       for (const [pronoun, conjugated] of Object.entries(rows[name])) {
         for (const reference of (name === 'aller' ? ['cet endroit'] : ['ce truc','cette chose','ces choses'])) {
           const c = window.referenceCards.prepare({verb:{infinitive:name}, tense, pronoun, conjugated},reference);
           if (/quelque chose|undefined/.test(c.conjugated)) throw new Error(c.conjugated);
           count++;
         }
       }
     }
   }
   const female = window.referenceCards.prepare({verb:{infinitive:'aller'},tense:'passeCompose',pronoun:'elles',conjugated:tenses.passeCompose.aller['ils/elles']},'cet endroit');
   if (female.conjugated !== 'elles y sont allées') throw new Error(female.conjugated);
   return count;
 });
 console.log('Checked '+allForms+' reference/subject/tense combinations against loaded data.');
 await p.reload({waitUntil:'domcontentloaded'});
 assert(await p.locator('#verb-reference').isVisible());
 await p.getByRole('button',{name:'Settings',exact:true}).click();
 await p.locator('#settings-v2-exercise-controls').getByLabel('Verbs',{exact:true}).check();
 await p.locator('#settings-v2-exercise-controls').getByLabel('Verbs with pronoun replacement',{exact:true}).uncheck();
 await p.locator('#back-to-flashcard-from-options-btn').click();
 assert(!(await p.locator('#verb-reference').isVisible()));
 assert.deepEqual(errors,[]);
 console.log('PASS: reference cards, audio target, persistence and ordinary mode restoration.');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
