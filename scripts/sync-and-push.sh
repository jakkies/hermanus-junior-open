#!/bin/zsh

set -euo pipefail

RUNTIME_DIR="/Users/jakkies/Library/Application Support/HermanusJuniorOpenSync"
PROJECT_DIR="$RUNTIME_DIR/repo"
REPOSITORY_URL="https://github.com/jakkies/hermanus-junior-open.git"
RESULTS_FILE="js/captured-results.json"
CURRENT_DAY="$(TZ=Africa/Johannesburg /bin/date +%Y-%m-%d)"

if [[ "$CURRENT_DAY" < "2026-09-04" || "$CURRENT_DAY" > "2026-09-06" ]]; then
  exit 0
fi

if [[ ! -d "$PROJECT_DIR/.git" ]]; then
  /usr/bin/git clone "$REPOSITORY_URL" "$PROJECT_DIR"
fi

cd "$PROJECT_DIR"

/usr/bin/git pull --ff-only origin main

if [[ ! -d node_modules || package-lock.json -nt node_modules/.package-lock.json ]]; then
  /usr/local/bin/npm ci
fi

if [[ "$(/usr/bin/git branch --show-current)" != "main" ]]; then
  echo "SportyHQ sync skipped because the checked-out branch is not main."
  exit 1
fi

/usr/local/bin/npm run sync:sportyhq

if /usr/bin/git diff --quiet -- "$RESULTS_FILE"; then
  echo "No SportyHQ score changes to publish."
  exit 0
fi

/usr/local/bin/npm test
/usr/bin/git config user.name "Hermanus Score Sync"
/usr/bin/git config user.email "jakkies@Jakkies-MacBook-Pro-2.local"
/usr/bin/git add "$RESULTS_FILE"
/usr/bin/git commit -m "Auto-sync SportyHQ results"
/usr/bin/git push origin main
