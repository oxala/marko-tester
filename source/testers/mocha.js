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
  globals: ['document', 'window', 'GLOBAL_LASSO']
});
const preRequire = (ctx) => {
  const fakeDescribe = originalDescribe => (describeText, callback) => {
    if (!ctx.firstDescribe) {
      originalDescribe(describeText, callback);

      return;
    }

    ctx.firstDescribe = false;

    if (!_.isFunction(callback) && _.isFunction(describeText)) {
      callback = describeText;
      describeText = path.relative(process.cwd(), path.resolve(utils.testPath, '..'));
    } else {
      describeText = path.relative(process.cwd(), path.resolve(utils.testPath, '..', describeText));
    }

    const context = utils.context;

    context.preparePage = testPage.prepare.bind(this, context);
    context.testFixtures = testFixtures.bind(this, context);
    context.testFixtures.only = testFixtures.only.bind(this, context);
    context.testFixtures.skip = testFixtures.skip.bind(this, context);
    context.testComponent = testComponent.bind(this, context);
    context.testComponent.only = testComponent.only.bind(this, context);
    context.testComponent.skip = testComponent.skip.bind(this, context);
    context.testPage = testPage.bind(this, context);
    context.testPage.only = testPage.only.bind(this, context);
    context.testPage.skip = testPage.skip.bind(this, context);

    originalDescribe(describeText, callback ? callback.bind(originalDescribe, {
      expect,
      sinon,
      mockRequire,
      modRequire: utils.modRequire.bind(utils),
      testFixtures: context.testFixtures,
      testComponent: context.testComponent,
      testPage: context.testPage,
      marko: context.marko,
      fixtures: context.fixtures,
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
    }) : undefined);
  };

  const originalDescribeOnly = ctx.describe.only;
  const originalDescribeSkip = ctx.describe.skip;

  ctx.firstDescribe = true;
  ctx.describe = fakeDescribe(ctx.describe);
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
