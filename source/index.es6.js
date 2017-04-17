'use strict';

const configure = require('./configure');
const buildTester = require('./builders/tester');
const buildAcceptance = require('./builders/acceptance');
const testLint = require('./testers/lint');

module.exports = buildTester;
module.exports.only = buildTester.only;
module.exports.skip = buildTester.skip;
module.exports.acceptance = buildAcceptance;
module.exports.acceptance.only = buildAcceptance.only;
module.exports.acceptance.skip = buildAcceptance.skip;
module.exports.configure = configure;
module.exports.lint = testLint;
