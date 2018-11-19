import Config from '../../configs/Client';

const config: Config = {
  host: 'https://my-oauth.com',
  type: 'AuthorizationCode',
  redirectUri: 'https://my-app.com/callback',
  scopes: [
    'scope1',
    'scope2',
  ],
  clientId: 'Demo.AuthCode',
};

export default config;