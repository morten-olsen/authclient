const CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const HAS_CRYPTO = typeof window !== 'undefined' && !!global.crypto;
const encoder = new global.TextEncoder('utf-8');

/** @ignore */
const arrayBufferToBase64 = (buffer) => {
  let binary = '';
  const bytes = new global.Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return global.btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
};

/** @ignore */
export const bufferToString = (buffer) => {
  const state = [];
  for (let i = 0; i < buffer.byteLength; i += 1) {
    const index = (buffer[i] % CHARSET.length) | 0; // eslint-disable-line no-bitwise
    state.push(CHARSET[index]);
  }
  return state.join('');
};

class Crypto {
  async sha256(value) {
    const encoded = encoder.encode(value);
    const hashed = await global.crypto.subtle.digest('SHA-256', encoded);
    return hashed;
  }

  bytesToBase64(value) {
    return arrayBufferToBase64(value);
  }

  random(sizeInBytes = 24) {
    const buffer = new Uint8Array(sizeInBytes);
    if (HAS_CRYPTO) {
      global.crypto.getRandomValues(buffer);
    } else {
      // fall back to Math.random() if nothing else is available
      for (let i = 0; i < sizeInBytes; i += 1) {
        buffer[i] = Math.random();
      }
    }
    return bufferToString(buffer);
  }
}

export default Crypto;
