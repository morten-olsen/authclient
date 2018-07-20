import configManager from '../configManager';
import Crypto from '../crypto/Node';
import Store from '../store/Memory';

configManager.crypto = new Crypto();
configManager.store = new Store();
