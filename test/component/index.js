'use strict';

module.exports = require('marko-widgets').defineComponent({
  template: require('./template.marko'),

  init: function init() {
    document.location.replace();
  }
});
