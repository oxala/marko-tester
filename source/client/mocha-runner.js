'use strict';

var chai = require('chai');
var sinonChai = require('sinon-chai');

chai.use(sinonChai);

window.expect = chai.expect;

window.mochaPhantomJS ? window.mochaPhantomJS.run() : window.mocha.run();
