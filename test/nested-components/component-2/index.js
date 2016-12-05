'use strict';

var template = require('./template.marko');

module.exports = require('marko-widgets').defineComponent({
  template: template,

  getInitialState: function getInitialState(input) {
    return input;
  },

  getWidgetConfig: function getWidgetConfig(input) {
    return input;
  },

  init: function init(config) {
    this.config = config;
  }
});
