import axios from 'axios';
import Mock from 'axios-mock-adapter';
import { assert } from 'chai';
import Url from 'pure-url';
import Token, { IConfig } from '../src';
import configManager from '../src/configManager';
import Crypto from '../src/crypto/TestNode';
import Store from '../src/store/Memory';

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
  let saved;

  beforeEach(() => {
    saved = undefined;
    mock.reset();
    mock.onGet('https://example.com/.well-known/openid-configuration').reply(200, {
      authorization_endpoint: 'https://example.com/authorization',
      token_endpoint: 'https://example.com/token',
    });
    configManager.store = new Store();
    configManager.crypto = new Crypto();
  });

  it('should be able to create a new instance', async () => {
    const token = new Token(config, {
      load: async () => saved,
      save: async (s) => { saved = s; },
    });
    assert.equal(token.canRefresh, false);
    assert.equal(token.isExpired, true);
    assert.equal(token.isValid, false);
    assert.equal(await token.getToken(), undefined);
  });

  it('should be able to load a token', async () => {
    saved = JSON.stringify({
      accessCode: 'access-code',
      creationTime: new Date().getTime(),
      expiresIn: 1000,
    });
    const token = new Token(config, {
      load: async () => saved,
      save: async (s) => { saved = s; },
    });

    assert.equal(await token.getToken(), undefined);
    assert.equal(await token.load(), true);
    assert.equal(await token.getToken(), 'access-code');
  });

  it('should not load token if nothing to load', async () => {
    const token = new Token(config, {
      load: async () => saved,
      save: async (s) => { saved = s; },
    });

    assert.equal(await token.getToken(), undefined);
    assert.equal(await token.load(), false);
    assert.equal(await token.getToken(), undefined);
  });

  it('should be able to save a token', async () => {
    const token = new Token(config, {
      load: async () => saved,
      save: async (s) => { saved = s; },
    });

    assert.equal(saved, undefined);
    const url = await token.getLoginUrl();
    const resultUrl = 'https://localhost:3000?access_token=access-code&state=state&expires_in=1000';
    await token.exhangeUrl(resultUrl);
    assert.equal(await token.save(), true);
    assert.isDefined(saved);
  });
});
