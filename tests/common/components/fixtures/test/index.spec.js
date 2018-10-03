const { fixtures } = require('marko-tester')('../index.marko', { withoutFixtures: true });

it('should store all the fixtures with content', () => {
  Object.keys(fixtures).forEach((fixtureName) => {
    /* eslint-disable-next-line global-require, import/no-dynamic-require */
    expect(require(`./__snapshots__/${fixtureName}`) || {}).toEqual(fixtures[fixtureName]);
  });
});
