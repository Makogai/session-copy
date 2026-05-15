/**
 * Runs at document_start: apply pending localStorage/sessionStorage before app boot.
 */
(function () {
  const origin = location.origin;
  chrome.storage.session.get('pendingRestore', ({ pendingRestore }) => {
    if (!pendingRestore || pendingRestore.origin !== origin) return;

    try {
      Object.entries(pendingRestore.localStorage || {}).forEach(([k, v]) => {
        localStorage.setItem(k, v);
      });
      Object.entries(pendingRestore.sessionStorage || {}).forEach(([k, v]) => {
        sessionStorage.setItem(k, v);
      });
    } catch (e) {
      console.warn('[session-copy] early storage restore failed', e);
    }
  });
})();
