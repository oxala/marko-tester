[![Build Status](https://travis-ci.org/oxala/marko-tester.svg?branch=master)](https://travis-ci.org/oxala/marko-tester) [![Test Coverage](https://api.codeclimate.com/v1/badges/46c76b421392b0cdc6e1/test_coverage)](https://codeclimate.com/github/oxala/marko-tester/test_coverage)
# marko-tester
A utility that helps you test marko components within the JEST framework.

## Requirements
Your project needs to have `jest@^23` and `marko@^4.5` installed.
Within your regular JEST configuration, you need to specify a transform for `*.marko` files:

```
...
"transform": {
  ...
  "^.+\\.marko$": "<rootDir>/node_modules/marko-jest/preprocessor.js"
}
```

## Configuration
In the global JEST object, you can pass a `tester` configuration:

```
"global": {
  ...
  "tester": {
    "fixturesDir": "inputs",
    "shallow": false
  }
}
```

- fixturesDir - The folder name where you have fixtures to render the component with. _(Default: "fixtures")_

- shallow - You can turn off shallow rendering by passing `false` here. That way marko won't isolate any component test. _(Default: true)_

## Usage
`marko-tester` returns a function for you to use. Pass a relative path to a marko component file and you will receive a `render` method and `fixtures` method/object. By default this will run JEST SnapShots test for the fixtures of the component.

- `render` is a method that renders a component with a given input and mounts it to `document.body`. The mounted component instance is returned.

- `fixtures` is an object by default. It contains all the fixtures that are found within the fixture folder of this component. If a `withoutFixtures` option is passed, `fixtures` will be a function that will run JEST SnapShots test for your fixtures. You will still be able to get any fixture content by the filename: `fixtures[FixtureFileName]`.

### Example
You can find examples in the `tests` folder. The boilerplate looks like this:

```
const { render } = require('marko-tester')('../index.marko');

describe('When component is rendered', () => {
  let component;

  beforeEach(() => {
    component = render(fixtures.default);
  });

  afterEach(() => {
    component.destroy();
  });

  ...your assertions...
});
```

## References
* [Marko](http://markojs.com)
* [jest](https://jestjs.io)

## Thanks
* [Dylan Piercey](https://github.com/DylanPiercey)
* [Abiyasa Suhardi](https://github.com/abiyasa)

## Licence
MIT
