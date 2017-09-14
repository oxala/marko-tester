'use strict';

global.tester('renderer', (sinon, expect, testComponent, testWidget) => {
  testComponent({
    fixture: 'main'
  }, () => {
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
