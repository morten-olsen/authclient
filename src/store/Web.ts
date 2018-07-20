import IStore from '../IStore';

class WebStore implements IStore {
  public async getItem(key) {
    return localStorage.getItem(key);
  }

  public async setItem(key, value) {
    localStorage.setItem(key, value);
  }

  public async removeItem(key) {
    localStorage.removeItem(key);
  }
}

export default WebStore;
