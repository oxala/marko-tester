'use strict';

global.tester('nested-component', function (expect, testFixtures, testComponent, fixtures) {
  testFixtures();

  testComponent(() => {
    it('should initialize nested component with a proper state and config', () => {
      expect(marko.component.getComponent('nestedComponent').input).to.be.deep.equal(fixtures.default);
    });
  });
});
