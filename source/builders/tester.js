'use strict';

var _ = require('lodash');
var path = require('path');
var chai = require('chai');
var sinon = require('sinon');
var mockRequire = require('mock-require');
var rewire = require('rewire');
var buildPage = require('./page');
var buildComponent = require('./component');
var buildAcceptance = require('./acceptance');
var testFixtures = require('../testers/fixtures');
var utils = require('../utils');
var expect = chai.expect;

function buildTester(testString, opts, cb) {
  /* eslint global-require: 0 */
  var callback = cb || opts;
  var options = cb ? opts : {};

  if (!_.isString(testString)) {
    throw new Error('buildTester: Description should be a string.');
  }

  if (!_.isFunction(callback)) {
    throw new Error('buildTester: Callback should be a function.');
  }

  options.mochaOperation(testString, function startTestCase() {
    /* eslint no-shadow: 0 */

    var context = {
      testPath: utils.getTestPath(),
      options: options,
      fixtures: {}
    };

    utils.getFixtures(context);

    if (utils.getHelpers().withAcceptance) {
      this.timeout(60000);

      before(buildAcceptance.setup);
      after(buildAcceptance.teardown);
    }

    if (options.renderer) {
      context.renderer = utils.getRenderer(options);
    }

    function resolveLocalFile(filePath) {
      return path.resolve(context.testPath, filePath);
    }

    function patchRewire(filePath) {
      var file = filePath;

      if (file[0] !== '.') {
        try {
          require.resolve(file);
        } catch (e) {
          file = resolveLocalFile(file);
        }
      } else {
        file = resolveLocalFile(file);
      }

      return rewire(file);
    }

    context.preparePage = buildPage.prepare.bind(this, context);
    context.testFixtures = testFixtures.bind(this, context);
    context.testFixtures.only = testFixtures.only.bind(this, context);
    context.testFixtures.skip = testFixtures.skip.bind(this, context);
    context.buildComponent = buildComponent.bind(this, context);
    context.buildComponent.only = buildComponent.only.bind(this, context);
    context.buildComponent.skip = buildComponent.skip.bind(this, context);
    context.buildPage = buildPage.bind(this, context);
    context.buildPage.only = buildPage.only.bind(this, context);
    context.buildPage.skip = buildPage.skip.bind(this, context);

    Object.assign(this, context);

    callback.apply(this, utils.getParamsToApply(callback, {
      expect: expect,
      sinon: sinon,
      rewire: patchRewire,
      mockRequire: mockRequire,
      browser: buildAcceptance
    }));
  });
}

module.exports = utils.runWithMochaOperation.bind(null, null, buildTester);
module.exports.only = utils.runWithMochaOperation.bind(null, 'only', buildTester);
module.exports.skip = utils.runWithMochaOperation.bind(null, 'skip', buildTester);
