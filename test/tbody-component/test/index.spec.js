'use strict';

var tester = require('../../../');
var fixture = require('./fixtures/default.json')

tester('tbody-component', function (expect, sinon) {
  this.testFixtures();

  this.buildComponent({
    layout: 'table'
  },function () {
    this.buildWidget(function () {
      it('should be able to access the DOM correctly', function () {
        expect(this.widget.el.tagName).to.be.equal('TBODY');
      });
    });
  });
});
