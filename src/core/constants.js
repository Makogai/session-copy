/** Wire format version (single byte in envelope). */
export const SESSION_FORMAT_VERSION = 2;

/** Clipboard token prefix (must not change without migration). */
export const CLIPBOARD_PREFIX = 'sc:v2:';

/** UTF-8 magic for exported binary files (followed by same envelope as clipboard). */
export const FILE_MAGIC = new TextEncoder().encode('SESSIONCOPY\x1e');

/**
 * Max clipboard string length before we recommend/switch to file export.
 * Keeps Slack/email and some clipboard implementations comfortable.
 */
export const CLIPBOARD_MAX_CHARS = 450_000;

/**
 * When true, every Copy session / Save encrypted file also downloads a plaintext JSON
 * file of the exact payload that gets compressed and encrypted (contains secrets).
 * Set to false before release / store submission.
 */
export const DEBUG_DUMP_PACK_PAYLOAD = false;
