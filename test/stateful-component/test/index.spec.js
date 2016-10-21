'use strict';

var tester = require('../../../');

tester('stateful-component', function (expect, sinon) {
  this.testFixtures();

  this.buildComponent(function () {
    beforeEach(function () {
      sinon.spy(document.location, 'replace');
    });

    afterEach(function () {
      document.location.replace.restore();
    });

    this.buildWidget(function () {
      it('should redirect', function () {
        expect(document.location.replace).to.be.calledWith('/');
      });

      it('should store the state in the widget', function () {
        expect(this.widget.state).to.deep.equal(this.fixtures.default);
      });
    });
  });
});
