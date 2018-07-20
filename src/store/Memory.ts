import IStore from '../IStore';

class MemoryStore implements IStore {
  private data: {[name: string]: string} = {};

  public async getItem(key) {
    return this.data[key];
  }

  public async setItem(key, value) {
    this.data[key] = value;
  }

  public async removeItem(key) {
    delete this.data[key];
  }
}

export default MemoryStore;
