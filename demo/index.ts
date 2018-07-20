/* tslint:disable */
import 'babel-polyfill';
import Token from '../src/index';

const boot = async () => {
  const token = new Token({
    baseUrl: 'https://...',
    clientId: '...',
    clientSecret: '...',
    grantType: 'authorization_code',
    pkce: true,
    redirectUri: '...',
    responseType: '...',
    scopes: [
      '...',
    ],
  });

  (window as any).sendToHost('startup');
  (window as any).registerOnHost('callback', async (sender, target) => {
    await token.exhangeUrl(target);
    console.log('Token 1', await token.getToken());
    await token.expire();
    console.log('Token 2', await token.getToken());
    console.log('IAM user', await token.getProfile());
    const result = await token.request({
      method: 'get',
      url: '...',
    });
    console.log('API user', await result.data);
  });

  const url = await token.getLoginUrl();
  console.log(url);
  (document.getElementById('frame') as any).src = url;
};

boot()
  .catch((err) => console.error(err));
