'use strict';

var tester = require('../../../');

tester('non-marko/logger', function (expect, sinon, mockRequire) {
  var mockMessage = 'mockMessage';
  var mockDep = {
    message: mockMessage
  };

  beforeEach(function () {
    mockRequire('../dep', mockDep);
    sinon.stub(console, 'log');

    require('../logger')();
  });

  afterEach(function () {
    mockRequire.stopAll();
    console.log.restore();
  });

  it('should log the message', function () {
    expect(console.log).to.be.calledWith(mockMessage);
  });
});
