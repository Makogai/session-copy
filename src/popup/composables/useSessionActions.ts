import { captureFromTab, toSessionPayload } from '../../core/capture.js';
import {
  packToClipboardString,
  unpackFromClipboardString,
  packToFileBytes,
  unpackFromFileBytes
} from '../../core/pack.js';
import {
  CLIPBOARD_PREFIX,
  CLIPBOARD_MAX_CHARS,
  DEBUG_DUMP_PACK_PAYLOAD
} from '../../core/constants.js';
import { useStatus } from './useStatus.js';
import { usePreferences } from './usePreferences.js';

function downloadSessionFile(host: string, bytes: Uint8Array) {
  const safeHost = (host || 'site').replace(/[^\w.-]+/g, '_').slice(0, 80);
  const blob = new Blob([bytes as BlobPart], { type: 'application/octet-stream' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `session-${safeHost}-${new Date().toISOString().replace(/[:.]/g, '-')}.session`;
  a.click();
  URL.revokeObjectURL(a.href);
}

function downloadPackDebugJson(host: string, packPayload: unknown) {
  const safeHost = (host || 'site').replace(/[^\w.-]+/g, '_').slice(0, 80);
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const json = JSON.stringify(packPayload, null, 2);
  const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `session-pack-debug-${safeHost}-${stamp}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}

function maybeDumpPackPayloadForDebug(
  host: string,
  packPayload: unknown,
  { stagger = false }: { stagger?: boolean } = {}
) {
  if (!DEBUG_DUMP_PACK_PAYLOAD) return;
  const run = () => {
    try {
      downloadPackDebugJson(host, packPayload);
    } catch (e) {
      console.warn('[session-copy] debug dump failed', e);
    }
  };
  if (stagger) setTimeout(run, 450);
  else run();
}

function sessionToRestorePayload(session: {
  origin: string;
  localStorage: Record<string, string>;
  sessionStorage: Record<string, string>;
  cookies: unknown[];
}) {
  return {
    origin: session.origin,
    localStorage: session.localStorage,
    sessionStorage: session.sessionStorage,
    cookies: session.cookies
  };
}

export function useSessionActions() {
  const { setStatus } = useStatus();
  const { getCaptureOpts } = usePreferences();

  async function copySession() {
    setStatus('Capturing session from this tab…', 'loading');
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) throw new Error('no-tab');

      const capOpts = await getCaptureOpts();
      const cap = await captureFromTab(tab.id, capOpts);
      const session = toSessionPayload(cap);
      const token = await packToClipboardString(session);

      if (token.length > CLIPBOARD_MAX_CHARS) {
        const bytes = await packToFileBytes(session);
        downloadSessionFile(cap.host, bytes);
        maybeDumpPackPayloadForDebug(cap.host, session, { stagger: true });
        setStatus(
          `Session saved as an encrypted file (${Math.round(token.length / 1024)} KB). Share the file securely.`,
          'ok'
        );
        return;
      }

      maybeDumpPackPayloadForDebug(cap.host, session);
      await navigator.clipboard.writeText(token);
      setStatus('Encrypted session copied to clipboard.', 'ok');
    } catch (e) {
      console.error(e);
      const err = e as Error;
      setStatus(err?.message || 'Could not copy session.', 'err');
    }
  }

  async function exportFile() {
    setStatus('Preparing encrypted file…', 'loading');
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) throw new Error('no-tab');
      const capOpts = await getCaptureOpts();
      const cap = await captureFromTab(tab.id, capOpts);
      const session = toSessionPayload(cap);
      const bytes = await packToFileBytes(session);
      downloadSessionFile(cap.host, bytes);
      maybeDumpPackPayloadForDebug(cap.host, session, { stagger: true });
      setStatus('Encrypted session file downloaded.', 'ok');
    } catch (e) {
      console.error(e);
      const err = e as Error;
      setStatus(err?.message || 'Export failed.', 'err');
    }
  }

  async function pasteSession() {
    setStatus('Applying session…', 'loading');
    try {
      const text = (await navigator.clipboard.readText()).trim();
      if (!text.startsWith(CLIPBOARD_PREFIX)) throw new Error('no-token');

      const session = await unpackFromClipboardString(text);
      const bgResp = await chrome.runtime.sendMessage({
        action: 'openAndRestore',
        data: sessionToRestorePayload(session)
      });
      if (!bgResp?.ok) throw new Error(bgResp?.error || 'bg-failed');

      const extra =
        bgResp?.cookiesFailed > 0
          ? ` ${bgResp.cookiesSet} cookies applied, ${bgResp.cookiesFailed} skipped.`
          : '';
      setStatus(`Session restored. The site was reloaded.${extra}`, 'ok');
    } catch (e) {
      console.error(e);
      const err = e as Error;
      const map: Record<string, string> = {
        'no-token': 'Nothing to paste — copy a session first, or import a file.',
        'bad-version': 'Unsupported session format.',
        truncated: 'Session data looks incomplete.',
        'bg-failed': 'Could not apply session.',
        'bad-origin': 'Invalid site in session data.',
        'no-tab': 'No active tab found.'
      };
      setStatus(map[err?.message] || err?.message || 'Paste failed.', 'err');
    }
  }

  async function importFile(file: File) {
    setStatus('Reading session file…', 'loading');
    try {
      const buf = new Uint8Array(await file.arrayBuffer());
      const session = await unpackFromFileBytes(buf);
      const bgResp = await chrome.runtime.sendMessage({
        action: 'openAndRestore',
        data: sessionToRestorePayload(session)
      });
      if (!bgResp?.ok) throw new Error(bgResp?.error || 'bg-failed');
      setStatus('Session imported and site opened.', 'ok');
    } catch (e) {
      console.error(e);
      const err = e as Error;
      const map: Record<string, string> = {
        'bad-magic': 'Not a valid Session Copy file.',
        truncated: 'File appears corrupt or incomplete.',
        'bad-version': 'Unsupported file format.',
        'bg-failed': 'Could not apply session.'
      };
      setStatus(map[err?.message] || err?.message || 'Import failed.', 'err');
    }
  }

  return { copySession, pasteSession, exportFile, importFile };
}
