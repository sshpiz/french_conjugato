/* Versioned, bounded question snapshots. Only plain-text display fields are accepted. */
(() => {
  const fields = ['reference','referenceLabel','referenceIcon','constructionId','pronounFamily','negationStyle'];
  const flags = ['doublePronoun','personalPronoun'];
  const text = (value, max = 500) => typeof value === 'string' && value.length <= max && !/[<>\u0000-\u001f]/u.test(value);
  function validate(data) {
    if (!data || data.v !== 1 || data.lang !== 'fr') throw Error('Unsupported question link');
    if (data.frame) {
      if (!text(data.frame, 200) || !data.frame) throw Error('Invalid question');
      return {v:1,lang:'fr',frame:data.frame};
    }
    for (const key of ['verb','tense','pronoun','answer']) if (!text(data[key]) || !data[key]) throw Error('Incomplete question');
    if (!['je','tu','il','elle','on','nous','vous','ils','elles','il/elle/on','ils/elles'].includes(data.pronoun)) throw Error('Invalid subject');
    if (!['present','imparfait','futurSimple','passeCompose','plusQueParfait','conditionnelPresent','subjonctifPresent'].includes(data.tense)) throw Error('Invalid tense');
    const result = {v:1,lang:'fr',verb:data.verb,tense:data.tense,pronoun:data.pronoun,answer:data.answer};
    for (const key of [...fields,'translation']) if (data[key] !== undefined) {
      if (!text(data[key])) throw Error('Invalid question text');
      result[key] = data[key];
    }
    if (result.negationStyle && !['standard','spoken'].includes(result.negationStyle)) throw Error('Invalid sentence form');
    for (const key of flags) if (data[key] === true) result[key] = true;
    for (const key of ['references','referenceIcons']) if (data[key] !== undefined) {
      if (!Array.isArray(data[key]) || data[key].length > 2 || !data[key].every(item => text(item, 200))) throw Error('Invalid pronoun cues');
      result[key] = [...data[key]];
    }
    if(data.explanation !== undefined) {
      if(!Array.isArray(data.explanation)||data.explanation.length>6||!data.explanation.every(line=>text(line,300)))throw Error('Invalid explanation');
      result.explanation=[...data.explanation];
    }
    return result;
  }
  function snapshot(card) {
    if (card?.isFrameCard && card.frameId) return validate({v:1,lang:'fr',frame:card.frameId});
    if (!card?.verb || card.isPhraseMode) throw Error('This question cannot be shared');
    const data = {v:1,lang:'fr',verb:card.verb.infinitive,tense:card.tense,pronoun:card.pronoun,
      answer:card._practiceAnswer || card.conjugated,translation:card.verb.translation};
    for (const key of [...fields,...flags,'references','referenceIcons','explanation']) if (card[key] !== undefined) data[key] = card[key];
    return validate(data);
  }
  function encode(card) {
    const bytes = new TextEncoder().encode(JSON.stringify(snapshot(card)));
    const token = btoa(String.fromCharCode(...bytes)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/g,'');
    if (token.length > 6000) throw Error('Question link is too long');
    return token;
  }
  function decode(value) {
    if (!value || value.length > 6000 || !/^[A-Za-z0-9_-]+$/.test(value)) throw Error('Invalid question link');
    const bytes = Uint8Array.from(atob(value.replace(/-/g,'+').replace(/_/g,'/')), c=>c.charCodeAt(0));
    return validate(JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes)));
  }
  window.QuestionShare = {snapshot,encode,decode};
})();
