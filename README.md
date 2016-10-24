#marko-tester

===

Test library to assist with testing marko-widget UI components and more.

## Usage

### Start using marko-tester with:

```
npm install --save-dev marko-tester
```

### CLI

Once you've installed marko-tester, you can start using the `markotester` alias with the path to your source folder. There are 3 arguments you can pass if needed: `--no-coverage` if you don't want to generate coverage report; `--no-mocha` if you want to execute only eslint check; `--no-lint` if you don't want eslint checks.

```
markotester source --no-coverage
markotester source --no-coverage --no-lint
```

### File structure;

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
|           +- index.spec.js
|        |- browser.json
|        |- index.js
|        +- template.marko
+- .marko-tester.js
```

### Configuration file;

You can find an example configuration file in the root folder of `marko-tester`;

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
  }
};
```

* **components** - An array of patterns where to search for components that should be loaded into jsdom page.
* **taglibExcludeDirs** - An array of paths relative to the root of your project folders that contain `marko.json`. This is used to isolate your tests so the nested components won't be renderer.
* **taglibExcludePackages** - An array of module names. This is used to isolate your tests so the nested components won't be renderer.
* **excludedAttributes** - An array of HTML attributes that can be different every test execution (e.g `data-widget` which marko dynamically changes based on package version).
* **onInit** - A hook that will be executed before every `it` when the widget needs to be instantiated.
* **onDestroy** - A hook that will be executed after every `it` when the widget needs to be destroyed.
* **coverage.reporters** - An array of reporters for istanbul to use.
* **coverage.dest** - The target destination folder where reports will be written.
* **coverage.excludes** - An array of file patterns to exclude from istanbul reports.

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

## Code style (eslint)

Apart from testing, consistent styling is another important part of keeping high quality code. For that particular reason, `marko-tester` comes with an `eslint` check built-in. It will check the style of your code when you execute the `markotester` command.