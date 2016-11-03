'use strict';

var testConfiguration = require('./test-configuration');
var buildTester = require('./builders/tester');
var testEslint = require('./testers/eslint');

module.exports = buildTester;
module.exports.only = buildTester.only;
module.exports.skip = buildTester.skip;
module.exports.configure = testConfiguration;
module.exports.eslint = testEslint;
