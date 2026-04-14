#!/usr/bin/env python3
"""
Script to detect and filter language mix-ups in bilingual datasets.
Identifies cases where French and English are swapped or mixed.
"""

import pandas as pd
import pickle
import re
import json
from collections import Counter
from pathlib import Path

def simple_language_detection(text):
    """
    Simple heuristic-based language detection for French vs English.
    Returns 'fr', 'en', or 'mixed' based on characteristic patterns.
    """
    if not text or pd.isna(text):
        return 'unknown'
    
    text = str(text).lower()
    
    # Common French indicators
    french_indicators = [
        r'\ble\b', r'\bla\b', r'\bles\b', r'\bdes\b', r'\bun\b', r'\bune\b',
        r'\bdu\b', r'\bde\b', r'\bdans\b', r'\bavec\b', r'\bpour\b', r'\bpar\b',
        r'\bque\b', r'\bqui\b', r'\bquoi\b', r'\bcomment\b', r'\bpourquoi\b',
        r'\bje\b', r'\btu\b', r'\bil\b', r'\belle\b', r'\bnous\b', r'\bvous\b',
        r'\bils\b', r'\belles\b', r'\bon\b', r'\bce\b', r'\bcette\b', r'\bces\b',
        r'\bmon\b', r'\bma\b', r'\bmes\b', r'\bton\b', r'\bta\b', r'\btes\b',
        r'\bson\b', r'\bsa\b', r'\bses\b', r'\bnotre\b', r'\bvotre\b', r'\bleur\b',
        r'\best\b', r'\bsont\b', r'\bétait\b', r'\bétaient\b', r'\bsera\b', r'\bseront\b',
        r'\bà\b', r'\bça\b', r'\bc\'est\b', r'\bs\'est\b', r'\bn\'est\b'
    ]
    
    # Common English indicators  
    english_indicators = [
        r'\bthe\b', r'\ba\b', r'\ban\b', r'\band\b', r'\bor\b', r'\bbut\b',
        r'\bof\b', r'\bin\b', r'\bon\b', r'\bat\b', r'\bto\b', r'\bfor\b',
        r'\bwith\b', r'\bby\b', r'\bfrom\b', r'\babout\b', r'\binto\b',
        r'\bthat\b', r'\bthis\b', r'\bthese\b', r'\bthose\b', r'\bwhat\b',
        r'\bwho\b', r'\bwhen\b', r'\bwhere\b', r'\bwhy\b', r'\bhow\b',
        r'\bi\b', r'\byou\b', r'\bhe\b', r'\bshe\b', r'\bit\b', r'\bwe\b', r'\bthey\b',
        r'\bis\b', r'\bare\b', r'\bwas\b', r'\bwere\b', r'\bwill\b', r'\bwould\b',
        r'\bhave\b', r'\bhas\b', r'\bhad\b', r'\bdo\b', r'\bdoes\b', r'\bdid\b'
    ]
    
    # Count matches
    french_score = sum(1 for pattern in french_indicators if re.search(pattern, text))
    english_score = sum(1 for pattern in english_indicators if re.search(pattern, text))
    
    # French-specific characters
    if re.search(r'[àâäéèêëîïôöùûüÿç]', text):
        french_score += 2
    
    # English-specific patterns
    if re.search(r'\b\w+ing\b', text):  # -ing endings
        english_score += 1
    if re.search(r'\b\w+ed\b', text):   # -ed endings
        english_score += 1
    if re.search(r'\b\w+tion\b', text): # -tion endings (though French has these too)
        english_score += 0.5
    
    # Determine language
    if french_score > english_score * 1.5:
        return 'fr'
    elif english_score > french_score * 1.5:
        return 'en'
    elif french_score > 0 and english_score > 0:
        return 'mixed'
    else:
        return 'unknown'

def detect_language_mixups(pickle_path):
    """Detect language mix-ups in the dataset."""
    print("="*60)
    print("LANGUAGE MIX-UP DETECTION")
    print("="*60)
    
    with open(pickle_path, 'rb') as f:
        df = pickle.load(f)
    
    print(f"Analyzing {len(df)} phrases...")
    
    # Detect languages
    df['detected_fr'] = df['fr'].apply(simple_language_detection)
    df['detected_en'] = df['en'].apply(simple_language_detection)
    
    # Find mix-ups
    french_not_french = df[df['detected_fr'] != 'fr']
    english_not_english = df[df['detected_en'] != 'en']
    
    # Swapped languages (French text in English column and vice versa)
    swapped = df[(df['detected_fr'] == 'en') & (df['detected_en'] == 'fr')]
    
    print(f"\nRESULTS:")
    print(f"French column language detection:")
    print(df['detected_fr'].value_counts())
    print(f"\nEnglish column language detection:")
    print(df['detected_en'].value_counts())
    
    print(f"\nPROBLEMATIC ROWS:")
    print(f"French column not French: {len(french_not_french)}")
    print(f"English column not English: {len(english_not_english)}")
    print(f"Likely swapped languages: {len(swapped)}")
    
    if len(swapped) > 0:
        print(f"\nALL SWAPPED ROWS (will be corrected):")
        for idx, row in swapped.iterrows():
            print(f"Row {idx}:")
            print(f"  BEFORE - FR: '{row['fr'][:80]}...'")
            print(f"  BEFORE - EN: '{row['en'][:80]}...'")
            print(f"  AFTER  - FR: '{row['en'][:80]}...' (swapped)")
            print(f"  AFTER  - EN: '{row['fr'][:80]}...' (swapped)")
            print()
    else:
        print("No clearly swapped languages detected.")
    
    if len(french_not_french) > len(swapped):
        print(f"\nSAMPLE NON-FRENCH IN FRENCH COLUMN:")
        non_swapped_fr = french_not_french[~french_not_french.index.isin(swapped.index)]
        for idx, row in non_swapped_fr.head(3).iterrows():
            print(f"Row {idx} (detected as {row['detected_fr']}):")
            print(f"  FR: '{row['fr'][:60]}...'")
            print(f"  EN: '{row['en'][:60]}...'")
            print()
    
    return df, swapped, french_not_french, english_not_english

def create_corrected_dataset(df, swapped_indices, output_path=None):
    """Create a corrected version of the dataset with swapped languages fixed."""
    if output_path is None:
        # Create output filename based on input
        base_name = "test100_processed_dataframe"
        output_path = f"{base_name}_corrected.pickle"
    
    print(f"\nCREATING CORRECTED DATASET:")
    
    # Make a copy of the dataframe
    corrected_df = df.copy()
    
    # Fix swapped languages
    if len(swapped_indices) > 0:
        print(f"Correcting {len(swapped_indices)} swapped language pairs...")
        for idx in swapped_indices:
            # Swap the French and English columns
            original_fr = corrected_df.at[idx, 'fr']
            original_en = corrected_df.at[idx, 'en']
            corrected_df.at[idx, 'fr'] = original_en
            corrected_df.at[idx, 'en'] = original_fr
            print(f"  Fixed row {idx}: swapped FR ↔ EN")
    
    # Remove the detection columns if they exist
    if 'detected_fr' in corrected_df.columns:
        corrected_df = corrected_df.drop(['detected_fr', 'detected_en'], axis=1)
    
    print(f"Original dataset: {len(df)} rows")
    print(f"Corrected dataset: {len(corrected_df)} rows")
    print(f"Swapped corrections: {len(swapped_indices)} rows")
    
    # Save corrected dataset
    with open(output_path, 'wb') as f:
        pickle.dump(corrected_df, f)
    
    print(f"Saved corrected dataset to {output_path}")
    return corrected_df

def create_cleaned_dataset_and_save_problematic(df, output_path="cleaned_dataset.pickle", 
                                              problematic_jsonl="to_be_fixed.jsonl"):
    """
    Create a cleaned version of the dataset and save problematic rows to JSONL for reprocessing.
    
    Args:
        df: DataFrame with language detection columns
        output_path: Path for cleaned pickle file  
        problematic_jsonl: Path for JSONL file with rows to be fixed
    """
    print(f"\nCREATING CLEANED DATASET AND EXTRACTING PROBLEMATIC ROWS:")
    
    # Identify clean rows (good language detection)
    clean_mask = (df['detected_fr'] == 'fr') & (df['detected_en'] == 'en')
    clean_df = df[clean_mask].copy()
    
    # Identify problematic rows that need reprocessing
    problematic_mask = ~clean_mask
    problematic_df = df[problematic_mask].copy()
    
    print(f"Original dataset: {len(df)} rows")
    print(f"Clean dataset: {len(clean_df)} rows")
    print(f"Problematic rows to fix: {len(problematic_df)} rows ({len(problematic_df)/len(df)*100:.1f}%)")
    
    # Analyze problematic rows
    if len(problematic_df) > 0:
        print(f"\nProblematic row breakdown:")
        prob_fr_detected = problematic_df['detected_fr'].value_counts()
        prob_en_detected = problematic_df['detected_en'].value_counts()
        print(f"  French column detection: {dict(prob_fr_detected)}")
        print(f"  English column detection: {dict(prob_en_detected)}")
        
        # Show sample problematic rows
        print(f"\nSample problematic rows (first 3):")
        for idx, row in problematic_df.head(3).iterrows():
            print(f"  Row {idx}: FR detected as '{row['detected_fr']}', EN detected as '{row['detected_en']}'")
            print(f"    FR: '{str(row['fr'])[:60]}...'")
            print(f"    EN: '{str(row['en'])[:60]}...'")
            print()
    
    # Save clean dataset (remove detection columns first)
    clean_df_final = clean_df.drop(['detected_fr', 'detected_en'], axis=1)
    with open(output_path, 'wb') as f:
        pickle.dump(clean_df_final, f)
    print(f"✓ Saved clean dataset to {output_path}")
    
    # Save problematic rows to JSONL for reprocessing
    if len(problematic_df) > 0:
        # Check if JSONL file exists to decide whether to append
        jsonl_path = Path(problematic_jsonl)
        mode = 'a' if jsonl_path.exists() else 'w'
        
        with open(problematic_jsonl, mode, encoding='utf-8') as f:
            for idx, row in problematic_df.iterrows():
                # Create a record for reprocessing - only keep the essential text data
                record = {
                    'original_index': int(idx),
                    'fr': str(row['fr']),
                    'en': str(row['en']),
                    'source': str(row.get('source', '')),
                    'issue_type': f"FR_detected_as_{row['detected_fr']}_EN_detected_as_{row['detected_en']}",
                    'needs_reprocessing': True,
                    'extraction_status': 'pending'
                }
                f.write(json.dumps(record, ensure_ascii=False) + '\n')
        
        print(f"✓ Saved {len(problematic_df)} problematic rows to {problematic_jsonl}")
        if mode == 'a':
            print(f"  (Appended to existing file)")
        
        print(f"\nThese rows need to be reprocessed with extract_verbs_from_phrases.py")
        print(f"They contain language detection issues that make the linguistic analysis unreliable.")
    
    return clean_df_final, problematic_df

if __name__ == "__main__":
    df, swapped, fr_issues, en_issues = detect_language_mixups("test100_processed_dataframe.pickle")
    
    # Create corrected dataset (fixes swapped languages)
    corrected_df = create_corrected_dataset(df, swapped.index)
    
    # Create cleaned dataset and extract problematic rows
    clean_df, problematic_df = create_cleaned_dataset_and_save_problematic(
        df, 
        output_path="test100_processed_dataframe_cleaned.pickle",
        problematic_jsonl="to_be_fixed.jsonl"
    )
    
    print("\n" + "="*60)
    print("SUMMARY:")
    print("="*60)
    print(f"✓ Created corrected dataset with {len(swapped)} language swaps fixed")
    print(f"✓ Created cleaned dataset with {len(clean_df)} valid rows")
    print(f"✓ Extracted {len(problematic_df)} problematic rows to to_be_fixed.jsonl")
    print(f"\nFiles created:")
    print(f"  - test100_processed_dataframe_corrected.pickle (swaps fixed)")
    print(f"  - test100_processed_dataframe_cleaned.pickle (clean rows only)")
    print(f"  - to_be_fixed.jsonl (rows needing reprocessing)")
    print(f"\nNext steps:")
    print(f"  1. Use test100_processed_dataframe_cleaned.pickle for your JS generation")
    print(f"  2. Reprocess to_be_fixed.jsonl with extract_verbs_from_phrases.py later")

