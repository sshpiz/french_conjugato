from etygraph.graph import EtymologyGraph
from etygraph.models import Edge, Node
from etygraph.templates import edge_from_parts


def n(node_id: str, lang_code: str, word: str, pos: str = "verb") -> Node:
    return Node(node_id, None, lang_code, word, word.lower(), pos, None, [], "test")


def test_adjacency_ancestor_descendant_and_cycles() -> None:
    nodes = [
        n("fr:écrire:verb:0", "fr", "écrire"),
        n("la:scribere:verb:0", "la", "scribere"),
        n("en:scribe:noun:0", "en", "scribe", "noun"),
    ]
    edges: list[Edge] = [
        edge_from_parts("fr:écrire:verb:0", "la:scribere:verb:0", "inherited_from", "inh"),
        edge_from_parts("en:scribe:noun:0", "la:scribere:verb:0", "borrowed_from", "bor"),
        edge_from_parts("la:scribere:verb:0", "fr:écrire:verb:0", "derived_from", "cycle"),
    ]
    graph = EtymologyGraph(nodes, edges)
    ancestors = graph.get_ancestors("fr:écrire:verb:0", max_depth=4)
    assert ancestors["la:scribere:verb:0"].distance == 1
    descendants = graph.get_descendants("la:scribere:verb:0", max_depth=4, lang_code="en")
    assert "en:scribe:noun:0" in descendants


def test_best_path_prefers_shorter_then_confidence() -> None:
    nodes = [
        n("fr:a:verb:0", "fr", "a"),
        n("la:b:verb:0", "la", "b"),
        n("la:c:verb:0", "la", "c"),
    ]
    edges = [
        edge_from_parts("fr:a:verb:0", "la:b:verb:0", "derived_from", "der"),
        edge_from_parts("fr:a:verb:0", "la:c:verb:0", "borrowed_from", "bor"),
        edge_from_parts("la:c:verb:0", "la:b:verb:0", "derived_from", "der"),
    ]
    graph = EtymologyGraph(nodes, edges)
    assert graph.get_ancestors("fr:a:verb:0")["la:b:verb:0"].distance == 1
