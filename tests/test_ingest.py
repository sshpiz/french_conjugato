import gzip
import json
from pathlib import Path

from etygraph.ingest import ingest_jsonl


FIXTURE = Path(__file__).parent / "fixtures" / "mini_kaikki.jsonl"


def test_ingest_reads_jsonl_and_skips_malformed(tmp_path: Path) -> None:
    stats = ingest_jsonl(FIXTURE, tmp_path / "build", strict=False)
    assert stats.malformed_json_lines == 1
    assert stats.nodes_written >= 19
    assert stats.edges_written >= 18
    assert (tmp_path / "build" / "nodes.jsonl").exists()
    assert (tmp_path / "build" / "edges.jsonl").exists()
    assert json.loads((tmp_path / "build" / "ingest_stats.json").read_text(encoding="utf-8"))["edges_written"]


def test_ingest_reads_jsonl_gz(tmp_path: Path) -> None:
    gz_path = tmp_path / "mini.jsonl.gz"
    with gzip.open(gz_path, "wt", encoding="utf-8") as handle:
        handle.write(FIXTURE.read_text(encoding="utf-8"))
    stats = ingest_jsonl(gz_path, tmp_path / "build", strict=False)
    assert stats.nodes_written >= 19
    assert stats.malformed_json_lines == 1
