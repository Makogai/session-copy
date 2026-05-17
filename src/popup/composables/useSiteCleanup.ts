import { ref } from 'vue';
import { clearSiteData, getActiveTabSite } from '../../core/clear-site.js';

export type ActiveSite = {
  tabId: number;
  origin: string;
  host: string;
  display: string;
  favIconUrl?: string;
};

export type CleanupScope = {
  cookies: boolean;
  localStorage: boolean;
  sessionStorage: boolean;
};

export function useSiteCleanup() {
  const activeTarget = ref<ActiveSite | null>(null);
  const unsupported = ref(false);
  const unsupportedMessage = ref('');
  const disabled = ref(true);
  const statusText = ref('');
  const statusKind = ref<'loading' | 'ok' | 'err' | ''>('');
  const showConfirm = ref(false);

  const scopeCookies = ref(true);
  const scopeLocal = ref(true);
  const scopeSession = ref(true);

  function setCleanupStatus(text: string, kind: 'loading' | 'ok' | 'err' | '' = '') {
    statusText.value = text;
    statusKind.value = kind;
  }

  async function refreshCleanupSite() {
    setCleanupStatus('');
    showConfirm.value = false;
    activeTarget.value = null;

    const site = await getActiveTabSite();
    if (!site) {
      unsupported.value = true;
      unsupportedMessage.value = 'No active tab found.';
      disabled.value = true;
      return;
    }

    if ('unsupported' in site) {
      unsupported.value = true;
      unsupportedMessage.value = site.reason;
      disabled.value = true;
      return;
    }

    activeTarget.value = site;
    unsupported.value = false;
    disabled.value = false;
  }

  function getScope(): CleanupScope {
    return {
      cookies: scopeCookies.value,
      localStorage: scopeLocal.value,
      sessionStorage: scopeSession.value
    };
  }

  async function runCleanup() {
    const target = activeTarget.value;
    if (!target) return;

    const scope = getScope();
    if (!scope.cookies && !scope.localStorage && !scope.sessionStorage) {
      setCleanupStatus('Select at least one item to clear.', 'err');
      return;
    }

    disabled.value = true;
    setCleanupStatus('Clearing site data…', 'loading');

    try {
      const result = await clearSiteData(target, scope);
      await chrome.tabs.reload(target.tabId);

      const parts: string[] = [];
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
      const err = e as Error;
      setCleanupStatus(err?.message || 'Could not clear site data.', 'err');
    } finally {
      showConfirm.value = false;
      disabled.value = false;
    }
  }

  return {
    activeTarget,
    unsupported,
    unsupportedMessage,
    disabled,
    statusText,
    statusKind,
    showConfirm,
    scopeCookies,
    scopeLocal,
    scopeSession,
    refreshCleanupSite,
    setCleanupStatus,
    runCleanup
  };
}
