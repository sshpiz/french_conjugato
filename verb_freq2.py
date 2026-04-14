import spacy
from tqdm import tqdm
import json
import stanza
nlp = spacy.load("fr_core_news_md")
fr_path = "en-fr.txt/OpenSubtitles.en-fr.fr"
en_path = "en-fr.txt/OpenSubtitles.en-fr.en"
output_path = "verb_corpus.jsonl"
min_words = 6

total_done = 0
total_considered = 0

def extract_stanza_verb_info(french_sentence, nlp = stanza.Pipeline(lang="fr", processors="tokenize,mwt,pos,lemma", tokenize_no_ssplit=True)):
    doc = nlp(french_sentence)
    
    for sentence in doc.sentences:
        for word in sentence.words:
            if word.upos == "VERB" and word.feats:
                feats = word.feats  # Already a string like "Mood=Ind|Number=Sing|Person=3|Tense=Pres|VerbForm=Fin"
                return {
                    "verb_lemma": word.lemma,
                    "morph": feats,
                    "verb_form": word.text,
                }
    return None


def extract_verb_info(doc):
    for token in doc:
        if token.pos_ == "VERB" and token.morph.get("VerbForm") == ["Fin"]:
            lemma = token.lemma_
            morph = token.morph
            tense = morph.get("Tense")
            mood = morph.get("Mood")
            pronoun = None
            for t in doc:
                # if t.pos_ == "PRON" and t.dep_ in ("nsubj", "expl"):
                if t.pos_ == "PRON" and t.morph.get("Person"):
                    pronoun = t.text.lower()
                    break
            return {
                "verb_infinitive": lemma,
                "tense_mood": f"{mood[0] if mood else ''} {tense[0] if tense else ''}".strip(),
                "pronoun": pronoun or "",
                "morph": token.morph.to_json()

            }
    return None


def is_good_phrase(fr_line, en_line, doc):
    if en_line.isupper():
        return False
    if fr_line.isupper():
        return False
    if len(en_line.split()) < 4:
        return False

    if abs(len(fr_line.split()) - len(en_line.split())) > 7:
        return False
    if "?" in fr_line or "?" in en_line:
        return False
    
    if "..." in fr_line or "..." in en_line:
        return False
    
    # Heuristic 2: Garbage or cultural mismatches in English
    bad_en_keywords = {"-kun", "-sama", "drop kick", "melon roll", "sensei"}
    if any(badword in en_line.lower() for badword in bad_en_keywords):
        return False

    # Heuristic 3: Too many verbs or clauses in FR
    if sum(1 for t in doc if t.pos_ == "VERB") > 2:
        return False
    
    if sum(1 for t in doc if t.dep_ == "cc") > 1:
        return False

    # Heuristic 4: Casual spoken contractions (t'as, j'suis)
    too_informal = {"t'as", "j'suis", "j'sais", "c'pas"}
    if any(tok.text.lower() in too_informal for tok in doc):
        return False

    # Heuristic 5: Broken punctuation
    if not fr_line.strip().endswith((".", "!", "?")):
        return False

    # Heuristic 6: Sentence length too short or too long
    if len(doc) < 4 or len(doc) > 15:
        return False
     

    # Heuristic 8: Profanity in French
    bad_words_fr = {"merde", "putain", "con", "salopard", "enculé"}
    if any(w in fr_line.lower() for w in bad_words_fr):
        return False

    # Heuristic 9: Too-short/missing English (elliptical response)
    if len(en_line.split()) < 3:
        return False

    # Heuristic 10: Bad attitude/sarcasm cues in English
    bad_en_phrases = {
        "shut up", "what an awful", "suits you perfectly", "anyway", "the pits"
    }
    if any(phrase in en_line.lower() for phrase in bad_en_phrases):
        return False

    # Heuristic 11: Filler or interjection start in French
    if fr_line.lower().startswith(("euh", "oh", "hein", "bah")):
        return False
    
    # Weird punctuation or formatting
    bad_tokens = {"...", "[", "]", "{", "}", "--"}
    if any(t.text in bad_tokens for t in doc):
        return False

    # All-uppercase sentences (likely non-dialogue)
    if doc.text.isupper():
        return False

    # Too many clauses (junk subtitles often have multiple phrases mashed together)
    if sum(1 for t in doc if t.dep_ == "cc") > 1:  # coordinating conjunctions
        return False

    # Must have at least one finite verb and a subject
    has_finite_verb = any(t.pos_ == "VERB" and "Fin" in t.morph.get("VerbForm") for t in doc)
    has_subject = any(t.dep_ == "nsubj" for t in doc)

    if not has_finite_verb or not has_subject:
        return False

    # Optional: must end with good punctuation
    if doc[-1].text not in {".", "!", "?", }:
        return False
    
    return True

def add_to_corpus(file_handle, entry):
    file_handle.write(json.dumps(entry, ensure_ascii=False) + "\n")






with open(fr_path, encoding="utf-8", errors="ignore") as fr_file, \
     open(en_path, encoding="utf-8", errors="ignore") as en_file, \
     open(output_path, "a", encoding="utf-8") as out_file:

    for fr_line, en_line in tqdm(zip(fr_file, en_file), desc="Processing lines"):
        fr_line = fr_line.strip()
        en_line = en_line.strip()
        total_considered+= 1
        # if len(fr_line.split()) < min_words:
        #     continue

        doc = nlp(fr_line)
        if not is_good_phrase(fr_line, en_line, doc):
            continue
        info = extract_verb_info(doc)
        if info:
            info.update({
                "phrase_french": fr_line,
                "phrase_english": en_line
            })
            add_to_corpus(out_file, info)
            total_done += 1
            
        if total_considered % 1000 == 0:
            print(f"Processed {total_done} valid phrases out of {total_considered} considered so far. {total_done/total_considered:.2%} valid.  ")
    
