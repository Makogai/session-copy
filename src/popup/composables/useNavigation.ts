import { inject, provide, ref, type InjectionKey, type Ref } from 'vue';

export type ViewId = 'home' | 'cleanup' | 'settings' | 'info';

export interface NavigationApi {
  currentView: Ref<ViewId>;
  setView: (view: ViewId) => void;
}

export const navigationKey: InjectionKey<NavigationApi> = Symbol('navigation');

export function provideNavigation(): NavigationApi {
  const currentView = ref<ViewId>('home');

  const api: NavigationApi = {
    currentView,
    setView(view) {
      currentView.value = view;
    }
  };

  provide(navigationKey, api);
  return api;
}

export function useNavigation(): NavigationApi {
  const api = inject(navigationKey);
  if (!api) throw new Error('useNavigation() called without provideNavigation()');
  return api;
}
