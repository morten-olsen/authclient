export const parse = (url: string): {[name: string]: string} => {
  let found = false;
  let query = url;
  if (query.indexOf('#') >= 0) {
    found = true;
    query = query.substring(query.indexOf('#') + 1);
  }

  if (query.indexOf('?') >= 0) {
    found = true;
    query = query.substring(url.indexOf('?') + 1);
  }

  if (!found) {
    return {};
  }

  return query.split('&').reduce((output, part) => {
    const parts = part.split('=');
    return {
      ...output,
      [parts[0]]: decodeURIComponent(parts[1] || ''),
    };
  }, {});
};
