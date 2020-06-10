import ICrypto from '../ICrypto';

/* tslint:disable */
const sha: any = require('js-sha256');
const base64 = require('base-64');
/* tslint:enable */

const CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const HAS_CRYPTO = typeof window !== 'undefined' && !!(global as any).crypto;
const encoder = (global as any).TextEncoder ? new (global as any).TextEncoder('utf-8') : undefined;

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

const arrayBufferToBase64 = (buffer) => {
     let binary = '';
     const bytes = new global.Uint8Array(buffer);
     const len = bytes.byteLength;
     for (let i = 0; i < len; i += 1) {
         binary += String.fromCharCode(bytes[i]);
     }
     return base64.encode(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
 };                                                                                                                
 const hexToBytes = (input) => {  
  var bytes = new Uint8Array(Math.ceil(input.length / 2));                                                    for (var i = 0; i < bytes.length; i++)                                                          
    bytes[i] = parseInt(input.substr(i * 2, 2), 16);      
   return bytes;                                                                                       
 }; 

class NodeCrypto implements ICrypto {
  public async sha256(input: string) {
    if (HAS_CRYPTO && encoder) {                                                                          
      const encoded = encoder.encode(input);                                                            
      const hashed = await (global as any).crypto.subtle.digest('SHA-256', encoded);                             
      return hashed;                                                                                    
    } else {                                                                                                
      const hashed = sha(input);                                                                        
      return hexToBytes(hashed);                                                                        
    }
  }

  public async base64UrlEncode(value: string) {
    return arrayBufferToBase64(value);
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
