'use strict';

var path = require('path');
var fs = require('fs-extra');
var _ = require('lodash');
var stylelint = require('stylelint');
var CLI = require('eslint').CLIEngine;
var utils = require('../utils');
var eslintConfig = require(path.join(__dirname, '..', '..', '.eslintrc'));
var stylelintConfig = require('stylelint-config-standard');
var enableAutoFixing = utils.getHelpers().withFix;

function getReport(config, paths) {
  var cli = new CLI(_.extend({
    fix: enableAutoFixing
  }, config));
  var lintPaths = paths.map(function mapPathToRoot(filesPath) {
    return path.join(utils.getHelpers().rootPath, filesPath);
  });

  return cli.executeOnFiles(lintPaths);
}

function getLessGlob(sourcePath) {
  return path.resolve(utils.getHelpers().rootPath, sourcePath, '**/*.?(less|css|scss)');
}

function testLint(done) {
  /* eslint no-console: 0 */
  var sourcePaths = utils.getSourcePaths();
  var testPaths = utils.getTestPaths();
  var commonEslintConfig = {
    baseConfig: eslintConfig,
    allowInlineConfig: false,
    ignorePattern: [
      '**/*.marko.js'
    ]
  };

  function parseStylelintData(data) {
    if (data.errored) {
      console.log(data.output);
      done(1);
    } else {
      console.log('No Stylelint errors detected!');
    }
  }

  function persistFixes(report) {
    report.results.filter(function filterEmptyResult(result) {
      return !!result.output;
    }).forEach(function forEachResult(result) {
      fs.writeFileSync(result.filePath, result.output);
    });
  }

  function lintES() {
    var reportTest = getReport(_.extend(commonEslintConfig, {
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
    var report = getReport(_.extend(commonEslintConfig, {
      ignorePattern: [
        '**/test',
        '**/*.marko.js'
      ]
    }), sourcePaths);

    report.results = report.results.concat(reportTest.results);
    report.errorCount += reportTest.errorCount;
    report.warningCount += reportTest.warningCount;

    if (enableAutoFixing) {
      persistFixes(report);
    }

    if (report.errorCount + report.warningCount > 0) {
      console.log(CLI.getFormatter()(report.results));

      if (report.errorCount > 0) {
        return done(1);
      }
    } else if (report.errorCount === 0) {
      console.log('No ESLint errors detected!');
    }

    return done();
  }

  stylelintConfig = _.extend(stylelintConfig, {
    rules: {
      'selector-type-no-unknown': null
    }
  });

  return stylelint
    .lint({
      files: sourcePaths.map(getLessGlob),
      config: stylelintConfig,
      formatter: 'string',
      ignoreDisables: true
    })
    .then(parseStylelintData)
    .catch(function handleStylelintError(err) {
      console.error('[Stylelint error: ', err);
    })
    .then(lintES);
}

module.exports = testLint;
