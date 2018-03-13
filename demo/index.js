import AuthClient from '../src/index';

const boot = async () => {
  const authClient = new AuthClient({
    baseUrl: 'https://identitet-test.sampension.dk',
    clientId: 'Sampension.Mobile',
    redirectUri: `${global.location.protocol}//${global.location.host}`,
    responseTypes: ['id_token', 'token'],
    scopes: [
      'openid',
      'profile',
      'Sampension.Api',
      'Sampension.Consents.Api',
    ],
  });
  console.log('create url', await authClient.getLoginUrl());

  if (global.location.hash) {
    await authClient.getToken(global.location.href);
  }
};

boot()
  .catch(err => console.error(err));
