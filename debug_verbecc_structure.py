#!/usr/bin/env python3
"""Debug script to understand verbecc conjugate() structure"""

from verbecc.conjugator import Conjugator

c = Conjugator(lang="fr")

# Test with a simple verb
verb = "être"
result = c.conjugate(verb)

print(f"Type of result: {type(result)}")
print(f"Keys in result: {list(result.keys()) if hasattr(result, 'keys') else 'N/A'}")
print("\nFull structure:")
import json
print(json.dumps(result, indent=2, ensure_ascii=False))
