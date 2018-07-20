import axios, { AxiosRequestConfig } from 'axios';
import Url from 'pure-url';
import configManager from './configManager';
import IConfig from './IConfig';
import IOpenIDConfig from './IOpenID';
import ISession from './ISession';
import IToken from './IToken';
import { toFormData } from './utils';

export {
  IConfig,
};

export type loader = (options?: any) => Promise<string>;
export type saver = (token: string, options?: any) => Promise<void>;
export interface IOptions {
  save?: saver;
  load?: loader;
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

  get isExpired() {
    const currentTime = new Date().getTime();
    return this.token.creationTime + this.token.expiresIn < currentTime;
  }

  get canRefresh() {
    return !!this.token.refreshCode;
  }

  get isValid() {
    return !this.isExpired || this.canRefresh;
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
    url.query.client_secret = clientSecret;
    url.query.grant_types = grantType;

    if (scopes) {
      url.query.scope = scopes.join(' ');
    }

    await configManager.setItem(state, session);
    return url.toString();
  }

  public async exhangeUrl(url: string) {
    const parsed = Url.parse(url);
    const {
      code,
      state: sessionId,
    } = parsed.query;
    const {
      clientId,
      redirectUri,
    } = this.config;
    const {
      token_endpoint: tokenEndpoint,
    } = await this.getWellKnown();
    const session = await configManager.getItem(sessionId);

    if (!session) {
      throw Error('Session could not be found');
    }

    if (code) {
      const token = await this.call<any>(
        'post',
        tokenEndpoint,
        {
          client_id: clientId,
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
        refreshCode: token.refresh_token,
      };
      return token;
    } else {
      this.token = {
        accessCode: parsed.query.access_token,
        creationTime: new Date().getTime(),
        expiresIn: parseInt(parsed.query.expires_in || '0', 10),
      };
      return parsed.query;
    }
  }

  public async refresh() {
    const {
      clientId,
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
        grant_type: 'refresh_token',
        redirect_uri: redirectUri,
        refresh_token: refreshCode,
      },
    );
    this.token = {
      accessCode: token.access_token,
      creationTime: new Date().getTime(),
      expiresIn: token.expires_in,
      refreshCode: token.refresh_token,
    };
  }

  public expire() {
    this.token = {
      ...this.token,
      creationTime: 0,
      expiresIn: 0,
    };
  }

  public async getToken() {
    if (this.isExpired && this.canRefresh) {
      await this.refresh();
    }
    return this.token.accessCode;
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
          Authorization: `Bearer ${await this.getToken()}`,
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
        Authorization: `Bearer ${await this.getToken()}`,
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
