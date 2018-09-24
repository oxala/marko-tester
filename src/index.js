const { readdirSync } = require('fs');
const {
  resolve, join, extname, basename,
} = require('path');
const { existsSync } = require('fs');
const stackTrace = require('stack-trace');
const clone = require('just-clone');
const markoModulesMockingMap = require('../marko-modules-mocking-map');

Object.keys(markoModulesMockingMap)
  .forEach(moduleToMock => jest.mock(
    moduleToMock,
    () => require.requireActual(markoModulesMockingMap[moduleToMock]),
  ));

const getFullPath = (componentPath) => {
  const stack = stackTrace.get();

  stack.splice(0, 2);

  const index = stack.findIndex((trace) => {
    const filename = trace.getFileName();
    const fullPath = resolve(filename || '', '..', componentPath);

    return existsSync(fullPath);
  });

  return index > -1 && resolve(stack[index].getFileName(), '..', componentPath);
};
const getFixtures = fixturesFullPath => (fixturesFullPath ? readdirSync(fixturesFullPath) : [])
  .filter(filename => /\.js(on)?$/.test(filename))
  .reduce((fixtures, filename) => {
    const absPath = join(fixturesFullPath, filename);
    const extension = extname(filename);
    const testName = basename(filename).replace(extension, '');

    /* eslint-disable-next-line global-require, import/no-dynamic-require */
    Object.assign(fixtures, { [testName]: require(absPath) || {} });

    return fixtures;
  }, {});

module.exports = (componentPath, { withoutFixtures, withAwait } = {}) => {
  const fullPath = getFullPath(componentPath);

  if (!fullPath) {
    throw new Error(`Cannot find specified component at "${componentPath}".`);
  }

  const render = (input) => {
    /* eslint-disable-next-line global-require, import/no-dynamic-require */
    const component = require(fullPath);
    const mount = comp => comp.appendTo(document.body).getComponent();

    /* eslint-disable-next-line global-require, import/no-unresolved */
    require('marko/components').init();

    jest.resetModules();

    return withAwait
      ? component.render(clone(input)).then(mount)
      : mount(component.renderSync(clone(input)));
  };
  const fixturesFullPath = getFullPath('__snapshots__');
  const runFixtures = () => {
    /* eslint-disable-next-line no-use-before-define */
    const fixturesEntries = Object.entries(fixturesData);

    if (fixturesEntries.length === 0 && fixturesFullPath) {
      throw new Error(`No fixtures where found for component in "${fullPath}".`);
    }

    fixturesEntries.forEach(([name, fixture]) => {
      it(`should render component with ${name} fixture`, async () => {
        const comp = await render(clone(fixture));
        expect(Array.from(document.body.childNodes)).toMatchSnapshot();
        comp.destroy();
      });
    });

    return {};
  };
  const fixturesData = getFixtures(fixturesFullPath);
  const fixtures = Object.assign(
    withoutFixtures ? runFixtures : runFixtures(),
    fixturesData,
  );

  return { fixtures, render };
};
