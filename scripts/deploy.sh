#!/usr/bin/env bash
# Builds the site and uploads it to the droplet over SSH.
set -euo pipefail

cd "$(dirname "$0")/.."

# The server's login and address stay out of the public repo: set DEPLOY_USER and
# DEPLOY_HOST in the environment, or in deploy.env.local (git ignores *.local files).
[ -f deploy.env.local ] && source deploy.env.local
: "${DEPLOY_USER:?Set DEPLOY_USER (in deploy.env.local or the environment)}"
: "${DEPLOY_HOST:?Set DEPLOY_HOST (in deploy.env.local or the environment)}"
HOST="$DEPLOY_USER@$DEPLOY_HOST"
DEST="${DEPLOY_PATH:-/var/www/zelda-timeline}"

# Build with the Node version pinned in .nvmrc.
source "${NVM_DIR:-$HOME/.nvm}/nvm.sh"
nvm use >/dev/null

[ -d node_modules ] || npm ci
npm run build

rsync -avz --delete dist/ "$HOST:$DEST/"

# macOS ships openrsync, which lacks --chmod, so set web-readable permissions remotely.
ssh "$HOST" "find '$DEST' -type d -exec chmod 755 {} + && find '$DEST' -type f -exec chmod 644 {} +"
echo "Deployed to $HOST:$DEST"
