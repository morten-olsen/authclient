module.exports = () => ({
  files: [
    'src/**/*.js',
    'src/**/*.jsx',
    '!src/**/*.spec.js',
    '!src/**/*.spec.jsx',
    'test/setup.js',
  ],

  tests: [
    'src/*.spec.js',
    'src/*.spec.jsx',
    'test/*.spec.js',
    'test/*.spec.jsx',
  ],

  env: {
    type: 'node',
    runner: 'node',
  },

  testFramework: 'jest'
});