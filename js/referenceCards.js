/* A small, explicit inventory: never infer object behaviour from a verb ending.
 * Grammar: https://www.laits.utexas.edu/tex/gr/pro5.html (including agreement),
 * https://www.laits.utexas.edu/tex/gr/pro6.html, /pro7.html and /pro8.html.
 * Tonic contrasts: https://www.lawlessfrench.com/grammar/indirect-objects-2/
 */
(() => {
  const things = ['ce truc', 'cette chose', 'ces choses'];
  const people = ['cet homme', 'cette femme', 'ces hommes', 'ces femmes'];
  const specs = {
    chercher: { type: 'direct' }, regarder: { type: 'direct' },
    aimer: { type: 'direct' }, voir: { type: 'direct' },
    prendre: { type: 'direct' }, trouver: { type: 'direct' },
    comprendre: { type: 'direct' }, vouloir: { type: 'direct' },
    penser: { type: 'y', label: 'penser à', people: true, peopleType: 'tonic' },
    songer: { type: 'y', label: 'songer à', people: true, peopleType: 'tonic' },
    tenir: { type: 'y', label: 'tenir à', people: true, peopleType: 'tonic' },
    renoncer: { type: 'y', label: 'renoncer à', people: true, peopleType: 'tonic' },
    recourir: { type: 'y', label: 'recourir à', people: true, peopleType: 'tonic' },
    parler: { type: 'en', label: 'parler de', people: true, peopleLabel: 'parler à' },
    répondre: { type: 'y', label: 'répondre à', people: true },
    écrire: { type: 'indirect', label: 'écrire à' },
    téléphoner: { type: 'indirect', label: 'téléphoner à' },
    sourire: { type: 'indirect', label: 'sourire à' },
    aller: { type: 'y', label: 'aller à', place: true },
    'avoir besoin': { type: 'en', label: 'avoir besoin de', strip: ' de quelque chose' },
    'avoir envie': { type: 'en', label: 'avoir envie de', strip: ' de quelque chose' },
    'faire attention': { type: 'y', label: 'faire attention à', people: true, peopleType: 'tonic', strip: ' à quelque chose' },
  };
  // Explicit transitive thing-object constructions, using existing paradigms.
  for (const verb of ["acheter", "apporter", "apprendre", "attendre", "boire", "changer", "choisir", "commencer", "connaître", "construire", "continuer", "couper", "croire", "décider", "demander", "décrire", "découvrir", "défendre", "dépenser", "détruire", "développer", "dire", "donner", "écouter", "écrire", "expliquer", "faire", "fermer", "finir", "garder", "imaginer", "laisser", "lire", "manger", "mettre", "montrer", "nettoyer", "obtenir", "oublier", "ouvrir", "payer", "perdre", "porter", "poser", "préparer", "présenter", "produire", "proposer", "raconter", "recevoir", "reconnaître", "refuser", "rendre", "réparer", "répéter", "reprendre", "réserver", "résoudre", "retrouver", "savoir", "sentir", "suivre", "supprimer", "tenir", "terminer", "toucher", "transformer", "transmettre", "utiliser", "vendre", "vérifier", "visiter", "accepter", "ajouter", "améliorer", "annoncer", "arrêter", "atteindre", "comprendre", "conserver", "considérer", "consulter", "corriger", "créer", "dessiner", "éviter", "examiner", "essayer", "fabriquer", "gagner", "installer", "jeter", "laver", "livrer", "organiser", "partager", "protéger", "remplacer", "remplir", "retirer", "sauver", "soutenir", "traduire", "transporter"]) {
    if (!specs[verb]) specs[verb] = { type: 'direct' };
  }
  for (const verb of ['dépendre', 'profiter', 'rêver', 'douter', 'manquer', 'bénéficier', 'disposer', 'souffrir']) {
    if (!specs[verb]) specs[verb] = { type: 'en', label: verb + ' de' };
  }
  for (const verb of ['participer', 'contribuer', 'réfléchir', 'assister']) {
    if (!specs[verb]) specs[verb] = { type: 'y', label: verb + ' à' };
  }
  function referencesFor(verb) {
    const spec = specs[verb];
    if (!spec) return [];
    if (spec.place) return ['cet endroit'];
    if (spec.type === 'indirect') return people;
    return spec.people ? [...things, ...people] : things;
  }
  function prepare(card, reference) {
    const spec = specs[card?.verb?.infinitive];
    if (!spec || card.isFrameCard || card.isPhraseMode || card.reference) return card;
    const references = referencesFor(card.verb.infinitive);
    reference = references.includes(reference) ? reference : references[Math.floor(Math.random() * references.length)];
    const subject = card.pronoun.split('/')[0];
    const normalized = window.handleLanguageSpecificLastChange
      ? window.handleLanguageSpecificLastChange(card.pronoun, card.conjugated) : card.conjugated;
    let body = normalized.replace(/^j['’]|^(?:je|tu|il|elle|on|nous|vous|ils|elles)\s+/u, '');
    if (spec.strip) {
      if (!body.endsWith(spec.strip)) throw new Error(`Unexpected reference complement: ${card.verb.infinitive}`);
      body = body.slice(0, -spec.strip.length);
    }
    const person = people.includes(reference);
    let object = person ? (reference.startsWith('ces ') ? 'leur' : 'lui') : spec.type;
    if (spec.type === 'direct') {
      object = reference === 'ce truc' ? 'le' : reference === 'cette chose' ? 'la' : 'les';
      if (['passeCompose', 'plusQueParfait'].includes(card.tense) && reference !== 'ce truc') {
        body = body.replace(/\S+$/u, participle => participle + (participle.endsWith('e') ? '' : 'e') + (reference === 'ces choses' ? 's' : ''));
      }
      if (object !== 'les' && /^[aàâäeéèêëiîïoôöuùûüyœ]/iu.test(body)) object = "l'";
    }
    const tonic = person && spec.peopleType === 'tonic';
    const tonicPronouns = { 'cet homme': 'lui', 'cette femme': 'elle', 'ces hommes': 'eux', 'ces femmes': 'elles' };
    let predicate = tonic ? body + ' à ' + tonicPronouns[reference]
      : object + (object === "l'" ? '' : ' ') + body;
    // Tonic complements follow the complete verb phrase (j'ai pensé à elle).
    const elideSubject = tonic ? /^[aàâäeéèêëiîïoôöuùûüyœ]/iu.test(body) : ['en', 'y'].includes(object);
    const answer = (subject === 'je' && elideSubject ? "j'" : subject + ' ') + predicate;
    return { ...card, conjugated: answer, reference, referenceLabel: (person && spec.peopleLabel) || spec.label || card.verb.infinitive };
  }
  function render(card) {
    const element = document.getElementById('verb-reference');
    if (!element) return;
    element.hidden = !card?.reference;
    element.replaceChildren();
    if (!card?.reference) return;
    const icons = { 'ce truc': '📦', 'cette chose': '🔹', 'ces choses': '📦📦', 'cet endroit': '📍', 'cet homme': '👨', 'cette femme': '👩', 'ces hommes': '👨👨', 'ces femmes': '👩👩' };
    const icon = document.createElement('span');
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = icons[card.reference] || '📦';
    const value = document.createElement('strong');
    value.textContent = card.reference;
    element.setAttribute('aria-label', 'Reference: ' + card.reference);
    element.append(icon, value);
  }
  window.referenceCards = { specs, prepare, render, referencesFor, supports: verb => Boolean(specs[verb]) };
})();
