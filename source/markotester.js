#! /usr/bin/env node

'use strict';

const async = require('async');
const testLint = require('./testers/lint');
const testMocha = require('./testers/mocha');
const testIntegration = require('./testers/integration');
const utils = require('./utils');

require('app-module-path').addPath(utils.config.rootPath);

const steps = [];

if (utils.options.integration) {
  steps.push(testIntegration);
} else {
  if (utils.options.lint) {
    steps.push(testLint);
  }

  if (utils.options.unit) {
    steps.push(testMocha);
  }

  if (utils.options.coverage) {
    steps.push((done) => {
      if (global.__coverage__browser && global.window && global.window.__coverage__) {
        global.__coverage__browser.push(global.window.__coverage__);
      }

      done();
    });
  }
}

async.waterfall(
  steps,
  err => process.exit(err)
);
