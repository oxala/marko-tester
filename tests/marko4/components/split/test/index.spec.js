const { render, fixtures, createEvent } = require('../../../../..')('../index.marko');

describe('When component is rendered with data', () => {
  let component;

  beforeEach(() => {
    component = render(fixtures.default);
  });

  afterEach(() => {
    component.destroy();
  });

  describe('When user clicks emit button', () => {
    let clickEvent;

    beforeEach(() => {
      clickEvent = createEvent('click');

      jest.spyOn(component, 'emit');
      component.getEl('emit-button').dispatchEvent(clickEvent);
    });

    it('should emit "hello" with event and element', () => {
      expect(component.emit).toBeCalledWith('hello', clickEvent, clickEvent.target);
    });
  });
});
