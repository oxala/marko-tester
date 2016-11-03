'use strict';

var path = require('path');
var fs = require('fs-extra');
var jsdom = require('jsdom');
var lasso = require('lasso');
var lassoMarko = require('lasso-marko');
var lassoLess = require('lasso-less');
var Promise = require('bluebird');
var utils = require('../utils');
var coverage = require('../testers/coverage');
var pagePrepared;

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
  var dependencies = [{
    path: 'jquery/dist/jquery.js',
    'mask-define': true
  }];
  var browserJSONPath = path.resolve(utils.getHelpers().outputPath, 'browser.json');

  dependencies = dependencies.concat(utils.getHelpers().rendererPaths);

  var browserJSON = {
    dependencies: dependencies
  };

  fs.ensureFileSync(browserJSONPath);
  fs.writeFileSync(browserJSONPath, JSON.stringify(browserJSON));
}

function createDom(htmlPath, resolve, reject) {
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

      pagePrepared = true;

      return resolve();
    }
  );
}

function prepare() {
  fs.ensureDirSync(utils.getHelpers().outputPath);

  var lassoPluginPaths = utils.getHelpers().config.lassoPlugins || [];
  var lassoPlugins = lassoPluginPaths.map(function requireLassoPlugin(pluginPath) {
    var plugin;

    try {
      plugin = require(path.join(utils.getHelpers().rootPath, 'node_modules', pluginPath));
    } catch (e) {
      throw new Error('BuildPage: Unable to require specified Lasso Plugin - ' + pluginPath);
    }

    return plugin;
  });

  lassoPlugins = lassoPlugins.concat([lassoLess, lassoMarko]);

  lasso.configure({
    outputDir: utils.getHelpers().outputPath,
    plugins: lassoPlugins,
    urlPrefix: './',
    fingerprintsEnabled: false,
    bundlingEnabled: false
  });

  return new Promise(function promisePage(resolve, reject) {
    /* eslint global-require: 0 */

    var htmlPath = path.join(utils.getHelpers().outputPath, 'component-tests.html');

    if (pagePrepared) {
      return createDom(htmlPath, resolve, reject);
    }

    var out = fs.createWriteStream(htmlPath, 'utf8');

    function generateDom() {
      if (utils.getHelpers().withCoverage) {
        coverage.initializeBrowser();
      }

      createDom(htmlPath, resolve, reject);
    }

    buildDependencies();

    return require(path.resolve(__dirname, '../page.marko'))
      .render({}, out)
      .on('finish', generateDom);
  });
}

module.exports = buildPage;
module.exports.only = buildPageWithMochaOperation.bind(null, 'only');
module.exports.skip = buildPageWithMochaOperation.bind(null, 'skip');
module.exports.prepare = prepare;
