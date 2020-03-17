import axios, { AxiosRequestConfig } from 'axios';
import BaseUrl, * as OrgUrl from 'pure-url';
import configManager from './configManager';
import IConfig from './IConfig';
import IOpenIDConfig from './IOpenID';
import ISession from './ISession';
import IToken from './IToken';
import { parse } from './url';
import { toFormData } from './utils';
export {
  IConfig,
};
const Url = (OrgUrl.default || OrgUrl) as any;

export type loader = (options?: any) => Promise<string>;
export type remove = (options?: any) => Promise<void>;
export type saver = (token: string, options?: any) => Promise<void>;
export interface IOptions {
  save?: saver;
  load?: loader;
  remove?: remove;
  allowExport?: boolean;
  autoRenew?: boolean;
  autoSave?: boolean;
}

class Token {
  private options: IOptions;
  private openIdConfig: IOpenIDConfig | undefined;
  private config: IConfig;
  private token: IToken = {
    creationTime: 0,
    expiresIn: 0,
  };

  constructor(config: IConfig, options: IOptions = {}) {
    this.config = config;
    this.options = options;
  }

  get idToken() {
    return this.token.idToken;
  }

  get isExpired() {
    const currentTime = new Date().getTime();
    return this.token.creationTime + (this.token.expiresIn * 1000) < currentTime;
  }

  get canRefresh() {
    return !!this.token.refreshCode;
  }

  get isValid() {
    return !this.isExpired || this.canRefresh;
  }

  public isValidUrl(url) {
    const parsed = parse(url);
    return !!parsed.code || !!parsed.access_token;
  }

  public async getLoginUrl() {
    const {
      authorization_endpoint: authEndpoint,
    } = await this.getWellKnown();
    const {
      clientId,
      redirectUri,
      pkce,
      scopes,
      responseType,
      clientSecret,
      grantType,
    } = this.config;
    const url = Url.parse(authEndpoint);
    url.query = {
      client_id: clientId,
      redirect_uri: redirectUri,
    };

    const state = await configManager.getRandom('state');
    const session: ISession = {
      nonce: await configManager.getRandom('nonce'),
    };

    if (pkce) {
      const codeVerifier = await configManager.getRandom('code-verifier');

      session.codeVerifier = codeVerifier;
      url.query.code_challenge = await configManager.getBase64Url(
        await configManager.getSha256(codeVerifier),
      );
      url.query.code_challenge_method = 'S256';
    }

    url.query.state = state;
    url.query.nonce = session.nonce;
    url.query.response_type = responseType;
    url.query.redirect_uri = redirectUri;
    if (clientSecret) {
      url.query.client_secret = clientSecret;
    }
    if (grantType) {
      url.query.grant_types = grantType;
    }

    if (scopes) {
      url.query.scope = scopes.join(' ');
    }

    if (this.config.store) {
      await this.config.store.setItem(state, JSON.stringify(session));
    } else {
      await configManager.setItem(state, session);
    }
    return url.toString();
  }

  public async exchangeUrl(url: string) {
    const parsed = parse(url);
    const {
      code,
      state: sessionId,
    } = parsed;
    const {
      clientId,
      redirectUri,
      clientSecret,
    } = this.config;
    const {
      token_endpoint: tokenEndpoint,
    } = await this.getWellKnown();
    const session = this.config.store
      ? JSON.parse(await this.config.store.getItem(sessionId))
      : await configManager.getItem(sessionId);

    if (!session) {
      throw Error('Session could not be found');
    }
    if (this.config.store) {
      this.config.store.removeItem(sessionId);
    } else {
      await configManager.removeItem(sessionId);
    }

    if (code) {
      const token = await this.call<any>(
        'post',
        tokenEndpoint,
        {
          client_id: clientId,
          client_secret: clientSecret,
          code,
          code_verifier: session.codeVerifier,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri,
        },
      );
      this.token = {
        accessCode: token.access_token,
        creationTime: new Date().getTime(),
        expiresIn: token.expires_in,
        idToken: token.id_token,
        refreshCode: token.refresh_token,
      };
      if (this.options.autoSave) {
        this.save();
      }
      return token;
    } else {
      this.token = {
        accessCode: parsed.access_token,
        creationTime: new Date().getTime(),
        expiresIn: parseInt(parsed.expires_in || '0', 10),
        idToken: parsed.id_token,
      };
      if (this.options.autoSave) {
        this.save();
      }
      return parsed;
    }
  }

  public async refresh() {
    if (!this.canRefresh) {
      return;
    }
    const {
      clientId,
      clientSecret,
      redirectUri,
    } = this.config;
    const {
      token_endpoint: tokenEndpoint,
    } = await this.getWellKnown();
    const {
      refreshCode,
    } = this.token;
    const token = await this.call<any>(
      'post',
      tokenEndpoint,
      {
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'refresh_token',
        redirect_uri: redirectUri,
        refresh_token: refreshCode,
      },
    );
    this.token = {
      accessCode: token.access_token,
      creationTime: new Date().getTime(),
      expiresIn: token.expires_in,
      idToken: token.idToken || this.token.idToken,
      refreshCode: token.refresh_token || this.token.refreshCode,
    };
    if (this.options.autoSave) {
      this.save();
    }
  }

  public async revoke(options: any = {}) {
    const {
      clientId,
      clientSecret,
    } = this.config;
    const {
      revocation_endpoint: revocationEndpoint,
    } = await this.getWellKnown();
    const {
      refreshCode,
    } = this.token;
    const token = await this.call<any>(
      'post',
      revocationEndpoint,
      {
        client_id: clientId,
        client_secret: clientSecret,
        token: refreshCode,
      },
    );
    if (this.options.autoSave) {
      this.save();
    }
    await this.remove(options);
  }

  public expire() {
    this.token = {
      ...this.token,
      creationTime: 0,
      expiresIn: 0,
    };
  }

  public async getToken() {
    if (!this.options.allowExport) {
      throw Error('Token exports are not allowed');
    }
    return this._getToken();
  }

  public setToken(token: IToken = {
    creationTime: 0,
    expiresIn: 0,
  }) {
    this.token = {
      creationTime: 0,
      expiresIn: 0,
      ...token,
    };
  }

  public async save(options?) {
    if (this.options.save && this.token.accessCode) {
      const serialized = JSON.stringify(this.token);
      await this.options.save(serialized, options);
    }
    return true;
  }

  public async remove(options?) {
    if (this.options.remove) {
      await this.options.remove(options);
    }
    this.token = {
      creationTime: 0,
      expiresIn: 0,
    };
    return true;
  }

  public async load(options?) {
    if (this.options.load) {
      const raw = await this.options.load(options);
      if (!raw) {
        return false;
      }
      const token = JSON.parse(raw);
      this.setToken(token);
      return true;
    }
    return false;
  }

  public async getProfile() {
    const {
      userinfo_endpoint: userInfoEndpoint,
    } = await this.getWellKnown();
    const data = await this.call<any>(
      'get',
      userInfoEndpoint,
      {},
      {
        headers: {
          Authorization: `Bearer ${await this._getToken()}`,
        },
      },
    );
    return data;
  }

  public async request(options: AxiosRequestConfig = {}) {
    const { headers = {} } = options;
    if (this.isExpired && this.canRefresh) {
      await this.refresh();
    }
    return axios({
      ...options,
      headers: {
        ...headers,
        Authorization: `Bearer ${await this._getToken()}`,
      },
    });
  }

  private async getWellKnown() {
    if (this.openIdConfig) {
      return this.openIdConfig;
    }
    const {
      baseUrl,
    } = this.config;
    const response = await axios.get<IOpenIDConfig>(`${baseUrl}/.well-known/openid-configuration`);
    const {
      data,
    } = response;
    this.openIdConfig = data;
    return data;
  }

  private async _getToken() {
    if (this.options.autoRenew !== false && this.isExpired && this.canRefresh) {
      await this.refresh();
    }
    return this.token.accessCode;
  }

  private async call<TType>(method, url, data, {
    type = 'application/x-www-form-urlencoded',
    headers = {},
  } = {}) {
    let parsedData = data;
    if (type === 'application/x-www-form-urlencoded') {
      parsedData = toFormData(data);
    }
    const result = await axios({
      data: parsedData,
      headers: {
        'Content-type': type,
        ...headers,
      },
      method,
      url,
    });
    return result.data as TType;
  }
}

export default Token;
