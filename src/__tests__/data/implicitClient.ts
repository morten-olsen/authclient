import Config from '../../configs/Client';

const config: Config = {
  host: 'https://my-oauth.com',
  type: 'Implicit',
  redirectUri: 'https://my-app.com/callback',
  scopes: [
    'scope1',
    'scope2',
  ],
  clientId: 'Demo.Implicit',
};

export default config;