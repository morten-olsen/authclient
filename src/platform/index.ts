import configManager from '../configManager';
import Crypto from '../crypto/Web';
import Store from '../store/Memory';

configManager.crypto = new Crypto();
configManager.store = new Store();
