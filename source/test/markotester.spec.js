'use strict';

var mockRequire = require('mock-require');
var sinon = require('sinon');
var chai = require('chai');
var sinonChai = require('sinon-chai');
var expect = chai.expect;

chai.use(sinonChai);

describe('markotester', function () {
  var mockUtils;
  var mockGetHelpers;

  beforeEach(function () {
    mockGetHelpers = {
      withLint: true,
      withMocha: true,
      withAcceptance: true
    };
    mockUtils = {
      getHelpers: sinon.stub()
    };

    sinon.stub(process, 'exit');

    mockRequire('../utils', mockUtils);
  });

  afterEach(function () {
    process.exit.restore();
    delete require.cache[require.resolve('../markotester')];
    mockRequire.stopAll();
  });

  describe('Given no failed steps', function () {
    var mockTestLint;
    var mockTestMocha;
    var mockTestAcceptance;

    beforeEach(function () {
      mockTestLint = sinon.spy(function (done) {
        done();
      });
      mockTestMocha = sinon.spy(function (done) {
        done();
      });
      mockTestAcceptance = sinon.spy(function (done) {
        done();
      });

      mockRequire('../testers/lint', mockTestLint);
      mockRequire('../testers/mocha', mockTestMocha);
      mockRequire('../testers/acceptance', mockTestAcceptance);
    });

    describe('Given nothing should be skipped', function () {
      beforeEach(function (done) {
        mockUtils.getHelpers.returns(mockGetHelpers);
        require('../markotester');
        setTimeout(done, 10);
      });

      it('should execute lint test', function () {
        expect(mockTestLint).to.be.called;
      });

      it('should execute mocha test', function () {
        expect(mockTestMocha).to.be.called;
      });

      it('should execute acceptance test', function () {
        expect(mockTestAcceptance).to.be.called;
      });

      it('should exit the process successfully', function () {
        expect(process.exit).to.be.calledWith();
      });
    });

    describe('Given lint should be skipped', function () {
      beforeEach(function (done) {
        mockGetHelpers.withLint = false;
        mockUtils.getHelpers.returns(mockGetHelpers);
        require('../markotester');
        setTimeout(done, 10);
      });

      it('should execute lint test', function () {
        expect(mockTestLint).not.to.be.called;
      });

      it('should execute mocha test', function () {
        expect(mockTestMocha).to.be.called;
      });

      it('should execute acceptance test', function () {
        expect(mockTestAcceptance).to.be.called;
      });

      it('should exit the process successfully', function () {
        expect(process.exit).to.be.calledWith();
      });
    });

    describe('Given mocha should be skipped', function () {
      beforeEach(function (done) {
        mockGetHelpers.withMocha = false;
        mockUtils.getHelpers.returns(mockGetHelpers);
        require('../markotester');
        setTimeout(done, 10);
      });

      it('should execute lint test', function () {
        expect(mockTestLint).to.be.called;
      });

      it('should execute mocha test', function () {
        expect(mockTestMocha).not.to.be.called;
      });

      it('should execute acceptance test', function () {
        expect(mockTestAcceptance).to.be.called;
      });

      it('should exit the process successfully', function () {
        expect(process.exit).to.be.calledWith();
      });
    });

    describe('Given acceptance should be skipped', function () {
      beforeEach(function (done) {
        mockGetHelpers.withAcceptance = false;
        mockUtils.getHelpers.returns(mockGetHelpers);
        require('../markotester');
        setTimeout(done, 10);
      });

      it('should execute lint test', function () {
        expect(mockTestLint).to.be.called;
      });

      it('should execute mocha test', function () {
        expect(mockTestMocha).to.be.called;
      });

      it('should execute acceptance test', function () {
        expect(mockTestAcceptance).not.to.be.called;
      });

      it('should exit the process successfully', function () {
        expect(process.exit).to.be.calledWith();
      });
    });
  });

  describe('Given failed step', function () {
    var mockTestLint;
    var mockError;

    beforeEach(function () {
      mockError = 'error';
      mockTestLint = sinon.spy(function (done) {
        done(mockError);
      });

      mockRequire('../testers/lint', mockTestLint);
    });

    describe('Given only lint should be executed', function () {
      beforeEach(function (done) {
        mockGetHelpers.withMocha = false;
        mockGetHelpers.withAcceptance = false;
        mockUtils.getHelpers.returns(mockGetHelpers);
        require('../markotester');
        setTimeout(done, 10);
      });

      it('should execute lint test', function () {
        expect(mockTestLint).to.be.called;
      });

      it('should exit the process with an error', function () {
        expect(process.exit).to.be.calledWith(mockError);
      });
    });
  });
});
