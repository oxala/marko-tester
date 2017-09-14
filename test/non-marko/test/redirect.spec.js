'use strict';

var redirect = require('../redirect');

global.tester('non-marko/redirect', (expect, sinon, testPage) => {
  testPage(() => {
    beforeEach(() => {
      sinon.stub(document.location, 'replace');

      redirect();
    });

    afterEach(() => {
      document.location.replace.restore();
    });

    it('should alert window', () => {
      expect(document.location.replace).to.be.calledWith('hello-world');
    });
  });
});
