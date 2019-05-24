const { join } = require('path');

const getModulePath = moduleName => require.resolve(join(moduleName, 'package.json')).replace(join(' ', 'package.json').substr(1), '');
const markoPath = getModulePath('marko');
/* eslint-disable-next-line global-require, import/no-dynamic-require */
const { version: markoVersion } = require(join(markoPath, 'package'));
let markoWidgetsPath;
let markoWidgetsVersion;

try {
  markoWidgetsPath = getModulePath('marko-widgets');
  /* eslint-disable-next-line global-require, import/no-dynamic-require */
  markoWidgetsVersion = require(join(markoWidgetsPath, 'package')).version;
} catch (error) { /* */ }

module.exports = {
  getModulePath,
  markoPath,
  markoWidgetsPath,
  markoVersion: parseInt(markoVersion, 10),
  markoWidgetsVersion: markoWidgetsVersion && parseInt(markoWidgetsVersion, 10),
};
