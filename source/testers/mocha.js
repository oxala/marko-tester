'use strict';

const path = require('path');
const glob = require('glob');
const Mocha = require('mocha');
const args = require('optimist').argv;
const utils = require('../utils');
const coverage = require('./coverage');
const _ = require('lodash');
const chai = require('chai');
const sinon = require('sinon');
const mockRequire = require('mock-require');
const testPage = require('./page');
const testComponent = require('./component');
const testFixtures = require('./fixtures');
const rewire = require('rewire');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(sinonChai);
chai.use(chaiAsPromised);

const expect = chai.expect;
const mocha = new Mocha({
  ui: 'bdd',
  reporter: 'mocha-multi-reporters',
  useInlineDiffs: true,
  grep: args.grep,
  ignoreLeaks: false,
  timeout: utils.config.componentTimeout,
  reporterOptions: {
    reporterEnabled: 'mocha-junit-reporter, spec',
    mochaJunitReporterReporterOptions: {
      mochaFile: `./${utils.config.coverage.dest}/junit.xml`
    }
  },
  globals: ['document', 'window', 'GLOBAL_LASSO', '$W10NOOP']
});
const preRequire = (ctx) => {
  const fakeDescribe = (originalDescribe, testType) => (describeText, options, callback) => {
    if (!ctx.firstDescribe && !(/^(component|fixtures|page)$/.test(testType))) {
      originalDescribe(describeText, options);

      return;
    }

    if (_.isFunction(describeText)) {
      callback = describeText;
      options = {};
      describeText = undefined;
    } else if (_.isObject(describeText)) {
      callback = options;
      options = describeText;
      describeText = undefined;
    }

    if (_.isFunction(options)) {
      callback = options;
      options = {};
    }

    ctx.firstDescribe = false;

    const context = utils.context;

    context.preparePage = testPage.prepare.bind(this, context);

    if (testType === 'fixtures') {
      testFixtures(originalDescribe, context, options);

      return;
    }

    if (testType === 'component') {
      testComponent(originalDescribe, context, describeText, options, callback);

      return;
    }

    if (testType === 'page') {
      testPage(originalDescribe, context, describeText, options, callback);

      return;
    }

    if (!describeText) {
      describeText = path.relative(process.cwd(), path.resolve(utils.testPath, '..', utils.testFileName));
    } else {
      describeText = path.relative(process.cwd(), path.resolve(utils.testPath, '..', describeText));
    }

    originalDescribe(describeText, callback ? () => {
      if (utils.renderer.renderToString && !_.isEmpty(utils.context.fixtures) && utils.testFileName === 'index') {
        testFixtures(it, context, options);
      }

      beforeEach(() => {
        Object.keys(require.cache).forEach(key => (delete require.cache[key]));
      });

      after(() => {
        mockRequire.stopAll();
      });

      context.testPath = utils.testPath;

      callback({
        expect,
        sinon,
        mockRequire,
        modRequire: utils.modRequire.bind(utils),
        fixtures: context.fixtures,
        customEvent: (eventName) => {
          const customEvent = document.createEvent('Event');
          customEvent.initEvent(eventName, true, true);
          return customEvent;
        },
        rewire: (filePath) => {
          let file = filePath;

          if (file[0] !== '.') {
            try {
              require.resolve(file);
            } catch (e) {
              file = path.resolve(context.testPath, file);
            }
          } else {
            file = path.resolve(context.testPath, file);
          }

          return rewire(file);
        },
        defer: () => {
          let resolve;
          let reject;
          const promise = new Promise((res, rej) => {
            resolve = res;
            reject = rej;
          });

          return {
            promise,
            resolve,
            reject
          };
        }
      });
    } : undefined);
  };

  const originalDescribeOnly = ctx.describe.only;
  const originalDescribeSkip = ctx.describe.skip;

  ctx.firstDescribe = true;
  ctx.describe = fakeDescribe(ctx.describe);
  ctx.describe.fixtures = fakeDescribe(it, 'fixtures');
  ctx.describe.fixtures.only = fakeDescribe(it.only, 'fixtures');
  ctx.describe.fixtures.skip = fakeDescribe(it.skip, 'fixtures');
  ctx.describe.component = fakeDescribe(ctx.describe, 'component');
  ctx.describe.component.only = fakeDescribe(originalDescribeOnly, 'component');
  ctx.describe.component.skip = fakeDescribe(originalDescribeSkip, 'component');
  ctx.describe.page = fakeDescribe(ctx.describe, 'page');
  ctx.describe.page.only = fakeDescribe(originalDescribeOnly, 'page');
  ctx.describe.page.skip = fakeDescribe(originalDescribeSkip, 'page');
  ctx.describe.only = fakeDescribe(originalDescribeOnly);
  ctx.describe.skip = fakeDescribe(originalDescribeSkip);
};

module.exports = (done) => {
  utils.configure();

  if (utils.options.coverage) {
    coverage.initializeServer();
  }

  mocha.suite.on('pre-require', preRequire);

  utils.sourcePaths.forEach(sourcePath =>
    glob.sync(path.resolve(
      utils.config.rootPath,
      sourcePath,
      '**/*.spec?(.es5)?(.es6).js'
    )).forEach(testFile => mocha.addFile(testFile))
  );

  mocha.run(failures => done(failures));
};

module.exports.preRequire = preRequire;
