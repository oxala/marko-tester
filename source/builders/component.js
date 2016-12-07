'use strict';

var fs = require('fs');
var path = require('path');
var glob = require('glob');
var _ = require('lodash');
var testConfiguration = require('../configure');
var buildWidget = require('./widget');
var utils = require('../utils');

function getFixture(context, currentFixture) {
  var fixture = currentFixture;

  if (!fixture || _.isString(fixture)) {
    var fixturePath;

    if (!fixture) {
      fixture = context.fixtures.default;
    } else if (context.fixtures[fixture]) {
      fixture = context.fixtures[fixture];
    } else {
      fixturePath = glob.sync(path.resolve(context.testPath, fixture + '?(.json|.js)'));

      if (fixturePath && fixturePath.length > 0) {
        fixture = require(fixturePath[0]);
      }
    }

    if (!fixture) {
      throw new Error('BuildComponent: Cannot automatically locate fixture (`default.json`), please specify one.');
    }
  }

  return fixture;
}

function buildComponent(context, opts, cb) {
  /* eslint global-require: 0 */

  var callback = cb || opts;
  var options = cb ? opts : {};
  var renderer = context.renderer || utils.getRenderer();

  if (!renderer) {
    throw new Error('BuildComponent: Cannot automatically locate renderer, please specify one.');
  }

  var fixture = getFixture(context, options.fixture);

  options.mochaOperation('When component is being built', function whenComponentIsBeingBuilt() {
    this.buildWidget = buildWidget.bind(this, context);
    this.buildWidget.only = buildWidget.only.bind(this, context);
    this.buildWidget.skip = buildWidget.skip.bind(this, context);

    beforeEach(function buildComponentBeforeEach(done) {
      this.timeout(utils.getHelpers().config.componentTimeout);

      var ctx = this;

      ctx.fixtures = context.fixtures;

      function buildDom() {
        var Widget;

        if (options.mockRequire) {
          Object.keys(options.mockRequire).forEach(function mockRequire(filePath) {
            var mock = options.mockRequire[filePath];
            var file = filePath;
            var packageInfo;
            var isAbsolute = path.isAbsolute(file);

            if (!isAbsolute && file[0] !== '.') {
              var fileArray = file.split('/');

              try {
                var modulePath = path.resolve(utils.getHelpers().rootPath, 'node_modules', fileArray[0]);
                fs.lstatSync(modulePath);
                packageInfo = require(path.join(modulePath, 'package'));
                file = fileArray.splice(1).join('/') || packageInfo.main.split('.')[0];
              } catch (e) {
                try {
                  var modulePath = path.resolve(utils.getHelpers().rootPath, fileArray[0]);
                  fs.lstatSync(modulePath);
                } catch (e) {
                  /* eslint no-console: 0 */
                  console.error('BuildComponent: Cannot resolve module to mock require for - ' + filePath);
                }
              }
            } else if (!isAbsolute) {
              file = path.resolve(context.testPath, file).replace(utils.getHelpers().rootPath, '');
            }

            if (!packageInfo) {
              packageInfo = require(path.join(utils.getHelpers().rootPath, '/package'));
            }

            packageInfo = [
              packageInfo.name,
              '$',
              packageInfo.version
            ].join('');

            window.$_mod.def('/' + path.join(packageInfo, file), mock);
          });
        }

        renderer(fixture, function onComponentRender(err, result) {
          var html = result;

          if (_.isObject(result)) {
            var widgets = result.context.attributes.widgets;

            if (widgets) {
              Widget = widgets.widgets[0];
              html = result.html;
            }

            var widgetsById = result.context.global.widgets.widgetsById;

            if (widgetsById) {
              window.$markoWidgetsState = {};
              window.$markoWidgetsConfig = {};

              Object.keys(widgetsById).forEach(function forEachWidgetId(widgetId) {
                window.$markoWidgetsState[widgetId] = widgetsById[widgetId].state;
                window.$markoWidgetsConfig[widgetId] = widgetsById[widgetId].config;
              });
            }
          }

          if (Widget) {
            var componentContainer = window['component-container'];

            componentContainer.innerHTML = html;

            var widgetEl = componentContainer.querySelector('[data-widget]');
            var widgetPath = widgetEl.getAttribute('data-widget');

            Widget = window.$_mod.require(widgetPath);
          }

          if (testConfiguration.onInit) {
            testConfiguration.onInit();
          }

          if (!Widget) {
            done(new Error('BuildComponent: Cannot find any attached widgets for the template. Make sure you used `w-bind` in your template.'));
          } else {
            ctx.Widget = Widget;

            done();
          }
        });
      }

      context.preparePage().then(buildDom);
    });

    callback.call(this);

    afterEach(function buildComponentAfterEach() {
      if (testConfiguration.onDestroy) {
        testConfiguration.onDestroy();
      }

      delete window.$markoWidgetsState;
      delete window.$markoWidgetsConfig;

      /* eslint no-underscore-dangle: 0 */
      if (global.__coverage__browser && global.window.__coverage__) {
        global.__coverage__browser.push(global.window.__coverage__);
      }
    });

    after(function buildComponentAfter() {
      delete global.window;
      delete global.document;
    });
  });
}

module.exports = utils.runWithMochaOperation.bind(null, null, buildComponent);
module.exports.only = utils.runWithMochaOperation.bind(null, 'only', buildComponent);
module.exports.skip = utils.runWithMochaOperation.bind(null, 'skip', buildComponent);
