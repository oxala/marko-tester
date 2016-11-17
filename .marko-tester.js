'use strict';

module.exports = {
  taglibExcludeDirs: [
    // 'test'
  ],
  taglibExcludePackages: [
    // 'excluded-component'
  ],
  excludedAttributes: ['data-widget'],
  lassoPlugins: [],
  onInit: function onInit() {},
  onDestroy: function onDestroy() {},
  coverage: {
    reporters: [
      'text-summary',
      'html',
      'json-summary'
    ],
    dest: '.coverage',
    excludes: [
      '**/*.marko.js'
    ]
  },
  acceptance: {
    baseUrl: 'localhost:8080',
    startCommand: 'npm start',
    stopCommand: 'npm stop',
    startTimeout: 10000
  }
};
