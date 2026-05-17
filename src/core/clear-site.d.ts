export function getActiveTabSite(): Promise<
  | {
      tabId: number;
      origin: string;
      host: string;
      display: string;
      favIconUrl?: string;
    }
  | { unsupported: true; reason: string }
  | null
>;

export function clearSiteData(
  target: { tabId: number; origin: string; host: string },
  scope: { cookies: boolean; localStorage: boolean; sessionStorage: boolean }
): Promise<{
  cookiesRemoved: number;
  cookiesFailed: number;
  localKeys: number;
  sessionKeys: number;
}>;
