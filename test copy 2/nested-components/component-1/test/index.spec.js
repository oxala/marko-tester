'use strict';

var tester = require('../../../../');

tester('nested-component', function (expect) {
  this.testFixtures();

  this.buildComponent(function () {
    this.buildWidget(function () {
      it('should initialize nested component with a proper state and config', function () {
        expect(this.widget.getWidget('nestedComponent').state).to.be.deep.equal(this.fixtures.default);
        expect(this.widget.getWidget('nestedComponent').config).to.be.deep.equal(this.fixtures.default);
      });
    });
  });
});
