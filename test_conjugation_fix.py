#!/usr/bin/env python3
"""
Fixed conjugation generation based on actual verbecc structure
"""

def create_proper_conjugation_data():
    """Create properly structured conjugation data matching the app's expectations"""
    from verbecc.conjugator import Conjugator
    import json
    
    conjugator = Conjugator(lang="fr")
    all_verbs = sorted(set(conjugator.get_infinitives()))
    
    # Map verbecc structure to app structure
    MOOD_TENSE_MAPPING = {
        ('indicatif', 'présent'): 'present',
        ('indicatif', 'imparfait'): 'imparfait', 
        ('indicatif', 'futur-simple'): 'futurSimple',
        ('indicatif', 'passé-composé'): 'passeCompose',
        ('indicatif', 'plus-que-parfait'): 'plusQueParfait',
        ('conditionnel', 'présent'): 'conditionnelPresent',
        ('subjonctif', 'présent'): 'subjonctifPresent'
    }
    
    # Pronoun order from verbecc (arrays are in this order)
    PRONOUN_ORDER = ["je", "tu", "il/elle/on", "nous", "vous", "ils/elles"]
    
    tenses = {}
    processed = 0
    
    # Initialize tense structure
    for app_tense in MOOD_TENSE_MAPPING.values():
        tenses[app_tense] = {}
    
    for verb in all_verbs[:20]:  # Test with first 20 verbs
        if processed % 5 == 0:
            print(f"Processing: {verb}")
        
        try:
            conj_data = conjugator.conjugate(verb)
            moods = conj_data.get('moods', {})
            
            # Process each mood and tense
            for (mood_key, tense_key), app_tense in MOOD_TENSE_MAPPING.items():
                if mood_key in moods and tense_key in moods[mood_key]:
                    conjugation_array = moods[mood_key][tense_key]
                    
                    # Create pronoun -> conjugation mapping
                    verb_conjugations = {}
                    for i, pronoun in enumerate(PRONOUN_ORDER):
                        if i < len(conjugation_array):
                            # Clean up the conjugation (remove "que " from subjunctive etc.)
                            conj = conjugation_array[i]
                            if conj.startswith('que '):
                                conj = conj[4:]  # Remove "que "
                            elif conj.startswith("qu'"):
                                conj = conj[3:]  # Remove "qu'"
                            verb_conjugations[pronoun] = conj
                        else:
                            verb_conjugations[pronoun] = ""
                    
                    tenses[app_tense][verb] = verb_conjugations
                else:
                    # If tense not available, create empty entries
                    tenses[app_tense][verb] = {p: "" for p in PRONOUN_ORDER}
        
        except Exception as e:
            print(f"Error processing {verb}: {e}")
            # Create empty entries for all tenses
            for app_tense in MOOD_TENSE_MAPPING.values():
                tenses[app_tense][verb] = {p: "" for p in PRONOUN_ORDER}
        
        processed += 1
    
    print(f"Generated conjugations for {processed} verbs across {len(tenses)} tenses")
    
    # Test the structure
    print("\nTesting structure:")
    print(f"Tenses: {list(tenses.keys())}")
    if 'present' in tenses and 'être' in tenses['present']:
        print(f"être present: {tenses['present']['être']}")
    
    return tenses

if __name__ == "__main__":
    result = create_proper_conjugation_data()
