/* Source-backed French constructions. Finite clauses only; never infer valency
 * from spelling. The generated inventory retains sense-specific glosses. */
(() => {
  const api = window.referenceCards;
  const additions=window.frenchEnYInventory || [];
  const replacementKeys=new Set(additions.map(r=>r.verb+':'+({prepY:'y',prepEn:'en'}[r.type]||r.type)));
  const records = [...(window.frenchReferenceInventory || []).filter(r=>!replacementKeys.has(r.verb+':'+r.type)), ...additions];
  const byVerb = new Map();
  for (const record of records) {
    if (!byVerb.has(record.verb)) byVerb.set(record.verb, []);
    byVerb.get(record.verb).push(record);
  }
  const things = ['ce truc', 'cette chose', 'ces choses'];
  const people = ['cet homme', 'cette femme', 'ces hommes', 'ces femmes'];
  const personals = ['moi', 'toi', 'nous', 'vous (pl.)'];
  const clitics = ['me', 'te', 'nous', 'vous'];
  const compounds = new Set(['passeCompose', 'plusQueParfait']);
  // Only these h-aspiré headwords occur in the activated inventory.
  const aspirated = new Set(['haïr', 'hâter']);
  const vowel = (body, verb) => /^[aàâäeéèêëiîïoôöuùûüyœ]/iu.test(body) || (/^h/iu.test(body) && !aspirated.has(verb));
  const eligible = (verb, mode) => (byVerb.get(verb) || []).filter(r => mode === 'two' ? (r.type === 'double'||r.arity===2) : mode === 'one' ? (r.type !== 'double'&&r.arity!==2) : true);
  const allowedPersonal = (subject, index) => !((['je','nous'].includes(subject) && [0,2].includes(index)) || (['tu','vous'].includes(subject) && [1,3].includes(index)));
  function agree(body, feminine, plural) {
    return body.replace(/\S+$/u, p => {
      if (feminine) p = ({ dû:'due', crû:'crue', mû:'mue', absous:'absoute', dissous:'dissoute' })[p] || p + (p.endsWith('e') ? '' : 'e');
      if (plural && !/[sx]$/u.test(p)) p += 's';
      return p;
    });
  }
  function construct(card, record, objectIndex = 0, recipientIndex = 0) {
    if (!record || card.reference || card.isFrameCard || card.isPhraseMode) return null;
    if(record.arity)return window.constructFrenchEnY(card,record,objectIndex,recipientIndex,agree);
    const subject = card.pronoun.split('/')[0];
    const normalized = window.handleLanguageSpecificLastChange ? window.handleLanguageSpecificLastChange(card.pronoun, card.conjugated) : card.conjugated;
    let body = String(normalized || '').replace(/^j['’]|^(?:je|tu|il|elle|on|nous|vous|ils|elles)\s+/u, '');
    if (!body || body === '—') return null;
    const type = record.type, compound = compounds.has(card.tense);
    let cluster, reference, references, explanation;
    if (type === 'direct' || type === 'double') {
      const index = objectIndex % 3;
      if (compound) body = agree(body, index > 0, index === 2);
      let direct = ['le','la','les'][index];
      reference = things[index];
      if (type === 'double') {
        const personal = recipientIndex >= 4, pi = recipientIndex - 4;
        if (personal && !allowedPersonal(subject, pi)) return null;
        if (personal && index < 2 && vowel(body, record.verb)) direct = "l'";
        cluster = personal ? clitics[pi] + ' ' + direct : direct + ' ' + (recipientIndex >= 2 ? 'leur' : 'lui');
        references = [reference, 'à ' + (personal ? personals[pi] : people[recipientIndex])];
        reference = references.join(' + ');
        explanation = window.pronounExplanation?.double(references,['le','la','les'][index],personal?clitics[pi]:(recipientIndex>=2?'leur':'lui'),personal);
      } else {
        if (index < 2 && vowel(body, record.verb)) direct = "l'";
        cluster = direct;
      }
    } else if (type === 'person' || type === 'indirect') {
      const index = objectIndex % 8, pi = index % 4;
      if (!allowedPersonal(subject, pi)) return null;
      cluster = clitics[pi];
      reference = personals[pi];
      if (type === 'person' && compound) {
        body = agree(body, index >= 4, pi >= 2);
        reference += index >= 4 ? ' (fém.)' : ' (masc.)';
      }
      if (type === 'indirect') reference = 'à ' + reference;
      if (pi < 2 && vowel(body, record.verb)) cluster = pi === 0 ? "m'" : "t'";
    } else {
      cluster = type;
      reference = things[objectIndex % 3];
    }
    const answer = (subject === 'je' && ['y','en'].includes(cluster) ? "j'" : subject + ' ') + cluster + (cluster.endsWith("'") ? '' : ' ') + body;
    return { ...card, verb: { ...card.verb, translation: record.gloss }, conjugated: answer, _practiceAnswer: answer,
      reference, explanation, ...(references ? { references, doublePronoun: true } : {}),
      referenceLabel: record.verb + (type === 'y' || type === 'indirect' ? ' à' : type === 'en' ? ' de' : ''),
      personalPronoun: type === 'person' || type === 'indirect', constructionId: record.sourceId + ':' + type };
  }
  const oldPrepare = api.prepare, oldSupports = api.supports, oldUsage = api.personalUsageEntries;
  api.prepare = function(card, reference) {
    if (!card || reference || card.reference || card.isFrameCard || card.isPhraseMode) return oldPrepare(card, reference);
    const choices = eligible(card.verb.infinitive, window.cardGenerationOptions?.referenceObjects || 'mixed');
    if (!choices.length || (oldSupports(card.verb.infinitive) && Math.random() < .5)) return oldPrepare(card, reference);
    const record = choices[Math.floor(Math.random() * choices.length)];
    const subject = card.pronoun.split('/')[0];
    const indices = Array.from({length:8}, (_,i)=>i).filter(i=>allowedPersonal(subject,i%4));
    const object = ['person','indirect','personY'].includes(record.type) ? indices[Math.floor(Math.random()*indices.length)] : Math.floor(Math.random()*(record.type==='directEn'?4:3));
    const recipients = [0,1,2,3,...indices.filter(i=>i<4).map(i=>i+4)];
    return construct(card,record,object,recipients[Math.floor(Math.random()*recipients.length)]) || oldPrepare(card,reference);
  };
  api.supports = verb => oldSupports(verb) || eligible(verb,window.cardGenerationOptions?.referenceObjects || 'mixed').length > 0;
  api.personalUsageEntries = verb => [...oldUsage(verb), ...(byVerb.get(verb)||[]).map(r=>({verb,pattern_id:'source-pronoun:'+r.sourceId+':'+r.type,pattern:r.pattern,meaning_en:r.gloss,example_fr:r.example,example_en:r.exampleEnglish,source:'reviewed-construction-and-dicovalence'}))];
  api.expansion = { records, eligible, construct, agree };
})();
