'use strict';

var fs = require('fs-extra');
var path = require('upath');
var glob = require('glob');
var stackTrace = require('stack-trace');
var args = require('optimist').argv;
var _ = require('lodash');
var markoTesterConfig = require('../.marko-tester.js');
var rootPath = path.resolve(process.cwd());
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

function getStaticModule(file, testPath, errorMessage) {
  var pkgInfo;
  var isAbsolute = path.isAbsolute(file);

  if (!isAbsolute && file[0] !== '.') {
    var fileArray = file.split('/');

    try {
      var modulePath = path.resolve(rootPath, 'node_modules', fileArray[0]);
      fs.lstatSync(modulePath);
      pkgInfo = require(path.join(modulePath, 'package'));
      file = fileArray.splice(1).join('/') || pkgInfo.main.split('.')[0];
    } catch (errorNodeModule) {
      try {
        var moduleFilePath = path.resolve(rootPath, fileArray[0]);
        fs.lstatSync(moduleFilePath);
      } catch (errorFile) {
        /* eslint no-console: 0 */
        console.error(errorMessage);
      }
    }
  } else if (!isAbsolute) {
    file = path.resolve(testPath, file).replace(rootPath, '');
  }

  if (!pkgInfo) {
    pkgInfo = require(path.join(rootPath, '/package'));
  }

  pkgInfo = [
    pkgInfo.name,
    '$',
    pkgInfo.version
  ].join('');

  var mod = '/' + path.join(pkgInfo, file);

  if (/^win/.test(process.platform)) {
    mod = mod.replace(/\\/g, '/');
  }

  /*
  console.log('file:        ', file)
  console.log('testPath:    ', testPath);
  console.log('errorMessage:', errorMessage);
  console.log('mod:         ', mod);
  console.log('');
*/
  return mod;
}

module.exports = {
  getHelpers: function getHelpers() {
    /* eslint global-require: 0 */

    if (!helpers) {
      var argv = process.argv;

      var configurationPath = path.join(rootPath, '.marko-tester');
      var configuration;

      try {
        configuration = require(configurationPath);
      } catch (e) {
        configuration = {};
      }

      helpers = {
        rootPath: rootPath,
        rendererPaths: [],
        outputPath: path.join(__dirname, '..', 'static'),
        withCoverage: argv.indexOf('--with-acceptance') === -1 && argv.indexOf('--no-coverage') === -1,
        withLint: argv.indexOf('--no-lint') === -1,
        withEs6Lint: argv.indexOf('--lint-es6') > -1,
        withFixLint: argv.indexOf('--fix-lint') > -1,
        withFixFixtures: argv.indexOf('--fix-fixtures') > -1,
        withMocha: argv.indexOf('--with-acceptance') === -1 && argv.indexOf('--no-mocha') === -1,
        withAcceptance: argv.indexOf('--with-acceptance') > -1,
        config: _.merge({}, markoTesterConfig, configuration),
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

      if (/^.*\.spec(\.es6)?\.js$/.test(fileName)) {
        return path.resolve(fileName, '..');
      }

      return this.getTestPath(stackTraceArray);
    }

    return null;
  },

  getParamsToApply: function getParamsToApply(fn, context) {
    var paramString = fn.toString().match(/(function)?(\s*)?(\()?([^)=]*)/)[4];

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

      if (fs.existsSync(fixturesPath)) {
        try {
          fs.readdirSync(fixturesPath).forEach(buildCases.bind(null, fixturesPath));
        } catch (error) {
          throw new Error('Tester: Cannot read fixtures folder/file. ' + error);
        }
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
        rendererPath = glob.sync(path.resolve(rendererPath, '?(index|renderer)?(.es6).js'));
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

    require('./configure')();

    return helpers.config;
  },

  gatherBrowserCoverage: function gatherBrowserCoverage() {
    /* eslint no-underscore-dangle: 0 */
    if (global.__coverage__browser && global.window.__coverage__) {
      global.__coverage__browser.push(global.window.__coverage__);
    }
  },

  mockRequire: function mockRequire(mockRequirePaths, testPath) {
    Object.keys(mockRequirePaths).forEach(function mockRequirePath(filePath) {
      var mock = mockRequirePaths[filePath];
      var mod = getStaticModule(
        filePath,
        testPath,
        'BuildComponent: Cannot resolve module to mock require for - ' + filePath
      );

      window.$_mod.def(mod, mock);
    });
  },

  modRequire: function modRequire(modPath) {
    var mod = getStaticModule(
      modPath,
      this.getTestPath(),
      'Cannot require static module - ' + modPath
    );

    try {
      mod = window.$_mod.require(mod);
    } catch (e) {
      throw e;
    }

    return mod;
  }
};
