/* tslint:disable */
const {
  AsyncStorage,
} = require('react-native');
/* tslint:enable */

import IStore from '../IStore';

class NativeStore implements IStore {
  public async getItem(key) {
    return AsyncStorage.getItem(key);
  }

  public async setItem(key, value) {
    AsyncStorage.setItem(key, value);
  }

  public async removeItem(key) {
    AsyncStorage.removeItem(key);
  }
}

export default NativeStore;
