'use strict';

/* eslint no-underscore-dangle: 0 */

require('marko/node-require').install();
require('marko/compiler').defaultOptions.writeToDisk = false;

var path = require('path');
var fs = require('fs-extra');
var glob = require('glob');
var chai = require('chai');
var markoCompiler = require.main.require('marko/compiler');
var sinonChai = require('sinon-chai');
var chaiAsPromised = require('chai-as-promised');
var testFixtures = require('./test-fixtures');
var rootPath = process.cwd();
var utils = require('./utils');
var istanbul = require('istanbul');
var instrumenter = new istanbul.Instrumenter({
  noCompact: true
});

require('app-module-path').addPath(rootPath);

chai.use(sinonChai);
chai.use(chaiAsPromised);

function excludeMarkoData(config) {
  (config.taglibExcludeDirs || []).forEach(function excludeDir(dirPath) {
    var absoluteDirPath = path.resolve(rootPath, dirPath);

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

  var coverageFiles = glob.sync(path.resolve(rootPath, config.coverage.base, '**/*.js'), {
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

    if (global.window && global.window.__coverage__) {
      collector.add(window.__coverage__);
    }

    if (global && global.__coverage__) {
      collector.add(global.__coverage__);
    }

    reporters.forEach(function createReport(reporter) {
      istanbul.Report.create(reporter, {
        dir: dest + '/' + reporter
      }).writeReport(collector, true);
    });
  });
}

function testConfigure(config) {
  global.markoTesterHelpers.config = config;

  utils.generateBrowserDependencies(config.components);
  excludeMarkoData(config);
  addHooks(config);

  if (global.markoTesterHelpers.withCoverage) {
    setupCoverage(config);
  }
}

module.exports.configure = testConfigure;
