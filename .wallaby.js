module.exports = (w) => ({
  files: [
    'src/**/*.ts',
    '!src/**/*.spec.ts',
    'test/**/*.ts',
    '!test/**/*.spec.ts',
  ],
  tests: [
    'src/*.spec.ts',
    'test/*.spec.ts',
  ],
  testFramework: 'mocha',
  env: {
    type: 'node'
  },
});
