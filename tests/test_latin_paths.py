from pathlib import Path

from etygraph.export import export_french_verbs
from etygraph.graph import EtymologyGraph
from etygraph.ingest import ingest_jsonl
from etygraph.latin_paths import export_latin_path_shards

FIXTURE = Path(__file__).parent / "fixtures" / "mini_kaikki.jsonl"


def test_latin_path_shards_find_closest_latin_ancestor(tmp_path: Path) -> None:
    build_dir = tmp_path / "build"
    ingest_jsonl(FIXTURE, build_dir, strict=False)
    graph = EtymologyGraph.from_build_dir(build_dir)
    related_path = tmp_path / "related.json"
    export_french_verbs(graph, related_path, verbs=["écrire"], verb_list_source="test")

    out_dir = tmp_path / "latin_paths"
    index = export_latin_path_shards(
        graph,
        related_path,
        out_dir,
        max_latin_depth=3,
        max_english_depth=3,
        max_english_descendants=20,
    )

    assert index["metadata"]["verbs_with_latin_path"] == 1
    shard = out_dir / "e.json"
    assert shard.exists()
    payload = shard.read_text(encoding="utf-8")
    assert "scribere" in payload
    assert "scribe" in payload
