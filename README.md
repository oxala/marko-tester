[![Build Status](https://travis-ci.org/oxala/marko-tester.svg?branch=master)](https://travis-ci.org/oxala/marko-tester) [![Test Coverage](https://api.codeclimate.com/v1/badges/46c76b421392b0cdc6e1/test_coverage)](https://codeclimate.com/github/oxala/marko-tester/test_coverage)
# marko-tester
A utility that helps you test marko components within `jest` framework.

## Requirements
Your project needs to have `jest@^23` and `marko@^4.13` (with `marko-widgets@^7`, if legacy components support is needed) installed.

Within your regular jest config, you need to specify a transform for `*.marko` files _(Note: if your NODE_ENV is set to `dev` or `development`, you need to run jest with `"cache": false` option)_:

```
...
"cache": false, // Only if your NODE_ENV is either `dev` or `development`.
"transform": {
  ...
  "\\.marko$": "<rootDir>/node_modules/marko-tester/preprocessor.js"
}
```

You can also test projects with `marko@^3.14` and `marko-widgets@^6.6`. In this scenario always disable jest's cache.

## Configuration
You can set up `tester` in the "global" section of jest's config:

```
"globals": {
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

- `withoutFixtures` _(default: false)_ - set this to true if you don't want automatic snapshot test execution. At this point `fixtures` will become executable and you will be able to run snapshot test using `fixtures()`. You can run specific snapshot by providing a fixture name `fixtures(FixtureFileName)`.

- `withAwait` _(default: false)_ - if your template has `<await/>` tag in it, you need to set this to true. At this point `render` will become an asynchronous function and you will need to treat it with await.

### Examples

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

#### Without fixtures:

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

#### Asynchronous:

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

#### If you just want to have snapshot test:

```
require('marko-tester')('../index.marko');
```

You can find more examples in the [tests folder](https://github.com/oxala/marko-tester/tree/master/tests).

## References
* [marko](http://markojs.com)
* [jest](https://jestjs.io)

## Thanks
* [Dylan Piercey](https://github.com/DylanPiercey)
* [Abiyasa Suhardi](https://github.com/abiyasa)

## Licence
MIT
