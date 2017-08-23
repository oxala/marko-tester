'use strict';

global.tester('util', (expect, sinon, modRequire, testPage) => {
  testPage(() => {
    let util;
    let hello;
    let result;

    beforeEach(() => {
      hello = 'world';
      sinon.stub(window, 'alert');

      util = modRequire('test/component/util');

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
