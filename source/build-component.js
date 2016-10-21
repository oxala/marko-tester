'use strict';

var fs = require('fs');
var path = require('path');
var glob = require('glob');
var _ = require('lodash');
var testConfiguration = require('./test-configuration');
var buildWidget = require('./build-widget');

function buildComponent(context, opts, cb) {
  var callback = cb || opts;
  var options = cb ? opts : {};
  var fixture = options.fixture;

  if (!context.renderer) {
    throw new Error('BuildComponent: Cannot automatically locate renderer, please specify one.');
  }

  if (!fixture || _.isString(fixture)) {
    var fixturePath;

    if (!fixture) {
      fixture = context.fixtures.default;
    } else {
      fixturePath = glob.sync(path.resolve(context.testPath, fixture + '?(.json|.js)'));

      if (fixturePath && fixturePath.length > 0) {
        fixture = fs.readFileSync(fixturePath[0], 'utf-8');

        try {
          fixture = JSON.parse(fixture);
        } catch (error) {
          throw new Error('BuildComponent: Specified fixture cannot be parsed.', error);
        }
      }
    }

    if (!fixture) {
      throw new Error('BuildComponent: Cannot automatically locate fixture (`default.json`), please specify one.');
    }
  }

  var operation = options.mochaOperation ? describe[options.mochaOperation] : describe;

  operation('When component is being built', function whenComponentIsBeingBuilt() {
    this.buildWidget = buildWidget.bind(this, context);
    this.buildWidget.only = buildWidget.only.bind(this, context);
    this.buildWidget.skip = buildWidget.skip.bind(this, context);

    beforeEach(function buildComponentBeforeEach(done) {
      this.timeout(10000);

      var ctx = this;

      ctx.fixtures = context.fixtures;

      function buildDom() {
        var Widget;

        context.renderer(fixture, function onComponentRender(err, result) {
          var html = result;

          if (_.isObject(result)) {
            var widgets = result.context.attributes.widgets;

            if (widgets) {
              Widget = widgets.widgets[0];
              var widgetId = Widget.id;

              window.$markoWidgetsState = {};
              window.$markoWidgetsState[widgetId] = Widget.state;

              window.$markoWidgetsConfig = {};
              window.$markoWidgetsConfig[widgetId] = Widget.config;

              html = result.html;
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
            done(new Error('Cannot find any attached widgets for the template. Make sure you used `w-bind` in your template.'));
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

      delete global.window;
      delete global.document;
    });
  });
}

function buildComponentWithMochaOperation(mochaOperation, context, opts, cb) {
  var callback = cb || opts;
  var options = cb ? opts : {};

  options.mochaOperation = mochaOperation;

  buildComponent(context, options, callback);
}

module.exports = buildComponent;
module.exports.only = buildComponentWithMochaOperation.bind(null, 'only');
module.exports.skip = buildComponentWithMochaOperation.bind(null, 'skip');
