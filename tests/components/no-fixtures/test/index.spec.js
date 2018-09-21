const { getComponent } = require('../../../../src/index');

const { render } = getComponent('../index.marko');

describe('When component is rendered', () => {
  let component;

  beforeEach(() => {
    component = render({});
  });

  afterEach(() => {
    component.destroy();
  });

  it('should not throw an error about missing fixtures folder', () => {
    expect(true).toBe(true);
  });
});
