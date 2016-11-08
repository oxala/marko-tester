'use strict';

var configure = require('./configure');
var buildTester = require('./builders/tester');
var testLint = require('./testers/lint');

module.exports = buildTester;
module.exports.only = buildTester.only;
module.exports.skip = buildTester.skip;
module.exports.configure = configure;
module.exports.lint = testLint;
