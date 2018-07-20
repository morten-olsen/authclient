import AuthClient from 'AuthClient';
import config from 'config';
import Store from 'Store.web';
import Crypto from 'CryptoHelper.web';
import Token from './Token';

config.set('createStore', () => new Store());
config.set('createCrypto', () => new Crypto());

AuthClient.Token = Token;

module.exports = AuthClient;
