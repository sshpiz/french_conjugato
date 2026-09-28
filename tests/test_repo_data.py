from pathlib import Path

from etygraph.repo_data import discover_verb_lists, load_verb_list


def test_discovers_likely_french_verb_files_and_chooses_default(tmp_path: Path) -> None:
    (tmp_path / "random.txt").write_text("bonjour\nmaison\n", encoding="utf-8")
    (tmp_path / "french_verbs.csv").write_text("verb,pos\nparler,verb\nmaison,noun\nécrire,verb\n", encoding="utf-8")
    (tmp_path / "lemmas.json").write_text(
        '{"items":[{"lemma":"demander","pos":"verb","lang_code":"fr"},{"lemma":"table","pos":"noun","lang_code":"fr"}]}',
        encoding="utf-8",
    )
    candidates = discover_verb_lists(tmp_path)
    assert candidates
    assert Path(candidates[0].path).name == "french_verbs.csv"
    assert candidates[0].verb_column == "verb"
    assert candidates[0].count == 2


def test_loads_csv_tsv_txt_json_jsonl_and_js(tmp_path: Path) -> None:
    csv_path = tmp_path / "verbs.csv"
    csv_path.write_text("verb\nparler\nparler\nécrire\n", encoding="utf-8")
    tsv_path = tmp_path / "verbs.tsv"
    tsv_path.write_text("infinitive\tpos\nparler\tverb\nchat\tnoun\n", encoding="utf-8")
    txt_path = tmp_path / "verbs.txt"
    txt_path.write_text("demander\nécrire\n", encoding="utf-8")
    json_path = tmp_path / "verbs.json"
    json_path.write_text('{"verbs":[{"infinitive":"parler"},{"infinitive":"demander"}]}', encoding="utf-8")
    jsonl_path = tmp_path / "verbs.jsonl"
    jsonl_path.write_text('{"verb":"écrire","pos":"verb"}\n{"verb":"table","pos":"noun"}\n', encoding="utf-8")
    js_path = tmp_path / "verbs.js"
    js_path.write_text('const verbs = [{"infinitive":"parler"},{"infinitive":"demander"}];\n', encoding="utf-8")
    assert load_verb_list(csv_path) == ["parler", "écrire"]
    assert load_verb_list(tsv_path) == ["parler"]
    assert load_verb_list(txt_path) == ["demander", "écrire"]
    assert load_verb_list(json_path) == ["parler", "demander"]
    assert load_verb_list(jsonl_path) == ["écrire"]
    assert load_verb_list(js_path) == ["parler", "demander"]


def test_random_files_are_not_high_confidence(tmp_path: Path) -> None:
    (tmp_path / "fr_full.txt").write_text("bonjour\nmaison\nroute\n", encoding="utf-8")
    assert discover_verb_lists(tmp_path) == []
