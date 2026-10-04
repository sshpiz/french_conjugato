/* French-only pronunciation clues. The bundled phonemizer must confirm an
 * added boundary consonant; spelling alone never creates a mark.
 * Classification: OQLF /23549 (required), /23550 (optional).
 * Unknown contexts are omitted, as are ambiguous phoneme alignments.
 */
(() => {
 const normalizeIPA = text => String(text).replace(/[ˈˌ\s\-\u200d\u200c]/gu, '');
 const required = new Set(['nous','vous','ils','elles','on','en','les','des','mes','tes','ses','nos','vos','aux','un','mon','ton','son','dans','sans','chez','sous','très']);
 const auxiliaries = new Set(['ai','as','a','avons','avez','ont','avais','avait','avions','aviez','avaient','aurai','auras','aura','aurons','aurez','auront','aurais','aurait','aurions','auriez','auraient','suis','es','est','sommes','êtes','sont','étais','était','étions','étiez','étaient']);
 const cache = new Map();
 function classify(left, card) {
  const word=left.toLowerCase().split(/[’']/u).at(-1);
  if(required.has(word))return 'required';
  if(auxiliaries.has(word)||word==='pas')return 'optional';
  // Our ordinary cards have one finite verb. A confirmed boundary after its
  // supplied conjugation is optional; fixed expression tails need their own rule.
  const base=String(card?.verb?.infinitive||'');
  if(!base.includes(' ')&&!card?.verb?.verbExpression)return 'optional';
  return null;
 }
 async function analyze(text, card, phonemize) {
  const words=text.match(/\S+/gu)||[],links=[];
  const memo=async value=>{if(!cache.has(value)){const result=await phonemize(value);cache.set(value,normalizeIPA(result));if(cache.size>2500)cache.delete(cache.keys().next().value);}return cache.get(value);};
  const sentence=await memo(text);
  for(let i=0;i<words.length-1;i++){
   const left=words[i],right=words[i+1];
   if(!/^[aàâäeéèêëiîïoôöuùûühyœ]/iu.test(right))continue;
   const kind=classify(left,card);if(!kind)continue;
   const sound=/[sxz]$/iu.test(left)?'z':/[td]$/iu.test(left)?'t':/n$/iu.test(left)?'n':/er$/iu.test(left)?'ʁ':/p$/iu.test(left)?'p':null;
   if(!sound)continue;
   const a=await memo(left),b=await memo(right),pair=await memo(left+' '+right);
   // Exact local alignment plus full-sentence confirmation distinguishes liaison
   // from enchaînement (an already pronounced consonant) and rejects uncertain IPA.
   let confirmed=pair===a+sound+b&&sentence.includes(pair);
   // eSpeak reads sentence-final/isolated 'y' as the letter 'i grec'.
   // Keep the following words so it recognizes the clitic. Still require an
   // exact added consonant, unchanged remaining pronunciation, and confirmation
   // in the full answer. Never extend this exception to y-initial nouns.
   if(!confirmed&&right.toLowerCase()==='y'&&i+2<words.length&&
      ['nous','vous','ils','elles','on','les','en'].includes(left.toLowerCase())){
    const tail=await memo(words.slice(i+1).join(' '));
    const context=await memo(words.slice(i).join(' '));
    confirmed=tail.startsWith('i')&&context===a+sound+tail&&sentence.includes(context);
   }
   if(confirmed)links.push({index:i,kind,sound});
  }
  return {words,links};
 }
 let generation=0,latest=null,observer=null;
 let enabled=true;try{enabled=localStorage.getItem('vf:french:liaison-clues')!=='off';}catch{}
 function draw(element,links) {
  element.querySelector('.liaison-overlay')?.remove();
  const spans=element.querySelectorAll('.liaison-word'),box=element.getBoundingClientRect();if(!box.width||!box.height)return;
  const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');svg.classList.add('liaison-overlay');svg.setAttribute('aria-hidden','true');svg.setAttribute('viewBox',`0 0 ${box.width} ${box.height}`);
  for(const link of links){
   const a=spans[link.index],b=spans[link.index+1];if(!a?.firstChild||!b?.firstChild)continue;
   const range=document.createRange();range.setStart(a.firstChild,a.textContent.length-1);range.setEnd(a.firstChild,a.textContent.length);const ar=range.getBoundingClientRect();range.setStart(b.firstChild,0);range.setEnd(b.firstChild,1);const br=range.getBoundingClientRect();
   const x1=ar.left+ar.width*.5-box.left,x2=br.left+br.width*.5-box.left;
   const append=(d,part)=>{const path=document.createElementNS(ns,'path');path.setAttribute('d',d);path.setAttribute('class','liaison-arc '+link.kind);path.dataset.link=String(link.index);if(part)path.dataset.continuation=part;svg.append(path);};
   if(Math.abs(ar.top-br.top)>3){
    // Paired half-arcs indicate one link continued on the following line.
    // Stay beneath the boundary letters: no diagonal across intervening text,
    // no inserted characters, and no change to wrapping or spoken answers.
    const depth=Math.min(7,ar.height*.14),reach=Math.min(12,ar.height*.3);
    const ay=ar.bottom-box.top-2,by=br.bottom-box.top-2;
    const end=Math.min(box.width-1,x1+reach),start=Math.max(1,x2-reach);
    append(`M ${x1} ${ay} Q ${x1} ${ay+depth} ${end} ${ay+depth}`,'end');
    append(`M ${start} ${by+depth} Q ${x2} ${by+depth} ${x2} ${by}`,'start');
   }else{
    const y=Math.max(ar.bottom,br.bottom)-box.top-2;
    append(`M ${x1} ${y} Q ${(x1+x2)/2} ${y+Math.min(9,ar.height*.18)} ${x2} ${y}`);
   }
  }
  element.append(svg);
 }
 function control(element) {
  let button=document.getElementById('liaison-clues-toggle');
  if(!button){button=document.createElement('button');button.id='liaison-clues-toggle';button.type='button';button.className='liaison-clues-toggle';element.closest('.conjugated-line').after(button);button.addEventListener('click',event=>{event.stopPropagation();enabled=!enabled;try{localStorage.setItem('vf:french:liaison-clues',enabled?'on':'off');}catch{}if(latest)render(...latest);});}
  button.hidden=true;button.textContent=enabled?'Liaison hints · on':'Liaison hints · off';button.setAttribute('aria-pressed',String(enabled));button.title='Solid: required liaison. Dotted: optional liaison. Only confirmed links are marked.';return button;
 }
 async function render(element,text,card,getEngine) {
  latest=[element,text,card,getEngine];const own=++generation;
  observer?.disconnect();element.querySelector('.liaison-overlay')?.remove();element.textContent=text;
  const button=control(element);button.dataset.status='loading';
  try{
   const engine=await getEngine();if(!engine)throw Error('Phonemizer unavailable');
   const result=await analyze(text,card,async value=>(await engine.getPhonetics(value)).phonetics);
   if(own!==generation||element.textContent!==text)return;
   button.hidden=result.links.length===0;
   button.dataset.status='ready';
   button.title=`${result.links.length} confirmed liaison link(s). Solid: required; dotted: optional. Paired half-arcs continue across lines. Unmarked boundaries may be unclassified.`;
   if(!enabled||!result.links.length)return;
   const fragment=document.createDocumentFragment();
   // Keep literal whitespace and the exact spoken answer unchanged.
   const pieces=text.split(/(\s+)/u);for(const piece of pieces){if(/^\s+$/u.test(piece))fragment.append(document.createTextNode(piece));else if(piece){const span=document.createElement('span');span.className='liaison-word';span.textContent=piece;fragment.append(span);}}
   element.replaceChildren(fragment);draw(element,result.links);
   observer=new ResizeObserver(()=>{if(own===generation)draw(element,result.links);});observer.observe(element);
   button.dataset.status='ready';button.title=`${result.links.length} confirmed liaison link(s). Solid: required; dotted: optional. Paired half-arcs continue across lines. Unmarked boundaries may be unclassified.`;
  }catch(error){if(own===generation){button.dataset.status='unavailable';button.title='Liaison hints unavailable; the answer is unchanged.';}}
 }
 window.liaisonClues={analyze,render};
})();
