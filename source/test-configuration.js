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

module.exports.onInit = function onInit() {};
module.exports.onDestroy = function onDestroy() {};

module.exports.configure = function testConfigure(config) {
  var dependencies = [
    'mocha/mocha.js',
    'require-run: ./mocha-setup', {
      'path': 'jquery/dist/jquery.js',
      'mask-define': true
    }, {
      'path': 'sinon/pkg/sinon.js',
      'mask-define': true
    }
  ];

  if (global.withCoverage) {
    global.__coverage__ = {};

    var coverageFiles = glob.sync(path.resolve(rootPath, config.coverage.base, '**/*.js'), {
      ignore: config.coverage.excludes
    });

    coverageFiles.forEach(function (filePath) {
      var fileContent = fs.readFileSync(filePath, 'utf8');
      instrumenter.instrumentSync(fileContent, filePath);

      global.__coverage__[filePath] = instrumenter.lastFileCoverage();
    });

    istanbul.hook.hookRequire(function (requirePath) {
      return coverageFiles.indexOf(requirePath) > -1;
    }, function (code, requirePath) {
      var instrumentedfileContent = instrumenter.instrumentSync(code, requirePath);

      return instrumentedfileContent;
    });

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

  process.on('exit', function () {
    require('child_process').exec('rm -rf $(find ' + rootPath + ' -name "*.marko.js")');
  });

  (config.components || []).forEach(function (component) {
    component = path.relative(__dirname, rootPath + '/' + component);

    dependencies.push('require: ' + component);
  });

  dependencies.push('require-run: ./mocha-runner');

  var browserJSON = {
    dependencies: dependencies
  };

  fs.writeFileSync(path.resolve(__dirname, './browser.json'), JSON.stringify(browserJSON));

  (config.taglibExcludeDirs || []).forEach(function (dirPath) {
    dirPath = path.resolve(rootPath, dirPath);

    markoCompiler.taglibFinder.excludeDir(dirPath);
  });

  (config.taglibExcludePackages || []).forEach(function (packageName) {
    markoCompiler.taglibFinder.excludePackage(packageName);
  });

  (config.excludedAttributes || []).forEach(function (attr) {
    attr = attr.toLowerCase();

    testFixtures.excludeAttribute(attr);
  });

  if (config.onInit) {
    module.exports.onInit = config.onInit;
  }

  if (config.onDestroy) {
    module.exports.onDestroy = config.onDestroy;
  }

  module.exports.buildPage = new Promise(function (resolve, reject) {
    var htmlPath = path.join(outputPath, 'component-tests.html');
    var out = fs.createWriteStream(htmlPath, 'utf8');

    require('./test-scaffold.marko')
      .render({}, out)
      .on('finish', function () {
        if (global.withCoverage) {
          var packageInfo = require(rootPath + '/package');
          var generatedSrcPath = path.resolve(__dirname, 'generated-tests/static/source/' + packageInfo.name + '$' + packageInfo.version, config.coverage.base);

          var files = glob.sync(path.resolve(generatedSrcPath, '**/*.js'), {
            ignore: config.coverage.excludes
          });

          files.forEach(function (filePath) {
            var fileContent = fs.readFileSync(filePath, 'utf8');
            var realPath = filePath.replace(generatedSrcPath, path.resolve(rootPath, config.coverage.base));
            var moduleBody = fileContent;

            if (fileContent.substring(0, 10) === '$_mod.def(') {
              moduleBody = fileContent.substring(fileContent.indexOf("{") + 1, fileContent.lastIndexOf("}"));
            }

            var instrumentedModuleBody = instrumenter.instrumentSync(moduleBody, realPath);

            fileContent = fileContent.replace(moduleBody, instrumentedModuleBody);

            fs.writeFileSync(filePath, fileContent, 'utf8');
          });
        }

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
            window.console = console;

            resolve(window);
          }
        );
      });
  });
};
