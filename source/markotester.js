#! /usr/bin/env node

'use strict';

var testEslint = require('./test-eslint');
var testMocha = require('./test-mocha');
var utils = require('./utils');

global.GLOBAL_LASSO = global.window = global.document;

if (utils.getHelpers().withLint) {
  testEslint();
}

if (utils.getHelpers().withMocha) {
  testMocha();
}
