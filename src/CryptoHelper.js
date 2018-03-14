import crypto from 'crypto';

function base64URLEncode(str) {
  return str.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

class NodeCrypto {
  async sha256(value) {
    return crypto.createHash('sha256').update(value).digest();
  }

  bytesToBase64(value) {
    return base64URLEncode(value);
  }

  random(sizeInBytes = 32) {
    return base64URLEncode(crypto.randomBytes(sizeInBytes));
  }
}

export default NodeCrypto;
