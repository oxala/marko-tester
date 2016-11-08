#! /usr/bin/env node

'use strict';

var testLint = require('./testers/lint');
var testMocha = require('./testers/mocha');
var utils = require('./utils');

if (utils.getHelpers().withLint) {
  testLint();
}

if (utils.getHelpers().withMocha) {
  testMocha();
}
