# Session Copy (Chrome extension)

**Website:** [makogai.github.io/session-copy](https://makogai.github.io/session-copy/) · **GitHub Pages setup:** [docs/GITHUB_PAGES.md](docs/GITHUB_PAGES.md)

Offline-first tool to **copy** and **paste** an encrypted snapshot of **localStorage**, **sessionStorage**, and **cookies** for the **current website**, so you can reuse the same session on another browser or machine.

- **No Firebase / no cloud vault** — ciphertext lives only in your clipboard or a `.session` file you save.
- **Large sessions** — if the clipboard string would exceed a safe size, the extension saves an **encrypted file** instead.
- **HttpOnly cookies** — restored with `chrome.cookies.set` from the service worker (not via `document.cookie`).

## Package for Chrome Web Store

```powershell
.\scripts\package-extension.ps1
```

Creates `dist/session-copy-v{version}.zip` ready to upload. See [docs/CHROME_WEB_STORE.md](docs/CHROME_WEB_STORE.md).

## Install (developer mode)

1. Open `chrome://extensions/`.
2. Enable **Developer mode**.
3. **Load unpacked** and select this folder (the one containing `manifest.json`).

## Usage

1. Log in on the site you care about.
2. Open the extension → **Copy session** (or **Save encrypted file**).
3. On the other machine: **Paste session** from the clipboard, or **Import encrypted file**.

If the page still looks logged out, **reload** once. Some sites keep state outside cookies/DOM storage.

## Capture modes

- **Login transfer only** (default): copies a small allowlist of storage keys and cookies that typically carry auth (e.g. NextAuth `__Secure-*` cookies plus OpenAI’s `oai/apps/auth|session|user|csrf` keys). Dumps UI state, drafts, connector prefs, etc.
- **Full storage sync** (uncheck in the popup): older “copy almost everything except obvious junk” behavior; payloads are much larger.

## Limits

- **IndexedDB**, **Cache Storage**, and **Service Worker** caches are not exported.
- **HttpOnly** cookies are included when Chrome exposes them to extensions; setting them can still fail for domain/path/`__Host-` rules — failures are logged in the service worker console.
- Optional **Stricter cookie filter** drops more analytics-style cookies.

## Privacy

See [PRIVACY.md](PRIVACY.md). For publishing to the Chrome Web Store, see [docs/CHROME_WEB_STORE.md](docs/CHROME_WEB_STORE.md).
