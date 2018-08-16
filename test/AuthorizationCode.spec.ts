import axios from 'axios';
import Mock from 'axios-mock-adapter';
import { assert } from 'chai';
import Url from 'pure-url';
import Token, { IConfig } from '../src';
import configManager from '../src/configManager';
import Crypto from '../src/crypto/TestNode';
import Store from '../src/store/Memory';

import wellKnown from './well-known';

const config: IConfig = {
  baseUrl: 'https://example.com',
  clientId: 'Client.ID',
  clientSecret: 'secret',
  grantType: 'authorization_code',
  pkce: true,
  redirectUri: 'http://localhost:3000',
  responseType: 'code',
  scopes: [
    'openid',
    'profile',
    'Sampension.Api.Customer',
  ],
};

const mock = new Mock(axios);
mock.onGet('https://example.com/.well-known/openid-configuration').reply(200, {
  authorization_endpoint: 'https://example.com/authorization',
  revocation_endpoint: 'https://example.com/revoke',
  token_endpoint: 'https://example.com/token',
});

describe('test', () => {
  beforeEach(() => {

    configManager.store = new Store();
    configManager.crypto = new Crypto();
  });

  it('should be able to create a new instance', async () => {
    const token = new Token(config, {
      allowExport: true,
    });
    assert.equal(token.canRefresh, false);
    assert.equal(token.isExpired, true);
    assert.equal(token.isValid, false);
    assert.equal(await token.getToken(), undefined);
  });

  it('should be able to create a login url', async () => {
    const token = new Token(config, {
      allowExport: true,
    });
    const expectedUrl = 'https://example.com/authorization?client_id=Client.ID&redirect_uri='
      + 'http%3A%2F%2Flocalhost%3A3000&code_challenge=qdgLLRr1saFHT6DWfWU28VNPIi7e9ynEBnBG3O'
      + 'adw9g&code_challenge_method=S256&state=state&nonce=nonce&response_type=code&client_'
      + 'secret=secret&grant_types=authorization_code&scope=openid%20profile%20Sampension.Api.Customer';
    assert.equal(await token.getLoginUrl(), expectedUrl);
  });

  it('should be able get access token', async () => {
    mock.onPost('https://example.com/token').replyOnce(200, {
      access_token: 'access-code',
      expires_in: 1000,
    });
    const token = new Token(config, {
      allowExport: true,
    });
    const url = await token.getLoginUrl();
    const resultUrl = 'https://localhost:3000?code=token&state=state';
    await token.exchangeUrl(resultUrl);
    assert.equal(token.canRefresh, false);
    assert.equal(token.isExpired, false);
    assert.equal(token.isValid, true);
    assert.equal(await token.getToken(), 'access-code');
  });

  it('should be able get refresh token', async () => {
    mock.onPost('https://example.com/token').replyOnce(200, {
      access_token: 'access-code',
      expires_in: 1000,
      refresh_token: 'refresh-token',
    });
    const token = new Token(config, {
      allowExport: true,
    });
    const url = await token.getLoginUrl();
    const resultUrl = 'https://localhost:3000?code=token&state=state';
    await token.exchangeUrl(resultUrl);
    assert.equal(token.canRefresh, true);
    assert.equal(token.isExpired, false);
    assert.equal(token.isValid, true);
    assert.equal(await token.getToken(), 'access-code');
  });

  it('should automatic refresh expired tokens', async () => {
    mock.onPost('https://example.com/token').replyOnce(200, {
      access_token: 'access-code',
      expires_in: 1000,
      refresh_token: 'refresh-token',
    });
    const token = new Token(config, {
      allowExport: true,
    });
    const url = await token.getLoginUrl();
    const resultUrl = 'https://localhost:3000?code=token&state=state';
    await token.exchangeUrl(resultUrl);
    assert.equal(token.canRefresh, true);
    assert.equal(token.isExpired, false);
    assert.equal(token.isValid, true);
    assert.equal(await token.getToken(), 'access-code');
    await token.expire();
    assert.equal(token.canRefresh, true);
    assert.equal(token.isExpired, true);
    assert.equal(token.isValid, true);
    mock.onPost('https://example.com/token').replyOnce(200, {
      access_token: 'access-code2',
      expires_in: 1000,
      refresh_token: 'refresh-token2',
    });
    assert.equal(await token.getToken(), 'access-code2');
    assert.equal(token.canRefresh, true);
    assert.equal(token.isExpired, false);
    assert.equal(token.isValid, true);
  });

  it('should be able to revoke a token', async () => {
    mock.onPost('https://example.com/token').replyOnce(200, {
      access_token: 'access-code',
      expires_in: 1000,
      refresh_token: 'refresh-token',
    });
    mock.onPost('https://example.com/revoke').replyOnce(200, {
    });
    const token = new Token(config, {
      allowExport: true,
    });
    const url = await token.getLoginUrl();
    const resultUrl = 'https://localhost:3000?code=token&state=state';
    await token.exchangeUrl(resultUrl);
    assert.equal(token.isValid, true);
    await token.revoke();
    assert.equal(token.isValid, false);
  });
});
