<script setup lang="ts">
import { useNavigation } from '../composables/useNavigation';

const { setView } = useNavigation();

function goCleanup() {
  setView('cleanup');
}
</script>

<template>
  <button type="button" class="settings-jump" @click="goCleanup">
    <span class="settings-jump-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none">
        <path
          d="M4 7h16M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M10 11v6M14 11v6M6 7l1 14h10l1-14"
          stroke="currentColor"
          stroke-width="1.75"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </span>
    <span class="settings-jump-text">
      <span class="settings-jump-label">Clear site data</span>
      <span class="settings-jump-hint">Reset cookies &amp; storage on the active tab</span>
    </span>
    <svg class="settings-jump-chevron" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
    </svg>
  </button>
</template>
