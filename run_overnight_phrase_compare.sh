#!/bin/zsh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$SCRIPT_DIR"
RUNNER="$PROJECT_DIR/run_phrase_harvest_model_comparison.py"
PYTHON_BIN="$PROJECT_DIR/venv/bin/python3"
OUT_ROOT="$PROJECT_DIR/overnight_phrase_harvest_compare"

if [[ -f "$HOME/.zshrc" ]]; then
  source "$HOME/.zshrc"
fi

if [[ -z "${OPENAI_API_KEY:-}" ]]; then
  echo "OPENAI_API_KEY is not set after sourcing ~/.zshrc" >&2
  exit 1
fi

mkdir -p "$OUT_ROOT"

cd "$PROJECT_DIR"
exec "$PYTHON_BIN" "$RUNNER" --first-n 10 --target-per-verb 10 "$@"
