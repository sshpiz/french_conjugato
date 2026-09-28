from __future__ import annotations

import csv
import json
import re
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Any, Iterable

from .normalize import display_word, normalize_word, stable_unique

SUPPORTED_SUFFIXES = {".csv", ".tsv", ".json", ".jsonl", ".txt", ".js"}
SKIP_DIRS = {
    "bin",
    "etc",
    "include",
    "lib",
    ".git",
    ".mypy_cache",
    ".pytest_cache",
    ".stanza_cache",
    ".stanza_resources",
    ".tls",
    ".wrangler",
    "__pycache__",
    "dist",
    "dist-cloudflare",
    "dist-gh",
    "generated_tts",
    "generated_tts_cache",
    "share",
    "tests",
    "node_modules",
    "vendor-src",
    "venv",
}
VERB_COLUMNS = {"verb", "verbs", "lemma", "infinitive", "word", "fr", "french", "headword"}
POS_COLUMNS = {"pos", "part_of_speech", "upos"}
LANG_COLUMNS = {"lang", "language", "lang_code"}
PROMISING_NAME_TOKENS = {
    "verb": 30,
    "verbs": 35,
    "french": 20,
    "fr": 10,
    "lemma": 14,
    "lemmas": 14,
    "conjugation": 16,
    "conjugations": 16,
    "wordlist": 10,
    "frequency": 8,
}


@dataclass(frozen=True)
class VerbListCandidate:
    path: str
    format: str
    verb_column: str | None
    count: int
    score: float
    confidence: str
    sample: list[str]
    reason: str

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


def discover_verb_lists(root: Path) -> list[VerbListCandidate]:
    candidates: list[VerbListCandidate] = []
    for path in iter_candidate_files(root):
        candidate = inspect_candidate(path)
        if candidate and candidate.score >= 35 and candidate.count > 0:
            candidates.append(candidate)
    return sorted(candidates, key=lambda item: (-item.score, -item.count, item.path))


def iter_candidate_files(root: Path) -> Iterable[Path]:
    for path in root.rglob("*"):
        if any(should_skip_part(part) for part in path.parts):
            continue
        if path.is_file() and path.suffix.lower() in SUPPORTED_SUFFIXES:
            yield path


def should_skip_part(part: str) -> bool:
    return part in SKIP_DIRS or part.startswith("_") or part.startswith("build-") or part.startswith(".")


def inspect_candidate(path: Path) -> VerbListCandidate | None:
    try:
        info = load_verb_list_with_info(path)
    except (OSError, UnicodeDecodeError, json.JSONDecodeError, csv.Error):
        return None
    verbs = info["verbs"]
    column = info.get("verb_column")
    if not verbs:
        return None
    score, reason = score_candidate_file(path, column, info)
    confidence = "high" if score >= 85 else "medium" if score >= 55 else "low"
    return VerbListCandidate(
        path=str(path),
        format=path.suffix.lower().lstrip("."),
        verb_column=column,
        count=len(verbs),
        score=round(score, 2),
        confidence=confidence,
        sample=verbs[:8],
        reason=reason,
    )


def load_verb_list(path: str | Path, verb_column: str | None = None) -> list[str]:
    info = load_verb_list_with_info(Path(path), verb_column)
    return list(info["verbs"])


def load_verb_list_with_info(path: Path, verb_column: str | None = None) -> dict[str, Any]:
    suffix = path.suffix.lower()
    if suffix in {".csv", ".tsv"}:
        return load_delimited(path, delimiter="\t" if suffix == ".tsv" else ",", verb_column=verb_column)
    if suffix == ".json":
        return load_json(path, verb_column=verb_column)
    if suffix == ".jsonl":
        return load_jsonl(path, verb_column=verb_column)
    if suffix == ".txt":
        verbs = [display_word(line) for line in path.read_text(encoding="utf-8").splitlines()]
        return {"verbs": clean_verb_values(verbs), "verb_column": None, "pos_evidence": False}
    if suffix == ".js":
        return load_js_verbs(path, verb_column=verb_column)
    return {"verbs": [], "verb_column": None, "pos_evidence": False}


def load_delimited(path: Path, delimiter: str, verb_column: str | None = None) -> dict[str, Any]:
    with path.open("r", encoding="utf-8", newline="") as handle:
        sample = handle.read(4096)
        handle.seek(0)
        first_line = sample.splitlines()[0] if sample else ""
        first_cells = next(csv.reader([first_line], delimiter=delimiter), [])
        header_tokens = VERB_COLUMNS | POS_COLUMNS | LANG_COLUMNS
        has_obvious_header = any(cell.strip().lower() in header_tokens or cell.strip() == "" for cell in first_cells)
        has_header = has_obvious_header or (csv.Sniffer().has_header(sample) if sample else True)
        reader = csv.DictReader(handle, delimiter=delimiter) if has_header else None
        if reader is None:
            rows = list(csv.reader(handle, delimiter=delimiter))
            column = None
            verbs = [row[0] for row in rows if row]
            return {"verbs": clean_verb_values(verbs), "verb_column": column, "pos_evidence": "verb" in path.name.lower()}
        rows = list(reader)
    fieldnames = list(reader.fieldnames or [])
    column = choose_verb_column(fieldnames, verb_column)
    if column is None and fieldnames and fieldnames[0] == "" and "verb" in path.name.lower():
        column = fieldnames[0]
    if column is None:
        return {"verbs": [], "verb_column": None, "pos_evidence": False}
    pos_evidence = has_pos_verb_evidence(rows, fieldnames)
    lang_evidence = has_french_lang_evidence(rows, fieldnames)
    verbs = [row.get(column, "") for row in rows if row_passes_filters(row, fieldnames)]
    return {
        "verbs": clean_verb_values(verbs),
        "verb_column": column,
        "pos_evidence": pos_evidence,
        "lang_evidence": lang_evidence,
    }


def load_json(path: Path, verb_column: str | None = None) -> dict[str, Any]:
    data = json.loads(path.read_text(encoding="utf-8"))
    rows = json_to_rows(data)
    return rows_to_verbs(rows, verb_column)


def load_jsonl(path: Path, verb_column: str | None = None) -> dict[str, Any]:
    rows: list[dict[str, Any]] = []
    with path.open("r", encoding="utf-8") as handle:
        for line in handle:
            if line.strip():
                value = json.loads(line)
                if isinstance(value, dict):
                    rows.append(value)
    return rows_to_verbs(rows, verb_column)


def load_js_verbs(path: Path, verb_column: str | None = None) -> dict[str, Any]:
    text = path.read_text(encoding="utf-8")
    data = extract_first_js_array(text)
    rows = json_to_rows(data)
    return rows_to_verbs(rows, verb_column)


def extract_first_js_array(text: str) -> list[Any]:
    match = re.search(r"(?:const|let|var)\s+\w+\s*=\s*\[", text)
    if not match:
        return []
    start = text.find("[", match.start())
    depth = 0
    in_string = False
    escape = False
    quote = ""
    for index in range(start, len(text)):
        char = text[index]
        if in_string:
            if escape:
                escape = False
            elif char == "\\":
                escape = True
            elif char == quote:
                in_string = False
            continue
        if char in {'"', "'"}:
            in_string = True
            quote = char
        elif char == "[":
            depth += 1
        elif char == "]":
            depth -= 1
            if depth == 0:
                return json.loads(text[start : index + 1])
    return []


def json_to_rows(data: Any) -> list[dict[str, Any]]:
    if isinstance(data, list):
        return [item for item in data if isinstance(item, dict)]
    if isinstance(data, dict):
        if isinstance(data.get("entries"), dict):
            return [item for item in data["entries"].values() if isinstance(item, dict)]
        for key in ("verbs", "items", "data", "rows"):
            if isinstance(data.get(key), list):
                return [item for item in data[key] if isinstance(item, dict)]
        if any(key in data for key in VERB_COLUMNS):
            return [data]
    return []


def rows_to_verbs(rows: list[dict[str, Any]], verb_column: str | None = None) -> dict[str, Any]:
    if not rows:
        return {"verbs": [], "verb_column": None, "pos_evidence": False, "lang_evidence": False}
    keys = sorted({str(key) for row in rows for key in row.keys()})
    column = choose_verb_column(keys, verb_column)
    if column is None:
        return {"verbs": [], "verb_column": None, "pos_evidence": False, "lang_evidence": False}
    verbs = [row.get(column, "") for row in rows if row_passes_filters(row, keys)]
    return {
        "verbs": clean_verb_values(verbs),
        "verb_column": column,
        "pos_evidence": has_pos_verb_evidence(rows, keys),
        "lang_evidence": has_french_lang_evidence(rows, keys),
    }


def choose_verb_column(fieldnames: list[str], requested: str | None = None) -> str | None:
    if requested and requested in fieldnames:
        return requested
    lowered = {name.lower(): name for name in fieldnames}
    for candidate in ("verb", "infinitive", "lemma", "headword", "word", "fr", "french"):
        if candidate in lowered:
            return lowered[candidate]
    return None


def row_passes_filters(row: dict[str, Any], fieldnames: list[str]) -> bool:
    pos_columns = [name for name in fieldnames if name.lower() in POS_COLUMNS]
    if pos_columns:
        return any(str(row.get(name, "")).lower() in {"verb", "v", "verbs", "VERB".lower()} for name in pos_columns)
    lang_columns = [name for name in fieldnames if name.lower() in LANG_COLUMNS]
    if lang_columns:
        return any(str(row.get(name, "")).lower() in {"fr", "french", "fra"} for name in lang_columns)
    return True


def has_pos_verb_evidence(rows: list[dict[str, Any]], fieldnames: list[str]) -> bool:
    pos_columns = [name for name in fieldnames if name.lower() in POS_COLUMNS]
    return any(str(row.get(name, "")).lower() in {"verb", "v"} for row in rows[:200] for name in pos_columns)


def has_french_lang_evidence(rows: list[dict[str, Any]], fieldnames: list[str]) -> bool:
    lang_columns = [name for name in fieldnames if name.lower() in LANG_COLUMNS]
    return any(str(row.get(name, "")).lower() in {"fr", "french", "fra"} for row in rows[:200] for name in lang_columns)


def score_candidate_file(path: Path, column: str | None, info: dict[str, Any]) -> tuple[float, str]:
    name = path.name.lower()
    tokens = set(re.split(r"[^a-z0-9]+", name))
    score = 0.0
    reasons: list[str] = []
    for token, value in PROMISING_NAME_TOKENS.items():
        if token in tokens or token in name:
            score += value
            reasons.append(f"name:{token}")
    if column:
        if column.lower() in {"verb", "infinitive"}:
            score += 38
        elif column.lower() in VERB_COLUMNS:
            score += 28
        reasons.append(f"column:{column}")
    if info.get("pos_evidence"):
        score += 25
        reasons.append("pos:verb")
    if info.get("lang_evidence"):
        score += 10
        reasons.append("lang:fr")
    count = len(info.get("verbs") or [])
    if count >= 1000:
        score += 18
    elif count >= 100:
        score += 10
    elif count >= 10:
        score += 4
    if "generated" in name:
        score -= 6
        reasons.append("generated-penalty")
    if any(part in {"dist", "dist-cloudflare", "dist-gh"} for part in path.parts):
        score -= 30
        reasons.append("dist-penalty")
    if path.suffix.lower() == ".txt" and "verb" not in name:
        score -= 20
        reasons.append("txt-without-verb-penalty")
    if column and column.lower() in {"word", "headword", "fr", "french"} and not (
        {"verb", "verbs", "conjugation", "conjugations", "lemma", "lemmas"} & tokens
    ):
        score -= 25
        reasons.append("generic-word-column-penalty")
    return score, ", ".join(reasons)


def clean_verb_values(values: Iterable[Any]) -> list[str]:
    return stable_unique([text for value in values if (text := coerce_verb_value(value))])


def coerce_verb_value(value: Any) -> str | None:
    if isinstance(value, (dict, list, tuple, set)):
        return None
    text = display_word(value)
    if not text or len(text) > 48:
        return None
    lowered = normalize_word(text)
    if any(mark in text for mark in ".!?:;"):
        return None
    if " " in lowered and not (lowered.startswith("se ") or lowered.startswith("s'")):
        return None
    if sum(char.isalpha() for char in text) < 2:
        return None
    return text
