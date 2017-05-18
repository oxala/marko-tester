'use strict';

var path = require('path');
var utils = require('./utils');

require('app-module-path').addPath(utils.getHelpers().rootPath);

var chai = require('chai');
var sinonChai = require('sinon-chai');
var chaiAsPromised = require('chai-as-promised');
var testFixtures = require('./testers/fixtures');
var coverage = require('./testers/coverage');
var markoCompiler;

try {
  markoCompiler = require(path.join(utils.getHelpers().rootPath, 'node_modules/marko/compiler'));
  require(path.join(utils.getHelpers().rootPath, 'node_modules/marko/node-require')).install();
} catch (e) {
  /* eslint global-require: 0 */

  markoCompiler = require('marko/compiler');
  require('marko/node-require').install();
}

markoCompiler.defaultOptions.writeToDisk = false;

chai.use(sinonChai);
chai.use(chaiAsPromised);

function excludeDir(dirPath) {
  var absoluteDirPath = path.resolve(utils.getHelpers().rootPath, dirPath);

  markoCompiler.taglibFinder.excludeDir(absoluteDirPath);
}

function excludePackage(packageName) {
  markoCompiler.taglibFinder.excludePackage(packageName);
}

function excludeAttr(attr) {
  testFixtures.excludeAttribute(attr.toLowerCase());
}

function excludeMarkoData(config) {
  (config.taglibExcludeDirs || []).forEach(excludeDir);
  (config.taglibExcludePackages || []).forEach(excludePackage);
  (config.excludedAttributes || []).forEach(excludeAttr);
}

function addHooks(config) {
  if (config.onInit) {
    module.exports.onInit = config.onInit;
  }

  if (config.onDestroy) {
    module.exports.onDestroy = config.onDestroy;
  }
}

function testConfigure() {
  var config = utils.getHelpers().config;

  utils.generateBrowserDependencies(config.components);
  excludeMarkoData(config);
  addHooks(config);

  if (utils.getHelpers().withCoverage) {
    coverage.initialize();
  }
}

module.exports = testConfigure;
