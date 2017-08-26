'use strict';

global.tester('component', (expect, sinon, testFixtures, testComponent, testPage) => {
  testFixtures();

  testPage(() => {

    beforeEach(() => {
      sinon.stub(document.location, 'replace');
    });

    afterEach(() => {
      document.location.replace.restore();
    });

    testComponent(() => {
      it('should alert the user', () => {
        expect(document.location.replace).to.be.calledWith('hello-world');
      });
    });
  });
});
