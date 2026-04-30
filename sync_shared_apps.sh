#!/bin/zsh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPOS_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
PROJ1_DIR="$SCRIPT_DIR"
DIST_DIR="$PROJ1_DIR/dist"
DIST_GH_DIR="$PROJ1_DIR/dist-gh"

sync_app() {
  local source_dist="$1"
  local target_name="$2"
  local standalone_name="$3"

  if [[ ! -d "$source_dist" ]]; then
    echo "warning: missing source dist for $target_name: $source_dist" >&2
    return 1
  fi

  rsync -a --delete --exclude latest "$source_dist/" "$DIST_DIR/$target_name/"
  if [[ -d "$DIST_GH_DIR" ]]; then
    rsync -a --delete --exclude latest "$source_dist/" "$DIST_GH_DIR/$target_name/"
  fi

  if [[ -f "$source_dist/$standalone_name" ]]; then
    cp "$source_dist/$standalone_name" "$DIST_DIR/$standalone_name"
    if [[ -d "$DIST_GH_DIR" ]]; then
      cp "$source_dist/$standalone_name" "$DIST_GH_DIR/$standalone_name"
    fi
  else
    echo "warning: missing standalone for $target_name: $source_dist/$standalone_name" >&2
  fi

  ensure_favicon_alias "$DIST_DIR/$target_name"
  if [[ -d "$DIST_GH_DIR" ]]; then
    ensure_favicon_alias "$DIST_GH_DIR/$target_name"
  fi
}

ensure_favicon_alias() {
  local target_dir="$1"
  local canonical="$target_dir/favicon_big.png"

  if [[ -f "$canonical" ]]; then
    return
  fi

  local candidates=("$target_dir"/favicon_*.png "$target_dir"/favicon.png)
  for candidate in "${candidates[@]}"; do
    if [[ -f "$candidate" ]]; then
      cp "$candidate" "$canonical"
      return
    fi
  done
}

sync_app "$REPOS_ROOT/greek-verbs/dist" "greek" "greekonjugation.html"
sync_app "$REPOS_ROOT/portuguese-verbs/dist" "portugese" "portoconjugue.html"
sync_app "$REPOS_ROOT/russian-verbs/dist" "russian" "glagoly.html"
sync_app "$REPOS_ROOT/spanish-verbs/dist" "spanish" "conjugaespanol.html"
sync_app "$REPOS_ROOT/catalan-verbs/dist" "catalan" "catalanjugacio.html"
sync_app "$REPOS_ROOT/ukrainian-verbs/dist" "ukrainian" "dieslova.html"
sync_app "$REPOS_ROOT/latvian-verbs/dist" "latvian" "darbibasvardi.html"
sync_app "$REPOS_ROOT/german-verbs/dist" "german" "dieverben.html"
sync_app "$REPOS_ROOT/italian-verbs/dist" "italian" "iverbi.html"

cp "$DIST_DIR/index.html" "$DIST_GH_DIR/index.html" 2>/dev/null || true
cp "$DIST_DIR/franconjugue.html" "$DIST_GH_DIR/franconjugue.html" 2>/dev/null || true
if [[ -d "$DIST_DIR/french" && -d "$DIST_GH_DIR" ]]; then
  rsync -a --delete --exclude latest "$DIST_DIR/french/" "$DIST_GH_DIR/french/"
fi
