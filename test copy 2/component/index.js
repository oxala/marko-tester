'use strict';

var template = require('./template.marko');
var util = require('./util');

module.exports = require('marko-widgets').defineComponent({
  template: template,

  init: function init() {
    document.location.replace();
  }
});
