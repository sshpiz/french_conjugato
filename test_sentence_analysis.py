#!/usr/bin/env python3

import stanza
from extract_verbs_from_phrases import extract_stanza_verb_info, parse_verb_structure

def test_sentence():
    # Initialize Stanza with French
    print("Loading Stanza French pipeline...")
    nlp = stanza.Pipeline('fr', processors='tokenize,pos,lemma,depparse')
    
    # Test sentence
    sentence = "Vont-ils l'élire pour un nouveau mandat de quatre ans ?"
    print(f"\nAnalyzing sentence: {sentence}")
    print("=" * 50)
    
    # Get detailed structure
    structure = parse_verb_structure(sentence, nlp)
    
    print("MAIN VERB INFO:")
    print(f"  Main verb: {structure.get('main_verb')}")
    print(f"  Main verb lemma: {structure.get('main_verb_lemma')}")
    print(f"  Main verb tense: {structure.get('main_verb_tense')}")
    print(f"  Main verb feats: {structure.get('main_verb_feats')}")
    
    print(f"\nAUXILIARY VERB INFO:")
    print(f"  Auxiliary: {structure.get('auxiliary_verb')}")
    print(f"  Auxiliary lemma: {structure.get('auxiliary_verb_lemma')}")
    print(f"  Auxiliary feats: {structure.get('auxiliary_verb_feats')}")
    
    print(f"\nPRONOUN INFO:")
    print(f"  Pronoun: {structure.get('pronoun')}")
    
    print(f"\nFULL TOKEN ANALYSIS:")
    for token in structure['full_structure']:
        print(f"  {token['text']:10} | {token['lemma']:10} | {token['upos']:6} | {token.get('feats', 'None'):30}")
    
    # Also test the original extract function
    print(f"\nORIGINAL EXTRACT FUNCTION:")
    verb_info = extract_stanza_verb_info(sentence, nlp)
    if verb_info:
        print(f"  Verb lemma: {verb_info['verb_lemma']}")
        print(f"  Verb form: {verb_info['verb_form']}")
        print(f"  Morph: {verb_info['morph']}")
    else:
        print("  No verb found")

if __name__ == "__main__":
    test_sentence()
