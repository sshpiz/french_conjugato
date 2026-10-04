/* French finite pronoun practice: https://www.laits.utexas.edu/tex/gr/neg2.html */
(() => {
  const api = window.referenceCards;
  const muteH = new Set('habiter hésiter habiller habituer hériter humilier halluciner honorer huiler hypothéquer hébéter habiliter harmoniser hiberner hiverner homologuer horrifier horripiler hospitaliser humaniser humecter humidifier hydrater hypnotiser héberger'.split(' '));
  const aspiratedH = new Set('haïr hâter hausser heurter hurler hasarder haleter hisser harceler hocher haler humer hérisser hacher hachurer handicaper hanter happer haranguer harasser harnacher harponner hoqueter houspiller huer hâler héler'.split(' '));
  const modes = ['affirmative', 'mixed', 'standard', 'spoken'];
  function negate(card, style) {
    if (!card || card.isFrameCard || card.isPhraseMode || (!card.reference && card.verb?.verbExpression) || card.negationStyle || !['standard','spoken'].includes(style)) return card;
    const answer = card._practiceAnswer || (window.handleLanguageSpecificLastChange ? window.handleLanguageSpecificLastChange(card.pronoun, card.conjugated) : card.conjugated);
    const match = String(answer).match(/^(j['’]|(?:je|tu|il|elle|on|nous|vous|ils|elles)\s+)(.*)$/u);
    if (!match) return card;
    const subject = match[1].trim().replace(/^j['’]$/u,'je'), rest = match[2];
    // Consume only pre-verbal clitics, then one finite verb/auxiliary. The
    // participle, infinitive, expression tail and tonic complement stay after pas.
    const predicate = rest.match(/^((?:(?:me|te|se|nous|vous|le|la|les|lui|leur|y|en)\s+|[lmts]['’])*)(\S+)(.*)$/u);
    if (!predicate) return card;
    const negative = predicate[1] + predicate[2] + ' pas' + predicate[3];
    const lemma=card.verb?.infinitive;
    // Do not guess elision for the handful of rare h-headwords not classified yet.
    if(/^h/iu.test(rest)&&!muteH.has(lemma)&&!aspiratedH.has(lemma))return card;
    const elides = /^[aàâäeéèêëiîïoôöuùûüyœ]/iu.test(rest) || (/^h/iu.test(rest) && muteH.has(lemma));
    const prefix = style === 'standard'
      ? subject + (elides ? " n'" : ' ne ')
      : (subject==='je'&&elides?"j'":subject+' ');
    const result = prefix + negative;
    return { ...card, conjugated: result, _practiceAnswer: result, negationStyle: style };
  }
  api.prepareNegation = card => {
    const mode = window.cardGenerationOptions?.referenceNegation || 'affirmative';
    const roll = Math.random();
    const style = mode === 'mixed' ? (roll < .75 ? 'affirmative' : roll < .875 ? 'standard' : 'spoken') : mode;
    return negate(card, style);
  };
  api.negationControls = (container, options, onChange) => {
    api.choiceControls(container,options,onChange,'referenceNegation','Sentence form',[
      ['affirmative','Affirmative','je parle'],
      ['mixed','Mixed','25% negative · verbs and pronouns'],
      ['standard','Negative','je ne parle pas'],
      ['spoken','Spoken negative','je parle pas · without ne']
    ],'affirmative');
  };
  const render=api.render;
  api.render=card=>{
    render(card);
    document.getElementById('reference-negation-cue')?.remove();
  };
  let titleObserver;
  api.renderNegationHeading=(element,card)=>{
    titleObserver?.disconnect();
    document.getElementById('negation-badge')?.remove();
    if(!element)return;
    if(element.dataset.negationFont!==undefined){element.style.fontSize=element.dataset.negationFont;delete element.dataset.negationFont;}
    element.classList.remove('has-negation-heading');
    if(!card?.negationStyle)return;
    const prefix=document.createElement('span');prefix.className='negation-heading-prefix';
    prefix.textContent=card.negationStyle==='standard'?'ne pas':'pas';
    element.replaceChildren(prefix,document.createTextNode(' '+(card.referenceLabel||card.verb.infinitive)));
    element.classList.add('has-negation-heading');
    element.dataset.speak=element.textContent;element.dataset.audioId='';
    const badge=document.createElement('span');badge.id='negation-badge';badge.textContent=card.negationStyle==='standard'?'Négation':'Négation orale';
    document.getElementById('verb-frequency')?.append(badge);
    element.dataset.negationFont=element.style.fontSize;
    const fit=()=>{element.style.fontSize=element.dataset.negationFont;const width=element.clientWidth;if(width&&element.scrollWidth>width)element.style.fontSize=(parseFloat(getComputedStyle(element).fontSize)*width/element.scrollWidth*.98)+'px';};
    requestAnimationFrame(fit);
    titleObserver=new ResizeObserver(fit);titleObserver.observe(element.parentElement);
  };
  api.negate=negate;
})();
