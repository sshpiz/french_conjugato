#!/usr/bin/env python3
"""Create per-language sibling latest app channels from the built dist output.

The latest channel should be a fresh app copy without duplicating large TTS
payloads. Packaged audio is resolved from the stable sibling app directory:
  /french_latest/ -> /french/tts/
"""

from __future__ import annotations

import json
import os
import re
import shutil
from pathlib import Path


ROOT = Path(__file__).resolve().parent
DIST = ROOT / "dist"
DIST_GH = ROOT / "dist-gh"

LANGS = [
    "french",
    "spanish",
    "german",
    "portugese",
    "italian",
    "greek",
    "catalan",
    "latvian",
    "russian",
    "ukrainian",
]

EXCLUDED_DIRS = {"latest", "tts"}
EXCLUDED_FILES = {".DS_Store"}


def copy_without_excluded_dirs(src: Path, dest: Path) -> None:
    if dest.exists():
        shutil.rmtree(dest)
    dest.mkdir(parents=True, exist_ok=True)

    for item in src.iterdir():
        if item.name in EXCLUDED_FILES:
            continue
        if item.is_file() and item.suffix == ".html" and item.name != "index.html":
            continue
        if item.is_dir() and item.name in EXCLUDED_DIRS:
            continue
        target = dest / item.name
        if item.is_dir():
            shutil.copytree(item, target, ignore=shutil.ignore_patterns(*EXCLUDED_FILES))
        else:
            shutil.copy2(item, target)


def remove_latest_seo(html_path: Path) -> None:
    text = html_path.read_text(encoding="utf-8")
    text = re.sub(
        r"\n?\s*<!-- latest-channel seo -->\n\s*<meta name=\"robots\" content=\"noindex, nofollow\">\n\s*<link rel=\"canonical\" href=\"/[^\"]+/\">",
        "",
        text,
    )
    html_path.write_text(text, encoding="utf-8")


def latest_slug(lang: str) -> str:
    return f"{lang}_latest"


def patch_manifest(manifest_path: Path, lang: str) -> None:
    if not manifest_path.exists():
        return
    data = json.loads(manifest_path.read_text(encoding="utf-8"))
    base_name = str(data.get("name") or "VerbsFirst").strip()
    base_short_name = str(data.get("short_name") or base_name).strip()
    latest_name = f"{base_name} Latest"
    latest_short_name = f"{base_short_name} Latest"

    data["name"] = latest_name
    data["short_name"] = latest_short_name
    data["id"] = f"/{latest_slug(lang)}/"
    data["start_url"] = "./"
    data["scope"] = "./"
    manifest_path.write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


def patch_service_worker(sw_path: Path, lang: str) -> None:
    if not sw_path.exists():
        return
    text = sw_path.read_text(encoding="utf-8")
    text = re.sub(
        r"const CACHE_PREFIX = ['\"][^'\"]+['\"];",
        f"const CACHE_PREFIX = '{lang}-latest-app-cache-';",
        text,
        count=1,
    )
    sw_path.write_text(text, encoding="utf-8")


def patch_html_identity(html_path: Path, lang: str) -> None:
    text = html_path.read_text(encoding="utf-8")
    updated = text
    title_suffix = " Latest"

    updated = re.sub(
        r"(<title>)(.*?)(</title>)",
        lambda match: match.group(0)
        if match.group(2).strip().endswith(title_suffix)
        else f"{match.group(1)}{match.group(2).strip()}{title_suffix}{match.group(3)}",
        updated,
        count=1,
        flags=re.IGNORECASE | re.DOTALL,
    )
    updated = re.sub(
        r'(<meta\s+name="apple-mobile-web-app-title"\s+content=")([^"]*)(")',
        lambda match: match.group(0)
        if match.group(2).strip().endswith(title_suffix)
        else f"{match.group(1)}{match.group(2).strip()}{title_suffix}{match.group(3)}",
        updated,
        count=1,
        flags=re.IGNORECASE,
    )
    updated = re.sub(
        r"(window\.appStoragePrefix\s*=\s*)['\"][^'\"]+['\"](\s*;)",
        rf"\1'{latest_slug(lang)}'\2",
        updated,
        count=1,
    )
    if updated != text:
        html_path.write_text(updated, encoding="utf-8")


def patch_tts_references(text_path: Path, lang: str) -> None:
    text = text_path.read_text(encoding="utf-8")
    updated = text
    stable_tts_prefix = f"../{lang}/tts/"
    replacements = {
        "'tts/manifest.json'": f"'{stable_tts_prefix}manifest.json'",
        '"tts/manifest.json"': f'"{stable_tts_prefix}manifest.json"',
        "`tts/${": f"`{stable_tts_prefix}${{",
        "'tts/": f"'{stable_tts_prefix}",
        '"tts/': f'"{stable_tts_prefix}',
    }
    for old, new in replacements.items():
        updated = updated.replace(old, new)
    if updated != text:
        text_path.write_text(updated, encoding="utf-8")


def patch_latest_tree(latest_dir: Path, lang: str) -> None:
    patch_manifest(latest_dir / "manifest.json", lang)
    patch_service_worker(latest_dir / "sw.js", lang)

    for html_path in latest_dir.rglob("*.html"):
        remove_latest_seo(html_path)
        patch_html_identity(html_path, lang)
        patch_tts_references(html_path, lang)

    for js_path in latest_dir.rglob("*.js"):
        patch_tts_references(js_path, lang)


def target_roots() -> list[Path]:
    explicit_targets = [
        Path(raw.strip()).expanduser().resolve()
        for raw in os.environ.get("LATEST_CHANNEL_TARGETS_ONLY", "").split(os.pathsep)
        if raw.strip()
    ]
    if explicit_targets:
        return explicit_targets

    roots = [DIST]
    if DIST_GH.exists():
        roots.append(DIST_GH)
    for raw in os.environ.get("LATEST_CHANNEL_TARGETS", "").split(os.pathsep):
        if raw.strip():
            roots.append(Path(raw.strip()).expanduser().resolve())
    return roots


def main() -> None:
    source_root = Path(os.environ.get("LATEST_CHANNEL_SOURCE", DIST)).resolve()
    copied: list[str] = []
    for lang in LANGS:
        src = source_root / lang
        if not src.exists():
            print(f"skip {lang}: no source at {src}")
            continue
        for root in target_roots():
            dest = root / latest_slug(lang)
            copy_without_excluded_dirs(src, dest)
            patch_latest_tree(dest, lang)
            copied.append(str(dest))
            print(f"latest {lang}: {dest}")
    print(f"created {len(copied)} latest channel directories")


if __name__ == "__main__":
    main()
