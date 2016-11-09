#! /usr/bin/env node

'use strict';

var async = require('async');
var testLint = require('./testers/lint');
var testMocha = require('./testers/mocha');
var utils = require('./utils');
var steps = [];

if (utils.getHelpers().withLint) {
  steps.push(testLint);
}

if (utils.getHelpers().withMocha) {
  steps.push(testMocha);
}

async.waterfall(steps, function exit(err) {
  process.exit(err);
});
