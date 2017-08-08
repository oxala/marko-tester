'use strict';

const mockRequire = require('mock-require');
const sinon = require('sinon');
const chai = require('chai');
const sinonChai = require('sinon-chai');

const expect = chai.expect;

chai.use(sinonChai);

describe('utils', () => {
  let mockOptimist;

  beforeEach(() => {
    delete require.cache[require.resolve('../utils2')];
    mockOptimist = {
      argv: {}
    };

    mockRequire('optimist', mockOptimist);
  });

  afterEach(() => {
    mockRequire.stopAll();
  });

  describe('options', () => {
    describe('default', () => {
      it('should create options', () => {
        expect(require('../utils2').options).to.be.deep.equal({
          lint: true,
          lintEs5: false,
          fixLint: false,
          fixFixtures: false,
          unit: true,
          coverage: true,
          acceptance: false
        });
      });
    });

    describe('es5 lint', () => {
      beforeEach(() => {
        mockOptimist.argv['lint-es5'] = true;
      });

      it('should create options', () => {
        expect(require('../utils2').options).to.be.deep.equal({
          lint: true,
          lintEs5: true,
          fixLint: false,
          fixFixtures: false,
          unit: true,
          coverage: true,
          acceptance: false
        });
      });
    });

    describe('fix lint', () => {
      beforeEach(() => {
        mockOptimist.argv['fix-lint'] = true;
      });

      it('should create options', () => {
        expect(require('../utils2').options).to.be.deep.equal({
          lint: true,
          lintEs5: false,
          fixLint: true,
          fixFixtures: false,
          unit: true,
          coverage: true,
          acceptance: false
        });
      });
    });

    describe('fix fixtures', () => {
      beforeEach(() => {
        mockOptimist.argv['fix-fixtures'] = true;
      });

      it('should create options', () => {
        expect(require('../utils2').options).to.be.deep.equal({
          lint: true,
          lintEs5: false,
          fixLint: false,
          fixFixtures: true,
          unit: true,
          coverage: true,
          acceptance: false
        });
      });
    });

    describe('acceptance', () => {
      beforeEach(() => {
        mockOptimist.argv['with-acceptance'] = true;
      });

      it('should create options', () => {
        expect(require('../utils2').options).to.be.deep.equal({
          lint: true,
          lintEs5: false,
          fixLint: false,
          fixFixtures: false,
          unit: false,
          coverage: false,
          acceptance: true
        });
      });
    });

    describe('acceptance', () => {
      beforeEach(() => {
        mockOptimist.argv['with-acceptance'] = true;
      });

      it('should create options', () => {
        expect(require('../utils2').options).to.be.deep.equal({
          lint: true,
          lintEs5: false,
          fixLint: false,
          fixFixtures: false,
          unit: false,
          coverage: false,
          acceptance: true
        });
      });
    });

    describe('without lint', () => {
      beforeEach(() => {
        mockOptimist.argv['no-lint'] = true;
      });

      it('should create options', () => {
        expect(require('../utils2').options).to.be.deep.equal({
          lint: false,
          lintEs5: false,
          fixLint: false,
          fixFixtures: false,
          unit: true,
          coverage: true,
          acceptance: false
        });
      });
    });

    describe('without unit', () => {
      beforeEach(() => {
        mockOptimist.argv['no-mocha'] = true;
      });

      it('should create options', () => {
        expect(require('../utils2').options).to.be.deep.equal({
          lint: true,
          lintEs5: false,
          fixLint: false,
          fixFixtures: false,
          unit: false,
          coverage: true,
          acceptance: false
        });
      });
    });

    describe('without coverage', () => {
      beforeEach(() => {
        mockOptimist.argv['no-coverage'] = true;
      });

      it('should create options', () => {
        expect(require('../utils2').options).to.be.deep.equal({
          lint: true,
          lintEs5: false,
          fixLint: false,
          fixFixtures: false,
          unit: true,
          coverage: false,
          acceptance: false
        });
      });
    });
  });

  describe('config', () => {
    it('should return generated config', () => {
      expect(require('../utils2').config).to.be.deep.equal(Object.assign({
        stylelint: require('stylelint-config-standard'),
        eslintEs5: require(require('path').join(__dirname, '..', '..', 'eslintrc-legacy')),
        eslint: require(require('path').join(__dirname, '..', '..', 'eslintrc-es6'))
      }, require('../../.marko-tester')));
    });
  });

  describe('get', () => {
    describe('Given requested value does exist', () => {
      it('should return found value', () => {
        expect(require('../utils2').get('options.lint')).to.be.true;
      });
    });

    describe('Given requested value does not exist', () => {
      let mockDefaultValue;

      beforeEach(() => {
        mockDefaultValue = [];
      });

      it('should return default value', () => {
        expect(require('../utils2').get('doesnotexist', mockDefaultValue)).to.be.deep.equal(mockDefaultValue);
      });
    });
  });
});
