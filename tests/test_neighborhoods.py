from pathlib import Path

from etygraph.export import export_french_verbs
from etygraph.graph import EtymologyGraph
from etygraph.ingest import ingest_jsonl
from etygraph.neighborhoods import build_neighborhood_shards

FIXTURE = Path(__file__).parent / "fixtures" / "mini_kaikki.jsonl"


def test_neighborhood_shards_include_distances_and_edges(tmp_path: Path) -> None:
    build_dir = tmp_path / "build"
    ingest_jsonl(FIXTURE, build_dir, strict=False)
    graph = EtymologyGraph.from_build_dir(build_dir)
    related_path = tmp_path / "related.json"
    export_french_verbs(graph, related_path, verbs=["écrire"], verb_list_source="test")

    out_dir = tmp_path / "neighborhoods"
    index = build_neighborhood_shards(build_dir, related_path, out_dir, max_depth=2, max_nodes=20)

    assert index["metadata"]["verbs"] == 1
    shard = out_dir / "e.json"
    assert shard.exists()
    text = shard.read_text(encoding="utf-8")
    assert "écrire" in text
    assert "la:scribere:verb:0" in text
    assert "edges" in text
