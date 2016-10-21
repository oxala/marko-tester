'use strict';

var tester = require('../');

tester.configure({
  taglibExcludeDirs: [
    'test'
  ],
  taglibExcludePackages: [
    'excluded-component'
  ],
  excludedAttributes: ['data-widget'],
  onInit: function onInit() {},
  onDestroy: function onDestroy() {},
  coverage: {
    reporters: [
      // 'text-summary',
      // 'html',
      // 'json-summary'
    ],
    dest: '.coverage',
    base: 'source',
    excludes: [
      '**/*.marko.js',
      '**/generated-tests/**/*'
    ]
  }
});
