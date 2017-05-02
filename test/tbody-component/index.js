'use strict';

var template = require('./template.marko');

module.exports = require('marko-widgets').defineComponent({
  template: template,

  init: function init() {
  },

  getInnerHtml: function getInnerHtml () {
    return this.el.getElementsByTagName('td')[0].innerHTML;
  }
});
