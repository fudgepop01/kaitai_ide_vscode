export const snakeToCamel = str =>
  str.toLowerCase().replace(/([-_][a-z])|(\b\w)/g, group =>
    group
      .toUpperCase()
      .replace('-', '')
      .replace('_', '')
  );