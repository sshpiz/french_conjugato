from verbecc import Conjugator

cg = Conjugator(lang='fr')
verbs = cg.get_known_verbs()  # returns a list of recognized infinitives
print(f"{len(verbs)} verbs available")
print(verbs[:50])            # first 50 verbs
