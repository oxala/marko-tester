'use strict';

var tester = require('../');

tester.configure({
    components: [
        'test/*'
    ],
    taglibExcludeDirs: [],
    taglibExcludePackages: [],
    onInit: function () {},
    onDestroy: function () {}
});
