'use strict';

global.tester('nested-component', (expect, marko, testFixtures, testComponent, testWidget, fixtures) => {
  testFixtures();

  testComponent(() => {
    testWidget(() => {
      it('should initialize nested component with a proper state and config', () => {
        expect(marko.component.getWidget('nestedComponent').state).to.be.deep.equal(fixtures.default);
        expect(marko.component.getWidget('nestedComponent').config).to.be.deep.equal(fixtures.default);
      });
    });
  });
});
