'use strict';

module.exports = {
  taglibExcludeDirs: [
    'test'
  ],
  taglibExcludePackages: [
    'excluded-component'
  ],
  excludedAttributes: ['data-widget'],
  lassoPlugins: [],
  onInit: function onInit() {},
  onDestroy: function onDestroy() {},
  coverage: {
    reporters: [
      // 'text-summary',
      // 'html',
      // 'json-summary'
    ],
    dest: '.coverage',
    excludes: [
      '**/*.marko.js'
    ]
  }
};
