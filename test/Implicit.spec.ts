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
  grantType: 'implicit',
  redirectUri: 'http://localhost:3000',
  responseType: 'id_token token',
  scopes: [
    'openid',
    'profile',
    'Sampension.Api.Customer',
  ],
};

const mock = new Mock(axios);

describe('test', () => {
  beforeEach(() => {
    mock.onGet('https://example.com/.well-known/openid-configuration').reply(200, {
      authorization_endpoint: 'https://example.com/authorization',
      token_endpoint: 'https://example.com/token',
    });
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
    const expectedUrl = 'https://example.com/authorization?client_id=Client.ID&redirect_uri=http%3A%2F%2Flocalhost%3A3000&state=state&nonce=nonce&response_type=id_token%20token&client_secret=secret&grant_types=implicit&scope=openid%20profile%20Sampension.Api.Customer';
    assert.equal(await token.getLoginUrl(), expectedUrl);
  });

  it('should be able get access token', async () => {
    const token = new Token(config, {
      allowExport: true,
    });
    const url = await token.getLoginUrl();
    const resultUrl = 'https://localhost:3000?access_token=access-code&state=state&expires_in=1000';
    await token.exchangeUrl(resultUrl);
    assert.equal(token.canRefresh, false);
    assert.equal(token.isExpired, false);
    assert.equal(token.isValid, true);
    assert.equal(await token.getToken(), 'access-code');
  });

  it('should fail is session does not exist', async () => {
    try {
      const token = new Token(config, {
      allowExport: true,
    });
      const resultUrl = 'https://localhost:3000?access_token=access-code&state=state&expires_in=1000';
      await token.exchangeUrl(resultUrl);
      throw Error('should not be reachable');
    } catch (err) {
      assert.equal(err.toString(), 'Error: Session could not be found');
    }
  });
});
