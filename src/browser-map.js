const glob = require('glob');
const { existsSync } = require('fs');
const { relative, resolve } = require('path');
const {
  getModulePath,
  markoPath,
  markoWidgetsPath,
  markoVersion,
} = require('./versions');

function getPackages() {
  let marko3Packages = [];

  if (markoVersion === 3) {
    marko3Packages = [
      ...glob.sync(`${markoWidgetsPath}/!(node_modules)/**/package.json`),
      ...glob.sync(`${markoWidgetsPath}/package.json`),
      ...glob.sync(`${getModulePath('raptor-renderer')}/package.json`),
      ...glob.sync(`${getModulePath('raptor-dom')}/package.json`),
    ];
  }

  return [
    ...glob.sync(`${markoPath}/!(node_modules)/**/package.json`),
    ...glob.sync(`${markoPath}/!(node_modules)/package.json`),
    ...marko3Packages,
  ];
}

function getExisting(packagePath) {
  /* eslint-disable-next-line global-require, import/no-dynamic-require */
  const packageData = require(packagePath);
  const { main = '' } = packageData;
  let { browser = {} } = packageData;
  const relativeTo = `${packagePath.split('node_modules').slice(0, -1).join('node_modules')}/node_modules`;

  if (typeof browser === 'string') {
    browser = { [main]: browser };
  }

  return Object.entries(browser).reduce((cleanMap, [nodePath, browserPath]) => {
    /* eslint-disable-next-line no-param-reassign */
    browserPath = browserPath || resolve(__dirname, 'noop.js');

    const fullNodePath = resolve(packagePath, '..', nodePath);
    const fullBrowserPath = resolve(packagePath, '..', browserPath);

    return {
      ...cleanMap,
      ...(
        existsSync(fullNodePath) && existsSync(fullBrowserPath)
          ? { [relative(relativeTo, fullNodePath)]: relative(relativeTo, fullBrowserPath) }
          : {}
      ),
    };
  }, {});
}

function getBrowserMaps(packagePaths) {
  return packagePaths
    .reduce((map, packagePath) => ({
      ...map,
      ...getExisting(packagePath),
    }), {});
}

let browserMap;

try {
  browserMap = getBrowserMaps(getPackages());
} catch (error) {
  console.error(error);

  browserMap = {};
}

module.exports = browserMap;
