import json
import subprocess
import sys
from pathlib import Path

FIXTURE = Path(__file__).parent / "fixtures" / "mini_kaikki.jsonl"
REPO_VERBS = Path(__file__).parent / "fixtures" / "repo_verbs.csv"


def run_cli(*args: str, cwd: Path | None = None) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        [sys.executable, "-m", "etygraph.cli", *args],
        cwd=cwd,
        check=False,
        text=True,
        capture_output=True,
    )


def test_cli_ingest_relate_stats_and_export(tmp_path: Path) -> None:
    build_dir = tmp_path / "build"
    ingest = run_cli("ingest", "--input", str(FIXTURE), "--out-dir", str(build_dir))
    assert ingest.returncode == 0, ingest.stderr
    assert json.loads(ingest.stdout)["malformed_json_lines"] == 1

    relate = run_cli("relate-one", "--build-dir", str(build_dir), "--word", "écrire", "--top-n", "3")
    assert relate.returncode == 0, relate.stderr
    related = json.loads(relate.stdout)
    assert "scribe" in [item["word"] for item in related["english_related"]]

    stats = run_cli("stats", "--build-dir", str(build_dir))
    assert stats.returncode == 0, stats.stderr
    assert json.loads(stats.stdout)["nodes_by_lang"]["fr"] >= 3

    out_path = tmp_path / "related.json"
    export = run_cli(
        "export-french-verbs",
        "--build-dir",
        str(build_dir),
        "--out",
        str(out_path),
        "--verb-list",
        str(REPO_VERBS),
    )
    assert export.returncode == 0, export.stderr
    metadata = json.loads(export.stdout)
    assert metadata["requested_verbs"] == 3
    assert json.loads(out_path.read_text(encoding="utf-8"))["verbs"]["écrire"]["english_related"]


def test_cli_discover_verbs(tmp_path: Path) -> None:
    (tmp_path / "french_verbs.csv").write_text("verb,pos\nparler,verb\nchat,noun\n", encoding="utf-8")
    result = run_cli("discover-verbs", "--root", str(tmp_path), "--json", "true")
    assert result.returncode == 0, result.stderr
    data = json.loads(result.stdout)
    assert data["chosen_default"]["count"] == 1


def test_cli_ingest_accepts_multiple_inputs(tmp_path: Path) -> None:
    second = tmp_path / "second.jsonl"
    second.write_text(
        '{"word":"bonjour","lang":"French","lang_code":"fr","pos":"interjection","senses":[{"glosses":["hello"]}]}\n',
        encoding="utf-8",
    )
    build_dir = tmp_path / "build"
    result = run_cli("ingest", "--input", str(FIXTURE), str(second), "--out-dir", str(build_dir))
    assert result.returncode == 0, result.stderr
    assert json.loads(result.stdout)["nodes_written"] >= 21
