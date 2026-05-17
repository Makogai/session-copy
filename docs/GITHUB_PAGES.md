# GitHub Pages setup

The project site lives in this folder (`docs/`).

## Enable Pages (one time)

1. Open **https://github.com/Makogai/session-copy/settings/pages**
2. Under **Build and deployment** → **Source**, choose **Deploy from a branch**
3. Branch: **main** (or your default branch)
4. Folder: **/docs**
5. Save

After a minute or two the site is live at:

**https://makogai.github.io/session-copy/**

## Links in the extension

[`src/popup/config.ts`](../src/popup/config.ts) — **Website**, **Chrome Web Store**, GitHub, releases, issues, and privacy URLs for the Info panel.

**Version flag:** `docs/version.json` is updated from `package.json` on each `npm run build`. The header shows **vX.Y.Z** next to the logo (links to that GitHub release). `site.js` refreshes it from `version.json` when the site is served over HTTP(S).

**Themes:** `docs/theme-boot.js` (in `<head>`) prevents flash; header **Auto / Light / Dark** toggle stores preference in `localStorage` (`sc-docs-theme`). Palette matches the extension popup.

**Chrome Web Store:** https://chromewebstore.google.com/detail/session-copy/cdmghcjmilmfknopnilocihmcpabblkp

## Optional: custom domain

Add a `CNAME` file in `docs/` with your domain (e.g. `sessioncopy.app`) and configure DNS at your registrar.
