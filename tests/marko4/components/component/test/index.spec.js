const { render, fixtures, createEvent } = require('marko-tester')('../index.marko', { withoutFixtures: true });

fixtures();

describe('When component is rendered with data', () => {
  let component;
  const cachedFixture = JSON.stringify(fixtures.default);
  const mockUtil = 'mockUtil';

  beforeEach(() => {
    jest.mock('../../../../common/components/non-marko', () => mockUtil);

    component = render(fixtures.default);
  });

  afterEach(() => {
    component.destroy();
  });

  describe('When component is re-rendered', () => {
    beforeEach(() => {
      component.forceUpdate();
    });

    it('should re-render the component', () => {
      expect(true);
    });
  });

  it('should not mutate the fixture', () => {
    expect(JSON.stringify(fixtures.default)).toBe(cachedFixture);
  });

  it('should mock relative module', () => {
    expect(component.util).toBe(mockUtil);
  });

  it('should not render other component', () => {
    expect(component.getEl('tbody').tagName).toBe('TBODY-COMPONENT');
  });

  describe('When user press ENTER on the button', () => {
    let preventDefault;

    beforeEach(() => {
      preventDefault = jest.fn();

      component.getEl('button').dispatchEvent(createEvent('keypress', { keyCode: 13, preventDefault }));
    });

    it('should set change the state and re-render', () => {
      expect(component.state.hidden).toBe(true);
      expect(component.getEl('tbody')).not.toBe(undefined);
      component.update();
      expect(component.getEl('tbody')).toBe(undefined);
    });

    it('should prevent default behavior', () => {
      expect(preventDefault).toBeCalled();
    });
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

describe('When component is rendered without data', () => {
  let component;
  const mockUtil = 'mockUtil2';

  beforeEach(() => {
    jest.mock('../../../../common/components/non-marko', () => mockUtil);

    component = render(fixtures.hidden);
  });

  afterEach(() => {
    component.destroy();
  });

  it('should mock relative module', () => {
    expect(component.util).toBe(mockUtil);
  });
});

describe('When component is rendered without fixture', () => {
  let component;

  beforeEach(() => {
    component = render();
  });

  afterEach(() => {
    component.destroy();
  });

  it('should not error', () => {
    expect(true);
  });
});
