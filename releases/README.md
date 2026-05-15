# GitHub Release notes

## Create a release (notes + ZIP + optional CRX)

1. Bump `version` in `manifest.json` and add `changelog/X.Y.Z.json` + `releases/vX.Y.Z.md`.
2. Commit and push to `main`.
3. Create and publish the release:

```bash
git tag v2.1.4
git push origin v2.1.4
gh release create v2.1.4 --title "Session Copy v2.1.4" --notes-file releases/v2.1.4.md
```

Publishing triggers **Release assets** — the workflow uploads `session-copy-v*.zip` (and `.crx` if `SESSION_COPY_PEM_BASE64` is configured). GitHub also attaches **Source code** archives automatically.

See [docs/CHROME_WEB_STORE.md](../docs/CHROME_WEB_STORE.md) for the signing secret.
