'use strict';

/* eslint no-underscore-dangle: 0 */

var path = require('path');
var utils = require('./utils');

require('app-module-path').addPath(utils.getHelpers().rootPath);
require(path.join(utils.getHelpers().rootPath, 'node_modules/marko/node-require')).install();

var fs = require('fs-extra');
var glob = require('glob');
var chai = require('chai');
var markoCompiler = require(path.join(utils.getHelpers().rootPath, 'node_modules/marko/compiler'));
var sinonChai = require('sinon-chai');
var chaiAsPromised = require('chai-as-promised');
var istanbul = require('istanbul');
var testFixtures = require('./test-fixtures');
var instrumenter = new istanbul.Instrumenter({
  noCompact: true
});

markoCompiler.defaultOptions.writeToDisk = false;

chai.use(sinonChai);
chai.use(chaiAsPromised);

function excludeMarkoData(config) {
  (config.taglibExcludeDirs || []).forEach(function excludeDir(dirPath) {
    var absoluteDirPath = path.resolve(utils.getHelpers().rootPath, dirPath);

    markoCompiler.taglibFinder.excludeDir(absoluteDirPath);
  });

  (config.taglibExcludePackages || []).forEach(function excludePackage(packageName) {
    markoCompiler.taglibFinder.excludePackage(packageName);
  });

  (config.excludedAttributes || []).forEach(function excludeAttr(attr) {
    testFixtures.excludeAttribute(attr.toLowerCase());
  });
}

function addHooks(config) {
  if (config.onInit) {
    module.exports.onInit = config.onInit;
  }

  if (config.onDestroy) {
    module.exports.onDestroy = config.onDestroy;
  }
}

function setupCoverage(config) {
  global.__coverage__ = {};
  global.__coverage__browser = {};

  var coverageFiles = glob.sync(path.resolve(utils.getHelpers().rootPath, config.coverage.base, '**/*.js'), {
    ignore: config.coverage.excludes
  });

  coverageFiles.forEach(function instrumentFile(filePath) {
    var fileContent = fs.readFileSync(filePath, 'utf8');

    instrumenter.instrumentSync(fileContent, filePath);

    global.__coverage__[filePath] = instrumenter.lastFileCoverage();
  });

  istanbul.hook.hookRequire(
    function checkRequiredName(requirePath) {
      return coverageFiles.indexOf(requirePath) > -1;
    },

    function replaceRequiredContent(code, requirePath) {
      var instrumentedfileContent = instrumenter.instrumentSync(code, requirePath);

      return instrumentedfileContent;
    }
  );

  process.on('exit', function createCoverage() {
    var reporters = config.coverage.reporters || 'text-summary';
    var dest = config.coverage.dest || '.coverage';
    var collector = new istanbul.Collector();

    collector.add(global.__coverage__);
    collector.add(global.__coverage__browser);

    reporters.forEach(function createReport(reporter) {
      istanbul.Report.create(reporter, {
        dir: dest + '/' + reporter
      }).writeReport(collector, true);
    });
  });
}

function testConfigure(config) {
  utils.setHelpers('config', config);
  utils.generateBrowserDependencies(config.components);
  excludeMarkoData(config);
  addHooks(config);

  if (utils.getHelpers().withCoverage) {
    setupCoverage(config);
  }
}

module.exports = testConfigure;
