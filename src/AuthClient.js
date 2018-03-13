import axios from 'axios';
import Crypto from './Crypto';
import Store from './Store';

const defaultOptions = {
  store: new Store('auth_'),
  tokenType: 'authorization_code',
  crypto: new Crypto(),
};

/**
  @typedef {Object} TokenTypes
  @property {string} baseUrl
  @property {string} clientId
*/

/**
  @typedef {Object} ResponseTypes
  @property {string} baseUrl
  @property {string} clientId
*/

/**
  @typedef {Object} Options
  @property {string} baseUrl
  @property {string} clientId
  @property {string} [clientSecret]
  @property {string} redirectUri
  @property {ResponseTypes[]} responseTypes
  @property {string[]} scopes
  @property {Store} [store]
  @property {TokenTypes} [tokenType]
  @property {Crypto} [crypto]
  @property {string} [username]
  @property {string} [password]
  @property {string} [refreshToken]
  @property {string[]} [acrs]
*/

/**
  @typedef {Object} TokenResponse
*/

/**
 * Client
 *
 * @example
 * const authClient = new AuthClient({
 *   baseUrl: 'https://your-open-id-server.com',
 *   clientId: 'your_client_id',
 *   redirectUri: 'https://your-site.com',
 *   responseTypes: ['id_token', 'token'],
 *   scopes: [
 *     'openid',
 *     'profile',
 *   ],
 * });
 *
 * const url = await authClient.getLoginUrl();
 * window.location.href = url;
 */
class AuthClient {
  /**
   *
   * @param {Options} options
   */
  constructor(options) {
    /** @ignore */
    this._options = {
      ...defaultOptions,
      ...options,
    };
  }

  /** @ignore */
  async _getConfiguration(options) {
    const { baseUrl } = options;
    const url = `${baseUrl}/.well-known/openid-configuration`;
    const response = await axios.get(url);
    return response.data;
  }

  /** @ignore */
  async _getKeys(options) {
    const { baseUrl } = options;
    const url = `${baseUrl}/.well-known/openid-configuration/jwks`;
    const response = await axios.get(url);
    return response.data;
  }

  /** @ignore */
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

  /** @ignore */
  async _createRequestUrl(options, { authorization_endpoint: authorizationEndpoint }) {
    const { store, crypto } = this._options;
    /* eslint-disable camelcase */
    const {
      clientId: client_id,
      redirectUri: redirect_uri,
      scopes = [],
      responseTypes = ['code'],
      extra = {},
      pkce: pkceEnabled,
    } = options;

    const state = crypto.random();
    let pkce;
    if (crypto && pkceEnabled) {
      pkce = await this._createVerifier(options);
    }

    const params = {
      client_id,
      redirect_uri,
      scope: scopes ? scopes.join(' ') : undefined,
      code_challenge: pkce ? pkce.challenge : undefined,
      code_challenge_method: pkce ? 'S256' : undefined,
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

    const parts = Object.keys(params).filter(key => params[key]).map(key => `${key}=${encodeURIComponent(params[key])}`);
    return `${authorizationEndpoint}?${parts.join('&')}`;
  }

  /** @ignore */
  _parseUrl(url) {
    const [, query] = url.split(url.indexOf('#') >= 0 ? '#' : '?');
    if (!query) {
      return {};
    }
    return query.split('&').reduce((output, current) => {
      const [name, value] = current.split('=');
      return {
        ...output,
        [name]: decodeURIComponent(value),
      };
    }, {});
  }

  /** @ignore */
  async _requestToken(options, config) {
    const {
      clientId,
      tokenType,
      refreshToken,
      store,
      code,
      sessionId,
      clientSecret,
      redirectUri,
      username,
      password,
      // acrs,
      // scopes,
    } = options;

    const session = await store.getItem(sessionId);
    const response = await axios.post(config.token_endpoint, {
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: tokenType,
      username,
      password,
      code,
      // scope: scopes ? scopes.join(' ') : undefined,
      // acr_values: acrs,
      refresh_token: refreshToken,
      code_verifier: session ? session.verifier : undefined,
    });
    if (sessionId) {
      store.removeItem(sessionId);
    }
    return response.data;
  }

  /**
   * A method to test id a given url contains the information
   * needed to extract or generate a token
   * @param {string} url The url containing the server informations
   * @returns {bool} indicates it the url is valid
   */
  async isValidUrl(url) {
    const params = await this._parseUrl(url);
    return !!params.access_token || !!params.code;
  }

  /**
   * Generate a login url which the application should show to the user
   * @param {Options} options the options combined which will be combined
   *                          with the client's global options
   * @returns {string} The resulting url which should be shown to the user
   * @example
   * const url = await authClient.getLoginUrl();
   * location.href = url;
   */
  async getLoginUrl(options) {
    const extendedOptions = {
      ...this._options,
      options,
    };
    const config = await this._getConfiguration(extendedOptions);
    const request = await this._createRequestUrl(extendedOptions, config);
    return request;
  }

  /**
   * Transform a redirect url into a valid token
   * @param {string} url The url containing the server informations
   * @param {Options} options the options combined which will be combined
   *                          with the client's global options
   * @returns {TokenResponse} The resulting token
   * @example
   * if (window.location.hash) {
   *   const token = await authClient.exchangeToken(window.location.href);
   * }
   */
  async exchangeToken(url, options) {
    const extendedOptions = {
      ...this._options,
      options,
    };
    const {
      store,
    } = extendedOptions;
    const codeResponse = await this._parseUrl(url);

    if (codeResponse.access_token) {
      store.removeItem(codeResponse.session_state);
      return codeResponse;
    } else if (codeResponse.code) {
      const config = await this._getConfiguration(extendedOptions);
      const response = await this._requestToken({
        code: codeResponse.code,
        sessionId: codeResponse.state,
        ...extendedOptions,
      }, config);

      return response;
    }
    return undefined;
  }

  /**
   * Generates a new token, either using the refreshToken or the username
   * and password supplied to options
   * @param {Options} options the options combined which will be combined
   *                          with the client's global options
   * @returns {TokenResponse} The resulting token
   * @example
   * const token = await authClient.getToken({
   *   username: 'admin',
   *   password: 'god',
   * });
   */
  async getToken(options) {
    const extendedOptions = {
      ...this._options,
      options,
    };
    const config = await this._getConfiguration(extendedOptions);
    const response = await this._requestToken(extendedOptions, config);

    console.log(response);
    return response;
  }
}

export default AuthClient;
