'use strict';

var tester = require('../../../');
var component = require('../renderer');

var testCasesPath = __dirname + '/fixtures';

describe('renderer test', function () {
  tester.testFixtures(component, testCasesPath);

  var settings = {
    renderer: component,
    fixture: require('./fixtures/html-content')
  };

  tester.buildComponent(settings);

  describe('When widget is rendered', function () {
    beforeEach(function () {
      sinon.stub(document.location, 'replace');
    });

    afterEach(function () {
      document.location.replace.restore();
    });

    tester.buildWidget();

    it('should alert the user', function () {
      expect(document.location.replace).to.be.called;
    });
  });
});
