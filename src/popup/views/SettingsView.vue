<script setup lang="ts">
import { usePreferences } from '../composables/usePreferences';
import SettingsJumpButton from '../components/SettingsJumpButton.vue';
import ThemeSelector from '../components/ThemeSelector.vue';

const { strictCookies, loginOnlyMode } = usePreferences();
</script>

<template>
  <div class="view" data-view="settings">
    <p class="panel-title">Settings</p>
    <p class="panel-lead">Tune how sessions are captured before you copy or export.</p>

    <p class="section-label">Appearance</p>
    <section class="settings-panel settings-panel--theme" aria-label="Appearance">
      <div class="theme-setting">
        <span class="theme-setting-text">
          <span class="toggle-label">Theme</span>
          <span class="toggle-hint">Defaults to your system setting</span>
        </span>
        <ThemeSelector />
      </div>
    </section>

    <p class="section-label section-label--spaced">Capture</p>
    <section class="settings-panel" aria-label="Capture options">
      <label class="toggle">
        <input v-model="loginOnlyMode" type="checkbox" />
        <span class="toggle-track" aria-hidden="true" />
        <span class="toggle-text">
          <span class="toggle-label">Login transfer only</span>
          <span class="toggle-hint">Recommended — copies auth cookies and keys only</span>
        </span>
      </label>
      <label class="toggle">
        <input v-model="strictCookies" type="checkbox" />
        <span class="toggle-track" aria-hidden="true" />
        <span class="toggle-text">
          <span class="toggle-label">Stricter cookie filter</span>
          <span class="toggle-hint">When full sync is on — drops more analytics cookies</span>
        </span>
      </label>
    </section>

    <p class="section-label section-label--spaced">Site cleanup</p>
    <SettingsJumpButton />

    <div class="info-callout">
      <strong>Tip</strong>
      <p>
        For incognito paste, enable this extension in incognito under
        <em>chrome://extensions</em> → Details → Allow in incognito.
      </p>
    </div>
  </div>
</template>
