'use strict';

var fs = require('fs-extra');
var path = require('path');
var glob = require('glob');
var stackTrace = require('stack-trace');
var args = require('optimist').argv;
var _ = require('lodash');
var markoTesterConfig = require('../.marko-tester.js');
var rootPath = process.cwd();
var packageInfo = require(rootPath + '/package');
var helpers;

function mapSourceToTestPath(sourcePath) {
  var testPath = sourcePath;
  var pathObject = path.parse(testPath);

  if (pathObject.ext) {
    testPath = path.join(testPath, '..');
  }

  if (testPath === '.') {
    testPath = path.join(testPath, 'test');
  } else {
    testPath = path.join(testPath, '**', 'test', '*.spec.js');
  }

  return testPath;
}

module.exports = {
  getHelpers: function getHelpers() {
    if (!helpers) {
      helpers = {
        rootPath: process.cwd(),
        rendererPaths: [],
        outputPath: path.join(__dirname, '..', 'static'),
        withCoverage: process.argv.indexOf('--with-acceptance') === -1 && process.argv.indexOf('--no-coverage') === -1,
        withLint: process.argv.indexOf('--no-lint') === -1,
        withFix: process.argv.indexOf('--fix-lint') > -1,
        withMocha: process.argv.indexOf('--with-acceptance') === -1 && process.argv.indexOf('--no-mocha') === -1,
        withAcceptance: process.argv.indexOf('--with-acceptance') > -1,
        config: markoTesterConfig,
        bundleName: packageInfo.name + '$' + packageInfo.version
      };
    }

    return helpers;
  },

  setHelpers: function setHelpers(key, value) {
    helpers = this.getHelpers() || {};

    helpers[key] = _.merge(helpers[key], value);
  },

  generateBrowserDependencies: function generateBrowserDependencies(dependencies) {
    if (!dependencies || !dependencies.length) {
      return;
    }

    var dependenciesArray = dependencies;

    if (!_.isArray(dependencies)) {
      dependenciesArray = [dependencies];
    }

    dependenciesArray.forEach(function resolveDependency(component) {
      if (_.isObject(component)) {
        helpers.rendererPaths.push(component);
      } else {
        var componentPath = path.isAbsolute(component) ? component : path.join(rootPath, component);

        componentPath = path.relative(__dirname, componentPath);

        helpers.rendererPaths.push('require: ' + componentPath);
      }
    });
  },

  getTestPath: function getTestPath(stackTraceArray) {
    /* eslint no-param-reassign: 0 */
    if (!stackTraceArray) {
      stackTraceArray = stackTrace.get();
    }

    var trace = stackTraceArray.shift();

    if (trace) {
      var fileName = trace.getFileName();

      if (/^.*\.spec\.js$/.test(fileName)) {
        return path.resolve(fileName, '..');
      }

      return this.getTestPath(stackTraceArray);
    }

    return null;
  },

  getParamsToApply: function getParamsToApply(fn, context) {
    var paramString = fn.toString().match(/function[^(]*\(([^)]*)\)/)[1];

    var paramList = paramString.split(',').map(function mapContextValueForKey(key) {
      return context[key.trim()];
    });

    return paramList;
  },

  getSourcePaths: function getSourcePaths() {
    return args._;
  },

  getTestPaths: function getTestPaths() {
    return this.getSourcePaths().map(mapSourceToTestPath);
  },

  getFixtures: function getFixtures(context) {
    var fixturesData = [];
    var fixtures = {};
    var dirsToCheck = [
      'fixtures'
    ];

    if (context.options.fixturesPath) {
      dirsToCheck.push(context.options.fixturesPath);
    }

    function buildCases(fixturesPath, file) {
      /* eslint global-require: 0 */

      var absPath = path.join(fixturesPath, file);
      var extension = path.extname(absPath);
      var testName = path.basename(absPath, '.html');

      if (extension === '.html') {
        var fixture = require(absPath.replace(/.html$/, ''));
        var expectedHtml = fs.readFileSync(absPath, 'utf-8');

        fixturesData.push({
          testName: testName,
          absPath: absPath,
          expectedHtml: expectedHtml,
          data: fixture
        });

        fixtures[testName] = fixture;
      }
    }

    dirsToCheck.forEach(function getFixturePairs(dirToCheck) {
      var fixturesPath = path.join(context.testPath, dirToCheck);

      try {
        fs.readdirSync(fixturesPath).forEach(buildCases.bind(null, fixturesPath));
      } catch (error) {
        // throw new Error('Tester: Cannot read fixtures folder.' + error);
      }
    });

    Object.assign(context.fixtures, fixtures);

    return fixturesData;
  },

  getRenderer: function getRenderer(options) {
    /* eslint global-require: 0 */

    var testPath = this.getTestPath();
    var renderer = (options || {}).renderer;

    if (!renderer || _.isString(renderer)) {
      var rendererPath;

      if (!renderer) {
        rendererPath = path.join(testPath, '..');
        rendererPath = glob.sync(path.resolve(rendererPath, '?(index|renderer).js'));
      } else {
        rendererPath = glob.sync(path.resolve(testPath, renderer));
      }

      if (rendererPath && rendererPath.length > 0) {
        renderer = rendererPath[0];
      }

      if (renderer) {
        this.generateBrowserDependencies(renderer);
        renderer = require(renderer);
      } else {
        renderer = {
          render: null
        };
      }
    }

    return renderer.render || renderer;
  },

  runWithMochaOperation: function runWithMochaOperation(mochaOperation, func, context, opts, cb) {
    var callback = cb || opts;
    var options = cb ? opts : {};

    options.mochaOperation = mochaOperation ? describe[mochaOperation] : describe;

    func(context, options, callback);
  },

  loadConfiguration: function loadConfiguration() {
    /* eslint global-require: 0 */

    var configurationPath = path.join(this.getHelpers().rootPath, '.marko-tester');
    var configuration;

    try {
      configuration = require(configurationPath);
    } catch (e) {
      configuration = {};
    }

    require('./configure')(configuration);

    return helpers.config;
  },

  gatherBrowserCoverage: function gatherBrowserCoverage() {
    /* eslint no-underscore-dangle: 0 */
    if (global.__coverage__browser && global.window.__coverage__) {
      global.__coverage__browser.push(global.window.__coverage__);
    }
  }
};
