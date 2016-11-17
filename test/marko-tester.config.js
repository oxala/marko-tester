'use strict';

var tester = require('../source/index.js');
var configuration = require('../.marko-tester');

configuration.taglibExcludeDirs = ['test'];
configuration.taglibExcludePackages = ['excluded-component'];
configuration.coverage.reporters = [];

tester.configure(configuration);
