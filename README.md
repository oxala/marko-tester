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
    "shallow": false
  }
}
```

- `shallow` _(default: true)_ - You can turn off shallow rendering by passing `false` here. That way marko won't isolate any component test.

## Usage
`marko-tester` returns a function for you to use. Pass a relative path to a marko component file and you will receive a `render` method and `fixtures` method/object. By default this will run JEST SnapShots test for the fixtures of the component.

- `render` - a method that renders a component with a given input and mounts it to `document.body`. The mounted component instance is returned.

- `fixtures` - an object that contains all fixtures that are found within the `__snapshots__` folder for the component. You can get content of a fixture by specifying a filename: `fixtures[FixtureFileName]`.

As a second argument you can pass options object:

- `withoutFixtures` _(default: false)_ - set this to true if you don't want automatic snapshot test execution. At this point `fixtures` will become executable and you will be able to run snapshot test using `fixtures()`.

- `withAwait` _(default: false)_ - if your template has `<await/>` tag in it, you need to set this to true. At this point `render` will become an asynchronous function and you will need to treat it with await.

### Examples
The boilerplate looks like this:

```
const { render, fixtures } = require('marko-tester')('../index.marko');

describe('When component is rendered without results', () => {
  let component;

  beforeEach(() => {
    component = render(fixtures['without-results']);
  });

  afterEach(() => {
    component.destroy();
  });

  ...your assertions...
});
```

Without fixtures:

```
const { render, fixtures } = require('marko-tester')('../index.marko', { withoutFixtures: true });

fixtures();

describe('When component is rendered with records', () => {
  let component;

  beforeEach(() => {
    component = render(fixtures.records);
  });

  afterEach(() => {
    component.destroy();
  });

  ...your assertions...
});
```

Asynchronous:

```
const { render, fixtures } = require('marko-tester')('../index.marko', { withAwait: true });

describe('When component is rendered without model', () => {
  let component;

  beforeEach(async () => {
    component = await render(fixtures.empty);
  });

  afterEach(() => {
    component.destroy();
  });

  ...your assertions...
});
```

You can find more examples in the `tests` folder.

## References
* [marko](http://markojs.com)
* [jest](https://jestjs.io)

## Thanks
* [Dylan Piercey](https://github.com/DylanPiercey)
* [Abiyasa Suhardi](https://github.com/abiyasa)

## Licence
MIT
