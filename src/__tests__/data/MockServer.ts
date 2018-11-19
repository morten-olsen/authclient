import moxios from 'moxios';
import serverConfig from './serverConfig';
import Url from '../../Url';

export interface Options {
  paramType?: 'query' | 'hash';
}

class MockServer {
  redirectUrl: string;
  codes: {[id: string]: any} = {}

  constructor(authorizationUrl: string, {
    paramType = 'query',
  }: Options = {}) {
    const url = new Url(authorizationUrl);
    const redirectUrl = new Url(url.query.redirect_uri);
    if (url.query.response_type === 'id_token token') {
      redirectUrl[paramType].id_token = 'test-id-token';
      redirectUrl[paramType].access_token = 'test-access-token';
      redirectUrl[paramType].state = url.query.state;
    }
    if (url.query.response_type === 'code') {
      const code = `test-code_${url.query.state}`;
      redirectUrl[paramType].code = code;
      redirectUrl[paramType].state = url.query.state;
      this.codes[code] = {
        client_id: url.query.client_id,
        code,
        grant_type: 'authorization_code',
        redirect_uri: 'https://my-app.com/callback'
      };
    }
    this.redirectUrl = redirectUrl.toString();
    this.handleTokenExchange = this.handleTokenExchange.bind(this);
  }

  handleTokenExchange() {
    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      expect(request.url).toEqual('https://my-oauth.com/token');
      const body = JSON.parse(request.config.data);
      const client = this.codes[body.code];
      expect(JSON.parse(request.config.data)).toEqual(client)
      request.respondWith({
        status: 200,
        response: {
          access_token: 'test-access-token',
          refresh_token: 'test-refresh-token',
        },
      });
    });
  }

  static config() {
    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      expect(request.url).toEqual('https://my-oauth.com/.well-known/openid-configuration');
      request.respondWith({
        status: 200,
        response: serverConfig,
      });
      expect(moxios.requests.count()).toEqual(1);
    });
  }

  static createLogin(authorizationUrl: string, options?: Options) {
    
    const server = new MockServer(authorizationUrl, options);
    return server;
  }
}

export default MockServer;