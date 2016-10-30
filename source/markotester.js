#! /usr/bin/env node

'use strict';

var testEslint = require('./test-eslint');
var testMocha = require('./test-mocha');
var utils = require('./utils');

if (utils.getHelpers().withLint) {
  testEslint();
}

if (utils.getHelpers().withMocha) {
  testMocha();
}
