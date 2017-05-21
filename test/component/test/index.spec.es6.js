'use strict';

global.tester('component', function (expect, sinon) {
  this.testFixtures();

  this.buildComponent(function () {
    beforeEach(() => {
      sinon.stub(document.location, 'replace');
    });

    afterEach(() => {
      document.location.replace.restore();
    });

    this.buildWidget(function () {
      it('should alert the user', () => {
        expect(document.location.replace).to.be.called;
      });
    });
  });
});
