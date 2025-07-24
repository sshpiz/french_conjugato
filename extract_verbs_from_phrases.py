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

def parse_verb_structure(sentence, stanza_pipeline):
    doc = stanza_pipeline(sentence)
    if not doc.sentences:
        return {'status': 'no_sentence'}

    sent = doc.sentences[0]
    tokens = sent.words

    result = {
        'main_verb': None,
        'main_verb_lemma': None,
        'main_verb_id': None,
        'main_verb_start': None,
        'main_verb_end': None,
        'auxiliary_verb': None,
        'auxiliary_verb_lemma': None,
        'auxiliary_verb_start': None,
        'auxiliary_verb_end': None,
        'auxiliary_verb_feats': None,
        'auxiliary_dep': None,
        'pronoun': None,
        'pronoun_dep': None,
        'pronoun_start': None,
        'pronoun_end': None,
        'has_explicit_noun_subject': False,
        'full_structure': [w.to_dict() for w in tokens],
        'status': 'ok'
    }

    # 1. Identify main verb (root)
    for w in tokens:
        if w.head == 0 and w.upos == 'VERB':
            if w.feats:
                feat_dict = dict(kv.split('=') for kv in w.feats.split('|') if '=' in kv)
                tense = feat_dict.get("Tense", None)
                verb_form = feat_dict.get("VerbForm", None)
            else:
                tense = None
                verb_form = None

            result.update({
                'main_verb': w.text,
                'main_verb_lemma': w.lemma,
                'main_verb_id': w.id,
                'main_verb_start': w.start_char,
                'main_verb_end': w.end_char,
                'main_verb_tense': tense,
                'main_verb_form': verb_form,
                'main_verb_feats': w.feats
            })
            break

    if result['main_verb_id'] is None:
        result['status'] = 'no_main_verb'
        return result

    main_id = result['main_verb_id']

    # 2. Identify auxiliary verb (head = main verb)
    for w in tokens:
        if w.upos == 'AUX' and w.head == main_id:
            result.update({
                'auxiliary_verb': w.text,
                'auxiliary_verb_lemma': w.lemma,
                'auxiliary_verb_start': w.start_char,
                'auxiliary_verb_end': w.end_char,
                'auxiliary_dep': w.deprel,
                'auxiliary_verb_feats': w.feats if w.feats else None
            })
            break

    # 3. Check if there's an explicit noun subject
    has_noun_subject = any(
        w.head == main_id and w.deprel == 'nsubj' and w.upos in ['NOUN', 'PROPN']
        for w in tokens
    )
    result['has_explicit_noun_subject'] = has_noun_subject

    # 4. Identify personal pronoun only if no noun subject
    if not has_noun_subject:
        candidate_pronouns = [
            w for w in tokens
            if w.upos == 'PRON' and w.feats and (
                                    'PronType=Prs' in w.feats
                                    or ('PronType=Ind' in w.feats and w.text.lower().replace('-','').strip() == 'on')
                                )
      and w.deprel in ['nsubj', 'expl:subj']
        ]

        preferred_deps = ['nsubj', 'expl:subj']
        candidate_pronouns.sort(
            key=lambda w: (preferred_deps.index(w.deprel) if w.deprel in preferred_deps else 99, abs(w.id - main_id))
        )
        # print(candidate_pronouns)
        if candidate_pronouns:
            best = candidate_pronouns[0]
            result.update({
                'pronoun': best.text,
                'pronoun_dep': best.deprel,
                'pronoun_start': best.start_char,
                'pronoun_end': best.end_char
            })

    return result


def analyze_verb_pronoun_aux(row, stanza_pipeline):
    
    sentence = row['fr']
    return parse_verb_structure(    sentence, stanza_pipeline)
    if 0:
        morph_str = row.get('morph', '')
        claimed_inf = row.get('verb_infinitive', '')

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
        compound_candidates = []
        single_verb = None

        for sent in doc.sentences:
            words = sent.words

            # Build candidates
            for i in range(len(words) - 1):
                w1, w2 = words[i], words[i + 1]
                if (w1.upos == 'AUX' and w2.upos == 'VERB' and
                    w2.feats and 'VerbForm=Part' in w2.feats):
                    compound_candidates.append((w1, w2))

            # Fallback: find first finite verb
            if not compound_candidates:
                for w in words:
                    if w.upos in ['VERB', 'AUX'] and w.feats:
                        feats = dict(kv.split('=') for kv in w.feats.split('|') if '=' in kv)
                        if feats.get('VerbForm') == 'Fin':
                            single_verb = w
                            break

            # Use compound if found
            if compound_candidates:
                aux, main = compound_candidates[0]
                result['corrected_infinitive'] = main.lemma
                result['conjugated_verb'] = main.text
                result['conjugated_verb_start'] = main.start_char
                result['conjugated_verb_end'] = main.end_char
                result['auxiliary_verb'] = aux.text
                result['auxiliary_verb_start'] = aux.start_char
                result['auxiliary_verb_end'] = aux.end_char

                # Search for real pronoun before aux
                for w in reversed(words):
                    if w.upos == 'PRON' and w.end_char <= aux.start_char:
                        if w.text.lower() not in ["qu'", "que", "quoi"]:
                            result['pronoun'] = w.text
                            result['pronoun_start'] = w.start_char
                            result['pronoun_end'] = w.end_char
                            break

            elif single_verb:
                result['corrected_infinitive'] = single_verb.lemma
                result['conjugated_verb'] = single_verb.text
                result['conjugated_verb_start'] = single_verb.start_char
                result['conjugated_verb_end'] = single_verb.end_char

                for w in reversed(words):
                    if w.upos == 'PRON' and w.end_char <= single_verb.start_char:
                        if w.text.lower() not in ["qu'", "que", "quoi"]:
                            result['pronoun'] = w.text
                            result['pronoun_start'] = w.start_char
                            result['pronoun_end'] = w.end_char
                            break

        result['status'] = 'ok' if result['conjugated_verb'] else 'no_finite_verb_found'
        return result




def make_gap_fill_sentence(sentence, analysis, blank_pronoun=True, blank_aux=True, blank_verb=True):
    """
    Replace pronoun, aux, and verb in sentence with placeholder tokens.
    """

    replacements = []
    
    if blank_pronoun and analysis.get('pronoun_start') is not None:
        replacements.append((analysis['pronoun_start'], analysis['pronoun_end'], '[PRONOUN]'))

    if blank_aux and analysis.get('auxiliary_verb_start') is not None:
        replacements.append((analysis['auxiliary_verb_start'], analysis['auxiliary_verb_end'], '[AUX]'))

    if blank_verb and analysis.get('main_verb_start') is not None:
        replacements.append((analysis['main_verb_start'], analysis['main_verb_end'], '[VERB]'))

    # Sort in reverse order so we don’t mess up offsets
    replacements.sort(reverse=True)

    s = sentence
    for start, end, token in replacements:
        s = s[:start] + token + s[end:]

    return s




import stanza
import pandas as pd
from typing import Dict

# Load the French model once
stanza_pipeline = stanza.Pipeline(lang='fr', processors='tokenize,mwt,pos,lemma,depparse')

def analyze_row(row: pd.Series, stanza_pipeline) -> Dict:
    return analyze_verb_pronoun_aux(row, stanza_pipeline)
    sentence = row['fr']
    result = {
        'infinitive': None,
        'conjugated_verb': None,
        'conjugated_verb_start': None,
        'conjugated_verb_end': None,
        'auxiliary_verb': None,
        'auxiliary_verb_start': None,
        'auxiliary_verb_end': None,
        'pronoun': None,
        'pronoun_start': None,
        'pronoun_end': None,
        'status': 'not_processed',
    }

    if not isinstance(sentence, str) or not sentence.strip():
        result['status'] = 'empty_sentence'
        return result

    doc = stanza_pipeline(sentence)
    conjugated_verb = None

    for sent in doc.sentences:
        for w in sent.words:
            if w.upos in ['VERB', 'AUX'] and w.feats:
                feats = dict(kv.split('=') for kv in w.feats.split('|') if '=' in kv)
                if feats.get('VerbForm') == 'Fin':
                    conjugated_verb = w
                    break

        if conjugated_verb:
            result['infinitive'] = conjugated_verb.lemma
            result['conjugated_verb'] = conjugated_verb.text
            result['conjugated_verb_start'] = conjugated_verb.start_char
            result['conjugated_verb_end'] = conjugated_verb.end_char

            for w in reversed(sent.words):
                if w.upos == 'PRON' and w.end_char <= conjugated_verb.start_char:
                    result['pronoun'] = w.text
                    result['pronoun_start'] = w.start_char
                    result['pronoun_end'] = w.end_char
                    break

            for w in sent.words:
                if w.upos == 'AUX' and w.id != conjugated_verb.id:
                    result['auxiliary_verb'] = w.text
                    result['auxiliary_verb_start'] = w.start_char
                    result['auxiliary_verb_end'] = w.end_char
                    break

            result['status'] = 'ok'
            return result

    result['status'] = 'no_finite_verb_found'
    return result


def process_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    results = []
    skipped = 0
    for _, row in tqdm(df.iterrows(), total=len(df), desc="Processing rows"):
        analysis = analyze_row(row, stanza_pipeline)
        gap_sentence = make_gap_fill_sentence(row['fr'], analysis)
        if '[PRONOUN]' in gap_sentence and '[VERB]' in gap_sentence:
            results.append({**row.to_dict(), **analysis, 'gap_sentence': gap_sentence})
        else:
            skipped += 1
    return pd.DataFrame(results)


from pathlib import Path

if __name__ == "__main__":
    print('OPUS BOOKS ')
    import explore_opus_books as eob
    df = eob.combined_df
    CHUNK_SIZE = 10000
    # max_chunks = len(df) // CHUNK_SIZE + (1 if len(df) % CHUNK_SIZE > 0 else 0)
    for chunk_num, indexes in enumerate(range(0, len(df), CHUNK_SIZE)):
        print(f"Processing chunk {chunk_num + 1} starting at index {indexes}")
        outpath = f"verb_analysis_results_chunks_size{CHUNK_SIZE}_chunknum_{chunk_num:03d}.pkl"
        chunk = df.iloc[indexes:indexes + CHUNK_SIZE]
        if Path(outpath).exists():
            print(f"Skipping chunk {chunk_num + 1}, already processed.")
            continue
        df_res = process_dataframe(chunk)
        df_res.to_pickle(outpath)

    print('AI GENERATED missingSENTENCES')
    df = pd.read_pickle("ai_generated_example_missing_sentences.pkl")
    outpath = f"verb_analysis_results_chunks_size{CHUNK_SIZE}_chunknum_{chunk_num+1:03d}.ai_generated.pkl"
    if Path(outpath).exists():
        print(f"Skipping missing ai sentencns {chunk_num + 1}, already processed.")
    else:
        df_res = process_dataframe(df)
        df_res.to_pickle(outpath)
    chunk_num+=1

    print('ai generated very common')
    df = pd.read_json('ai_gen_common_phrases.jsonl', lines=True)
    df['source'] = 'ai_very_common'
    outpath = f"verb_analysis_results_chunks_size{CHUNK_SIZE}_chunknum_{chunk_num+1:03d}.ai_generated.pkl"
    if Path(outpath).exists():
        print(f"Skipping missing ai sentencns {chunk_num + 1}, already processed.")
    else:
        df_res = process_dataframe(df)
        df_res.to_pickle(outpath)
    chunk_num+=1

    print('ai generated common')
    df2 = pd.read_json('ai_gen_common_phrases2.jsonl', lines=True)
    df2['source'] = 'ai_common'
    outpath = f"verb_analysis_results_chunks_size{CHUNK_SIZE}_chunknum_{chunk_num+1:03d}.ai_generated.pkl"
    if Path(outpath).exists():
        print(f"Skipping missing ai sentencns {chunk_num + 1}, already processed.")
    else:
        df_res = process_dataframe(df2)
        df_res.to_pickle(outpath)
    chunk_num+=1
