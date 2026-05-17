<script setup lang="ts">
import { useNavigation, type ViewId } from '../composables/useNavigation';

const emit = defineEmits<{
  navigate: [view: ViewId];
}>();

const { currentView, setView } = useNavigation();

const items: { id: ViewId; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'cleanup', label: 'Clear' },
  { id: 'settings', label: 'Settings' },
  { id: 'info', label: 'Info' }
];

function onNav(view: ViewId) {
  setView(view);
  emit('navigate', view);
}
</script>

<template>
  <nav class="bottom-nav" aria-label="Main">
    <button
      v-for="item in items"
      :key="item.id"
      type="button"
      class="nav-btn"
      :class="{ 'is-active': currentView === item.id }"
      :aria-current="currentView === item.id ? 'page' : undefined"
      @click="onNav(item.id)"
    >
      <svg v-if="item.id === 'home'" class="nav-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M4 10.5L12 4l8 6.5V19a1.5 1.5 0 0 1-1.5 1.5H5.5A1.5 1.5 0 0 1 4 19v-8.5z"
          stroke="currentColor"
          stroke-width="1.75"
          stroke-linejoin="round"
        />
      </svg>
      <svg v-else-if="item.id === 'cleanup'" class="nav-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M4 7h16M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M10 11v6M14 11v6M6 7l1 14h10l1-14"
          stroke="currentColor"
          stroke-width="1.75"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      <svg v-else-if="item.id === 'settings'" class="nav-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"
          stroke="currentColor"
          stroke-width="1.75"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.75" />
      </svg>
      <svg v-else class="nav-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.75" />
        <path d="M12 11v5M12 8h.01" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" />
      </svg>
      {{ item.label }}
    </button>
  </nav>
</template>
