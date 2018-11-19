import Store from '../models/Store';

class MemoryStore implements Store {
  private data: {[name: string]: string} = {}

  async get(name: string) {
    console.log('foo', this.data, name);
    return this.data[name];
  }

  async set(name: string, value: string) {
    this.data[name] = value;
  }

  async remove(name: string) {
    delete this.data[name]
  }
}

export default MemoryStore;