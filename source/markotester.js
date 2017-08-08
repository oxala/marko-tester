#! /usr/bin/env node

'use strict';

const async = require('async');
const testLint = require('./testers/lint');
const testMocha = require('./testers/mocha');
const utils = require('./utils');
const steps = [];

if (utils.options.lint) {
  steps.push(testLint);
}

if (utils.options.unit) {
  steps.push(testMocha);
}

if (utils.options.coverage) {
  steps.push((done) => {
    /* eslint no-underscore-dangle: 0 */
    if (global.__coverage__browser && global.window.__coverage__) {
      global.__coverage__browser.push(global.window.__coverage__);
    }

    done();
  });
}

global.tester = require('./index.es6');

async.waterfall(
  steps,
  (err) => process.exit(err)
);
