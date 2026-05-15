/**
 * Build chrome.cookies.set details with correct rules for __Host- / __Secure- cookies.
 * Never applies source storeId — cookies must land in the target profile (e.g. incognito).
 * @param {string} originNorm
 * @param {import('./cookie-snapshot.js').CookieSnapshot} snap
 * @returns {chrome.cookies.SetDetails | null}
 */
export function buildCookieSetDetails(originNorm, snap) {
  const name = snap.name || '';
  if (!name) return null;

  const isHost = name.startsWith('__Host-');
  const isSecurePrefix = name.startsWith('__Secure-');

  let path = snap.path && snap.path.startsWith('/') ? snap.path : '/';
  if (isHost) path = '/';

  const url = `${originNorm}${path}`;

  /** @type {chrome.cookies.SetDetails} */
  const details = {
    url,
    name: snap.name,
    value: snap.value,
    path,
    secure: isHost || isSecurePrefix ? true : !!snap.secure,
    httpOnly: !!snap.httpOnly
  };

  if (snap.expirationDate) details.expirationDate = snap.expirationDate;

  // __Host- cookies must not include Domain (Chrome rejects otherwise).
  if (!isHost && snap.domain) details.domain = snap.domain;

  if (snap.sameSite && snap.sameSite !== 'unspecified') {
    details.sameSite = snap.sameSite;
  }

  return details;
}

/**
 * @param {string} origin Page origin e.g. https://chatgpt.com
 * @param {import('./cookie-snapshot.js').CookieSnapshot[]} snapshots
 * @returns {Promise<{ set: number; failed: number }>}
 */
export async function applyCookiesToOrigin(origin, snapshots) {
  let originNorm;
  try {
    originNorm = new URL(origin).origin;
  } catch {
    throw new Error('bad-origin');
  }

  const seen = new Set();
  let set = 0;
  let failed = 0;

  for (const snap of snapshots) {
    const key = `${snap.name}\0${snap.domain || ''}\0${snap.path || '/'}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const details = buildCookieSetDetails(originNorm, snap);
    if (!details) {
      failed++;
      continue;
    }

    try {
      const ok = await chrome.cookies.set(details);
      if (ok) set++;
      else failed++;
    } catch (e) {
      failed++;
      console.warn('[session-copy] cookie set failed', snap.name, e?.message || e);
    }
  }

  return { set, failed };
}
