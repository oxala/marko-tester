'use strict';

global.tester('non-marko/redirect', (expect, sinon, testPage, marko) => {
  testPage(() => {
    beforeEach(() => {
      sinon.stub(document.location, 'replace');

      marko.require('../redirect')();
    });

    afterEach(() => {
      document.location.replace.restore();
    });

    it('should alert window', () => {
      expect(document.location.replace).to.be.calledWith('hello-world');
    });
  });
});
