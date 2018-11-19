import moxios from 'moxios';
import Client from '../Client';
import authCodeConfig from './data/authCodeConfig';
import MockServer from './data/MockServer';

describe('client', () => {
  beforeEach(() => {
    moxios.install();
  });

  afterEach(() => {
    moxios.uninstall();
  });

  describe('authorization code', () => {
    let client: Client;

    beforeEach(() => {
      client = new Client(authCodeConfig, {
        mock: true,
        exportable: true,
      });
    });
  
    test('should be able to generate login url', async () => {
      const loginUrlPromise = client.getLoginUrl();
      MockServer.config();
      const loginUrl = await loginUrlPromise;
      expect(loginUrl).toEqual('https://my-oauth.com/authorize?client_id=Demo.AuthCode&redirect_uri=https%3A%2F%2Fmy-app.com%2Fcallback&state=teststate&nonce=testnonce&response_type=code&scope=scope1%20scope2');
    });
  
    test('should be able to get token query string', async () => {
      const loginUrlPromise = client.getLoginUrl();
      MockServer.config();
      const loginUrl = await loginUrlPromise;
      
      const { redirectUrl, handleTokenExchange } = MockServer.createLogin(loginUrl);
      expect(redirectUrl).toEqual('https://my-app.com/callback?code=test-code_teststate&state=teststate');
      const handleCallbackPromise = client.handleCallback(redirectUrl);
      handleTokenExchange();
      expect(await handleCallbackPromise).toBeTruthy();
      expect(client.accesstoken).toBeDefined();
      expect(client.hasRefreshToken).toBeDefined();
    });
  
    test('should be able to get token query string', async () => {
      const loginUrlPromise = client.getLoginUrl();
      MockServer.config();
      const loginUrl = await loginUrlPromise;
      
      const { redirectUrl, handleTokenExchange } = MockServer.createLogin(loginUrl, {
        paramType: 'hash',
      });
      expect(redirectUrl).toEqual('https://my-app.com/callback#code=test-code_teststate&state=teststate');
      const handleCallbackPromise = client.handleCallback(redirectUrl);
      handleTokenExchange();
      expect(await handleCallbackPromise).toBeTruthy();
      expect(client.accesstoken).toBeDefined();
      expect(client.hasRefreshToken).toBeDefined();
    });
  });
});