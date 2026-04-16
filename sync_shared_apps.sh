#!/bin/zsh
set -euo pipefail

PROJ1_DIR="/Users/simeon/Desktop/proj1"
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

  rsync -a --delete "$source_dist/" "$DIST_DIR/$target_name/"
  if [[ -d "$DIST_GH_DIR" ]]; then
    rsync -a --delete "$source_dist/" "$DIST_GH_DIR/$target_name/"
  fi

  if [[ -f "$source_dist/$standalone_name" ]]; then
    cp "$source_dist/$standalone_name" "$DIST_DIR/$standalone_name"
    if [[ -d "$DIST_GH_DIR" ]]; then
      cp "$source_dist/$standalone_name" "$DIST_GH_DIR/$standalone_name"
    fi
  else
    echo "warning: missing standalone for $target_name: $source_dist/$standalone_name" >&2
  fi
}

sync_app "/Users/simeon/Desktop/greek-verbs/dist" "greek" "greekonjugation.html"
sync_app "/Users/simeon/Desktop/portuguese-verbs/dist" "portugese" "portoconjugue.html"
sync_app "/Users/simeon/Desktop/russian-verbs/dist" "russian" "glagoly.html"

cp "$DIST_DIR/index.html" "$DIST_GH_DIR/index.html" 2>/dev/null || true
cp "$DIST_DIR/franconjugue.html" "$DIST_GH_DIR/franconjugue.html" 2>/dev/null || true
cp "$DIST_DIR/french/index.html" "$DIST_GH_DIR/french/index.html" 2>/dev/null || true
