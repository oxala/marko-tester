/* eslint no-underscore-dangle: 0 */

'use strict';

var fs = require('fs-extra');
var path = require('path');
var glob = require('glob');
var istanbul = require('istanbul');
var utils = require('../utils');
var instrumenter = new istanbul.Instrumenter({
  noCompact: true
});

function preparePathForIgnore(prependPath, ignoredPath) {
  return path.resolve(prependPath, ignoredPath, '**');
}

function initialize() {
  global.__coverage__ = {};
  global.__coverage__browser = [];

  var config = utils.getHelpers().config.coverage;
  var sourcePaths = utils.getSourcePaths();
  var coverageFiles = [];

  sourcePaths.forEach(function gatherCoverageFilesFromSource(sourcePath) {
    coverageFiles = coverageFiles.concat(glob.sync(path.resolve(utils.getHelpers().rootPath, sourcePath, '**/*.js'), {
      ignore: config.excludes.map(preparePathForIgnore.bind(this, utils.getHelpers().rootPath))
    }));
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
    var reporters = config.reporters || 'text-summary';
    var dest = config.dest || '.coverage';
    var collector = new istanbul.Collector();

    collector.add(global.__coverage__);
    global.__coverage__browser.forEach(function addCoverage(coverage) {
      collector.add(coverage);
    });

    reporters.forEach(function createReport(reporter) {
      istanbul.Report.create(reporter, {
        dir: dest + '/' + reporter
      }).writeReport(collector, true);
    });
  });
}

function initializeBrowser() {
  var bundleBasePath = path.resolve(utils.getHelpers().outputPath, 'source');
  var bundlePath = path.resolve(bundleBasePath, utils.getHelpers().bundleName);
  var config = utils.getHelpers().config.coverage;
  var sourcePaths = utils.getSourcePaths();

  sourcePaths.forEach(function gatherCoverageFilesFromSource(sourcePath) {
    var generatedSrcPath = path.resolve(bundlePath, sourcePath);

    var files = glob.sync(path.resolve(generatedSrcPath, '**/*.js'), {
      ignore: config.excludes.map(preparePathForIgnore.bind(this, bundlePath))
    });

    function instrumentFile(filePath) {
      var fileContent = fs.readFileSync(filePath, 'utf8');
      var coveragePath = path.resolve(utils.getHelpers().rootPath, sourcePath);
      var realPath = filePath.replace(generatedSrcPath, coveragePath);
      var moduleBody = fileContent;
      var startIndex;
      var endIndex;

      if (fileContent.substring(0, 10) === '$_mod.def(') {
        startIndex = fileContent.indexOf('{') + 1;
        endIndex = fileContent.lastIndexOf('}');

        moduleBody = fileContent.substring(startIndex, endIndex);
      }

      var instrumentedModuleBody = instrumenter.instrumentSync(moduleBody, realPath);

      fileContent = fileContent.substring(0, startIndex) + instrumentedModuleBody + '});';

      fs.writeFileSync(filePath, fileContent, 'utf8');
    }

    files.forEach(instrumentFile);
  });
}

module.exports.initialize = initialize;
module.exports.initializeBrowser = initializeBrowser;
