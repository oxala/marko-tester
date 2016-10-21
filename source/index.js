#! /usr/bin/env node

'use strict';

var lint = require('mocha-eslint');
var path = require('path');
var testConfiguration = require('./test-configuration');
var buildTester = require('./build-tester');

global.GLOBAL_LASSO = global.window = global.document;
global.markoTesterHelpers = {
  rendererPaths: [],
  outputPath: path.join(__dirname, 'generated-tests'),
  staticDir: 'static',
  withCoverage: process.argv.indexOf('--coverage') > -1,
  withoutLint: process.argv.indexOf('--no-eslint') > -1,
  config: {}
};

module.exports = buildTester;
module.exports.only = buildTester.only;
module.exports.skip = buildTester.skip;
module.exports.configure = testConfiguration.configure;

console.log(process.cwd())
