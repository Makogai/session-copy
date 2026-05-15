export async function genKey() {
  return crypto.getRandomValues(new Uint8Array(32));      // 256-bit
}

export async function encrypt(keyBytes, plainUint8) {
  const key = await crypto.subtle.importKey('raw', keyBytes, 'AES-GCM', false, ['encrypt']);
  const iv  = crypto.getRandomValues(new Uint8Array(12)); // 96-bit
  const buf = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plainUint8);
  return { iv, cipher: new Uint8Array(buf) };
}

export async function decrypt(keyBytes, { iv, cipher }) {
  const key = await crypto.subtle.importKey('raw', keyBytes, 'AES-GCM', false, ['decrypt']);
  const buf = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, cipher);
  return new Uint8Array(buf);
}

// helpers for compact text form (chunked: spread breaks on large arrays)
export const b64 = {
  enc: bytes => {
    let binary = '';
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) {
      const sub = bytes.subarray(i, i + chunk);
      binary += String.fromCharCode.apply(null, sub);
    }
    return btoa(binary)
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); // URL-safe, no padding
  },
  dec: str => {
    str = str.replace(/-/g, '+').replace(/_/g, '/');
    const pad = '==='.slice((str.length + 3) % 4);
    const bin = atob(str + pad);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }
};