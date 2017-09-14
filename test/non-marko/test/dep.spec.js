'use strict';

global.tester('non-marko/dep', (expect, sinon, rewire) => {
  var dep = rewire('../dep');
  var mockUrl = 'mockUrl';
  var result;

  beforeEach(() => {
    dep.__set__('url', mockUrl);

    result = dep.getUrl();
  });

  it('should log the message', () => {
    expect(result).to.be.equal(mockUrl);
  });
});
