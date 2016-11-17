'use strict';

var configure = require('./configure');
var buildTester = require('./builders/tester');
var buildAcceptance = require('./builders/acceptance');
var testLint = require('./testers/lint');

module.exports = buildTester;
module.exports.only = buildTester.only;
module.exports.skip = buildTester.skip;
module.exports.acceptance = buildAcceptance;
module.exports.acceptance.only = buildAcceptance.only;
module.exports.acceptance.skip = buildAcceptance.skip;
module.exports.configure = configure;
module.exports.lint = testLint;
