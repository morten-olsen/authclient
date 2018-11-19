import axios from 'axios';
import Token from './models/Token';
import ClientConfiguration from './configs/Client';
import ServerConfiguration from './configs/Server';
import MemoryStore from './providers/MemoryStore';
import Store from './models/Store';
import Url from './Url';
import Security from './models/Security';

export interface Options {
  store?: Store;
  mock?: boolean;
  exportable?: boolean;
  security?: Security;
}

class Client {
  private token?: Token;
  private clientConfig: ClientConfiguration;
  private store: Store;
  private mock: boolean;
  private exportable: boolean;
  private security: Security;
  private serverConfig?: ServerConfiguration;

  constructor(config: ClientConfiguration, {
    mock = false,
    exportable = false,
    store = new MemoryStore(),
    security = {} as Security,
  }: Options = {}) {
    this.clientConfig = config;
    this.store = store;
    this.mock = mock;
    this.exportable = exportable;
    this.security = security;
  }

  get accesstoken() {
    if (!this.exportable) {
      throw Error('Token is not exportable');
    }
    return this.token ? this.token.accessToken : undefined;
  }

  get idToken() {
    if (!this.exportable) {
      throw Error('Token is not exportable');
    }
    return this.token ? this.token.idToken : undefined;
  }

  get hasRefreshToken() {
    return !!(this.token && this.token.refreshToken);
  }

  async getLoginUrl(state?: any) {
    const {
      authorization_endpoint,
    } = await this.getServerConfig();

    const url = new Url(authorization_endpoint);
    url.query.client_id = this.clientConfig.clientId;
    if (['Implicit', 'AuthorizationCode'].find(i => i == this.clientConfig.type)) {
      let stateId: string;
      if (!this.clientConfig.redirectUri) {
        throw Error(`redirectUri is required for ${this.clientConfig.type}`);
      }
      url.query.redirect_uri = this.clientConfig.redirectUri;

      if (this.mock) {
        stateId = 'teststate';
        url.query.state = stateId;
        url.query.nonce = 'testnonce';
      } else {
        stateId = await this.security.generateRandom(32);
        url.query.nonce = await this.security.generateRandom(32);
      }
      if (this.clientConfig.type === 'Implicit') {
        url.query.response_type = 'id_token token';
      }
      if (this.clientConfig.type === 'AuthorizationCode') {
        url.query.response_type = 'code';
      }

      this.store.set(stateId, JSON.stringify({
        state,
      }));
    }
    url.query.scope = this.clientConfig.scopes.join(' ');
    return url.toString();
  }

  async handleCallback(url: string) {
    const {
      data,
      state,
    } = await this.getRequestData(url);
    if (data.code) {
      await this.handleAuthCode(data.code);
    } else {
      this.handleAccessToken(data);
    }
    return state;
  }

  async getRequestData(url: string) {
    const uri = new Url(url);
    const { query, hash } = uri;
    const data = {
      ...query,
      ...hash,
    };
    const stateId = data.state;
    const authCode = data.code;

    const requestRaw = await this.store.get(stateId);
    if (!requestRaw) {
      throw new Error('login state was not found');
    }

    const state = JSON.parse(requestRaw);
    this.store.remove(stateId);

    return {
      state,
      authCode,
      data,
    }
  }

  async handleAuthCode(code: string) {
    const {
      token_endpoint,
    } = await this.getServerConfig();
    const {
      data,
    } = await axios.post(token_endpoint, {
      code,
      grant_type: 'authorization_code',
      redirect_uri: this.clientConfig.redirectUri,
      client_id: this.clientConfig.clientId,
    })
    this.setToken({
      accessToken: data.access_token,
      idToken: data.id_token,
      createdAt: new Date().getTime(),
      expiresIn: data.expires_in,
      refreshToken: data.refresh_token,
    });
  }

  handleAccessToken(data: {[name: string]: string}) {
    const accessToken = data.access_token;
    const idToken = data.id_token;
    const scope = data.scope;
    const type = data.token_type;
    const expiresIn = data.expires_in;
    this.setToken({
      accessToken,
      idToken,
      expiresIn: parseInt(expiresIn),
      createdAt: new Date().getTime(),
    });
  }

  async setToken(token: Token) {
    let refreshToken: string | undefined = token.refreshToken;
    if (!refreshToken && this.token) {
      refreshToken = this.token.refreshToken;
    }

    this.token = {
      ...token,
      refreshToken,
    };
    if (this.clientConfig.saveToken) {
      await this.clientConfig.saveToken(this.token);
    }
  }

  async loadToken() {
    if (this.clientConfig.loadToken) {
      const token = await this.clientConfig.loadToken();
      if (token) {
        this.token = token;
      }
    }
  }

  async refreshToken() {
    const {
      token_endpoint,
    } = await this.getServerConfig();
      if (this.token && this.hasRefreshToken) {
      const {
        data,
      } = await axios.post(token_endpoint, {
        refresh_token: this.token.refreshToken,
        grant_type: 'refresh_token',
      })
      const token: Token = {
        accessToken: data.access_token,
        idToken: data.id_token,
        createdAt: new Date().getTime(),
        expiresIn: data.expires_in,
        refreshToken: data.refresh_token,
      };
      await this.setToken(token);
    }
  }

  async revokeToken() {

  }

  async getServerConfig() {
    if (this.serverConfig) {
      return this.serverConfig;
    }
    const {
      data,
    } = await axios.get(`${this.clientConfig.host}/.well-known/openid-configuration`);
    this.serverConfig = data;
    return data as ServerConfiguration;
  }
}

export default Client;