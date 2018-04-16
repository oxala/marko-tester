'use strict';

describe('get-require', ({
  expect
}) => {
  describe.page(({
    marko
  }) => {
    beforeEach(() => {
      marko.require('../get-require');
    });

    it('should return require', () => {
      expect(window.require).not.to.be.undefined;
    });
  });
});
