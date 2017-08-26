'use strict';

global.tester('non-marko/logger', (expect, sinon, mockRequire) => {
  const mockMessage = 'mockMessage';
  const mockDep = {
    message: mockMessage
  };

  beforeEach(() => {
    mockRequire('../dep', mockDep);
    sinon.stub(console, 'log');

    require('../logger')();
  });

  afterEach(() => {
    mockRequire.stopAll();
    console.log.restore();
  });

  it('should log the message', () => {
    expect(console.log).to.be.calledWith(mockMessage);
  });
});
