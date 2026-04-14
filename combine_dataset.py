#!/usr/bin/env python3
"""
Script to combine phrases dataframe with verbecc conjugations and generate JavaScript files
for the franconjugue app.

This script:
1. Loads the phrases dataframe from pickle
2. Uses verbecc to generate complete conjugation data
3. Maps linguistic features to tense/mood categories
4. Outputs verbs.full.js and sentences.js files
"""

import pandas as pd
import pickle
import json
from pathlib import Path
from verbecc.conjugator import Conjugator
from verbecc.verb import get_all_infinitives
import math

# Initialize conjugator
conjugator = Conjugator(lang="fr")

# Mapping from linguistic features to our app's tense system
TENSE_MAPPING = {
    # Present tenses
    'Mood=Ind|Tense=Pres': 'présent',
    'Mood=Ind|Tense=Pres|VerbForm=Fin': 'présent',
    
    # Past tenses  
    'Mood=Ind|Tense=Imp': 'imparfait',
    'Mood=Ind|Tense=Imp|VerbForm=Fin': 'imparfait',
    'Tense=Past': 'passé composé',
    
    # Future
    'Mood=Ind|Tense=Fut': 'futur simple',
    'Mood=Ind|Tense=Fut|VerbForm=Fin': 'futur simple',
    
    # Conditional
    'Mood=Cnd': 'conditionnel présent',
    'Mood=Cnd|VerbForm=Fin': 'conditionnel présent',
    
    # Subjunctive
    'Mood=Sub': 'subjonctif présent',
    'Mood=Sub|VerbForm=Fin': 'subjonctif présent',
    'Mood=Sub|Tense=Pres': 'subjonctif présent',
    
    # Past participle / compound tenses
    'VerbForm=Part|Tense=Past': 'passé composé',
}

# Pronoun mapping from linguistic analysis to display format
PRONOUN_MAPPING = {
    'je': 'je',
    'tu': 'tu', 
    'il': 'il/elle',
    'elle': 'il/elle',
    'on': 'il/elle/on',
    'nous': 'nous',
    'vous': 'vous',
    'ils': 'ils/elles',
    'elles': 'ils/elles',
}

def extract_person_from_feats(feats_str):
    """Extract person (1,2,3) from morphological features string."""
    if not feats_str or pd.isna(feats_str):
        return None
    
    features = feats_str.split('|')
    for feat in features:
        if feat.startswith('Person='):
            return feat.split('=')[1]
    return None

def extract_number_from_feats(feats_str):
    """Extract number (Sing,Plur) from morphological features string."""
    if not feats_str or pd.isna(feats_str):
        return None
    
    features = feats_str.split('|')
    for feat in features:
        if feat.startswith('Number='):
            return feat.split('=')[1]
    return None

def determine_pronoun_from_structure(row):
    """
    Determine the appropriate pronoun from the sentence structure.
    """
    # First check if there's an explicit pronoun marked
    if row.get('pronoun') and not pd.isna(row['pronoun']):
        pronoun = row['pronoun'].lower()
        return PRONOUN_MAPPING.get(pronoun, pronoun)
    
    # Look for pronoun in the full_structure
    if row.get('full_structure'):
        for token in row['full_structure']:
            if token.get('upos') == 'PRON' and token.get('deprel') == 'nsubj':
                pronoun = token['text'].lower()
                return PRONOUN_MAPPING.get(pronoun, pronoun)
    
    # Extract from morphological features if available
    feats = row.get('main_verb_feats')
    if feats:
        person = extract_person_from_feats(feats)
        number = extract_number_from_feats(feats)
        
        if person and number:
            if person == '1' and number == 'Sing':
                return 'je'
            elif person == '2' and number == 'Sing':
                return 'tu'
            elif person == '3' and number == 'Sing':
                return 'il/elle'
            elif person == '1' and number == 'Plur':
                return 'nous'
            elif person == '2' and number == 'Plur':
                return 'vous'
            elif person == '3' and number == 'Plur':
                return 'ils/elles'
    
    return 'il/elle'  # default

def map_tense_from_feats(feats_str):
    """Map morphological features to our tense system."""
    if not feats_str or pd.isna(feats_str):
        return 'présent'  # default
    
    # Direct mapping
    if feats_str in TENSE_MAPPING:
        return TENSE_MAPPING[feats_str]
    
    # Partial matching for more complex feature strings
    if 'Tense=Pres' in feats_str and 'Mood=Ind' in feats_str:
        return 'présent'
    elif 'Tense=Imp' in feats_str:
        return 'imparfait'
    elif 'Tense=Fut' in feats_str:
        return 'futur simple'
    elif 'Mood=Cnd' in feats_str:
        return 'conditionnel présent'
    elif 'Mood=Sub' in feats_str:
        return 'subjonctif présent'
    elif 'Tense=Past' in feats_str or 'VerbForm=Part' in feats_str:
        return 'passé composé'
    
    return 'présent'  # default fallback

def load_phrases_dataframe(pickle_path):
    """Load the phrases dataframe from pickle file."""
    print(f"Loading phrases from {pickle_path}...")
    with open(pickle_path, 'rb') as f:
        df = pickle.load(f)
    print(f"Loaded {len(df)} phrases")
    return df

def generate_verbs_data():
    """Generate comprehensive verb data using verbecc."""
    print("Generating verb conjugation data...")
    
    # Get all verbs from verbecc
    all_verbs = sorted(set(get_all_infinitives()))
    print(f"Found {len(all_verbs)} verbs in verbecc")
    
    # Define frequency categories (you can customize this)
    common_verbs = {
        "être", "avoir", "aller", "faire", "venir", "pouvoir", "vouloir", 
        "savoir", "devoir", "dire", "voir", "prendre", "mettre", "croire",
        "parler", "passer", "trouver", "donner", "comprendre", "partir",
        "demander", "tenir", "aimer", "penser", "rester", "arriver",
        "porter", "sortir", "vivre", "finir", "commencer", "entrer",
        "regarder", "attendre", "tomber", "rendre", "sembler", "paraître"
    }
    
    verbs_data = []
    for verb in all_verbs:
        frequency = "common" if verb in common_verbs else "other"
        
        # Try to get translation (basic attempt)
        translation = ""
        try:
            # You might want to add a translation service here
            translation = verb  # placeholder
        except:
            translation = verb
        
        verbs_data.append({
            "infinitive": verb,
            "translation": translation,
            "frequency": frequency
        })
    
    return verbs_data

def process_phrases_for_sentences(df):
    """Process the phrases dataframe to create sentence data."""
    print("Processing phrases for sentence generation...")
    
    sentences = []
    processed_count = 0
    
    for idx, row in df.iterrows():
        if processed_count % 1000 == 0:
            print(f"Processed {processed_count}/{len(df)} phrases...")
        
        try:
            # Skip rows with missing essential data
            if pd.isna(row.get('main_verb_lemma')) or pd.isna(row.get('fr')):
                continue
            
            verb = row['main_verb_lemma']
            tense = map_tense_from_feats(row.get('main_verb_feats'))
            pronoun = determine_pronoun_from_structure(row)
            
            sentence_data = {
                "verb": verb,
                "tense": tense,
                "pronoun": pronoun,
                "sentence": row['fr'],
                "translation": row.get('en', ''),
                "source": row.get('source', ''),
                "gap_sentence": row.get('gap_sentence', '')
            }
            
            sentences.append(sentence_data)
            processed_count += 1
            
        except Exception as e:
            print(f"Error processing row {idx}: {e}")
            continue
    
    print(f"Generated {len(sentences)} sentence entries")
    return sentences

def write_javascript_file(data, var_name, filename):
    """Write data to a JavaScript file."""
    print(f"Writing {filename}...")
    
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(f"// AUTO-GENERATED by combine_dataset.py\n")
        f.write(f"// Generated on {pd.Timestamp.now()}\n\n")
        f.write(f"const {var_name} = {json.dumps(data, ensure_ascii=False, indent=2)};\n")
    
    print(f"Wrote {len(data)} entries to {filename}")

def main():
    """Main execution function."""
    print("Starting dataset combination process...")
    
    # Load phrases dataframe
    pickle_path = "test100_processed_dataframe.pickle"
    if not Path(pickle_path).exists():
        print(f"Error: Pickle file {pickle_path} not found!")
        return
    
    df = load_phrases_dataframe(pickle_path)
    
    # Generate verb data using verbecc
    verbs_data = generate_verbs_data()
    
    # Process phrases for sentences
    sentences_data = process_phrases_for_sentences(df)
    
    # Write JavaScript files
    write_javascript_file(verbs_data, "verbs", "js/verbs.full.js")
    write_javascript_file(sentences_data, "sentences", "sentences.js")
    
    print("\nDataset combination complete!")
    print(f"Generated:")
    print(f"  - js/verbs.full.js with {len(verbs_data)} verbs")
    print(f"  - sentences.js with {len(sentences_data)} sentences")

if __name__ == "__main__":
    main()
