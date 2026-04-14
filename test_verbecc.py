#!/usr/bin/env python3
"""
Test script to see what verbecc conjugator.conjugate() returns
"""
from verbecc.conjugator import Conjugator
import json

conjugator = Conjugator(lang="fr")

# Test with a simple verb
verb = "être"
result = conjugator.conjugate(verb)

print(f"Type of result: {type(result)}")
print(f"Result keys: {list(result.keys()) if hasattr(result, 'keys') else 'Not a dict'}")

# Print first few items
if hasattr(result, 'items'):
    print("\nFirst few items:")
    for i, (key, value) in enumerate(result.items()):
        if i < 5:
            print(f"  {key}: {type(value)} -> {value}")
        else:
            break

# Also test a regular verb
print("\n" + "="*40)
verb2 = "parler"
result2 = conjugator.conjugate(verb2)

print(f"Type of result2: {type(result2)}")
print(f"Result2 keys: {list(result2.keys()) if hasattr(result2, 'keys') else 'Not a dict'}")

# Print first few items
if hasattr(result2, 'items'):
    print("\nFirst few items:")
    for i, (key, value) in enumerate(result2.items()):
        if i < 5:
            print(f"  {key}: {type(value)} -> {value}")
        else:
            break
