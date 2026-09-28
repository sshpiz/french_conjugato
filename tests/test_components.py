from pathlib import Path

from etygraph.components import build_component_exports
from etygraph.export import export_french_verbs
from etygraph.graph import EtymologyGraph
from etygraph.ingest import ingest_jsonl

FIXTURE = Path(__file__).parent / "fixtures" / "mini_kaikki.jsonl"


def test_component_exports_for_related_verbs(tmp_path: Path) -> None:
    build_dir = tmp_path / "build"
    ingest_jsonl(FIXTURE, build_dir, strict=False)
    graph = EtymologyGraph.from_build_dir(build_dir)
    related_path = tmp_path / "related.json"
    export_french_verbs(graph, related_path, verbs=["écrire", "parler"], verb_list_source="test")

    index_path = tmp_path / "components.json"
    small_path = tmp_path / "small_components.json"
    index, small = build_component_exports(
        build_dir,
        related_path,
        index_path,
        small_components_out_path=small_path,
        max_small_component_size=50,
    )

    assert index["metadata"]["exported_verbs_indexed"] == 2
    assert index["verbs"]["écrire"]["component_size"] > 1
    assert index["verbs"]["écrire"]["component_id"] in small["components"]
    assert small["components"][index["verbs"]["écrire"]["component_id"]]["nodes"]
