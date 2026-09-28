from pathlib import Path

from etygraph.graph import EtymologyGraph
from etygraph.ingest import ingest_jsonl
from etygraph.relate import related_english_for_word

FIXTURE = Path(__file__).parent / "fixtures" / "mini_kaikki.jsonl"


def fixture_graph(tmp_path: Path) -> EtymologyGraph:
    build_dir = tmp_path / "build"
    ingest_jsonl(FIXTURE, build_dir, strict=False)
    return EtymologyGraph.from_build_dir(build_dir)


def test_ecrire_returns_scribe_and_script_like_candidates(tmp_path: Path) -> None:
    graph = fixture_graph(tmp_path)
    result = related_english_for_word(graph, "écrire", top_n=8)
    assert result is not None
    words = [candidate.word for candidate in result.english_related]
    assert "scribe" in words
    assert "script" in words
    assert result.english_related[0].word in {"scribe", "script", "describe"}


def test_remote_proto_candidates_are_penalized(tmp_path: Path) -> None:
    graph = fixture_graph(tmp_path)
    result = related_english_for_word(graph, "écrire", top_n=8)
    assert result is not None
    scores = {candidate.word: candidate.score for candidate in result.english_related}
    assert "shrive" not in scores or scores["shrive"] < scores["scribe"]


def test_composed_of_does_not_outrank_direct_latin_family(tmp_path: Path) -> None:
    graph = fixture_graph(tmp_path)
    result = related_english_for_word(graph, "écrire", top_n=8)
    assert result is not None
    scores = {candidate.word: candidate.score for candidate in result.english_related}
    assert scores["scribal-ish"] < scores["scribe"]


def test_top_n_works_and_parler_demander_resolve(tmp_path: Path) -> None:
    graph = fixture_graph(tmp_path)
    ecrire = related_english_for_word(graph, "écrire", top_n=2)
    assert ecrire is not None
    assert len(ecrire.english_related) == 2
    parler = related_english_for_word(graph, "parler", top_n=4)
    assert parler is not None
    assert {candidate.word for candidate in parler.english_related} & {"parley", "parliament"}
    demander = related_english_for_word(graph, "demander", top_n=4)
    assert demander is not None
    assert "demand" in {candidate.word for candidate in demander.english_related}
