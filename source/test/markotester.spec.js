'use strict';

const mockRequire = require('mock-require');
const sinon = require('sinon');
const chai = require('chai');
const sinonChai = require('sinon-chai');

const expect = chai.expect;

chai.use(sinonChai);

describe('markotester', () => {
  let mockUtils;

  beforeEach(() => {
    delete require.cache[require.resolve('../markotester')];

    mockUtils = {
      options: {
        lint: true,
        unit: true,
        acceptance: true
      }
    };

    sinon.stub(process, 'exit');

    mockRequire('../utils2', mockUtils);
  });

  afterEach(() => {
    process.exit.restore();
    mockRequire.stopAll();
  });

  describe('Given no failed steps', () => {
    let mockTestLint;
    let mockTestMocha;
    let mockTestAcceptance;
    let mockIndex;

    beforeEach(() => {
      mockTestLint = sinon.spy(done => done());
      mockTestMocha = sinon.spy((done) => done());
      mockTestAcceptance = sinon.spy((done) => done());
      mockIndex = {};

      mockRequire('../testers/lint', mockTestLint);
      mockRequire('../testers/mocha', mockTestMocha);
      mockRequire('../testers/acceptance', mockTestAcceptance);
      mockRequire('../index.es6', mockIndex);
    });

    describe('Given nothing should be skipped', () => {
      beforeEach((done) => {
        require('../markotester');
        setTimeout(done, 10);
      });

      it('should make tester globally available', () => {
        expect(global.tester).to.be.deep.equal(mockIndex);
      });

      it('should execute lint test', () => {
        expect(mockTestLint).to.be.called;
      });

      it('should execute mocha test', () => {
        expect(mockTestMocha).to.be.called;
      });

      it('should execute acceptance test', () => {
        expect(mockTestAcceptance).to.be.called;
      });

      it('should exit the process successfully', () => {
        expect(process.exit).to.be.calledWith();
      });
    });

    describe('Given lint should be skipped', () => {
      beforeEach((done) => {
        mockUtils.options.lint = false;
        require('../markotester');
        setTimeout(done, 10);
      });

      it('should execute lint test', () => {
        expect(mockTestLint).not.to.be.called;
      });

      it('should execute mocha test', () => {
        expect(mockTestMocha).to.be.called;
      });

      it('should execute acceptance test', () => {
        expect(mockTestAcceptance).to.be.called;
      });

      it('should exit the process successfully', () => {
        expect(process.exit).to.be.calledWith();
      });
    });

    describe('Given mocha should be skipped', () => {
      beforeEach((done) => {
        mockUtils.options.unit = false;
        require('../markotester');
        setTimeout(done, 10);
      });

      it('should execute lint test', () => {
        expect(mockTestLint).to.be.called;
      });

      it('should execute mocha test', () => {
        expect(mockTestMocha).not.to.be.called;
      });

      it('should execute acceptance test', () => {
        expect(mockTestAcceptance).to.be.called;
      });

      it('should exit the process successfully', () => {
        expect(process.exit).to.be.calledWith();
      });
    });

    describe('Given acceptance should be skipped', () => {
      beforeEach((done) => {
        mockUtils.options.acceptance = false;
        require('../markotester');
        setTimeout(done, 10);
      });

      it('should execute lint test', () => {
        expect(mockTestLint).to.be.called;
      });

      it('should execute mocha test', () => {
        expect(mockTestMocha).to.be.called;
      });

      it('should execute acceptance test', () => {
        expect(mockTestAcceptance).not.to.be.called;
      });

      it('should exit the process successfully', () => {
        expect(process.exit).to.be.calledWith();
      });
    });
  });

  describe('Given failed step', () => {
    let mockTestLint;
    let mockError;

    beforeEach(() => {
      mockError = 'error';
      mockTestLint = sinon.spy(done => done(mockError));

      mockRequire('../testers/lint', mockTestLint);
    });

    describe('Given only lint should be executed', () => {
      beforeEach((done) => {
        mockUtils.options.unit = false;
        mockUtils.options.acceptance = false;
        require('../markotester');
        setTimeout(done, 10);
      });

      it('should execute lint test', () => {
        expect(mockTestLint).to.be.called;
      });

      it('should exit the process with an error', () => {
        expect(process.exit).to.be.calledWith(mockError);
      });
    });
  });
});
