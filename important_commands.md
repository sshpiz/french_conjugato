rm -f js/verbs.full.generated.bk.js sentences.generated.bk.js && python compress_large_js_objects.py js/verbs.full.generated.js   sentences.generated.js  && mv  js/verbs.full.generated.loader.js js/verbs.full.generated.js  && mv sentences.generated.loader.js sentences.generated.js
---

## Deploy to lesverb.es (GitHub Pages)

`dist/` is NOT committed to master — it's build output only.
`gh-pages` branch lives in the `dist-gh/` worktree.

```bash
# 1. Build
python3 build.py

# 2. Copy into gh-pages worktree
cp dist/index.html dist-gh/index.html
cp dist/franconjugue.html dist-gh/franconjugue.html
cp dist/sw.js dist-gh/sw.js
cp dist/manifest.json dist-gh/manifest.json

# 3. Commit & push
cd dist-gh
git add -A
git commit -m "deploy"
git push origin gh-pages
cd ..
```

To archive current live version before deploying:
```bash
cp dist-gh/index.html dist-gh/v1.x.html
```

---

## Fix frequency tiers (make Top N exclusive/non-overlapping)

The verb data uses inclusive tags ("top50" = "in the top 50"), so tiers overlap.
Run this to reassign to exclusive buckets (top20=20, top50=30, top100=50, top500=400, top1000=rest):

```
python3 fix_frequency_tiers.py
python3 compress_large_js_objects.py js/verbs.full.js
mv js/verbs.full.loader.js js/verbs.full.generated.js
python3 build.py
```

Re-run whenever new verbs are added to `verbs.full.js`.

---

## Verbs with no English translation (209 total)

These verbs could not be translated by Google Translate (they're very obscure, archaic, or Quebec/regional French). They are **excluded from flashcards** but still appear in the Explorer search.

If you want to fix them: edit `js/verbs.full.js`, set a real `"translation"` value, then run:
```
python3 compress_large_js_objects.py js/verbs.full.js
cp js/verbs.full.loader.js js/verbs.full.generated.js
```

### The 209 verbs

achaler, afféager, agender, ahaner, amancher, amatir, amodier, aviner, bader, badger, baller, barber, barguigner, barjaquer, baster, bayer, becter, billebauder, biller, bisquer, blondoyer, bomber, border, bornoyer, boubouler, bourasser, boustifailler, boxer, bretteler, bretter, bridger, briffer, brinqueballer, buser, butter, cacaber, cadancher, cagner, calancher, calter, cambuter, canner, caper, carapater, carcailler, carmer, catir, celer, challenger, chaloir, champlever, chiader, chinder, choir, chopper, chouriner, clisser, computer, confire, cornaquer, corner, cotir, courcailler, cramser, crapuler, crawler, dauber, driver, effaner, embreler, endauber, enter, entuber, escher, escoffier, fader, faluner, fanfrelucher, faseyer, fayoter, fayotter, fieffer, filocher, flatter, folichonner, forligner, fouger, gamberger, gauler, gerber, glaviotter, goberger, gominer, gourer, guillemeter, guiper, harder, haver, havir, hercher, herscher, hotter, hourder, hourdir, houssiner, ixer, jabouiner, jaffer, jargauder, jasper, jerker, jogger, jumper, kibitzer, kifer, koter, lancequiner, laurer, layer, lifter, liter, louver, machicoter, manager, manufacturer, margauder, marivauder, matir, miter, mixer, moiser, morfiler, motter, mucher, musser, nimber, noper, obombrer, octavier, organsiner, oringuer, pageoter, pager, palmer, panner, papouiller, pateliner, patter, paumoyer, pester, pifer, piffer, pinter, piper, pituiter, plucher, primer, prosodier, querner, quimper, ramander, rebiquer, renauder, rewriter, riffauder, router, rudenter, sacquer, sataner, scheider, schlinguer, schlitter, seoir, serfouir, sorguer, spitter, splitter, sprinter, squatter, staffer, stripper, suifer, tapir, tarabuster, tercer, terrir, terser, tiller, tomer, tuber, twister, valdinguer, varloper, vaseliner, vasouiller, velter, vesser, vioquir, warranter, yasser, youtser, yoyotter, ziber, zigouiller, zipper, zouker, zwanzer, zyeuter, énieller
