import moxios from 'moxios';
import Client from '../Client';
import serverConfig from './data/serverConfig';
import implicitConfig from './data/implicitClient';

describe('client', () => {
  beforeEach(() => {
    moxios.install();
  });

  afterEach(() => {
    moxios.uninstall()
  });

  describe('server config', () => {
    let client: Client;

    beforeEach(() => {
      client = new Client(implicitConfig);
    });
  
    test('should be able to get config', async () => {
      const configPromise = client.getServerConfig();
      moxios.wait(function () {
        const request = moxios.requests.mostRecent();
        expect(request.url).toEqual('https://my-oauth.com/.well-known/openid-configuration');
        request.respondWith({
          status: 200,
          response: serverConfig,
        });
        expect(moxios.requests.count()).toEqual(1);
      });
      const response = await configPromise;
      expect(response).toBeDefined();
      expect(response.authorization_endpoint).toEqual('https://my-oauth.com/authorize');
    });
  
    test('should use cache for repeated config', async () => {
      const configPromise = client.getServerConfig();
      moxios.wait(function () {
        const request = moxios.requests.mostRecent();
        expect(request.url).toEqual('https://my-oauth.com/.well-known/openid-configuration');
        request.respondWith({
          status: 200,
          response: serverConfig,
        });
        expect(moxios.requests.count()).toEqual(1);
      });
      await configPromise;
      const response = await client.getServerConfig();
      expect(response).toBeDefined();
      expect(response.authorization_endpoint).toEqual('https://my-oauth.com/authorize');
    });
  });
});