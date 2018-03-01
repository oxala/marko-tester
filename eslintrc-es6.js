'use strict';

module.exports = {
  extends: [
    'eslint-config-marko-tester',
    './eslintrc'
  ].map(require.resolve),

  rules: {
    'import/no-extraneous-dependencies': ['warn', {
      devDependencies: [
        'test/*',
        '**/*.spec?(.es6).js'
      ]
    }],
    'import/no-unresolved': ['error', {
      ignore: [
        '^src/',
        '^source/',
        '^lib/'
      ]
    }]
  },

  globals: {
    browser: true
  }
};
