import url from 'url';
import axios from 'axios';
import querystring from 'querystring';
import AuthClient from './AuthClient';
import Crypto from './CryptoHelper';
import Store from './Store';
import config from '../demo/config';

jest.mock('axios');

describe('AuthClient', () => {
  beforeEach(() => {
    axios.clear();
    axios.setMock('get', 'https://authclient-demo.eu.auth0.com/.well-known/openid-configuration', {
      authorization_endpoint: 'https://authclient-demo.eu.auth0.com/authorize',
      token_endpoint: 'https://authclient-demo.eu.auth0.com/token',
    });
    axios.setMock('post', 'https://authclient-demo.eu.auth0.com/token', (data, extra) => extra.tokenAssert(data));
  });

  describe('implicit grant', () => {
    describe('url generator', () => {
      it('without crypto', async () => {
        const client = new AuthClient(config.implicit);
        const result = await client.getLoginUrl();
        const parsed = url.parse(result);
        const query = querystring.parse(parsed.query);
        expect(parsed.host).toBe('authclient-demo.eu.auth0.com');
        expect(query.client_id).toBe(config.implicit.clientId);
        expect(query.code_challenge).toBeUndefined();
        expect(query.code_challenge_method).toBeUndefined();
        expect(query.redirect_uri).toBe('about://blank');
        expect(query.response_type).toBe('id_token token');
        expect(query.scope).toBe('openid profile');
        expect(query.state).toBeUndefined();
      });

      it('with crypto', async () => {
        const client = new AuthClient({
          ...config.implicit,
          crypto: new Crypto(),
        });
        const result = await client.getLoginUrl();
        const parsed = url.parse(result);
        const query = querystring.parse(parsed.query);
        expect(parsed.host).toBe('authclient-demo.eu.auth0.com');
        expect(query.client_id).toBe(config.implicit.clientId);
        expect(query.code_challenge).toBeDefined();
        expect(query.code_challenge_method).toBe('S256');
        expect(query.redirect_uri).toBe('about://blank');
        expect(query.response_type).toBe('id_token token');
        expect(query.scope).toBe('openid profile');
        expect(query.state).toBeDefined();
      });
    });


    describe('token exchange', () => {
      it('with query parameter', async () => {
        const client = new AuthClient(config.implicit);
        const token = await client.exchangeToken('https://localhost?access_token=test');
        expect(token.access_token).toBe('test');
      });

      it('with hash', async () => {
        const client = new AuthClient(config.implicit);
        const token = await client.exchangeToken('https://localhost#access_token=test');
        expect(token.access_token).toBe('test');
      });
    });
  });

  describe('authentication code grant', () => {
    describe('url generator', () => {
      it('without crypto', async () => {
        const client = new AuthClient(config.authCode);
        const result = await client.getLoginUrl();
        const parsed = url.parse(result);
        const query = querystring.parse(parsed.query);
        expect(parsed.host).toBe('authclient-demo.eu.auth0.com');
        expect(query.client_id).toBe(config.authCode.clientId);
        expect(query.code_challenge).toBeUndefined();
        expect(query.code_challenge_method).toBeUndefined();
        expect(query.redirect_uri).toBe('about://blank');
        expect(query.response_type).toBe('code');
        expect(query.scope).toBe('offline_access openid profile');
        expect(query.state).toBeUndefined();
      });

      it('with crypto', async () => {
        const client = new AuthClient({
          ...config.authCode,
          crypto: new Crypto(),
        });
        const result = await client.getLoginUrl();
        const parsed = url.parse(result);
        const query = querystring.parse(parsed.query);
        expect(parsed.host).toBe('authclient-demo.eu.auth0.com');
        expect(query.client_id).toBe(config.authCode.clientId);
        expect(query.code_challenge).toBeDefined();
        expect(query.code_challenge_method).toBe('S256');
        expect(query.redirect_uri).toBe('about://blank');
        expect(query.response_type).toBe('code');
        expect(query.scope).toBe('offline_access openid profile');
        expect(query.state).toBeDefined();
      });
    });

    describe('token exchange', () => {
      it('without crypto', async () => {
        const client = new AuthClient(config.authCode);
        axios.setExtra({
          tokenAssert: (data) => {
            expect(data.client_id).toBe(config.authCode.clientId);
            expect(data.client_secret).toBe(config.authCode.clientSecret);
            expect(data.redirect_uri).toBe('about://blank');
            expect(data.grant_type).toBe('authorization_code');
            expect(data.username).toBeUndefined();
            expect(data.password).toBeUndefined();
            expect(data.code).toBe('test');
            expect(data.scope).toBe('offline_access openid profile');
            expect(data.refresh_token).toBeUndefined();
            expect(data.code_verifier).toBeUndefined();
            return {
              access_token: 'test2',
            };
          },
        });
        const token = await client.exchangeToken('https://localhost?code=test');
        expect(token.access_token).toBe('test2');
      });

      it('with crypto', async () => {
        const store = new Store();
        const crypto = new Crypto();
        const client = new AuthClient({
          ...config.authCode,
          crypto,
          store,
        });
        const result = await client.getLoginUrl();
        const parsed = url.parse(result);
        const query = querystring.parse(parsed.query);
        expect(query.state).toBeDefined();
        axios.setExtra({
          tokenAssert: async (data) => {
            expect(data.client_id).toBe(config.authCode.clientId);
            expect(data.client_secret).toBe(config.authCode.clientSecret);
            expect(data.redirect_uri).toBe('about://blank');
            expect(data.grant_type).toBe('authorization_code');
            expect(data.username).toBeUndefined();
            expect(data.password).toBeUndefined();
            expect(data.code).toBe('test');
            expect(data.scope).toBe('offline_access openid profile');
            expect(data.refresh_token).toBeUndefined();
            expect(data.code_verifier).toBeDefined();
            const challenge = query.code_challenge;
            expect(crypto.bytesToBase64(await crypto.sha256(data.code_verifier))).toBe(challenge);
            expect(challenge).toBeDefined();
            return {
              access_token: 'test2',
            };
          },
        });
        const token = await client.exchangeToken(`https://localhost?code=test&state=${query.state}`);
        expect(token.access_token).toBe('test2');
      });
    });
  });
});
