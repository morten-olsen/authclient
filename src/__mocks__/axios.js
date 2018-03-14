/** @ignore */
class Axios {
  mocks = [];
  extra = {};

  clear() {
    this.mocks = [];
    this.extra = {};
  }

  setExtra(data) {
    this.extra = {
      ...this.extra,
      ...data,
    };
  }

  setMock(method, url, responseData) {
    this.mocks.push({
      url,
      method,
      responseData,
    });
  }

  getMock(method, url, data) {
    let reponseData;
    const mock = this.mocks.find(m => m.url === url && m.method === method);
    if (mock) {
      reponseData = typeof mock.responseData === 'function' ? mock.responseData(data, this.extra) : mock.responseData;
    }
    return {
      data: reponseData,
    };
  }

  async get(url) {
    return this.getMock('get', url);
  }

  async post(url, data) {
    return this.getMock('post', url, data);
  }
}

export default new Axios();
