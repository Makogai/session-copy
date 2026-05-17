export function packToClipboardString(session: unknown): Promise<string>;

export function unpackFromClipboardString(text: string): Promise<{
  origin: string;
  localStorage: Record<string, string>;
  sessionStorage: Record<string, string>;
  cookies: unknown[];
}>;

export function packToFileBytes(session: unknown): Promise<Uint8Array>;

export function unpackFromFileBytes(buf: Uint8Array): Promise<{
  origin: string;
  localStorage: Record<string, string>;
  sessionStorage: Record<string, string>;
  cookies: unknown[];
}>;
