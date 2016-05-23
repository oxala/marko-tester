'use strict';

exports.tag = {
    '@viewModel': 'expression',
    '@config': 'expression'
};

var template = require('./template.marko');

exports.renderer = function render(input, context) {
    template.render(input, context);
};
