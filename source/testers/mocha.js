'use strict';

var path = require('path');
var glob = require('glob');
var Mocha = require('mocha');
var args = require('optimist').argv;
var utils = require('../utils');
var mocha = new Mocha({
  ui: 'bdd',
  reporter: 'mocha-multi-reporters',
  useInlineDiffs: true,
  grep: args.grep,
  ignoreLeaks: false,
  reporterOptions: {
    reporterEnabled: 'mocha-junit-reporter, spec',
    mochaJunitReporterReporterOptions: {
      mochaFile: './.coverage/junit.xml'
    }
  },
  globals: ['document', 'window', 'GLOBAL_LASSO', '$W10NOOP', 'version', '__RAPTOR_PUBSUB']
});

function testMocha(done) {
  var sourcePaths = utils.getSourcePaths();

  utils.loadConfiguration();

  function searchPathForTests(sourcePath) {
    var testFiles = glob.sync(path.resolve(utils.getHelpers().rootPath, sourcePath, '**/*.spec?(.es6).js'));

    testFiles.forEach(function addPathToMocha(testFile) {
      mocha.addFile(testFile);
    });
  }

  sourcePaths.forEach(searchPathForTests);

  mocha.run(function exitMarkoTester(failures) {
    done(failures);
  });
}

module.exports = testMocha;
