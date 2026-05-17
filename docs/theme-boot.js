/** Apply saved docs theme before first paint (include synchronously in <head>). */
(function () {
  const KEY = 'sc-docs-theme';
  try {
    const pref = localStorage.getItem(KEY) || 'system';
    let resolved = 'light';
    if (pref === 'dark') resolved = 'dark';
    else if (pref === 'light') resolved = 'light';
    else resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    document.documentElement.dataset.theme = resolved;
    document.documentElement.style.colorScheme = resolved;
  } catch {
    /* ignore */
  }
})();
