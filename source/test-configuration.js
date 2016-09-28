'use strict';

var path = require('path');
var fs = require('fs-extra');
var glob = require('glob');
var chai = require('chai');
var jsdom = require('jsdom');
var markoCompiler = require.main.require('marko/compiler');
var istanbul = require('istanbul');
var instrumenter = new istanbul.Instrumenter({
  noCompact: true
});
var lasso = require('lasso');
var sinonChai = require('sinon-chai');
var chaiAsPromised = require('chai-as-promised');
var testFixtures = require('./test-fixtures');
var staticDir = 'static';
var rootPath = process.cwd();

require('marko/node-require').install();
require('marko/compiler').defaultOptions.writeToDisk = false;
require('app-module-path').addPath(rootPath);

global.expect = chai.expect;
global.sinon = require('sinon');
global._ = require('lodash');
global.withCoverage = process.argv.indexOf('--coverage') > -1;
global.window = global.document = global.widget = global.$ = {};

chai.use(sinonChai);
chai.use(chaiAsPromised);

var outputPath = path.join(__dirname, 'generated-tests');
var staticPath = path.join(outputPath, staticDir);

fs.ensureDirSync(outputPath);

lasso.configure({
  outputDir: staticPath,
  plugins: [
    require('i18n-ebay/optimizer/plugin'),
    require('lasso-marko'),
    require('lasso-less')
  ],
  urlPrefix: './' + staticDir,
  fingerprintsEnabled: false,
  bundlingEnabled: false
});

function buildDependencies(config) {
  var dependencies = [
    'mocha/mocha.js',
    'require-run: ./mocha-setup', {
      path: 'jquery/dist/jquery.js',
      'mask-define': true
    }, {
      path: 'sinon/pkg/sinon.js',
      'mask-define': true
    }
  ];

  (config.components || []).forEach(function (component) {
    var componentPath = path.relative(__dirname, rootPath + '/' + component);

    dependencies.push('require: ' + componentPath);
  });

  dependencies.push('require-run: ./mocha-runner');

  var browserJSON = {
    dependencies: dependencies
  };

  fs.writeFileSync(path.resolve(__dirname, './browser.json'), JSON.stringify(browserJSON));
}

function excludeMarkoData(config) {
  (config.taglibExcludeDirs || []).forEach(function (dirPath) {
    var absoluteDirPath = path.resolve(rootPath, dirPath);

    markoCompiler.taglibFinder.excludeDir(absoluteDirPath);
  });

  (config.taglibExcludePackages || []).forEach(function (packageName) {
    markoCompiler.taglibFinder.excludePackage(packageName);
  });

  (config.excludedAttributes || []).forEach(function (attr) {
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

  coverageFiles.forEach(function (filePath) {
    var fileContent = fs.readFileSync(filePath, 'utf8');

    instrumenter.instrumentSync(fileContent, filePath);

    global.__coverage__[filePath] = instrumenter.lastFileCoverage();
  });

  istanbul.hook.hookRequire(
    function (requirePath) {
      return coverageFiles.indexOf(requirePath) > -1;
    },

    function (code, requirePath) {
      var instrumentedfileContent = instrumenter.instrumentSync(code, requirePath);

      return instrumentedfileContent;
    }
  );

  process.on('exit', function () {
    var reporters = config.coverage.reporters || 'text-summary';
    var dest = config.coverage.dest || '.coverage';
    var collector = new istanbul.Collector();

    global.window && global.window.__coverage__ && collector.add(window.__coverage__);
    global && global.__coverage__ && collector.add(global.__coverage__);

    reporters.forEach(function (reporter) {
      istanbul.Report.create(reporter, {
        dir: dest + '/' + reporter
      }).writeReport(collector, true);
    });
  });
}

function configureBrowserCoverage(config) {
  var packageInfo = require(rootPath + '/package');
  var bundleBasePath = 'generated-tests/static/source';
  var bundlePath = bundleBasePath + '/' + packageInfo.name + '$' + packageInfo.version;
  var generatedSrcPath = path.resolve(__dirname, bundlePath, config.coverage.base);

  var files = glob.sync(path.resolve(generatedSrcPath, '**/*.js'), {
    ignore: config.coverage.excludes
  });

  files.forEach(function (filePath) {
    var fileContent = fs.readFileSync(filePath, 'utf8');
    var coveragePath = path.resolve(rootPath, config.coverage.base);
    var realPath = filePath.replace(generatedSrcPath, coveragePath);
    var moduleBody = fileContent;

    if (fileContent.substring(0, 10) === '$_mod.def(') {
      var startIndex = fileContent.indexOf('{') + 1;
      var endIndex = fileContent.lastIndexOf('}');

      moduleBody = fileContent.substring(startIndex, endIndex);
    }

    var instrumentedModuleBody = instrumenter.instrumentSync(moduleBody, realPath);

    fileContent = fileContent.replace(moduleBody, instrumentedModuleBody);

    fs.writeFileSync(filePath, fileContent, 'utf8');
  });
}

module.exports.onInit = function onInit() {};
module.exports.onDestroy = function onDestroy() {};
module.exports.configure = function testConfigure(config) {
  buildDependencies(config);
  excludeMarkoData(config);
  addHooks(config);
  global.withCoverage && setupCoverage(config);

  module.exports.buildPage = new Promise(function (resolve, reject) {
    var htmlPath = path.join(outputPath, 'component-tests.html');
    var out = fs.createWriteStream(htmlPath, 'utf8');

    function generateDom() {
      global.withCoverage && configureBrowserCoverage(config);

      jsdom.env(
        htmlPath, [], {
          features: {
            FetchExternalResources: ['script']
          }
        },
        function (err, window) {
          if (err) {
            return reject(err);
          }

          global.window = window;
          global.document = window.document;
          global.$ = window.jQuery;
          global.window.console = console;

          resolve(window);
        }
      );
    }

    require('./test-scaffold.marko')
      .render({}, out)
      .on('finish', generateDom);
  });
};
