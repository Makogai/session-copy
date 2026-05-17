const VIEWS = ['home', 'cleanup', 'settings', 'info'];

/** @param {'home'|'cleanup'|'settings'|'info'} viewId */
export function showView(viewId) {
  document.querySelectorAll('[data-view]').forEach(el => {
    el.hidden = el.dataset.view !== viewId;
  });

  document.querySelectorAll('[data-nav]').forEach(btn => {
    const active = btn.dataset.nav === viewId;
    btn.classList.toggle('is-active', active);
    btn.setAttribute('aria-current', active ? 'page' : 'false');
  });
}

/** @param {'home'|'cleanup'|'settings'|'info'} viewId */
export function openView(viewId) {
  if (!VIEWS.includes(viewId)) return;
  showView(viewId);
}

export function initNavigation({ onInfoOpen, onSettingsOpen, onCleanupOpen } = {}) {
  document.querySelectorAll('[data-nav]').forEach(btn => {
    btn.addEventListener('click', () => {
      const view = btn.dataset.nav;
      if (!VIEWS.includes(view)) return;
      showView(view);
      if (view === 'info' && onInfoOpen) onInfoOpen();
      if (view === 'settings' && onSettingsOpen) onSettingsOpen();
      if (view === 'cleanup' && onCleanupOpen) onCleanupOpen();
    });
  });

  document.querySelectorAll('[data-goto-view]').forEach(el => {
    el.addEventListener('click', () => {
      const view = el.dataset.gotoView;
      if (!VIEWS.includes(view)) return;
      showView(view);
      if (view === 'cleanup' && onCleanupOpen) onCleanupOpen();
    });
  });

  showView('home');
}
