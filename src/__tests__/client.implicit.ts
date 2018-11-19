import moxios from 'moxios';
import Client from '../Client';
import implicitConfig from './data/implicitClient';
import MockServer from './data/MockServer';

describe('client', () => {
  beforeEach(() => {
    moxios.install();
  });

  afterEach(() => {
    moxios.uninstall();
  });

  describe('implicit', () => {
    let client: Client;

    beforeEach(() => {
      client = new Client(implicitConfig, {
        mock: true,
        exportable: true,
      });
    });
  
    test('should be able to generate login url', async () => {
      const loginUrlPromise = client.getLoginUrl();
      MockServer.config();
      const loginUrl = await loginUrlPromise;
      expect(loginUrl).toEqual('https://my-oauth.com/authorize?client_id=Demo.Implicit&redirect_uri=https%3A%2F%2Fmy-app.com%2Fcallback&state=teststate&nonce=testnonce&response_type=id_token%20token&scope=scope1%20scope2');
    });
  
    test('should be able to create nonce and state', async () => {
      const loginUrlPromise = client.getLoginUrl();
      MockServer.config();
      const loginUrl = await loginUrlPromise;
      expect(loginUrl).toEqual('https://my-oauth.com/authorize?client_id=Demo.Implicit&redirect_uri=https%3A%2F%2Fmy-app.com%2Fcallback&state=teststate&nonce=testnonce&response_type=id_token%20token&scope=scope1%20scope2');
    });
  
    test('should be able to get access token from query string', async () => {
      const loginUrlPromise = client.getLoginUrl();
      MockServer.config();
      const loginUrl = await loginUrlPromise;
      
      const { redirectUrl } = MockServer.createLogin(loginUrl);
      expect(redirectUrl).toEqual('https://my-app.com/callback?id_token=test-id-token&access_token=test-access-token&state=teststate');

      expect(await client.handleCallback(redirectUrl)).toBeTruthy();
      expect(client.accesstoken).toBeDefined();
      expect(client.idToken).toBeDefined();
    });

    test('should be able to get access token from hash string', async () => {
      const loginUrlPromise = client.getLoginUrl();
      MockServer.config();
      const loginUrl = await loginUrlPromise;
      
      const { redirectUrl } = MockServer.createLogin(loginUrl, {
        paramType: 'hash',
      });
      expect(redirectUrl).toEqual('https://my-app.com/callback#id_token=test-id-token&access_token=test-access-token&state=teststate');

      expect(await client.handleCallback(redirectUrl)).toBeTruthy();
      expect(client.accesstoken).toEqual('test-access-token');
      expect(client.idToken).toEqual('test-id-token');
    });
  });
});