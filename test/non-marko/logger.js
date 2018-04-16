'use strict';

const dep = require('./dep');

module.exports = () => {
  console.error(dep.message);
};
