/* tslint:disable */
const AsyncStorage = require('@react-native-community/async-storage');
/* tslint:enable */

import IStore from '../IStore';

class NativeStore implements IStore {
  public async getItem(key) {
    return AsyncStorage.getItem ? AsyncStorage.getItem(key) : AsyncStorage.default.getItem(key);
  }

  public async setItem(key, value) {
    AsyncStorage.setItem ? AsyncStorage.setItem(key, value) : AsyncStorage.default.setItem(key, value);
  }

  public async removeItem(key) {
    AsyncStorage.removeItem ? AsyncStorage.removeItem(key) : AsyncStorage.default.removeItem(key);
  }
}

export default NativeStore;
