(function initPronounFillRows() {
  const rows = [];
  const DIRECT_OBJECT_ELISION_START_RE = /^[hH]?[aeiouàâäéèêëîïôöùûüœæ]/u;

  const getBlankFollower = (question) => {
    const match = String(question || '').match(/____\s+([^\s.,;:!?]+)/);
    return match ? match[1].replace(/^[“"'\u2018\u2019]+|[”"',.;:!?]+$/g, '') : '';
  };

  const shouldElideDirectObject = (answer, question, options, reason) => {
    if (answer !== 'le' && answer !== 'la') return false;
    const family = options && options.family ? options.family : '';
    if (family !== 'direct_object' && !/direct object/i.test(String(reason || ''))) return false;
    return DIRECT_OBJECT_ELISION_START_RE.test(getBlankFollower(question).toLocaleLowerCase('fr-FR'));
  };

  const normalizeDirectObjectElision = (answer, fullAnswer, question, options, reason) => {
    if (!shouldElideDirectObject(answer, question, options, reason)) {
      return { answer, fullAnswer };
    }
    return {
      answer: 'l\'',
      fullAnswer: String(fullAnswer).replace(/\b(?:le|la)\s+([hH]?[aeiouàâäéèêëîïôöùûüœæ])/u, 'l\'$1'),
    };
  };

  const add = (
    id,
    topic,
    verb,
    meaningEn,
    question,
    targetFr,
    answer,
    fullAnswer,
    reason,
    options = {}
  ) => {
    const normalizedElision = normalizeDirectObjectElision(answer, fullAnswer, question, options, reason);
    answer = normalizedElision.answer;
    fullAnswer = normalizedElision.fullAnswer;

    rows.push({
      id,
      type: 'pronoun_fill',
      frame_type: 'pronoun_fill',
      language: 'fr',
      verb,
      tense: 'present',
      subject: options.subject || 'je',
      family: options.family || '',
      prompt_style: 'standard',
      meaning_en: meaningEn,
      question: String(question),
      target_fr: targetFr,
      answer,
      full_answer: fullAnswer,
      source_pattern: options.sourcePattern || reason,
      reason,
      answer_span_kind: options.answerSpanKind || (/\s/.test(answer) ? 'pronoun_cluster' : 'pronoun_only'),
      category_name: topic,
      source: 'curated_reviewed',
      needs_review: false,
    });
  };

  // Existing curated launch deck.
  add('pf_direct_001', 'Office & Admin', 'voir', 'I am seeing it.', 'Je ____ vois.', 'la facture', 'la', 'Je la vois.', 'direct object, feminine singular -> la', { family: 'direct_object' });
  add('pf_direct_002', 'Tech & Digital Work', 'voir', 'I am seeing them.', 'Je ____ vois.', 'les messages', 'les', 'Je les vois.', 'direct object, plural -> les', { family: 'direct_object' });
  add('pf_direct_003', 'Travel & Tourism', 'acheter', 'I am buying them.', 'Je ____ achète.', 'les billets', 'les', 'Je les achète.', 'direct object, plural -> les', { family: 'direct_object' });
  add('pf_direct_004', 'Education & Learning', 'comprendre', 'I understand it.', 'Je ____ comprends.', 'la règle', 'la', 'Je la comprends.', 'direct object, feminine singular -> la', { family: 'direct_object' });
  add('pf_direct_005', 'Tech & Digital Work', 'chercher', 'I am looking for it.', 'Je ____ cherche.', 'le chargeur', 'le', 'Je le cherche.', 'direct object, masculine singular -> le', { family: 'direct_object' });
  add('pf_direct_006', 'Relationship Drama', 'connaître', 'I know it.', 'Je ____ connais.', 'la vérité', 'la', 'Je la connais.', 'direct object, feminine singular -> la', { family: 'direct_object' });
  add('pf_direct_007', 'Art & Design', 'adorer', 'I love it.', 'Je ____ adore.', 'l\'idée', 'l\'', 'Je l\'adore.', 'direct object before a vowel -> l\'', { family: 'direct_object' });
  add('pf_direct_008', 'History & Culture', 'raconter', 'I am telling it.', 'Je ____ raconte.', 'l\'histoire', 'la', 'Je la raconte.', 'direct object, feminine singular -> la', { family: 'direct_object' });
  add('pf_direct_009', 'Education & Learning', 'attendre', 'I am waiting for them.', 'Je ____ attends.', 'les résultats', 'les', 'Je les attends.', 'direct object, plural -> les', { family: 'direct_object' });
  add('pf_direct_010', 'Sports & Fitness', 'regarder', 'I am watching it.', 'Je ____ regarde.', 'le match', 'le', 'Je le regarde.', 'direct object, masculine singular -> le', { family: 'direct_object' });
  add('pf_direct_011', 'Driving & Road Code', 'prendre', 'I am taking it.', 'Je ____ prends.', 'la sortie', 'la', 'Je la prends.', 'direct object, feminine singular -> la', { family: 'direct_object' });
  add('pf_direct_012', 'Bureaucracy & Delivery', 'présenter', 'I am presenting it.', 'Je ____ présente.', 'le dossier', 'le', 'Je le présente.', 'direct object, masculine singular -> le', { family: 'direct_object' });
  add('pf_direct_013', 'Cinema & Series', 'regarder', 'I am watching them.', 'Je ____ regarde.', 'les épisodes', 'les', 'Je les regarde.', 'direct object, plural -> les', { family: 'direct_object' });
  add('pf_direct_014', 'Nightlife & Partying', 'inviter', 'I am inviting him.', 'Je ____ invite.', 'Alex', 'l\'', 'Je l\'invite.', 'direct object before a vowel -> l\'', { family: 'direct_object' });
  add('pf_en_001', 'Office & Admin', 'parler', 'I am talking about it.', 'J\'____ parle.', 'ce problème', 'en', 'J\'en parle.', 'parler de + thing -> en', { family: 'de_thing_to_en' });
  add('pf_en_002', 'Bureaucracy & Delivery', 'avoir', 'I need it.', 'J\'____ ai besoin.', 'ce dossier', 'en', 'J\'en ai besoin.', 'avoir besoin de + thing -> en', { family: 'de_thing_to_en' });
  add('pf_en_003', 'Travel & Tourism', 'rêver', 'I am dreaming about them.', 'J\'____ rêve.', 'ces vacances', 'en', 'J\'en rêve.', 'rêver de + thing -> en', { family: 'de_thing_to_en' });
  add('pf_en_004', 'Tech & Digital Work', 'discuter', 'I am discussing it.', 'J\'____ discute.', 'ce projet', 'en', 'J\'en discute.', 'discuter de + thing -> en', { family: 'de_thing_to_en' });
  add('pf_en_005', 'Education & Learning', 'douter', 'I am doubting it.', 'J\'____ doute.', 'ce résultat', 'en', 'J\'en doute.', 'douter de + thing -> en', { family: 'de_thing_to_en' });
  add('pf_en_006', 'Cinema & Series', 'parler', 'We are talking about it.', 'Nous ____ parlons.', 'ce film', 'en', 'Nous en parlons.', 'parler de + thing -> en', { subject: 'nous', family: 'de_thing_to_en' });
  add('pf_en_007', 'Art & Design', 'avoir', 'I want it.', 'J\'____ ai envie.', 'cette robe', 'en', 'J\'en ai envie.', 'avoir envie de + thing -> en', { family: 'de_thing_to_en' });
  add('pf_en_008', 'Music', 'parler', 'She is talking about it.', 'Elle ____ parle.', 'cette chanson', 'en', 'Elle en parle.', 'parler de + thing -> en', { subject: 'elle', family: 'de_thing_to_en' });
  add('pf_y_001', 'Tech & Digital Work', 'penser', 'I am thinking about it.', 'J\'____ pense.', 'ce projet', 'y', 'J\'y pense.', 'penser à + thing -> y', { family: 'a_thing_to_y' });
  add('pf_y_002', 'Education & Learning', 'réfléchir', 'I am thinking about it.', 'J\'____ réfléchis.', 'cette question', 'y', 'J\'y réfléchis.', 'réfléchir à + thing -> y', { family: 'a_thing_to_y' });
  add('pf_y_003', 'Office & Admin', 'aller', 'I am going there.', 'J\'____ vais.', 'au bureau', 'y', 'J\'y vais.', 'location -> y', { family: 'location_to_y' });
  add('pf_y_004', 'Office & Admin', 'participer', 'I am taking part in it.', 'J\'____ participe.', 'cette réunion', 'y', 'J\'y participe.', 'participer à + thing -> y', { family: 'a_thing_to_y' });
  add('pf_y_005', 'History & Culture', 'croire', 'I believe in it.', 'J\'____ crois.', 'cette histoire', 'y', 'J\'y crois.', 'croire à + thing -> y', { family: 'a_thing_to_y' });
  add('pf_y_006', 'Politics & Current Events', 'renoncer', 'I am giving it up.', 'J\'____ renonce.', 'ce plan', 'y', 'J\'y renonce.', 'renoncer à + thing -> y', { family: 'a_thing_to_y' });
  add('pf_y_007', 'Super Everyday', 'retourner', 'I am going back there.', 'J\'____ retourne.', 'à la maison', 'y', 'J\'y retourne.', 'location -> y', { family: 'location_to_y' });
  add('pf_y_008', 'Art & Design', 'tenir', 'I care about it.', 'J\'____ tiens.', 'cette idée', 'y', 'J\'y tiens.', 'tenir à + thing -> y', { family: 'a_thing_to_y' });
  add('pf_lui_001', 'Relationship Drama', 'parler', 'I am talking to her.', 'Je ____ parle.', 'Marie', 'lui', 'Je lui parle.', 'parler à + person -> lui', { family: 'indirect_person' });
  add('pf_lui_002', 'Office & Admin', 'répondre', 'I am answering them.', 'Je ____ réponds.', 'les clients', 'leur', 'Je leur réponds.', 'répondre à + people -> leur', { family: 'indirect_person' });
  add('pf_lui_003', 'Super Everyday', 'téléphoner', 'I am calling him.', 'Je ____ téléphone.', 'Paul', 'lui', 'Je lui téléphone.', 'téléphoner à + person -> lui', { family: 'indirect_person' });
  add('pf_lui_004', 'Relationship Drama', 'écrire', 'I am writing to them.', 'Je ____ écris.', 'les voisins', 'leur', 'Je leur écris.', 'écrire à + people -> leur', { family: 'indirect_person' });
  add('pf_lui_005', 'Super Everyday', 'sourire', 'I am smiling at them.', 'Je ____ souris.', 'les enfants', 'leur', 'Je leur souris.', 'sourire à + people -> leur', { family: 'indirect_person' });
  add('pf_lui_006', 'Office & Admin', 'demander', 'I am asking her.', 'Je ____ demande.', 'Julie', 'lui', 'Je lui demande.', 'demander à + person -> lui', { family: 'indirect_person' });
  add('pf_lui_007', 'Education & Learning', 'expliquer', 'I am explaining it to him.', 'Je ____ explique.', 'Luc', 'lui', 'Je lui explique.', 'expliquer à + person -> lui', { family: 'indirect_person' });
  add('pf_lui_008', 'Travel & Tourism', 'écrire', 'We are writing to them.', 'Nous ____ écrivons.', 'mes amis', 'leur', 'Nous leur écrivons.', 'écrire à + people -> leur', { subject: 'nous', family: 'indirect_person' });
  add('pf_multi_001', 'Super Everyday', 'montrer', 'I am showing them to you.', 'Je ____ montre.', 'les photos -> toi', 'te les', 'Je te les montre.', 'to you + them -> te les', { family: 'multi_clitic' });
  add('pf_multi_002', 'Travel & Tourism', 'rendre', 'I am giving it back to you.', 'Je ____ rends.', 'le passeport -> vous', 'vous le', 'Je vous le rends.', 'to you + it -> vous le', { family: 'multi_clitic' });
  add('pf_multi_003', 'Music', 'prêter', 'He is lending it to me.', 'Il ____ prête.', 'la guitare -> moi', 'me la', 'Il me la prête.', 'to me + it -> me la', { family: 'multi_clitic' });
  add('pf_multi_004', 'Office & Admin', 'envoyer', 'She is sending them to us.', 'Elle ____ envoie.', 'les invitations -> nous', 'nous les', 'Elle nous les envoie.', 'to us + them -> nous les', { family: 'multi_clitic' });
  add('pf_multi_005', 'Office & Admin', 'donner', 'I am giving it to her.', 'Je ____ donne.', 'le dossier -> Marie', 'le lui', 'Je le lui donne.', 'it + to her -> le lui', { family: 'multi_clitic' });
  add('pf_multi_006', 'Travel & Tourism', 'envoyer', 'I am sending them to him.', 'Je ____ envoie.', 'les photos -> Paul', 'les lui', 'Je les lui envoie.', 'them + to him -> les lui', { family: 'multi_clitic' });
  add('pf_multi_007', 'Bureaucracy & Delivery', 'apporter', 'I am bringing it to them.', 'Je ____ apporte.', 'la facture -> les clients', 'la leur', 'Je la leur apporte.', 'it + to them -> la leur', { family: 'multi_clitic' });
  add('pf_multi_008', 'Crafts & Making', 'montrer', 'We are showing them to them.', 'Nous ____ montrons.', 'les plans -> nos voisins', 'les leur', 'Nous les leur montrons.', 'them + to them -> les leur', { family: 'multi_clitic' });
  add('pf_multi_009', 'Relationship Drama', 'parler', 'I am talking to her about it.', 'Je ____ parle.', 'Marie -> ce problème', 'lui en', 'Je lui en parle.', 'to her + about it -> lui en', { family: 'multi_clitic' });
  add('pf_multi_010', 'Office & Admin', 'parler', 'I am talking to them about it.', 'Je ____ parle.', 'mes collègues -> ce plan', 'leur en', 'Je leur en parle.', 'to them + about it -> leur en', { family: 'multi_clitic' });
  add('pf_multi_011', 'Super Everyday', 'dire', 'I am telling it to you.', 'Je ____ dis.', 'la vérité -> toi', 'te la', 'Je te la dis.', 'to you + it -> te la', { family: 'multi_clitic' });
  add('pf_multi_012', 'Cinema & Series', 'montrer', 'I am showing it to them.', 'Je ____ montre.', 'la bande-annonce -> mes amis', 'la leur', 'Je la leur montre.', 'it + to them -> la leur', { family: 'multi_clitic' });

  // Deterministic expansion deck generated from audited pattern families.
  add('pfx_direct_object_001_nous', 'Office & Admin', 'voir', 'We are seeing it.', 'Nous ____ voyons.', 'la facture', 'la', 'Nous la voyons.', 'direct object, feminine singular -> la', { subject: 'nous', family: 'direct_object' });
  add('pfx_direct_object_002_vous', 'Office & Admin', 'voir', 'You are seeing it.', 'Vous ____ voyez.', 'la facture', 'la', 'Vous la voyez.', 'direct object, feminine singular -> la', { subject: 'vous', family: 'direct_object' });
  add('pfx_direct_object_003_elle', 'Office & Admin', 'voir', 'She is seeing it.', 'Elle ____ voit.', 'la facture', 'la', 'Elle la voit.', 'direct object, feminine singular -> la', { subject: 'elle', family: 'direct_object' });
  add('pfx_direct_object_004_ils', 'Office & Admin', 'voir', 'They are seeing it.', 'Ils ____ voient.', 'la facture', 'la', 'Ils la voient.', 'direct object, feminine singular -> la', { subject: 'ils', family: 'direct_object' });
  add('pfx_direct_object_005_nous', 'Tech & Digital Work', 'lire', 'We are reading them.', 'Nous ____ lisons.', 'les messages', 'les', 'Nous les lisons.', 'direct object, plural -> les', { subject: 'nous', family: 'direct_object' });
  add('pfx_direct_object_006_vous', 'Tech & Digital Work', 'lire', 'You are reading them.', 'Vous ____ lisez.', 'les messages', 'les', 'Vous les lisez.', 'direct object, plural -> les', { subject: 'vous', family: 'direct_object' });
  add('pfx_direct_object_007_elle', 'Tech & Digital Work', 'lire', 'She is reading them.', 'Elle ____ lit.', 'les messages', 'les', 'Elle les lit.', 'direct object, plural -> les', { subject: 'elle', family: 'direct_object' });
  add('pfx_direct_object_008_ils', 'Tech & Digital Work', 'lire', 'They are reading them.', 'Ils ____ lisent.', 'les messages', 'les', 'Ils les lisent.', 'direct object, plural -> les', { subject: 'ils', family: 'direct_object' });
  add('pfx_direct_object_009_nous', 'Education & Learning', 'comprendre', 'We understand it.', 'Nous ____ comprenons.', 'la règle', 'la', 'Nous la comprenons.', 'direct object, feminine singular -> la', { subject: 'nous', family: 'direct_object' });
  add('pfx_direct_object_010_vous', 'Education & Learning', 'comprendre', 'You understand it.', 'Vous ____ comprenez.', 'la règle', 'la', 'Vous la comprenez.', 'direct object, feminine singular -> la', { subject: 'vous', family: 'direct_object' });
  add('pfx_direct_object_011_elle', 'Education & Learning', 'comprendre', 'She understands it.', 'Elle ____ comprend.', 'la règle', 'la', 'Elle la comprend.', 'direct object, feminine singular -> la', { subject: 'elle', family: 'direct_object' });
  add('pfx_direct_object_012_ils', 'Education & Learning', 'comprendre', 'They understand it.', 'Ils ____ comprennent.', 'la règle', 'la', 'Ils la comprennent.', 'direct object, feminine singular -> la', { subject: 'ils', family: 'direct_object' });
  add('pfx_direct_object_013_nous', 'Sports & Fitness', 'regarder', 'We are watching it.', 'Nous ____ regardons.', 'le match', 'le', 'Nous le regardons.', 'direct object, masculine singular -> le', { subject: 'nous', family: 'direct_object' });
  add('pfx_direct_object_014_vous', 'Sports & Fitness', 'regarder', 'You are watching it.', 'Vous ____ regardez.', 'le match', 'le', 'Vous le regardez.', 'direct object, masculine singular -> le', { subject: 'vous', family: 'direct_object' });
  add('pfx_direct_object_015_elle', 'Sports & Fitness', 'regarder', 'She is watching it.', 'Elle ____ regarde.', 'le match', 'le', 'Elle le regarde.', 'direct object, masculine singular -> le', { subject: 'elle', family: 'direct_object' });
  add('pfx_direct_object_016_ils', 'Sports & Fitness', 'regarder', 'They are watching it.', 'Ils ____ regardent.', 'le match', 'le', 'Ils le regardent.', 'direct object, masculine singular -> le', { subject: 'ils', family: 'direct_object' });
  add('pfx_direct_object_017_nous', 'Driving & Road Code', 'prendre', 'We are taking it.', 'Nous ____ prenons.', 'la sortie', 'la', 'Nous la prenons.', 'direct object, feminine singular -> la', { subject: 'nous', family: 'direct_object' });
  add('pfx_direct_object_018_vous', 'Driving & Road Code', 'prendre', 'You are taking it.', 'Vous ____ prenez.', 'la sortie', 'la', 'Vous la prenez.', 'direct object, feminine singular -> la', { subject: 'vous', family: 'direct_object' });
  add('pfx_direct_object_019_elle', 'Driving & Road Code', 'prendre', 'She is taking it.', 'Elle ____ prend.', 'la sortie', 'la', 'Elle la prend.', 'direct object, feminine singular -> la', { subject: 'elle', family: 'direct_object' });
  add('pfx_direct_object_020_ils', 'Driving & Road Code', 'prendre', 'They are taking it.', 'Ils ____ prennent.', 'la sortie', 'la', 'Ils la prennent.', 'direct object, feminine singular -> la', { subject: 'ils', family: 'direct_object' });
  add('pfx_direct_object_021_nous', 'Bureaucracy & Delivery', 'présenter', 'We are presenting it.', 'Nous ____ présentons.', 'le dossier', 'le', 'Nous le présentons.', 'direct object, masculine singular -> le', { subject: 'nous', family: 'direct_object' });
  add('pfx_direct_object_022_vous', 'Bureaucracy & Delivery', 'présenter', 'You are presenting it.', 'Vous ____ présentez.', 'le dossier', 'le', 'Vous le présentez.', 'direct object, masculine singular -> le', { subject: 'vous', family: 'direct_object' });
  add('pfx_direct_object_023_elle', 'Bureaucracy & Delivery', 'présenter', 'She is presenting it.', 'Elle ____ présente.', 'le dossier', 'le', 'Elle le présente.', 'direct object, masculine singular -> le', { subject: 'elle', family: 'direct_object' });
  add('pfx_direct_object_024_ils', 'Bureaucracy & Delivery', 'présenter', 'They are presenting it.', 'Ils ____ présentent.', 'le dossier', 'le', 'Ils le présentent.', 'direct object, masculine singular -> le', { subject: 'ils', family: 'direct_object' });
  add('pfx_direct_object_025_nous', 'Cinema & Series', 'montrer', 'We are showing it.', 'Nous ____ montrons.', 'la bande-annonce', 'la', 'Nous la montrons.', 'direct object, feminine singular -> la', { subject: 'nous', family: 'direct_object' });
  add('pfx_direct_object_026_vous', 'Cinema & Series', 'montrer', 'You are showing it.', 'Vous ____ montrez.', 'la bande-annonce', 'la', 'Vous la montrez.', 'direct object, feminine singular -> la', { subject: 'vous', family: 'direct_object' });
  add('pfx_direct_object_027_elle', 'Cinema & Series', 'montrer', 'She is showing it.', 'Elle ____ montre.', 'la bande-annonce', 'la', 'Elle la montre.', 'direct object, feminine singular -> la', { subject: 'elle', family: 'direct_object' });
  add('pfx_direct_object_028_ils', 'Cinema & Series', 'montrer', 'They are showing it.', 'Ils ____ montrent.', 'la bande-annonce', 'la', 'Ils la montrent.', 'direct object, feminine singular -> la', { subject: 'ils', family: 'direct_object' });
  add('pfx_direct_object_029_nous', 'Super Everyday', 'garder', 'We are keeping it.', 'Nous ____ gardons.', 'le ticket', 'le', 'Nous le gardons.', 'direct object, masculine singular -> le', { subject: 'nous', family: 'direct_object' });
  add('pfx_direct_object_030_vous', 'Super Everyday', 'garder', 'You are keeping it.', 'Vous ____ gardez.', 'le ticket', 'le', 'Vous le gardez.', 'direct object, masculine singular -> le', { subject: 'vous', family: 'direct_object' });
  add('pfx_direct_object_031_elle', 'Super Everyday', 'garder', 'She is keeping it.', 'Elle ____ garde.', 'le ticket', 'le', 'Elle le garde.', 'direct object, masculine singular -> le', { subject: 'elle', family: 'direct_object' });
  add('pfx_direct_object_032_ils', 'Super Everyday', 'garder', 'They are keeping it.', 'Ils ____ gardent.', 'le ticket', 'le', 'Ils le gardent.', 'direct object, masculine singular -> le', { subject: 'ils', family: 'direct_object' });
  add('pfx_direct_object_033_nous', 'Tech & Digital Work', 'chercher', 'We are looking for it.', 'Nous ____ cherchons.', 'la clé API', 'la', 'Nous la cherchons.', 'direct object, feminine singular -> la', { subject: 'nous', family: 'direct_object' });
  add('pfx_direct_object_034_vous', 'Tech & Digital Work', 'chercher', 'You are looking for it.', 'Vous ____ cherchez.', 'la clé API', 'la', 'Vous la cherchez.', 'direct object, feminine singular -> la', { subject: 'vous', family: 'direct_object' });
  add('pfx_direct_object_035_elle', 'Tech & Digital Work', 'chercher', 'She is looking for it.', 'Elle ____ cherche.', 'la clé API', 'la', 'Elle la cherche.', 'direct object, feminine singular -> la', { subject: 'elle', family: 'direct_object' });
  add('pfx_direct_object_036_ils', 'Tech & Digital Work', 'chercher', 'They are looking for it.', 'Ils ____ cherchent.', 'la clé API', 'la', 'Ils la cherchent.', 'direct object, feminine singular -> la', { subject: 'ils', family: 'direct_object' });
  add('pfx_direct_object_037_nous', 'Travel & Tourism', 'préparer', 'We are preparing them.', 'Nous ____ préparons.', 'les billets', 'les', 'Nous les préparons.', 'direct object, plural -> les', { subject: 'nous', family: 'direct_object' });
  add('pfx_direct_object_038_vous', 'Travel & Tourism', 'préparer', 'You are preparing them.', 'Vous ____ préparez.', 'les billets', 'les', 'Vous les préparez.', 'direct object, plural -> les', { subject: 'vous', family: 'direct_object' });
  add('pfx_direct_object_039_elle', 'Travel & Tourism', 'préparer', 'She is preparing them.', 'Elle ____ prépare.', 'les billets', 'les', 'Elle les prépare.', 'direct object, plural -> les', { subject: 'elle', family: 'direct_object' });
  add('pfx_direct_object_040_ils', 'Travel & Tourism', 'préparer', 'They are preparing them.', 'Ils ____ préparent.', 'les billets', 'les', 'Ils les préparent.', 'direct object, plural -> les', { subject: 'ils', family: 'direct_object' });
  add('pfx_direct_object_041_nous', 'Office & Admin', 'signer', 'We are signing it.', 'Nous ____ signons.', 'le formulaire', 'le', 'Nous le signons.', 'direct object, masculine singular -> le', { subject: 'nous', family: 'direct_object' });
  add('pfx_direct_object_042_vous', 'Office & Admin', 'signer', 'You are signing it.', 'Vous ____ signez.', 'le formulaire', 'le', 'Vous le signez.', 'direct object, masculine singular -> le', { subject: 'vous', family: 'direct_object' });
  add('pfx_direct_object_043_elle', 'Office & Admin', 'signer', 'She is signing it.', 'Elle ____ signe.', 'le formulaire', 'le', 'Elle le signe.', 'direct object, masculine singular -> le', { subject: 'elle', family: 'direct_object' });
  add('pfx_direct_object_044_ils', 'Office & Admin', 'signer', 'They are signing it.', 'Ils ____ signent.', 'le formulaire', 'le', 'Ils le signent.', 'direct object, masculine singular -> le', { subject: 'ils', family: 'direct_object' });
  add('pfx_direct_object_045_nous', 'Super Everyday', 'fermer', 'We are closing it.', 'Nous ____ fermons.', 'la fenêtre', 'la', 'Nous la fermons.', 'direct object, feminine singular -> la', { subject: 'nous', family: 'direct_object' });
  add('pfx_direct_object_046_vous', 'Super Everyday', 'fermer', 'You are closing it.', 'Vous ____ fermez.', 'la fenêtre', 'la', 'Vous la fermez.', 'direct object, feminine singular -> la', { subject: 'vous', family: 'direct_object' });
  add('pfx_direct_object_047_elle', 'Super Everyday', 'fermer', 'She is closing it.', 'Elle ____ ferme.', 'la fenêtre', 'la', 'Elle la ferme.', 'direct object, feminine singular -> la', { subject: 'elle', family: 'direct_object' });
  add('pfx_direct_object_048_ils', 'Super Everyday', 'fermer', 'They are closing it.', 'Ils ____ ferment.', 'la fenêtre', 'la', 'Ils la ferment.', 'direct object, feminine singular -> la', { subject: 'ils', family: 'direct_object' });
  add('pfx_direct_object_049_nous', 'Office & Admin', 'ranger', 'We are putting them away.', 'Nous ____ rangeons.', 'les documents', 'les', 'Nous les rangeons.', 'direct object, plural -> les', { subject: 'nous', family: 'direct_object' });
  add('pfx_direct_object_050_vous', 'Office & Admin', 'ranger', 'You are putting them away.', 'Vous ____ rangez.', 'les documents', 'les', 'Vous les rangez.', 'direct object, plural -> les', { subject: 'vous', family: 'direct_object' });
  add('pfx_direct_object_051_elle', 'Office & Admin', 'ranger', 'She is putting them away.', 'Elle ____ range.', 'les documents', 'les', 'Elle les range.', 'direct object, plural -> les', { subject: 'elle', family: 'direct_object' });
  add('pfx_direct_object_052_ils', 'Office & Admin', 'ranger', 'They are putting them away.', 'Ils ____ rangent.', 'les documents', 'les', 'Ils les rangent.', 'direct object, plural -> les', { subject: 'ils', family: 'direct_object' });
  add('pfx_direct_object_053_nous', 'Tech & Digital Work', 'retrouver', 'We are finding it again.', 'Nous ____ retrouvons.', 'le téléphone', 'le', 'Nous le retrouvons.', 'direct object, masculine singular -> le', { subject: 'nous', family: 'direct_object' });
  add('pfx_direct_object_054_vous', 'Tech & Digital Work', 'retrouver', 'You are finding it again.', 'Vous ____ retrouvez.', 'le téléphone', 'le', 'Vous le retrouvez.', 'direct object, masculine singular -> le', { subject: 'vous', family: 'direct_object' });
  add('pfx_direct_object_055_elle', 'Tech & Digital Work', 'retrouver', 'She is finding it again.', 'Elle ____ retrouve.', 'le téléphone', 'le', 'Elle le retrouve.', 'direct object, masculine singular -> le', { subject: 'elle', family: 'direct_object' });
  add('pfx_direct_object_056_ils', 'Tech & Digital Work', 'retrouver', 'They are finding it again.', 'Ils ____ retrouvent.', 'le téléphone', 'le', 'Ils le retrouvent.', 'direct object, masculine singular -> le', { subject: 'ils', family: 'direct_object' });
  add('pfx_direct_object_057_nous', 'Art & Design', 'choisir', 'We are choosing it.', 'Nous ____ choisissons.', 'la robe', 'la', 'Nous la choisissons.', 'direct object, feminine singular -> la', { subject: 'nous', family: 'direct_object' });
  add('pfx_direct_object_058_vous', 'Art & Design', 'choisir', 'You are choosing it.', 'Vous ____ choisissez.', 'la robe', 'la', 'Vous la choisissez.', 'direct object, feminine singular -> la', { subject: 'vous', family: 'direct_object' });
  add('pfx_direct_object_059_elle', 'Art & Design', 'choisir', 'She is choosing it.', 'Elle ____ choisit.', 'la robe', 'la', 'Elle la choisit.', 'direct object, feminine singular -> la', { subject: 'elle', family: 'direct_object' });
  add('pfx_direct_object_060_ils', 'Art & Design', 'choisir', 'They are choosing it.', 'Ils ____ choisissent.', 'la robe', 'la', 'Ils la choisissent.', 'direct object, feminine singular -> la', { subject: 'ils', family: 'direct_object' });
  add('pfx_direct_object_061_nous', 'Bureaucracy & Delivery', 'recevoir', 'We are receiving them.', 'Nous ____ recevons.', 'les colis', 'les', 'Nous les recevons.', 'direct object, plural -> les', { subject: 'nous', family: 'direct_object' });
  add('pfx_direct_object_062_vous', 'Bureaucracy & Delivery', 'recevoir', 'You are receiving them.', 'Vous ____ recevez.', 'les colis', 'les', 'Vous les recevez.', 'direct object, plural -> les', { subject: 'vous', family: 'direct_object' });
  add('pfx_direct_object_063_elle', 'Bureaucracy & Delivery', 'recevoir', 'She is receiving them.', 'Elle ____ reçoit.', 'les colis', 'les', 'Elle les reçoit.', 'direct object, plural -> les', { subject: 'elle', family: 'direct_object' });
  add('pfx_direct_object_064_ils', 'Bureaucracy & Delivery', 'recevoir', 'They are receiving them.', 'Ils ____ reçoivent.', 'les colis', 'les', 'Ils les reçoivent.', 'direct object, plural -> les', { subject: 'ils', family: 'direct_object' });
  add('pfx_direct_object_065_nous', 'Crafts & Making', 'porter', 'We are carrying it.', 'Nous ____ portons.', 'le carton', 'le', 'Nous le portons.', 'direct object, masculine singular -> le', { subject: 'nous', family: 'direct_object' });
  add('pfx_direct_object_066_vous', 'Crafts & Making', 'porter', 'You are carrying it.', 'Vous ____ portez.', 'le carton', 'le', 'Vous le portez.', 'direct object, masculine singular -> le', { subject: 'vous', family: 'direct_object' });
  add('pfx_direct_object_067_elle', 'Crafts & Making', 'porter', 'She is carrying it.', 'Elle ____ porte.', 'le carton', 'le', 'Elle le porte.', 'direct object, masculine singular -> le', { subject: 'elle', family: 'direct_object' });
  add('pfx_direct_object_068_ils', 'Crafts & Making', 'porter', 'They are carrying it.', 'Ils ____ portent.', 'le carton', 'le', 'Ils le portent.', 'direct object, masculine singular -> le', { subject: 'ils', family: 'direct_object' });
  add('pfx_direct_object_069_nous', 'Tech & Digital Work', 'ouvrir', 'We are opening it.', 'Nous ____ ouvrons.', 'le fichier', 'l\'', 'Nous l\'ouvrons.', 'direct object before a vowel -> l\'', { subject: 'nous', family: 'direct_object' });
  add('pfx_direct_object_070_vous', 'Tech & Digital Work', 'ouvrir', 'You are opening it.', 'Vous ____ ouvrez.', 'le fichier', 'l\'', 'Vous l\'ouvrez.', 'direct object before a vowel -> l\'', { subject: 'vous', family: 'direct_object' });
  add('pfx_direct_object_071_elle', 'Tech & Digital Work', 'ouvrir', 'She is opening it.', 'Elle ____ ouvre.', 'le fichier', 'l\'', 'Elle l\'ouvre.', 'direct object before a vowel -> l\'', { subject: 'elle', family: 'direct_object' });
  add('pfx_direct_object_072_ils', 'Tech & Digital Work', 'ouvrir', 'They are opening it.', 'Ils ____ ouvrent.', 'le fichier', 'l\'', 'Ils l\'ouvrent.', 'direct object before a vowel -> l\'', { subject: 'ils', family: 'direct_object' });
  add('pfx_de_thing_to_en_001_nous', 'Office & Admin', 'parler', 'We are talking about it.', 'Nous ____ parlons.', 'ce projet', 'en', 'Nous en parlons.', 'parler de + thing -> en', { subject: 'nous', family: 'de_thing_to_en' });
  add('pfx_de_thing_to_en_002_vous', 'Office & Admin', 'parler', 'You are talking about it.', 'Vous ____ parlez.', 'ce projet', 'en', 'Vous en parlez.', 'parler de + thing -> en', { subject: 'vous', family: 'de_thing_to_en' });
  add('pfx_de_thing_to_en_003_elle', 'Office & Admin', 'parler', 'She is talking about it.', 'Elle ____ parle.', 'ce projet', 'en', 'Elle en parle.', 'parler de + thing -> en', { subject: 'elle', family: 'de_thing_to_en' });
  add('pfx_de_thing_to_en_004_ils', 'Office & Admin', 'parler', 'They are talking about it.', 'Ils ____ parlent.', 'ce projet', 'en', 'Ils en parlent.', 'parler de + thing -> en', { subject: 'ils', family: 'de_thing_to_en' });
  add('pfx_de_thing_to_en_005_nous', 'Tech & Digital Work', 'discuter', 'We are discussing it.', 'Nous ____ discutons.', 'ce bug', 'en', 'Nous en discutons.', 'discuter de + thing -> en', { subject: 'nous', family: 'de_thing_to_en' });
  add('pfx_de_thing_to_en_006_vous', 'Tech & Digital Work', 'discuter', 'You are discussing it.', 'Vous ____ discutez.', 'ce bug', 'en', 'Vous en discutez.', 'discuter de + thing -> en', { subject: 'vous', family: 'de_thing_to_en' });
  add('pfx_de_thing_to_en_007_elle', 'Tech & Digital Work', 'discuter', 'She is discussing it.', 'Elle ____ discute.', 'ce bug', 'en', 'Elle en discute.', 'discuter de + thing -> en', { subject: 'elle', family: 'de_thing_to_en' });
  add('pfx_de_thing_to_en_008_ils', 'Tech & Digital Work', 'discuter', 'They are discussing it.', 'Ils ____ discutent.', 'ce bug', 'en', 'Ils en discutent.', 'discuter de + thing -> en', { subject: 'ils', family: 'de_thing_to_en' });
  add('pfx_de_thing_to_en_009_nous', 'Travel & Tourism', 'rêver', 'We are dreaming about them.', 'Nous ____ rêvons.', 'ces vacances', 'en', 'Nous en rêvons.', 'rêver de + thing -> en', { subject: 'nous', family: 'de_thing_to_en' });
  add('pfx_de_thing_to_en_010_vous', 'Travel & Tourism', 'rêver', 'You are dreaming about them.', 'Vous ____ rêvez.', 'ces vacances', 'en', 'Vous en rêvez.', 'rêver de + thing -> en', { subject: 'vous', family: 'de_thing_to_en' });
  add('pfx_de_thing_to_en_011_elle', 'Travel & Tourism', 'rêver', 'She is dreaming about them.', 'Elle ____ rêve.', 'ces vacances', 'en', 'Elle en rêve.', 'rêver de + thing -> en', { subject: 'elle', family: 'de_thing_to_en' });
  add('pfx_de_thing_to_en_012_ils', 'Travel & Tourism', 'rêver', 'They are dreaming about them.', 'Ils ____ rêvent.', 'ces vacances', 'en', 'Ils en rêvent.', 'rêver de + thing -> en', { subject: 'ils', family: 'de_thing_to_en' });
  add('pfx_de_thing_to_en_013_nous', 'Education & Learning', 'parler', 'We are talking about it.', 'Nous ____ parlons.', 'cet examen', 'en', 'Nous en parlons.', 'parler de + thing -> en', { subject: 'nous', family: 'de_thing_to_en' });
  add('pfx_de_thing_to_en_014_vous', 'Education & Learning', 'parler', 'You are talking about it.', 'Vous ____ parlez.', 'cet examen', 'en', 'Vous en parlez.', 'parler de + thing -> en', { subject: 'vous', family: 'de_thing_to_en' });
  add('pfx_de_thing_to_en_015_elle', 'Education & Learning', 'parler', 'She is talking about it.', 'Elle ____ parle.', 'cet examen', 'en', 'Elle en parle.', 'parler de + thing -> en', { subject: 'elle', family: 'de_thing_to_en' });
  add('pfx_de_thing_to_en_016_ils', 'Education & Learning', 'parler', 'They are talking about it.', 'Ils ____ parlent.', 'cet examen', 'en', 'Ils en parlent.', 'parler de + thing -> en', { subject: 'ils', family: 'de_thing_to_en' });
  add('pfx_de_thing_to_en_017_nous', 'Cinema & Series', 'discuter', 'We are discussing it.', 'Nous ____ discutons.', 'cette série', 'en', 'Nous en discutons.', 'discuter de + thing -> en', { subject: 'nous', family: 'de_thing_to_en' });
  add('pfx_de_thing_to_en_018_vous', 'Cinema & Series', 'discuter', 'You are discussing it.', 'Vous ____ discutez.', 'cette série', 'en', 'Vous en discutez.', 'discuter de + thing -> en', { subject: 'vous', family: 'de_thing_to_en' });
  add('pfx_de_thing_to_en_019_elle', 'Cinema & Series', 'discuter', 'She is discussing it.', 'Elle ____ discute.', 'cette série', 'en', 'Elle en discute.', 'discuter de + thing -> en', { subject: 'elle', family: 'de_thing_to_en' });
  add('pfx_de_thing_to_en_020_ils', 'Cinema & Series', 'discuter', 'They are discussing it.', 'Ils ____ discutent.', 'cette série', 'en', 'Ils en discutent.', 'discuter de + thing -> en', { subject: 'ils', family: 'de_thing_to_en' });
  add('pfx_de_thing_to_en_021_nous', 'Relationship Drama', 'parler', 'We are talking about it.', 'Nous ____ parlons.', 'cette dispute', 'en', 'Nous en parlons.', 'parler de + thing -> en', { subject: 'nous', family: 'de_thing_to_en' });
  add('pfx_de_thing_to_en_022_vous', 'Relationship Drama', 'parler', 'You are talking about it.', 'Vous ____ parlez.', 'cette dispute', 'en', 'Vous en parlez.', 'parler de + thing -> en', { subject: 'vous', family: 'de_thing_to_en' });
  add('pfx_de_thing_to_en_023_elle', 'Relationship Drama', 'parler', 'She is talking about it.', 'Elle ____ parle.', 'cette dispute', 'en', 'Elle en parle.', 'parler de + thing -> en', { subject: 'elle', family: 'de_thing_to_en' });
  add('pfx_de_thing_to_en_024_ils', 'Relationship Drama', 'parler', 'They are talking about it.', 'Ils ____ parlent.', 'cette dispute', 'en', 'Ils en parlent.', 'parler de + thing -> en', { subject: 'ils', family: 'de_thing_to_en' });
  add('pfx_de_thing_to_en_025_nous', 'Music', 'rêver', 'We are dreaming about it.', 'Nous ____ rêvons.', 'ce concert', 'en', 'Nous en rêvons.', 'rêver de + thing -> en', { subject: 'nous', family: 'de_thing_to_en' });
  add('pfx_de_thing_to_en_026_vous', 'Music', 'rêver', 'You are dreaming about it.', 'Vous ____ rêvez.', 'ce concert', 'en', 'Vous en rêvez.', 'rêver de + thing -> en', { subject: 'vous', family: 'de_thing_to_en' });
  add('pfx_de_thing_to_en_027_elle', 'Music', 'rêver', 'She is dreaming about it.', 'Elle ____ rêve.', 'ce concert', 'en', 'Elle en rêve.', 'rêver de + thing -> en', { subject: 'elle', family: 'de_thing_to_en' });
  add('pfx_de_thing_to_en_028_ils', 'Music', 'rêver', 'They are dreaming about it.', 'Ils ____ rêvent.', 'ce concert', 'en', 'Ils en rêvent.', 'rêver de + thing -> en', { subject: 'ils', family: 'de_thing_to_en' });
  add('pfx_de_thing_to_en_029_nous', 'Bureaucracy & Delivery', 'discuter', 'We are discussing it.', 'Nous ____ discutons.', 'ce dossier', 'en', 'Nous en discutons.', 'discuter de + thing -> en', { subject: 'nous', family: 'de_thing_to_en' });
  add('pfx_de_thing_to_en_030_vous', 'Bureaucracy & Delivery', 'discuter', 'You are discussing it.', 'Vous ____ discutez.', 'ce dossier', 'en', 'Vous en discutez.', 'discuter de + thing -> en', { subject: 'vous', family: 'de_thing_to_en' });
  add('pfx_de_thing_to_en_031_elle', 'Bureaucracy & Delivery', 'discuter', 'She is discussing it.', 'Elle ____ discute.', 'ce dossier', 'en', 'Elle en discute.', 'discuter de + thing -> en', { subject: 'elle', family: 'de_thing_to_en' });
  add('pfx_de_thing_to_en_032_ils', 'Bureaucracy & Delivery', 'discuter', 'They are discussing it.', 'Ils ____ discutent.', 'ce dossier', 'en', 'Ils en discutent.', 'discuter de + thing -> en', { subject: 'ils', family: 'de_thing_to_en' });
  add('pfx_de_thing_to_en_033_nous', 'Office & Admin', 'avoir', 'We need it.', 'Nous ____ avons besoin.', 'ce document', 'en', 'Nous en avons besoin.', 'avoir besoin de + thing -> en', { subject: 'nous', family: 'de_thing_to_en' });
  add('pfx_de_thing_to_en_034_vous', 'Office & Admin', 'avoir', 'You need it.', 'Vous ____ avez besoin.', 'ce document', 'en', 'Vous en avez besoin.', 'avoir besoin de + thing -> en', { subject: 'vous', family: 'de_thing_to_en' });
  add('pfx_de_thing_to_en_035_elle', 'Office & Admin', 'avoir', 'She needs it.', 'Elle ____ a besoin.', 'ce document', 'en', 'Elle en a besoin.', 'avoir besoin de + thing -> en', { subject: 'elle', family: 'de_thing_to_en' });
  add('pfx_de_thing_to_en_036_ils', 'Office & Admin', 'avoir', 'They need it.', 'Ils ____ ont besoin.', 'ce document', 'en', 'Ils en ont besoin.', 'avoir besoin de + thing -> en', { subject: 'ils', family: 'de_thing_to_en' });
  add('pfx_de_thing_to_en_037_nous', 'Nightlife & Partying', 'avoir', 'We want it.', 'Nous ____ avons envie.', 'cette sortie', 'en', 'Nous en avons envie.', 'avoir envie de + thing -> en', { subject: 'nous', family: 'de_thing_to_en' });
  add('pfx_de_thing_to_en_038_vous', 'Nightlife & Partying', 'avoir', 'You want it.', 'Vous ____ avez envie.', 'cette sortie', 'en', 'Vous en avez envie.', 'avoir envie de + thing -> en', { subject: 'vous', family: 'de_thing_to_en' });
  add('pfx_de_thing_to_en_039_elle', 'Nightlife & Partying', 'avoir', 'She wants it.', 'Elle ____ a envie.', 'cette sortie', 'en', 'Elle en a envie.', 'avoir envie de + thing -> en', { subject: 'elle', family: 'de_thing_to_en' });
  add('pfx_de_thing_to_en_040_ils', 'Nightlife & Partying', 'avoir', 'They want it.', 'Ils ____ ont envie.', 'cette sortie', 'en', 'Ils en ont envie.', 'avoir envie de + thing -> en', { subject: 'ils', family: 'de_thing_to_en' });
  add('pfx_de_thing_to_en_041_nous', 'Super Everyday', 'avoir', 'We are afraid of it.', 'Nous ____ avons peur.', 'ce bruit', 'en', 'Nous en avons peur.', 'avoir peur de + thing -> en', { subject: 'nous', family: 'de_thing_to_en' });
  add('pfx_de_thing_to_en_042_vous', 'Super Everyday', 'avoir', 'You are afraid of it.', 'Vous ____ avez peur.', 'ce bruit', 'en', 'Vous en avez peur.', 'avoir peur de + thing -> en', { subject: 'vous', family: 'de_thing_to_en' });
  add('pfx_de_thing_to_en_043_elle', 'Super Everyday', 'avoir', 'She is afraid of it.', 'Elle ____ a peur.', 'ce bruit', 'en', 'Elle en a peur.', 'avoir peur de + thing -> en', { subject: 'elle', family: 'de_thing_to_en' });
  add('pfx_de_thing_to_en_044_ils', 'Super Everyday', 'avoir', 'They are afraid of it.', 'Ils ____ ont peur.', 'ce bruit', 'en', 'Ils en ont peur.', 'avoir peur de + thing -> en', { subject: 'ils', family: 'de_thing_to_en' });
  add('pfx_de_thing_to_en_045_nous', 'Super Everyday', 'profiter', 'We are making the most of it.', 'Nous ____ profitons.', 'cette pause', 'en', 'Nous en profitons.', 'profiter de + thing -> en', { subject: 'nous', family: 'de_thing_to_en' });
  add('pfx_de_thing_to_en_046_vous', 'Super Everyday', 'profiter', 'You are making the most of it.', 'Vous ____ profitez.', 'cette pause', 'en', 'Vous en profitez.', 'profiter de + thing -> en', { subject: 'vous', family: 'de_thing_to_en' });
  add('pfx_de_thing_to_en_047_elle', 'Super Everyday', 'profiter', 'She is making the most of it.', 'Elle ____ profite.', 'cette pause', 'en', 'Elle en profite.', 'profiter de + thing -> en', { subject: 'elle', family: 'de_thing_to_en' });
  add('pfx_de_thing_to_en_048_ils', 'Super Everyday', 'profiter', 'They are making the most of it.', 'Ils ____ profitent.', 'cette pause', 'en', 'Ils en profitent.', 'profiter de + thing -> en', { subject: 'ils', family: 'de_thing_to_en' });
  add('pfx_a_thing_to_y_001_nous', 'Tech & Digital Work', 'penser', 'We are thinking about it.', 'Nous ____ pensons.', 'ce projet', 'y', 'Nous y pensons.', 'penser à + thing -> y', { subject: 'nous', family: 'a_thing_to_y' });
  add('pfx_a_thing_to_y_002_vous', 'Tech & Digital Work', 'penser', 'You are thinking about it.', 'Vous ____ pensez.', 'ce projet', 'y', 'Vous y pensez.', 'penser à + thing -> y', { subject: 'vous', family: 'a_thing_to_y' });
  add('pfx_a_thing_to_y_003_elle', 'Tech & Digital Work', 'penser', 'She is thinking about it.', 'Elle ____ pense.', 'ce projet', 'y', 'Elle y pense.', 'penser à + thing -> y', { subject: 'elle', family: 'a_thing_to_y' });
  add('pfx_a_thing_to_y_004_ils', 'Tech & Digital Work', 'penser', 'They are thinking about it.', 'Ils ____ pensent.', 'ce projet', 'y', 'Ils y pensent.', 'penser à + thing -> y', { subject: 'ils', family: 'a_thing_to_y' });
  add('pfx_a_thing_to_y_005_nous', 'Education & Learning', 'réfléchir', 'We are thinking about it.', 'Nous ____ réfléchissons.', 'cette question', 'y', 'Nous y réfléchissons.', 'réfléchir à + thing -> y', { subject: 'nous', family: 'a_thing_to_y' });
  add('pfx_a_thing_to_y_006_vous', 'Education & Learning', 'réfléchir', 'You are thinking about it.', 'Vous ____ réfléchissez.', 'cette question', 'y', 'Vous y réfléchissez.', 'réfléchir à + thing -> y', { subject: 'vous', family: 'a_thing_to_y' });
  add('pfx_a_thing_to_y_007_elle', 'Education & Learning', 'réfléchir', 'She is thinking about it.', 'Elle ____ réfléchit.', 'cette question', 'y', 'Elle y réfléchit.', 'réfléchir à + thing -> y', { subject: 'elle', family: 'a_thing_to_y' });
  add('pfx_a_thing_to_y_008_ils', 'Education & Learning', 'réfléchir', 'They are thinking about it.', 'Ils ____ réfléchissent.', 'cette question', 'y', 'Ils y réfléchissent.', 'réfléchir à + thing -> y', { subject: 'ils', family: 'a_thing_to_y' });
  add('pfx_a_thing_to_y_009_nous', 'Office & Admin', 'participer', 'We are taking part in it.', 'Nous ____ participons.', 'cette réunion', 'y', 'Nous y participons.', 'participer à + thing -> y', { subject: 'nous', family: 'a_thing_to_y' });
  add('pfx_a_thing_to_y_010_vous', 'Office & Admin', 'participer', 'You are taking part in it.', 'Vous ____ participez.', 'cette réunion', 'y', 'Vous y participez.', 'participer à + thing -> y', { subject: 'vous', family: 'a_thing_to_y' });
  add('pfx_a_thing_to_y_011_elle', 'Office & Admin', 'participer', 'She is taking part in it.', 'Elle ____ participe.', 'cette réunion', 'y', 'Elle y participe.', 'participer à + thing -> y', { subject: 'elle', family: 'a_thing_to_y' });
  add('pfx_a_thing_to_y_012_ils', 'Office & Admin', 'participer', 'They are taking part in it.', 'Ils ____ participent.', 'cette réunion', 'y', 'Ils y participent.', 'participer à + thing -> y', { subject: 'ils', family: 'a_thing_to_y' });
  add('pfx_a_thing_to_y_013_nous', 'History & Culture', 'croire', 'We believe in it.', 'Nous ____ croyons.', 'cette histoire', 'y', 'Nous y croyons.', 'croire à + thing -> y', { subject: 'nous', family: 'a_thing_to_y' });
  add('pfx_a_thing_to_y_014_vous', 'History & Culture', 'croire', 'You believe in it.', 'Vous ____ croyez.', 'cette histoire', 'y', 'Vous y croyez.', 'croire à + thing -> y', { subject: 'vous', family: 'a_thing_to_y' });
  add('pfx_a_thing_to_y_015_elle', 'History & Culture', 'croire', 'She believes in it.', 'Elle ____ croit.', 'cette histoire', 'y', 'Elle y croit.', 'croire à + thing -> y', { subject: 'elle', family: 'a_thing_to_y' });
  add('pfx_a_thing_to_y_016_ils', 'History & Culture', 'croire', 'They believe in it.', 'Ils ____ croient.', 'cette histoire', 'y', 'Ils y croient.', 'croire à + thing -> y', { subject: 'ils', family: 'a_thing_to_y' });
  add('pfx_a_thing_to_y_017_nous', 'Politics & Current Events', 'renoncer', 'We are giving it up.', 'Nous ____ renonçons.', 'ce plan', 'y', 'Nous y renonçons.', 'renoncer à + thing -> y', { subject: 'nous', family: 'a_thing_to_y' });
  add('pfx_a_thing_to_y_018_vous', 'Politics & Current Events', 'renoncer', 'You are giving it up.', 'Vous ____ renoncez.', 'ce plan', 'y', 'Vous y renoncez.', 'renoncer à + thing -> y', { subject: 'vous', family: 'a_thing_to_y' });
  add('pfx_a_thing_to_y_019_elle', 'Politics & Current Events', 'renoncer', 'She is giving it up.', 'Elle ____ renonce.', 'ce plan', 'y', 'Elle y renonce.', 'renoncer à + thing -> y', { subject: 'elle', family: 'a_thing_to_y' });
  add('pfx_a_thing_to_y_020_ils', 'Politics & Current Events', 'renoncer', 'They are giving it up.', 'Ils ____ renoncent.', 'ce plan', 'y', 'Ils y renoncent.', 'renoncer à + thing -> y', { subject: 'ils', family: 'a_thing_to_y' });
  add('pfx_a_thing_to_y_021_nous', 'Art & Design', 'tenir', 'We care about it.', 'Nous ____ tenons.', 'cette idée', 'y', 'Nous y tenons.', 'tenir à + thing -> y', { subject: 'nous', family: 'a_thing_to_y' });
  add('pfx_a_thing_to_y_022_vous', 'Art & Design', 'tenir', 'You care about it.', 'Vous ____ tenez.', 'cette idée', 'y', 'Vous y tenez.', 'tenir à + thing -> y', { subject: 'vous', family: 'a_thing_to_y' });
  add('pfx_a_thing_to_y_023_elle', 'Art & Design', 'tenir', 'She cares about it.', 'Elle ____ tient.', 'cette idée', 'y', 'Elle y tient.', 'tenir à + thing -> y', { subject: 'elle', family: 'a_thing_to_y' });
  add('pfx_a_thing_to_y_024_ils', 'Art & Design', 'tenir', 'They care about it.', 'Ils ____ tiennent.', 'cette idée', 'y', 'Ils y tiennent.', 'tenir à + thing -> y', { subject: 'ils', family: 'a_thing_to_y' });
  add('pfx_a_thing_to_y_025_nous', 'Education & Learning', 'répondre', 'We are answering it.', 'Nous ____ répondons.', 'cette question', 'y', 'Nous y répondons.', 'répondre à + thing -> y', { subject: 'nous', family: 'a_thing_to_y' });
  add('pfx_a_thing_to_y_026_vous', 'Education & Learning', 'répondre', 'You are answering it.', 'Vous ____ répondez.', 'cette question', 'y', 'Vous y répondez.', 'répondre à + thing -> y', { subject: 'vous', family: 'a_thing_to_y' });
  add('pfx_a_thing_to_y_027_elle', 'Education & Learning', 'répondre', 'She is answering it.', 'Elle ____ répond.', 'cette question', 'y', 'Elle y répond.', 'répondre à + thing -> y', { subject: 'elle', family: 'a_thing_to_y' });
  add('pfx_a_thing_to_y_028_ils', 'Education & Learning', 'répondre', 'They are answering it.', 'Ils ____ répondent.', 'cette question', 'y', 'Ils y répondent.', 'répondre à + thing -> y', { subject: 'ils', family: 'a_thing_to_y' });
  add('pfx_a_thing_to_y_029_nous', 'History & Culture', 'assister', 'We are attending it.', 'Nous ____ assistons.', 'cette conférence', 'y', 'Nous y assistons.', 'assister à + thing -> y', { subject: 'nous', family: 'a_thing_to_y' });
  add('pfx_a_thing_to_y_030_vous', 'History & Culture', 'assister', 'You are attending it.', 'Vous ____ assistez.', 'cette conférence', 'y', 'Vous y assistez.', 'assister à + thing -> y', { subject: 'vous', family: 'a_thing_to_y' });
  add('pfx_a_thing_to_y_031_elle', 'History & Culture', 'assister', 'She is attending it.', 'Elle ____ assiste.', 'cette conférence', 'y', 'Elle y assiste.', 'assister à + thing -> y', { subject: 'elle', family: 'a_thing_to_y' });
  add('pfx_a_thing_to_y_032_ils', 'History & Culture', 'assister', 'They are attending it.', 'Ils ____ assistent.', 'cette conférence', 'y', 'Ils y assistent.', 'assister à + thing -> y', { subject: 'ils', family: 'a_thing_to_y' });
  add('pfx_a_thing_to_y_033_nous', 'Tech & Digital Work', 'faire', 'We are paying attention to it.', 'Nous ____ faisons attention.', 'ce détail', 'y', 'Nous y faisons attention.', 'faire attention à + thing -> y', { subject: 'nous', family: 'a_thing_to_y' });
  add('pfx_a_thing_to_y_034_vous', 'Tech & Digital Work', 'faire', 'You are paying attention to it.', 'Vous ____ faites attention.', 'ce détail', 'y', 'Vous y faites attention.', 'faire attention à + thing -> y', { subject: 'vous', family: 'a_thing_to_y' });
  add('pfx_a_thing_to_y_035_elle', 'Tech & Digital Work', 'faire', 'She is paying attention to it.', 'Elle ____ fait attention.', 'ce détail', 'y', 'Elle y fait attention.', 'faire attention à + thing -> y', { subject: 'elle', family: 'a_thing_to_y' });
  add('pfx_a_thing_to_y_036_ils', 'Tech & Digital Work', 'faire', 'They are paying attention to it.', 'Ils ____ font attention.', 'ce détail', 'y', 'Ils y font attention.', 'faire attention à + thing -> y', { subject: 'ils', family: 'a_thing_to_y' });
  add('pfx_a_thing_to_y_037_nous', 'Super Everyday', 'jouer', 'We are playing it.', 'Nous ____ jouons.', 'ce jeu', 'y', 'Nous y jouons.', 'jouer à + thing -> y', { subject: 'nous', family: 'a_thing_to_y' });
  add('pfx_a_thing_to_y_038_vous', 'Super Everyday', 'jouer', 'You are playing it.', 'Vous ____ jouez.', 'ce jeu', 'y', 'Vous y jouez.', 'jouer à + thing -> y', { subject: 'vous', family: 'a_thing_to_y' });
  add('pfx_a_thing_to_y_039_elle', 'Super Everyday', 'jouer', 'She is playing it.', 'Elle ____ joue.', 'ce jeu', 'y', 'Elle y joue.', 'jouer à + thing -> y', { subject: 'elle', family: 'a_thing_to_y' });
  add('pfx_a_thing_to_y_040_ils', 'Super Everyday', 'jouer', 'They are playing it.', 'Ils ____ jouent.', 'ce jeu', 'y', 'Ils y jouent.', 'jouer à + thing -> y', { subject: 'ils', family: 'a_thing_to_y' });
  add('pfx_a_thing_to_y_041_nous', 'Tech & Digital Work', 'toucher', 'We are touching it.', 'Nous ____ touchons.', 'ce fichier', 'y', 'Nous y touchons.', 'toucher à + thing -> y', { subject: 'nous', family: 'a_thing_to_y' });
  add('pfx_a_thing_to_y_042_vous', 'Tech & Digital Work', 'toucher', 'You are touching it.', 'Vous ____ touchez.', 'ce fichier', 'y', 'Vous y touchez.', 'toucher à + thing -> y', { subject: 'vous', family: 'a_thing_to_y' });
  add('pfx_a_thing_to_y_043_elle', 'Tech & Digital Work', 'toucher', 'She is touching it.', 'Elle ____ touche.', 'ce fichier', 'y', 'Elle y touche.', 'toucher à + thing -> y', { subject: 'elle', family: 'a_thing_to_y' });
  add('pfx_a_thing_to_y_044_ils', 'Tech & Digital Work', 'toucher', 'They are touching it.', 'Ils ____ touchent.', 'ce fichier', 'y', 'Ils y touchent.', 'toucher à + thing -> y', { subject: 'ils', family: 'a_thing_to_y' });
  add('pfx_a_thing_to_y_045_nous', 'Tech & Digital Work', 'penser', 'We are thinking about it.', 'Nous ____ pensons.', 'cette solution', 'y', 'Nous y pensons.', 'penser à + thing -> y', { subject: 'nous', family: 'a_thing_to_y' });
  add('pfx_a_thing_to_y_046_vous', 'Tech & Digital Work', 'penser', 'You are thinking about it.', 'Vous ____ pensez.', 'cette solution', 'y', 'Vous y pensez.', 'penser à + thing -> y', { subject: 'vous', family: 'a_thing_to_y' });
  add('pfx_a_thing_to_y_047_elle', 'Tech & Digital Work', 'penser', 'She is thinking about it.', 'Elle ____ pense.', 'cette solution', 'y', 'Elle y pense.', 'penser à + thing -> y', { subject: 'elle', family: 'a_thing_to_y' });
  add('pfx_a_thing_to_y_048_ils', 'Tech & Digital Work', 'penser', 'They are thinking about it.', 'Ils ____ pensent.', 'cette solution', 'y', 'Ils y pensent.', 'penser à + thing -> y', { subject: 'ils', family: 'a_thing_to_y' });
  add('pfx_location_to_y_001_nous', 'Office & Admin', 'aller', 'We are going there.', 'Nous ____ allons.', 'au bureau', 'y', 'Nous y allons.', 'location -> y', { subject: 'nous', family: 'location_to_y' });
  add('pfx_location_to_y_002_vous', 'Office & Admin', 'aller', 'You are going there.', 'Vous ____ allez.', 'au bureau', 'y', 'Vous y allez.', 'location -> y', { subject: 'vous', family: 'location_to_y' });
  add('pfx_location_to_y_003_elle', 'Office & Admin', 'aller', 'She is going there.', 'Elle ____ va.', 'au bureau', 'y', 'Elle y va.', 'location -> y', { subject: 'elle', family: 'location_to_y' });
  add('pfx_location_to_y_004_ils', 'Office & Admin', 'aller', 'They are going there.', 'Ils ____ vont.', 'au bureau', 'y', 'Ils y vont.', 'location -> y', { subject: 'ils', family: 'location_to_y' });
  add('pfx_location_to_y_005_nous', 'Super Everyday', 'retourner', 'We are going back there.', 'Nous ____ retournons.', 'à la maison', 'y', 'Nous y retournons.', 'location -> y', { subject: 'nous', family: 'location_to_y' });
  add('pfx_location_to_y_006_vous', 'Super Everyday', 'retourner', 'You are going back there.', 'Vous ____ retournez.', 'à la maison', 'y', 'Vous y retournez.', 'location -> y', { subject: 'vous', family: 'location_to_y' });
  add('pfx_location_to_y_007_elle', 'Super Everyday', 'retourner', 'She is going back there.', 'Elle ____ retourne.', 'à la maison', 'y', 'Elle y retourne.', 'location -> y', { subject: 'elle', family: 'location_to_y' });
  add('pfx_location_to_y_008_ils', 'Super Everyday', 'retourner', 'They are going back there.', 'Ils ____ retournent.', 'à la maison', 'y', 'Ils y retournent.', 'location -> y', { subject: 'ils', family: 'location_to_y' });
  add('pfx_location_to_y_009_nous', 'Travel & Tourism', 'rester', 'We are staying there.', 'Nous ____ restons.', 'à l’hôtel', 'y', 'Nous y restons.', 'location -> y', { subject: 'nous', family: 'location_to_y' });
  add('pfx_location_to_y_010_vous', 'Travel & Tourism', 'rester', 'You are staying there.', 'Vous ____ restez.', 'à l’hôtel', 'y', 'Vous y restez.', 'location -> y', { subject: 'vous', family: 'location_to_y' });
  add('pfx_location_to_y_011_elle', 'Travel & Tourism', 'rester', 'She is staying there.', 'Elle ____ reste.', 'à l’hôtel', 'y', 'Elle y reste.', 'location -> y', { subject: 'elle', family: 'location_to_y' });
  add('pfx_location_to_y_012_ils', 'Travel & Tourism', 'rester', 'They are staying there.', 'Ils ____ restent.', 'à l’hôtel', 'y', 'Ils y restent.', 'location -> y', { subject: 'ils', family: 'location_to_y' });
  add('pfx_location_to_y_013_nous', 'Super Everyday', 'passer', 'We are stopping by there.', 'Nous ____ passons.', 'à la pharmacie', 'y', 'Nous y passons.', 'location -> y', { subject: 'nous', family: 'location_to_y' });
  add('pfx_location_to_y_014_vous', 'Super Everyday', 'passer', 'You are stopping by there.', 'Vous ____ passez.', 'à la pharmacie', 'y', 'Vous y passez.', 'location -> y', { subject: 'vous', family: 'location_to_y' });
  add('pfx_location_to_y_015_elle', 'Super Everyday', 'passer', 'She is stopping by there.', 'Elle ____ passe.', 'à la pharmacie', 'y', 'Elle y passe.', 'location -> y', { subject: 'elle', family: 'location_to_y' });
  add('pfx_location_to_y_016_ils', 'Super Everyday', 'passer', 'They are stopping by there.', 'Ils ____ passent.', 'à la pharmacie', 'y', 'Ils y passent.', 'location -> y', { subject: 'ils', family: 'location_to_y' });
  add('pfx_location_to_y_017_nous', 'Education & Learning', 'entrer', 'We are going in there.', 'Nous ____ entrons.', 'dans la salle', 'y', 'Nous y entrons.', 'location -> y', { subject: 'nous', family: 'location_to_y' });
  add('pfx_location_to_y_018_vous', 'Education & Learning', 'entrer', 'You are going in there.', 'Vous ____ entrez.', 'dans la salle', 'y', 'Vous y entrez.', 'location -> y', { subject: 'vous', family: 'location_to_y' });
  add('pfx_location_to_y_019_elle', 'Education & Learning', 'entrer', 'She is going in there.', 'Elle ____ entre.', 'dans la salle', 'y', 'Elle y entre.', 'location -> y', { subject: 'elle', family: 'location_to_y' });
  add('pfx_location_to_y_020_ils', 'Education & Learning', 'entrer', 'They are going in there.', 'Ils ____ entrent.', 'dans la salle', 'y', 'Ils y entrent.', 'location -> y', { subject: 'ils', family: 'location_to_y' });
  add('pfx_location_to_y_021_nous', 'Super Everyday', 'monter', 'We are going up there.', 'Nous ____ montons.', 'au grenier', 'y', 'Nous y montons.', 'location -> y', { subject: 'nous', family: 'location_to_y' });
  add('pfx_location_to_y_022_vous', 'Super Everyday', 'monter', 'You are going up there.', 'Vous ____ montez.', 'au grenier', 'y', 'Vous y montez.', 'location -> y', { subject: 'vous', family: 'location_to_y' });
  add('pfx_location_to_y_023_elle', 'Super Everyday', 'monter', 'She is going up there.', 'Elle ____ monte.', 'au grenier', 'y', 'Elle y monte.', 'location -> y', { subject: 'elle', family: 'location_to_y' });
  add('pfx_location_to_y_024_ils', 'Super Everyday', 'monter', 'They are going up there.', 'Ils ____ montent.', 'au grenier', 'y', 'Ils y montent.', 'location -> y', { subject: 'ils', family: 'location_to_y' });
  add('pfx_indirect_person_001_nous', 'Relationship Drama', 'parler', 'We are talking to her.', 'Nous ____ parlons.', 'Marie', 'lui', 'Nous lui parlons.', 'parler à + person -> lui', { subject: 'nous', family: 'indirect_person' });
  add('pfx_indirect_person_002_vous', 'Relationship Drama', 'parler', 'You are talking to her.', 'Vous ____ parlez.', 'Marie', 'lui', 'Vous lui parlez.', 'parler à + person -> lui', { subject: 'vous', family: 'indirect_person' });
  add('pfx_indirect_person_003_elle', 'Relationship Drama', 'parler', 'She is talking to her.', 'Elle ____ parle.', 'Marie', 'lui', 'Elle lui parle.', 'parler à + person -> lui', { subject: 'elle', family: 'indirect_person' });
  add('pfx_indirect_person_004_ils', 'Relationship Drama', 'parler', 'They are talking to her.', 'Ils ____ parlent.', 'Marie', 'lui', 'Ils lui parlent.', 'parler à + person -> lui', { subject: 'ils', family: 'indirect_person' });
  add('pfx_indirect_person_005_nous', 'Office & Admin', 'répondre', 'We are answering them.', 'Nous ____ répondons.', 'les clients', 'leur', 'Nous leur répondons.', 'répondre à + people -> leur', { subject: 'nous', family: 'indirect_person' });
  add('pfx_indirect_person_006_vous', 'Office & Admin', 'répondre', 'You are answering them.', 'Vous ____ répondez.', 'les clients', 'leur', 'Vous leur répondez.', 'répondre à + people -> leur', { subject: 'vous', family: 'indirect_person' });
  add('pfx_indirect_person_007_elle', 'Office & Admin', 'répondre', 'She is answering them.', 'Elle ____ répond.', 'les clients', 'leur', 'Elle leur répond.', 'répondre à + people -> leur', { subject: 'elle', family: 'indirect_person' });
  add('pfx_indirect_person_008_ils', 'Office & Admin', 'répondre', 'They are answering them.', 'Ils ____ répondent.', 'les clients', 'leur', 'Ils leur répondent.', 'répondre à + people -> leur', { subject: 'ils', family: 'indirect_person' });
  add('pfx_indirect_person_009_nous', 'Super Everyday', 'téléphoner', 'We are calling him.', 'Nous ____ téléphonons.', 'Paul', 'lui', 'Nous lui téléphonons.', 'téléphoner à + person -> lui', { subject: 'nous', family: 'indirect_person' });
  add('pfx_indirect_person_010_vous', 'Super Everyday', 'téléphoner', 'You are calling him.', 'Vous ____ téléphonez.', 'Paul', 'lui', 'Vous lui téléphonez.', 'téléphoner à + person -> lui', { subject: 'vous', family: 'indirect_person' });
  add('pfx_indirect_person_011_elle', 'Super Everyday', 'téléphoner', 'She is calling him.', 'Elle ____ téléphone.', 'Paul', 'lui', 'Elle lui téléphone.', 'téléphoner à + person -> lui', { subject: 'elle', family: 'indirect_person' });
  add('pfx_indirect_person_012_ils', 'Super Everyday', 'téléphoner', 'They are calling him.', 'Ils ____ téléphonent.', 'Paul', 'lui', 'Ils lui téléphonent.', 'téléphoner à + person -> lui', { subject: 'ils', family: 'indirect_person' });
  add('pfx_indirect_person_013_nous', 'Relationship Drama', 'écrire', 'We are writing to them.', 'Nous ____ écrivons.', 'les voisins', 'leur', 'Nous leur écrivons.', 'écrire à + people -> leur', { subject: 'nous', family: 'indirect_person' });
  add('pfx_indirect_person_014_vous', 'Relationship Drama', 'écrire', 'You are writing to them.', 'Vous ____ écrivez.', 'les voisins', 'leur', 'Vous leur écrivez.', 'écrire à + people -> leur', { subject: 'vous', family: 'indirect_person' });
  add('pfx_indirect_person_015_elle', 'Relationship Drama', 'écrire', 'She is writing to them.', 'Elle ____ écrit.', 'les voisins', 'leur', 'Elle leur écrit.', 'écrire à + people -> leur', { subject: 'elle', family: 'indirect_person' });
  add('pfx_indirect_person_016_ils', 'Relationship Drama', 'écrire', 'They are writing to them.', 'Ils ____ écrivent.', 'les voisins', 'leur', 'Ils leur écrivent.', 'écrire à + people -> leur', { subject: 'ils', family: 'indirect_person' });
  add('pfx_indirect_person_017_nous', 'Super Everyday', 'sourire', 'We are smiling at them.', 'Nous ____ sourions.', 'les enfants', 'leur', 'Nous leur sourions.', 'sourire à + people -> leur', { subject: 'nous', family: 'indirect_person' });
  add('pfx_indirect_person_018_vous', 'Super Everyday', 'sourire', 'You are smiling at them.', 'Vous ____ souriez.', 'les enfants', 'leur', 'Vous leur souriez.', 'sourire à + people -> leur', { subject: 'vous', family: 'indirect_person' });
  add('pfx_indirect_person_019_elle', 'Super Everyday', 'sourire', 'She is smiling at them.', 'Elle ____ sourit.', 'les enfants', 'leur', 'Elle leur sourit.', 'sourire à + people -> leur', { subject: 'elle', family: 'indirect_person' });
  add('pfx_indirect_person_020_ils', 'Super Everyday', 'sourire', 'They are smiling at them.', 'Ils ____ sourient.', 'les enfants', 'leur', 'Ils leur sourient.', 'sourire à + people -> leur', { subject: 'ils', family: 'indirect_person' });
  add('pfx_indirect_person_021_nous', 'Super Everyday', 'dire', 'We are saying hello to her.', 'Nous ____ disons bonjour.', 'Julie', 'lui', 'Nous lui disons bonjour.', 'dire bonjour à + person -> lui', { subject: 'nous', family: 'indirect_person' });
  add('pfx_indirect_person_022_vous', 'Super Everyday', 'dire', 'You are saying hello to her.', 'Vous ____ dites bonjour.', 'Julie', 'lui', 'Vous lui dites bonjour.', 'dire bonjour à + person -> lui', { subject: 'vous', family: 'indirect_person' });
  add('pfx_indirect_person_023_elle', 'Super Everyday', 'dire', 'She is saying hello to her.', 'Elle ____ dit bonjour.', 'Julie', 'lui', 'Elle lui dit bonjour.', 'dire bonjour à + person -> lui', { subject: 'elle', family: 'indirect_person' });
  add('pfx_indirect_person_024_ils', 'Super Everyday', 'dire', 'They are saying hello to her.', 'Ils ____ disent bonjour.', 'Julie', 'lui', 'Ils lui disent bonjour.', 'dire bonjour à + person -> lui', { subject: 'ils', family: 'indirect_person' });
  add('pfx_indirect_person_025_nous', 'Education & Learning', 'souhaiter', 'We are wishing him good luck.', 'Nous ____ souhaitons bonne chance.', 'Luc', 'lui', 'Nous lui souhaitons bonne chance.', 'souhaiter bonne chance à + person -> lui', { subject: 'nous', family: 'indirect_person' });
  add('pfx_indirect_person_026_vous', 'Education & Learning', 'souhaiter', 'You are wishing him good luck.', 'Vous ____ souhaitez bonne chance.', 'Luc', 'lui', 'Vous lui souhaitez bonne chance.', 'souhaiter bonne chance à + person -> lui', { subject: 'vous', family: 'indirect_person' });
  add('pfx_indirect_person_027_elle', 'Education & Learning', 'souhaiter', 'She is wishing him good luck.', 'Elle ____ souhaite bonne chance.', 'Luc', 'lui', 'Elle lui souhaite bonne chance.', 'souhaiter bonne chance à + person -> lui', { subject: 'elle', family: 'indirect_person' });
  add('pfx_indirect_person_028_ils', 'Education & Learning', 'souhaiter', 'They are wishing him good luck.', 'Ils ____ souhaitent bonne chance.', 'Luc', 'lui', 'Ils lui souhaitent bonne chance.', 'souhaiter bonne chance à + person -> lui', { subject: 'ils', family: 'indirect_person' });
  add('pfx_indirect_person_029_nous', 'Relationship Drama', 'raconter', 'We are telling them a joke.', 'Nous ____ racontons une blague.', 'nos amis', 'leur', 'Nous leur racontons une blague.', 'raconter une blague à + people -> leur', { subject: 'nous', family: 'indirect_person' });
  add('pfx_indirect_person_030_vous', 'Relationship Drama', 'raconter', 'You are telling them a joke.', 'Vous ____ racontez une blague.', 'nos amis', 'leur', 'Vous leur racontez une blague.', 'raconter une blague à + people -> leur', { subject: 'vous', family: 'indirect_person' });
  add('pfx_indirect_person_031_elle', 'Relationship Drama', 'raconter', 'She is telling them a joke.', 'Elle ____ raconte une blague.', 'nos amis', 'leur', 'Elle leur raconte une blague.', 'raconter une blague à + people -> leur', { subject: 'elle', family: 'indirect_person' });
  add('pfx_indirect_person_032_ils', 'Relationship Drama', 'raconter', 'They are telling them a joke.', 'Ils ____ racontent une blague.', 'nos amis', 'leur', 'Ils leur racontent une blague.', 'raconter une blague à + people -> leur', { subject: 'ils', family: 'indirect_person' });
  add('pfx_indirect_person_033_nous', 'Relationship Drama', 'demander', 'We are asking her for forgiveness.', 'Nous ____ demandons pardon.', 'Claire', 'lui', 'Nous lui demandons pardon.', 'demander pardon à + person -> lui', { subject: 'nous', family: 'indirect_person' });
  add('pfx_indirect_person_034_vous', 'Relationship Drama', 'demander', 'You are asking her for forgiveness.', 'Vous ____ demandez pardon.', 'Claire', 'lui', 'Vous lui demandez pardon.', 'demander pardon à + person -> lui', { subject: 'vous', family: 'indirect_person' });
  add('pfx_indirect_person_035_elle', 'Relationship Drama', 'demander', 'She is asking her for forgiveness.', 'Elle ____ demande pardon.', 'Claire', 'lui', 'Elle lui demande pardon.', 'demander pardon à + person -> lui', { subject: 'elle', family: 'indirect_person' });
  add('pfx_indirect_person_036_ils', 'Relationship Drama', 'demander', 'They are asking her for forgiveness.', 'Ils ____ demandent pardon.', 'Claire', 'lui', 'Ils lui demandent pardon.', 'demander pardon à + person -> lui', { subject: 'ils', family: 'indirect_person' });
  add('pfx_indirect_person_037_nous', 'Relationship Drama', 'faire', 'We trust him.', 'Nous ____ faisons confiance.', 'Marc', 'lui', 'Nous lui faisons confiance.', 'faire confiance à + person -> lui', { subject: 'nous', family: 'indirect_person' });
  add('pfx_indirect_person_038_vous', 'Relationship Drama', 'faire', 'You trust him.', 'Vous ____ faites confiance.', 'Marc', 'lui', 'Vous lui faites confiance.', 'faire confiance à + person -> lui', { subject: 'vous', family: 'indirect_person' });
  add('pfx_indirect_person_039_elle', 'Relationship Drama', 'faire', 'She trusts him.', 'Elle ____ fait confiance.', 'Marc', 'lui', 'Elle lui fait confiance.', 'faire confiance à + person -> lui', { subject: 'elle', family: 'indirect_person' });
  add('pfx_indirect_person_040_ils', 'Relationship Drama', 'faire', 'They trust him.', 'Ils ____ font confiance.', 'Marc', 'lui', 'Ils lui font confiance.', 'faire confiance à + person -> lui', { subject: 'ils', family: 'indirect_person' });
  add('pfx_indirect_person_041_nous', 'Office & Admin', 'répondre', 'We are answering her.', 'Nous ____ répondons.', 'Anna', 'lui', 'Nous lui répondons.', 'répondre à + person -> lui', { subject: 'nous', family: 'indirect_person' });
  add('pfx_indirect_person_042_vous', 'Office & Admin', 'répondre', 'You are answering her.', 'Vous ____ répondez.', 'Anna', 'lui', 'Vous lui répondez.', 'répondre à + person -> lui', { subject: 'vous', family: 'indirect_person' });
  add('pfx_indirect_person_043_elle', 'Office & Admin', 'répondre', 'She is answering her.', 'Elle ____ répond.', 'Anna', 'lui', 'Elle lui répond.', 'répondre à + person -> lui', { subject: 'elle', family: 'indirect_person' });
  add('pfx_indirect_person_044_ils', 'Office & Admin', 'répondre', 'They are answering her.', 'Ils ____ répondent.', 'Anna', 'lui', 'Ils lui répondent.', 'répondre à + person -> lui', { subject: 'ils', family: 'indirect_person' });
  add('pfx_indirect_person_045_nous', 'Super Everyday', 'écrire', 'We are writing to them.', 'Nous ____ écrivons.', 'mes parents', 'leur', 'Nous leur écrivons.', 'écrire à + people -> leur', { subject: 'nous', family: 'indirect_person' });
  add('pfx_indirect_person_046_vous', 'Super Everyday', 'écrire', 'You are writing to them.', 'Vous ____ écrivez.', 'mes parents', 'leur', 'Vous leur écrivez.', 'écrire à + people -> leur', { subject: 'vous', family: 'indirect_person' });
  add('pfx_indirect_person_047_elle', 'Super Everyday', 'écrire', 'She is writing to them.', 'Elle ____ écrit.', 'mes parents', 'leur', 'Elle leur écrit.', 'écrire à + people -> leur', { subject: 'elle', family: 'indirect_person' });
  add('pfx_indirect_person_048_ils', 'Super Everyday', 'écrire', 'They are writing to them.', 'Ils ____ écrivent.', 'mes parents', 'leur', 'Ils leur écrivent.', 'écrire à + people -> leur', { subject: 'ils', family: 'indirect_person' });
  add('pfx_indirect_person_049_nous', 'Relationship Drama', 'mentir', 'We are lying to him.', 'Nous ____ mentons.', 'Paul', 'lui', 'Nous lui mentons.', 'mentir à + person -> lui', { subject: 'nous', family: 'indirect_person' });
  add('pfx_indirect_person_050_vous', 'Relationship Drama', 'mentir', 'You are lying to him.', 'Vous ____ mentez.', 'Paul', 'lui', 'Vous lui mentez.', 'mentir à + person -> lui', { subject: 'vous', family: 'indirect_person' });
  add('pfx_indirect_person_051_elle', 'Relationship Drama', 'mentir', 'She is lying to him.', 'Elle ____ ment.', 'Paul', 'lui', 'Elle lui ment.', 'mentir à + person -> lui', { subject: 'elle', family: 'indirect_person' });
  add('pfx_indirect_person_052_ils', 'Relationship Drama', 'mentir', 'They are lying to him.', 'Ils ____ mentent.', 'Paul', 'lui', 'Ils lui mentent.', 'mentir à + person -> lui', { subject: 'ils', family: 'indirect_person' });
  add('pfx_multi_clitic_001_nous', 'Super Everyday', 'montrer', 'We are showing them to you.', 'Nous ____ montrons.', 'les photos -> toi', 'te les', 'Nous te les montrons.', 'to you + them -> te les', { subject: 'nous', family: 'multi_clitic' });
  add('pfx_multi_clitic_002_vous', 'Super Everyday', 'montrer', 'You are showing them to you.', 'Vous ____ montrez.', 'les photos -> toi', 'te les', 'Vous te les montrez.', 'to you + them -> te les', { subject: 'vous', family: 'multi_clitic' });
  add('pfx_multi_clitic_003_elle', 'Super Everyday', 'montrer', 'She is showing them to you.', 'Elle ____ montre.', 'les photos -> toi', 'te les', 'Elle te les montre.', 'to you + them -> te les', { subject: 'elle', family: 'multi_clitic' });
  add('pfx_multi_clitic_004_ils', 'Super Everyday', 'montrer', 'They are showing them to you.', 'Ils ____ montrent.', 'les photos -> toi', 'te les', 'Ils te les montrent.', 'to you + them -> te les', { subject: 'ils', family: 'multi_clitic' });
  add('pfx_multi_clitic_005_nous', 'Travel & Tourism', 'rendre', 'We are giving it back to you.', 'Nous ____ rendons.', 'le passeport -> vous', 'vous le', 'Nous vous le rendons.', 'to you + it -> vous le', { subject: 'nous', family: 'multi_clitic' });
  add('pfx_multi_clitic_006_vous', 'Travel & Tourism', 'rendre', 'You are giving it back to you.', 'Vous ____ rendez.', 'le passeport -> vous', 'vous le', 'Vous vous le rendez.', 'to you + it -> vous le', { subject: 'vous', family: 'multi_clitic' });
  add('pfx_multi_clitic_007_elle', 'Travel & Tourism', 'rendre', 'She is giving it back to you.', 'Elle ____ rend.', 'le passeport -> vous', 'vous le', 'Elle vous le rend.', 'to you + it -> vous le', { subject: 'elle', family: 'multi_clitic' });
  add('pfx_multi_clitic_008_ils', 'Travel & Tourism', 'rendre', 'They are giving it back to you.', 'Ils ____ rendent.', 'le passeport -> vous', 'vous le', 'Ils vous le rendent.', 'to you + it -> vous le', { subject: 'ils', family: 'multi_clitic' });
  add('pfx_multi_clitic_009_nous', 'Music', 'prêter', 'We are lending it to me.', 'Nous ____ prêtons.', 'la guitare -> moi', 'me la', 'Nous me la prêtons.', 'to me + it -> me la', { subject: 'nous', family: 'multi_clitic' });
  add('pfx_multi_clitic_010_vous', 'Music', 'prêter', 'You are lending it to me.', 'Vous ____ prêtez.', 'la guitare -> moi', 'me la', 'Vous me la prêtez.', 'to me + it -> me la', { subject: 'vous', family: 'multi_clitic' });
  add('pfx_multi_clitic_011_elle', 'Music', 'prêter', 'She is lending it to me.', 'Elle ____ prête.', 'la guitare -> moi', 'me la', 'Elle me la prête.', 'to me + it -> me la', { subject: 'elle', family: 'multi_clitic' });
  add('pfx_multi_clitic_012_ils', 'Music', 'prêter', 'They are lending it to me.', 'Ils ____ prêtent.', 'la guitare -> moi', 'me la', 'Ils me la prêtent.', 'to me + it -> me la', { subject: 'ils', family: 'multi_clitic' });
  add('pfx_multi_clitic_013_nous', 'Office & Admin', 'envoyer', 'We are sending them to us.', 'Nous ____ envoyons.', 'les invitations -> nous', 'nous les', 'Nous nous les envoyons.', 'to us + them -> nous les', { subject: 'nous', family: 'multi_clitic' });
  add('pfx_multi_clitic_014_vous', 'Office & Admin', 'envoyer', 'You are sending them to us.', 'Vous ____ envoyez.', 'les invitations -> nous', 'nous les', 'Vous nous les envoyez.', 'to us + them -> nous les', { subject: 'vous', family: 'multi_clitic' });
  add('pfx_multi_clitic_015_elle', 'Office & Admin', 'envoyer', 'She is sending them to us.', 'Elle ____ envoie.', 'les invitations -> nous', 'nous les', 'Elle nous les envoie.', 'to us + them -> nous les', { subject: 'elle', family: 'multi_clitic' });
  add('pfx_multi_clitic_016_ils', 'Office & Admin', 'envoyer', 'They are sending them to us.', 'Ils ____ envoient.', 'les invitations -> nous', 'nous les', 'Ils nous les envoient.', 'to us + them -> nous les', { subject: 'ils', family: 'multi_clitic' });
  add('pfx_multi_clitic_017_nous', 'Office & Admin', 'donner', 'We are giving it to her.', 'Nous ____ donnons.', 'le dossier -> Marie', 'le lui', 'Nous le lui donnons.', 'it + to her -> le lui', { subject: 'nous', family: 'multi_clitic' });
  add('pfx_multi_clitic_018_vous', 'Office & Admin', 'donner', 'You are giving it to her.', 'Vous ____ donnez.', 'le dossier -> Marie', 'le lui', 'Vous le lui donnez.', 'it + to her -> le lui', { subject: 'vous', family: 'multi_clitic' });
  add('pfx_multi_clitic_019_elle', 'Office & Admin', 'donner', 'She is giving it to her.', 'Elle ____ donne.', 'le dossier -> Marie', 'le lui', 'Elle le lui donne.', 'it + to her -> le lui', { subject: 'elle', family: 'multi_clitic' });
  add('pfx_multi_clitic_020_ils', 'Office & Admin', 'donner', 'They are giving it to her.', 'Ils ____ donnent.', 'le dossier -> Marie', 'le lui', 'Ils le lui donnent.', 'it + to her -> le lui', { subject: 'ils', family: 'multi_clitic' });
  add('pfx_multi_clitic_021_nous', 'Travel & Tourism', 'envoyer', 'We are sending them to him.', 'Nous ____ envoyons.', 'les photos -> Paul', 'les lui', 'Nous les lui envoyons.', 'them + to him -> les lui', { subject: 'nous', family: 'multi_clitic' });
  add('pfx_multi_clitic_022_vous', 'Travel & Tourism', 'envoyer', 'You are sending them to him.', 'Vous ____ envoyez.', 'les photos -> Paul', 'les lui', 'Vous les lui envoyez.', 'them + to him -> les lui', { subject: 'vous', family: 'multi_clitic' });
  add('pfx_multi_clitic_023_elle', 'Travel & Tourism', 'envoyer', 'She is sending them to him.', 'Elle ____ envoie.', 'les photos -> Paul', 'les lui', 'Elle les lui envoie.', 'them + to him -> les lui', { subject: 'elle', family: 'multi_clitic' });
  add('pfx_multi_clitic_024_ils', 'Travel & Tourism', 'envoyer', 'They are sending them to him.', 'Ils ____ envoient.', 'les photos -> Paul', 'les lui', 'Ils les lui envoient.', 'them + to him -> les lui', { subject: 'ils', family: 'multi_clitic' });
  add('pfx_multi_clitic_025_nous', 'Bureaucracy & Delivery', 'apporter', 'We are bringing it to them.', 'Nous ____ apportons.', 'la facture -> les clients', 'la leur', 'Nous la leur apportons.', 'it + to them -> la leur', { subject: 'nous', family: 'multi_clitic' });
  add('pfx_multi_clitic_026_vous', 'Bureaucracy & Delivery', 'apporter', 'You are bringing it to them.', 'Vous ____ apportez.', 'la facture -> les clients', 'la leur', 'Vous la leur apportez.', 'it + to them -> la leur', { subject: 'vous', family: 'multi_clitic' });
  add('pfx_multi_clitic_027_elle', 'Bureaucracy & Delivery', 'apporter', 'She is bringing it to them.', 'Elle ____ apporte.', 'la facture -> les clients', 'la leur', 'Elle la leur apporte.', 'it + to them -> la leur', { subject: 'elle', family: 'multi_clitic' });
  add('pfx_multi_clitic_028_ils', 'Bureaucracy & Delivery', 'apporter', 'They are bringing it to them.', 'Ils ____ apportent.', 'la facture -> les clients', 'la leur', 'Ils la leur apportent.', 'it + to them -> la leur', { subject: 'ils', family: 'multi_clitic' });
  add('pfx_multi_clitic_029_nous', 'Crafts & Making', 'montrer', 'We are showing them to them.', 'Nous ____ montrons.', 'les plans -> nos voisins', 'les leur', 'Nous les leur montrons.', 'them + to them -> les leur', { subject: 'nous', family: 'multi_clitic' });
  add('pfx_multi_clitic_030_vous', 'Crafts & Making', 'montrer', 'You are showing them to them.', 'Vous ____ montrez.', 'les plans -> nos voisins', 'les leur', 'Vous les leur montrez.', 'them + to them -> les leur', { subject: 'vous', family: 'multi_clitic' });
  add('pfx_multi_clitic_031_elle', 'Crafts & Making', 'montrer', 'She is showing them to them.', 'Elle ____ montre.', 'les plans -> nos voisins', 'les leur', 'Elle les leur montre.', 'them + to them -> les leur', { subject: 'elle', family: 'multi_clitic' });
  add('pfx_multi_clitic_032_ils', 'Crafts & Making', 'montrer', 'They are showing them to them.', 'Ils ____ montrent.', 'les plans -> nos voisins', 'les leur', 'Ils les leur montrent.', 'them + to them -> les leur', { subject: 'ils', family: 'multi_clitic' });
  add('pfx_multi_clitic_033_nous', 'Relationship Drama', 'parler', 'We are talking to her about it.', 'Nous ____ parlons.', 'Marie -> ce problème', 'lui en', 'Nous lui en parlons.', 'to her + about it -> lui en', { subject: 'nous', family: 'multi_clitic' });
  add('pfx_multi_clitic_034_vous', 'Relationship Drama', 'parler', 'You are talking to her about it.', 'Vous ____ parlez.', 'Marie -> ce problème', 'lui en', 'Vous lui en parlez.', 'to her + about it -> lui en', { subject: 'vous', family: 'multi_clitic' });
  add('pfx_multi_clitic_035_elle', 'Relationship Drama', 'parler', 'She is talking to her about it.', 'Elle ____ parle.', 'Marie -> ce problème', 'lui en', 'Elle lui en parle.', 'to her + about it -> lui en', { subject: 'elle', family: 'multi_clitic' });
  add('pfx_multi_clitic_036_ils', 'Relationship Drama', 'parler', 'They are talking to her about it.', 'Ils ____ parlent.', 'Marie -> ce problème', 'lui en', 'Ils lui en parlent.', 'to her + about it -> lui en', { subject: 'ils', family: 'multi_clitic' });
  add('pfx_multi_clitic_037_nous', 'Office & Admin', 'parler', 'We are talking to them about it.', 'Nous ____ parlons.', 'mes collègues -> ce plan', 'leur en', 'Nous leur en parlons.', 'to them + about it -> leur en', { subject: 'nous', family: 'multi_clitic' });
  add('pfx_multi_clitic_038_vous', 'Office & Admin', 'parler', 'You are talking to them about it.', 'Vous ____ parlez.', 'mes collègues -> ce plan', 'leur en', 'Vous leur en parlez.', 'to them + about it -> leur en', { subject: 'vous', family: 'multi_clitic' });
  add('pfx_multi_clitic_039_elle', 'Office & Admin', 'parler', 'She is talking to them about it.', 'Elle ____ parle.', 'mes collègues -> ce plan', 'leur en', 'Elle leur en parle.', 'to them + about it -> leur en', { subject: 'elle', family: 'multi_clitic' });
  add('pfx_multi_clitic_040_ils', 'Office & Admin', 'parler', 'They are talking to them about it.', 'Ils ____ parlent.', 'mes collègues -> ce plan', 'leur en', 'Ils leur en parlent.', 'to them + about it -> leur en', { subject: 'ils', family: 'multi_clitic' });
  add('pfx_multi_clitic_041_nous', 'Relationship Drama', 'dire', 'We are telling it to you.', 'Nous ____ disons.', 'la vérité -> toi', 'te la', 'Nous te la disons.', 'to you + it -> te la', { subject: 'nous', family: 'multi_clitic' });
  add('pfx_multi_clitic_042_vous', 'Relationship Drama', 'dire', 'You are telling it to you.', 'Vous ____ dites.', 'la vérité -> toi', 'te la', 'Vous te la dites.', 'to you + it -> te la', { subject: 'vous', family: 'multi_clitic' });
  add('pfx_multi_clitic_043_elle', 'Relationship Drama', 'dire', 'She is telling it to you.', 'Elle ____ dit.', 'la vérité -> toi', 'te la', 'Elle te la dit.', 'to you + it -> te la', { subject: 'elle', family: 'multi_clitic' });
  add('pfx_multi_clitic_044_ils', 'Relationship Drama', 'dire', 'They are telling it to you.', 'Ils ____ disent.', 'la vérité -> toi', 'te la', 'Ils te la disent.', 'to you + it -> te la', { subject: 'ils', family: 'multi_clitic' });
  add('pfx_multi_clitic_045_nous', 'Cinema & Series', 'montrer', 'We are showing it to them.', 'Nous ____ montrons.', 'la bande-annonce -> mes amis', 'la leur', 'Nous la leur montrons.', 'it + to them -> la leur', { subject: 'nous', family: 'multi_clitic' });
  add('pfx_multi_clitic_046_vous', 'Cinema & Series', 'montrer', 'You are showing it to them.', 'Vous ____ montrez.', 'la bande-annonce -> mes amis', 'la leur', 'Vous la leur montrez.', 'it + to them -> la leur', { subject: 'vous', family: 'multi_clitic' });
  add('pfx_multi_clitic_047_elle', 'Cinema & Series', 'montrer', 'She is showing it to them.', 'Elle ____ montre.', 'la bande-annonce -> mes amis', 'la leur', 'Elle la leur montre.', 'it + to them -> la leur', { subject: 'elle', family: 'multi_clitic' });
  add('pfx_multi_clitic_048_ils', 'Cinema & Series', 'montrer', 'They are showing it to them.', 'Ils ____ montrent.', 'la bande-annonce -> mes amis', 'la leur', 'Ils la leur montrent.', 'it + to them -> la leur', { subject: 'ils', family: 'multi_clitic' });
  add('pfx_multi_clitic_049_nous', 'Office & Admin', 'expliquer', 'We are explaining it to him.', 'Nous ____ expliquons.', 'le problème -> Luc', 'le lui', 'Nous le lui expliquons.', 'it + to him -> le lui', { subject: 'nous', family: 'multi_clitic' });
  add('pfx_multi_clitic_050_vous', 'Office & Admin', 'expliquer', 'You are explaining it to him.', 'Vous ____ expliquez.', 'le problème -> Luc', 'le lui', 'Vous le lui expliquez.', 'it + to him -> le lui', { subject: 'vous', family: 'multi_clitic' });
  add('pfx_multi_clitic_051_elle', 'Office & Admin', 'expliquer', 'She is explaining it to him.', 'Elle ____ explique.', 'le problème -> Luc', 'le lui', 'Elle le lui explique.', 'it + to him -> le lui', { subject: 'elle', family: 'multi_clitic' });
  add('pfx_multi_clitic_052_ils', 'Office & Admin', 'expliquer', 'They are explaining it to him.', 'Ils ____ expliquent.', 'le problème -> Luc', 'le lui', 'Ils le lui expliquent.', 'it + to him -> le lui', { subject: 'ils', family: 'multi_clitic' });
  add('pfx_multi_clitic_053_nous', 'History & Culture', 'raconter', 'We are telling it to them.', 'Nous ____ racontons.', 'l’histoire -> nos enfants', 'la leur', 'Nous la leur racontons.', 'it + to them -> la leur', { subject: 'nous', family: 'multi_clitic' });
  add('pfx_multi_clitic_054_vous', 'History & Culture', 'raconter', 'You are telling it to them.', 'Vous ____ racontez.', 'l’histoire -> nos enfants', 'la leur', 'Vous la leur racontez.', 'it + to them -> la leur', { subject: 'vous', family: 'multi_clitic' });
  add('pfx_multi_clitic_055_elle', 'History & Culture', 'raconter', 'She is telling it to them.', 'Elle ____ raconte.', 'l’histoire -> nos enfants', 'la leur', 'Elle la leur raconte.', 'it + to them -> la leur', { subject: 'elle', family: 'multi_clitic' });
  add('pfx_multi_clitic_056_ils', 'History & Culture', 'raconter', 'They are telling it to them.', 'Ils ____ racontent.', 'l’histoire -> nos enfants', 'la leur', 'Ils la leur racontent.', 'it + to them -> la leur', { subject: 'ils', family: 'multi_clitic' });

  window.pronounFillRows = rows;
})();
