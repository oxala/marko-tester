'use strict';

var path = require('path');
var glob = require('glob');
var Mocha = require('mocha');
var args = require('optimist').argv;
var utils = require('../utils');
var testConfiguration = require('../configure');
var configurationPath = path.join(utils.getHelpers().rootPath, '.marko-tester');
var configuration = require(configurationPath);
var mocha = new Mocha({
  ui: 'bdd',
  reporter: 'spec',
  grep: args.grep,
  ignoreLeaks: false,
  globals: ['document', 'window', 'GLOBAL_LASSO']
});

function testMocha(done) {
  var sourcePaths = utils.getSourcePaths();

  function searchPathForTests(sourcePath) {
    var testFiles = glob.sync(path.resolve(utils.getHelpers().rootPath, sourcePath, '**/*.spec.js'));

    testFiles.forEach(function addPathToMocha(testFile) {
      mocha.addFile(testFile);
    });
  }

  testConfiguration(configuration);
  sourcePaths.forEach(searchPathForTests);

  mocha.run(function exitMarkoTester(failures) {
    done(failures);
  });
}

module.exports = testMocha;
