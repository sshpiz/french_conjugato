#!/usr/bin/env python3
"""
Analyze collision cases from the sentences backup file.
"""
import json
import re
from collections import defaultdict

def extract_sentences_from_js(js_file, max_entries=1000):
    """Extract first N sentences from JavaScript file."""
    sentences = []
    
    with open(js_file, 'r', encoding='utf-8') as f:
        in_sentences = False
        entry_buffer = ""
        brace_count = 0
        
        for line in f:
            if 'const sentences = [' in line:
                in_sentences = True
                continue
            
            if not in_sentences:
                continue
                
            # Stop if we've reached the end or our max
            if line.strip() == '];' or len(sentences) >= max_entries:
                break
            
            entry_buffer += line
            
            # Count braces to find complete entries
            brace_count += line.count('{') - line.count('}')
            
            # If we have a complete entry (brace_count == 0 and we have content)
            if brace_count == 0 and entry_buffer.strip():
                # Remove trailing comma and whitespace
                entry_text = entry_buffer.strip().rstrip(',')
                if entry_text:
                    try:
                        entry = json.loads(entry_text)
                        sentences.append(entry)
                    except json.JSONDecodeError:
                        pass  # Skip malformed entries
                entry_buffer = ""
    
    return sentences

def analyze_collision_cases(sentences_data, conjugation_file):
    """Find sentences where verb_form has collisions."""
    # Load conjugation data and build reverse lookup
    with open(conjugation_file, 'r', encoding='utf-8') as f:
        conjugation_data = json.load(f)
    
    # Build reverse lookup with pronoun removal
    reverse_lookup = defaultdict(list)
    for tense_name, tense_data in conjugation_data.items():
        for verb_infinitive, pronoun_conjugations in tense_data.items():
            for pronoun, conjugated_form in pronoun_conjugations.items():
                if conjugated_form and conjugated_form.strip():
                    # Extract just the verb part (remove pronoun prefix)
                    verb_part = conjugated_form.strip()
                    prefixes_to_remove = ["j'", "tu ", "il ", "elle ", "on ", "nous ", "vous ", "ils ", "elles "]
                    for prefix in prefixes_to_remove:
                        if verb_part.startswith(prefix):
                            verb_part = verb_part[len(prefix):]
                            break
                    
                    normalized_form = verb_part.strip().lower()
                    reverse_lookup[normalized_form].append({
                        'verb': verb_infinitive,
                        'tense': tense_name, 
                        'pronoun': pronoun,
                        'original_form': conjugated_form
                    })
    
    # Find collision forms (forms that match multiple verbs)
    collision_forms = {form: candidates for form, candidates in reverse_lookup.items() 
                      if len(set(c['verb'] for c in candidates)) > 1}
    
    print(f"Found {len(collision_forms)} collision forms out of {len(reverse_lookup)} total forms")
    
    # Analyze sentences with collision forms
    collision_sentences = []
    for sentence in sentences_data:
        verb_form = sentence.get('verb_form', '').strip().lower()
        if verb_form in collision_forms:
            # Check if the claimed verb matches any of the collision candidates
            claimed_verb = sentence['verb']
            collision_verbs = [c['verb'] for c in collision_forms[verb_form]]
            
            collision_sentences.append({
                'sentence': sentence,
                'verb_form': verb_form,
                'claimed_verb': claimed_verb,
                'collision_verbs': collision_verbs,
                'is_mismatch': claimed_verb not in collision_verbs
            })
    
    return collision_sentences, collision_forms

def main():
    sentences_file = 'sentences.generated.js.backup.20250708_235658'
    conjugation_file = 'conjugation_cache.json'
    
    print("Extracting sentences from JS file...")
    sentences = extract_sentences_from_js(sentences_file)
    print(f"Found {len(sentences)} sentences")
    
    print("\nAnalyzing collision cases...")
    collision_sentences, collision_forms = analyze_collision_cases(sentences, conjugation_file)
    
    print(f"\nFound {len(collision_sentences)} sentences with collision forms")
    
    # Show some example collision forms
    print("\nSample collision forms:")
    for form, candidates in list(collision_forms.items())[:5]:
        verbs = list(set(c['verb'] for c in candidates))
        print(f"  {form}: {verbs}")
    
    # Show some mismatch examples
    mismatches = [s for s in collision_sentences if s['is_mismatch']]
    print(f"\nFound {len(mismatches)} collision mismatches")
    
    print("\nSample mismatch cases:")
    for case in mismatches[:5]:
        print(f"  Form '{case['verb_form']}' claimed as '{case['claimed_verb']}' but could be: {case['collision_verbs']}")
        print(f"    Sentence: {case['sentence']['sentence'][:80]}...")
        print()

if __name__ == "__main__":
    main()
