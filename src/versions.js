const getModulePath = moduleName => require.resolve(`${moduleName}/package.json`).replace(/\/package\.json$/, '');
const markoPath = getModulePath('marko');
/* eslint-disable-next-line global-require, import/no-dynamic-require */
const { version: markoVersion } = require(`${markoPath}/package`);
let markoWidgetsPath;
let markoWidgetsVersion;

try {
  markoWidgetsPath = getModulePath('marko-widgets');
  /* eslint-disable-next-line global-require, import/no-dynamic-require */
  markoWidgetsVersion = require(`${markoWidgetsPath}/package`).version;
} catch (error) { /* */ }

module.exports = {
  getModulePath,
  markoPath,
  markoWidgetsPath,
  markoVersion: parseInt(markoVersion, 10),
  markoWidgetsVersion: markoWidgetsVersion && parseInt(markoWidgetsVersion, 10),
};
