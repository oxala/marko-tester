'use strict';

var template = require('./template.marko');

module.exports = require('marko-widgets').defineRenderer({
  template: template
});
