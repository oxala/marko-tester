'use strict';

describe(({
  expect,
  sinon,
  modRequire
}) => {
  describe.page(() => {
    beforeEach(() => {
      sinon.stub(document.location, 'replace');

      modRequire('../redirect')();
    });

    afterEach(() => {
      document.location.replace.restore();
    });

    it('should alert window', () => {
      expect(document.location.replace).to.be.calledWith('hello-world');
    });
  });
});
