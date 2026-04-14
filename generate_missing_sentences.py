#!/usr/bin/env python3
"""
Generate missing sentences using ChatGPT API for verb+tense+pronoun combinations.
"""

import openai
import pandas as pd
import json
import time
import random
import argparse
import os
from tqdm import tqdm
import re
from typing import List, Dict, Any

# Configuration
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
BATCH_SIZE = 5  # Number of combinations per API call
DELAY_BETWEEN_CALLS = 1  # Seconds between API calls
OUTPUT_FILE = "generated_missing_sentences.jsonl"
COST_WARNING_THRESHOLD = 100  # Warn if more than this many rows

# GPT-4 pricing (as of 2024, check current rates)
GPT4_INPUT_COST_PER_1K = 0.03  # $0.03 per 1K input tokens
GPT4_OUTPUT_COST_PER_1K = 0.06  # $0.06 per 1K output tokens

# Initialize OpenAI
if not OPENAI_API_KEY:
    raise RuntimeError("Set OPENAI_API_KEY in the environment before running this script.")
openai.api_key = OPENAI_API_KEY

def estimate_cost(num_combinations: int) -> Dict[str, float]:
    """Estimate the cost of generating sentences for given number of combinations."""
    
    # Estimate tokens per batch
    # Prompt is roughly 400-500 tokens + combinations
    tokens_per_combination_prompt = 50  # Estimated
    base_prompt_tokens = 400
    
    # Response is roughly 100-150 tokens per generated sentence
    tokens_per_combination_response = 120  # Estimated
    
    num_batches = (num_combinations + BATCH_SIZE - 1) // BATCH_SIZE
    
    # Total token estimates
    total_input_tokens = num_batches * (base_prompt_tokens + BATCH_SIZE * tokens_per_combination_prompt)
    total_output_tokens = num_combinations * tokens_per_combination_response
    
    # Cost calculation
    input_cost = (total_input_tokens / 1000) * GPT4_INPUT_COST_PER_1K
    output_cost = (total_output_tokens / 1000) * GPT4_OUTPUT_COST_PER_1K
    total_cost = input_cost + output_cost
    
    return {
        'combinations': num_combinations,
        'batches': num_batches,
        'estimated_input_tokens': total_input_tokens,
        'estimated_output_tokens': total_output_tokens,
        'input_cost': input_cost,
        'output_cost': output_cost, 
        'total_cost': total_cost
    }

def confirm_cost_with_user(cost_info: Dict[str, float]) -> bool:
    """Ask user to confirm if they want to proceed with estimated cost."""
    print(f"\n💰 Cost Estimation:")
    print(f"   📊 Combinations to generate: {cost_info['combinations']:,}")
    print(f"   📦 API batches needed: {cost_info['batches']:,}")
    print(f"   🔤 Estimated input tokens: {cost_info['estimated_input_tokens']:,}")
    print(f"   💬 Estimated output tokens: {cost_info['estimated_output_tokens']:,}")
    print(f"   💵 Input cost: ${cost_info['input_cost']:.3f}")
    print(f"   💵 Output cost: ${cost_info['output_cost']:.3f}")
    print(f"   💵 TOTAL ESTIMATED COST: ${cost_info['total_cost']:.3f}")
    
    if cost_info['total_cost'] > 5.0:
        print(f"   ⚠️  WARNING: This will cost more than $5!")
    
    response = input(f"\n❓ Do you want to proceed? [y/N]: ").strip().lower()
    return response in ['y', 'yes']

def load_dataframe(filename: str = None) -> pd.DataFrame:
    """Load dataframe from file or return sample data."""
    if filename:
        print(f"📂 Loading combinations from {filename}...")
        try:
            df = pd.read_csv(filename)
            print(f"✅ Loaded {len(df)} combinations from file")
            return df
        except FileNotFoundError:
            print(f"❌ Error: File '{filename}' not found!")
            exit(1)
        except Exception as e:
            print(f"❌ Error loading file: {e}")
            exit(1)
    else:
        print("📝 Using sample data (no file specified)...")
        sample_data = [
            {'validated_verb': 'abaisser', 'validated_tense': 'futur_simple', 'validated_pronoun': 'il/elle/on'},
            {'validated_verb': 'abaisser', 'validated_tense': 'futur_simple', 'validated_pronoun': 'ils/elles'},
            {'validated_verb': 'abaisser', 'validated_tense': 'futur_simple', 'validated_pronoun': 'nous'},
            {'validated_verb': 'abandonner', 'validated_tense': 'present', 'validated_pronoun': 'je'},
        ]
        return pd.DataFrame(sample_data)
    """Expand combined pronouns to individual options for generation."""
    if pronoun == "il/elle/on":
        return ["il", "elle", "on"]
    elif pronoun == "ils/elles":
        return ["ils", "elles"] 
    else:
        return [pronoun]

def create_generation_prompt(combinations: List[Dict]) -> str:
    """Create a prompt for generating multiple sentences at once."""
    
    # Tense mapping for clear French instructions
    tense_map = {
        "present": "présent",
        "passe_compose": "passé composé", 
        "imparfait": "imparfait",
        "futur_simple": "futur simple",
        "plus_que_parfait": "plus-que-parfait",
        "conditionnel_present": "conditionnel présent",
        "subjonctif_present": "subjonctif présent"
    }
    
    prompt = """Génère des phrases d'exemple en français pour les combinaisons verbe/temps/pronom suivantes. 
Pour chaque combinaison, crée UNE phrase courte et naturelle (10-15 mots max).
Les phrases doivent être des exemples concrets et quotidiens.
Réponds UNIQUEMENT avec un JSON contenant un array d'objets avec les champs: verb, tense, pronoun, sentence, translation.

Combinaisons à générer:
"""
    
    for i, combo in enumerate(combinations, 1):
        verb = combo['validated_verb']
        tense = combo['validated_tense'] 
        pronoun = combo['validated_pronoun']
        
        # Pick a random pronoun variant for generation
        pronoun_options = pronoun.split('/')
        selected_pronoun = random.choice(pronoun_options)
        
        tense_french = tense_map.get(tense, tense)
        prompt += f"{i}. {verb} au {tense_french} avec {selected_pronoun}\n"
    
    prompt += "\nFormat JSON attendu:\n"
    prompt += """[
  {"verb": "verb1", "tense": "tense1", "pronoun": "pronoun1", "sentence": "phrase française", "translation": "English translation"},
  {"verb": "verb2", "tense": "tense2", "pronoun": "pronoun2", "sentence": "phrase française", "translation": "English translation"}
]"""
    
    return prompt

def call_chatgpt_api(prompt: str, max_retries: int = 3) -> Dict[str, Any]:
    """Call ChatGPT API with retry logic."""
    for attempt in range(max_retries):
        try:
            response = openai.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "Tu es un expert en français qui génère des phrases d'exemple naturelles et courtes."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=1500,
                temperature=0.7
            )
            return {
                "success": True,
                "content": response.choices[0].message.content,
                "usage": response.usage.dict() if response.usage else None
            }
        except Exception as e:
            print(f"API call failed (attempt {attempt + 1}): {e}")
            if attempt < max_retries - 1:
                time.sleep(2 ** attempt)  # Exponential backoff
            else:
                return {"success": False, "error": str(e)}

def parse_api_response(response_content: str) -> List[Dict]:
    """Parse the JSON response from ChatGPT."""
    try:
        # Try to extract JSON from the response
        json_match = re.search(r'\[.*?\]', response_content, re.DOTALL)
        if json_match:
            json_str = json_match.group(0)
            return json.loads(json_str)
        else:
            # Try parsing the whole response as JSON
            return json.loads(response_content)
    except json.JSONDecodeError as e:
        print(f"Failed to parse JSON response: {e}")
        print(f"Response content: {response_content[:200]}...")
        return []

def generate_sentences_batch(df_missing: pd.DataFrame) -> List[Dict]:
    """Generate sentences for all missing combinations in batches."""
    
    # Convert dataframe to list of combinations
    combinations = []
    for _, row in df_missing.iterrows():
        combinations.append({
            'validated_verb': row['validated_verb'],
            'validated_tense': row['validated_tense'], 
            'validated_pronoun': row['validated_pronoun']
        })
    
    print(f"Generating sentences for {len(combinations)} combinations...")
    print(f"Using batch size: {BATCH_SIZE}")
    
    all_generated = []
    total_tokens = 0
    
    # Process in batches
    for i in tqdm(range(0, len(combinations), BATCH_SIZE), desc="Generating batches"):
        batch = combinations[i:i + BATCH_SIZE]
        
        # Create prompt for this batch
        prompt = create_generation_prompt(batch)
        
        # Call API
        print(f"\nProcessing batch {i//BATCH_SIZE + 1} ({len(batch)} combinations)...")
        response = call_chatgpt_api(prompt)
        
        if response["success"]:
            # Parse response
            generated_sentences = parse_api_response(response["content"])
            
            if generated_sentences:
                print(f"✅ Generated {len(generated_sentences)} sentences")
                all_generated.extend(generated_sentences)
                
                # Track token usage
                if response.get("usage"):
                    total_tokens += response["usage"]["total_tokens"]
                    
            else:
                print("❌ Failed to parse response")
                print(f"Raw response: {response['content'][:200]}...")
        else:
            print(f"❌ API call failed: {response.get('error')}")
        
        # Rate limiting
        if i + BATCH_SIZE < len(combinations):
            time.sleep(DELAY_BETWEEN_CALLS)
    
    print(f"\n🎉 Generation complete!")
    print(f"📊 Total sentences generated: {len(all_generated)}")
    print(f"💰 Total tokens used: {total_tokens}")
    
    return all_generated

def save_generated_sentences(sentences: List[Dict], output_file: str):
    """Save generated sentences to JSONL format."""
    with open(output_file, 'w', encoding='utf-8') as f:
        for sentence in sentences:
            # Add generation metadata
            sentence['source'] = 'chatgpt_generated'
            sentence['generated_at'] = pd.Timestamp.now().isoformat()
            f.write(json.dumps(sentence, ensure_ascii=False) + '\n')
    
    print(f"💾 Saved {len(sentences)} sentences to {output_file}")

def main():
    """Main function to run the sentence generation."""
    
    # Update global settings
    global BATCH_SIZE, OUTPUT_FILE
    BATCH_SIZE = args.batch_size
    OUTPUT_FILE = args.output
    
    # Parse command line arguments
    parser = argparse.ArgumentParser(description='Generate missing sentences using ChatGPT API')
    parser.add_argument('--file', '-f', type=str, help='CSV file with missing combinations (columns: validated_verb, validated_tense, validated_pronoun)')
    parser.add_argument('--output', '-o', type=str, default=OUTPUT_FILE, help=f'Output file (default: {OUTPUT_FILE})')
    parser.add_argument('--batch-size', '-b', type=int, default=BATCH_SIZE, help=f'Batch size for API calls (default: {BATCH_SIZE})')
    parser.add_argument('--force', action='store_true', help='Skip cost confirmation prompt')
    
    args = parser.parse_args()
    
    print("🚀 Starting sentence generation...")
    
    # Load combinations dataframe
    df_missing = load_dataframe(args.file)
    
    print(f"📋 Input combinations preview:")
    print(df_missing.head().to_string(index=False))
    
    # Cost estimation and confirmation
    cost_info = estimate_cost(len(df_missing))
    
    # Always show cost estimate
    print(f"\n💰 Cost Estimation:")
    print(f"   📊 Combinations to generate: {cost_info['combinations']:,}")
    print(f"   💵 ESTIMATED COST: ${cost_info['total_cost']:.3f}")
    
    # Require confirmation if above threshold or significant cost
    need_confirmation = (
        len(df_missing) > COST_WARNING_THRESHOLD or 
        cost_info['total_cost'] > 1.0
    ) and not args.force
    
    if need_confirmation:
        if not confirm_cost_with_user(cost_info):
            print("❌ Generation cancelled by user")
            return
    
    # Generate sentences
    generated_sentences = generate_sentences_batch(df_missing)
    
    # Save results
    if generated_sentences:
        save_generated_sentences(generated_sentences, OUTPUT_FILE)
        
        # Show sample results
        print(f"\n📝 Sample generated sentences:")
        for sentence in generated_sentences[:3]:
            print(f"  {sentence.get('verb')} ({sentence.get('tense')}, {sentence.get('pronoun')}): {sentence.get('sentence')}")
            
        print(f"\n🎉 Generation complete! Check {OUTPUT_FILE} for all results.")
    else:
        print("❌ No sentences were generated successfully")

if __name__ == "__main__":
    main()
