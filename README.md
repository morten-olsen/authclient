# Authenticatornator

## Authenticating

To authenticate users three steps are involved

* **configuring the client**: This consists of creating a new instance of `authenticatornator`, and passing it your oauth [configuration](#configuration), and if needed, [options](#options)

* **redirecting to the login url**: This is done by generating a a url using `.getLoginUrl()`, which the client can then redirect to

* **exchangingin the return url for a token**: This can be done using the `.exchangeUrl(url)`. This call will figure out it the response is an autorization code, which has to be exchanged to an access token, or if it simply is an access code

**Example**
```js
import Auth from 'authenticatornator';
import config from './config';

const auth = new Auth(config);

const boot = async () => {
  const url = location.href;

  if (auth.isValidUrl(url)) {
    await auth.exchangeUrl(url);
  } else {
    const url = await auth.getLoginUrl();
    location.href = url;
  }
}

boot().catch(err => console.error);
```
