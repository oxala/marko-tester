'use strict';

var _ = require('lodash');
var path = require('path');
var glob = require('glob');
var chai = require('chai');
var sinon = require('sinon');
var buildPage = require('./build-page');
var buildComponent = require('./build-component');
var testFixtures = require('./test-fixtures');
var utils = require('./utils');
var expect = chai.expect;

function buildMarko(testString, opts, cb) {
  /* eslint global-require: 0 */
  var callback = cb || opts;
  var options = cb ? opts : {};

  if (!_.isString(testString)) {
    throw new Error('BuildMarko: Description should be a string.');
  }

  if (!_.isFunction(callback)) {
    throw new Error('BuildMarko: Callback should be a function.');
  }

  var operation = options.mochaOperation ? describe[options.mochaOperation] : describe;

  operation(testString, function startTestCase() {
    var testPath = utils.getTestPath();
    var renderer = options.renderer;

    if (!renderer || _.isString(renderer)) {
      var rendererPath;

      if (!renderer) {
        rendererPath = path.join(testPath, '..');
        rendererPath = glob.sync(path.resolve(rendererPath, '?(index|renderer).js'));
      } else {
        rendererPath = glob.sync(path.resolve(testPath, renderer));
      }

      if (rendererPath && rendererPath.length > 0) {
        renderer = rendererPath[0];
      }

      if (renderer) {
        /* eslint no-shadow: 0 */
        utils.generateBrowserDependencies(renderer);
        renderer = require(renderer);
      } else {
        renderer = {
          render: null
        };
      }
    }

    renderer = renderer.render || renderer;

    var context = {
      testPath: testPath,
      renderer: renderer,
      options: options,
      fixtures: {}
    };

    context.preparePage = buildPage.prepare.bind(this, context);
    context.testFixtures = testFixtures.bind(this, context);
    context.buildComponent = buildComponent.bind(this, context);
    context.buildComponent.only = buildComponent.only.bind(this, context);
    context.buildComponent.skip = buildComponent.skip.bind(this, context);
    context.buildPage = buildPage.bind(this, context);
    context.buildPage.only = buildPage.only.bind(this, context);
    context.buildPage.skip = buildPage.skip.bind(this, context);

    Object.assign(this, context);

    callback.apply(this, utils.getParamsToApply(callback, {
      expect: expect,
      sinon: sinon
    }));
  });
}

function buildMarkoWithMochaOperation(mochaOperation, testString, opts, cb) {
  var callback = cb || opts;
  var options = cb ? opts : {};

  options.mochaOperation = mochaOperation;

  buildMarko(testString, options, callback);
}

module.exports = buildMarko;
module.exports.only = buildMarkoWithMochaOperation.bind(null, 'only');
module.exports.skip = buildMarkoWithMochaOperation.bind(null, 'skip');
