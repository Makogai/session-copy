# Changelog

All notable changes to **Session Copy** are documented here.  
Format follows [Keep a Changelog](https://keepachangelog.com/). Version JSON in [`changelog/`](changelog/) powers the in-extension “What’s new” card.

## [2.3.1] — 2026-05-18

### Fixed
- **Extension package size** — build copies only `assets/icons/` and `assets/images/logo512.png`; Chrome Web Store screenshots and promo images are kept in the repo but excluded from `dist/` (~3 MB → ~80 KB ZIP).

## [2.3.0] — 2026-05-17

### Added
- **Light / dark themes** in the popup — defaults to system; override in Settings (System, Light, Dark).
- **Clear site data** tab (plus shortcuts on Home and Settings) to reset cookies and storage for the active tab.

### Changed
- Popup rebuilt with **Vue 3** and **TypeScript** (`src/popup/`); esbuild bundles into `dist/popup/`.
- GitHub Pages site: light/dark themes, expanded features, version badge (`docs/version.json` synced on build).
- Dev watch mode updates `dist/manifest.json` when `package.json` version changes.

## [2.2.0] — 2026-05-15

### Added
- **Clear site data** — reset cookies and storage for the active tab; dedicated Clear tab plus Home/Settings shortcuts.
- **npm + esbuild** build pipeline (`src/` → `dist/`); `npm run package` produces `release/session-copy-v*.zip`.

### Fixed
- Session copy after release bundling (injected script uses `window.localStorage` / `window.sessionStorage`).
- Bottom navigation layout with four tabs.

### Changed
- GitHub Actions release workflow uses `npm run package` instead of legacy shell-only packaging.

## [2.1.4] — 2026-05-15

### Added
- `scripts/package-extension.ps1` and `scripts/build-store-zip.sh` for Web Store ZIP builds.
- GitHub Actions workflow uploads `session-copy-v*.zip` on each published release.
- Optional `.crx` build when `SESSION_COPY_PEM_BASE64` repository secret is set.

## [2.1.3] — 2026-05-15

### Added
- GitHub Pages: [Privacy](https://makogai.github.io/session-copy/privacy.html) page and **Releases** section on the site.
- Updated extension toolbar icons and logo assets.

### Changed
- Extension Info → Privacy link points to the hosted policy page.

## [2.1.2] — 2026-05-15

### Changed
- Compact Info link rows with icons (GitHub, website, privacy, issues).
- “What’s new” shows only the latest release; full history on GitHub Releases.
- Improved Info layout for a smaller, store-ready popup.

### Added
- GitHub Pages landing site at [makogai.github.io/session-copy](https://makogai.github.io/session-copy/).

## [2.1.1] — 2026-05-15

### Added
- Bottom navigation: Home, Settings, and Info panels.
- Settings panel for capture options and incognito tip.
- Info panel with version, links, and release highlights.

## [2.1.0] — 2026-05-15

### Changed
- New Session Copy visual design (brand colors, logo, polished layout).
- Replaced verbose warning block with a short footnote.
- Popup split into focused modules (actions, UI, preferences, changelog).
- Custom toggle switches and clearer status feedback.

## [2.0.0] — 2026-05-14

### Changed
- **Offline-first:** removed Firebase; sessions encrypted locally only (clipboard or `.session` file).
- New pack format `sc:v2:` (gzip + AES-GCM); auto file export when clipboard token is too large.
- HttpOnly cookies restored via `chrome.cookies.set` in the service worker.
- Login-focused filters for smaller, auth-oriented payloads.
- New popup with import/export for encrypted session files.

## [1.4.0] — 2026-01-27

### Changed
- ChatGPT-optimized compression (essential auth keys only, no sessionStorage).
- Refined cookie filtering for ChatGPT; Firestore size limits.
- Copy logic refactored for MV3 reliability.

## [1.3.0] — 2025-01-27

See [`changelog/1.3.0.json`](changelog/1.3.0.json).

## [1.2.0] — 2025-01-27

See [`changelog/1.2.0.json`](changelog/1.2.0.json).

## [1.1.0] — 2024-03-06

See [`changelog/1.1.0.json`](changelog/1.1.0.json).

## [1.0.0] — 2024-03-06

### Added
- Initial release: copy/paste localStorage, sessionStorage, and cookies for the active site.
- Base64 clipboard export; origin validation on paste.
- Console logging for restore traceability.
