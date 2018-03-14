import AuthClient from 'AuthClient';
import config from 'config';
import Store from 'Store';
import Crypto from 'CryptoHelper';

config.set('createStore', () => new Store());
config.set('createCrypto', () => new Crypto());

module.exports = AuthClient;
