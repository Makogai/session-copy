<script setup lang="ts">
import { provideNavigation } from './composables/useNavigation';
import { provideStatus } from './composables/useStatus';
import { providePreferences } from './composables/usePreferences';
import { provideTheme } from './composables/useTheme';
import BottomNav from './components/BottomNav.vue';
import HomeView from './views/HomeView.vue';
import CleanupView from './views/CleanupView.vue';
import SettingsView from './views/SettingsView.vue';
import InfoView from './views/InfoView.vue';

const { currentView } = provideNavigation();
provideStatus();
providePreferences();
provideTheme();

const logoUrl = chrome.runtime.getURL('assets/images/logo512.png');
</script>

<template>
  <div class="app">
    <header class="header">
      <img
        class="logo"
        :src="logoUrl"
        width="40"
        height="40"
        alt="Session Copy"
      />
      <div>
        <h1 class="brand-title">Session Copy</h1>
        <p class="brand-tagline">Secure session transfer for any website</p>
      </div>
    </header>

    <main class="card card-body">
      <HomeView v-show="currentView === 'home'" />
      <CleanupView v-show="currentView === 'cleanup'" />
      <SettingsView v-show="currentView === 'settings'" />
      <InfoView v-show="currentView === 'info'" />
    </main>

    <BottomNav />
  </div>
</template>
