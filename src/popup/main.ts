import { createApp } from 'vue';
import App from './App.vue';
import { bootstrapTheme } from './composables/useTheme';

void bootstrapTheme().then(() => {
  createApp(App).mount('#app');
});