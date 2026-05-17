import { inject, provide, reactive, readonly, type InjectionKey } from 'vue';

export type StatusKind = 'loading' | 'ok' | 'err' | '';

export interface StatusState {
  text: string;
  kind: StatusKind;
  buttonsDisabled: boolean;
}

export interface StatusApi {
  state: Readonly<StatusState>;
  setStatus: (text: string, kind?: StatusKind) => void;
  setButtonsDisabled: (disabled: boolean) => void;
}

export const statusKey: InjectionKey<StatusApi> = Symbol('status');

export function provideStatus(): StatusApi {
  const state = reactive<StatusState>({
    text: '',
    kind: '',
    buttonsDisabled: false
  });

  const api: StatusApi = {
    state: readonly(state) as Readonly<StatusState>,
    setStatus(text, kind = '') {
      state.text = text;
      state.kind = kind;
      state.buttonsDisabled = kind === 'loading';
    },
    setButtonsDisabled(disabled) {
      state.buttonsDisabled = disabled;
    }
  };

  provide(statusKey, api);
  return api;
}

export function useStatus(): StatusApi {
  const api = inject(statusKey);
  if (!api) throw new Error('useStatus() called without provideStatus()');
  return api;
}
