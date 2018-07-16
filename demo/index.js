import AuthClient from '../src/index.web';
import Token from '../src/Token';
import config from './config';

const elms = {
  implicitBtn: global.document.querySelector('#implicit'),
  authCode: global.document.querySelector('#authcode'),
  password: global.document.querySelector('#password'),
  pass: {
    box: global.document.querySelector('#passwordBox'),
    username: global.document.querySelector('#usernametxt'),
    password: global.document.querySelector('#passwordtxt'),
    login: global.document.querySelector('#passwordLogin'),
  },
  main: global.document.querySelector('#main'),
  token: global.document.querySelector('#token'),
};

const showToken = (token, client) => {
  elms.pass.box.style.display = 'none';
  elms.main.style.display = 'flex';
  elms.token.style.display = 'block';
  elms.token.innerHTML = JSON.stringify(token, undefined, '  ');
  global.token = new Token(token, client);
};

const boot = async (configuration, run) => {
  const authClient = new AuthClient(configuration);
  const isValidUrl = await authClient.isValidUrl(global.location.href);
  if (isValidUrl) {
    const token = await authClient.exchangeToken(global.location.href);
    showToken(token, authClient);
    global.history.replaceState(undefined, undefined, global.location.pathname);
  } else if (run) {
    const url = await authClient.getLoginUrl();
    global.location.href = url;
  }
};

elms.implicitBtn.onclick = () => boot(config.implicit, true).catch(err => console.error(err));
elms.authCode.onclick = () => boot(config.authCode, true).catch(err => console.error(err));
elms.password.onclick = () => {
  elms.pass.box.style.display = 'flex';
  elms.main.style.display = 'none';
};
elms.pass.login.onclick = async () => {
  const authClient = new AuthClient(config.password);
  const token = await authClient.getToken({
    username: elms.pass.username.value,
    password: elms.pass.password.value,
  });
  showToken(token, authClient);
};
boot(config.base, false).catch(err => console.error(err));
