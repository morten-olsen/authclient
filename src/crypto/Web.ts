import ICrypto from '../ICrypto';

// tslint:disable-next-line
const sha: any = require('js-sha256');

const CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const HAS_CRYPTO = typeof window !== 'undefined' && !!(global as any).crypto;
const encoder = (global as any).TextEncoder ? new (global as any).TextEncoder('utf-8') : undefined;

const base64UrlEncode = (value: string) => {
  return (global as any).btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
};

const arrayBufferToBase64 = (buffer) => {
  let binary = '';
  const bytes = new global.Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return base64UrlEncode(binary);
};

export const bufferToString = (buffer) => {
  const state = [];
  for (let i = 0; i < buffer.byteLength; i += 1) {
    /* tslint:disable */
    const index = (buffer[i] % CHARSET.length) | 0;
    /* tslint:enable */
    state.push(CHARSET[index]);
  }
  return state.join('').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
};

class NodeCrypto implements ICrypto {
  public async sha256(input: string) {
    if (encoder) {
      const encoded = encoder.encode(input);
      const hashed = await (global as any).crypto.subtle.digest('SHA-256', encoded);
      return hashed;
    } else {
      return sha(input);
    }
  }

  public async base64UrlEncode(value: string | ArrayBuffer) {
    if (typeof value === 'string') {
      return base64UrlEncode(value);
    } else {
      return arrayBufferToBase64(value);
    }
  }

  public async random(type: string) {
    const sizeInBytes = 64;
    const buffer = new Uint8Array(sizeInBytes);
    if (HAS_CRYPTO) {
      (global as any).crypto.getRandomValues(buffer);
    } else {
      // fall back to Math.random() if nothing else is available
      for (let i = 0; i < sizeInBytes; i += 1) {
        buffer[i] = Math.random();
      }
    }
    return bufferToString(buffer);
  }
}

export default NodeCrypto;
