'use strict';

var template = require('./template.marko');
var dep = require('./dep');

module.exports = require('marko-widgets').defineComponent({
  template: template,

  getInitialState: function getInitialState(input) {
    return input;
  },

  init: function init() {
    document.location.replace(dep.url);
  }
});
