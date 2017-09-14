'use strict';

global.tester('tbody-component', (expect, sinon, testFixtures, testComponent, testWidget, marko) => {
  testFixtures();

  testComponent({
    layout: 'table'
  }, () => {
    testWidget(() => {
      it('should be able to access the DOM correctly', () => {
        expect(marko.component.el.tagName).to.be.equal('TBODY');
      });
    });
  });
});
