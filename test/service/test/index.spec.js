'use strict';

global.tester('service', function (sinon, expect) {
  beforeEach(() => {
    sinon.stub(console, 'log');

    require('../')();
  });

  afterEach(() => {
    console.log.restore();
  });

  it('should say hello', () => {
    expect(console.log).to.be.calledWith('hello');
  });
});
