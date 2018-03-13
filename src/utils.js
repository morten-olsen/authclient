/** @ignore */
export const base64URLEncode = value =>
  value.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
