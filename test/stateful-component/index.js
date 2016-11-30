'use strict';

var template = require('./template.marko');
var dep = require('./dep');
var async = require('async');
var merge = require('lodash/merge');

module.exports = require('marko-widgets').defineComponent({
  template: template,

  getInitialState: function getInitialState(input) {
    return input;
  },

  init: function init() {
    this.async = async;
    this.merge = merge;
    document.location.replace(dep.url);
  }
});
