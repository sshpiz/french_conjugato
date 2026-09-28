#!/bin/zsh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
REPOS_ROOT="$(cd "$ROOT/.." && pwd)"
PYTHON="$ROOT/venv/bin/python3"
LOG_ROOT="${TTS_LOG_ROOT:-$REPOS_ROOT/tts-refresh-logs}"
mkdir -p "$LOG_ROOT"

LANG_ORDER=(
  french
  spanish
  italian
  portuguese
  russian
  greek
  catalan
  ukrainian
  latvian
)

FROM_LANG=""
DRY_RUN=0
REQUESTED_LANGS=()

usage() {
  cat <<EOF
Usage:
  ./run_all_tts_refreshes.sh
  ./run_all_tts_refreshes.sh --from spanish
  ./run_all_tts_refreshes.sh french spanish portuguese
  ./run_all_tts_refreshes.sh --dry-run --from portuguese

Notes:
  - Uses: $PYTHON
  - Logs append under: $LOG_ROOT
  - Builders reuse generated_tts_cache/clips, so reruns keep completed clip work.
EOF
}

while (( $# > 0 )); do
  case "$1" in
    --from)
      if (( $# < 2 )); then
        echo "--from requires a language label" >&2
        usage
        exit 2
      fi
      FROM_LANG="$2"
      shift 2
      ;;
    --dry-run)
      DRY_RUN=1
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      REQUESTED_LANGS+=("$1")
      shift
      ;;
  esac
done

if [[ ! -x "$PYTHON" ]]; then
  echo "Python not found or not executable: $PYTHON" >&2
  exit 1
fi

contains_lang() {
  local needle="$1"
  shift
  local item
  for item in "$@"; do
    [[ "$item" == "$needle" ]] && return 0
  done
  return 1
}

validate_lang() {
  local label="$1"
  if ! contains_lang "$label" "${LANG_ORDER[@]}"; then
    echo "Unknown language label: $label" >&2
    echo "Known labels: ${LANG_ORDER[*]}" >&2
    exit 2
  fi
}

if [[ -n "$FROM_LANG" ]]; then
  validate_lang "$FROM_LANG"
fi

for label in "${REQUESTED_LANGS[@]}"; do
  validate_lang "$label"
done

should_run_lang() {
  local label="$1"
  local started="$2"

  if (( ${#REQUESTED_LANGS[@]} > 0 )) && ! contains_lang "$label" "${REQUESTED_LANGS[@]}"; then
    return 1
  fi

  if [[ -n "$FROM_LANG" && "$started" != "1" ]]; then
    return 1
  fi

  return 0
}

run_builder() {
  local label="$1"
  local repo_dir="$2"
  local builder="$3"
  local log_file="$LOG_ROOT/${label}.log"

  echo
  echo "=== ${label} ==="
  echo "repo: ${repo_dir}"
  echo "builder: ${builder}"
  echo "log: ${log_file}"

  if [[ ! -f "$builder" ]]; then
    echo "SKIP ${label}: builder not found"
    return 0
  fi

  if (( DRY_RUN )); then
    echo "DRY RUN: would run ${label}"
    return 0
  fi

  (
    echo
    echo "===== $(date '+%F %T') ${label} ====="
    cd "$repo_dir"
    echo "[$(date '+%F %T')] START ${label}"
    if "$PYTHON" "$builder" --regenerate-inventory; then
      :
    else
      status=$?
      echo "[$(date '+%F %T')] retrying ${label} without --regenerate-inventory (exit ${status})"
      "$PYTHON" "$builder"
    fi
    echo "[$(date '+%F %T')] DONE ${label}"
  ) 2>&1 | tee -a "$log_file"
}

started=0
if [[ -z "$FROM_LANG" ]]; then
  started=1
fi

for label in "${LANG_ORDER[@]}"; do
  if [[ "$label" == "$FROM_LANG" ]]; then
    started=1
  fi

  if ! should_run_lang "$label" "$started"; then
    continue
  fi

  case "$label" in
    french)
      run_builder "french" "$ROOT" "$ROOT/build_french_tts.py"
      ;;
    spanish)
      run_builder "spanish" "$REPOS_ROOT/spanish-verbs" "$REPOS_ROOT/spanish-verbs/build_spanish_tts.py"
      ;;
    italian)
      run_builder "italian" "$REPOS_ROOT/italian-verbs" "$REPOS_ROOT/italian-verbs/build_italian_tts.py"
      ;;
    portuguese)
      run_builder "portuguese" "$REPOS_ROOT/portuguese-verbs" "$REPOS_ROOT/portuguese-verbs/build_portuguese_tts.py"
      ;;
    russian)
      run_builder "russian" "$REPOS_ROOT/russian-verbs" "$REPOS_ROOT/russian-verbs/build_russian_tts.py"
      ;;
    greek)
      run_builder "greek" "$REPOS_ROOT/greek-verbs" "$REPOS_ROOT/greek-verbs/build_greek_tts.py"
      ;;
    catalan)
      run_builder "catalan" "$REPOS_ROOT/catalan-verbs" "$REPOS_ROOT/catalan-verbs/build_catalan_tts.py"
      ;;
    ukrainian)
      run_builder "ukrainian" "$REPOS_ROOT/ukrainian-verbs" "$REPOS_ROOT/ukrainian-verbs/build_ukrainian_tts.py"
      ;;
    latvian)
      run_builder "latvian" "$REPOS_ROOT/latvian-verbs" "$REPOS_ROOT/latvian-verbs/build_latvian_tts.py"
      ;;
  esac
done

echo
echo "=== german ==="
echo "SKIP german: no packaged TTS builder is wired yet"
echo "logs are in: $LOG_ROOT"
