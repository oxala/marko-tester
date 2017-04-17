'use strict';

var mockRequire = require('mock-require');
var chai = require('chai');
var expect = chai.expect;

describe('index', function () {
  var index;
  var mockConfigure;
  var mockBuildTester;
  var mockBuildAcceptance;
  var mockTestLint;

  beforeEach(function () {
    mockConfigure = {};
    mockBuildTester = {
      only: {},
      skip: {}
    };
    mockBuildAcceptance = {
      only: {},
      skip: {}
    };
    mockTestLint = {};

    mockRequire('../configure', mockConfigure);
    mockRequire('../builders/tester', mockBuildTester);
    mockRequire('../builders/acceptance', mockBuildAcceptance);
    mockRequire('../testers/lint', mockTestLint);

    index = require('../index.es6');
  });

  it('should expose API', function () {
    expect(index).to.be.deep.equal(mockBuildTester);
    expect(index.only).to.be.deep.equal(mockBuildTester.only);
    expect(index.skip).to.be.deep.equal(mockBuildTester.skip);
    expect(index.acceptance).to.be.deep.equal(mockBuildAcceptance);
    expect(index.acceptance.only).to.be.deep.equal(mockBuildAcceptance.only);
    expect(index.acceptance.skip).to.be.deep.equal(mockBuildAcceptance.skip);
    expect(index.configure).to.be.deep.equal(mockConfigure);
    expect(index.lint).to.be.deep.equal(mockTestLint);
  });
});
