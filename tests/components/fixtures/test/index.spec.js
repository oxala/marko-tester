const { fixtures } = require('../../../../src/index')('../index.marko', { withoutFixtures: true });

it('should store all the fixtures with content', () => {
  Object.keys(fixtures).forEach((fixtureName) => {
    /* eslint-disable-next-line global-require, import/no-dynamic-require */
    expect(require(`./${global.tester.fixturesDir}/${fixtureName}`) || {}).toEqual(fixtures[fixtureName]);
  });
});
