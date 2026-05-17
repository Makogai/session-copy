export function captureFromTab(
  tabId: number,
  opts: { strictCookies: boolean; loginOnlyMode: boolean }
): Promise<{ host: string; origin: string; [key: string]: unknown }>;

export function toSessionPayload(cap: unknown): {
  origin: string;
  localStorage: Record<string, string>;
  sessionStorage: Record<string, string>;
  cookies: unknown[];
};
