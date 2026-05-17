<script setup lang="ts">
import { computed, watch } from 'vue';
import { APP_LINKS, APP_TAGLINE } from '../config';
import { ICONS } from '../icons';
import { useNavigation } from '../composables/useNavigation';
import { useWhatsNew } from '../composables/useWhatsNew';

const { currentView } = useNavigation();
const { content, loading, error, loadLatestRelease } = useWhatsNew();

const version = chrome.runtime.getManifest().version;

const links = computed(() =>
  [
    { href: APP_LINKS.chromeWebStore, label: 'Chrome Web Store', icon: ICONS.chrome },
    { href: APP_LINKS.website, label: 'Website', icon: ICONS.globe },
    { href: APP_LINKS.repository, label: 'GitHub', icon: ICONS.github },
    { href: APP_LINKS.releases, label: 'All releases', icon: ICONS.releases },
    { href: APP_LINKS.issues, label: 'Report issue', icon: ICONS.issue },
    { href: APP_LINKS.privacy, label: 'Privacy', icon: ICONS.shield }
  ].filter((l) => l.href)
);

watch(
  currentView,
  (v) => {
    if (v === 'info') void loadLatestRelease();
  },
  { immediate: true }
);

function openReleases() {
  if (APP_LINKS.releases) chrome.tabs.create({ url: APP_LINKS.releases });
}
</script>

<template>
  <div class="view" data-view="info">
    <div class="info-hero">
      <p class="info-version">Version <span>{{ version }}</span></p>
      <p class="info-tagline">{{ APP_TAGLINE }}</p>
    </div>

    <p class="section-label">Links</p>
    <nav class="link-list" aria-label="External links">
      <a
        v-for="link in links"
        :key="link.href"
        class="link-row"
        :href="link.href"
        target="_blank"
        rel="noopener noreferrer"
      >
        <span class="link-row-icon" v-html="link.icon" />
        <span class="link-row-label">{{ link.label }}</span>
        <svg class="link-row-chevron" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>
      </a>
    </nav>

    <p class="section-label">What’s new</p>
    <div class="whats-new-card">
      <p v-if="loading" class="whats-new-muted">Loading…</p>
      <p v-else-if="error" class="whats-new-muted">
        Could not load release notes. See GitHub for updates.
      </p>
      <template v-else-if="content">
        <p class="whats-new-title">{{ content.title }}</p>
        <ul class="whats-new-list">
          <li v-for="(item, i) in content.bullets" :key="i">{{ item }}</li>
        </ul>
        <p v-if="content.hasMore" class="whats-new-more">More changes on GitHub →</p>
      </template>
    </div>
    <button type="button" class="btn-link" @click="openReleases">View all releases on GitHub</button>

    <p class="panel-muted about-blurb">
      Encrypted on your device. Nothing is uploaded to a cloud server.
    </p>
  </div>
</template>
