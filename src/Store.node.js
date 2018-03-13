class NodeStore {
  constructor() {
    this._data = {};
  }

  async getItem(name) {
    return this._data[name];
  }

  async setItem(name, value) {
    this._data[name] = value;
  }

  async removeItem(name) {
    delete this._data[name];
  }
}

export default NodeStore;
