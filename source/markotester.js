#! /usr/bin/env node

'use strict';

var testEslint = require('./testers/eslint');
var testMocha = require('./testers/mocha');
var utils = require('./utils');

if (utils.getHelpers().withLint) {
  testEslint();
}

if (utils.getHelpers().withMocha) {
  testMocha();
}
