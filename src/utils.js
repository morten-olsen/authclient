/** @ignore */
export const base64URLEncode = value =>
  value.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

/** @ignore */
export const toFormData = obj =>
  Object.keys(obj)
    .filter(key => obj[key])
    .map(key => `${key}=${encodeURIComponent(obj[key])}`).join('&');
