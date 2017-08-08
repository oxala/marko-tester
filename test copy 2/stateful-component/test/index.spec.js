'use strict';

var tester = require('../../../');

tester('stateful-component', function (expect, sinon, helpers) {
  this.testFixtures();

  var mockUrl = 'mockUrl';
  var mockDep = {
    url: mockUrl
  };
  var mockAsync = {
    hello: 'world'
  };
  var mockMerge = function () {
    return mockUrl;
  };

  describe('Given multiple cases', function () {
    this.parent.buildComponent({
      mockRequire: {
        '../dep': mockDep,
        'async': mockAsync,
        'lodash/merge': mockMerge
      }
    }, function () {
      beforeEach(function () {
        sinon.spy(document.location, 'replace');
      });

      afterEach(function () {
        document.location.replace.restore();
      });

      this.buildWidget(function () {
        it('should redirect', function () {
          expect(document.location.replace).to.be.calledWith(mockUrl);
        });

        it('should store the state in the widget', function () {
          expect(this.widget.state).to.deep.equal(this.fixtures.default);
        });

        it('should mock the modules methods', function () {
          expect(this.widget.async).to.deep.equal(mockAsync);
        });

        it('should mock the merge function', function () {
          expect(this.widget.merge).to.deep.equal(mockMerge);
        });
      });
    });

    this.parent.buildComponent(function () {
      beforeEach(function () {
        sinon.spy(document.location, 'replace');
      });

      afterEach(function () {
        document.location.replace.restore();
      });

      this.buildWidget(function () {
        it('should redirect', function () {
          expect(document.location.replace).to.be.calledWith('hello-world');
        });

        it('should not mock the modules methods', function () {
          expect(this.widget.async).not.to.deep.equal(mockAsync);
        });

        it('should not mock the merge function', function () {
          expect(this.widget.merge).not.to.deep.equal(mockMerge);
        });
      });
    });
  });
});
