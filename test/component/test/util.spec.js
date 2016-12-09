'use strict';

var tester = require('../../../');

tester.only('util', function (expect, sinon, modRequire) {
  this.buildPage(function () {
    var util;

    beforeEach(function () {
      sinon.stub(window, 'alert');

      util = modRequire('test/component/util');

      util();
    });

    afterEach(function () {
      window.alert.restore();
    });

    it('should alert the window', function () {
      expect(window.alert).to.be.calledWith('hello-world');
    });
  });
});
