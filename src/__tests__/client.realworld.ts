import moxios from 'moxios';
import Url from '../Url';
import Client from '../Client';
import implicitConfig from './data/implicitClient';
import MockServer from './data/MockServer';

describe('client', () => {
  beforeEach(() => {
    moxios.install();
  });

  afterEach(() => {
    moxios.uninstall()
  });

  describe('real world', () => {
    let client: Client;

    beforeEach(() => {
      client = new Client(implicitConfig);
    });
  
    xtest('should be able to generate nonce and state', async () => {
      const loginUrlPromise = client.getLoginUrl();
      MockServer.config();
      const loginUrl = new Url(await loginUrlPromise);
      expect(loginUrl.query.client_id).toEqual('Demo.Implicit');
      expect(loginUrl.query.nonce).toBeDefined();
      expect(loginUrl.query.state).toBeDefined();
    });
  });
});