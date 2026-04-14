#!/usr/bin/env python3
"""
Fill coverage gaps for top 100 verbs across all tenses.
Generate at least one sentence for every missing verb+tense combination.
"""

import json
import pandas as pd
import pickle
from pathlib import Path

def load_conjugation_data(cache_file="conjugation_cache.json"):
    """Load conjugation data from cache."""
    with open(cache_file, 'r', encoding='utf-8') as f:
        return json.load(f)

def get_missing_combinations():
    """Get list of missing verb+tense combinations for top 100 verbs."""
    # Load the comprehensive dataset
    with open('comprehensive_dataset.pkl', 'rb') as f:
        df = pd.read_pickle(f)
    
    # Filter for passed sentences only
    passed_df = df[df['validation_status'] == 'passed'].copy()
    
    # Get top 100 verbs
    verb_counts = df['main_verb_lemma'].value_counts()
    top_100_verbs = verb_counts.head(100).index.tolist()
    
    # Available tenses
    available_tenses = passed_df['validated_tense'].dropna().unique()
    
    # Find missing combinations
    missing_combinations = []
    
    for verb in top_100_verbs:
        verb_sentences = passed_df[passed_df['validated_verb'] == verb]
        verb_tenses = set(verb_sentences['validated_tense'].dropna().unique())
        
        for tense in available_tenses:
            if tense not in verb_tenses:
                missing_combinations.append((verb, tense))
    
    return missing_combinations, top_100_verbs, available_tenses

def create_sentence_templates():
    """Create sentence templates for different tenses."""
    templates = {
        'présent': [
            "Je {verb} souvent.",
            "Tu {verb} bien.",
            "Il/Elle {verb} maintenant.",
            "Nous {verb} ensemble.",
            "Vous {verb} toujours.",
            "Ils/Elles {verb} rapidement."
        ],
        'imparfait': [
            "Je {verb} autrefois.",
            "Tu {verb} quand tu étais jeune.",
            "Il/Elle {verb} souvent à cette époque.",
            "Nous {verb} tous les jours.",
            "Vous {verb} régulièrement.",
            "Ils/Elles {verb} beaucoup."
        ],
        'futur simple': [
            "Je {verb} demain.",
            "Tu {verb} bientôt.",
            "Il/Elle {verb} la semaine prochaine.",
            "Nous {verb} ensemble.",
            "Vous {verb} certainement.",
            "Ils/Elles {verb} plus tard."
        ],
        'passé composé': [
            "J'ai {verb} hier.",
            "Tu as {verb} récemment.",
            "Il/Elle a {verb} ce matin.",
            "Nous avons {verb} ensemble.",
            "Vous avez {verb} déjà.",
            "Ils/Elles ont {verb} rapidement."
        ],
        'conditionnel présent': [
            "Je {verb} si c'était possible.",
            "Tu {verb} peut-être.",
            "Il/Elle {verb} volontiers.",
            "Nous {verb} ensemble.",
            "Vous {verb} certainement.",
            "Ils/Elles {verb} sans doute."
        ],
        'subjonctif présent': [
            "Il faut que je {verb}.",
            "Il faut que tu {verb}.",
            "Il faut qu'il/elle {verb}.",
            "Il faut que nous {verb}.",
            "Il faut que vous {verb}.",
            "Il faut qu'ils/elles {verb}."
        ]
    }
    return templates

def get_conjugated_form(conjugation_data, verb, tense, pronoun):
    """Get the conjugated form for a verb, tense, and pronoun."""
    if verb not in conjugation_data:
        return None
    
    verb_data = conjugation_data[verb]
    
    # Map our tense names to conjugation data keys
    tense_mapping = {
        'présent': 'present',
        'imparfait': 'imparfait',
        'futur simple': 'futurSimple',
        'passé composé': 'passeCompose',
        'conditionnel présent': 'conditionnelPresent',
        'subjonctif présent': 'subjonctifPresent'
    }
    
    if tense not in tense_mapping:
        return None
    
    conj_tense = tense_mapping[tense]
    if conj_tense not in verb_data:
        return None
    
    # Map pronouns to conjugation keys
    pronoun_mapping = {
        'je': 'je',
        'tu': 'tu', 
        'il/elle': 'il/elle/on',
        'nous': 'nous',
        'vous': 'vous',
        'ils/elles': 'ils/elles'
    }
    
    if pronoun not in pronoun_mapping:
        return None
    
    conj_pronoun = pronoun_mapping[pronoun]
    if conj_pronoun not in verb_data[conj_tense]:
        return None
    
    return verb_data[conj_tense][conj_pronoun]

def generate_missing_sentences():
    """Generate sentences for missing verb+tense combinations."""
    print("Loading data...")
    conjugation_data = load_conjugation_data()
    missing_combinations, top_100_verbs, available_tenses = get_missing_combinations()
    templates = create_sentence_templates()
    
    print(f"Found {len(missing_combinations)} missing combinations")
    print(f"Top 100 verbs: {len(top_100_verbs)}")
    print(f"Available tenses: {sorted(available_tenses)}")
    
    generated_sentences = []
    failed_generations = []
    
    for i, (verb, tense) in enumerate(missing_combinations, 1):
        if i % 50 == 0:
            print(f"Processing {i}/{len(missing_combinations)}...")
        
        if tense not in templates:
            failed_generations.append((verb, tense, "No template for tense"))
            continue
        
        # Try different pronouns until we find one that works
        success = False
        for template in templates[tense]:
            # Extract pronoun from template
            pronoun = template.split()[0] if not template.startswith("Il faut") else template.split("que ")[1].split()[0]
            
            # Normalize pronoun
            pronoun_norm = pronoun.replace("J'", "je").replace("'", "")
            if "/" in pronoun_norm:
                pronoun_norm = pronoun_norm.split("/")[0]
            
            # Get conjugated form
            conjugated = get_conjugated_form(conjugation_data, verb, tense, pronoun_norm)
            
            if conjugated:
                # Handle special cases for passé composé (use past participle)
                if tense == 'passé composé' and isinstance(conjugated, dict):
                    # For passé composé, we need the past participle
                    if 'pastParticiple' in conjugated:
                        verb_form = conjugated['pastParticiple']
                    else:
                        continue
                else:
                    verb_form = conjugated
                
                # Create sentence
                sentence = template.replace("{verb}", verb_form)
                
                # Create sentence data structure
                sentence_data = {
                    "verb": verb,
                    "tense": tense,
                    "pronoun": pronoun_norm,
                    "sentence": sentence,
                    "translation": f"[Generated sentence for {verb} + {tense}]",
                    "source": "gap_filler",
                    "gap_sentence": sentence.replace(verb_form, "___"),
                    "verb_form": verb_form,
                    "generated": True
                }
                
                generated_sentences.append(sentence_data)
                success = True
                break
        
        if not success:
            failed_generations.append((verb, tense, "No valid conjugation found"))
    
    print(f"\nGeneration complete:")
    print(f"Successfully generated: {len(generated_sentences)} sentences")
    print(f"Failed to generate: {len(failed_generations)} combinations")
    
    if failed_generations:
        print(f"\nFirst 10 failed generations:")
        for i, (verb, tense, reason) in enumerate(failed_generations[:10], 1):
            print(f"{i:2d}. {verb} + {tense}: {reason}")
    
    return generated_sentences, failed_generations

def save_gap_filling_results(generated_sentences, failed_generations):
    """Save the gap-filling results."""
    # Save generated sentences
    with open('gap_filling_sentences.json', 'w', encoding='utf-8') as f:
        json.dump(generated_sentences, f, ensure_ascii=False, indent=2)
    
    # Save failed generations for analysis
    with open('failed_gap_generations.json', 'w', encoding='utf-8') as f:
        json.dump(failed_generations, f, ensure_ascii=False, indent=2)
    
    print(f"Saved {len(generated_sentences)} generated sentences to gap_filling_sentences.json")
    print(f"Saved {len(failed_generations)} failed generations to failed_gap_generations.json")

if __name__ == "__main__":
    print("=== FILLING COVERAGE GAPS ===")
    print("Generating sentences for missing verb+tense combinations...")
    
    generated_sentences, failed_generations = generate_missing_sentences()
    save_gap_filling_results(generated_sentences, failed_generations)
    
    print("\n=== SUMMARY ===")
    print(f"Generated {len(generated_sentences)} new sentences")
    print(f"Failed to generate {len(failed_generations)} combinations")
    
    if generated_sentences:
        print(f"\nExample generated sentences:")
        for i, sentence in enumerate(generated_sentences[:5], 1):
            print(f"{i}. {sentence['sentence']} ({sentence['verb']} + {sentence['tense']})")
