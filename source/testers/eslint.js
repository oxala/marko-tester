'use strict';

var path = require('path');
var _ = require('lodash');
var CLI = require('eslint').CLIEngine;
var utils = require('../utils');
var eslintConfig = require(path.join(__dirname, '..', '..', '.eslintrc'));

function getReport(config, paths) {
  var cli = new CLI(config);
  var lintPaths = paths.map(function mapPathToRoot(filesPath) {
    return path.join(utils.getHelpers().rootPath, filesPath);
  });

  return cli.executeOnFiles(lintPaths);
}

function testEslint() {
  /* eslint no-console: 0 */
  var sourcePaths = utils.getSourcePaths();
  var testPaths = utils.getTestPaths();
  var commonConfig = {
    baseConfig: eslintConfig,
    allowInlineConfig: false,
    ignorePattern: [
      '**/*.marko.js'
    ]
  };
  var reportTest = getReport(_.extend(commonConfig, {
    plugins: [
      'mocha'
    ],
    rules: {
      'func-names': 0,
      'no-unused-expressions': 0,
      'no-underscore-dangle': 0,
      'global-require': 0,
      'mocha/no-exclusive-tests': 'error',
      'mocha/no-skipped-tests': 'error',
      'mocha/no-pending-tests': 'error',
      'mocha/handle-done-callback': 'error',
      'mocha/no-global-tests': 'error',
      'mocha/no-return-and-callback': 'error',
      'mocha/valid-test-description': 'error',
      'mocha/valid-suite-description': 'error',
      'mocha/no-sibling-hooks': 'error',
      'mocha/no-mocha-arrows': 'error',
      'mocha/no-identical-title': 'error',
      'mocha/max-top-level-suites': 0,
      'mocha/no-nested-tests': 'error'
    }
  }), testPaths);
  var report = getReport(_.extend(commonConfig, {
    ignorePattern: [
      '**/test',
      '**/*.marko.js'
    ]
  }), sourcePaths);

  report.results = report.results.concat(reportTest.results);
  report.errorCount += reportTest.errorCount;
  report.warningCount += reportTest.warningCount;

  if (report.errorCount + report.warningCount > 0) {
    console.log(CLI.getFormatter()(report.results));

    if (report.errorCount > 0) {
      throw new Error('ESLint failed, please fix your code.');
    }
  }
}

module.exports = testEslint;
