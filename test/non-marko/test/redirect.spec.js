'use strict';

var tester = require('../../../');
var redirect = require('../redirect');

describe('non-marko-jquery', function () {
  tester.buildComponent();

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
