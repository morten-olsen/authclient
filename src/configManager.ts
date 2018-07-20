import ICrypto from './ICrypto';
import ISession from './ISession';
import IStore from './IStore';

class ConfigManager {
  public crypto: ICrypto | undefined;
  public store: IStore | undefined;

  public async getRandom(type: string) {
    if (!this.crypto) {
      return '';
    }
    return this.crypto.random(type);
  }

  public async getSha256(input: string) {
    if (!this.crypto) {
      return '';
    }
    return this.crypto.sha256(input);
  }

  public async getBase64Url(input: string) {
    if (!this.crypto) {
      return '';
    }
    return this.crypto.base64UrlEncode(input);
  }

  public async getItem(key: string) {
    if (!this.store) {
      return undefined;
    }
    const sessionKey = `auth_session_${key}`;
    const raw = await this.store.getItem(sessionKey);
    if (!raw) {
      return undefined;
    }
    const session = JSON.parse(raw) as ISession;
    return session;
  }

  public async setItem(key: string, value: ISession) {
    if (this.store) {
      const sessionKey = `auth_session_${key}`;
      await this.store.setItem(sessionKey, JSON.stringify(value));
    }
  }

  public async removeItem(key: string) {
    if (this.store) {
      const sessionKey = `auth_session_${key}`;
      await this.store.removeItem(sessionKey);
    }
  }
}

export default new ConfigManager();
