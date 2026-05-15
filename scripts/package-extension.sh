#!/usr/bin/env bash
# Builds session-copy-v{version}.zip for Chrome Web Store upload.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
chmod +x "$ROOT/scripts/build-store-zip.sh"
"$ROOT/scripts/build-store-zip.sh"
VERSION="$(node -p "require('$ROOT/manifest.json').version")"
echo ""
echo "Created: $ROOT/dist/session-copy-v${VERSION}.zip"
echo "Upload at: https://chrome.google.com/webstore/devconsole"
