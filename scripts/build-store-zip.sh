#!/usr/bin/env bash
# Build extension (npm) and zip dist/ for Chrome Web Store upload.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

VERSION="${1:-}"
if [ -z "$VERSION" ]; then
  VERSION="$(node -p "require('./package.json').version")"
fi

echo "Building session-copy v${VERSION}..."
npm run package

ZIP="$ROOT/release/session-copy-v${VERSION}.zip"
if [ ! -f "$ZIP" ]; then
  echo "error: expected $ZIP" >&2
  exit 1
fi

echo "ZIP=$ZIP"
echo "VERSION=$VERSION"
