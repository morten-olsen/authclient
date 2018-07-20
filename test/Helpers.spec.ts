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
  token_endpoint: 'https://example.com/token',
  userinfo_endpoint: 'https://example.com/user',
});

describe('test', () => {
  beforeEach(() => {
    configManager.store = new Store();
    configManager.crypto = new Crypto();
  });

  it('should automatic refresh expired tokens', async () => {
    mock.onPost('https://example.com/token').replyOnce(200, {
      access_token: 'access-code',
      expires_in: 1000,
      refresh_token: 'refresh-token',
    });
    mock.onGet('https://example.com/user').replyOnce(200, {
      name: 'test',
    });
    const token = new Token(config);
    const url = await token.getLoginUrl();
    const resultUrl = 'https://localhost:3000?code=token&state=state';
    await token.exhangeUrl(resultUrl);
    const profile = await token.getProfile();
    assert.equal(profile.name, 'test');
  });

  it('should be able to call with the token', async () => {
    mock.onGet('https://api.example.com/user').replyOnce(200, {
      name: 'test',
    });
    const token = new Token(config);
    const url = await token.getLoginUrl();
    const resultUrl = 'https://localhost:3000?access_token=token&state=state';
    await token.exhangeUrl(resultUrl);
    const profile = await token.request({
      method: 'get',
      url: 'https://api.example.com/user',
    });
    assert.equal(profile.data.name, 'test');
  });
});
