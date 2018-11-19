interface Store {
  set: (name: string, value: string) => Promise<void>;
  get: (name: string) => Promise<string | undefined>;
  remove: (name: string) => Promise<void>;
}

export default Store;