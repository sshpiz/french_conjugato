#!/bin/zsh
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
ENV_FILE="${CLOUDFLARE_ENV_FILE:-$ROOT_DIR/.cloudflare.env}"
PROJECT_NAME="${CLOUDFLARE_PAGES_PROJECT:-verbsfirst}"

if [[ -f "$ENV_FILE" ]]; then
  set -a
  source "$ENV_FILE"
  set +a
fi

ACCOUNT_ID="${CLOUDFLARE_ACCOUNT_ID:-${ID:-}}"
API_TOKEN="${CLOUDFLARE_API_TOKEN:-${TOKEN:-}}"

if [[ -z "$ACCOUNT_ID" || -z "$API_TOKEN" ]]; then
  echo "Missing Cloudflare credentials. Set CLOUDFLARE_ACCOUNT_ID/CLOUDFLARE_API_TOKEN or ID/TOKEN in $ENV_FILE." >&2
  exit 1
fi

if [[ "$#" -eq 0 ]]; then
  set -- verbsfirst.com www.verbsfirst.com
fi

BASE_URL="https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/pages/projects/$PROJECT_NAME/domains"

add_domain() {
  local domain="$1"
  echo "Checking Pages custom domain: $domain"

  local list_response
  list_response="$(curl -fsS \
    -H "Authorization: Bearer $API_TOKEN" \
    -H "Content-Type: application/json" \
    "$BASE_URL")"

  if printf "%s" "$list_response" | grep -F "\"name\":\"$domain\"" >/dev/null || \
     printf "%s" "$list_response" | grep -F "\"name\": \"$domain\"" >/dev/null; then
    echo "Already attached: $domain"
    return
  fi

  echo "Attaching: $domain"
  curl -fsS \
    -H "Authorization: Bearer $API_TOKEN" \
    -H "Content-Type: application/json" \
    --data "{\"name\":\"$domain\"}" \
    "$BASE_URL" >/dev/null
  echo "Attached: $domain"
}

for domain in "$@"; do
  add_domain "$domain"
done

echo "Done. DNS/certificate activation may take a few minutes in Cloudflare."
