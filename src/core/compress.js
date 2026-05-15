/**
 * Gzip-compress raw bytes using native CompressionStream (Chromium).
 * @param {Uint8Array} input
 * @returns {Promise<Uint8Array>}
 */
export async function gzipCompress(input) {
  const cs = new CompressionStream('gzip');
  const stream = new Blob([input]).stream().pipeThrough(cs);
  const buf = await new Response(stream).arrayBuffer();
  return new Uint8Array(buf);
}

/**
 * @param {Uint8Array} input
 * @returns {Promise<Uint8Array>}
 */
export async function gzipDecompress(input) {
  const ds = new DecompressionStream('gzip');
  const stream = new Blob([input]).stream().pipeThrough(ds);
  const buf = await new Response(stream).arrayBuffer();
  return new Uint8Array(buf);
}
