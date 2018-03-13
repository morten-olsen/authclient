export default {
  base: {
    baseUrl: 'https://authclient-demo.eu.auth0.com',
    clientId: 'KhPH59sdDkNo1u9a70i17aA3ZRGuk1C5',
    clientSecret: 'uTpE4Zwi1dReiO3O5pfjmDh2vCHqOyT3qlXq6NweB9_AFU76sXrqj3nC1cGHRjpy',
    redirectUri: `${global.location.protocol}//${global.location.host}${global.location.pathname}`,
  },
  authCode: {
    baseUrl: 'https://authclient-demo.eu.auth0.com',
    clientId: 'KhPH59sdDkNo1u9a70i17aA3ZRGuk1C5',
    clientSecret: 'uTpE4Zwi1dReiO3O5pfjmDh2vCHqOyT3qlXq6NweB9_AFU76sXrqj3nC1cGHRjpy',
    redirectUri: `${global.location.protocol}//${global.location.host}${global.location.pathname}`,
    responseTypes: ['code'],
    pkce: true,
    scopes: [
      'openid',
      'profile',
    ],
  },
  implicit: {
    baseUrl: 'https://authclient-demo.eu.auth0.com',
    clientId: 'cn4GgGv0Sw7flUZF2tKO1DXiw402AoGa',
    redirectUri: `${global.location.protocol}//${global.location.host}${global.location.pathname}`,
    responseTypes: ['id_token', 'token'],
    pkce: true,
    scopes: [
      'openid',
      'profile',
    ],
  },
};