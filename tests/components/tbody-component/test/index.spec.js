const { getComponent } = require('../../../../src/index');

const { render, fixtures } = getComponent('../index.marko');

describe('When component is rendered', () => {
  let component;

  beforeEach(() => {
    component = render(fixtures.default);
  });

  afterEach(() => {
    component.destroy();
  });

  it('should be able to access the DOM correctly', () => {
    expect(component.getEl().tagName).toBe('TBODY');
  });
});
