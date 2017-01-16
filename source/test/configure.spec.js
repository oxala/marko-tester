'use strict';

var mockRequire = require('mock-require');
var sinon = require('sinon');
var chai = require('chai');
var sinonChai = require('sinon-chai');
var expect = chai.expect;

chai.use(sinonChai);

describe('configure', function () {
  var mockUtils;
  var mockGetHelpers;
  var mockTestFixtures;
  var mockCoverage;
  var mockRootPath;
  var mockAppModulePath;
  var mockMarko;
  var mockChai;
  var mockChaiAsPromised;
  var mockSinonChai;

  beforeEach(function () {
    mockRootPath = process.cwd();
    mockAppModulePath = {
      addPath: sinon.spy()
    };
    mockGetHelpers = {
      withCoverage: true,
      rootPath: mockRootPath
    };
    mockUtils = {
      setHelpers: sinon.spy(),
      getHelpers: sinon.stub().returns(mockGetHelpers),
      generateBrowserDependencies: sinon.spy()
    };
    mockTestFixtures = {
      excludeAttribute: sinon.spy()
    };
    mockCoverage = {
      initialize: sinon.spy()
    };
    mockMarko = {
      compiler: {
        defaultOptions: {},
        taglibFinder: {
          excludeDir: sinon.spy(),
          excludePackage: sinon.spy()
        }
      },
      nodeRequire: {
        install: sinon.spy()
      }
    };
    mockChai = {
      use: sinon.spy()
    };
    mockChaiAsPromised = {};
    mockSinonChai = {};

    mockRequire('../utils', mockUtils);
    mockRequire('app-module-path', mockAppModulePath);
    mockRequire('../testers/fixtures', mockTestFixtures);
    mockRequire('../testers/coverage', mockCoverage);
    mockRequire(process.cwd() + '/node_modules/marko/compiler', mockMarko.compiler);
    mockRequire(process.cwd() + '/node_modules/marko/node-require', mockMarko.nodeRequire);
    mockRequire('chai', mockChai);
    mockRequire('chai-as-promised', mockChaiAsPromised);
    mockRequire('sinon-chai', mockSinonChai);
  });

  describe('Given marko is not installed from within root', function () {
    beforeEach(function () {
      mockGetHelpers.rootPath = '/';

      mockRequire('marko/compiler', mockMarko.compiler);
      mockRequire('marko/node-require', mockMarko.nodeRequire);

      require('../configure')({});
    });

    afterEach(function () {
      delete require.cache[require.resolve('../configure')];
    });

    it('should allow marko files to be required', function () {
      expect(mockMarko.nodeRequire.install).to.be.calledWith();
    });

    it('should not write marko templates to into the files', function () {
      expect(mockMarko.compiler.defaultOptions).to.be.deep.equal({
        writeToDisk: false
      });
    });
  });

  describe('Given user config', function () {
    var mockConfig;
    var mockExcludeDir;
    var mockExcludePackage;
    var mockExcludeAttribute;

    beforeEach(function () {
      mockExcludeDir = '/';
      mockExcludePackage = 'excludePackage';
      mockExcludeAttribute = 'HELLO';
      mockConfig = {
        taglibExcludeDirs: [mockExcludeDir],
        taglibExcludePackages: [mockExcludePackage],
        excludedAttributes: [mockExcludeAttribute],
        components: {},
        onInit: sinon.spy(),
        onDestroy: sinon.spy()
      };

      require('../configure')(mockConfig);
    });

    afterEach(function () {
      delete require.cache[require.resolve('../configure')];
    });

    it('should add root path to app module path module', function () {
      expect(mockAppModulePath.addPath).to.be.calledWith(mockRootPath);
    });

    it('should allow marko files to be required', function () {
      expect(mockMarko.nodeRequire.install).to.be.calledWith();
    });

    it('should not write marko templates to into the files', function () {
      expect(mockMarko.compiler.defaultOptions).to.be.deep.equal({
        writeToDisk: false
      });
    });

    it('should setup chai', function () {
      expect(mockChai.use).to.be.calledWith(mockSinonChai);
      expect(mockChai.use).to.be.calledWith(mockChaiAsPromised);
    });

    it('should merge user`s config with default', function () {
      expect(mockUtils.setHelpers).to.be.calledWith('config', mockConfig);
    });

    it('should generate browser dependencies based on user`s config', function () {
      expect(mockUtils.generateBrowserDependencies).to.be.calledWith(mockConfig.components);
    });

    it('should exclude directory with marko.json', function () {
      expect(mockMarko.compiler.taglibFinder.excludeDir).to.be.calledWith(mockExcludeDir);
    });

    it('should exclude packages with marko.json', function () {
      expect(mockMarko.compiler.taglibFinder.excludePackage).to.be.calledWith(mockExcludePackage);
    });

    it('should exclude attribute from being rendered', function () {
      expect(mockTestFixtures.excludeAttribute)
        .to.be.calledWith(mockExcludeAttribute.toLowerCase());
    });

    it('should attach user`s onInit handler', function () {
      expect(require('../configure').onInit).to.be.equal(mockConfig.onInit);
    });

    it('should attach user`s onDestroy handler', function () {
      expect(require('../configure').onDestroy).to.be.equal(mockConfig.onDestroy);
    });

    it('should initialize coverage reports', function () {
      expect(mockCoverage.initialize).to.be.calledWith();
    });
  });

  describe('Given user config is empty', function () {
    var mockConfig;

    beforeEach(function () {
      mockConfig = {};
      mockGetHelpers.withCoverage = false;

      require('../configure')(mockConfig);
    });

    afterEach(function () {
      delete require.cache[require.resolve('../configure')];
    });

    it('should merge user`s config with default', function () {
      expect(mockUtils.setHelpers).to.be.calledWith('config', mockConfig);
    });

    it('should not generate browser dependencies based on user`s config', function () {
      expect(mockUtils.generateBrowserDependencies).to.be.calledWith(undefined);
    });

    it('should not exclude directory with marko.json', function () {
      expect(mockMarko.compiler.taglibFinder.excludeDir).not.to.be.called;
    });

    it('should not exclude packages with marko.json', function () {
      expect(mockMarko.compiler.taglibFinder.excludePackage).not.to.be.called;
    });

    it('should not exclude attribute from being rendered', function () {
      expect(mockTestFixtures.excludeAttribute).not.to.be.called;
    });

    it('should not attach user`s onInit handler', function () {
      expect(require('../configure').onInit).to.be.equal(undefined);
    });

    it('should not attach user`s onDestroy handler', function () {
      expect(require('../configure').onDestroy).to.be.equal(undefined);
    });

    it('should not initialize coverage reports', function () {
      expect(mockCoverage.initialize).not.to.be.calledWith();
    });
  });
});
