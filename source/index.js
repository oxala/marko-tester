'use strict';

var configure = require('./configure');
var buildTester = require('./builders/tester');
var testEslint = require('./testers/eslint');

module.exports = buildTester;
module.exports.only = buildTester.only;
module.exports.skip = buildTester.skip;
module.exports.configure = configure;
module.exports.eslint = testEslint;
