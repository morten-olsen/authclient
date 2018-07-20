/* tslint:disable */
require('babel-polyfill');
const Auth = require('..').default;
const views = require('views/*.js');

const render = (data, viewName, events) => {
  const fn = views[viewName];
  document.body.innerHTML = fn(data);
  const keys = Object.keys(events);
  keys.forEach(e => {
    const [key, name] = e.split('->');
    const elm = document.querySelector(key);
    elm.addEventListener(name, events[e]);
  });
}

const boot = async () => {
  const auth = new Auth({
    baseUrl: 'https://authclient-demo.eu.auth0.com',
    clientId: 'tseHxrplUHTS7kBzYjpZSACd8rnXbYW4',
    clientSecret: 'HkHH1COc222rHtwKa3ufduf03rCHS-fzc9b8Xij4l6MHQSzwqMe5Ijg6OW1jL9zg',
    grantType: 'authorization_code',
    pkce: true,
    redirectUri: 'http://localhost:1234',
    responseType: 'code',
    scopes: [
      'openid',
      'profile',
      'offline_access',
    ],
  }, {
    save: value => localStorage.setItem('token', value),
    load: () => localStorage.getItem('token'),
    remove: () => localStorage.removeItem('token'),
  });

  const renderUser = async () => {
    const data = await auth.getProfile();
    render(data, 'user', {
      '#logout->click': () => {
        auth.remove();
        location.reload();
      },
    })
  }

  const renderLogin = async () => {
    render(undefined, 'login', {
      '#login->click': async () => {
        const url = await auth.getLoginUrl();
        location.href = url;
      },
    })
  }

  if (await auth.load()) {
    await renderUser();
  } else if (auth.isValidUrl(location.href)) {
    await auth.exhangeUrl(location.href);
    await auth.save();
    await renderUser();
    history.replaceState(undefined, undefined, '?');
  } else {
    renderLogin()
  }

};

boot()
  .catch((err) => console.error(err));
