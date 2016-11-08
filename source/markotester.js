#! /usr/bin/env node

'use strict';

var testLint = require('./testers/lint');
var testMocha = require('./testers/mocha');
var utils = require('./utils');
var lintStep;

if (utils.getHelpers().withLint) {
  lintStep = testLint();
}

if (utils.getHelpers().withMocha) {
  if (lintStep) {
    lintStep.then(testMocha);
  } else {
    testMocha();
  }
}
