import AuthClient from 'AuthClient';
import Token from './Token';
import config from 'config';
import Store from 'Store';
import Crypto from 'CryptoHelper';

config.set('createStore', () => new Store());
config.set('createCrypto', () => new Crypto());

AuthClient.Token = Token;

module.exports = AuthClient;
