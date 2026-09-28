from __future__ import annotations

import re
from typing import Any

from .models import ParsedNodeId

WHITESPACE_RE = re.compile(r"\s+")
LANG_CODE_ALIASES = {
    "la-cla": "la",
    "la-lat": "la",
    "LL.": "la",
    "ML.": "la",
}


def strip_wiktionary_annotations(value: str) -> str:
    """Remove low-value structured annotation junk while preserving the word."""
    out: list[str] = []
    index = 0
    while index < len(value):
        if value[index] == "<" and value[index + 1 :].lower().startswith(("id:", "ety:")):
            depth = 1
            index += 1
            while index < len(value) and depth:
                if value[index] == "<":
                    depth += 1
                elif value[index] == ">":
                    depth -= 1
                index += 1
            continue
        out.append(value[index])
        index += 1
    return "".join(out)


def normalize_lang_code(value: Any) -> str:
    text = "" if value is None else str(value).strip()
    return LANG_CODE_ALIASES.get(text, text)


def normalize_word(value: Any) -> str:
    text = "" if value is None else str(value)
    text = strip_wiktionary_annotations(text)
    text = WHITESPACE_RE.sub(" ", text.strip())
    return text.lower()


def display_word(value: Any) -> str:
    text = "" if value is None else str(value)
    text = strip_wiktionary_annotations(text)
    return WHITESPACE_RE.sub(" ", text.strip())


def normalize_pos(pos: Any) -> str:
    text = "" if pos is None else str(pos).strip().lower()
    return text or "unknown"


def normalize_etymology_number(value: Any) -> str:
    if value in (None, "", 0, "0"):
        return "0"
    return str(value).strip() or "0"


def id_word_part(word: Any) -> str:
    return normalize_word(word).replace(" ", "_")


def make_node_id(
    lang_code: str,
    word: Any,
    pos: Any = None,
    etymology_number: Any = None,
) -> str:
    lang = normalize_lang_code(lang_code) or "und"
    return f"{lang}:{id_word_part(word)}:{normalize_pos(pos)}:{normalize_etymology_number(etymology_number)}"


def parse_node_id(node_id: str) -> ParsedNodeId:
    parts = node_id.split(":")
    if len(parts) != 4:
        raise ValueError(f"Invalid node id: {node_id}")
    return ParsedNodeId(
        lang_code=parts[0],
        normalized_word=parts[1].replace("_", " "),
        pos=parts[2],
        etymology_number=parts[3],
    )


def normalized_lang_word_from_id(node_id: str) -> tuple[str, str] | None:
    try:
        parsed = parse_node_id(node_id)
    except ValueError:
        return None
    return parsed.lang_code, parsed.normalized_word


def stable_unique(values: list[str]) -> list[str]:
    seen: set[str] = set()
    out: list[str] = []
    for value in values:
        text = display_word(value)
        key = normalize_word(text)
        if text and key not in seen:
            seen.add(key)
            out.append(text)
    return out
