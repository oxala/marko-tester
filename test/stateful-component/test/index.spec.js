'use strict';

global.tester('stateful-component', (expect, sinon, testFixtures, testComponent, testWidget, marko, fixtures) => {
  testFixtures();

  var mockUrl = 'mockUrl';
  var mockDep = {
    url: mockUrl
  };
  var mockAsync = {
    hello: 'world'
  };
  var mockMerge = () => {
    return mockUrl;
  };

  describe('Given multiple cases', () => {
    testComponent({
      mockRequire: {
        '../dep': mockDep,
        'async': mockAsync
      },
      mock: {
        require: {
          'lodash/merge': mockMerge
        }
      }
    }, () => {
      beforeEach(() => {
        sinon.spy(document.location, 'replace');
      });

      afterEach(() => {
        document.location.replace.restore();
      });

      testWidget(() => {
        it('should redirect', () => {
          expect(document.location.replace).to.be.calledWith(mockUrl);
        });

        it('should store the state in the widget', () => {
          expect(marko.component.state).to.deep.equal(fixtures.default);
        });

        it('should mock the modules methods', () => {
          expect(marko.component.async).to.deep.equal(mockAsync);
        });

        it('should mock the merge ', () => {
          expect(marko.component.merge).to.deep.equal(mockMerge);
        });
      });
    });

    testComponent(() => {
      beforeEach(() => {
        sinon.spy(document.location, 'replace');
      });

      afterEach(() => {
        document.location.replace.restore();
      });

      testWidget(() => {
        it('should redirect', () => {
          expect(document.location.replace).to.be.calledWith('hello-world');
        });

        it('should not mock the modules methods', () => {
          expect(marko.component.async).not.to.deep.equal(mockAsync);
        });

        it('should not mock the merge ', () => {
          expect(marko.component.merge).not.to.deep.equal(mockMerge);
        });
      });
    });
  });
});
