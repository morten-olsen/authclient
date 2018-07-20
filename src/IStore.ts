abstract class IStore {
  public abstract getItem: (key: string) => Promise<string | undefined>;
  public abstract setItem: (key: string, value: string) => Promise<void>;
  public abstract removeItem: (key: string) => Promise<void>;
}

export default IStore;
