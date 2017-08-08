'use strict';

var template = require('./template.marko');
var dep = require('./dep');
var async = require('async');
var merge = require('lodash/merge');

module.exports = class {
  onCreate(input) {
    this.state = input;
  }

  onMount() {
    this.async = async;
    this.merge = merge;
    document.location.replace(dep.url);
  }
};
