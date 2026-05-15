const strictEl = document.getElementById('strictCookies');
const loginOnlyEl = document.getElementById('loginOnlyMode');

export async function getCaptureOpts() {
  const { strictCookies, loginOnlyMode } = await chrome.storage.local.get({
    strictCookies: false,
    loginOnlyMode: true
  });
  return {
    strictCookies: !!strictCookies,
    loginOnlyMode: loginOnlyMode !== false
  };
}

export function initPreferences() {
  chrome.storage.local.get({ strictCookies: false, loginOnlyMode: true }, r => {
    if (strictEl) strictEl.checked = !!r.strictCookies;
    if (loginOnlyEl) loginOnlyEl.checked = r.loginOnlyMode !== false;
  });

  strictEl?.addEventListener('change', () => {
    chrome.storage.local.set({ strictCookies: strictEl.checked });
  });
  loginOnlyEl?.addEventListener('change', () => {
    chrome.storage.local.set({ loginOnlyMode: loginOnlyEl.checked });
  });
}
