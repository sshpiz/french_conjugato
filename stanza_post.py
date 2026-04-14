import spacy
from tqdm import tqdm
import json
import stanza
import pandas as pd
from verbecc import Conjugator

def extract_stanza_verb_info(french_sentence, nlp ):
    doc = nlp(french_sentence)
    
    for sentence in doc.sentences:
        for word in sentence.words:
            if word.upos == "VERB" and word.feats:
                feats = word.feats  # Already a string like "Mood=Ind|Number=Sing|Person=3|Tense=Pres|VerbForm=Fin"
                return {
                    "verb_lemma": word.lemma,
                    "morph": feats,
                    "verb_form": word.text,
                }
    return None

def correct_verb_metadata(row, stanza_pipeline):
    sentence = row['phrase_french']
    result = {
        'corrected_infinitive': None,
        'corrected_morph': None,
        'original_infinitive': row['verb_infinitive'],
        'original_morph': row['morph'],
        'status': 'not_found',
    }

    if not isinstance(sentence, str) or not sentence.strip():
        result['status'] = 'empty_sentence'
        return result

    doc = stanza_pipeline(sentence)

    for sent in doc.sentences:
        for word in sent.words:
            if word.upos in ['VERB', 'AUX'] and word.lemma:
                # This is likely the main verb
                result['corrected_infinitive'] = word.lemma
                result['corrected_morph'] = word.feats
                result['status'] = 'ok'
                return result

    return result



def analyze_verb_pronoun_aux(row, stanza_pipeline):
    sentence = row['phrase_french']
    morph_str = row.get('morph', '')
    claimed_inf = row['verb_infinitive']

    result = {
        'corrected_infinitive': None,
        'conjugated_verb': None,
        'conjugated_verb_start': None,
        'conjugated_verb_end': None,
        'auxiliary_verb': None,
        'auxiliary_verb_start': None,
        'auxiliary_verb_end': None,
        'pronoun': None,
        'pronoun_start': None,
        'pronoun_end': None,
        'status': ''
    }

    if not isinstance(sentence, str) or not sentence.strip():
        result['status'] = 'empty_sentence'
        return result

    doc = stanza_pipeline(sentence)
    morph_parts = dict(kv.split('=') for kv in morph_str.split('|') if '=' in kv)
    target_tense = morph_parts.get('Tense')
    target_person = morph_parts.get('Person')
    target_mood = morph_parts.get('Mood')

    conjugated_verb = None
    aux_verb = None
    pronoun = None

    for sent in doc.sentences:
        words = sent.words

        # 1. Identify conjugated verb (prefer matching morph features)
        for w in words:
            if w.upos in ['VERB', 'AUX'] and w.feats:
                feats = dict(kv.split('=') for kv in w.feats.split('|') if '=' in kv)
                if feats.get('VerbForm') == 'Fin':
                    if (feats.get('Tense') == target_tense and
                        feats.get('Person') == target_person and
                        feats.get('Mood') == target_mood):
                        conjugated_verb = w
                        break

        # fallback to first finite verb
        if not conjugated_verb:
            for w in words:
                if w.upos in ['VERB', 'AUX'] and w.feats:
                    feats = dict(kv.split('=') for kv in w.feats.split('|') if '=' in kv)
                    if feats.get('VerbForm') == 'Fin':
                        conjugated_verb = w
                        break

        # Fill conjugated verb info
        if conjugated_verb:
            result['corrected_infinitive'] = conjugated_verb.lemma
            result['conjugated_verb'] = conjugated_verb.text
            result['conjugated_verb_start'] = conjugated_verb.start_char
            result['conjugated_verb_end'] = conjugated_verb.end_char

            # 2. Find pronoun left of it
            for w in reversed(words):
                if w.upos == 'PRON' and w.end_char <= conjugated_verb.start_char:
                    pronoun = w
                    break

            if pronoun:
                result['pronoun'] = pronoun.text
                result['pronoun_start'] = pronoun.start_char
                result['pronoun_end'] = pronoun.end_char

        # 3. Only look for AUX in compound tenses
        compound_tenses = ['Pqp', 'Past', 'FutAnt']
        if target_tense in compound_tenses:
            for w in words:
                if w.upos == 'AUX' and w.id != conjugated_verb.id:
                    aux_verb = w
                    break

            if aux_verb:
                result['auxiliary_verb'] = aux_verb.text
                result['auxiliary_verb_start'] = aux_verb.start_char
                result['auxiliary_verb_end'] = aux_verb.end_char

    result['status'] = 'ok' if result['conjugated_verb'] else 'no_finite_verb_found'
    return result





def make_gap_fill_sentence(sentence, analysis, blank_pronoun=True, blank_aux=True, blank_verb=True):
    """
    Replace pronoun, aux, and verb in sentence with placeholder tokens.
    """

    replacements = []
    
    if blank_pronoun and analysis.get('pronoun_start') is not None:
        replacements.append((analysis['pronoun_start'], analysis['pronoun_end'], '[PRONOUN]'))

    if blank_aux and analysis.get('aux_start') is not None:
        replacements.append((analysis['aux_start'], analysis['aux_end'], '[AUX]'))

    if blank_verb and analysis.get('conjugated_verb_start') is not None:
        replacements.append((analysis['conjugated_verb_start'], analysis['conjugated_verb_end'], '[VERB]'))

    # Sort in reverse order so we don’t mess up offsets
    replacements.sort(reverse=True)

    s = sentence
    for start, end, token in replacements:
        s = s[:start] + token + s[end:]

    return s



# def validate_verb_with_stanza(row, valid_infinitives, stanza_pipeline):
#     sentence = row['phrase_french']
#     claimed_inf = row['verb_infinitive']
#     result = {
#         'valid_infinitive': True,
#         'infinitive_in_sentence': False,
#         'valid_infinitive_in_sentence': False,
#         'lemma_matches_claimed': False,
#         'stanza_lemmas': [],
#         'status': ''
#     }

#     # Skip if no sentence
#     if not isinstance(sentence, str) or not sentence.strip():
#         result['status'] = 'empty_sentence'
#         return result

#     doc = stanza_pipeline(sentence)
#     lemmas = []
#     for sent in doc.sentences:
#         for w in sent.words:
#             if w.upos in ['VERB', 'AUX']:
#                 lemmas.append(w.lemma)

#     result['stanza_lemmas'] = lemmas
#     result['infinitive_in_sentence'] = claimed_inf in lemmas
#     result['valid_infinitive_in_sentence'] = any(l in valid_infinitives for l in lemmas)
#     result['lemma_matches_claimed'] = claimed_inf in valid_infinitives and result['infinitive_in_sentence']
#     result['valid_infinitive'] = claimed_inf in valid_infinitives

#     # Final classification
#     if not result['valid_infinitive']:
#         result['status'] = 'invalid_claimed_infinitive'
#     elif not result['infinitive_in_sentence']:
#         result['status'] = 'infinitive_not_in_sentence'
#     elif not result['valid_infinitive_in_sentence']:
#         result['status'] = 'no_valid_verb_in_sentence'
#     else:
#         result['status'] = 'ok'

#     return result


FILENAME = "verb_corpus.jsonl"
df = pd.read_json(FILENAME, lines=True, nrows=100)
print(f"Loaded {len(df)} rows from {FILENAME}")
infinitive_in_phrase = df.apply(lambda r:r['verb_infinitive'] in r['phrase_french'].lower(),axis=1)
c = Conjugator('fr')
valid_infinitives = set(c.get_infinitives())
infinitive_normal = df['verb_infinitive'].isin(valid_infinitives)
normal_looking = infinitive_normal & (~infinitive_in_phrase)
sus = ~normal_looking
df_sus = df[sus].copy().reset_index(drop=True)
stanza_pipeline = stanza.Pipeline(lang="fr", processors="tokenize,mwt,pos,lemma", tokenize_no_ssplit=True)
df_non_sus = df[normal_looking].copy().reset_index(drop=True)
df_sus = df_sus.sample(n=min(1000, len(df_sus)), random_state=42).reset_index(drop=True)
# del df
# results = []
# print('Starting validation of verbs with Stanza...')
# df = df_sus
# df[['corrected_infinitive', 'corrected_morph', 'status']] = df.apply(
#     lambda row: pd.Series(correct_verb_metadata(row, stanza_pipeline)),
#     axis=1
# )

# for i, row in analyze_verb_and_pronoun
analysis_results = []
for i, row in tqdm(df.iterrows(), total=len(df), desc="Analyzing verbs and pronouns"):
    analysis = analyze_verb_pronoun_aux(row, stanza_pipeline)
    sentence_gaps = make_gap_fill_sentence(row['phrase_french'], analysis)
    analysis['sentence_with_gaps'] = sentence_gaps
    analysis_results.append(analysis)
    


df_analysis = pd.DataFrame(analysis_results)
df_with_analysis = pd.concat([df.reset_index(drop=True), df_analysis], axis=1)
