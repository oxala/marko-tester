'use strict';

const path = require('path');
const fs = require('fs-extra');
const JSDOM = require('jsdom').JSDOM;
const lasso = require('lasso');
const Promise = require('bluebird');
const utils = require('../utils');
const coverage = require('../testers/coverage');

let pagePrepared;
const buildPage = (mochaAction, context, describeText = '', options, callback) => {
  mochaAction(`When page is being built: ${describeText}`, function whenPageIsBeingBuilt() {
    this.timeout(utils.config.componentTimeout);

    utils.addBrowserDependency(path.resolve(utils.testPath, '..', utils.testFileName));

    before((done) => {
      context.preparePage()
        .then(() => {
          if (options.mock && options.mock.require) {
            utils.mockRequire(options.mock.require, context.testPath);
          }
        })
        .then(done);
    });

    callback && callback({
      marko: context.marko
    });
  });
};

module.exports = buildPage;
module.exports.prepare = () => {
  fs.ensureDirSync(utils.config.outputPath);

  const lassoPluginPaths = utils.config.lassoPlugins || [];
  const lassoPlugins = lassoPluginPaths.map((pluginPath) => {
    let plugin;

    try {
      plugin = require(path.join(utils.config.rootPath, 'node_modules', pluginPath));
    } catch (e) {
      throw new Error(`BuildPage: Unable to require specified Lasso Plugin - ${pluginPath}`);
    }

    return plugin;
  });

  lassoPlugins.push('lasso-less');
  lassoPlugins.push({
    plugin: 'lasso-marko',
    config: {
      compiler: utils.config.markoCompiler
    }
  });

  lasso.configure({
    outputDir: utils.config.outputPath,
    plugins: lassoPlugins,
    urlPrefix: './',
    fingerprintsEnabled: false,
    bundlingEnabled: false
  });

  return new Promise((resolve) => {
    const htmlPath = path.join(utils.config.outputPath, 'component-tests.html');

    if (pagePrepared) {
      return resolve();
    }

    const out = fs.createWriteStream(htmlPath, 'utf8');
    const browserJSONPath = path.resolve(utils.config.outputPath, 'browser.json');

    fs.ensureFileSync(browserJSONPath);
    fs.writeFileSync(browserJSONPath, JSON.stringify({
      dependencies: utils.config.dependencies
    }));

    return require(path.resolve(__dirname, '../page.marko'))
      .render({}, out)
      .on('finish', () => {
        if (utils.options.coverage) {
          coverage.initializeBrowser();
        }

        return JSDOM.fromFile(htmlPath, {
          runScripts: 'dangerously',
          resources: 'usable'
        }).then((dom) => {
          global.window = dom.window;
          global.document = dom.window.document;
          global.window.console = console;

          pagePrepared = true;
          window.onload = () => resolve();
        });
      });
  });
};
