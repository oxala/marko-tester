#marko-tester [![Build Status](https://travis-ci.org/oxala/marko-tester.svg?branch=master)](https://travis-ci.org/oxala/marko-tester)

Test library to assist with testing marko-widget UI components and more.

## Usage

### Start using marko-tester with:

```
npm install --save-dev marko-tester
```

### CLI

Once you've installed marko-tester, you can start using the `markotester` alias with the path to your source folder. There are few arguments you can pass if needed: `--no-coverage` if you don't want to generate coverage report; `--no-mocha` if you want to execute only linting; `--no-lint` if you don't want lint checks. Also you can try out `--with-acceptance` for running acceptance tests (keep in mind, with this flag in place unit-tests won't be executed).

```
markotester source --no-coverage
markotester source --no-coverage --no-lint
markotester source --with-acceptance
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
|  |  |- browser.json
|  |  |- index.js
|  |  +- template.marko
|  +- pages
|     +- mobile-preview
|        |- test
|        |  |- acceptance.js
|        |  |- renderer.spec.js
|        |  +- widget.spec.js
|        |- browser.json
|        |- renderer.js
|        |- template.marko
|        +- widget.js
+- .marko-tester.js
```

### Configuration file

You can find an example configuration file in the root folder of `marko-tester`:

```
'use strict';

module.exports = {
  taglibExcludeDirs: [
    'test'
  ],
  taglibExcludePackages: [
    'excluded-component'
  ],
  excludedAttributes: ['data-widget'],
  lassoPlugins: [],
  onInit: function onInit() {},
  onDestroy: function onDestroy() {},
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
  },
  acceptance: {
    baseUrl: 'localhost:8080',
    startCommand: 'npm start',
    stopCommand: 'npm stop',
    startTimeout: 10000
  }
};
```

* **components** - An array of patterns where to search for components that should be loaded into jsdom page.
* **taglibExcludeDirs** - An array of paths relative to the root of your project folders that contain `marko.json`. This is used to isolate your tests so the nested components won't be renderer.
* **taglibExcludePackages** - An array of module names. This is used to isolate your tests so the nested components won't be renderer.
* **excludedAttributes** - An array of HTML attributes that can be different every test execution (e.g `data-widget` which marko dynamically changes based on package version). *(Default: `['data-widget']`)*
* **lassoPlugins** - An array of lasso plugins to require and attach to lasso configuration during client test execution.
* **onInit** - A hook that will be executed before every `it` when the widget needs to be instantiated.
* **onDestroy** - A hook that will be executed after every `it` when the widget needs to be destroyed.
* **coverage.reporters** - An array of reporters for istanbul to use. *(Default: `['text-summary', 'html', 'json-summary']`)*
* **coverage.dest** - The target destination folder where reports will be written. *(Default: `.coverage`)*
* **coverage.excludes** - An array of file patterns to exclude from istanbul reports. *(Default: `['**/*.marko.js']`)*
* **acceptance.baseUrl** - An URL to load when browser starts. *(Default: `localhost:8080`)*
* **acceptance.startCommand** - A command to execute before starting selenium server. *(Default: `npm start`)*
* **acceptance.stopCommand** - A command to execute after stopping selenium server. *(Default: `npm stop`)*
* **acceptance.startTimeout** - An amount of milliseconds to wait before starting selenium server. *(Default: `10000`)*

### Automatic component/fixtures search

Marko-tester will try to automatically find your component renderer and/or fixtures to test. For the renderer, marko-tester will go up one level from your spec file and search for either `index.js` or `renderer.js`.

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

var tester = require('marko-tester');

tester('source/components/phone-frame', function() {
  this.testFixtures();
});
```

### Component client-side testing

The client test works by instantiating a marko-widget and testing the functionality against it. For that browser environment is needed, for those purposes marko-tester uses jsdom to render the lasso-generated page and expose window object.

During client testing, `marko-tester` gives you a few methods to utilize:

* **buildPage** - Will create an empty page, giving you access to window and document objects. This method is available right after test case declaration.
* **buildComponent** - Used to build the page with the component constructor in it. At this point, the `Widget` attribute will be exposed to the mocha context giving you access to your Widget's prototype. This method is available right after test case declaration.
* **buildWidget** - Will instantiate the widget on the page and expose the `widget` attibute to the mocha context with the instance of your widget. This method is available within *buildComponent* context.

```
'use strict';

var tester = require('marko-tester');

tester('source/components/phone-frame', function(expect, sinon) { // you can request `sinon` or `expect` just by adding the respective param;

  // this.buildPage - is available here;
  // this.fixtures - will give you a list of attached test fixtures to this component;

  this.buildComponent(function() {
    var mockHello = 'world';

    beforeEach(function() {
      this.Widget.prototype.hello = mockHello;
    });

    afterEach(function() {
      delete this.Widget.prototype.hello;
    });

    this.buildWidget(function() {
      it('should have hello attribute', function() {
        expect(this.widget.hello).to.be.equal(mockHello);
      });
    });
  });
});
```

### Few additional features

1. `tester`, `buildComponent`, `buildPage` and `buildWidget` commands will create a mocha's `describe` function. That's why the `only` and `skip` operators can be used with these commands the same way as with `describe` (e.g `this.buildComponent.only(...)`, `tester.skip(...)`).

2. `tester` command on callback along with `sinon` and/or `expect` can expose `rewire` and `mockRequire` functions for you in order to rewire or mock necessary module you using in your implementation. Note: that only will work during server-side testing.

3. If you want to mock require during client-side testing - you can do that using options for `buildComponent` method. There as a key you can pass relative path to the necessary file that will be required. And the mock of that file as a value. Keep in mind that mocked require will only exist within this `buildComponent`.<br>
```
this.buildComponent({
  mockRequire: {
    '../dep': { hello: 'world'}
  },
}, function() { ... });
```

## Code style (linting)

Apart from testing, consistent styling is another important part of keeping high quality code. For that particular reason, `marko-tester` comes with an `eslint` and `stylelint` checks built-in. It will check the style of your code when you execute the `markotester` command.

It uses legacy (es5) **airbnb** configuration for ESLint and **standard** configuration for Stylelint (checkine both *less* and *css* files).


## Acceptance tests

Thanks to [webdriverio](http://webdriver.io) and [selenium-standalone](https://github.com/vvo/selenium-standalone), we have the ability to easily write acceptance tests in the same manner that we do our unit tests.

To do that, we have a small configuration within our `.marko-tester.json` file under the `acceptance` key. Configure it for your project, if needed. Create a file called `acceptance.js` with test cases in your test folder. The syntax remains the same as with unit-tests. The only difference is that you will have the `browser` argument available to you in the `tester` method callback. Tha argument will give you a configured webdriver, as soon as you execute it.

```
'use strict';

var tester = require('marko-tester');

tester('source/pages/index', function(expect, browser) {
  var page;

  before(function () {
    page = browser().url('/hello-world');
  });
  
  it('should have a title', function (done) {
    expect(page.getTitle()).to.eventually.be.equal('hello world').and.notify(done);
  });
});
```

## References

* [Mocha](https://mochajs.org/)
* [Sinon](http://sinonjs.org/docs/)
* [Expect](http://chaijs.com/api/bdd/)
* [rewire](https://github.com/jhnns/rewire)
* [mock-require](https://github.com/boblauer/mock-require)
* [ESLint](http://eslint.org/)
* [eslint-airbnb-config](https://github.com/airbnb/javascript/tree/es5-deprecated/es5)
* [stylelint-config-standard](https://github.com/stylelint/stylelint-config-standard)
* [Istanbul](https://github.com/gotwarlost/istanbul)
* [Webdriverio](http://webdriver.io)
* [Selenium-standalone](https://github.com/vvo/selenium-standalone)
