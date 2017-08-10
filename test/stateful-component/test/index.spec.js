'use strict';

global.tester('stateful-component', (expect, sinon, helpers, testFixtures, testComponent, fixtures) => {
  testFixtures();

  const mockUrl = 'mockUrl';
  const mockDep = {
    url: mockUrl
  };
  const mockAsync = {
    hello: 'world'
  };
  const mockMerge = () => {
    return mockUrl;
  };

  describe('Given multiple cases', () => {
    testComponent({
      mock: {
        require: {
          '../dep': mockDep,
          'async': mockAsync,
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

      it('should redirect', () => {
        expect(document.location.replace).to.be.calledWith(mockUrl);
      });

      it('should store the state in the widget', () => {
        expect(marko.components.state).to.deep.equal(fixtures.default);
      });

      it('should mock the modules methods', () => {
        expect(marko.components.async).to.deep.equal(mockAsync);
      });

      it('should mock the merge function', () => {
        expect(marko.components.merge).to.deep.equal(mockMerge);
      });
    });

    testComponent(() => {
      beforeEach(() => {
        sinon.spy(document.location, 'replace');
      });

      afterEach(() => {
        document.location.replace.restore();
      });

      it('should redirect', () => {
        expect(document.location.replace).to.be.calledWith('hello-world');
      });

      it('should not mock the modules methods', () => {
        expect(marko.components.async).not.to.deep.equal(mockAsync);
      });

      it('should not mock the merge function', () => {
        expect(marko.components.merge).not.to.deep.equal(mockMerge);
      });
    });
  });
});
