'use strict';

const path = require('path');
const _ = require('lodash');
const stylelint = require('stylelint');
const CLI = require('eslint').CLIEngine;
const utils = require('../utils');

module.exports = (done) => {
  const lintEs = (esVersion) => {
    const config = {
      baseConfig: utils.options.lintEs5 ? utils.config.eslintEs5 : utils.config.eslint,
      allowInlineConfig: false,
      fix: utils.options.fixLint,
      ignorePattern: _.concat([
        '**/*.marko.js'
      ], utils.get('config.lint.ignorePattern', []))
    };
    const cli = new CLI(config);

    if (esVersion === 'es5') {
      config.baseConfig = utils.config.eslintEs5;
      config.files = '**/*.es5.js';
    } else if (esVersion === 'es6') {
      config.baseConfig = utils.config.eslint;
      config.files = '**/*.es6.js';
    } else {
      config.ignorePattern.push(utils.options.lintEs5 ? '*.es6.js' : '*.es5.js');
      config.files = '**/*.js';
    }

    config.files = utils.sourcePaths.map(sourcePath => path.join(sourcePath, config.files));

    const report = cli.executeOnFiles(config.files.map(
      filesPath => path.join(utils.config.rootPath, filesPath)
    ));

    if (utils.options.fixLint) {
      CLI.outputFixes(report);
    }

    let lintVersion = esVersion;
    let error = 0;

    if (!lintVersion) {
      if (utils.options.lintEs5) {
        lintVersion = 'es5';
      } else {
        lintVersion = 'es6';
      }
    }

    if (report.errorCount + report.warningCount > 0) {
      process.stdout.write(`${CLI.getFormatter()(report.results)}\n\n`);

      if (report.errorCount > 0) {
        error = 1;
      }
    } else if (report.errorCount === 0) {
      process.stdout.write(`No ${lintVersion} errors detected!\n\n`);
    }

    if (error) {
      done(error);
    }

    if (esVersion) {
      done();
    } else if (utils.options.lintEs5) {
      lintEs('es6');
    } else {
      lintEs('es5');
    }
  };

  return stylelint
    .lint({
      files: utils.sourcePaths.map(
        sourcePath => path.resolve(utils.config.rootPath, sourcePath, '**/*.?(less|css|scss)')
      ),
      config: _.extend(utils.config.stylelint, {
        rules: {
          'selector-type-no-unknown': null
        }
      }),
      formatter: 'string',
      ignoreDisables: true
    })
    .then((data) => {
      if (data.errored) {
        console.error(data.output);
        done(1);
      } else {
        process.stdout.write('No Stylelint errors detected!\n\n');
      }
    })
    .catch(err => console.error('Stylelint error: ', err))
    .then(lintEs);
};
