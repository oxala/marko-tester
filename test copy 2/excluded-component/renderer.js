'use strict';

var template = require('./template.marko');

module.exports = function renderer(data, context) {
  template.render(data, context);
};
