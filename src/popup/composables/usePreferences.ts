import { inject, onMounted, provide, ref, watch, type InjectionKey, type Ref } from 'vue';

export interface CaptureOpts {
  strictCookies: boolean;
  loginOnlyMode: boolean;
}

export interface PreferencesApi {
  strictCookies: Ref<boolean>;
  loginOnlyMode: Ref<boolean>;
  getCaptureOpts: () => Promise<CaptureOpts>;
}

export const preferencesKey: InjectionKey<PreferencesApi> = Symbol('preferences');

export function providePreferences(): PreferencesApi {
  const strictCookies = ref(false);
  const loginOnlyMode = ref(true);

  onMounted(() => {
    chrome.storage.local.get({ strictCookies: false, loginOnlyMode: true }, (r) => {
      strictCookies.value = !!r.strictCookies;
      loginOnlyMode.value = r.loginOnlyMode !== false;
    });
  });

  watch(strictCookies, (v) => {
    chrome.storage.local.set({ strictCookies: v });
  });

  watch(loginOnlyMode, (v) => {
    chrome.storage.local.set({ loginOnlyMode: v });
  });

  async function getCaptureOpts(): Promise<CaptureOpts> {
    const r = await chrome.storage.local.get({
      strictCookies: false,
      loginOnlyMode: true
    });
    return {
      strictCookies: !!r.strictCookies,
      loginOnlyMode: r.loginOnlyMode !== false
    };
  }

  const api: PreferencesApi = { strictCookies, loginOnlyMode, getCaptureOpts };
  provide(preferencesKey, api);
  return api;
}

export function usePreferences(): PreferencesApi {
  const api = inject(preferencesKey);
  if (!api) throw new Error('usePreferences() called without providePreferences()');
  return api;
}
