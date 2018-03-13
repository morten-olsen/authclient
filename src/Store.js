class Store {
  constructor(prefix) {
    this._prefix = prefix;
  }

  async getItem(name) {
    const key = `${this._prefix}${name}`;
    const raw = global.localStorage.getItem(key);
    if (raw) {
      return JSON.parse(raw);
    }
    return undefined;
  }

  async setItem(name, value) {
    const key = `${this._prefix}${name}`;
    global.localStorage.setItem(key, JSON.stringify(value));
  }

  async removeItem(name) {
    const key = `${this._prefix}${name}`;
    global.localStorage.removeItem(key);
  }
}

export default Store;
