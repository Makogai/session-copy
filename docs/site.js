(function () {
  const THEME_KEY = 'sc-docs-theme';

  function getSystemTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function resolveTheme(preference) {
    if (preference === 'dark' || preference === 'light') return preference;
    return getSystemTheme();
  }

  function applyTheme(preference) {
    const resolved = resolveTheme(preference);
    document.documentElement.dataset.theme = resolved;
    document.documentElement.style.colorScheme = resolved;

    document.querySelectorAll('[data-theme-btn]').forEach((btn) => {
      const active = btn.dataset.themeBtn === preference;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-checked', active ? 'true' : 'false');
    });
  }

  function initTheme() {
    let preference = 'system';
    try {
      preference = localStorage.getItem(THEME_KEY) || 'system';
      if (!['system', 'light', 'dark'].includes(preference)) preference = 'system';
    } catch {
      preference = 'system';
    }

    applyTheme(preference);

    document.querySelectorAll('[data-theme-btn]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const next = btn.dataset.themeBtn;
        if (!next) return;
        try {
          localStorage.setItem(THEME_KEY, next);
        } catch {
          /* ignore */
        }
        applyTheme(next);
      });
    });

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      try {
        if ((localStorage.getItem(THEME_KEY) || 'system') === 'system') applyTheme('system');
      } catch {
        /* ignore */
      }
    });
  }

  function applyVersion(badge, version) {
    const v = String(version).replace(/^v/, '');
    badge.textContent = `v${v}`;
    badge.href = `https://github.com/Makogai/session-copy/releases/tag/v${v}`;
    badge.title = `Latest release v${v}`;
    badge.setAttribute('aria-label', `Latest version v${v}`);
  }

  function initVersionBadge() {
    const badges = document.querySelectorAll('[data-version-badge]');
    if (!badges.length) return;

    const applyFallback = () => {
      badges.forEach((badge) => {
        const fallback = badge.dataset.versionFallback || '2.3.0';
        applyVersion(badge, fallback);
      });
    };

    fetch('version.json')
      .then((r) => {
        if (!r.ok) throw new Error('version fetch failed');
        return r.json();
      })
      .then((data) => {
        if (data?.version) badges.forEach((badge) => applyVersion(badge, data.version));
        else applyFallback();
      })
      .catch(applyFallback);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initTheme();
      initVersionBadge();
    });
  } else {
    initTheme();
    initVersionBadge();
  }
})();
