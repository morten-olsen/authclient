# AuthClient

[Documentation](https://morten-olsen.github.io/authclient/)

## Usage

### Creating a client

```javascript
import AuthClient from 'authclient';

const authClient = new AuthClient({
    baseUrl: 'https://your-server',
    clientId: 'ClientId',
    redirectUri: `${global.location.protocol}//${global.location.host}`,
    responseTypes: ['id_token', 'token'],
    scopes: [
      'openid',
      'profile',
    ],
  });
```

### Creating a login url

A login url is obtained by calling `const url = await authClient.getLoginUrl();`. This url should then be presented to the user `window.location.href = url;`, or what is best suited for the platform that you are working on

### Getting the token

Once the user has logged into the login page, they should be redirected to the `redirect_uri` with some additional information which can then be used to get the token. To exchange these informations, simply call `const token = await authClient.exchangeToken(window.location.href);`

If jusing password grant, you can simply use `const token = await authClient.getToken({ username: 'admin', password: 'god'});` or to renew a token using a refresh token `const token = await authClient.getToken({refreshToken: '...'});`

## Minimal example

```html
<html>
  <body>
    <div></div>
    <button>Login</button>
    <script>
      const boot = async () => {
        const authClient = new AuthClient({
          baseUrl: 'https://your-server',
          clientId: 'ClientId',
          redirectUri: `${global.location.protocol}//${global.location.host}`,
          responseTypes: ['id_token', 'token'],
          scopes: [
            'openid',
            'profile',
          ],
        });
        const button = document.querySelector('button');
        const view = document.querySelector('div');
        button.onClick = async () => {
          window.location.href = await authClient.getLoginUrl();
        }
        if (location.hash) {
          const token = await authClient.exchangeToken(window.location.href);
          view.innerHTML = JSON.stringify(token, null, '  ');
        }
      };
      boot();
    </script>
  </body>
</html>
```