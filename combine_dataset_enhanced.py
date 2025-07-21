#!/usr/bin/env python3
"""
Enhanced script to combine phrases dataframe with verbecc conjugations and generate 
comprehensive JavaScript files for the franconjugue app.

This version includes:
- Complete conjugation tables from verbecc
- Better tense mapping
- Conjugation data for the app
- Improved sentence processing
"""

import pandas as pd
import pickle
import json
from pathlib import Path
from typing import Dict, List, Any
import math
import re

# Only import verbecc if available
try:
    from verbecc.conjugator import Conjugator
    VERBECC_AVAILABLE = True
except ImportError:
    VERBECC_AVAILABLE = False
    print("Warning: verbecc not available. Install with: pip install verbecc")

# Comprehensive tense mapping from linguistic features to app tenses
TENSE_MAPPING = {
    # Present indicative
    'Mood=Ind|Tense=Pres': 'présent',
    'Mood=Ind|Number=Sing|Person=1|Tense=Pres|VerbForm=Fin': 'présent',
    'Mood=Ind|Number=Sing|Person=2|Tense=Pres|VerbForm=Fin': 'présent',
    'Mood=Ind|Number=Sing|Person=3|Tense=Pres|VerbForm=Fin': 'présent',
    'Mood=Ind|Number=Plur|Person=1|Tense=Pres|VerbForm=Fin': 'présent',
    'Mood=Ind|Number=Plur|Person=2|Tense=Pres|VerbForm=Fin': 'présent',
    'Mood=Ind|Number=Plur|Person=3|Tense=Pres|VerbForm=Fin': 'présent',
    
    # Imperfect
    'Mood=Ind|Tense=Imp': 'imparfait',
    'Mood=Ind|Number=Sing|Person=1|Tense=Imp|VerbForm=Fin': 'imparfait',
    'Mood=Ind|Number=Sing|Person=2|Tense=Imp|VerbForm=Fin': 'imparfait',
    'Mood=Ind|Number=Sing|Person=3|Tense=Imp|VerbForm=Fin': 'imparfait',
    'Mood=Ind|Number=Plur|Person=1|Tense=Imp|VerbForm=Fin': 'imparfait',
    'Mood=Ind|Number=Plur|Person=2|Tense=Imp|VerbForm=Fin': 'imparfait',
    'Mood=Ind|Number=Plur|Person=3|Tense=Imp|VerbForm=Fin': 'imparfait',
    
    # Future
    'Mood=Ind|Tense=Fut': 'futur simple',
    'Mood=Ind|Number=Sing|Person=1|Tense=Fut|VerbForm=Fin': 'futur simple',
    'Mood=Ind|Number=Sing|Person=2|Tense=Fut|VerbForm=Fin': 'futur simple',
    'Mood=Ind|Number=Sing|Person=3|Tense=Fut|VerbForm=Fin': 'futur simple',
    'Mood=Ind|Number=Plur|Person=1|Tense=Fut|VerbForm=Fin': 'futur simple',
    'Mood=Ind|Number=Plur|Person=2|Tense=Fut|VerbForm=Fin': 'futur simple',
    'Mood=Ind|Number=Plur|Person=3|Tense=Fut|VerbForm=Fin': 'futur simple',
    
    # Conditional
    'Mood=Cnd': 'conditionnel présent',
    'Mood=Cnd|Number=Sing|Person=1|Tense=Pres|VerbForm=Fin': 'conditionnel présent',
    'Mood=Cnd|Number=Sing|Person=2|Tense=Pres|VerbForm=Fin': 'conditionnel présent',
    'Mood=Cnd|Number=Sing|Person=3|Tense=Pres|VerbForm=Fin': 'conditionnel présent',
    'Mood=Cnd|Number=Plur|Person=1|Tense=Pres|VerbForm=Fin': 'conditionnel présent',
    'Mood=Cnd|Number=Plur|Person=2|Tense=Pres|VerbForm=Fin': 'conditionnel présent',
    'Mood=Cnd|Number=Plur|Person=3|Tense=Pres|VerbForm=Fin': 'conditionnel présent',
    
    # Subjunctive
    'Mood=Sub': 'subjonctif présent',
    'Mood=Sub|Tense=Pres': 'subjonctif présent',
    'Mood=Sub|Number=Sing|Person=1|Tense=Pres|VerbForm=Fin': 'subjonctif présent',
    'Mood=Sub|Number=Sing|Person=2|Tense=Pres|VerbForm=Fin': 'subjonctif présent',
    'Mood=Sub|Number=Sing|Person=3|Tense=Pres|VerbForm=Fin': 'subjonctif présent',
    'Mood=Sub|Number=Plur|Person=1|Tense=Pres|VerbForm=Fin': 'subjonctif présent',
    'Mood=Sub|Number=Plur|Person=2|Tense=Pres|VerbForm=Fin': 'subjonctif présent',
    'Mood=Sub|Number=Plur|Person=3|Tense=Pres|VerbForm=Fin': 'subjonctif présent',
    
    # Past participle and compound tenses
    'VerbForm=Part|Tense=Past': 'passé composé',
    'Gender=Masc|Number=Sing|Tense=Past|VerbForm=Part': 'passé composé',
    'Gender=Fem|Number=Sing|Tense=Past|VerbForm=Part': 'passé composé',
    'Number=Plur|Tense=Past|VerbForm=Part': 'passé composé',
}

# Pronoun mappings
PRONOUN_MAPPING = {
    'je': 'je',
    'j\'': 'je',
    'tu': 'tu',
    'il': 'il/elle',
    'elle': 'il/elle',
    'on': 'il/elle/on',
    'nous': 'nous',
    'vous': 'vous',
    'ils': 'ils/elles',
    'elles': 'ils/elles',
    # Handle inverted pronouns (from questions like "dit-il", "peux-tu")
    '-il': 'il/elle',
    '-elle': 'il/elle', 
    '-tu': 'tu',
    '-vous': 'vous',
    '-nous': 'nous',
    '-ils': 'ils/elles',
    '-elles': 'ils/elles',
}

# Verbecc to app tense mapping
VERBECC_TENSE_MAPPING = {
    'présent': 'présent',
    'imparfait': 'imparfait',
    'futur': 'futur simple',
    'passé-composé': 'passé composé',
    'plus-que-parfait': 'plus-que-parfait',
    'conditionnel': 'conditionnel présent',
    'subjonctif-présent': 'subjonctif présent',
    'subjonctif-imparfait': 'subjonctif imparfait',
}

# Map from conjugation table tense names to validation tense names
CONJUGATION_TO_VALIDATION_TENSE = {
    'present': 'présent',
    'imparfait': 'imparfait', 
    'futurSimple': 'futur simple',
    'passeCompose': 'passé composé',
    'plusQueParfait': 'plus-que-parfait',
    'conditionnelPresent': 'conditionnel présent',
    'subjonctifPresent': 'subjonctif présent',
}

# Map from morphological analysis tense codes to validation tense names  
MORPH_TENSE_TO_VALIDATION = {
    'Pres': 'présent',
    'Imp': 'imparfait',
    'Fut': 'futur simple', 
    'Past': 'passé composé',  # This might need refinement
}

# Verbecc pronoun to app pronoun mapping
VERBECC_PRONOUN_MAPPING = {
    '1s': 'je',
    '2s': 'tu', 
    '3s': 'il/elle',
    '1p': 'nous',
    '2p': 'vous',
    '3p': 'ils/elles',
}

def extract_linguistic_features(feats_str):
    """Extract person, number, tense, mood from morphological features."""
    if not feats_str or pd.isna(feats_str):
        return None, None, None, None
    
    features = feats_str.split('|')
    person = number = tense = mood = None
    
    for feat in features:
        if feat.startswith('Person='):
            person = feat.split('=')[1]
        elif feat.startswith('Number='):
            number = feat.split('=')[1]
        elif feat.startswith('Tense='):
            tense = feat.split('=')[1]
        elif feat.startswith('Mood='):
            mood = feat.split('=')[1]
    
    return person, number, tense, mood

def determine_pronoun_from_structure(row):
    """Determine the appropriate pronoun from sentence structure."""
    # First check explicit pronoun
    if row.get('pronoun') and not pd.isna(row['pronoun']):
        pronoun = str(row['pronoun']).lower().strip()
        return PRONOUN_MAPPING.get(pronoun, pronoun)
    
    # Look in full_structure for subject pronoun
    if row.get('full_structure'):
        for token in row['full_structure']:
            if (token.get('upos') == 'PRON' and 
                token.get('deprel') in ['nsubj', 'nsubj:pass']):
                pronoun = token['text'].lower().strip()
                return PRONOUN_MAPPING.get(pronoun, pronoun)
    
    # Extract from morphological features
    feats = row.get('main_verb_feats')
    if feats:
        person, number, _, _ = extract_linguistic_features(feats)
        
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
        return 'présent'
    
    # Clean the features string
    feats_str = feats_str.strip()
    
    # Direct mapping first
    if feats_str in TENSE_MAPPING:
        return TENSE_MAPPING[feats_str]
    
    # Pattern-based matching
    person, number, tense, mood = extract_linguistic_features(feats_str)
    
    if mood == 'Ind':  # Indicative
        if tense == 'Pres':
            return 'présent'
        elif tense == 'Imp':
            return 'imparfait'
        elif tense == 'Fut':
            return 'futur simple'
        elif tense == 'Past':
            return 'passé simple'
    elif mood == 'Cnd':  # Conditional
        return 'conditionnel présent'
    elif mood == 'Sub':  # Subjunctive
        if tense == 'Pres':
            return 'subjonctif présent'
        elif tense == 'Imp':
            return 'subjonctif imparfait'
    
    # Check for past participle
    if 'VerbForm=Part' in feats_str and 'Tense=Past' in feats_str:
        return 'passé composé'
    
    return 'présent'  # default fallback

def generate_conjugation_data(cache_file="conjugation_cache.json"):
    """Generate complete conjugation data using verbecc with caching."""
    if not VERBECC_AVAILABLE:
        print("Cannot generate conjugation data without verbecc")
        return {}
    
    # Check if cached file exists
    cache_path = Path(cache_file)
    if cache_path.exists():
        print(f"Loading cached conjugation data from {cache_file}...")
        try:
            with open(cache_path, 'r', encoding='utf-8') as f:
                cached_data = json.load(f)
            print(f"Loaded {len(cached_data)} tenses from cache")
            return cached_data
        except Exception as e:
            print(f"Error loading cache: {e}, regenerating...")
    
    print("Generating comprehensive conjugation data (this may take a while)...")
    print("This will be cached for future runs...")
    
    conjugator = Conjugator(lang="fr")
    all_verbs = sorted(set(conjugator.get_infinitives()))
    
    # Use the correct tense names from verbecc (French names)
    TENSE_MAPPING = {
        'présent': 'present',
        'imparfait': 'imparfait', 
        'futur-simple': 'futurSimple',
        'passé-composé': 'passeCompose',
        'plus-que-parfait': 'plusQueParfait'
    }
    
    MOOD_TENSE_MAPPING = {
        'indicatif': TENSE_MAPPING,
        'conditionnel': {'présent': 'conditionnelPresent'},
        'subjonctif': {'présent': 'subjonctifPresent'}
    }
    
    PRONOUNS = ["je", "tu", "il/elle/on", "nous", "vous", "ils/elles"]
    
    tenses = {}
    # Initialize all app tenses
    for mood_mappings in MOOD_TENSE_MAPPING.values():
        for app_tense in mood_mappings.values():
            tenses[app_tense] = {}
    
    processed = 0
    for infinitive in all_verbs:
        if processed % 1000 == 0:
            print(f"Processing conjugations: {processed}/{len(all_verbs)}")
        
        try:
            conj = conjugator.conjugate(infinitive)
            moods = conj['moods']
            
            # Process each mood and tense
            for mood, mood_tenses in MOOD_TENSE_MAPPING.items():
                if mood in moods:
                    for french_tense, app_tense in mood_tenses.items():
                        if french_tense in moods[mood]:
                            conjugation_array = moods[mood][french_tense]
                            
                            # Map array to pronoun dictionary
                            verb_conjugations = {}
                            for i, pronoun in enumerate(PRONOUNS):
                                if i < len(conjugation_array):
                                    conj_form = conjugation_array[i]
                                    # Clean up subjunctive "que " prefix
                                    if conj_form.startswith('que '):
                                        conj_form = conj_form[4:]
                                    elif conj_form.startswith("qu'"):
                                        conj_form = conj_form[3:]
                                    verb_conjugations[pronoun] = conj_form
                                else:
                                    verb_conjugations[pronoun] = ""
                            
                            tenses[app_tense][infinitive] = verb_conjugations
                        else:
                            # Tense not available for this verb
                            tenses[app_tense][infinitive] = {p: "" for p in PRONOUNS}
                else:
                    # Mood not available for this verb
                    for app_tense in mood_tenses.values():
                        tenses[app_tense][infinitive] = {p: "" for p in PRONOUNS}
        
        except Exception as e:
            # Verb can't be conjugated, create empty entries
            for mood_mappings in MOOD_TENSE_MAPPING.values():
                for app_tense in mood_mappings.values():
                    tenses[app_tense][infinitive] = {p: "" for p in PRONOUNS}
        
        processed += 1
    
    print(f"Generated conjugations for {len(all_verbs)} verbs across {len(tenses)} tenses")
    
    # Save to cache
    print(f"Saving conjugation data to cache: {cache_file}")
    try:
        with open(cache_file, 'w', encoding='utf-8') as f:
            json.dump(tenses, f, ensure_ascii=False, indent=2)
        print("Cache saved successfully")
    except Exception as e:
        print(f"Warning: Could not save cache: {e}")
    
    return tenses

def load_phrases_dataframe(pickle_path):
    """Load the phrases dataframe from pickle file."""
    print(f"Loading phrases from {pickle_path}...")
    with open(pickle_path, 'rb') as f:
        df = pickle.load(f)
    print(f"Loaded {len(df)} phrases")
    return df

def generate_verbs_data(sentences_data):
    """Generate verb list with frequency and translation data derived from actual usage."""
    print("Generating verb data based on actual usage...")
    
    # Count verb usage from sentences data
    from collections import Counter
    verb_usage = Counter(sentence['verb'] for sentence in sentences_data if sentence.get('verb'))
    
    print(f"Found {len(verb_usage)} unique verbs in sentences data")
    print(f"Total verb instances: {sum(verb_usage.values())}")
    
    # Define top verbs for manual frequency classification
    top_20_verbs = {
        "être", "avoir", "aller", "faire", "venir", "pouvoir", "vouloir", 
        "savoir", "devoir", "dire", "voir", "prendre", "mettre", "croire",
        "parler", "passer", "trouver", "donner", "comprendre", "partir"
    }
    
    top_50_verbs = top_20_verbs | {
        "demander", "tenir", "aimer", "penser", "rester", "arriver",
        "porter", "sortir", "vivre", "finir", "commencer", "entrer",
        "regarder", "attendre", "tomber", "rendre", "sembler", "paraître",
        "connaître", "suivre", "jouer", "ouvrir", "écrire", "lire",
        "servir", "sentir", "courir", "mourir", "naître", "cacher",
        "acheter", "appeler", "apprendre", "choisir", "construire"
    }
    
    # Get all verbs from verbecc
    if VERBECC_AVAILABLE:
        conjugator = Conjugator(lang="fr")
        all_verbs = sorted(set(conjugator.get_infinitives()))
    else:
        # Use verbs from our data + common verbs as fallback
        all_verbs = list(set(verb_usage.keys()) | top_50_verbs)
    
    print(f"Processing {len(all_verbs)} total verbs")
    
    # Calculate frequency thresholds from data
    usage_counts = list(verb_usage.values())
    usage_counts.sort(reverse=True)
    
    # Set thresholds based on data distribution
    if len(usage_counts) >= 3:
        # Top 10% are common (but at least used 2+ times)
        common_threshold = max(2, usage_counts[len(usage_counts)//10] if len(usage_counts) > 10 else usage_counts[2])
        # Next tier is intermediate (used at least once)
        intermediate_threshold = 1
    else:
        common_threshold = 2
        intermediate_threshold = 1
    
    print(f"Frequency thresholds from data: common >= {common_threshold}, intermediate >= {intermediate_threshold}")
    
    verbs_data = []
    frequency_stats = {"common": 0, "intermediate": 0, "rare": 0}
    
    for verb in all_verbs:
        usage_count = verb_usage.get(verb, 0)
        
        # Determine frequency
        if verb in top_20_verbs:
            frequency = "common"
        elif verb in top_50_verbs:
            frequency = "intermediate" 
        elif usage_count >= common_threshold:
            frequency = "common"
        elif usage_count >= intermediate_threshold:
            frequency = "intermediate"
        else:
            frequency = "rare"
        
        frequency_stats[frequency] += 1
        
        # Basic translation (placeholder - you can enhance this later)
        translation = verb  # Could be enhanced with a translation service
        
        verbs_data.append({
            "infinitive": verb,
            "translation": translation,
            "frequency": frequency,
            "usage_count": usage_count
        })
    
    print(f"Frequency distribution:")
    print(f"  Common: {frequency_stats['common']} verbs")
    print(f"  Intermediate: {frequency_stats['intermediate']} verbs") 
    print(f"  Rare: {frequency_stats['rare']} verbs")
    
    # Sort by frequency and usage
    verbs_data.sort(key=lambda x: (
        {"common": 0, "intermediate": 1, "rare": 2}[x["frequency"]], 
        -x["usage_count"], 
        x["infinitive"]
    ))
    
    print(f"Top 10 most used verbs in your data:")
    for i, (verb, count) in enumerate(verb_usage.most_common(10)):
        print(f"  {i+1}. {verb}: {count} times")
    
    return verbs_data

def build_reverse_conjugation_lookup(conjugations_data):
    """
    Build a reverse lookup: conjugated_form -> list of possible (verb, tense, pronoun)
    
    Args:
        conjugations_data: The tenses data from verbecc conjugation generation
    
    Returns:
        Dict mapping conjugated forms to possible verb combinations
    """
    from collections import defaultdict
    
    reverse_lookup = defaultdict(list)
    
    # Structure is: tense -> verb -> pronoun -> conjugated_form
    for tense_name, tense_data in conjugations_data.items():
        for verb_infinitive, pronoun_conjugations in tense_data.items():
            for pronoun, conjugated_form in pronoun_conjugations.items():
                if conjugated_form and conjugated_form.strip():
                    # Extract the actual verb part from compound forms
                    verb_part = conjugated_form.strip()
                    
                    # Remove common pronoun prefixes
                    prefixes_to_remove = ["j'", "tu ", "il ", "elle ", "on ", "nous ", "vous ", "ils ", "elles "]
                    for prefix in prefixes_to_remove:
                        if verb_part.startswith(prefix):
                            verb_part = verb_part[len(prefix):]
                            break
                    
                    # For compound tenses, extract the main verb (last word)
                    # "ai pris" -> "pris", "avons travaillé" -> "travaillé"
                    if ' ' in verb_part:
                        verb_part = verb_part.split()[-1]
                    
                    # Normalize the form (lowercase, strip)
                    normalized_form = verb_part.strip().lower()
                    
                    reverse_lookup[normalized_form].append({
                        'verb': verb_infinitive,
                        'tense': tense_name, 
                        'pronoun': pronoun,
                        'original_form': conjugated_form
                    })
    
    return dict(reverse_lookup)

def validate_verb_form_against_conjugation(verb_claimed, tense, pronoun, verb_form, reverse_lookup):
    """
    Validate that a verb form matches the claimed verb+tense+pronoun combination.
    
    Returns:
        (is_valid, corrected_verb, issue_description)
    """
    if not reverse_lookup or not verb_form:
        return True, verb_claimed, None  # Can't validate without data

    normalized_form = verb_form.strip().lower()
    
    # Check if this form exists in our conjugation tables
    if normalized_form not in reverse_lookup:
        return False, verb_claimed, f"Form '{verb_form}' not found in conjugation tables"

    candidates = reverse_lookup[normalized_form]
    
    # Check if claimed verb is among the candidates
    matching_candidates = [c for c in candidates if c['verb'] == verb_claimed]
    
    if not matching_candidates:
        # Wrong verb entirely - try to find the correct one
        actual_verbs = list(set(c['verb'] for c in candidates))
        if len(actual_verbs) == 1:
            # Only one possible verb - use it
            return False, actual_verbs[0], f"'{verb_form}' comes from '{actual_verbs[0]}', not '{verb_claimed}'"
        else:
            # Multiple possibilities - can't auto-correct
            return False, verb_claimed, f"'{verb_form}' could come from {actual_verbs}, not '{verb_claimed}'"
    
    # Normalize tense name from sentence data to conjugation table format
    normalized_tense = tense
    
    # Handle the key mismatch: sentence data 'présent' vs conjugation table 'present'
    if tense == 'présent':
        normalized_tense = 'present'
    elif tense == 'passé composé':
        normalized_tense = 'passeCompose'
    elif tense == 'imparfait':
        normalized_tense = 'imparfait'
    elif tense == 'futur simple':
        normalized_tense = 'futurSimple'
    elif tense == 'plus-que-parfait':
        normalized_tense = 'plusQueParfait'
    elif tense == 'conditionnel présent':
        normalized_tense = 'conditionnelPresent'
    elif tense == 'subjonctif présent':
        normalized_tense = 'subjonctifPresent'
    # Try morphological mapping for codes like 'Pres', 'Imp', etc.
    elif tense in MORPH_TENSE_TO_VALIDATION:
        validation_tense = MORPH_TENSE_TO_VALIDATION[tense]
        # Convert validation tense back to conjugation table format
        conjugation_tense = None
        for conj_tense, val_tense in CONJUGATION_TO_VALIDATION_TENSE.items():
            if val_tense == validation_tense:
                conjugation_tense = conj_tense
                break
        if conjugation_tense:
            normalized_tense = conjugation_tense
    
    # Check if tense and pronoun also match
    perfect_matches = [c for c in matching_candidates 
                      if c['tense'] == normalized_tense and pronoun_matches(c['pronoun'], pronoun)]
    
    if perfect_matches:
        return True, verb_claimed, None  # Perfect match
    
    # Verb is correct but tense/pronoun might be wrong
    return False, verb_claimed, f"'{verb_form}' exists for '{verb_claimed}' but not for tense='{tense}', pronoun='{pronoun}'"

def normalize_pronoun(pronoun):
    """Normalize pronoun to standard form, handling contractions, inversions, etc."""
    if not pronoun:
        return ""
    
    # Clean and lowercase
    normalized = str(pronoun).strip().lower()
    
    # Handle contractions
    contraction_map = {
        "j'": "je",
        "j'": "je",  # Different apostrophe
        "t'": "tu", 
        "t'": "tu",  # Different apostrophe
        "m'": "me",
        "m'": "me",  # Different apostrophe
        "l'": "le",
        "l'": "le",  # Different apostrophe
        "n'": "ne",
        "n'": "ne",  # Different apostrophe
        "s'": "se",
        "s'": "se",  # Different apostrophe
        "d'": "de",
        "d'": "de",  # Different apostrophe
        "c'": "ce",
        "c'": "ce",  # Different apostrophe
        "qu'": "que",
        "qu'": "que",  # Different apostrophe
    }
    
    # Apply contraction mapping
    for contraction, full_form in contraction_map.items():
        if normalized == contraction:
            normalized = full_form
            break
    
    # Handle inverted forms (questions)
    inversion_map = {
        "-je": "je",
        "-tu": "tu", 
        "-il": "il",
        "-elle": "elle",
        "-nous": "nous",
        "-vous": "vous",
        "-ils": "ils",
        "-elles": "elles",
        "-t-il": "il",
        "-t-elle": "elle",
        "-t-on": "on",
        "as-tu": "tu",
        "a-t-il": "il",
        "a-t-elle": "elle",
        "est-il": "il",
        "est-elle": "elle",
        "sont-ils": "ils",
        "sont-elles": "elles",
    }
    
    # Apply inversion mapping
    for inversion, base_form in inversion_map.items():
        if normalized == inversion:
            normalized = base_form
            break
    
    # Handle compound pronouns with objects
    compound_map = {
        "le-moi": "je",
        "la-moi": "je", 
        "les-moi": "je",
        "me-le": "je",
        "me-la": "je",
        "me-les": "je",
        "te-le": "tu",
        "te-la": "tu",
        "te-les": "tu",
        "nous-le": "nous",
        "nous-la": "nous", 
        "nous-les": "nous",
        "vous-le": "vous",
        "vous-la": "vous",
        "vous-les": "vous",
        "laisse-moi": "je",
        "donne-moi": "je",
        "dis-moi": "je",
    }
    
    # Apply compound mapping
    for compound, base_form in compound_map.items():
        if normalized == compound:
            normalized = base_form
            break
    
    return normalized

def pronoun_matches(conjugation_pronoun, sentence_pronoun):
    """Check if pronouns match, handling contractions, inversions, etc."""
    # Normalize both pronouns
    conj_normalized = normalize_pronoun(conjugation_pronoun)
    sent_normalized = normalize_pronoun(sentence_pronoun)
    
    # Handle combined forms like 'il/elle' 
    conj_variants = conj_normalized.split('/') if '/' in conj_normalized else [conj_normalized]
    sent_variants = sent_normalized.split('/') if '/' in sent_normalized else [sent_normalized]
    
    # Check if any variant matches
    return any(cv.strip() == sv.strip() for cv in conj_variants for sv in sent_variants)

def process_phrases_for_sentences(df, conjugations_data=None, max_per_source=5, filter_sentences=[]):
    """Process phrases dataframe to create sentence data with verb form validation.
    
    Args:
        df: DataFrame with phrases
        conjugations_data: Conjugation data for validation
        max_per_source: Maximum sentences per source for same verb+pronoun+tense (default: 5)
    """
    print("Processing phrases for sentence generation...")
    print(f"Starting with {len(df)} phrases")
    
    # Build reverse lookup for validation if conjugation data available
    reverse_lookup = None
    if conjugations_data:
        print("Building reverse conjugation lookup for validation...")
        reverse_lookup = build_reverse_conjugation_lookup(conjugations_data)
        print(f"Built reverse lookup with {len(reverse_lookup)} conjugated forms")
    
    sentences = []
    processed_count = 0
    
    # Track sentences per source per combination
    source_combination_counts = {}
    
    skipped_reasons = {
        'missing_verb_lemma': 0,
        'missing_french': 0,
        'empty_french': 0,
        'infinitive_verb': 0,
        'verb_form_mismatch': 0,
        'processing_error': 0,
        'source_limit_exceeded': 0,
        'not_in_filtered_sentences':0
    }
    
    for idx, row in df.iterrows():
        if processed_count % 50 == 0:
            print(f"Processed {processed_count}/{len(df)} phrases...")
        
        try:
            
            # Check for missing verb lemma
            if pd.isna(row.get('main_verb_lemma')) or str(row.get('main_verb_lemma')).strip() == '':
                skipped_reasons['missing_verb_lemma'] += 1
                continue
            
            # Check for missing French text
            if pd.isna(row.get('fr')):
                skipped_reasons['missing_french'] += 1
                continue
                
            # Check for empty French text
            french_text = str(row.get('fr')).strip()
            # if filter_sentences and french_text not in filter_sentences:
            #     skipped_reasons['not_in_filtered_sentences'] += 1
            #     continue
            
            if not french_text:
                skipped_reasons['empty_french'] += 1
                continue
            
            # Debug: Check what we have in this row
            if processed_count < 5:  # Debug first few rows
                print(f"Row {idx}: verb_lemma='{row.get('main_verb_lemma')}', fr='{str(row.get('fr', ''))[:50]}...'")

            verb = str(row['main_verb_lemma']).strip()
            
            # Check for infinitive verb forms and skip them
            verb_feats = str(row.get('main_verb_feats', '')).strip()
            if 'VerbForm=Inf' in verb_feats:
                skipped_reasons['infinitive_verb'] = skipped_reasons.get('infinitive_verb', 0) + 1
                continue
            
            tense = map_tense_from_feats(row.get('main_verb_feats'))
            pronoun = determine_pronoun_from_structure(row)
            verb_form = str(row.get('main_verb', '')).strip()
            
            # VALIDATION: Check if verb form matches claimed verb+tense+pronoun
            if reverse_lookup and verb_form:
                # Debug specific problematic sentences
                debug_this = (verb_form == 'pu' and verb == 'pouvoir') or (verb_form == 'apparues' and verb == 'apparaître')
                debug_this = debug_this or (french_text in filter_sentences)
                if debug_this:
                    print(f"\n=== DEBUGGING SENTENCE {idx} ===")
                    print(f"French: {french_text}")
                    print(f"Verb: {verb}, Tense: {tense}, Pronoun: {pronoun}, Form: {verb_form}")
                    print(f"Features: {row.get('main_verb_feats')}")
                
                is_valid, corrected_verb, issue = validate_verb_form_against_conjugation(
                    verb, tense, pronoun, verb_form, reverse_lookup
                )
                
                # Check for invalid pronouns
                normalized_pronoun = normalize_pronoun(pronoun)
                if normalized_pronoun == "INVALID":
                    is_valid = False
                    issue = f"Weird/invalid pronoun: '{pronoun}'"
                
                if debug_this:
                    print(f"Validation result: is_valid={is_valid}, corrected_verb={corrected_verb}, issue={issue}")
                    if is_valid:
                        print(f"SHOULD PASS - Adding to sentences")
                    else:
                        print(f"SHOULD FAIL - Reason: {issue}")
                
                if not is_valid:
                    # Check if this is a collision case (verb_form matches multiple verbs)
                    normalized_form = verb_form.strip().lower()
                    if normalized_form in reverse_lookup:
                        candidates = reverse_lookup[normalized_form]
                        candidate_verbs = list(set(c['verb'] for c in candidates))
                        
                        if len(candidate_verbs) > 1:
                            # This is a collision case - show it
                            if processed_count < 10:
                                print(f"COLLISION CASE for row {idx}: '{verb_form}' could be: {candidate_verbs}")
                                print(f"  Sentence: {french_text[:60]}...")
                                print(f"  Claimed: {verb}, but form matches: {candidate_verbs}")
                    
                    # Log the issue for debugging
                    if processed_count < 10:  # Show first few validation failures
                        print(f"VALIDATION FAILED for row {idx}: {issue}")
                        print(f"  Sentence: {french_text[:60]}...")
                        print(f"  Claimed: {verb}+{tense}+{pronoun} -> {verb_form}")
                    
                    # Try to auto-correct if we found a single alternative verb
                    if corrected_verb != verb and "comes from" in issue:
                        
                        if processed_count < 5:  # Show first few corrections
                            print(f"  AUTO-CORRECTING: {verb} -> {corrected_verb}")
                        verb = corrected_verb  # Use the corrected verb
                        # original_
                    else:
                        # Skip sentences we can't fix
                        skipped_reasons['verb_form_mismatch'] += 1
                        
                
                sentence_data = {
                "verb": verb,  # Now using the validated/corrected verb
                "tense": tense,
                "pronoun": pronoun,
                "sentence": french_text,
                "translation": str(row.get('en', '')).strip(),
                "source": str(row.get('source', '')).strip(),
                "gap_sentence": str(row.get('gap_sentence', '')).strip(),
                "verb_form": verb_form,
                "linguistic_features": str(row.get('main_verb_feats', '')).strip(),
                "issue": issue if not is_valid else None,
                'is_valid': is_valid,
                # 'original_verb': verb_form
                # 'corrected_verb': corrected_verb if not is_valid else None,
                
                
            }
            
            # Check source limit for this verb+tense+pronoun combination
            source = sentence_data['source']
            combination_key = (verb, tense, pronoun)
            source_key = (source, combination_key)
            
            current_count = source_combination_counts.get(source_key, 0)
            if current_count >= max_per_source:
                skipped_reasons['source_limit_exceeded'] += 1
                continue
            
            # Update source count
            source_combination_counts[source_key] = current_count + 1
            
            # Debug specific sentences
            debug_this = (verb_form == 'pu' and verb == 'pouvoir') or (verb_form == 'apparues' and verb == 'apparaître')
            if debug_this:
                print(f"SUCCESSFULLY ADDED SENTENCE: {french_text}")
                print(f"=== END DEBUG ===\n")
            
            sentences.append(sentence_data)
            processed_count += 1
            
        except Exception as e:
            skipped_reasons['processing_error'] += 1
            if processed_count < 10:  # Show first few errors
                print(f"Error processing row {idx}: {e}")
            continue
    
    print(f"\nProcessing complete:")
    print(f"  Successfully processed: {len(sentences)} sentences")
    print(f"  Skipped reasons:")
    for reason, count in skipped_reasons.items():
        print(f"    {reason}: {count}")
    
    return sentences

def analyze_sentence_distribution(sentences_data):
    """Analyze how many sentences we have per verb+tense+pronoun combination."""
    from collections import defaultdict
    
    combinations = defaultdict(list)
    
    for sentence in sentences_data:
        key = (sentence['verb'], sentence['tense'], sentence['pronoun'])
        combinations[key].append(sentence)
    
    # Report statistics
    total_combinations = len(combinations)
    total_sentences = len(sentences_data)
    
    # Count how many combinations have multiple sentences
    multiple_sentences = {k: v for k, v in combinations.items() if len(v) > 1}
    
    print(f"\nSentence Distribution Analysis:")
    print(f"  Total sentences: {total_sentences}")
    print(f"  Unique verb+tense+pronoun combinations: {total_combinations}")
    # print(f"  Average sentences per combination: {total_sentences/total_combinations:.1f}")
    print(f"  Combinations with multiple sentences: {len(multiple_sentences)}")
    
    if multiple_sentences:
        # Show top combinations with most sentences
        sorted_multiple = sorted(multiple_sentences.items(), key=lambda x: len(x[1]), reverse=True)
        print(f"\nTop combinations with multiple sentences:")
        for i, ((verb, tense, pronoun), sentences) in enumerate(sorted_multiple[:10]):
            print(f"  {i+1}. {verb}+{tense}+{pronoun}: {len(sentences)} sentences")
            if i < 3:  # Show example sentences for top 3
                for j, s in enumerate(sentences[:3]):  # Show up to 3 examples
                    print(f"     - {s['sentence'][:60]}...")
    
    return combinations

def create_backup(filepath):
    """Create a backup of an existing file."""
    if Path(filepath).exists():
        backup_path = f"{filepath}.backup.{pd.Timestamp.now().strftime('%Y%m%d_%H%M%S')}"
        Path(filepath).rename(backup_path)
        print(f"Created backup: {backup_path}")
        return backup_path
    return None

def write_javascript_files(verbs_data, sentences_data, conjugations_data):
    """Write all JavaScript files for the app."""
    
    # Ensure js directory exists
    js_dir = Path("js")
    js_dir.mkdir(exist_ok=True)
    
    # Use safe output filenames to avoid overwriting existing files
    verbs_output = "js/verbs.full.generated.js"
    sentences_output = "sentences.generated.js"
    
    # Create backups if files exist
    if Path(verbs_output).exists():
        create_backup(verbs_output)
    if Path(sentences_output).exists():
        create_backup(sentences_output)
    
    # Write verbs file
    print(f"Writing {verbs_output}...")
    with open(verbs_output, 'w', encoding='utf-8') as f:
        f.write("// AUTO-GENERATED by combine_dataset_enhanced.py\n")
        f.write(f"// Generated on {pd.Timestamp.now()}\n")
        f.write("// SAFE OUTPUT - does not overwrite existing files\n\n")
        f.write(f"const verbs = {json.dumps(verbs_data, ensure_ascii=False, indent=2)};\n\n")
        
        if conjugations_data:
            f.write(f"const tenses = {json.dumps(conjugations_data, ensure_ascii=False, indent=2)};\n\n")
        
        # Add pronouns array
        # adding /on
        pronouns = ["je", "tu", "il/elle/on", "nous", "vous", "ils/elles"]
        f.write(f"const pronouns = {json.dumps(pronouns, ensure_ascii=False, indent=2)};\n")
    
    # Write sentences file
    print(f"Writing {sentences_output}...")
    
    # Group sentences by verb+tense+pronoun for random selection support
    from collections import defaultdict
    grouped_sentences = defaultdict(list)
    
    for sentence in sentences_data:
        key = f"{sentence['verb']}+{sentence['tense']}+{sentence['pronoun']}"
        grouped_sentences[key].append(sentence)
    
    # Count statistics
    single_sentence_combinations = sum(1 for sentences in grouped_sentences.values() if len(sentences) == 1)
    multiple_sentence_combinations = sum(1 for sentences in grouped_sentences.values() if len(sentences) > 1)
    total_combinations = len(grouped_sentences)
    
    print(f"  Sentence grouping stats:")
    print(f"    - {single_sentence_combinations} combinations with 1 sentence")
    print(f"    - {multiple_sentence_combinations} combinations with multiple sentences")
    print(f"    - {total_combinations} total combinations")
    
    with open(sentences_output, 'w', encoding='utf-8') as f:
        f.write("// AUTO-GENERATED by combine_dataset_enhanced.py\n")
        f.write(f"// Generated on {pd.Timestamp.now()}\n")
        f.write("// SAFE OUTPUT - does not overwrite existing files\n")
        f.write("// Sentences are grouped by verb+tense+pronoun for random selection\n\n")
        
        # Write the grouped sentences data
        f.write(f"const sentenceGroups = {json.dumps(grouped_sentences, ensure_ascii=False, indent=2)};\n\n")
        
        # Write helper function for getting a random sentence
        f.write("""// Helper function to get a random sentence for a verb+tense+pronoun combination
function getRandomSentence(verb, tense, pronoun) {
    const key = `${verb}+${tense}+${pronoun}`;
    const sentences = sentenceGroups[key];
    if (!sentences || sentences.length === 0) {
        return null;
    }
    if (sentences.length === 1) {
        return sentences[0];
    }
    // Return random sentence from the group
    const randomIndex = Math.floor(Math.random() * sentences.length);
    return sentences[randomIndex];
}

// Helper function to get all sentences for a combination (for debugging)
function getAllSentences(verb, tense, pronoun) {
    const key = `${verb}+${tense}+${pronoun}`;
    return sentenceGroups[key] || [];
}

// Legacy support: flat sentences array (use getRandomSentence() instead for better variety)
const sentences = [
""")
        
        # Write flat sentences array for backwards compatibility, taking first from each group
        flat_sentences = []
        for sentences_group in grouped_sentences.values():
            flat_sentences.append(sentences_group[0])  # Take first sentence from each group
        
        # Write the flat sentences
        for i, sentence in enumerate(flat_sentences):
            f.write(f"  {json.dumps(sentence, ensure_ascii=False)}")
            if i < len(flat_sentences) - 1:
                f.write(",")
            f.write("\n")
        
        f.write("];\n")
    
    print(f"\nGenerated SAFE output files:")
    print(f"  - {verbs_output}: {len(verbs_data)} verbs" + 
          (f", {len(conjugations_data)} tenses" if conjugations_data else ""))
    print(f"  - {sentences_output}: {len(sentences_data)} sentences")
    print(f"\nTo use these files, manually review and rename them to replace your existing files.")



def normalize_pronoun(pronoun: str) -> str:
    """
    Normalize pronoun to standard form, handling contractions and filtering invalid ones.
    Returns 'INVALID' for pronouns that can't be used for conjugation.
    """
    if not pronoun:
        return "INVALID"
    
    # Clean and lowercase
    pronoun = pronoun.lower().strip()
    
    # Handle contractions - map to subject pronouns
    contraction_map = {
        "j'": "je",
        "j'": "je",  # Different apostrophe encoding
        "j": "je",   # Incomplete contraction
        "t'": "tu", 
        "t'": "tu",  # Different apostrophe encoding
        "-t-il": "il/elle/on",
        "-t-elle": "il/elle/on",
        "-je": "je",
        "-tu": "tu",
        "-il": "il/elle/on",
        "-elle": "il/elle/on",
        "-nous": "nous",
        "-vous": "vous",
        "-ils": "ils/elles",
        "-elles": "ils/elles",
        "as-tu": "tu",
        "laisse-moi": "je",  # Context-specific mapping
    }
    
    # Apply contraction mapping first
    if pronoun in contraction_map:
        pronoun = contraction_map[pronoun]
    
    # Handle combined forms
    combined_map = {
        "il/elle": "il/elle/on",
        "on": "il/elle/on",
        "il": "il/elle/on",
        "elle": "il/elle/on",
        "ils": "ils/elles", 
        "elles": "ils/elles",
    }
    
    if pronoun in combined_map:
        pronoun = combined_map[pronoun]
    
    # Valid subject pronouns only
    valid_pronouns = {
        "je", "tu", "il/elle/on", "nous", "vous", "ils/elles"
    }
    
    # Object pronouns and other invalid forms - reject these
    invalid_pronouns = {
        "me", "te", "lui", "la", "le", "les", "m'", "m'", 
        "-on", "-le", "-moi", "-lui", "-toi", "-les", "-le-moi",
        "toi", "l'", "l'", "-ça", "z'", "nôtre"
    }
    
    # Check if it's invalid
    if pronoun in invalid_pronouns or pronoun.startswith('-') and pronoun not in contraction_map:
        return "INVALID"
    
    # Return if valid, otherwise mark as invalid
    return pronoun if pronoun in valid_pronouns else "INVALID"

def create_comprehensive_dataframe(original_df, sentences_data, verbs_data, conjugations_data):
    """Create a comprehensive dataframe combining all data for exploration."""
    print("Creating comprehensive dataframe for exploration...")
    
    # Start with original dataframe
    combined_df = original_df.copy()
    
    # Add validation status columns
    combined_df['validation_status'] = 'failed'
    combined_df['generated_sentence_idx'] = None
    combined_df['validated_verb'] = None
    combined_df['validated_tense'] = None
    combined_df['validated_pronoun'] = None
    combined_df['validated_verb_form'] = None
    
    # Create lookup for successful sentences
    sentence_lookup = {}
    for idx, sentence in enumerate(sentences_data):
        # Create a key to match against original data
        key = (sentence['verb'], sentence['sentence'], sentence.get('translation', ''))
        sentence_lookup[key] = {
            'sentence_idx': idx,
            'validated_verb': sentence['verb'],
            'validated_tense': sentence['tense'], 
            'validated_pronoun': normalize_pronoun(sentence['pronoun']),
            'validated_verb_form': sentence['verb_form']
        }
    # Match original rows with generated sentences
    successful_matches = 0
    for idx, row in combined_df.iterrows():
        if pd.notna(row.get('main_verb_lemma')) and pd.notna(row.get('fr')):
            key = (str(row['main_verb_lemma']).strip(), 
                   str(row['fr']).strip(), 
                   str(row.get('en', '')).strip())
            
            if key in sentence_lookup:
                match_data = sentence_lookup[key]
                # Only mark as passed if pronoun is valid
                if match_data.get('validated_pronoun') != 'INVALID':
                    combined_df.loc[idx, 'validation_status'] = 'passed'
                    combined_df.loc[idx, 'generated_sentence_idx'] = match_data['sentence_idx']
                    combined_df.loc[idx, 'validated_verb'] = match_data['validated_verb']
                    combined_df.loc[idx, 'validated_tense'] = match_data['validated_tense']
                    combined_df.loc[idx, 'validated_pronoun'] = match_data['validated_pronoun']
                    combined_df.loc[idx, 'validated_verb_form'] = match_data['validated_verb_form']
                    successful_matches += 1
                else:
                    # Keep as 'failed' for invalid pronouns
                    combined_df.loc[idx, 'validated_pronoun'] = match_data['validated_pronoun']
    
    # Add verb frequency data
    verb_freq_lookup = {verb_data['infinitive']: verb_data for verb_data in verbs_data}
    combined_df['verb_frequency_category'] = combined_df['main_verb_lemma'].map(
        lambda x: verb_freq_lookup.get(str(x).strip(), {}).get('frequency', 'unknown') if pd.notna(x) else 'unknown'
    )
    combined_df['verb_usage_count'] = combined_df['main_verb_lemma'].map(
        lambda x: verb_freq_lookup.get(str(x).strip(), {}).get('usage_count', 0) if pd.notna(x) else 0
    )
    
    print(f"Successfully matched {successful_matches} sentences")
    print(f"Comprehensive dataframe shape: {combined_df.shape}")
    
    # Save to multiple formats for exploration
    csv_file = "comprehensive_dataset.csv" 
    pickle_file = "comprehensive_dataset.pkl"
    
    print(f"Saving comprehensive dataframe to {csv_file} and {pickle_file}...")
    combined_df.to_csv(csv_file, index=False, encoding='utf-8')
    combined_df.to_pickle(pickle_file)
    
    # Print summary statistics
    print(f"\nComprehensive Dataset Summary:")
    print(f"  Total rows: {len(combined_df)}")
    print(f"  Validation status distribution:")
    print(combined_df['validation_status'].value_counts().to_string())
    print(f"\n  Verb frequency categories:")
    print(combined_df['verb_frequency_category'].value_counts().to_string())
    

    print("removing rows without validated_tense")
    failed_df = combined_df[combined_df['validation_status'] == 'failed']
    combined_df = combined_df[combined_df['validated_tense'].notna()].reset_index(drop=True)
    
    return combined_df,failed_df

# IMPORTANT LIMITATIONS OF CONJUGATION DATA AND VALIDATION:
#
# 1. COMPOUND TENSES - AUXILIARY VERB VARIATIONS:
#    The conjugation data (from verbecc) uses standard auxiliary patterns:
#    - Most verbs use AVOIR: "j'ai mangé", "j'ai vu", "j'ai apparu"  
#    - Movement verbs use ÊTRE: "je suis allé", "je suis parti"
#    
#    However, real French has more complexity:
#    - Some verbs can use EITHER auxiliary depending on context:
#      * "apparaître" usually uses avoir: "il a apparu" 
#      * But can use être in certain contexts: "il est apparu" (appeared/seemed)
#    - Pronominal/reflexive verbs always use être: "je me suis lavé"
#    - Passive constructions use être: "il est mangé par..."
#
# 2. PAST PARTICIPLE AGREEMENT:
#    The conjugation data doesn't handle gender/number agreement:
#    - Standard: "il a apparu" (masculine singular)
#    - With agreement: "elles sont apparues" (feminine plural)
#    - This causes many valid sentences to be rejected as false negatives
#
# 3. VALIDATION STRATEGY:
#    Current validation only accepts sentences that exactly match the 
#    conjugation table patterns. This is conservative but misses many
#    valid French constructions.
#
# TODO: Consider expanding validation to handle:
#    - Alternative auxiliary verbs (être/avoir variations)
#    - Past participle agreement patterns
#    - Reflexive/pronominal verb constructions

# ...existing code...

def main(safe_mode=True, sentences =[]):
    """Main execution function."""
    print("="*50)
    print("Starting enhanced dataset combination process...")
    if safe_mode:
        print("SAFE MODE: Will not overwrite existing files")
    print("="*50)
    
    # # Load phrases dataframe
    # pickle_path = "verb_analysis_results_120000.pkl"
    pickle_path_tpl = 'verb_analysis_results_chunks_size10000_chunknum_*.pkl'
    pickle_files = sorted(Path(".").glob(pickle_path_tpl))
    # pickle_path = pickle_path.pkl'
    print("Loading phrases from pickle files:", pickle_files)
    dfs = []    
    for pickle_path in pickle_files:
        if not Path(pickle_path).exists():
            print(f"Error: Pickle file {pickle_path} not found!")
            # print("Available pickle files:")
            # for f in Path(".").glob("*.pickle"):
            #     print(f"  - {f}")
            return
        df0 = load_phrases_dataframe(pickle_path)
        dfs.append(df0)
    df = pd.concat(dfs, ignore_index=True)
    print(f"Loaded {len(df)} phrases")
    
    
    
    # Generate conjugation data FIRST (needed for validation)
    conjugations_data = {}
    if VERBECC_AVAILABLE:
        print("Generating conjugation data for validation...")
        conjugations_data = generate_conjugation_data()
    else:
        print("Warning: Skipping verb form validation (verbecc not available)")
    
    # Process phrases for sentences WITH validation (limit to 5 per source per combination)
    if sentences:
        df = df[df['fr'].isin(set(sentences))].reset_index(drop=True)
    sentences_data = process_phrases_for_sentences(df, conjugations_data, max_per_source=5,filter_sentences=sentences)
    # Analyze sentence distribution
    analyze_sentence_distribution(sentences_data)
    
    # Generate verb data based on actual usage in sentences
    verbs_data = generate_verbs_data(sentences_data)
    
    # Create comprehensive dataframe for exploration
    comprehensive_df = create_comprehensive_dataframe(df, sentences_data, verbs_data, conjugations_data)
    
    # Write JavaScript files
    sentences_data_clean = [s for s in sentences_data if s['is_valid']]
    write_javascript_files(verbs_data, sentences_data_clean, conjugations_data)
    
    # # Create comprehensive dataframe for exploration
    # create_comprehensive_dataframe(df, sentences_data, verbs_data, conjugations_data)
    
    print("\n" + "="*50)
    print("Dataset combination complete!")
    print("="*50)
    return comprehensive_df, sentences_data, verbs_data, conjugations_data

if __name__ == "__main__":
    import sys
    
    # Check for command line arguments
    force_regen = "--force-regen" in sys.argv
    
    if force_regen:
        print("Force regeneration mode: will recreate conjugation cache")
        # Remove existing cache file
        cache_file = Path("conjugation_cache.json")
        if cache_file.exists():
            cache_file.unlink()
            print("Removed existing conjugation cache")
    
    # Run in safe mode by default to avoid overwriting files
    main(safe_mode=True, sentences= [])
