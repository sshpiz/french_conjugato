const {chromium}=require('/Users/simeon/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('assert/strict');
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true});try{
 const p=await browser.newPage();
 await p.addInitScript(()=>localStorage.setItem('frenchInlineTutorialStateV1',JSON.stringify({active:false,completed:true,stepIndex:20})));
 await p.goto('http://127.0.0.1:8765/proj1/dist/french/index.html',{waitUntil:'domcontentloaded'});
 await p.locator('#verb-infinitive').waitFor();
 for(const [name,pronoun,expected] of [['se rendre service','elle','to do oneself a favour'],['se rendre service','elles','to do oneself or one another a favour'],['se faire mal','tu','to hurt oneself'],['se poser une question','je','to wonder; ask oneself a question']]){
  await p.evaluate(({name,pronoun})=>window.displayCard({verb:verbs.find(v=>v.infinitive===name),pronoun,tense:'present',conjugated:'test'}),{name,pronoun});
  assert.equal((await p.locator('#verb-translation').textContent()).trim(),expected);
 }
 console.log('PASS: singular and plural card glosses.');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
