import AuthClient from '../src/index';
import config from './config';

const implicitBtn = global.document.querySelector('#implicit');
const authCode = global.document.querySelector('#authcode');
const main = global.document.querySelector('#main');



const boot = async (configuration, run) => {
  const authClient = new AuthClient(configuration);
  const isValidUrl = await authClient.isValidUrl(global.location.href);
  if (isValidUrl) {
    const token = await authClient.exchangeToken(global.location.href);
    main.innerHTML = JSON.stringify(token, undefined, '  ');
    global.history.replaceState(undefined, undefined, global.location.pathname);
  } else if (run) {
    main.innerHTML = '...redirecting';
    const url = await authClient.getLoginUrl();
    global.location.href = url;
  }
};

implicitBtn.onclick = () => boot(config.implicit, true).catch(err => console.error(err));
authCode.onclick = () => boot(config.authCode, true).catch(err => console.error(err));
boot(config.base, false).catch(err => console.error(err));
