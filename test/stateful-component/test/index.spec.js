'use strict';

var tester = require('../../../');
var component = require('../');

var testCasesPath = __dirname + '/fixtures';

describe('stateful component test', function () {
  tester.testFixtures(component, testCasesPath);

  var viewModel = require('./fixtures/html-content');
  var settings = {
    renderer: component.renderer,
    fixture: viewModel
  };

  tester.buildComponent(settings);

  describe('When widget is rendered', function () {
    tester.buildWidget();

    it('should store the state in the widget', function () {
      expect(widget.state).to.eql(viewModel);
    });
  });
});
