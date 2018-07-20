export const toFormData = (obj: {[name: string]: string | number}) =>
  Object.keys(obj)
    .filter((key) => obj[key])
    .map((key) => `${key}=${encodeURIComponent(obj[key].toString())}`).join('&');
