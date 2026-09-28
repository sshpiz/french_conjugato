from __future__ import annotations

import argparse
import json
import logging
from pathlib import Path
from typing import Any

from .components import build_component_exports
from .export import export_french_verbs
from .graph import EtymologyGraph
from .ingest import DEFAULT_LANGS, ingest_jsonl_many
from .latin_paths import DEFAULT_LATIN_PATH_EDGE_TYPES, export_latin_path_shards
from .neighborhoods import build_neighborhood_shards
from .relate import related_english_for_word
from .repo_data import discover_verb_lists, load_verb_list


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
    return int(args.func(args) or 0)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(prog="etygraph")
    subparsers = parser.add_subparsers(required=True)

    ingest = subparsers.add_parser("ingest", help="Ingest Kaikki/Wiktextract JSONL or JSONL.GZ")
    ingest.add_argument("--input", required=True, type=Path, nargs="+")
    ingest.add_argument("--out-dir", required=True, type=Path)
    ingest.add_argument("--langs", default=",".join(sorted(DEFAULT_LANGS)))
    ingest.add_argument("--strict", default="false", type=str_to_bool)
    ingest.add_argument("--limit", type=int)
    ingest.set_defaults(func=cmd_ingest)

    relate_one = subparsers.add_parser("relate-one", help="Print related English words for one French verb")
    relate_one.add_argument("--build-dir", required=True, type=Path)
    relate_one.add_argument("--word", required=True)
    relate_one.add_argument("--lang", default="fr")
    relate_one.add_argument("--pos", default="verb")
    relate_one.add_argument("--top-n", type=int, default=8)
    relate_one.add_argument("--max-depth", type=int, default=5)
    relate_one.set_defaults(func=cmd_relate_one)

    export = subparsers.add_parser("export-french-verbs", help="Precompute app JSON for French verbs")
    export.add_argument("--build-dir", required=True, type=Path)
    export.add_argument("--out", required=True, type=Path)
    export.add_argument("--top-n", type=int, default=8)
    export.add_argument("--max-depth", type=int, default=5)
    export.add_argument("--verb-list", type=Path)
    export.add_argument("--verb-column")
    export.add_argument("--root", type=Path, default=Path("."))
    export.set_defaults(func=cmd_export_french_verbs)

    inspect = subparsers.add_parser("inspect-node", help="Inspect a graph node and adjacent edges")
    inspect.add_argument("--build-dir", required=True, type=Path)
    inspect.add_argument("--id", required=True)
    inspect.set_defaults(func=cmd_inspect_node)

    stats = subparsers.add_parser("stats", help="Print graph stats")
    stats.add_argument("--build-dir", required=True, type=Path)
    stats.set_defaults(func=cmd_stats)

    components = subparsers.add_parser("component-index", help="Precompute connected component metadata")
    components.add_argument("--build-dir", required=True, type=Path)
    components.add_argument("--related-export", required=True, type=Path)
    components.add_argument("--out", required=True, type=Path)
    components.add_argument("--small-components-out", type=Path)
    components.add_argument("--max-small-component-size", type=int, default=160)
    components.set_defaults(func=cmd_component_index)

    neighborhoods = subparsers.add_parser("neighborhood-index", help="Precompute capped verb neighborhoods")
    neighborhoods.add_argument("--build-dir", required=True, type=Path)
    neighborhoods.add_argument("--related-export", required=True, type=Path)
    neighborhoods.add_argument("--out-dir", required=True, type=Path)
    neighborhoods.add_argument("--max-depth", type=int, default=3)
    neighborhoods.add_argument("--max-nodes", type=int, default=100)
    neighborhoods.add_argument("--max-edges", type=int, default=220)
    neighborhoods.set_defaults(func=cmd_neighborhood_index)

    latin_paths = subparsers.add_parser("latin-path-index", help="Precompute closest Latin ancestor path shards")
    latin_paths.add_argument("--build-dir", required=True, type=Path)
    latin_paths.add_argument("--related-export", required=True, type=Path)
    latin_paths.add_argument("--out-dir", required=True, type=Path)
    latin_paths.add_argument("--max-latin-depth", type=int, default=3)
    latin_paths.add_argument("--max-english-depth", type=int, default=4)
    latin_paths.add_argument("--max-english-descendants", type=int, default=160)
    latin_paths.add_argument("--edge-types", default=",".join(sorted(DEFAULT_LATIN_PATH_EDGE_TYPES)))
    latin_paths.set_defaults(func=cmd_latin_path_index)

    discover = subparsers.add_parser("discover-verbs", help="Discover existing repo French verb lists")
    discover.add_argument("--root", type=Path, default=Path("."))
    discover.add_argument("--json", default="false", type=str_to_bool)
    discover.set_defaults(func=cmd_discover_verbs)
    return parser


def cmd_ingest(args: argparse.Namespace) -> int:
    langs = {item.strip() for item in args.langs.split(",") if item.strip()}
    stats = ingest_jsonl_many(args.input, args.out_dir, langs=langs, strict=args.strict, limit=args.limit)
    print_json(stats.to_dict())
    return 0


def cmd_relate_one(args: argparse.Namespace) -> int:
    graph = EtymologyGraph.from_build_dir(args.build_dir)
    result = related_english_for_word(
        graph,
        args.word,
        lang_code=args.lang,
        pos=args.pos,
        top_n=args.top_n,
        max_depth=args.max_depth,
    )
    if result is None:
        print_json({"error": "word not found", "word": args.word, "lang": args.lang, "pos": args.pos})
        return 1
    print_json(result.to_dict())
    return 0


def cmd_export_french_verbs(args: argparse.Namespace) -> int:
    graph = EtymologyGraph.from_build_dir(args.build_dir)
    verbs = None
    source = None
    if args.verb_list:
        verbs = load_verb_list(args.verb_list, args.verb_column)
        source = str(args.verb_list)
    data = export_french_verbs(
        graph,
        args.out,
        verbs=verbs,
        verb_list_source=source,
        top_n=args.top_n,
        max_depth=args.max_depth,
        repo_root=args.root if verbs is None else None,
    )
    print_json(compact_cli_metadata(data["metadata"]))
    return 0


def cmd_inspect_node(args: argparse.Namespace) -> int:
    graph = EtymologyGraph.from_build_dir(args.build_dir)
    node = graph.nodes_by_id.get(args.id)
    if node is None:
        print_json({"error": "node not found", "id": args.id})
        return 1
    data = {
        "node": node.to_dict(),
        "parents": [edge.to_dict() for edge in graph.parents_by_child.get(args.id, [])],
        "children": [edge.to_dict() for edge in graph.children_by_parent.get(args.id, [])],
    }
    print_json(data)
    return 0


def cmd_stats(args: argparse.Namespace) -> int:
    graph = EtymologyGraph.from_build_dir(args.build_dir)
    data: dict[str, Any] = graph.stats()
    stats_path = args.build_dir / "ingest_stats.json"
    if stats_path.exists():
        ingest_stats = json.loads(stats_path.read_text(encoding="utf-8"))
        skipped = ingest_stats.get("templates_skipped", {})
        data["top_templates_skipped"] = dict(sorted(skipped.items(), key=lambda item: (-item[1], item[0]))[:20])
    print_json(data)
    return 0


def cmd_component_index(args: argparse.Namespace) -> int:
    data, small_data = build_component_exports(
        args.build_dir,
        args.related_export,
        args.out,
        small_components_out_path=args.small_components_out,
        max_small_component_size=args.max_small_component_size,
    )
    print_json(
        {
            "metadata": data["metadata"],
            "component_summaries": len(data["components"]),
            "small_component_subgraphs": len(small_data.get("components", {})),
        }
    )
    return 0


def cmd_neighborhood_index(args: argparse.Namespace) -> int:
    data = build_neighborhood_shards(
        args.build_dir,
        args.related_export,
        args.out_dir,
        max_depth=args.max_depth,
        max_nodes=args.max_nodes,
        max_edges=args.max_edges,
    )
    print_json(data["metadata"] | {"shards": len(data["shards"])})
    return 0


def cmd_latin_path_index(args: argparse.Namespace) -> int:
    graph = EtymologyGraph.from_build_dir(args.build_dir)
    edge_types = {item.strip() for item in args.edge_types.split(",") if item.strip()}
    data = export_latin_path_shards(
        graph,
        args.related_export,
        args.out_dir,
        max_latin_depth=args.max_latin_depth,
        max_english_depth=args.max_english_depth,
        max_english_descendants=args.max_english_descendants,
        allowed_edge_types=edge_types,
    )
    print_json(data["metadata"] | {"shards": len(data["shards"])})
    return 0


def cmd_discover_verbs(args: argparse.Namespace) -> int:
    candidates = discover_verb_lists(args.root)
    data = {
        "chosen_default": candidates[0].to_dict() if candidates else None,
        "candidates": [candidate.to_dict() for candidate in candidates],
    }
    if args.json:
        print_json(data)
    else:
        if not candidates:
            print("No suitable French verb-list candidates found.")
            return 0
        print("Chosen default:")
        print(format_candidate(candidates[0]))
        print()
        print("Candidates:")
        for candidate in candidates:
            print(format_candidate(candidate))
    return 0


def print_json(data: object) -> None:
    print(json.dumps(data, ensure_ascii=False, indent=2, sort_keys=True))


def compact_cli_metadata(metadata: object) -> object:
    if not isinstance(metadata, dict):
        return metadata
    data = dict(metadata)
    unmatched = data.get("unmatched_verbs")
    if isinstance(unmatched, list) and len(unmatched) > 20:
        data["unmatched_verbs_total"] = len(unmatched)
        data["unmatched_verbs"] = unmatched[:20]
    return data


def format_candidate(candidate: object) -> str:
    return (
        f"- {candidate.path} [{candidate.format}] column={candidate.verb_column or '-'} "
        f"count={candidate.count} score={candidate.score} confidence={candidate.confidence} "
        f"sample={', '.join(candidate.sample[:5])}"
    )


def str_to_bool(value: str | bool) -> bool:
    if isinstance(value, bool):
        return value
    text = value.strip().lower()
    if text in {"1", "true", "yes", "y", "on"}:
        return True
    if text in {"0", "false", "no", "n", "off"}:
        return False
    raise argparse.ArgumentTypeError(f"Expected boolean value, got {value!r}")


if __name__ == "__main__":
    raise SystemExit(main())
