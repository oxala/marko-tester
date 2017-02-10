'use strict';

var path = require('path');
var glob = require('glob');
var Mocha = require('mocha');
var args = require('optimist').argv;
var utils = require('../utils');
var mocha = new Mocha({
  ui: 'bdd',
  reporter: 'spec',
  useInlineDiffs: true,
  grep: args.grep,
  ignoreLeaks: false,
  globals: ['document', 'window', 'GLOBAL_LASSO']
});

function testMocha(done) {
  var sourcePaths = utils.getSourcePaths();

  utils.loadConfiguration();

  function searchPathForTests(sourcePath) {
    var testFiles = glob.sync(path.resolve(utils.getHelpers().rootPath, sourcePath, '**/*.spec.js'));

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
