#!/usr/bin/env python3
"""
Helpers for loading OPENAI_API_KEY in unattended/local-script contexts.
"""

from __future__ import annotations

import os
import re
from pathlib import Path


OPENAI_KEY_RE = re.compile(r"""^\s*export\s+OPENAI_API_KEY\s*=\s*(['"]?)(.+?)\1\s*$""")
DEFAULT_CANDIDATES = (
    Path.home() / ".config" / "openai" / "env",
    Path.home() / ".env.openai",
    Path.home() / ".zshrc",
)


def _extract_openai_key(path: Path) -> str | None:
    if not path.exists() or not path.is_file():
        return None

    try:
        lines = path.read_text(encoding="utf-8").splitlines()
    except OSError:
        return None

    found: str | None = None
    for line in lines:
        match = OPENAI_KEY_RE.match(line.strip())
        if match:
            found = match.group(2).strip()
    return found or None


def load_openai_api_key() -> str | None:
    existing = os.environ.get("OPENAI_API_KEY")
    if existing:
        return existing

    for candidate in DEFAULT_CANDIDATES:
        key = _extract_openai_key(candidate)
        if key:
            os.environ["OPENAI_API_KEY"] = key
            return key
    return None
