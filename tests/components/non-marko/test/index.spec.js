const util = require('..');

beforeEach(() => {
  window.alert = jest.fn();
});

describe('When util is being called', () => {
  const message = 'qwerty';
  let result;

  beforeEach(() => {
    result = util(message);
  });

  it('should alert with message', () => {
    expect(window.alert).toBeCalledWith(message);
  });

  it('should return dollar sign', () => {
    expect(result).toBe('$');
  });
});
