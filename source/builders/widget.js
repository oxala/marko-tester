'use strict';

var utils = require('../utils');

function buildWidget(context, opts, cb) {
  var callback = cb || opts;
  var options = cb ? opts : {};

  options.mochaOperation('When widget is being rendered', function whenWidgetIsBeingRendered() {
    beforeEach(function buildWidgetBeforeEach() {
      var widgetContainers = window['component-container'].querySelectorAll('[data-widget]');
      var widgetIds = [];

      for (var i = 0, wLen = widgetContainers.length; i < wLen; i += 1) {
        widgetIds.push(widgetContainers[i].id);
      }

      window.$MARKO_WIDGETS.initWidgets(widgetIds.join(','));

      this.widget = window.$MARKO_WIDGETS.getWidgetForEl(widgetIds[0]);
    });

    afterEach(function buildWidgetAfterEach() {
      if (this.widget && this.widget.destroy) {
        this.widget.destroy();
      }
    });

    callback.call(this);
  });
}


module.exports = utils.runWithMochaOperation.bind(null, null, buildWidget);
module.exports.only = utils.runWithMochaOperation.bind(null, 'only', buildWidget);
module.exports.skip = utils.runWithMochaOperation.bind(null, 'skip', buildWidget);
