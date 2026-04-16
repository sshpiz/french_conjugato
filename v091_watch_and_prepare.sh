#!/bin/zsh
set -euo pipefail

PROJ1_DIR="/Users/simeon/Desktop/proj1"
GREEK_DIR="/Users/simeon/Desktop/greek-verbs"
PORTUGUESE_DIR="/Users/simeon/Desktop/portuguese-verbs"
RUSSIAN_DIR="/Users/simeon/Desktop/russian-verbs"
LOG_FILE="$PROJ1_DIR/v091_watch.log"

GREEK_PID="42140"
PORTUGUESE_PID="11532"
POLL_SECONDS="60"

timestamp() {
  date +"%Y-%m-%d %H:%M:%S"
}

log() {
  printf '[%s] %s\n' "$(timestamp)" "$*" | tee -a "$LOG_FILE"
}

process_alive() {
  local pid="$1"
  ps -axo pid,command | rg -q "^[[:space:]]*${pid}[[:space:]]"
}

manifest_summary() {
  local manifest_path="$1"
  local label="$2"
  if [[ -f "$manifest_path" ]]; then
    /usr/bin/python3 - <<'PY' "$manifest_path" "$label" 2>/dev/null | tee -a "$LOG_FILE"
import json, sys, pathlib
manifest = json.loads(pathlib.Path(sys.argv[1]).read_text(encoding="utf-8"))
packs = manifest.get("packs") or {}
print(f"[{sys.argv[2]}] layout={manifest.get('layout')} engine={manifest.get('engine')} voice={manifest.get('voice')} packs={len(packs)}")
PY
  else
    log "$label manifest missing: $manifest_path"
  fi
}

log "v0.91 watcher started. Monitoring greek pid=$GREEK_PID and portuguese pid=$PORTUGUESE_PID"

while process_alive "$GREEK_PID" || process_alive "$PORTUGUESE_PID"; do
  local_status=()
  if process_alive "$GREEK_PID"; then
    local_status+=("greek:running")
  else
    local_status+=("greek:done")
  fi
  if process_alive "$PORTUGUESE_PID"; then
    local_status+=("portuguese:running")
  else
    local_status+=("portuguese:done")
  fi
  log "waiting... ${local_status[*]}"
  sleep "$POLL_SECONDS"
done

log "Both TTS jobs finished. Starting post-run verification."

manifest_summary "$GREEK_DIR/generated_tts/manifest.json" "greek generated"
manifest_summary "$GREEK_DIR/dist/tts/manifest.json" "greek dist"
manifest_summary "$PORTUGUESE_DIR/generated_tts/manifest.json" "portuguese generated"

if [[ ! -f "$GREEK_DIR/dist/tts/manifest.json" ]]; then
  log "Greek dist manifest missing. Re-running packed Greek rebuild."
  (
    cd "$GREEK_DIR"
    /usr/bin/python3 rebuild_greek_packed_tts.py --voice-name Melina
  ) >>"$LOG_FILE" 2>&1
fi

log "Rebuilding Portuguese app bundle from current source + generated_tts."
(
  cd "$PORTUGUESE_DIR"
  /usr/bin/python3 build.py
) >>"$LOG_FILE" 2>&1

log "Syncing Greek and Portuguese dist outputs into French deploy tree."
rsync -a --delete "$GREEK_DIR/dist/" "$PROJ1_DIR/dist/greek/" >>"$LOG_FILE" 2>&1
rsync -a --delete "$PORTUGUESE_DIR/dist/" "$PROJ1_DIR/dist/portugese/" >>"$LOG_FILE" 2>&1
if [[ -d "$RUSSIAN_DIR/dist" ]]; then
  rsync -a --delete "$RUSSIAN_DIR/dist/" "$PROJ1_DIR/dist/russian/" >>"$LOG_FILE" 2>&1
fi

log "Rebuilding French deploy hub."
(
  cd "$PROJ1_DIR"
  /usr/bin/python3 build.py
) >>"$LOG_FILE" 2>&1

log "Refreshing shared sibling app mirrors."
(
  cd "$PROJ1_DIR"
  ./sync_shared_apps.sh
) >>"$LOG_FILE" 2>&1

log "Refreshing dist-gh from fresh deploy output."
rsync -a --delete --exclude '.git' "$PROJ1_DIR/dist/" "$PROJ1_DIR/dist-gh/" >>"$LOG_FILE" 2>&1

log "v0.91 watcher finished the safe build/sync steps."
