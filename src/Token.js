class Token {
  constructor(token, authClient, creationTime = new Date().getTime()) {
    this._token = token;
    this._authClient = authClient;
    this._creationTime = creationTime;
    this._updateExpires();
  }

  _updateExpires() {
    this._expires = new Date(this._creationTime + (this._token.expires_in * 1000)).getTime();
  }

  get canRenew() {
    return !!this._token.refresh_token;
  }

  get hasExpired() {
    return this._expires < new Date().getTime();
  }

  expire() {
    this._expires = 0;
    this._creationTime = 0;
  }

  toJSON() {
    return {
      token: this._token,
      creationTime: this._creationTime,
    };
  }

  async renewToken() {
    const token = await this._authClient.getToken({
      refreshToken: this._token.refresh_token,
      tokenType: 'refresh_token',
    });
    this._creationTime = new Date().getTime();
    this._updateExpires();
    this._token = {
      refresh_token: this._token.refresh_token,
      ...token,
    };
  }

  async getToken() {
    if (this.canRenew && this.hasExpired) {
      await this.renewToken();
    }
    if (this.hasExpired) {
      return undefined;
    }
    return this._token.access_token;
  }

  static fromJSON(json, authClient) {
    const token = new Token(
      json.token,
      authClient,
      json.creationTime,
    );
    return token;
  }

  async getProfile() {
    const profile = this._authClient.getProfile(await this.getToken());
    return profile;
  }
}

export default Token;
