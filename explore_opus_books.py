from datasets import load_dataset
ds = load_dataset("opus_books", "en-fr")  # or "europarl_bilingual", "news_commentary"
data = ds['train']
# Convert to a pandas DataFrame
import pandas as pd

df_opus_books = pd.DataFrame({
    'fr': [x['translation']['fr'] for x in data],
    'en': [x['translation']['en'] for x in data]
})

# Optional: drop rows with missing data
df_opus_books.dropna(subset=['fr', 'en'], inplace=True)

 

# Load Tatoeba dataset (French-English)
tatoeba = load_dataset("tatoeba", lang1="en", lang2="fr", split="train")
tatoeba_df = pd.DataFrame({
    'fr': [item['translation']['fr'] for item in tatoeba if 'fr' in item['translation'] and 'en' in item['translation']],
    'en': [item['translation']['en'] for item in tatoeba if 'fr' in item['translation'] and 'en' in item['translation']],
    'source': 'tatoeba'
})

# Load News Commentary dataset (French-English)
news_commentary = load_dataset("news_commentary", "en-fr", split="train")
news_df = pd.DataFrame({
    'fr': [item['translation']['fr'] for item in news_commentary if 'fr' in item['translation'] and 'en' in item['translation']],
    'en': [item['translation']['en'] for item in news_commentary if 'fr' in item['translation'] and 'en' in item['translation']],
    'source': 'news_commentary'
})

# Combine both datasets

combined_df = pd.concat([tatoeba_df, news_df, df_opus_books.assign(source = 'opus_books') ], ignore_index=True)
# print(combined_df.sample(10))
