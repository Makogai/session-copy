# Privacy policy — Session Copy

**Last updated:** 2026-05-14

## What this extension does

Session Copy reads **localStorage**, **sessionStorage**, and **cookies** for the **active tab’s origin**, applies optional filters to reduce non-essential data, then **encrypts** that bundle on your device. You can place the result on the clipboard or save an encrypted file. Another user with the extension can import it to open the same site and apply the same data.

## Data we do not collect

- **No accounts**, **no analytics**, and **no cloud session database** operated by this project.
- Encrypted payloads are **only** where you put them (clipboard, file, or whatever channel you use). The extension does not send session contents to our servers.

## Permissions (Chrome)

| Permission        | Why it is needed |
|-------------------|------------------|
| `tabs`            | Read the active tab and open the target origin when pasting. |
| `scripting`       | Read storage from the page and write storage after restore. |
| `cookies`         | Read all cookies for the tab’s URL (including HttpOnly) and set them on restore. |
| `clipboardRead` / `clipboardWrite` | Read/write the encrypted token when you use copy/paste. |
| `storage`         | Remember the optional “stricter cookie filter” checkbox. |
| `host_permissions` `http(s)://*/*` | Match web pages where you copy or restore sessions. |

## Security expectations

- The encrypted token or file is a **bearer credential**. Anyone who has it can impersonate that session on that site until cookies expire or the site revokes the session.
- Some sites use **extra protections** (device binding, IP checks, IndexedDB-only state). This extension cannot bypass those; restores may be partial.

## Older versions (Firebase)

If you used a build before 2.0.0 that stored ciphertext in Firebase, that was a **separate** flow. **Rotate or disable** any Firebase API keys that were embedded in old builds, and treat historical Firestore data according to your own retention policy.

## Contact

Provide a support email or issue URL in your Chrome Web Store listing and keep it in sync with this document.
