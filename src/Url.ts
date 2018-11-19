type NameValue = {[name: string]: string};

const stringToObject = (value: string | undefined) => {
  if (typeof value === 'undefined') {
    return {};
  }
  const parts = value.split('&');
  return parts.reduce((output, current) => {
    const [key, rawValue] = current.split('=');
    return {
      ...output,
      [key]: decodeURIComponent(rawValue),
    };
  }, {});
};

const objectToString = (data: NameValue) => {
  const keys = Object.keys(data);
  const parts = keys.map(key => `${key}=${encodeURIComponent(data[key])}`);
  return parts.join('&');
}

class Url<Query = NameValue> {
  public query: NameValue = {};
  public hash: NameValue = {};
  public hostname: string | undefined;

  constructor(url: string) {
    const [withoutHash, hashString] = url.split('#');
    const [withoutQuery, queryString] = withoutHash.split('?');
    this.hashString = hashString;
    this.queryString = queryString;
    this.hostname = withoutQuery;
  }

  get queryString() {
    return Object.keys(this.query).length > 0 ? '?' + objectToString(this.query) : '';
  }

  set queryString(value: string | undefined) {
    this.query = stringToObject(value);
  }

  get hashString() {
    return Object.keys(this.hash).length > 0 ? '#' + objectToString(this.hash) : '';
  }

  set hashString(value: string | undefined) {
    this.hash = stringToObject(value);
  }

  toString() {
    return `${this.hostname}${this.queryString}${this.hashString}`
  }
}

export default Url;