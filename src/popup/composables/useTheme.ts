import { inject, onMounted, onUnmounted, provide, ref, watch, type InjectionKey, type Ref } from 'vue';

export type ThemePreference = 'system' | 'light' | 'dark';
export type ResolvedTheme = 'light' | 'dark';

export interface ThemeApi {
  preference: Ref<ThemePreference>;
  resolved: Ref<ResolvedTheme>;
}

export const themeKey: InjectionKey<ThemeApi> = Symbol('theme');

const STORAGE_KEY = 'themePreference';

function getSystemTheme(): ResolvedTheme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function resolveTheme(preference: ThemePreference): ResolvedTheme {
  return preference === 'system' ? getSystemTheme() : preference;
}

export function applyThemeToDocument(preference: ThemePreference): ResolvedTheme {
  const resolved = resolveTheme(preference);
  document.documentElement.dataset.theme = resolved;
  document.documentElement.style.colorScheme = resolved;
  return resolved;
}

function normalizePreference(value: unknown): ThemePreference {
  if (value === 'light' || value === 'dark' || value === 'system') return value;
  return 'system';
}

/** Apply stored theme before Vue mounts (reduces flash). */
export async function bootstrapTheme(): Promise<void> {
  const stored = await chrome.storage.local.get({ [STORAGE_KEY]: 'system' });
  applyThemeToDocument(normalizePreference(stored[STORAGE_KEY]));
}

export function provideTheme(): ThemeApi {
  const preference = ref<ThemePreference>('system');
  const resolved = ref<ResolvedTheme>(getSystemTheme());

  let media: MediaQueryList | null = null;

  const onSystemChange = () => {
    if (preference.value === 'system') {
      resolved.value = applyThemeToDocument('system');
    }
  };

  onMounted(() => {
    chrome.storage.local.get({ [STORAGE_KEY]: 'system' }, (r) => {
      preference.value = normalizePreference(r[STORAGE_KEY]);
      resolved.value = applyThemeToDocument(preference.value);
    });

    media = window.matchMedia('(prefers-color-scheme: dark)');
    media.addEventListener('change', onSystemChange);
  });

  onUnmounted(() => {
    media?.removeEventListener('change', onSystemChange);
  });

  watch(preference, (v) => {
    chrome.storage.local.set({ [STORAGE_KEY]: v });
    resolved.value = applyThemeToDocument(v);
  });

  const api: ThemeApi = { preference, resolved };
  provide(themeKey, api);
  return api;
}

export function useTheme(): ThemeApi {
  const api = inject(themeKey);
  if (!api) throw new Error('useTheme() called without provideTheme()');
  return api;
}
