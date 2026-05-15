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

## Update the extension link

[`src/popup/config.js`](../src/popup/config.js) uses this URL for **Website** in the Info panel.

## Optional: custom domain

Add a `CNAME` file in `docs/` with your domain (e.g. `sessioncopy.app`) and configure DNS at your registrar.
