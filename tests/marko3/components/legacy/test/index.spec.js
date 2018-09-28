const { render, fixtures } = require('../../../../..')('../../../../marko4/components/legacy/component.js');

beforeEach(() => {
  window.alert = jest.fn();
});

describe('When legacy component is rendered with data', () => {
  let component;

  beforeEach(() => {
    component = render(fixtures.index);
  });

  afterEach(() => {
    component.destroy();
  });

  it('should init legacy component', () => {
    expect(window.alert).toBeCalledWith(fixtures.index.visible);
  });

  describe('When user clicks the button', () => {
    beforeEach((done) => {
      component.getEl('button').click();
      component.once('update', done);
    });

    it('should set change the state and re-render the template', () => {
      expect(component.state.visible).toBe(false);
    });
  });
});
