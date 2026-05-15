/** Max bullets shown in the popup (full list lives on GitHub Releases). */
const HIGHLIGHT_LIMIT = 3;

/**
 * Show only the latest version in-app. Full history → GitHub Releases.
 * @param {HTMLElement} box
 */
export async function loadLatestRelease(box) {
  if (!box) return;
  box.innerHTML = '<p class="whats-new-muted">Loading…</p>';

  try {
    const idx = await (await fetch(chrome.runtime.getURL('changelog/index.json'))).json();
    const latestId = idx.versions[0];
    const j = await (await fetch(chrome.runtime.getURL(`changelog/${latestId}.json`))).json();

    const all = j.changes || [];
    const bullets = all.slice(0, HIGHLIGHT_LIMIT);
    const listHtml = bullets.map(c => `<li>${c}</li>`).join('');
    const more = all.length > HIGHLIGHT_LIMIT;

    box.innerHTML = `
      <p class="whats-new-title">${j.title || `Version ${j.version}`}</p>
      <ul class="whats-new-list">${listHtml}</ul>
      ${more ? '<p class="whats-new-more">More changes on GitHub →</p>' : ''}
    `;
  } catch (e) {
    console.error(e);
    box.innerHTML =
      '<p class="whats-new-muted">Could not load release notes. See GitHub for updates.</p>';
  }
}
