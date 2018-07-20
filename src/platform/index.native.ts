import configManager from '../configManager';
import Crypto from '../crypto/Web';
import Store from '../store/Native';

configManager.crypto = new Crypto();
configManager.store = new Store();
