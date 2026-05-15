#!/usr/bin/env bash
# Build dist/staging and dist/session-copy-v{version}.zip (Chrome Web Store layout).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

VERSION="${1:-}"
if [ -z "$VERSION" ]; then
  if command -v node >/dev/null 2>&1; then
    VERSION="$(node -p "require('./manifest.json').version")"
  else
    VERSION="$(python3 -c "import json; print(json.load(open('manifest.json'))['version'])")"
  fi
fi

OUT="$ROOT/dist"
STAGE="$OUT/staging"
ZIP="$OUT/session-copy-v${VERSION}.zip"

echo "Building store package v${VERSION}..."

rm -rf "$STAGE"
mkdir -p "$OUT"

cp manifest.json "$STAGE/"
cp -r assets src changelog "$STAGE/"
[ -f LICENSE ] && cp LICENSE "$STAGE/"

rm -f "$ZIP"
(cd "$STAGE" && zip -qr "$ZIP" . -x "*.DS_Store")

echo "ZIP=$ZIP"
echo "STAGE=$STAGE"
echo "VERSION=$VERSION"
