#!/bin/zsh
set -euo pipefail

ROOT="/Users/simeon/Desktop/proj1"
PYTHON_BIN="${PYTHON_BIN:-$ROOT/venv/bin/python3}"
MODEL="${MODEL:-gpt-5.4}"
REASONING_EFFORT="${REASONING_EFFORT:-medium}"

exec "$PYTHON_BIN" "$ROOT/generate_multilang_verb_glosses.py" \
  --model "$MODEL" \
  --reasoning-effort "$REASONING_EFFORT" \
  --resume \
  "$@"
