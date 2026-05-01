(function initPronounFillRows() {
  const rows = [];

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
  add('pf_en_006', 'Cinema & Series', 'parler', 'I am talking about it.', 'J\'____ parle.', 'ce film', 'en', 'J\'en parle.', 'parler de + thing -> en', { family: 'de_thing_to_en' });
  add('pf_en_007', 'Art & Design', 'avoir', 'I want it.', 'J\'____ ai envie.', 'cette robe', 'en', 'J\'en ai envie.', 'avoir envie de + thing -> en', { family: 'de_thing_to_en' });
  add('pf_en_008', 'Music', 'parler', 'I am talking about it.', 'J\'____ parle.', 'cette chanson', 'en', 'J\'en parle.', 'parler de + thing -> en', { family: 'de_thing_to_en' });

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
  add('pf_lui_008', 'Travel & Tourism', 'écrire', 'I am writing to them.', 'Je ____ écris.', 'mes amis', 'leur', 'Je leur écris.', 'écrire à + people -> leur', { family: 'indirect_person' });

  add('pf_multi_001', 'Super Everyday', 'montrer', 'I am showing them to you.', 'Je ____ montre.', 'les photos -> toi', 'te les', 'Je te les montre.', 'to you + them -> te les', { family: 'multi_clitic', answerSpanKind: 'pronoun_cluster' });
  add('pf_multi_002', 'Travel & Tourism', 'rendre', 'I am giving it back to you.', 'Je ____ rends.', 'le passeport -> vous', 'vous le', 'Je vous le rends.', 'to you + it -> vous le', { family: 'multi_clitic', answerSpanKind: 'pronoun_cluster' });
  add('pf_multi_003', 'Music', 'prêter', 'He is lending it to me.', 'Il ____ prête.', 'la guitare -> moi', 'me la', 'Il me la prête.', 'to me + it -> me la', { family: 'multi_clitic', answerSpanKind: 'pronoun_cluster' });
  add('pf_multi_004', 'Office & Admin', 'envoyer', 'She is sending them to us.', 'Elle ____ envoie.', 'les invitations -> nous', 'nous les', 'Elle nous les envoie.', 'to us + them -> nous les', { family: 'multi_clitic', answerSpanKind: 'pronoun_cluster' });
  add('pf_multi_005', 'Office & Admin', 'donner', 'I am giving it to her.', 'Je ____ donne.', 'le dossier -> Marie', 'le lui', 'Je le lui donne.', 'it + to her -> le lui', { family: 'multi_clitic', answerSpanKind: 'pronoun_cluster' });
  add('pf_multi_006', 'Travel & Tourism', 'envoyer', 'I am sending them to him.', 'Je ____ envoie.', 'les photos -> Paul', 'les lui', 'Je les lui envoie.', 'them + to him -> les lui', { family: 'multi_clitic', answerSpanKind: 'pronoun_cluster' });
  add('pf_multi_007', 'Bureaucracy & Delivery', 'apporter', 'I am bringing it to them.', 'Je ____ apporte.', 'la facture -> les clients', 'la leur', 'Je la leur apporte.', 'it + to them -> la leur', { family: 'multi_clitic', answerSpanKind: 'pronoun_cluster' });
  add('pf_multi_008', 'Crafts & Making', 'montrer', 'We are showing them to them.', 'Nous ____ montrons.', 'les plans -> nos voisins', 'les leur', 'Nous les leur montrons.', 'them + to them -> les leur', { family: 'multi_clitic', answerSpanKind: 'pronoun_cluster' });
  add('pf_multi_009', 'Relationship Drama', 'parler', 'I am talking to her about it.', 'Je ____ parle.', 'Marie -> ce problème', 'lui en', 'Je lui en parle.', 'to her + about it -> lui en', { family: 'multi_clitic', answerSpanKind: 'pronoun_cluster' });
  add('pf_multi_010', 'Office & Admin', 'parler', 'I am talking to them about it.', 'Je ____ parle.', 'mes collègues -> ce plan', 'leur en', 'Je leur en parle.', 'to them + about it -> leur en', { family: 'multi_clitic', answerSpanKind: 'pronoun_cluster' });
  add('pf_multi_011', 'Super Everyday', 'dire', 'I am telling it to you.', 'Je ____ dis.', 'la vérité -> toi', 'te la', 'Je te la dis.', 'to you + it -> te la', { family: 'multi_clitic', answerSpanKind: 'pronoun_cluster' });
  add('pf_multi_012', 'Cinema & Series', 'montrer', 'I am showing it to them.', 'Je ____ montre.', 'la bande-annonce -> mes amis', 'la leur', 'Je la leur montre.', 'it + to them -> la leur', { family: 'multi_clitic', answerSpanKind: 'pronoun_cluster' });

  window.pronounFillRows = rows;
})();
