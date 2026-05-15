import { gzipCompress, gzipDecompress } from './compress.js';
import { genKey, encrypt, decrypt, b64 } from '../utils/crypto.js';
import { SESSION_FORMAT_VERSION, CLIPBOARD_PREFIX, FILE_MAGIC } from './constants.js';

const te = new TextEncoder();
const td = new TextDecoder();

/**
 * @typedef {object} SessionPayload
 * @property {string} origin
 * @property {Record<string, string>} localStorage
 * @property {Record<string, string>} sessionStorage
 * @property {object[]} cookies
 * @property {number} [createdAt]
 */

/**
 * Compact JSON keys to reduce size (login-share friendly).
 * @param {SessionPayload} session
 */
function toWireObject(session) {
  return {
    v: 2,
    o: session.origin,
    t: session.createdAt ?? Date.now(),
    l: session.localStorage,
    s: session.sessionStorage,
    c: session.cookies
  };
}

function fromWireObject(w) {
  if (!w || w.v !== 2) throw new Error('invalid-payload');
  return {
    origin: w.o,
    createdAt: w.t,
    localStorage: w.l || {},
    sessionStorage: w.s || {},
    cookies: w.c || []
  };
}

/**
 * Build binary envelope: [version u8][key 32][iv 12][cipher...]
 * @param {SessionPayload} session
 * @returns {Promise<Uint8Array>}
 */
export async function packToEnvelope(session) {
  const json = te.encode(JSON.stringify(toWireObject(session)));
  const compressed = await gzipCompress(json);
  const key = await genKey();
  const { iv, cipher } = await encrypt(key, compressed);

  const out = new Uint8Array(1 + 32 + 12 + cipher.length);
  out[0] = SESSION_FORMAT_VERSION;
  out.set(key, 1);
  out.set(iv, 33);
  out.set(cipher, 45);
  return out;
}

/**
 * @param {Uint8Array} envelope
 * @returns {Promise<SessionPayload>}
 */
export async function unpackFromEnvelope(envelope) {
  if (envelope.length < 1 + 32 + 12 + 16) throw new Error('truncated');

  const ver = envelope[0];
  if (ver !== SESSION_FORMAT_VERSION) throw new Error('bad-version');

  const key = envelope.subarray(1, 33);
  const iv = envelope.subarray(33, 45);
  const cipher = envelope.subarray(45);

  const compressed = await decrypt(key, { iv, cipher });
  const json = await gzipDecompress(compressed);
  const w = JSON.parse(td.decode(json));
  return fromWireObject(w);
}

/**
 * Clipboard / share string (prefix + base64url envelope).
 * @param {SessionPayload} session
 */
export async function packToClipboardString(session) {
  const env = await packToEnvelope(session);
  return CLIPBOARD_PREFIX + b64.enc(env);
}

/**
 * @param {string} text
 * @returns {Promise<SessionPayload>}
 */
export async function unpackFromClipboardString(text) {
  const t = text.trim();
  if (!t.startsWith(CLIPBOARD_PREFIX)) throw new Error('no-token');
  const raw = b64.dec(t.slice(CLIPBOARD_PREFIX.length));
  return unpackFromEnvelope(raw);
}

/** File bytes: magic + envelope (same as clipboard body). */
export async function packToFileBytes(session) {
  const env = await packToEnvelope(session);
  const out = new Uint8Array(FILE_MAGIC.length + env.length);
  out.set(FILE_MAGIC, 0);
  out.set(env, FILE_MAGIC.length);
  return out;
}

/**
 * @param {Uint8Array} bytes
 * @returns {Promise<SessionPayload>}
 */
export async function unpackFromFileBytes(bytes) {
  if (bytes.length < FILE_MAGIC.length + 1 + 32 + 12 + 16) throw new Error('truncated-file');
  for (let i = 0; i < FILE_MAGIC.length; i++) {
    if (bytes[i] !== FILE_MAGIC[i]) throw new Error('bad-magic');
  }
  return unpackFromEnvelope(bytes.subarray(FILE_MAGIC.length));
}
