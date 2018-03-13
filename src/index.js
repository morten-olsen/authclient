import axios from 'axios';
import { base64URLEncode } from './utils';
import Crypto from './Crypto';
import Store from './Store';

const defaultOptions = {
  store: new Store('auth_'),
  tokenType: 'authorization_code',
  crypto: new Crypto(),
};

class AuthClient {
  constructor(options) {
    this._options = {
      ...defaultOptions,
      ...options,
    };
  }

  async _getConfiguration(options) {
    const { baseUrl } = options;
    const url = `${baseUrl}/.well-known/openid-configuration`;
    const response = await axios.get(url);
    return response.data;
  }

  async _getKeys(options) {
    const { baseUrl } = options;
    const url = `${baseUrl}/.well-known/openid-configuration/jwks`;
    const response = await axios.get(url);
    return response.data;
  }

  async _createVerifier(options) {
    const { crypto } = options;
    const verifier = crypto.random();
    const challengeBytes = await crypto.sha256(verifier);
    const challenge = await crypto.bytesToBase64(challengeBytes);
    return {
      verifier,
      challenge,
    };
  }

  async _createRequestUrl(options, { authorization_endpoint: authorizationEndpoint }) {
    const { store, crypto } = this._options;
    /* eslint-disable camelcase */
    const {
      clientId: client_id,
      redirectUri: redirect_uri,
      scopes = [],
      responseTypes = ['code'],
      extra = {},
    } = options;

    const state = crypto.random();
    let pkce;
    if (crypto) {
      pkce = await this._createVerifier(options);
    }

    const params = {
      client_id,
      redirect_uri,
      scope: scopes.join(' '),
      code_challenge: pkce ? pkce.challenge : undefined,
      response_type: responseTypes.join(' '),
      state,
      nonce: responseTypes.includes('id_token') ? crypto.random() : undefined,
      ...extra,
    };
    /* eslint-enable camelcase */

    await store.setItem(state, {
      ...params,
      ...pkce,
    });

    const parts = Object.keys(params).map(key => `${key}=${encodeURIComponent(params[key])}`);
    return `${authorizationEndpoint}?${parts.join('&')}`;
  }

  _parseUrl(url) {
    const [, query] = url.split('#');
    return query.split('&').reduce((output, current) => {
      const [name, value] = current.split('=');
      return {
        ...output,
        [name]: decodeURIComponent(value),
      };
    }, {});
  }

  async getLoginUrl(options) {
    const extendedOptions = {
      ...this._options,
      options,
    };
    const config = await this._getConfiguration(extendedOptions);
    const request = await this._createRequestUrl(extendedOptions, config);
    return request;
  }

  async getToken(url, options) {
    const extendedOptions = {
      ...this._options,
      options,
    };
    const {
      store,
      clientId,
      tokenType,
      refreshToken,
    } = extendedOptions;
    const config = await this._getConfiguration(extendedOptions);
    const codeResponse = await this._parseUrl(url);
    const session = store.getItem(codeResponse.session_state);
    if (session) {
      store.removeItem(codeResponse.session_state);
    }

    if (codeResponse.access_token) {
      console.log(codeResponse);
      return codeResponse.access_token;
    }

    const response = await axios.post(config.token_endpoint, {
      client_id: clientId,
      grant_type: tokenType,
      code: codeResponse.auth_code,
      refresh_token: refreshToken,
    });

    console.log(response);
  }
}

export default AuthClient;
