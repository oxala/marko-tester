'use strict';

global.tester('get-require', (expect, testPage, marko) => {
  testPage(() => {
    beforeEach(() => {
      marko.require('../get-require');
    });

    it('should return require', () => {
      expect(window.require).not.to.be.undefined;
    });
  });
});
