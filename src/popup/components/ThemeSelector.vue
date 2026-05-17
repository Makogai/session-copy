<script setup lang="ts">
import { useTheme, type ThemePreference } from '../composables/useTheme';

const { preference } = useTheme();

function setPreference(id: ThemePreference) {
  preference.value = id;
}

const options: { id: ThemePreference; label: string }[] = [
  { id: 'system', label: 'System' },
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' }
];
</script>

<template>
  <div class="theme-selector" role="radiogroup" aria-label="Appearance">
    <button
      v-for="opt in options"
      :key="opt.id"
      type="button"
      class="theme-selector-btn"
      role="radio"
      :aria-checked="preference === opt.id"
      :class="{ 'is-active': preference === opt.id }"
      @click="setPreference(opt.id)"
    >
      {{ opt.label }}
    </button>
  </div>
</template>
