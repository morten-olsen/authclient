import AuthClient from 'AuthClient';
import config from 'config';
import Store from 'Store';
import Crypto from 'CryptoHelper';
import Token from './Token';

config.set('createStore', () => new Store());
config.set('createCrypto', () => new Crypto());

AuthClient.Token = Token;

module.exports = AuthClient;
