/* Editorial en/y frames. Quantitative en never triggers participle agreement.
 * Direct objects before y/en do: je les y ai mises / je l'en ai informée.
 * See the source references in referenceEnYInventory.js. */
(() => {
  const things=['ce truc','cette chose','ces choses'];
  const people=['cet homme','cette femme','ces hommes','ces femmes'];
  const personal=['moi','toi','nous','vous (pl.)'];
  const clitics=['me','te','nous','vous'];
  const allowed=(subject,index)=>!((['je','nous'].includes(subject)&&[0,2].includes(index))||(['tu','vous'].includes(subject)&&[1,3].includes(index)));
  const withSubject=(subject,phrase)=>subject==='je'&&/^[aeiyœ]/iu.test(phrase)?"j'"+phrase:subject+' '+phrase;
  const quantity=(cue,index)=>{
    if(!cue.startsWith('des '))return {cue,tail:''};
    const noun=cue.slice(4);
    return index%3===1?{cue:'deux '+noun,tail:' deux'}:index%3===2?{cue:'beaucoup de '+noun,tail:' beaucoup'}:{cue,tail:''};
  };
  window.constructFrenchEnY=(card,record,objectIndex=0,recipientIndex=0,agree)=>{
    if(!card||card.reference||card.isPhraseMode||card.isFrameCard)return null;
    const subject=card.pronoun.split('/')[0];
    const normalized=window.handleLanguageSpecificLastChange?window.handleLanguageSpecificLastChange(card.pronoun,card.conjugated):card.conjugated;
    let body=String(normalized||'').replace(/^j['’]|^(?:je|tu|il|elle|on|nous|vous|ils|elles)\s+/u,'');
    if(!body||body==='—')return null;
    const compound=['passeCompose','plusQueParfait'].includes(card.tense),type=record.type;
    let cluster,reference,references,referenceIcons,label=record.verb,tail='';
    if(['prepY','prepEn','location','origin','quantity'].includes(type)){
      cluster=['prepY','location'].includes(type)?'y':'en';
      if(type==='location')reference='cet endroit';
      else if(type==='origin')reference='de cet endroit';
      else if(type==='quantity'){const q=quantity(record.cue,objectIndex);reference=q.cue;tail=q.tail;}
      else {reference=record.cue||things[objectIndex%3];label+=type==='prepY'?' à':' de';}
    }else if(type==='quantityY'){
      const q=quantity(record.cue,objectIndex);cluster='y en';tail=q.tail;
      references=[q.cue,'dans cet endroit'];referenceIcons=['📦','📍'];
    }else if(type==='directY'){
      const i=objectIndex%3;
      cluster=i===2?'les y':"l'y";reference=things[i];
      if(compound)body=agree(body,i>0,i===2);
      references=[reference,'dans cet endroit'];referenceIcons=['📦','📍'];
    }else if(type==='personY'){
      const pi=objectIndex%4;
      if(!allowed(subject,pi))return null;
      cluster=pi<2?(pi===0?"m'y":"t'y"):clitics[pi]+' y';
      if(compound)body=agree(body,objectIndex>=4,pi>=2);
      const cue=personal[pi]+(compound?(objectIndex>=4?' (fém.)':' (masc.)'):'');
      references=[cue,'à cet endroit'];referenceIcons=['👤','📍'];
    }else if(type==='recipientEn'||type==='indirectEn'){
      const pi=recipientIndex-4;
      if(pi>=0&&!allowed(subject,pi))return null;
      cluster=pi<0?(recipientIndex>=2?'leur en':'lui en'):pi<2?(pi===0?"m'en":"t'en"):clitics[pi]+' en';
      const recipient=pi<0?people[recipientIndex%4]:personal[pi];
      if(type==='recipientEn'){
        const q=quantity(record.cue,objectIndex);tail=q.tail;
        references=[q.cue,'à '+recipient];referenceIcons=['📦','👤'];
      }else {references=['à '+recipient,'de cette chose'];referenceIcons=['👤','💬'];}
    }else if(type==='directEn'){
      const i=objectIndex%4;
      cluster=i>=2?'les en':"l'en";
      if(compound)body=agree(body,i%2===1,i>=2);
      references=[people[i],'de cette chose'];referenceIcons=['👤','💬'];
    }else return null;
    if(references)reference=references.join(' + ');
    const answer=withSubject(subject,cluster+' '+body+tail);
    return {...card,verb:{...card.verb,translation:record.gloss},reference,referenceLabel:label,conjugated:answer,_practiceAnswer:answer,
      ...(references?{references,referenceIcons,doublePronoun:true}:{}),constructionId:record.sourceId,pronounFamily:type,
      explanation:window.pronounExplanation?.enY(type,references,objectIndex,recipientIndex,tail),
      ...(type==='origin'?{referenceIcon:'📍'}:type==='quantity'?{referenceIcon:'📦'}:{})};
  };
})();
