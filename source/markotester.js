#! /usr/bin/env node

'use strict';

var async = require('async');
var testLint = require('./testers/lint');
var testMocha = require('./testers/mocha');
var testAcceptance = require('./testers/acceptance');
var utils = require('./utils');
var steps = [];

if (utils.getHelpers().withLint) {
  steps.push(testLint);
}

if (utils.getHelpers().withMocha) {
  steps.push(testMocha);
}

if (utils.getHelpers().withAcceptance) {
  steps.push(testAcceptance);
}

global.tester = require('./index.es6');

async.waterfall(steps, function exit(err) {
  process.exit(err);
});
