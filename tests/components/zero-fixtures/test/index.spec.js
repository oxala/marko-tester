const { resolve } = require('path');
const { getComponent } = require('../../../../src/index');

const { fixtures } = getComponent('../index.marko', { withoutFixtures: true });

it('should throw an error abount empty fixtures folder', () => {
  expect(() => fixtures()).toThrowError(`No fixtures where found for component in "${resolve(__dirname, '../index.marko')}".`);
});
