#!/usr/bin/env python3
"""
Test script to analyze the problematic sentence with Stanza
"""

import stanza

def analyze_sentence_with_stanza(sentence):
    print(f"Analyzing sentence: {sentence}")
    print("=" * 60)
    
    # Initialize Stanza pipeline for French
    nlp = stanza.Pipeline('fr', verbose=False)
    
    # Process the sentence
    doc = nlp(sentence)
    
    print("STANZA ANALYSIS:")
    print("-" * 40)
    
    for sent_idx, sent in enumerate(doc.sentences):
        print(f"Sentence {sent_idx + 1}:")
        for word in sent.words:
            print(f"  {word.text:<12} | {word.lemma:<12} | {word.upos:<8} | {word.feats or 'None'}")
            
    print("\nVERB ANALYSIS:")
    print("-" * 40)
    
    verbs_found = []
    for sent in doc.sentences:
        for word in sent.words:
            if word.upos in ['VERB', 'AUX']:
                verb_info = {
                    'text': word.text,
                    'lemma': word.lemma,
                    'upos': word.upos,
                    'feats': word.feats,
                    'head': word.head,
                    'deprel': word.deprel
                }
                verbs_found.append(verb_info)
                print(f"  VERB: {word.text} -> {word.lemma} ({word.upos})")
                print(f"    Features: {word.feats}")
                print(f"    Dependency: {word.deprel} (head: {word.head})")
                print()
    
    return verbs_found

if __name__ == "__main__":
    # The problematic sentence
    sentence = "Vont-ils l'élire pour un nouveau mandat de quatre ans ?"
    
    try:
        verbs = analyze_sentence_with_stanza(sentence)
        print(f"Found {len(verbs)} verb(s)")
        
        print("\nSUMMARY:")
        print("-" * 40)
        for i, verb in enumerate(verbs, 1):
            print(f"Verb {i}: {verb['text']} -> {verb['lemma']} ({verb['upos']})")
            
    except Exception as e:
        print(f"Error: {e}")
