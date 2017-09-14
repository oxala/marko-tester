'use strict';

global.tester('component', (expect, sinon, testFixtures, testComponent, testWidget) => {
  testFixtures();

  testComponent(() => {
    beforeEach(() => {
      sinon.stub(document.location, 'replace');
    });

    afterEach(() => {
      document.location.replace.restore();
    });

    testWidget(() => {
      it('should alert the user', () => {
        expect(document.location.replace).to.be.called;
      });
    });
  });
});
