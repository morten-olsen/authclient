import AuthClient from '../src/index';

const boot = async () => {
  const authClient = new AuthClient({
    baseUrl: 'https://your-server',
    clientId: 'ClientId',
    redirectUri: `${global.location.protocol}//${global.location.host}`,
    responseTypes: ['id_token', 'token'],
    scopes: [
      'openid',
      'profile',
    ],
  });
  console.log('create url', await authClient.getLoginUrl());

  if (global.location.hash) {
    await authClient.exchangeToken(global.location.href);
  }
};

boot()
  .catch(err => console.error(err));
