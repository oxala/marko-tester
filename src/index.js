const { readdirSync } = require('fs');
const {
  resolve, join, extname, basename,
} = require('path');
const { existsSync } = require('fs');
const stackTrace = require('stack-trace');
const clone = require('just-clone');
const markoModulesMockingMap = require('../marko-modules-mocking-map');

global.tester = Object.assign({
  shallow: true,
  fixturesDir: 'fixtures',
}, global.tester);

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

module.exports = (componentPath, { withoutFixtures } = {}) => {
  const fullPath = getFullPath(componentPath);

  if (!fullPath) {
    throw new Error(`Cannot find specified component at "${componentPath}".`);
  }

  function render(input) {
    /* eslint-disable-next-line global-require, import/no-dynamic-require */
    const component = require(fullPath);

    /* eslint-disable-next-line global-require, import/no-unresolved */
    require('marko/components').init();

    jest.resetModules();

    return component
      .renderSync(clone(input))
      .appendTo(document.body)
      .getComponent();
  }

  let fixtures = {};
  const fixturesPath = getFullPath(global.tester.fixturesDir);
  const runFixtures = () => {
    if (fixturesPath) {
      let fixturesAmount = 0;

      readdirSync(fixturesPath).forEach((file) => {
        const absPath = join(fixturesPath, file);
        const extension = extname(absPath);
        const testName = basename(absPath).replace(/\.(js|json)$/, '');

        if (extension === '.js' || extension === '.json') {
          fixturesAmount += 1;

          let fixture;

          try {
            /* eslint-disable-next-line global-require, import/no-dynamic-require */
            fixture = require(absPath);
          } catch (error) { /* */ }

          fixtures[testName] = fixture || {};

          it(`should render component with ${testName} fixture`, () => {
            const comp = render(clone(fixture));
            expect(Array.from(document.body.childNodes)).toMatchSnapshot();
            comp.destroy();
          });
        }
      });

      if (fixturesAmount === 0) {
        throw new Error(`No fixtures where found for component in "${fullPath}".`);
      }
    }
  };

  if (withoutFixtures) {
    fixtures = runFixtures;
  } else {
    runFixtures();
  }

  return {
    fixtures,
    render,
  };
};
