import { applyCookiesToOrigin } from './core/cookies-apply.js';

const PENDING_RESTORE_KEY = 'pendingRestore';

/**
 * @param {string} originNorm
 * @param {string} [url]
 */
function isFirstPartyUrl(originNorm, url) {
  if (!url || url.startsWith('chrome://')) return false;
  try {
    return new URL(url).origin === originNorm;
  } catch {
    return false;
  }
}

/** Inject localStorage + sessionStorage only (cookies via chrome.cookies API). */
function injectStorageIntoTab(tabId, data, { world } = {}) {
  return chrome.scripting.executeScript({
    target: { tabId },
    world,
    args: [{ localStorage: data.localStorage, sessionStorage: data.sessionStorage }],
    func: d => {
      Object.entries(d.localStorage).forEach(([k, v]) => {
        try {
          localStorage.setItem(k, v);
        } catch (e) {
          console.warn('[session-copy] localStorage set failed', k, e);
        }
      });
      Object.entries(d.sessionStorage).forEach(([k, v]) => {
        try {
          sessionStorage.setItem(k, v);
        } catch (e) {
          console.warn('[session-copy] sessionStorage set failed', k, e);
        }
      });
    }
  });
}

/**
 * @param {object} data restore payload
 */
async function stashPendingRestore(data) {
  await chrome.storage.session.set({ [PENDING_RESTORE_KEY]: data });
}

async function clearPendingRestore() {
  await chrome.storage.session.remove(PENDING_RESTORE_KEY);
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.action !== 'openAndRestore') return;

  (async () => {
    try {
      const { data } = msg;
      const originNorm = new URL(data.origin).origin;
      const cookies = data.cookies || [];

      await stashPendingRestore({
        origin: originNorm,
        localStorage: data.localStorage || {},
        sessionStorage: data.sessionStorage || {}
      });

      const tab = await chrome.tabs.create({ url: data.origin, active: true });
      const tabId = tab.id;

      await new Promise(resolve => {
        const listener = (id, info) => {
          if (id !== tabId) return;
          if (info.status === 'loading' && info.url && isFirstPartyUrl(originNorm, info.url)) {
            void applyCookiesToOrigin(data.origin, cookies);
          }
          if (info.status === 'complete') {
            chrome.tabs.onUpdated.removeListener(listener);
            resolve(undefined);
          }
        };
        chrome.tabs.onUpdated.addListener(listener);
      });

      const { set, failed } = await applyCookiesToOrigin(data.origin, cookies);
      await injectStorageIntoTab(tabId, data, { world: 'MAIN' });

      // Second navigation so NextAuth / SPA re-reads cookies + storage (critical for ChatGPT).
      await chrome.tabs.reload(tabId);
      await new Promise(resolve => {
        const listener = (id, info) => {
          if (id === tabId && info.status === 'complete') {
            chrome.tabs.onUpdated.removeListener(listener);
            resolve(undefined);
          }
        };
        chrome.tabs.onUpdated.addListener(listener);
      });

      await clearPendingRestore();
      sendResponse({ ok: true, cookiesSet: set, cookiesFailed: failed });
    } catch (e) {
      console.error(e);
      await clearPendingRestore();
      sendResponse({ ok: false, error: e.message });
    }
  })();

  return true;
});
