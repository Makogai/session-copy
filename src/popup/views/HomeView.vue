<script setup lang="ts">
import { ref } from 'vue';
import { useStatus } from '../composables/useStatus';
import { useSessionActions } from '../composables/useSessionActions';
import SettingsJumpButton from '../components/SettingsJumpButton.vue';
import HomeStatusBar from '../components/HomeStatusBar.vue';

const { state } = useStatus();
const { copySession, pasteSession, exportFile, importFile } = useSessionActions();

const fileInput = ref<HTMLInputElement | null>(null);

function pickImport() {
  fileInput.value?.click();
}

function onFileChange() {
  const f = fileInput.value?.files?.[0];
  if (fileInput.value) fileInput.value.value = '';
  if (f) void importFile(f);
}
</script>

<template>
  <div class="view" data-view="home">
    <p class="section-label">Transfer</p>
    <div class="actions-main">
      <button
        type="button"
        class="btn btn-primary"
        data-action="copy"
        :disabled="state.buttonsDisabled"
        @click="copySession()"
      >
        <svg class="icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" stroke-width="1.75" />
          <path
            d="M6 15H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1"
            stroke="currentColor"
            stroke-width="1.75"
          />
        </svg>
        Copy session
      </button>
      <button
        type="button"
        class="btn btn-accent"
        data-action="paste"
        :disabled="state.buttonsDisabled"
        @click="pasteSession()"
      >
        <svg class="icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"
            stroke="currentColor"
            stroke-width="1.75"
            stroke-linecap="round"
          />
          <rect x="9" y="3" width="6" height="4" rx="1" stroke="currentColor" stroke-width="1.75" />
          <path d="M9 12h6M9 16h4" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" />
        </svg>
        Paste session
      </button>
    </div>

    <p class="section-label">File</p>
    <div class="actions-file">
      <button
        type="button"
        class="btn btn-ghost btn-ghost--accent"
        data-action="export"
        :disabled="state.buttonsDisabled"
        @click="exportFile()"
      >
        <svg class="icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 3v12M8 11l4 4 4-4"
            stroke="currentColor"
            stroke-width="1.75"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"
            stroke="currentColor"
            stroke-width="1.75"
            stroke-linecap="round"
          />
        </svg>
        Export
      </button>
      <button
        type="button"
        class="btn btn-ghost btn-ghost--accent"
        data-action="import"
        :disabled="state.buttonsDisabled"
        @click="pickImport"
      >
        <svg class="icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 21V9M16 13l-4-4-4 4"
            stroke="currentColor"
            stroke-width="1.75"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M4 7V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2"
            stroke="currentColor"
            stroke-width="1.75"
            stroke-linecap="round"
          />
        </svg>
        Import
      </button>
    </div>
    <input
      ref="fileInput"
      type="file"
      id="fileInput"
      accept=".session,application/octet-stream,*/*"
      hidden
      @change="onFileChange"
    />

    <p class="section-label section-label--spaced">Site cleanup</p>
    <SettingsJumpButton />

    <HomeStatusBar />

    <p class="home-hint">Encrypted on your device. Treat shared sessions like passwords.</p>
  </div>
</template>
