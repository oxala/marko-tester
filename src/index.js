const { readdirSync } = require('fs');
const {
  resolve, join, extname, basename,
} = require('path');
const { existsSync } = require('fs');
const stackTrace = require('stack-trace');
const browserMap = require('./browser-map');
const render = require('./render');

delete global.WeakMap;

Object.keys(browserMap)
  .forEach(moduleToMock => jest.mock(
    moduleToMock,
    () => require.requireActual(browserMap[moduleToMock]),
  ));

const getFullPath = (path) => {
  const stack = stackTrace.get();

  stack.splice(0, 2);

  const index = stack.findIndex((trace) => {
    const filename = trace.getFileName();
    const fullPath = resolve(filename || '', '..', path);

    return existsSync(fullPath) || existsSync(`${fullPath}.js`);
  });

  return index > -1 && resolve(stack[index].getFileName(), '..', path);
};
const getFixtures = (fixturesPath => () => (fixturesPath ? readdirSync(fixturesPath) : [])
  .filter(filename => /\.js(on)?$/.test(filename))
  .reduce((fixtures, filename) => {
    const absPath = join(fixturesPath, filename);
    const extension = extname(filename);
    const testName = basename(filename).replace(extension, '');

    /* eslint-disable-next-line global-require, import/no-dynamic-require */
    Object.assign(fixtures, { [testName]: require(absPath) || {} });

    return fixtures;
  }, {}))(getFullPath('__snapshots__'));
const runFixtures = (fixtures, fullPath, withAwait) => (fixtureName) => {
  const fixturesEntries = Object.entries(fixtures);
  const fixturesPath = getFullPath('__snapshots__');

  if (fixturesPath && fixturesEntries.length === 0) throw new Error(`No fixtures where found for component in "${fullPath}".`);

  fixturesEntries
    .filter(([name]) => (!fixtureName || fixtureName === name))
    .forEach(([name, fixture]) => it(`should render component with ${name} fixture`, async () => {
      const comp = await render(fullPath, withAwait)(JSON.parse(JSON.stringify(fixture)));

      expect(Array.from(document.body.childNodes)).toMatchSnapshot();
      comp.destroy();
    }));

  return {};
};
const helpers = {
  createEvent: (eventName, options = {}) => ((customEvent) => {
    const { bubbles = true, cancelable = true } = options;

    customEvent.initEvent(eventName, bubbles, cancelable);

    return Object.assign(customEvent, options);
  })(document.createEvent('Event')),
  defer: () => (toReturn => Object.assign(toReturn, {
    promise: new Promise((res, rej) => Object.assign(toReturn, { resolve: res, reject: rej })),
  }))({}),
};
const tester = (componentPath, { withoutFixtures, withAwait } = {}) => {
  const fullPath = getFullPath(componentPath);

  if (!fullPath) throw new Error(`Cannot find specified component at "${componentPath}".`);

  const fixtures = getFixtures();
  const boundRunFixtures = runFixtures(fixtures, fullPath, withAwait);

  return Object.assign(helpers, {
    fixtures: Object.assign(
      withoutFixtures ? boundRunFixtures : boundRunFixtures(),
      fixtures,
    ),
    render: render(fullPath, withAwait),
  });
};

module.exports = Object.assign(tester, helpers);
