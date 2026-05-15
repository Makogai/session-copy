/**
 * Per-site capture/restore hints (login transfer).
 * @param {string} host
 */
export function getSiteProfile(host) {
  const h = (host || '').toLowerCase();
  if (h === 'chatgpt.com' || h === 'chat.openai.com' || h.endsWith('.chatgpt.com')) {
    return CHATGPT_PROFILE;
  }
  return null;
}

/** @typedef {object} SiteProfile
 * @property {string[]} localStorageExact
 * @property {RegExp[]} cookieNameAllow
 * @property {string[]} cookieDomains
 */

const CHATGPT_PROFILE = {
  localStorageExact: [
    'oai/apps/auth',
    'oai/apps/session',
    'oai/apps/user',
    'oai/apps/csrf'
  ],
  cookieNameAllow: [
    /^__Host-next-auth\./,
    /^__Secure-next-auth\./,
    /^__Secure-oai-/,
    /^oai-client-auth-info$/,
    /^oai-sc$/,
    /^oai-gn$/
  ],
  cookieDomains: ['chatgpt.com', '.chatgpt.com']
};

/**
 * @param {string} name
 * @param {SiteProfile} profile
 */
export function cookieMatchesSiteProfile(name, profile) {
  return profile.cookieNameAllow.some(re => re.test(name));
}
