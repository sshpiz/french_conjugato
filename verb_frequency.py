from verbecc.conjugator import Conjugator
import pandas as pd
import tqdm
import spacy
import pandas as pd
import os
from collections import defaultdict

# all_conjugations = []
# for infinitive in ALL_VERBS:
    # Try to get translation from verbecc (if available), else use ""


def extract_values(dct, keys_filter=None):
    for k, v in dct.items():
        if keys_filter and not keys_filter(k):
            continue

        if isinstance(v, dict):
            yield from extract_values(v)
        else:
            try:
                yield from (x.split()[-1] for x in  v)
            except TypeError:
                if isinstance(v, str):
                    if v.split()[-1] == "j'aimais":
                        print(v)
                    yield v.split()[-1]
                else:
                    yield v


def filter_verbs_keep_times_for_verbs(key):
    return key in 'présent passé-simple futur-simple imparfait'

 
def all_conjugated(verb):
    c = Conjugator('fr')
    indicatif = c.conjugate(verb)['moods']['indicatif']
    all_words = set(list(extract_values(indicatif, keys_filter=filter_verbs_keep_times_for_verbs)))
    return all_words

def get_verb_frequencies():
    c = Conjugator('fr')
    infinitives = sorted(set(c.get_infinitives()))

    result_dict = {}


    # Load spaCy French model
    nlp = spacy.load("fr_core_news_sm")

    # Paths
    FREQ_FILE = "fr_full.txt"               # Replace with your frequency file
    # LEMMA_FREQ_PATH = "lemma_frequencie2.csv"

    freq_df = pd.read_csv(FREQ_FILE, sep=r"\s+", names=["word", "freq"], engine="python")
    freq_df = freq_df.dropna()
    freq_df['word'] = freq_df['word'].str.lower()
    freq_dict = freq_df.set_index('word')['freq'].to_dict()
    print(freq_df.head()    )
    print(len(freq_df))
    word_to_verbs = defaultdict(list)
    verbs_to_counts = defaultdict(int)
    zero_count_verbs = set()

    dataset = []
    for v in tqdm.tqdm(infinitives[:], desc="Processing verbs"):
        try:
            all_words = all_conjugated(v)
            # print(all_words)
            for word in all_words:
                item = {'verb': v, 'word': word, 'count':freq_dict.get(word , 0)}
                dataset.append(item)
                # word_to_verbs[word].append(v)
                # counts = freq_dict.get(word , 0)
                # verbs_to_counts[v]+= counts
                # if counts==0:
                #     zero_count_verbs.add(v)
                    # print(f"Zero count for {word} in {v}")
            # print(f"{v}: {len(all_words)} {verbs_to_counts[v]}")
        except Exception as e:
            print(f"Error processing {v}: {e}")
            continue





    df = pd.DataFrame(dataset)
    return df 
    # df2 = df.sort_values(by='count', ascending=False)
    # Eprint(df2.head(20))

fname = "verb_counts4.csv"
# df = pd.read_csv(fname, index_col=0)
if not os.path.exists(fname):
    print("Generating verb frequencies...")
    df = get_verb_frequencies()
    df.to_csv(fname, index=True)
else:
    print("Loading verb frequencies from cache...")
    df = pd.read_csv(fname, index_col=0)

# print(df.head(10)   )

df0 = df.sort_values(by='count', ascending=False)
df2 = df0.merge(df0.groupby('word')['verb'].nunique().rename('num_diff_verbs_per_word').reset_index())
df2 = df2[df2['num_diff_verbs_per_word'] == 1].query('count>0').reset_index(drop=True)
df_ratios =  df2.groupby('verb').apply(lambda dd:dd['count'].max()/dd['count'].sum())\
        .rename('ratio_max_to_tot').reset_index().sort_values(by='ratio_max_to_tot').dropna()
df_ratios_top_3 =  df2.groupby('verb').apply(lambda dd:
                    dd.sort_values(by='count').iloc[-3:]['count'].sum()/dd['count'].sum()
                    )\
        .rename('ratio_top3').reset_index().sort_values(by='ratio_top3').dropna()
df_how_many_have_a_share =  df2.groupby('verb').apply(lambda dd:
                    (dd['count'] > (dd['count'].sum()/len(dd) - 0.0001) ).sum() # meaning how many uses actually participate more than 1/n
                    )\
        .rename('num_forms_used').reset_index().sort_values(by='num_forms_used').dropna()

df3 = df2.groupby('verb')['count'].sum().reset_index().sort_values(by='count',ascending=False)
df3 = df3.merge(df_ratios).merge(df_ratios_top_3).merge(df_how_many_have_a_share)
        
print(df3.head(20))
df = df3
df['fraction'] = df['count'] / df['count'].sum()
df['rank'] = df['count'].rank(ascending=False, method='first').astype(int)
df['cum_fraction'] = df['fraction'].cumsum()
cutoff_fracs = [.5, .6,.9, .95, .99, 1.0    ]
categories = ['basic','super common', 'common', 'rare', 'super rare', 'ultra rare']
df['category'] = pd.cut(df['cum_fraction'], bins=[0] + cutoff_fracs, labels=categories, include_lowest=True)


change_to_rare = ["bruir", "celer", "fauter", "lettrer", "ligner", "machiner", "musiquer", "pierrer", "policer", "politiquer", "rober", "sérier", "typer", "voiturer", "arriérer", "départir", "fenêtrer", "dinguer" ]
change_to_rare += ["affairer", "baller", "carter", "jamber", "minuter", "priser", "ruer", "victimer", "zoner", "glacer", "imager", "miser", "costumer", "épouser", "étoiler", "saloper", "droguer", "gosser", "roser", "courser", "tracer", "cibler", "bander", "pister", "coupler", "fonctionner", "baser"]

df = df.merge(df_ratios)
for c, sub_df in df.groupby('category'):
    print(f"{c}: {len(sub_df)} verbs, total count: {sub_df['count'].sum()} total frequency {sub_df['fraction'].sum()}")
    print(sub_df.head(10)['verb'].tolist())

df.to_csv('verb_frequencies_res.csv', index=False)

df[df['category'].isin(['basic','super common', 'common', 'rare',])]\
        .to_csv('verb_frequencies_up_to_rare.csv', index=False)





    
# # df['is_regular'] = df.index.map(check_if_regular)
# # c = Conjugator('fr')

# # df['template'] = df.index.map(lambda v: c.conjugate(v)['verb']['template'])
# # df['template_end'] = df.template.str.split(':').str[1]
# # df['verb'] = df.index


# # df['verb_in_template'] = df.apply(lambda row: row['verb'] in row['template'], axis=1)

# # for g, sub_df in df.groupby('template_end'):
# #     print(f"Template: {g}, Count: {len(sub_df)}")
# #     print(sub_df.head(10))
