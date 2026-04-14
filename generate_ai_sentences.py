import importlib
import combine_dataset_enhanced; importlib.reload(combine_dataset_enhanced);
(df_combined, df_fail), sentences_data, verbs_data, conjugations_data  = combine_dataset_enhanced.main(sentences=[], need_the_data=True);
df_has_sentence = df_combined.groupby('validated_verb  validated_tense validated_pronoun '.split()).size().unstack()\
    .apply(lambda s:s.fillna(0)>0).stack().rename('have_sentence').reset_index()
df_top_verbs = df_combined.groupby('validated_verb '.split()).size().rename('cnt').sort_values(ascending=False).astype(int).reset_index().query('cnt> 0')\
    .assign(rnk = lambda d:d['cnt'].rank(ascending=False)).query('rnk <= 120').reset_index(drop=True)

top_verbs = df_top_verbs['validated_verb']
top_verbs = list(top_verbs)
    

import generate_missing_sentences
df_dont_have_phrases_per_unique_key = df_combined.merge(df_top_verbs)\
    .groupby('validated_verb validated_pronoun validated_tense'.split()).size().unstack().apply(lambda s:s.fillna(0)).stack()\
    .rename('cnt_per_unique_key').astype(int).reset_index().query('cnt_per_unique_key == 0')

d = df_dont_have_phrases_per_unique_key.query("validated_tense!='subjonctif présent'")\
    .query("validated_tense!='conditionnel présent' ").reset_index(drop=True)
# df_fail.main_verb_lemma.unique()
todo_new_phrases = d.to_dict(orient='records')
new_phrases =  generate_missing_sentences.generate_sentences_batch(d)
import pandas as pd 
df_res_new_sentences = pd.DataFrame(new_phrases)

df_res_new_sentences.to_json('ai_gen_sentences.json')

