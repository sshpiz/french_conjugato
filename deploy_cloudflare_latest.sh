#!/bin/zsh
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
ENV_FILE="${CLOUDFLARE_ENV_FILE:-$ROOT_DIR/.cloudflare.env}"
PROJECT_NAME="${CLOUDFLARE_PAGES_PROJECT:-verbsfirst}"
DEPLOY_BRANCH="${CLOUDFLARE_DEPLOY_BRANCH:-production}"
DEPLOY_DIR="${CLOUDFLARE_DEPLOY_DIR:-$ROOT_DIR/dist-cloudflare}"

if [[ -f "$ENV_FILE" ]]; then
  set -a
  source "$ENV_FILE"
  set +a
fi

export CLOUDFLARE_ACCOUNT_ID="${CLOUDFLARE_ACCOUNT_ID:-${ID:-}}"
export CLOUDFLARE_API_TOKEN="${CLOUDFLARE_API_TOKEN:-${TOKEN:-}}"

if [[ -z "$CLOUDFLARE_ACCOUNT_ID" || -z "$CLOUDFLARE_API_TOKEN" ]]; then
  echo "Missing Cloudflare credentials. Set CLOUDFLARE_ACCOUNT_ID/CLOUDFLARE_API_TOKEN or ID/TOKEN in $ENV_FILE." >&2
  exit 1
fi

cd "$ROOT_DIR"

echo "Building VerbsFirst dist..."
python3 build.py

echo "Preparing Cloudflare deploy directory: $DEPLOY_DIR"
rm -rf "$DEPLOY_DIR"
rsync -a --delete \
  --exclude 'reference/' \
  --exclude '*/tts/' \
  --exclude '*/latest/' \
  dist/ "$DEPLOY_DIR/"

echo "Ensuring bulky/generated folders are excluded from Cloudflare deploy directory..."
rm -rf "$DEPLOY_DIR/reference"
find "$DEPLOY_DIR" -path '*/tts' -type d -prune -exec rm -rf {} +
find "$DEPLOY_DIR" -path '*/latest' -type d -prune -exec rm -rf {} +

echo "Creating sibling latest apps..."
LATEST_CHANNEL_TARGETS_ONLY="$DEPLOY_DIR" python3 sync_latest_channels.py

echo "Deploying to Cloudflare Pages project: $PROJECT_NAME branch: $DEPLOY_BRANCH"
npx --yes wrangler@latest pages deploy "$DEPLOY_DIR" --project-name "$PROJECT_NAME" --branch "$DEPLOY_BRANCH" --commit-dirty=true
