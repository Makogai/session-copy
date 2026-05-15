# Changelog

All notable changes to **Session Copy** are documented here.  
Format follows [Keep a Changelog](https://keepachangelog.com/). Version JSON in [`changelog/`](changelog/) powers the in-extension “What’s new” card.

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
