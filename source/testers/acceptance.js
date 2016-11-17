'use strict';

var exec = require('child_process').exec;
var path = require('path');
var glob = require('glob');
var Mocha = require('mocha');
var args = require('optimist').argv;
var utils = require('../utils');
var mocha = new Mocha({
  ui: 'bdd',
  reporter: 'spec',
  grep: args.grep,
  ignoreLeaks: false,
  globals: ['document', 'window', 'GLOBAL_LASSO']
});

function testAcceptance() {
  /* eslint no-console: 0 */

  var sourcePaths = utils.getSourcePaths();
  var configuration = utils.loadConfiguration();
  var timeout;

  function searchPathForTests(sourcePath) {
    var testFiles = glob.sync(path.resolve(utils.getHelpers().rootPath, sourcePath, '**/*acceptance.js'));

    testFiles.forEach(function addPathToMocha(testFile) {
      mocha.addFile(testFile);
    });
  }

  sourcePaths.forEach(searchPathForTests);

  console.log('\n\nStarting your app using `' + configuration.acceptance.startCommand + '` command.\n\n');

  exec(configuration.acceptance.startCommand);

  timeout = setTimeout(function startMocha() {
    mocha.run(function exitMarkoTester(failures) {
      process.exit(failures);
    });
  }, configuration.acceptance.startTimeout);

  process.on('SIGINT', function exitAcceptance() {
    if (timeout) {
      clearTimeout(timeout);
    }
  });

  process.on('exit', function stopApp() {
    var stopCommand = configuration.acceptance.stopCommand;

    console.log('\n\nShutting down your app using `' + stopCommand + '` command.\n\n');

    exec(stopCommand);
  });
}

module.exports = testAcceptance;
