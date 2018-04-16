'use strict';

describe(({
  expect,
  sinon,
  mockRequire
}) => {
  const mockMessage = 'mockMessage';
  const mockDep = {
    message: mockMessage
  };

  beforeEach(() => {
    mockRequire('../dep', mockDep);

    sinon.stub(console, 'error');

    require('../logger')();
  });

  afterEach(() => {
    console.error.restore();
  });

  it('should log the message', () => {
    expect(console.error).to.be.calledWith(mockMessage);
  });
});
