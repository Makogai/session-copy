const statusEl = document.getElementById('status');
const statusTextEl = document.getElementById('statusText');
const actionButtons = () =>
  document.querySelectorAll('.btn[data-action], #copy, #paste, #exportFile, #importPick');

/**
 * @param {string} text
 * @param {'loading'|'ok'|'err'|''} kind
 */
export function setStatus(text, kind = '') {
  if (!statusEl || !statusTextEl) return;

  statusEl.className = 'status';
  if (!text) {
    statusEl.classList.remove('is-visible');
    statusTextEl.textContent = '';
    setButtonsDisabled(false);
    return;
  }

  statusTextEl.textContent = text;
  if (kind === 'loading') statusEl.classList.add('is-visible', 'is-loading');
  else if (kind === 'ok') statusEl.classList.add('is-visible', 'is-ok');
  else if (kind === 'err') statusEl.classList.add('is-visible', 'is-err');
  else statusEl.classList.add('is-visible');

  setButtonsDisabled(kind === 'loading');
}

/** @param {boolean} disabled */
export function setButtonsDisabled(disabled) {
  actionButtons().forEach(btn => {
    btn.disabled = disabled;
  });
}
