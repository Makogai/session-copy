#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
chmod +x "$ROOT/scripts/build-store-zip.sh"
"$ROOT/scripts/build-store-zip.sh"
VERSION="$(node -p "require('$ROOT/package.json').version")"
echo ""
echo "Created: $ROOT/release/session-copy-v${VERSION}.zip"
echo "Load unpacked: $ROOT/dist"
echo "Upload at: https://chrome.google.com/webstore/devconsole"
