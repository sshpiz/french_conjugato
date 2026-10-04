/* Explanations are recorded by the generator, never inferred from an answer. */
(() => {
 const replace=(cue,pronoun)=>`« ${cue} » est remplacé par « ${pronoun} ».`;
 const order=(a,b)=>`« ${a} » se place avant « ${b} ».`;
 function double(refs,direct,recipient,personal){
  return [replace(refs[0],direct),replace(refs[1],recipient),personal?order(recipient,direct):order(direct,recipient)];
 }
 function enY(type,refs,objectIndex,recipientIndex,tail){
  if(!refs)return undefined;
  const person=['me','te','nous','vous'][objectIndex%4];
  const recipient=recipientIndex<4?(recipientIndex<2?'lui':'leur'):['me','te','nous','vous'][recipientIndex-4];
  const direct=type==='directEn'?['le','la','les','les'][objectIndex%4]:['le','la','les'][objectIndex%3];
  let pronouns,ordered;
  if(type==='quantityY'){pronouns=['en','y'];ordered=['y','en'];}
  else if(type==='directY'){pronouns=[direct,'y'];ordered=pronouns;}
  else if(type==='personY'){pronouns=[person,'y'];ordered=pronouns;}
  else if(type==='recipientEn'){pronouns=['en',recipient];ordered=[recipient,'en'];}
  else if(type==='indirectEn'){pronouns=[recipient,'en'];ordered=pronouns;}
  else if(type==='directEn'){pronouns=[direct,'en'];ordered=pronouns;}
  else return undefined;
  const lines=refs.map((cue,i)=>replace(cue,pronouns[i]));
  if(type==='quantityY'||type==='recipientEn')lines[0]=`« en » reprend le nom introduit par une quantité ou un article indéfini/partitif : « ${refs[0]} ».`;
  lines.push(order(...ordered));
  if(tail.trim())lines.push(`La quantité « ${tail.trim()} » reste après le verbe.`);
  return lines;
 }
 function single(type,cue,pronoun,label,tail=''){
  const lines=[];
  if(type==='tonic'){
   lines.push(`« à ${cue} » devient « à ${pronoun} ».`);
   lines.push(`Avec « ${label} », on garde « à » devant le pronom qui désigne cette personne.`);
   lines.push(`« ${pronoun} » désigne « ${cue} », pas la personne qui fait l’action.`);
  }else if(['y','prepY','location'].includes(type)){
   lines.push(`« y » reprend ${type==='location'?'le lieu':'le complément introduit par « à »'} : « ${cue} ».`);
   lines.push('On choisit « y » selon ce qui est remplacé, pas selon le sujet.');
  }else if(['en','prepEn','origin','quantity'].includes(type)){
   lines.push(type==='quantity'?`« en » reprend le nom dans « ${cue} » (quantité ou article indéfini/partitif).`:`« en » reprend le complément introduit par « de » : « ${cue} ».`);
   lines.push('On choisit « en » selon ce qui est remplacé, pas selon le sujet.');
   if(tail.trim())lines.push(`La quantité « ${tail.trim()} » reste après le verbe.`);
  }else lines.push(replace(cue,pronoun));
  if(type!=='tonic')lines.push('Le pronom se place avant le verbe ; à un temps composé, avant l’auxiliaire.');
  return lines;
 }
 // Agreement follows explicit generator roles, not the spelling of the answer.
 function agreement(lines,card,type,cue,indirectCue){
  if(!['passeCompose','plusQueParfait'].includes(card.tense))return lines;
  const result=[...(lines||[])];
  if(['direct','person','double','directY','personY','directEn'].includes(type)){
   result.push(`Avec « avoir », le participe passé s’accorde avec « ${cue} », complément direct placé avant le verbe, et non avec le sujet.`);
   if(indirectCue)result.push(`« ${indirectCue} » est un complément indirect : il ne commande pas cet accord.`);
  }else if(['indirect','tonic'].includes(type)){
   result.push(`« ${cue} » est un complément indirect : le participe passé ne s’accorde pas avec lui, même s’il désigne une femme ou plusieurs personnes.`);
  }else if(['quantity','quantityY','recipientEn'].includes(type)){
   result.push('Quand « en » reprend une quantité, le participe passé avec « avoir » reste invariable.');
   if(indirectCue)result.push(`« ${indirectCue} » est indirect et ne commande pas d’accord non plus.`);
  }else if(type==='indirectEn'){
   result.push('Ni le complément indirect de personne ni « en » ne commandent l’accord du participe passé.');
  }
  return result;
 }
 function render(card){
  const panel=document.getElementById('pronoun-explanation');if(!panel)return;
  panel.open=false;
  const lines=Array.isArray(card?.explanation)?card.explanation:[];
  panel.hidden=!lines.length;
  const list=panel.querySelector('ul');list.replaceChildren();
  for(const line of lines){const li=document.createElement('li');li.textContent=line;list.append(li);}
 }
 window.pronounExplanation={double,enY,single,agreement,render};
})();
