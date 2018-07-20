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

## Usage

```js
const profile = await auth.getProfile();
const response = await auth.request({
  method: 'get',
  url: 'https://api.example.com/user',
});
```

To access to token for using in other environment, the token has to be set as exportable when creating the client

```js
const auth = new Auth({
  ...config
}, {
  allowExport: true,
});

const token = await auth.getToken();
```

## Saving and loading tokens

Since it is not recommmended to make tokens exportable, another method for saving and loading is required. This can be supplied as [options](#options) to the auth client, by supplying a `load` and `save` function to the client

```js
const auth = new Auth({
  ...config
}, {
  save: (value, { key }) => localStorage.setItem(key, value),
  load: ({ key }) => localStorage.getItem(key),
});

if (auth.load({ key: 'token' })) {
  const token = await auth.getToken();
} else {
  // No valid token stored, user login is required
  await auth.save({
    key: 'token',
  });
}
```

## Adding platforms

By default this comes with three supportet platforms, `node`, `browser` and `react-native`, and will try to autoselect the right one for the current platform
