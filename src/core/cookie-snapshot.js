/**
 * Minimal fields needed for chrome.cookies.set (and round-trip from getAll).
 * @typedef {object} CookieSnapshot
 * @property {string} name
 * @property {string} value
 * @property {string} domain
 * @property {string} path
 * @property {boolean} secure
 * @property {boolean} httpOnly
 * @property {chrome.cookies.SameSiteStatus} [sameSite]
 * @property {number} [expirationDate] // Unix seconds
 */

/** @param {chrome.cookies.Cookie} c */
export function cookieToSnapshot(c) {
  const snap = {
    name: c.name,
    value: c.value,
    domain: c.domain,
    path: c.path || '/',
    secure: !!c.secure,
    httpOnly: !!c.httpOnly,
    sameSite: c.sameSite,
    expirationDate: c.expirationDate
    // storeId / partitionKey intentionally omitted — must apply in target profile (incognito-safe)
  };
  return snap;
}
