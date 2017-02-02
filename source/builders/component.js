'use strict';

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
    this.timeout(utils.getHelpers().config.componentTimeout);

    beforeEach(function buildComponentBeforeEach(done) {
      var ctx = this;

      ctx.fixtures = context.fixtures;

      function buildDom() {
        var Widget;

        if (options.mockRequire) {
          utils.mockRequire(options.mockRequire, context.testPath);
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

      utils.gatherBrowserCoverage();
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
