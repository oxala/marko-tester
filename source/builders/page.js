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

  options.mochaOperation('When page is ready', function whenPageIsReady() {
    this.timeout(utils.getHelpers().config.componentTimeout);

    before(function buildPageBeforeEach(done) {
      function buildDom() {
        if (options.mockRequire) {
          utils.mockRequire(options.mockRequire, context.testPath);
        }

        done();
      }

      context.preparePage().then(buildDom);
    });

    callback.call(this);

    after(function buildPageAfterEach() {
      utils.gatherBrowserCoverage();

      delete global.window;
      delete global.document;
    });
  });
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


module.exports = utils.runWithMochaOperation.bind(null, null, buildPage);
module.exports.only = utils.runWithMochaOperation.bind(null, 'only', buildPage);
module.exports.skip = utils.runWithMochaOperation.bind(null, 'skip', buildPage);
module.exports.prepare = prepare;
