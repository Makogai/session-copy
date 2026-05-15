# Chrome Web Store checklist

## Listing

- **Single purpose:** Copy/restore encrypted session data (DOM storage + cookies) for the active site.
- **Privacy policy URL:** Host `PRIVACY.md` (or equivalent) on a public URL and link it in the listing.
- **Justification text:** Reuse the permissions table in [PRIVACY.md](../PRIVACY.md) for the “permission justification” fields.

## Security hygiene

- **Firebase:** If you ever shipped a build with an embedded Firebase Web API key, treat it as public. In [Google Cloud Console](https://console.cloud.google.com/) for that project: restrict the key to needed APIs, rotate it, or delete the project if unused.

## Package

- Zip the extension root (with `manifest.json` at the top level), excluding `.git` and dev-only files if you prefer.
