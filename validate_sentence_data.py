#!/usr/bin/env python3
"""
Validate sentence data against conjugation tables to find mismatches
"""

import json
from collections import defaultdict

def build_reverse_conjugation_lookup(verbs_data):
    """
    Build a reverse lookup: conjugated_form -> list of (verb, tense, pronoun)
    """
    form_to_verbs = defaultdict(list)
    
    for verb_info in verbs_data:
        infinitive = verb_info['infinitive']
        
        # Go through all tenses for this verb
        for tense_name, tense_data in verb_info.get('tenses', {}).items():
            for pronoun, conjugated_form in tense_data.items():
                if conjugated_form and conjugated_form.strip():
                    # Store the form in lowercase for matching
                    key = conjugated_form.lower().strip()
                    form_to_verbs[key].append({
                        'verb': infinitive,
                        'tense': tense_name,
                        'pronoun': pronoun,
                        'form': conjugated_form
                    })
    
    return form_to_verbs

def extract_conjugated_form_from_sentence(sentence_data):
    """
    Extract the conjugated form that should match the verb/tense/pronoun
    This is in the 'verb_form' field from Stanza analysis
    """
    return sentence_data.get('verb_form', '').lower().strip()

def validate_sentence_data(sentences_data, conjugation_lookup):
    """
    Find sentences where the verb_form doesn't match the claimed verb/tense/pronoun
    """
    mismatches = []
    ambiguous_forms = []
    
    for i, sentence in enumerate(sentences_data):
        verb_claimed = sentence.get('verb', '')
        tense_claimed = sentence.get('tense', '')
        pronoun_claimed = sentence.get('pronoun', '')
        verb_form = extract_conjugated_form_from_sentence(sentence)
        sentence_text = sentence.get('sentence', '')
        
        if not verb_form:
            continue
            
        # Look up what verbs could produce this form
        possible_matches = conjugation_lookup.get(verb_form, [])
        
        if len(possible_matches) == 0:
            # Form not found in our conjugation tables
            mismatches.append({
                'type': 'form_not_found',
                'index': i,
                'sentence': sentence_text,
                'claimed': f"{verb_claimed} + {tense_claimed} + {pronoun_claimed}",
                'verb_form': verb_form,
                'issue': f"Form '{verb_form}' not found in conjugation tables"
            })
            continue
            
        if len(possible_matches) > 1:
            # Ambiguous form - multiple verbs could produce it
            ambiguous_forms.append({
                'verb_form': verb_form,
                'possible_matches': possible_matches,
                'sentence_count': 1
            })
        
        # Check if the claimed verb/tense/pronoun is among the valid matches
        valid_match_found = False
        for match in possible_matches:
            # Handle pronoun variations like "ils/elles"
            match_pronouns = match['pronoun'].split('/') if '/' in match['pronoun'] else [match['pronoun']]
            claimed_pronouns = pronoun_claimed.split('/') if '/' in pronoun_claimed else [pronoun_claimed]
            
            pronoun_matches = any(cp in match_pronouns for cp in claimed_pronouns)
            
            if (match['verb'] == verb_claimed and 
                match['tense'] == tense_claimed and 
                pronoun_matches):
                valid_match_found = True
                break
        
        if not valid_match_found:
            mismatches.append({
                'type': 'mismatch',
                'index': i,
                'sentence': sentence_text,
                'claimed': f"{verb_claimed} + {tense_claimed} + {pronoun_claimed}",
                'verb_form': verb_form,
                'valid_matches': possible_matches,
                'issue': f"'{verb_form}' doesn't match claimed verb/tense/pronoun"
            })
    
    return mismatches, ambiguous_forms

def load_data():
    """Load the sentences and verb conjugation data"""
    # Load sentences
    with open('js/sentences.js', 'r', encoding='utf-8') as f:
        # Skip the 'const sentences = ' part and just get the JSON array
        content = f.read()
        start = content.find('[')
        end = content.rfind(']') + 1
        sentences_json = content[start:end]
        sentences_data = json.loads(sentences_json)
    
    # Load verb conjugations (this would need to be extracted from verbs.full.js)
    # For now, let's assume we have it in a similar format
    try:
        with open('verbs_data.json', 'r', encoding='utf-8') as f:
            verbs_data = json.load(f)
    except FileNotFoundError:
        print("Error: Need to extract verb conjugation data first")
        print("Run: node -e \"const verbs = require('./js/verbs.full.js'); console.log(JSON.stringify(verbs, null, 2))\" > verbs_data.json")
        return None, None
    
    return sentences_data, verbs_data

def main():
    sentences_data, verbs_data = load_data()
    if not sentences_data or not verbs_data:
        return
    
    print("Building reverse conjugation lookup...")
    conjugation_lookup = build_reverse_conjugation_lookup(verbs_data)
    
    print(f"Loaded {len(sentences_data)} sentences")
    print(f"Built lookup for {len(conjugation_lookup)} conjugated forms")
    
    print("\nValidating sentences...")
    mismatches, ambiguous_forms = validate_sentence_data(sentences_data, conjugation_lookup)
    
    print(f"\nFound {len(mismatches)} mismatches:")
    print("=" * 60)
    
    for mismatch in mismatches[:10]:  # Show first 10
        print(f"Index {mismatch['index']}:")
        print(f"  Sentence: {mismatch['sentence']}")
        print(f"  Claimed: {mismatch['claimed']}")
        print(f"  Verb form: '{mismatch['verb_form']}'")
        print(f"  Issue: {mismatch['issue']}")
        if 'valid_matches' in mismatch:
            print(f"  Valid matches: {[f\"{m['verb']}+{m['tense']}+{m['pronoun']}\" for m in mismatch['valid_matches'][:3]]}")
        print()
    
    if len(mismatches) > 10:
        print(f"... and {len(mismatches) - 10} more")
    
    # Count ambiguous forms
    ambiguous_count = defaultdict(int)
    for form_info in ambiguous_forms:
        key = form_info['verb_form']
        ambiguous_count[key] += 1
    
    print(f"\nMost ambiguous forms (appear in multiple verbs):")
    print("-" * 40)
    for form, count in sorted(ambiguous_count.items(), key=lambda x: x[1], reverse=True)[:10]:
        matches = conjugation_lookup[form]
        print(f"'{form}': {len(matches)} possible matches - {[f\"{m['verb']}\" for m in matches[:3]]}")

if __name__ == "__main__":
    main()
