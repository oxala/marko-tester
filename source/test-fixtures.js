'use strict';

var fs = require('fs');
var path = require('path');
var Normalizer = require('html-normalizer');
var _ = require('lodash');
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
  html = html.trim();

  return (html ? normalizer().domString(html) : '');
}

function renderedHtmlFor(_testCase_) {
  var testCase = _testCase_;

  return new Promise(function (resolve, reject) {
    var callback = function (error, html) {
      if (error) {
        return reject(new Error('Failed to render html'));
      }

      if (_.isObject(html)) {
        html = html.html;
      }

      resolve(cleanRenderedHtml(html));
    };

    if (!testCase.component.renderer) {
      testCase.component.renderer = testCase.component.render;
    }

    callback.global = {};
    testCase.component.renderer(testCase.fixture, callback);
  });
}

function createTest(testCase) {
  describe('When component is rendered in "' + testCase.name + '" case', function () {
    it('should render component with a specified html', function () {
      var actualHtml = renderedHtmlFor(testCase);
      var expectedHtml = cleanRenderedHtml(testCase.expectedHtml);

      return expect(actualHtml).to.eventually.equal(expectedHtml);
    });
  });
}

module.exports = function testFixtures(component, testCasesDirectory) {
  var testCases = [];

  function buildCases(file) {
    var absPath = path.join(testCasesDirectory, file);
    var extension = path.extname(absPath);
    var testName = path.basename(absPath, '.html');

    if (extension === '.html') {
      var fixture = require(absPath.replace(/.html$/, ''));
      var expectedHtml = fs.readFileSync(absPath, 'utf-8');

      testCases.push({
        name: testName,
        fixture: fixture,
        expectedHtml: expectedHtml,
        component: component
      });
    }
  }

  fs.readdirSync(testCasesDirectory).forEach(buildCases);

  testCases.forEach(createTest);
};

module.exports.excludeAttribute = excludeAttribute;
