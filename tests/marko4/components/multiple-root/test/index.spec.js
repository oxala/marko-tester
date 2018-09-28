const { render } = require('../../../../../src/index')('../index.marko');

describe('When component is rendered', () => {
  let component;

  beforeEach(() => {
    component = render();
  });

  afterEach(() => {
    component.destroy();
  });

  it('should render the component', () => {
    expect(true);
  });
});
