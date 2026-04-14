import spacy
import pandas as pd
import os
from collections import defaultdict

# Load spaCy French model
nlp = spacy.load("fr_core_news_sm")

# Paths
FREQ_FILE = "fr_full.txt"               # Replace with your frequency file
LEMMA_FREQ_PATH = "lemma_frequencie2.csv"

# Load or compute lemma frequency DataFrame
if os.path.exists(LEMMA_FREQ_PATH):
    print("Loading cached lemma frequencies...")
    lemma_df = pd.read_csv(LEMMA_FREQ_PATH)
else:
    print("Building lemma frequencies...")
    freq_df = pd.read_csv(FREQ_FILE, sep=r"\s+", names=["word", "freq"], engine="python")
    freq_df = freq_df.dropna()
    freq_df['word'] = freq_df['word'].str.lower()

    lemma_freq = defaultdict(int)

    for word, freq in freq_df.itertuples(index=False):
        if not isinstance(word, str):
            continue
        word = word.strip()
        if not word:
            continue

        doc = nlp(word)
        if doc and doc[0].pos_ == 'VERB':
            lemma = doc[0].lemma_.lower()
            lemma_freq[lemma] += freq

    lemma_df = pd.DataFrame(list(lemma_freq.items()), columns=["infinitive", "total_freq"])
    lemma_df["rank"] = lemma_df["total_freq"].rank(ascending=False, method="first").astype(int)
    lemma_df.to_csv(LEMMA_FREQ_PATH, index=False)
    print(f"Saved lemma frequencies to {LEMMA_FREQ_PATH}")

# Your list of verbs (can be loaded from file if needed)
my_verbs = ['être', 'avoir', 'aller', 'faire', 'zigzaguer', 'prévoir', 'manger']  # etc.

# Categorize by rank
def categorize(rank):
    if rank is None:
        return "super rare"
    elif rank <= 100:
        return "super common"
    elif rank <= 1000:
        return "common"
    elif rank <= 3000:
        return "rare"
    else:
        return "super rare"

# Match ranks and assign category
lemma_lookup = lemma_df.set_index("infinitive").to_dict()["rank"]
results = []

for verb in my_verbs:
    r = lemma_lookup.get(verb.lower())
    results.append({
        "verb": verb,
        "rank": r,
        "category": categorize(r)
    })

# Output DataFrame
df_out = pd.DataFrame(results)
df_out.to_csv("verbs_categorized.csv", index=False)
print(df_out.head())
