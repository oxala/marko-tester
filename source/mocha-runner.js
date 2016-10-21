'use strict';

var chai = require('chai');
var sinonChai = require('sinon-chai');

chai.use(sinonChai);

window.expect = chai.expect;

if (window.mochaPhantomJS) {
  window.mochaPhantomJS.run();
} else {
  window.mocha.run();
}
