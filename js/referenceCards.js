/* A small, explicit inventory: never infer object behaviour from a verb ending.
 * Grammar: https://www.laits.utexas.edu/tex/gr/pro5.html (including agreement),
 * https://www.laits.utexas.edu/tex/gr/pro6.html and /pro7.html.
 */
(() => {
  const things = ['ce truc', 'cette chose', 'ces choses'];
  const specs = {
    chercher: { type: 'direct' }, regarder: { type: 'direct' },
    aimer: { type: 'direct' }, voir: { type: 'direct' },
    prendre: { type: 'direct' }, trouver: { type: 'direct' },
    comprendre: { type: 'direct' }, vouloir: { type: 'direct' },
    penser: { type: 'y', label: 'penser à' },
    parler: { type: 'en', label: 'parler de' },
    aller: { type: 'y', label: 'aller à', place: true },
    'avoir besoin': { type: 'en', label: 'avoir besoin de', strip: ' de quelque chose' },
    'avoir envie': { type: 'en', label: 'avoir envie de', strip: ' de quelque chose' },
    'faire attention': { type: 'y', label: 'faire attention à', strip: ' à quelque chose' },
  };
  function prepare(card, reference) {
    const spec = specs[card?.verb?.infinitive];
    if (!spec || card.isFrameCard || card.isPhraseMode || card.reference) return card;
    const references = spec.place ? ['cet endroit'] : things;
    reference = references.includes(reference) ? reference : references[Math.floor(Math.random() * references.length)];
    const subject = card.pronoun.split('/')[0];
    const normalized = window.handleLanguageSpecificLastChange
      ? window.handleLanguageSpecificLastChange(card.pronoun, card.conjugated) : card.conjugated;
    let body = normalized.replace(/^j['’]|^(?:je|tu|il|elle|on|nous|vous|ils|elles)\s+/u, '');
    if (spec.strip) {
      if (!body.endsWith(spec.strip)) throw new Error(`Unexpected reference complement: ${card.verb.infinitive}`);
      body = body.slice(0, -spec.strip.length);
    }
    let object = spec.type;
    if (spec.type === 'direct') {
      object = reference === 'ce truc' ? 'le' : reference === 'cette chose' ? 'la' : 'les';
      if (['passeCompose', 'plusQueParfait'].includes(card.tense) && reference !== 'ce truc') {
        body = body.replace(/\S+$/u, participle => participle + (participle.endsWith('e') ? '' : 'e') + (reference === 'ces choses' ? 's' : ''));
      }
      if (object !== 'les' && /^[aàâäeéèêëiîïoôöuùûüyœ]/iu.test(body)) object = "l'";
    }
    const predicate = object + (object === "l'" ? '' : ' ') + body;
    const answer = (subject === 'je' && ['en', 'y'].includes(object) ? "j'" : subject + ' ') + predicate;
    return { ...card, conjugated: answer, reference, referenceLabel: spec.label || card.verb.infinitive };
  }
  function render(card) {
    const element = document.getElementById('verb-reference');
    if (!element) return;
    element.hidden = !card?.reference;
    element.replaceChildren();
    if (!card?.reference) return;
    const label = document.createElement('span');
    label.className = 'reference-caption';
    label.textContent = 'Reference';
    const value = document.createElement('strong');
    value.textContent = card.reference;
    element.append(label, value);
  }
  window.referenceCards = { specs, prepare, render, supports: verb => Boolean(specs[verb]) };
})();
