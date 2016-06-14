'use strict';

var tester = require('../');

tester.configure({
    components: [
        'test/*'
    ],
    taglibExcludeDirs: [],
    taglibExcludePackages: [],
    excludedAttributes: ['data-widget'],
    onInit: function () {},
    onDestroy: function () {}
});
