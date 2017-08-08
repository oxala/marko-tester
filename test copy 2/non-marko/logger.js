'use strict';

var dep = require('./dep');

function logger() {
  console.log(dep.message);
}

module.exports = logger;
