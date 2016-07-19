'use strict';

var template = require('./template.marko');

exports.renderer = function renderer(data, context) {
    console.log(data);
    template.render(data, context);
};
