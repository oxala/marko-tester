'use strict';

describe(({
  expect
}) => {
  const mockUtil = 'mockUtil';
  const mockLodash = 'mockLodash';
  const mockExcludedComponent = 'mockExcludedComponent';
  const mockExcludedComponents = ['mockExcludedComponents'];

  describe.component({
    mock: {
      require: {
        '../util': mockUtil,
        lodash: mockLodash
      },
      component: {
        'excluded-component': mockExcludedComponent
      },
      components: {
        'excluded-components': mockExcludedComponents
      }
    }
  }, ({
    marko
  }) => {
    it('should mock relative module', () => {
      expect(marko.component.util).to.be.equal(mockUtil);
    });

    it('should mock component', () => {
      expect(marko.component.getComponent('excluded-component')).to.be.equal(mockExcludedComponent);
    });

    it('should mock components', () => {
      expect(marko.component.getComponents('excluded-components')).to.be.equal(mockExcludedComponents);
    });

    it('should mock node module', () => {
      expect(marko.component.lodash).to.be.equal(mockLodash);
    });

    describe('When user clicks button', () => {
      beforeEach(() => {
        marko.component.getEl('button').click();
      });

      it('should emit `toggle`', () => {
        expect(marko.component.emit).to.be.calledWith('toggle');
      });

      it('should update the component', () => {
        expect(marko.component.update).to.be.calledWith();
      });

      it('should force update the component', () => {
        expect(marko.component.forceUpdate).to.be.calledWith();
      });
    });
  });
});
