'use strict';

module.exports = {
  env: {
    browser: true,
    jquery: true
  },
  globals: {
    AbortController: true
  },
  rules: {
    'mocha/no-skipped-tests': 'error',
    'mocha/no-pending-tests': 'error',
    'mocha/max-top-level-suites': 0
  }
};
