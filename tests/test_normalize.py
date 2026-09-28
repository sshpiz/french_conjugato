from etygraph.normalize import display_word, make_node_id, normalize_lang_code, normalize_word


def test_normalize_strips_id_and_whitespace_preserving_accents() -> None:
    assert display_word("  chemin<id:way>   de   fer ") == "chemin de fer"
    assert display_word("alphabete<ety:bor<la-cla:alphabētum>>") == "alphabete"
    assert normalize_word("  Écrire<id:x>   vite ") == "écrire vite"


def test_node_ids_are_stable_and_space_safe() -> None:
    assert make_node_id("fr", "Écrire", "verb", None) == "fr:écrire:verb:0"
    assert make_node_id("frm", "chemin de fer<id:way>", None, 2) == "frm:chemin_de_fer:unknown:2"


def test_language_aliases_canonicalize_source_codes() -> None:
    assert normalize_lang_code("la-cla") == "la"
    assert make_node_id("la-cla", "alphabētum", "noun", None) == "la:alphabētum:noun:0"
