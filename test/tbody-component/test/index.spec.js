'use strict';

global.tester('tbody-component', (expect, sinon, testFixtures, testComponent, marko) => {
  testFixtures();

  testComponent({
    layout: 'table'
  }, () => {
    it('should be able to access the DOM correctly', () => {
      expect(marko.component.el.tagName).to.be.equal('TBODY');
    });
  });
});
