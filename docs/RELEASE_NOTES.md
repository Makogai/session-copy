# Release notes workflow

## Recommendation

**In the extension popup:** show only a short **“What’s new”** card for the **latest version** (2–3 bullets).  
**Full history:** link to **GitHub Releases** — better for store users and keeps the popup small.

You do **not** need a scrollable changelog inside the popup unless you want a marketing-heavy “news feed” feel.

## When you ship a version

1. Add `changelog/X.Y.Z.json` (version, date, title, changes array).
2. Put the new version **first** in `changelog/index.json`.
3. Optionally tag the release on GitHub and paste the same bullets there.

The popup reads `index.json` → latest file only.

## Optional later

- “New” dot on the Info tab until the user opens it (compare stored `lastSeenVersion` vs manifest version).
- Store listing “What’s new” field can mirror the latest JSON bullets.
