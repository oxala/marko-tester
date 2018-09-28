const { render, fixtures } = require('../../../../../src/index')('../index.marko', { withAwait: true });

describe('When component is rendered', () => {
  let component;

  beforeEach(async () => {
    component = await render(fixtures.default);
  });

  afterEach(() => {
    component.destroy();
  });

  it('should process await tags', () => {
    expect(component.getEl().querySelectorAll('await').length).toBe(0);
  });
});
