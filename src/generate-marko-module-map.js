const glob = require('glob');
const { isDebug } = require('marko/env');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);
const fileExistsAsync = promisify(fs.exists);
const NODE_MODULES_PATH = path.relative(`${__dirname}/..`, path.resolve(require.resolve('marko'), '..', '..'));
const MARKO_DIST = `marko/${isDebug && process.env.NODE_ENV !== 'test' ? 'src' : 'dist'}`;
const BASE_PATH = `${NODE_MODULES_PATH}/${MARKO_DIST}`;
const OUTPUT_PATH = './marko-modules-mocking-map.json';

function writeJSONFile(targetFilename, data) {
  return writeFileAsync(targetFilename, JSON.stringify(data, null, 2));
}

function notNull(item) {
  return !!item;
}

function getPackageFiles() {
  return new Promise((resolve, reject) => {
    glob(`${BASE_PATH}/**/package.json`, {}, (err, files) => {
      if (err) {
        reject(err);
      } else {
        resolve(files);
      }
    });
  });
}

function flattenBrowserMap(folderName, browserMap) {
  return Object.keys(browserMap).reduce((curr, mapKey) => {
    const mockSource = path.join(folderName, mapKey);
    const mockTarget = path.join(folderName, browserMap[mapKey]);

    return Object.assign(curr, {
      [mockSource]: mockTarget,
    });
  }, {});
}

async function processPackageFile(packageFile) {
  const text = await readFileAsync(packageFile, { encoding: 'utf8' });
  const contentJSON = JSON.parse(text);

  if (contentJSON.browser) {
    const key = packageFile.replace(BASE_PATH, MARKO_DIST).replace('/package.json', '');

    return flattenBrowserMap(key, contentJSON.browser);
  }

  return null;
}

async function filterExistingFiles(browserMap) {
  const existingModules = await Promise.all(Object.keys(browserMap).map(async (mapKey) => {
    const targetModule = path.join(NODE_MODULES_PATH, mapKey);
    const mockModule = path.join(NODE_MODULES_PATH, browserMap[mapKey]);
    const isTargeFileExisted = await fileExistsAsync(targetModule);
    const isMockFileExisted = await fileExistsAsync(mockModule);

    console.log(targetModule);
    console.log(mockModule);
    console.log(`Both files exist: ${isTargeFileExisted && isMockFileExisted ? '✅' : '❌'}`);

    return (isTargeFileExisted && isMockFileExisted) && ({
      [mapKey]: browserMap[mapKey],
    });
  }));

  return existingModules
    .filter(module => !!module)
    .reduce((curr, bMap) => Object.assign(curr, bMap), {});
}

(async function main() {
  try {
    const files = await getPackageFiles();
    const browserMaps = await Promise.all(files.map(processPackageFile));
    const mergedMap = browserMaps.filter(notNull)
      .reduce((curr, browserMap) => Object.assign(curr, browserMap), {});
    const resultMap = await filterExistingFiles(mergedMap);

    console.log('Generated module mocking map:');
    console.log(JSON.stringify(resultMap, null, 2));

    await writeJSONFile(OUTPUT_PATH, resultMap);
  } catch (err) {
    console.error('ERROR on generating map:', err);
  }
}());
