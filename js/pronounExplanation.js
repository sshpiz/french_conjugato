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
 function render(card){
  const panel=document.getElementById('pronoun-explanation');if(!panel)return;
  panel.open=false;
  const lines=card?.doublePronoun&&Array.isArray(card.explanation)?card.explanation:[];
  panel.hidden=!lines.length;
  const list=panel.querySelector('ul');list.replaceChildren();
  for(const line of lines){const li=document.createElement('li');li.textContent=line;list.append(li);}
 }
 window.pronounExplanation={double,enY,render};
})();
