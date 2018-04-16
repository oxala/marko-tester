'use strict';

describe(({
  expect
}) => {
  describe.component({
    layout: 'table'
  }, ({
    marko
  }) => {
    it('should be able to access the DOM correctly', () => {
      expect(marko.component.getEl().tagName).to.be.equal('TBODY');
    });
  });
});
