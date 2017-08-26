#marko-tester [![Build Status](https://travis-ci.org/oxala/marko-tester.svg?branch=master)](https://travis-ci.org/oxala/marko-tester)

Test library to assist with testing marko 4 UI components and more.

## Usage

### Start using marko-tester with:

```
yarn add marko-tester
```

### CLI

Once you've installed marko-tester, you can start using the `markotester` alias with the path to your source folder. There are few arguments you can pass if needed:

- `--no-coverage` if you don't want to generate coverage report
- `--no-mocha` if you want to execute only linting
- `--no-lint` if you don't want lint checks
- `--lint-es5` if you want to lint code with es5 rules by default
- `--fix-lint` if you want to automatically fix your linting issues
- `--fix-fixtures` if you want to automatically replace failing fixtures with actual render result

```
markotester source --no-coverage
markotester source --no-coverage --no-lint
markotester source --fix-lint
markotester source --fix-fixtures
```

### File structure

```
app
|- source
|  |- components
|  |  |- phone-frame
|  |  |  +- test
|  |  |     |- fixtures
|  |  |     |  |- default.json
|  |  |     |  |- default.html
|  |  |     |  |- empty.js
|  |  |     |  +- empty.html
|  |  |     +- index.spec.js
|  |  |- component.js
|  |  +- index.marko
|  +- pages
|     +- mobile-preview
|        |- test
|        |  +- index.spec.js
|        +- index.marko
+- .marko-tester.js
```

### Configuration file

You can find an example configuration file in the root folder of `marko-tester`:

```
'use strict';

module.exports = {
  taglibExcludeDirs: [
    'src'
  ],
  taglibExcludePackages: [
    'excluded-component'
  ],
  excludedAttributes: ['data-widget'],
  lassoPlugins: [],
  onInit: () => {},
  onDestroy: () => {},
  coverage: {
    reporters: [
      'text-summary',
      'html',
      'json-summary'
    ],
    dest: '.coverage',
    excludes: [
      '**/*.marko.js'
    ]
  }
};
```

* **components** - An array of patterns for files that should be loaded into jsdom page by lasso.
* **taglibExcludeDirs** - An array of paths relative to the root of your project folders that contain `marko.json`. This is used to isolate your tests so the nested components won't be renderer.
* **taglibExcludePackages** - An array of module names. This is used to isolate your tests so the nested components won't be renderer.
* **excludedAttributes** - An array of HTML attributes that can be different every test execution (e.g `data-widget` which marko dynamically changes based on package version). *(Default: `['data-widget']`)*
* **lassoPlugins** - An array of lasso plugins to require and attach to lasso configuration during client test execution.
* **onInit** - A hook that will be executed before every `it` when the widget needs to be instantiated.
* **onDestroy** - A hook that will be executed after every `it` when the widget needs to be destroyed.
* **coverage.reporters** - An array of reporters for istanbul to use. *(Default: `['text-summary', 'html', 'json-summary']`)*
* **coverage.dest** - The target destination folder where reports will be written. *(Default: `.coverage`)*
* **coverage.excludes** - An array of file patterns to exclude from istanbul reports. *(Default: `['**/*.marko.js']`)*

### Automatic component/fixtures search

Marko-tester will try to automatically find your component renderer and/or fixtures to test. For the renderer, marko-tester will go up one level from your spec file and search for `index.marko`.

Fixtures will be automatically found if they are inside the `fixtures` folder on the same level as your spec file.

### Render comparison based on specific input

The rendering test works by giving your template the input to use for rendering and then comparing output with the specified HTML.

The JSON file and HTML file comprising a test should follow the pattern below (check the `fixtures` folder in File Structure section):

```
{test-case}.json
{test-case}.html
{another-test-case}.js
{another-test-case}.html
```

Your test file will have to invoke the `testFixtures` function. Below you can find an example of how your spec might look:

```
'use strict';

global.tester('source/components/phone-frame', (testFixtures) => {
  testFixtures();
});
```

### Component client-side testing

The client test works by instantiating a marko-widget and testing the functionality against it. For that browser environment is needed, for those purposes marko-tester uses jsdom to render the lasso-generated page and expose window object.

During client testing, `marko-tester` gives you a few methods to utilize:

* **testPage** - Will create an empty page, giving you access to window and document objects. This method is available right after test case declaration.
* **testComponent** - Used to build the page with the component constructor in it. At this point, the `marko.component` attribute will be exposed to the mocha context giving you access to your widget's instance. This method is available right after test case declaration.

```
'use strict';

global.tester('source/components/phone-frame', (expect, sinon, testPage, testFixtures, testComponent, marko, fixtures) => {
  // list of the params you can ask for (order doesn't matter):
  //   expect - chai's expect;
  //   sinon - library to spy and stub;
  //   testFixtures - runs fixture test;
  //   testPage - create an empty page with lasso generated dependancies;
  //   testComponent - renders and instantiates marko component;
  //   marko - marko context and exposes 'component' and 'require';
  //   fixtures - will give you a list of attached test fixtures to current component;
  //   mockRequire - exposes 'mock-require' npm module;

  testComponent(() => {
    let mockHello;

    beforeEach(() => {
      mockHello = 'world';
      marko.component.hello = mockHello;
    });

    afterEach(() => {
      delete marko.component.hello;
    });

    it('should have hello attribute', () => {
      expect(marko.compomnent.hello).to.be.equal(mockHello);
    });
  });
});
```

By default, running `this.buildComponent` will build the component using the `default` fixture (if there is one). If you wish to build the component using a different fixture, you can pass an option to do that before the callback:

```
this.buildComponent({
  fixture: {}
  // It can be either a fixture object or a string with a relative path to the fixture.
  // Do not forget that you can also utilize the "this.fixtures" data.
}, function () {});
```

### Few additional features

1. `tester`, `testComponent` and `testPage` commands will create a mocha's `describe` function. That's why the `only` and `skip` operators can be used with these commands the same way as with `describe` (e.g `testComponent.only(...)`, `tester.skip(...)`).

2. If you want to mock require during client-side testing - you can do that using options for `testComponent` method. There as a key you can pass relative path to the necessary file that will be required. And the mock of that file as a value. Keep in mind that mocked require will only exist within this `buildComponent`.<br>
```
testComponent({
  mock: {
    require: {
      '../dep': { hello: 'world' }
    },
    component: {
      'nested-component': { world: 'hello' }
    }
  },
}, () => { ... });
```

3. You can also use a different file layout if necessary. When your template has a top-level element of `tbody`, `tr`, or something else that expects a `table` element as a parent, you can add the `layout` parameter and set it to `table`. This will ensure JSDOM renders your component correctly.
```
testComponent({
  fixture: fixtures.basic,
  layout: 'table'
}, () => { ... });
```

## Code style (linting)

Apart from testing, consistent styling is another important part of keeping high quality code. For that particular reason, `marko-tester` comes with an `eslint` and `stylelint` checks built-in. It will check the style of your code when you execute the `markotester` command.

It uses legacy (es5) **airbnb** configuration for ESLint and **standard** configuration for Stylelint (checkine both *less* and *css* files).

## References

* [Marko](http://markojs.com)
* [Mocha](https://mochajs.org)
* [Sinon](http://sinonjs.org/docs/)
* [Expect](http://chaijs.com/api/bdd/)
* [rewire](https://github.com/jhnns/rewire)
* [mock-require](https://github.com/boblauer/mock-require)
* [ESLint](http://eslint.org)
* [eslint-airbnb-config](https://github.com/airbnb/javascript/tree/es5-deprecated/es5)
* [eslint-config-ebay](https://github.com/darkwebdev/eslint-config-ebay)
* [Stylelint](https://github.com/stylelint/stylelint)
* [stylelint-config-standard](https://github.com/stylelint/stylelint-config-standard)
* [Istanbul](https://github.com/gotwarlost/istanbul)
