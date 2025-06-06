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

// helpers for compact text form
export const b64 = {
  enc: bytes =>
    btoa(String.fromCharCode(...bytes))       // regular base-64
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''),  // URL-safe, no padding
  dec: str => {
    str = str.replace(/-/g, '+').replace(/_/g, '/');
    const pad = '==='.slice((str.length + 3) % 4);   // restore padding
    const bin = atob(str + pad);
    return Uint8Array.from([...bin].map(c => c.charCodeAt(0)));
  }
};