export default {
  base: {
    baseUrl: 'https://authclient-demo.eu.auth0.com',
    clientId: 'tseHxrplUHTS7kBzYjpZSACd8rnXbYW4',
    clientSecret: 'HkHH1COc222rHtwKa3ufduf03rCHS-fzc9b8Xij4l6MHQSzwqMe5Ijg6OW1jL9zg',
    redirectUri: `${global.location.protocol}//${global.location.host}${global.location.pathname}`,
  },
  authCode: {
    baseUrl: 'https://authclient-demo.eu.auth0.com',
    clientId: 'tseHxrplUHTS7kBzYjpZSACd8rnXbYW4',
    clientSecret: 'HkHH1COc222rHtwKa3ufduf03rCHS-fzc9b8Xij4l6MHQSzwqMe5Ijg6OW1jL9zg',
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
    clientId: 'tseHxrplUHTS7kBzYjpZSACd8rnXbYW4',
    redirectUri: `${global.location.protocol}//${global.location.host}${global.location.pathname}`,
    responseTypes: ['id_token', 'token'],
    pkce: true,
    scopes: [
      'openid',
      'profile',
    ],
  },
  password: {
    baseUrl: 'https://authclient-demo.eu.auth0.com',
    clientId: 'tseHxrplUHTS7kBzYjpZSACd8rnXbYW4',
    clientSecret: 'HkHH1COc222rHtwKa3ufduf03rCHS-fzc9b8Xij4l6MHQSzwqMe5Ijg6OW1jL9zg',
    redirectUri: `${global.location.protocol}//${global.location.host}${global.location.pathname}`,
    scopes: [
      'openid',
      'profile',
    ],
  },
};
