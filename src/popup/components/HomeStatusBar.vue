<script setup lang="ts">
import { computed } from 'vue';
import { useStatus } from '../composables/useStatus';

const { state } = useStatus();

const statusClass = computed(() => {
  const c = ['status'];
  if (!state.text) return c;
  c.push('is-visible');
  if (state.kind === 'loading') c.push('is-loading');
  else if (state.kind === 'ok') c.push('is-ok');
  else if (state.kind === 'err') c.push('is-err');
  return c;
});
</script>

<template>
  <div :class="statusClass" role="status" aria-live="polite">
    <span class="status-dot" aria-hidden="true" />
    <span class="status-text">{{ state.text }}</span>
  </div>
</template>
