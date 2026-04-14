#!/usr/bin/env python3
"""
Mismatch Detection Function for Verb Conjugations in Sentences

This function detects cases where the verb form in a sentence doesn't match 
what verbecc conjugation tables say it should be for the given verb+tense+pronoun.
"""

import json
from collections import defaultdict, Counter
from typing import Dict, List, Tuple, Set

def build_reverse_conjugation_lookup(conjugation_data: Dict) -> Dict[str, List[Dict]]:
    """
    Build a reverse lookup: conjugated_form -> list of possible (verb, tense, pronoun)
    
    Args:
        conjugation_data: The tenses data from verbecc (like what gets put in verbs.full.js)
    
    Returns:
        Dict mapping conjugated forms to possible verb combinations
    """
    reverse_lookup = defaultdict(list)
    
    for tense_name, tense_data in conjugation_data.items():
        for verb_infinitive, pronoun_conjugations in tense_data.items():
            for pronoun, conjugated_form in pronoun_conjugations.items():
                if conjugated_form and conjugated_form.strip():
                    # Extract just the verb part (remove pronoun prefix)
                    verb_part = conjugated_form.strip()
                    # Remove common pronoun prefixes like "j'", "tu ", "il ", "nous ", etc.
                    prefixes_to_remove = ["j'", "tu ", "il ", "elle ", "on ", "nous ", "vous ", "ils ", "elles "]
                    for prefix in prefixes_to_remove:
                        if verb_part.startswith(prefix):
                            verb_part = verb_part[len(prefix):]
                            break
                    
                    # Normalize the form (lowercase, strip)
                    normalized_form = verb_part.strip().lower()
                    
                    reverse_lookup[normalized_form].append({
                        'verb': verb_infinitive,
                        'tense': tense_name, 
                        'pronoun': pronoun,
                        'original_form': conjugated_form
                    })
    
    return dict(reverse_lookup)

def detect_verb_form_mismatches(sentences_data: List[Dict], conjugation_data: Dict) -> List[Dict]:
    """
    Detect sentences where the verb_form doesn't match the claimed verb+tense+pronoun.
    
    Args:
        sentences_data: List of sentence dictionaries with verb, tense, pronoun, verb_form fields
        conjugation_data: Tenses data from verbecc
    
    Returns:
        List of mismatch records with details
    """
    print("Building reverse conjugation lookup...")
    reverse_lookup = build_reverse_conjugation_lookup(conjugation_data)
    
    print(f"Built reverse lookup with {len(reverse_lookup)} unique conjugated forms")
    print("Sample lookup entries:")
    for form, candidates in list(reverse_lookup.items())[:5]:
        print(f"  '{form}' -> {len(candidates)} possibilities: {candidates[0]['verb']}...")
    
    print(f"Analyzing {len(sentences_data)} sentences for mismatches...")
    
    mismatches = []
    stats = {
        'total_analyzed': 0,
        'form_not_in_lookup': 0,
        'claimed_verb_not_in_candidates': 0,
        'tense_mismatch': 0,
        'pronoun_mismatch': 0,
        'multiple_issues': 0,
        'perfect_matches': 0
    }
    
    for i, sentence in enumerate(sentences_data):
        if i % 1000 == 0:
            print(f"  Analyzed {i}/{len(sentences_data)} sentences...")
        
        stats['total_analyzed'] += 1
        
        # Extract fields
        claimed_verb = sentence.get('verb', '').strip()
        claimed_tense = sentence.get('tense', '').strip()
        claimed_pronoun = sentence.get('pronoun', '').strip()
        verb_form = sentence.get('verb_form', '').strip()
        sentence_text = sentence.get('sentence', '').strip()
        
        if not all([claimed_verb, claimed_tense, claimed_pronoun, verb_form]):
            continue  # Skip incomplete data
        
        # Normalize verb form for lookup
        normalized_form = verb_form.lower()
        
        # Check if this verb form exists in our conjugation tables
        if normalized_form not in reverse_lookup:
            stats['form_not_in_lookup'] += 1
            mismatches.append({
                'type': 'form_not_in_lookup',
                'sentence': sentence_text,
                'claimed_verb': claimed_verb,
                'claimed_tense': claimed_tense, 
                'claimed_pronoun': claimed_pronoun,
                'verb_form': verb_form,
                'issue': f"Verb form '{verb_form}' not found in conjugation tables"
            })
            continue
        
        # Get all possible verb combinations for this form
        candidates = reverse_lookup[normalized_form]
        
        # Check if claimed verb is among the candidates
        matching_candidates = [c for c in candidates if c['verb'] == claimed_verb]
        
        if not matching_candidates:
            stats['claimed_verb_not_in_candidates'] += 1
            actual_verbs = list(set(c['verb'] for c in candidates))
            mismatches.append({
                'type': 'wrong_verb',
                'sentence': sentence_text,
                'claimed_verb': claimed_verb,
                'claimed_tense': claimed_tense,
                'claimed_pronoun': claimed_pronoun, 
                'verb_form': verb_form,
                'actual_candidates': actual_verbs,
                'issue': f"'{verb_form}' comes from {actual_verbs}, not '{claimed_verb}'"
            })
            continue
        
        # Check tense and pronoun matches within the correct verb
        perfect_match = any(
            c['tense'] == claimed_tense and c['pronoun'] == claimed_pronoun 
            for c in matching_candidates
        )
        
        if perfect_match:
            stats['perfect_matches'] += 1
        else:
            # Identify specific mismatches
            issues = []
            tense_matches = [c for c in matching_candidates if c['tense'] == claimed_tense]
            pronoun_matches = [c for c in matching_candidates if c['pronoun'] == claimed_pronoun]
            
            if not tense_matches:
                stats['tense_mismatch'] += 1
                actual_tenses = list(set(c['tense'] for c in matching_candidates))
                issues.append(f"Tense should be {actual_tenses}, not '{claimed_tense}'")
            
            if not pronoun_matches:
                stats['pronoun_mismatch'] += 1
                actual_pronouns = list(set(c['pronoun'] for c in matching_candidates))
                issues.append(f"Pronoun should be {actual_pronouns}, not '{claimed_pronoun}'")
            
            if len(issues) > 1:
                stats['multiple_issues'] += 1
            
            mismatches.append({
                'type': 'tense_or_pronoun_mismatch',
                'sentence': sentence_text,
                'claimed_verb': claimed_verb,
                'claimed_tense': claimed_tense,
                'claimed_pronoun': claimed_pronoun,
                'verb_form': verb_form,
                'matching_candidates': matching_candidates,
                'issues': issues
            })
    
    print(f"\nMismatch Analysis Complete!")
    print(f"Statistics:")
    for key, value in stats.items():
        percentage = (value / stats['total_analyzed']) * 100 if stats['total_analyzed'] > 0 else 0
        print(f"  {key}: {value} ({percentage:.1f}%)")
    
    return mismatches

def analyze_collision_verbs(reverse_lookup: Dict[str, List[Dict]]) -> Dict:
    """
    Analyze which verb forms appear for multiple different verbs (collisions).
    """
    collisions = {}
    collision_stats = Counter()
    
    for form, candidates in reverse_lookup.items():
        unique_verbs = set(c['verb'] for c in candidates)
        if len(unique_verbs) > 1:
            collisions[form] = {
                'verbs': list(unique_verbs),
                'candidates': candidates
            }
            collision_stats[len(unique_verbs)] += 1
    
    print(f"\nCollision Analysis:")
    print(f"Total forms with collisions: {len(collisions)}")
    for num_verbs, count in sorted(collision_stats.items()):
        print(f"  Forms shared by {num_verbs} verbs: {count}")
    
    print(f"\nMost problematic collisions (shared by most verbs):")
    sorted_collisions = sorted(collisions.items(), 
                              key=lambda x: len(x[1]['verbs']), 
                              reverse=True)
    
    for form, data in sorted_collisions[:10]:
        print(f"  '{form}' -> {len(data['verbs'])} verbs: {', '.join(data['verbs'])}")
    
    return collisions

# Example usage function
def run_mismatch_analysis(conjugation_file: str, sentences_file: str):
    """
    Run the complete mismatch analysis on your data files.
    """
    print("Loading conjugation data...")
    with open(conjugation_file, 'r', encoding='utf-8') as f:
        conjugation_data = json.load(f)
    
    print("Loading sentences data...")
    sentences_data = []
    with open(sentences_file, 'r', encoding='utf-8') as f:
        for line in f:
            sentences_data.append(json.loads(line.strip()))
    
    # Build reverse lookup and analyze collisions
    reverse_lookup = build_reverse_conjugation_lookup(conjugation_data)
    collisions = analyze_collision_verbs(reverse_lookup)
    
    # Detect mismatches
    mismatches = detect_verb_form_mismatches(sentences_data, conjugation_data)
    
    print(f"\nFound {len(mismatches)} mismatches")
    
    # Show some examples
    if mismatches:
        print(f"\nExample mismatches:")
        for mismatch in mismatches[:5]:
            print(f"  Type: {mismatch['type']}")
            print(f"  Sentence: {mismatch['sentence'][:80]}...")
            print(f"  Issue: {mismatch['issue']}")
            print()
    
    return {
        'mismatches': mismatches,
        'collisions': collisions,
        'reverse_lookup': reverse_lookup
    }

if __name__ == "__main__":
    # Example: Run analysis if you have the data files
    # results = run_mismatch_analysis('conjugation_cache.json', 'sentences.json')
    print("Use run_mismatch_analysis(conjugation_file, sentences_file) to analyze your data")
