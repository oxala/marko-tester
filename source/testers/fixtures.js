'use strict';

var Normalizer = require('html-normalizer');
var _ = require('lodash');
var chai = require('chai');
var Promise = require('bluebird');
var utils = require('../utils');
var expect = chai.expect;
var excludedAttributes = [];

function excludeAttribute(attr) {
  excludedAttributes.push(attr);
}

function normalizer() {
  var COMPARE_ALL_ATTRIBUTES_STYLES_AND_CLASSES = {
    attributes: null,
    attributesExcluded: excludedAttributes,
    styles: null,
    classNames: null
  };

  return new Normalizer(COMPARE_ALL_ATTRIBUTES_STYLES_AND_CLASSES);
}

function cleanRenderedHtml(html) {
  return (html ? normalizer().domString(html.trim()) : '');
}

function renderHtml(renderer, fixture) {
  return new Promise(function promiseRenderedHtml(resolve, reject) {
    var callback = function parseComponentRenderedHtml(error, result) {
      if (error) {
        return reject('TestFixtures: Failed to render component html.');
      }

      var html = result;

      if (_.isObject(result)) {
        html = result.html;
      }

      return resolve(cleanRenderedHtml(html));
    };

    callback.global = {};
    renderer(fixture, callback);
  });
}

function createTest(context, testCase) {
  it('should render component using ' + testCase.name + ' input', function compareRenderedHtml() {
    var actualHtml = renderHtml(context.renderer, testCase.fixture)
      .catch(function onFailedComponentRender(error) {
        throw new Error(error);
      });
    var expectedHtml = cleanRenderedHtml(testCase.expectedHtml);

    return expect(actualHtml).to.eventually.equal(expectedHtml);
  });
}

function testFixtures(context, opts) {
  var options = opts || {};

  if (!context.renderer) {
    Object.assign(context, {
      renderer: utils.getRenderer()
    });
  }

  if (!context.renderer) {
    throw new Error('TestFixtures: Cannot automatically locate renderer, please specify one.');
  }

  var testCases = [];

  var fixtures = utils.getFixtures(context);

  fixtures.forEach(function createTestCases(fixture) {
    testCases.push({
      name: fixture.testName,
      fixture: fixture.data,
      expectedHtml: fixture.expectedHtml
    });
  });

  if (context.options.fixturesPath && !testCases.length) {
    throw new Error('TestFixtures: No fixtures found in specified location');
  }

  var operation = options.mochaOperation ? describe[options.mochaOperation] : describe;

  operation('Given specific input data', function givenSpecificInputData() {
    testCases.forEach(createTest.bind(null, context));
  });
}

function testFixturesWithMochaOperation(mochaOperation, context, opts, cb) {
  var callback = cb || opts;
  var options = cb ? opts : {};

  options.mochaOperation = mochaOperation;

  testFixtures(context, options, callback);
}

module.exports = testFixtures;
module.exports.only = testFixturesWithMochaOperation.bind(null, 'only');
module.exports.skip = testFixturesWithMochaOperation.bind(null, 'skip');
module.exports.excludeAttribute = excludeAttribute;
