import ICrypto from '../ICrypto';

/* tslint:disable */
const sha: any = require('js-sha256');
const base64 = require('base-64');
/* tslint:enable */

const CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const HAS_CRYPTO = typeof window !== 'undefined' && !!(global as any).crypto;

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
    return sha(input);
  }

  public async base64UrlEncode(value: string) {
    return base64.encode(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  }

  public async random(type: string) {
    if (HAS_CRYPTO) {
      const sizeInBytes = 64;
      const buffer = new Uint8Array(sizeInBytes);
      (global as any).crypto.getRandomValues(buffer);
      return bufferToString(buffer);
    } else {
      let result = '';
      for (let i = 0; i < 64; i++) {
        result += CHARSET[Math.floor(Math.random() * CHARSET.length)];
      }
      return result;
    }
  }
}

export default NodeCrypto;
