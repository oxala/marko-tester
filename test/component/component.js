'use strict';

const util = require('./util');
const lodash = require('lodash');

module.exports = {
  onCreate(input) {
    this.state = {
      hidden: input.hidden
    };
  },

  onMount() {
    this.lodash = lodash;
    this.util = util;
  },

  changeInput() {
    this.input.i = this.input.i + 1;
  }
};
