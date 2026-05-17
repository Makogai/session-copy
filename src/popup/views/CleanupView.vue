<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useNavigation } from '../composables/useNavigation';
import { useSiteCleanup } from '../composables/useSiteCleanup';

const { currentView } = useNavigation();

const {
  activeTarget,
  unsupported,
  unsupportedMessage,
  disabled,
  statusText,
  statusKind,
  showConfirm,
  scopeCookies,
  scopeLocal,
  scopeSession,
  refreshCleanupSite,
  setCleanupStatus,
  runCleanup
} = useSiteCleanup();

const faviconFailed = ref(false);

watch(
  currentView,
  (v) => {
    if (v === 'cleanup') void refreshCleanupSite();
  },
  { immediate: true }
);

watch(activeTarget, () => {
  faviconFailed.value = false;
});

const hostLabel = computed(() =>
  unsupported.value ? 'Unavailable' : (activeTarget.value?.display ?? '—')
);

const hintText = computed(() =>
  unsupported.value
    ? unsupportedMessage.value
    : 'Clears data for this tab’s site. You will be signed out.'
);

const showOptions = computed(() => !unsupported.value);

const statusClass = computed(() => {
  const c = ['cleanup-status'];
  if (statusKind.value) c.push(`cleanup-status--${statusKind.value}`);
  return c;
});

function onFaviconError() {
  faviconFailed.value = true;
}

function startConfirm() {
  setCleanupStatus('');
  showConfirm.value = true;
}

function cancelConfirm() {
  showConfirm.value = false;
  setCleanupStatus('');
}
</script>

<template>
  <div class="view" data-view="cleanup">
    <p class="panel-title">Clear site data</p>
    <p class="panel-lead">
      Remove cookies and storage for the active tab’s site. Use this if a paste or restore left things
      broken.
    </p>

    <section class="cleanup-card" aria-label="Clear site data">
      <div
        class="site-pill"
        :class="{ 'is-disabled': disabled, 'is-unsupported': unsupported }"
      >
        <div class="site-pill-icon-wrap" aria-hidden="true">
          <img
            v-if="activeTarget?.favIconUrl && !faviconFailed && !unsupported"
            class="site-pill-favicon"
            :src="activeTarget.favIconUrl"
            alt=""
            width="22"
            height="22"
            decoding="async"
            @error="onFaviconError"
          />
          <svg
            v-else
            class="site-pill-icon site-pill-icon--fallback"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.75" />
            <path
              d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"
              stroke="currentColor"
              stroke-width="1.75"
            />
          </svg>
        </div>
        <span class="site-pill-text">
          <span class="site-pill-label">Active site</span>
          <span class="site-pill-host">{{ hostLabel }}</span>
        </span>
      </div>
      <p class="cleanup-hint">{{ hintText }}</p>

      <div v-show="showOptions" class="cleanup-options">
        <label class="cleanup-check">
          <input v-model="scopeCookies" type="checkbox" :disabled="disabled" />
          <span class="cleanup-check-box" aria-hidden="true" />
          <span class="cleanup-check-text">
            <span class="cleanup-check-label">Cookies</span>
            <span class="cleanup-check-hint">Includes HttpOnly — signs you out</span>
          </span>
        </label>
        <label class="cleanup-check">
          <input v-model="scopeLocal" type="checkbox" :disabled="disabled" />
          <span class="cleanup-check-box" aria-hidden="true" />
          <span class="cleanup-check-text">
            <span class="cleanup-check-label">Local storage</span>
            <span class="cleanup-check-hint">Persistent site data</span>
          </span>
        </label>
        <label class="cleanup-check">
          <input v-model="scopeSession" type="checkbox" :disabled="disabled" />
          <span class="cleanup-check-box" aria-hidden="true" />
          <span class="cleanup-check-text">
            <span class="cleanup-check-label">Session storage</span>
            <span class="cleanup-check-hint">Tab-scoped data</span>
          </span>
        </label>
      </div>

      <div v-show="showOptions && !showConfirm" class="cleanup-actions">
        <button type="button" class="btn btn-danger-soft" :disabled="disabled" @click="startConfirm">
          <svg class="icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M4 7h16M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M10 11v6M14 11v6M6 7l1 14h10l1-14"
              stroke="currentColor"
              stroke-width="1.75"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          Clear site data
        </button>
      </div>

      <div v-show="showConfirm" class="cleanup-confirm">
        <p class="cleanup-warning">
          This signs you out and removes site data for
          <strong>{{ activeTarget?.display ?? 'this site' }}</strong>. It cannot be undone.
        </p>
        <div class="cleanup-confirm-row">
          <button type="button" class="btn btn-ghost btn-ghost--compact" :disabled="disabled" @click="cancelConfirm">
            Cancel
          </button>
          <button type="button" class="btn btn-danger" :disabled="disabled" @click="runCleanup()">
            Yes, clear
          </button>
        </div>
      </div>

      <div v-show="statusText" :class="statusClass" role="status" aria-live="polite">
        {{ statusText }}
      </div>
    </section>
  </div>
</template>
