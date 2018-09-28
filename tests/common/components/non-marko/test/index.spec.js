const mockService = { get: jest.fn() };

jest.mock('../service', () => mockService);

const { defer } = require('../../../../../src/index');
const util = require('..');

describe('When handled promise is being called', () => {
  let deferred;
  let result;

  beforeEach(() => {
    deferred = defer();

    mockService.get.mockReturnValue(deferred.promise);

    result = util.handledPromise();
  });

  describe('When call is successful', () => {
    let response;

    beforeEach(() => {
      response = { hello: 'world' };

      deferred.resolve(response);
    });

    it('should result with success', () => {
      expect(result).resolves.toEqual(Object.assign({ success: true }, response));
    });
  });

  describe('When call is failed', () => {
    let response;

    beforeEach(() => {
      response = { world: 'hello' };

      deferred.reject(response);
    });

    it('should result with success', () => {
      expect(result).resolves.toEqual(Object.assign({ fail: true }, response));
    });
  });
});

describe('When unhandled promise is being called', () => {
  let deferred;
  let result;

  beforeEach(() => {
    deferred = defer();

    mockService.get.mockReturnValue(deferred.promise);

    result = util.unhandledPromise();
  });

  describe('When call is successful', () => {
    let response;

    beforeEach(() => {
      response = { hello: 'world' };

      deferred.resolve(response);
    });

    it('should result with success', () => {
      expect(result).resolves.toEqual(response);
    });
  });

  describe('When call is failed', () => {
    let response;

    beforeEach(() => {
      response = { world: 'hello' };

      deferred.reject(response);
    });

    it('should result with success', () => {
      expect(result).rejects.toEqual(response);
    });
  });
});
