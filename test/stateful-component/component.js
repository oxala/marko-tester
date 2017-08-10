'use strict';

const dep = require('./dep');
const async = require('async');
const merge = require('lodash/merge');

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
