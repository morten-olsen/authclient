import configManager from './configManager';
import Crypto from './crypto/Node';
import Store from './store/Memory';
import Token from './Token';

export { IConfig } from './Token';

configManager.crypto = new Crypto();
configManager.store = new Store();

export default Token;
