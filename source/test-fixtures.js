'use strict';

var fs = require('fs');
var path = require('path');
var Normalizer = require('html-normalizer');
var _ = require('lodash');
var chai = require('chai');
var Promise = require('bluebird');
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

function testFixtures(context) {
  if (!context.renderer) {
    throw new Error('TestFixtures: Cannot automatically locate renderer, please specify one.');
  }

  /* eslint global-require: 0 */
  var testCases = [];
  var fixtures = {};
  var dirsToCheck = [
    'fixtures'
  ];

  if (context.options.fixturesPath) {
    dirsToCheck = [context.options.fixturesPath];
  }

  function buildCases(fixturesPath, file) {
    var absPath = path.join(fixturesPath, file);
    var extension = path.extname(absPath);
    var testName = path.basename(absPath, '.html');

    if (extension === '.html') {
      var fixture = require(absPath.replace(/.html$/, ''));
      var expectedHtml = fs.readFileSync(absPath, 'utf-8');

      fixtures[testName] = fixture;

      testCases.push({
        name: testName,
        fixture: fixture,
        expectedHtml: expectedHtml
      });
    }
  }

  dirsToCheck.forEach(function getFixturePairs(dirToCheck) {
    var fixturesPath = path.join(context.testPath, dirToCheck);

    try {
      fs.readdirSync(fixturesPath).forEach(buildCases.bind(null, fixturesPath));
    } catch (error) {
      throw new Error('TestFixtures: Cannot read fixtures folder.', error);
    }
  });

  Object.assign(context.fixtures, fixtures);

  if (context.options.fixturesPath && !testCases.length) {
    throw new Error('TestFixtures: No fixtures found in specified location');
  }

  describe('Given specific input data', function givenSpecificInputData() {
    testCases.forEach(createTest.bind(null, context));
  });
}

module.exports = testFixtures;
module.exports.excludeAttribute = excludeAttribute;
