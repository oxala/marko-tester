const { resolve } = require('path');
const { fixtures } = require('../../../../..')('../index.marko', { withoutFixtures: true });

it('should throw an error about empty fixtures folder', () => {
  expect(() => fixtures()).toThrowError(`No fixtures where found for component in "${resolve(__dirname, '../index.marko')}".`);
});
