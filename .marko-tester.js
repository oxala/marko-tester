'use strict';

module.exports = {
  components: [],
  taglibExcludeDirs: [
  ],
  taglibExcludePackages: [
  ],
  excludedAttributes: [],
  lassoPlugins: [],
  componentTimeout: 10000,
  onInit: () => {},
  onDestroy: () => {},
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
