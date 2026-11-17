#!/usr/bin/env bash
# Builds the site and uploads it to the droplet over SSH.
set -euo pipefail

HOST="${DEPLOY_HOST:-user@server}"
DEST="${DEPLOY_PATH:-/var/www/zelda-timeline}"

cd "$(dirname "$0")/.."

# Build with the Node version pinned in .nvmrc.
source "${NVM_DIR:-$HOME/.nvm}/nvm.sh"
nvm use >/dev/null

[ -d node_modules ] || npm ci
npm run build

rsync -avz --delete dist/ "$HOST:$DEST/"

# macOS ships openrsync, which lacks --chmod, so set web-readable permissions remotely.
ssh "$HOST" "find '$DEST' -type d -exec chmod 755 {} + && find '$DEST' -type f -exec chmod 644 {} +"
echo "Deployed to $HOST:$DEST"
