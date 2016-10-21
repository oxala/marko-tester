'use strict';

var path = require('path');
var fs = require('fs-extra');
var lasso = require('lasso');
var glob = require('glob');
var jsdom = require('jsdom');
var i18nEbay = require('i18n-ebay/optimizer/plugin');
var lassoMarko = require('lasso-marko');
var lassoLess = require('lasso-less');
var testScaffold = require('./test-scaffold.marko');
var rootPath = process.cwd();
var packageInfo = require(rootPath + '/package');
var Promise = require('bluebird');
var istanbul = require('istanbul');
var instrumenter = new istanbul.Instrumenter({
  noCompact: true
});

function buildPage(context, opts, cb) {
  var callback = cb || opts;
  var options = cb ? opts : {};
  var operation = options.mochaOperation ? describe[options.mochaOperation] : describe;

  operation('When page is ready', function whenPageIsReady() {
    beforeEach(function buildPageBeforeEach(done) {
      function buildDom() {
        done();
      }

      context.preparePage().then(buildDom);
    });

    callback.call(this);

    afterEach(function buildPageAfterEach() {
      delete global.window;
      delete global.document;
    });
  });
}

function buildPageWithMochaOperation(mochaOperation, context, opts, cb) {
  var callback = cb || opts;
  var options = cb ? opts : {};

  options.mochaOperation = mochaOperation;

  buildPage(context, options, callback);
}

function buildDependencies() {
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

  dependencies = dependencies.concat(global.markoTesterHelpers.rendererPaths);

  dependencies.push('require-run: ./mocha-runner');

  var browserJSON = {
    dependencies: dependencies
  };

  fs.writeFileSync(path.resolve(__dirname, './browser.json'), JSON.stringify(browserJSON));
}

function configureBrowserCoverage(config) {
  var bundleBasePath = 'generated-tests/static/source';
  var bundlePath = bundleBasePath + '/' + packageInfo.name + '$' + packageInfo.version;
  var generatedSrcPath = path.resolve(__dirname, bundlePath, config.coverage.base);

  var files = glob.sync(path.resolve(generatedSrcPath, '**/*.js'), {
    ignore: config.coverage.excludes
  });

  function instrumentFile(filePath) {
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
  }

  files.forEach(instrumentFile);
}

function prepare() {
  var staticPath = path.join(
    global.markoTesterHelpers.outputPath,
    global.markoTesterHelpers.staticDir
  );

  fs.ensureDirSync(global.markoTesterHelpers.outputPath);

  lasso.configure({
    outputDir: staticPath,
    plugins: [i18nEbay, lassoMarko, lassoLess],
    urlPrefix: './' + global.markoTesterHelpers.staticDir,
    fingerprintsEnabled: false,
    bundlingEnabled: false
  });

  return new Promise(function promisePage(resolve, reject) {
    var htmlPath = path.join(global.markoTesterHelpers.outputPath, 'component-tests.html');
    var out = fs.createWriteStream(htmlPath, 'utf8');

    function generateDom() {
      if (global.markoTesterHelpers.withCoverage) {
        configureBrowserCoverage(global.markoTesterHelpers.config);
      }

      jsdom.env(
        htmlPath, [], {
          features: {
            FetchExternalResources: ['script']
          }
        },
        function injectBrowserGlobals(err, window) {
          if (err) {
            return reject(err);
          }

          global.window = window;
          global.document = window.document;
          global.window.console = console;

          return resolve();
        }
      );
    }

    buildDependencies();

    testScaffold
      .render({}, out)
      .on('finish', generateDom);
  });
}

module.exports = buildPage;
module.exports = buildPage;
module.exports.only = buildPageWithMochaOperation.bind(null, 'only');
module.exports.skip = buildPageWithMochaOperation.bind(null, 'skip');
module.exports.prepare = prepare;
