import AuthClient from 'AuthClient';
import config from 'config';
import Store from 'Store.web';
import Crypto from 'CryptoHelper.web';

config.set('createStore', () => new Store());
config.set('createCrypto', () => new Crypto());

module.exports = AuthClient;
