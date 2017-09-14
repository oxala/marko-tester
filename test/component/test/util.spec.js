'use strict';

var tester = require('../../../');

tester('util', (expect, sinon, marko, testPage) => {
  testPage(() => {
    var util;
    var hello;
    var result;

    beforeEach(() => {
      hello = 'world';
      sinon.stub(window, 'alert');

      util = marko.require('test/component/util');

      result = util(hello);
    });

    afterEach(() => {
      window.alert.restore();
    });

    it('should alert the window', () => {
      expect(window.alert).to.be.calledWith(hello);
    });

    it('should return $', () => {
      expect(result).to.be.equal('$');
    });
  });
});
