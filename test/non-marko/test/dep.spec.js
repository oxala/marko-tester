'use strict';

var tester = require('../../../');

tester('non-marko/dep', function (expect, sinon, rewire) {
  var dep = rewire('../dep');
  var mockUrl = 'mockUrl';
  var result;

  beforeEach(function () {
    dep.__set__('url', mockUrl);

    result = dep.getUrl();
  });

  it('should log the message', function () {
    expect(result).to.be.equal(mockUrl);
  });
});
