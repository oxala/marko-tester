'use strict';

var path = require('path');
var fs = require('fs-extra');
var _ = require('lodash');
var stylelint = require('stylelint');
var CLI = require('eslint').CLIEngine;
var utils = require('../utils');
var eslintLegacyConfig = require(path.join(__dirname, '..', '..', 'eslintrc-legacy'));
var eslintEs6Config = require(path.join(__dirname, '..', '..', 'eslintrc-es6'));
var stylelintConfig = require('stylelint-config-standard');
var enableAutoFixing = utils.getHelpers().withFix;
var supportEs6 = utils.getHelpers().withEs6Lint;

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
  var eslintConfig = {
    baseConfig: supportEs6 ? eslintEs6Config : eslintLegacyConfig,
    allowInlineConfig: false,
    ignorePattern: [
      '**/*.marko.js'
    ]
  };

  function parseStylelintData(data) {
    if (data.errored) {
      console.error(data.output);
      done(1);
    } else {
      process.stdout.write('No Stylelint errors detected!');
    }
  }

  function persistFixes(report) {
    report.results.filter(function nonEmptyResult(result) {
      return !!result.output;
    }).forEach(function persistResult(result) {
      fs.writeFileSync(result.filePath, result.output);
    });
  }

  function lintES() {
    var report = getReport(eslintConfig, sourcePaths.concat(testPaths));

    if (enableAutoFixing) {
      persistFixes(report);
    }

    if (report.errorCount + report.warningCount > 0) {
      process.stdout.write(CLI.getFormatter()(report.results));

      if (report.errorCount > 0) {
        return done(1);
      }
    } else if (report.errorCount === 0) {
      process.stdout.write('No ESLint errors detected!');
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
