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

    describe('When user clicks the button', () => {
      beforeEach(() => {
        marko.component.getEl('button').click();
      });

      it('should set i to 1', () => {
        expect(marko.component.input.i).to.be.equal(1);
      });

      it('should keep i as 1', () => {
        expect(marko.component.input.i).to.be.equal(1);
      });
    });
  });
});
