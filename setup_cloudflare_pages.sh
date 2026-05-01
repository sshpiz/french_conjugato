#!/bin/zsh
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
ENV_FILE="${CLOUDFLARE_ENV_FILE:-$ROOT_DIR/.cloudflare.env}"
PROJECT_NAME="${CLOUDFLARE_PAGES_PROJECT:-verbsfirst}"
PRODUCTION_BRANCH="${CLOUDFLARE_PRODUCTION_BRANCH:-production}"

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

echo "Ensuring Cloudflare Pages project exists: $PROJECT_NAME"
if npx --yes wrangler@latest pages project list | grep -E "^[[:space:]]*${PROJECT_NAME}[[:space:]]" >/dev/null 2>&1; then
  echo "Cloudflare Pages project already exists: $PROJECT_NAME"
else
  npx --yes wrangler@latest pages project create "$PROJECT_NAME" --production-branch "$PRODUCTION_BRANCH"
fi

echo "Ready. Deploy with: ./deploy_cloudflare_latest.sh"
