'use strict';

const path = require('path');
const fs = require('fs');
const _ = require('lodash');
const argv = require('optimist')
  .argv;
const glob = require('glob');
const tryRequire = require('try-require');
const stackTrace = require('stack-trace');
const eslintEs5 = require(path.join(__dirname, '..', 'eslintrc-legacy'));
const eslint = require(path.join(__dirname, '..', 'eslintrc-es6'));
const stylelint = require('stylelint-config-standard');
const defaultConfig = require('../.marko-tester.js');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const rootPackageInfo = require(`${process.cwd()}/package`);

const rootPath = process.cwd();
const config = {
  stylelint,
  eslintEs5,
  eslint,
  rootPath,
  dependencies: [
    `require-run: ${path.join(__dirname, 'get-require')}`
  ],
  outputPath: path.join(__dirname, '..', 'static'),
  bundleName: `${rootPackageInfo.name}$${rootPackageInfo.version}`
};
let markoCompiler;
let markoPackageInfo;

try {
  /* eslint global-require: 0 */

  markoCompiler = require(path.join(rootPath, 'node_modules/marko/compiler'));
} catch (e) {
  /* eslint global-require: 0 */

  markoCompiler = require('marko/compiler');
}

try {
  /* eslint global-require: 0 */

  require(path.join(rootPath, 'node_modules/marko/node-require'))
    .install();
} catch (e) {
  /* eslint global-require: 0 */

  require('marko/node-require')
    .install();
}

try {
  /* eslint global-require: 0 */

  markoPackageInfo = require(path.join(rootPath, 'node_modules/marko/package'));
} catch (e) {
  /* eslint global-require: 0 */

  markoPackageInfo = require('marko/package');
}

markoCompiler.defaultOptions.writeToDisk = false;
markoCompiler.defaultOptions.ignoreUnrecognizedTags = true;
markoCompiler.defaultOptions.escapeAtTags = true;

config.markoBundleName = `${markoPackageInfo.name}$${markoPackageInfo.version}`;
config.markoCompiler = markoCompiler;

module.exports = {
  get options() {
    return {
      lint: (argv['lint'] === undefined || argv['lint']),
      lintEs5: argv['lint-es5'],
      fixLint: argv['fix-lint'],
      fixFixtures: argv['fix-fixtures'],
      unit: !argv['with-acceptance'] && (argv['mocha'] === undefined || argv['mocha']),
      coverage: !argv['with-acceptance'] && (argv['coverage'] === undefined || argv['coverage']),
      acceptance: argv['with-acceptance']
    };
  },

  get config() {
    let configuration = tryRequire(path.join(rootPath, '.marko-tester')) || {};

    return _.defaultsDeep(config, defaultConfig, configuration);
  },

  get(namespace, defaultValue) {
    return _.get(this, namespace, defaultValue);
  },

  get sourcePaths() {
    return argv._;
  },

  get testPaths() {
    return this.sourcePaths.map((sourcePath) => {
      const parsedPath = path.parse(sourcePath);
      let testPath;

      if (parsedPath.ext) {
        testPath = path.join(sourcePath, '..');
      }

      if (sourcePath === '.') {
        testPath = path.join(sourcePath, 'test');
      } else {
        testPath = path.join(sourcePath, '**', 'test', '*.spec.js');
      }

      return testPath;
    });
  },

  configure() {
    this.config.components.forEach((dependency) => {
      if (_.isObject(dependency)) {
        config.dependencies.push(dependency);
        return;
      }

      let dependencyPath = path.isAbsolute(dependency) ? dependency : path.join(rootPath, dependency);

      dependencyPath = path.relative(__dirname, dependencyPath);

      config.dependencies.push('require: ' + dependencyPath);
    });

    this.config.taglibExcludeDirs.forEach(dirPath =>
      markoCompiler.taglibFinder.excludeDir(
        path.resolve(rootPath, dirPath)
      )
    );

    this.config.taglibExcludePackages.forEach(
      packageName => markoCompiler.taglibFinder.excludePackage(packageName)
    );
  },

  get renderer() {
    /* eslint global-require: 0 */

    let rendererPath = glob.sync(path.resolve(
      path.join(this.testPath, '..'),
      'index.marko'
    ));
    let renderer;

    if (rendererPath && rendererPath.length > 0) {
      renderer = rendererPath[0];
    }

    if (renderer) {
      renderer = require(renderer);
    } else {
      renderer = {
        renderToString: null
      };
    }

    return renderer;
  },

  get testPath() {
    if (!this.stackTraceArray) {
      this.stackTraceArray = stackTrace.get();
    }

    const trace = this.stackTraceArray.shift();

    if (trace) {
      const fileName = trace.getFileName();

      if (/^.*\.spec(\.es6)?(\.es5)?\.js$/.test(fileName)) {
        this.stackTraceArray = null;

        return path.resolve(fileName, '..');
      }

      return this.testPath;
    }

    this.stackTraceArray = null;

    return null;
  },

  get fixturesData() {
    const fixturesData = [];
    const dirsToCheck = [
      'fixtures'
    ];

    dirsToCheck.forEach((dirToCheck) => {
      const fixturesPath = path.join(this.testPath, dirToCheck);

      if (fs.existsSync(fixturesPath)) {
        try {
          fs.readdirSync(fixturesPath)
            .forEach((file) => {
              /* eslint global-require: 0 */

              const absPath = path.join(fixturesPath, file);
              const extension = path.extname(absPath);
              const testName = path.basename(absPath, '.html');

              if (extension === '.html') {
                const fixture = require(absPath.replace(/.html$/, ''));
                const expectedHtml = fs.readFileSync(absPath, 'utf-8');

                fixturesData.push({
                  testName: testName,
                  absPath: absPath,
                  expectedHtml: expectedHtml,
                  data: fixture
                });
              }
            });
        } catch (error) {
          throw new Error('Tester: Cannot read fixtures folder/file. ' + error);
        }
      }
    });

    return fixturesData;
  },

  runWithMochaOperation(mochaOperation, func, context, opts, cb) {
    const callback = cb || opts;
    const options = cb ? opts : {};

    options.mochaOperation = mochaOperation ? describe[mochaOperation] : describe;

    func(context, options, callback);
  },

  prepareBrowserJson(dependencies) {
    if (!dependencies && !dependencies.length) {
      return;
    }

    var dependenciesArray = dependencies;

    if (!_.isArray(dependencies)) {
      dependenciesArray = [dependencies];
      dependenciesArray = dependenciesArray.concat(glob.sync(path.resolve(dependencies, '..', 'component.js')));
    }

    dependenciesArray.forEach(function resolveDependency(component) {
      if (_.isObject(component)) {
        helpers.rendererPaths.push(component);
      } else {
        var componentPath = path.isAbsolute(component) ? component : path.join(rootPath, component);

        componentPath = path.relative(__dirname, componentPath);

        helpers.rendererPaths.push('require: ' + componentPath);
      }
    });
  },

  addBrowserDependency(markoPath) {
    if (!markoPath) {
      markoPath = path.resolve(this.testPath, '..', 'index.marko');
    }

    if (fs.existsSync(markoPath)) {
      config.dependencies.push(`require: ${markoPath}`);
    }

    return path.relative(rootPath, markoPath);
  },

  mockBrowser(context, mock) {
    const mockRequirePaths = mock.require || {};

    Object.keys(mockRequirePaths)
      .forEach((filePath) => {
        const mock = mockRequirePaths[filePath];
        const mod = this.getStaticModule(
          filePath,
          this.testPath,
          'BuildComponent: Cannot resolve module to mock require for - ' + filePath
        );

        let cachedMod = window.require.cache[mod];

        if (!cachedMod) {
          window.require(mod);
          cachedMod = window.require.cache[mod];
        }

        cachedMod.originalExports = cachedMod.exports;
        cachedMod.exports = mock;
      });

    if (mock.component) {
      const mockedComponents = mock.component || {};
      const originalGetComponent = window.require(`/${this.config.markoBundleName}/src/components/Component`).prototype.getComponent;

      window.require(`/${this.config.markoBundleName}/src/components/Component`).prototype.originalGetComponent = originalGetComponent;

      window.require(`/${this.config.markoBundleName}/src/components/Component`).prototype.getComponent = (id, index) => {
        return mock.component[id] || originalGetComponent.call(originalGetComponent, id, index);
      };
    }
  },

  unmockBrowser(context, mock) {
    const mockRequirePaths = mock.require || {};

    Object.keys(mockRequirePaths)
      .forEach((filePath) => {
        const mod = this.getStaticModule(
          filePath,
          this.testPath,
          'BuildComponent: Cannot resolve module to mock require for - ' + filePath
        );
        const cachedMod = window.require.cache[mod];

        cachedMod.exports = cachedMod.originalExports;
        delete cachedMod.originalExports;
      });

    if (mock.component) {
      window.require(`/${this.config.markoBundleName}/src/components/Component`).prototype.getComponent = window.require(`/${this.config.markoBundleName}/src/components/Component`).prototype.originalGetComponent;
      delete window.require(`/${this.config.markoBundleName}/src/components/Component`).prototype.originalGetComponent;
    }
  },

  getStaticModule(file, testPath, errorMessage) {
    var pkgInfo;
    var isAbsolute = path.isAbsolute(file);

    if (!isAbsolute && file[0] !== '.') {
      var fileArray = file.split('/');

      try {
        var modulePath = path.resolve(rootPath, 'node_modules', fileArray[0]);
        fs.lstatSync(modulePath);
        pkgInfo = require(path.join(modulePath, 'package'));
        file = fileArray.splice(1)
          .join('/') || pkgInfo.main.split('.')[0];
      } catch (errorNodeModule) {
        try {
          var moduleFilePath = path.resolve(rootPath, fileArray[0]);
          fs.lstatSync(moduleFilePath);
        } catch (errorFile) {
          /* eslint no-console: 0 */
          console.error(errorMessage);
        }
      }
    } else if (!isAbsolute) {
      file = path.resolve(testPath, file)
        .replace(rootPath, '');
    }

    if (!pkgInfo) {
      pkgInfo = rootPackageInfo;
    }

    pkgInfo = [
      pkgInfo.name,
      '$',
      pkgInfo.version
    ].join('');

    var mod = '/' + path.join(pkgInfo, file);

    if (/^win/.test(process.platform)) {
      mod = mod.replace(/\\/g, '/');
    }

    return mod;
  },

  modRequire(modPath) {
    var mod = this.getStaticModule(
      modPath,
      this.testPath,
      'Cannot require static module - ' + modPath
    );

    try {
      mod = window.$_mod.require(mod, null, true);
    } catch (e) {
      throw e;
    }

    return mod;
  },

  get context() {
    const markoPath = this.addBrowserDependency();
    const modulePath = this.getStaticModule(markoPath);
    const fixtures = {};

    this.fixturesData.forEach((fixture) => {
      fixtures[fixture.testName] = fixture.data;
    });

    return {
      testPath: this.testPath,
      fixturesData: this.fixturesData,
      fixtures,
      marko: {
        require: this.modRequire.bind(this)
      },
      modulePath
    };
  },

  createParams(fn, context) {
    const paramString = fn.toString()
      .match(/(function)?(\s*)?(\()?([^)=]*)/)[4];
    const paramList = paramString.split(',')
      .map(key => context[key.trim()]);

    return paramList;
  },
};
