'use strict';

var tester = require('../../../');

tester('renderer', function (sinon, expect) {
  this.testFixtures();

  this.buildComponent(function () {
    beforeEach(function () {
      sinon.stub(document.location, 'replace');
    });

    afterEach(function () {
      document.location.replace.restore();
    });

    this.buildWidget(function () {
      it('should alert the user', function () {
        expect(document.location.replace).to.be.called;
      });
    });
  });
});
