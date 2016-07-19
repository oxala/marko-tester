'use strict';

var template = require('./template.marko');

exports.renderer = function renderer(data, context) {
    template.render(data, context);
};
