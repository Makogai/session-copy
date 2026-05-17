import { ref } from 'vue';

const HIGHLIGHT_LIMIT = 3;

export interface WhatsNewContent {
  title: string;
  bullets: string[];
  hasMore: boolean;
}

export function useWhatsNew() {
  const content = ref<WhatsNewContent | null>(null);
  const loading = ref(false);
  const error = ref(false);

  async function loadLatestRelease() {
    loading.value = true;
    error.value = false;
    content.value = null;

    try {
      const idx = await (await fetch(chrome.runtime.getURL('changelog/index.json'))).json();
      const latestId = idx.versions[0] as string;
      const j = await (
        await fetch(chrome.runtime.getURL(`changelog/${latestId}.json`))
      ).json();

      const all: string[] = j.changes || [];
      const bullets = all.slice(0, HIGHLIGHT_LIMIT);

      content.value = {
        title: j.title || `Version ${j.version}`,
        bullets,
        hasMore: all.length > HIGHLIGHT_LIMIT
      };
    } catch (e) {
      console.error(e);
      error.value = true;
    } finally {
      loading.value = false;
    }
  }

  return { content, loading, error, loadLatestRelease };
}
