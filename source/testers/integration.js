'use strict';

const path = require('path');
const glob = require('glob');
const Mocha = require('mocha');
const args = require('optimist').argv;
const utils = require('../utils');
const {
  preRequire
} = require('./mocha');

const mocha = new Mocha({
  ui: 'bdd',
  reporter: 'spec',
  useInlineDiffs: true,
  grep: args.grep,
  ignoreLeaks: false,
  timeout: utils.config.integrationTimeout || 15000,
  globals: ['GLOBAL_LASSO']
});

module.exports = (done) => {
  mocha.suite.on('pre-require', preRequire);

  utils.sourcePaths.forEach(sourcePath =>
    glob.sync(path.resolve(
      utils.config.rootPath,
      sourcePath,
      '**/*.integration?(.es5)?(.es6).js'
    )).forEach(testFile => mocha.addFile(testFile))
  );

  mocha.run(failures => done(failures));
};
