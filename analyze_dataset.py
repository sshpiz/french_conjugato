#!/usr/bin/env python3
"""
Dataset Analysis and Improvement Script

This script analyzes your processed dataframe to identify issues and suggest improvements.
"""

import pandas as pd
import pickle
from collections import Counter
import json

def analyze_dataframe(pickle_path):
    """Analyze the dataframe to understand data quality issues."""
    print("="*60)
    print("DATASET ANALYSIS REPORT")
    print("="*60)
    
    with open(pickle_path, 'rb') as f:
        df = pickle.load(f)
    
    print(f"Total phrases: {len(df)}")
    print()
    
    # Analyze missing verb lemmas
    missing_verb_lemma = df['main_verb_lemma'].isna() | (df['main_verb_lemma'] == 'None') | (df['main_verb_lemma'] == '')
    print(f"Missing/invalid verb lemmas: {missing_verb_lemma.sum()}")
    
    if missing_verb_lemma.sum() > 0:
        print("\nSample rows with missing verb lemmas:")
        missing_rows = df[missing_verb_lemma].head(5)
        for idx, row in missing_rows.iterrows():
            print(f"  Row {idx}: '{row['fr'][:60]}...'")
            print(f"    main_verb: '{row.get('main_verb')}', lemma: '{row.get('main_verb_lemma')}'")
    
    # Analyze verb distribution
    valid_verbs = df[~missing_verb_lemma]['main_verb_lemma']
    verb_counts = Counter(valid_verbs)
    print(f"\nValid verb lemmas: {len(valid_verbs)}")
    print(f"Unique verbs: {len(verb_counts)}")
    print("\nTop 10 most frequent verbs:")
    for verb, count in verb_counts.most_common(10):
        print(f"  {verb}: {count}")
    
    # Analyze tenses
    tense_features = df['main_verb_feats'].dropna()
    print(f"\nTense features analysis ({len(tense_features)} valid):")
    tense_patterns = Counter()
    for feats in tense_features:
        if 'Tense=' in str(feats):
            tense = [f for f in str(feats).split('|') if f.startswith('Tense=')]
            if tense:
                tense_patterns[tense[0]] += 1
        else:
            tense_patterns['No_Tense'] += 1
    
    for pattern, count in tense_patterns.most_common():
        print(f"  {pattern}: {count}")
    
    # Analyze pronouns
    print(f"\nPronoun analysis:")
    explicit_pronouns = df['pronoun'].dropna()
    print(f"  Explicit pronouns: {len(explicit_pronouns)}")
    pronoun_counts = Counter(explicit_pronouns)
    for pronoun, count in pronoun_counts.most_common():
        print(f"    {pronoun}: {count}")
    
    # Analyze sources
    sources = df['source'].dropna()
    source_counts = Counter(sources)
    print(f"\nSource analysis:")
    for source, count in source_counts.most_common():
        print(f"  {source}: {count}")
    
    print("\n" + "="*60)
    print("RECOMMENDATIONS:")
    print("="*60)
    
    if missing_verb_lemma.sum() > 0:
        print(f"1. Fix {missing_verb_lemma.sum()} rows with missing verb lemmas")
        print("   - Re-run linguistic analysis on these sentences")
        print("   - Or manually identify the main verbs")
    
    print("2. Consider expanding your dataset with more diverse sources")
    print("3. Add more tenses for better coverage")
    print("4. Consider balancing verb frequencies")
    
    return df, verb_counts, tense_patterns

def create_verb_frequency_file(verb_counts):
    """Create a verb frequency file for future use."""
    frequency_data = []
    
    for verb, count in verb_counts.items():
        if count >= 5:
            freq = "common"
        elif count >= 2:
            freq = "intermediate"
        else:
            freq = "rare"
        
        frequency_data.append({
            "verb": verb,
            "count": count,
            "frequency": freq
        })
    
    with open("verb_frequencies_from_dataset.json", "w", encoding="utf-8") as f:
        json.dump(frequency_data, f, ensure_ascii=False, indent=2)
    
    print(f"\nCreated verb_frequencies_from_dataset.json with {len(frequency_data)} verbs")

if __name__ == "__main__":
    df, verb_counts, tense_patterns = analyze_dataframe("test100_processed_dataframe_corrected.pickle")
    create_verb_frequency_file(verb_counts)
