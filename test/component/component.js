'use strict';

require('./util');

module.exports = class {
  onMount() {
    document.location.replace('hello-world');
  }
};
