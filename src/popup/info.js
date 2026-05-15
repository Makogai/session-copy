import { APP_LINKS, APP_TAGLINE } from './config.js';
import { loadLatestRelease } from './changelog.js';
import { ICONS } from './icons.js';

const CHEVRON = `<svg class="link-row-chevron" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;

/**
 * @param {{ href: string; label: string; icon: string }} opts
 */
function linkRow({ href, label, icon }) {
  if (!href) return '';
  return `<a class="link-row" href="${href}" target="_blank" rel="noopener noreferrer">
    <span class="link-row-icon">${icon}</span>
    <span class="link-row-label">${label}</span>
    ${CHEVRON}
  </a>`;
}

export function initInfo() {
  const versionEl = document.getElementById('appVersion');
  if (versionEl) versionEl.textContent = chrome.runtime.getManifest().version;

  const taglineEl = document.getElementById('infoTagline');
  if (taglineEl) taglineEl.textContent = APP_TAGLINE;

  const linksEl = document.getElementById('infoLinks');
  if (linksEl) {
    linksEl.innerHTML = [
      linkRow({ href: APP_LINKS.website, label: 'Website', icon: ICONS.globe }),
      linkRow({ href: APP_LINKS.repository, label: 'GitHub', icon: ICONS.github }),
      linkRow({ href: APP_LINKS.releases, label: 'All releases', icon: ICONS.releases }),
      linkRow({ href: APP_LINKS.issues, label: 'Report issue', icon: ICONS.issue }),
      linkRow({ href: APP_LINKS.privacy, label: 'Privacy', icon: ICONS.shield })
    ]
      .filter(Boolean)
      .join('');
  }

  document.getElementById('viewReleases')?.addEventListener('click', () => {
    if (APP_LINKS.releases) chrome.tabs.create({ url: APP_LINKS.releases });
  });
}

export function onInfoPanelOpen() {
  const box = document.getElementById('whatsNew');
  if (box) void loadLatestRelease(box);
}
