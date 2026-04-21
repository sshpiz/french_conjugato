"""
LEGACY / MANUAL-ONLY helper.

Reassign frequency tags so tiers are exclusive (non-overlapping):
  top20:   ranks 1–20
  top50:   ranks 21–50
  top100:  ranks 51–100
  top500:  ranks 101–500
  top1000: ranks 501–1000
  rare:    ranks 1001+

Sorting within non-rare: by current tier first (top20 < top50 < ... < top1000),
then alphabetically as tiebreaker.

Do not run this after the refined-tier regeneration flow.
It does not know about top2000/top3000/top4000/top5000 and will collapse those
tiers back into the old top1000/rare model.
"""

import re, json
from pathlib import Path

VERBS_JS = Path("js/verbs.full.js")

TIER_ORDER = {"top20": 0, "top50": 1, "top100": 2, "top500": 3, "top1000": 4, "rare": 5}
CUTOFFS = [
    (20,   "top20"),
    (50,   "top50"),
    (100,  "top100"),
    (500,  "top500"),
    (1000, "top1000"),
]

def load_verbs_js():
    content = VERBS_JS.read_text(encoding="utf-8")
    mv = re.search(r'const verbs\s*=\s*(\[.*?\]);', content, re.DOTALL)
    verbs = json.loads(mv.group(1))
    return verbs, content

def save_verbs_js(verbs, original_content):
    new_verbs = json.dumps(verbs, ensure_ascii=False, indent=2)
    updated = re.sub(
        r'(const verbs\s*=\s*)\[.*?\](;)',
        lambda _: f'const verbs = {new_verbs};',
        original_content, flags=re.DOTALL
    )
    VERBS_JS.write_text(updated, encoding="utf-8")

def main():
    verbs, content = load_verbs_js()

    non_rare = [v for v in verbs if (v.get("frequency") or "rare") != "rare"]
    rare     = [v for v in verbs if (v.get("frequency") or "rare") == "rare"]

    # Sort non-rare: by current tier rank, then alphabetically
    non_rare.sort(key=lambda v: (TIER_ORDER.get(v.get("frequency", "rare"), 5), v["infinitive"]))

    print(f"Total verbs: {len(verbs)}  |  non-rare: {len(non_rare)}  |  rare: {len(rare)}")

    # Reassign tiers
    for i, verb in enumerate(non_rare):
        rank = i + 1
        new_freq = "top1000"
        for cutoff, label in CUTOFFS:
            if rank <= cutoff:
                new_freq = label
                break
        else:
            new_freq = "rare"
        verb["frequency"] = new_freq

    # Count result
    counts = {}
    for v in non_rare:
        f = v["frequency"]
        counts[f] = counts.get(f, 0) + 1
    print("New tier counts (non-rare):", dict(sorted(counts.items(), key=lambda x: TIER_ORDER.get(x[0],9))))
    print(f"Rare (unchanged): {len(rare)}")

    save_verbs_js(non_rare + rare, content)
    print(f"\n✅ verbs.full.js updated with exclusive frequency tiers.")
    print("Next: python3 compress_large_js_objects.py js/verbs.full.js && mv js/verbs.full.loader.js js/verbs.full.generated.js && python3 build.py")

if __name__ == "__main__":
    main()
