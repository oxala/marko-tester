'use strict';

module.exports = {
  components: [],
  taglibExcludeDirs: [],
  taglibExcludePackages: [],
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
    dest: '.reports',
    excludes: [
      '**/*.marko.js'
    ]
  }
};
