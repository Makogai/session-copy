const PENDING_RESTORE_KEY = 'pendingRestore';

/**
 * @param {string} host
 * @param {string} origin
 * @returns {Promise<chrome.cookies.Cookie[]>}
 */
async function getCookiesForOrigin(host, origin) {
  const domains = [host, host.startsWith('.') ? host : `.${host}`];
  const byKey = new Map();
  const add = list => {
    for (const c of list) {
      const k = `${c.name}\0${c.domain}\0${c.path}`;
      if (!byKey.has(k)) byKey.set(k, c);
    }
  };

  add(await chrome.cookies.getAll({ url: origin }));
  for (const d of domains) {
    try {
      add(await chrome.cookies.getAll({ domain: d }));
    } catch {
      /* invalid domain pattern */
    }
  }

  return [...byKey.values()];
}

/**
 * @param {chrome.cookies.Cookie} cookie
 * @param {string} origin
 */
function cookieRemovalUrl(cookie, origin) {
  const path = cookie.path && cookie.path.startsWith('/') ? cookie.path : '/';
  let host = cookie.domain || '';
  if (host.startsWith('.')) host = host.slice(1);
  if (!host) {
    try {
      return new URL(path, origin).href;
    } catch {
      return `${origin}${path}`;
    }
  }
  const scheme = cookie.secure ? 'https' : 'http';
  return `${scheme}://${host}${path}`;
}

/**
 * @returns {Promise<{ tabId: number; origin: string; host: string; display: string } | { unsupported: true; reason: string } | null>}
 */
export async function getActiveTabSite() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id || !tab.url) return null;

  if (
    tab.url.startsWith('chrome://') ||
    tab.url.startsWith('chrome-extension://') ||
    tab.url.startsWith('edge://') ||
    tab.url.startsWith('about:')
  ) {
    return { unsupported: true, reason: 'This page cannot be cleared. Open a normal website tab.' };
  }

  try {
    const u = new URL(tab.url);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') {
      return { unsupported: true, reason: 'Only http(s) sites can be cleared.' };
    }
    return {
      tabId: tab.id,
      origin: u.origin,
      host: u.hostname,
      display: u.hostname,
      favIconUrl: tab.favIconUrl || ''
    };
  } catch {
    return null;
  }
}

/**
 * @param {{ tabId: number; origin: string; host: string }} target
 * @param {{ cookies?: boolean; localStorage?: boolean; sessionStorage?: boolean }} scope
 */
export async function clearSiteData(target, scope = {}) {
  const cookies = scope.cookies !== false;
  const localStorage = scope.localStorage !== false;
  const sessionStorage = scope.sessionStorage !== false;

  /** @type {{ cookiesRemoved: number; cookiesFailed: number; localKeys: number; sessionKeys: number }} */
  const result = { cookiesRemoved: 0, cookiesFailed: 0, localKeys: 0, sessionKeys: 0 };

  if (localStorage || sessionStorage) {
    const [{ result: counts }] = await chrome.scripting.executeScript({
      target: { tabId: target.tabId },
      func: opts => {
        let localKeys = 0;
        let sessionKeys = 0;
        if (opts.localStorage) {
          localKeys = window.localStorage.length;
          window.localStorage.clear();
        }
        if (opts.sessionStorage) {
          sessionKeys = window.sessionStorage.length;
          window.sessionStorage.clear();
        }
        return { localKeys, sessionKeys };
      },
      args: [{ localStorage, sessionStorage }]
    });
    result.localKeys = counts?.localKeys ?? 0;
    result.sessionKeys = counts?.sessionKeys ?? 0;
  }

  if (cookies) {
    const list = await getCookiesForOrigin(target.host, target.origin);
    for (const c of list) {
      try {
        /** @type {chrome.cookies.CookieDetails} */
        const details = {
          url: cookieRemovalUrl(c, target.origin),
          name: c.name
        };
        if (c.storeId) details.storeId = c.storeId;
        if (c.partitionKey) details.partitionKey = c.partitionKey;

        const removed = await chrome.cookies.remove(details);
        if (removed) result.cookiesRemoved++;
        else result.cookiesFailed++;
      } catch {
        result.cookiesFailed++;
      }
    }
  }

  const stored = await chrome.storage.session.get(PENDING_RESTORE_KEY);
  if (stored[PENDING_RESTORE_KEY]?.origin === target.origin) {
    await chrome.storage.session.remove(PENDING_RESTORE_KEY);
  }

  return result;
}
