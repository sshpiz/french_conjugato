# from transformers import M2M100ForConditionalGeneration, M2M100Tokenizer

# model = M2M100ForConditionalGeneration.from_pretrained("facebook/m2m100_418M")
# tokenizer = M2M100Tokenizer.from_pretrained("facebook/m2m100_418M")

# text = "C'est trop compliqué, je ne peux pas retenir ça."
# tokenizer.src_lang = "fr"
# encoded = tokenizer(text, return_tensors="pt")
# generated = model.generate(**encoded, forced_bos_token_id=tokenizer.get_lang_id("en"))
# print(tokenizer.decode(generated[0], skip_special_tokens=True))

from transformers import M2M100ForConditionalGeneration, M2M100Tokenizer
import torch
from typing import List

# Load once globally
model_name = "facebook/m2m100_418M"
tokenizer = M2M100Tokenizer.from_pretrained(model_name)
model = M2M100ForConditionalGeneration.from_pretrained(model_name)
device = "cuda" if torch.cuda.is_available() else "cpu"
model.to(device)

def translate_fr_to_en_m2m100(sentences: List[str], batch_size: int = 8) -> List[str]:
    """
    Translates a list of French sentences into English using M2M100.

    Args:
        sentences (List[str]): List of French strings.
        batch_size (int): How many to process at once.

    Returns:
        List[str]: List of English translations.
    """
    tokenizer.src_lang = "fr"
    translations = []

    for i in range(0, len(sentences), batch_size):
        batch = sentences[i:i + batch_size]
        encoded = tokenizer(batch, return_tensors="pt", padding=True, truncation=True).to(device)
        generated = model.generate(
            **encoded,
            forced_bos_token_id=tokenizer.get_lang_id("en"),
            max_length=128,
            num_beams=4,
            early_stopping=True
        )
        translated_batch = tokenizer.batch_decode(generated, skip_special_tokens=True)
        translations.extend(translated_batch)

    return translations
