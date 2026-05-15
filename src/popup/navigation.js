const VIEWS = ['home', 'settings', 'info'];

/** @param {'home'|'settings'|'info'} viewId */
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

export function initNavigation({ onInfoOpen } = {}) {
  document.querySelectorAll('[data-nav]').forEach(btn => {
    btn.addEventListener('click', () => {
      const view = btn.dataset.nav;
      if (!VIEWS.includes(view)) return;
      showView(view);
      if (view === 'info' && onInfoOpen) onInfoOpen();
    });
  });

  showView('home');
}
