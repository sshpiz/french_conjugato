from etygraph.models import Node
from etygraph.templates import extract_template_edges


def node() -> Node:
    return Node(
        id="fr:écrire:verb:0",
        lang="French",
        lang_code="fr",
        word="écrire",
        normalized_word="écrire",
        pos="verb",
        etymology_number=None,
        glosses=["to write"],
        source="fixture",
    )


def edge_types(entry: dict[str, object]) -> list[str]:
    return [edge.type for edge in extract_template_edges(node(), entry).edges]


def test_der_bor_inh_extraction() -> None:
    entry = {
        "etymology_templates": [
            {"name": "der", "args": {"1": "fr", "2": "la", "3": "scribere"}},
            {"name": "bor", "args": {"1": "fr", "2": "la", "3": "scriptum"}},
            {"name": "inh+", "args": {"1": "fr", "2": "la-cla", "3": "scribere"}},
        ]
    }
    assert edge_types(entry) == ["derived_from", "borrowed_from", "inherited_from"]


def test_etymon_extraction_removes_id_annotation() -> None:
    result = extract_template_edges(
        node(),
        {"etymology_templates": [{"name": "etymon", "args": {"1": ":inh", "2": "frm:chemin<id:way>"}}]},
    )
    assert len(result.edges) == 1
    assert result.edges[0].type == "inherited_from"
    assert result.edges[0].to_id == "frm:chemin:unknown:0"


def test_cognate_and_affix_extraction() -> None:
    result = extract_template_edges(
        node(),
        {
            "etymology_templates": [
                {"name": "cog", "args": {"1": "fr", "2": "la", "3": "scribere"}},
                {"name": "prefix", "args": {"1": "fr", "2": "la", "3": "scribere"}},
            ]
        },
    )
    assert [edge.type for edge in result.edges] == ["cognate_with", "composed_of"]


def test_missing_args_skipped_safely() -> None:
    result = extract_template_edges(node(), {"etymology_templates": [{"name": "der", "args": {"1": "fr"}}]})
    assert result.edges == []
    assert result.templates_skipped["der"] == 1
