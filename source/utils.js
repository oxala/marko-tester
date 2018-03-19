/* eslint no-dynamic-require: 0 */

'use strict';

const path = require('path');
const fs = require('fs');
const _ = require('lodash');
const argv = require('optimist').argv;
const glob = require('glob');
const tryRequire = require('try-require');
const stackTrace = require('stack-trace');
const stylelint = require('stylelint-config-standard');
const defaultConfig = require('../.marko-tester.js');

const rootPackageInfo = require(`${process.cwd()}/package`);
const eslintEs5 = require(path.join(__dirname, '..', 'eslintrc-legacy'));
const eslint = require(path.join(__dirname, '..', 'eslintrc-es6'));

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
  markoCompiler = require(path.join(rootPath, 'node_modules/marko/compiler'));
} catch (e) {
  markoCompiler = require('marko/compiler');
}

try {
  require(path.join(rootPath, 'node_modules/marko/node-require'))
    .install();
} catch (e) {
  require('marko/node-require')
    .install();
}

try {
  markoPackageInfo = require(path.join(rootPath, 'node_modules/marko/package'));
} catch (e) {
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
      lint: (argv.lint === undefined || argv.lint),
      lintEs5: argv['lint-es5'],
      fixLint: argv['fix-lint'] || argv.fix,
      fixFixtures: argv['fix-fixtures'] || argv.fix,
      unit: (argv.mocha === undefined || argv.mocha),
      coverage: (argv.coverage === undefined || argv.coverage),
      integration: argv.integration
    };
  },

  get config() {
    return _.defaultsDeep(
      config,
      tryRequire(path.join(rootPath, '.marko-tester')) || {},
      defaultConfig
    );
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

      const dependencyPath = path.relative(
        __dirname,
        path.isAbsolute(dependency) ? dependency : path.join(rootPath, dependency)
      );

      config.dependencies.push(`require: ${dependencyPath}`);
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
    let rendererPath = glob.sync(path.resolve(
      path.join(this.testPath, '..'),
      'index.@(marko|js)'
    )).sort(f1 => !(/marko$/.test(f1)));
    let renderer;

    if (rendererPath && rendererPath.length > 0) {
      renderer = rendererPath[0];
    }

    if (renderer) {
      renderer = require(renderer);

      if (!renderer.renderToString) {
        renderer.renderToString = renderer.render;
      }
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

      if (/^.*\.(spec|integration)(\.es6)?(\.es5)?\.js$/.test(fileName)) {
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
              const absPath = path.join(fixturesPath, file);
              const extension = path.extname(absPath);
              const testName = path.basename(absPath, '.html');

              if (extension === '.html') {
                const fixture = require(absPath.replace(/.html$/, ''));
                const expectedHtml = fs.readFileSync(absPath, 'utf-8');

                fixturesData.push({
                  testName,
                  absPath,
                  expectedHtml,
                  data: fixture
                });
              }
            });
        } catch (error) {
          throw new Error(`Tester: Cannot read fixtures folder/file. ${error}`);
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

  addBrowserDependency(markoPath) {
    if (!markoPath) {
      markoPath = path.resolve(this.testPath, '..', 'index.marko');
    }

    if (!fs.existsSync(markoPath)) {
      markoPath = path.resolve(this.testPath, '..', 'index.js');
    }

    if (fs.existsSync(markoPath)) {
      config.dependencies.push(`require: ${markoPath}`);
    }

    return path.relative(rootPath, markoPath);
  },

  mockBrowser(mocks) {
    const mockRequirePaths = mocks.require || {};

    Object.keys(mockRequirePaths)
      .forEach((filePath) => {
        const mock = mockRequirePaths[filePath];
        const mod = this.getStaticModule(
          filePath,
          this.testPath,
          `BuildComponent: Cannot resolve module to mock require for - ${filePath}`
        );

        let cachedMod = window.require.cache[mod];

        if (!cachedMod) {
          window.require(mod);
          cachedMod = window.require.cache[mod];
        }

        cachedMod.originalExports = cachedMod.exports;
        cachedMod.exports = mock;
      });

    if (mocks.component) {
      const originalGetComponent = window.require(`/${this.config.markoBundleName}/src/components/Component`).prototype.getComponent;

      window.require(`/${this.config.markoBundleName}/src/components/Component`).prototype.originalGetComponent = originalGetComponent;

      window.require(`/${this.config.markoBundleName}/src/components/Component`).prototype.getComponent = (id, index) =>
        mocks.component[id] || originalGetComponent.call(originalGetComponent, id, index);
    }
  },

  unmockBrowser(context, mock) {
    const mockRequirePaths = mock.require || {};

    Object.keys(mockRequirePaths)
      .forEach((filePath) => {
        const mod = this.getStaticModule(
          filePath,
          this.testPath,
          `BuildComponent: Cannot resolve module to mock require for - ${filePath}`
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
    const isAbsolute = path.isAbsolute(file);
    let pkgInfo;

    if (!isAbsolute && file[0] !== '.') {
      const fileArray = file.split('/');

      try {
        const modulePath = path.resolve(rootPath, 'node_modules', fileArray[0]);
        fs.lstatSync(modulePath);
        pkgInfo = require(path.join(modulePath, 'package'));
        file = fileArray.splice(1)
          .join('/') || pkgInfo.main.split('.')[0];
      } catch (errorNodeModule) {
        try {
          fs.lstatSync(path.resolve(rootPath, fileArray[0]));
        } catch (errorFile) {
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

    let mod = `/${path.join(pkgInfo, file)}`;

    if (/^win/.test(process.platform)) {
      mod = mod.replace(/\\/g, '/');
    }

    return mod;
  },

  modRequire(modPath) {
    let mod = this.getStaticModule(
      modPath,
      this.testPath,
      `Cannot require static module - ${modPath}`
    );

    try {
      mod = window.$_mod.require(mod, null, true);
    } catch (e) {
      throw e;
    }

    return mod;
  },

  get context() {
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
      }
    };
  }
};
