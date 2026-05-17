# Chrome Web Store

## Published listing

**Live extension:** [Session Copy on the Chrome Web Store](https://chromewebstore.google.com/detail/session-copy/cdmghcjmilmfknopnilocihmcpabblkp)

| Field | Value |
|-------|--------|
| Extension ID | `cdmghcjmilmfknopnilocihmcpabblkp` |
| Privacy policy | https://makogai.github.io/session-copy/privacy.html |
| Developer dashboard | https://chrome.google.com/webstore/devconsole |

Link this URL from the [README](../README.md), [project site](https://makogai.github.io/session-copy/), and `src/popup/config.js` (`APP_LINKS.chromeWebStore`).

## Listing checklist

- **Single purpose:** Copy/restore encrypted session data (DOM storage + cookies) for the active site.
- **Privacy policy URL:** https://makogai.github.io/session-copy/privacy.html
- **Justification text:** Reuse the permissions table in [PRIVACY.md](../PRIVACY.md) for the “permission justification” fields.

## Automated release assets (GitHub Actions)

When you **publish a GitHub Release** (e.g. `gh release create v2.2.0 --notes-file releases/v2.2.0.md`), the [Release assets workflow](../.github/workflows/release.yml) attaches:

| Asset | Description |
|-------|-------------|
| `session-copy-v{version}.zip` | Chrome Web Store upload package |
| `session-copy-v{version}.crx` | Local install (only if signing secret is set) |
| Source code (zip/tar.gz) | Added automatically by GitHub for the tag |

### One-time: CRX signing key (optional)

For a **stable extension ID** across `.crx` builds, store your `.pem` in GitHub:

1. Generate locally once: `.\scripts\package-extension.ps1 -Crx` → keep `dist/*.pem`
2. Base64-encode it (PowerShell):

   ```powershell
   [Convert]::ToBase64String([IO.File]::ReadAllBytes(".\dist\staging.pem")) | Set-Clipboard
   ```

3. Repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**
4. Name: `SESSION_COPY_PEM_BASE64`, paste the base64 string

Without this secret, releases still get the **`.zip`**; `.crx` is skipped.

### Manual re-run

**Actions** → **Release assets** → **Run workflow** → enter tag (e.g. `v2.2.0`).

## Package for upload (ZIP)

The Web Store expects a **ZIP** with `manifest.json` at the **root** (not a `.crx`).

### Windows (recommended)

From the repo root in PowerShell:

```powershell
npm install
.\scripts\package-extension.ps1
```

Runs `npm run build:release` then zips `dist/` to `release/session-copy-v{version}.zip` (version from `package.json`).

### Optional: `.crx` for local testing

```powershell
.\scripts\package-extension.ps1 -Crx
```

Uses Chrome’s packer. First run creates a `.pem` key in `dist/` — **keep it private** and reuse:

```powershell
.\scripts\package-extension.ps1 -Crx -KeyPath ".\dist\session-copy.pem"
```

**Store uploads still use the `.zip`**, not the `.crx`.

### macOS / Linux

```bash
npm install
chmod +x scripts/package-extension.sh
./scripts/package-extension.sh
```

### What gets included (built `dist/`)

| Included | Excluded (dev / site only) |
|----------|----------------------------|
| `manifest.json`, bundled JS | `src/` (source), `node_modules/` |
| `assets/`, `changelog/` | `docs/`, `releases/`, `README.md` |
| `popup/` (HTML/CSS + bundle) | `scripts/`, `.git` |
| `LICENSE` (if present) | Source maps omitted in release builds |

### Upload

1. Open [Chrome Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Create or select your item
3. **Package** → **Upload new package** → choose `release/session-copy-v*.zip` (or download the `.zip` from the GitHub Release)
4. Complete listing, privacy URL, and permission justifications

## Security hygiene

- **Firebase:** If you ever shipped a build before 2.0.0 with an embedded Firebase API key, rotate or disable it in Google Cloud Console.
