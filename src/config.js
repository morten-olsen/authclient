/** @ignore */
class Config {
  values = {};

  set(name, value) {
    this.values[name] = value;
  }

  get(name) {
    return this.values[name];
  }
}

export default new Config();
