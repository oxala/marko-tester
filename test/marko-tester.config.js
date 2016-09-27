'use strict';

var tester = require('../');

tester.configure({
  components: [
    'test/*/index.js',
    'test/*/widget.js'
  ],

  taglibExcludeDirs: [
    'test'
  ],

  taglibExcludePackages: [],

  excludedAttributes: ['data-widget'],

  onInit: function () {},

  onDestroy: function () {},

  coverage: {
    reporters: [
      'text-summary',
      'html',
      'json-summary'
    ],

    dest: '.coverage',

    base: 'source',

    excludes: [
      '**/*.marko.js',
      '**/generated-tests/**/*'
    ]
  }
});
