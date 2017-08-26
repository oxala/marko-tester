'use strict';

const path = require('path');
const glob = require('glob');
const Mocha = require('mocha');
const args = require('optimist')
  .argv;
const utils = require('../utils');
const coverage = require('./coverage');

const mocha = new Mocha({
  ui: 'bdd',
  reporter: 'mocha-multi-reporters',
  useInlineDiffs: true,
  grep: args.grep,
  ignoreLeaks: false,
  timeout: utils.config.componentTimeout,
  reporterOptions: {
    reporterEnabled: 'mocha-junit-reporter, spec',
    mochaJunitReporterReporterOptions: {
      mochaFile: './.coverage/junit.xml'
    }
  },
  globals: ['document', 'window', 'GLOBAL_LASSO']
});

module.exports = (done) => {
  utils.configure();

  if (utils.options.coverage) {
    coverage.initializeServer();
  }

  utils.sourcePaths.forEach(sourcePath =>
    glob.sync(path.resolve(utils.config.rootPath, sourcePath, '**/*.spec?(.es5)?(.es6).js'))
      .forEach(testFile => mocha.addFile(testFile))
  );

  mocha.run(failures => done(failures));
};
