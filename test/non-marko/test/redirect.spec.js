'use strict';

var tester = require('../../../');
var redirect = require('../redirect');

tester('non-marko/redirect', function (expect, sinon) {
  this.buildPage(function () {
    beforeEach(function () {
      sinon.stub(document.location, 'replace');

      redirect();
    });

    afterEach(function () {
      document.location.replace.restore();
    });

    it('should alert window', function () {
      expect(document.location.replace).to.be.calledWith('hello-world');
    });
  });
});
