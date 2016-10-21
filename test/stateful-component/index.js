'use strict';

var template = require('./template.marko');

module.exports = require('marko-widgets').defineComponent({
  template: template,

  getInitialState: function getInitialState(input) {
    return input;
  },

  init: function init() {
    document.location.replace('/');
  }
});
