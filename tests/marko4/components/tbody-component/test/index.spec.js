const { render, fixtures } = require('../../../../..')('../index.marko');

describe('When component is rendered', () => {
  let component;

  beforeEach(() => {
    component = render(fixtures.default);
  });

  afterEach(() => {
    component.destroy();
  });

  it('should be able to access the DOM correctly', () => {
    expect(/^<tbody>/.test(document.body.innerHTML)).toBe(true);
  });
});
