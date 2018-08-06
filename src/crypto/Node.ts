/* tslint:disable */
const crypto = require('crypto');
/* tslint:enable */
import ICrypto from '../ICrypto';

const base64URLEncode = (str: string): string =>
 (str as any).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

class NodeCrypto implements ICrypto {
  public async sha256(input: string) {
    return crypto.createHash('sha256').update(input).digest('base64');
  }

  public async base64UrlEncode(value: string) {
    return base64URLEncode(value);
  }

  public async random(type: string) {
    return this.base64UrlEncode(crypto.randomBytes(64));
  }
}

export default NodeCrypto;
