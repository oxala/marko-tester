'use strict';

function buildWidget(context, opts, cb) {
  var callback = cb || opts;
  var options = cb ? opts : {};
  var operation = options.mochaOperation ? describe[options.mochaOperation] : describe;

  operation('When widget is being rendered', function whenWidgetIsBeingRendered() {
    beforeEach(function buildWidgetBeforeEach() {
      var widgetContainers = window['component-container'].querySelectorAll('[data-widget]');
      var widgetId = widgetContainers[0].id;

      window.$MARKO_WIDGETS.initWidgets(widgetId);

      this.widget = window.$MARKO_WIDGETS.getWidgetForEl(widgetId);
    });

    afterEach(function buildWidgetAfterEach() {
      if (this.widget && this.widget.destroy) {
        this.widget.destroy();
      }
    });

    callback.call(this);
  });
}

function buildWidgetWithMochaOperation(mochaOperation, context, opts, cb) {
  var callback = cb || opts;
  var options = cb ? opts : {};

  options.mochaOperation = mochaOperation;

  buildWidget(context, options, callback);
}

module.exports = buildWidget;
module.exports.only = buildWidgetWithMochaOperation.bind(null, 'only');
module.exports.skip = buildWidgetWithMochaOperation.bind(null, 'skip');
