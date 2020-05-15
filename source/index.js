'use strict';

const testLint = require('./testers/lint');
const _ = require('lodash');
const chai = require('chai');
const sinon = require('sinon');
const mockRequire = require('mock-require');
const testPage = require('./testers/page');
const testComponent = require('./testers/component');
const testFixtures = require('./testers/fixtures');
const rewire = require('rewire');
const path = require('path');
const utils = require('./utils');

require('app-module-path')
  .addPath(path.resolve(utils.config.rootPath));

const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(sinonChai);
chai.use(chaiAsPromised);

const expect = chai.expect;
const buildTester = (testString, opts, cb) => {
  const callback = cb || opts;
  const options = cb ? opts : {};

  if (!_.isString(testString)) {
    throw new Error('buildTester: Description should be a string.');
  }

  if (!_.isFunction(callback)) {
    throw new Error('buildTester: Callback should be a function.');
  }

  options.mochaOperation(testString, () => {
    const context = utils.context;

    context.options = options;

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

    callback(...utils.createParams(callback, {
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
    }));
  });
};

module.exports = utils.runWithMochaOperation.bind(null, null, buildTester);
module.exports.only = utils.runWithMochaOperation.bind(null, 'only', buildTester);
module.exports.skip = utils.runWithMochaOperation.bind(null, 'skip', buildTester);
module.exports.lint = testLint;
