import { clearSiteData, getActiveTabSite } from '../core/clear-site.js';

const GLOBE_ICON_SVG = `<svg class="site-pill-icon site-pill-icon--fallback" viewBox="0 0 24 24" fill="none" aria-hidden="true">
  <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.75"/>
  <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" stroke="currentColor" stroke-width="1.75"/>
</svg>`;

/** @type {{ tabId: number; origin: string; host: string; display: string; favIconUrl?: string } | null} */
let activeTarget = null;

const els = {
  host: () => document.getElementById('cleanupSiteHost'),
  hint: () => document.getElementById('cleanupSiteHint'),
  pill: () => document.getElementById('cleanupSitePill'),
  icon: () => document.getElementById('cleanupSiteIcon'),
  options: () => document.getElementById('cleanupOptions'),
  actions: () => document.getElementById('cleanupActions'),
  confirm: () => document.getElementById('cleanupConfirm'),
  status: () => document.getElementById('cleanupStatus'),
  start: () => document.getElementById('cleanupStart'),
  cancel: () => document.getElementById('cleanupCancel'),
  confirmBtn: () => document.getElementById('cleanupConfirmBtn'),
  checkCookies: () => document.getElementById('cleanupCookies'),
  checkLocal: () => document.getElementById('cleanupLocal'),
  checkSession: () => document.getElementById('cleanupSession')
};

function showGlobeIcon() {
  const slot = els.icon();
  if (slot) slot.innerHTML = GLOBE_ICON_SVG;
}

/**
 * @param {string} [favIconUrl]
 * @param {boolean} blocked
 */
function updateSiteIcon(favIconUrl, blocked) {
  const slot = els.icon();
  if (!slot) return;

  if (blocked || !favIconUrl) {
    showGlobeIcon();
    return;
  }

  slot.innerHTML = '';
  const img = document.createElement('img');
  img.className = 'site-pill-favicon';
  img.alt = '';
  img.width = 22;
  img.height = 22;
  img.decoding = 'async';
  img.src = favIconUrl;
  img.addEventListener('error', showGlobeIcon, { once: true });
  slot.appendChild(img);
}

function setCleanupStatus(text, kind = '') {
  const box = els.status();
  if (!box) return;
  if (!text) {
    box.hidden = true;
    box.textContent = '';
    box.className = 'cleanup-status';
    return;
  }
  box.hidden = false;
  box.textContent = text;
  box.className = `cleanup-status cleanup-status--${kind}`;
}

function setConfirmVisible(show) {
  els.actions()?.toggleAttribute('hidden', show);
  const confirm = els.confirm();
  if (confirm) confirm.hidden = !show;
}

function setCleanupDisabled(disabled) {
  const ids = ['cleanupStart', 'cleanupCancel', 'cleanupConfirmBtn', 'cleanupCookies', 'cleanupLocal', 'cleanupSession'];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.disabled = disabled;
  });
  els.pill()?.classList.toggle('is-disabled', disabled);
}

/** @param {boolean} blocked */
function setUnsupported(blocked, message = '') {
  els.options()?.toggleAttribute('hidden', blocked);
  els.actions()?.toggleAttribute('hidden', blocked);
  setConfirmVisible(false);
  const pill = els.pill();
  if (pill) pill.classList.toggle('is-unsupported', blocked);
  const host = els.host();
  if (host) host.textContent = blocked ? 'Unavailable' : activeTarget?.display ?? '—';
  const confirmHost = document.getElementById('cleanupConfirmHost');
  if (confirmHost && activeTarget) confirmHost.textContent = activeTarget.display;
  updateSiteIcon(activeTarget?.favIconUrl, blocked);
  const hint = els.hint();
  if (hint) {
    hint.textContent = blocked
      ? message
      : 'Clears data for this tab’s site. You will be signed out.';
  }
}

export async function refreshCleanupSite() {
  setCleanupStatus('');
  setConfirmVisible(false);
  activeTarget = null;

  const site = await getActiveTabSite();
  if (!site) {
    setUnsupported(true, 'No active tab found.');
    setCleanupDisabled(true);
    return;
  }

  if ('unsupported' in site) {
    setUnsupported(true, site.reason);
    setCleanupDisabled(true);
    return;
  }

  activeTarget = site;
  setUnsupported(false);
  setCleanupDisabled(false);
  const host = els.host();
  if (host) host.textContent = site.display;
  updateSiteIcon(site.favIconUrl, false);
}

function getScope() {
  return {
    cookies: els.checkCookies()?.checked ?? true,
    localStorage: els.checkLocal()?.checked ?? true,
    sessionStorage: els.checkSession()?.checked ?? true
  };
}

async function runCleanup() {
  if (!activeTarget) return;

  const scope = getScope();
  if (!scope.cookies && !scope.localStorage && !scope.sessionStorage) {
    setCleanupStatus('Select at least one item to clear.', 'err');
    return;
  }

  setCleanupDisabled(true);
  setCleanupStatus('Clearing site data…', 'loading');

  try {
    const result = await clearSiteData(activeTarget, scope);
    await chrome.tabs.reload(activeTarget.tabId);

    const parts = [];
    if (scope.cookies) {
      parts.push(`${result.cookiesRemoved} cookie${result.cookiesRemoved === 1 ? '' : 's'}`);
    }
    if (scope.localStorage && result.localKeys > 0) {
      parts.push(`${result.localKeys} local key${result.localKeys === 1 ? '' : 's'}`);
    }
    if (scope.sessionStorage && result.sessionKeys > 0) {
      parts.push(`${result.sessionKeys} session key${result.sessionKeys === 1 ? '' : 's'}`);
    }

    const summary = parts.length ? `Cleared ${parts.join(', ')}.` : 'Nothing left to clear.';
    const fail =
      scope.cookies && result.cookiesFailed > 0
        ? ` ${result.cookiesFailed} cookie(s) could not be removed.`
        : '';
    setCleanupStatus(`${summary} Tab reloaded.${fail}`, 'ok');
  } catch (e) {
    console.error(e);
    setCleanupStatus(e?.message || 'Could not clear site data.', 'err');
  } finally {
    setConfirmVisible(false);
    setCleanupDisabled(false);
  }
}

export function initSiteCleanup() {
  showGlobeIcon();

  els.start()?.addEventListener('click', () => {
    setCleanupStatus('');
    const confirmHost = document.getElementById('cleanupConfirmHost');
    if (confirmHost && activeTarget) confirmHost.textContent = activeTarget.display;
    setConfirmVisible(true);
  });

  els.cancel()?.addEventListener('click', () => {
    setConfirmVisible(false);
    setCleanupStatus('');
  });

  els.confirmBtn()?.addEventListener('click', () => void runCleanup());

  void refreshCleanupSite();
}
